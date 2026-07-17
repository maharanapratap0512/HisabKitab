'use strict';
const BaseTable = require('../database/base.table');
const Fn = require('../database/functions');
const { sutramDB } = require('../database/db.model');

const item = new BaseTable('item');
const subitem = new BaseTable('subitem');
const rel_item_cat = new BaseTable('rel_item_category');
const rel_subitem_cat = new BaseTable('rel_subitem_category');
const item_aliases = new BaseTable('item_aliases');
const deptService = require('./department.service');
const HmpService = require('./hmp.service');
const PrastavService = require('./prastav.service');

/**
 * Generates the next available _id for a table within a department's ID range.
 */
async function getNextId(tableName, deptId) {
    if (!deptId) return null;
    const startRange = Number(deptId) * 100000;
    const endRange = (Number(deptId) + 1) * 100000;
    const result = Fn.db.prepare(`SELECT MAX(_id) as max_id FROM ${tableName} WHERE _id > ? AND _id < ?`).get([startRange, endRange]);
    return result && result.max_id ? result.max_id + 1 : startRange + 1;
}

/**
 * Fetches items with their related subitems, categories, etc.
 */
async function getItems(deptId, options = {}) {
    const resolve = await Fn.getList('itemmix', { full: true, dept_id: deptId, ...options });
    let subitem_count = 0;
    for (let i = 0; i < resolve.data.length; i++) {
        const row = resolve.data[i];
        row.subitems = (row.subitems && row.subitems != "[null]" ? JSON.parse(row.subitems) : []);
        row.document = (row.document && row.document != "[null]" ? JSON.parse(row.document) : []);
        row.categories = (row.categories && row.categories != "[null]" ? JSON.parse(row.categories) : []);
        row.item_aliases = (row.item_aliases && row.item_aliases != "[null]" ? JSON.parse(row.item_aliases) : []);
        subitem_count += row.subitems.length;
    }
    return { data: resolve.data, total_count: resolve.total_count, subitem_count };
}

/**
 * Filters itemmix with specific conditions.
 */
async function filterItems(deptId, body) {
    let itemCondition = ``;
    let sitemCondition = ``;
    let orderBy = null, limit = null, offset = null;

    if (body._id) {
        itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` item._id = ${body._id}`;
    }
    if (body.active) {
        itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` item.active = ${body.active}`;
    }
    if (body.categories) {
        itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` (item._id IN (SELECT item_id FROM rel_item_category WHERE category_id = ${body.categories}) OR item._id IN (SELECT item_id FROM subitem WHERE _id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id = ${body.categories})))`;
        sitemCondition += (sitemCondition.trim() != `` ? ` AND` : ``) + ` subitem._id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id = ${body.categories})`;
    }
    if (body.subitem_list_id) {
        sitemCondition += (sitemCondition.trim() != `` ? ` AND` : ``) + ` subitem.subitem_list_id = ${body.subitem_list_id}`;
        itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` item._id IN (SELECT item_id FROM subitem WHERE subitem.subitem_list_id = ${body.subitem_list_id})`;
    }
    if (itemCondition.trim() == `` && sitemCondition.trim() == ``) {
        orderBy = "item._id";
    }
    if (body.pageNo && body.pageNo > 0) {
        offset = (body.pageNo - 1) * limit;
    }

    const resolve = await Fn.getList('itemmix', {
        full: true,
        dept_id: deptId,
        conditionString: itemCondition,
        sconditionString: sitemCondition,
        limit,
        offset,
        orderBy
    });

    let subitem_count = 0;
    for (let i = 0; i < resolve.data.length; i++) {
        const row = resolve.data[i];
        row.subitems = (row.subitems && row.subitems != "[null]" ? JSON.parse(row.subitems) : []);
        row.document = (row.document && row.document != "[null]" ? JSON.parse(row.document) : []);
        row.categories = (row.categories && row.categories != "[null]" ? JSON.parse(row.categories) : []);
        row.item_aliases = (row.item_aliases && row.item_aliases != "[null]" ? JSON.parse(row.item_aliases) : []);
        subitem_count += row.subitems.length;

        for (let j = 0; j < row.subitems.length; j++) {
            row.subitems[j].categories = (row.subitems[j].categories && row.subitems[j].categories != "[null]" ? JSON.parse(row.subitems[j].categories) : []);
        }
    }

    return { data: resolve.data, total_count: resolve.data.length, subitem_count };
}

