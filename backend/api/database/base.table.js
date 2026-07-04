// database/base.table.js
const { dbmodal } = require('./db.model');
const db = dbmodal.db;
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
    // ── TRANSACTIONS ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    //
    // Wraps multiple operations in a single atomic transaction.
    // If fn() throws — rollback. If fn() succeeds — commit.
    // Returns whatever fn() returns.
    //
    // Usage:
    //   const result = BaseTable.transaction(() => {
    //       const id = hmpBatch.insert(data, false);
    //       hmpBatchIn.insert({ ...input, batch_id: id }, false);
    //       hmpBatchOut.insert({ ...output, batch_id: id }, false);
    //       return id;
    //   });

    static transaction(fn) {
        return db.transaction(fn)();
    }

    // Instance version — same thing, callable on any table instance
    // Usage: this.transaction(() => { ... })
    transaction(fn) {
        return BaseTable.transaction(fn);
    }

    // manual control — for complex / nested / router-level cases
    static begin() { db.prepare('BEGIN').run(); }
    static commit() { db.prepare('COMMIT').run(); }
    static rollback() { db.prepare('ROLLBACK').run(); }



    // ─────────────────────────────────────────────────────────
    // ── PUBLIC CRUD API ───────────────────────────────────────
    // ─────────────────────────────────────────────────────────

    // Insert a single row.
    // full: true  → returns desanitized joined object  (default)
    // full: false → returns just the new id            (use for bulk inserts — skips join select)
    insert(data, full = true) {
        const [sql, params] = this._buildInsert(data);
        const id = this._stmt(sql).run(...params).lastInsertRowid;
        return full ? this.getById(id) : id;
    }

    // Update row(s) matching where.
    // where: { _id: 5 }  or  "date > '2024-01-01'"
    // full: true  → returns desanitized joined object  (default)
    // full: false → returns just the id
    // note: if where is a raw string, full is ignored — use getOne() manually after
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

    // Single row by _id — always returns full joined object
    getById(id) {
        return this.getOne({ _id: id });
    }

    // Single row matching where.
    // where : { dept_id: 3 }  or  "voucher_no = 'V001'"
    // opts  : { full }
    //   full: true  → with joins, desanitized  (default)
    //   full: false → plain SELECT *, no joins (faster for internal checks)
    getOne(where, { full = true } = {}) {
        const [sql, params] = full
            ? this._buildSelectFull(where)
            : this._buildSelectPlain(where);
        const row = this._stmt(sql).get(...params);
        return full ? this.desanitize(row) : row;
    }

    // Multiple rows matching where.
    // where : { active: 1 }  or  "date >= '2024-01-01'"  or  {} for all
    // opts  : { full, orderBy, limit, offset }
    //   full: true  → with joins, desanitized  (default)
    //   full: false → plain SELECT *, no joins (faster for bulk / internal use)
    getAll(where = {}, { full = true, orderBy = null, limit = null, offset = null } = {}) {
        const [sql, params] = full
            ? this._buildSelectFull(where, orderBy, limit, offset)
            : this._buildSelectPlain(where, orderBy, limit, offset);
        const rows = this._stmt(sql).all(...params);
        return full ? this.desanitizeAll(rows) : rows;
    }

    // ─────────────────────────────────────────────────────────
    // ── SANITIZE / DESANITIZE ─────────────────────────────────
    // ─────────────────────────────────────────────────────────

    // Prepare data FOR the database.
    // Coerces types, applies defaults, skips unknown columns.
    // mode: 'insert' → skips _id, applies defaults
    // mode: 'update' → only processes fields present in data
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
                // already a string — leave as is

            } else if (def.type === 'number') {
                val = (val !== null && val !== undefined && val !== '') ? Number(val) : null;

            } else if (def.type === 'string') {
                val = val !== null && val !== undefined ? String(val).trim() : null;
            }

            result[col] = val;
        }

        return result;
    }

    // Parse data FROM the database.
    // Coerces types back to JS, parses JSON strings, parses join outputs.
    desanitize(row) {
        if (!row) return null;
        const result = { ...row };

        // ── parse normal columns ──────────────────────────────
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

        // ── parse hasOne join outputs (came back as json_object strings) ──
        // Collapse to null if LEFT JOIN missed (all values null inside object)
        for (const [, def] of Object.entries(this.columns)) {
            if (!def.ref) continue;
            const outKey = def.as ?? def.ref.split('.')[0];
            if (!(outKey in result)) continue;
            let val = result[outKey];

            if (typeof val === 'string') {
                try { val = JSON.parse(val); } catch { val = null; }
            }
            if (val && typeof val === 'object' && !Array.isArray(val) && Object.values(val).every(v => v === null)) {
                val = null;
            }
            result[outKey] = val;
        }

        // ── parse hasMany / manyToMany join outputs (came back as json_group_array strings) ──
        // Falls back to [] if parse fails or LEFT JOIN missed
        for (const [joinKey, def] of Object.entries(this.joins ?? {})) {
            const outKey = def.as ?? joinKey;
            if (!(outKey in result)) continue;
            let val = result[outKey];

            if (typeof val === 'string') {
                try { val = JSON.parse(val); } catch { val = []; }
            }

            result[outKey] = val;
        }

        return result;
    }

    // Desanitize an array of rows
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

    // Plain SELECT * — no joins, no desanitize overhead
    // Used internally and when full: false is passed to getOne / getAll
    _buildSelectPlain(where, orderBy = null, limit = null, offset = null) {
        let sql = `SELECT * FROM ${this.tableName}`;
        const { clause, params } = this._buildWhere(where, false);
        if (clause) sql += ` ${clause}`;
        if (orderBy) sql += ` ORDER BY ${orderBy}`;
        if (limit) sql += ` LIMIT ${limit}`;
        if (offset) sql += ` OFFSET ${offset}`;
        return [sql, params];
    }

    // Full SELECT with all joins built from schema
    // prefixTable=true on WHERE — avoids column ambiguity when joins are present
    // GROUP BY added automatically when hasMany / manyToMany joins are present
    // _buildSelectFull(where, orderBy = null, limit = null, offset = null) {
    //     const { selectCols, joinClauses, needsGroupBy } = this._buildJoins();
    //     let sql = `SELECT ${selectCols} FROM ${this.tableName}`;
    //     if (joinClauses) sql += ` ${joinClauses}`;

    //     const { clause, params } = this._buildWhere(where, true);
    //     if (clause) sql += ` ${clause}`;

    //     if (needsGroupBy) sql += ` GROUP BY ${this.tableName}._id`;
    //     if (orderBy) sql += ` ORDER BY ${orderBy}`;
    //     if (limit) sql += ` LIMIT ${limit}`;
    //     if (offset) sql += ` OFFSET ${offset}`;
    //     return [sql, params];
    // }

    // ─────────────────────────────────────────────────────────
    // ── RECURSIVE JOIN BUILDER ───────────────────────────────
    // ─────────────────────────────────────────────────────────

    _buildSelectFull(where, orderBy = null, limit = null, offset = null) {
        // Start recursion from the root table
        const { selectParts, joinParts, needsGroupBy } = this._buildRecursive(this.tableName, this.tableName);

        let sql = `SELECT ${selectParts.join(', ')} FROM ${this.tableName}`;
        if (joinParts.length > 0) sql += ` ${joinParts.join(' ')}`;

        const { clause, params } = this._buildWhere(where, true);
        if (clause) sql += ` ${clause}`;

        if (needsGroupBy) sql += ` GROUP BY ${this.tableName}._id`;
        if (orderBy) sql += ` ORDER BY ${orderBy}`;
        if (limit) sql += ` LIMIT ${limit}`;
        if (offset) sql += ` OFFSET ${offset}`;

        console.log(sql);

        return [sql, params];
    }

    _buildRecursive(tableName, alias, depth = 0) {
        const meta = tableMeta[tableName];
        const selectParts = (depth === 0) ? [`${alias}.*`] : [];
        const joinParts = [];
        let needsGroupBy = false;

        // ── 1. HAS-ONE (Columns with 'ref') ──
        for (const [col, def] of Object.entries(meta.columns)) {
            if (!def.ref) continue;

            const [refTable, refCol] = def.ref.split('.');
            const subAlias = `${alias}_${def.as ?? refTable}`;
            const cols = this._resolveSelect(def.select || '*', refTable);

            joinParts.push(`LEFT JOIN ${refTable} AS ${subAlias} ON ${alias}.${col} = ${subAlias}.${refCol}`);

            // Correct json_object syntax: 'key', value
            const jsonArgs = cols.map(c => `'${c}', ${subAlias}.${c}`).join(', ');
            selectParts.push(`json_object(${jsonArgs}) AS ${def.as ?? refTable}`);
        }

        // ── 2. HAS-MANY (The joins{} object) ──
        for (const [joinKey, def] of Object.entries(meta.joins ?? {})) {
            if (depth === 0 || def.join) {
                const childTable = def.table;
                const childAlias = `${alias}_${def.as ?? joinKey}`;
                needsGroupBy = true;

                joinParts.push(`LEFT JOIN ${childTable} AS ${childAlias} ON ${childAlias}.${def.on} = ${alias}.${def.target} AND ${childAlias}.active = 1`);

                // RECURSE: Get child columns and their own nested joins
                const nested = this._buildRecursive(childTable, childAlias, depth + 1);
                joinParts.push(...nested.joinParts);

                // Get child base columns
                const baseCols = this._resolveSelect(def.select || '*', childTable);
                const baseJsonArgs = baseCols.map(c => `'${c}', ${childAlias}.${c}`).join(', ');

                // Format nested joins for this child (e.g., 'item', json_object(...))
                // This is where your previous error was: you were missing the key before the nested json_object
                const nestedJsonArgs = nested.selectParts.map(part => {
                    const parts = part.split(' AS ');
                    const key = parts[1].trim();
                    const value = parts[0].trim();
                    return `'${key}', ${value}`;
                }).join(', ');

                const finalJsonArgs = nestedJsonArgs ? `${baseJsonArgs}, ${nestedJsonArgs}` : baseJsonArgs;

                selectParts.push(
                    `CASE WHEN ${childAlias}._id IS NULL THEN json('[]') ` +
                    `ELSE json_group_array(DISTINCT json_object(${finalJsonArgs})) END AS ${def.as ?? joinKey}`
                );
            }
        }

        return { selectParts, joinParts, needsGroupBy };
    }

    // ─────────────────────────────────────────────────────────
    // ── WHERE HELPER ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    //
    // Accepts two formats:
    //   object → { _id: 5, active: 1 }         → WHERE col = ? AND col = ?  (bound params)
    //   string → "date > '2024-01-01'"          → WHERE <raw sql>            (no bound params)
    //
    // prefixTable: true  → tableName.col = ?   (use in SELECT — avoids JOIN ambiguity)
    // prefixTable: false → col = ?             (use in UPDATE / DELETE / plain SELECT)

    _buildWhere(where, prefixTable = false) {
        if (!where) return { clause: '', params: [] };

        // raw SQL string — caller responsible for safety
        if (typeof where === 'string') {
            const trimmed = where.trim();
            return { clause: trimmed ? `WHERE ${trimmed}` : '', params: [] };
        }

        // plain object — equality conditions joined by AND
        if (typeof where === 'object') {
            const keys = Object.keys(where);
            if (keys.length === 0) return { clause: '', params: [] };
            const params = [];
            const clause = keys
                .map(k => {
                    const col = prefixTable && !k.includes('.')
                        ? `${this.tableName}.${k}`
                        : k;
                    if (Array.isArray(where[k])) {
                        if (where[k].length === 0) return '1=0'; // Safe fallback for empty array
                        params.push(...where[k]);
                        return `${col} IN (${where[k].map(() => '?').join(', ')})`;
                    }
                    params.push(where[k]);
                    return `${col} = ?`;
                })
                .join(' AND ');
            return { clause: `WHERE ${clause}`, params: params };
        }

        return { clause: '', params: [] };
    }

    // ─────────────────────────────────────────────────────────
    // ── JOIN BUILDER ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    //
    // Three join types — all driven by schema declarations:
    //
    // ── hasOne ───────────────────────────────────────────────
    // Declared on the FK column itself (like SQL REFERENCES).
    // FK is on THIS table.
    //
    //   unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] }
    //   unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: '*' }
    //
    //   → LEFT JOIN unit AS unit ON this_table.unit_id = unit._id
    //   → json_object('unit_short', unit.unit_short, ...) AS unit
    //   → desanitize collapses to null if LEFT JOIN missed
    //
    // ── hasMany ──────────────────────────────────────────────
    // Declared in joins{} — FK is on the OTHER table pointing back here.
    //
    //   subitems: { hasMany: true, on: 'item_id', table: 'subitem', target: '_id', as: 'subitems', select: [...] }
    //
    //   → LEFT JOIN subitem AS subitems ON subitems.item_id = this_table._id
    //   → CASE WHEN ... THEN json('[]') ELSE json_group_array(DISTINCT json_object(...)) END AS subitems
    //   → requires GROUP BY this_table._id
    //
    // ── manyToMany ───────────────────────────────────────────
    // Declared in joins{} — through a junction table.
    //
    //   categories: { manyToMany: true, table: 'category', junction: 'rel_item_category', on: 'item_id', target: 'category_id', as: 'categories', select: [...] }
    //
    //   → LEFT JOIN rel_item_category AS categories_junc ON categories_junc.item_id = this_table._id
    //   → LEFT JOIN category AS categories ON categories._id = categories_junc.category_id
    //   → CASE WHEN ... THEN json('[]') ELSE json_group_array(DISTINCT json_object(...)) END AS categories
    //   → requires GROUP BY this_table._id

    // Resolves select: '*' to all column names from the referenced table's schema.
    // Explicit arrays are passed through unchanged.
    _resolveSelect(select, refTable) {
        if (select !== '*') return select;
        const meta = tableMeta[refTable];
        if (!meta) throw new Error(`Cannot resolve * for "${refTable}" — not in schema`);
        return Object.keys(meta.columns);
    }

    _buildJoins() {
        const selectParts = [`${this.tableName}.*`];
        const joinParts = [];
        let needsGroupBy = false; // Usually not needed with subqueries, but kept for compatibility

        // ── 1. hasOne (Standard Joins - Level 1) ──
        for (const [col, def] of Object.entries(this.columns)) {
            if (!def.ref) continue;
            const [refTable, refCol] = def.ref.split('.');
            const alias = def.as ?? refTable;

            joinParts.push(`LEFT JOIN ${refTable} AS ${alias} ON ${this.tableName}.${col} = ${alias}.${refCol}`);

            if (def.select) {
                const cols = this._resolveSelect(def.select, refTable);
                const jsonArgs = cols.map(c => `'${c}', ${alias}.${c}`).join(', ');
                selectParts.push(`json_object(${jsonArgs}) AS ${alias}`);
            }
        }

        // ── 2. hasMany (Subqueries - Level 2 Support) ──
        for (const [alias, def] of Object.entries(this.joins ?? {})) {
            if (def.hasMany) {
                const childTable = def.table;
                const childAlias = `sub_${alias}`;

                // Get child columns
                const cols = this._resolveSelect(def.select || '*', childTable);
                let jsonArgs = cols.map(c => `'${c}', ${childAlias}.${c}`).join(', ');

                // ── Deep Level 2: Join dependencies for the child (e.g., Input -> Item) ──
                const childMeta = tableMeta[childTable];
                const childJoins = [];

                for (const [cCol, cDef] of Object.entries(childMeta.columns)) {
                    if (cDef.ref && cDef.as) {
                        const [gRefTable, gRefCol] = cDef.ref.split('.');
                        const gAlias = `${childAlias}_${cDef.as}`;
                        const gCols = this._resolveSelect(cDef.select || '*', gRefTable);

                        childJoins.push(`LEFT JOIN ${gRefTable} AS ${gAlias} ON ${gAlias}.${gRefCol} = ${childAlias}.${cCol}`);

                        const gJsonArgs = gCols.map(gc => `'${gc}', ${gAlias}.${gc}`).join(', ');
                        jsonArgs += `, '${cDef.as}', json_object(${gJsonArgs})`;
                    }
                }

                // ── Build the Final Subquery ──
                const outKey = def.as ?? alias;
                const subQuery = `(
                    SELECT json_group_array(json_object(${jsonArgs}))
                    FROM ${childTable} AS ${childAlias}
                    ${childJoins.join(' ')}
                    WHERE ${childAlias}.${def.on} = ${this.tableName}.${def.target}
                    AND ${childAlias}.active = 1
                )`;

                selectParts.push(`COALESCE(${subQuery}, json('[]')) AS ${outKey}`);
            }
            else if (def.manyToMany) {
                const targetTable = def.table;
                const junctionTable = def.junction;
                const alias_target = `sub_${alias}`;
                const alias_junc = `${alias}_junc`;

                // 1. Resolve columns for the target table (e.g., Category names)
                const targetCols = this._resolveSelect(def.select || '*', targetTable);
                const jsonArgs = targetCols.map(c => `'${c}', ${alias_target}.${c}`).join(', ');

                // 2. Build the Many-to-Many Subquery
                const outKey = def.as ?? alias;
                const subQuery = `(
                    SELECT json_group_array(json_object(${jsonArgs}))
                    FROM ${junctionTable} AS ${alias_junc}
                    INNER JOIN ${targetTable} AS ${alias_target} ON ${alias_target}._id = ${alias_junc}.${def.target}
                    WHERE ${alias_junc}.${def.on} = ${this.tableName}._id
                )`;

                selectParts.push(`COALESCE(${subQuery}, json('[]')) AS ${outKey}`);
            }

        }

        return {
            selectCols: selectParts.join(', '),
            joinClauses: joinParts.join(' '),
            needsGroupBy: false // Subqueries handle aggregation, no main GROUP BY required!
        };
    }


    // ─────────────────────────────────────────────────────────
    // ── STATEMENT CACHE ──────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    //
    // better-sqlite3: db.prepare() is expensive — avoid calling it repeatedly.
    // Cache by SQL string so the same statement is prepared once and reused.
    // Key benefit: bulk inserts prepare once, reuse for every row — big speed gain.

    _stmt(sql) {
        if (!this._stmtCache[sql]) {
            this._stmtCache[sql] = db.prepare(sql);
        }
        return this._stmtCache[sql];
    }

}

// database/base.table.js
//
// Shim — re-exports the BaseTable bound to the main 'sewa' Sutram instance.
//
// All existing services that do require('../database/base.table') keep working
// with zero changes — they get the instance-aware BaseTable tied to the sewa db.
//
// Backward note: the large class body above this section is legacy code kept
// for reference only (not exported). The active implementation is in sutramcore.

const { sutramDB } = require('./db.model');
module.exports = sutramDB.BaseTable;