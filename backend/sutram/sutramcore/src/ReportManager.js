// src/ReportManager.js — sutramcore
// ─────────────────────────────────────────────────────────────
// Manages CTE reports for sutramCore (SQLite, sync).
// Same pattern as sutramcore-mysql's MySQLReportManager
// but sync — returns values directly (no Promise).
//
// Loaded via Sutram constructor:
//   const sewa = new Sutram({ db, schema, reports });
//   sewa.procedure('monthly_sales').run({ from: '2024-01' });
//
// report format (reports.js):
// [
//   {
//     report_name: 'monthly_sales',
//     report_type: 'cte',          // only 'cte' in sutramCore
//     cte_sql:     'SELECT ...',
//     params: [
//       { name: 'from', type: 'string', default: '2024-01-01' }
//     ]
//   }
// ]
// ─────────────────────────────────────────────────────────────

'use strict';

const ProcedureHandle = require('./ProcedureHandle');

class ReportManager {

    constructor(db) {
        this.db              = db;
        this._cache          = {};
        this._procedureCache = {};
    }

    // ─────────────────────────────────────────────────────────
    // LOAD FROM ARRAY
    // Called by Sutram constructor when reports[] passed
    // ─────────────────────────────────────────────────────────

    loadFromArray(reports = []) {
        this._cache          = {};
        this._procedureCache = {};

        for (const report of reports) {
            if (!report.report_name) continue;
            if (report.active === false) continue;

            const type = report.report_type ?? 'cte';

            // sutramCore only supports CTE
            if (type !== 'cte') {
                console.warn(
                    `[sutramcore] Report "${report.report_name}" type "${type}" not supported in sutramCore (SQLite). ` +
                    `Use sutramcore-mysql for stored procedures.`
                );
                continue;
            }

            if (!report.cte_sql) continue;

            this._cache[report.report_name] = {
                ...report,
                report_type: 'cte',
                params:      report.params ?? [],
            };
        }

        const count = Object.keys(this._cache).length;
        console.log(`[sutramcore] ✓ ${count} report(s) loaded`);
    }

    // ─────────────────────────────────────────────────────────
    // PROCEDURE() — same pattern as table()
    // Returns cached ProcedureHandle
    // ─────────────────────────────────────────────────────────

    procedure(name) {
        if (!this._procedureCache[name]) {
            const def = this._cache[name];
            if (!def) throw new Error(
                `[sutramcore] Report "${name}" not found.\n` +
                `Available: ${Object.keys(this._cache).join(', ') || '(none)'}`
            );
            this._procedureCache[name] = new ProcedureHandle(
                name, def, (n, params) => this.run(n, params)
            );
        }
        return this._procedureCache[name];
    }

    // ─────────────────────────────────────────────────────────
    // RUN — execute CTE with :named params
    // Sync — returns rows directly
    // ─────────────────────────────────────────────────────────

    run(reportName, params = {}) {
        const report = this._cache[reportName];
        if (!report) throw new Error(`[sutramcore] Report "${reportName}" not found`);

        // apply defaults
        const finalParams = {};
        for (const p of report.params) {
            finalParams[p.name] = params[p.name] !== undefined
                ? params[p.name]
                : (p.default ?? null);
        }

        // validate required
        for (const p of report.params) {
            if (p.required && finalParams[p.name] === null) {
                throw new Error(`[sutramcore] Report "${reportName}" missing required param: ${p.name}`);
            }
        }

        try {
            return this.db.prepare(report.cte_sql).all(finalParams);
        } catch (err) {
            throw new Error(`[sutramcore] Report "${reportName}" failed: ${err.message}`);
        }
    }

    // ─────────────────────────────────────────────────────────
    // LIST
    // ─────────────────────────────────────────────────────────

    getReports() {
        return Object.values(this._cache).map(r => ({
            report_name: r.report_name,
            label:       r.label ?? r.report_name,
            report_type: r.report_type,
            params:      r.params,
        }));
    }
}

module.exports = ReportManager;
