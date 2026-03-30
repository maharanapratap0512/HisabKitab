// src/UiManager.js
// ─────────────────────────────────────────────────────────────
// Manages frontend UI configuration.
// Reads/writes sys_table_ui and sys_column_ui.
//
// Provides two main API responses:
//   getMenu()         → sidebar menu (visible tables + reports)
//   getTableSchema()  → full column config for form + table builder
// ─────────────────────────────────────────────────────────────

'use strict';

// Valid field types for sys_column_ui
const FIELD_TYPES = [
    'text', 'number', 'boolean', 'textarea',
    'date', 'datetime', 'dropdown', 'multiselect',
    'file', 'image', 'color',
];

class UiManager {

    constructor(engineOrDb) {
        this.engine = engineOrDb.db ? engineOrDb : null;
        this.db = engineOrDb.db || engineOrDb;
    }

    // ═════════════════════════════════════════════════════════
    // ── GET MENU ──────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    // Returns sidebar menu config.
    // Tables: visible only, ordered by sort_order.
    // Reports: all active reports.
    //
    // Response shape:
    // {
    //   tables: [{ table_name, display_name, icon, sort_order,
    //              can_add, can_edit, can_delete }],
    //   reports: [{ report_name, label, params }]
    // }

    getMenu() {
        if (this.engine?._mode === 'direct') {
            const tables = Object.entries(this.engine._schema || {}).map(([name, def]) => {
                const ui = def.ui || def;
                const ov = this.db.prepare(`SELECT u.* FROM sys_table t JOIN sys_table_ui u ON u.table_id = t._id WHERE t.table_name = ?`).get(name);
                if (ov?.visible === 0 || (!ov && ui.visible === 0)) return null;
                return {
                    table_name: name, display_name: ov?.display_name || ui.display_name || ui.label || name, icon: ov?.icon || ui.icon || null,
                    sort_order: ov?.sort_order || ui.sort_order || 0, can_add: (ov?.can_add ?? ui.can_add ?? 1) === 1,
                    can_edit: (ov?.can_edit ?? ui.can_edit ?? 1) === 1, can_delete: (ov?.can_delete ?? ui.can_delete ?? 1) === 1,
                };
            }).filter(Boolean).sort((a, b) => a.sort_order - b.sort_order);
            const reports = (this.engine._directReports || []).map(r => ({
                report_name: r.report_name || r.name, label: r.label || r.report_name || r.name,
                params: typeof r.params === 'string' ? JSON.parse(r.params) : (r.params || []),
            }));
            return { tables, reports };
        }

        const tables = this.db.prepare(`
            SELECT
                t.table_name,
                COALESCE(u.display_name, t.label, t.table_name) as display_name,
                u.icon,
                COALESCE(u.sort_order, 0)   as sort_order,
                COALESCE(u.can_add,    1)   as can_add,
                COALESCE(u.can_edit,   1)   as can_edit,
                COALESCE(u.can_delete, 1)   as can_delete
            FROM sys_table t
            LEFT JOIN sys_table_ui u ON u.table_id = t._id
            WHERE t.active = 1
              AND t.is_system = 0
              AND COALESCE(u.visible, 1) = 1
            ORDER BY COALESCE(u.sort_order, 0) ASC, t._id ASC
        `).all().map(r => ({
            ...r,
            can_add: r.can_add === 1,
            can_edit: r.can_edit === 1,
            can_delete: r.can_delete === 1,
        }));

        const reports = this.db.prepare(`
            SELECT report_name, label, params
            FROM sys_report
            WHERE active = 1
            ORDER BY _id ASC
        `).all().map(r => ({
            ...r,
            params: r.params ? JSON.parse(r.params) : [],
        }));

        return { tables, reports };
    }

    // ═════════════════════════════════════════════════════════
    // ── GET TABLE SCHEMA ──────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    // Returns full column config for a table.
    // Frontend uses this to build forms and data tables.
    //
    // Response shape:
    // {
    //   table_name, display_name, can_add, can_edit, can_delete,
    //   columns: [{
    //     column_name, label, col_type, field_type,
    //     display_format, visible_list, visible_form,
    //     searchable, sortable, is_required, required_ui,
    //     sort_order,
    //     ref: { table, col, as, select } | null
    //   }],
    //   joins: [{ join_key, join_type, table, as }]
    // }

