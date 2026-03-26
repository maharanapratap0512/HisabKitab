// src/ConfigDeriver.js
// ─────────────────────────────────────────────────────────────
// Derives Excel import config automatically from sutramCore
// BaseTable schema. Developer sirf extra config deta hai.
//
// Auto-derived from schema:
//   col.id()        → skip (auto)
//   col.string()    → { type: 'string' }
//   col.number()    → { type: 'number' }
//   col.boolean()   → { type: 'boolean' }
//   col.json()      → { type: 'json' }
//   col.required()  → not_null: true
//   col.ref()       → ref_table, ref_field, ref_data
//
// Developer extend config:
//   headers: {
//     purchase_date: { type: 'date', alt_names: ['date','तारीख'] },
//     item_id:       { type: 'mix' },
//   }
// ─────────────────────────────────────────────────────────────

'use strict';

class ConfigDeriver {

    // ─────────────────────────────────────────────────────────
    // DERIVE — main entry point
    // tableInstance = sutramCore BaseTable
    // extend        = developer's extra config
    // ─────────────────────────────────────────────────────────

    derive(tableInstance, extend = {}) {
        const tableName = tableInstance.tableName;
        const columns   = tableInstance.columns ?? {};
        const headers   = [];

        for (const [colName, def] of Object.entries(columns)) {

            // skip primary key — auto set by DB
            if (def.pk || def.type === 'id') continue;

            // base from schema
            const base = this._fromColumn(colName, def);

            // merge with developer extend
            const ext = extend.headers?.[colName] ?? {};
            const merged = this._merge(base, ext);

            headers.push(merged);
        }

        return {
            table:          tableName,
            display_name:   extend.display_name ?? tableName,
            headers,
            duplicateOn:    extend.duplicateOn    ?? [],
            fullDuplicateOn:extend.fullDuplicateOn ?? [],
            canUpdate:      extend.canUpdate       ?? false,
            autoIncrement:  extend.autoIncrement   ?? [],
            jsonColumns:    extend.jsonColumns      ?? [],
            booleanColumns: extend.booleanColumns   ?? [],
            dateColumns:    extend.dateColumns      ?? [],
            autoSet:        extend.autoSet          ?? {},
        };
    }

    // ─────────────────────────────────────────────────────────
    // FROM COLUMN — schema col → base header config
    // ─────────────────────────────────────────────────────────

    _fromColumn(colName, def) {
        const base = {
            col_name:  colName,
            name:      colName,
            alt_names: [colName],
            not_null:  def.required === true || def.notNull === true,
            type:      this._mapType(def),
        };

        // hasOne FK — col.ref()
        if (def.ref) {
            const [refTable, refCol] = def.ref.split('.');
            const refAs  = def.as ?? refTable;
            const select = def.select;
            const refData = Array.isArray(select) ? select[0]
                          : (select && select !== '*') ? select
                          : null;

            base.ref_table = refTable;
            base.ref_field = colName;          // category_id
            base.ref_as    = refAs;            // 'category'
            base.ref_data  = refData;          // 'name'
            base.type      = 'ref';

            // col_name is category_id
            // name for Excel header → 'category' (without _id)
            base.name      = refAs;
            base.alt_names = [refAs, colName];
        }

        return base;
    }

    // ─────────────────────────────────────────────────────────
    // MAP TYPE — sutramCore type → excel type
    // ─────────────────────────────────────────────────────────

    _mapType(def) {
        const t = def.type ?? '';
        if (t === 'boolean') return 'boolean';
        if (t === 'json')    return 'json';
        if (t === 'number')  return 'number';
        return 'string';
    }

    // ─────────────────────────────────────────────────────────
    // MERGE — base + developer extend
    // Developer can add alt_names (append, not replace)
    // Developer can override type (e.g. 'date', 'mix', 'array')
    // Developer can override not_null
    // ─────────────────────────────────────────────────────────

    _merge(base, ext) {
        if (!ext || Object.keys(ext).length === 0) return base;

        const merged = { ...base };

        // alt_names — append, not replace
        if (ext.alt_names?.length) {
            merged.alt_names = [
                ...new Set([...base.alt_names, ...ext.alt_names])
            ];
        }

        // type override (date, mix, array, unix_date)
        if (ext.type) merged.type = ext.type;

        // not_null override
        if (ext.not_null !== undefined) merged.not_null = ext.not_null;

        // ref overrides (rarely needed — schema usually has it)
        if (ext.ref_table) merged.ref_table = ext.ref_table;
        if (ext.ref_field) merged.ref_field = ext.ref_field;
        if (ext.ref_data)  merged.ref_data  = ext.ref_data;

        // name override
        if (ext.name) merged.name = ext.name;

        return merged;
    }
}

module.exports = ConfigDeriver;
