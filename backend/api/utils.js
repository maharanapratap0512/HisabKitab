// backend/api/utils.js
// ─────────────────────────────────────────────────────────────────────────────
// Pure utility helpers — no DB, no service, no side-effects.
// All methods are static — import once, use as Utils.method().
//
// Usage:
//   const Utils = require('../utils');
//   Utils.cleanString('  Hello  ');
//   Utils.StringToDate('15/03/2024');
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

class Utils {

    // ─────────────────────────────────────────────────────────
    // ── STRING ───────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────

    /**
     * Normalize a string for consistent comparison:
     * trim → NFC → remove zero-width / NBSP → collapse spaces → lowercase
     * @param {string|null|undefined} str
     * @returns {string}
     */
    static cleanString(str) {
        return (str || '')
            .trim()
            .normalize('NFC')
            .replace(/\u200B/g, '')   // zero-width space
            .replace(/\u00A0/g, ' ')  // non-breaking space → regular space
            .replace(/\s+/g, ' ')     // collapse multiple spaces
            .toLowerCase();
    }

    /**
     * Normalized equality — compares two strings after cleanString().
     * @param {string} a
     * @param {string} b
     * @returns {boolean}
     */
    static stringCompare(a, b) {
        return Utils.cleanString(a) === Utils.cleanString(b);
    }

    /**
     * Normalize string fields on an array of objects in-place.
     * @param {object[]} data
     * @param {string[]|null} fieldList  — null/[] = all string fields
     * @returns {object[]} same array (mutated)
     * @example
     * Utils.convertToLower(rows, ['item_hin', 'item_eng']);
     */
    static convertToLower(data, fieldList = null) {
        const norm = v => (v ? String(v).trim().toLowerCase().normalize('NFC') : null);
        for (const row of data) {
            const keys = (fieldList && fieldList.length) ? fieldList : Object.keys(row);
            for (const k of keys) {
                if (typeof row[k] === 'string') row[k] = norm(row[k]);
            }
        }
        return data;
    }


    // ─────────────────────────────────────────────────────────
    // ── DATE ─────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────

    /**
     * Excel serial date → JS Date
     * @param {number} intDate
     * @returns {Date}
     */
    static ExcelDateToJSDate(intDate) {
        return new Date((Math.floor(intDate - 25569) * 86400) * 1000);
    }

    /**
     * Excel serial date → Unix timestamp (seconds)
     * @param {number} intDate
     * @returns {number}
     */
    static ExcelDateToUnixSDate(intDate) {
        return Math.floor(intDate - 25569) * 86400;
    }

    /**
     * Parse date string → JS Date.
     * Supports: `yyyy-mm-dd`, `dd/mm/yyyy`, `dd-mm-yy` (separators: . / -)
     * @param {string} stringDate
     * @returns {Date|undefined}
     */
    static StringToDate(stringDate) {
        const p = stringDate.split(/[./-]+/);
        if (p && p.length === 3) {
            return p[0].length === 4
                ? new Date(`${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`)
                : new Date(`${p[2].padStart(4, '20')}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`);
        }
        return undefined;
    }

    /**
     * Parse date string → Unix timestamp (seconds)
     * @param {string} stringDate
     * @returns {number|undefined}
     */
    static StringToUnixSDate(stringDate) {
        const d = Utils.StringToDate(stringDate);
        return d ? d.getTime() / 1000 : undefined;
    }

    /**
     * Julian Day Number → JS Date  (JDN 2440587.5 = Unix epoch)
     * @param {number} julianDate
     * @returns {Date}
     */
    static JulianDateToJSDate(julianDate) {
        return new Date((julianDate - 2440587.5) * 86400000);
    }


    // ─────────────────────────────────────────────────────────
    // ── MONTH / RANGE ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────

    /**
     * Sort a sparse month list and fill all months between min and max.
     * @param {number[]} arrMonth
     * @returns {number[]}  e.g. [3,7] → [3,4,5,6,7]
     */
    static sortAndFillMonths(arrMonth = [1, 12]) {
        const sorted = [...arrMonth].sort((a, b) => a - b);
        const result = [];
        for (let m = sorted[0]; m <= sorted[sorted.length - 1]; m++) result.push(m);
        return result;
    }

    /**
     * Same as sortAndFillMonths() but returns zero-padded strings.
     * @param {number[]} arrMonth
     * @returns {string[]}  e.g. ["03","04","05","06","07"]
     */
    static sortAndFillMonthsString(arrMonth = [1, 12]) {
        return Utils.sortAndFillMonths(arrMonth).map(m => String(m).padStart(2, '0'));
    }


    // ─────────────────────────────────────────────────────────
    // ── SQL ───────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────

    /**
     * Build a quoted CSV string for SQL IN clauses.
     * ⚠️ Use only with trusted / pre-validated values — not bound parameters.
     * @param {Array} array
     * @returns {string}  e.g. "'foo','bar','baz'"
     * @example
     * db.prepare(`SELECT * FROM item WHERE _id IN (${Utils.sqlIn([1,2,3])})`).all();
     */
    static sqlIn(array) {
        return array.map(v => `'${v}'`).join(',');
    }


    // ─────────────────────────────────────────────────────────
    // ── MISC ─────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────

    /**
     * Convert a string or Excel serial number to an ISO date string (yyyy-mm-dd).
     *   string → parsed via StringToDate()
     *   number → parsed via ExcelDateToJSDate()
     * @param {string|number} data
     * @returns {string}  e.g. "2024-03-15"
     */
    static setDateFormat(data) {
        if (typeof data === 'string') {
            return Utils.StringToDate(data).toISOString().split('T')[0];
        } else if (typeof data === 'number') {
            return Utils.ExcelDateToJSDate(data).toISOString().split('T')[0];
        }
    }

    /**
     * Convert a string or Excel serial number to a Unix timestamp (seconds).
     *   string → parsed via StringToUnixSDate()
     *   number → parsed via ExcelDateToUnixSDate()
     * @param {string|number} data
     * @returns {number}
     */
    static setDateUnixSecond(data) {
        if (typeof data === 'string') {
            return Utils.StringToUnixSDate(data);
        } else if (typeof data === 'number') {
            return Utils.ExcelDateToUnixSDate(data);
        }
    }

    /**
     * Check if a value is a non-null object (excludes null, undefined, primitives).
     * @param {*} value
     * @returns {boolean}
     */
    static isObject(value) {
        return typeof value === 'object' && value !== null && value !== undefined;
    }

}

module.exports = Utils;

