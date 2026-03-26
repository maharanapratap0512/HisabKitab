// src/SchemaManager.js
// ─────────────────────────────────────────────────────────────
// Manages user-defined schema changes.
//
// Every write operation:
//   1. Writes to sys_ tables (persistent record)
//   2. Executes actual SQLite DDL (CREATE TABLE / ALTER TABLE)
//   3. Calls engine.rebootstrap() — rebuilds sutramCore cache
//
// Import/Export supports sutramCore schema.js format directly.
// All imports are idempotent — safe to call on every startup.
// ─────────────────────────────────────────────────────────────

'use strict';

class SchemaManager {

    constructor(db, rebootstrap) {
        this.db          = db;
        this.rebootstrap = rebootstrap; // callback → Engine.rebootstrap()
    }

    // ═════════════════════════════════════════════════════════
    // ── IMPORT ALL ────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    //
    // One call to register everything from your database/ files.
    //
    // Usage:
    //   engine.schema.importAll({
    //     schema:   require('./schema'),     // tableMeta object
    //     triggers: require('./triggers'),   // trigger array (optional)
    //     reports:  require('./reports'),    // report array  (optional)
    //   });

    importAll({ schema, triggers = [], reports = [] } = {}) {
        if (schema)            this.importSchema(schema);
        if (triggers?.length)  this._importTriggers(triggers);
        if (reports?.length)   this._importReports(reports);
        // single rebootstrap at the very end
        this.rebootstrap();
        console.log('[sutramEngine] ✓ importAll complete');
    }

    // ═════════════════════════════════════════════════════════
    // ── IMPORT SCHEMA ─────────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    //
    // Accepts sutramCore tableMeta format (defineTable / raw object).
    // For each table:
    //   - inserts into sys_table, sys_column, sys_join
    //   - executes CREATE TABLE IF NOT EXISTS
    //   - skips if table already in sys_table (idempotent)
    //
    // Usage:
    //   engine.schema.importSchema(require('./schema'));

    importSchema(tableMeta) {
        if (!tableMeta || typeof tableMeta !== 'object') {
            throw new Error('[sutramEngine] importSchema: tableMeta must be a plain object');
        }

        let imported = 0;
        let skipped  = 0;

        for (const [tableName, def] of Object.entries(tableMeta)) {
            if (tableName.startsWith('sys_')) continue; // never import sys_ tables

            const exists = this.db.prepare(
                `SELECT _id FROM sys_table WHERE table_name = ?`
            ).get(tableName);

            if (exists) {
                skipped++;
                continue;
            }

            const columns = this._parseColumns(def.columns ?? {});
            const joins   = this._parseJoins(def.joins ?? {});

            // createTable handles sys_ insert + DDL — no rebootstrap here
            // (importAll / importSchema calls it once at the end)
            this._createTableInternal(tableName, null, null, columns, joins);
            imported++;
        }

        console.log(`[sutramEngine] importSchema — imported: ${imported}, skipped: ${skipped}`);

        // rebootstrap only when called standalone (not via importAll)
        if (arguments[1] !== '_batch') this.rebootstrap();
    }

    // ═════════════════════════════════════════════════════════
    // ── IMPORT TRIGGERS ───────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    //
    // Accepts triggers.js array format.
    // Skips if trigger_name already in sys_trigger.
    //
    // Usage:
    //   engine.schema.importTriggers(require('./triggers'));

    importTriggers(triggers) {
        if (!Array.isArray(triggers)) {
            throw new Error('[sutramEngine] importTriggers: expects an array');
        }
        this._importTriggers(triggers);
        this.rebootstrap();
    }

    // ═════════════════════════════════════════════════════════
    // ── IMPORT REPORTS ────────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    //
    // Accepts reports.js array format.
    // Skips if report_name already in sys_report.
    //
    // Usage:
    //   engine.schema.importReports(require('./reports'));

    importReports(reports) {
        if (!Array.isArray(reports)) {
            throw new Error('[sutramEngine] importReports: expects an array');
        }
        this._importReports(reports);
        this.rebootstrap();
    }

