# ng-sutramui-excel: Complete Testing & Setup Guide

This guide provides step-by-step instructions to set up, mount, and test **`ng-sutramui-excel`** with the **Sutram Backend (`sutramExcel`)** and **PrimeNG**.

---

## 📋 Table of Contents
1. [Prerequisites & System Requirements](#1-prerequisites--system-requirements)
2. [Step 1: Backend Setup (Mounting sutramExcel)](#2-step-1-backend-setup-mounting-sutramexcel)
3. [Step 2: Frontend Setup (PrimeNG & Module Integration)](#3-step-2-frontend-setup-primeng--module-integration)
4. [Step 3: Test Host Component Setup](#4-step-3-test-host-component-setup)
5. [Step 4: End-to-End Testing Scenarios & Checklist](#5-step-4-end-to-end-testing-scenarios--checklist)
6. [Troubleshooting & FAQs](#6-troubleshooting--faqs)

---

## 1. Prerequisites & System Requirements

### Backend Requirements:
- **Node.js:** v18.0.0 or higher
- **Express.js:** v4.18.0 or higher
- **Sutram Packages:** `sutramcore`, `sutramengine`, `sutramexcel`
- **Peer Dependencies:** `exceljs` (for error reports), `better-sqlite3`

### Frontend Requirements:
- **Angular:** v16.0.0 or higher
- **PrimeNG:** v16.0.0 or higher (with PrimeIcons)
- **SheetJS (xlsx):** v0.18.5 or higher

---

## 2. Step 1: Backend Setup (Mounting `sutramExcel`)

The backend needs `sutramExcel` initialized with `sutramEngine` and registered with tables allowed for Excel import.

### 2.1. Create or Update `database/excel.js`

```javascript
// backend/api/database/excel.js
const { SutramExcel } = require('../sutram/sutramExcel'); // or 'sutramexcel'
const { sutramEngine } = require('./db.model');

// 1. Instantiate SutramExcel with sutramEngine
const excel = new SutramExcel(sutramEngine);

// 2. Register allowed tables (Schema auto-derives headers, types, and FK rules)
// Table 1: Category (Zero config needed - 100% auto from schema)
excel.register(sutramEngine.table('category'));

// Table 2: Product (With alt_names and duplicate detection)
excel.register(sutramEngine.table('product'), {
  headers: {
    purchase_date: { type: 'date', alt_names: ['date', 'तारीख'] },
    category_id:   { alt_names: ['cat', 'श्रेणी', 'category name'] },
    unit_id:       { alt_names: ['unit', 'यूनिट', 'इकाई'] }
  },
  duplicateOn: ['name', 'category_id'],
  canUpdate: true
});

// Table 3: PBK (Sewadhari Directory)
excel.register(sutramEngine.table('pbk'), {
  headers: {
    roll_no:   { alt_names: ['roll no', 'रोल नं'] },
    pbk_hin:   { alt_names: ['name', 'नाम'] },
    gender:    { alt_names: ['लिंग', 'gender'] },
    state_id:  { alt_names: ['state', 'राज्य'] }
  },
  duplicateOn: ['roll_no'],
  canUpdate: true
});

module.exports = { excel };
```

### 2.2. Mount Router in `app.js`

In your Express `app.js` file, mount the Excel router:

```javascript
// backend/app.js
const { excel } = require('./api/database/excel');

// Mount under /_sutram/excel (or /api/_sutram/excel)
app.use('/_sutram/excel', excel.router());
```

### 2.3. Verify Backend Endpoints

Restart backend (`nodemon` or `npm start`) and test via terminal:

```bash
# 1. Test registered tables endpoint
curl http://localhost:3000/_sutram/excel/tables
# Expected Output: {"success":true,"result":[{"table":"category","display_name":"category"},{"table":"product","display_name":"product"},{"table":"pbk","display_name":"pbk"}]}

# 2. Test derived config endpoint
curl http://localhost:3000/_sutram/excel/config/product
# Expected Output: JSON containing derived headers, ref_tables, types, and constraints.
```

---

## 3. Step 2: Frontend Setup (PrimeNG & Module Integration)

### 3.1. Install PrimeNG & PrimeIcons

Run inside your Angular frontend project directory:

```bash
npm install primeng primeicons
```

### 3.2. Add PrimeNG Styles in `angular.json` or `styles.scss`

Add the PrimeNG theme and PrimeIcons in `src/styles.scss`:

```scss
/* src/styles.scss */
@import "primeng/resources/themes/lara-light-blue/theme.css"; /* or aura-light-blue */
@import "primeng/resources/primeng.min.css";
@import "primeicons/primeicons.css";
```

### 3.3. Import `SutramExcelModule`

In your module (e.g. `app.module.ts` or a test routing module):

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SutramExcelModule } from './sutram/ng-sutramui-excel'; // path to package

@NgModule({
  imports: [
    CommonModule,
    SutramExcelModule
  ]
})
export class TestModule {}
```

---

## 4. Step 3: Test Host Component Setup

Create a simple test page component to test the full Excel Studio:

### 4.1. `test-excel.component.html`

```html
<div class="p-3" style="height: 100vh; background-color: #f8fafc;">
  <div class="card p-2 shadow-sm" style="height: calc(100vh - 30px);">
    <sutram-excel-studio
      [apiBase]="'http://localhost:3000/_sutram/excel'">
    </sutram-excel-studio>
  </div>
</div>
```

---

## 5. Step 4: End-to-End Testing Scenarios & Checklist

Use this checklist to verify all features:

### ✅ Test 1: Dynamic Table & Schema Selection
- Open the test page.
- Check the top-left dropdown: verify that registered tables (`category`, `product`, `pbk`) appear.
- Select `product`: verify the column headers change dynamically according to the schema.

### ✅ Test 2: Excel File Upload & Smart Header Scanner
- Prepare a small sample Excel file (`sample_product.xlsx`) with columns like:
  `नाम | श्रेणी | यूनिट | तारीख`
- Click **"Excel अपलोड"** and select the file.
- **Verification:**
  1. The **Smart Header Scanner Dialog (`p-dialog`)** opens automatically.
  2. Columns are matched with green checkmarks based on Levenshtein similarity and `alt_names`.
  3. Any missing mandatory columns are flagged with a red alert banner.
- Click **"पुष्टि करें और ग्रिड में खोलें"**. Data should render instantly in the grid.

### ✅ Test 3: Virtual Table & In-Cell Editing
- Scroll through 1,000+ rows: verify 60fps smooth scrolling with `[virtualScroll]="true"`.
- Click any cell: verify in-cell edit mode activates.
- Press `Enter`: cell commits and validates.
- Right-click any row: verify the **Context Menu** opens with *Copy, Insert Above, Insert Below, Delete Row*.

### ✅ Test 4: In-Cell "Solve All Same Mistake" & Dictionary Memory
- In a cell under a reference column (e.g. `unit`), intentionally enter a typo (e.g. `"kulo"`).
- Enter `"kulo"` in 3 different rows.
- Click **"डेटा सत्यापित करें (Verify)"**:
  - The cell turns red with an error tooltip.
- Click on the red cell:
  - An inline suggestion popup opens.
  - Pick `"Kg"`.
  - **Verification:** An inline prompt banner flashes:
    > *"⚡ 2 अन्य सेल्स में भी 'kulo' है — क्या सभी को सुधारें?"*
  - Tick the checkbox: `[☑ डिक्शनरी में सेव करें]`.
  - Click `[सभी बदलें (Solve All)]`.
  - **Result:** All 3 rows immediately update to `"Kg"`, and `POST /_sutram/excel/dictionary` is called in the background.

### ✅ Test 5: Batch Correction Sidebar
- Click the top toolbar button: `[गलतियाँ (N)]`.
- **Verification:**
  1. The PrimeNG right sidebar (`p-sidebar`) slides out smoothly.
  2. All unique unknown values are grouped into cards (e.g. *Unit: "kulo" found in 3 rows*).
  3. Type the replacement value and click `[सभी पंक्तियाँ बदलें]`.
  4. The card resolves and disappears, updating the grid cells in real-time.

### ✅ Test 6: Streaming Import & Live Counters
- Click **"डेटाबेस में इम्पोर्ट करें"**.
- **Verification:**
  1. The progress modal opens blocking UI interactions.
  2. The `p-progressBar` animates smoothly as rows are processed.
  3. Live counters (`Inserted`, `Updated`, `Duplicate`, `Rejected`) increment in real time.

### ✅ Test 7: Error Report Download (.xlsx)
- Intentionally submit a row with invalid data that causes server-side rejection.
- At the end of import, the modal shows: `[1 पंक्तियाँ रिजेक्ट हुईं]`.
- Click `[Error Report (.xlsx)]`.
- **Verification:** An Excel file (`rejected_product_*.xlsx`) downloads with:
  - Bright red header row.
  - A dedicated `❌ Error` column explaining why the row was rejected.

### ✅ Test 8: Dictionary Memory Manager
- Navigate to the `<sutram-dictionary-view>` component.
- Verify that previously saved entries (e.g. `"kulo"` $\rightarrow$ `"Kg"`) appear in the table.
- Test searching by text and deleting an entry.

---

## 6. Troubleshooting & FAQs

### Q: Why does `/tables` or `/config/:table` return 403 Forbidden?
**A:** `sutramExcel` enforces strict whitelisting. Only tables explicitly registered via `excel.register(engine.table('...'))` can be accessed. Unregistered tables return 403 for security.

### Q: PrimeNG styles look unstyled or missing borders.
**A:** Ensure PrimeNG theme (`lara-light-blue` or `aura-light-blue`) and `primeicons.css` are imported in your global `styles.scss`.

### Q: Can I run this with an existing database without modifying schema?
**A:** Yes! `sutramExcel` reads your existing SQLite or MySQL schema automatically using `sutramcore` metadata without altering tables.
