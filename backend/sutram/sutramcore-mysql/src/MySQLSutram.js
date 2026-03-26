// src/MySQLSutram.js
// ─────────────────────────────────────────────────────────────
// Async Sutram class for MySQL — mirrors sutramCore's Sutram API
// but all methods return Promises.
//
// Usage:
//   const { MySQLSutram } = require('sutramcore-mysql');
//
//   const db = new MySQLSutram({
//     host: 'localhost', user: 'root',
//     password: 'secret', database: 'myapp',
//     schema: require('./schema'),
//   });
//   await db.connect();
//
//   const row = await db.table('product').getById(1);
// ─────────────────────────────────────────────────────────────

'use strict';

const { MySQLAdapter }    = require('./MySQLAdapter');
const MySQLBaseTable      = require('./MySQLBaseTable');
const MySQLReportManager  = require('./MySQLReportManager');

class MySQLSutram {

    constructor(opts = {}) {
        const {
            host, port, user, password, database, connectionLimit,
            adapter = null,
            schema,
            reports = [],
        } = opts;
        if (!schema) throw new Error('[sutramcore-mysql] MySQLSutram requires schema');

        if (adapter) {
            // accept pre-configured adapter
            if (typeof adapter.run !== 'function') {
                throw new Error('[sutramcore-mysql] adapter must be a MySQLAdapter instance');
            }
            this.adapter = adapter;
        } else {
            // create adapter from config
            this.adapter = new MySQLAdapter({ host, port, user, password, database, connectionLimit });
        }

        this.schema          = schema;
        this._tableCache     = {};
        this._directReports  = opts.reports ?? [];
        this.report          = null;  // initialized after connect()

        // expose for sutramEngine compatibility
        this.db      = null;
        this.dialect = 'mysql';
    }

    // ─────────────────────────────────────────────────────────
    // CONNECT — must call before using
    // ─────────────────────────────────────────────────────────

    async connect() {
        await this.adapter.connect();

        // init report manager
        this.report = new MySQLReportManager(this.adapter);
        if (this._directReports?.length) {
            this.report.loadFromArray(this._directReports);
        }

        console.log('[sutramcore-mysql] MySQLSutram ready');
        return this;
    }

    // ─────────────────────────────────────────────────────────
    // TABLE — cached MySQLBaseTable instance
    // ─────────────────────────────────────────────────────────

    table(tableName) {
        if (!this._tableCache[tableName]) {
            this._tableCache[tableName] = new MySQLBaseTable(tableName, {
                adapter: this.adapter,
                schema:  this.schema,
            });
        }
        return this._tableCache[tableName];
    }

    // ─────────────────────────────────────────────────────────
    // TRANSACTIONS
    // ─────────────────────────────────────────────────────────

    // Automatic — commits on success, rolls back on throw
    async transaction(fn) {
        return this.adapter.transaction(async (scopedAdapter) => {
            // create a scoped MySQLSutram that uses the transaction connection
            const scoped = new _ScopedMySQLSutram(scopedAdapter, this.schema);
            return fn(scoped);
        });
    }

    // Manual
    async begin()    { await this.adapter.begin(); }
    async commit()   { await this.adapter.commit(); }
    async rollback() { await this.adapter.rollback(); }

    // ─────────────────────────────────────────────────────────
    // RAW QUERY ACCESS
    // ─────────────────────────────────────────────────────────

    async query(sql, params = []) {
        return this.adapter.all(sql, params);
    }

    async queryOne(sql, params = []) {
        return this.adapter.get(sql, params);
    }

    async close() {
        await this.adapter.close();
    }
}

// ─────────────────────────────────────────────────────────────
// Internal — scoped Sutram for transaction context
// Same API but uses the transaction connection adapter
// ─────────────────────────────────────────────────────────────

class _ScopedMySQLSutram {

    constructor(scopedAdapter, schema) {
        this._adapter    = scopedAdapter;
        this.schema      = schema;
        this._tableCache = {};
    }

    table(tableName) {
        if (!this._tableCache[tableName]) {
            this._tableCache[tableName] = new MySQLBaseTable(tableName, {
                adapter: this._adapter,
                schema:  this.schema,
            });
        }
        return this._tableCache[tableName];
    }
}

module.exports = { MySQLSutram };