/**
 * Inserts a new item along with its category mappings.
 */
async function createItem(data, dept_id = null) {
    try {
        checkItemConflict(data);
        if (data.aliases) checkAliasConflict(data.aliases);
        data.active = 1;
        data.created_at = new Date().toISOString();

        // Handle categories array separately for junction table
        let catIds = [];
        if (Array.isArray(data.categories)) {
            catIds = [...data.categories];
        } else if (typeof data.categories === 'string') {
            catIds = JSON.parse(data.categories);
        }

        let aliases = [];
        if (Array.isArray(data.aliases)) {
            aliases = [...data.aliases];
        } else if (typeof data.aliases === 'string') {
            aliases = JSON.parse(data.aliases);
        }

        // BaseTable handles JSON fields (document, categories) automatically for INSERT/UPDATE
        const item_id = item.insert(data, false);

        if (item_id) {
            for (const cat_id of catIds) {
                rel_item_cat.insert({ item_id, category_id: Number(cat_id) }, false);
            }

            for (const alias_str of aliases) {
                if (alias_str && typeof alias_str === 'string') {
                    Fn.db.prepare(`INSERT OR IGNORE INTO item_aliases (item_id, alias) VALUES (?, ?)`).run(item_id, alias_str.trim());
                }
            }

            if (dept_id) deptService.pushToConfig(dept_id, 'item', item_id);
        }

        return item.getById(item_id, { full: true });
    } catch (err) {
        throw err;
    }
}

/**
 * Checks if a subitem exists by subitem_hin under the same item_id.
 */
function getSubitemConflict(data, currentId = null) {
    if (!data.subitem_hin || !data.item_id) return null;
    const cid = currentId || -1;
    const conflict = Fn.db.prepare(`
        SELECT *
        FROM subitem
        WHERE item_id = ? AND subitem_hin = ? AND _id != ?
        LIMIT 1
    `).get(data.item_id, data.subitem_hin, cid);
    return conflict ? { type: 'primary', name: conflict.subitem_hin, conflict } : null;
}

function checkSubitemConflict(data, currentId = null) {
    const result = getSubitemConflict(data, currentId);
    if (result) {
        throw new Error(`Yeh subitem '${result.name}' pehle se hi exist karta hai.`);
    }
}

async function createSubitem(data, dept_id = null) {
    try {
        checkSubitemConflict(data);
        data.active = 1;
        data.created_at = new Date().toISOString();

        // Handle categories array separately for junction table
        let catIds = [];
        if (Array.isArray(data.categories)) {
            catIds = [...data.categories];
        } else if (typeof data.categories === 'string') {
            try {
                catIds = JSON.parse(data.categories);
            } catch (e) {
                catIds = [];
            }
        }

        const subitem_id = subitem.insert(data, false);

        if (subitem_id) {
            for (const cat_id of catIds) {
                rel_subitem_cat.insert({ subitem_id, category_id: Number(cat_id) }, false);
            }
            if (dept_id) deptService.pushToConfig(dept_id, 'subitem', subitem_id);
        }

        return subitem.getById(subitem_id, { full: true });
    } catch (err) {
        throw err;
    }
}

/**
 * Inserts a relation between an item and a category.
 */
async function createRelItemCategory(data) {
    try {
        rel_item_cat.insert(data, false);
        return { ...data };
    } catch (err) {
        throw err;
    }
}

/**
 * Inserts a relation between a subitem and a category.
 */
async function createRelSubitemCategory(data) {
    try {
        rel_subitem_cat.insert(data, false);
        return { ...data };
    } catch (err) {
        throw err;
    }
}

/**
 * Checks if a relation between a subitem and a category already exists.
 */
