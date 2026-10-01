// services/pbk.service.js
'use strict';

const { dbmodal, sutramDB } = require('../database/db.model');
const db = dbmodal.db;
const BaseTable = require('../database/base.table');

// ── Table instances ───────────────────────────────────────────
const pbkBachat = new BaseTable('pbk_bachat');
const pbkClosing = new BaseTable('pbk_closing');

// ─────────────────────────────────────────────────────────────
// ── BACHAT ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────

function flattenJoinedFields(rows) {
    if (!Array.isArray(rows)) return rows;
    return rows.map(row => ({
        ...row,
        pbk_hin: row.pbk?.pbk_hin || row.pbk_hin || '',
        pbk_eng: row.pbk?.pbk_eng || row.pbk_eng || '',
        roll_no: row.pbk?.roll_no || row.roll_no || '',
        item_hin: row.item?.item_hin || row.item_hin || '',
        item_eng: row.item?.item_eng || row.item_eng || '',
        subitem_hin: row.subitem?.subitem_hin || row.subitem_hin || '',
        subitem_eng: row.subitem?.subitem_eng || row.subitem_eng || '',
        unit_short: row.unit?.unit_short || row.unit_short || '',
        unit_full: row.unit?.unit_full || row.unit_full || '',
        condition_hin: row.condition?.list_name_hin || row.condition_hin || '',
        condition_eng: row.condition?.list_name_eng || row.condition_eng || ''
    }));
}

/**
 * Get bachat for a specific PBK, filtered by dept and positive qty.
 */
function getBachatByPbk(pbk_id, dept_id) {
    const rows = pbkBachat.getAll({
        pbk_id: Number(pbk_id),
        dept_id: Number(dept_id),
        qty: { '>': 0 },
        active: 1
    }, {
        orderBy: 'pbk_bachat._id ASC'
    });

    return flattenJoinedFields(rows);
}

function buildCleanWhere(dept_id, rest) {
    const clean = { dept_id: Number(dept_id), active: 1 };
    for (const [k, v] of Object.entries(rest)) {
        if (v !== null && v !== undefined && v !== '') {
            clean[k] = v;
        }
    }
    return clean;
}

/**
 * Filtered/Paginated bachat list.
 */
function getBachatList(filters) {
    const { dept_id, pageNo = 1, pageSize = 100, ...rest } = filters;
    const offset = (Number(pageNo) - 1) * Number(pageSize);

    const where = buildCleanWhere(dept_id, rest);

    const result = pbkBachat.getAll(where, {
        limit: Number(pageSize),
        offset: offset,
        orderBy: 'pbk_bachat._id DESC'
    });

    const total_count = pbkBachat.getAll(where, { full: false }).length;

    return { result: flattenJoinedFields(result), total_count, pageNo: Number(pageNo) };
}

// ─────────────────────────────────────────────────────────────
// ── CLOSING ───────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────

/**
 * Get closing records for a dept (paginated).
 */
function getClosings(filters) {
    const { dept_id, pageNo = 1, pageSize = 100, ...rest } = filters;
    const offset = (Number(pageNo) - 1) * Number(pageSize);

    const where = buildCleanWhere(dept_id, rest);

    const result = pbkClosing.getAll(where, {
        limit: Number(pageSize),
        offset: offset,
        orderBy: 'pbk_closing.date DESC, pbk_closing.voucher_no DESC'
    });

    const total_count = pbkClosing.getAll(where, { full: false }).length;

    return { result: flattenJoinedFields(result), total_count, pageNo: Number(pageNo) };
}

/**
 * Insert or Update a bunch of closing records.
 * Automatically synchronizes with pbk_bachat.
 */
function insertUpdateClosingBunch(data) {
    const { date, pbk_id, dept_id, pbk_closings } = data;
    let voucher_no = data.voucher_no;

    if (!voucher_no) {
        const lastV = db.prepare(`SELECT MAX(voucher_no) as maxV FROM pbk_closing`).get().maxV || 0;
        voucher_no = Number(lastV) + 1;
    }

    const successResult = [];

    for (const item of pbk_closings) {
        const closingObj = {
            ...item,
            voucher_no,
            date,
            pbk_id: Number(pbk_id),
            dept_id: Number(dept_id),
            active: 1
        };

        let id;
        if (closingObj._id) {
            pbkClosing.updateById(closingObj, closingObj._id);
            id = closingObj._id;
        } else {
            id = pbkClosing.insert(closingObj, false);
            closingObj._id = id;
        }

        // Sync with pbk_bachat
        syncBachatFromClosing(closingObj);

        successResult.push(closingObj);
    }

    return { result: successResult, voucher_no };
}

/**
 * Delete a closing record.
 * Note: Typically deletion might need reverse sync, 
 * but following existing pattern which just deletes.
 */
function deleteClosing(id) {
    return pbkClosing.deleteById(id);
}

// ── INTERNAL HELPERS ──────────────────────────────────────────

/**
 * Logic from Fn.syncPBKBachatFromPBKClosing
 */
function syncBachatFromClosing(obj) {
    const where = {
        pbk_id: obj.pbk_id,
        item_id: obj.item_id,
        dept_id: obj.dept_id,
        unit_id: obj.unit_id,
        subitem_id: obj.subitem_id || null,
        condition_id: obj.condition_id || null,
    };

    const existing = pbkBachat.getOne(where, { full: false });

    if (existing) {
        pbkBachat.updateById({ qty: obj.qty, active: 1 }, existing._id);
    } else {
        pbkBachat.insert({
            ...where,
            qty: obj.qty,
            active: 1
        }, false);
    }
}

module.exports = {
    // Bachat
    getBachatByPbk,
    getBachatList,
    // Closing
    getClosings,
    insertUpdateClosingBunch,
    deleteClosing,
};
