export type StudioMode = 'normal' | 'intelligent';

export interface StudioColumn {
  key: string;
  name: string;
  col_name?: string;
  not_null?: boolean;
  ref_table?: string;
  ref_field?: string;
  ref_data?: string;
  type?: string;
  alt_names?: string[];
  width?: number;
  description?: string;
  badgeClass?: string;
}

export interface StudioCell {
  value: any;
  isValid: boolean;
  isWarning?: boolean;
  errorMessage?: string;
}

export interface StudioRow {
  rowNum: number;
  cells: { [colKey: string]: StudioCell };
  hasError: boolean;
  errorCount: number;
}

export interface StudioFormat {
  id: string;
  name: string;
  title: string;
  title_hin: string;
  title_eng?: string;
  icon: string;
  badgeColor?: string;
  desc: string;
  desc_hin?: string;
  note?: string;
  columns: StudioColumn[];
  sampleRows?: any[];
}

export interface ScanMatchItem {
  sheetColIndex: number;
  sheetHeader: string;
  targetColKey: string | null;
  targetColName?: string;
  isMandatory?: boolean;
  status: 'matched' | 'unmatched' | 'manual';
}

export interface ScanReport {
  headerRowIndex: number;
  targetFormat: StudioFormat;
  matches: ScanMatchItem[];
  missingMandatory: StudioColumn[];
  totalSheetCols: number;
}

export interface AutocompleteOption {
  id?: any;
  label: string;
  secondary?: string;
  code?: string;
  raw?: any;
}
