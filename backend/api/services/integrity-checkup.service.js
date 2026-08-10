const { dbmodal, sutramDB } = require('../database/db.model');
const db = dbmodal.db;
const Fn = require('../database/functions');
const DBContex = require('../database/DBContex');
const DB = new DBContex();

/**
 * Scan for Jawak-Aawak mismatches
 */
function scanMismatches() {
    const query = `
        SELECT 
            j._id AS jawak_id,
            j.voucher_no AS jawak_voucher_no,
            j.date AS jawak_date,
            j.qty AS jawak_qty,
            j.mm_id AS jawak_mm_id,
            j.item_id AS jawak_item_id,
            j.subitem_id AS jawak_subitem_id,
            j.unit_id AS jawak_unit_id,
            
            a._id AS aawak_id,
            a.voucher_no AS aawak_voucher_no,
            a.date AS aawak_date,
            a.mm_id AS aawak_mm_id,
            a.item_id AS aawak_item_id,
            a.subitem_id AS aawak_subitem_id,
            a.unit_id AS aawak_unit_id,
            
            jmm.mm_hin AS jawak_mm_hin,
            amm.mm_hin AS aawak_mm_hin,
            ji.item_hin AS jawak_item_hin,
            ai.item_hin AS aawak_item_hin,
            jsi.subitem_hin AS jawak_subitem_hin,
            asi.subitem_hin AS aawak_subitem_hin,
            ju.unit_short AS jawak_unit_short,
            au.unit_short AS aawak_unit_short,

            COALESCE(splits.split_count, 0) AS split_count,
            COALESCE(splits.is_split, 0) AS is_split
        FROM jawak j
        INNER JOIN (
            SELECT jawak_id, MIN(aawak_id) AS aawak_id 
            FROM rel_aawak_jawak 
            GROUP BY jawak_id
        ) raj ON raj.jawak_id = j._id
        INNER JOIN aawak a ON a._id = raj.aawak_id
        LEFT JOIN (
            SELECT jawak_id, COUNT(*) AS split_count, MAX(IFNULL(is_split, 0)) AS is_split
            FROM rel_aawak_jawak
            GROUP BY jawak_id
        ) splits ON splits.jawak_id = j._id
        LEFT JOIN mm jmm ON j.mm_id = jmm._id
        LEFT JOIN mm amm ON a.mm_id = amm._id
        LEFT JOIN item ji ON j.item_id = ji._id
        LEFT JOIN item ai ON a.item_id = ai._id
        LEFT JOIN subitem jsi ON j.subitem_id = jsi._id
        LEFT JOIN subitem asi ON a.subitem_id = asi._id
        LEFT JOIN unit ju ON j.unit_id = ju._id
        LEFT JOIN unit au ON a.unit_id = au._id
        WHERE 
            COALESCE(j.mm_id, 0) != COALESCE(a.mm_id, 0) OR
            COALESCE(j.item_id, 0) != COALESCE(a.item_id, 0) OR
            COALESCE(j.subitem_id, 0) != COALESCE(a.subitem_id, 0) OR
            COALESCE(j.unit_id, 0) != COALESCE(a.unit_id, 0)
    `;
    return db.prepare(query).all();
}

/**
 * Resolve mismatches sequentially
 */
