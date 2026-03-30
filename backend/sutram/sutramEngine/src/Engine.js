// src/Engine.js
// ─────────────────────────────────────────────────────────────
// SutramEngine — main class
//
// THREE INITIALIZATION PATTERNS:
//
//  Pattern 1 — pass existing sutramCore Sutram instance
//    new SutramEngine({ sutram: sewa, triggers, reports })
//    → reuses sewa.db + sewa's cache
//    → sewa.table() and engine.table() share same instances
//    → transactions across both are fully atomic
//    → mode: 'direct' (schema from sutram, sys_ skipped)
//
//  Pattern 2 — direct schema (no sys_ involvement)
//    new SutramEngine({ db | dbPath, schema, triggers, reports })
//    → engine creates its own Sutram instance
//    → sys_ tables not used for schema
//    → user manages SQLite tables + migrations
//    → mode: 'direct'
//
//  Pattern 3 — managed (schema lives in sys_ tables)
//    new SutramEngine({ db | dbPath })
//    → engine reads schema from sys_table, sys_column, sys_join
//    → use importAll() to populate sys_ from schema.js files
//    → sutramUI + sutramServer compatible
//    → mode: 'managed'
//
// db vs dbPath:
//   db     — caller passes ready better-sqlite3 instance
//            caller manages lifecycle (open/close)
//   dbPath — engine opens the file, sets WAL + pragmas
//            engine manages lifecycle
// ─────────────────────────────────────────────────────────────

'use strict';

const SysMigrator = require('./SysMigrator');
const BootstrapBuilder = require('./BootstrapBuilder');
const SchemaManager = require('./SchemaManager');
const TriggerManager = require('./TriggerManager');
const ReportManager = require('./ReportManager');
const UiManager = require('./UiManager');
const buildRouter = require('./RouterBuilder');

class Engine {

    // ─────────────────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────────────────

    constructor({
        // Pattern 1
        sutram = null,

        // Pattern 2 + 3 — db source (one of these)
        db = null,
        dbPath = null,

        // Pattern 2 — direct schema
        schema = null,
        triggers = null,
        reports = null,
    } = {}) {

        // ── resolve db ────────────────────────────────────────

        if (sutram) {
            // Pattern 1 — accept sutramCore Sutram OR sutramcore-mysql MySQLSutram
            const isSQLite = typeof sutram.db?.prepare === 'function';
            const isMySQL = sutram.dialect === 'mysql';

            if (!isSQLite && !isMySQL) {
                throw new Error(
                    '[sutramEngine] sutram must be a sutramCore Sutram instance ' +
                    'or a sutramcore-mysql MySQLSutram instance'
                );
            }

            this.db = isSQLite ? sutram.db : null;
            this._adapter = isMySQL ? sutram.adapter : null;
            this._dialect = isMySQL ? 'mysql' : 'sqlite';
            this._sutram = sutram;
            this._ownsSutram = false;

        } else if (db) {
            // Pattern 2/3 Option A — caller passes ready db
            if (typeof db.prepare !== 'function') {
                throw new Error(
                    '[sutramEngine] db must be a better-sqlite3 Database instance'
                );
            }
            this.db = db;
            this._sutram = null;
            this._ownsSutram = true;

        } else if (dbPath) {
            // Pattern 2/3 Option B — engine opens the file
            const Database = require('better-sqlite3');
            this.db = new Database(dbPath);
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('foreign_keys = ON');
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('busy_timeout = 10000');
            this._sutram = null;
            this._ownsSutram = true;
            console.log(`[sutramEngine] Connected: ${dbPath}`);

        } else {
            throw new Error(
                '[sutramEngine] One of these is required:\n' +
                '  sutram  — sutramCore Sutram OR MySQLSutram instance  (Pattern 1)\n' +
                '  db      — better-sqlite3 Database instance            (Pattern 2/3)\n' +
                '  dbPath  — path to SQLite file                         (Pattern 2/3)'
            );
        }

        // ── detect mode ───────────────────────────────────────
        // direct  → schema provided by caller (Pattern 1 or 2)
        // managed → schema lives in sys_ tables (Pattern 3)

        if (sutram || schema) {
            this._mode = 'direct';
        } else {
            this._mode = 'managed';
        }

        // ── store direct-mode schema ──────────────────────────
        this._directSchema = schema;
        this._directTriggers = triggers ?? [];
        this._directReports = reports ?? [];

        // ── internal state ────────────────────────────────────
        this._schema = {};
        this._tableCache = {};
        this._dialect = this._dialect ?? 'sqlite';
        this._adapter = this._adapter ?? null;

        // ── sub-managers ──────────────────────────────────────
        // TriggerManager and ReportManager always read from sys_
        // in managed mode, or from direct arrays in direct mode
        this.trigger = new TriggerManager(this.db);
        this.report = new ReportManager(this.db);
        this.schema = new SchemaManager(this.db, () => this.rebootstrap());
        this.ui = new UiManager(this);
    }

