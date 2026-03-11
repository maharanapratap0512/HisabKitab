// database/base.table.js
const db = require('../db/connection');
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
        this._stmtCache = {};
    }

    // ─────────────────────────────────────────────────────────
    // ── PUBLIC CRUD API ───────────────────────────────────────
    // ─────────────────────────────────────────────────────────

    // full: true  → desanitized joined object
    // full: false → just the new id  (use for bulk inserts)
    insert(data, full = true) {
        const [sql, params] = this._buildInsert(data);
        const id = this._stmt(sql).run(...params).lastInsertRowid;
        return full ? this.getById(id) : id;
    }

    // where: { _id: 5 }  or  "date > '2024-01-01'"
    // full: true  → desanitized joined object
    // full: false → just the id
    update(data, where, full = true) {
        const [sql, params] = this._buildUpdate(data, where);
        this._stmt(sql).run(...params);
        const id = typeof where === 'object' ? (where._id ?? null) : null;
        return full && id ? this.getById(id) : id;
    }

    // Convenience: update by _id
    updateById(data, id, full = true) {
        return this.update(data, { _id: id }, full);
    }

    // where: { _id: 5 }  or  "active = 0"
    // returns number of deleted rows
    delete(where) {
        const { clause, params } = this._buildWhere(where);
        if (!clause) throw new Error(`WHERE clause required for delete in "${this.tableName}"`);
        const sql = `DELETE FROM ${this.tableName} ${clause}`;
        return this._stmt(sql).run(...params).changes;
    }

    // Convenience: delete by _id
    deleteById(id) {
        return this.delete({ _id: id });
    }

    // Single row by _id — full joins
    getById(id) {
        return this.getOne({ _id: id });
    }

    // Single row — full joins
    // where: { dept_id: 3 }  or  "voucher_no = 'V001'"
    getOne(where) {
        const [sql, params] = this._buildSelectFull(where);
        const row = this._stmt(sql).get(...params);
        return this.desanitize(row);
    }

    // Multiple rows — full joins
    // where: { active: 1 }  or  "date >= '2024-01-01'"  or  {} for all
    getAll(where = {}, orderBy = null, limit = null, offset = null) {
        const [sql, params] = this._buildSelectFull(where, orderBy, limit, offset);
        const rows = this._stmt(sql).all(...params);
        return this.desanitizeAll(rows);
    }

    // ─────────────────────────────────────────────────────────
    // ── SANITIZE / DESANITIZE ─────────────────────────────────
    // ─────────────────────────────────────────────────────────

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

            } else if (def.type === 'number') {
                val = (val !== null && val !== undefined && val !== '') ? Number(val) : null;

            } else if (def.type === 'string') {
                val = val !== null && val !== undefined ? String(val).trim() : null;
            }

            result[col] = val;
        }

        return result;
    }

    desanitize(row) {
        if (!row) return null;
        const result = { ...row };

        // ── parse normal columns ──
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

        // ── parse join outputs ──
        for (const [joinKey, def] of Object.entries(this.joins ?? {})) {
            const outKey = def.as ?? joinKey;
            if (!(outKey in result)) continue;
            let val = result[outKey];

            if (typeof val === 'string') {
                try { val = JSON.parse(val); } catch { val = def.manyToMany || def.hasMany ? [] : null; }
            }

            // hasOne — LEFT JOIN missed, collapse to null
            if (!def.hasMany && !def.manyToMany) {
                if (val && typeof val === 'object' && !Array.isArray(val) && Object.values(val).every(v => v === null)) {
                    val = null;
                }
            }

            result[outKey] = val;
        }

        return result;
    }

    desanitizeAll(rows) {
        return rows.map(row => this.desanitize(row));
    }

    // ─────────────────────────────────────────────────────────
    // ── PRIVATE QUERY BUILDERS ────────────────────────────────
    // ─────────────────────────────────────────────────────────

    _buildInsert(data) {
        const clean = this.sanitize(data, 'insert');
        const keys = Object.keys(clean);
        if (keys.length === 0) throw new Error(`No valid fields to insert into "${this.tableName}"`);
        const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
        return [sql, Object.values(clean)];
    }

    _buildUpdate(data, where) {
        const clean = this.sanitize(data, 'update');
        if (Object.keys(clean).length === 0) throw new Error(`No valid fields to update in "${this.tableName}"`);

        const { clause, params: whereParams } = this._buildWhere(where);
        if (!clause) throw new Error(`WHERE clause required for update in "${this.tableName}"`);

        const setClauses = Object.keys(clean).map(k => `${k} = ?`).join(', ');
        const sql = `UPDATE ${this.tableName} SET ${setClauses} ${clause}`;
        return [sql, [...Object.values(clean), ...whereParams]];
    }

    _buildSelectFull(where, orderBy = null, limit = null, offset = null) {
        const { selectCols, joinClauses, needsGroupBy } = this._buildJoins();
        let sql = `SELECT ${selectCols} FROM ${this.tableName}`;
        if (joinClauses) sql += ` ${joinClauses}`;

        // prefixTable=true — avoids column ambiguity in JOINs
        const { clause, params } = this._buildWhere(where, true);
        if (clause) sql += ` ${clause}`;

        // hasMany / manyToMany joins use aggregation — need GROUP BY
        if (needsGroupBy) sql += ` GROUP BY ${this.tableName}._id`;

        if (orderBy) sql += ` ORDER BY ${orderBy}`;
        if (limit) sql += ` LIMIT ${limit}`;
        if (offset) sql += ` OFFSET ${offset}`;
        return [sql, params];
    }

    // ─────────────────────────────────────────────────────────
    // ── WHERE HELPER ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    //
    // Two formats:
    //   object → { _id: 5, active: 1 }
    //   string → "date > '2024-01-01' AND qty > 10"  (raw SQL, no bound params)
    //
    // prefixTable: true  → tableName.col = ?  (SELECT with JOINs)
    // prefixTable: false → col = ?            (UPDATE / DELETE)

    _buildWhere(where, prefixTable = false) {
        if (!where) return { clause: '', params: [] };

        // raw SQL string — caller responsible for safety
        if (typeof where === 'string') {
            const trimmed = where.trim();
            return { clause: trimmed ? `WHERE ${trimmed}` : '', params: [] };
        }

        // plain object
        if (typeof where === 'object') {
            const keys = Object.keys(where);
            if (keys.length === 0) return { clause: '', params: [] };
            const clause = keys
                .map(k => {
                    const col = prefixTable && !k.includes('.')
                        ? `${this.tableName}.${k}`
                        : k;
                    return `${col} = ?`;
                })
                .join(' AND ');
            return { clause: `WHERE ${clause}`, params: Object.values(where) };
        }

        return { clause: '', params: [] };
    }

    // ─────────────────────────────────────────────────────────
    // ── JOIN BUILDER ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    //
    // Three join types in schema:
    //
    // hasOne (default) — fk is ON THIS table
    //   { on: 'unit_id', table: 'unit', target: '_id', as: 'unit', select: [...] }
    //   → LEFT JOIN unit AS alias ON this.unit_id = alias._id
    //   → json_object(...)
    //
    // hasMany — fk is ON THE OTHER table pointing back here
    //   { hasMany: true, on: 'item_id', table: 'subitem', target: '_id', as: 'subitems', select: [...] }
    //   → LEFT JOIN subitem AS alias ON alias.item_id = this._id
    //   → json_group_array(DISTINCT json_object(...))
    //
    // manyToMany — through a junction table
    //   { manyToMany: true, table: 'category', junction: 'rel_item_category', on: 'item_id', target: 'category_id', as: 'categories', select: [...] }
    //   → LEFT JOIN rel_item_category AS alias_junc ON alias_junc.item_id = this._id
    //   → LEFT JOIN category AS alias ON alias._id = alias_junc.category_id
    //   → json_group_array(DISTINCT json_object(...))

    _buildJoins() {
        if (!this.joins || Object.keys(this.joins).length === 0) {
            return { selectCols: `${this.tableName}.*`, joinClauses: '', needsGroupBy: false };
        }

        const selectParts = [`${this.tableName}.*`];
        const joinParts = [];
        let needsGroupBy = false;

        for (const [alias, def] of Object.entries(this.joins)) {

            // ── hasOne ───────────────────────────────────────────────
            if (!def.hasMany && !def.manyToMany) {
                joinParts.push(
                    `LEFT JOIN ${def.table} AS ${alias} ON ${this.tableName}.${def.on} = ${alias}.${def.target}`
                );
                if (def.select?.length) {
                    const jsonArgs = def.select.map(col => `'${col}', ${alias}.${col}`).join(', ');
                    selectParts.push(`json_object(${jsonArgs}) AS ${def.as ?? alias}`);
                }
            }

            // ── hasMany ──────────────────────────────────────────────
            else if (def.hasMany) {
                // flip: other_table.fk = this._id
                joinParts.push(
                    `LEFT JOIN ${def.table} AS ${alias} ON ${alias}.${def.on} = ${this.tableName}.${def.target}`
                );
                if (def.select?.length) {
                    const jsonArgs = def.select.map(col => `'${col}', ${alias}.${col}`).join(', ');
                    const outKey = def.as ?? alias;
                    selectParts.push(
                        `CASE WHEN ${alias}.${def.select[0]} IS NULL THEN json('[]') ` +
                        `ELSE json_group_array(DISTINCT json_object(${jsonArgs})) END AS ${outKey}`
                    );
                }
                needsGroupBy = true;
            }

            // ── manyToMany ───────────────────────────────────────────
            else if (def.manyToMany) {
                const juncAlias = `${alias}_junc`;
                // step 1: this → junction
                joinParts.push(
                    `LEFT JOIN ${def.junction} AS ${juncAlias} ON ${juncAlias}.${def.on} = ${this.tableName}._id`
                );
                // step 2: junction → target
                joinParts.push(
                    `LEFT JOIN ${def.table} AS ${alias} ON ${alias}._id = ${juncAlias}.${def.target}`
                );
                if (def.select?.length) {
                    const jsonArgs = def.select.map(col => `'${col}', ${alias}.${col}`).join(', ');
                    const outKey = def.as ?? alias;
                    selectParts.push(
                        `CASE WHEN ${alias}.${def.select[0]} IS NULL THEN json('[]') ` +
                        `ELSE json_group_array(DISTINCT json_object(${jsonArgs})) END AS ${outKey}`
                    );
                }
                needsGroupBy = true;
            }
        }

        return {
            selectCols: selectParts.join(', '),
            joinClauses: joinParts.join(' '),
            needsGroupBy              // true when any hasMany/manyToMany present
        };
    }

    // ─────────────────────────────────────────────────────────
    // ── STATEMENT CACHE ──────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    //
    // better-sqlite3: preparing a statement is expensive.
    // Same SQL string reuses the same prepared statement.
    // Bulk inserts prepare once, reuse for every row — big speed gain.

    _stmt(sql) {
        if (!this._stmtCache[sql]) {
            this._stmtCache[sql] = db.prepare(sql);
        }
        return this._stmtCache[sql];
    }

}

module.exports = BaseTable;