async function resolveMismatches(mismatches, logCallback = () => {}) {
    let resolvedCount = 0;
    await Fn.begin();
    try {
        for (const mismatch of mismatches) {
            logCallback(`Resolving Jawak ID ${mismatch.jawak_id}: Aligning values with Aawak ID ${mismatch.aawak_id}...`);
            
            // Get old Jawak record using DB context to trigger exact same format
            const oldJawak = await DB.getById('jawak', mismatch.jawak_id);
            if (!oldJawak) {
                logCallback(`[Warning] Jawak ID ${mismatch.jawak_id} not found in database.`);
                continue;
            }

            // Get referencing Aawak record
            const aawak = await DB.getById('aawak', mismatch.aawak_id);
            if (!aawak) {
                logCallback(`[Warning] Reference Aawak ID ${mismatch.aawak_id} not found in database.`);
                continue;
            }

            // Create updated Jawak payload
            const updatedJawak = {
                ...oldJawak,
                mm_id: aawak.mm_id,
                item_id: aawak.item_id,
                subitem_id: aawak.subitem_id,
                unit_id: aawak.unit_id
            };

            // Fn.updateAJ maintains stock stability and parses enzymes/usage reports
            await Fn.updateAJ(updatedJawak, 'jawak', oldJawak);
            resolvedCount++;
            logCallback(`[Success] Jawak ID ${mismatch.jawak_id} resolved.`);
        }
        await Fn.commit();
        logCallback(`[Success] Successfully resolved ${resolvedCount} mismatches.`);
        return resolvedCount;
    } catch (err) {
        await Fn.rollback();
        logCallback(`[Error] Resolution failed: ${err.message}. Rolled back changes.`);
        throw err;
    }
}

/**
 * Scan for Aawak Remaining Qty mismatches
 */
function scanRemainingQtyMismatches() {
    const query = `
        SELECT 
            a._id AS aawak_id,
            a.voucher_no AS aawak_voucher_no,
            a.date AS aawak_date,
            a.qty AS aawak_total_qty,
            COALESCE(a.remaining_qty, a.qty) AS stored_remaining_qty,
            COALESCE(used.total_used_qty, 0) AS total_used_qty,
            ROUND(a.qty - COALESCE(used.total_used_qty, 0), 3) AS expected_remaining_qty,
            ROUND(COALESCE(a.remaining_qty, a.qty) - ROUND(a.qty - COALESCE(used.total_used_qty, 0), 3), 3) AS difference_qty,
            COALESCE(used.total_jawak_count, 0) AS total_jawak_count,
            COALESCE(used.split_jawak_count, 0) AS split_jawak_count,
            mm.mm_hin AS aawak_mm_hin,
            i.item_hin AS aawak_item_hin,
            si.subitem_hin AS aawak_subitem_hin,
            u.unit_short AS aawak_unit_short
        FROM aawak a
        LEFT JOIN (
            SELECT 
                raj.aawak_id, 
                ROUND(SUM(IFNULL(raj.split_qty, raj.qty)), 3) AS total_used_qty,
                COUNT(DISTINCT raj.jawak_id) AS total_jawak_count,
                SUM(CASE WHEN raj.is_split = 1 THEN 1 ELSE 0 END) AS split_jawak_count
            FROM rel_aawak_jawak raj
            INNER JOIN jawak j ON j._id = raj.jawak_id
            GROUP BY raj.aawak_id
        ) used ON used.aawak_id = a._id
        LEFT JOIN mm ON mm._id = a.mm_id
        LEFT JOIN item i ON i._id = a.item_id
        LEFT JOIN subitem si ON si._id = a.subitem_id
        LEFT JOIN unit u ON u._id = a.unit_id
        WHERE 
            ABS(COALESCE(a.remaining_qty, a.qty) - (a.qty - COALESCE(used.total_used_qty, 0))) > 0.001
        ORDER BY a.date DESC, a._id DESC
    `;
    return db.prepare(query).all();
}

/**
 * Resolve Remaining Qty mismatches sequentially
 */
