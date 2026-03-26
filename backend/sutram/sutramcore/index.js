// index.js — sutramcore
'use strict';

const DbModal             = require('./src/DbModal');
const BaseTable           = require('./src/BaseTable');
const ReportManager       = require('./src/ReportManager');
const { col, ColBuilder } = require('./src/col');
const { defineTable }     = require('./src/defineTable');

// ─────────────────────────────────────────────────────────────
// ── Sutram — instance-based ORM ──────────────────────────────
// ─────────────────────────────────────────────────────────────
//
// Create one Sutram instance per database connection.
// Each instance is fully isolated — own db, own schema, own cache.
//
// Usage:
//   const { Sutram } = require('sutramcore');
//
//   // Option A — pass your own db instance (existing project)
//   const sewa = new Sutram({ db: dbmodal.db, schema });
//
//   // Option B — let sutramcore open + migrate the db (fresh project)
//   const sewa = new Sutram({ dbPath: './data/app.db', schema, migrations, views });
//
//   // Get a table — cached, same instance returned every call
//   const item  = sewa.table('item');
//   const batch = sewa.table('hmp_batch');
//
//   // Reports / Procedures — CTE only in sutramCore
//   const sewa = new Sutram({ db, schema, reports: require('./reports') });
//   const rows = sewa.procedure('monthly_sales').run({ from: '2024-01' });
//
//   // Transactions — bound to this instance's db
//   sewa.transaction(() => {
//       item.insert(data, false);
//       batch.insert(batchData, false);
//   });

class Sutram {

    /**
     * @param {{ db?, dbPath?, schema, migrations?, views? }} opts
     * db         — pass your own better-sqlite3 instance  (existing project)
     * dbPath     — let sutramcore open + migrate the db   (fresh project)
     * schema     — tableMeta object { tableName: { columns, joins } }
     * migrations — array-of-arrays migration list         (only with dbPath)
     * views      — array of CREATE VIEW sql strings       (only with dbPath)
     */
    constructor({ db = null, dbPath = null, schema, migrations = [], views = [], reports = [] } = {}) {

        // ── schema validation ──────────────────────────────────
        if (!schema) {
            throw new Error('[sutramcore] Sutram requires schema');
        }
        if (typeof schema !== 'object' || Array.isArray(schema)) {
            throw new Error('[sutramcore] schema must be a plain object — { tableName: { columns, joins } }');
        }

        // ── db setup ───────────────────────────────────────────
        if (db) {
            // Option A — caller manages db lifecycle
            if (typeof db.prepare !== 'function') {
                throw new Error('[sutramcore] db must be a better-sqlite3 Database instance');
            }
            this.db = db;

        } else if (dbPath) {
            // Option B — sutramcore opens + migrates
            const modal = new DbModal(dbPath, migrations, views);
            this.db = modal.db;

        } else {
            throw new Error(
                '[sutramcore] Sutram() requires either:\n' +
                '  db     — pass your own better-sqlite3 instance\n' +
                '  dbPath — let sutramcore open and migrate the database'
            );
        }

        this.schema      = schema;
        this._tableCache = {};  // cache — sewa.table('item') returns same instance every call

        // ── report manager ─────────────────────────────────────
        this._report = new ReportManager(this.db);
        if (reports.length) {
            this._report.loadFromArray(reports);
        }

        // ── bind BaseTable subclass to this instance ───────────
        // Every table created via sewa.table() or new sewa.BaseTable()
        // automatically receives this instance's db + schema.
        const self = this;
        this.BaseTable = class extends BaseTable {
            constructor(tableName) {
                super(tableName, { db: self.db, schema: self.schema });
            }
        };

        console.log('[sutramcore] Instance ready');
    }

    // ─────────────────────────────────────────────────────────
    // ── TABLE FACTORY ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    // Returns a cached BaseTable instance for tableName.
    // Caching ensures _stmtCache (prepared statements) is preserved
    // across calls — critical for bulk insert performance.

    table(tableName) {
        if (!this._tableCache[tableName]) {
            this._tableCache[tableName] = new this.BaseTable(tableName);
        }
        return this._tableCache[tableName];
    }

    // ─────────────────────────────────────────────────────────
    // ── PROCEDURE — same pattern as table() ───────────────────
    // ─────────────────────────────────────────────────────────
    // Returns cached ProcedureHandle for a named CTE report.
    // Sync — returns rows directly (no await needed).
    //
    //   const rows = sewa.procedure('monthly_sales').run({ from: '2024-01' });
    //   sewa.procedure('low_stock').getParams()
    //   sewa.procedure('low_stock').getMeta()

    procedure(name) {
        return this._report.procedure(name);
    }

    // ─────────────────────────────────────────────────────────
    // ── TRANSACTIONS ──────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    // All transaction methods bound to THIS instance's db.
    //
    // Automatic — commits on success, rolls back on throw:
    //   sewa.transaction(() => {
    //       item.insert(data, false);
    //       batch.insert(batchData, false);
    //   });
    //
    // Manual — for complex / router-level cases:
    //   sewa.begin();
    //   try { ...; sewa.commit(); }
    //   catch (e) { sewa.rollback(); throw e; }

    transaction(fn) { return this.db.transaction(fn)(); }
    begin()         { this.db.prepare('BEGIN').run(); }
    commit()        { this.db.prepare('COMMIT').run(); }
    rollback()      { this.db.prepare('ROLLBACK').run(); }

    // ─────────────────────────────────────────────────────────
    // ── RAW DB ACCESS ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    // For custom SQL that BaseTable doesn't handle.
    //   const rows = sewa.prepare(`SELECT * FROM ...`).all();

    prepare(sql) { return this.db.prepare(sql); }
}

module.exports = { Sutram, col, ColBuilder, defineTable };