    // ═════════════════════════════════════════════════════════
    // ── EXPORT ALL ────────────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    //
    // Returns all three in one call — exact format matching
    // the input files so it can be roundtripped.
    //
    // Usage:
    //   const { schema, triggers, reports } = engine.schema.exportAll();

    exportAll() {
        return {
            schema:   this.exportSchema(),
            triggers: this.exportTriggers(),
            reports:  this.exportReports(),
        };
    }

    // ═════════════════════════════════════════════════════════
    // ── EXPORT SCHEMA ─────────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    //
    // Returns tableMeta object — same format as schema.js.
    // Useful for debugging, or switching back to sutramCore.
    //
    // Usage:
    //   const schema = engine.schema.exportSchema();
    //   // { product: { columns: {...}, joins: {...} }, ... }

    exportSchema() {
        const tables  = this.db.prepare(
            `SELECT * FROM sys_table WHERE active = 1 AND is_system = 0 ORDER BY _id ASC`
        ).all();

        const result = {};

        for (const table of tables) {
            const cols = this.db.prepare(
                `SELECT * FROM sys_column WHERE table_id = ? AND active = 1 ORDER BY sort_order ASC`
            ).all(table._id);

            const joins = this.db.prepare(
                `SELECT * FROM sys_join WHERE table_id = ? AND active = 1`
            ).all(table._id);

            result[table.table_name] = {
                columns: this._exportColumns(cols),
                joins:   this._exportJoins(joins),
            };
        }

        return result;
    }

    // ═════════════════════════════════════════════════════════
    // ── EXPORT TRIGGERS ───────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    //
    // Returns triggers array — same format as triggers.js.
    //
    // Usage:
    //   const triggers = engine.schema.exportTriggers();

    exportTriggers() {
        const triggers = this.db.prepare(
            `SELECT * FROM sys_trigger ORDER BY _id ASC`
        ).all();

        return triggers.map(t => {
            const actions = this.db.prepare(
                `SELECT * FROM sys_trigger_action
                 WHERE trigger_id = ? ORDER BY sort_order ASC`
            ).all(t._id);

            const def = {
                trigger_name: t.trigger_name,
                label:        t.label,
                source_table: t.source_table,
                event:        t.event,
                active:       t.active === 1,
            };

            // only include condition fields if not 'always'
            if (t.condition_type !== 'always') {
                def.condition_type  = t.condition_type;
                if (t.condition_col)   def.condition_col   = t.condition_col;
                if (t.condition_value) def.condition_value = t.condition_value;
                if (t.condition_sql)   def.condition_sql   = t.condition_sql;
            }

            def.actions = actions.map(a => {
                const action = {
                    action_type: a.action_type,
                    sort_order:  a.sort_order,
                };
                if (a.target_table) action.target_table = a.target_table;
                if (a.field_map && a.field_map !== '{}') {
                    action.field_map = JSON.parse(a.field_map);
                }
                if (a.condition) action.condition = a.condition;
                if (a.raw_sql)   action.raw_sql   = a.raw_sql;
                return action;
            });

            return def;
        });
    }

    // ═════════════════════════════════════════════════════════
    // ── EXPORT REPORTS ────────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    //
    // Returns reports array — same format as reports.js.
    //
    // Usage:
    //   const reports = engine.schema.exportReports();

    exportReports() {
        return this.db.prepare(
            `SELECT * FROM sys_report ORDER BY _id ASC`
        ).all().map(r => ({
            report_name: r.report_name,
            label:       r.label,
            description: r.description,
            cte_sql:     r.cte_sql,
            params:      r.params ? JSON.parse(r.params) : [],
            active:      r.active === 1,
        }));
    }

    // ═════════════════════════════════════════════════════════
    // ── CREATE TABLE ──────────────────────────────────────────
    // ═════════════════════════════════════════════════════════
    //
    // Direct create — for SchemaManager.createTable() API.
    // def: {
    //   table_name, label?, description?,
    //   columns: [ { column_name, col_type, ... } ],
    //   joins?:  [ { join_type, join_key, ... } ]
    // }