async function resolveRemainingQtyMismatches(mismatches, logCallback = () => {}) {
    let resolvedCount = 0;
    await Fn.begin();
    try {
        const stmtUpdate = db.prepare(`UPDATE aawak SET remaining_qty = ?, updated_at = datetime('now','localtime') WHERE _id = ?`);
        for (const mismatch of mismatches) {
            logCallback(`Resolving Aawak ID ${mismatch.aawak_id}: Updating remaining_qty from ${mismatch.stored_remaining_qty} to ${mismatch.expected_remaining_qty}...`);
            stmtUpdate.run(mismatch.expected_remaining_qty, mismatch.aawak_id);
            resolvedCount++;
            logCallback(`[Success] Aawak ID ${mismatch.aawak_id} remaining_qty updated to ${mismatch.expected_remaining_qty}.`);
        }
        await Fn.commit();
        logCallback(`[Success] Successfully resolved ${resolvedCount} remaining_qty mismatches.`);
        return resolvedCount;
    } catch (err) {
        await Fn.rollback();
        logCallback(`[Error] Resolution failed: ${err.message}. Rolled back changes.`);
        throw err;
    }
}

/**
 * Scan for Bachat & Bachat_New stock/used/condition mismatches
 */
function scanBachatMismatches() {
    const query = `
        SELECT 
            b_keys.dept_id,
            b_keys.mm_id,
            b_keys.item_id,
            b_keys.subitem_id,
            b_keys.unit_id,
            d.dept_hin,
            mm.mm_hin,
            i.item_hin,
            si.subitem_hin,
            u.unit_short,
            b._id AS bachat_id,
            COALESCE(b.Stock, 0) AS stored_stock,
            COALESCE(b.Used, 0) AS stored_used,
            COALESCE(b.New, 0) AS stored_new,
            COALESCE(b.Old, 0) AS stored_old,
            COALESCE(b.Defective, 0) AS stored_defective,
            COALESCE(b.Scrap, 0) AS stored_scrap,
            COALESCE(b.Repairing, 0) AS stored_repairing,
            
            ROUND(COALESCE(awk.total_awk_qty, 0) - COALESCE(jwk.total_jwk_qty, 0), 3) AS expected_stock,
            ROUND(COALESCE(jwk.used_jwk_qty, 0), 3) AS expected_used,
            ROUND(COALESCE(awk.new_awk_qty, 0) - COALESCE(jwk.new_jwk_qty, 0), 3) AS expected_new,
            ROUND(COALESCE(awk.old_awk_qty, 0) - COALESCE(jwk.old_jwk_qty, 0), 3) AS expected_old,
            ROUND(COALESCE(awk.def_awk_qty, 0) - COALESCE(jwk.def_jwk_qty, 0), 3) AS expected_defective,
            ROUND(COALESCE(awk.scrap_awk_qty, 0) - COALESCE(jwk.scrap_jwk_qty, 0), 3) AS expected_scrap,
            ROUND(COALESCE(awk.rep_awk_qty, 0) - COALESCE(jwk.rep_jwk_qty, 0), 3) AS expected_repairing
        FROM (
            SELECT dept_id, mm_id, item_id, subitem_id, unit_id FROM aawak
            UNION
            SELECT dept_id, mm_id, item_id, subitem_id, unit_id FROM jawak
            UNION
            SELECT dept_id, mm_id, item_id, subitem_id, unit_id FROM bachat
        ) b_keys
        LEFT JOIN bachat b 
            ON b.dept_id = b_keys.dept_id 
            AND b.mm_id = b_keys.mm_id 
            AND b.item_id = b_keys.item_id 
            AND IFNULL(b.subitem_id, 0) = IFNULL(b_keys.subitem_id, 0) 
            AND b.unit_id = b_keys.unit_id
        LEFT JOIN (
            SELECT 
                dept_id, mm_id, item_id, subitem_id, unit_id,
                SUM(qty) AS total_awk_qty,
                SUM(CASE WHEN condition_id = 33 THEN qty ELSE 0 END) AS new_awk_qty,
                SUM(CASE WHEN condition_id = 34 THEN qty ELSE 0 END) AS old_awk_qty,
                SUM(CASE WHEN condition_id = 35 THEN qty ELSE 0 END) AS def_awk_qty,
                SUM(CASE WHEN condition_id = 36 THEN qty ELSE 0 END) AS scrap_awk_qty,
                SUM(CASE WHEN condition_id = 37 THEN qty ELSE 0 END) AS rep_awk_qty
            FROM aawak
            GROUP BY dept_id, mm_id, item_id, IFNULL(subitem_id, 0), unit_id
        ) awk ON awk.dept_id = b_keys.dept_id AND awk.mm_id = b_keys.mm_id AND awk.item_id = b_keys.item_id AND IFNULL(awk.subitem_id, 0) = IFNULL(b_keys.subitem_id, 0) AND awk.unit_id = b_keys.unit_id
        LEFT JOIN (
            SELECT 
                dept_id, mm_id, item_id, subitem_id, unit_id,
                SUM(qty) AS total_jwk_qty,
                SUM(CASE WHEN jawak_type_id = 27 THEN qty ELSE 0 END) AS used_jwk_qty,
                SUM(CASE WHEN condition_id = 33 THEN qty ELSE 0 END) AS new_jwk_qty,
                SUM(CASE WHEN condition_id = 34 THEN qty ELSE 0 END) AS old_jwk_qty,
                SUM(CASE WHEN condition_id = 35 THEN qty ELSE 0 END) AS def_jwk_qty,
                SUM(CASE WHEN condition_id = 36 THEN qty ELSE 0 END) AS scrap_jwk_qty,
                SUM(CASE WHEN condition_id = 37 THEN qty ELSE 0 END) AS rep_jwk_qty
            FROM jawak
            GROUP BY dept_id, mm_id, item_id, IFNULL(subitem_id, 0), unit_id
        ) jwk ON jwk.dept_id = b_keys.dept_id AND jwk.mm_id = b_keys.mm_id AND jwk.item_id = b_keys.item_id AND IFNULL(jwk.subitem_id, 0) = IFNULL(b_keys.subitem_id, 0) AND jwk.unit_id = b_keys.unit_id
        LEFT JOIN department d ON d._id = b_keys.dept_id
        LEFT JOIN mm ON mm._id = b_keys.mm_id
        LEFT JOIN item i ON i._id = b_keys.item_id
        LEFT JOIN subitem si ON si._id = b_keys.subitem_id
        LEFT JOIN unit u ON u._id = b_keys.unit_id
        WHERE 
            ABS(COALESCE(b.Stock, 0) - ROUND(COALESCE(awk.total_awk_qty, 0) - COALESCE(jwk.total_jwk_qty, 0), 3)) > 0.001
            OR ABS(COALESCE(b.Used, 0) - ROUND(COALESCE(jwk.used_jwk_qty, 0), 3)) > 0.001
            OR ABS(COALESCE(b.New, 0) - ROUND(COALESCE(awk.new_awk_qty, 0) - COALESCE(jwk.new_jwk_qty, 0), 3)) > 0.001
            OR ABS(COALESCE(b.Old, 0) - ROUND(COALESCE(awk.old_awk_qty, 0) - COALESCE(jwk.old_jwk_qty, 0), 3)) > 0.001
            OR ABS(COALESCE(b.Defective, 0) - ROUND(COALESCE(awk.def_awk_qty, 0) - COALESCE(jwk.def_jwk_qty, 0), 3)) > 0.001
            OR ABS(COALESCE(b.Scrap, 0) - ROUND(COALESCE(awk.scrap_awk_qty, 0) - COALESCE(jwk.scrap_jwk_qty, 0), 3)) > 0.001
            OR ABS(COALESCE(b.Repairing, 0) - ROUND(COALESCE(awk.rep_awk_qty, 0) - COALESCE(jwk.rep_jwk_qty, 0), 3)) > 0.001
        ORDER BY b_keys.dept_id, mm.mm_hin, i.item_hin
    `;
    return db.prepare(query).all();
}

