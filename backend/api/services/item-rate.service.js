'use strict';
const BaseTable = require('../database/base.table');
const { dbmodal } = require('../database/db.model');

const itemRateTable = new BaseTable('item_rate');
const db = dbmodal.db;

/**
 * Fetches all yearly rates for a department with full joins (Item & Subitem names).
 */
async function getItemRates(deptId) {
    return db.prepare(`
        SELECT 
            item_rate.*,
            item.item_hin,
            item.item_eng,
            si.subitem_hin,
            si.subitem_eng
        FROM item_rate
        LEFT JOIN item ON item._id = item_rate.item_id
        LEFT JOIN subitem si ON si._id = item_rate.subitem_id
        WHERE item_rate.dept_id = ?
        ORDER BY item_rate.year DESC, item_rate.created_at DESC
    `).all(Number(deptId));
}

/**
 * Saves or updates a yearly rate record using BaseTable.
 */
async function saveItemRate(deptId, data) {
    const dId = Number(deptId);
    const item_id = Number(data.item_id);
    const subitem_id = data.subitem_id ? Number(data.subitem_id) : null;
    const year = Number(data.year);
    const rate = Number(data.rate);

    if (!item_id || !year || rate === undefined || rate === null) {
        throw new Error('Item, Year, and Rate are required.');
    }

    const conditions = [
        `dept_id = ${dId}`,
        `item_id = ${item_id}`,
        `year = ${year}`
    ];
    if (subitem_id) {
        conditions.push(`subitem_id = ${subitem_id}`);
    } else {
        conditions.push(`(subitem_id IS NULL OR subitem_id = 0)`);
    }

    const whereCondition = conditions.join(' AND ');
    const existing = itemRateTable.getOne(whereCondition, { full: false });

    if (existing) {
        return itemRateTable.updateById({
            rate: rate,
            updated_at: new Date().toISOString()
        }, existing._id);
    } else {
        return itemRateTable.insert({
            dept_id: dId,
            item_id: item_id,
            subitem_id: subitem_id,
            year: year,
            rate: rate,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
}

/**
 * Deletes an item rate record by ID.
 */
async function deleteItemRate(id) {
    return itemRateTable.deleteById(id);
}

/**
 * Bulk applies rate to matching Aawak & Jawak entries of a department for that item, subitem, and year.
 * Only applies rate and recalculates amount where rate is null, 0, or not mentioned (unless overwrite is true).
 */
async function applyItemRate(data) {
    const { dept_id, item_id, subitem_id, year, rate, overwrite = false } = data;

    if (!dept_id || !item_id || !year || rate === undefined || rate === null) {
        throw new Error('Missing required parameters for applying rate.');
    }

    const dId = Number(dept_id);
    const iId = Number(item_id);
    const sId = subitem_id ? Number(subitem_id) : null;
    const yStr = String(year);
    const rVal = Number(rate);

    const conditions = [
        'dept_id = ?',
        'item_id = ?',
        "strftime('%Y', date) = ?"
    ];
    const params = [dId, iId, yStr];

    if (sId) {
        conditions.push('subitem_id = ?');
        params.push(sId);
    } else {
        conditions.push('(subitem_id IS NULL OR subitem_id = 0)');
    }

    if (!overwrite) {
        // Only update entries where rate is null, 0, or empty string
        conditions.push("(rate IS NULL OR rate = 0 OR rate = '')");
    }

    const whereClause = conditions.join(' AND ');

    const awkSql = `UPDATE aawak SET rate = ?, actual_amt = ROUND(COALESCE(qty, 0) * ?, 2), updated_at = datetime('now', 'localtime') WHERE ${whereClause}`;
    const jwkSql = `UPDATE jawak SET rate = ?, actual_amt = ROUND(COALESCE(qty, 0) * ?, 2), updated_at = datetime('now', 'localtime') WHERE ${whereClause}`;

    const awkRes = db.prepare(awkSql).run(rVal, rVal, ...params);
    const jwkRes = db.prepare(jwkSql).run(rVal, rVal, ...params);

    return {
        success: true,
        message: `Rate ₹${rVal} applied successfully to ${awkRes.changes} Aawak entries and ${jwkRes.changes} Jawak entries.`,
        aawakCount: awkRes.changes,
        jawakCount: jwkRes.changes
    };
}

/**
 * Look up rate for a specific department, item, subitem, and year.
 */
async function lookupItemRate(dept_id, item_id, subitem_id, year) {
    if (!item_id || !year) return null;

    const conditions = [
        `dept_id = ${Number(dept_id)}`,
        `item_id = ${Number(item_id)}`,
        `year = ${Number(year)}`
    ];
    if (subitem_id) {
        conditions.push(`subitem_id = ${Number(subitem_id)}`);
    } else {
        conditions.push(`(subitem_id IS NULL OR subitem_id = 0)`);
    }

    const rec = itemRateTable.getOne(conditions.join(' AND '), { full: false });
    return rec ? rec.rate : null;
}

/**
 * Bulk deletes item rate records by IDs.
 */
async function deleteBulkRates(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('No IDs provided for deletion.');
    }
    const placeholders = ids.map(() => '?').join(',');
    const result = db.prepare(`DELETE FROM item_rate WHERE _id IN (${placeholders})`).run(...ids);
    return {
        success: true,
        message: `Deleted ${result.changes} records.`,
        deletedCount: result.changes
    };
}

/**
 * Fetches all yearly rates for a specific item (and optionally subitem) in a department.
 */
async function getItemRatesByItem(deptId, itemId, subitemId = null) {
    let sql = `
        SELECT item_rate.*
        FROM item_rate
        WHERE item_rate.dept_id = ? AND item_rate.item_id = ?
    `;
    const params = [Number(deptId), Number(itemId)];
    if (subitemId) {
        sql += ` AND item_rate.subitem_id = ?`;
        params.push(Number(subitemId));
    } else {
        sql += ` AND (item_rate.subitem_id IS NULL OR item_rate.subitem_id = 0)`;
    }
    sql += ` ORDER BY item_rate.year DESC`;
    return db.prepare(sql).all(...params);
}

/**
 * Saves multiple rates for an item or subitem in a single call.
 */
async function saveBulkRates(deptId, data) {
    const { item_id, subitem_id, rates } = data;
    if (!item_id || !Array.isArray(rates)) {
        throw new Error('item_id and rates array are required.');
    }
    const results = [];
    for (const r of rates) {
        if (r.year && r.rate !== null && r.rate !== undefined && r.rate !== '') {
            const res = await saveItemRate(deptId, {
                item_id: Number(item_id),
                subitem_id: subitem_id ? Number(subitem_id) : null,
                year: Number(r.year),
                rate: Number(r.rate)
            });
            results.push(res);
        }
    }
    return results;
}

module.exports = {
    getItemRates,
    getItemRatesByItem,
    saveItemRate,
    saveBulkRates,
    deleteItemRate,
    applyItemRate,
    lookupItemRate,
    deleteBulkRates
};
