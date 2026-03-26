// src/defineTable.js
// ─────────────────────────────────────────────────────────────
// defineTable() — converts ColBuilder instances to plain objects
// and wraps in { tableName: { columns, joins } } shape
// that schema-registry expects.
//
// Usage:
//   const { defineTable, col } = require('sutramcore');
//
//   module.exports = {
//
//       ...defineTable('unit', {
//           _id:        col.id(),
//           unit_short: col.string(),
//           active:     col.boolean().default(1),
//       }),
//
//       ...defineTable('item', {
//           _id:     col.id(),
//           unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short'] }),
//           active:  col.boolean().default(1),
//       }, {
//           // joins — second argument
//           categories: {
//               manyToMany: true,
//               table:    'category',
//               junction: 'rel_item_category',
//               on:       'item_id',
//               target:   'category_id',
//               as:       'categories',
//               select:   ['_id', 'category_hin'],
//           }
//       }),
//
//   };
//
// Also accepts raw plain objects — both styles work:
//   unit_id: col.ref(...)          ← builder style
//   unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: '*' }  ← raw style
// ─────────────────────────────────────────────────────────────

'use strict';

const { ColBuilder } = require('./col');

function defineTable(tableName, columns = {}, joins = {}) {
    if (!tableName || typeof tableName !== 'string') {
        throw new Error('[sutramcore] defineTable() first argument must be a table name string');
    }

    // resolve ColBuilder instances → plain objects
    const resolvedColumns = {};
    for (const [key, val] of Object.entries(columns)) {
        resolvedColumns[key] = val instanceof ColBuilder ? val.build() : val;
    }

    // validate column types
    const validTypes = ['number', 'string', 'boolean', 'json'];
    for (const [key, def] of Object.entries(resolvedColumns)) {
        if (!validTypes.includes(def.type)) {
            throw new Error(
                `[sutramcore] defineTable("${tableName}"): column "${key}" has invalid type "${def.type}".\n` +
                `Valid types: ${validTypes.join(', ')}`
            );
        }
        if (def.ref && !def.ref.includes('.')) {
            throw new Error(
                `[sutramcore] defineTable("${tableName}"): column "${key}" ref must be "table.column" — got "${def.ref}"`
            );
        }
    }

    return {
        [tableName]: {
            columns: resolvedColumns,
            joins,
        }
    };
}

module.exports = { defineTable };
