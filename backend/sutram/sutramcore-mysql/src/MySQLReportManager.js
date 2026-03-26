// src/MySQLReportManager.js
// ─────────────────────────────────────────────────────────────
// Handles both CTE reports and stored procedures for MySQL.
// Loaded automatically by MySQLSutram.
//
// report_type: 'cte'       → runs cte_sql with named params
// report_type: 'procedure' → CALL procedure_name(?, ?, ?)
// ─────────────────────────────────────────────────────────────

'use strict';

// ProcedureHandle — shared with sutramEngine
// If sutramEngine is installed, reuse it. Otherwise use local copy.
let ProcedureHandle;
try {
    ProcedureHandle = require('sutramengine/src/ProcedureHandle');
} catch {
    // standalone use without engine — inline minimal handle
    ProcedureHandle = class {
        constructor(name, def, runner) {
            this.name = name; this._def = def; this._runner = runner;
        }
        run(params = {}) { return this._runner(this.name, params); }
        getParams()      { return this._def.params ?? []; }
        getMeta()        { return { name: this.name, ...this._def }; }
    };
}

class MySQLReportManager {

    constructor(adapter) {
        this.adapter = adapter;
        this._cache  = {};
    }

    // ─────────────────────────────────────────────────────────
    // LOAD FROM sys_report
    // ─────────────────────────────────────────────────────────

    async load() {
        this._cache = {};
        this._procedureCache = {};

        const reports = await this.adapter.all(
            `SELECT * FROM sys_report WHERE active = 1`
        );

        for (const report of reports) {
            this._cache[report.report_name] = {
                ...report,
                report_type:    report.report_type    ?? 'cte',
                procedure_name: report.procedure_name ?? null,
                params:         report.params ? JSON.parse(report.params) : [],
            };
        }

        console.log(`[sutramcore-mysql] ✓ ${reports.length} report(s) loaded`);
    }

    // ─────────────────────────────────────────────────────────
    // LOAD FROM ARRAY — direct mode
    // ─────────────────────────────────────────────────────────

    loadFromArray(reports = []) {
        this._cache = {};
        this._procedureCache = {};

        for (const report of reports) {
            if (!report.report_name) continue;
            if (report.active === false) continue;

            const type = report.report_type ?? 'cte';
            if (type === 'cte'       && !report.cte_sql)       continue;
            if (type === 'procedure' && !report.procedure_name) continue;

            this._cache[report.report_name] = {
                ...report,
                report_type:    type,
                procedure_name: report.procedure_name ?? null,
                params:         report.params ?? [],
            };
        }

        console.log(`[sutramcore-mysql] ✓ ${Object.keys(this._cache).length} report(s) loaded from array`);
    }

    // ─────────────────────────────────────────────────────────
    // PROCEDURE() — same pattern as engine.table()
    // Returns cached ProcedureHandle
    // ─────────────────────────────────────────────────────────

    procedure(name) {
        if (!this._procedureCache) this._procedureCache = {};

        if (!this._procedureCache[name]) {
            const def = this._cache[name];
            if (!def) throw new Error(
                `[sutramcore-mysql] Procedure/Report "${name}" not found.\n` +
                `Available: ${Object.keys(this._cache).join(', ') || '(none)'}`
            );
            this._procedureCache[name] = new ProcedureHandle(
                name, def, (n, params) => this.run(n, params)
            );
        }

        return this._procedureCache[name];
    }

    // ─────────────────────────────────────────────────────────
    // CREATE REPORT
    // ─────────────────────────────────────────────────────────

