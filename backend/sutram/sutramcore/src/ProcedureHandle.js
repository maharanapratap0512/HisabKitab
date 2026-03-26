// src/ProcedureHandle.js — sutramcore
// ─────────────────────────────────────────────────────────────
// Returned by sewa.procedure('name') — same pattern as table().
// Wraps a single CTE report definition.
// Cached — same instance returned every call.
//
// Usage:
//   sewa.procedure('monthly_sales').run({ from: '2024-01' })
//   sewa.procedure('low_stock').getParams()
//   sewa.procedure('low_stock').getMeta()
// ─────────────────────────────────────────────────────────────

'use strict';

class ProcedureHandle {

    constructor(name, reportDef, runner) {
        this.name    = name;
        this._def    = reportDef;
        this._runner = runner;
    }

    // execute — sync for SQLite
    run(params = {}) {
        return this._runner(this.name, params);
    }

    getParams() {
        return this._def.params ?? [];
    }

    getMeta() {
        return {
            name:        this.name,
            label:       this._def.label       ?? this.name,
            description: this._def.description ?? null,
            report_type: this._def.report_type ?? 'cte',
            params:      this._def.params      ?? [],
        };
    }
}

module.exports = ProcedureHandle;
