// src/migrations/sys.migrations.js
// ─────────────────────────────────────────────────────────────
// Engine's own migration list — stored in sys_meta.engine_version
// NOT in user_version pragma (that belongs to sutramCore / user migrations)
//
// Rules:
//   - Each version = array of SQL strings
//   - Never edit past versions — add new array at end
//   - Drop + recreate in SAME version array
// ─────────────────────────────────────────────────────────────

module.exports = [

    // ── version 1 — all sys_ tables ───────────────────────────
    [
        // sys_meta — engine version tracking
        `CREATE TABLE IF NOT EXISTS sys_meta (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )`,

        `INSERT OR IGNORE INTO sys_meta (key, value) VALUES ('engine_version', '0')`,

        // sys_table — table registry
        `CREATE TABLE IF NOT EXISTS sys_table (
            _id          INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name   TEXT NOT NULL UNIQUE,
            label        TEXT,
            description  TEXT,
            is_system    INTEGER DEFAULT 0,
            active       INTEGER DEFAULT 1,
            created_at   TEXT DEFAULT (datetime('now', 'localtime')),
            updated_at   TEXT DEFAULT (datetime('now', 'localtime'))
        )`,

        // sys_column — column definitions per table
        `CREATE TABLE IF NOT EXISTS sys_column (
            _id            INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id       INTEGER NOT NULL REFERENCES sys_table(_id) ON DELETE CASCADE,
            column_name    TEXT NOT NULL,
            label          TEXT,
            col_type       TEXT NOT NULL CHECK(col_type IN ('number','string','boolean','json')),
            is_required    INTEGER DEFAULT 0,
            default_value  TEXT,
            is_pk          INTEGER DEFAULT 0,
            ref_table      TEXT,
            ref_col        TEXT,
            ref_as         TEXT,
            ref_select     TEXT,
            sort_order     INTEGER DEFAULT 0,
            active         INTEGER DEFAULT 1,
            created_at     TEXT DEFAULT (datetime('now', 'localtime')),
            UNIQUE(table_id, column_name)
        )`,

        // sys_join — hasMany and manyToMany relations
        `CREATE TABLE IF NOT EXISTS sys_join (
            _id            INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id       INTEGER NOT NULL REFERENCES sys_table(_id) ON DELETE CASCADE,
            join_type      TEXT NOT NULL CHECK(join_type IN ('hasMany','manyToMany')),
            join_key       TEXT NOT NULL,
            child_table    TEXT NOT NULL,
            junction_table TEXT,
            fk_col         TEXT NOT NULL,
            target_col     TEXT NOT NULL,
            as_name        TEXT NOT NULL,
            select_cols    TEXT NOT NULL DEFAULT '["*"]',
            active         INTEGER DEFAULT 1,
            created_at     TEXT DEFAULT (datetime('now', 'localtime')),
            UNIQUE(table_id, join_key)
        )`,

        // sys_trigger — trigger definitions
        `CREATE TABLE IF NOT EXISTS sys_trigger (
            _id              INTEGER PRIMARY KEY AUTOINCREMENT,
            trigger_name     TEXT NOT NULL UNIQUE,
            label            TEXT,
            source_table     TEXT NOT NULL,
            event            TEXT NOT NULL CHECK(event IN ('INSERT','UPDATE','DELETE')),
            condition_type   TEXT DEFAULT 'always'
                             CHECK(condition_type IN ('always','when_col_equals','raw_sql')),
            condition_col    TEXT,
            condition_value  TEXT,
            condition_sql    TEXT,
            active           INTEGER DEFAULT 1,
            created_at       TEXT DEFAULT (datetime('now', 'localtime')),
            updated_at       TEXT DEFAULT (datetime('now', 'localtime'))
        )`,

        // sys_trigger_action — actions per trigger (ordered)
        `CREATE TABLE IF NOT EXISTS sys_trigger_action (
            _id          INTEGER PRIMARY KEY AUTOINCREMENT,
            trigger_id   INTEGER NOT NULL REFERENCES sys_trigger(_id) ON DELETE CASCADE,
            sort_order   INTEGER DEFAULT 0,
            action_type  TEXT NOT NULL CHECK(action_type IN ('insert_row','update_row','delete_row','raw_sql')),
            target_table TEXT,
            field_map    TEXT DEFAULT '{}',
            condition    TEXT,
            raw_sql      TEXT,
            active       INTEGER DEFAULT 1
        )`,

        // sys_report — named CTE reports + stored procedure support
        `CREATE TABLE IF NOT EXISTS sys_report (
            _id             INTEGER PRIMARY KEY AUTOINCREMENT,
            report_name     TEXT NOT NULL UNIQUE,
            label           TEXT,
            description     TEXT,
            report_type     TEXT NOT NULL DEFAULT 'cte'
                            CHECK(report_type IN ('cte','procedure')),
            cte_sql         TEXT,
            procedure_name  TEXT,
            params          TEXT DEFAULT '[]',
            active          INTEGER DEFAULT 1,
            created_at      TEXT DEFAULT (datetime('now', 'localtime')),
            updated_at      TEXT DEFAULT (datetime('now', 'localtime'))
        )`,

        // sys_table_ui — frontend display config per table
        `CREATE TABLE IF NOT EXISTS sys_table_ui (
            _id          INTEGER PRIMARY KEY AUTOINCREMENT,
            table_id     INTEGER NOT NULL UNIQUE REFERENCES sys_table(_id) ON DELETE CASCADE,
            display_name TEXT,
            icon         TEXT,
            sort_order   INTEGER DEFAULT 0,
            visible      INTEGER DEFAULT 1,
            can_add      INTEGER DEFAULT 1,
            can_edit     INTEGER DEFAULT 1,
            can_delete   INTEGER DEFAULT 1,
            updated_at   TEXT DEFAULT (datetime('now', 'localtime'))
        )`,

        // sys_column_ui — frontend display config per column
        `CREATE TABLE IF NOT EXISTS sys_column_ui (
            _id             INTEGER PRIMARY KEY AUTOINCREMENT,
            column_id       INTEGER NOT NULL UNIQUE REFERENCES sys_column(_id) ON DELETE CASCADE,
            table_id        INTEGER NOT NULL REFERENCES sys_table(_id) ON DELETE CASCADE,
            label           TEXT,
            field_type      TEXT DEFAULT 'text',
            display_format  TEXT,
            visible_list    INTEGER DEFAULT 1,
            visible_form    INTEGER DEFAULT 1,
            searchable      INTEGER DEFAULT 0,
            sortable        INTEGER DEFAULT 0,
            required_ui     INTEGER DEFAULT 0,
            sort_order      INTEGER DEFAULT 0,
            updated_at      TEXT DEFAULT (datetime('now', 'localtime'))
        )`,

    ],

];
