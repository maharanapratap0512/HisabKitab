// src/RouterBuilder.js
// ─────────────────────────────────────────────────────────────
// Builds and returns an Express router for sutramEngine.
//
// Mount in your app:
//   app.use('/api', engine.router());
//
// Routes generated:
//
//   ── Engine config (_sutram prefix) ──────────────────────────
//   GET  /_sutram/menu               → sidebar menu + reports
//   GET  /_sutram/schema/:table      → form + table builder config
//   POST /_sutram/reports/:name/run  → execute named CTE report
//
//   ── CRUD (one route per table in schema) ─────────────────────
//   GET    /:table          → getAll (query params + pagination)
//   GET    /:table/:id      → getById
//   POST   /:table          → insert (trigger-aware)
//   PUT    /:table/:id      → updateById (trigger-aware)
//   DELETE /:table/:id      → deleteById (trigger-aware)
//   POST   /:table/query    → getAll with raw WHERE body
// ─────────────────────────────────────────────────────────────

'use strict';

// Reserved _sutram prefix routes — must be registered BEFORE /:table
const RESERVED = ['_sutram'];

function buildRouter(engine) {
    let router;
    try {
        const express = require('express');
        router = express.Router();
    } catch {
        throw new Error(
            '[sutramEngine] engine.router() requires express to be installed.\n' +
            'Run: npm install express'
        );
    }

    // ─────────────────────────────────────────────────────────
    // ── HELPER — send JSON response ──────────────────────────
    // ─────────────────────────────────────────────────────────

    function ok(res, data, meta = {}) {
        res.json({ success: true, ...meta, result: data });
    }

    function fail(res, err, status = 400) {
        const message = err?.message ?? String(err);
        console.error('[sutramEngine:router]', message);
        res.status(status).json({ success: false, error: message });
    }

    // ─────────────────────────────────────────────────────────
    // ── HELPER — parse query params to where + options ────────
    // ─────────────────────────────────────────────────────────
    // Reserved params start with _ : _limit, _page, _order, _full
    // Everything else → where object

    function parseQuery(query) {
        const where   = {};
        let limit     = null;
        let offset    = null;
        let orderBy   = null;
        let full      = true;

        const PAGE_DEFAULT = 50;

        for (const [key, val] of Object.entries(query)) {
            if (key === '_limit')  { limit   = parseInt(val) || PAGE_DEFAULT; continue; }
            if (key === '_page')   {
                const page = parseInt(val) || 1;
                limit = limit ?? PAGE_DEFAULT;
                offset = (page - 1) * limit;
                continue;
            }
            if (key === '_order')  { orderBy = val; continue; }
            if (key === '_full')   { full    = val !== 'false' && val !== '0'; continue; }
            // everything else is a where condition
            // try to coerce numbers
            where[key] = isNaN(val) || val === '' ? val : Number(val);
        }

        // recalculate offset if _page came before _limit
        if (offset !== null && limit !== null) {
            const page = Math.floor(offset / PAGE_DEFAULT) + 1;
            offset = (page - 1) * limit;
        }

        return { where, limit, offset, orderBy, full };
    }

    // ─────────────────────────────────────────────────────────
    // ── HELPER — check table is in schema ────────────────────
    // ─────────────────────────────────────────────────────────

    // returns table instance or calls next() to pass to next middleware
    // this way unknown table names don't block other mounted routes
    function getTable(tableName, res, next) {
        try {
            return engine.table(tableName);
        } catch (e) {
            next();   // table not in schema — let next middleware handle it
            return null;
        }
    }

    // ═════════════════════════════════════════════════════════
    // ── _SUTRAM ROUTES — engine config ────────────────────────
    // ═════════════════════════════════════════════════════════

    // GET /_sutram/menu — sidebar menu + reports list
    router.get('/_sutram/menu', (req, res) => {
        try {
            // direct mode — ui manager reads sys_ tables
            // if sys_table_ui empty, falls back to sys_table data
            const menu = engine.ui.getMenu();
            ok(res, menu);
        } catch (e) {
            fail(res, e, 500);
        }
    });

    // GET /_sutram/schema/:table — full column config for frontend
    router.get('/_sutram/schema/:table', (req, res) => {
        try {
            const schema = engine.ui.getTableSchema(req.params.table);
            ok(res, schema);
        } catch (e) {
            fail(res, e, 404);
        }
    });

    // POST /_sutram/reports/:name/run — execute named CTE report
    router.post('/_sutram/reports/:name/run', (req, res) => {
        try {
            const rows = engine.report.run(req.params.name, req.body ?? {});
            ok(res, rows, { report: req.params.name, count: rows.length });
        } catch (e) {
            fail(res, e, 400);
        }
    });

    // ═════════════════════════════════════════════════════════
    // ── CRUD ROUTES ───────────────────────────────────────────
    // ═════════════════════════════════════════════════════════

    // GET /:table — getAll with query params
    // ?active=1&dept_id=2&_limit=20&_page=1&_order=name+ASC
    router.get('/:table', (req, res, next) => {
        if (RESERVED.includes(req.params.table)) return next();
        const tbl = getTable(req.params.table, res, next);
        if (!tbl) return;

        try {
            const { where, limit, offset, orderBy, full } = parseQuery(req.query);
            const opts = { full };
            if (orderBy) opts.orderBy = orderBy;
            if (limit)   opts.limit   = limit;
            if (offset)  opts.offset  = offset;

            const result = tbl.getAll(where, opts);
            const total  = Object.keys(where).length
                ? tbl.count(where)
                : tbl.count();

            ok(res, result, { total, count: result.length });
        } catch (e) {
            fail(res, e);
        }
    });

    // GET /:table/:id — getById
    router.get('/:table/:id', (req, res, next) => {
        const tbl = getTable(req.params.table, res, next);
        if (!tbl) return;

        try {
            const row = tbl.getById(Number(req.params.id));
            if (!row) return fail(res, `Record ${req.params.id} not found`, 404);
            ok(res, row);
        } catch (e) {
            fail(res, e);
        }
    });

    // POST /:table — insert (trigger-aware)
    router.post('/:table', (req, res, next) => {
        if (RESERVED.includes(req.params.table)) return next();
        try {
            const row = engine.insert(req.params.table, req.body);
            ok(res, row);
        } catch (e) {
            fail(res, e);
        }
    });

    // POST /:table/query — getAll with raw WHERE body
    // Body: { where: "price > 100", limit: 50, page: 2, orderBy: "price DESC", full: true }
    router.post('/:table/query', (req, res, next) => {
        const tbl = getTable(req.params.table, res, next);
        if (!tbl) return;

        try {
            const { where = {}, limit = null, page = 1, orderBy = null, full = true } = req.body ?? {};
            const offset = limit ? (page - 1) * limit : null;
            const opts   = { full };
            if (orderBy) opts.orderBy = orderBy;
            if (limit)   opts.limit   = limit;
            if (offset)  opts.offset  = offset;

            const result = tbl.getAll(where, opts);
            const total  = tbl.count(where);
            ok(res, result, { total, count: result.length });
        } catch (e) {
            fail(res, e);
        }
    });

    // PUT /:table/:id — updateById (trigger-aware)
    router.put('/:table/:id', (req, res) => {
        try {
            const row = engine.updateById(req.params.table, req.body, Number(req.params.id));
            ok(res, row);
        } catch (e) {
            fail(res, e);
        }
    });

    // DELETE /:table/:id — deleteById (trigger-aware)
    router.delete('/:table/:id', (req, res) => {
        try {
            const changes = engine.deleteById(req.params.table, Number(req.params.id));
            ok(res, { deleted: changes });
        } catch (e) {
            fail(res, e);
        }
    });

    return router;
}

module.exports = buildRouter;
