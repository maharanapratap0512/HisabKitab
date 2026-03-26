// mysql.router.js
// ─────────────────────────────────────────────────────────────
// MySQL connection management + stored procedures + SQL import + migration
//
// CONNECTION LIFECYCLE:
//
//   STEP 1 — POST /databases
//      → raw mysql2 pool, NO database name
//      → SHOW DATABASES → return list + connectionId
//      → store: { pool, sutram: null, config, database: null }
//
//   STEP 2 — POST /procedures/:connectionId   (user selected a database)
//      → close old no-db pool
//      → open NEW mysql2 pool WITH the selected database
//      → if schemaRegistry has schema for this DB → init MySQLSutram
//      → fetch procedures + params via raw mysql2 (information_schema)
//      → store: { pool (with db), sutram|null, config, database }
//
//   STEP 3+ — /execute, /import, /migrate
//      → use stored pool (mysql2) — sutram available if schema was registered
//
//   DELETE /connection/:connectionId
//      → end pool + destroy sutram
//
// Routes:
//   POST   /test-connection
//   POST   /databases
//   POST   /procedures/:connectionId
//   POST   /execute/:connectionId
//   DELETE /connection/:connectionId
//   POST   /import/:connectionId         ← SSE streaming, full transaction + rollback
//   POST   /migrate/:connectionId
// ─────────────────────────────────────────────────────────────

'use strict';

const router = require('express').Router();
const multer = require('multer');
const mysql2 = require('mysql2/promise');
const { MySQLSutram } = require('sutramcore-mysql');

// multer — memory storage, 100 MB max
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
});

// ─────────────────────────────────────────────────────────────
// SCHEMA REGISTRY
// Register MySQLSutram schemas from app.js:
//   const mysqlRouter = require('./mysql.router');
//   mysqlRouter.registerSchema('myapp', require('./database/schema'));
// ─────────────────────────────────────────────────────────────

const schemaRegistry = new Map();

function registerSchema(database, schema) {
    schemaRegistry.set(database, schema);
    console.log(`[mysql.router] Schema registered for: ${database}`);
}

module.exports.registerSchema = registerSchema;

// ─────────────────────────────────────────────────────────────
// CONNECTION STORE
//
// activeConnections Map:
//   connectionId → {
//     pool:     mysql2 pool  (always present, no-db until /procedures called)
//     sutram:   MySQLSutram | null  (set after /procedures if schema registered)
//     config:   { host, user, password, port }
//     database: string | null  (null until /procedures called)
//   }
// ─────────────────────────────────────────────────────────────

const activeConnections = new Map();

// ── helpers ───────────────────────────────────────────────────

function ok(res, data, extra = {}) {
    res.json({ success: true, ...extra, data });
}

function fail(res, err, status = 500) {
    console.error('[mysql.router]', err?.message ?? err);
    res.status(status).json({ success: false, message: err?.message ?? String(err) });
}

function getConn(connectionId, res) {
    const conn = activeConnections.get(connectionId);
    if (!conn) {
        res.status(400).json({ success: false, message: 'Connection not found. Please reconnect.' });
        return null;
    }
    return conn;
}

async function closePool(pool) {
    try { if (pool) await pool.end(); } catch { }
}

async function closeSutram(sutram) {
    try { if (sutram?.pool) await sutram.pool.end(); } catch { }
}

// Create mysql2 pool — database is optional (omit for STEP 1)
function createPool(config, database = null) {
    return mysql2.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port,
        ...(database ? { database } : {}),
        waitForConnections: true,
        connectionLimit: 10,
        multipleStatements: false,
    });
}

// ─────────────────────────────────────────────────────────────
// TEST CONNECTION
// POST /test-connection
// body: { host, user, password, port? }
// ─────────────────────────────────────────────────────────────

router.post('/test-connection', async (req, res) => {
    const { host, user, password, port = 3306 } = req.body;

    if (!host || !user || !password) {
        return res.status(400).json({ success: false, message: 'host, user, password required' });
    }

    let pool;
    try {
        pool = createPool({ host, user, password, port: parseInt(port) });
        await pool.query('SELECT 1');
        await closePool(pool);
        ok(res, null, { message: 'Connection successful' });
    } catch (err) {
        await closePool(pool);
        fail(res, err);
    }
});