    getTableSchema(tableName) {
        if (this.engine?._mode === 'direct') {
            const def = this.engine._schema?.[tableName];
            if (!def) throw new Error(`[sutramEngine] Table "${tableName}" not found`);
            const ui = def.ui || def;
            const ov = this.db.prepare(`SELECT u.* FROM sys_table t JOIN sys_table_ui u ON u.table_id = t._id WHERE t.table_name = ?`).get(tableName);
            const columns = Object.entries(def.columns || {}).map(([name, col]) => {
                const cui = col.ui || col;
                const cov = this.db.prepare(`SELECT u.* FROM sys_column c JOIN sys_column_ui u ON u.column_id = c._id JOIN sys_table t ON t._id = c.table_id WHERE t.table_name = ? AND c.column_name = ?`).get(tableName, name);
                const ref = col.ref ? { table: col.ref.split('.')[0], col: col.ref.split('.')[1], as: col.as || col.ref.split('.')[0], select: col.select || '*' } : null;
                return {
                    column_name: name, label: cov?.label || cui.label || name, col_type: col.type, field_type: cov?.field_type || cui.field_type || 'text',
                    display_format: cov?.display_format || cui.display_format || null, is_pk: col.is_pk === true || name === '_id',
                    is_required: col.required === true, required_ui: (cov?.required_ui ?? cui.required_ui ?? 0) === 1,
                    visible_list: (cov?.visible_list ?? cui.visible_list ?? 1) === 1, visible_form: (cov?.visible_form ?? cui.visible_form ?? 1) === 1,
                    searchable: (cov?.searchable ?? cui.searchable ?? 0) === 1, sortable: (cov?.sortable ?? cui.sortable ?? 0) === 1, sort_order: cov?.sort_order || cui.sort_order || 0, ref
                };
            }).sort((a, b) => a.sort_order - b.sort_order);
            return {
                table_name: tableName, display_name: ov?.display_name || ui.display_name || ui.label || tableName, icon: ov?.icon || ui.icon || null,
                can_add: (ov?.can_add ?? ui.can_add ?? 1) === 1, can_edit: (ov?.can_edit ?? ui.can_edit ?? 1) === 1, can_delete: (ov?.can_delete ?? ui.can_delete ?? 1) === 1,
                columns, joins: Object.entries(def.joins || {}).map(([k, j]) => ({ join_key: k, join_type: j.manyToMany ? 'manyToMany' : 'hasMany', table: j.table, as: j.as || k }))
            };
        }

        const tableRow = this.db.prepare(
            `SELECT t.*, u.display_name, u.icon,
                    COALESCE(u.can_add,    1) as can_add,
                    COALESCE(u.can_edit,   1) as can_edit,
                    COALESCE(u.can_delete, 1) as can_delete
             FROM sys_table t
             LEFT JOIN sys_table_ui u ON u.table_id = t._id
             WHERE t.table_name = ? AND t.active = 1`
        ).get(tableName);

        if (!tableRow) {
            throw new Error(`[sutramEngine] Table "${tableName}" not found`);
        }

        // columns with UI config merged
        const columns = this.db.prepare(`
            SELECT
                c.column_name,
                c.col_type,
                c.is_required,
                c.is_pk,
                c.ref_table,
                c.ref_col,
                c.ref_as,
                c.ref_select,
                COALESCE(u.label,        c.label, c.column_name) as label,
                COALESCE(u.field_type,   'text')   as field_type,
                u.display_format,
                COALESCE(u.visible_list, 1)  as visible_list,
                COALESCE(u.visible_form, 1)  as visible_form,
                COALESCE(u.searchable,   0)  as searchable,
                COALESCE(u.sortable,     0)  as sortable,
                COALESCE(u.required_ui,  0)  as required_ui,
                COALESCE(u.sort_order, c.sort_order, 0) as sort_order
            FROM sys_column c
            LEFT JOIN sys_column_ui u ON u.column_id = c._id
            WHERE c.table_id = ? AND c.active = 1
            ORDER BY COALESCE(u.sort_order, c.sort_order, 0) ASC, c._id ASC
        `).all(tableRow._id).map(col => {

            // build ref object for FK columns
            const ref = col.ref_table ? {
                table: col.ref_table,
                col: col.ref_col,
                as: col.ref_as,
                select: col.ref_select ? JSON.parse(col.ref_select) : '*',
            } : null;

            return {
                column_name: col.column_name,
                label: col.label,
                col_type: col.col_type,
                field_type: col.field_type,
                display_format: col.display_format ?? null,
                is_pk: col.is_pk === 1,
                is_required: col.is_required === 1,
                required_ui: col.required_ui === 1,
                visible_list: col.visible_list === 1,
                visible_form: col.visible_form === 1,
                searchable: col.searchable === 1,
                sortable: col.sortable === 1,
                sort_order: col.sort_order,
                ref,
            };
        });

        // joins
        const joins = this.db.prepare(`
            SELECT join_key, join_type, child_table as \`table\`, as_name as \`as\`
            FROM sys_join
            WHERE table_id = ? AND active = 1
        `).all(tableRow._id);

        return {
            table_name: tableRow.table_name,
            display_name: tableRow.display_name ?? tableRow.label ?? tableRow.table_name,
            icon: tableRow.icon ?? null,
            can_add: tableRow.can_add === 1,
            can_edit: tableRow.can_edit === 1,
            can_delete: tableRow.can_delete === 1,
            columns,
            joins,
        };
    }