    createTable(def) {
        const { table_name, label, description, columns = [], joins = [] } = def;

        if (!table_name) throw new Error('[sutramEngine] createTable: table_name required');
        if (columns.length === 0) throw new Error('[sutramEngine] createTable: at least one column required');
        if (table_name.startsWith('sys_')) {
            throw new Error(`[sutramEngine] Cannot use "sys_" prefix — reserved for engine`);
        }

        this._createTableInternal(table_name, label, description, columns, joins);
        this.rebootstrap();
        console.log(`[sutramEngine] ✓ Table "${table_name}" created`);
    }

    // ─────────────────────────────────────────────────────────
    // ADD COLUMN
    // col: { column_name, col_type, label?, is_required?,
    //        default_value?, ref_table?, ref_col?, ref_as?, ref_select? }

    addColumn(tableName, col) {
        if (!tableName || !col?.column_name) {
            throw new Error('[sutramEngine] addColumn: tableName and col.column_name required');
        }

        const tableRow = this._getTable(tableName);

        this.db.transaction(() => {
            const maxOrder = this.db.prepare(
                `SELECT MAX(sort_order) as m FROM sys_column WHERE table_id = ?`
            ).get(tableRow._id)?.m ?? -1;

            this._insertColumn(tableRow._id, col, maxOrder + 1);
            this.db.prepare(this._buildAlterAddColumn(tableName, col)).run();
        })();

        this.rebootstrap();
        console.log(`[sutramEngine] ✓ Column "${col.column_name}" added to "${tableName}"`);
    }

    // ─────────────────────────────────────────────────────────
    // DROP COLUMN

    dropColumn(tableName, columnName) {
        const tableRow = this._getTable(tableName);
        const colRow   = this.db.prepare(
            `SELECT * FROM sys_column WHERE table_id = ? AND column_name = ?`
        ).get(tableRow._id, columnName);

        if (!colRow)    throw new Error(`[sutramEngine] Column "${columnName}" not found in "${tableName}"`);
        if (colRow.is_pk) throw new Error(`[sutramEngine] Cannot drop primary key column`);

        this.db.transaction(() => {
            this.db.prepare(`DELETE FROM sys_column WHERE _id = ?`).run(colRow._id);
            this.db.prepare(`ALTER TABLE "${tableName}" DROP COLUMN "${columnName}"`).run();
        })();

        this.rebootstrap();
        console.log(`[sutramEngine] ✓ Column "${columnName}" dropped from "${tableName}"`);
    }

    // ─────────────────────────────────────────────────────────
    // ADD JOIN
    // join: { join_type, join_key, child_table, fk_col,
    //         target_col, as_name, junction_table?, select_cols? }

    addJoin(tableName, join) {
        const tableRow = this._getTable(tableName);
        this.db.transaction(() => this._insertJoin(tableRow._id, join))();
        this.rebootstrap();
        console.log(`[sutramEngine] ✓ Join "${join.join_key}" added to "${tableName}"`);
    }

    // ─────────────────────────────────────────────────────────
    // REMOVE JOIN

    removeJoin(tableName, joinKey) {
        const tableRow = this._getTable(tableName);
        const joinRow  = this.db.prepare(
            `SELECT * FROM sys_join WHERE table_id = ? AND join_key = ?`
        ).get(tableRow._id, joinKey);

        if (!joinRow) throw new Error(`[sutramEngine] Join "${joinKey}" not found in "${tableName}"`);

        this.db.prepare(`DELETE FROM sys_join WHERE _id = ?`).run(joinRow._id);
        this.rebootstrap();
        console.log(`[sutramEngine] ✓ Join "${joinKey}" removed from "${tableName}"`);
    }

    // ─────────────────────────────────────────────────────────
    // DROP TABLE

