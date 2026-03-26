// src/ExcelImporter.js
// ─────────────────────────────────────────────────────────────
// Core import logic.
//   verify()    → resolve FKs, return correctionList
//   importRow() → validate + insert/update one row
//   applyAutoSet() → is_xl, dept_id etc.
// ─────────────────────────────────────────────────────────────

'use strict';

const RefMatcher = require('./RefMatcher');
const DateUtils  = require('./DateUtils');

class ExcelImporter {

    constructor(engine, dictionary) {
        this.engine     = engine;
        this.dictionary = dictionary;
    }

    // ─────────────────────────────────────────────────────────
    // VERIFY — resolve all FK refs, return correctionList
    // Called before import — frontend shows correction UI
    // ─────────────────────────────────────────────────────────

    async verify(rows, tableConfig) {
        const matcher = new RefMatcher(this.engine, this.dictionary);
        const { rows: resolved, correctionList } = await matcher.resolveAll(rows, tableConfig);
        return { rows: resolved, correctionList };
    }

    // ─────────────────────────────────────────────────────────
    // IMPORT ROW — validate + duplicate check + insert/update
    // Returns { status, data }
    //   status: 'inserted' | 'updated' | 'duplicate' | 'rejected'
    // ─────────────────────────────────────────────────────────

    async importRow(row, tableConfig, req = {}) {
        // 1. apply date conversions
        row = this._parseDates(row, tableConfig);

        // 2. apply boolean conversions
        row = this._parseBooleans(row, tableConfig);

        // 3. apply json conversions
        row = this._parseJson(row, tableConfig);

        // 4. apply autoSet — is_xl, dept_id etc.
        row = this._applyAutoSet(row, tableConfig, req);

        // 5. validate required fields
        const missing = this._validateRequired(row, tableConfig);
        if (missing.length) {
            return {
                status: 'rejected',
                data:   row,
                error:  `Missing required: ${missing.join(', ')}`,
            };
        }

        // 6. duplicate check
        if (tableConfig.duplicateOn?.length) {
            const existing = await this._checkDuplicate(row, tableConfig);
            if (existing.length) {
                const fullDup = await this._checkFullDuplicate(existing, row, tableConfig);
                if (fullDup.isExact) {
                    return { status: 'duplicate', data: row };
                }
                if (tableConfig.canUpdate) {
                    return { status: 'update', data: row, duplicate: existing };
                }
                return { status: 'duplicate', data: row };
            }
        }

        // 7. autoIncrement — voucher_no, bunch_no
        row = await this._applyAutoIncrement(row, tableConfig);

        // 8. insert
        try {
            const result = await this.engine.insert(tableConfig.table, row);
            return { status: 'inserted', data: row, newData: result };
        } catch (err) {
            return { status: 'rejected', data: row, error: err.message };
        }
    }

    // ─────────────────────────────────────────────────────────
    // UPDATE ROW
    // ─────────────────────────────────────────────────────────

    async updateRow(row, tableConfig, req = {}) {
        row = this._parseDates(row, tableConfig);
        row = this._parseBooleans(row, tableConfig);
        row = this._parseJson(row, tableConfig);
        row = this._applyAutoSet(row, tableConfig, req);

        try {
            if (!row._id && tableConfig.duplicateOn?.length) {
                const existing = await this._checkDuplicate(row, tableConfig);
                if (existing.length) row._id = existing[0]._id;
            }
            if (!row._id) return { status: 'rejected', data: row, error: 'No _id for update' };
            const result = await this.engine.updateById(tableConfig.table, row, row._id);
            return { status: 'updated', data: row, newData: result };
        } catch (err) {
            return { status: 'rejected', data: row, error: err.message };
        }
    }

    // ─────────────────────────────────────────────────────────
    // AUTO SET — is_xl=1, dept_id=(req)=>req.deptId etc.
    //
    // autoSet config:
    //   { is_xl: 1 }                    → literal value
    //   { dept_id: (req) => req.deptId } → function, called with req
    //
    // missing req value → null → schema default used by engine
    // ─────────────────────────────────────────────────────────

    _applyAutoSet(row, tableConfig, req) {
        const autoSet = tableConfig.autoSet ?? {};
        for (const [col, val] of Object.entries(autoSet)) {
            if (typeof val === 'function') {
                // function — call with req, fallback to null
                try {
                    row[col] = val(req) ?? null;
                } catch {
                    row[col] = null;
                }
            } else {
                // literal value
                row[col] = val;
            }
        }
        return row;
    }

