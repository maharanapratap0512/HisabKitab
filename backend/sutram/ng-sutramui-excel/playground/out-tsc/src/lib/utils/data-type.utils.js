/**
 * data-type.utils.ts
 * ─────────────────────────────────────────────────────────────
 * Safe type coercion, boolean evaluation, and JSON handling.
 * ─────────────────────────────────────────────────────────────
 */
import { formatDateToIso, dateToUnixSeconds } from './date.utils';
/**
 * Checks if a value represents a truthy boolean value.
 */
export function isTruthyBoolean(val) {
    if (typeof val === 'boolean')
        return val;
    if (typeof val === 'number')
        return val === 1;
    const str = String(val).trim().toLowerCase();
    return ['true', '1', 'yes', 'y', 'हाँ', 'सही'].includes(str);
}
/**
 * Checks if a value represents a falsey boolean value.
 */
export function isFalsyBoolean(val) {
    if (typeof val === 'boolean')
        return !val;
    if (typeof val === 'number')
        return val === 0;
    const str = String(val).trim().toLowerCase();
    return ['false', '0', 'no', 'n', 'नहीं', 'गलत'].includes(str);
}
/**
 * Coerces a raw input string or number to a target schema type.
 */
export function coerceToType(value, targetType) {
    if (value === null || value === undefined || String(value).trim() === '') {
        return null;
    }
    const type = (targetType || 'string').toLowerCase();
    switch (type) {
        case 'number':
        case 'integer':
        case 'int':
        case 'float':
        case 'double': {
            const num = Number(String(value).replace(/,/g, '').trim());
            return isNaN(num) ? value : num;
        }
        case 'boolean':
        case 'bool': {
            return isTruthyBoolean(value) ? 1 : 0;
        }
        case 'date': {
            return formatDateToIso(value);
        }
        case 'unix_date': {
            const unix = dateToUnixSeconds(value);
            return unix !== null ? unix : value;
        }
        case 'json': {
            if (typeof value === 'object')
                return JSON.stringify(value);
            try {
                JSON.parse(String(value));
                return String(value);
            }
            catch {
                return JSON.stringify(value);
            }
        }
        case 'string':
        default: {
            return String(value).trim();
        }
    }
}
/**
 * Safely parses JSON strings without throwing errors.
 */
export function safeParseJson(val, fallback = null) {
    if (val === null || val === undefined)
        return fallback;
    if (typeof val === 'object')
        return val;
    try {
        return JSON.parse(String(val));
    }
    catch {
        return fallback;
    }
}
