'use strict';
const BaseTable = require('../database/base.table');
const Fn = require('../database/functions');
const { sutramDB } = require('../database/db.model');

const item = sutramDB.table('item');
const subitem = sutramDB.table('subitem');
const rel_item_cat = sutramDB.table('rel_item_category');
const rel_subitem_cat = sutramDB.table('rel_subitem_category');
const item_aliases = sutramDB.table('item_aliases');
const subitem_aliases = sutramDB.table('subitem_aliases');
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

function parseSubitemCategories(subitem) {
    if (!subitem) return [];
    let cats = subitem.categories;
    if (typeof cats === 'string') {
        try {
            cats = (cats && cats !== "[null]" && cats !== "null") ? JSON.parse(cats) : [];
        } catch (e) {
            cats = [];
        }
    }
    if (Array.isArray(cats)) {
        return cats.filter(c => c && c._id != null);
    }
    return [];
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
        if (Array.isArray(row.item_aliases)) {
            row.item_aliases = row.item_aliases.filter(a => a && a._id);
        }
        subitem_count += row.subitems.length;
        cleanSubitems(row.subitems);
    }
    return { data: resolve.data, total_count: resolve.total_count, subitem_count };
}

function cleanSubitems(subitems) {
    if (!Array.isArray(subitems)) return [];
    for (let j = 0; j < subitems.length; j++) {
        subitems[j].categories = parseSubitemCategories(subitems[j]);
        if (typeof subitems[j].aliases === 'string') {
            try {
                subitems[j].aliases = JSON.parse(subitems[j].aliases);
            } catch (e) {
                subitems[j].aliases = [];
            }
        }
        if (!Array.isArray(subitems[j].aliases)) {
            subitems[j].aliases = [];
        } else {
            subitems[j].aliases = subitems[j].aliases.filter(a => a && a._id);
        }
    }
    return subitems;
}

/**
 * Filters itemmix with specific conditions.
 */