    async create(def) {
        if (!def.report_name) throw new Error('[sutramcore-mysql] report_name required');

        const type = def.report_type ?? 'cte';

        if (type === 'cte' && !def.cte_sql) {
            throw new Error('[sutramcore-mysql] cte_sql required for type "cte"');
        }
        if (type === 'procedure' && !def.procedure_name) {
            throw new Error('[sutramcore-mysql] procedure_name required for type "procedure"');
        }

        await this.adapter.run(`
            INSERT INTO sys_report
              (report_name, label, description, report_type, cte_sql, procedure_name, params)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            def.report_name,
            def.label          ?? def.report_name,
            def.description    ?? null,
            type,
            def.cte_sql        ?? null,
            def.procedure_name ?? null,
            JSON.stringify(def.params ?? []),
        ]);

        await this.load();
        console.log(`[sutramcore-mysql] ✓ Report "${def.report_name}" created (type: ${type})`);
    }

    // ─────────────────────────────────────────────────────────
    // RUN — CTE or Stored Procedure
    // ─────────────────────────────────────────────────────────

    async run(reportName, params = {}) {
        const report = this._cache[reportName];
        if (!report) throw new Error(`[sutramcore-mysql] Report "${reportName}" not found`);

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
                throw new Error(`[sutramcore-mysql] Report "${reportName}" missing required param: ${p.name}`);
            }
        }

        try {
            if (report.report_type === 'procedure') {
                return await this._runProcedure(report, finalParams);
            } else {
                return await this._runCTE(report, finalParams);
            }
        } catch (err) {
            throw new Error(`[sutramcore-mysql] Report "${reportName}" failed: ${err.message}`);
        }
    }

    // ─────────────────────────────────────────────────────────
    // PRIVATE — CTE execution
    // Named params :param_name style (mysql2 named placeholders)
    // ─────────────────────────────────────────────────────────

    async _runCTE(report, finalParams) {
        return this.adapter.all(report.cte_sql, finalParams);
    }

    // ─────────────────────────────────────────────────────────
    // PRIVATE — Stored Procedure execution
    // CALL procedure_name(val1, val2, ...)
    // Params passed in ORDER defined in report.params array
    // ─────────────────────────────────────────────────────────

    async _runProcedure(report, finalParams) {
        // build ordered param values
        const paramValues = report.params.map(p => finalParams[p.name] ?? null);
        const placeholders = paramValues.map(() => '?').join(', ');
        const sql = `CALL \`${report.procedure_name}\`(${placeholders})`;

        // mysql2 CALL returns [ [resultSet], [okPacket] ]
        // we want the first result set
        const [rows] = await this.adapter.pool.execute(sql, paramValues);

        // rows[0] is the actual result set
        return Array.isArray(rows[0]) ? rows[0] : rows;
    }

    // ─────────────────────────────────────────────────────────
    // UPDATE / DELETE / LIST
    // ─────────────────────────────────────────────────────────

    async update(reportName, updates) {
        const report = await this._getReport(reportName);

        const fields = [];
        const vals   = [];

        if (updates.cte_sql)        { fields.push('cte_sql = ?');        vals.push(updates.cte_sql); }
        if (updates.procedure_name) { fields.push('procedure_name = ?'); vals.push(updates.procedure_name); }
        if (updates.report_type)    { fields.push('report_type = ?');    vals.push(updates.report_type); }
        if (updates.label)          { fields.push('label = ?');          vals.push(updates.label); }
        if (updates.description)    { fields.push('description = ?');    vals.push(updates.description); }
        if (updates.params)         { fields.push('params = ?');         vals.push(JSON.stringify(updates.params)); }
        fields.push('updated_at = ?');
        vals.push(new Date().toISOString());
        vals.push(report._id);

        if (fields.length > 1) {
            await this.adapter.run(
                `UPDATE sys_report SET ${fields.join(', ')} WHERE _id = ?`,
                vals
            );
        }

        await this.load();
    }

    async delete(reportName) {
        const report = await this._getReport(reportName);
        await this.adapter.run(`DELETE FROM sys_report WHERE _id = ?`, [report._id]);
        await this.load();
    }

    async getReports() {
        const rows = await this.adapter.all(
            `SELECT _id, report_name, label, description, report_type,
                    procedure_name, params, active FROM sys_report ORDER BY _id ASC`
        );
        return rows.map(r => ({
            ...r,
            params: JSON.parse(r.params ?? '[]'),
        }));
    }

    async _getReport(reportName) {
        const row = await this.adapter.get(
            `SELECT * FROM sys_report WHERE report_name = ?`, [reportName]
        );
        if (!row) throw new Error(`[sutramcore-mysql] Report "${reportName}" not found`);
        return row;
    }
}

module.exports = MySQLReportManager;