function getRelSubitemCategoryConflict(data) {
    const conflict = Fn.db.prepare(`SELECT * FROM rel_subitem_category WHERE subitem_id = ? AND category_id = ?`).get(data.subitem_id, data.category_id);
    return conflict ? { type: 'duplicate', name: 'Relation exists', conflict } : null;
}

/**
 * Checks if a relation between an item and a category already exists.
 */
function getRelItemCategoryConflict(data) {
    const conflict = Fn.db.prepare(`SELECT * FROM rel_item_category WHERE item_id = ? AND category_id = ?`).get(data.item_id, data.category_id);
    return conflict ? { type: 'duplicate', name: 'Relation exists', conflict } : null;
}

/**
 * Internal helper to find conflicts for a single name or an entire item object.
 * Highly optimized to check primary names and aliases in a single database roundtrip.
 */
function getItemConflict(data, currentId = null) {
    const names = [data.item_hin, data.item_eng, data.item_roman];
    let aliases = [];
    if (Array.isArray(data.aliases)) aliases = data.aliases;
    else if (typeof data.aliases === 'string') try { aliases = JSON.parse(data.aliases || '[]'); } catch (e) { }

    const allNames = [...new Set([...names, ...aliases])].filter(n => n && n.trim());
    if (allNames.length === 0) return null;

    const cid = currentId || 0;
    const namesJson = JSON.stringify(allNames);

    // Using CTE and json_each for the cleanest and most efficient multi-name check
    const sql = `
        WITH input_names(name) AS (
            SELECT value FROM json_each(?)
        )
        SELECT _id, item_hin, 'primary' as source, n.name as matched_name
        FROM item
        JOIN input_names n ON (item_hin = n.name OR item_eng = n.name OR item_roman = n.name)
        WHERE _id != ?
        UNION ALL
        SELECT item_id as _id, item.item_hin, 'alias' as source, n.name as matched_name
        FROM item_aliases
        JOIN item ON item._id = item_aliases.item_id
        JOIN input_names n ON item_aliases.alias = n.name
        WHERE item_id != ?
        LIMIT 1
    `;

    const conflict = Fn.db.prepare(sql).get(namesJson, cid, cid);
    return conflict ? { type: conflict.source, name: conflict.matched_name, conflict } : null;
}

/**
 * Optimized single name conflict checker.
 */
function getSingleNameConflict(name, currentId = null, typeLabel = 'name') {
    const result = getItemConflict({ item_hin: name }, currentId);
    if (result) result.typeLabel = typeLabel;
    return result;
}

/**
 * Universal checker for a single name/alias against the entire database. Throws error.
 */
function checkSingleNameConflict(name, currentId = null, typeLabel = 'name') {
    const result = getSingleNameConflict(name, currentId, typeLabel);
    if (result) {
        const typeMsg = result.type === 'primary' ? 'primary name' : 'aliases';
        throw new Error(`Yeh ${typeLabel} '${result.name}' pehle se hi item '${result.conflict.item_hin}' ke ${typeMsg} mein exist karta hai.`);
    }
}

/**
 * Validates primary item names (hin, eng, roman) against database. Throws error.
 */
function checkItemConflict(data, currentId = null) {
    const result = getItemConflict(data, currentId);
    if (result) {
        const typeLabel = result.type === 'primary' ? 'primary name' : 'aliases';
        throw new Error(`Yeh name '${result.name}' pehle se hi item '${result.conflict.item_hin}' ke ${typeLabel} mein exist karta hai.`);
    }
}

/**
 * Validates an array of aliases against database.
 */
function checkAliasConflict(aliases, currentId = null) {
    const aliasList = Array.isArray(aliases) ? aliases : (typeof aliases === 'string' ? JSON.parse(aliases || '[]') : []);
    for (const alias of aliasList) {
        checkSingleNameConflict(alias, currentId, 'alias');
    }
}

/**
 * Updates an item.
 */