    // ─────────────────────────────────────────────────────────
    // INIT
    // Always call after constructor: new SutramEngine(...).init()
    //
    // Managed mode → runs sys_ migrations → rebootstrap
    // Direct mode  → runs only sys_meta migration (minimal)
    //                → rebootstrap with provided schema
    // ─────────────────────────────────────────────────────────

    init() {
        // sys_ migrations always run — even in direct mode
        // direct mode only needs sys_meta for engine version tracking
        // other sys_ tables created but not used
        new SysMigrator(this.db).run();

        this.rebootstrap();
        console.log(`[sutramEngine] Ready — mode: ${this._mode}`);
        return this; // chainable
    }

    // ─────────────────────────────────────────────────────────
    // REBOOTSTRAP
    // Rebuilds schema + Sutram instance + all caches.
    // Called automatically after every schema change.
    //
    // Direct mode  → uses _directSchema (provided by caller)
    // Managed mode → reads sys_table / sys_column / sys_join
    // ─────────────────────────────────────────────────────────

    rebootstrap() {
        if (this._mode === 'direct') {
            this._rebootstrapDirect();
        } else {
            this._rebootstrapManaged();
        }

        const count = Object.keys(this._schema).length;
        console.log(`[sutramEngine] Bootstrapped — ${count} table(s), mode: ${this._mode}`);
    }

    _rebootstrapDirect() {
        const { Sutram } = require('sutramcore');

        if (this._ownsSutram) {
            // Pattern 2 — we own the Sutram instance, build from direct schema
            if (!this._directSchema) {
                throw new Error(
                    '[sutramEngine] Direct mode requires schema.\n' +
                    'Pass schema to constructor or use managed mode.'
                );
            }
            this._schema = this._directSchema;
            this._sutram = new Sutram({ db: this.db, schema: this._schema });

            // load triggers + reports from direct arrays
            this.trigger.loadFromArray(this._directTriggers);
            this.report.loadFromArray(this._directReports);

        } else {
            // Pattern 1 — caller passed Sutram or MySQLSutram instance
            this._schema = this._sutram.schema;
            // do NOT replace this._sutram — caller owns it

            if (this._dialect === 'mysql') {
                // MySQL — proxy report manager from MySQLSutram
                // MySQLSutram.report is MySQLReportManager (already initialized)
                // engine.procedure() will delegate to it automatically
                this.report = this._sutram.report;
                this.trigger.loadFromArray(this._directTriggers);
            } else {
                // SQLite Pattern 1 — use engine's own ReportManager
                this.trigger.loadFromArray(this._directTriggers);
                this.report.loadFromArray(this._directReports);
            }
        }

        this._tableCache = {};
    }

    _rebootstrapManaged() {
        const { Sutram } = require('sutramcore');

        // read everything from sys_ tables
        const builder = new BootstrapBuilder(this.db);
        this._schema = builder.build();

        // always create fresh Sutram in managed mode
        this._sutram = new Sutram({ db: this.db, schema: this._schema });
        this._tableCache = {};

        // load triggers + reports from sys_ tables
        this.trigger.load();
        this.report.load();
    }

    // ─────────────────────────────────────────────────────────
    // TABLE — get a cached BaseTable instance
    //
    // Pattern 1: returns same instance as sewa.table(name)
    //            because this._sutram === sewa
    // Pattern 2/3: returns engine's own cached instance
    // ─────────────────────────────────────────────────────────

    table(tableName) {
        if (!this._sutram) {
            throw new Error('[sutramEngine] Call engine.init() before engine.table()');
        }
        // delegate to sutram instance — it handles its own cache
        return this._sutram.table(tableName);
    }

    // ─────────────────────────────────────────────────────────
    // TRIGGER-AWARE CRUD
    // Wraps sutramCore operations + fires triggers.
    // All operations + trigger actions in same transaction → atomic.
    // ─────────────────────────────────────────────────────────

    insert(tableName, data, full = true) {
        const tbl = this.table(tableName);
        const result = this.db.transaction(() => {
            const id = tbl.insert(data, false);
            const newRow = tbl.getOne({ _id: id }, { full: false });
            this.trigger.execute(tableName, 'INSERT', newRow, null);
            return id;
        })();
        return full ? tbl.getById(result) : result;
    }

    update(tableName, data, where, full = true) {
        const tbl = this.table(tableName);
        const id = typeof where === 'object' ? (where._id ?? null) : null;
        const oldRow = id ? tbl.getOne({ _id: id }, { full: false }) : null;

        const result = this.db.transaction(() => {
            tbl.update(data, where, false);
            const newRow = id ? tbl.getOne({ _id: id }, { full: false }) : null;
            this.trigger.execute(tableName, 'UPDATE', newRow, oldRow);
            return id;
        })();

        return full && result ? tbl.getById(result) : result;
    }

    updateById(tableName, data, id, full = true) {
        return this.update(tableName, data, { _id: id }, full);
    }

