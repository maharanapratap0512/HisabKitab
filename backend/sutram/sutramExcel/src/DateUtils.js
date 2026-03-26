// src/DateUtils.js
// ─────────────────────────────────────────────────────────────
// Date conversion utilities — tera existing Functions.js se reuse.
// Handles Excel serial numbers, string dates, Unix timestamps.
// ─────────────────────────────────────────────────────────────

'use strict';

const DateUtils = {

    // Excel serial number → JS Date
    // Excel stores dates as days since 1900-01-01
    excelToDate(serial) {
        return new Date((Math.floor(serial - 25569) * 86400) * 1000);
    },

    // Excel serial number → Unix timestamp (seconds)
    excelToUnix(serial) {
        return Math.floor(serial - 25569) * 86400;
    },

    // String date → JS Date
    // Supports: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD
    stringToDate(str) {
        if (!str) return null;
        const parts = str.split(/[.\/\-]+/);
        if (parts.length !== 3) return null;

        if (parts[0].length === 4) {
            // YYYY-MM-DD
            return new Date(`${parts[0]}-${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`);
        }
        // DD-MM-YYYY
        return new Date(`${parts[2].padStart(4,'20')}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
    },

    // String date → Unix timestamp (seconds)
    stringToUnix(str) {
        const d = DateUtils.stringToDate(str);
        return d ? Math.floor(d.getTime() / 1000) : null;
    },

    // Auto detect and convert — string or Excel serial
    parse(value, outputFormat = 'iso') {
        if (!value && value !== 0) return null;

        let date;

        if (typeof value === 'number') {
            date = DateUtils.excelToDate(value);
        } else if (typeof value === 'string') {
            date = DateUtils.stringToDate(value.trim());
        } else if (value instanceof Date) {
            date = value;
        } else {
            return null;
        }

        if (!date || isNaN(date.getTime())) return null;

        switch (outputFormat) {
            case 'iso':   return date.toISOString().split('T')[0];      // YYYY-MM-DD
            case 'unix':  return Math.floor(date.getTime() / 1000);     // Unix seconds
            case 'date':  return date;                                    // JS Date
            default:      return date.toISOString().split('T')[0];
        }
    },

    // Parse for unix_date type (tera existing setDateUnixSecond)
    parseUnix(value) {
        return DateUtils.parse(value, 'unix');
    },

    // Parse for date type (tera existing setDateFormat)
    parseISO(value) {
        return DateUtils.parse(value, 'iso');
    },
};

module.exports = DateUtils;
