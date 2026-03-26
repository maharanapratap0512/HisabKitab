'use strict';

const router = require('express').Router();
const multer = require('multer');
const MysqlService = require('../services/mysql.service');

// multer — memory storage, 100 MB max
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
});

// ─────────────────────────────────────────────────────────────
// SCHEMA REGISTRY
// ─────────────────────────────────────────────────────────────

function registerSchema(database, schema) {
    MysqlService.registerSchema(database, schema);
}

// ── helpers ───────────────────────────────────────────────────

function ok(res, data, extra = {}) {
    res.json({ success: true, ...extra, data });
}

function fail(res, err, status = 500) {
    console.error('[mysql.router]', err?.message ?? err);
    res.status(status).json({ success: false, message: err?.message ?? String(err) });
}

// ─────────────────────────────────────────────────────────────
// TEST CONNECTION
// POST /test-connection
// ─────────────────────────────────────────────────────────────

router.post('/test-connection', async (req, res) => {
    try {
        const result = await MysqlService.testConnection(req.body);
        ok(res, null, { message: result.message });
    } catch (err) {
        fail(res, err);
    }
});

// ─────────────────────────────────────────────────────────────
// CONNECTION STATUS  — called on page load
// GET /connection-status
// Reads saved config, tries to find/create a live connection.
// Returns { connectionId, databases, config } all in one shot.
// ─────────────────────────────────────────────────────────────

router.get('/connection-status', async (req, res) => {
    try {
        const status = await MysqlService.getConnectionStatus();
        ok(res, status);
    } catch (err) {
        fail(res, err);
    }
});

// ─────────────────────────────────────────────────────────────
// GET DATABASES  — manual Connect button
// POST /databases
// ─────────────────────────────────────────────────────────────

router.post('/databases', async (req, res) => {
    try {
        const { connectionId, databases } = await MysqlService.getDatabases(req.body);
        ok(res, databases, { connectionId });
    } catch (err) {
        fail(res, err);
    }
});

// ─────────────────────────────────────────────────────────────
// CONFIG PERSISTENCE
// POST /save-config   — persist lastDatabase selection
// DELETE /clear-config — wipe saved config on disconnect
// ─────────────────────────────────────────────────────────────

router.post('/save-config', (req, res) => {
    const { lastDatabase, ...conn } = req.body;
    MysqlService.saveConfig(conn, lastDatabase || null);
    ok(res, null, { message: 'Config saved' });
});

router.delete('/clear-config', (req, res) => {
    MysqlService.clearConfig();
    ok(res, null, { message: 'Config cleared' });
});

// ─────────────────────────────────────────────────────────────
// GET STORED PROCEDURES
// POST /procedures/:connectionId
// ─────────────────────────────────────────────────────────────

router.post('/procedures/:connectionId', async (req, res) => {
    try {
        const result = await MysqlService.getProcedures(req.params.connectionId, req.body.database);
        ok(res, result);
    } catch (err) {
        fail(res, err);
    }
});

// ─────────────────────────────────────────────────────────────
// EXECUTE STORED PROCEDURE
// POST /execute/:connectionId
// ─────────────────────────────────────────────────────────────

router.post('/execute/:connectionId', async (req, res) => {
    try {
        const results = await MysqlService.executeProcedure(
            req.params.connectionId,
            req.body.procedureName,
            req.body.parameters || []
        );
        res.json({ success: true, results, totalResultSets: results.length });
    } catch (err) {
        fail(res, err);
    }
});

// ─────────────────────────────────────────────────────────────
// CLOSE CONNECTION
// DELETE /connection/:connectionId
// ─────────────────────────────────────────────────────────────

router.delete('/connection/:connectionId', async (req, res) => {
    try {
        await MysqlService.closeConnection(req.params.connectionId);
        ok(res, null, { message: 'Connection closed' });
    } catch (err) {
        fail(res, err);
    }
});

// ─────────────────────────────────────────────────────────────
// IMPORT SQL FILE (SSE)
// POST /import/:connectionId
// ─────────────────────────────────────────────────────────────

router.post('/import/:connectionId', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No SQL file uploaded' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    const onEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        if (typeof res.flush === 'function') res.flush();
    };

    try {
        await MysqlService.importSqlFile(
            req.params.connectionId,
            req.file.buffer,
            req.file.originalname,
            req.body.database,
            req.body.mysqlPath,
            onEvent
        );
        res.end();
    } catch (err) {
        onEvent({ type: 'error', message: err.message || 'Import failed unexpectedly' });
        res.end();
    }
});

// ─────────────────────────────────────────────────────────────
// MIGRATE ROUTE (SSE)
// POST /migrate/:connectionId
// ─────────────────────────────────────────────────────────────

router.post('/migrate/:connectionId', async (req, res) => {
    const { mappingRows = [] } = req.body;
    if (!mappingRows.length) return res.status(400).json({ success: false, message: 'mappingRows required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    const onEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        if (typeof res.flush === 'function') res.flush();
    };

    try {
        await MysqlService.migrateData(req.params.connectionId, mappingRows, onEvent);
        res.end();
    } catch (err) {
        if (res.headersSent) {
            onEvent({ type: 'error', message: err.message });
            res.end();
        } else {
            fail(res, err);
        }
    }
});

module.exports = router;
module.exports.registerSchema = registerSchema;