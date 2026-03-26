// src/ReportManager.js
// ─────────────────────────────────────────────────────────────
// Manages named CTE reports stored in sys_report.
// Reports are SQL queries (CTEs, aggregations, joins) with
// optional named parameters.
//
// Usage:
//   engine.report.create({
//     report_name: 'monthly_sales',
//     cte_sql: `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
//               FROM orders WHERE date >= :from AND date <= :to`,
//     params: [
//       { name: 'from', type: 'string', default: '2024-01-01' },
//       { name: 'to',   type: 'string', default: '2024-12-31' },
//     ]
//   });
//
//   engine.report.run('monthly_sales', { from: '2024-06-01', to: '2024-06-30' });
// ─────────────────────────────────────────────────────────────

'use strict';

const ProcedureHandle = require('./ProcedureHandle');

class ReportManager {

    constructor(db) {
        this.db     = db;
        this._cache = {}; // { report_name: { ...report, params: [...] } }
    }

    // ─────────────────────────────────────────────────────────
    // LOAD FROM sys_ TABLES — managed mode
    // ─────────────────────────────────────────────────────────

    load() {
        this._cache = {};
        this._procedureCache = {};  // clear on reload

        const reports = this.db.prepare(
            `SELECT * FROM sys_report WHERE active = 1`
        ).all();

        for (const report of reports) {
            this._cache[report.report_name] = {
                ...report,
                report_type:    report.report_type    ?? 'cte',
                procedure_name: report.procedure_name ?? null,
                params:         report.params ? JSON.parse(report.params) : [],
            };
        }

        console.log(`[sutramEngine] ✓ ${reports.length} report(s) loaded from sys_`);
    }

    // ─────────────────────────────────────────────────────────
    // PROCEDURE() — table() jaisi pattern
    // Returns cached ProcedureHandle for a report/procedure name
    // ─────────────────────────────────────────────────────────

    procedure(name) {
        if (!this._procedureCache) this._procedureCache = {};

        if (!this._procedureCache[name]) {
            const def = this._cache[name];
            if (!def) throw new Error(
                `[sutramEngine] Procedure/Report "${name}" not found.\n` +
                `Available: ${Object.keys(this._cache).join(', ') || '(none)'}`
            );
            // runner fn — calls this.run() which handles cte/procedure
            this._procedureCache[name] = new ProcedureHandle(
                name, def, (n, params) => this.run(n, params)
            );
        }

        return this._procedureCache[name];
    }

    // ─────────────────────────────────────────────────────────
    // LOAD FROM ARRAY — direct mode
    // Accepts same format as reports.js
    // ─────────────────────────────────────────────────────────

    loadFromArray(reports = []) {
        this._cache = {};
        this._procedureCache = {};  // clear on reload

        for (const report of reports) {
            if (!report.report_name) continue;
            if (report.active === false) continue;

            const type = report.report_type ?? 'cte';

            // cte requires cte_sql, procedure requires procedure_name
            if (type === 'cte'       && !report.cte_sql)       continue;
            if (type === 'procedure' && !report.procedure_name) continue;

            this._cache[report.report_name] = {
                ...report,
                report_type:    type,
                procedure_name: report.procedure_name ?? null,
                params:         report.params ?? [],
            };
        }

        console.log(`[sutramEngine] ✓ ${Object.keys(this._cache).length} report(s) loaded from array`);
    }

    // ─────────────────────────────────────────────────────────
    // CREATE REPORT
    // def: {
    //   report_name, label?, description?,
    //   cte_sql,
    //   params?: [ { name, type, default? } ]
    // }
    // ─────────────────────────────────────────────────────────

