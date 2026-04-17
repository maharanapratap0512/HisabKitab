// src/BaseTable.js
// ─────────────────────────────────────────────────────────────
// Core ORM class — instance-based.
// db and schema always injected from Sutram instance.
// No global singleton fallback.
// ─────────────────────────────────────────────────────────────

'use strict';

class BaseTable {

    // ─────────────────────────────────────────────────────────
    // ── CONSTRUCTOR ───────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    // Always called via sewa.table('name') or new sewa.BaseTable('name').
    // db and schema come from the parent Sutram instance — never global.

    constructor(tableName, { db, schema } = {}) {
        if (!db) throw new Error('[sutramcore] BaseTable requires db — use sewa.table() or new sewa.BaseTable()');
        if (!schema) throw new Error('[sutramcore] BaseTable requires schema — use sewa.table() or new sewa.BaseTable()');

        this.tableName = tableName;
        this.db = db;      // resolved once at construction — never changes
        this.schema = schema;  // resolved once at construction — never changes

        const meta = schema[tableName];
        if (!meta) {
            throw new Error(
                `[sutramcore] Table "${tableName}" not found in schema.\n` +
                `Available tables: ${Object.keys(schema).join(', ') || '(none)'}`
            );
        }

        this.columns = meta.columns;
        this.joins = meta.joins ?? {};
        this._stmtCache = {};
    }

    // ─────────────────────────────────────────────────────────
    // ── PUBLIC CRUD API ───────────────────────────────────────
    // ─────────────────────────────────────────────────────────

    // Insert a single row.
    // full: true  → returns full desanitized joined object  (default)
    // full: false → returns just the new _id               (bulk / transaction use)
    insert(data, full = true) {
        const [sql, params] = this._buildInsert(data);
        const id = this._stmt(sql).run(...params).lastInsertRowid;
        return full ? this.getById(id) : id;
    }

    // Update row(s) matching where.
    // where: { _id: 5 }  or  "date > '2024-01-01'"
    // full: true  → returns updated row (only when where has _id)
    // full: false → returns the id
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

    // Delete row(s) matching where.
    // where: { _id: 5 }  or  { batch_id: 3 }  or  "active = 0"
    // Returns number of deleted rows.
    delete(where) {
        const { clause, params } = this._buildWhere(where);
        if (!clause) throw new Error(`[sutramcore] WHERE required for delete in "${this.tableName}"`);
        const sql = `DELETE FROM ${this.tableName} ${clause}`;
        return this._stmt(sql).run(...params).changes;
    }

    // Convenience: delete by _id
    deleteById(id) {
        return this.delete({ _id: id });
    }

    // Single row by _id — always returns full joined object
    getById(id) {
        return this.getOne({ _id: id });
    }

    // Single row matching where.
    // opts.full: true  → with joins, desanitized  (default)
    // opts.full: false → plain SELECT *, no joins  (faster for internal checks)
    getOne(where, { full = true } = {}) {
        const [sql, params] = full
            ? this._buildSelectFull(where)
            : this._buildSelectPlain(where);
        const row = this._stmt(sql).get(...params);
        return full ? this.desanitize(row) : row;
    }

    // Multiple rows matching where.
    // where: { active: 1 }  or  "date >= '2024-01-01'"  or  {} for all
    // opts.full:    true  → with joins, desanitized  (default)
    // opts.full:    false → plain SELECT *, no joins
    // opts.orderBy: "recipe_name ASC"
    // opts.limit:   100
    // opts.offset:  0
    getAll(where = {}, { full = true, orderBy = null, limit = null, offset = null } = {}) {
        const [sql, params] = full
            ? this._buildSelectFull(where, orderBy, limit, offset)
            : this._buildSelectPlain(where, orderBy, limit, offset);
        const rows = this._stmt(sql).all(...params);
        return full ? this.desanitizeAll(rows) : rows;
    }