    dropTable(tableName) {
        const tableRow = this._getTable(tableName);
        if (tableRow.is_system) throw new Error(`[sutramEngine] Cannot drop system table "${tableName}"`);

        this.db.transaction(() => {
            this.db.prepare(`DELETE FROM sys_table WHERE _id = ?`).run(tableRow._id);
            this.db.prepare(`DROP TABLE IF EXISTS "${tableName}"`).run();
        })();

        this.rebootstrap();
        console.log(`[sutramEngine] ✓ Table "${tableName}" dropped`);
    }

    // ─────────────────────────────────────────────────────────
    // LIST

    getTables() {
        return this.db.prepare(
            `SELECT * FROM sys_table WHERE active = 1 ORDER BY _id ASC`
        ).all();
    }

    getTableDetail(tableName) {
        const tableRow = this._getTable(tableName);
        const columns  = this.db.prepare(
            `SELECT * FROM sys_column WHERE table_id = ? AND active = 1 ORDER BY sort_order ASC`
        ).all(tableRow._id);
        const joins    = this.db.prepare(
            `SELECT * FROM sys_join WHERE table_id = ? AND active = 1`
        ).all(tableRow._id);
        return { ...tableRow, columns, joins };
    }

    // ═════════════════════════════════════════════════════════
    // ── PRIVATE — IMPORT HELPERS ──────────────────────────────
    // ═════════════════════════════════════════════════════════