    delete(tableName, where) {
        const tbl = this.table(tableName);
        const oldRows = tbl.getAll(where, { full: false });

        return this.db.transaction(() => {
            const count = tbl.delete(where);
            for (const oldRow of oldRows) {
                this.trigger.execute(tableName, 'DELETE', null, oldRow);
            }
            return count;
        })();
    }

    deleteById(tableName, id) {
        return this.delete(tableName, { _id: id });
    }

    // ─────────────────────────────────────────────────────────
    // PROCEDURE — public API, same pattern as table()
    // Returns cached ProcedureHandle.
    // Works for both CTE reports and MySQL stored procedures.
    // Works in SQLite and MySQL mode — same call, same result.
    //
    // engine.report is INTERNAL — use procedure() instead
    //
    // Usage:
    //   engine.procedure('monthly_sales').run({ from: '2024-01' })
    //   engine.procedure('generate_report').run({ year: 2024 })
    //   engine.procedure('low_stock').getParams()
    //   engine.procedure('low_stock').getMeta()
    // ─────────────────────────────────────────────────────────

    procedure(name) {
        return this.report.procedure(name);
    }

    // ─────────────────────────────────────────────────────────
    // PASS-THROUGH QUERIES — no triggers
    // ─────────────────────────────────────────────────────────

    getById(tableName, id) { return this.table(tableName).getById(id); }
    getOne(tableName, where, opts) { return this.table(tableName).getOne(where, opts); }
    getAll(tableName, where, opts) { return this.table(tableName).getAll(where, opts); }
    count(tableName, where) { return this.table(tableName).count(where); }

    // ─────────────────────────────────────────────────────────
    // IMPORT / EXPORT
    // importAll / importSchema / importTriggers / importReports
    //   → only meaningful in managed mode
    //   → in direct mode: logs warning, skips
    //
    // exportAll / exportSchema / exportTriggers / exportReports
    //   → always available — reads from sys_ in managed mode
    //   → in direct mode: returns current in-memory state
    // ─────────────────────────────────────────────────────────

    importAll(opts = {}) {
        const { ui, ...rest } = opts;
        this._assertManagedForImport('importAll');
        this.schema.importAll(rest);
        if (ui) this.ui.importUi(ui);
    }

    importSchema(meta) {
        this._assertManagedForImport('importSchema');
        return this.schema.importSchema(meta);
    }

    importTriggers(list) {
        this._assertManagedForImport('importTriggers');
        return this.schema.importTriggers(list);
    }

    // importUi works in ALL modes — UI config is always in sys_ tables
    // (sys_table_ui + sys_column_ui always created by sys migrations)

    importReports(list) {
        this._assertManagedForImport('importReports');
        return this.schema.importReports(list);
    }

    exportAll() { return this.schema.exportAll(); }
    exportSchema() { return this.schema.exportSchema(); }
    exportTriggers() { return this.schema.exportTriggers(); }
    exportReports() { return this.schema.exportReports(); }

    // ─────────────────────────────────────────────────────────
    // TRANSACTIONS
    // ─────────────────────────────────────────────────────────

    transaction(fn) { return this.db.transaction(fn)(); }
    begin() { this.db.prepare('BEGIN').run(); }
    commit() { this.db.prepare('COMMIT').run(); }
    rollback() { this.db.prepare('ROLLBACK').run(); }

    // ─────────────────────────────────────────────────────────
    // UI CONFIG
    // ─────────────────────────────────────────────────────────
    // engine.ui.setTableUi(table, opts)    → set table display config
    // engine.ui.setColumnUi(table, col, opts) → set column display config
    // engine.ui.getMenu()                  → sidebar menu response
    // engine.ui.getTableSchema(table)      → form + table builder response
    //
    // importAll supports ui:
    //   engine.importAll({ schema, triggers, reports, ui })

    importUi(uiConfig) {
        return this.ui.importUi(uiConfig);
    }

    // ─────────────────────────────────────────────────────────
    // ROUTER
    // ─────────────────────────────────────────────────────────
    // Returns an Express router with all CRUD + _sutram routes.
    // Works in both direct and managed mode.
    //
    // Usage:
    //   app.use('/api', engine.router());
    //
    // Routes:
    //   GET  /_sutram/menu
    //   GET  /_sutram/schema/:table
    //   POST /_sutram/reports/:name/run
    //   GET    /:table
    //   GET    /:table/:id
    //   POST   /:table
    //   PUT    /:table/:id
    //   DELETE /:table/:id
    //   POST   /:table/query

    router() {
        return buildRouter(this);
    }

    // ─────────────────────────────────────────────────────────
    // RAW DB ACCESS
    // ─────────────────────────────────────────────────────────

    prepare(sql) { return this.db.prepare(sql); }

    // ─────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────

    _assertManagedForImport(method) {
        if (this._mode !== 'managed') {
            throw new Error(
                `[sutramEngine] ${method}() is only available in managed mode.\n` +
                `Current mode: "${this._mode}"\n` +
                `Managed mode: new SutramEngine({ db | dbPath }) — no schema in constructor.`
            );
        }
    }
}

module.exports = Engine;
