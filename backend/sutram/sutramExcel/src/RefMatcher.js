// src/RefMatcher.js
// ─────────────────────────────────────────────────────────────
// Resolves FK references in Excel data.
// For each ref column (category_id, unit_id etc.):
//   1. Load ref table data from DB
//   2. Match Excel value against ref fields (hin/eng/roman/code)
//   3. Fallback → xls_dictionary
//   4. Still not found → correctionList
//
// Generic — works from schema ref info
// Override — developer config.headers.unit_id.matchFields
// ─────────────────────────────────────────────────────────────

'use strict';

class RefMatcher {

    constructor(engine, dictionary) {
        this.engine     = engine;
        this.dictionary = dictionary;
        this._refCache  = {};   // { tableName: rows[] } — loaded once per import session
    }

    // ─────────────────────────────────────────────────────────
    // RESOLVE ALL — process entire excelArrObj
    // Returns { rows: resolvedRows, correctionList }
    // ─────────────────────────────────────────────────────────

    async resolveAll(rows, tableConfig) {
        const correctionList = [];
        const notFoundMap    = {};   // track already-not-found to avoid duplicates

        // preload all ref table data once
        await this._preloadRefs(tableConfig);

        const resolved = [];

        for (let i = 0; i < rows.length; i++) {
            const row    = { ...rows[i] };
            const errors = [];

            for (const header of tableConfig.headers) {
                if (!header.ref_table || !header.ref_field) continue;

                const rawValue = row[header.name];
                if (!rawValue && rawValue !== 0) continue;  // empty — skip

                // special mix type (item + subitem)
                if (header.type === 'mix') {
                    await this._resolveMix(row, header, correctionList, notFoundMap, i);
                    continue;
                }

                // standard ref
                const id = await this._resolveRef(
                    rawValue, header, correctionList, notFoundMap, i
                );
                if (id !== null) {
                    row[header.ref_field] = id;
                    row[`_ref_${header.ref_field}`] = this._getRefDisplay(
                        rawValue, header, id
                    );
                }
            }

            resolved.push(row);
        }

        return { rows: resolved, correctionList };
    }

    // ─────────────────────────────────────────────────────────
    // RESOLVE SINGLE REF
    // ─────────────────────────────────────────────────────────

    async _resolveRef(value, header, correctionList, notFoundMap, rowIndex) {
        const clean    = this._clean(value);
        const refRows  = this._refCache[header.ref_table] ?? [];
        const matchFields = header.matchFields ?? this._guessMatchFields(header.ref_table, refRows);

        // 1. direct match against ref table
        const tbl = (header.ref_table || '').toLowerCase();
        for (const row of refRows) {
            // Check raw ID match if numeric
            if (String(row._id) === clean) {
                return row._id;
            }

            // Check full combination display match (e.g. "भारत : India")
            if (tbl) {
                const hin = row[`${tbl}_hin`];
                const eng = row[`${tbl}_eng`];
                const code = row[`${tbl}_code`];
                if (hin && eng) {
                    if (this._clean(`${hin} : ${eng}`) === clean) return row._id;
                    if (code && this._clean(`${hin} : ${eng} : ${code}`) === clean) return row._id;
                }
            }

            // Check individual match fields
            for (const field of matchFields) {
                if (this._clean(row[field]) === clean) {
                    return row._id;
                }
            }

            // If input is composite like "भारत : India", check individual parts
            if (clean.includes(':')) {
                const parts = clean.split(':').map(p => this._clean(p)).filter(Boolean);
                for (const p of parts) {
                    for (const field of matchFields) {
                        if (this._clean(row[field]) === p) {
                            return row._id;
                        }
                    }
                }
            }
        }

        // 2. dictionary fallback
        const dictEntry = this.dictionary.find(header.ref_table, clean);
        if (dictEntry) {
            return isNaN(dictEntry.ref_id) ? dictEntry.ref_id : Number(dictEntry.ref_id);
        }

        // 3. not found — add to correctionList (deduplicate)
        const key = `${header.ref_table}:${clean}`;
        if (!notFoundMap[key]) {
            notFoundMap[key] = correctionList.length;
            correctionList.push({
                type:       header.ref_table,
                name:       value,
                col_name:   header.col_name,
                ref_field:  header.ref_field,
                rowIndexes: [rowIndex],
                id:         null,
                dictionary: false,
                ignore:     false,
                done:       false,
            });
        } else {
            // same value in another row — add rowIndex
            correctionList[notFoundMap[key]].rowIndexes.push(rowIndex);
        }

        return null;
    }

    // ─────────────────────────────────────────────────────────
    // RESOLVE MIX (item + subitem)
    // ─────────────────────────────────────────────────────────

