/**
 * sutram-excel-studio.component.ts
 * ─────────────────────────────────────────────────────────────
 * Master Studio Component hosting the toolbar, audit metrics,
 * virtual grid, header scanner, correction sidebar, and streaming importer.
 * ─────────────────────────────────────────────────────────────
 */
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import * as i0 from "@angular/core";
import * as i1 from "../../services/sutram-excel-state.service";
import * as i2 from "../../services/sutram-excel-api.service";
import * as i3 from "../../services/sutram-excel-scanner.service";
import * as i4 from "../../services/sutram-audit.service";
import * as i5 from "../../services/sutram-ref-cache.service";
import * as i6 from "@angular/common";
import * as i7 from "@angular/forms";
import * as i8 from "primeng/api";
import * as i9 from "primeng/overlaypanel";
import * as i10 from "../sutram-grid/sutram-grid.component";
import * as i11 from "../sutram-header-scanner/sutram-header-scanner.component";
import * as i12 from "../sutram-correction-sidebar/sutram-correction-sidebar.component";
import * as i13 from "../sutram-import-progress/sutram-import-progress.component";
function SutramExcelStudioComponent_span_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 87);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(ctx_r1.state.pendingChangesCount());
} }
function SutramExcelStudioComponent_ng_template_63_div_3_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 91)(1, "input", 92);
    i0.ɵɵlistener("change", function SutramExcelStudioComponent_ng_template_63_div_3_Template_input_change_1_listener() { const restoredCtx = i0.ɵɵrestoreView(_r16); const h_r14 = restoredCtx.$implicit; const ctx_r15 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r15.toggleColumnVisibility(h_r14.name)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "label", 93);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const h_r14 = ctx.$implicit;
    const ctx_r13 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("id", "col_vis_" + h_r14.name)("checked", !ctx_r13.hiddenColumnKeys.has(h_r14.name));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("for", "col_vis_" + h_r14.name);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(h_r14.name);
} }
function SutramExcelStudioComponent_ng_template_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 88)(1, "div", 89);
    i0.ɵɵtext(2, "Visible Columns");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_ng_template_63_div_3_Template, 4, 4, "div", 90);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.state.headers());
} }
function SutramExcelStudioComponent_button_76_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 94);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_button_76_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r18); const ctx_r17 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r17.clearAllFilters()); });
    i0.ɵɵelement(1, "i", 95);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("Clear Filters (", ctx_r4.state.activeFilterCount(), ")");
} }
function SutramExcelStudioComponent_button_80_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 96);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_button_80_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r20); const ctx_r19 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r19.clearDbSearch()); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_span_81_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 97);
    i0.ɵɵelement(1, "i", 98);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_92_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div")(1, "button", 99);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_92_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r22); const ctx_r21 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r21.showSidebar = true); });
    i0.ɵɵelement(2, "i", 10);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" \u0917\u0932\u0924\u093F\u092F\u093E\u0901 (", ctx_r7.state.unresolvedCorrectionsCount(), ") ");
} }
function SutramExcelStudioComponent_div_97_span_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 103);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r23 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", tab_r23.recordCount, " ");
} }
function SutramExcelStudioComponent_div_97_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 100);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_97_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r27); const tab_r23 = restoredCtx.$implicit; const ctx_r26 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r26.switchSheet(tab_r23.id)); });
    i0.ɵɵelement(1, "i", 101);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_97_span_4_Template, 2, 1, "span", 102);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r23 = ctx.$implicit;
    const ctx_r8 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active-tab", ctx_r8.activeSheetId === tab_r23.id);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", tab_r23.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(tab_r23.title);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", tab_r23.isLoaded && (tab_r23.recordCount || 0) > 0);
} }
function SutramExcelStudioComponent_span_106_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 104);
    i0.ɵɵelement(1, "i", 105);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r9.state.deletedRowIds().length, " Deleted ");
} }
function SutramExcelStudioComponent_span_107_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 106);
    i0.ɵɵtext(1, "\u2713 100% In Sync");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_span_108_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 107);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r11 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("", ctx_r11.state.stats().errorRows, " \u0924\u094D\u0930\u0941\u091F\u093F\u092F\u093E\u0901");
} }
function SutramExcelStudioComponent_div_119_span_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 119);
    i0.ɵɵelement(1, "i", 82);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r28 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r28.syncToast.inserted, " Inserted ");
} }
function SutramExcelStudioComponent_div_119_span_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 120);
    i0.ɵɵelement(1, "i", 121);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r29 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r29.syncToast.updated, " Updated ");
} }
function SutramExcelStudioComponent_div_119_span_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 122);
    i0.ɵɵelement(1, "i", 21);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r30 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r30.syncToast.deleted, " Deleted ");
} }
function SutramExcelStudioComponent_div_119_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 123);
    i0.ɵɵelement(1, "i", 124);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r31 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r31.syncToast.failed, " Failed ");
} }
function SutramExcelStudioComponent_div_119_div_14_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const err_r34 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("\u2022 ", err_r34, "");
} }
function SutramExcelStudioComponent_div_119_div_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 125);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_div_119_div_14_div_1_Template, 2, 1, "div", 126);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r32 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", ctx_r32.syncToast.errors);
} }
function SutramExcelStudioComponent_div_119_Template(rf, ctx) { if (rf & 1) {
    const _r36 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 108)(1, "div", 109)(2, "div", 110);
    i0.ɵɵelement(3, "i", 26);
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 111);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_119_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r36); const ctx_r35 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r35.syncToast.visible = false); });
    i0.ɵɵtext(7, "\u2715");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 112)(9, "div", 113);
    i0.ɵɵtemplate(10, SutramExcelStudioComponent_div_119_span_10_Template, 3, 1, "span", 114);
    i0.ɵɵtemplate(11, SutramExcelStudioComponent_div_119_span_11_Template, 3, 1, "span", 115);
    i0.ɵɵtemplate(12, SutramExcelStudioComponent_div_119_span_12_Template, 3, 1, "span", 116);
    i0.ɵɵtemplate(13, SutramExcelStudioComponent_div_119_span_13_Template, 3, 1, "span", 117);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(14, SutramExcelStudioComponent_div_119_div_14_Template, 2, 1, "div", 118);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r12 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngClass", ctx_r12.syncToast.hasError ? "pi-exclamation-circle text-warning" : "pi-check-circle text-success");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r12.syncToast.title);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngIf", ctx_r12.syncToast.inserted > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r12.syncToast.updated > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r12.syncToast.deleted > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r12.syncToast.failed > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r12.syncToast.errors.length > 0);
} }
export class SutramExcelStudioComponent {
    state;
    api;
    scanner;
    audit;
    refCache;
    cdr;
    set table(tableName) {
        if (tableName) {
            this.onTableSelect(tableName);
        }
    }
    mode = 'intelligent';
    apiBase = '/_sutram/excel';
    // ── Declarative Feature Flags (Batteries-Included: All ON by default, toggleable by user flags) ──
    enableFilters = true;
    enableSorting = true;
    enableSearch = true;
    enableControlBar = true;
    enableStatsBar = true;
    enableUpload = true;
    enableAudit = true;
    enableAddRow = true;
    enableCorrections = true;
    enableLoadData = true;
    enableVerify = true;
    enableSync = true;
    enableDelete = true;
    enableTabs = true;
    enableZoom = true;
    tablesList = [];
    selectedTableName = '';
    isLoadingConfig = false;
    // Sheet tabs state
    sheetTabs = [];
    activeSheetId = 'blank';
    sheetWorkbooks = {};
    // Zoom / Scale state
    zoomLevel = 1.0;
    // Dark Mode State
    isDarkMode = false;
    // Text Formatting State
    isBoldActive = false;
    textAlign = 'left';
    // Hidden Columns Set
    hiddenColumnKeys = new Set();
    // Floating Sync Toast HUD State
    syncToast = {
        visible: false,
        title: '',
        hasError: false,
        inserted: 0,
        updated: 0,
        deleted: 0,
        failed: 0,
        errors: []
    };
    // Scanner modal state
    showScannerModal = false;
    scanReport = null;
    pendingRawRows = [];
    // Correction sidebar state
    showSidebar = false;
    // Import progress modal state
    showProgressModal = false;
    rejectedRowsDuringImport = [];
    isCancelRequested = false;
    // DB Search Subject & Subscription
    searchSubject = new Subject();
    searchSub;
    // Computed Active Cell Coordinate, Column Chip, and Formula Value
    get activeCoord() {
        const sel = this.state.selectedCell();
        if (!sel)
            return 'A1';
        const cols = this.visibleHeaders;
        const colIdx = cols.findIndex(c => c.name === sel.colKey);
        const letter = this.getColLetter(colIdx >= 0 ? colIdx : 0);
        return `${letter}${sel.rowIdx + 1}`;
    }
    get activeColChip() {
        const sel = this.state.selectedCell();
        return sel ? sel.colKey : '--';
    }
    get formulaValue() {
        const sel = this.state.selectedCell();
        if (!sel)
            return '';
        const rows = this.state.rows();
        return rows[sel.rowIdx]?.cells[sel.colKey]?.value ?? '';
    }
    get visibleHeaders() {
        const headers = this.state.headers();
        return headers.filter(h => !this.hiddenColumnKeys.has(h.name));
    }
    get visibleHeadersCount() {
        return this.visibleHeaders.length;
    }
    getColLetter(idx) {
        let letter = '';
        let temp = idx;
        while (temp >= 0) {
            letter = String.fromCharCode((temp % 26) + 65) + letter;
            temp = Math.floor(temp / 26) - 1;
        }
        return letter;
    }
    get statusStripClass() {
        if (this.state.stats().errorRows > 0)
            return 'strip-error';
        if (this.mode === 'intelligent')
            return 'strip-suggestion';
        return 'strip-clean';
    }
    get statusStripIcon() {
        if (this.state.stats().errorRows > 0)
            return 'pi-exclamation-triangle text-danger';
        if (this.mode === 'intelligent')
            return 'pi-bolt text-primary';
        return 'pi-info-circle text-primary';
    }
    get statusStripMessage() {
        if (this.state.stats().errorRows > 0) {
            return `शीट में ${this.state.stats().errorRows} पंक्तियों में अमान्य मान मिले हैं। कृपया सुधारें या 'गलतियाँ' साइडबार देखें।`;
        }
        if (this.mode === 'intelligent') {
            return 'Smart Mode ON. Live foreign key validation and dictionary learning active.';
        }
        return 'Normal mode ready. Type or paste data. Turn on Smart Mode for live FK validation.';
    }
    constructor(state, api, scanner, audit, refCache, cdr) {
        this.state = state;
        this.api = api;
        this.scanner = scanner;
        this.audit = audit;
        this.refCache = refCache;
        this.cdr = cdr;
    }
    ngOnInit() {
        if (this.apiBase) {
            this.api.setBaseUri(this.apiBase);
        }
        this.state.isAuditMode.set(this.mode === 'intelligent');
        this.state.filtersEnabled.set(this.enableFilters);
        this.state.sortingEnabled.set(this.enableSorting);
        // Debounced direct database search
        this.searchSub = this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((query) => {
            this.state.dbSearchQuery.set(query);
            if (this.selectedTableName) {
                this.loadDataChunk(this.selectedTableName, 0, 100, true);
            }
        });
        this.loadTablesList();
    }
    ngOnDestroy() {
        this.searchSub?.unsubscribe();
    }
    setStudioMode(newMode) {
        this.mode = newMode;
        this.state.isAuditMode.set(newMode === 'intelligent');
        this.cdr.markForCheck();
    }
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        else {
            document.body.classList.remove('dark-mode');
        }
        this.cdr.markForCheck();
    }
    onFormulaChange(val) {
        const sel = this.state.selectedCell();
        if (!sel)
            return;
        this.state.updateCellValue(sel.rowIdx, sel.colKey, val);
        this.cdr.markForCheck();
    }
    toggleColumnVisibility(colName) {
        if (this.hiddenColumnKeys.has(colName)) {
            this.hiddenColumnKeys.delete(colName);
        }
        else {
            this.hiddenColumnKeys.add(colName);
        }
        this.cdr.markForCheck();
    }
    exportExcel() {
        const rows = this.state.rows();
        if (!rows || rows.length === 0) {
            alert('डाउनलोड करने के लिए शीट में कोई डेटा नहीं है (No data to export)');
            return;
        }
        const headers = this.visibleHeaders;
        const exportData = rows.map(r => {
            const obj = {};
            headers.forEach(h => {
                obj[h.name] = r.cells[h.name]?.value ?? '';
            });
            return obj;
        });
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, this.selectedTableName || 'Sheet1');
        XLSX.writeFile(wb, `${this.selectedTableName || 'data'}_${Date.now()}.xlsx`);
    }
    loadTablesList() {
        this.api.getRegisteredTables().subscribe({
            next: (tables) => {
                this.tablesList = tables;
                this.sheetTabs = [
                    { id: 'blank', title: 'Blank Sheet', icon: 'pi-file', isLoaded: false },
                    ...tables.map((t) => ({
                        id: t.table,
                        title: t.display_name || t.table,
                        icon: 'pi-table',
                        isLoaded: false,
                        recordCount: 0
                    }))
                ];
                if (!this.selectedTableName && tables.length > 0) {
                    this.activeSheetId = tables[0].table;
                    this.onTableSelect(tables[0].table, true);
                }
                this.cdr.markForCheck();
            },
            error: (err) => console.error('[SutramStudio] Load tables failed:', err)
        });
    }
    onTableSelect(tableName, autoLoadData = true) {
        if (!tableName)
            return;
        this.selectedTableName = tableName;
        this.activeSheetId = tableName;
        this.state.setActiveTable(tableName);
        this.isLoadingConfig = true;
        this.api.getTableConfig(tableName).subscribe({
            next: (cfg) => {
                this.state.setConfig(cfg);
                this.isLoadingConfig = false;
                this.state.clearGrid();
                // Hide technical internal columns by default (_id, verify, dept_id) matching legacy studio
                this.hiddenColumnKeys.clear();
                (cfg.headers || []).forEach((h) => {
                    const n = (h.name || h.col_name || '').toLowerCase();
                    if (n === '_id' || n.includes('_by_dept_id') || n === 'verify') {
                        this.hiddenColumnKeys.add(h.name);
                    }
                });
                // Preload all referenced FK tables
                if (cfg && cfg.headers) {
                    const refTables = cfg.headers
                        .filter((h) => h.ref_table || h.type === 'ref')
                        .map((h) => h.ref_table)
                        .filter(Boolean);
                    this.refCache.preloadTables(refTables);
                }
                if (autoLoadData) {
                    this.loadDataChunk(tableName, 0, 100, true);
                }
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isLoadingConfig = false;
                console.error('[SutramStudio] Load config failed:', err);
                this.cdr.markForCheck();
            }
        });
    }
    switchSheet(tabId) {
        if (this.activeSheetId === tabId)
            return;
        // Preserve current sheet state
        if (this.activeSheetId) {
            this.sheetWorkbooks[this.activeSheetId] = {
                rows: this.state.rows(),
                deletedRowIds: this.state.deletedRowIds(),
                deletedRowsQueue: this.state.deletedRowsQueue()
            };
        }
        this.activeSheetId = tabId;
        if (tabId === 'blank' || tabId.startsWith('sheet_')) {
            this.selectedTableName = '';
            const saved = this.sheetWorkbooks[tabId];
            if (saved && saved.rows) {
                this.state.setRows(saved.rows);
                this.state.deletedRowIds.set(saved.deletedRowIds || []);
                this.state.deletedRowsQueue.set(saved.deletedRowsQueue || []);
            }
            else {
                this.state.clearGrid();
            }
            this.state.totalDbRecords.set(0);
            this.cdr.markForCheck();
        }
        else {
            const saved = this.sheetWorkbooks[tabId];
            if (saved && saved.rows && saved.rows.length > 0) {
                this.selectedTableName = tabId;
                this.state.setRows(saved.rows);
                this.state.deletedRowIds.set(saved.deletedRowIds || []);
                this.state.deletedRowsQueue.set(saved.deletedRowsQueue || []);
                this.onTableSelect(tabId, false);
            }
            else {
                this.onTableSelect(tabId, true);
            }
        }
        this.cdr.markForCheck();
    }
    addNewBlankSheet() {
        const customCount = this.sheetTabs.filter(t => t.id.startsWith('sheet_')).length + 2;
        const newId = `sheet_${Date.now()}`;
        this.sheetTabs.push({ id: newId, title: `Sheet ${customCount}`, icon: 'pi-file', isLoaded: false });
        this.switchSheet(newId);
    }
    /**
     * Converts a database row object into a verified SutramRow.
     * Utilizes SutramRefCacheService for Rule 8 bilingual formatting.
     */
    convertDbRecordToSutramRow(dr, rowNum, cfg) {
        const cells = {};
        cfg.headers.forEach((h) => {
            let rawVal;
            if (h.ref_table || h.type === 'ref') {
                const joined = dr[h.ref_as || h.name || h.ref_table];
                if (joined && typeof joined === 'object') {
                    const formatted = this.refCache.formatOption(h.ref_table, joined);
                    if (formatted && formatted.display) {
                        rawVal = formatted.display;
                    }
                }
            }
            if (rawVal === undefined)
                rawVal = dr[h.col_name];
            if (rawVal === undefined)
                rawVal = dr[h.name];
            if (rawVal === undefined) {
                const matchKey = Object.keys(dr).find((k) => k.toLowerCase() === (h.col_name || h.name || '').toLowerCase());
                if (matchKey)
                    rawVal = dr[matchKey];
            }
            cells[h.name] = {
                value: String(rawVal ?? ''),
                isValid: true,
                refId: dr[h.col_name] !== undefined ? dr[h.col_name] : rawVal
            };
        });
        return {
            rowNum,
            cells,
            hasError: false,
            errorCount: 0,
            _rawOriginal: dr
        };
    }
    /**
     * Chunked lazy loading with direct database search, sort, and filters.
     */
    loadDataChunk(tableName, offset = 0, limit = 100, isReset = true) {
        const cfg = this.state.config();
        if (!cfg || !tableName)
            return;
        if (this.state.isLoadingDb())
            return;
        this.state.isLoadingDb.set(true);
        const activeSort = this.state.activeSort();
        const columnFilters = this.state.columnFilters();
        const searchQuery = this.state.dbSearchQuery().trim();
        // Serialize column filters for backend API
        const apiFilters = {};
        for (const [colKey, valSet] of Object.entries(columnFilters)) {
            if (valSet && valSet.size > 0) {
                apiFilters[colKey] = Array.from(valSet);
            }
        }
        this.api.getTableDataChunk(tableName, {
            limit,
            offset,
            search: searchQuery || undefined,
            sort: activeSort?.colKey,
            order: activeSort?.order,
            filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined
        }).subscribe({
            next: (res) => {
                this.state.isLoadingDb.set(false);
                this.state.totalDbRecords.set(res.total);
                const startIndex = isReset ? 0 : this.state.rows().length;
                const builtRows = (res.rows || []).map((dr, idx) => {
                    return this.convertDbRecordToSutramRow(dr, startIndex + idx + 1, cfg);
                });
                this.audit.auditAll(builtRows, cfg.headers);
                if (isReset) {
                    this.state.setRows(builtRows);
                }
                else {
                    this.state.appendRows(builtRows);
                }
                const tab = this.sheetTabs.find((t) => t.id === tableName);
                if (tab) {
                    tab.isLoaded = true;
                    tab.recordCount = this.state.rows().length;
                }
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.state.isLoadingDb.set(false);
                console.error('[SutramStudio] Load DB data chunk failed:', err);
                this.cdr.markForCheck();
            }
        });
    }
    /**
     * Infinite scroll trigger emitted from grid when scrolling near bottom
     */
    onLoadMore() {
        if (this.state.isLoadingDb())
            return;
        const currentCount = this.state.rows().length;
        const totalCount = this.state.totalDbRecords();
        if (totalCount > 0 && currentCount < totalCount && this.selectedTableName) {
            this.loadDataChunk(this.selectedTableName, currentCount, 100, false);
        }
    }
    /**
     * Direct Database Searchbox Handlers
     */
    onDbSearchInput(query) {
        this.searchSubject.next(query);
    }
    clearDbSearch() {
        this.state.dbSearchQuery.set('');
        this.searchSubject.next('');
    }
    /**
     * Clear All Active Column Filters
     */
    clearAllFilters() {
        this.state.clearAllColumnFilters();
        if (this.selectedTableName) {
            this.loadDataChunk(this.selectedTableName, 0, 100, true);
        }
    }
    onGridFilterChanged() {
        if (this.selectedTableName) {
            this.loadDataChunk(this.selectedTableName, 0, 100, true);
        }
    }
    onGridSortChanged() {
        if (this.selectedTableName) {
            this.loadDataChunk(this.selectedTableName, 0, 100, true);
        }
    }
    loadTableDataFromDb() {
        if (this.selectedTableName) {
            this.loadDataChunk(this.selectedTableName, 0, 100, true);
        }
    }
    zoomIn() {
        if (this.zoomLevel < 1.6) {
            this.zoomLevel = Math.min(1.6, Math.round((this.zoomLevel + 0.1) * 10) / 10);
            this.cdr.markForCheck();
        }
    }
    zoomOut() {
        if (this.zoomLevel > 0.6) {
            this.zoomLevel = Math.max(0.6, Math.round((this.zoomLevel - 0.1) * 10) / 10);
            this.cdr.markForCheck();
        }
    }
    resetZoom() {
        this.zoomLevel = 1.0;
        this.cdr.markForCheck();
    }
    // ── File Parsing & Header Scanning ───────────────────────────
    onFileUpload(event) {
        const file = event?.target?.files?.[0] || event?.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            if (!rawJson || rawJson.length === 0)
                return;
            const headers = (rawJson[0] || []).map(h => String(h || '').trim());
            this.pendingRawRows = rawJson.slice(1);
            const cfg = this.state.config();
            if (!cfg)
                return;
            // Run smart header scan
            this.scanReport = this.scanner.scan(headers, cfg, this.pendingRawRows);
            this.showScannerModal = true;
            this.cdr.markForCheck();
        };
        reader.readAsArrayBuffer(file);
        // Reset file input value
        if (event.target)
            event.target.value = '';
    }
    onScannerConfirmed(matches) {
        const cfg = this.state.config();
        if (!cfg)
            return;
        const builtRows = this.scanner.buildSutramRows(this.pendingRawRows, matches, cfg.headers);
        this.audit.auditAll(builtRows, cfg.headers);
        this.state.setRows(builtRows);
        this.showScannerModal = false;
        this.pendingRawRows = [];
        this.cdr.markForCheck();
    }
    // ── Server-Side Verification ─────────────────────────────────
    verifyData() {
        const cfg = this.state.config();
        if (!cfg || !this.selectedTableName)
            return;
        const rows = this.state.rows();
        if (rows.length === 0)
            return;
        this.state.isVerifying.set(true);
        // Extract raw objects for verify API
        const rawObjects = rows.map((r) => {
            const obj = {};
            cfg.headers.forEach((h) => (obj[h.name] = r.cells[h.name]?.value));
            return obj;
        });
        this.api.verifyRows(this.selectedTableName, rawObjects).subscribe({
            next: (res) => {
                this.state.isVerifying.set(false);
                this.state.setCorrections(res.correctionList || []);
                // If corrections exist, open sidebar
                if (res.correctionList && res.correctionList.length > 0) {
                    this.showSidebar = true;
                }
                // Re-audit with server resolved IDs
                if (res.rows && res.rows.length === rows.length) {
                    const updatedRows = [...rows];
                    res.rows.forEach((resolvedObj, idx) => {
                        cfg.headers.forEach((h) => {
                            if (resolvedObj[h.col_name] !== undefined) {
                                updatedRows[idx].cells[h.name].refId = resolvedObj[h.col_name];
                            }
                        });
                    });
                    this.state.setRows(updatedRows);
                }
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.state.isVerifying.set(false);
                console.error('[SutramStudio] Verify failed:', err);
                this.cdr.markForCheck();
            }
        });
    }
    addNewRow() {
        const row = this.state.addNewBlankRow();
        this.cdr.markForCheck();
    }
    // ── Streaming Import Pipeline ────────────────────────────────
    async startImport() {
        const cfg = this.state.config();
        if (!cfg || !this.selectedTableName)
            return;
        const rows = this.state.rows();
        const deletedIds = [...this.state.deletedRowIds()];
        if (rows.length === 0 && deletedIds.length === 0)
            return;
        // 1. Identify rows to sync: only modified or newly added rows!
        const rowsToSync = rows.filter((r) => (r.isNew || r.isModified) && this.audit.rowHasData(r, cfg.headers));
        if (rowsToSync.length === 0 && deletedIds.length === 0) {
            alert('सिंक करने के लिए कोई नया, संशोधित या हटाया गया डेटा नहीं मिला (No modified, new, or deleted rows found to sync)।');
            return;
        }
        // 2. Mandatory Pre-Sync Audit: Check foreign keys and required constraints
        if (rowsToSync.length > 0) {
            const preSyncAudit = this.audit.auditRowsBeforeSync(rows, cfg.headers);
            if (!preSyncAudit.canSync) {
                const firstErr = preSyncAudit.errorDetails[0];
                const errMsg = `डेटाबेस सिंक रोका गया! कुल ${preSyncAudit.totalErrors} त्रुटियां पाई गईं (पंक्ति ${firstErr.rowNum}: ${firstErr.message})। केवल शुद्ध डेटा ही सिंक किया जा सकता है।`;
                console.warn('[SutramStudio] DB Sync Blocked:', errMsg);
                alert(errMsg);
                this.cdr.markForCheck();
                return;
            }
        }
        this.isCancelRequested = false;
        this.rejectedRowsDuringImport = [];
        this.showProgressModal = true;
        this.state.isImporting.set(true);
        const totalOps = rowsToSync.length + (deletedIds.length > 0 ? deletedIds.length : 0);
        const progress = {
            current: 0,
            total: totalOps,
            percentage: 0,
            inserted: 0,
            updated: 0,
            deleted: 0,
            duplicate: 0,
            rejected: 0,
            isActive: true
        };
        this.state.importProgress.set({ ...progress });
        // 3. Dispatch deleted rows if any exist
        if (deletedIds.length > 0) {
            try {
                const delRes = await this.api.deleteRows(this.selectedTableName, deletedIds).toPromise();
                const delCount = delRes?.count || deletedIds.length;
                progress.deleted = delCount;
                this.state.totalDbRecords.update((n) => Math.max(0, n - delCount));
                this.state.clearDeletedRowIds();
            }
            catch (delErr) {
                progress.rejected += deletedIds.length;
                this.rejectedRowsDuringImport.push({ _id: deletedIds.join(', '), _error: delErr?.message || 'Delete failed' });
                // Deletion failed: restore deleted rows back to normal in grid and clear delete queue
                const queue = this.state.deletedRowsQueue();
                if (queue.length > 0) {
                    const currentRows = [...this.state.rows()];
                    queue.forEach((item) => {
                        const cleanRow = {
                            ...item.row,
                            isNew: false,
                            isModified: false,
                            hasError: false,
                            errorCount: 0
                        };
                        const insertIdx = item.index >= 0 ? Math.min(item.index, currentRows.length) : currentRows.length;
                        currentRows.splice(insertIdx, 0, cleanRow);
                    });
                    this.state.setRows(currentRows);
                }
                this.state.clearDeletedRowIds();
            }
            progress.current += deletedIds.length;
            progress.percentage = Math.round((progress.current / progress.total) * 100);
            this.state.importProgress.set({ ...progress });
            this.cdr.markForCheck();
        }
        // If only deletions were performed, wrap up and return!
        if (rowsToSync.length === 0) {
            progress.isActive = false;
            this.state.importProgress.set({ ...progress });
            this.state.isImporting.set(false);
            this.cdr.markForCheck();
            return;
        }
        const syncedRowNums = [];
        for (let i = 0; i < rowsToSync.length; i++) {
            if (this.isCancelRequested)
                break;
            const r = rowsToSync[i];
            const payload = {};
            cfg.headers.forEach((h) => {
                const cell = r.cells[h.name];
                const val = cell?.refId !== undefined ? cell.refId : cell?.value;
                payload[h.col_name] = val;
            });
            const rowId = r._id || r._rawOriginal?._id || r._rawOriginal?.id;
            const isUpdate = !r.isNew && !!rowId;
            if (isUpdate) {
                payload._id = rowId;
            }
            try {
                const res = isUpdate
                    ? await this.api.updateRow(this.selectedTableName, payload).toPromise()
                    : await this.api.importRow(this.selectedTableName, payload).toPromise();
                if (res?.status === 'inserted') {
                    progress.inserted++;
                    syncedRowNums.push(r.rowNum);
                    this.state.totalDbRecords.update((n) => n + 1);
                }
                else if (res?.status === 'updated') {
                    progress.updated++;
                    syncedRowNums.push(r.rowNum);
                }
                else if (res?.status === 'duplicate') {
                    progress.duplicate++;
                    syncedRowNums.push(r.rowNum);
                }
                else {
                    progress.rejected++;
                    this.rejectedRowsDuringImport.push({ ...payload, _error: res?.error || 'Rejected' });
                }
            }
            catch (err) {
                progress.rejected++;
                this.rejectedRowsDuringImport.push({ ...payload, _error: err?.message || 'Network error' });
            }
            progress.current = deletedIds.length + i + 1;
            progress.percentage = Math.round((progress.current / progress.total) * 100);
            this.state.importProgress.set({ ...progress });
            this.cdr.markForCheck();
        }
        // Mark successfully synced rows as clean
        this.state.markRowsSynced(syncedRowNums);
        progress.isActive = false;
        this.state.importProgress.set({ ...progress });
        this.state.isImporting.set(false);
        // Populate floating Sync Toast HUD
        this.syncToast = {
            visible: true,
            title: progress.rejected > 0 ? 'Sync Finished with Warnings' : 'Sync Completed Successfully',
            hasError: progress.rejected > 0,
            inserted: progress.inserted,
            updated: progress.updated,
            deleted: progress.deleted || 0,
            failed: progress.rejected,
            errors: this.rejectedRowsDuringImport.map(x => x._error || 'Row operation failed')
        };
        this.cdr.markForCheck();
    }
    cancelImport() {
        this.isCancelRequested = true;
    }
    // ── "Solve All" Handler from Grid ────────────────────────────
    onGridSolveAll(event) {
        this.state.applyBatchCorrection(event.colKey, event.badValue, event.resolvedDisplay, event.resolvedId);
        if (event.saveToDict) {
            const header = this.state.headers().find((h) => h.name === event.colKey);
            const refType = header?.ref_table || event.colKey;
            this.api.addDictionaryEntry({
                type: refType,
                name: event.badValue,
                ref_id: event.resolvedId !== undefined ? event.resolvedId : event.resolvedDisplay
            }).subscribe();
        }
    }
    static ɵfac = function SutramExcelStudioComponent_Factory(t) { return new (t || SutramExcelStudioComponent)(i0.ɵɵdirectiveInject(i1.SutramExcelStateService), i0.ɵɵdirectiveInject(i2.SutramExcelApiService), i0.ɵɵdirectiveInject(i3.SutramExcelScannerService), i0.ɵɵdirectiveInject(i4.SutramAuditService), i0.ɵɵdirectiveInject(i5.SutramRefCacheService), i0.ɵɵdirectiveInject(i0.ChangeDetectorRef)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SutramExcelStudioComponent, selectors: [["sutram-excel-studio"]], inputs: { table: "table", mode: "mode", apiBase: "apiBase", enableFilters: "enableFilters", enableSorting: "enableSorting", enableSearch: "enableSearch", enableControlBar: "enableControlBar", enableStatsBar: "enableStatsBar", enableUpload: "enableUpload", enableAudit: "enableAudit", enableAddRow: "enableAddRow", enableCorrections: "enableCorrections", enableLoadData: "enableLoadData", enableVerify: "enableVerify", enableSync: "enableSync", enableDelete: "enableDelete", enableTabs: "enableTabs", enableZoom: "enableZoom" }, decls: 123, vars: 53, consts: [[1, "sutram-excel-container"], [1, "command-bar"], [1, "brand"], [1, "brand-icon"], [1, "pi", "pi-table"], [1, "brand-title"], [2, "font-size", "9px", "padding", "1px 4px", "background", "rgba(16, 185, 129, 0.2)", "color", "#059669", "border-radius", "4px"], [1, "mode-pill-toggle"], [1, "mode-pill-btn", 3, "click"], [1, "pi", "pi-pencil"], [1, "pi", "pi-bolt"], [1, "btn-group-cmd"], ["title", "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0938\u0947 \u0907\u0938 \u091F\u0947\u092C\u0932 \u0915\u093E \u0932\u093E\u0907\u0935 \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0915\u0930\u0947\u0902", 1, "cmd-btn", "cmd-btn-success", 3, "click"], [1, "pi", "pi-database"], ["title", "\u092C\u093E\u0939\u0930\u0940 Excel (.xlsx) \u0916\u094B\u0932\u0947\u0902", 1, "cmd-btn", 3, "click"], [1, "pi", "pi-folder-open"], ["type", "file", "accept", ".xlsx, .xls, .csv", 2, "display", "none", 3, "change"], ["fileInput", ""], ["title", "Excel \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902", 1, "cmd-btn", 3, "click"], [1, "pi", "pi-download"], ["title", "\u0936\u0940\u091F \u0916\u093E\u0932\u0940 \u0915\u0930\u0947\u0902", 1, "cmd-btn", 3, "click"], [1, "pi", "pi-trash"], ["title", "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0938\u0947\u0935/\u0907\u092E\u094D\u092A\u094B\u0930\u094D\u091F \u0915\u0930\u0947\u0902", 1, "cmd-btn", "cmd-btn-primary", 3, "disabled", "click"], [1, "pi", "pi-cloud-upload"], ["class", "sync-badge-count", 4, "ngIf"], ["title", "\u0932\u093E\u0907\u091F / \u0921\u093E\u0930\u094D\u0915 \u092E\u094B\u0921", 1, "cmd-btn", 2, "padding", "4px 6px", 3, "click"], [1, "pi", 3, "ngClass"], [1, "formula-bar-row"], [1, "coord-box"], [1, "active-col-chip"], [2, "display", "flex", "gap", "2px"], ["title", "Bold (Ctrl+B)", 1, "cmd-btn", 2, "padding", "2px 7px", "font-weight", "700", 3, "click"], ["title", "Align Left", 1, "cmd-btn", 2, "padding", "2px 6px", 3, "click"], [1, "pi", "pi-align-left"], ["title", "Align Center", 1, "cmd-btn", 2, "padding", "2px 6px", 3, "click"], [1, "pi", "pi-align-center"], ["title", "Align Right", 1, "cmd-btn", 2, "padding", "2px 6px", 3, "click"], [1, "pi", "pi-align-right"], ["title", "Choose Visible Columns (\u0915\u0949\u0932\u092E \u091A\u0941\u0928\u0947\u0902)", 1, "cmd-btn", 2, "gap", "5px", 3, "click"], [1, "pi", "pi-sliders-h", 2, "color", "var(--primary)"], [2, "font-size", "10px", "padding", "1px 5px", "background", "var(--primary-soft)", "color", "var(--primary)", "border-radius", "999px", "font-weight", "700"], [2, "font-weight", "700", "font-style", "italic", "color", "var(--text-muted)", "margin", "0 4px"], ["type", "text", "placeholder", "Select a cell or type value here...", 1, "formula-input", 3, "ngModel", "ngModelChange"], ["styleClass", "p-2 shadow-lg", 3, "dismissable"], ["colConfigOp", ""], ["pTemplate", "content"], [1, "control-settings-bar"], [1, "ctrl-bar-left"], ["title", "\u0915\u0949\u0932\u092E \u092B\u093C\u093F\u0932\u094D\u091F\u0930 \u0911\u0928 / \u0911\u092B\u093C \u0915\u0930\u0947\u0902", 1, "ctrl-btn", 3, "click"], [1, "pi", "pi-filter"], [1, "ctrl-dot"], ["title", "\u0938\u0949\u0930\u094D\u091F\u093F\u0902\u0917 \u0911\u0928 / \u0911\u092B\u093C \u0915\u0930\u0947\u0902", 1, "ctrl-btn", 3, "click"], [1, "pi", "pi-sort-alt"], ["class", "ctrl-btn ctrl-btn-danger", "title", "\u0938\u092D\u0940 \u092B\u093C\u093F\u0932\u094D\u091F\u0930 \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902", 3, "click", 4, "ngIf"], [1, "ctrl-search-wrap"], [1, "pi", "pi-search", "ctrl-search-icon"], ["type", "text", "placeholder", "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0938\u0940\u0927\u093E \u0916\u094B\u091C\u0947\u0902 (Direct DB Search)...", "autocomplete", "off", 1, "ctrl-search-input", 3, "ngModel", "ngModelChange"], ["class", "ctrl-search-clear", "style", "display: block;", "title", "\u0916\u094B\u091C \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902", 3, "click", 4, "ngIf"], ["class", "ctrl-search-spinner", 4, "ngIf"], [1, "ctrl-bar-right"], ["title", "\u0915\u0941\u0932 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0930\u093F\u0915\u0949\u0930\u094D\u0921\u094D\u0938 \u090F\u0935\u0902 \u0932\u094B\u0921 \u0938\u094D\u0925\u093F\u0924\u093F", 1, "ctrl-record-badge"], [1, "status-strip", 3, "ngClass"], [2, "display", "flex", "align-items", "center", "gap", "6px"], [4, "ngIf"], [1, "spreadsheet-canvas", "flex-grow-1", "overflow-auto"], [3, "headers", "rows", "filterOnlyErrors", "enableDelete", "loadMore", "filterChanged", "sortChanged", "solveAllTriggered"], [1, "studio-footer"], [1, "sheet-tabs-bar"], ["class", "tab-pill", 3, "active-tab", "click", 4, "ngFor", "ngForOf"], ["title", "Add Blank Sheet", 1, "add-tab-btn", 3, "click"], [1, "pi", "pi-plus", 2, "font-size", "10px"], [1, "bottom-status-subrow"], [2, "display", "flex", "align-items", "center", "gap", "10px"], ["class", "badge bg-soft-warning text-warning small fw-semibold", 4, "ngIf"], ["style", "color: #10b981; font-weight: 600;", 4, "ngIf"], ["style", "color: #ef4444; font-weight: 600;", 4, "ngIf"], [2, "font-size", "10.5px", "opacity", "0.8"], [1, "zoom-controls"], ["title", "Zoom Out (-10%)", 1, "zoom-btn", 3, "click"], [1, "pi", "pi-minus"], ["title", "Reset to 100%", 1, "zoom-display", 3, "click"], ["title", "Zoom In (+10%)", 1, "zoom-btn", 3, "click"], [1, "pi", "pi-plus"], ["class", "sync-toast-hud", 4, "ngIf"], [3, "visible", "report", "availableHeaders", "visibleChange", "confirmed"], [3, "visible", "groups", "visibleChange"], [3, "visible", "progress", "tableName", "rejectedRows", "visibleChange", "cancelRequested"], [1, "sync-badge-count"], [2, "min-width", "200px", "max-height", "260px", "overflow-y", "auto"], [1, "fw-bold", "small", "mb-2", "text-muted"], ["class", "d-flex align-items-center gap-2 py-1", 4, "ngFor", "ngForOf"], [1, "d-flex", "align-items-center", "gap-2", "py-1"], ["type", "checkbox", 3, "id", "checked", "change"], [1, "small", "mb-0", "cursor-pointer", 3, "for"], ["title", "\u0938\u092D\u0940 \u092B\u093C\u093F\u0932\u094D\u091F\u0930 \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902", 1, "ctrl-btn", "ctrl-btn-danger", 3, "click"], [1, "pi", "pi-filter-slash"], ["title", "\u0916\u094B\u091C \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902", 1, "ctrl-search-clear", 2, "display", "block", 3, "click"], [1, "ctrl-search-spinner"], [1, "pi", "pi-spin", "pi-spinner"], [1, "cmd-btn", "cmd-btn-warning", 2, "padding", "2px 8px", 3, "click"], [1, "tab-pill", 3, "click"], [1, "pi", 2, "font-size", "11px", 3, "ngClass"], ["class", "sheet-tab-badge", 4, "ngIf"], [1, "sheet-tab-badge"], [1, "badge", "bg-soft-warning", "text-warning", "small", "fw-semibold"], [1, "pi", "pi-trash", "me-1"], [2, "color", "#10b981", "font-weight", "600"], [2, "color", "#ef4444", "font-weight", "600"], [1, "sync-toast-hud"], [1, "sync-toast-header"], [1, "sync-toast-title"], [1, "sync-toast-close", 3, "click"], [1, "sync-toast-body"], [1, "sync-toast-stats"], ["class", "sync-badge-chip chip-success", 4, "ngIf"], ["class", "sync-badge-chip chip-info", 4, "ngIf"], ["class", "sync-badge-chip chip-warning", 4, "ngIf"], ["class", "sync-badge-chip chip-danger", 4, "ngIf"], ["class", "sync-toast-errors", 4, "ngIf"], [1, "sync-badge-chip", "chip-success"], [1, "sync-badge-chip", "chip-info"], [1, "pi", "pi-refresh"], [1, "sync-badge-chip", "chip-warning"], [1, "sync-badge-chip", "chip-danger"], [1, "pi", "pi-times"], [1, "sync-toast-errors"], [4, "ngFor", "ngForOf"]], template: function SutramExcelStudioComponent_Template(rf, ctx) { if (rf & 1) {
            const _r37 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "div", 0)(1, "header", 1)(2, "div", 2)(3, "div", 3);
            i0.ɵɵelement(4, "i", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "div", 5)(6, "span");
            i0.ɵɵtext(7, "Sutram Excel Studio");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "span", 6);
            i0.ɵɵtext(9, "v2.0");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(10, "div", 7)(11, "button", 8);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_11_listener() { return ctx.setStudioMode("normal"); });
            i0.ɵɵelement(12, "i", 9);
            i0.ɵɵtext(13, " Normal ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "button", 8);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_14_listener() { return ctx.setStudioMode("intelligent"); });
            i0.ɵɵelement(15, "i", 10);
            i0.ɵɵtext(16, " Smart (Intelligent) ");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "div", 11)(18, "button", 12);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_18_listener() { return ctx.loadTableDataFromDb(); });
            i0.ɵɵelement(19, "i", 13);
            i0.ɵɵtext(20, " Load Data ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "button", 14);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r37); const _r0 = i0.ɵɵreference(25); return i0.ɵɵresetView(_r0.click()); });
            i0.ɵɵelement(22, "i", 15);
            i0.ɵɵtext(23, " Open File ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "input", 16, 17);
            i0.ɵɵlistener("change", function SutramExcelStudioComponent_Template_input_change_24_listener($event) { return ctx.onFileUpload($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "button", 18);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_26_listener() { return ctx.exportExcel(); });
            i0.ɵɵelement(27, "i", 19);
            i0.ɵɵtext(28, " Export ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "button", 20);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_29_listener() { return ctx.state.clearGrid(); });
            i0.ɵɵelement(30, "i", 21);
            i0.ɵɵtext(31, " Clear ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "button", 22);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_32_listener() { return ctx.startImport(); });
            i0.ɵɵelement(33, "i", 23);
            i0.ɵɵtext(34, " Sync to DB ");
            i0.ɵɵtemplate(35, SutramExcelStudioComponent_span_35_Template, 2, 1, "span", 24);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(36, "button", 25);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_36_listener() { return ctx.toggleTheme(); });
            i0.ɵɵelement(37, "i", 26);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(38, "div", 27)(39, "div", 28);
            i0.ɵɵtext(40);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(41, "span", 29);
            i0.ɵɵtext(42);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(43, "div", 30)(44, "button", 31);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_44_listener() { return ctx.isBoldActive = !ctx.isBoldActive; });
            i0.ɵɵtext(45, "B");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(46, "button", 32);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_46_listener() { return ctx.textAlign = "left"; });
            i0.ɵɵelement(47, "i", 33);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(48, "button", 34);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_48_listener() { return ctx.textAlign = "center"; });
            i0.ɵɵelement(49, "i", 35);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(50, "button", 36);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_50_listener() { return ctx.textAlign = "right"; });
            i0.ɵɵelement(51, "i", 37);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(52, "button", 38);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_52_listener($event) { i0.ɵɵrestoreView(_r37); const _r2 = i0.ɵɵreference(62); return i0.ɵɵresetView(_r2.toggle($event)); });
            i0.ɵɵelement(53, "i", 39);
            i0.ɵɵelementStart(54, "span");
            i0.ɵɵtext(55, "Columns");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(56, "span", 40);
            i0.ɵɵtext(57);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(58, "span", 41);
            i0.ɵɵtext(59, "fx");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(60, "input", 42);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_input_ngModelChange_60_listener($event) { return ctx.onFormulaChange($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(61, "p-overlayPanel", 43, 44);
            i0.ɵɵtemplate(63, SutramExcelStudioComponent_ng_template_63_Template, 4, 1, "ng-template", 45);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(64, "div", 46)(65, "div", 47)(66, "button", 48);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_66_listener() { return ctx.state.toggleFiltersEnabled(); });
            i0.ɵɵelement(67, "i", 49);
            i0.ɵɵelementStart(68, "span");
            i0.ɵɵtext(69, "Filters");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(70, "span", 50);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(71, "button", 51);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_71_listener() { return ctx.state.toggleSortingEnabled(); });
            i0.ɵɵelement(72, "i", 52);
            i0.ɵɵelementStart(73, "span");
            i0.ɵɵtext(74, "Sorting");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(75, "span", 50);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(76, SutramExcelStudioComponent_button_76_Template, 4, 1, "button", 53);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(77, "div", 54);
            i0.ɵɵelement(78, "i", 55);
            i0.ɵɵelementStart(79, "input", 56);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_input_ngModelChange_79_listener($event) { return ctx.onDbSearchInput($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(80, SutramExcelStudioComponent_button_80_Template, 2, 0, "button", 57);
            i0.ɵɵtemplate(81, SutramExcelStudioComponent_span_81_Template, 2, 0, "span", 58);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(82, "div", 59)(83, "div", 60);
            i0.ɵɵelement(84, "i", 13);
            i0.ɵɵelementStart(85, "span");
            i0.ɵɵtext(86);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(87, "div", 61)(88, "div", 62);
            i0.ɵɵelement(89, "i", 26);
            i0.ɵɵelementStart(90, "span");
            i0.ɵɵtext(91);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(92, SutramExcelStudioComponent_div_92_Template, 4, 1, "div", 63);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(93, "main", 64)(94, "sutram-grid", 65);
            i0.ɵɵlistener("loadMore", function SutramExcelStudioComponent_Template_sutram_grid_loadMore_94_listener() { return ctx.onLoadMore(); })("filterChanged", function SutramExcelStudioComponent_Template_sutram_grid_filterChanged_94_listener() { return ctx.onGridFilterChanged(); })("sortChanged", function SutramExcelStudioComponent_Template_sutram_grid_sortChanged_94_listener() { return ctx.onGridSortChanged(); })("solveAllTriggered", function SutramExcelStudioComponent_Template_sutram_grid_solveAllTriggered_94_listener($event) { return ctx.onGridSolveAll($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(95, "footer", 66)(96, "div", 67);
            i0.ɵɵtemplate(97, SutramExcelStudioComponent_div_97_Template, 5, 5, "div", 68);
            i0.ɵɵelementStart(98, "button", 69);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_98_listener() { return ctx.addNewBlankSheet(); });
            i0.ɵɵelement(99, "i", 70);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(100, "div", 71)(101, "div", 72)(102, "span");
            i0.ɵɵtext(103);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(104, "span");
            i0.ɵɵtext(105);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(106, SutramExcelStudioComponent_span_106_Template, 3, 1, "span", 73);
            i0.ɵɵtemplate(107, SutramExcelStudioComponent_span_107_Template, 2, 0, "span", 74);
            i0.ɵɵtemplate(108, SutramExcelStudioComponent_span_108_Template, 2, 1, "span", 75);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(109, "div", 72)(110, "span", 76);
            i0.ɵɵtext(111, "Enter next row | Tab next col | Right-click row for actions");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(112, "div", 77)(113, "button", 78);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_113_listener() { return ctx.zoomOut(); });
            i0.ɵɵelement(114, "i", 79);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(115, "span", 80);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_span_click_115_listener() { return ctx.resetZoom(); });
            i0.ɵɵtext(116);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(117, "button", 81);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_117_listener() { return ctx.zoomIn(); });
            i0.ɵɵelement(118, "i", 82);
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵtemplate(119, SutramExcelStudioComponent_div_119_Template, 15, 7, "div", 83);
            i0.ɵɵelementStart(120, "sutram-header-scanner", 84);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_sutram_header_scanner_visibleChange_120_listener($event) { return ctx.showScannerModal = $event; })("confirmed", function SutramExcelStudioComponent_Template_sutram_header_scanner_confirmed_120_listener($event) { return ctx.onScannerConfirmed($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(121, "sutram-correction-sidebar", 85);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_sutram_correction_sidebar_visibleChange_121_listener($event) { return ctx.showSidebar = $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(122, "sutram-import-progress", 86);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_sutram_import_progress_visibleChange_122_listener($event) { return ctx.showProgressModal = $event; })("cancelRequested", function SutramExcelStudioComponent_Template_sutram_import_progress_cancelRequested_122_listener() { return ctx.cancelImport(); });
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵclassProp("dark-mode", ctx.isDarkMode);
            i0.ɵɵadvance(11);
            i0.ɵɵclassProp("active-normal", ctx.mode === "normal");
            i0.ɵɵadvance(3);
            i0.ɵɵclassProp("active-smart", ctx.mode === "intelligent");
            i0.ɵɵadvance(18);
            i0.ɵɵproperty("disabled", ctx.state.pendingChangesCount() === 0 || ctx.state.hasErrors());
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngIf", ctx.state.pendingChangesCount() > 0);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngClass", ctx.isDarkMode ? "pi-sun" : "pi-moon");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.activeCoord);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.activeColChip);
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.isBoldActive);
            i0.ɵɵadvance(13);
            i0.ɵɵtextInterpolate(ctx.visibleHeadersCount);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngModel", ctx.formulaValue);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("dismissable", true);
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.state.filtersEnabled());
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.state.sortingEnabled());
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("ngIf", ctx.state.filtersEnabled() && ctx.state.activeFilterCount() > 0);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngModel", ctx.state.dbSearchQuery());
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.dbSearchQuery());
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.isLoadingDb());
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate2("", ctx.state.rows().length, " / ", ctx.state.totalDbRecords(), " Records");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngClass", ctx.statusStripClass);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngClass", ctx.statusStripIcon);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.statusStripMessage);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.unresolvedCorrectionsCount() > 0);
            i0.ɵɵadvance(1);
            i0.ɵɵstyleProp("zoom", ctx.zoomLevel);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("headers", ctx.visibleHeaders)("rows", ctx.state.rows())("filterOnlyErrors", ctx.state.filterOnlyErrors())("enableDelete", ctx.enableDelete);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngForOf", ctx.sheetTabs);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1("Sheet: ", ctx.activeSheetId, "");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("Rows: ", ctx.state.rows().length, "");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.deletedRowIds().length > 0);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.stats().errorRows === 0);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.stats().errorRows > 0);
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate1("", (ctx.zoomLevel * 100).toFixed(0), "%");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngIf", ctx.syncToast.visible);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("visible", ctx.showScannerModal)("report", ctx.scanReport)("availableHeaders", ctx.state.headers());
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("visible", ctx.showSidebar)("groups", ctx.state.correctionGroups());
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("visible", ctx.showProgressModal)("progress", ctx.state.importProgress())("tableName", ctx.selectedTableName)("rejectedRows", ctx.rejectedRowsDuringImport);
        } }, dependencies: [i6.NgClass, i6.NgForOf, i6.NgIf, i7.DefaultValueAccessor, i7.NgControlStatus, i7.NgModel, i8.PrimeTemplate, i9.OverlayPanel, i10.SutramGridComponent, i11.SutramHeaderScannerComponent, i12.SutramCorrectionSidebarComponent, i13.SutramImportProgressComponent], styles: ["\n\n\n\n\n\n\n\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n\n.sutram-excel-container[_ngcontent-%COMP%] {\n  --primary: #4f46e5;\n  --primary-hover: #4338ca;\n  --primary-soft: #e0e7ff;\n  --success: #10b981;\n  --success-soft: #d1fae5;\n  --warning: #f59e0b;\n  --warning-soft: #fef3c7;\n  --danger: #ef4444;\n  --danger-soft: #fee2e2;\n  --bg: #f8fafc;\n  --surface: #ffffff;\n  --surface-border: #e2e8f0;\n  --text: #0f172a;\n  --text-muted: #64748b;\n  --radius: 6px;\n  --header-bg: #f1f5f9;\n  --header-text: #1e293b;\n  --cell-border: rgba(125, 125, 125, 0.18);\n  --cell-height: 23px;\n  --header-height: 38px;\n  --cell-edited-bg: #fef9c3;\n  --cell-edited-border: #eab308;\n  --row-edited-bg: #fffbeb;\n  --row-new-bg: #dcfce7;\n  --row-new-border: #22c55e;\n\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n  background-color: var(--bg);\n  color: var(--text);\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  user-select: none;\n\n  &.dark-mode {\n    --bg: #0f172a;\n    --surface: #1e293b;\n    --surface-border: #334155;\n    --text: #f8fafc;\n    --text-muted: #94a3b8;\n    --header-bg: #1e293b;\n    --header-text: #cbd5e1;\n    --cell-border: rgba(255, 255, 255, 0.1);\n    --cell-edited-bg: rgba(234, 179, 8, 0.22);\n    --cell-edited-border: #facc15;\n    --row-edited-bg: rgba(234, 179, 8, 0.12);\n    --row-new-bg: rgba(34, 197, 94, 0.18);\n    --row-new-border: #4ade80;\n  }\n}\n\n\n\n.command-bar[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 6px 14px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  gap: 10px;\n}\n.brand[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.brand-icon[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 15px;\n}\n.brand-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.mode-pill-toggle[_ngcontent-%COMP%] {\n  background: rgba(125, 125, 125, 0.12);\n  border-radius: 999px;\n  padding: 2px;\n  display: flex;\n  gap: 2px;\n}\n.mode-pill-btn[_ngcontent-%COMP%] {\n  padding: 3px 12px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n}\n.mode-pill-btn.active-normal[_ngcontent-%COMP%] {\n  background: #3b82f6;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.4);\n}\n.mode-pill-btn.active-smart[_ngcontent-%COMP%] {\n  background: #10b981;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.4);\n}\n\n.btn-group-cmd[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.cmd-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 10px;\n  border-radius: var(--radius);\n  font-size: 11px;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  transition: all 0.15s;\n}\n.cmd-btn[_ngcontent-%COMP%]:hover { background: rgba(125, 125, 125, 0.1); }\n.cmd-btn.active[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.cmd-btn-primary[_ngcontent-%COMP%] { background: var(--primary); color: white; border-color: var(--primary); }\n.cmd-btn-primary[_ngcontent-%COMP%]:hover { background: var(--primary-hover); }\n.cmd-btn-success[_ngcontent-%COMP%] { background: var(--success); color: white; border-color: var(--success); }\n.cmd-btn-success[_ngcontent-%COMP%]:hover { background: #059669; }\n.cmd-btn-warning[_ngcontent-%COMP%] { background: var(--warning-soft); color: #b45309; border-color: rgba(245, 158, 11, 0.3); }\n\n.sync-badge-count[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: #f59e0b;\n  color: #ffffff;\n  font-size: 10px;\n  font-weight: 700;\n  padding: 1px 6px;\n  border-radius: 999px;\n  margin-left: 5px;\n  line-height: 1.2;\n}\n\n\n\n.formula-bar-row[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 4px 14px;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-shrink: 0;\n}\n.coord-box[_ngcontent-%COMP%] {\n  width: 55px;\n  text-align: center;\n  font-weight: 700;\n  font-size: 11.5px;\n  padding: 2px 4px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  background: rgba(125, 125, 125, 0.05);\n}\n.active-col-chip[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n  padding: 2px 8px;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  white-space: nowrap;\n  max-width: 180px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.formula-input[_ngcontent-%COMP%] {\n  flex-grow: 1;\n  padding: 3px 8px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 12px;\n  font-family: inherit;\n  outline: none;\n  background: var(--surface);\n  color: var(--text);\n}\n.formula-input[_ngcontent-%COMP%]:focus { border-color: var(--primary); }\n\n\n\n.control-settings-bar[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 4px 14px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  flex-shrink: 0;\n  font-size: 11.5px;\n}\n.ctrl-bar-left[_ngcontent-%COMP%], .ctrl-bar-right[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.ctrl-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 3px 10px;\n  border-radius: var(--radius);\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text-muted);\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n}\n.ctrl-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text);\n}\n.ctrl-btn.active[_ngcontent-%COMP%] {\n  color: var(--primary);\n  background: var(--primary-soft);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.ctrl-btn-danger[_ngcontent-%COMP%] {\n  color: var(--danger);\n  background: var(--danger-soft);\n  border-color: rgba(239, 68, 68, 0.3);\n}\n.ctrl-btn-danger[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.2);\n}\n.ctrl-dot[_ngcontent-%COMP%] {\n  width: 5px;\n  height: 5px;\n  border-radius: 50%;\n  background: #10b981;\n  display: inline-block;\n}\n.ctrl-search-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  flex-grow: 1;\n  max-width: 460px;\n}\n.ctrl-search-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 10px;\n  color: var(--text-muted);\n  font-size: 11px;\n  pointer-events: none;\n}\n.ctrl-search-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 4px 28px 4px 28px;\n  border: 1px solid var(--surface-border);\n  border-radius: 999px;\n  font-size: 11.5px;\n  background: rgba(125, 125, 125, 0.05);\n  color: var(--text);\n  outline: none;\n  transition: all 0.15s;\n}\n.ctrl-search-input[_ngcontent-%COMP%]:focus {\n  border-color: var(--primary);\n  background: var(--surface);\n  box-shadow: 0 0 0 2px var(--primary-soft);\n}\n.ctrl-search-clear[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 8px;\n  background: none;\n  border: none;\n  font-size: 11px;\n  color: var(--text-muted);\n  cursor: pointer;\n  padding: 2px 5px;\n  border-radius: 50%;\n}\n.ctrl-search-clear[_ngcontent-%COMP%]:hover {\n  color: var(--danger);\n  background: rgba(125, 125, 125, 0.15);\n}\n.ctrl-search-spinner[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 28px;\n  color: var(--primary);\n  font-size: 11px;\n}\n.ctrl-record-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 2px 9px;\n  border-radius: 999px;\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text-muted);\n  font-size: 10.5px;\n  font-weight: 600;\n  white-space: nowrap;\n}\n\n\n\n.status-strip[_ngcontent-%COMP%] {\n  padding: 3px 14px;\n  font-size: 11.5px;\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  background: rgba(125, 125, 125, 0.04);\n}\n.status-strip.strip-error[_ngcontent-%COMP%] { background: #fef2f2; color: #991b1b; }\n.status-strip.strip-clean[_ngcontent-%COMP%] { background: #f0fdf4; color: #166534; }\n.status-strip.strip-suggestion[_ngcontent-%COMP%] { background: #fffbeb; color: #92400e; }\n\n\n\n.spreadsheet-canvas[_ngcontent-%COMP%] {\n  flex-grow: 1;\n  overflow: auto;\n  background: var(--surface);\n  position: relative;\n  min-height: 0;\n}\n\n\n\n.studio-footer[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  background: var(--surface);\n  border-top: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n}\n.sheet-tabs-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  background: rgba(125, 125, 125, 0.05);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 2px 6px;\n  overflow-x: auto;\n  scrollbar-width: none;\n}\n.sheet-tabs-bar[_ngcontent-%COMP%]::-webkit-scrollbar { display: none; }\n\n.tab-pill[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 12px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11.5px;\n  font-weight: 600;\n  cursor: pointer;\n  color: var(--text-muted);\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  white-space: nowrap;\n  transition: all 0.15s;\n}\n.tab-pill[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.1);\n  color: var(--text);\n}\n.tab-pill.active-tab[_ngcontent-%COMP%] {\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-color: rgba(16, 185, 129, 0.25);\n  border-bottom: 2px solid #10b981;\n  font-weight: 700;\n}\n\n.sheet-tab-badge[_ngcontent-%COMP%] {\n  font-size: 9.5px;\n  padding: 1px 5px;\n  background: rgba(16, 185, 129, 0.2);\n  color: #059669;\n  border-radius: 999px;\n  font-weight: 700;\n}\n\n.add-tab-btn[_ngcontent-%COMP%] {\n  padding: 2px 8px;\n  border: 1px dashed rgba(125, 125, 125, 0.4);\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  color: var(--primary);\n  margin-left: 4px;\n}\n.add-tab-btn[_ngcontent-%COMP%]:hover { background: rgba(79, 70, 229, 0.1); }\n\n.bottom-status-subrow[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 3px 14px;\n  font-size: 11px;\n  color: var(--text-muted);\n}\n.zoom-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  padding: 1px 4px;\n}\n.zoom-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  color: var(--text);\n  padding: 1px 5px;\n  font-size: 11px;\n}\n.zoom-display[_ngcontent-%COMP%] {\n  font-weight: 700;\n  cursor: pointer;\n  padding: 0 4px;\n}\n\n\n\n.sync-toast-hud[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 50px;\n  right: 20px;\n  z-index: 2500;\n  min-width: 320px;\n  max-width: 440px;\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);\n  overflow: hidden;\n  animation: _ngcontent-%COMP%_toastSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);\n  font-size: 11.5px;\n}\n@keyframes _ngcontent-%COMP%_toastSlideIn {\n  from { opacity: 0; transform: translateY(-12px) scale(0.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n.sync-toast-header[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--surface-border);\n  background: rgba(125, 125, 125, 0.04);\n}\n.sync-toast-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-weight: 700;\n  font-size: 12px;\n}\n.sync-toast-close[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: var(--text-muted);\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 5px;\n  border-radius: 3px;\n}\n.sync-toast-close[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.12);\n  color: var(--text);\n}\n.sync-toast-body[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.sync-toast-stats[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.sync-badge-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n}\n.chip-success[_ngcontent-%COMP%] {\n  background: var(--success-soft);\n  color: var(--success);\n}\n.chip-info[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n}\n.chip-warning[_ngcontent-%COMP%] {\n  background: var(--warning-soft);\n  color: #b45309;\n}\n.chip-danger[_ngcontent-%COMP%] {\n  background: var(--danger-soft);\n  color: var(--danger);\n}\n.sync-toast-errors[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  padding: 6px 8px;\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.2);\n  border-radius: 4px;\n  font-size: 10.5px;\n  color: #ef4444;\n  max-height: 140px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramExcelStudioComponent, [{
        type: Component,
        args: [{ selector: 'sutram-excel-studio', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-excel-studio.component.html -->\n<div class=\"sutram-excel-container\" [class.dark-mode]=\"isDarkMode\">\n\n  <!-- 1. TOP COMMAND BAR -->\n  <header class=\"command-bar\">\n    <div class=\"brand\">\n      <div class=\"brand-icon\"><i class=\"pi pi-table\"></i></div>\n      <div class=\"brand-title\">\n        <span>Sutram Excel Studio</span>\n        <span style=\"font-size: 9px; padding: 1px 4px; background: rgba(16, 185, 129, 0.2); color: #059669; border-radius: 4px;\">v2.0</span>\n      </div>\n    </div>\n\n    <!-- Center Mode Switcher -->\n    <div class=\"mode-pill-toggle\">\n      <button class=\"mode-pill-btn\" [class.active-normal]=\"mode === 'normal'\" (click)=\"setStudioMode('normal')\">\n        <i class=\"pi pi-pencil\"></i> Normal\n      </button>\n      <button class=\"mode-pill-btn\" [class.active-smart]=\"mode === 'intelligent'\" (click)=\"setStudioMode('intelligent')\">\n        <i class=\"pi pi-bolt\"></i> Smart (Intelligent)\n      </button>\n    </div>\n\n    <!-- Right Actions -->\n    <div class=\"btn-group-cmd\">\n      <button class=\"cmd-btn cmd-btn-success\" (click)=\"loadTableDataFromDb()\" title=\"\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0938\u0947 \u0907\u0938 \u091F\u0947\u092C\u0932 \u0915\u093E \u0932\u093E\u0907\u0935 \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0915\u0930\u0947\u0902\">\n        <i class=\"pi pi-database\"></i> Load Data\n      </button>\n\n      <button class=\"cmd-btn\" (click)=\"fileInput.click()\" title=\"\u092C\u093E\u0939\u0930\u0940 Excel (.xlsx) \u0916\u094B\u0932\u0947\u0902\">\n        <i class=\"pi pi-folder-open\"></i> Open File\n      </button>\n      <input #fileInput type=\"file\" accept=\".xlsx, .xls, .csv\" style=\"display:none;\" (change)=\"onFileUpload($event)\">\n\n      <button class=\"cmd-btn\" (click)=\"exportExcel()\" title=\"Excel \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902\">\n        <i class=\"pi pi-download\"></i> Export\n      </button>\n\n      <button class=\"cmd-btn\" (click)=\"state.clearGrid()\" title=\"\u0936\u0940\u091F \u0916\u093E\u0932\u0940 \u0915\u0930\u0947\u0902\">\n        <i class=\"pi pi-trash\"></i> Clear\n      </button>\n\n      <button class=\"cmd-btn cmd-btn-primary\" [disabled]=\"state.pendingChangesCount() === 0 || state.hasErrors()\" (click)=\"startImport()\" title=\"\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0938\u0947\u0935/\u0907\u092E\u094D\u092A\u094B\u0930\u094D\u091F \u0915\u0930\u0947\u0902\">\n        <i class=\"pi pi-cloud-upload\"></i> Sync to DB\n        <span *ngIf=\"state.pendingChangesCount() > 0\" class=\"sync-badge-count\">{{ state.pendingChangesCount() }}</span>\n      </button>\n\n      <button class=\"cmd-btn\" style=\"padding: 4px 6px;\" (click)=\"toggleTheme()\" title=\"\u0932\u093E\u0907\u091F / \u0921\u093E\u0930\u094D\u0915 \u092E\u094B\u0921\">\n        <i class=\"pi\" [ngClass]=\"isDarkMode ? 'pi-sun' : 'pi-moon'\"></i>\n      </button>\n    </div>\n  </header>\n\n  <!-- 2. FORMULA BAR ROW -->\n  <div class=\"formula-bar-row\">\n    <div class=\"coord-box\">{{ activeCoord }}</div>\n    <span class=\"active-col-chip\">{{ activeColChip }}</span>\n\n    <!-- Quick Writing Tools -->\n    <div style=\"display: flex; gap: 2px;\">\n      <button class=\"cmd-btn\" [class.active]=\"isBoldActive\" style=\"padding: 2px 7px; font-weight: 700;\" (click)=\"isBoldActive = !isBoldActive\" title=\"Bold (Ctrl+B)\">B</button>\n      <button class=\"cmd-btn\" style=\"padding: 2px 6px;\" (click)=\"textAlign = 'left'\" title=\"Align Left\"><i class=\"pi pi-align-left\"></i></button>\n      <button class=\"cmd-btn\" style=\"padding: 2px 6px;\" (click)=\"textAlign = 'center'\" title=\"Align Center\"><i class=\"pi pi-align-center\"></i></button>\n      <button class=\"cmd-btn\" style=\"padding: 2px 6px;\" (click)=\"textAlign = 'right'\" title=\"Align Right\"><i class=\"pi pi-align-right\"></i></button>\n    </div>\n\n    <!-- Column Config Button -->\n    <button class=\"cmd-btn\" (click)=\"colConfigOp.toggle($event)\" title=\"Choose Visible Columns (\u0915\u0949\u0932\u092E \u091A\u0941\u0928\u0947\u0902)\" style=\"gap: 5px;\">\n      <i class=\"pi pi-sliders-h\" style=\"color: var(--primary);\"></i>\n      <span>Columns</span>\n      <span style=\"font-size: 10px; padding: 1px 5px; background: var(--primary-soft); color: var(--primary); border-radius: 999px; font-weight: 700;\">{{ visibleHeadersCount }}</span>\n    </button>\n\n    <span style=\"font-weight: 700; font-style: italic; color: var(--text-muted); margin: 0 4px;\">fx</span>\n    <input type=\"text\"\n           class=\"formula-input\"\n           [ngModel]=\"formulaValue\"\n           (ngModelChange)=\"onFormulaChange($event)\"\n           placeholder=\"Select a cell or type value here...\">\n  </div>\n\n  <!-- Column Config Popover -->\n  <p-overlayPanel #colConfigOp [dismissable]=\"true\" styleClass=\"p-2 shadow-lg\">\n    <ng-template pTemplate=\"content\">\n      <div style=\"min-width: 200px; max-height: 260px; overflow-y: auto;\">\n        <div class=\"fw-bold small mb-2 text-muted\">Visible Columns</div>\n        <div *ngFor=\"let h of state.headers()\" class=\"d-flex align-items-center gap-2 py-1\">\n          <input type=\"checkbox\"\n                 [id]=\"'col_vis_' + h.name\"\n                 [checked]=\"!hiddenColumnKeys.has(h.name)\"\n                 (change)=\"toggleColumnVisibility(h.name)\" />\n          <label [for]=\"'col_vis_' + h.name\" class=\"small mb-0 cursor-pointer\">{{ h.name }}</label>\n        </div>\n      </div>\n    </ng-template>\n  </p-overlayPanel>\n\n  <!-- 3. CONTROL SETTINGS BAR (Filters, Sorting, Live DB Search, Record Counter) -->\n  <div class=\"control-settings-bar\">\n    <div class=\"ctrl-bar-left\">\n      <button class=\"ctrl-btn\" [class.active]=\"state.filtersEnabled()\" (click)=\"state.toggleFiltersEnabled()\" title=\"\u0915\u0949\u0932\u092E \u092B\u093C\u093F\u0932\u094D\u091F\u0930 \u0911\u0928 / \u0911\u092B\u093C \u0915\u0930\u0947\u0902\">\n        <i class=\"pi pi-filter\"></i>\n        <span>Filters</span>\n        <span class=\"ctrl-dot\"></span>\n      </button>\n\n      <button class=\"ctrl-btn\" [class.active]=\"state.sortingEnabled()\" (click)=\"state.toggleSortingEnabled()\" title=\"\u0938\u0949\u0930\u094D\u091F\u093F\u0902\u0917 \u0911\u0928 / \u0911\u092B\u093C \u0915\u0930\u0947\u0902\">\n        <i class=\"pi pi-sort-alt\"></i>\n        <span>Sorting</span>\n        <span class=\"ctrl-dot\"></span>\n      </button>\n\n      <button *ngIf=\"state.filtersEnabled() && state.activeFilterCount() > 0\" class=\"ctrl-btn ctrl-btn-danger\" (click)=\"clearAllFilters()\" title=\"\u0938\u092D\u0940 \u092B\u093C\u093F\u0932\u094D\u091F\u0930 \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902\">\n        <i class=\"pi pi-filter-slash\"></i>\n        <span>Clear Filters ({{ state.activeFilterCount() }})</span>\n      </button>\n    </div>\n\n    <!-- Center: Direct Database Live Search Box -->\n    <div class=\"ctrl-search-wrap\">\n      <i class=\"pi pi-search ctrl-search-icon\"></i>\n      <input type=\"text\"\n             class=\"ctrl-search-input\"\n             placeholder=\"\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0938\u0940\u0927\u093E \u0916\u094B\u091C\u0947\u0902 (Direct DB Search)...\"\n             [ngModel]=\"state.dbSearchQuery()\"\n             (ngModelChange)=\"onDbSearchInput($event)\"\n             autocomplete=\"off\">\n      <button *ngIf=\"state.dbSearchQuery()\" class=\"ctrl-search-clear\" style=\"display: block;\" (click)=\"clearDbSearch()\" title=\"\u0916\u094B\u091C \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902\">\u2715</button>\n      <span *ngIf=\"state.isLoadingDb()\" class=\"ctrl-search-spinner\"><i class=\"pi pi-spin pi-spinner\"></i></span>\n    </div>\n\n    <div class=\"ctrl-bar-right\">\n      <div class=\"ctrl-record-badge\" title=\"\u0915\u0941\u0932 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0930\u093F\u0915\u0949\u0930\u094D\u0921\u094D\u0938 \u090F\u0935\u0902 \u0932\u094B\u0921 \u0938\u094D\u0925\u093F\u0924\u093F\">\n        <i class=\"pi pi-database\"></i>\n        <span>{{ state.rows().length }} / {{ state.totalDbRecords() }} Records</span>\n      </div>\n    </div>\n  </div>\n\n  <!-- 4. STATUS & BATCH FIX SUGGESTION STRIP -->\n  <div class=\"status-strip\" [ngClass]=\"statusStripClass\">\n    <div style=\"display: flex; align-items: center; gap: 6px;\">\n      <i class=\"pi\" [ngClass]=\"statusStripIcon\"></i>\n      <span>{{ statusStripMessage }}</span>\n    </div>\n    <div *ngIf=\"state.unresolvedCorrectionsCount() > 0\">\n      <button class=\"cmd-btn cmd-btn-warning\" style=\"padding: 2px 8px;\" (click)=\"showSidebar = true\">\n        <i class=\"pi pi-bolt\"></i> \u0917\u0932\u0924\u093F\u092F\u093E\u0901 ({{ state.unresolvedCorrectionsCount() }})\n      </button>\n    </div>\n  </div>\n\n  <!-- 5. SPREADSHEET CANVAS -->\n  <main class=\"spreadsheet-canvas flex-grow-1 overflow-auto\" [style.zoom]=\"zoomLevel\">\n    <sutram-grid [headers]=\"visibleHeaders\"\n                 [rows]=\"state.rows()\"\n                 [filterOnlyErrors]=\"state.filterOnlyErrors()\"\n                 [enableDelete]=\"enableDelete\"\n                 (loadMore)=\"onLoadMore()\"\n                 (filterChanged)=\"onGridFilterChanged()\"\n                 (sortChanged)=\"onGridSortChanged()\"\n                 (solveAllTriggered)=\"onGridSolveAll($event)\">\n    </sutram-grid>\n  </main>\n\n  <!-- 6. BOTTOM MULTI-SHEET TAB BAR & STATUS BAR -->\n  <footer class=\"studio-footer\">\n    <!-- Sub-row A: Sheet Tabs Strip -->\n    <div class=\"sheet-tabs-bar\">\n      <div *ngFor=\"let tab of sheetTabs\"\n           class=\"tab-pill\"\n           [class.active-tab]=\"activeSheetId === tab.id\"\n           (click)=\"switchSheet(tab.id)\">\n        <i class=\"pi\" [ngClass]=\"tab.icon\" style=\"font-size: 11px;\"></i>\n        <span>{{ tab.title }}</span>\n        <span *ngIf=\"tab.isLoaded && (tab.recordCount || 0) > 0\" class=\"sheet-tab-badge\">\n          {{ tab.recordCount }}\n        </span>\n      </div>\n\n      <button class=\"add-tab-btn\" (click)=\"addNewBlankSheet()\" title=\"Add Blank Sheet\">\n        <i class=\"pi pi-plus\" style=\"font-size: 10px;\"></i>\n      </button>\n    </div>\n\n    <!-- Sub-row B: Status Bar with Scale / Zoom Controls -->\n    <div class=\"bottom-status-subrow\">\n      <div style=\"display: flex; align-items: center; gap: 10px;\">\n        <span>Sheet: {{ activeSheetId }}</span>\n        <span>Rows: {{ state.rows().length }}</span>\n        <span *ngIf=\"state.deletedRowIds().length > 0\" class=\"badge bg-soft-warning text-warning small fw-semibold\">\n          <i class=\"pi pi-trash me-1\"></i>{{ state.deletedRowIds().length }} Deleted\n        </span>\n        <span *ngIf=\"state.stats().errorRows === 0\" style=\"color: #10b981; font-weight: 600;\">\u2713 100% In Sync</span>\n        <span *ngIf=\"state.stats().errorRows > 0\" style=\"color: #ef4444; font-weight: 600;\">{{ state.stats().errorRows }} \u0924\u094D\u0930\u0941\u091F\u093F\u092F\u093E\u0901</span>\n      </div>\n\n      <div style=\"display: flex; align-items: center; gap: 10px;\">\n        <span style=\"font-size: 10.5px; opacity: 0.8;\">Enter next row | Tab next col | Right-click row for actions</span>\n\n        <!-- Scale / Zoom Controls -->\n        <div class=\"zoom-controls\">\n          <button class=\"zoom-btn\" (click)=\"zoomOut()\" title=\"Zoom Out (-10%)\"><i class=\"pi pi-minus\"></i></button>\n          <span class=\"zoom-display\" (click)=\"resetZoom()\" title=\"Reset to 100%\">{{ (zoomLevel * 100).toFixed(0) }}%</span>\n          <button class=\"zoom-btn\" (click)=\"zoomIn()\" title=\"Zoom In (+10%)\"><i class=\"pi pi-plus\"></i></button>\n        </div>\n      </div>\n    </div>\n  </footer>\n\n  <!-- 7. Floating Sync Toast HUD -->\n  <div *ngIf=\"syncToast.visible\" class=\"sync-toast-hud\">\n    <div class=\"sync-toast-header\">\n      <div class=\"sync-toast-title\">\n        <i class=\"pi\" [ngClass]=\"syncToast.hasError ? 'pi-exclamation-circle text-warning' : 'pi-check-circle text-success'\"></i>\n        <span>{{ syncToast.title }}</span>\n      </div>\n      <button class=\"sync-toast-close\" (click)=\"syncToast.visible = false\">\u2715</button>\n    </div>\n    <div class=\"sync-toast-body\">\n      <div class=\"sync-toast-stats\">\n        <span *ngIf=\"syncToast.inserted > 0\" class=\"sync-badge-chip chip-success\">\n          <i class=\"pi pi-plus\"></i> {{ syncToast.inserted }} Inserted\n        </span>\n        <span *ngIf=\"syncToast.updated > 0\" class=\"sync-badge-chip chip-info\">\n          <i class=\"pi pi-refresh\"></i> {{ syncToast.updated }} Updated\n        </span>\n        <span *ngIf=\"syncToast.deleted > 0\" class=\"sync-badge-chip chip-warning\">\n          <i class=\"pi pi-trash\"></i> {{ syncToast.deleted }} Deleted\n        </span>\n        <span *ngIf=\"syncToast.failed > 0\" class=\"sync-badge-chip chip-danger\">\n          <i class=\"pi pi-times\"></i> {{ syncToast.failed }} Failed\n        </span>\n      </div>\n      <div *ngIf=\"syncToast.errors.length > 0\" class=\"sync-toast-errors\">\n        <div *ngFor=\"let err of syncToast.errors\">\u2022 {{ err }}</div>\n      </div>\n    </div>\n  </div>\n\n  <!-- Smart Header Scanner Modal -->\n  <sutram-header-scanner [(visible)]=\"showScannerModal\"\n                         [report]=\"scanReport\"\n                         [availableHeaders]=\"state.headers()\"\n                         (confirmed)=\"onScannerConfirmed($event)\">\n  </sutram-header-scanner>\n\n  <!-- Batch Correction Sidebar -->\n  <sutram-correction-sidebar [(visible)]=\"showSidebar\"\n                             [groups]=\"state.correctionGroups()\">\n  </sutram-correction-sidebar>\n\n  <!-- Streaming Import Progress Modal -->\n  <sutram-import-progress [(visible)]=\"showProgressModal\"\n                          [progress]=\"state.importProgress()\"\n                          [tableName]=\"selectedTableName\"\n                          [rejectedRows]=\"rejectedRowsDuringImport\"\n                          (cancelRequested)=\"cancelImport()\">\n  </sutram-import-progress>\n\n</div>\n", styles: ["/**\n * sutram-excel-studio.component.scss\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n * Pixel-Perfect Enterprise Excel Studio Styling.\n * Exact replication of Sutram Excel Studio v2.0 UI.\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n */\n\n:host {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n\n.sutram-excel-container {\n  --primary: #4f46e5;\n  --primary-hover: #4338ca;\n  --primary-soft: #e0e7ff;\n  --success: #10b981;\n  --success-soft: #d1fae5;\n  --warning: #f59e0b;\n  --warning-soft: #fef3c7;\n  --danger: #ef4444;\n  --danger-soft: #fee2e2;\n  --bg: #f8fafc;\n  --surface: #ffffff;\n  --surface-border: #e2e8f0;\n  --text: #0f172a;\n  --text-muted: #64748b;\n  --radius: 6px;\n  --header-bg: #f1f5f9;\n  --header-text: #1e293b;\n  --cell-border: rgba(125, 125, 125, 0.18);\n  --cell-height: 23px;\n  --header-height: 38px;\n  --cell-edited-bg: #fef9c3;\n  --cell-edited-border: #eab308;\n  --row-edited-bg: #fffbeb;\n  --row-new-bg: #dcfce7;\n  --row-new-border: #22c55e;\n\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n  background-color: var(--bg);\n  color: var(--text);\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  user-select: none;\n\n  &.dark-mode {\n    --bg: #0f172a;\n    --surface: #1e293b;\n    --surface-border: #334155;\n    --text: #f8fafc;\n    --text-muted: #94a3b8;\n    --header-bg: #1e293b;\n    --header-text: #cbd5e1;\n    --cell-border: rgba(255, 255, 255, 0.1);\n    --cell-edited-bg: rgba(234, 179, 8, 0.22);\n    --cell-edited-border: #facc15;\n    --row-edited-bg: rgba(234, 179, 8, 0.12);\n    --row-new-bg: rgba(34, 197, 94, 0.18);\n    --row-new-border: #4ade80;\n  }\n}\n\n/* 1. TOP COMMAND BAR */\n.command-bar {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 6px 14px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  gap: 10px;\n}\n.brand {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.brand-icon {\n  width: 28px;\n  height: 28px;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 15px;\n}\n.brand-title {\n  font-size: 13px;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.mode-pill-toggle {\n  background: rgba(125, 125, 125, 0.12);\n  border-radius: 999px;\n  padding: 2px;\n  display: flex;\n  gap: 2px;\n}\n.mode-pill-btn {\n  padding: 3px 12px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n}\n.mode-pill-btn.active-normal {\n  background: #3b82f6;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.4);\n}\n.mode-pill-btn.active-smart {\n  background: #10b981;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.4);\n}\n\n.btn-group-cmd {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.cmd-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 10px;\n  border-radius: var(--radius);\n  font-size: 11px;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  transition: all 0.15s;\n}\n.cmd-btn:hover { background: rgba(125, 125, 125, 0.1); }\n.cmd-btn.active {\n  background: var(--primary-soft);\n  color: var(--primary);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.cmd-btn-primary { background: var(--primary); color: white; border-color: var(--primary); }\n.cmd-btn-primary:hover { background: var(--primary-hover); }\n.cmd-btn-success { background: var(--success); color: white; border-color: var(--success); }\n.cmd-btn-success:hover { background: #059669; }\n.cmd-btn-warning { background: var(--warning-soft); color: #b45309; border-color: rgba(245, 158, 11, 0.3); }\n\n.sync-badge-count {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: #f59e0b;\n  color: #ffffff;\n  font-size: 10px;\n  font-weight: 700;\n  padding: 1px 6px;\n  border-radius: 999px;\n  margin-left: 5px;\n  line-height: 1.2;\n}\n\n/* 2. FORMULA BAR ROW */\n.formula-bar-row {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 4px 14px;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-shrink: 0;\n}\n.coord-box {\n  width: 55px;\n  text-align: center;\n  font-weight: 700;\n  font-size: 11.5px;\n  padding: 2px 4px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  background: rgba(125, 125, 125, 0.05);\n}\n.active-col-chip {\n  background: var(--primary-soft);\n  color: var(--primary);\n  padding: 2px 8px;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  white-space: nowrap;\n  max-width: 180px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.formula-input {\n  flex-grow: 1;\n  padding: 3px 8px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 12px;\n  font-family: inherit;\n  outline: none;\n  background: var(--surface);\n  color: var(--text);\n}\n.formula-input:focus { border-color: var(--primary); }\n\n/* 3. CONTROL SETTINGS BAR & DIRECT DB SEARCH */\n.control-settings-bar {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 4px 14px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 10px;\n  flex-shrink: 0;\n  font-size: 11.5px;\n}\n.ctrl-bar-left, .ctrl-bar-right {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.ctrl-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 3px 10px;\n  border-radius: var(--radius);\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text-muted);\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n}\n.ctrl-btn:hover {\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text);\n}\n.ctrl-btn.active {\n  color: var(--primary);\n  background: var(--primary-soft);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.ctrl-btn-danger {\n  color: var(--danger);\n  background: var(--danger-soft);\n  border-color: rgba(239, 68, 68, 0.3);\n}\n.ctrl-btn-danger:hover {\n  background: rgba(239, 68, 68, 0.2);\n}\n.ctrl-dot {\n  width: 5px;\n  height: 5px;\n  border-radius: 50%;\n  background: #10b981;\n  display: inline-block;\n}\n.ctrl-search-wrap {\n  position: relative;\n  display: flex;\n  align-items: center;\n  flex-grow: 1;\n  max-width: 460px;\n}\n.ctrl-search-icon {\n  position: absolute;\n  left: 10px;\n  color: var(--text-muted);\n  font-size: 11px;\n  pointer-events: none;\n}\n.ctrl-search-input {\n  width: 100%;\n  padding: 4px 28px 4px 28px;\n  border: 1px solid var(--surface-border);\n  border-radius: 999px;\n  font-size: 11.5px;\n  background: rgba(125, 125, 125, 0.05);\n  color: var(--text);\n  outline: none;\n  transition: all 0.15s;\n}\n.ctrl-search-input:focus {\n  border-color: var(--primary);\n  background: var(--surface);\n  box-shadow: 0 0 0 2px var(--primary-soft);\n}\n.ctrl-search-clear {\n  position: absolute;\n  right: 8px;\n  background: none;\n  border: none;\n  font-size: 11px;\n  color: var(--text-muted);\n  cursor: pointer;\n  padding: 2px 5px;\n  border-radius: 50%;\n}\n.ctrl-search-clear:hover {\n  color: var(--danger);\n  background: rgba(125, 125, 125, 0.15);\n}\n.ctrl-search-spinner {\n  position: absolute;\n  right: 28px;\n  color: var(--primary);\n  font-size: 11px;\n}\n.ctrl-record-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 2px 9px;\n  border-radius: 999px;\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text-muted);\n  font-size: 10.5px;\n  font-weight: 600;\n  white-space: nowrap;\n}\n\n/* 4. STATUS & BATCH SUGGESTION STRIP */\n.status-strip {\n  padding: 3px 14px;\n  font-size: 11.5px;\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  background: rgba(125, 125, 125, 0.04);\n}\n.status-strip.strip-error { background: #fef2f2; color: #991b1b; }\n.status-strip.strip-clean { background: #f0fdf4; color: #166534; }\n.status-strip.strip-suggestion { background: #fffbeb; color: #92400e; }\n\n/* 5. SPREADSHEET CANVAS */\n.spreadsheet-canvas {\n  flex-grow: 1;\n  overflow: auto;\n  background: var(--surface);\n  position: relative;\n  min-height: 0;\n}\n\n/* 6. BOTTOM MULTI-SHEET TAB BAR & STATUS BAR */\n.studio-footer {\n  flex-shrink: 0;\n  background: var(--surface);\n  border-top: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n}\n.sheet-tabs-bar {\n  display: flex;\n  align-items: center;\n  background: rgba(125, 125, 125, 0.05);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 2px 6px;\n  overflow-x: auto;\n  scrollbar-width: none;\n}\n.sheet-tabs-bar::-webkit-scrollbar { display: none; }\n\n.tab-pill {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 12px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11.5px;\n  font-weight: 600;\n  cursor: pointer;\n  color: var(--text-muted);\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  white-space: nowrap;\n  transition: all 0.15s;\n}\n.tab-pill:hover {\n  background: rgba(125, 125, 125, 0.1);\n  color: var(--text);\n}\n.tab-pill.active-tab {\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-color: rgba(16, 185, 129, 0.25);\n  border-bottom: 2px solid #10b981;\n  font-weight: 700;\n}\n\n.sheet-tab-badge {\n  font-size: 9.5px;\n  padding: 1px 5px;\n  background: rgba(16, 185, 129, 0.2);\n  color: #059669;\n  border-radius: 999px;\n  font-weight: 700;\n}\n\n.add-tab-btn {\n  padding: 2px 8px;\n  border: 1px dashed rgba(125, 125, 125, 0.4);\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  color: var(--primary);\n  margin-left: 4px;\n}\n.add-tab-btn:hover { background: rgba(79, 70, 229, 0.1); }\n\n.bottom-status-subrow {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 3px 14px;\n  font-size: 11px;\n  color: var(--text-muted);\n}\n.zoom-controls {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  padding: 1px 4px;\n}\n.zoom-btn {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  color: var(--text);\n  padding: 1px 5px;\n  font-size: 11px;\n}\n.zoom-display {\n  font-weight: 700;\n  cursor: pointer;\n  padding: 0 4px;\n}\n\n/* 7. FLOATING SYNC TOAST HUD */\n.sync-toast-hud {\n  position: fixed;\n  top: 50px;\n  right: 20px;\n  z-index: 2500;\n  min-width: 320px;\n  max-width: 440px;\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);\n  overflow: hidden;\n  animation: toastSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);\n  font-size: 11.5px;\n}\n@keyframes toastSlideIn {\n  from { opacity: 0; transform: translateY(-12px) scale(0.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n.sync-toast-header {\n  padding: 8px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--surface-border);\n  background: rgba(125, 125, 125, 0.04);\n}\n.sync-toast-title {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-weight: 700;\n  font-size: 12px;\n}\n.sync-toast-close {\n  background: none;\n  border: none;\n  color: var(--text-muted);\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 5px;\n  border-radius: 3px;\n}\n.sync-toast-close:hover {\n  background: rgba(125, 125, 125, 0.12);\n  color: var(--text);\n}\n.sync-toast-body {\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.sync-toast-stats {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.sync-badge-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n}\n.chip-success {\n  background: var(--success-soft);\n  color: var(--success);\n}\n.chip-info {\n  background: var(--primary-soft);\n  color: var(--primary);\n}\n.chip-warning {\n  background: var(--warning-soft);\n  color: #b45309;\n}\n.chip-danger {\n  background: var(--danger-soft);\n  color: var(--danger);\n}\n.sync-toast-errors {\n  margin-top: 4px;\n  padding: 6px 8px;\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.2);\n  border-radius: 4px;\n  font-size: 10.5px;\n  color: #ef4444;\n  max-height: 140px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n"] }]
    }], function () { return [{ type: i1.SutramExcelStateService }, { type: i2.SutramExcelApiService }, { type: i3.SutramExcelScannerService }, { type: i4.SutramAuditService }, { type: i5.SutramRefCacheService }, { type: i0.ChangeDetectorRef }]; }, { table: [{
            type: Input
        }], mode: [{
            type: Input
        }], apiBase: [{
            type: Input
        }], enableFilters: [{
            type: Input
        }], enableSorting: [{
            type: Input
        }], enableSearch: [{
            type: Input
        }], enableControlBar: [{
            type: Input
        }], enableStatsBar: [{
            type: Input
        }], enableUpload: [{
            type: Input
        }], enableAudit: [{
            type: Input
        }], enableAddRow: [{
            type: Input
        }], enableCorrections: [{
            type: Input
        }], enableLoadData: [{
            type: Input
        }], enableVerify: [{
            type: Input
        }], enableSync: [{
            type: Input
        }], enableDelete: [{
            type: Input
        }], enableTabs: [{
            type: Input
        }], enableZoom: [{
            type: Input
        }] }); })();