    create(def) {
        if (!def.report_name) throw new Error('[sutramEngine] report_name required');

        const type = def.report_type ?? 'cte';

        if (type === 'cte' && !def.cte_sql) {
            throw new Error('[sutramEngine] cte_sql required for type "cte"');
        }
        if (type === 'procedure' && !def.procedure_name) {
            throw new Error('[sutramEngine] procedure_name required for type "procedure"');
        }

        const params = JSON.stringify(def.params ?? []);

        this.db.prepare(`
            INSERT INTO sys_report
              (report_name, label, description, report_type, cte_sql, procedure_name, params)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            def.report_name,
            def.label          ?? def.report_name,
            def.description    ?? null,
            type,
            def.cte_sql        ?? null,
            def.procedure_name ?? null,
            params,
        );

        this.load();
        console.log(`[sutramEngine] ✓ Report "${def.report_name}" created (type: ${type})`);
    }

    // ─────────────────────────────────────────────────────────
    // UPDATE REPORT (replace SQL or params)
    // ─────────────────────────────────────────────────────────

    update(reportName, updates) {
        const report = this._getReport(reportName);

        const fields = [];
        const values = [];

        if (updates.cte_sql)     { fields.push('cte_sql = ?');     values.push(updates.cte_sql); }
        if (updates.label)       { fields.push('label = ?');       values.push(updates.label); }
        if (updates.description) { fields.push('description = ?'); values.push(updates.description); }
        if (updates.params)      { fields.push('params = ?');      values.push(JSON.stringify(updates.params)); }
        fields.push('updated_at = ?');
        values.push(new Date().toISOString());

        if (fields.length === 1) return; // only updated_at — nothing to do

        this.db.prepare(
            `UPDATE sys_report SET ${fields.join(', ')} WHERE _id = ?`
        ).run(...values, report._id);

        this.load();
        console.log(`[sutramEngine] ✓ Report "${reportName}" updated`);
    }

    // ─────────────────────────────────────────────────────────
    // DELETE REPORT
    // ─────────────────────────────────────────────────────────

    delete(reportName) {
        const report = this._getReport(reportName);
        this.db.prepare(`DELETE FROM sys_report WHERE _id = ?`).run(report._id);
        this.load();
        console.log(`[sutramEngine] ✓ Report "${reportName}" deleted`);
    }

    // ─────────────────────────────────────────────────────────
    // RUN REPORT
    // params: { from: '2024-01-01', to: '2024-12-31' }
    // Returns array of result rows.
    // ─────────────────────────────────────────────────────────

    run(reportName, params = {}) {
        const report = this._cache[reportName];
        if (!report) throw new Error(`[sutramEngine] Report "${reportName}" not found`);

        // apply defaults for missing params
        const finalParams = {};
        for (const p of report.params) {
            finalParams[p.name] = params[p.name] !== undefined
                ? params[p.name]
                : (p.default ?? null);
        }

        // validate required params
        for (const p of report.params) {
            if (p.required && finalParams[p.name] === null) {
                throw new Error(`[sutramEngine] Report "${reportName}" missing required param: ${p.name}`);
            }
        }

        try {
            if (report.report_type === 'procedure') {
                return this._runProcedure(report, finalParams);
            } else {
                return this._runCTE(report, finalParams);
            }
        } catch (err) {
            throw new Error(`[sutramEngine] Report "${reportName}" failed: ${err.message}`);
        }
    }

    _runCTE(report, finalParams) {
        // SQLite — :name style params
        const stmt = this.db.prepare(report.cte_sql);
        return stmt.all(finalParams);
    }

    _runProcedure(report, finalParams) {
        // SQLite does not support stored procedures
        // This path is for MySQL via sutramcore-mysql adapter
        // Engine in SQLite mode should not have procedure reports
        throw new Error(
            `[sutramEngine] Stored procedure "${report.procedure_name}" cannot run on SQLite.\n` +
            `Procedures are MySQL only — use sutramcore-mysql with MySQLReportManager.`
        );
    }

    // ─────────────────────────────────────────────────────────
    // LIST REPORTS
    // ─────────────────────────────────────────────────────────

    getReports() {
        return this.db.prepare(
            `SELECT _id, report_name, label, description, params, active FROM sys_report ORDER BY _id ASC`
        ).all().map(r => ({ ...r, params: JSON.parse(r.params ?? '[]') }));
    }

    // ─────────────────────────────────────────────────────────
    // PRIVATE
    // ─────────────────────────────────────────────────────────

    _getReport(reportName) {
        const row = this.db.prepare(
            `SELECT * FROM sys_report WHERE report_name = ?`
        ).get(reportName);
        if (!row) throw new Error(`[sutramEngine] Report "${reportName}" not found in sys_report`);
        return row;
    }
}

module.exports = ReportManager;
