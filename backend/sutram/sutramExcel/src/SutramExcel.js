// src/SutramExcel.js
// ─────────────────────────────────────────────────────────────
// Main class — entry point for sutramexcel.
//
// Usage:
//   const { SutramExcel } = require('sutramexcel');
//   const excel = new SutramExcel(engine);
//
//   excel.register(engine.table('product'), {
//     headers: {
//       purchase_date: { type: 'date', alt_names: ['date', 'तारीख'] },
//       item_id:       { type: 'mix' },
//     },
//     autoSet: {
//       is_xl:   1,
//       dept_id: (req) => req.deptId,
//     },
//     duplicateOn:   ['mm_id', 'item_id', 'purchase_date'],
//     autoIncrement: ['voucher_no', 'bunch_no'],
//   });
//
//   app.use('/excel', excel.router());
// ─────────────────────────────────────────────────────────────

'use strict';

const ExcelMigrator    = require('./ExcelMigrator');
const DictionaryManager = require('./DictionaryManager');
const ConfigDeriver    = require('./ConfigDeriver');
const ExcelImporter    = require('./ExcelImporter');
const buildExcelRouter = require('./ExcelRouter');

class SutramExcel {

    constructor(engine) {
        if (!engine) throw new Error('[sutramexcel] SutramExcel requires engine instance');

        this.engine      = engine;
        this._configs    = {};   // { tableName: derivedConfig }
        this._deriver    = new ConfigDeriver();

        // run own migrations (xls_meta, xls_dictionary)
        const migrator   = new ExcelMigrator(engine.db);
        migrator.run();

        // init managers
        this._dictionary = new DictionaryManager(engine.db);
        this._importer   = new ExcelImporter(engine, this._dictionary);

        console.log('[sutramexcel] Ready');
    }

    // ─────────────────────────────────────────────────────────
    // REGISTER — whitelist a table for Excel import
    //
    // tableInstance — sutramCore BaseTable (engine.table('product'))
    // config        — optional extra config (all optional)
    //
    // config.headers         — per-column extensions
    // config.autoSet         — auto-set values on import
    //   literals:  { is_xl: 1, active: 1 }
    //   from req:  { dept_id: (req) => req.deptId }
    // config.duplicateOn     — columns to check for duplicates
    // config.fullDuplicateOn — columns for exact duplicate check
    // config.canUpdate       — allow update on duplicate
    // config.autoIncrement   — columns to auto-increment
    // config.jsonColumns     — JSON stringify before insert
    // config.booleanColumns  — boolean → 0/1 before insert
    // config.dateColumns     — date columns (explicit override)
    // config.display_name    — display name in table list
    // ─────────────────────────────────────────────────────────

    register(tableInstance, config = {}) {
        if (!tableInstance?.tableName) {
            throw new Error(
                '[sutramexcel] register() requires a BaseTable instance.\n' +
                'Use: excel.register(engine.table("product"), config)'
            );
        }

        const derived = this._deriver.derive(tableInstance, config);
        this._configs[tableInstance.tableName] = derived;

        console.log(`[sutramexcel] ✓ Registered: ${tableInstance.tableName}`);
        return this; // chainable
    }

    // ─────────────────────────────────────────────────────────
    // ROUTER — returns Express router
    // Mount: app.use('/_sutram/excel', excel.router())
    //    or: app.use('/api', engine.router()) — excel routes at /_sutram/excel
    // ─────────────────────────────────────────────────────────

    router() {
        return buildExcelRouter(this);
    }

    // ─────────────────────────────────────────────────────────
    // DIRECT ACCESS — for custom logic
    // ─────────────────────────────────────────────────────────

    get dictionary() { return this._dictionary; }

    getConfig(tableName) {
        return this._configs[tableName] ?? null;
    }

    getRegisteredTables() {
        return Object.keys(this._configs);
    }
}

module.exports = SutramExcel;