    // ═════════════════════════════════════════════════════════
    // ── SET TABLE UI ──────────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    // Create or update UI config for a table.
    // opts: { display_name?, icon?, sort_order?, visible?,
    //         can_add?, can_edit?, can_delete? }

    setTableUi(tableName, opts = {}) {
        const tableRow = this.db.prepare(
            `SELECT _id FROM sys_table WHERE table_name = ? AND active = 1`
        ).get(tableName);

        if (!tableRow) throw new Error(`[sutramEngine] Table "${tableName}" not found`);

        const exists = this.db.prepare(
            `SELECT _id FROM sys_table_ui WHERE table_id = ?`
        ).get(tableRow._id);

        if (exists) {
            const fields = [];
            const vals = [];
            if (opts.display_name !== undefined) { fields.push('display_name = ?'); vals.push(opts.display_name); }
            if (opts.icon !== undefined) { fields.push('icon = ?'); vals.push(opts.icon); }
            if (opts.sort_order !== undefined) { fields.push('sort_order = ?'); vals.push(opts.sort_order); }
            if (opts.visible !== undefined) { fields.push('visible = ?'); vals.push(opts.visible ? 1 : 0); }
            if (opts.can_add !== undefined) { fields.push('can_add = ?'); vals.push(opts.can_add ? 1 : 0); }
            if (opts.can_edit !== undefined) { fields.push('can_edit = ?'); vals.push(opts.can_edit ? 1 : 0); }
            if (opts.can_delete !== undefined) { fields.push('can_delete = ?'); vals.push(opts.can_delete ? 1 : 0); }
            fields.push('updated_at = ?');
            vals.push(new Date().toISOString());
            vals.push(exists._id);
            if (fields.length > 1) {
                this.db.prepare(`UPDATE sys_table_ui SET ${fields.join(', ')} WHERE _id = ?`).run(...vals);
            }
        } else {
            this.db.prepare(`
                INSERT INTO sys_table_ui
                  (table_id, display_name, icon, sort_order, visible, can_add, can_edit, can_delete)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                tableRow._id,
                opts.display_name ?? null,
                opts.icon ?? null,
                opts.sort_order ?? 0,
                opts.visible !== false ? 1 : 0,
                opts.can_add !== false ? 1 : 0,
                opts.can_edit !== false ? 1 : 0,
                opts.can_delete !== false ? 1 : 0,
            );
        }

        console.log(`[sutramEngine] ✓ Table UI set for "${tableName}"`);
    }

    // ═════════════════════════════════════════════════════════
    // ── SET COLUMN UI ─────────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    // Create or update UI config for a column.
    // opts: { label?, field_type?, display_format?,
    //         visible_list?, visible_form?, searchable?,
    //         sortable?, required_ui?, sort_order? }

    setColumnUi(tableName, columnName, opts = {}) {
        const tableRow = this.db.prepare(
            `SELECT _id FROM sys_table WHERE table_name = ? AND active = 1`
        ).get(tableName);
        if (!tableRow) throw new Error(`[sutramEngine] Table "${tableName}" not found`);

        const colRow = this.db.prepare(
            `SELECT _id FROM sys_column WHERE table_id = ? AND column_name = ?`
        ).get(tableRow._id, columnName);
        if (!colRow) throw new Error(`[sutramEngine] Column "${columnName}" not found in "${tableName}"`);

        if (opts.field_type && !FIELD_TYPES.includes(opts.field_type)) {
            throw new Error(
                `[sutramEngine] Invalid field_type "${opts.field_type}".\n` +
                `Valid: ${FIELD_TYPES.join(', ')}`
            );
        }

        const exists = this.db.prepare(
            `SELECT _id FROM sys_column_ui WHERE column_id = ?`
        ).get(colRow._id);

        if (exists) {
            const fields = [];
            const vals = [];
            if (opts.label !== undefined) { fields.push('label = ?'); vals.push(opts.label); }
            if (opts.field_type !== undefined) { fields.push('field_type = ?'); vals.push(opts.field_type); }
            if (opts.display_format !== undefined) { fields.push('display_format = ?'); vals.push(opts.display_format); }
            if (opts.visible_list !== undefined) { fields.push('visible_list = ?'); vals.push(opts.visible_list ? 1 : 0); }
            if (opts.visible_form !== undefined) { fields.push('visible_form = ?'); vals.push(opts.visible_form ? 1 : 0); }
            if (opts.searchable !== undefined) { fields.push('searchable = ?'); vals.push(opts.searchable ? 1 : 0); }
            if (opts.sortable !== undefined) { fields.push('sortable = ?'); vals.push(opts.sortable ? 1 : 0); }
            if (opts.required_ui !== undefined) { fields.push('required_ui = ?'); vals.push(opts.required_ui ? 1 : 0); }
            if (opts.sort_order !== undefined) { fields.push('sort_order = ?'); vals.push(opts.sort_order); }
            fields.push('updated_at = ?');
            vals.push(new Date().toISOString());
            vals.push(exists._id);
            if (fields.length > 1) {
                this.db.prepare(`UPDATE sys_column_ui SET ${fields.join(', ')} WHERE _id = ?`).run(...vals);
            }
        } else {
            this.db.prepare(`
                INSERT INTO sys_column_ui
                  (column_id, table_id, label, field_type, display_format,
                   visible_list, visible_form, searchable, sortable, required_ui, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                colRow._id,
                tableRow._id,
                opts.label ?? null,
                opts.field_type ?? 'text',
                opts.display_format ?? null,
                opts.visible_list !== false ? 1 : 0,
                opts.visible_form !== false ? 1 : 0,
                opts.searchable ? 1 : 0,
                opts.sortable ? 1 : 0,
                opts.required_ui ? 1 : 0,
                opts.sort_order ?? 0,
            );
        }

        console.log(`[sutramEngine] ✓ Column UI set for "${tableName}.${columnName}"`);
    }

    // ═════════════════════════════════════════════════════════
    // ── BULK SET — importUi ───────────────────────────────────
    // ═════════════════════════════════════════════════════════
    // Import UI config from a ui.js definition file.
    // ui.js format:
    // module.exports = {
    //   product: {
    //     display_name: 'Products', icon: 'box', sort_order: 1,
    //     columns: {
    //       name:        { label: 'Product Name', searchable: true, sortable: true },
    //       category_id: { field_type: 'dropdown', display_format: '{name}' },
    //       unit_id:     { field_type: 'dropdown', display_format: '{unit_short} - {unit_full}' },
    //     }
    //   }
    // }

    importUi(uiConfig = {}) {
        let tables = 0;
        let columns = 0;

        for (const [tableName, def] of Object.entries(uiConfig)) {
            const { columns: colDefs, ...tableOpts } = def;

            // set table UI
            try {
                this.setTableUi(tableName, tableOpts);
                tables++;
            } catch (e) {
                console.warn(`[sutramEngine] importUi: skipping table "${tableName}" — ${e.message}`);
                continue;
            }

            // set column UIs
            for (const [colName, colOpts] of Object.entries(colDefs ?? {})) {
                try {
                    this.setColumnUi(tableName, colName, colOpts);
                    columns++;
                } catch (e) {
                    console.warn(`[sutramEngine] importUi: skipping "${tableName}.${colName}" — ${e.message}`);
                }
            }
        }

        console.log(`[sutramEngine] ✓ importUi — ${tables} tables, ${columns} columns`);
    }
}

module.exports = UiManager;
