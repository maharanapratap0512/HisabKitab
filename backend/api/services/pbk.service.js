// services/pbk.service.js
'use strict';

const { dbmodal } = require('../database/db.model');
const db = dbmodal.db;
const BaseTable = require('../database/base.table');

// ── Table instances ───────────────────────────────────────────
const pbkBachat = new BaseTable('pbk_bachat');
const pbkClosing = new BaseTable('pbk_closing');

// ─────────────────────────────────────────────────────────────
// ── BACHAT ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────

/**
 * Get bachat for a specific PBK, filtered by dept and positive qty.
 */
function getBachatByPbk(pbk_id, dept_id) {
    return pbkBachat.getAll({
        pbk_id: Number(pbk_id),
        dept_id: Number(dept_id),
        qty: { '>': 0 },
        active: 1
    }, {
        orderBy: 'pbk_bachat._id ASC'
    });
}

/**
 * Filtered/Paginated bachat list.
 */
function getBachatList(filters) {
    const { dept_id, pageNo = 1, pageSize = 100, ...rest } = filters;
    const offset = (Number(pageNo) - 1) * Number(pageSize);

    // Simple filter support (equality)
    const where = { dept_id: Number(dept_id), active: 1, ...rest };

    const result = pbkBachat.getAll(where, {
        limit: Number(pageSize),
        offset: offset,
        orderBy: 'pbk_bachat._id DESC'
    });

    // Count for pagination
    const total_count = db.prepare(`SELECT COUNT(*) as cnt FROM pbk_bachat WHERE dept_id = ? AND active = 1`).get(dept_id).cnt;

    return { result, total_count, pageNo: Number(pageNo) };
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

    const where = { dept_id: Number(dept_id), active: 1, ...rest };

    const result = pbkClosing.getAll(where, {
        limit: Number(pageSize),
        offset: offset,
        orderBy: 'pbk_closing.date DESC, pbk_closing.voucher_no DESC'
    });

    const total_count = db.prepare(`SELECT COUNT(*) as cnt FROM pbk_closing WHERE dept_id = ? AND active = 1`).get(dept_id).cnt;

    return { result, total_count, pageNo: Number(pageNo) };
}

/**
 * Insert or Update a bunch of closing records.
 * Automatically synchronizes with pbk_bachat.
 */
function insertUpdateClosingBunch(data) {
    return BaseTable.transaction(() => {
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
    });
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