/**
 * Resolve Bachat & Bachat_New mismatches sequentially
 */
async function resolveBachatMismatches(mismatches, logCallback = () => {}) {
    let resolvedCount = 0;
    await Fn.begin();
    try {
        const deptSet = new Set(mismatches.map(m => m.dept_id).filter(Boolean));
        for (const deptId of deptSet) {
            logCallback(`Rebuilding Bachat and Bachat_New summary tables for Department ID ${deptId}...`);
            
            // Delete existing bachat and bachat_new rows for this dept_id
            db.prepare(`DELETE FROM bachat WHERE dept_id = ?`).run(deptId);
            db.prepare(`DELETE FROM bachat_new WHERE dept_id = ?`).run(deptId);

            // Fetch all Aawak and Jawak entries in chronological order
            const aawaks = db.prepare(`SELECT * FROM aawak WHERE dept_id = ? ORDER BY date ASC, _id ASC`).all(deptId);
            const jawaks = db.prepare(`SELECT * FROM jawak WHERE dept_id = ? ORDER BY date ASC, _id ASC`).all(deptId);

            logCallback(`Processing ${aawaks.length} Aawaks and ${jawaks.length} Jawaks for Department ID ${deptId}...`);

            for (const awk of aawaks) {
                await DB.updateBachatFromAJInsert(awk, 'aawak');
            }
            for (const jwk of jawaks) {
                await DB.updateBachatFromAJInsert(jwk, 'jawak');
            }
            resolvedCount += mismatches.filter(m => m.dept_id === deptId).length;
            logCallback(`[Success] Rebuilt Bachat and Bachat_New tables for Department ID ${deptId}.`);
        }
        await Fn.commit();
        logCallback(`[Success] Successfully resolved ${resolvedCount} Bachat mismatches across ${deptSet.size} department(s).`);
        return resolvedCount;
    } catch (err) {
        await Fn.rollback();
        logCallback(`[Error] Bachat resolution failed: ${err.message}. Rolled back changes.`);
        throw err;
    }
}

