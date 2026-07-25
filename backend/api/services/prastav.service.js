const { dbmodal, sutramDB } = require('../database/db.model');
const db = dbmodal.db;
const BaseTable = require('../database/base.table');
const { buildSubitemListMap, injectSubitemList } = require('./hmp.service');

// ── Table instances ───────────────────────────────────────────
const Prastav = new BaseTable('prastav');
const PrastavJawak = new BaseTable('prastav_jawak');
const subitemList = new BaseTable('subitem_list');

/**
 * Paginated, filtered Prastav list.
 */
function getPrastavs({ mm_id, pbk_id, item_id, subitem_id, year, month, date, pageNo, itemsPerPage, dept_id, is_noted }) {
    const PAGE_SIZE = itemsPerPage ? Number(itemsPerPage) : 100;
    const page = (pageNo !== undefined && pageNo !== null) ? Number(pageNo) + 1 : 1;
    const offset = (page - 1) * PAGE_SIZE;

    // ── build WHERE ───────────────────────────────────────────
    const conds = [`prastav.active = 1`];

    // if (dept_id) conds.push(`prastav.dept_id = ${Number(dept_id)}`);
    if (mm_id && mm_id.length > 0) conds.push(`prastav.mm_id IN (${mm_id.join(',')})`);
    if (pbk_id && pbk_id.length > 0) conds.push(`prastav.pbk_id IN (${pbk_id.join(',')})`);
    if (item_id && item_id.length > 0) conds.push(`prastav.item_id IN (${item_id.join(',')})`);
    if (subitem_id && subitem_id.length > 0) conds.push(`prastav.subitem_id IN (${subitem_id.join(',')})`);

    if (year) {
        conds.push(`strftime('%Y', prastav.date) = '${String(year)}'`);
    }

    if (month) {
        conds.push(`strftime('%m', prastav.date) = '${String(month).padStart(2, '0')}'`);
    }

    if (date) {
        conds.push(`prastav.date = '${String(date)}'`);
    }

    if (is_noted !== undefined && is_noted !== null && is_noted !== '') {
        conds.push(`prastav.is_noted = ${Number(is_noted)}`);
    }

    const where = conds.join(' AND ');

    // ── count ──────────────────────
    const total_count = db.prepare(
        `SELECT COUNT(*) AS cnt FROM prastav WHERE ${where}`
    ).get().cnt;

    // ── data ──────────────────────
    // BaseTable.getAll returns desanitized rows with joins (mm, pbk, item, units) 
    // and nested jawaks (from schema.joins)
    const result = Prastav.getAll(where, {
        orderBy: 'voucher_no DESC, _id ASC',
        limit: PAGE_SIZE,
        offset,
    });

    const subitemListMap = buildSubitemListMap(subitemList.getAll());
    for (const prastav of result) {
        injectSubitemList([prastav], subitemListMap);           // prastav ka apna subitem
        injectSubitemList(prastav.jawaks || [], subitemListMap); // har jawak ka subitem
    }
    return { result, pageNo: page - 1, total_count };
}

/**
 * Get full voucher data by voucher_no (multiple items)
 */
function getVoucher(voucherNo) {
    const rows = Prastav.getAll({ voucher_no: Number(voucherNo), active: 1 });
    if (rows.length === 0) return null;

    const subitemListMap = buildSubitemListMap(subitemList.getAll());

    for (const row of rows) {
        injectSubitemList([row], subitemListMap);           // prastav ka apna subitem
        injectSubitemList(row.jawaks || [], subitemListMap); // har jawak ka subitem
    }

    // The component expected structure: voucher core data + lines[]
    const voucher = {
        date: rows[0].date,
        mm_id: rows[0].mm_id,
        pbk_id: rows[0].pbk_id,
        pbk_count: rows[0].pbk_count,
        note: rows[0].note_details,
        is_rejected: rows[0].is_rejected || 0,
        reject_reason: rows[0].reject_reason || null,
        voucher_no: rows[0].voucher_no,
        lines: rows.map(r => ({
            ...r,
            jawaks: r.jawaks || []
        }))
    };

    return voucher;
}

/**
 * Delete entire voucher
 */
