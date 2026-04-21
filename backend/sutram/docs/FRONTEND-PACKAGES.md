# Frontend Packages Documentation

## Overview

All frontend packages work together to provide the complete UI layer for Sutram Eco-System.

## Package List

| Package | Purpose | Status |
|---------|---------|--------|
| ng-sutramui | Angular component library | Complete |
| sutramUI | Main application | Testing |
| sutramAdmin | Admin variant | Testing |

---

## 1. ng-sutramui

### Purpose
Schema-driven Angular UI components library for building CRUD interfaces without writing templates.

### Three Independent Layers

Layer 1: Core (Headless)
- ng-sutramui/core
- Zero UI dependencies
- Services only: SutramSchemaService, SutramTableService, SutramFormService, SutramDropdownService, SutramBunchService
- Signals for reactive state
- Use with any UI library

Layer 2: PrimeNG
- ng-sutramui/primeng
- Pre-built components
- p-table, p-inputText, p-dropdown, p-calendar, etc
- Professional UI
- Best for enterprise apps

Layer 3: Bootstrap
- ng-sutramui/bootstrap
- Pre-built components
- Bootstrap 5 + ng-select
- Lightweight
- Best for simple apps

### 5 Core Services

SutramSchemaService
- Fetch and cache schemas from API
- CRUD operations (insert, getById, getAll, updateById, deleteById)
- Menu data retrieval

SutramFormService
- Build Angular FormGroup from schema
- Form validation
- Submit POST/PUT requests

SutramTableService (Signals)
- Manage table state with signals
- Track: rows, total, page, pageSize, loading
- Pagination, filter, sort
- Inline update capability

SutramDropdownService
- In-memory dropdown data cache
- Local search (no API calls per keystroke)
- Dependent filters by parent FK
- Auto-refresh on demand

SutramBunchService
- Master-detail form logic
- Auto-push new rows when required fields filled
- Calculate fields (qty * rate)
- Bulk submission validation

### 5 Components

sutram-menu
- Auto-builds sidebar or topbar
- Fetches from GET /_sutram/menu
- Theme toggle (dark/light)
- Collapse toggle for sidebar
- Inputs: mode, collapsible, showReports, showThemeToggle, compact
- Outputs: none

sutram-form
- Auto-generates reactive form from schema
- POST for new, PUT for existing
- Developer controls placement (wrap in modal yourself)
- Inputs: table, schema, record, submitLabel, readonly, showCancel
- Outputs: (onSubmit), (onCancel)

sutram-table
- Schema-driven data table
- Pagination, global filter, inline edit
- Excel/PDF export built-in
- Colored column headers
- Inline edit for small tables
- Actions buttons for large tables (view, edit, delete)
- Inputs: table, rows, inlineEdit, actions, exportExcel, exportPdf, hideColumns
- Outputs: (onEdit), (onDelete), (onSave)

sutram-bunch-form
- Master-detail entry form
- 2 modes: Master+Detail OR Detail-Only
- Auto-push new row when required fields filled
- Submit payload: { master, details }
- Inputs: schema, submitLabel, showCancel
- Outputs: (onSubmit)

sutram-bunch-table
- Master-detail grouped display
- Each master row expandable
- Shows associated detail rows
- Export includes all groups
- Inputs: schema, masterData, detailData, detailForeignKey, actions
- Outputs: (onEdit), (onDelete)

### Supported Field Types

text, number, boolean, textarea, date, datetime, dropdown, multiselect, file, color

### Setup - PrimeNG

npm install ng-sutramui primeng @primeng/themes primeicons

provideSutramUI({ apiBase: 'http://localhost:3000/api', theme: 'primeng' })

@import 'ng-sutramui/styles/primeng';

### Setup - Bootstrap

npm install ng-sutramui bootstrap @ng-select/ng-select

provideSutramUI({ apiBase: 'http://localhost:3000/api', theme: 'bootstrap' })

@import 'ng-sutramui/styles/bootstrap';

### Features

- Schema-driven (zero templates for CRUD)
- Signals for reactive state
- Dark mode support
- Compact mode responsive sizing
- Custom services for advanced usage
- Excel & PDF export
- Master-detail support
- Dependent dropdowns

### API Expected

GET /_sutram/menu → { tables, reports }
GET /_sutram/schema/:table → schema with UI config
GET /:table?_limit=&_page= → paginated data
GET /:table/:id → single row
POST /:table → create row
PUT /:table/:id → update row
DELETE /:table/:id → delete row

---

## 2. SutramUI

### Purpose
Main application using ng-sutramui components for end-user CRUD operations.

### Location
apps/frontend/

### Features
- Dashboard
- Data entry workflows
- Reports
- User management
- Settings
- Search & filter
- Bulk operations

### Technology
- Angular 17+
- ng-sutramui/primeng OR ng-sutramui/bootstrap
- Depends on SutramEngine API

### Status
Testing phase - integrating with SutramEngine

---

## 3. SutramAdmin

### Purpose
Admin variant of SutramUI for system administration and configuration.

### Location
apps/frontend/

### Features
- User management
- System configuration
- Schema management (managed mode)
- Report configuration
- Audit logs
- Backup/restore
- Import/export settings

### Technology
- Angular 17+
- ng-sutramui/primeng OR ng-sutramui/bootstrap
- Depends on SutramEngine API

### Status
Testing phase - integrating with SutramEngine

---

## Installation Order

1. Install sutramcore + sutramengine (backend)
npm install sutramcore sutramengine better-sqlite3

2. Choose UI layer
npm install ng-sutramui primeng
OR
npm install ng-sutramui bootstrap @ng-select/ng-select

3. Setup app.config.ts with provideSutramUI

4. Import styles in global styles.css

5. Use components in templates

---

## Theme Switching

Change one line in app.config.ts:

theme: 'primeng' → theme: 'bootstrap'

All components adapt automatically:
- Same props
- Same services
- Different UI library underneath

No code changes needed!

---

## Custom UI Building

Use core services directly with custom templates:

import { SutramTableService } from 'ng-sutramui/core';

export class CustomTable {
  private table = inject(SutramTableService);
  rows$ = this.table.rows$;
  total$ = this.table.total$;

  async load() {
    this.table.init('product', { pageSize: 50 });
    await this.table.load();
  }
}

Build with your own HTML + ng-sutramui services

---

## Full API Reference

See ng-sutramui-docs.html for detailed examples and all method signatures.

---

## License

MIT