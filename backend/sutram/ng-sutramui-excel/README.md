# ng-sutramui-excel

> **Enterprise PrimeNG-Powered Excel Studio UI for the Sutram Eco-System**  
> High-performance spreadsheet grid, schema-driven derived headers, Devanagari/Hindi Unicode normalization, live in-cell and sidebar corrections, and persistent correction memory.

---

## 🌟 Key Features

- **Schema-Driven Zero Config:** Reads derived headers, types, and FK rules dynamically from `sutramExcel` backend.
- **Auto Data Loading & Chunked Lazy Loading:** Automatically loads table records upon sheet tab click in 100-row chunks with seamless infinite scrolling.
- **Direct Database Searchbox:** Real-time debounced search executing queries directly against the SQLite database backend.
- **Control Bar Feature Toggles:** Dedicated control panel to toggle column filters, toggle column sorting, clear all active filters, and display live DB record counters.
- **Excel-Style Column Header Filters:**
  - **Normal Columns:** Interactive popover checklist with distinct values, value occurrences count, search, select all/clear all, and quick A→Z / 1→9 sorting.
  - **Foreign Key Columns:** Multi-select checklist formatted with AGENTS.md Rule 8 bilingual representation (`{{ hin }} : {{ eng }}` or `{{ hin }} : {{ eng }} : {{ code }}`).
- **PrimeNG Virtual Table (`p-table`):** High performance rendering with virtual scrolling, column resizing, and column reordering.
- **Dual Correction Workflow:**
  - **In-Cell Live Correction:** Bad cells highlight in red. Selecting a dropdown suggestion reveals the instant *"⚡ Solve all same mistakes across sheet"* prompt + *"Save to Dictionary"* option.
  - **Batch Correction Sidebar:** Collapsible PrimeNG `p-sidebar` grouping unique unknown values into cards.
- **Smart Header Scanner:** Auto-maps arbitrary Excel sheet headers using Levenshtein distance and Hindi Unicode NFC normalization.
- **Streaming Trigger-Aware Importer:** Real-time row-by-row progress bar with live *Inserted*, *Updated*, *Duplicate*, *Deleted*, and *Rejected* counters.
- **Smart Row Deletion & Safe DB Sync:** Tracks deleted rows in a rollback queue and synchronizes deletions to the database. If database sync fails, deleted rows automatically restore to the sheet without data loss, while successfully synced rows stay highlighted and saved.
- **One-Click Error Report:** Direct download of ExcelJS-styled `.xlsx` containing only failed rows with error descriptions.
- **Persistent Dictionary Memory:** Manage and edit cached correction aliases (`xls_dictionary`).

---

## 📦 Installation

```bash
npm install ng-sutramui-excel primeng primeicons
```

---

## 🚀 Quick Start

### 1. Register in Angular Module

```typescript
import { NgModule } from '@angular/core';
import { SutramExcelModule } from 'ng-sutramui-excel';

@NgModule({
  imports: [
    SutramExcelModule
  ]
})
export class AppModule {}
```

### 2. Add to HTML Template

```html
<!-- 1. Zero Config (Everything ON by default) -->
<sutram-excel-studio [table]="'item'" [apiBase]="'/_sutram/excel'">
</sutram-excel-studio>

<!-- 2. Declarative Feature Flags (Toggle any feature ON or OFF with simple flags) -->
<sutram-excel-studio 
  [table]="'item'"
  [apiBase]="'/_sutram/excel'"
  [enableFilters]="true"
  [enableSorting]="true"
  [enableSearch]="true"
  [enableControlBar]="true"
  [enableStatsBar]="true"
  [enableUpload]="true"
  [enableAddRow]="true"
  [enableDelete]="true"
  [enableCorrections]="true"
  [enableLoadData]="true"
  [enableVerify]="true"
  [enableSync]="true"
  [enableTabs]="true"
  [enableZoom]="true">
</sutram-excel-studio>
```

---

## 📖 Architecture & Documentation

Full architectural blueprint and function-by-function index are located in the repository's `planning/` directory:
- [Master Architectural Plan](file:///Volumes/data/MD/MD%20Softwares/HisabKitab-2022%20/planning/NG_SUTRAMUI_EXCEL_MASTER_PLAN.md)
- [Architecture & Functions Documentation Index](file:///Volumes/data/MD/MD%20Softwares/HisabKitab-2022%20/planning/ARCHITECTURE_AND_FUNCTIONS_INDEX.md)
