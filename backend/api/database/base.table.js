// database/base.table.js
const { tableMeta } = require('./schema');

class BaseTable {

    constructor(tableName) {
        this.tableName = tableName;
        if (!this.columns) {
            const meta = tableMeta[tableName];
            if (!meta) throw new Error(`Table "${tableName}" not found in schema and no columns defined`);
            this.columns = meta.columns;
            this.joins = meta.joins ?? {};
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

        // ── Parse normal columns ──
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

        // ── Parse join objects (came back as JSON strings from json_object()) ──
        for (const [joinKey, def] of Object.entries(this.joins ?? {})) {
            const outKey = def.as ?? joinKey;
            if (!(outKey in result)) continue;
            let val = result[outKey];
            if (typeof val === 'string') {
                try { val = JSON.parse(val); } catch { val = null; }
            }
            // If the LEFT JOIN missed (all values null), collapse to null
            if (val && typeof val === 'object' && Object.values(val).every(v => v === null)) {
                val = null;
            }
            result[outKey] = val;
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


    // ── Build SELECT query ──
    // where: { '_id': 5, ... }
    buildSelect(where, orderBy = null) {
        let sql = `SELECT * FROM ${this.tableName}`;
        const params = [];

        if (where && Object.keys(where).length > 0) {
            const whereClauses = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
            params.push(...Object.values(where));
            sql += ` WHERE ${whereClauses}`;
        }

        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }

        return [sql, params];
    }

    // ── Build LEFT JOIN clauses from schema join definitions ──
    // Each join produces a single json_object() column → desanitize() nests it as a JS object.
    //
    // Schema join format:
    //   joinKey: {
    //     on:     'local_fk_col',
    //     table:  'target_table',
    //     target: '_id',
    //     as:     'outputKeyName',   // optional, defaults to joinKey
    //     select: ['col1', 'col2']   // columns to pull from joined table
    //   }
    _buildJoins() {
        if (!this.joins || Object.keys(this.joins).length === 0) {
            return { selectCols: `${this.tableName}.*`, joinClauses: '' };
        }

        const selectParts = [`${this.tableName}.*`];
        const joinParts = [];

        for (const [alias, def] of Object.entries(this.joins)) {
            // LEFT JOIN clause
            joinParts.push(
                `LEFT JOIN ${def.table} AS ${alias} ON ${this.tableName}.${def.on} = ${alias}.${def.target}`
            );

            // Pack all selected columns into a json_object() → one nested object per join
            if (def.select && def.select.length > 0) {
                const jsonArgs = def.select
                    .map(col => `'${col}', ${alias}.${col}`)
                    .join(', ');
                const outKey = def.as ?? alias;
                selectParts.push(`json_object(${jsonArgs}) AS ${outKey}`);
            }
        }

        return {
            selectCols: selectParts.join(', '),
            joinClauses: joinParts.join(' ')
        };
    }

    buildSelectFull(where, orderBy = null, limit = null, offset = null) {
        const { selectCols, joinClauses } = this._buildJoins();

        let sql = `SELECT ${selectCols} FROM ${this.tableName}`;
        if (joinClauses) sql += ` ${joinClauses}`;

        const params = [];

        if (where && Object.keys(where).length > 0) {
            // Prefix bare column names with the main table to avoid ambiguity
            const whereClauses = Object.keys(where)
                .map(k => (k.includes('.') ? `${k} = ?` : `${this.tableName}.${k} = ?`))
                .join(' AND ');
            params.push(...Object.values(where));
            sql += ` WHERE ${whereClauses}`;
        }

        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }

        if (limit) {
            sql += ` LIMIT ${limit}`;
        }

        if (offset) {
            sql += ` OFFSET ${offset}`;
        }

        return [sql, params];
    }

}

module.exports = BaseTable;