/**
 * Rebuild ALL Bachat and Bachat_New summary tables from scratch across all departments
 */
async function rebuildAllBachat(logCallback = () => {}) {
    await Fn.begin();
    try {
        logCallback(`Starting Full Bachat & Bachat_New Summary Rebuild...`);
        
        // 1. Truncate bachat and bachat_new tables
        db.prepare(`DELETE FROM bachat`).run();
        db.prepare(`DELETE FROM bachat_new`).run();
        logCallback(`[Notice] Cleared existing bachat and bachat_new summary tables.`);

        // 2. Fetch all Aawak and Jawak entries in chronological order
        const aawaks = db.prepare(`SELECT * FROM aawak ORDER BY date ASC, _id ASC`).all();
        const jawaks = db.prepare(`SELECT * FROM jawak ORDER BY date ASC, _id ASC`).all();

        logCallback(`Processing ${aawaks.length} total Aawaks and ${jawaks.length} total Jawaks across all departments...`);

        let count = 0;
        for (const awk of aawaks) {
            await DB.updateBachatFromAJInsert(awk, 'aawak');
            count++;
            if (count % 50 === 0) {
                logCallback(`Processed ${count} / ${aawaks.length + jawaks.length} entries...`);
            }
        }
        for (const jwk of jawaks) {
            await DB.updateBachatFromAJInsert(jwk, 'jawak');
            count++;
            if (count % 50 === 0) {
                logCallback(`Processed ${count} / ${aawaks.length + jawaks.length} entries...`);
            }
        }

        await Fn.commit();
        logCallback(`[Success] Successfully rebuilt Bachat & Bachat_New tables for all ${aawaks.length} Aawak and ${jawaks.length} Jawak entries.`);
        return count;
    } catch (err) {
        await Fn.rollback();
        logCallback(`[Error] Full Bachat Rebuild failed: ${err.message}. Rolled back changes.`);
        throw err;
    }
}

module.exports = {
    scanMismatches,
    resolveMismatches,
    scanRemainingQtyMismatches,
    resolveRemainingQtyMismatches,
    scanBachatMismatches,
    resolveBachatMismatches,
    rebuildAllBachat
};
