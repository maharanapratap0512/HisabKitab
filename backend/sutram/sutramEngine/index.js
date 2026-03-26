// index.js — sutramEngine
'use strict';

const Engine = require('./src/Engine');

// ─────────────────────────────────────────────────────────────
// sutramEngine — metadata-driven self-bootstrapping engine
//
// THREE INITIALIZATION PATTERNS:
//
// ── Pattern 1 — reuse existing sutramCore instance ────────────
//
//   const { Sutram }       = require('sutramcore');
//   const { SutramEngine } = require('sutramengine');
//
//   // your existing sutramCore setup — UNCHANGED
//   const sewa = new Sutram({ db: dbmodal.db, schema });
//
//   // engine reuses sewa.db + sewa's cache
//   const engine = new SutramEngine({
//     sutram:   sewa,
//     triggers: require('./database/triggers'),  // optional
//     reports:  require('./database/reports'),   // optional
//   }).init();
//
//   // sewa.table() === engine.table() — same cache, same instance
//   // transactions across both are fully atomic
//   sewa.transaction(() => {
//     sewa.table('hmp_batch').insert(data, false);   // old code untouched
//     engine.insert('new_table', newData, false);    // new code with triggers
//   });
//
//
// ── Pattern 2 — direct schema (no sys_ tables involved) ───────
//
//   const engine = new SutramEngine({
//     db:       dbmodal.db,         // better-sqlite3 instance
//     // OR
//     dbPath:   './app.db',         // engine opens the file
//
//     schema:   require('./database/schema'),    // required
//     triggers: require('./database/triggers'),  // optional
//     reports:  require('./database/reports'),   // optional
//   }).init();
//
//   // user manages SQLite tables + migrations
//   // sys_ tables not used for schema
//   engine.table('product').getAll({ active: 1 });
//   engine.insert('product', data);  // triggers fire from array
//   app.use('/api', engine.router());
//
//
// ── Pattern 3 — managed (schema lives in sys_ tables) ─────────
//
//   const engine = new SutramEngine({
//     db:     dbmodal.db,   // better-sqlite3 instance
//     // OR
//     dbPath: './app.db',   // engine opens the file
//   }).init();
//
//   // register schema + triggers + reports (idempotent)
//   engine.importAll({
//     schema:   require('./database/schema'),
//     triggers: require('./database/triggers'),
//     reports:  require('./database/reports'),
//   });
//
//   // or define via SchemaManager (no migrations needed)
//   engine.schema.createTable({ table_name: 'product', columns: [...] });
//
//   // sutramUI + sutramServer compatible
//   // schema changes at runtime without redeployment
//
//
// ── CRUD (all patterns) ───────────────────────────────────────
//
//   engine.insert('product', data)           // trigger-aware
//   engine.updateById('product', data, id)   // trigger-aware
//   engine.deleteById('product', id)         // trigger-aware
//   engine.getAll('product', { active: 1 })
//   engine.getById('product', 1)
//   engine.table('product').getAll(...)      // direct BaseTable
//   engine.procedure('monthly_sales').run({ from: '2024-01' })
//   engine.procedure('generate_report').run({ year: 2024 })
//   engine.transaction(() => { ... })
//   engine.prepare(sql).all()
//
// ─────────────────────────────────────────────────────────────

module.exports = { SutramEngine: Engine };
