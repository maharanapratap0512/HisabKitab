const DBContex = require('../database/DBContex');
const DB = new DBContex();

/**
 * Normalizes any date input (Excel serial integer, ISO date string, DD-MM-YYYY, DD/MM/YYYY, timestamp)
 * into a Unix Epoch in SECONDS.
 */
function toUnixSeconds(val) {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') {
        // Excel serial date format (e.g. 45210)
        if (val < 100000) {
            return Math.floor((val - 25569) * 86400);
        }
        // Milliseconds timestamp
        if (val > 1e11) {
            return Math.floor(val / 1000);
        }
        // Seconds timestamp
        return Math.floor(val);
    }
    if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed || trimmed === '-' || trimmed === 'null' || trimmed === 'undefined') return null;
        
        const parts = trimmed.split(/[./-]+/);
        if (parts.length === 3) {
            // YYYY-MM-DD
            if (parts[0].length === 4) {
                const d = new Date(`${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}T00:00:00Z`);
                if (!isNaN(d.getTime())) return Math.floor(d.getTime() / 1000);
            }
            // DD-MM-YYYY
            const d = new Date(`${parts[2].padStart(4, '20')}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T00:00:00Z`);
            if (!isNaN(d.getTime())) return Math.floor(d.getTime() / 1000);
        }
        const parsed = Date.parse(trimmed);
        if (!isNaN(parsed)) return Math.floor(parsed / 1000);
    }
    return null;
}

/**
 * Calculates 4-tier compliance status for a document given its expiry timestamp in milliseconds.
 */
function calculateDocCompliance(expMs, ctime) {
    if (!expMs) {
        return { status: 'none', days: null, isExpired: false, isCritical: false, isUpcoming: false, isValid: false };
    }
    const diffMs = expMs - ctime;
    const days = Math.ceil(diffMs / 86400000);

    if (diffMs < 0) {
        return { status: 'expired', days, isExpired: true, isCritical: false, isUpcoming: false, isValid: false };
    } else if (diffMs <= 7 * 86400000) {
        return { status: 'critical', days, isExpired: false, isCritical: true, isUpcoming: false, isValid: false };
    } else if (diffMs <= 30 * 86400000) {
        return { status: 'upcoming', days, isExpired: false, isCritical: false, isUpcoming: true, isValid: false };
    } else {
        return { status: 'valid', days, isExpired: false, isCritical: false, isUpcoming: false, isValid: true };
    }
}

/**
 * Enriches a vehicle record with comprehensive 4-tier expiry and compliance metadata.
 */
function enrichVehicleExpiry(vehicle, ctime = null) {
    if (!ctime) {
        ctime = Date.now();
    }
    const v = { ...vehicle };

    const rc = calculateDocCompliance(v.rc_exp_date, ctime);
    const ins = calculateDocCompliance(v.insurance_exp_date, ctime);
    const puc = calculateDocCompliance(v.puc_exp_date, ctime);

    v.rc_status = rc.status;
    v.rc_days = rc.days;
    v.rc_error = rc.isExpired || rc.isCritical;
    v.rc_warning = rc.isUpcoming;

    v.insurance_status = ins.status;
    v.insurance_days = ins.days;
    v.insurance_error = ins.isExpired || ins.isCritical;
    v.insurance_warning = ins.isUpcoming;

    v.puc_status = puc.status;
    v.puc_days = puc.days;
    v.puc_error = puc.isExpired || puc.isCritical;
    v.puc_warning = puc.isUpcoming;

    // Overall compliance status
    if (rc.isExpired || ins.isExpired || puc.isExpired) {
        v.overall_status = 'expired';
    } else if (rc.isCritical || ins.isCritical || puc.isCritical) {
        v.overall_status = 'critical';
    } else if (rc.isUpcoming || ins.isUpcoming || puc.isUpcoming) {
        v.overall_status = 'upcoming';
    } else {
        v.overall_status = 'valid';
    }

    return v;
}

/**
 * Smart Excel Import processor for a single vehicle row:
 * - Inserts if vehicle is new (matched by unique gadi_num).
 * - If vehicle exists, compares document expiry dates (RC, Insurance, PUC):
 *     - If Excel date is strictly NEWER: updates the document date, amount, and provider.
 *     - If Excel date is OLDER or SAME: ignores/skips the date and preserves DB date.
 * - Updates general vehicle attributes if modified.
 * - If nothing was updated: marks as 'duplicate' / skipped without user prompting.
 */