// ─────────────────────────────────────────────────────────────
// GET DATABASES
// POST /databases
// body: { host, user, password, port? }
//
// No database name available yet — use raw mysql2 pool only.
// MySQLAdapter and MySQLSutram both require a database name so
// we cannot use them here.
// ─────────────────────────────────────────────────────────────

router.post('/databases', async (req, res) => {
    const { host, user, password, port = 3306 } = req.body;

    if (!host || !user || !password) {
        return res.status(400).json({ success: false, message: 'host, user, password required' });
    }

    let pool;
    try {
        // Raw mysql2 — NO database (sutram/adapter need a db name, skip them here)
        pool = createPool({ host, user, password, port: parseInt(port) });

        const [rows] = await pool.query('SHOW DATABASES');

        const SYSTEM_DBS = new Set(['information_schema', 'mysql', 'performance_schema', 'sys']);
        const databases = rows
            .map(r => Object.values(r)[0])
            .filter(db => !SYSTEM_DBS.has(db));

        const connectionId = `${host}_${user}_${Date.now()}`;

        activeConnections.set(connectionId, {
            pool,           // mysql2 pool — no database yet
            sutram: null,
            config: { host, user, password, port: parseInt(port) },
            database: null,
        });

        console.log(`[mysql.router] Connected (no DB yet): ${connectionId}`);

        ok(res, databases, { connectionId });
    } catch (err) {
        await closePool(pool);
        fail(res, err);
    }
});

// ─────────────────────────────────────────────────────────────
// GET STORED PROCEDURES
// POST /procedures/:connectionId
// body: { database }
//
// User has now selected a database.
// → Close old no-db pool
// → Open NEW mysql2 pool WITH the selected database
// → If schema registered → init MySQLSutram
// → Fetch procedures + parameters from information_schema
// ─────────────────────────────────────────────────────────────

router.post('/procedures/:connectionId', async (req, res) => {
    const conn = getConn(req.params.connectionId, res);
    if (!conn) return;

    const { database } = req.body;
    if (!database) {
        return res.status(400).json({ success: false, message: 'database required' });
    }

    let newPool;
    let sutram = null;

    try {
        // Close whatever pool/sutram was stored before (no-db pool or previous db selection)
        await closePool(conn.pool);
        await closeSutram(conn.sutram);

        // Open fresh mysql2 pool WITH the selected database
        newPool = createPool(conn.config, database);
        console.log(`[mysql.router] Pool opened with database: ${database}`);

        // If a schema is registered for this database → init MySQLSutram
        const schema = schemaRegistry.get(database);
        if (schema) {
            sutram = await new MySQLSutram({
                ...conn.config,
                database,
                schema,
            }).connect();
            console.log(`[mysql.router] MySQLSutram ready for: ${database}`);
        } else {
            console.log(`[mysql.router] No schema for "${database}" — raw mysql2 pool only`);
        }

        // Fetch stored procedures list
        const [procs] = await newPool.query(`
            SELECT
                ROUTINE_NAME  AS procedure_name,
                ROUTINE_TYPE  AS type,
                CREATED       AS created_date,
                LAST_ALTERED  AS last_modified
            FROM information_schema.ROUTINES
            WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
            ORDER BY ROUTINE_NAME
        `, [database]);

        // Fetch all parameters in one query
        const [params] = await newPool.query(`
            SELECT
                SPECIFIC_NAME            AS procedure_name,
                PARAMETER_NAME,
                PARAMETER_MODE,
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                NUMERIC_PRECISION,
                NUMERIC_SCALE,
                ORDINAL_POSITION
            FROM information_schema.PARAMETERS
            WHERE SPECIFIC_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
            ORDER BY SPECIFIC_NAME, ORDINAL_POSITION
        `, [database]);

        // Group params by procedure
        const paramMap = {};
        for (const p of params) {
            if (!paramMap[p.procedure_name]) paramMap[p.procedure_name] = [];
            paramMap[p.procedure_name].push({
                name: p.PARAMETER_NAME,
                mode: p.PARAMETER_MODE,
                type: p.DATA_TYPE.toUpperCase(),
                length: p.CHARACTER_MAXIMUM_LENGTH,
                precision: p.NUMERIC_PRECISION,
                scale: p.NUMERIC_SCALE,
            });
        }

        const result = procs.map(proc => ({
            ...proc,
            parameters: paramMap[proc.procedure_name] ?? [],
        }));

        // Update stored connection — new pool + sutram + database
        activeConnections.set(req.params.connectionId, {
            ...conn,
            pool: newPool,
            sutram,
            database,
        });

        ok(res, result);
    } catch (err) {
        await closePool(newPool);
        await closeSutram(sutram);
        fail(res, err);
    }
});

