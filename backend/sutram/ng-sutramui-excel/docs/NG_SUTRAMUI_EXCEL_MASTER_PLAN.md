# ng-sutramui-excel: Master Architectural Plan & Technical Blueprint

## 1. Executive Summary & Vision

`ng-sutramui-excel` is the dedicated, next-generation Angular frontend UI package for the **Sutram Eco-System**, designed specifically for high-performance Excel import, export, spreadsheet manipulation, schema-driven verification, and persistent correction memory.

It bridges the **Sutram backend engine (`sutramExcel`)** with **PrimeNG Aura/Lara themes**, providing a complete enterprise-grade spreadsheet experience in web applications.

### Key Tenets
1. **Zero-Manual-Config (Schema-Driven):** Dynamically receives column definitions, data types, mandatory constraints, and foreign key relations from `sutramExcel` (`GET /_sutram/excel/config/:table`).
2. **Dual Correction Paradigm:**
   - **In-Cell Live Correction:** Cell highlights bad values $\rightarrow$ clicking opens autocomplete suggestions $\rightarrow$ *"Solve all same mistakes across entire sheet"* prompt $\rightarrow$ *"Save to Dictionary"* option.
   - **Collapsible Batch Sidebar:** Optional `p-sidebar` panel grouping all unmatched entries into cards for power users.
3. **Pure PrimeNG Architecture:**
   - `p-table` with Virtual Scrolling (`[virtualScroll]="true"`) for buttery-smooth 50,000+ row rendering.
   - `pEditableColumn` + `p-cellEditor` for instant in-cell navigation and editing.
   - `p-contextMenu` for right-click Excel operations (cut, copy, paste, insert/delete row).
   - `p-autoComplete` / `p-dropdown` for intelligent FK matching.
   - `p-progressBar` for real-time row-by-row streaming import progress.
   - `p-dialog` for Header Scanner and Import Progress.
4. **Single-Responsibility & High Modularity:**
   - Every small task is encapsulated into dedicated utility functions and modular services.
   - Clean separation of API layer, Reactive State (Angular Signals), Grid Engine, Scanner Engine, and UI Components.
   - Complete documentation index stored in `ARCHITECTURE_AND_FUNCTIONS_INDEX.md`.

---

