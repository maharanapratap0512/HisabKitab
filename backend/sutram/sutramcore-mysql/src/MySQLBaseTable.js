// src/MySQLBaseTable.js
// ─────────────────────────────────────────────────────────────
// Async version of sutramCore BaseTable for MySQL.
// Same API — all methods return Promises.
// Use await on every call.
//
// Differences from sutramCore BaseTable:
//   - All CRUD methods are async
//   - Uses adapter.run/get/all instead of db.prepare()
//   - No _stmtCache (mysql2 handles prepared statements internally)
//   - lastInsertRowid → insertId from MySQL
//   - JSON columns handled same way
// ─────────────────────────────────────────────────────────────

'use strict';

class MySQLBaseTable {

    // ─────────────────────────────────────────────────────────
    // CONSTRUCTOR
    // adapter — MySQLAdapter or MySQLScopedAdapter instance
    // schema  — full tableMeta object
    // ─────────────────────────────────────────────────────────

    constructor(tableName, { adapter, schema } = {}) {
        if (!adapter) throw new Error('[sutramcore-mysql] MySQLBaseTable requires adapter');
        if (!schema)  throw new Error('[sutramcore-mysql] MySQLBaseTable requires schema');

        this.tableName = tableName;
        this.adapter   = adapter;
        this.schema    = schema;

        const meta = schema[tableName];
        if (!meta) {
            throw new Error(
                `[sutramcore-mysql] Table "${tableName}" not found in schema.\n` +
                `Available: ${Object.keys(schema).join(', ') || '(none)'}`
            );
        }

        this.columns = meta.columns;
        this.joins   = meta.joins ?? {};
    }

    // ─────────────────────────────────────────────────────────
    // PUBLIC CRUD — all async
    // ─────────────────────────────────────────────────────────

    async insert(data, full = true) {
        const [sql, params] = this._buildInsert(data);
        const result = await this.adapter.run(sql, params);
        const id     = result.insertId;
        return full ? this.getById(id) : id;
    }

    async update(data, where, full = true) {
        const [sql, params] = this._buildUpdate(data, where);
        await this.adapter.run(sql, params);
        const id = typeof where === 'object' ? (where._id ?? null) : null;
        return full && id ? this.getById(id) : id;
    }

    async updateById(data, id, full = true) {
        return this.update(data, { _id: id }, full);
    }

    async delete(where) {
        const { clause, params } = this._buildWhere(where);
        if (!clause) throw new Error(`[sutramcore-mysql] WHERE required for delete in "${this.tableName}"`);
        const sql    = `DELETE FROM \`${this.tableName}\` ${clause}`;
        const result = await this.adapter.run(sql, params);
        return result.affectedRows;
    }

    async deleteById(id) {
        return this.delete({ _id: id });
    }

    async getById(id) {
        return this.getOne({ _id: id });
    }

    async getOne(where, { full = true } = {}) {
        const [sql, params] = full
            ? this._buildSelectFull(where)
            : this._buildSelectPlain(where);
        const row = await this.adapter.get(sql, params);
        return full ? this.desanitize(row) : row;
    }

    async getAll(where = {}, { full = true, orderBy = null, limit = null, offset = null } = {}) {
        const [sql, params] = full
            ? this._buildSelectFull(where, orderBy, limit, offset)
            : this._buildSelectPlain(where, orderBy, limit, offset);
        const rows = await this.adapter.all(sql, params);
        return full ? this.desanitizeAll(rows) : rows;
    }

    async count(where = {}) {
        let sql = `SELECT COUNT(*) AS total FROM \`${this.tableName}\``;
        const { clause, params } = this._buildWhere(where, false);
        if (clause) sql += ` ${clause}`;
        const row = await this.adapter.get(sql, params);
        return row?.total ?? 0;
    }

    // ─────────────────────────────────────────────────────────
    // SANITIZE / DESANITIZE — same as sutramCore
    // ─────────────────────────────────────────────────────────

