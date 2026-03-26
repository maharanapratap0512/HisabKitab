// index.js — sutramexcel
'use strict';

const SutramExcel = require('./src/SutramExcel');

// ─────────────────────────────────────────────────────────────
// sutramexcel — Excel import/export for sutramEngine
//
// ── QUICK START ───────────────────────────────────────────────
//
//   const { SutramExcel } = require('sutramexcel');
//   const excel = new SutramExcel(engine);
//
//   // register tables — only registered tables are allowed
//   excel.register(engine.table('product'), {
//
//     // per-column extensions (all optional)
//     // schema provides: type, not_null, ref_table, ref_field, ref_data
//     // developer adds:  alt_names, type override, not_null override
//     headers: {
//       purchase_date: { type: 'date', alt_names: ['date', 'तारीख'] },
//       item_id:       { type: 'mix' },   // item + subitem combo
//       mm_id:         { alt_names: ['mm_name', 'मि.म.', 'मिनी मधुबन'] },
//     },
//
//     // auto-set on every imported row
//     // literal:   { is_xl: 1, active: 1 }
//     // from req:  { dept_id: (req) => req.deptId }
//     // missing req value → null → schema default used
//     autoSet: {
//       is_xl:   1,
//       dept_id: (req) => req.deptId,
//     },
//
//     duplicateOn:    ['mm_id', 'item_id', 'purchase_date'],
//     fullDuplicateOn:['mm_id', 'item_id', 'purchase_date', 'qty'],
//     canUpdate:      true,
//     autoIncrement:  ['voucher_no', 'bunch_no'],
//     jsonColumns:    ['document'],
//     booleanColumns: ['isbill', 'is_xl'],
//   });
//
//   excel.register(engine.table('category'));  // no config — all auto
//   excel.register(engine.table('pbk'), { duplicateOn: ['roll_no'] });
//
//   // mount router
//   app.use('/_sutram/excel', excel.router());
//
//
// ── ROUTES ────────────────────────────────────────────────────
//
//   GET  /tables               → registered table list
//   GET  /config/:table        → derived header config
//   POST /verify/:table        → FK resolve → correctionList
//   POST /import/:table        → single row insert (trigger-aware)
//   POST /update/:table        → single row update
//   POST /error-report         → rejected rows → .xlsx download
//
//   GET    /dictionary         → list all entries
//   GET    /dictionary/:type   → list by type
//   POST   /dictionary         → add entry
//   PUT    /dictionary/:id     → update entry
//   DELETE /dictionary/:id     → soft delete
//
//
// ── DICTIONARY ────────────────────────────────────────────────
//
//   "kulo" → unit._id=5  saved to xls_dictionary
//   Next import → "kulo" automatically resolved to 5
//   No correction needed again
//
//   direct access:
//   excel.dictionary.add({ type: 'unit', name: 'kulo', ref_id: 5 })
//   excel.dictionary.find('unit', 'kulo')
//   excel.dictionary.list('unit')
//
// ─────────────────────────────────────────────────────────────

module.exports = { SutramExcel };
