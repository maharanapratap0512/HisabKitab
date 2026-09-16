# Workspace Project Guidelines & Coding Rules

## 1. Dynamic Theme Native Inheritance
- **NEVER** apply manual or hardcoded dark/light background overrides (`bg-white`, `bg-dark`, `text-white`, etc.) unless explicitly instructed by the user.
- All table headers (`th`), table rows (`tr`), table cells (`td`), and cards MUST cleanly inherit the user's active selected theme (light or dark mode).

## 2. Concise Code Preference
- Always write concise, minimal HTML and CSS code without adding redundant or unnecessary utility classes.
- For modal dialogs, use:
  ```html
  <div class="modal-dialog" style="width: 98%;">
  ```
  Do NOT add unnecessary extra classes such as `modal-xl`, `modal-dialog-centered`, or `max-width: 98%;`.

## 3. Prebuilt Icon Classes for Action Buttons
- For table action buttons (e.g. Edit, Delete), always use prebuilt global icon classes from `styles.scss`:
  - Edit: `<i class="uil uil-pen i-outline-primary cursor-pointer me-1" (click)="edit(item)"></i>`
  - Delete: `<i class="uil uil-trash i-outline-danger cursor-pointer" (click)="delete(item)"></i>`
- Do NOT create separate custom CSS rules (e.g. `.btn-action-icon`) when prebuilt classes exist.

## 4. Mandatory API Error & Response Handling (No Silent Failures)
- **NEVER** leave API calls, HTTP subscriptions, streams, or promises without explicit error handling.
- Always handle both HTTP network/catch errors (`err => ...`) AND non-success response objects (`if (!res.success)` / `if (!res.status)`).
- **ALWAYS** display a clear `toastr.error(...)` notification informing the user whenever an operation or API request fails or returns an error status, ensuring the application never fails silently.

## 5. Universal Smooth Scroll Helper (`GlobalService`)
- Use `this.gs.smoothScrollTo(target, offset?, duration?)` from `GlobalService` (`gs`) whenever smooth scrolling is needed across any component.
- Accepts an `ElementRef`, `HTMLElement`, CSS selector string (e.g. `'#resultsSection'`), or numeric Y pixel position.

## 6. Standard Excel Export Rule
- For general Excel exports, ALWAYS use `this.excelExportService.exportStyledExcel(data, fileName, titleText)` from `ExcelExportService`.
- Do NOT create new custom Excel export implementations or plain unstyled `exportAsExcelFile` calls for standard reports.
- Custom Excel builders using `ExcelJS.Workbook()` directly are reserved only for complex multi-block or custom layout sheets (e.g. HMP Batches, Item Ledger 4-box summary view).

## 7. User-Friendly Application Updates Rule (`updates.json`)
- ALL `updates.json` release notes and changelog entries MUST be written in **simple, user-friendly language** focusing on user benefits, convenience, and UI improvements.
- **NEVER** use developer jargon, deep technical terms, function names, or backend code references (e.g. avoid `Object.assign`, `SQLite SQL query`, `HTTP streaming`, `subitem_id = null`, `API endpoints`).
- Keep all update bullet points concise, highly readable, clear, and non-technical.

## 8. Array Splice — Always Use `findIndex` by `_id`
- When replacing an item in an array using `splice()`, **ALWAYS** use `findIndex(item => item._id == targetId)` for reliable index lookup.
- **NEVER** use `Array.indexOf(object)` for splice operations — reference equality can silently return `-1` and splice the wrong element.
- Example pattern:
  ```typescript
  const idx = this.dataArray.findIndex((a: any) => a._id == this.editData._id);
  if (idx > -1) this.dataArray.splice(idx, 1, updatedItem);
  ```

## 9. `aawak_ref_id` is DEPRECATED — Never Use It
- The `aawak_ref_id` field on the `jawak` table is **fully deprecated**. All existing values have been set to `NULL` in the database.
- **NEVER** write any backend query, condition, update, or logic that references `jawak.aawak_ref_id` or `aawak_ref_id` in any context.
- Do NOT add `OR jawak.aawak_ref_id = ...` to any WHERE clause.
- Do NOT write any UPDATE/SELECT that filters or joins on `aawak_ref_id`.
- This rule applies across ALL routes, services, and queries — backend and frontend.

## 10. Table Header Filters Rule (`app-popover-filter` & Year Badges)
- For **Year filter** in table column headers (`th`), use standard `uil uil-filter` icon trigger outside before click, and inside the popover panel render year badge pills (`All`, year list):
  ```html
  <app-popover-filter #yearPopover [btnOutline]="false" iconClass="uil uil-filter" direction="right"
     [isOpen]="!!selectedYear" (clear)="selectedYear = null" triggerOn="click">
     <div class="d-flex flex-wrap p-2 gap-2" style="width: 250px;">
        <span class="badge year-box cursor-pointer" style="font-size: 13px;"
           [ngClass]="selectedYear === null ? 'bg-primary' : 'badge-outline-secondary'"
           (click)="selectedYear = null; yearPopover.closePopover()">All</span>
        <span *ngFor="let y of yearList" class="badge year-box cursor-pointer" style="font-size: 13px;"
           [ngClass]="selectedYear == y ? 'bg-primary' : 'badge-outline-secondary'"
           (click)="selectedYear = y; yearPopover.closePopover()">{{y}}</span>
     </div>
  </app-popover-filter>
  ```
- For **Item & Subitem filter** in table headers, ALWAYS place `<app-item-dropdown [(ngModel)]="selectedItemmix" [multiple]="true" [closeOnSelect]="false" appendTo="body"></app-item-dropdown>` inside `<app-popover-filter>`:
  ```html
  <app-popover-filter [btnOutline]="false" iconClass="uil uil-filter" direction="right"
     [isOpen]="selectedItemmix && selectedItemmix.length > 0"
     (clear)="selectedItemmix = []"
     triggerOn="click">
     <div style="width: 280px;" class="p-1">
        <label class="form-label mb-1"><small class="fw-bold">Item & Subitem</small></label>
        <app-item-dropdown [(ngModel)]="selectedItemmix" [multiple]="true"
           [closeOnSelect]="false" appendTo="body"></app-item-dropdown>
     </div>
  </app-popover-filter>
  ```
- In TypeScript, parse `selectedItemmix` entries by splitting `"item_id:subitem_id"` strings (`parts[0]` = `item_id`, `parts[1]` = `subitem_id`) to perform accurate item/subitem filtering.
