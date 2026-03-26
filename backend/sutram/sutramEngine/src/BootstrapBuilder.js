// src/BootstrapBuilder.js
// ─────────────────────────────────────────────────────────────
// Reads sys_table, sys_column, sys_join from SQLite
// and builds the tableMeta object that sutramCore's Sutram expects.
//
// Output shape (matches sutramCore schema format):
// {
//   products: {
//     columns: {
//       _id:         { type: 'number' },
//       name:        { type: 'string' },
//       category_id: { type: 'number', ref: 'category._id', as: 'category', select: ['name'] },
//       active:      { type: 'boolean', default: 1 },
//     },
//     joins: {
//       reviews: { hasMany: true, table: 'review', on: 'product_id', target: '_id',
//                  as: 'reviews', select: ['_id', 'rating', 'body'] }
//     }
//   }
// }
// ─────────────────────────────────────────────────────────────

'use strict';

class BootstrapBuilder {

    constructor(db) {
        this.db = db;
    }

    // ── Main entry point ──────────────────────────────────────
    // Returns full tableMeta object ready for new Sutram({ schema })
    build() {
        const tables  = this._loadTables();
        const columns = this._loadColumns();
        const joins   = this._loadJoins();

        const meta = {};

        for (const table of tables) {
            const tableCols = columns.filter(c => c.table_id === table._id);
            const tableJoins = joins.filter(j => j.table_id === table._id);

            meta[table.table_name] = {
                columns: this._buildColumns(tableCols),
                joins:   this._buildJoins(tableJoins),
            };
        }

        return meta;
    }

    // ── Load from sys_ tables ─────────────────────────────────

    _loadTables() {
        return this.db.prepare(
            `SELECT * FROM sys_table WHERE active = 1 ORDER BY _id ASC`
        ).all();
    }

    _loadColumns() {
        return this.db.prepare(`
            SELECT c.* FROM sys_column c
            INNER JOIN sys_table t ON t._id = c.table_id
            WHERE c.active = 1 AND t.active = 1
            ORDER BY c.table_id ASC, c.sort_order ASC, c._id ASC
        `).all();
    }

    _loadJoins() {
        return this.db.prepare(`
            SELECT j.* FROM sys_join j
            INNER JOIN sys_table t ON t._id = j.table_id
            WHERE j.active = 1 AND t.active = 1
            ORDER BY j.table_id ASC, j._id ASC
        `).all();
    }

    // ── Build column definitions ──────────────────────────────

    _buildColumns(cols) {
        const result = {};

        for (const col of cols) {
            const def = { type: col.col_type };

            // default value
            if (col.default_value !== null && col.default_value !== undefined) {
                def.default = this._parseDefault(col.col_type, col.default_value);
            }

            // required
            if (col.is_required) def.required = true;

            // hasOne join — ref declared on this column
            if (col.ref_table && col.ref_col) {
                def.ref    = `${col.ref_table}.${col.ref_col}`;
                def.as     = col.ref_as ?? col.ref_table;
                def.select = col.ref_select
                    ? JSON.parse(col.ref_select)
                    : '*';
            }

            result[col.column_name] = def;
        }

        return result;
    }

    // ── Build join definitions ────────────────────────────────

    _buildJoins(joins) {
        const result = {};

        for (const join of joins) {
            const selectCols = join.select_cols
                ? JSON.parse(join.select_cols)
                : '*';

            if (join.join_type === 'hasMany') {
                result[join.join_key] = {
                    hasMany: true,
                    table:   join.child_table,
                    on:      join.fk_col,
                    target:  join.target_col,
                    as:      join.as_name,
                    select:  selectCols,
                };
            }

            else if (join.join_type === 'manyToMany') {
                result[join.join_key] = {
                    manyToMany: true,
                    table:      join.child_table,
                    junction:   join.junction_table,
                    on:         join.fk_col,
                    target:     join.target_col,
                    as:         join.as_name,
                    select:     selectCols,
                };
            }
        }

        return result;
    }

    // ── Helpers ───────────────────────────────────────────────

    _parseDefault(type, raw) {
        if (raw === null || raw === undefined) return undefined;
        if (type === 'number')  return Number(raw);
        if (type === 'boolean') return raw === 'true' || raw === '1' ? 1 : 0;
        if (type === 'json')    { try { return JSON.parse(raw); } catch { return null; } }
        return raw; // string
    }
}

module.exports = BootstrapBuilder;
