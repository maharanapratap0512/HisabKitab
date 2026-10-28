# ng-sutramui-excel: Architecture, Files & Functions Documentation Index

This document serves as the authoritative, granular index of all files, modules, models, services, and functions within the `ng-sutramui-excel` package. Every function is documented with its purpose, signature, parameters, and return value.

---

## 1. Directory Overview

| Directory | Layer | Purpose |
| :--- | :--- | :--- |
| `src/lib/utils/` | Headless Utilities | Pure mathematical, string, date, and clipboard calculation helpers. Zero UI dependencies. |
| `src/lib/models/` | TypeScript Contracts | Data models, state representations, column rules, and API response structures. |
| `src/lib/services/` | Business & API Services | HTTP API client, reactive Signal state store, fuzzy scanner engine, and validation auditor. |
| `src/lib/components/` | PrimeNG UI Components | Visual interfaces (Studio workspace, Virtual Grid, Scanner Modal, Sidebar, Importer, Dictionary). |
| `src/lib/styles/` | SCSS Design System | PrimeNG theme extensions, compact Excel gridlines, and cell status indicators. |

---

## 2. Utils Layer (`src/lib/utils/`)

### 2.1. `normalization.utils.ts`
Utility functions for Devanagari/Hindi string cleaning, Unicode NFC normalization, and fuzzy string comparison.

- `cleanString(input: any): string`
  - **Purpose:** Normalizes input strings by converting to string, trimming, converting to lowercase, normalizing to Unicode NFC, removing zero-width spaces (`\u200B`), non-breaking spaces (`\u00A0`), and collapsing multiple spaces into a single space.
  - **Parameters:** `input: any`
  - **Returns:** Cleaned normalized string.
- `levenshteinDistance(a: string, b: string): number`
  - **Purpose:** Calculates the minimum edit distance between two strings.
  - **Parameters:** `a: string`, `b: string`
  - **Returns:** Numeric edit distance.
- `stringSimilarity(a: string, b: string): number`
  - **Purpose:** Calculates the similarity ratio between two strings from `0.0` (completely different) to `1.0` (exact match).
  - **Parameters:** `a: string`, `b: string`
  - **Returns:** Percentage/ratio number `[0.0 - 1.0]`.
- `findBestStringMatch(target: string, candidates: string[]): { match: string; score: number } | null`
  - **Purpose:** Finds the best matching candidate string from an array of possible strings.
  - **Parameters:** `target: string`, `candidates: string[]`
  - **Returns:** Object with matched string and score.

---

### 2.2. `date.utils.ts`
Utility functions for converting Excel serial dates, Unix timestamps, and formatted date strings.

- `excelSerialToDate(serial: number): Date | null`
  - **Purpose:** Converts an Excel date serial number (days since 1900) to a standard JavaScript Date object.
  - **Parameters:** `serial: number`
  - **Returns:** `Date` or `null`.
- `formatDateToIso(val: any): string`
  - **Purpose:** Safely parses any date representation (Excel serial, Date object, or DD-MM-YYYY / YYYY-MM-DD string) into standard `YYYY-MM-DD` ISO string.
  - **Parameters:** `val: any`
  - **Returns:** ISO formatted string `YYYY-MM-DD` or empty string.
- `dateToUnixSeconds(val: any): number | null`
  - **Purpose:** Converts a date representation into a Unix timestamp in seconds.
  - **Parameters:** `val: any`
  - **Returns:** Numeric seconds or `null`.

---

### 2.3. `data-type.utils.ts`
Type coercion and safe parsing helpers.

- `coerceToType(value: any, targetType: string): any`
  - **Purpose:** Converts raw cell input to the schema-specified type (`'string'`, `'number'`, `'boolean'`, `'json'`, `'date'`, `'unix_date'`).
  - **Parameters:** `value: any`, `targetType: string`
  - **Returns:** Coerced value.
- `isTruthyBoolean(val: any): boolean`
  - **Purpose:** Determines if a value represents true (`1`, `'1'`, `true`, `'true'`, `'yes'`, `'हाँ'`).
  - **Parameters:** `val: any`
  - **Returns:** `boolean`.
- `safeParseJson(val: any, fallback?: any): any`
  - **Purpose:** Safely parses a JSON string or returns fallback without throwing an exception.
  - **Parameters:** `val: any`, `fallback?: any`
  - **Returns:** Parsed object or fallback.

---

### 2.4. `clipboard.utils.ts`
Clipboard parsing and matrix serialization for Excel copy/paste.

- `parseTsvToMatrix(tsvText: string): string[][]`
  - **Purpose:** Parses a tab-delimited string (from OS clipboard when copying from Excel) into a 2D array of strings.
  - **Parameters:** `tsvText: string`
  - **Returns:** 2D array `string[][]`.
- `matrixToTsv(matrix: any[][]): string`
  - **Purpose:** Converts a 2D array of cell values into a TSV string for copying into the system clipboard.
  - **Parameters:** `matrix: any[][]`
  - **Returns:** TSV string.

---

## 3. Models Layer (`src/lib/models/`)

### 3.1. `sutram-excel.model.ts`
Core data models representing tables, columns, rows, cells, and scanner results.

