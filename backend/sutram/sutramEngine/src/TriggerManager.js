// src/TriggerManager.js
// ─────────────────────────────────────────────────────────────
// Manages sutramEngine triggers — stored in sys_trigger.
// Execution is in Node.js (not SQLite triggers) so complex
// field_map logic and multi-table operations are possible.
//
// Trigger flow:
//   Engine wraps insert/update/delete calls →
//   checks trigger cache for matching event →
//   runs actions in same transaction as original operation
// ─────────────────────────────────────────────────────────────

'use strict';

class TriggerManager {

    constructor(db) {
        this.db    = db;
        // cache: { 'products:INSERT': [{ ...trigger, actions: [...] }] }
        this._cache = {};
    }

    // ─────────────────────────────────────────────────────────
    // BOOTSTRAP — load all triggers from sys_trigger into cache
    // Called by Engine.rebootstrap()
    // ─────────────────────────────────────────────────────────

    // load from sys_ tables — managed mode
    load() {
        this._cache = {};

        const triggers = this.db.prepare(
            `SELECT * FROM sys_trigger WHERE active = 1`
        ).all();

        for (const trigger of triggers) {
            const actions = this.db.prepare(
                `SELECT * FROM sys_trigger_action
                 WHERE trigger_id = ? AND active = 1
                 ORDER BY sort_order ASC`
            ).all(trigger._id);

            const key = `${trigger.source_table}:${trigger.event}`;
            if (!this._cache[key]) this._cache[key] = [];
            this._cache[key].push({ ...trigger, actions });
        }

        const count = Object.values(this._cache).flat().length;
        console.log(`[sutramEngine] ✓ ${count} trigger(s) loaded from sys_`);
    }

    // load from array — direct mode
    // accepts same format as triggers.js
    loadFromArray(triggers = []) {
        this._cache = {};

        for (const trigger of triggers) {
            if (!trigger.trigger_name || !trigger.source_table || !trigger.event) continue;
            if (trigger.active === false) continue;

            const actions = (trigger.actions ?? []).map((a, i) => ({
                action_type:  a.action_type,
                sort_order:   a.sort_order ?? i,
                target_table: a.target_table ?? null,
                field_map:    a.field_map ? JSON.stringify(a.field_map) : '{}',
                condition:    a.condition ?? null,
                raw_sql:      a.raw_sql   ?? null,
                active:       1,
            }));

            const normalizedTrigger = {
                trigger_name:    trigger.trigger_name,
                source_table:    trigger.source_table,
                event:           trigger.event.toUpperCase(),
                condition_type:  trigger.condition_type  ?? 'always',
                condition_col:   trigger.condition_col   ?? null,
                condition_value: trigger.condition_value ?? null,
                condition_sql:   trigger.condition_sql   ?? null,
                active:          1,
                actions,
            };

            const key = `${trigger.source_table}:${trigger.event.toUpperCase()}`;
            if (!this._cache[key]) this._cache[key] = [];
            this._cache[key].push(normalizedTrigger);
        }

        const count = Object.values(this._cache).flat().length;
        console.log(`[sutramEngine] ✓ ${count} trigger(s) loaded from array`);
    }

    // ─────────────────────────────────────────────────────────
    // CREATE TRIGGER
    // def: {
    //   trigger_name, label?, source_table, event,
    //   condition_type?, condition_col?, condition_value?, condition_sql?,
    //   actions: [
    //     { sort_order?, action_type, target_table?,
    //       field_map?, condition?, raw_sql? }
    //   ]
    // }
    // ─────────────────────────────────────────────────────────

    create(def) {
        if (!def.trigger_name) throw new Error('[sutramEngine] trigger_name required');
        if (!def.source_table) throw new Error('[sutramEngine] source_table required');
        if (!def.event)        throw new Error('[sutramEngine] event required (INSERT/UPDATE/DELETE)');
        if (!Array.isArray(def.actions) || def.actions.length === 0) {
            throw new Error('[sutramEngine] at least one action required');
        }

        const run = this.db.transaction(() => {
            const res = this.db.prepare(`
                INSERT INTO sys_trigger
                  (trigger_name, label, source_table, event,
                   condition_type, condition_col, condition_value, condition_sql)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                def.trigger_name,
                def.label ?? def.trigger_name,
                def.source_table,
                def.event.toUpperCase(),
                def.condition_type  ?? 'always',
                def.condition_col   ?? null,
                def.condition_value ?? null,
                def.condition_sql   ?? null,
            );

            const triggerId = res.lastInsertRowid;

            for (let i = 0; i < def.actions.length; i++) {
                const action = def.actions[i];
                this.db.prepare(`
                    INSERT INTO sys_trigger_action
                      (trigger_id, sort_order, action_type, target_table,
                       field_map, condition, raw_sql)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(
                    triggerId,
                    action.sort_order ?? i,
                    action.action_type,
                    action.target_table ?? null,
                    action.field_map ? JSON.stringify(action.field_map) : '{}',
                    action.condition  ?? null,
                    action.raw_sql    ?? null,
                );
            }

            return triggerId;
        });

        const id = run();
        this.load(); // refresh cache
        console.log(`[sutramEngine] ✓ Trigger "${def.trigger_name}" created`);
        return id;
    }

    // ─────────────────────────────────────────────────────────
    // ENABLE / DISABLE
    // ─────────────────────────────────────────────────────────

    enable(triggerId) {
        this.db.prepare(`UPDATE sys_trigger SET active = 1 WHERE _id = ?`).run(triggerId);
        this.load();
    }