    // Count rows matching where — for pagination
    count(where = {}) {
        let sql = `SELECT COUNT(*) AS total FROM ${this.tableName}`;
        const { clause, params } = this._buildWhere(where, false);
        if (clause) sql += ` ${clause}`;
        return this._stmt(sql).get(...params)?.total ?? 0;
    }

    // ─────────────────────────────────────────────────────────
    // ── SANITIZE / DESANITIZE ─────────────────────────────────
    // ─────────────────────────────────────────────────────────

    // Prepare data FOR the database.
    // Coerces types, applies defaults, strips unknown columns.
    // mode 'insert' → skips _id, applies defaults for missing fields
    // mode 'update' → only processes fields present in data
    sanitize(data, mode = 'insert') {
        const result = {};

        for (const colName in this.columns) {
            const def = this.columns[colName];

            if (mode === 'insert' && colName === '_id') continue;
            if (mode === 'update' && !(colName in data)) continue;

            let val = colName in data ? data[colName] : def.default;
            if (val === undefined) continue;

            if (def.required && mode === 'insert' && (val === null || val === undefined || val === '')) {
                throw new Error(`[sutramcore] "${this.tableName}.${colName}" is required`);
            }

            switch (def.type) {
                case 'boolean':
                    val = (val === true || val === 1 || val === '1' || val === 'true') ? 1 : 0;
                    break;
                case 'json':
                    if (val === null || val === undefined) {
                        val = JSON.stringify(def.default ?? null);
                    } else if (typeof val === 'object') {
                        val = JSON.stringify(val);
                    }
                    break;
                case 'number':
                    val = (val !== null && val !== undefined && val !== '') ? Number(val) : null;
                    break;
                case 'string':
                    val = (val !== null && val !== undefined) ? String(val).trim() : null;
                    break;
            }

            result[colName] = val;
        }

        return result;
    }

    // Parse data FROM the database back to JS types.
    desanitize(row) {
        if (!row) return null;
        const result = { ...row };

        // ── scalar columns ────────────────────────────────────
        for (const colName in this.columns) {
            if (!(colName in result)) continue;
            const def = this.columns[colName];
            let val = result[colName];

            switch (def.type) {
                case 'boolean':
                    val = val === 1 || val === '1' || val === true;
                    break;
                case 'json':
                    if (typeof val === 'string') {
                        try { val = JSON.parse(val); } catch { val = def.default ?? null; }
                    }
                    break;
                case 'number':
                    val = (val !== null && val !== undefined) ? Number(val) : null;
                    break;
            }

            result[colName] = val;
        }

        // ── hasOne join outputs (json_object strings) ──────────
        // Collapse to null when LEFT JOIN missed (all fields null)
        for (const def of Object.values(this.columns)) {
            if (!def.ref) continue;
            const outKey = def.as ?? def.ref.split('.')[0];
            if (!(outKey in result)) continue;
            let val = result[outKey];

            if (typeof val === 'string') {
                try { val = JSON.parse(val); } catch { val = null; }
            }
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                if (Object.values(val).every(v => v === null)) val = null;
            }
            result[outKey] = val;
        }

        // ── hasMany / manyToMany outputs (json_group_array strings) ──
        for (const [joinKey, def] of Object.entries(this.joins)) {
            const outKey = def.as ?? joinKey;
            if (!(outKey in result)) continue;
            let val = result[outKey];

            if (typeof val === 'string') {
                try { val = JSON.parse(val); } catch { val = []; }
            }
            if (!Array.isArray(val)) val = [];
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
        if (keys.length === 0) throw new Error(`[sutramcore] No valid fields to insert into "${this.tableName}"`);
        const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
        return [sql, Object.values(clean)];
    }

    _buildUpdate(data, where) {
        const clean = this.sanitize(data, 'update');
        if (Object.keys(clean).length === 0) throw new Error(`[sutramcore] No valid fields to update in "${this.tableName}"`);

        const { clause, params: whereParams } = this._buildWhere(where);
        if (!clause) throw new Error(`[sutramcore] WHERE required for update in "${this.tableName}"`);

        const setClauses = Object.keys(clean).map(k => `${k} = ?`).join(', ');
        const sql = `UPDATE ${this.tableName} SET ${setClauses} ${clause}`;
        return [sql, [...Object.values(clean), ...whereParams]];
    }

