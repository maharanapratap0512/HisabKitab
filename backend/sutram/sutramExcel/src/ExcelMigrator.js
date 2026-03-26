// src/ExcelMigrator.js
// ─────────────────────────────────────────────────────────────
// Runs sutramexcel own migrations.
// Uses xls_meta.xls_version — never touches user_version or sys_meta.
// ─────────────────────────────────────────────────────────────

'use strict';

const migrations = require('./migrations/excel.migrations');

class ExcelMigrator {

    constructor(db) {
        this.db = db;
    }

    run() {
        // ensure xls_meta exists first
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS xls_meta (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        `).run();

        this.db.prepare(`
            INSERT OR IGNORE INTO xls_meta (key, value)
            VALUES ('xls_version', '0')
        `).run();

        const row     = this.db.prepare(`SELECT value FROM xls_meta WHERE key = 'xls_version'`).get();
        let   current = parseInt(row?.value ?? '0', 10);
        const target  = migrations.length;

        if (current >= target) return; // already up to date

        for (let v = current; v < target; v++) {
            const stmts = migrations[v];
            this.db.transaction(() => {
                for (const sql of stmts) {
                    this.db.prepare(sql).run();
                }
                this.db.prepare(`UPDATE xls_meta SET value = ? WHERE key = 'xls_version'`)
                    .run(String(v + 1));
            })();
            console.log(`[sutramexcel] ✓ Migration v${v + 1} applied`);
        }

        console.log(`[sutramexcel] Migrations done — xls_version: ${target}`);
    }
}

module.exports = ExcelMigrator;