    disable(triggerId) {
        this.db.prepare(`UPDATE sys_trigger SET active = 0 WHERE _id = ?`).run(triggerId);
        this.load();
    }

    delete(triggerId) {
        // CASCADE handles sys_trigger_action rows
        this.db.prepare(`DELETE FROM sys_trigger WHERE _id = ?`).run(triggerId);
        this.load();
    }

    getTriggers() {
        return this.db.prepare(`SELECT * FROM sys_trigger ORDER BY _id ASC`).all();
    }

    // ─────────────────────────────────────────────────────────
    // EXECUTE — called by Engine after insert/update/delete
    //
    // tableName : 'products'
    // event     : 'INSERT' | 'UPDATE' | 'DELETE'
    // newRow    : the row after operation  (null for DELETE)
    // oldRow    : the row before operation (null for INSERT)
    //
    // IMPORTANT: This must be called INSIDE the same transaction
    // as the original operation so actions are atomic.
    // ─────────────────────────────────────────────────────────

    execute(tableName, event, newRow, oldRow = null) {
        const key      = `${tableName}:${event}`;
        const triggers = this._cache[key];
        if (!triggers || triggers.length === 0) return;

        for (const trigger of triggers) {
            if (!this._checkCondition(trigger, newRow, oldRow)) continue;

            for (const action of trigger.actions) {
                this._runAction(action, newRow, oldRow);
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    // PRIVATE — condition check
    // ─────────────────────────────────────────────────────────

    _checkCondition(trigger, newRow, oldRow) {
        switch (trigger.condition_type) {

            case 'always':
                return true;

            case 'when_col_equals': {
                const row = newRow ?? oldRow;
                if (!trigger.condition_col || !row) return false;
                return String(row[trigger.condition_col]) === String(trigger.condition_value);
            }

            case 'raw_sql':
                // raw_sql conditions are evaluated as SQLite expressions
                // We do a quick SELECT to evaluate the condition
                // Using the new row's values as bound params
                try {
                    const row = newRow ?? oldRow;
                    const sql = `SELECT CASE WHEN (${trigger.condition_sql}) THEN 1 ELSE 0 END as result`;
                    const res = this.db.prepare(sql).get(row ?? {});
                    return res?.result === 1;
                } catch {
                    return false;
                }

            default:
                return true;
        }
    }

    // ─────────────────────────────────────────────────────────
    // PRIVATE — run single action
    // ─────────────────────────────────────────────────────────

    _runAction(action, newRow, oldRow) {
        switch (action.action_type) {

            case 'insert_row': {
                const fieldMap = JSON.parse(action.field_map ?? '{}');
                const data     = this._resolveFieldMap(fieldMap, newRow, oldRow);
                if (Object.keys(data).length === 0) return;

                const keys   = Object.keys(data);
                const sql    = `INSERT INTO "${action.target_table}"
                                (${keys.map(k => `"${k}"`).join(', ')})
                                VALUES (${keys.map(() => '?').join(', ')})`;
                this.db.prepare(sql).run(...Object.values(data));
                break;
            }

            case 'update_row': {
                const fieldMap  = JSON.parse(action.field_map ?? '{}');
                const resolved  = this._resolveFieldMap(fieldMap, newRow, oldRow);

                if (!action.condition) {
                    console.warn('[sutramEngine] update_row action missing condition — skipped');
                    return;
                }

                const updateKeys = Object.keys(resolved).filter(k => k !== '__where__');
                if (updateKeys.length === 0) return;

                const setCols = updateKeys.map(k => `"${k}" = ?`).join(', ');
                const sql     = `UPDATE "${action.target_table}" SET ${setCols} WHERE ${action.condition}`;
                this.db.prepare(sql).run(...updateKeys.map(k => resolved[k]));
                break;
            }

            case 'delete_row': {
                if (!action.condition) {
                    console.warn('[sutramEngine] delete_row action missing condition — skipped');
                    return;
                }
                const sql = `DELETE FROM "${action.target_table}" WHERE ${action.condition}`;
                this.db.prepare(sql).run();
                break;
            }

            case 'raw_sql': {
                if (!action.raw_sql) return;
                try {
                    this.db.prepare(action.raw_sql).run();
                } catch (err) {
                    console.error(`[sutramEngine] raw_sql action failed: ${err.message}`);
                    throw err; // re-throw so transaction rolls back
                }
                break;
            }

            default:
                console.warn(`[sutramEngine] Unknown action_type: ${action.action_type}`);
        }
    }

    // ─────────────────────────────────────────────────────────
    // PRIVATE — resolve field_map values
    //
    // field_map format:
    //   { "target_col": "new.source_col" }   → value from newRow
    //   { "target_col": "old.source_col" }   → value from oldRow
    //   { "target_col": "literal:hello" }    → literal string
    //   { "target_col": "literal:42" }       → literal value
    // ─────────────────────────────────────────────────────────

    _resolveFieldMap(fieldMap, newRow, oldRow) {
        const result = {};

        for (const [targetCol, source] of Object.entries(fieldMap)) {
            if (typeof source === 'string') {
                if (source.startsWith('new.')) {
                    const col = source.slice(4);
                    result[targetCol] = newRow?.[col] ?? null;

                } else if (source.startsWith('old.')) {
                    const col = source.slice(4);
                    result[targetCol] = oldRow?.[col] ?? null;

                } else if (source.startsWith('literal:')) {
                    result[targetCol] = source.slice(8);

                } else {
                    // assume it's a column name from newRow
                    result[targetCol] = newRow?.[source] ?? null;
                }
            } else {
                // direct literal value
                result[targetCol] = source;
            }
        }

        return result;
    }
}

module.exports = TriggerManager;