    // ─────────────────────────────────────────────────────────
    // AUTO INCREMENT — voucher_no, bunch_no
    // ─────────────────────────────────────────────────────────

    async _applyAutoIncrement(row, tableConfig) {
        for (const col of (tableConfig.autoIncrement ?? [])) {
            if (!row[col]) {
                try {
                    const r = this.engine.prepare(
                        `SELECT MAX(${col}) as last FROM ${tableConfig.table}`
                    ).get();
                    row[col] = (r?.last ?? 0) + 1;
                } catch {
                    row[col] = 1;
                }
            }
        }
        return row;
    }

    // ─────────────────────────────────────────────────────────
    // PARSE DATES
    // ─────────────────────────────────────────────────────────

    _parseDates(row, tableConfig) {
        // explicit date columns from config
        for (const col of (tableConfig.dateColumns ?? [])) {
            if (row[col] !== undefined && row[col] !== null) {
                row[col] = DateUtils.parseISO(row[col]);
            }
        }
        // header config type = 'date' or 'unix_date'
        for (const h of tableConfig.headers) {
            if (!h.type) continue;
            const val = row[h.col_name];
            if (val === undefined || val === null) continue;
            if (h.type === 'date') {
                row[h.col_name] = DateUtils.parseISO(val);
            } else if (h.type === 'unix_date') {
                row[h.col_name] = DateUtils.parseUnix(val);
            }
        }
        return row;
    }

    // ─────────────────────────────────────────────────────────
    // PARSE BOOLEANS
    // ─────────────────────────────────────────────────────────

    _parseBooleans(row, tableConfig) {
        for (const col of (tableConfig.booleanColumns ?? [])) {
            if (row[col] !== undefined) {
                row[col] = row[col] ? 1 : 0;
            }
        }
        // schema boolean cols
        for (const h of tableConfig.headers) {
            if (h.type === 'boolean' && row[h.col_name] !== undefined) {
                const v = row[h.col_name];
                row[h.col_name] = (v === true || v === 1 || v === '1' ||
                    String(v).toLowerCase() === 'yes' ||
                    String(v).toLowerCase() === 'true') ? 1 : 0;
            }
        }
        return row;
    }

    // ─────────────────────────────────────────────────────────
    // PARSE JSON
    // ─────────────────────────────────────────────────────────

    _parseJson(row, tableConfig) {
        for (const col of (tableConfig.jsonColumns ?? [])) {
            if (row[col] !== undefined) {
                if (typeof row[col] !== 'string') {
                    row[col] = JSON.stringify(row[col] ?? null);
                }
            }
        }
        return row;
    }

    // ─────────────────────────────────────────────────────────
    // VALIDATE REQUIRED
    // ─────────────────────────────────────────────────────────

    _validateRequired(row, tableConfig) {
        const missing = [];
        for (const h of tableConfig.headers) {
            if (!h.not_null) continue;
            const val = h.ref_field ? row[h.ref_field] : row[h.col_name];
            if (val === null || val === undefined || val === '') {
                missing.push(h.name);
            }
        }
        return missing;
    }

    // ─────────────────────────────────────────────────────────
    // DUPLICATE CHECK
    // ─────────────────────────────────────────────────────────

    async _checkDuplicate(row, tableConfig) {
        const where = {};
        for (const col of tableConfig.duplicateOn) {
            if (row[col] !== undefined && row[col] !== null) {
                where[col] = row[col];
            }
        }
        if (!Object.keys(where).length) return [];
        try {
            return this.engine.getAll(tableConfig.table, where, { full: false });
        } catch {
            return [];
        }
    }

    // check if all fields are exactly same → true duplicate
    async _checkFullDuplicate(existing, row, tableConfig) {
        const checkCols = tableConfig.fullDuplicateOn?.length
            ? tableConfig.fullDuplicateOn
            : tableConfig.duplicateOn;

        for (const ex of existing) {
            let exact = true;
            for (const col of checkCols) {
                if (String(ex[col] ?? '') !== String(row[col] ?? '')) {
                    exact = false;
                    break;
                }
            }
            if (exact) return { isExact: true };
        }
        return { isExact: false };
    }
}

module.exports = ExcelImporter;