async function updateItem(id, setData) {
    checkItemConflict(setData, id);
    if (setData.aliases) checkAliasConflict(setData.aliases, id);
    let catIds = null;
    if (setData.categories) {
        if (Array.isArray(setData.categories)) catIds = setData.categories;
        else if (typeof setData.categories === 'string') {
            try { catIds = JSON.parse(setData.categories); } catch (e) { }
        }
    }

    if (catIds && Array.isArray(catIds)) {
        // Sync junction table
        Fn.db.prepare(`DELETE FROM rel_item_category WHERE item_id = ?`).run([id]);
        for (const cat_id of catIds) {
            try { rel_item_cat.insert({ item_id: id, category_id: Number(cat_id) }, false); } catch (e) { }
        }
    }

    let aliases = null;
    if (setData.aliases) {
        if (Array.isArray(setData.aliases)) aliases = setData.aliases;
        else if (typeof setData.aliases === 'string') {
            try { aliases = JSON.parse(setData.aliases); } catch (e) { }
        }
    }

    if (aliases && Array.isArray(aliases)) {
        Fn.db.prepare(`DELETE FROM item_aliases WHERE item_id = ?`).run([id]);
        for (const alias_str of aliases) {
            if (alias_str && typeof alias_str === 'string') {
                try { Fn.db.prepare(`INSERT OR IGNORE INTO item_aliases (item_id, alias) VALUES (?, ?)`).run(id, alias_str.trim()); } catch (e) { }
            }
        }
    }

    // BaseTable magic handles JSON serialization
    item.updateById(setData, id);
    const result = await item.getById(id, { full: true });
    if (result) {
        result.document = (result.document && result.document != "[null]" ? (typeof result.document === 'string' ? JSON.parse(result.document) : result.document) : []);
        result.categories = (result.categories && result.categories != "[null]" ? (typeof result.categories === 'string' ? JSON.parse(result.categories) : result.categories) : []);
        result.categories_hin = (result.categories_hin && result.categories_hin != "[null]" ? (typeof result.categories_hin === 'string' ? JSON.parse(result.categories_hin) : result.categories_hin) : []);
        result.subitems = (result.subitems && result.subitems != "[null]" ? (typeof result.subitems === 'string' ? JSON.parse(result.subitems) : result.subitems) : []);
    }
    return result;
}

/**
 * Toggles lock on an item.
 * Deep Lock: restrict_month and restrict_year.
 */
async function toggleLock(id, body) {
    const lockData = {
        restrict_month: body.restrict_month !== undefined ? body.restrict_month : null,
        restrict_year: body.restrict_year !== undefined ? body.restrict_year : null,
        updated_at: new Date().toISOString()
    };
    item.updateById(lockData, id);
    return await item.getById(id, { full: true });
}

/**
 * Transfers all item references from one item to another.
 */
