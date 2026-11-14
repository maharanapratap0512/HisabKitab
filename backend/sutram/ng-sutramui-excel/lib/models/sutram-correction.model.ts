/**
 * sutram-correction.model.ts
 * ─────────────────────────────────────────────────────────────
 * Models for FK resolution, correction wizard, and persistent
 * dictionary memory.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Single unmatched item returned by POST /_sutram/excel/verify/:table
 */
export interface SutramCorrectionItem {
  type: string;          // ref table name e.g. 'unit'
  name: string;          // unknown string from Excel e.g. 'kulo'
  col_name: string;      // column name in DB e.g. 'unit_id'
  ref_field: string;     // ref field in DB e.g. 'unit_id'
  rowIndexes: number[];  // row indices where this bad value was found
  id: any;               // resolved ID by user
  resolvedDisplay?: string; // label of resolved entity
  dictionary: boolean;   // checkbox to save in xls_dictionary
  ignore?: boolean;
  done: boolean;
}

/**
 * Grouped correction item for the batch sidebar
 */
export interface CorrectionGroup {
  groupKey: string;      // `${type}:${clean(name)}`
  type: string;          // 'unit'
  name: string;          // 'kulo'
  occurrences: number;   // number of rows affected
  rowIndexes: number[];
  resolvedId: any;
  resolvedDisplay?: string;
  saveToDictionary: boolean;
  isResolved: boolean;
}

/**
 * Persistent dictionary entry from xls_dictionary
 */
export interface DictionaryEntry {
  _id: number;
  type: string;          // e.g. 'unit', 'category'
  name: string;          // e.g. 'kulo'
  ref_id: any;           // target ID in referenced table
  ref_id2?: any;         // secondary target ID (e.g. for mix item/subitem)
  extra_note?: string;
  active: number;        // 1 = active, 0 = soft deleted
  created_at?: string;
  updated_at?: string;
}

/**
 * Event payload when a correction is applied (in-cell or from sidebar)
 */
export interface CorrectionResolutionEvent {
  table: string;
  colName: string;
  badValue: string;
  resolvedId: any;
  resolvedDisplay: string;
  applyToAll: boolean;
  saveToDictionary: boolean;
  rowIndices: number[];
}
