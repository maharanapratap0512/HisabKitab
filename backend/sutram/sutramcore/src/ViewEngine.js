// src/ViewEngine.js — sutramcore
'use strict';

const BaseTable = require('./BaseTable');

/**
 * Handles complex SQLite VIEW materialization in two phases:
 * 1. Build column schemas for ALL views (top-down recursion).
 * 2. Create actual SQLite views via DFS (dependency order).
 */
class ViewEngine {

    static materialize(sutram) {
        const { db, schema } = sutram;
        const viewsToBuild = Object.entries(schema).filter(([, meta]) => meta.__isView);
        if (viewsToBuild.length === 0) return;

        // --- Phase 1: Build column schemas for ALL views ---
        for (const [viewName] of viewsToBuild) {
            this._buildViewColumns(viewName, schema);
        }

        // --- Phase 2: Create SQLite views via DFS ---
        const created = new Set();
        const visiting = new Set();

        const createViewRecursive = (viewName) => {
            const meta = schema[viewName];
            if (!meta || !meta.__isViewSQL) return; 
            if (created.has(viewName)) return;

            if (visiting.has(viewName)) {
                throw new Error(`[sutramcore] Circular dependency detected in views: ${[...visiting, viewName].join(' -> ')}`);
            }

            visiting.add(viewName);

            const sourceTable = meta.sourceTable;
            // Ensure source is created first if it's another view
            if (schema[sourceTable] && schema[sourceTable].__isViewSQL) {
                createViewRecursive(sourceTable);
            }

            // Generate and run CREATE VIEW
            const bt = new BaseTable(sourceTable, { db, schema });
            const [selectSQL] = bt._buildSelectFull({});
            const viewSQL = `CREATE VIEW IF NOT EXISTS "${viewName}" AS ${selectSQL}`;

            try {
                db.prepare(viewSQL).run();
                created.add(viewName);
                console.log(`[sutramcore] ✓ View "${viewName}" ready (source: "${sourceTable}")`);
            } catch (err) {
                throw new Error(`[sutramcore] View "${viewName}" creation failed: ${err.message}\nSQL: ${viewSQL.slice(0, 150)}...`);
            } finally {
                visiting.delete(viewName);
            }
        };

        for (const [viewName] of viewsToBuild) {
            createViewRecursive(viewName);
        }

        // --- Phase 3: Cleanup temporary markers ---
        for (const [, meta] of viewsToBuild) {
            delete meta.__isViewSQL;
            delete meta.sourceTable;
        }
    }

    static _buildViewColumns(viewName, schema) {
        const meta = schema[viewName];
        if (!meta || !meta.__isView || meta.columns) return;

        const sourceTable = meta.sourceTable;
        const sourceMeta = schema[sourceTable];

        if (!sourceMeta) {
            throw new Error(`[sutramcore] defineView("${viewName}"): source "${sourceTable}" not found in schema.`);
        }

        // Ensure parent view columns are built first
        if (sourceMeta.__isView && !sourceMeta.columns) {
            this._buildViewColumns(sourceTable, schema);
        }

        const viewColumns = {};
        // 1. Raw source columns
        for (const [col, def] of Object.entries(sourceMeta.columns)) {
            viewColumns[col] = { ...def };
        }
        // 2. hasOne JSON outputs
        for (const [, def] of Object.entries(sourceMeta.columns)) {
            if (!def.ref) continue;
            const outKey = def.as ?? def.ref.split('.')[0];
            viewColumns[outKey] = { type: 'json' };
        }
        // 3. hasMany/M2M JSON outputs
        for (const [joinKey, def] of Object.entries(sourceMeta.joins ?? {})) {
            const outKey = def.as ?? joinKey;
            viewColumns[outKey] = { type: 'json' };
        }

        meta.columns = viewColumns;
        meta.__isViewSQL = true; 
        delete meta.__isView;
    }
}

module.exports = ViewEngine;