// ─────────────────────────────────────────────────────────────
// EXECUTE STORED PROCEDURE
// POST /execute/:connectionId
// body: { procedureName, parameters: [] }
//
// Uses the stored mysql2 pool (database already set after /procedures)
// ─────────────────────────────────────────────────────────────

router.post('/execute/:connectionId', async (req, res) => {
    const conn = getConn(req.params.connectionId, res);
    if (!conn) return;

    const { procedureName, parameters = [] } = req.body;
    if (!procedureName) {
        return res.status(400).json({ success: false, message: 'procedureName required' });
    }

    try {
        const placeholders = parameters.map(() => '?').join(', ');
        const query = `CALL \`${procedureName}\`(${placeholders})`;

        console.log('[mysql.router] Executing:', query, parameters);

        const [rows, fields] = await conn.pool.execute(query, parameters);

        // mysql2 CALL returns array of result sets
        const results = Array.isArray(rows) ? rows : [rows];
        const allCols = Array.isArray(fields) ? fields : [fields ?? []];

        const namedResults = results.map((result, i) => {
            const fieldSet = allCols[i];
            return {
                tableName: `result_set_${i + 1}`,
                data: Array.isArray(result) ? result : [],
                columns: Array.isArray(fieldSet)
                    ? fieldSet.map(f => ({ name: f.name, type: f.type, length: f.length }))
                    : [],
                rowCount: Array.isArray(result) ? result.length : 0,
            };
        });

        res.json({ success: true, results: namedResults, totalResultSets: namedResults.length });
    } catch (err) {
        fail(res, err);
    }
});

// ─────────────────────────────────────────────────────────────
// CLOSE CONNECTION
// DELETE /connection/:connectionId
// ─────────────────────────────────────────────────────────────

router.delete('/connection/:connectionId', async (req, res) => {
    const conn = activeConnections.get(req.params.connectionId);
    if (conn) {
        await closePool(conn.pool);
        await closeSutram(conn.sutram);
        activeConnections.delete(req.params.connectionId);
    }
    ok(res, null, { message: 'Connection closed' });
});

// ─────────────────────────────────────────────────────────────
// PARSE SQL FILE INTO STATEMENTS
//
// Handles:
//   - DELIMITER changes  ($$, //, etc.) — needed for procedures/triggers
//   - /* block */ comments
//   - -- line comments
//   - # line comments
//   - Quoted strings (', ", `) with escape sequences
//   - Trailing statement without terminating delimiter
// ─────────────────────────────────────────────────────────────

async function wipeDatabase(connection, database, send) {
    if (!database) return;

    // 1. Fetch tables and views
    const [tables] = await connection.query(`
        SELECT TABLE_NAME as name, TABLE_TYPE as type 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = ?
    `, [database]);

    // 2. Fetch routines (procedures/functions)
    const [routines] = await connection.query(`
        SELECT ROUTINE_NAME as name, ROUTINE_TYPE as type
        FROM information_schema.ROUTINES
        WHERE ROUTINE_SCHEMA = ?
    `, [database]);

    const totalToDrop = tables.length + routines.length;
    if (totalToDrop === 0) return;

    if (send) send({ type: 'progress', message: `Wiping database "${database}" (${totalToDrop} objects)...` });

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    try {
        for (const t of tables) {
            if (t.type === 'VIEW') {
                await connection.query(`DROP VIEW IF EXISTS \`${t.name}\``);
            } else {
                await connection.query(`DROP TABLE IF EXISTS \`${t.name}\``);
            }
        }
        for (const r of routines) {
            await connection.query(`DROP ${r.type} IF EXISTS \`${r.name}\``);
        }
        if (send) send({ type: 'progress', message: `Database "${database}" wiped successfully.` });
    } finally {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    }
}

