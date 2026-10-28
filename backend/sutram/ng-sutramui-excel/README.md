# ng-sutramui-excel

> **Enterprise PrimeNG-Powered Excel Studio UI for the Sutram Eco-System**  
> High-performance spreadsheet grid, schema-driven derived headers, Devanagari/Hindi Unicode normalization, live in-cell and sidebar corrections, and persistent correction memory.

---

## 🌟 Key Features

- **Schema-Driven Zero Config:** Reads derived headers, types, and FK rules dynamically from `sutramExcel` backend.
- **PrimeNG Virtual Table (`p-table`):** 50,000+ rows rendered at 60 FPS with virtual scrolling, column resizing, and column reordering.
- **Dual Correction Workflow:**
  - **In-Cell Live Correction:** Bad cells highlight in red. Selecting a dropdown suggestion reveals the instant *"⚡ Solve all same mistakes across sheet"* prompt + *"Save to Dictionary"* option.
  - **Batch Correction Sidebar:** Collapsible PrimeNG `p-sidebar` grouping unique unknown values into cards.
- **Smart Header Scanner:** Auto-maps arbitrary Excel sheet headers using Levenshtein distance and Hindi Unicode NFC normalization.
- **Streaming Trigger-Aware Importer:** Real-time row-by-row progress bar with live *Inserted*, *Updated*, *Duplicate*, and *Rejected* counters.
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
<!-- Full Excel Studio Workspace -->
<sutram-excel-studio [table]="'product'" [apiBase]="'http://localhost:3000/api/_sutram/excel'">
</sutram-excel-studio>
```

---

## 📖 Architecture & Documentation

Full architectural blueprint and function-by-function index are located in the repository's `planning/` directory:
- [Master Architectural Plan](file:///Volumes/data/MD/MD%20Softwares/HisabKitab-2022%20/planning/NG_SUTRAMUI_EXCEL_MASTER_PLAN.md)
- [Architecture & Functions Documentation Index](file:///Volumes/data/MD/MD%20Softwares/HisabKitab-2022%20/planning/ARCHITECTURE_AND_FUNCTIONS_INDEX.md)