async function processVehicleImportRow(db, row, dept_id) {
    const gadiNum = (row.gadi_num || '').toString().trim().toUpperCase();
    if (!gadiNum) {
        return { status: 'rejected', data: row, reason: 'Vehicle number (gadi_num) is required' };
    }

    // Lookup existing vehicle in SQLite by plate number
    const existing = db.prepare('SELECT * FROM vehicle WHERE UPPER(TRIM(gadi_num)) = ?').get(gadiNum);

    // CASE 1: Brand new vehicle -> Insert
    if (!existing) {
        const insertStmt = db.prepare(`
            INSERT INTO vehicle (
                mm_id, vehicle_type, gadi_name, gadi_num, fuel_type, seating_capacity,
                owner_name, nominee, aawak_type, rc_date, rc_exp_date, rc_amount,
                insurance_date, insurance_exp_date, insurance_amount, insurance_type, insurance_company,
                puc_date, puc_exp_date, puc_amount, created_at, updated_at
            ) VALUES (
                @mm_id, @vehicle_type, @gadi_name, @gadi_num, @fuel_type, @seating_capacity,
                @owner_name, @nominee, @aawak_type, @rc_date, @rc_exp_date, @rc_amount,
                @insurance_date, @insurance_exp_date, @insurance_amount, @insurance_type, @insurance_company,
                @puc_date, @puc_exp_date, @puc_amount, UNIXEPOCH(), UNIXEPOCH()
            )
        `);

        const newRow = {
            mm_id: row.mm_id || null,
            vehicle_type: row.vehicle_type || null,
            gadi_name: row.gadi_name || null,
            gadi_num: gadiNum,
            fuel_type: row.fuel_type || null,
            seating_capacity: row.seating_capacity ? Number(row.seating_capacity) : null,
            owner_name: row.owner_name || null,
            nominee: row.nominee || null,
            aawak_type: row.aawak_type || 'Kharid',
            rc_date: toUnixSeconds(row.rc_date),
            rc_exp_date: toUnixSeconds(row.rc_exp_date),
            rc_amount: row.rc_amount ? Number(row.rc_amount) : null,
            insurance_date: toUnixSeconds(row.insurance_date),
            insurance_exp_date: toUnixSeconds(row.insurance_exp_date),
            insurance_amount: row.insurance_amount ? Number(row.insurance_amount) : null,
            insurance_type: row.insurance_type || null,
            insurance_company: row.insurance_company || null,
            puc_date: toUnixSeconds(row.puc_date),
            puc_exp_date: toUnixSeconds(row.puc_exp_date),
            puc_amount: row.puc_amount ? Number(row.puc_amount) : null
        };

        const res = insertStmt.run(newRow);
        return { status: 'inserted', data: { ...row, _id: res.lastInsertRowid } };
    }

    // CASE 2: Vehicle exists -> Check for newer dates vs older dates
    let hasChanges = false;
    const updatedFields = [];
    const skippedFields = [];

    const updatePayload = {
        _id: existing._id,
        mm_id: row.mm_id || existing.mm_id,
        vehicle_type: row.vehicle_type || existing.vehicle_type,
        gadi_name: row.gadi_name || existing.gadi_name,
        gadi_num: existing.gadi_num,
        fuel_type: row.fuel_type || existing.fuel_type,
        seating_capacity: row.seating_capacity ? Number(row.seating_capacity) : existing.seating_capacity,
        owner_name: row.owner_name || existing.owner_name,
        nominee: row.nominee || existing.nominee,
        aawak_type: row.aawak_type || existing.aawak_type,
        rc_date: existing.rc_date,
        rc_exp_date: existing.rc_exp_date,
        rc_amount: existing.rc_amount,
        insurance_date: existing.insurance_date,
        insurance_exp_date: existing.insurance_exp_date,
        insurance_amount: existing.insurance_amount,
        insurance_type: existing.insurance_type,
        insurance_company: existing.insurance_company,
        puc_date: existing.puc_date,
        puc_exp_date: existing.puc_exp_date,
        puc_amount: existing.puc_amount
    };

    // --- RC Expiry Comparison ---
    const excelRcExp = toUnixSeconds(row.rc_exp_date);
    if (excelRcExp) {
        if (!existing.rc_exp_date || excelRcExp > existing.rc_exp_date) {
            updatePayload.rc_exp_date = excelRcExp;
            updatePayload.rc_date = toUnixSeconds(row.rc_date) || existing.rc_date;
            if (row.rc_amount !== undefined && row.rc_amount !== null) {
                updatePayload.rc_amount = Number(row.rc_amount);
            }
            hasChanges = true;
            updatedFields.push('RC Expiry Updated (Newer)');
        } else {
            skippedFields.push('RC Expiry Ignored (Older/Same)');
        }
    }

    // --- Insurance Expiry Comparison ---
    const excelInsExp = toUnixSeconds(row.insurance_exp_date);
    if (excelInsExp) {
        if (!existing.insurance_exp_date || excelInsExp > existing.insurance_exp_date) {
            updatePayload.insurance_exp_date = excelInsExp;
            updatePayload.insurance_date = toUnixSeconds(row.insurance_date) || existing.insurance_date;
            if (row.insurance_amount !== undefined && row.insurance_amount !== null) {
                updatePayload.insurance_amount = Number(row.insurance_amount);
            }
            if (row.insurance_type) updatePayload.insurance_type = row.insurance_type;
            if (row.insurance_company) updatePayload.insurance_company = row.insurance_company;
            hasChanges = true;
            updatedFields.push('Insurance Updated (Newer)');
        } else {
            skippedFields.push('Insurance Expiry Ignored (Older/Same)');
        }
    }

    // --- PUC Expiry Comparison ---
    const excelPucExp = toUnixSeconds(row.puc_exp_date);
    if (excelPucExp) {
        if (!existing.puc_exp_date || excelPucExp > existing.puc_exp_date) {
            updatePayload.puc_exp_date = excelPucExp;
            updatePayload.puc_date = toUnixSeconds(row.puc_date) || existing.puc_date;
            if (row.puc_amount !== undefined && row.puc_amount !== null) {
                updatePayload.puc_amount = Number(row.puc_amount);
            }
            hasChanges = true;
            updatedFields.push('PUC Expiry Updated (Newer)');
        } else {
            skippedFields.push('PUC Expiry Ignored (Older/Same)');
        }
    }

    // --- Check General Vehicle Information ---
    const generalFields = ['vehicle_type', 'gadi_name', 'fuel_type', 'owner_name', 'nominee', 'aawak_type'];
    for (const f of generalFields) {
        if (row[f] && String(row[f]).trim() !== String(existing[f] || '').trim()) {
            hasChanges = true;
            updatedFields.push(`${f} Updated`);
        }
    }

    // If no newer dates and no general changes -> Skip cleanly without prompting
    if (!hasChanges) {
        return {
            status: 'duplicate',
            data: { ...row, _id: existing._id },
            skipReason: skippedFields.join(' | ') || 'All vehicle records and dates are already up to date.'
        };
    }

    // Execute selective update
    const updateStmt = db.prepare(`
        UPDATE vehicle SET
            mm_id = @mm_id,
            vehicle_type = @vehicle_type,
            gadi_name = @gadi_name,
            fuel_type = @fuel_type,
            seating_capacity = @seating_capacity,
            owner_name = @owner_name,
            nominee = @nominee,
            aawak_type = @aawak_type,
            rc_date = @rc_date,
            rc_exp_date = @rc_exp_date,
            rc_amount = @rc_amount,
            insurance_date = @insurance_date,
            insurance_exp_date = @insurance_exp_date,
            insurance_amount = @insurance_amount,
            insurance_type = @insurance_type,
            insurance_company = @insurance_company,
            puc_date = @puc_date,
            puc_exp_date = @puc_exp_date,
            puc_amount = @puc_amount,
            updated_at = UNIXEPOCH()
        WHERE _id = @_id
    `);

    updateStmt.run(updatePayload);

    return {
        status: 'update',
        data: { ...row, _id: existing._id },
        updateSummary: updatedFields.join(', '),
        skippedSummary: skippedFields.join(', ')
    };
}

module.exports = {
    toUnixSeconds,
    enrichVehicleExpiry,
    processVehicleImportRow
};
