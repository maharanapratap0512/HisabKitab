'use strict';
const BaseTable = require('../database/base.table');
const { dbmodal } = require('../database/db.model');
const Category = new BaseTable('category');
const db = dbmodal.db;
const deptService = require('./department.service');

/**
 * Fetches all categories or filters by department config.
 */
async function getCategories(deptId = null) {
    let where = {};
    if (deptId && deptId !== '1' && deptId !== 1) {
        where = `category._id IN (SELECT json_each.value FROM department_config, json_each(config_value) WHERE dept_id = ${deptId} AND config_key='category')`;
    }
    return Category.getAll(where, { full: false, orderBy: 'category.sort_order ASC, category.category_hin ASC' });
}

/**
 * Validates category names and aliases to prevent conflicts.
 */
/**
 * Internal helper to find conflicts without throwing.
 * Returns { type, name, conflict } or null.
 */
function getCategoryConflict(data, currentId = null) {
    const names = [data.category_hin, data.category_eng, data.category_roman].filter(Boolean);
    if (names.length === 0) return null;

    for (const name of names) {
        const sanitized = name.replace(/'/g, "''");

        // 1. Check Primary Name Conflicts
        const conflictName = Category.getOne(
            `_id != ${currentId || 0} AND (category_hin = '${sanitized}' OR category_eng = '${sanitized}' OR category_roman = '${sanitized}')`,
            { full: false }
        );
        if (conflictName) return { type: 'primary', name, conflict: conflictName };

        // 2. Check Alias Conflicts
        const conflictAlias = db.prepare(`
            SELECT _id, category_hin FROM category, json_each(category.alias) 
            WHERE _id != ? AND json_each.value = ? LIMIT 1
        `).get(currentId || 0, name);
        if (conflictAlias) return { type: 'alias', name, conflict: conflictAlias };
    }
    return null;
}

/**
 * Validates category names and aliases to prevent conflicts. Throws if conflict found.
 */
function checkCategoryConflict(data, currentId = null) {
    const result = getCategoryConflict(data, currentId);
    if (result) {
        const typeLabel = result.type === 'primary' ? 'primary name' : 'aliases';
        throw new Error(`Yeh name '${result.name}' pehle se hi category '${result.conflict.category_hin}' ke ${typeLabel} mein exist karta hai.`);
    }
}

/**
 * Creates a new category. Transaction managed by caller.
 */
async function createCategory(data, deptId) {
    if (!data.category_hin) throw new Error('Please fill required fields.');

    checkCategoryConflict(data);

    const dataToInsert = { ...data };
    delete dataToInsert._id;

    let inserted = Category.insert(dataToInsert, false);
    const insertedId = (typeof inserted === 'object') ? inserted._id : inserted;

    if (deptId && deptId !== '1' && deptId !== 1) {
        await deptService.pushToConfig(deptId, 'category', insertedId);
    }

    return Category.getById(insertedId, { full: true });
}

/**
 * Updates category details. Transaction managed by caller.
 */
async function updateCategory(id, setData) {
    const dataToUpdate = { ...setData };
    delete dataToUpdate._id;

    checkCategoryConflict(dataToUpdate, id);

    Category.updateById(dataToUpdate, id, { full: false });
    return Category.getById(id, { full: false });
}

/**
 * Updates category aliases. Transaction managed by caller.
 */
async function updateAliases(id, aliases) {
    if (!Array.isArray(aliases)) throw new Error('Aliases must be an array of strings');

    for (const alias of aliases) {
        const trimmed = alias.trim();
        if (!trimmed) continue;
        checkCategoryConflict({ category_hin: trimmed }, id);
    }

    Category.updateById({ alias: aliases }, id);
    return aliases;
}

/**
 * Deletes a category. Transaction managed by caller.
 */
async function deleteCategory(id) {
    const changes = Category.deleteById(id);

    const configs = db.prepare(`SELECT dept_id FROM department_config WHERE config_key = 'category' AND config_value LIKE ?`).all(`%${id}%`);
    for (const config of configs) {
        await deptService.removeFromConfig(config.dept_id, 'category', id);
    }

    return { changes };
}

/**
 * Transfers all category references. Transaction managed by caller.
 */
async function transferCategory(from_id, to_id) {
    if (!from_id || !to_id) throw new Error('from_id and to_id are required');

    const tables = ['rel_item_category', 'rel_subitem_category', 'variant_category_map'];
    for (const table of tables) {
        db.prepare(`UPDATE OR IGNORE ${table} SET category_id = ? WHERE category_id = ?`).run(to_id, from_id);
        db.prepare(`DELETE FROM ${table} WHERE category_id = ?`).run(from_id);
    }
    return true;
}

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    updateAliases,
    deleteCategory,
    transferCategory,
    checkCategoryConflict,
    getCategoryConflict
};