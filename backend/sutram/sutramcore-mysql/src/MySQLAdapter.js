// src/MySQLAdapter.js
// ─────────────────────────────────────────────────────────────
// Wraps mysql2 connection pool.
// Provides same interface as better-sqlite3 but async.
//
// Usage:
//   const adapter = new MySQLAdapter({
//     host:     'localhost',
//     port:     3306,
//     user:     'root',
//     password: 'secret',
//     database: 'myapp',
//   });
//   await adapter.connect();
// ─────────────────────────────────────────────────────────────

'use strict';

class MySQLAdapter {

    constructor(config = {}) {
        if (!config.host)     throw new Error('[sutramcore-mysql] host required');
        if (!config.user)     throw new Error('[sutramcore-mysql] user required');
        if (!config.database) throw new Error('[sutramcore-mysql] database required');

        this._config = {
            host:              config.host,
            port:              config.port     ?? 3306,
            user:              config.user,
            password:          config.password ?? '',
            database:          config.database,
            waitForConnections: true,
            connectionLimit:   config.connectionLimit ?? 10,
            queueLimit:        0,
            // return JS Date objects for datetime columns
            dateStrings:       false,
            // always return bigints as numbers
            supportBigNumbers: true,
            bigNumberStrings:  false,
        };

        this.pool = null;
        this.dialect = 'mysql';
    }

    // ─────────────────────────────────────────────────────────
    // CONNECT — create pool + test connection
    // ─────────────────────────────────────────────────────────

    async connect() {
        const mysql = this._requireMySQL2();
        this.pool   = mysql.createPool(this._config);

        // test connection
        try {
            const conn = await this.pool.getConnection();
            conn.release();
            console.log(`[sutramcore-mysql] Connected: ${this._config.host}/${this._config.database}`);
        } catch (err) {
            throw new Error(`[sutramcore-mysql] Connection failed: ${err.message}`);
        }

        return this;
    }

    // ─────────────────────────────────────────────────────────
    // CORE METHODS
    // All return Promises — use await
    // ─────────────────────────────────────────────────────────

    // Execute INSERT / UPDATE / DELETE
    // Returns { insertId, affectedRows, changedRows }
    async run(sql, params = []) {
        const [result] = await this.pool.execute(
            this._toMySQLPlaceholders(sql),
            this._flattenParams(params)
        );
        return {
            insertId:     result.insertId,
            affectedRows: result.affectedRows,
            changedRows:  result.changedRows ?? 0,
            // compat with better-sqlite3 naming
            lastInsertRowid: result.insertId,
            changes:         result.affectedRows,
        };
    }

    // Execute SELECT — return single row or undefined
    async get(sql, params = []) {
        const [rows] = await this.pool.execute(
            this._toMySQLPlaceholders(sql),
            this._flattenParams(params)
        );
        return rows[0] ?? null;
    }

    // Execute SELECT — return all rows
    async all(sql, params = []) {
        const [rows] = await this.pool.execute(
            this._toMySQLPlaceholders(sql),
            this._flattenParams(params)
        );
        return rows;
    }

    // ─────────────────────────────────────────────────────────
    // TRANSACTION
    // fn receives a connection-scoped adapter for atomic ops
    // ─────────────────────────────────────────────────────────

    async transaction(fn) {
        const conn = await this.pool.getConnection();
        await conn.beginTransaction();

        // create a scoped adapter that uses this connection
        const scoped = new MySQLScopedAdapter(conn);

        try {
            const result = await fn(scoped);
            await conn.commit();
            return result;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    // Manual transaction control (for router-level use)
    async begin() {
        if (this._conn) throw new Error('[sutramcore-mysql] Transaction already active');
        this._conn = await this.pool.getConnection();
        await this._conn.beginTransaction();
    }

    async commit() {
        if (!this._conn) throw new Error('[sutramcore-mysql] No active transaction');
        await this._conn.commit();
        this._conn.release();
        this._conn = null;
    }

    async rollback() {
        if (!this._conn) return;
        await this._conn.rollback();
        this._conn.release();
        this._conn = null;
    }

    // ─────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────

    // better-sqlite3 uses ? for params — MySQL also uses ?
    // but sutramCore builds SQL with ? already — compatible
    _toMySQLPlaceholders(sql) {
        return sql;
    }

    // params come in as array or spread — normalize to flat array
    _flattenParams(params) {
        if (!params) return [];
        if (Array.isArray(params)) return params;
        return [params];
    }

    _requireMySQL2() {
        try {
            return require('mysql2/promise');
        } catch {
            throw new Error(
                '[sutramcore-mysql] mysql2 not installed.\n' +
                'Run: npm install mysql2'
            );
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('[sutramcore-mysql] Pool closed');
        }
    }
}

// ─────────────────────────────────────────────────────────────
// MySQLScopedAdapter — single connection adapter for transactions
// Used internally by transaction() to ensure atomicity
// ─────────────────────────────────────────────────────────────

class MySQLScopedAdapter {

    constructor(conn) {
        this._conn   = conn;
        this.dialect = 'mysql';
    }

    async run(sql, params = []) {
        const [result] = await this._conn.execute(sql, params);
        return {
            insertId:        result.insertId,
            affectedRows:    result.affectedRows,
            lastInsertRowid: result.insertId,
            changes:         result.affectedRows,
        };
    }

    async get(sql, params = []) {
        const [rows] = await this._conn.execute(sql, params);
        return rows[0] ?? null;
    }

    async all(sql, params = []) {
        const [rows] = await this._conn.execute(sql, params);
        return rows;
    }
}

module.exports = { MySQLAdapter, MySQLScopedAdapter };
