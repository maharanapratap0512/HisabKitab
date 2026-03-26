// src/SysMigrator.js
// ─────────────────────────────────────────────────────────────
// Runs sutramEngine's own sys_ migrations.
// Uses sys_meta table for version tracking (NOT user_version pragma)
// so it never conflicts with sutramCore / user migrations.
// ─────────────────────────────────────────────────────────────

'use strict';

const sysMigrations = require('./migrations/sys.migrations');

class SysMigrator {

    constructor(db) {
        this.db = db;
    }

    run() {
        // ── Step 1: ensure sys_meta exists ────────────────────
        // This is the only bootstrapping chicken-and-egg problem.
        // We need sys_meta to track versions, but sys_meta itself
        // is created in version 1. So we run version 1 manually
        // before we can read the version from sys_meta.
        this.db.pragma('foreign_keys = OFF');
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS sys_meta (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        `).run();
        this.db.prepare(`
            INSERT OR IGNORE INTO sys_meta (key, value)
            VALUES ('engine_version', '0')
        `).run();
        this.db.pragma('foreign_keys = ON');

        // ── Step 2: read current engine version ───────────────
        const currentVersion = Number(
            this.db.prepare(`SELECT value FROM sys_meta WHERE key = 'engine_version'`)
                .get()?.value ?? 0
        );
        const targetVersion = sysMigrations.length;

        console.log(`[sutramEngine] Migrations: v${currentVersion} → v${targetVersion}`);
        if (currentVersion >= targetVersion) return;

        // ── Step 3: run pending versions ──────────────────────
        const pending = sysMigrations.slice(currentVersion);
        let version   = currentVersion;

        for (const sqlList of pending) {
            version++;

            if (!Array.isArray(sqlList)) {
                throw new Error(
                    `[sutramEngine] Migration v${version} must be an array of SQL strings.`
                );
            }

            const runVersion = this.db.transaction(() => {
                for (const sql of sqlList) {
                    this.db.prepare(sql).run();
                }
                // update engine_version INSIDE transaction — atomic
                this.db.prepare(
                    `UPDATE sys_meta SET value = ? WHERE key = 'engine_version'`
                ).run(String(version));
            });

            try {
                runVersion();
                console.log(`[sutramEngine] ✓ sys migration v${version} applied`);
            } catch (err) {
                throw new Error(`[sutramEngine] ✗ sys migration v${version} failed: ${err.message}`);
            }
        }
    }
}

module.exports = SysMigrator;