function parseSqlStatements(sql) {
    const statements = [];
    let current = '';
    let delimiter = ';';
    let i = 0;
    const len = sql.length;

    while (i < len) {
        const char = sql[i];

        // -- line comment
        if (char === '-' && sql[i + 1] === '-') {
            const end = sql.indexOf('\n', i);
            const endPos = end === -1 ? len : end;
            current += sql.slice(i, endPos);
            i = endPos;
            continue;
        }

        // # line comment
        if (char === '#') {
            const end = sql.indexOf('\n', i);
            const endPos = end === -1 ? len : end;
            current += sql.slice(i, endPos);
            i = endPos;
            continue;
        }

        // /* block comment */
        if (char === '/' && sql[i + 1] === '*') {
            const end = sql.indexOf('*/', i + 2);
            const endPos = end === -1 ? len : end + 2;
            current += sql.slice(i, endPos);
            i = endPos;
            continue;
        }

        // Quoted strings — skip content so delimiter inside strings is ignored
        if (char === "'" || char === '"' || char === '`') {
            const quote = char;
            current += quote;
            i++;
            while (i < len) {
                if (sql[i] === '\\') {
                    current += sql[i] + (sql[i + 1] ?? '');
                    i += 2;
                    continue;
                }
                if (sql[i] === quote) {
                    current += quote;
                    i++;
                    break;
                }
                current += sql[i];
                i++;
            }
            continue;
        }

        // DELIMITER change — e.g. DELIMITER $$
        // Check for 'D' or 'd' first to avoid startsWith overhead in every iteration
        if ((char === 'D' || char === 'd') && sql.slice(i, i + 9).toLowerCase() === 'delimiter') {
            const lineEnd = sql.indexOf('\n', i);
            const line = sql.slice(i, lineEnd === -1 ? len : lineEnd).trim();
            const parts = line.split(/\s+/);
            if (parts.length >= 2) delimiter = parts[1];
            i = lineEnd === -1 ? len : lineEnd + 1;
            continue;
        }

        // Current delimiter found — end of statement
        if (sql.startsWith(delimiter, i)) {
            const stmt = current.trim();
            if (stmt.length > 0) statements.push(stmt);
            current = '';
            i += delimiter.length;
            continue;
        }

        current += char;
        i++;
    }

    // Trailing statement without delimiter
    const last = current.trim();
    if (last.length > 0) statements.push(last);

    return statements.filter(s => s.replace(/\s+/g, '').length > 0);
}

// ─────────────────────────────────────────────────────────────
// IMPORT SQL FILE
// POST /import/:connectionId
// multipart/form-data: file (.sql), database? (optional override)
//
// Uses a dedicated single mysql2 connection (not pool) for the
// transaction so ROLLBACK covers every statement in the file.
//
// SSE events streamed to client:
//   { type: 'start',    total, message }
//   { type: 'progress', current, total, percent, statement, status: 'ok' }
//   { type: 'error',    current, total, percent, statement, message, sqlState, errorCode }
//   { type: 'done',     success, executed, total, message }
// ─────────────────────────────────────────────────────────────