    _importTriggers(triggers) {
        let imported = 0;
        let skipped  = 0;

        for (const def of triggers) {
            if (!def.trigger_name) {
                console.warn('[sutramEngine] importTriggers: skipping entry without trigger_name');
                continue;
            }

            const exists = this.db.prepare(
                `SELECT _id FROM sys_trigger WHERE trigger_name = ?`
            ).get(def.trigger_name);

            if (exists) { skipped++; continue; }

            this.db.transaction(() => {
                const res = this.db.prepare(`
                    INSERT INTO sys_trigger
                      (trigger_name, label, source_table, event,
                       condition_type, condition_col, condition_value, condition_sql)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    def.trigger_name,
                    def.label          ?? def.trigger_name,
                    def.source_table,
                    def.event.toUpperCase(),
                    def.condition_type  ?? 'always',
                    def.condition_col   ?? null,
                    def.condition_value ?? null,
                    def.condition_sql   ?? null,
                );

                const triggerId = res.lastInsertRowid;

                for (let i = 0; i < (def.actions ?? []).length; i++) {
                    const a = def.actions[i];
                    this.db.prepare(`
                        INSERT INTO sys_trigger_action
                          (trigger_id, sort_order, action_type, target_table,
                           field_map, condition, raw_sql)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `).run(
                        triggerId,
                        a.sort_order ?? i,
                        a.action_type,
                        a.target_table ?? null,
                        a.field_map ? JSON.stringify(a.field_map) : '{}',
                        a.condition ?? null,
                        a.raw_sql   ?? null,
                    );
                }
            })();

            imported++;
        }

        console.log(`[sutramEngine] importTriggers — imported: ${imported}, skipped: ${skipped}`);
    }

    _importReports(reports) {
        let imported = 0;
        let skipped  = 0;

        for (const def of reports) {
            if (!def.report_name) {
                console.warn('[sutramEngine] importReports: skipping entry without report_name');
                continue;
            }

            const exists = this.db.prepare(
                `SELECT _id FROM sys_report WHERE report_name = ?`
            ).get(def.report_name);

            if (exists) { skipped++; continue; }

            this.db.prepare(`
                INSERT INTO sys_report (report_name, label, description, cte_sql, params)
                VALUES (?, ?, ?, ?, ?)
            `).run(
                def.report_name,
                def.label       ?? def.report_name,
                def.description ?? null,
                def.cte_sql,
                JSON.stringify(def.params ?? []),
            );

            imported++;
        }

        console.log(`[sutramEngine] importReports — imported: ${imported}, skipped: ${skipped}`);
    }

    // ═════════════════════════════════════════════════════════
    // ── PRIVATE — PARSE (sutramCore format → array format) ────
    // ═════════════════════════════════════════════════════════

    // tableMeta columns object → sys_column insert-ready array
    _parseColumns(columns) {
        return Object.entries(columns).map(([column_name, def], i) => ({
            column_name,
            label:         def.label ?? column_name,
            col_type:      def.type ?? 'string',
            is_pk:         column_name === '_id' ? 1 : 0,
            is_required:   def.required ? 1 : 0,
            default_value: def.default !== undefined ? String(def.default) : null,
            ref_table:     def.ref ? def.ref.split('.')[0] : null,
            ref_col:       def.ref ? def.ref.split('.')[1] : null,
            ref_as:        def.as  ?? null,
            ref_select:    def.select
                               ? JSON.stringify(Array.isArray(def.select) ? def.select : [def.select])
                               : null,
            sort_order:    i,
        }));
    }

    // tableMeta joins object → sys_join insert-ready array
    _parseJoins(joins) {
        return Object.entries(joins).map(([join_key, def]) => ({
            join_key,
            join_type:      def.hasMany ? 'hasMany' : 'manyToMany',
            child_table:    def.table,
            fk_col:         def.on,
            target_col:     def.target,
            as_name:        def.as ?? join_key,
            junction_table: def.junction ?? null,
            select_cols:    Array.isArray(def.select)
                                ? JSON.stringify(def.select)
                                : '["*"]',
        }));
    }

    // ═════════════════════════════════════════════════════════
    // ── PRIVATE — EXPORT (sys_ rows → sutramCore format) ──────
    // ═════════════════════════════════════════════════════════

    _exportColumns(cols) {
        const result = {};

        for (const col of cols) {
            const def = { type: col.col_type };

            if (col.default_value !== null && col.default_value !== undefined) {
                def.default = this._parseDefault(col.col_type, col.default_value);
            }
            if (col.is_required) def.required = true;
            if (col.ref_table && col.ref_col) {
                def.ref    = `${col.ref_table}.${col.ref_col}`;
                def.as     = col.ref_as ?? col.ref_table;
                def.select = col.ref_select ? JSON.parse(col.ref_select) : '*';
            }

            result[col.column_name] = def;
        }

        return result;
    }

    _exportJoins(joins) {
        const result = {};

        for (const join of joins) {
            const selectCols = join.select_cols ? JSON.parse(join.select_cols) : '*';

            if (join.join_type === 'hasMany') {
                result[join.join_key] = {
                    hasMany: true,
                    table:   join.child_table,
                    on:      join.fk_col,
                    target:  join.target_col,
                    as:      join.as_name,
                    select:  selectCols,
                };
            } else if (join.join_type === 'manyToMany') {
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

    // ═════════════════════════════════════════════════════════
    // ── PRIVATE — CORE DDL ────────────────────────────────────
    // ═════════════════════════════════════════════════════════

    // Internal create — no rebootstrap (caller decides when)
    _createTableInternal(tableName, label, description, columns, joins) {
        this.db.transaction(() => {
            const tableRes = this.db.prepare(`
                INSERT INTO sys_table (table_name, label, description)
                VALUES (?, ?, ?)
            `).run(tableName, label ?? tableName, description ?? null);

            const tableId = tableRes.lastInsertRowid;

            for (let i = 0; i < columns.length; i++) {
                this._insertColumn(tableId, columns[i], columns[i].sort_order ?? i);
            }

            for (const join of joins) {
                this._insertJoin(tableId, join);
            }

            // build + run CREATE TABLE
            this.db.prepare(this._buildCreateSQL(tableName, columns)).run();
        })();
    }

    _insertColumn(tableId, col, sortOrder) {
        this.db.prepare(`
            INSERT INTO sys_column
              (table_id, column_name, label, col_type, is_required, default_value,
               is_pk, ref_table, ref_col, ref_as, ref_select, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            tableId,
            col.column_name,
            col.label         ?? col.column_name,
            col.col_type      ?? 'string',
            col.is_required   ? 1 : 0,
            col.default_value !== undefined ? String(col.default_value) : null,
            col.is_pk         ? 1 : 0,
            col.ref_table     ?? null,
            col.ref_col       ?? null,
            col.ref_as        ?? null,
            col.ref_select    ?? null,
            sortOrder,
        );
    }

    _insertJoin(tableId, join) {
        if (!join.join_type || !join.join_key || !join.child_table) {
            throw new Error('[sutramEngine] join requires: join_type, join_key, child_table');
        }
        if (join.join_type === 'manyToMany' && !join.junction_table) {
            throw new Error('[sutramEngine] manyToMany join requires junction_table');
        }

        this.db.prepare(`
            INSERT INTO sys_join
              (table_id, join_type, join_key, child_table, junction_table,
               fk_col, target_col, as_name, select_cols)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            tableId,
            join.join_type,
            join.join_key,
            join.child_table,
            join.junction_table ?? null,
            join.fk_col,
            join.target_col,
            join.as_name ?? join.join_key,
            join.select_cols ?? '["*"]',
        );
    }

    _buildCreateSQL(tableName, columns) {
        const parts = [];

        for (const col of columns) {
            if (col.is_pk || col.column_name === '_id') {
                parts.push(`"${col.column_name}" INTEGER PRIMARY KEY AUTOINCREMENT`);
                continue;
            }

            let colDef = `"${col.column_name}"`;

            switch (col.col_type) {
                case 'number':  colDef += ' DECIMAL(10,2)'; break;
                case 'boolean': colDef += ' TINYINT';       break;
                case 'json':    colDef += ' TEXT';          break;
                default:        colDef += ' TEXT';
            }

            if (col.is_required) colDef += ' NOT NULL';

            if (col.default_value !== undefined && col.default_value !== null) {
                const dv = col.col_type === 'string'
                    ? `'${col.default_value}'`
                    : col.default_value;
                colDef += ` DEFAULT ${dv}`;
            }

            if (col.ref_table && col.ref_col) {
                colDef += ` REFERENCES "${col.ref_table}"("${col.ref_col}")`;
            }

            parts.push(colDef);
        }

        // always add timestamps
        parts.push(`"created_at" TEXT DEFAULT (datetime('now', 'localtime'))`);
        parts.push(`"updated_at" TEXT DEFAULT (datetime('now', 'localtime'))`);

        return `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${parts.join(',\n  ')}\n)`;
    }

    _buildAlterAddColumn(tableName, col) {
        let def = `ALTER TABLE "${tableName}" ADD COLUMN "${col.column_name}"`;

        switch (col.col_type) {
            case 'number':  def += ' DECIMAL(10,2)'; break;
            case 'boolean': def += ' TINYINT';       break;
            case 'json':    def += ' TEXT';          break;
            default:        def += ' TEXT';
        }

        if (col.default_value !== undefined && col.default_value !== null) {
            const dv = col.col_type === 'string' ? `'${col.default_value}'` : col.default_value;
            def += ` DEFAULT ${dv}`;
        }

        if (col.ref_table && col.ref_col) {
            def += ` REFERENCES "${col.ref_table}"("${col.ref_col}")`;
        }

        return def;
    }

    _getTable(tableName) {
        const row = this.db.prepare(
            `SELECT * FROM sys_table WHERE table_name = ? AND active = 1`
        ).get(tableName);
        if (!row) throw new Error(`[sutramEngine] Table "${tableName}" not found in sys_table`);
        return row;
    }

    _parseDefault(type, raw) {
        if (raw === null || raw === undefined) return undefined;
        if (type === 'number')  return Number(raw);
        if (type === 'boolean') return raw === 'true' || raw === '1' ? 1 : 0;
        if (type === 'json')    { try { return JSON.parse(raw); } catch { return null; } }
        return raw;
    }
}

module.exports = SchemaManager;
