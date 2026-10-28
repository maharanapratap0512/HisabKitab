// src/ExcelRouter.js
// ─────────────────────────────────────────────────────────────
// Express router for sutramexcel.
// Mounted at /_sutram/excel/ by default.
//
// Routes:
//   GET  /tables                  → registered table list
//   GET  /config/:table           → derived header config
//   POST /verify/:table           → FK resolve → correctionList
//   POST /import/:table           → single row insert
//   POST /update/:table           → single row update
//   GET  /dictionary              → list all
//   GET  /dictionary/:type        → list by type
//   POST /dictionary              → add entry
//   PUT  /dictionary/:id          → update entry
//   DELETE /dictionary/:id        → soft delete
//   POST /error-report            → failed rows → Excel download
// ─────────────────────────────────────────────────────────────

'use strict';

function buildExcelRouter(sutramExcel) {
    let router;
    try {
        const express = require('express');
        const path = require('path');
        router = express.Router();
        router.use('/studio', express.static(path.join(__dirname, '../public'), {
            etag: false,
            maxAge: 0,
            setHeaders: (res) => {
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
            }
        }));
    } catch {
        throw new Error(
            '[sutramexcel] express is required.\n' +
            'Run: npm install express'
        );
    }

    const importer   = sutramExcel._importer;
    const dictionary = sutramExcel._dictionary;

    function ok(res, data, meta = {}) {
        res.json({ success: true, ...meta, result: data });
    }

    function fail(res, err, status = 400, extra = {}) {
        const msg = err?.message ?? String(err);
        console.error('[sutramexcel:router]', msg);
        res.status(status).json({ success: false, error: msg, ...extra });
    }

    function getConfig(tableName, res) {
        const cfg = sutramExcel._configs[tableName];
        if (!cfg) {
            res.status(403).json({
                success: false,
                error: `Table "${tableName}" is not registered for Excel import.`,
            });
            return null;
        }
        return cfg;
    }

    // ── GET /tables ───────────────────────────────────────────
    router.get('/tables', (req, res) => {
        try {
            const tables = Object.entries(sutramExcel._configs).map(([name, cfg]) => ({
                table:        name,
                display_name: cfg.display_name ?? name,
            }));
            ok(res, tables);
        } catch (e) { fail(res, e, 500); }
    });

    // ── GET /config/:table ────────────────────────────────────
    router.get('/config/:table', (req, res) => {
        const cfg = getConfig(req.params.table, res);
        if (!cfg) return;

        try {
            const enrichedHeaders = (cfg.headers || []).map(h => {
                if (h.ref_table) {
                    try {
                        let refCols = [];

                        // 1. Get config of reference table (e.g. state)
                        const refCfg = sutramExcel._configs?.[h.ref_table];
                        if (refCfg && Array.isArray(refCfg.headers) && refCfg.headers.length > 0) {
                            refCols = refCfg.headers
                                .filter(rh => rh.col_name !== 'verify' && !rh.col_name.includes('_by_dept_id'))
                                .map(rh => ({
                                    col_name: rh.col_name,
                                    name: rh.name || rh.col_name,
                                    type: rh.type || 'string',
                                    not_null: !!rh.not_null,
                                    pk: rh.col_name === '_id',
                                    ref_table: rh.ref_table || null,
                                    ref_as: rh.ref_as || null,
                                    ref_data: rh.ref_data || null
                                }));
                        }

                        // 2. Fallback to schema table if not in configs or empty
                        if (refCols.length === 0 && sutramExcel.engine) {
                            let refTbl = null;
                            try { refTbl = sutramExcel.engine.table(h.ref_table); } catch {}
                            if (!refTbl && sutramExcel.engine._sutram) {
                                try { refTbl = sutramExcel.engine._sutram.table(h.ref_table); } catch {}
                            }
                            if (refTbl && refTbl.columns) {
                                refCols = Object.entries(refTbl.columns)
                                    .filter(([col]) => !col.includes('_by_dept_id') && col !== 'verify')
                                    .map(([col, def]) => ({
                                        col_name: col,
                                        name: def.as || col,
                                        type: def.type || 'string',
                                        not_null: !!def.required,
                                        pk: !!def.pk || col === '_id',
                                        ref_table: def.ref ? def.ref.split('.')[0] : null
                                    }));
                            }
                        }

                        if (refCols.length > 0) {
                            const tblPrefix = (h.ref_table || '').toLowerCase() + '_';
                            const getWeight = (name) => {
                                const n = (name || '').toLowerCase();
                                if (n === `${tblPrefix}hin`) return 1;
                                if (n === `${tblPrefix}eng`) return 2;
                                if (n === `${tblPrefix}roman`) return 3;
                                if (n === `${tblPrefix}code` || n === `${tblPrefix}roll` || n === `${tblPrefix}full`) return 4;
                                if (n === `${tblPrefix}short` || n === `${tblPrefix}name`) return 5;
                                if (n.startsWith(tblPrefix)) return 6;
                                if (n.endsWith('_hin')) return 10;
                                if (n.endsWith('_eng')) return 11;
                                if (n === 'name' || n === 'title') return 12;
                                if (n === 'active') return 80;
                                if (n.endsWith('_id') || n === '_id') return 90;
                                return 20;
                            };
                            refCols.sort((a, b) => getWeight(a.col_name) - getWeight(b.col_name));
                            return { ...h, ref_columns: refCols };
                        }
                    } catch (err) {
                        console.warn(`[sutramexcel] Failed to load ref_columns for ${h.ref_table}:`, err.message);
                    }
                }
                return h;
            });

            // Also provide all schema columns for the current table
            let allSchemaCols = [];
            try {
                let tbl = null;
                try { tbl = sutramExcel.engine.table(req.params.table); } catch {}
                if (!tbl && sutramExcel.engine._sutram) {
                    try { tbl = sutramExcel.engine._sutram.table(req.params.table); } catch {}
                }
                if (tbl && tbl.columns) {
                    allSchemaCols = Object.entries(tbl.columns)
                        .filter(([col]) => !col.includes('_by_dept_id') && col !== 'verify')
                        .map(([col, def]) => ({
                            col_name: col,
                            name: col,
                            type: def.type || 'string',
                            not_null: !!def.required,
                            pk: !!def.pk || col === '_id',
                            ref: def.ref || null,
                            ref_table: def.ref ? def.ref.split('.')[0] : null,
                            ref_as: def.as || (def.ref ? def.ref.split('.')[0] : null)
                        }));
                }
            } catch {}

            ok(res, { ...cfg, headers: enrichedHeaders, all_schema_columns: allSchemaCols });
        } catch {
            ok(res, cfg);
        }
    });

    // ── GET /ref-data/:table ──────────────────────────────────
    // Returns all rows for reference table (e.g. state, category, unit)
    router.get('/ref-data/:table', (req, res) => {
        try {
            const tblName = req.params.table;
            let rows = [];
            try {
                rows = sutramExcel.engine.table(tblName).getAll({}, { full: false });
            } catch {
                if (sutramExcel.engine._sutram) {
                    rows = sutramExcel.engine._sutram.table(tblName).getAll({}, { full: false });
                }
            }
            ok(res, rows);
        } catch (e) { fail(res, e, 500); }
    });

    // ── GET /data/:table ──────────────────────────────────────
    // Query: ?_limit=100&_offset=0&_search=...&_sort=...&_order=ASC|DESC&_full=1
    // Supports: Direct SQLite search, lazy loading chunks, and full joins
    router.get('/data/:table', (req, res) => {
        try {
            const tblName = req.params.table;
            let tbl = null;
            try { tbl = sutramExcel.engine.table(tblName); } catch {}
            if (!tbl && sutramExcel.engine._sutram) {
                try { tbl = sutramExcel.engine._sutram.table(tblName); } catch {}
            }
            if (!tbl) {
                return fail(res, new Error(`Table "${tblName}" not found`), 404);
            }

            const limit = Math.min(1000, Math.max(1, parseInt(req.query._limit, 10) || 100));
            const offset = Math.max(0, parseInt(req.query._offset, 10) || 0);
            const search = req.query._search ? String(req.query._search).trim() : '';
            const full = req.query._full !== '0';
            const sort = req.query._sort ? String(req.query._sort).trim() : null;
            const order = req.query._order && req.query._order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

            let filterObj = {};
            if (req.query._filters) {
                try {
                    filterObj = typeof req.query._filters === 'string' ? JSON.parse(req.query._filters) : req.query._filters;
                } catch {}
            }

            let rows = [];
            let total = 0;

            const conditions = [];
            const params = [];

            if (search) {
                const searchCols = Object.entries(tbl.columns || {})
                    .filter(([col, def]) => {
                        const t = (def?.type || 'string').toLowerCase();
                        return ['string', 'text', 'varchar'].includes(t) ||
                            col.endsWith('_hin') || col.endsWith('_eng') ||
                            col.includes('code') || col.includes('name');
                    })
                    .map(([col]) => col);

                if (searchCols.length > 0) {
                    const sConds = searchCols.map(col => `\`${col}\` LIKE ?`);
                    conditions.push(`(${sConds.join(' OR ')})`);
                    searchCols.forEach(() => params.push(`%${search}%`));
                }
            }

            if (filterObj && typeof filterObj === 'object') {
                for (const [col, val] of Object.entries(filterObj)) {
                    if (!tbl.columns || !tbl.columns[col]) continue;
                    if (Array.isArray(val) && val.length > 0) {
                        const placeholders = val.map(() => '?').join(',');
                        conditions.push(`\`${col}\` IN (${placeholders})`);
                        val.forEach(v => params.push(v));
                    } else if (val !== undefined && val !== null && val !== '') {
                        conditions.push(`\`${col}\` = ?`);
                        params.push(val);
                    }
                }
            }

            if (tbl.db && conditions.length > 0) {
                const whereClause = `WHERE ${conditions.join(' AND ')}`;
                const countSql = `SELECT COUNT(*) AS total FROM \`${tblName}\` ${whereClause}`;
                const countRow = tbl.db.prepare(countSql).get(...params);
                total = countRow ? countRow.total : 0;

                let orderClause = '';
                if (sort && tbl.columns[sort]) {
                    orderClause = `ORDER BY \`${sort}\` ${order}`;
                }
                const dataSql = `SELECT * FROM \`${tblName}\` ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
                const dataRows = tbl.db.prepare(dataSql).all(...params, limit, offset);

                if (full && typeof tbl.getById === 'function') {
                    const pkCol = tbl.pk || '_id';
                    rows = dataRows.map(r => {
                        try { return tbl.getById(r[pkCol]) || r; } catch { return r; }
                    });
                } else {
                    rows = dataRows;
                }
            } else {
                const opts = { limit, offset, full };
                if (sort && tbl.columns && tbl.columns[sort]) {
                    opts.orderBy = `${sort} ${order}`;
                }
                rows = tbl.getAll({}, opts);
                total = tbl.count ? tbl.count() : rows.length;
            }

            ok(res, rows, { total, count: rows.length, offset, limit });
        } catch (e) {
            fail(res, e, 500);
        }
    });


    // ── POST /verify/:table ───────────────────────────────────
    // Body: { rows: [...] }
    // Returns: { rows, correctionList }
    router.post('/verify/:table', async (req, res) => {
        const cfg = getConfig(req.params.table, res);
        if (!cfg) return;
        try {
            const { rows = [] } = req.body;
            const result = await importer.verify(rows, cfg);
            ok(res, result);
        } catch (e) { fail(res, e); }
    });

    // ── POST /import/:table ───────────────────────────────────
    // Body: { row: {...} }
    // Returns: { status, data, newData? }
    router.post('/import/:table', async (req, res) => {
        const cfg = getConfig(req.params.table, res);
        if (!cfg) return;
        try {
            const { row = {} } = req.body;
            const result = await importer.importRow(row, cfg, req);
            if (result.status === 'rejected') {
                return fail(res, result.error || 'Import rejected', 400, { result });
            }
            ok(res, result);
        } catch (e) { fail(res, e); }
    });

    // ── POST /update/:table ───────────────────────────────────
    router.post('/update/:table', async (req, res) => {
        const cfg = getConfig(req.params.table, res);
        if (!cfg) return;
        try {
            const { row = {} } = req.body;
            const result = await importer.updateRow(row, cfg, req);
            if (result.status === 'rejected') {
                return fail(res, result.error || 'Update rejected', 400, { result });
            }
            ok(res, result);
        } catch (e) { fail(res, e); }
    });

    // ── DICTIONARY CRUD ───────────────────────────────────────

    // GET /dictionary
    router.get('/dictionary', (req, res) => {
        try {
            ok(res, dictionary.list());
        } catch (e) { fail(res, e, 500); }
    });

    // GET /dictionary/:type
    router.get('/dictionary/:type', (req, res) => {
        try {
            ok(res, dictionary.list(req.params.type));
        } catch (e) { fail(res, e, 500); }
    });

    // POST /dictionary
    router.post('/dictionary', (req, res) => {
        try {
            const { type, name, ref_id, ref_id2, extra_note } = req.body;
            if (!type || !name || ref_id === undefined) {
                return fail(res, 'type, name, ref_id required');
            }
            const id = dictionary.add({ type, name, ref_id, ref_id2, extra_note });
            ok(res, { _id: id });
        } catch (e) { fail(res, e); }
    });

    // PUT /dictionary/:id
    router.put('/dictionary/:id', (req, res) => {
        try {
            dictionary.update(Number(req.params.id), req.body);
            ok(res, { updated: true });
        } catch (e) { fail(res, e); }
    });

    // DELETE /dictionary/:id  (soft delete)
    router.delete('/dictionary/:id', (req, res) => {
        try {
            dictionary.delete(Number(req.params.id));
            ok(res, { deleted: true });
        } catch (e) { fail(res, e); }
    });

    // ── POST /error-report ────────────────────────────────────
    // Body: { table, rows: [...] }
    // Returns: Excel file download
    router.post('/error-report', async (req, res) => {
        try {
            const { table, rows = [] } = req.body;
            const cfg = table ? sutramExcel._configs[table] : null;

            const ExcelJS = require('exceljs');
            const wb      = new ExcelJS.Workbook();
            const ws      = wb.addWorksheet('Rejected Rows');

            if (!rows.length) {
                return fail(res, 'No rows to export');
            }

            // headers from first row + Error column
            const keys = Object.keys(rows[0]).filter(k => !k.startsWith('_'));
            keys.push('❌ Error');
            ws.addRow(keys);

            // style header row
            ws.getRow(1).font      = { bold: true, color: { argb: 'FFFFFFFF' } };
            ws.getRow(1).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
            ws.getRow(1).alignment = { horizontal: 'center' };

            // data rows
            rows.forEach((row, i) => {
                const vals = keys.map(k => k === '❌ Error' ? (row._error ?? '') : (row[k] ?? ''));
                const r    = ws.addRow(vals);
                r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2F2' } };
            });

            // auto column width
            ws.columns.forEach(col => {
                let max = 10;
                col.eachCell(cell => {
                    const len = String(cell.value ?? '').length;
                    if (len > max) max = len;
                });
                col.width = Math.min(max + 2, 40);
            });

            const buf = await wb.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="rejected_${table ?? 'import'}_${Date.now()}.xlsx"`);
            res.send(buf);

        } catch (e) { fail(res, e, 500); }
    });

    return router;
}

module.exports = buildExcelRouter;