router.post('/import/:connectionId', upload.single('file'), async (req, res) => {
    const conn = getConn(req.params.connectionId, res);
    if (!conn) return;

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No SQL file uploaded' });
    }

    let database = req.body.database || conn.database;

    // Handle case where database might be passed as an object stringification "[object Object]"
    // or if it's actually an object (unlikely here but for safety)
    if (typeof database === 'object' && database !== null) {
        database = database.name || database.Database || database.database;
    }

    if (!database) {
        return res.status(400).json({ success: false, message: 'No database selected. Please select a database first.' });
    }

    // ── SSE headers ───────────────────────────────────────────
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        if (typeof res.flush === 'function') res.flush();
    };

    send({ type: 'progress', message: 'Reading and parsing SQL file...' });

    // Single dedicated connection for the transaction
    let singleConn = null;

    try {
        // Single connection (not pool) — needed for transaction
        singleConn = await mysql2.createConnection({
            host: conn.config.host,
            user: conn.config.user,
            password: conn.config.password,
            port: conn.config.port,
            ...(database ? { database } : {}),
            multipleStatements: false,
        });

        if (database) {
            try {
                await singleConn.query(`USE \`${database}\``);
                console.log(`[mysql.router] Using database: ${database}`);
            } catch (useErr) {
                throw new Error(`Failed to select database "${database}": ${useErr.message}`);
            }
        }

        await singleConn.beginTransaction();
        // Disable foreign key checks globally for the transaction to allow dropping/recreating out of order
        await singleConn.query('SET FOREIGN_KEY_CHECKS = 0');
        send({ type: 'progress', message: `Transaction started (Database: ${database || 'none'})` });

        // ── WIPE DATABASE ─────────────────────────────────────
        // User requested to empty database before import
        try {
            await wipeDatabase(singleConn, database, send);
        } catch (wipeErr) {
            console.error('[mysql.router] Wipe failed:', wipeErr.message);
            // Non-fatal if database is already partially empty, but log it
            send({ type: 'progress', message: `Warning: Wipe incomplete: ${wipeErr.message}` });
        }

        const sqlContent = req.file.buffer.toString('utf8');
        const statements = parseSqlStatements(sqlContent);
        const total = statements.length;

        send({
            type: 'start',
            total,
            message: `Parsed ${total} statements from "${req.file.originalname}"`,
        });

        if (total === 0) {
            send({ type: 'done', success: true, executed: 0, total: 0, message: 'No statements found in file' });
            res.end();
            return;
        }

        let executed = 0;

        for (let idx = 0; idx < statements.length; idx++) {
            const stmt = statements[idx];

            // Skip pure-comment statements after stripping
            const stripped = stmt
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/--[^\n]*/g, '')
                .trim();
            if (!stripped) { executed++; continue; }

            // Safe auto-fix for common SQL typos (like 0L instead of 0)
            const cleanStmt = stmt.replace(/([=\s,])0L([\s,\n\r\);]|$)/gi, '$10$2');

            // Preview — first 80 chars, collapsed to single line
            const preview = cleanStmt.replace(/\s+/g, ' ').slice(0, 80) + (cleanStmt.length > 80 ? '…' : '');

            try {
                await singleConn.query(cleanStmt);
                executed++;

                send({
                    type: 'progress',
                    current: executed,
                    total,
                    percent: Math.round((executed / total) * 100),
                    statement: preview,
                    status: 'ok',
                });

            } catch (stmtErr) {
                // Any failure → rollback entire import
                try { await singleConn.rollback(); } catch { }
                try { await singleConn.end(); } catch { }

                send({
                    type: 'error',
                    current: executed,
                    total,
                    percent: Math.round((executed / total) * 100),
                    statement: preview,
                    message: stmtErr.message,
                    sqlState: stmtErr.sqlState,
                    errorCode: stmtErr.errno,
                });

                res.end();
                return;
            }
        }

        // All good → commit
        await singleConn.commit();
        await singleConn.end();

        send({
            type: 'done',
            success: true,
            executed,
            total,
            message: `Import complete — ${executed} statement${executed !== 1 ? 's' : ''} executed successfully`,
        });

    } catch (err) {
        try { if (singleConn) { await singleConn.rollback(); await singleConn.end(); } } catch { }
        send({ type: 'error', message: err.message || 'Import failed unexpectedly' });
    }

    res.end();
});

// ═════════════════════════════════════════════════════════════
// MIGRATE ROUTE
// POST /migrate/:connectionId
// body: { database, mappingRows: [...] }
//
// Uses MySQLSutram if schema was registered, else raw mysql2 pool
// ═════════════════════════════════════════════════════════════