    // Plain SELECT * — no joins, minimal overhead
    _buildSelectPlain(where, orderBy = null, limit = null, offset = null) {
        let sql = `SELECT * FROM ${this.tableName}`;
        const { clause, params } = this._buildWhere(where, false);
        if (clause) sql += ` ${clause}`;
        if (orderBy) sql += ` ORDER BY ${orderBy}`;
        if (limit !== null) sql += ` LIMIT ${limit}`;
        if (offset !== null) sql += ` OFFSET ${offset}`;
        return [sql, params];
    }

    // Full SELECT with all joins — subqueries for hasMany/manyToMany
    // No GROUP BY needed — subqueries handle aggregation independently
    _buildSelectFull(where, orderBy = null, limit = null, offset = null) {
        const { selectCols, joinClauses } = this._buildJoins();

        let sql = `SELECT ${selectCols} FROM ${this.tableName}`;
        if (joinClauses) sql += ` ${joinClauses}`;

        const { clause, params } = this._buildWhere(where, true);
        if (clause) sql += ` ${clause}`;

        if (orderBy) sql += ` ORDER BY ${orderBy}`;
        if (limit !== null) sql += ` LIMIT ${limit}`;
        if (offset !== null) sql += ` OFFSET ${offset}`;

        return [sql, params];
    }

    // ─────────────────────────────────────────────────────────
    // ── WHERE BUILDER ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    //
    // object → { _id: 5, active: 1 }  → WHERE col = ? AND ...  (bound params)
    // string → "date > '2024-01-01'"  → WHERE <raw sql>        (no params)
    //
    // prefixTable: true  → tableName.col = ?  (avoids ambiguity in JOINs)
    // prefixTable: false → col = ?            (UPDATE / DELETE / plain SELECT)

    _buildWhere(where, prefixTable = false) {
        if (!where) return { clause: '', params: [] };

        if (typeof where === 'string') {
            const trimmed = where.trim();
            return { clause: trimmed ? `WHERE ${trimmed}` : '', params: [] };
        }

        if (typeof where === 'object') {
            const keys = Object.keys(where);
            if (keys.length === 0) return { clause: '', params: [] };

            const clause = keys.map(k => {
                const colExpr = (prefixTable && !k.includes('.'))
                    ? `${this.tableName}.${k}`
                    : k;
                return `${colExpr} = ?`;
            }).join(' AND ');

            return { clause: `WHERE ${clause}`, params: Object.values(where) };
        }

        return { clause: '', params: [] };
    }

    // ─────────────────────────────────────────────────────────
    // ── JOIN BUILDER ──────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    //
    // hasOne     → FK on this table via col ref
    //              → LEFT JOIN + json_object() AS alias
    //
    // hasMany    → FK on other table, declared in joins{}
    //              → correlated subquery with nested hasOne support
    //              → COALESCE((...), json('[]')) AS alias
    //
    // manyToMany → through junction table, declared in joins{}
    //              → correlated subquery through junction
    //              → COALESCE((...), json('[]')) AS alias