## 2. System Architecture & Layers

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ng-sutramui-excel UI Layer                      │
│                                                                        │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │  <sutram-excel-studio>  │  │        <sutram-grid>                 │ │
│  │  - Top Action Toolbar   │  │  - PrimeNG Virtual p-table           │ │
│  │  - Table Selector       │  │  - Inline Cell Editor (p-cellEditor) │ │
│  │  - Stats Badges & Pills │  │  - In-cell "Solve All" + Dictionary  │ │
│  │  - Mode Switch (Audit)  │  │  - Context Menu (Cut/Copy/Paste/Del) │ │
│  └─────────────────────────┘  └──────────────────────────────────────┘ │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │  <sutram-header-scanner>│  │     <sutram-correction-sidebar>      │ │
│  │  - p-dialog Column Map  │  │  - Collapsible p-sidebar panel       │ │
│  │  - Fuzzy Match Score    │  │  - Grouped Unknown Values Cards      │ │
│  │  - Missing Fields Alert │  │  - Batch Apply All + Dictionary      │ │
│  └─────────────────────────┘  └──────────────────────────────────────┘ │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ <sutram-import-progress>│  │     <sutram-dictionary-view>         │ │
│  │  - Streaming p-progress │  │  - xls_dictionary CRUD p-table       │ │
│  │  - Live Counters        │  │  - Search, Edit, Soft-delete         │ │
│  │  - Error Report Download│  │  - Type filtering                    │ │
│  └─────────────────────────┘  └──────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│                       Reactive State Layer (Signals)                   │
│  • SutramExcelStateService                                             │
│    - activeTable: WritableSignal<string | null>                        │
│    - config: WritableSignal<SutramTableConfig | null>                  │
│    - rows: WritableSignal<SutramRow[]>                                 │
│    - corrections: WritableSignal<SutramCorrectionItem[]>               │
│    - stats: Signal<{ total, valid, warning, error }>                   │
│    - selectedCell: WritableSignal<{ row, col } | null>                 │
│    - isVerifying / isImporting / progress: WritableSignal<...>         │
├────────────────────────────────────────────────────────────────────────┤
│                       Headless Core Services                           │
│  • SutramExcelApiService (Communicates with /_sutram/excel/*)          │
│  • SutramExcelScannerService (Fuzzy Levenshtein & Header Auto-Map)     │
│  • SutramAuditService (In-memory validation & Mistake Grouper)         │
│  • SutramClipboardService (Multi-cell TSV Copy/Paste Engine)           │
├────────────────────────────────────────────────────────────────────────┤
│                       Utility Functions Engine                         │
│  • normalization.utils.ts (Devanagari NFC Clean & Levenshtein)         │
│  • date.utils.ts (Excel serial, ISO, Unix timestamp conversion)        │
│  • data-type.utils.ts (Type coercions, booleans, json, numbers)       │
│  • clipboard.utils.ts (TSV matrix serialization/deserialization)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Specifications

### 3.1. `<sutram-excel-studio>` (Workspace Host)
- **Inputs:** `[table]="'product'"`, `[mode]="'intelligent'"`, `[apiBase]="'...'"`
- **Outputs:** `(onImportComplete)`, `(onError)`
- **Toolbar Features:**
  - Registered Tables Dropdown (`p-dropdown`) with icons and display names.
  - File Dropzone / Button (`p-fileUpload mode="basic"`) supporting `.xlsx`, `.xls`, `.csv`.
  - Normal vs. Intelligent Audit toggle (`p-selectButton`).
  - Validation Summary Badges (`p-tag` for Total Rows, Valid, Warning, Errors).
  - Quick Filter: "Show Only Errors" toggle.
  - Action Buttons: "Clear Sheet", "Download Template", "Load DB Data", "Verify Data", "Import to DB".
  - Toggle Button for Correction Sidebar with dynamic error count badge.

### 3.2. `<sutram-grid>` (PrimeNG Spreadsheet)
- **Virtual Scrolling:** `p-table` configured with `[virtualScroll]="true"`, `[virtualScrollItemSize]="38"`, and fixed height (`calc(100vh - 280px)`).
- **Frozen Left Column:** Row index `#`, error indicator dot, row selection checkbox.
- **In-Cell Editing:**
  - Clicking any cell turns it into an active `p-cellEditor`.
  - For standard fields: formatted text/number input.
  - For FK / Ref columns: `p-autoComplete` with Hindi/English/Code instant lookup.
- **Solve-All Prompt Overlay:**
  - When a user corrects a bad cell value (e.g. changing `"kulo"` to `"Kg"`), an inline overlay checks if other rows have `"kulo"`.
  - If found: *"⚡ 4 other rows have 'kulo'. Solve all?"* $\rightarrow$ Button `[Apply to All 4]`.
  - Checkbox: `[☑ Save to Dictionary]`.
- **Keyboard Engine:** Full Arrow Key, Tab, Shift+Tab, Enter navigation, Delete/Backspace to clear cells.
- **Context Menu (`p-contextMenu`):**
  - Right-click row $\rightarrow$ Duplicate Row, Insert Above, Insert Below, Delete Row, Clear All Errors.

### 3.3. `<sutram-header-scanner>` (Smart Header Matcher)
- Triggered automatically when an Excel file is uploaded.
- Compares sheet headers against derived schema columns using Levenshtein distance & Hindi NFC normalization.
- Displays a clean PrimeNG modal (`p-dialog`) with:
  - Header row selection (Row 1, 2, etc.).
  - Match table: *Sheet Column $\rightarrow$ Target Field $\rightarrow$ Match Status (Matched / Manual / Unmatched)*.
  - Missing mandatory column alerts (red warning banner).
  - First 3 sample rows preview.
  - Button: `[Confirm & Open in Grid]`.

### 3.4. `<sutram-correction-sidebar>` (Collapsible Batch Resolver)
- Powered by PrimeNG `p-sidebar` (position="right", width="420px").
- Groups all unmatched FK values from server verification (`POST /_sutram/excel/verify/:table`).
- For each unique bad value:
  - Header name & original unknown value (e.g. *Unit: "kulo" in Rows 4, 12, 19*).
  - Dropdown selector (`p-dropdown`) for picking the target DB entity.
  - Checkbox `[☑ Save to Dictionary]`.
  - Button `[Resolve All 3 Rows]`.
- As items are resolved, they disappear from the list and update the grid in real-time.

### 3.5. `<sutram-import-progress>` (Streaming Progress & Error Exporter)
- Modal dialog (`p-dialog`) blocking interaction during import.
- Real-time `p-progressBar` updating as each row is sent to `POST /_sutram/excel/import/:table`.
- Live Counters:
  - `Inserted`: Green pill
  - `Updated`: Blue pill (when `canUpdate: true`)
  - `Duplicate`: Amber pill
  - `Rejected`: Red pill
- If `rejected > 0`:
  - Activates `[Download Error Report (.xlsx)]` button.
  - Calls `POST /_sutram/excel/error-report` to generate and download Excel file with red header and error column.

### 3.6. `<sutram-dictionary-view>` (Dictionary Manager)
- Independent management view for the `xls_dictionary` table.
- PrimeNG `p-table` with search, filter by `type` (e.g. `unit`, `category`, `mm`), inline edit, and soft-delete (`DELETE /_sutram/excel/dictionary/:id`).

---

## 4. API Endpoints Contract (Sutram Backend Integration)

| Endpoint | Method | Payload | Purpose |
| :--- | :--- | :--- | :--- |
| `/_sutram/excel/tables` | GET | - | List of registered tables (`display_name`, `table`) |
| `/_sutram/excel/config/:table` | GET | - | Full schema-derived header config, types, and alt names |
| `/_sutram/excel/verify/:table` | POST | `{ rows: [...] }` | Server-side FK resolution & `correctionList` generation |
| `/_sutram/excel/import/:table` | POST | `{ row: {...} }` | Single-row trigger-aware insertion |
| `/_sutram/excel/update/:table` | POST | `{ row: {...} }` | Single-row update on duplicate match |
| `/_sutram/excel/error-report` | POST | `{ table, rows }` | ExcelJS styled `.xlsx` buffer download of rejected rows |
| `/_sutram/excel/dictionary` | GET / POST | `{ type, name, ref_id }`| View and add persistent dictionary aliases |
| `/_sutram/excel/dictionary/:id`| PUT / DELETE | `{ ref_id }` | Update or soft-delete dictionary memory entries |

---

## 5. Development Directory Structure

The complete source code of `ng-sutramui-excel` will be housed in:
`/Volumes/data/MD/MD Softwares/HisabKitab-2022 /HisabKitab/backend/sutram/ng-sutramui-excel/`

```
ng-sutramui-excel/
├── package.json
├── README.md
├── public-api.ts
├── src/
│   ├── index.ts
│   ├── lib/
│   │   ├── components/
│   │   │   ├── sutram-excel-studio/
│   │   │   │   ├── sutram-excel-studio.component.ts
│   │   │   │   ├── sutram-excel-studio.component.html
│   │   │   │   └── sutram-excel-studio.component.scss
│   │   │   ├── sutram-grid/
│   │   │   │   ├── sutram-grid.component.ts
│   │   │   │   ├── sutram-grid.component.html
│   │   │   │   └── sutram-grid.component.scss
│   │   │   ├── sutram-header-scanner/
│   │   │   │   ├── sutram-header-scanner.component.ts
│   │   │   │   ├── sutram-header-scanner.component.html
│   │   │   │   └── sutram-header-scanner.component.scss
│   │   │   ├── sutram-correction-sidebar/
│   │   │   │   ├── sutram-correction-sidebar.component.ts
│   │   │   │   ├── sutram-correction-sidebar.component.html
│   │   │   │   └── sutram-correction-sidebar.component.scss
│   │   │   ├── sutram-import-progress/
│   │   │   │   ├── sutram-import-progress.component.ts
│   │   │   │   ├── sutram-import-progress.component.html
│   │   │   │   └── sutram-import-progress.component.scss
│   │   │   └── sutram-dictionary-view/
│   │   │       ├── sutram-dictionary-view.component.ts
│   │   │       ├── sutram-dictionary-view.component.html
│   │   │       └── sutram-dictionary-view.component.scss
│   │   ├── services/
│   │   │   ├── sutram-excel-api.service.ts
│   │   │   ├── sutram-excel-state.service.ts
│   │   │   ├── sutram-excel-scanner.service.ts
│   │   │   ├── sutram-audit.service.ts
│   │   │   └── sutram-clipboard.service.ts
│   │   ├── models/
│   │   │   ├── sutram-excel.model.ts
│   │   │   └── sutram-correction.model.ts
│   │   ├── utils/
│   │   │   ├── normalization.utils.ts
│   │   │   ├── date.utils.ts
│   │   │   ├── data-type.utils.ts
│   │   │   └── clipboard.utils.ts
│   │   ├── styles/
│   │   │   ├── excel-grid.scss
│   │   │   └── themes.scss
│   │   └── sutram-excel.module.ts
```
