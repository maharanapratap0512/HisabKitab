/**
 * SchemaHeuristics.js
 * ─────────────────────────────────────────────────────────────
 * Universal intelligent heuristics for Sutram Schema Designer.
 * • Infers SQL types, UI widgets, and constraints from column names.
 * • Automatically selects optimal descriptor columns for Foreign Keys.
 * • 100% domain-agnostic, zero HisabKitab hardcoding (Rule 12).
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

class SchemaHeuristics {
  /**
   * Cleans an arbitrary string into a valid SQL snake_case identifier.
   */
  static sanitizeIdentifier(name) {
    if (!name) return '';
    return String(name)
      .trim()
      .toLowerCase()
      .replace(/[\s\-\.\/]+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/^_+|_+$/g, '')
      .replace(/^[0-9]+/, '');
  }

  /**
   * Infers candidate data type, SQL type, and default constraints from column name.
   */
  static inferTypeFromName(colName) {
    const raw = String(colName || '').trim().toLowerCase();
    const clean = this.sanitizeIdentifier(raw);

    // 1. Primary Key / Foreign Key pattern
    if (clean === '_id' || clean === 'id') {
      return {
        col_type: 'number',
        sql_type: 'INTEGER',
        length_precision: '',
        is_pk: true,
        is_required: true,
        default_type: 'NONE'
      };
    }

    if (clean.endsWith('_id') || clean.endsWith('_fk') || clean.endsWith('_ref')) {
      const candidateTable = clean.replace(/_(id|fk|ref)$/, '');
      return {
        col_type: 'number',
        sql_type: 'INTEGER',
        length_precision: '',
        is_foreign_key: true,
        candidate_table: candidateTable,
        is_required: false,
        default_type: 'NONE'
      };
    }

    // 2. Boolean pattern (is_*, has_*, can_*, active, status)
    if (/^(is_|has_|can_|allow_|should_)/.test(clean) || ['active', 'enabled', 'verified', 'flag'].includes(clean)) {
      return {
        col_type: 'boolean',
        sql_type: 'BOOLEAN',
        length_precision: '',
        is_required: false,
        default_type: 'CUSTOM',
        default_value: '1'
      };
    }

    // 3. Date / Time pattern (*_date, *_time, *_at, dob, date)
    if (clean.endsWith('_date') || clean === 'date' || clean === 'dob' || clean.startsWith('date_')) {
      return {
        col_type: 'date',
        sql_type: 'DATE',
        length_precision: '',
        is_required: false,
        default_type: 'NONE'
      };
    }

    if (clean.endsWith('_time') || clean === 'time') {
      return {
        col_type: 'string',
        sql_type: 'TIME',
        length_precision: '',
        is_required: false,
        default_type: 'NONE'
      };
    }

    if (clean.endsWith('_at') || clean.endsWith('_datetime') || clean === 'timestamp') {
      return {
        col_type: 'datetime',
        sql_type: 'DATETIME',
        length_precision: '',
        is_required: false,
        default_type: 'NONE'
      };
    }

    // 4. Financial & Decimal Numbers (*_amount, *_rate, *_price, *_balance, total, tax, discount)
    if (/(amount|rate|price|balance|cost|fee|charge|tax|discount|total|subtotal|salary)/.test(clean)) {
      return {
        col_type: 'number',
        sql_type: 'DECIMAL',
        length_precision: '12,2',
        is_required: false,
        default_type: 'CUSTOM',
        default_value: '0.00'
      };
    }

    // 5. Quantity / Integer Numbers (qty, quantity, count, sort_order, age, year)
    if (/(qty|quantity|count|sort_order|priority|seq|number|num|age|year|month|day)/.test(clean)) {
      return {
        col_type: 'number',
        sql_type: 'INT',
        length_precision: '',
        is_required: false,
        default_type: 'CUSTOM',
        default_value: '0'
      };
    }

    // 6. Large Text / Descriptions (remarks, description, notes, address, json, bio)
    if (/(remark|notes|description|detail|address|comment|summary|body|message)/.test(clean)) {
      return {
        col_type: 'string',
        sql_type: 'TEXT',
        length_precision: '',
        is_required: false,
        default_type: 'NONE'
      };
    }

    if (clean.endsWith('_json') || clean === 'metadata' || clean === 'payload' || clean === 'config') {
      return {
        col_type: 'json',
        sql_type: 'JSON',
        length_precision: '',
        is_required: false,
        default_type: 'NONE'
      };
    }

    // 7. Standard Short Varchar Strings (name, code, phone, email, etc.)
    return {
      col_type: 'string',
      sql_type: 'VARCHAR',
      length_precision: '255',
      is_required: false,
      default_type: 'NONE'
    };
  }

  /**
   * Intelligently picks 1 to 3 candidate descriptor columns from a table's column list.
   * e.g. For contacts: ['party_name', 'phone', 'city']
   * e.g. For items: ['item_name', 'item_code']
   */
  static inferCandidateDisplayColumns(columns = []) {
    if (!Array.isArray(columns) || columns.length === 0) return [];

    const colNames = columns.map(c => typeof c === 'string' ? c : (c.column_name || c.name || '')).filter(Boolean);
    const nonPkCols = colNames.filter(c => c !== '_id' && c !== 'id' && !c.endsWith('_id') && !c.endsWith('_at'));

    if (nonPkCols.length === 0) return colNames.slice(0, 2);

    // Score columns by likelihood of being human-descriptive
    const scored = nonPkCols.map(c => {
      let score = 0;
      const lower = c.toLowerCase();
      if (lower.includes('name')) score += 10;
      if (lower.includes('title')) score += 9;
      if (lower.includes('code')) score += 8;
      if (lower.includes('label')) score += 7;
      if (lower.includes('phone') || lower.includes('mobile')) score += 6;
      if (lower.includes('city') || lower.includes('state')) score += 5;
      if (lower.includes('type') || lower.includes('category')) score += 4;
      return { name: c, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Pick top scored columns (at least 1, max 3)
    const topCandidates = scored.filter(s => s.score > 0).slice(0, 3).map(s => s.name);
    if (topCandidates.length > 0) {
      return topCandidates;
    }

    // Fallback: pick first 1-2 non-PK columns
    return nonPkCols.slice(0, 2);
  }
}

module.exports = SchemaHeuristics;
