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
            au.unit_short AS aawak_unit_short
        FROM jawak j
        INNER JOIN aawak a ON j.aawak_ref_id = a._id
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

module.exports = {
    scanMismatches,
    resolveMismatches
};