function deleteVoucher(voucherNo) {
    sutramDB.begin();
    try {
        const rows = Prastav.getAll({ voucher_no: Number(voucherNo) }, { full: false });
        const ids = rows.map(r => r._id);

        if (ids.length > 0) {
            db.prepare(`DELETE FROM prastav_jawak WHERE prastav_id IN (${ids.join(',')})`).run();
            db.prepare(`DELETE FROM prastav WHERE voucher_no = ?`).run(Number(voucherNo));
        }
        sutramDB.commit();
        return ids.length;
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}

/**
 * Update entire voucher (delete/re-insert pattern for batch sync)
 */
function updateVoucher(voucherNo, data) {
    sutramDB.begin();
    try {
        // 1. Delete old
        const oldRows = db.prepare(`SELECT _id FROM prastav WHERE voucher_no = ?`).all(Number(voucherNo));
        const oldIds = oldRows.map(r => r._id);
        if (oldIds.length > 0) {
            db.prepare(`DELETE FROM prastav_jawak WHERE prastav_id IN (${oldIds.join(',')})`).run();
        }
        db.prepare(`DELETE FROM prastav WHERE voucher_no = ?`).run(Number(voucherNo));

        // 2. Insert new (re-using voucherNo)
        const lines = Array.isArray(data.lines) ? data.lines : [];
        for (const line of lines) {
            const row = {
                ...data,
                voucher_no: Number(voucherNo),
                item_id: line.item_id,
                subitem_id: line.subitem_id || null,
                unit_id: line.unit_id,
                qty: line.qty || 0,
                qty_needs: line.qty_needs || null,
                rate: line.rate || 0,
                amount: line.amount || 0,
                bachat: line.bachat || 0,
                monthly_uses: line.monthly_uses || 0,
                description: line.description || null,
                active: 1
            };
            delete row._id;
            delete row.lines;
            delete row.jawaks;
            delete row.items;
            delete row.vRows;
            delete row.expanded;
            delete row.totalAmount;

            const pId = Prastav.insert(row, false);

            // Jawaks
            const jawaks = Array.isArray(line.jawaks) ? line.jawaks.filter(j => j.source_mm_id && j.qty) : [];
            for (const jw of jawaks) {
                const jwData = {
                    ...jw,
                    prastav_id: pId,
                    mm_id: data.mm_id,
                    item_id: jw.item_id || line.item_id,
                    subitem_id: jw.subitem_id || line.subitem_id || null,
                    unit_id: jw.unit_id || line.unit_id || 1,
                    active: 1
                };
                delete jwData._id;
                PrastavJawak.insert(jwData, false);
            }
        }

        sutramDB.commit();
        return getVoucher(voucherNo);
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}

/**
 * Centralized reference transfer
 */
async function transferReferences(list_type, from_id, to_id_raw) {
    const fromIdNum = Number(from_id);

    let to_item_id = null;
    let to_subitem_id = null;
    let toIdNum = null;

    if (list_type === 'item' || list_type === 'subitem') {
        if (typeof to_id_raw === 'string' && to_id_raw.includes(':')) {
            const parts = to_id_raw.split(':');
            to_item_id = parseInt(parts[0]) || null;
            to_subitem_id = parts[1] !== 'null' ? parseInt(parts[1]) : null;
            toIdNum = list_type === 'item' ? to_item_id : to_subitem_id;
        } else {
            toIdNum = parseInt(to_id_raw) || null;
            if (list_type === 'item') to_item_id = toIdNum;
            if (list_type === 'subitem') to_subitem_id = toIdNum;
        }
    } else {
        toIdNum = Number(to_id_raw);
    }

    if (!toIdNum && list_type !== 'item' && list_type !== 'subitem') return;

    if (list_type === 'item' || list_type === 'subitem') {
        const col = list_type === 'item' ? 'item_id' : 'subitem_id';
        const subitemCheck = list_type === 'item' ? ' AND subitem_id IS NULL' : '';

        if (to_item_id) {
            db.prepare(`UPDATE prastav SET item_id = ?, subitem_id = ? WHERE ${col} = ?${subitemCheck}`).run(to_item_id, to_subitem_id, fromIdNum);
            db.prepare(`UPDATE prastav_jawak SET item_id = ?, subitem_id = ? WHERE ${col} = ?${subitemCheck}`).run(to_item_id, to_subitem_id, fromIdNum);
        } else {
            db.prepare(`UPDATE prastav SET subitem_id = ? WHERE subitem_id = ?`).run(to_subitem_id, fromIdNum);
            db.prepare(`UPDATE prastav_jawak SET subitem_id = ? WHERE subitem_id = ?`).run(to_subitem_id, fromIdNum);
        }
    } else {
        let col = "";
        switch (list_type) {
            case 'mm': col = 'mm_id'; break;
            case 'unit': col = 'unit_id'; break;
        }

        if (col) {
            db.prepare(`UPDATE prastav SET ${col} = ? WHERE ${col} = ?`).run(toIdNum, fromIdNum);
            db.prepare(`UPDATE prastav_jawak SET ${col} = ? WHERE ${col} = ?`).run(toIdNum, fromIdNum);
        }

        if (list_type === 'mm') {
            db.prepare(`UPDATE prastav_jawak SET source_mm_id = ? WHERE source_mm_id = ?`).run(toIdNum, fromIdNum);
        }
    }
}

module.exports = {
    getPrastavs,
    getVoucher,
    updateVoucher,
    deleteVoucher,
    transferReferences
};