    _buildJoins() {
        const selectParts = [`${this.tableName}.*`];
        const joinParts = [];

        // ── 1. hasOne ──────────────────────────────────────────
        for (const [colName, def] of Object.entries(this.columns)) {
            if (!def.ref) continue;

            const [refTable, refCol] = def.ref.split('.');
            const alias = def.as ?? refTable;

            joinParts.push(
                `LEFT JOIN ${refTable} AS ${alias} ON ${this.tableName}.${colName} = ${alias}.${refCol}`
            );

            if (def.select) {
                const cols = this._resolveSelect(def.select, refTable);
                const jsonArgs = cols.map(c => `'${c}', ${alias}.${c}`).join(', ');
                selectParts.push(`json_object(${jsonArgs}) AS ${alias}`);
            }
        }

        // ── 2. hasMany — correlated subquery ───────────────────
        for (const [joinKey, def] of Object.entries(this.joins)) {
            if (!def.hasMany) continue;

            const childTable = def.table;
            const childAlias = `_sub_${joinKey}`;
            const outKey = def.as ?? joinKey;
            const childMeta = this.schema[childTable];

            // base columns of child
            const baseCols = this._resolveSelect(def.select ?? '*', childTable);
            let jsonArgParts = baseCols.map(c => `'${c}', ${childAlias}.${c}`);

            // nested hasOne inside child — one level deep
            const childJoinParts = [];
            if (childMeta) {
                for (const [cCol, cDef] of Object.entries(childMeta.columns)) {
                    if (!cDef.ref) continue;
                    const [gRefTable, gRefCol] = cDef.ref.split('.');
                    const gAlias = `${childAlias}_${cDef.as ?? gRefTable}`;
                    const gCols = this._resolveSelect(cDef.select ?? '*', gRefTable);
                    const gJson = gCols.map(gc => `'${gc}', ${gAlias}.${gc}`).join(', ');

                    childJoinParts.push(
                        `LEFT JOIN ${gRefTable} AS ${gAlias} ON ${gAlias}.${gRefCol} = ${childAlias}.${cCol}`
                    );
                    jsonArgParts.push(`'${cDef.as ?? gRefTable}', json_object(${gJson})`);
                }
            }

            const subQuery = `(
                SELECT json_group_array(json_object(${jsonArgParts.join(', ')}))
                FROM ${childTable} AS ${childAlias}
                ${childJoinParts.join(' ')}
                WHERE ${childAlias}.${def.on} = ${this.tableName}.${def.target}
            )`;

            selectParts.push(`COALESCE(${subQuery}, json('[]')) AS ${outKey}`);
        }

        // ── 3. manyToMany — correlated subquery through junction ──
        for (const [joinKey, def] of Object.entries(this.joins)) {
            if (!def.manyToMany) continue;

            const targetTable = def.table;
            const juncTable = def.junction;
            const targetAlias = `_sub_${joinKey}`;
            const juncAlias = `_junc_${joinKey}`;
            const outKey = def.as ?? joinKey;

            const cols = this._resolveSelect(def.select ?? '*', targetTable);
            const jsonArgs = cols.map(c => `'${c}', ${targetAlias}.${c}`).join(', ');

            const subQuery = `(
                SELECT json_group_array(json_object(${jsonArgs}))
                FROM ${juncTable} AS ${juncAlias}
                INNER JOIN ${targetTable} AS ${targetAlias}
                    ON ${targetAlias}._id = ${juncAlias}.${def.target}
                WHERE ${juncAlias}.${def.on} = ${this.tableName}._id
            )`;

            selectParts.push(`COALESCE(${subQuery}, json('[]')) AS ${outKey}`);
        }

        return {
            selectCols: selectParts.join(', '),
            joinClauses: joinParts.join(' '),
        };
    }

    // Resolve select: '*' → all column keys from schema for that table
    // Explicit array → pass through unchanged
    _resolveSelect(select, refTable) {
        if (select !== '*') return select;
        const meta = this.schema[refTable];
        if (!meta) throw new Error(`[sutramcore] Cannot resolve "*" for "${refTable}" — not in schema`);
        return Object.keys(meta.columns);
    }

    // ─────────────────────────────────────────────────────────
    // ── STATEMENT CACHE ───────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    // db.prepare() is expensive — cache by SQL string.
    // Same SQL → reuse prepared statement.
    // Critical for bulk inserts — prepare once, run N times.
    // Cache lives on the instance — isolated per Sutram connection.

    _stmt(sql) {
        if (!this._stmtCache[sql]) {
            this._stmtCache[sql] = this.db.prepare(sql);
        }
        return this._stmtCache[sql];
    }

}

module.exports = BaseTable;
