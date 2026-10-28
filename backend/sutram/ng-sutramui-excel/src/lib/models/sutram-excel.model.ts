/**
 * sutram-excel.model.ts
 * ─────────────────────────────────────────────────────────────
 * TypeScript models representing tables, columns, rows, cells,
 * and scanner results in ng-sutramui-excel.
 * ─────────────────────────────────────────────────────────────
 */

export type StudioAuditMode = 'normal' | 'intelligent';

/**
 * Derived column header definition from sutramExcel ConfigDeriver
 */
export interface SutramHeaderConfig {
  col_name: string;        // e.g. 'category_id'
  name: string;            // e.g. 'category' (Excel column header)
  alt_names?: string[];    // e.g. ['cat', 'श्रेणी', 'category name']
  not_null?: boolean;      // mandatory constraint
  type?: string;           // 'string' | 'number' | 'boolean' | 'date' | 'unix_date' | 'ref' | 'mix' | 'json'
  ref_table?: string;      // referenced table e.g. 'category'
  ref_field?: string;      // e.g. 'category_id'
  ref_data?: string;       // display text e.g. 'category_hin'
  ref_as?: string;         // alias e.g. 'category'
  matchFields?: string[];  // custom matching fields
  width?: number;          // display width in grid
  description?: string;
}

/**
 * Registered table configuration from GET /_sutram/excel/config/:table
 */
export interface SutramTableConfig {
  table: string;
  display_name: string;
  headers: SutramHeaderConfig[];
  duplicateOn?: string[];
  fullDuplicateOn?: string[];
  canUpdate?: boolean;
  autoIncrement?: string[];
  jsonColumns?: string[];
  booleanColumns?: string[];
  dateColumns?: string[];
  autoSet?: Record<string, any>;
}

/**
 * Cell state representation in the interactive grid
 */
export interface SutramCell {
  value: any;
  isValid: boolean;
  isWarning?: boolean;
  errorMessage?: string;
  isModified?: boolean;
  isNew?: boolean;
  originalValue?: any;
  refId?: any;        // resolved foreign key ID
  refDisplay?: string; // formatted bilingual display label
}

/**
 * Row state representation in the grid
 */
export interface SutramRow {
  rowNum: number;
  cells: Record<string, SutramCell>;
  hasError: boolean;
  errorCount: number;
  isNew?: boolean;
  isModified?: boolean;
  isSynced?: boolean;
  _rawOriginal?: any;
}

/**
 * Scanner matched header column
 */
export interface SutramScanMatch {
  sheetColIndex: number;
  sheetHeader: string;
  targetColKey: string | null;
  targetHeader?: SutramHeaderConfig;
  status: 'matched' | 'unmatched' | 'manual';
  confidence: number; // 0.0 to 1.0
}

/**
 * Scan report produced by SutramExcelScannerService
 */
export interface SutramScanReport {
  headerRowIndex: number;
  totalSheetCols: number;
  matches: SutramScanMatch[];
  missingMandatory: SutramHeaderConfig[];
  sampleRows: any[];
}

/**
 * Summary validation statistics
 */
export interface SutramGridStats {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  errorCellsCount: number;
}
