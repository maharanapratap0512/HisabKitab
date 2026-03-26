// src/ProcedureHandle.js — sutramEngine
// ─────────────────────────────────────────────────────────────
// Returned by engine.procedure('name') — same pattern as table().
// Wraps a single report definition (CTE or stored procedure).
// Cached — same instance returned every call.
//
// Usage:
//   engine.procedure('monthly_sales').run({ from: '2024-01' })
//   engine.procedure('generate_report').run({ year: 2024 })
// ─────────────────────────────────────────────────────────────

'use strict';

class ProcedureHandle {

    constructor(name, reportDef, runner) {
        this.name      = name;
        this._def      = reportDef;   // { report_type, cte_sql, procedure_name, params }
        this._runner   = runner;      // fn(name, params) → result
    }

    // ─────────────────────────────────────────────────────────
    // RUN — execute CTE or stored procedure
    // params: { from: '2024-01', to: '2024-12' }
    // Returns result rows (sync for SQLite, async for MySQL)
    // ─────────────────────────────────────────────────────────

    run(params = {}) {
        return this._runner(this.name, params);
    }

    // ─────────────────────────────────────────────────────────
    // META — inspect definition
    // ─────────────────────────────────────────────────────────

    getParams() {
        return this._def.params ?? [];
    }

    getMeta() {
        return {
            name:           this.name,
            label:          this._def.label          ?? this.name,
            description:    this._def.description    ?? null,
            report_type:    this._def.report_type    ?? 'cte',
            procedure_name: this._def.procedure_name ?? null,
            params:         this._def.params         ?? [],
        };
    }
}

module.exports = ProcedureHandle;