async function transferItemReferences(from_id, to_id_raw, dept_id) {
    try {
        let to_item_id = null;
        let to_subitem_id = null;

        if (typeof to_id_raw === 'string' && to_id_raw.includes(':')) {
            const parts = to_id_raw.split(':');
            to_item_id = parseInt(parts[0]) || null;
            to_subitem_id = parts[1] !== 'null' ? parseInt(parts[1]) : null;
        } else {
            to_item_id = parseInt(to_id_raw) || null;
        }

        if (!to_item_id) throw new Error("Invalid target item");



        // 1. AAWAK
        const aawaks = await Fn.getList('aawak', { conditionString: `aawak.item_id = ${from_id} AND aawak.subitem_id IS NULL AND aawak.dept_id = ${dept_id}`, limit: -1 });
        if (aawaks.data) {
            console.log("aawak", aawaks.data.length);
            for (let awk of aawaks.data) {
                let awkNew = { ...awk, item_id: to_item_id, subitem_id: to_subitem_id };
                await Fn.updateAJ(awkNew, 'aawak', awk);
            }
        }


        // 2. JAWAK
        const jawaks = await Fn.getList('jawak', { conditionString: `jawak.item_id = ${from_id} AND jawak.subitem_id IS NULL AND jawak.dept_id = ${dept_id}`, limit: -1 });
        if (jawaks.data) {
            for (let jwk of jawaks.data) {
                let jwkNew = { ...jwk, item_id: to_item_id, subitem_id: to_subitem_id };
                await Fn.updateAJ(jwkNew, 'jawak', jwk);
            }
        }
        console.log("jawak", jawaks.data.length);

        // 3. Prastav
        try { await PrastavService.transferReferences('item', from_id, to_id_raw); } catch (e) { }

        // 4. HMP
        try { await HmpService.transferReferences('item', from_id, to_id_raw, dept_id); } catch (e) { }

        // 5. Other tables
        const otherUpdates = [
            { table: 'product', hasSubitem: true }
        ];

        for (let u of otherUpdates) {
            try {
                if (u.hasSubitem) {
                    Fn.db.prepare(`UPDATE ${u.table} SET item_id = ?, subitem_id = ? WHERE item_id = ? AND subitem_id IS NULL AND dept_id = ?`).run([to_item_id, to_subitem_id, parseInt(from_id), parseInt(dept_id)]);
                } else {
                    Fn.db.prepare(`UPDATE ${u.table} SET item_id = ? WHERE item_id = ? AND dept_id = ?`).run([to_item_id, parseInt(from_id), parseInt(dept_id)]);
                }
            } catch (e) { console.error(e); }
        }

        // 6. Cleanup bachat
        try {
            Fn.db.prepare(`DELETE FROM bachat WHERE item_id = ? AND subitem_id IS NULL AND dept_id = ?`).run([parseInt(from_id), parseInt(dept_id)]);
            Fn.db.prepare(`DELETE FROM bachat_new WHERE item_id = ? AND subitem_id IS NULL AND dept_id = ?`).run([parseInt(from_id), parseInt(dept_id)]);
        } catch (e) { }

        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * Deletes an item.
 */
async function deleteItem(idOrIds, userData) {
    // Priority: userData (from auth/params) > data (if passed)
    const dept_id = (userData && userData.dept_id) ? userData.dept_id :
        (userData && userData.params && userData.params.dept_id) ? userData.params.dept_id : null;
    try {
        const ids = typeof idOrIds === 'string' && idOrIds.includes(',') ? idOrIds.split(',').map(Number) : (Array.isArray(idOrIds) ? idOrIds : [Number(idOrIds)]);

        // Check for existing subitems
        if (ids.length > 0) {
            const idPlaceholders = ids.map(() => '?').join(',');
            const existingSubitems = Fn.db.prepare(`SELECT _id FROM subitem WHERE item_id IN (${idPlaceholders}) LIMIT 1`).get(...ids);
            if (existingSubitems) {
                throw new Error("Cannot delete item. Please clear/delete all associated subitems first.");
            }
        }

        rel_item_cat.delete({ item_id: ids });
        item_aliases.delete({ item_id: ids });
        const res = item.delete({ _id: ids });

        if (dept_id) {
            for (const id of ids) {
                deptService.removeFromConfig(dept_id, 'item', id);
            }
        }
        return res;
    } catch (err) {
        throw err;
    }
}

/**
 * Bulk create items (useful for Excel import)
 */
async function bulkCreateItems(items_data, userData) {
    const created = [];
    const skipped = [];
    for (const iData of items_data) {
        try {
            const result = await createItem(iData, userData);
            created.push(result);
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.toLowerCase().includes('unique'))) {
                skipped.push({ name: iData.item_hin, reason: 'Duplicate' });
            } else { throw err; }
        }
    }
    return { created, skipped, createdCount: created.length, skippedCount: skipped.length };
}

module.exports = {
    getNextId,
    getItems,
    filterItems,
    createItem,
    updateItem,
    toggleLock,
    transferItemReferences,
    deleteItem,
    bulkCreateItems,
    getItemConflict,
    checkItemConflict,
    createRelItemCategory,
    createRelSubitemCategory,
    getRelItemCategoryConflict,
    getRelSubitemCategoryConflict,
    getSubitemConflict,
    checkSubitemConflict,
    createSubitem
};
