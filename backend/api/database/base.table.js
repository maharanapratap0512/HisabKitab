// database/base.table.js
const { tableMeta } = require('./schema');

class BaseTable {

    constructor(tableName) {
        this.tableName = tableName;
        if (!this.columns) {
            const meta = tableMeta[tableName];
            if (!meta) throw new Error(`Table "${tableName}" not found in schema and no columns defined`);
            this.columns = meta.columns;
        }
    }

    // ── Prepare data FOR database ──
    sanitize(data, mode = 'insert') {
        const result = {};

        for (const col in this.columns) {
            const def = this.columns[col];

            if (mode === 'insert' && col === '_id') continue;
            if (mode === 'update' && !(col in data)) continue;

            let val = col in data ? data[col] : def.default;
            if (val === undefined) continue;

            if (def.type === 'boolean') {
                val = (val === true || val === 1 || val === '1' || val === 'true') ? 1 : 0;

            } else if (def.type === 'json') {
                if (val === null || val === undefined) {
                    val = JSON.stringify(def.default ?? {});
                } else if (typeof val === 'object') {
                    val = JSON.stringify(val);
                }
                // already string — leave as is

            } else if (def.type === 'number') {
                val = (val !== null && val !== undefined && val !== '') ? Number(val) : null;

            } else if (def.type === 'string') {
                val = val !== null && val !== undefined ? String(val).trim() : null;
            }

            result[col] = val;
        }

        return result;
    }

    // ── Parse data FROM database ──
    desanitize(row) {
        if (!row) return null;
        const result = { ...row };

        for (const col in this.columns) {
            if (!(col in result)) continue;
            const def = this.columns[col];
            let val = result[col];

            if (def.type === 'boolean') {
                val = val === 1 || val === '1' || val === true;

            } else if (def.type === 'json') {
                if (typeof val === 'string') {
                    try { val = JSON.parse(val); }
                    catch { val = def.default ?? null; }
                }

            } else if (def.type === 'number') {
                val = val !== null && val !== undefined ? Number(val) : null;
            }

            result[col] = val;
        }

        return result;
    }

    // ── Desanitize array of rows ──
    desanitizeAll(rows) {
        return rows.map(row => this.desanitize(row));
    }

    // ── Build INSERT query ──
    // returns [sql, params] — use as: db.prepare(sql).run(...params)
    buildInsert(data) {
        const clean = this.sanitize(data, 'insert');
        const keys = Object.keys(clean);

        if (keys.length === 0) throw new Error(`No valid fields to insert into "${this.tableName}"`);

        const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
        return [sql, Object.values(clean)];
    }

    // ── Build UPDATE query ──
    // where: [{ col: '_id', val: 5 }]
    buildUpdate(data, where) {
        const clean = this.sanitize(data, 'update');

        if (Object.keys(clean).length === 0) throw new Error(`No valid fields to update in "${this.tableName}"`);
        if (!where || where.length === 0) throw new Error(`WHERE clause required for update in "${this.tableName}"`);

        const setClauses = Object.keys(clean).map(k => `${k} = ?`).join(', ');
        const whereClauses = where.map(w => `${w.col} = ?`).join(' AND ');
        const params = [...Object.values(clean), ...where.map(w => w.val)];

        const sql = `UPDATE ${this.tableName} SET ${setClauses} WHERE ${whereClauses}`;
        return [sql, params];
    }

}

module.exports = BaseTable;