    async _resolveMix(row, header, correctionList, notFoundMap, rowIndex) {
        const itemValue    = row[header.name];
        const subitemValue = row['subitem'] ?? null;

        const itemRows   = this._refCache['item']    ?? [];
        const subitemRows = this._refCache['subitem'] ?? [];

        const cleanItem    = this._clean(itemValue);
        const cleanSubitem = subitemValue ? this._clean(subitemValue) : null;

        // match item
        let itemId = null;
        const itemMatchFields = ['item_hin', 'item_eng', 'item_roman', 'item_code'];

        for (const r of itemRows) {
            for (const f of itemMatchFields) {
                if (this._clean(r[f]) === cleanItem) {
                    itemId = r._id;
                    break;
                }
            }
            if (itemId) break;
        }

        // item dictionary fallback
        if (!itemId) {
            const d = this.dictionary.find('item', cleanItem);
            if (d) itemId = Number(d.ref_id);
        }

        // match subitem (only if item found)
        let subitemId = null;
        if (itemId && cleanSubitem) {
            const subMatchFields = ['subitem_hin', 'subitem_eng', 'subitem_roman'];
            for (const r of subitemRows) {
                if (r.item_id !== itemId) continue;
                for (const f of subMatchFields) {
                    if (this._clean(r[f]) === cleanSubitem) {
                        subitemId = r._id;
                        break;
                    }
                }
                if (subitemId) break;
            }
        }

        if (itemId) {
            row['item_id'] = itemId;
        }
        if (subitemId) {
            row['subitem_id'] = subitemId;
        }

        // not found
        if (!itemId || (cleanSubitem && !subitemId)) {
            const key = `item:${cleanItem}:${cleanSubitem}`;
            if (!notFoundMap[key]) {
                notFoundMap[key] = correctionList.length;
                correctionList.push({
                    type:       'item',
                    name:       { item: itemValue, subitem: subitemValue },
                    col_name:   header.col_name,
                    ref_field:  'item_id',
                    rowIndexes: [rowIndex],
                    id:         itemId,
                    id2:        subitemId,
                    dictionary: false,
                    ignore:     false,
                    done:       false,
                });
            } else {
                correctionList[notFoundMap[key]].rowIndexes.push(rowIndex);
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    // PRELOAD ref table data once per session
    // ─────────────────────────────────────────────────────────

    async _preloadRefs(tableConfig) {
        const tables = new Set();
        for (const h of tableConfig.headers) {
            if (h.ref_table) tables.add(h.ref_table);
        }
        // always load item + subitem for mix type
        const hasMix = tableConfig.headers.some(h => h.type === 'mix');
        if (hasMix) { tables.add('item'); tables.add('subitem'); }

        for (const t of tables) {
            if (this._refCache[t]) continue;
            try {
                this._refCache[t] = this.engine.table(t).getAll({}, { full: false });
            } catch {
                this._refCache[t] = [];
                console.warn(`[sutramexcel] Ref table "${t}" not in schema — skipping`);
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    // GUESS MATCH FIELDS from ref table data
    // Common patterns: _hin, _eng, _roman, _code, _short
    // ─────────────────────────────────────────────────────────

    _guessMatchFields(refTable, refRows) {
        if (!refRows.length) return ['name'];
        const sample = refRows[0];
        const keys   = Object.keys(sample).filter(k => k !== '_id' && !k.includes('_by_dept_id') && k !== 'verify');
        const tblPrefix = (refTable || '').toLowerCase() + '_';

        // 1. Prioritize fields that start with the reference table name: ${refTable}_hin, ${refTable}_eng, etc.
        const tblFields = keys.filter(k => k.startsWith(tblPrefix));
        tblFields.sort((a, b) => {
            const getW = (n) => {
                if (n === `${tblPrefix}hin`) return 1;
                if (n === `${tblPrefix}eng`) return 2;
                if (n === `${tblPrefix}roman`) return 3;
                if (n === `${tblPrefix}code` || n === `${tblPrefix}roll` || n === `${tblPrefix}full`) return 4;
                if (n === `${tblPrefix}short` || n === `${tblPrefix}name`) return 5;
                return 6;
            };
            return getW(a) - getW(b);
        });

        // 2. Secondary patterns
        const otherPatterns = ['_hin', '_eng', '_roman', '_code', '_short', '_full', 'name', 'roll_no'];
        const otherFields = keys.filter(k => !k.startsWith(tblPrefix) && otherPatterns.some(p => k.includes(p)));

        const combined = [...tblFields, ...otherFields];
        return combined.length ? combined : keys.slice(0, 3);
    }

    _getRefDisplay(rawValue, header, id) {
        const refRows = this._refCache[header.ref_table] ?? [];
        const row = refRows.find(r => r._id == id);
        if (!row) return rawValue;
        if (header.ref_data && row[header.ref_data]) return row[header.ref_data];

        const tbl = (header.ref_table || '').toLowerCase();
        if (tbl) {
            const hin = row[`${tbl}_hin`];
            const eng = row[`${tbl}_eng`];
            const code = row[`${tbl}_code`];
            const full = row[`${tbl}_full`];
            const short = row[`${tbl}_short`];
            const name = row[`${tbl}_name`];

            if (hin && eng) return code ? `${hin} : ${eng} : ${code}` : `${hin} : ${eng}`;
            if (hin && code) return `${hin} : ${code}`;
            if (hin) return hin;
            if (full) return short ? `${full} (${short})` : full;
            if (name) return name;
        }

        const hinKey = Object.keys(row).find(k => k.endsWith('_hin'));
        if (hinKey) {
            const prefix = hinKey.slice(0, -4);
            const engVal = row[`${prefix}_eng`];
            return engVal ? `${row[hinKey]} : ${engVal}` : row[hinKey];
        }

        return row.name || row.title || rawValue;
    }

    _clean(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .trim()
            .normalize('NFC')
            .replace(/\u200B/g, '')
            .replace(/\u00A0/g, ' ')
            .replace(/\s+/g, ' ')
            .toLowerCase();
    }

    clearCache() {
        this._refCache = {};
    }
}

module.exports = RefMatcher;
