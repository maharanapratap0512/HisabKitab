/**
 * date.utils.ts
 * ─────────────────────────────────────────────────────────────
 * Safe date parser, Excel serial number converter, and Unix timestamp
 * transformation helpers.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Converts an Excel serial date number (days elapsed since Jan 1, 1900)
 * into a standard JavaScript Date.
 * Handles the famous Excel 1900 leap year bug.
 */
export function excelSerialToDate(serial: number): Date | null {
  if (typeof serial !== 'number' || isNaN(serial) || serial <= 0) return null;

  // Excel treats 1900 as a leap year (it wasn't), offset by 1 for serials > 60
  const adjustedSerial = serial > 60 ? serial - 1 : serial;
  const utcMilliseconds = (adjustedSerial - 1) * 86400 * 1000;
  const date1900 = new Date(Date.UTC(1900, 0, 1));
  const result = new Date(date1900.getTime() + utcMilliseconds);

  return isNaN(result.getTime()) ? null : result;
}

/**
 * Safely parses any date input (number, Date, string) into an ISO 'YYYY-MM-DD' string.
 * Supports:
 * - Excel serial numbers (e.g. 45210)
 * - ISO formats (e.g. '2026-10-26')
 * - Indian/UK standard formats ('DD-MM-YYYY', 'DD/MM/YYYY')
 */
export function formatDateToIso(val: any): string {
  if (val === null || val === undefined || val === '') return '';

  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split('T')[0];
  }

  if (typeof val === 'number') {
    const fromSerial = excelSerialToDate(val);
    if (fromSerial) return fromSerial.toISOString().split('T')[0];
  }

  const str = String(val).trim();

  // Pattern: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Pattern: YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fallback to JS Date parser
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return str;
}

/**
 * Converts a date input to Unix timestamp in seconds.
 */
export function dateToUnixSeconds(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;

  if (typeof val === 'number') {
    // If it's an Excel serial (< 100000)
    if (val < 100000) {
      const d = excelSerialToDate(val);
      return d ? Math.floor(d.getTime() / 1000) : null;
    }
    // If it's already millisecond timestamp
    if (val > 100000000000) {
      return Math.floor(val / 1000);
    }
    // Already in seconds
    return Math.floor(val);
  }

  const iso = formatDateToIso(val);
  if (!iso) return null;

  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000);
}