- `SutramHeaderConfig`: Definition of a column derived from schema (`col_name`, `name`, `alt_names`, `type`, `not_null`, `ref_table`, `ref_field`, `ref_data`, `ref_as`).
- `SutramTableConfig`: Registered table metadata (`table`, `display_name`, `headers`, `duplicateOn`, `fullDuplicateOn`, `canUpdate`, `autoSet`).
- `SutramCell`: State of an individual grid cell (`value`, `isValid`, `isWarning`, `errorMessage`, `isModified`, `refId`).
- `SutramRow`: State of a row in the grid (`rowNum`, `cells: Record<string, SutramCell>`, `hasError`, `errorCount`, `_rawOriginal`).
- `SutramScanMatch`: Header scanner mapping item (`sheetColIndex`, `sheetHeader`, `targetColKey`, `status`, `confidence`).
- `SutramScanReport`: Output of header scanning (`matches`, `missingMandatory`, `totalCols`, `sampleRows`).

### 3.2. `sutram-correction.model.ts`
Models for FK verification and dictionary memory.

- `SutramCorrectionItem`: Item returned by `POST /_sutram/excel/verify/:table` (`type`, `name`, `col_name`, `ref_field`, `rowIndexes`, `id`, `dictionary`, `done`).
- `CorrectionGroup`: Unique bad value grouped across multiple rows for batch resolution.
- `DictionaryEntry`: Persistent memory entry (`_id`, `type`, `name`, `ref_id`, `extra_note`, `active`).

---

## 4. Services Layer (`src/lib/services/`)

### 4.1. `sutram-excel-api.service.ts`
Handles all HTTP communication with the backend SutramExcel API.

- `getTables(): Observable<Array<{ table: string; display_name: string }>>`
- `getConfig(tableName: string): Observable<SutramTableConfig>`
- `verifyRows(tableName: string, rows: any[]): Observable<{ rows: any[]; correctionList: SutramCorrectionItem[] }>`
- `importRow(tableName: string, row: any): Observable<{ status: string; data?: any; error?: string }>`
- `updateRow(tableName: string, row: any): Observable<{ status: string; data?: any; error?: string }>`
- `downloadErrorReport(tableName: string, rows: any[]): Observable<Blob>`
- `getDictionary(type?: string): Observable<DictionaryEntry[]>`
- `addDictionaryEntry(entry: Partial<DictionaryEntry>): Observable<{ _id: number }>`
- `updateDictionaryEntry(id: number, entry: Partial<DictionaryEntry>): Observable<{ updated: boolean }>`
- `deleteDictionaryEntry(id: number): Observable<{ deleted: boolean }>`

### 4.2. `sutram-excel-state.service.ts`
Central reactive state manager powered by Angular 17+ Signals.

- **Signals:**
  - `activeTable`: Current selected table name.
  - `config`: Loaded table configuration.
  - `rows`: Grid rows array.
  - `selectedCell`: Coordinates of currently focused cell.
  - `corrections`: Active list of correction items.
  - `isAuditMode`: Boolean toggle for Intelligent Validation Mode.
  - `isVerifying`: Loading indicator for server-side verification.
  - `isImporting`: Loading indicator for streaming import.
  - `importProgress`: Numeric progress object `{ current, total, percentage, inserted, updated, duplicate, rejected }`.
- **Computed Signals:**
  - `stats`: `{ total, valid, warning, error }`.
  - `hasErrors`: Boolean indicating if any row has an error.
  - `unresolvedCorrectionsCount`: Count of unique corrections remaining.
- **Methods:**
  - `loadTableConfig(name)`
  - `setRows(rows)`
  - `updateCellValue(rowIdx, colKey, newValue)`
  - `applyBatchCorrection(colKey, badValue, newValue, saveToDict)`
  - `clearGrid()`

### 4.3. `sutram-excel-scanner.service.ts`
Fuzzy column matching and raw row transformation.

- `scan(sheetHeaders: string[], config: SutramTableConfig): SutramScanReport`
- `transformRows(rawRows: any[], matches: SutramScanMatch[]): any[]`

### 4.4. `sutram-audit.service.ts`
Fast client-side row and cell validation.

- `validateCell(cell: SutramCell, header: SutramHeaderConfig): void`
- `validateRow(row: SutramRow, headers: SutramHeaderConfig[]): void`
- `auditAll(rows: SutramRow[], headers: SutramHeaderConfig[]): void`

---

## 5. Components Layer (`src/lib/components/`)

1. `<sutram-excel-studio>`: Master container hosting the toolbar, audit metrics, grid, scanner modal, and sidebar.
2. `<sutram-grid>`: High-performance PrimeNG virtual table featuring in-cell editing, right-click context menu, and "Solve All Same Mistakes" overlay.
3. `<sutram-header-scanner>`: Modal allowing interactive column mapping with fuzzy match indicators.
4. `<sutram-correction-sidebar>`: Collapsible PrimeNG sidebar grouping unmatched entries into cards for one-click resolution.
5. `<sutram-import-progress>`: Streaming progress dialog displaying real-time counters and error report download.
6. `<sutram-dictionary-view>`: Dedicated CRUD view for browsing and editing `xls_dictionary` entries.