    sanitize(data, mode = 'insert') {
        const result = {};

        for (const colName in this.columns) {
            const def = this.columns[colName];

            if (mode === 'insert' && colName === '_id') continue;
            if (mode === 'update' && !(colName in data)) continue;

            let val = colName in data ? data[colName] : def.default;
            if (val === undefined) continue;

            if (def.required && mode === 'insert' && (val === null || val === undefined || val === '')) {
                throw new Error(`[sutramcore-mysql] "${this.tableName}.${colName}" is required`);
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

    desanitize(row) {
        if (!row) return null;
        const result = { ...row };

        for (const colName in this.columns) {
            if (!(colName in result)) continue;
            const def = this.columns[colName];
            let val   = result[colName];

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

        // hasOne joins — mysql2 returns flat row, JSON columns as strings
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

        // hasMany / manyToMany
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
    // QUERY BUILDERS — same logic as sutramCore
    // MySQL differences: backtick quoting, JSON_ARRAYAGG
    // ─────────────────────────────────────────────────────────

    _buildInsert(data) {
        const clean = this.sanitize(data, 'insert');
        const keys  = Object.keys(clean);
        if (keys.length === 0) throw new Error(`[sutramcore-mysql] No valid fields to insert into "${this.tableName}"`);
        const cols  = keys.map(k => `\`${k}\``).join(', ');
        const vals  = keys.map(() => '?').join(', ');
        return [`INSERT INTO \`${this.tableName}\` (${cols}) VALUES (${vals})`, Object.values(clean)];
    }

    _buildUpdate(data, where) {
        const clean = this.sanitize(data, 'update');
        if (Object.keys(clean).length === 0) throw new Error(`[sutramcore-mysql] No valid fields to update in "${this.tableName}"`);

        const { clause, params: whereParams } = this._buildWhere(where);
        if (!clause) throw new Error(`[sutramcore-mysql] WHERE required for update in "${this.tableName}"`);

        const setClauses = Object.keys(clean).map(k => `\`${k}\` = ?`).join(', ');
        return [`UPDATE \`${this.tableName}\` SET ${setClauses} ${clause}`, [...Object.values(clean), ...whereParams]];
    }

    _buildSelectPlain(where, orderBy = null, limit = null, offset = null) {
        let sql = `SELECT * FROM \`${this.tableName}\``;
        const { clause, params } = this._buildWhere(where, false);
        if (clause)      sql += ` ${clause}`;
        if (orderBy)     sql += ` ORDER BY ${orderBy}`;
        if (limit !== null)  sql += ` LIMIT ${limit}`;
        if (offset !== null) sql += ` OFFSET ${offset}`;
        return [sql, params];
    }

    _buildSelectFull(where, orderBy = null, limit = null, offset = null) {
        const { selectCols, joinClauses } = this._buildJoins();

        let sql = `SELECT ${selectCols} FROM \`${this.tableName}\``;
        if (joinClauses) sql += ` ${joinClauses}`;

        const { clause, params } = this._buildWhere(where, true);
        if (clause)      sql += ` ${clause}`;
        if (orderBy)     sql += ` ORDER BY ${orderBy}`;
        if (limit !== null)  sql += ` LIMIT ${limit}`;
        if (offset !== null) sql += ` OFFSET ${offset}`;

        return [sql, params];
    }

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
                    ? `\`${this.tableName}\`.\`${k}\``
                    : `\`${k}\``;
                return `${colExpr} = ?`;
            }).join(' AND ');

            return { clause: `WHERE ${clause}`, params: Object.values(where) };
        }

        return { clause: '', params: [] };
    }

    _buildJoins() {
        const selectParts = [`\`${this.tableName}\`.*`];
        const joinParts   = [];

        // ── hasOne ──────────────────────────────────────────
        for (const [colName, def] of Object.entries(this.columns)) {
            if (!def.ref) continue;

            const [refTable, refCol] = def.ref.split('.');
            const alias = def.as ?? refTable;

            joinParts.push(
                `LEFT JOIN \`${refTable}\` AS \`${alias}\` ON \`${this.tableName}\`.\`${colName}\` = \`${alias}\`.\`${refCol}\``
            );

            if (def.select) {
                const cols     = this._resolveSelect(def.select, refTable);
                // MySQL: JSON_OBJECT instead of json_object
                const jsonArgs = cols.map(c => `'${c}', \`${alias}\`.\`${c}\``).join(', ');
                selectParts.push(`JSON_OBJECT(${jsonArgs}) AS \`${alias}\``);
            }
        }

        // ── hasMany ─────────────────────────────────────────
        for (const [joinKey, def] of Object.entries(this.joins)) {
            if (!def.hasMany) continue;

            const childTable = def.table;
            const childAlias = `_sub_${joinKey}`;
            const outKey     = def.as ?? joinKey;
            const childMeta  = this.schema[childTable];

            const baseCols   = this._resolveSelect(def.select ?? '*', childTable);
            let jsonArgParts = baseCols.map(c => `'${c}', \`${childAlias}\`.\`${c}\``);

            const childJoinParts = [];
            if (childMeta) {
                for (const [cCol, cDef] of Object.entries(childMeta.columns)) {
                    if (!cDef.ref) continue;
                    const [gRefTable, gRefCol] = cDef.ref.split('.');
                    const gAlias  = `${childAlias}_${cDef.as ?? gRefTable}`;
                    const gCols   = this._resolveSelect(cDef.select ?? '*', gRefTable);
                    const gJson   = gCols.map(gc => `'${gc}', \`${gAlias}\`.\`${gc}\``).join(', ');
                    childJoinParts.push(
                        `LEFT JOIN \`${gRefTable}\` AS \`${gAlias}\` ON \`${gAlias}\`.\`${gRefCol}\` = \`${childAlias}\`.\`${cCol}\``
                    );
                    jsonArgParts.push(`'${cDef.as ?? gRefTable}', JSON_OBJECT(${gJson})`);
                }
            }

            // MySQL: JSON_ARRAYAGG + JSON_OBJECT + COALESCE
            const subQuery = `(
                SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(${jsonArgParts.join(', ')})), JSON_ARRAY())
                FROM \`${childTable}\` AS \`${childAlias}\`
                ${childJoinParts.join(' ')}
                WHERE \`${childAlias}\`.\`${def.on}\` = \`${this.tableName}\`.\`${def.target}\`
            )`;

            selectParts.push(`${subQuery} AS \`${outKey}\``);
        }

        // ── manyToMany ──────────────────────────────────────
        for (const [joinKey, def] of Object.entries(this.joins)) {
            if (!def.manyToMany) continue;

            const targetTable = def.table;
            const juncTable   = def.junction;
            const targetAlias = `_sub_${joinKey}`;
            const juncAlias   = `_junc_${joinKey}`;
            const outKey      = def.as ?? joinKey;

            const cols     = this._resolveSelect(def.select ?? '*', targetTable);
            const jsonArgs = cols.map(c => `'${c}', \`${targetAlias}\`.\`${c}\``).join(', ');

            const subQuery = `(
                SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(${jsonArgs})), JSON_ARRAY())
                FROM \`${juncTable}\` AS \`${juncAlias}\`
                INNER JOIN \`${targetTable}\` AS \`${targetAlias}\`
                    ON \`${targetAlias}\`.\`_id\` = \`${juncAlias}\`.\`${def.target}\`
                WHERE \`${juncAlias}\`.\`${def.on}\` = \`${this.tableName}\`.\`_id\`
            )`;

            selectParts.push(`${subQuery} AS \`${outKey}\``);
        }

        return {
            selectCols:  selectParts.join(', '),
            joinClauses: joinParts.join(' '),
        };
    }

    _resolveSelect(select, refTable) {
        if (select !== '*') return select;
        const meta = this.schema[refTable];
        if (!meta) throw new Error(`[sutramcore-mysql] Cannot resolve "*" for "${refTable}" — not in schema`);
        return Object.keys(meta.columns);
    }
}

module.exports = MySQLBaseTable;
