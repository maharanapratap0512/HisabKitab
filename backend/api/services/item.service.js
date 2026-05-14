'use strict';
const BaseTable = require('../database/base.table');
const Fn = require('../database/functions');
const { sutramDB } = require('../database/db.model');

const item = new BaseTable('item');
const rel_item_cat = new BaseTable('rel_item_category');
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

        return item_id;
    } catch (err) {
        throw err;
    }
}

/**
 * Universal checker for a single name/alias against the entire database.
 */
function checkSingleNameConflict(name, currentId = null, typeLabel = 'name') {
    if (!name || !name.trim()) return;
    const sanitized = name.trim().replace(/'/g, "''");

    // 1. Check Primary Table (3 fields)
    const conflictName = item.getOne(
        `_id != ${currentId || 0} AND (item_hin = '${sanitized}' OR item_eng = '${sanitized}' OR item_roman = '${sanitized}')`,
        { full: false }
    );
    if (conflictName) {
        throw new Error(`Yeh ${typeLabel} '${name}' pehle se hi item '${conflictName.item_hin}' ka primary name hai.`);
    }

    // 2. Check Alias Table
    const conflictAlias = Fn.db.prepare(`
        SELECT item_id, item.item_hin FROM item_aliases 
        LEFT JOIN item ON item._id = item_aliases.item_id
        WHERE item_id != ? AND alias = ? LIMIT 1
    `).get(currentId || 0, name.trim());
    if (conflictAlias) {
        throw new Error(`Yeh ${typeLabel} '${name}' pehle se hi item '${conflictAlias.item_hin}' ke aliases mein exist karta hai.`);
    }
}

/**
 * Validates primary item names (hin, eng, roman) against database.
 */
function checkItemConflict(data, currentId = null) {
    const names = [data.item_hin, data.item_eng, data.item_roman];
    for (const name of names) {
        checkSingleNameConflict(name, currentId, 'name');
    }
}

/**
 * Validates an array of aliases against database.
 */
function checkAliasConflict(aliases, currentId = null) {
    let aliasList = [];
    if (Array.isArray(aliases)) aliasList = aliases;
    else if (typeof aliases === 'string') {
        try { aliasList = JSON.parse(aliases); } catch (e) { }
    }

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
async function transferItemReferences(from_id, to_id, dept_id) {
    try {
        await Fn.begin();

        // 1. AAWAK
        const aawaks = await Fn.getList('aawak', { conditionString: `aawak.item_id = ${from_id} AND aawak.dept_id = ${dept_id}`, limit: -1 });
        if (aawaks.data) {
            for (let awk of aawaks.data) {
                let awkNew = { ...awk, item_id: parseInt(to_id) };
                await Fn.updateAJ(awkNew, 'aawak', awk);
            }
        }

        // 2. JAWAK
        const jawaks = await Fn.getList('jawak', { conditionString: `jawak.item_id = ${from_id} AND jawak.dept_id = ${dept_id}`, limit: -1 });
        if (jawaks.data) {
            for (let jwk of jawaks.data) {
                let jwkNew = { ...jwk, item_id: parseInt(to_id) };
                await Fn.updateAJ(jwkNew, 'jawak', jwk);
            }
        }

        // 3. Prastav
        try { await PrastavService.transferReferences('item', from_id, to_id); } catch (e) { }

        // 4. HMP
        try { await HmpService.transferReferences('item', from_id, to_id, dept_id); } catch (e) { }

        // 5. Other tables
        const otherUpdates = [
            { table: 'product', cols: ['item_id'] },
            { table: 'subitem', cols: ['item_id'] },
            { table: 'hmp_batch', cols: ['item_id'] },
        ];

        for (let u of otherUpdates) {
            for (let col of u.cols) {
                try {
                    Fn.db.prepare(`UPDATE ${u.table} SET ${col} = ? WHERE ${col} = ? AND dept_id = ?`).run([parseInt(to_id), parseInt(from_id), parseInt(dept_id)]);
                } catch (e) { }
            }
        }

        // 6. Cleanup bachat
        try {
            Fn.db.prepare(`DELETE FROM bachat WHERE item_id = ? AND dept_id = ?`).run([parseInt(from_id), parseInt(dept_id)]);
            Fn.db.prepare(`DELETE FROM bachat_new WHERE item_id = ? AND dept_id = ?`).run([parseInt(from_id), parseInt(dept_id)]);
        } catch (e) { }

        await Fn.commit();
        return true;
    } catch (err) {
        await Fn.rollback();
        throw err;
    }
}

/**
 * Deletes an item.
 */
async function deleteItem(id, userData) {
    // Priority: userData (from auth/params) > data (if passed)
    const dept_id = (userData && userData.dept_id) ? userData.dept_id :
        (userData && userData.params && userData.params.dept_id) ? userData.params.dept_id : null;
    try {
        sutramDB.begin();
        const res = item.deleteById(id);
        rel_item_cat.delete({ item_id: id });
        if (dept_id) deptService.removeFromConfig(dept_id, 'item', id);
        sutramDB.commit();
        return res;
    } catch (err) {
        sutramDB.rollback();
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
    bulkCreateItems
};
