// src/migrations/excel.migrations.js
// ─────────────────────────────────────────────────────────────
// sutramexcel own migration list.
// Tracked via xls_meta.xls_version — separate from:
//   user_version pragma   (sutramCore user migrations)
//   sys_meta.engine_version (sutramEngine sys_ tables)
//
// Rules — same as sutramCore:
//   - Each version = array of SQL strings
//   - Never edit past versions — add new array at end
// ─────────────────────────────────────────────────────────────

module.exports = [

    // ── version 1 — xls_meta + xls_dictionary ─────────────────
    [
        // xls_meta — excel package version tracking
        `CREATE TABLE IF NOT EXISTS xls_meta (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )`,

        `INSERT OR IGNORE INTO xls_meta (key, value)
         VALUES ('xls_version', '0')`,

        // xls_dictionary — correction memory
        // "kulo" matched to unit._id=5 → save here
        // next import → "kulo" auto-resolved to 5
        `CREATE TABLE IF NOT EXISTS xls_dictionary (
            _id        INTEGER PRIMARY KEY AUTOINCREMENT,
            type       TEXT NOT NULL,
            name       TEXT NOT NULL,
            ref_id     TEXT,
            ref_id2    TEXT,
            extra_note TEXT,
            active     INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT DEFAULT (datetime('now', 'localtime')),
            UNIQUE(type, name)
        )`,
    ],

];
