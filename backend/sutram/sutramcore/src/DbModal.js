// src/DbModal.js
// ─────────────────────────────────────────────────────────────
// Migration runner.
// Takes a dbPath + user's migrations array-of-arrays.
// Runs pending versions on startup.
// user_version pragma tracks applied versions.
//
// Usage (called internally by configure()):
//   const modal = new DbModal(dbPath, migrations, views);
//   modal.db  → ready better-sqlite3 instance
//
// Migration format — array of arrays:
//   module.exports = [
//       // version 1
//       [
//           `create table unit(...)`,
//           `create table item(...)`,
//       ],
//       // version 2
//       [
//           `alter table item add column min_rate decimal(7,2)`,
//           `DROP TRIGGER IF EXISTS "old_trigger"`,
//           `CREATE TRIGGER "new_trigger" ...`,
//       ],
//   ];
//
// Rules:
//   - Never edit past versions — always add a new array at the end
//   - Drop trigger BEFORE recreating it — put both in same version array
//   - Each version is its own transaction — partial failure rolls back only that version
// ─────────────────────────────────────────────────────────────

'use strict';

class DbModal {

    constructor(dbPath, migrations = [], views = []) {
        const Database = require('better-sqlite3');

        this.db = new Database(dbPath);
        console.log(`[sutramcore] Connected: ${dbPath}`);

        // pragmas before migration
        this.db.pragma('foreign_keys = OFF');
        this.db.pragma('legacy_alter_table = ON');

        this._runMigrations(migrations);
        this._runViews(views);

        // pragmas after migration
        this.db.pragma('legacy_alter_table = OFF');
        this.db.pragma('foreign_keys = ON');
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('synchronous = NORMAL');
        this.db.pragma('busy_timeout = 10000');

        console.log(`[sutramcore] DB ready — version ${migrations.length}`);
    }

    // ─────────────────────────────────────────────────────────
    _runMigrations(migrations) {
        const currentVersion = this.db.pragma('user_version', { simple: true });
        const targetVersion  = migrations.length;

        console.log(`[sutramcore] Migration: v${currentVersion} → v${targetVersion}`);
        if (currentVersion >= targetVersion) return;

        // slice — never mutate the user's array
        const pending = migrations.slice(currentVersion);

        let version = currentVersion;
        for (const sqlList of pending) {
            version++;

            if (!Array.isArray(sqlList)) {
                throw new Error(
                    `[sutramcore] Migration v${version} must be an array of SQL strings.\n` +
                    `Got: ${typeof sqlList}\n` +
                    `Hint: migrations = [ [...], [...] ] — each version is an array.`
                );
            }

            // each version in its own transaction — atomic per version
            const runVersion = this.db.transaction(() => {
                for (const sql of sqlList) {
                    this.db.prepare(sql).run();
                }
                // update version INSIDE transaction — atomic
                this.db.pragma(`user_version = ${version}`);
            });

            try {
                runVersion();
                console.log(`[sutramcore] ✓ v${version} applied (${sqlList.length} statements)`);
            } catch (err) {
                // throw hard — don't silently corrupt version tracking
                throw new Error(`[sutramcore] ✗ Migration v${version} failed: ${err.message}`);
            }
        }
    }

    // Views recreated on every startup — always idempotent (use CREATE IF NOT EXISTS)
    _runViews(views) {
        if (!views || views.length === 0) return;
        for (const sql of views) {
            try {
                this.db.prepare(sql).run();
            } catch (err) {
                throw new Error(`[sutramcore] View creation failed: ${err.message}\nSQL: ${sql.slice(0, 80)}...`);
            }
        }
        console.log(`[sutramcore] ✓ ${views.length} view(s) ready`);
    }
}

module.exports = DbModal;
