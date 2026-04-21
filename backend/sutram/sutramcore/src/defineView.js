// src/defineView.js
// ─────────────────────────────────────────────────────────────
// defineView() — declares a SQLite VIEW backed by a table's full join query.
//
// The Sutram constructor sees the __isView marker and:
//   1. Instantiates a temp BaseTable for the source table
//   2. Calls _buildSelectFull({}) to get the full SELECT with all JOINs
//   3. Runs: CREATE VIEW IF NOT EXISTS viewName AS <that SELECT>
//   4. Builds a view schema (raw cols + json-type aliases) so col.ref() works
//
// Usage — schema.js:
//   const { defineTable, defineView, col } = require('sutramcore');
//
//   module.exports = {
//
//       // base table — item joins unit (hasOne)
//       ...defineTable('item', {
//           _id:     col.id(),
//           name:    col.string().required(),
//           unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short'] }),
//       }),
//
//       // view — bakes the full join into a SQLite VIEW
//       ...defineView('v_item', 'item'),
//
//       // outer table — joins the VIEW exactly like a real table
//       ...defineTable('batch_item', {
//           _id:     col.id(),
//           item_id: col.ref('v_item._id', { as: 'item', select: ['name', 'unit'] }),
//           //                                                              ↑ nested json — works!
//       }),
//
//   };
//
// Unlimited depth — each defineView() can be the source for another:
//   defineView('v_batch_item', 'batch_item')  → bakes batch_item + v_item + unit
// ─────────────────────────────────────────────────────────────

'use strict';

function defineView(viewName, sourceTableName) {
    if (!viewName || typeof viewName !== 'string') {
        throw new Error('[sutramcore] defineView() first argument must be a view name string');
    }
    if (!sourceTableName || typeof sourceTableName !== 'string') {
        throw new Error('[sutramcore] defineView() second argument must be a source table name string');
    }

    return {
        [viewName]: {
            __isView:    true,         // ← tells Sutram constructor to materialize this
            sourceTable: sourceTableName,
            columns:     {},           // filled in by Sutram._materializeViews()
            joins:       {},
        }
    };
}

module.exports = { defineView };