async function filterItems(deptId, body) {
    const itemConditions = [];
    const sitemConditions = [];
    let orderBy = null, limit = null, offset = null;

    if (body._id) {
        itemConditions.push(`item._id = ${body._id}`);
    }
    if (body.active) {
        itemConditions.push(`item.active = ${body.active}`);
    }
    if (body.categories) {
        itemConditions.push(`(item._id IN (SELECT item_id FROM rel_item_category WHERE category_id = ${body.categories}) OR item._id IN (SELECT item_id FROM subitem WHERE _id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id = ${body.categories})))`);
        sitemConditions.push(`subitem._id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id = ${body.categories})`);
    }
    if (body.subitem_list_id) {
        sitemConditions.push(`subitem.subitem_list_id = ${body.subitem_list_id}`);
        itemConditions.push(`item._id IN (SELECT item_id FROM subitem WHERE subitem.subitem_list_id = ${body.subitem_list_id})`);
    }
    if (body.aliasSearch && typeof body.aliasSearch === 'string' && body.aliasSearch.trim()) {
        const cleanAlias = body.aliasSearch.trim().replace(/'/g, "''");
        itemConditions.push(`(item._id IN (SELECT item_id FROM item_aliases WHERE alias LIKE '%${cleanAlias}%') OR item._id IN (SELECT item_id FROM subitem WHERE _id IN (SELECT subitem_id FROM subitem_aliases WHERE alias LIKE '%${cleanAlias}%')))`);
    }
    if (body.search && typeof body.search === 'string' && body.search.trim()) {
        const cleanTerm = body.search.trim().replace(/'/g, "''");
        itemConditions.push(`(item.item_hin LIKE '%${cleanTerm}%' OR item.item_eng LIKE '%${cleanTerm}%' OR item.item_roman LIKE '%${cleanTerm}%' OR item.item_code LIKE '%${cleanTerm}%' OR item._id IN (SELECT item_id FROM item_aliases WHERE alias LIKE '%${cleanTerm}%') OR item._id IN (SELECT item_id FROM subitem WHERE _id IN (SELECT subitem_id FROM subitem_aliases WHERE alias LIKE '%${cleanTerm}%')))`);
    }
    if (itemConditions.length === 0 && sitemConditions.length === 0) {
        orderBy = "item._id";
    }
    if (body.pageNo && body.pageNo > 0) {
        offset = (body.pageNo - 1) * limit;
    }

    const itemCondition = itemConditions.length > 0 ? itemConditions.join(' AND ') : null;
    const sitemCondition = sitemConditions.length > 0 ? sitemConditions.join(' AND ') : null;

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
        if (Array.isArray(row.item_aliases)) {
            row.item_aliases = row.item_aliases.filter(a => a && a._id);
        }
        subitem_count += row.subitems.length;
        cleanSubitems(row.subitems);
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
            try {
                aliases = JSON.parse(data.aliases);
            } catch (e) {
                aliases = data.aliases.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        // BaseTable handles JSON fields (document, categories) automatically for INSERT/UPDATE
        const item_id = item.insert(data, false);

        if (item_id) {
            for (const cat_id of catIds) {
                rel_item_cat.insert({ item_id, category_id: Number(cat_id) }, false);
            }

            for (const alias_str of aliases) {
                const trimmed = typeof alias_str === 'object' && alias_str !== null ? alias_str.alias : alias_str;
                if (trimmed && typeof trimmed === 'string' && trimmed.trim()) {
                    Fn.db.prepare(`INSERT OR IGNORE INTO item_aliases (item_id, alias) VALUES (?, ?)`).run(item_id, trimmed.trim());
                }
            }

            if (dept_id) deptService.pushToConfig(dept_id, 'item', item_id);
        }

        const created = await item.getById(item_id, { full: true });
        if (created) {
            created.item_aliases = (created.item_aliases && created.item_aliases != "[null]" ? (typeof created.item_aliases === 'string' ? JSON.parse(created.item_aliases) : created.item_aliases) : []);
            if (Array.isArray(created.item_aliases)) {
                created.item_aliases = created.item_aliases.filter(a => a && a._id);
            }
        }
        return created;
    } catch (err) {
        throw err;
    }
}

/**
 * Checks if a subitem exists by primary names or aliases under the same item_id.
 */
function getSubitemConflict(data, currentId = null) {
    let itemId = data.item_id;
    const cid = currentId || -1;
    if (!itemId && currentId) {
        const existing = subitem.getById(currentId, { full: false });
        if (existing && existing.item_id) itemId = existing.item_id;
    }
    if (!itemId) return null;
    const names = [data.subitem_hin, data.subitem_eng, data.subitem_roman];
    let aliases = [];
    if (Array.isArray(data.aliases)) aliases = data.aliases;
    else if (typeof data.aliases === 'string') {
        try {
            aliases = JSON.parse(data.aliases || '[]');
        } catch (e) {
            aliases = data.aliases.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    const aliasStrings = aliases.map(a => typeof a === 'object' && a !== null ? a.alias : a).filter(a => typeof a === 'string' && a.trim());
    const allNames = [...new Set([...names.filter(n => typeof n === 'string' && n.trim()), ...aliasStrings])];
    if (allNames.length === 0) return null;

    const namesJson = JSON.stringify(allNames);
    const sql = `
        WITH input_names(name) AS (
            SELECT value FROM json_each(?)
        )
        SELECT _id, subitem_hin, 'primary' as source, n.name as matched_name
        FROM subitem
        JOIN input_names n ON (subitem_hin = n.name OR subitem_eng = n.name OR subitem_roman = n.name)
        WHERE item_id = ? AND _id != ?
        UNION ALL
        SELECT s._id, s.subitem_hin, 'alias' as source, n.name as matched_name
        FROM subitem_aliases sa
        JOIN subitem s ON s._id = sa.subitem_id
        JOIN input_names n ON sa.alias = n.name
        WHERE s.item_id = ? AND s._id != ?
        LIMIT 1
    `;
    const conflict = Fn.db.prepare(sql).get(namesJson, itemId, cid, itemId, cid);
    return conflict ? { type: conflict.source, name: conflict.matched_name, conflict } : null;
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

        let aliases = [];
        if (Array.isArray(data.aliases)) {
            aliases = [...data.aliases];
        } else if (typeof data.aliases === 'string') {
            try {
                aliases = JSON.parse(data.aliases);
            } catch (e) {
                aliases = data.aliases.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        const subitem_id = subitem.insert(data, false);

        if (subitem_id) {
            for (const cat_id of catIds) {
                rel_subitem_cat.insert({ subitem_id, category_id: Number(cat_id) }, false);
            }
            for (const alias_str of aliases) {
                const trimmed = typeof alias_str === 'object' && alias_str !== null ? alias_str.alias : alias_str;
                if (trimmed && typeof trimmed === 'string' && trimmed.trim()) {
                    Fn.db.prepare(`INSERT OR IGNORE INTO subitem_aliases (subitem_id, alias) VALUES (?, ?)`).run(subitem_id, trimmed.trim());
                }
            }
            if (dept_id) deptService.pushToConfig(dept_id, 'subitem', subitem_id);
        }

        const res = subitem.getById(subitem_id, { full: true });
        if (res) {
            res.document = (res.document && res.document != "[null]" ? (typeof res.document === 'string' ? JSON.parse(res.document) : res.document) : []);
            res.categories = (res.categories && res.categories != "[null]" ? (typeof res.categories === 'string' ? JSON.parse(res.categories) : res.categories) : []);
            res.aliases = (res.aliases && res.aliases != "[null]" ? (typeof res.aliases === 'string' ? JSON.parse(res.aliases) : res.aliases) : []);
            if (Array.isArray(res.aliases)) {
                res.aliases = res.aliases.filter(a => a && a._id);
            }
        }
        return res;
    } catch (err) {
        throw err;
    }
}

/**
 * Updates a subitem and syncs its category mappings in rel_subitem_category and subitem_aliases.
 */
async function updateSubitem(id, setData) {
    try {
        checkSubitemConflict(setData, id);
        let catIds = null;
        if (setData.categories) {
            if (Array.isArray(setData.categories)) catIds = setData.categories;
            else if (typeof setData.categories === 'string') {
                try { catIds = JSON.parse(setData.categories); } catch (e) { }
            }
        }

        if (catIds && Array.isArray(catIds)) {
            // Sync junction table rel_subitem_category via Sutram BaseTable
            rel_subitem_cat.delete({ subitem_id: id });
            for (const cat_id of catIds) {
                try { rel_subitem_cat.insert({ subitem_id: id, category_id: Number(cat_id) }, false); } catch (e) { }
            }
        }

        let aliases = null;
        if (setData.aliases !== undefined) {
            if (Array.isArray(setData.aliases)) aliases = setData.aliases;
            else if (typeof setData.aliases === 'string') {
                try {
                    aliases = JSON.parse(setData.aliases);
                } catch (e) {
                    aliases = setData.aliases.split(',').map(s => s.trim()).filter(Boolean);
                }
            }
        }

        if (aliases && Array.isArray(aliases)) {
            Fn.db.prepare(`DELETE FROM subitem_aliases WHERE subitem_id = ?`).run([id]);
            for (const alias_str of aliases) {
                const trimmed = typeof alias_str === 'object' && alias_str !== null ? alias_str.alias : alias_str;
                if (trimmed && typeof trimmed === 'string' && trimmed.trim()) {
                    try { Fn.db.prepare(`INSERT OR IGNORE INTO subitem_aliases (subitem_id, alias) VALUES (?, ?)`).run(id, trimmed.trim()); } catch (e) { }
                }
            }
        }

        subitem.updateById(setData, id);
        const res = subitem.getById(id, { full: true });
        if (res) {
            res.document = (res.document && res.document != "[null]" ? (typeof res.document === 'string' ? JSON.parse(res.document) : res.document) : []);
            res.categories = (res.categories && res.categories != "[null]" ? (typeof res.categories === 'string' ? JSON.parse(res.categories) : res.categories) : []);
            res.aliases = (res.aliases && res.aliases != "[null]" ? (typeof res.aliases === 'string' ? JSON.parse(res.aliases) : res.aliases) : []);
            if (Array.isArray(res.aliases)) {
                res.aliases = res.aliases.filter(a => a && a._id);
            }
        }
        return res;
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
    else if (typeof data.aliases === 'string') {
        try {
            aliases = JSON.parse(data.aliases || '[]');
        } catch (e) {
            aliases = data.aliases.split(',').map(s => s.trim()).filter(Boolean);
        }
    }

    const aliasStrings = aliases.map(a => typeof a === 'object' && a !== null ? a.alias : a).filter(a => typeof a === 'string' && a.trim());
    const allNames = [...new Set([...names.filter(n => typeof n === 'string' && n.trim()), ...aliasStrings])];
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
    let aliasList = [];
    if (Array.isArray(aliases)) aliasList = aliases;
    else if (typeof aliases === 'string') {
        try {
            aliasList = JSON.parse(aliases || '[]');
        } catch (e) {
            aliasList = aliases.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    for (const aliasItem of aliasList) {
        const aliasStr = typeof aliasItem === 'object' && aliasItem !== null ? aliasItem.alias : aliasItem;
        if (aliasStr && typeof aliasStr === 'string' && aliasStr.trim()) {
            checkSingleNameConflict(aliasStr.trim(), currentId, 'alias');
        }
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
    if (setData.aliases !== undefined) {
        if (Array.isArray(setData.aliases)) aliases = setData.aliases;
        else if (typeof setData.aliases === 'string') {
            try {
                aliases = JSON.parse(setData.aliases);
            } catch (e) {
                aliases = setData.aliases.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
    }

    if (aliases && Array.isArray(aliases)) {
        Fn.db.prepare(`DELETE FROM item_aliases WHERE item_id = ?`).run([id]);
        for (const alias_str of aliases) {
            const trimmed = typeof alias_str === 'object' && alias_str !== null ? alias_str.alias : alias_str;
            if (trimmed && typeof trimmed === 'string' && trimmed.trim()) {
                try { Fn.db.prepare(`INSERT OR IGNORE INTO item_aliases (item_id, alias) VALUES (?, ?)`).run(id, trimmed.trim()); } catch (e) { }
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
        result.item_aliases = (result.item_aliases && result.item_aliases != "[null]" ? (typeof result.item_aliases === 'string' ? JSON.parse(result.item_aliases) : result.item_aliases) : []);
        if (Array.isArray(result.item_aliases)) {
            result.item_aliases = result.item_aliases.filter(a => a && a._id);
        }
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
    createSubitem,
    updateSubitem
};
