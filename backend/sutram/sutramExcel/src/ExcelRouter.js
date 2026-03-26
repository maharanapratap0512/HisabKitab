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
        router = express.Router();
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

    function fail(res, err, status = 400) {
        const msg = err?.message ?? String(err);
        console.error('[sutramexcel:router]', msg);
        res.status(status).json({ success: false, error: msg });
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
        ok(res, cfg);
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
