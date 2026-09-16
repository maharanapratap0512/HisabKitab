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

    let whereCondition = `dept_id = ${dId} AND item_id = ${item_id} AND year = ${year}`;
    if (subitem_id) {
        whereCondition += ` AND subitem_id = ${subitem_id}`;
    } else {
        whereCondition += ` AND (subitem_id IS NULL OR subitem_id = 0)`;
    }

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
 */
async function applyItemRate(data) {
    const { dept_id, item_id, subitem_id, year, rate } = data;

    if (!dept_id || !item_id || !year || rate === undefined || rate === null) {
        throw new Error('Missing required parameters for applying rate.');
    }

    const dId = Number(dept_id);
    const iId = Number(item_id);
    const sId = subitem_id ? Number(subitem_id) : null;
    const yStr = String(year);
    const rVal = Number(rate);

    let awkSql = '';
    let jwkSql = '';
    let awkParams = [];
    let jwkParams = [];

    if (sId) {
        awkSql = `UPDATE aawak SET rate = ?, actual_amt = ROUND(qty * ?, 2) WHERE dept_id = ? AND item_id = ? AND subitem_id = ? AND strftime('%Y', date) = ?`;
        awkParams = [rVal, rVal, dId, iId, sId, yStr];

        jwkSql = `UPDATE jawak SET rate = ?, actual_amt = ROUND(qty * ?, 2) WHERE dept_id = ? AND item_id = ? AND subitem_id = ? AND strftime('%Y', date) = ?`;
        jwkParams = [rVal, rVal, dId, iId, sId, yStr];
    } else {
        awkSql = `UPDATE aawak SET rate = ?, actual_amt = ROUND(qty * ?, 2) WHERE dept_id = ? AND item_id = ? AND (subitem_id IS NULL OR subitem_id = 0) AND strftime('%Y', date) = ?`;
        awkParams = [rVal, rVal, dId, iId, yStr];

        jwkSql = `UPDATE jawak SET rate = ?, actual_amt = ROUND(qty * ?, 2) WHERE dept_id = ? AND item_id = ? AND (subitem_id IS NULL OR subitem_id = 0) AND strftime('%Y', date) = ?`;
        jwkParams = [rVal, rVal, dId, iId, yStr];
    }

    const awkRes = db.prepare(awkSql).run(...awkParams);
    const jwkRes = db.prepare(jwkSql).run(...jwkParams);

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

    let where = `dept_id = ${Number(dept_id)} AND item_id = ${Number(item_id)} AND year = ${Number(year)}`;
    if (subitem_id) {
        where += ` AND subitem_id = ${Number(subitem_id)}`;
    } else {
        where += ` AND (subitem_id IS NULL OR subitem_id = 0)`;
    }

    const rec = itemRateTable.getOne(where, { full: false });
    return rec ? rec.rate : null;
}

module.exports = {
    getItemRates,
    saveItemRate,
    deleteItemRate,
    applyItemRate,
    lookupItemRate
};