router.post('/migrate/:connectionId', async (req, res) => {
    const conn = getConn(req.params.connectionId, res);
    if (!conn) return;

    const { database, mappingRows = [] } = req.body;

    if (!database) return res.status(400).json({ success: false, message: 'database required' });
    if (!mappingRows.length) return res.status(400).json({ success: false, message: 'mappingRows required' });

    try {
        const sutram = conn.sutram;

        // Helper — use sutram if available, else raw mysql2 pool
        const fetchAll = async (tableName, sql, params = []) => {
            if (sutram) {
                return await sutram.table(tableName).getAll({}, { full: false });
            }
            const [rows] = await conn.pool.query(sql, params);
            return rows;
        };

        const mapping = buildMapping(mappingRows);
        console.log(`[migrate] ${mapping.size} mapping entries loaded`);
        console.log(`[migrate] Using: ${sutram ? 'MySQLSutram' : 'raw mysql2 pool'}`);

        // ── AAWAK ─────────────────────────────────────────────
        const aawakRows = await fetchAll('aawak', `
            SELECT
                voucher_num, date, pkt_num, mm,
                category, subcategory, item,
                company, company_name,
                qty, unit, price, aawak_mm, jawak_mm,
                aawak_type, jawak_type, amount, description
            FROM aawak
        `);

        const aawak = mapRows(aawakRows, mapping, {
            category_col: 'category',
            subcategory_col: 'subcategory',
            item_col: 'item',
            extra_cols: ['date', 'qty', 'unit', 'mm', 'amount', 'condition', 'description'],
        });

        // ── JAWAK (uncomment when ready) ──────────────────────
        // const jawakRows = await fetchAll('jawak', 'SELECT ... FROM jawak');
        // const jawak = mapRows(jawakRows, mapping, { ... });

        // ── BACHAT (uncomment when ready) ─────────────────────
        // const bachatRows = await fetchAll('bachat', 'SELECT ... FROM bachat');
        // const bachat = mapRows(bachatRows, mapping, { ... });

        const allUnmatched = [
            ...aawak.unmatched.map(r => ({ _table: 'aawak', ...r })),
        ];

        console.log(`[migrate] aawak → mapped: ${aawak.mapped.length}  unmatched: ${aawak.unmatched.length}`);
        console.log(`[migrate] total unmatched: ${allUnmatched.length}`);

        ok(res, {
            aawak: { rows: aawak.mapped, count: aawak.mapped.length },
            unmatched: { rows: allUnmatched, count: allUnmatched.length },
        });

    } catch (err) {
        fail(res, err);
    }
});

// ═════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════

function buildMapping(mappingRows) {
    const mapping = new Map();
    for (const row of mappingRows) {
        const oldCat = clean(row.old_category);
        const oldSubCat = clean(row.old_subcategory);
        const oldItem = clean(row.old_item);
        const value = {
            category: row.new_category ?? null,
            item: row.new_item ?? null,
            subitem: row.new_subitem ?? null,
        };
        if (oldCat && oldSubCat && oldItem) mapping.set(`${oldCat}|${oldSubCat}|${oldItem}`, value);
        if (oldSubCat && oldItem) mapping.set(`|${oldSubCat}|${oldItem}`, value);
        if (oldCat && oldItem) mapping.set(`${oldCat}||${oldItem}`, value);
        if (oldItem) mapping.set(`||${oldItem}`, value);
    }
    return mapping;
}

function mapRows(rows, mapping, cfg) {
    const mapped = [];
    const unmatched = [];
    for (const row of rows) {
        const oldCat = clean(row[cfg.category_col]);
        const oldSubCat = clean(row[cfg.subcategory_col]);
        const oldItem = clean(row[cfg.item_col]);
        const tryKeys = [
            `${oldCat}|${oldSubCat}|${oldItem}`,
            `|${oldSubCat}|${oldItem}`,
            `${oldCat}||${oldItem}`,
            `||${oldItem}`,
        ];
        let found = null;
        for (const key of tryKeys) {
            if (mapping.has(key)) { found = mapping.get(key); break; }
        }
        if (found) {
            const newRow = { category: found.category, item: found.item, subitem: found.subitem };
            for (const col of (cfg.extra_cols ?? [])) newRow[col] = row[col] ?? null;
            mapped.push(newRow);
        } else {
            unmatched.push({
                ...row,
                _reason: `No mapping: "${row[cfg.category_col]}" | "${row[cfg.subcategory_col]}" | "${row[cfg.item_col]}"`,
            });
        }
    }
    return { mapped, unmatched };
}

// Unicode-safe string normalizer — critical for Hindi comparisons
function clean(val) {
    if (val === null || val === undefined) return '';
    return String(val)
        .trim()
        .normalize('NFC')
        .replace(/\u200B/g, '')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

module.exports = router;
module.exports.registerSchema = registerSchema;