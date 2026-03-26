// services/mysql.service.js
'use strict';

const mysql2 = require('mysql2/promise');
const { MySQLSutram } = require('sutramcore-mysql');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const Utils = require('../utils');

class MysqlService {
    constructor() {
        /**
         * connectionId (UUID) → {
         *   pool:     mysql2 pool
         *   sutram:   MySQLSutram | null
         *   config:   { host, user, password, port, mysqlPath }
         *   database: string | null
         * }
         */
        this.activeConnections = new Map();
        this.schemaRegistry = new Map();
        this.configPath = path.join(os.tmpdir(), 'mysql_saved_config.json');
        this._instanceId = Math.random().toString(36).slice(2);
        console.log(`[MysqlService] instance created: ${this._instanceId}`);
    }

    // ── Schema Registry ───────────────────────────────────────────

    registerSchema(database, schema) {
        this.schemaRegistry.set(database, schema);
        console.log(`[MysqlService] Schema registered for: ${database}`);
    }

    getConnection(connectionId) {
        return this.activeConnections.get(connectionId);
    }

    // ── Config Persistence ────────────────────────────────────────

    saveConfig(config, lastDatabase = null) {
        try {
            const data = {
                host: config.host,
                user: config.user,
                password: config.password,
                port: config.port || '3306',
                mysqlPath: config.mysqlPath || '',
                lastDatabase,
            };
            fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            console.warn('[MysqlService] Could not save config:', err.message);
        }
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const raw = fs.readFileSync(this.configPath, 'utf8');
                return JSON.parse(raw);
            }
        } catch (err) {
            console.warn('[MysqlService] Could not load config:', err.message);
        }
        return null;
    }

    clearConfig() {
        try {
            if (fs.existsSync(this.configPath)) fs.unlinkSync(this.configPath);
        } catch (err) {
            console.warn('[MysqlService] Could not clear config:', err.message);
        }
    }

    // ── Internal Helpers ──────────────────────────────────────────

    _generateId() {
        return crypto.randomUUID();
    }

    _sameCredentials(a, b) {
        return a.host === b.host &&
            a.user === b.user &&
            a.password === b.password &&
            String(a.port) === String(b.port);
    }

    async _getDatabaseList(pool) {
        const SYSTEM_DBS = new Set(['information_schema', 'mysql', 'performance_schema', 'sys']);
        const [rows] = await pool.query('SHOW DATABASES');
        return rows.map(r => Object.values(r)[0]).filter(db => !SYSTEM_DBS.has(db));
    }

    async _closePool(pool) {
        try { if (pool) await pool.end(); } catch { }
    }

    async _closeSutram(sutram) {
        try { if (sutram?.pool) await sutram.pool.end(); } catch { }
    }

    _createPool(config, database = null) {
        return mysql2.createPool({
            host: config.host,
            user: config.user,
            password: config.password,
            port: parseInt(config.port || 3306),
            ...(database ? { database } : {}),
            waitForConnections: true,
            connectionLimit: 10,
            multipleStatements: false,
        });
    }

    _resolveMysqlBinary() {
        if (process.platform !== 'win32') return 'mysql';
        const candidates = [
            'C:\\xampp\\mysql\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin\\mysql.exe',
            'C:\\Program Files (x86)\\MySQL\\MySQL Server 5.7\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.1\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.2\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.3\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 9.0\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 9.1\\bin\\mysql.exe',
            'C:\\wamp64\\bin\\mysql\\mysql5.7.36\\bin\\mysql.exe',
            'C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysql.exe',
            'C:\\wamp\\bin\\mysql\\mysql5.7.36\\bin\\mysql.exe',
            'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysql.exe',
            'C:\\laragon\\bin\\mysql\\mysql-5.7.33-winx64\\bin\\mysql.exe',
            'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
        ];
        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) return candidate;
        }
        const mysqlRoot = 'C:\\Program Files\\MySQL';
        if (fs.existsSync(mysqlRoot)) {
            try {
                const dirs = fs.readdirSync(mysqlRoot);
                for (const dir of dirs) {
                    const binPath = path.join(mysqlRoot, dir, 'bin', 'mysql.exe');
                    if (fs.existsSync(binPath)) return binPath;
                }
            } catch { }
        }
        return 'mysql';
    }

    _buildMapping(mappingRows) {
        const mapping = new Map();
        for (const row of mappingRows) {
            const cat = Utils.cleanString(row.old_category);
            const sub = Utils.cleanString(row.old_subcategory);
            const sam = Utils.cleanString(row.old_samgry);
            const key = `${cat}|${sub}|${sam}`;
            mapping.set(key, {
                new_category: row.new_category,
                new_item: row.new_item,
                new_subitem: row.new_subitem
            });
        }
        return mapping;
    }

    _matchAndMap(row, mapping) {
        const catOpts = [row.category_name, row.category_name_eng].filter(v => v);
        const subOpts = [row.subcategory_name, row.subcategory_name_eng].filter(v => v);
        const itemOpts = [row.item_name, row.item_name_eng].filter(v => v);
        let found = null;
        outer: for (const c of catOpts) {
            for (const s of subOpts) {
                for (const i of itemOpts) {
                    const key = `${Utils.cleanString(c)}|${Utils.cleanString(s)}|${Utils.cleanString(i)}`;
                    if (mapping.has(key)) { found = mapping.get(key); break outer; }
                }
            }
        }
        if (found) {
            return { ...row, category: found.new_category, item: found.new_item, subitem: found.new_subitem };
        }
        return null;
    }

    // ── Public API ────────────────────────────────────────────────

    async testConnection(config) {
        let pool;
        try {
            pool = this._createPool(config);
            await pool.query('SELECT 1');
            await this._closePool(pool);
            return { success: true, message: 'Connection successful' };
        } catch (err) {
            await this._closePool(pool);
            throw err;
        }
    }

    /**
     * GET /connection-status  — called on every page load
     * 1. Load saved config from disk
     * 2. If no config → return null (show empty form)
     * 3. Scan Map for alive connection with same credentials → reuse it
     * 4. If none alive → create fresh pool from saved config
     * 5. Always return { connectionId, databases, config } or { connectionId: null, databases: null, config }
     */
    async getConnectionStatus() {
        const config = this.loadConfig();
        if (!config) return null;

        const conf = { ...config, port: parseInt(config.port || 3306) };

        // Scan for alive connection matching saved credentials
        for (const [id, conn] of this.activeConnections) {
            if (this._sameCredentials(conn.config, conf)) {
                try {
                    await conn.pool.query('SELECT 1');
                    const databases = await this._getDatabaseList(conn.pool);
                    console.log(`[getConnectionStatus] reusing alive connection → ${id}`);
                    return { connectionId: id, databases, config };
                } catch {
                    await this._closePool(conn.pool);
                    await this._closeSutram(conn.sutram);
                    this.activeConnections.delete(id);
                }
            }
        }

        // No alive connection — auto-connect from saved config
        let pool;
        try {
            pool = this._createPool(conf);
            await pool.query('SELECT 1');
            const databases = await this._getDatabaseList(pool);
            const connectionId = this._generateId();
            this.activeConnections.set(connectionId, {
                pool,
                sutram: null,
                config: conf,
                database: null,
                mysqlPath: config.mysqlPath || null,
            });
            console.log(`[getConnectionStatus] auto-connected → ${connectionId}`);
            return { connectionId, databases, config };
        } catch (err) {
            await this._closePool(pool);
            console.warn('[getConnectionStatus] auto-connect failed:', err.message);
            return { connectionId: null, databases: null, config };
        }
    }

    /**
     * POST /databases  — manual Connect button
     * Reuses existing alive connection with same credentials, else creates fresh.
     */
    async getDatabases(config) {
        const conf = { ...config, port: parseInt(config.port || 3306) };

        for (const [id, conn] of this.activeConnections) {
            if (this._sameCredentials(conn.config, conf)) {
                try {
                    await conn.pool.query('SELECT 1');
                    const databases = await this._getDatabaseList(conn.pool);
                    this.saveConfig(config, config.lastDatabase || null);
                    console.log(`[getDatabases] reusing connection → ${id}`);
                    return { connectionId: id, databases };
                } catch {
                    await this._closePool(conn.pool);
                    await this._closeSutram(conn.sutram);
                    this.activeConnections.delete(id);
                }
            }
        }

        let pool;
        try {
            pool = this._createPool(conf);
            const databases = await this._getDatabaseList(pool);
            const connectionId = this._generateId();
            this.activeConnections.set(connectionId, {
                pool,
                sutram: null,
                config: conf,
                database: null,
                mysqlPath: config.mysqlPath || null,
            });
            this.saveConfig(config, config.lastDatabase || null);
            console.log(`[getDatabases] new connection → ${connectionId}`);
            return { connectionId, databases };
        } catch (err) {
            await this._closePool(pool);
            throw err;
        }
    }

    /**
     * POST /procedures/:connectionId  — database selected
     * Closes old pool+sutram, creates new ones scoped to selected database.
     * Keeps the SAME connectionId — just updates the Map entry.
     */
    async getProcedures(connectionId, database) {
        const conn = this.activeConnections.get(connectionId);
        if (!conn) throw new Error('Connection not found');

        await this._closePool(conn.pool);
        await this._closeSutram(conn.sutram);

        let newPool, sutram = null;
        try {
            newPool = this._createPool(conn.config, database);

            const schema = this.schemaRegistry.get(database);
            if (schema) {
                try {
                    sutram = await new MySQLSutram({ ...conn.config, database, schema }).connect();
                } catch (err) {
                    console.warn(`[getProcedures] Sutram failed for ${database}:`, err.message);
                    sutram = null;
                }
            }

            const [procs] = await newPool.query(`
                SELECT ROUTINE_NAME AS procedure_name, ROUTINE_TYPE AS type,
                       CREATED AS created_date, LAST_ALTERED AS last_modified
                FROM information_schema.ROUTINES
                WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
                ORDER BY ROUTINE_NAME
            `, [database]);

            const [params] = await newPool.query(`
                SELECT SPECIFIC_NAME AS procedure_name, PARAMETER_NAME, PARAMETER_MODE,
                       DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, ORDINAL_POSITION
                FROM information_schema.PARAMETERS
                WHERE SPECIFIC_SCHEMA = ? AND ROUTINE_TYPE = 'PROCEDURE'
                ORDER BY SPECIFIC_NAME, ORDINAL_POSITION
            `, [database]);

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
                parameters: paramMap[proc.procedure_name] ?? []
            }));

            // Update same entry — same connectionId, new pool+sutram+database
            this.activeConnections.set(connectionId, { ...conn, pool: newPool, sutram, database });
            this.saveConfig(conn.config, database);
            console.log(`[getProcedures] updated ${connectionId} → database: ${database}, map size: ${this.activeConnections.size}`);

            return result;
        } catch (err) {
            await this._closePool(newPool);
            await this._closeSutram(sutram);
            // Remove broken entry — connectionId is now invalid
            this.activeConnections.delete(connectionId);
            throw err;
        }
    }

    async executeProcedure(connectionId, procedureName, parameters) {
        console.log(`[executeProcedure] id: ${connectionId}, map size: ${this.activeConnections.size}`);
        const conn = this.activeConnections.get(connectionId);
        if (!conn) throw new Error('Connection not found');

        const placeholders = parameters.map(() => '?').join(', ');
        const query = `CALL \`${procedureName}\`(${placeholders})`;
        const [rows, fields] = await conn.pool.execute(query, parameters);

        const results = Array.isArray(rows) ? rows : [rows];
        const allCols = Array.isArray(fields) ? fields : [fields ?? []];

        return results.map((result, i) => ({
            tableName: `result_set_${i + 1}`,
            data: Array.isArray(result) ? result : [],
            columns: Array.isArray(allCols[i])
                ? allCols[i].map(f => ({ name: f.name, type: f.type, length: f.length }))
                : [],
            rowCount: Array.isArray(result) ? result.length : 0,
        }));
    }

    async closeConnection(connectionId) {
        const conn = this.activeConnections.get(connectionId);
        if (conn) {
            await this._closePool(conn.pool);
            await this._closeSutram(conn.sutram);
            this.activeConnections.delete(connectionId);
            console.log(`[MysqlService] connection closed → ${connectionId}`);
        }
    }

    async importSqlFile(connectionId, buffer, originalName, targetDatabase, mysqlPathOverride, onEvent) {
        const conn = this.activeConnections.get(connectionId);
        if (!conn) throw new Error('Connection not found');

        const database = targetDatabase || conn.database || 'testMysql';
        const tmpFile = path.join(os.tmpdir(), `mysql_import_${Date.now()}_${Math.random().toString(36).slice(2)}.sql`);

        try {
            const sqlContent = buffer.toString('utf8');
            const fixedContent = sqlContent.replace(/([=\s,])0L([\s,\n\r\);]|$)/gi, '$10$2');
            fs.writeFileSync(tmpFile, fixedContent);

            if (database) {
                await conn.pool.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            }

            const mysqlBin = mysqlPathOverride || conn.mysqlPath || this._resolveMysqlBinary();
            const args = [
                `-h${conn.config.host}`,
                `-P${conn.config.port}`,
                `-u${conn.config.user}`,
                `-p${conn.config.password}`,
                `--database=${database}`,
                '--verbose',
                '--default-character-set=utf8mb4'
            ];

            const mysqlProc = spawn(mysqlBin, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: false,
                cwd: path.dirname(mysqlBin)
            });

            mysqlProc.stdin.on('error', (err) => console.error('[MysqlService] stdin error:', err.message));

            const fileStream = fs.createReadStream(tmpFile);
            fileStream.pipe(mysqlProc.stdin);
            fileStream.on('error', (err) => onEvent({ type: 'progress', message: `File read error: ${err.message}` }));

            let stderrBuf = '';
            mysqlProc.stderr.on('data', (chunk) => {
                stderrBuf += chunk.toString();
                const lines = stderrBuf.split('\n');
                stderrBuf = lines.pop();
                for (const line of lines) {
                    if (line.trim()) onEvent({ type: 'progress', message: line.trim() });
                }
            });

            mysqlProc.stdout.resume();

            return new Promise((resolve) => {
                mysqlProc.on('close', (code) => {
                    if (stderrBuf.trim()) onEvent({ type: 'progress', message: stderrBuf.trim() });
                    try { fs.unlinkSync(tmpFile); } catch { }
                    if (code === 0) {
                        onEvent({ type: 'done', success: true, message: `Import complete — "${originalName}" imported into "${database}"` });
                        resolve();
                    } else {
                        onEvent({ type: 'error', message: `mysql exited with code ${code}. Check the log above for details.` });
                        resolve();
                    }
                });
                mysqlProc.on('error', (err) => {
                    try { fs.unlinkSync(tmpFile); } catch { }
                    onEvent({ type: 'error', message: err.code === 'ENOENT' ? 'mysql CLI not found.' : err.message });
                    resolve();
                });
            });
        } catch (err) {
            try { fs.unlinkSync(tmpFile); } catch { }
            throw err;
        }
    }

    async migrateData(connectionId, mappingRows, onEvent) {
        const conn = this.activeConnections.get(connectionId);
        if (!conn) throw new Error('Connection not found');

        const [countResult] = await conn.pool.query('SELECT COUNT(*) as total FROM stockregister');
        const totalRows = countResult[0].total;
        const mapping = this._buildMapping(mappingRows);

        onEvent({ type: 'start', total: totalRows, message: `Streaming migration for ${totalRows} rows...` });

        const connection = await conn.pool.getConnection();
        const sql = `
    SELECT
        sr.entry_type,
        sr.date,
        sr.voucher_no,
        sr.voucher_num,
        sr.sl_no,

        /* Location */
        ml_main.mm_name_hin  AS mm_name_hin,
        ml_main.mm_name      AS mm_name_eng,

        /* Item */
        it.item_name         AS item_name,
        it.item_name_eng     AS item_name_eng,
        it.unit,

        /* Category */
        ct.category_name     AS category_name,
        ct.category_name_eng AS category_name_eng,

        /* Subcategory */
        sct.subcategory_name     AS subcategory_name,
        sct.subcategory_name_eng AS subcategory_name_eng,

        /* Quantity & Price */
        sr.quantity,
        sr.qty_remaining,
        sr.price,
        CASE WHEN sr.price > 0 THEN (sr.price * sr.quantity) END AS amount,

        /* Aawak specific */
        sr.aawak_source,
        sr.aawak_description,

        /* Jawak specific */
        sr.jawak_detail      AS jawak_detail,
        pb.name_hin          AS sewadhari_name,

        /* Combined aawak/jawak type */
        CASE
            WHEN sr.entry_type = 'aawak' THEN at.aawak_type_hin
            WHEN sr.entry_type = 'jawak' THEN jt.jawak_type_hin
            ELSE NULL
        END AS aj_type_hin,
        CASE
            WHEN sr.entry_type = 'aawak' THEN at.aawak_type_eng
            WHEN sr.entry_type = 'jawak' THEN jt.jawak_type_eng
            ELSE NULL
        END AS aj_type_eng,

        /* Combined aawak/jawak counterpart location */
        CASE
            WHEN sr.entry_type = 'aawak' THEN ml_aawak.mm_name_hin
            WHEN sr.entry_type = 'jawak' THEN ml_jawak.mm_name_hin
            ELSE NULL
        END AS aj_mm_name_hin,
        CASE
            WHEN sr.entry_type = 'aawak' THEN ml_aawak.mm_name
            WHEN sr.entry_type = 'jawak' THEN ml_jawak.mm_name
            ELSE NULL
        END AS aj_mm_name_eng,

        /* Shared */
        sr.pkt_num,
        sr.company_name,

        /* Flags */
        sr.bt_active,
        sr.bt_highlight

    FROM stockregister sr
    LEFT JOIN item it          ON sr.item_id            = it.item_id
    LEFT JOIN category ct      ON it.item_category_id   = ct.category_id
    LEFT JOIN subcategory sct  ON it.item_subcategory_id = sct.subcategory_id
    LEFT JOIN aawak_type at    ON sr.aawak_type          = at.aawak_type_id
    LEFT JOIN jawak_type jt    ON sr.jawak_type_id       = jt.jawak_type_id
    LEFT JOIN mm_list ml_main  ON sr.mm_id               = ml_main.mm_id
    LEFT JOIN mm_list ml_aawak ON sr.aawak_mm_id         = ml_aawak.mm_id
    LEFT JOIN mm_list ml_jawak ON sr.jawak_mm_id         = ml_jawak.mm_id
    LEFT JOIN pbks pb          ON sr.sewadhari_id        = pb.pbks_id
`;

        let processedRows = 0, mappedCount = 0, unmatchedCount = 0;
        const batchSize = 1000;
        let currentBatchMapped = [], currentBatchUnmatched = [];

        const stream = connection.connection.query(sql).stream();

        return new Promise((resolve) => {
            stream.on('data', (row) => {
                const mappedRow = this._matchAndMap(row, mapping);
                processedRows++;
                if (mappedRow) { currentBatchMapped.push(mappedRow); mappedCount++; }
                else { row._unmatched = true; currentBatchUnmatched.push(row); unmatchedCount++; }
                if (processedRows % batchSize === 0) {
                    onEvent({
                        type: 'progress',
                        mapped: currentBatchMapped,
                        unmatched: currentBatchUnmatched,
                        processed: processedRows,
                        total: totalRows,
                        progress: Math.round((processedRows / totalRows) * 100)
                    });
                    currentBatchMapped = [];
                    currentBatchUnmatched = [];
                }
            });
            stream.on('end', () => {
                if (currentBatchMapped.length > 0 || currentBatchUnmatched.length > 0) {
                    onEvent({
                        type: 'progress',
                        mapped: currentBatchMapped,
                        unmatched: currentBatchUnmatched,
                        processed: processedRows,
                        total: totalRows,
                        progress: 100
                    });
                }
                onEvent({
                    type: 'done',
                    message: `Migration complete! Processed: ${processedRows}, Mapped: ${mappedCount}, Unmatched: ${unmatchedCount}`,
                    stats: { total: processedRows, mapped: mappedCount, unmatched: unmatchedCount }
                });
                connection.release();
                resolve();
            });
            stream.on('error', (err) => {
                onEvent({ type: 'error', message: err.message });
                connection.release();
                resolve();
            });
        });
    }
}

module.exports = new MysqlService();