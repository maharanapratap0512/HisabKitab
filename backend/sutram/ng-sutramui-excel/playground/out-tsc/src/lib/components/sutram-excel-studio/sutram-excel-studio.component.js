/**
 * sutram-excel-studio.component.ts
 * ─────────────────────────────────────────────────────────────
 * Master Studio Component hosting the toolbar, audit metrics,
 * virtual grid, header scanner, correction sidebar, and streaming importer.
 * ─────────────────────────────────────────────────────────────
 */
import { Component, Input, ChangeDetectionStrategy, HostListener, ViewChild } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
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
const _c0 = ["grid"];
function SutramExcelStudioComponent_div_40_button_24_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 99);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_button_24_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r21); const ctx_r20 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r20.loadTableDataFromDb()); });
    i0.ɵɵelement(1, "i", 100);
    i0.ɵɵelementStart(2, "span", 66);
    i0.ɵɵtext(3, "Load Data");
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_div_40_button_55_Template(rf, ctx) { if (rf & 1) {
    const _r23 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 101);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_button_55_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r23); const ctx_r22 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r22.clearDbSearch()); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_40_span_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 102);
    i0.ɵɵelement(1, "i", 103);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_40_button_62_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 104);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_button_62_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r25); const ctx_r24 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r24.saveRoughSheetLocally()); });
    i0.ɵɵelement(1, "i", 105);
    i0.ɵɵelementStart(2, "span", 66);
    i0.ɵɵtext(3, "\u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0938\u0939\u0947\u091C\u0947\u0902");
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_div_40_button_63_span_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 109);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r26 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(ctx_r26.state.pendingChangesCount());
} }
function SutramExcelStudioComponent_div_40_button_63_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 106);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_button_63_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r28); const ctx_r27 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r27.startImport()); });
    i0.ɵɵelement(1, "i", 107);
    i0.ɵɵelementStart(2, "span", 66);
    i0.ɵɵtext(3, "Sync to DB");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_40_button_63_span_4_Template, 2, 1, "span", 108);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r19 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r19.state.pendingChangesCount() === 0 || ctx_r19.state.hasErrors());
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngIf", ctx_r19.state.pendingChangesCount() > 0);
} }
function SutramExcelStudioComponent_div_40_Template(rf, ctx) { if (rf & 1) {
    const _r30 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 61)(1, "div", 62)(2, "div", 63)(3, "button", 64);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r30); const ctx_r29 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r29.isBoldActive = !ctx_r29.isBoldActive); });
    i0.ɵɵelementStart(4, "span", 65);
    i0.ɵɵtext(5, "B");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 66);
    i0.ɵɵtext(7, "Bold");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 67)(9, "button", 68);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r30); const ctx_r31 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r31.textAlign = "left"); });
    i0.ɵɵelement(10, "i", 69);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 70);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r30); const ctx_r32 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r32.textAlign = "center"); });
    i0.ɵɵelement(12, "i", 71);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 72);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r30); const ctx_r33 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r33.textAlign = "right"); });
    i0.ɵɵelement(14, "i", 73);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "button", 74);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_15_listener($event) { i0.ɵɵrestoreView(_r30); i0.ɵɵnextContext(); const _r3 = i0.ɵɵreference(52); return i0.ɵɵresetView(_r3.toggle($event)); });
    i0.ɵɵelement(16, "i", 75);
    i0.ɵɵelementStart(17, "span", 66);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(19, "span", 76);
    i0.ɵɵtext(20, "\u092A\u094D\u0930\u093E\u0930\u0942\u092A (Format)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(21, "div", 77);
    i0.ɵɵelementStart(22, "div", 62)(23, "div", 63);
    i0.ɵɵtemplate(24, SutramExcelStudioComponent_div_40_button_24_Template, 4, 0, "button", 78);
    i0.ɵɵelementStart(25, "button", 79);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_25_listener() { i0.ɵɵrestoreView(_r30); const _r15 = i0.ɵɵreference(30); return i0.ɵɵresetView(_r15.click()); });
    i0.ɵɵelement(26, "i", 80);
    i0.ɵɵelementStart(27, "span", 66);
    i0.ɵɵtext(28, "Open File");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "input", 81, 82);
    i0.ɵɵlistener("change", function SutramExcelStudioComponent_div_40_Template_input_change_29_listener($event) { i0.ɵɵrestoreView(_r30); const ctx_r36 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r36.onFileUpload($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "button", 83);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_31_listener() { i0.ɵɵrestoreView(_r30); const ctx_r37 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r37.exportExcel()); });
    i0.ɵɵelement(32, "i", 84);
    i0.ɵɵelementStart(33, "span", 66);
    i0.ɵɵtext(34, "Export");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(35, "button", 85);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_35_listener() { i0.ɵɵrestoreView(_r30); const ctx_r38 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r38.state.clearGrid()); });
    i0.ɵɵelement(36, "i", 86);
    i0.ɵɵelementStart(37, "span", 66);
    i0.ɵɵtext(38, "Clear");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(39, "span", 76);
    i0.ɵɵtext(40, "\u0921\u0947\u091F\u093E (Data)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(41, "div", 77);
    i0.ɵɵelementStart(42, "div", 62)(43, "div", 63)(44, "button", 87);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_44_listener() { i0.ɵɵrestoreView(_r30); const ctx_r39 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r39.state.toggleFiltersEnabled()); });
    i0.ɵɵelement(45, "i", 88);
    i0.ɵɵelementStart(46, "span", 66);
    i0.ɵɵtext(47, "Filters");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(48, "button", 89);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_48_listener() { i0.ɵɵrestoreView(_r30); const ctx_r40 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r40.state.toggleSortingEnabled()); });
    i0.ɵɵelement(49, "i", 90);
    i0.ɵɵelementStart(50, "span", 66);
    i0.ɵɵtext(51, "Sorting");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(52, "div", 91);
    i0.ɵɵelement(53, "i", 92);
    i0.ɵɵelementStart(54, "input", 93);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_40_Template_input_ngModelChange_54_listener($event) { i0.ɵɵrestoreView(_r30); const ctx_r41 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r41.onDbSearchInput($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(55, SutramExcelStudioComponent_div_40_button_55_Template, 2, 0, "button", 94);
    i0.ɵɵtemplate(56, SutramExcelStudioComponent_div_40_span_56_Template, 2, 0, "span", 95);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(57, "span", 76);
    i0.ɵɵtext(58, "\u0916\u094B\u091C \u0935 \u092B\u093C\u093F\u0932\u094D\u091F\u0930 (Search)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(59, "div", 77);
    i0.ɵɵelementStart(60, "div", 62)(61, "div", 63);
    i0.ɵɵtemplate(62, SutramExcelStudioComponent_div_40_button_62_Template, 4, 0, "button", 96);
    i0.ɵɵtemplate(63, SutramExcelStudioComponent_div_40_button_63_Template, 5, 2, "button", 97);
    i0.ɵɵelementStart(64, "div", 98);
    i0.ɵɵelement(65, "i", 12);
    i0.ɵɵelementStart(66, "span");
    i0.ɵɵtext(67);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(68, "span", 76);
    i0.ɵɵtext(69, "\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u0930\u0947\u0902 (Save / Sync)");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r0.isBoldActive);
    i0.ɵɵadvance(15);
    i0.ɵɵtextInterpolate1("Columns (", ctx_r0.visibleHeadersCount, ")");
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngIf", !ctx_r0.isCurrentSheetRough);
    i0.ɵɵadvance(20);
    i0.ɵɵclassProp("active", ctx_r0.state.filtersEnabled());
    i0.ɵɵadvance(4);
    i0.ɵɵclassProp("active", ctx_r0.state.sortingEnabled());
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngModel", ctx_r0.state.dbSearchQuery());
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r0.state.dbSearchQuery());
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r0.state.isLoadingDb());
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngIf", ctx_r0.isCurrentSheetRough);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !ctx_r0.isCurrentSheetRough);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", ctx_r0.state.rows().length, " / ", ctx_r0.state.totalDbRecords(), "");
} }
function SutramExcelStudioComponent_div_41_button_4_Template(rf, ctx) { if (rf & 1) {
    const _r45 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 101);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_41_button_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r45); const ctx_r44 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r44.tableSearchQuery = ""); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_41_div_6_span_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 122);
} }
function SutramExcelStudioComponent_div_41_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r49 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 115);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_41_div_6_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r49); const tbl_r46 = restoredCtx.$implicit; const ctx_r48 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r48.openTableInSheet(tbl_r46.table)); });
    i0.ɵɵelementStart(1, "button", 116);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_41_div_6_Template_button_click_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r49); const tbl_r46 = restoredCtx.$implicit; const ctx_r50 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r50.toggleFavoriteTable(tbl_r46.table, $event)); });
    i0.ɵɵelement(2, "i", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 117);
    i0.ɵɵelement(4, "i", 6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 118)(6, "span", 119);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span", 120);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(10, SutramExcelStudioComponent_div_41_div_6_span_10_Template, 1, 0, "span", 121);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tbl_r46 = ctx.$implicit;
    const ctx_r43 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("active-box", ctx_r43.isTableOpen(tbl_r46.table));
    i0.ɵɵproperty("title", (tbl_r46.display_name || tbl_r46.table) + " (" + tbl_r46.table + ")");
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("starred", ctx_r43.favoriteTables.has(tbl_r46.table));
    i0.ɵɵproperty("title", ctx_r43.favoriteTables.has(tbl_r46.table) ? "\u092A\u0938\u0902\u0926\u0940\u0926\u093E \u0938\u0947 \u0939\u091F\u093E\u090F\u0902" : "\u0938\u094D\u091F\u093E\u0930\u094D\u091F\u0905\u092A \u0921\u093F\u092B\u093C\u0949\u0932\u094D\u091F \u092E\u0947\u0902 \u091C\u094B\u0921\u093C\u0947\u0902");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ctx_r43.favoriteTables.has(tbl_r46.table) ? "pi-star-fill" : "pi-star");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(tbl_r46.display_name || tbl_r46.table);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(tbl_r46.table);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r43.isTableOpen(tbl_r46.table));
} }
function SutramExcelStudioComponent_div_41_Template(rf, ctx) { if (rf & 1) {
    const _r52 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 110)(1, "div", 111);
    i0.ɵɵelement(2, "i", 92);
    i0.ɵɵelementStart(3, "input", 112);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_41_Template_input_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r52); const ctx_r51 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r51.tableSearchQuery = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_41_button_4_Template, 2, 0, "button", 94);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 113);
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_div_41_div_6_Template, 11, 10, "div", 114);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r1.tableSearchQuery);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r1.tableSearchQuery);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r1.filteredTables);
} }
function SutramExcelStudioComponent_div_42_button_4_Template(rf, ctx) { if (rf & 1) {
    const _r56 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 101);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_42_button_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r56); const ctx_r55 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r55.reportSearchQuery = ""); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_42_div_6_span_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 122);
} }
function SutramExcelStudioComponent_div_42_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r60 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 125);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_42_div_6_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r60); const rep_r57 = restoredCtx.$implicit; const ctx_r59 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r59.openReportInSheet(rep_r57)); });
    i0.ɵɵelementStart(1, "button", 116);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_42_div_6_Template_button_click_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r60); const rep_r57 = restoredCtx.$implicit; const ctx_r61 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r61.toggleFavoriteReport(rep_r57.id, $event)); });
    i0.ɵɵelement(2, "i", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 126);
    i0.ɵɵelement(4, "i", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 118)(6, "span", 119);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span", 120);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(10, SutramExcelStudioComponent_div_42_div_6_span_10_Template, 1, 0, "span", 121);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const rep_r57 = ctx.$implicit;
    const ctx_r54 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("active-box", ctx_r54.isReportOpen(rep_r57.id));
    i0.ɵɵproperty("title", rep_r57.title + " \u2014 " + (rep_r57.desc || ""));
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("starred", ctx_r54.favoriteReports.has(rep_r57.id));
    i0.ɵɵproperty("title", ctx_r54.favoriteReports.has(rep_r57.id) ? "\u092A\u0938\u0902\u0926\u0940\u0926\u093E \u0938\u0947 \u0939\u091F\u093E\u090F\u0902" : "\u0938\u094D\u091F\u093E\u0930\u094D\u091F\u0905\u092A \u0921\u093F\u092B\u093C\u0949\u0932\u094D\u091F \u092E\u0947\u0902 \u091C\u094B\u0921\u093C\u0947\u0902");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ctx_r54.favoriteReports.has(rep_r57.id) ? "pi-star-fill" : "pi-star");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", rep_r57.icon);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(rep_r57.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(rep_r57.category);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r54.isReportOpen(rep_r57.id));
} }
function SutramExcelStudioComponent_div_42_Template(rf, ctx) { if (rf & 1) {
    const _r63 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 110)(1, "div", 111);
    i0.ɵɵelement(2, "i", 92);
    i0.ɵɵelementStart(3, "input", 123);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_42_Template_input_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r63); const ctx_r62 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r62.reportSearchQuery = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_42_button_4_Template, 2, 0, "button", 94);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 113);
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_div_42_div_6_Template, 11, 11, "div", 124);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r2.reportSearchQuery);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r2.reportSearchQuery);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r2.filteredReports);
} }
function SutramExcelStudioComponent_ng_template_53_button_5_Template(rf, ctx) { if (rf & 1) {
    const _r69 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 142);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_53_button_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r69); const ctx_r68 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r68.colSearchQuery = ""); });
    i0.ɵɵelement(1, "i", 143);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_53_ng_container_17_div_3_span_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 152);
    i0.ɵɵtext(1, "*");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_53_ng_container_17_div_3_Template(rf, ctx) { if (rf & 1) {
    const _r74 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 146);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_53_ng_container_17_div_3_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r74); const col_r71 = restoredCtx.$implicit; const ctx_r73 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r73.toggleColumnCheckbox(col_r71.key)); });
    i0.ɵɵelementStart(1, "div", 147);
    i0.ɵɵelement(2, "input", 148);
    i0.ɵɵelementStart(3, "span", 149);
    i0.ɵɵtext(4);
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_ng_template_53_ng_container_17_div_3_span_5_Template, 2, 0, "span", 150);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "span", 151);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r71 = ctx.$implicit;
    const ctx_r70 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r70.isColumnSelected(col_r71.key));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("title", col_r71.name);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", col_r71.name, "");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r71.not_null);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(col_r71.type || "string");
} }
function SutramExcelStudioComponent_ng_template_53_ng_container_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 144);
    i0.ɵɵtext(2, "Standard Columns");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_ng_template_53_ng_container_17_div_3_Template, 8, 5, "div", 145);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r65 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r65.filteredDirectCols)("ngForTrackBy", ctx_r65.trackByColKey);
} }
function SutramExcelStudioComponent_ng_template_53_ng_container_18_div_3_div_14_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r81 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 146);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_53_ng_container_18_div_3_div_14_div_1_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r81); const col_r79 = restoredCtx.$implicit; const ctx_r80 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r80.toggleColumnCheckbox(col_r79.key)); });
    i0.ɵɵelementStart(1, "div", 147);
    i0.ɵɵelement(2, "input", 148);
    i0.ɵɵelementStart(3, "span", 149);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "span", 151);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r79 = ctx.$implicit;
    const ctx_r78 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r78.isColumnSelected(col_r79.key));
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("font-weight", col_r79.is_fk_main ? "600" : "normal");
    i0.ɵɵproperty("title", col_r79.name);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", col_r79.short_name || col_r79.name, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(col_r79.is_fk_main ? "display" : col_r79.is_fk_raw ? "id" : col_r79.type || "string");
} }
function SutramExcelStudioComponent_ng_template_53_ng_container_18_div_3_div_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 166);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_ng_template_53_ng_container_18_div_3_div_14_div_1_Template, 7, 6, "div", 145);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const grp_r76 = i0.ɵɵnextContext().$implicit;
    const ctx_r77 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", grp_r76.columns)("ngForTrackBy", ctx_r77.trackByColKey);
} }
function SutramExcelStudioComponent_ng_template_53_ng_container_18_div_3_Template(rf, ctx) { if (rf & 1) {
    const _r84 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 155)(1, "div", 156)(2, "div", 157);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_53_ng_container_18_div_3_Template_div_click_2_listener() { const restoredCtx = i0.ɵɵrestoreView(_r84); const grp_r76 = restoredCtx.$implicit; const ctx_r83 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r83.toggleFkGroupExpand(grp_r76.name)); });
    i0.ɵɵelement(3, "i", 158);
    i0.ɵɵelementStart(4, "span", 159);
    i0.ɵɵelement(5, "i", 160);
    i0.ɵɵelementStart(6, "strong", 161);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span", 162);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "div", 163);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_53_ng_container_18_div_3_Template_div_click_10_listener() { const restoredCtx = i0.ɵɵrestoreView(_r84); const grp_r76 = restoredCtx.$implicit; const ctx_r85 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r85.toggleFkGroupAll(grp_r76.name)); });
    i0.ɵɵelement(11, "input", 148);
    i0.ɵɵelementStart(12, "span", 164);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(14, SutramExcelStudioComponent_ng_template_53_ng_container_18_div_3_div_14_Template, 2, 2, "div", 165);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const grp_r76 = ctx.$implicit;
    const ctx_r75 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("fk-active-group", grp_r76.selectedCount > 0);
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("rotated", ctx_r75.isFkGroupExpanded(grp_r76.name));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(grp_r76.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("(", grp_r76.refTable, ")");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", grp_r76.isAllChecked);
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("background", grp_r76.selectedCount > 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(125, 125, 125, 0.1)")("color", grp_r76.selectedCount > 0 ? "#059669" : "var(--text-muted)");
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate2(" ", grp_r76.selectedCount, "/", grp_r76.totalCount, " ");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r75.isFkGroupExpanded(grp_r76.name));
} }
function SutramExcelStudioComponent_ng_template_53_ng_container_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 153);
    i0.ɵɵtext(2, "FK Reference Groups");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_ng_template_53_ng_container_18_div_3_Template, 15, 14, "div", 154);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r66 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r66.filteredFkGroups)("ngForTrackBy", ctx_r66.trackByGroupName);
} }
function SutramExcelStudioComponent_ng_template_53_div_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 167);
    i0.ɵɵelement(1, "i", 168);
    i0.ɵɵtext(2, " No matching columns found ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_53_Template(rf, ctx) { if (rf & 1) {
    const _r87 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 127)(1, "div", 128)(2, "div", 129);
    i0.ɵɵelement(3, "i", 130);
    i0.ɵɵelementStart(4, "input", 131);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_ng_template_53_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r87); const ctx_r86 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r86.colSearchQuery = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_ng_template_53_button_5_Template, 2, 0, "button", 132);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 133)(7, "div", 134)(8, "button", 135);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_53_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r87); const ctx_r88 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r88.selectAllColumns(true)); });
    i0.ɵɵtext(9, "All");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 135);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_53_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r87); const ctx_r89 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r89.selectAllColumns(false)); });
    i0.ɵɵtext(11, "None");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "button", 135);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_53_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r87); const ctx_r90 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r90.resetDefaultColumns()); });
    i0.ɵɵtext(13, "Reset");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "span", 136);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "div", 137);
    i0.ɵɵtemplate(17, SutramExcelStudioComponent_ng_template_53_ng_container_17_Template, 4, 2, "ng-container", 35);
    i0.ɵɵtemplate(18, SutramExcelStudioComponent_ng_template_53_ng_container_18_Template, 4, 2, "ng-container", 35);
    i0.ɵɵtemplate(19, SutramExcelStudioComponent_ng_template_53_div_19_Template, 3, 0, "div", 138);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "div", 139)(21, "span", 140);
    i0.ɵɵtext(22, "Click outside or press Esc");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "button", 141);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_53_Template_button_click_23_listener() { i0.ɵɵrestoreView(_r87); i0.ɵɵnextContext(); const _r3 = i0.ɵɵreference(52); return i0.ɵɵresetView(_r3.hide()); });
    i0.ɵɵtext(24, "Done");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngModel", ctx_r4.colSearchQuery);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r4.colSearchQuery);
    i0.ɵɵadvance(10);
    i0.ɵɵtextInterpolate2("", ctx_r4.selectedColumnKeys.size, " of ", ctx_r4.allConfigColumns.length, " visible");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r4.filteredDirectCols.length > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r4.filteredFkGroups.length > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r4.filteredDirectCols.length === 0 && ctx_r4.filteredFkGroups.length === 0);
} }
function SutramExcelStudioComponent_div_59_Template(rf, ctx) { if (rf & 1) {
    const _r93 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div")(1, "button", 169);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_59_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r93); const ctx_r92 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r92.showSidebar = true); });
    i0.ɵɵelement(2, "i", 19);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" \u0917\u0932\u0924\u093F\u092F\u093E\u0901 (", ctx_r5.state.unresolvedCorrectionsCount(), ") ");
} }
function SutramExcelStudioComponent_div_65_span_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 175);
    i0.ɵɵtext(1, "\u0930\u092B");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_65_span_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 176);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r94 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", tab_r94.recordCount, " ");
} }
function SutramExcelStudioComponent_div_65_button_6_Template(rf, ctx) { if (rf & 1) {
    const _r101 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 177);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_65_button_6_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r101); const tab_r94 = i0.ɵɵnextContext().$implicit; const ctx_r99 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r99.closeSheet(tab_r94.id, $event)); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_65_Template(rf, ctx) { if (rf & 1) {
    const _r103 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 170);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_65_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r103); const tab_r94 = restoredCtx.$implicit; const ctx_r102 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r102.switchSheet(tab_r94.id)); });
    i0.ɵɵelement(1, "i", 171);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_65_span_4_Template, 2, 0, "span", 172);
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_div_65_span_5_Template, 2, 1, "span", 173);
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_div_65_button_6_Template, 2, 0, "button", 174);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r94 = ctx.$implicit;
    const ctx_r7 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active-tab", ctx_r7.activeSheetId === tab_r94.id);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", tab_r94.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(tab_r94.title);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", tab_r94.type === "rough");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", tab_r94.isLoaded && (tab_r94.recordCount || 0) > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r7.sheetTabs.length > 1);
} }
function SutramExcelStudioComponent_span_74_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 178);
    i0.ɵɵelement(1, "i", 179);
    i0.ɵɵtext(2, "Loading more... ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_span_75_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 180);
    i0.ɵɵelement(1, "i", 181);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r9.state.deletedRowIds().length, " Deleted ");
} }
function SutramExcelStudioComponent_span_76_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 182);
    i0.ɵɵtext(1, "\u2713 100% In Sync");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_span_77_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 183);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r11 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("", ctx_r11.state.stats().errorRows, " \u0924\u094D\u0930\u0941\u091F\u093F\u092F\u093E\u0901");
} }
function SutramExcelStudioComponent_span_78_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 184);
    i0.ɵɵelement(1, "i", 185);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r12 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("sync-error", ctx_r12.lastSyncPerSheet[ctx_r12.activeSheetId].hasError);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("\u0905\u0902\u0924\u093F\u092E \u0938\u093F\u0902\u0915 (", ctx_r12.lastSyncPerSheet[ctx_r12.activeSheetId].time, "): ", ctx_r12.lastSyncPerSheet[ctx_r12.activeSheetId].summary, " ");
} }
function SutramExcelStudioComponent_div_89_div_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 198)(1, "div", 199)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 200);
    i0.ɵɵelement(7, "div", 201);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r104 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", ctx_r104.syncToast.percentage, "% \u092A\u0942\u0930\u094D\u0923");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r104.state.importProgress().current, " / ", ctx_r104.state.importProgress().total, "");
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("width", ctx_r104.syncToast.percentage, "%");
} }
function SutramExcelStudioComponent_div_89_span_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 202);
    i0.ɵɵelement(1, "i", 57);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r105 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r105.syncToast.inserted, " Inserted ");
} }
function SutramExcelStudioComponent_div_89_span_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 203);
    i0.ɵɵelement(1, "i", 204);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r106 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r106.syncToast.updated, " Updated ");
} }
function SutramExcelStudioComponent_div_89_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 205);
    i0.ɵɵelement(1, "i", 206);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r107 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r107.syncToast.deleted, " Deleted ");
} }
function SutramExcelStudioComponent_div_89_span_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 207);
    i0.ɵɵelement(1, "i", 143);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r108 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r108.syncToast.failed, " Failed ");
} }
function SutramExcelStudioComponent_div_89_div_15_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const err_r111 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("\u2022 ", err_r111, "");
} }
function SutramExcelStudioComponent_div_89_div_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 208);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_div_89_div_15_div_1_Template, 2, 1, "div", 209);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r109 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", ctx_r109.syncToast.errors);
} }
function SutramExcelStudioComponent_div_89_Template(rf, ctx) { if (rf & 1) {
    const _r113 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 186)(1, "div", 187)(2, "div", 188);
    i0.ɵɵelement(3, "i", 21);
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 189);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_89_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r113); const ctx_r112 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r112.dismissSyncToast()); });
    i0.ɵɵtext(7, "\u2715");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(8, SutramExcelStudioComponent_div_89_div_8_Template, 8, 5, "div", 190);
    i0.ɵɵelementStart(9, "div", 191)(10, "div", 192);
    i0.ɵɵtemplate(11, SutramExcelStudioComponent_div_89_span_11_Template, 3, 1, "span", 193);
    i0.ɵɵtemplate(12, SutramExcelStudioComponent_div_89_span_12_Template, 3, 1, "span", 194);
    i0.ɵɵtemplate(13, SutramExcelStudioComponent_div_89_span_13_Template, 3, 1, "span", 195);
    i0.ɵɵtemplate(14, SutramExcelStudioComponent_div_89_span_14_Template, 3, 1, "span", 196);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(15, SutramExcelStudioComponent_div_89_div_15_Template, 2, 1, "div", 197);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r13 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngClass", ctx_r13.syncToast.inProgress ? "pi-spin pi-sync text-primary" : ctx_r13.syncToast.hasError ? "pi-exclamation-circle text-warning" : "pi-check-circle text-success");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r13.syncToast.title);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r13.syncToast.inProgress);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r13.syncToast.inserted > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r13.syncToast.updated > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r13.syncToast.deleted > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r13.syncToast.failed > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r13.syncToast.errors.length > 0);
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
    gridComponent;
    // ── Top Ribbon Navigation & Catalogs State ───────────────────
    activeTopTab = 'home';
    tableSearchQuery = '';
    reportSearchQuery = '';
    favoriteTables = new Set();
    favoriteReports = new Set();
    // ── Pre-configured Reports Catalog (CTE & SQL Views) ─────────
    reportsList = [
        {
            id: 'mn_awk_type_wise',
            title: 'आवक प्रकार सार (Monthly Aawak Type Saar)',
            desc: 'माह एवं प्रकार अनुसार आवक की कुल मात्रा, दर एवं अवशेष रिपोर्ट',
            icon: 'pi-chart-line',
            table: 'mn_awk_type_wise',
            category: 'Aawak / Inventory'
        },
        {
            id: 'mn_jwk_aj_type',
            title: 'जावक प्रकार सार (Monthly Jawak Type Saar)',
            desc: 'माह अनुसार प्रयुक्त एवं अन्य जावक का विश्लेषण विवरण',
            icon: 'pi-chart-bar',
            table: 'mn_jwk_aj_type',
            category: 'Jawak / Inventory'
        },
        {
            id: 'bachat_summary',
            title: 'बचत स्टॉक सारांश (Bachat Stock Summary)',
            desc: 'वर्तमान शेष, चालू, नया, पुराना, रिपेयरिंग एवं कबाड़ स्टॉक का समग्र विवरण',
            icon: 'pi-percentage',
            table: 'bachat',
            category: 'Stock Balance'
        },
        {
            id: 'pbk_closing',
            title: 'पीबीके क्लोजिंग रिपोर्ट (PBK Closing Statement)',
            desc: 'वित्तीय वर्षानुसार पीबीके की वार्षिक क्लोजिंग एवं बैलेंस शीट',
            icon: 'pi-book',
            table: 'pbk_closing',
            category: 'Closing'
        }
    ];
    tablesList = [];
    selectedTableName = '';
    isLoadingConfig = false;
    // Active Session Sheet Tabs (Rough & Favorites only)
    sheetTabs = [];
    activeSheetId = 'rough_1';
    sheetWorkbooks = {};
    loadedDbRecordCount = 0;
    // Zoom / Scale state
    zoomLevel = 1.0;
    // Dark Mode State
    isDarkMode = false;
    // Text Formatting State
    isBoldActive = false;
    textAlign = 'left';
    // Hidden Columns Set (legacy support)
    hiddenColumnKeys = new Set();
    // Rich Column Configuration Dropdown State (Matching Legacy Studio)
    allConfigColumns = [];
    selectedColumnKeys = new Set();
    expandedFkGroups = new Set();
    colSearchQuery = '';
    // Floating Sync Toast HUD State (Live toastr & result notification)
    syncToast = {
        visible: false,
        inProgress: false,
        percentage: 0,
        title: '',
        hasError: false,
        inserted: 0,
        updated: 0,
        deleted: 0,
        failed: 0,
        errors: []
    };
    // Last database sync status per sheet (rendered in bottom status bar)
    lastSyncPerSheet = {};
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
        const colIdx = cols.findIndex(c => (c.key || c.name) === sel.colKey);
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
        if (this.allConfigColumns.length > 0) {
            return this.allConfigColumns.filter(c => this.selectedColumnKeys.has(c.key));
        }
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
    isTechnicalCol(name) {
        const n = (name || '').toLowerCase();
        return n === '_id' || n.includes('_by_dept_id') || n === 'verify';
    }
    buildConfigColumns(cfg) {
        this.allConfigColumns = [];
        this.selectedColumnKeys.clear();
        this.expandedFkGroups.clear();
        const rawHeaders = cfg.headers || [];
        const allSchemaCols = cfg.all_schema_columns || [];
        const headerList = Array.isArray(rawHeaders) ? rawHeaders : Object.values(rawHeaders);
        const processedCols = new Set();
        for (const h of headerList) {
            const colName = h.col_name || h.name;
            if (this.isTechnicalCol(colName))
                continue;
            processedCols.add(colName);
            if (h.ref_table || h.type === 'ref') {
                const refTbl = h.ref_table;
                const refAs = h.ref_as || refTbl;
                const refCols = h.ref_columns || [];
                // 1. Composite / Human-Readable FK Display
                const mainCol = {
                    key: refAs,
                    name: h.name || refAs,
                    short_name: `${refAs} (display)`,
                    col_name: colName,
                    group: refTbl,
                    is_fk_main: true,
                    ref_table: refTbl,
                    ref_as: refAs,
                    type: 'ref',
                    not_null: !!h.not_null,
                    default_selected: true
                };
                this.allConfigColumns.push(mainCol);
                this.selectedColumnKeys.add(refAs);
                this.expandedFkGroups.add(refTbl);
                // 2. Reference Table Sub-columns
                if (Array.isArray(refCols)) {
                    refCols.forEach((rc) => {
                        const subColName = rc.col_name || rc.name;
                        if (this.isTechnicalCol(subColName))
                            return;
                        this.allConfigColumns.push({
                            key: `${refAs}.${subColName}`,
                            name: `${refAs}.${subColName}`,
                            short_name: rc.name || subColName,
                            col_name: subColName,
                            group: refTbl,
                            is_fk_subcol: true,
                            ref_table: refTbl,
                            ref_as: refAs,
                            sub_col_name: subColName,
                            type: rc.type || 'string',
                            not_null: false,
                            default_selected: false
                        });
                    });
                }
                // 3. Raw Numeric ID Column
                this.allConfigColumns.push({
                    key: colName,
                    name: colName,
                    short_name: `${colName} (id)`,
                    col_name: colName,
                    group: refTbl,
                    is_fk_raw: true,
                    ref_table: refTbl,
                    ref_as: refAs,
                    type: 'id',
                    not_null: !!h.not_null,
                    default_selected: false
                });
            }
            else {
                // Direct Standard Column
                this.allConfigColumns.push({
                    key: colName,
                    name: h.name || colName,
                    short_name: h.name || colName,
                    col_name: colName,
                    group: null,
                    is_fk_subcol: false,
                    is_fk_main: false,
                    is_fk_raw: false,
                    type: h.type || 'string',
                    not_null: !!h.not_null,
                    default_selected: true
                });
                this.selectedColumnKeys.add(colName);
            }
        }
        // Additional Schema Columns if any
        if (Array.isArray(allSchemaCols)) {
            for (const sc of allSchemaCols) {
                const colName = sc.col_name || sc.name;
                if (this.isTechnicalCol(colName) || processedCols.has(colName))
                    continue;
                processedCols.add(colName);
                this.allConfigColumns.push({
                    key: colName,
                    name: sc.name || colName,
                    short_name: sc.name || colName,
                    col_name: colName,
                    group: null,
                    type: sc.type || 'string',
                    not_null: !!sc.not_null,
                    default_selected: false
                });
            }
        }
        if (this.selectedColumnKeys.size === 0 && this.allConfigColumns.length > 0) {
            this.selectedColumnKeys.add(this.allConfigColumns[0].key);
        }
    }
    get filteredDirectCols() {
        const q = (this.colSearchQuery || '').trim().toLowerCase();
        return this.allConfigColumns.filter(c => {
            if (c.group)
                return false;
            if (!q)
                return true;
            return (c.name && c.name.toLowerCase().includes(q)) ||
                (c.key && c.key.toLowerCase().includes(q));
        });
    }
    get filteredFkGroups() {
        const q = (this.colSearchQuery || '').trim().toLowerCase();
        const groupsMap = new Map();
        this.allConfigColumns.forEach(c => {
            if (c.group) {
                if (!groupsMap.has(c.group))
                    groupsMap.set(c.group, []);
                groupsMap.get(c.group).push(c);
            }
        });
        const result = [];
        for (const [groupName, cols] of groupsMap.entries()) {
            const matchingCols = cols.filter(c => {
                if (!q)
                    return true;
                return groupName.toLowerCase().includes(q) ||
                    (c.name && c.name.toLowerCase().includes(q)) ||
                    (c.short_name && c.short_name.toLowerCase().includes(q));
            });
            if (q && matchingCols.length === 0)
                continue;
            const selectedInGroup = cols.filter(c => this.selectedColumnKeys.has(c.key)).length;
            const totalInGroup = cols.length;
            result.push({
                name: groupName,
                refTable: cols[0]?.ref_table || groupName,
                columns: q ? matchingCols : cols,
                totalCount: totalInGroup,
                selectedCount: selectedInGroup,
                isAllChecked: selectedInGroup === totalInGroup && totalInGroup > 0,
                isIndeterminate: selectedInGroup > 0 && selectedInGroup < totalInGroup
            });
        }
        return result;
    }
    isColumnSelected(key) {
        return this.selectedColumnKeys.has(key);
    }
    trackByGroupName(index, grp) {
        return grp.name;
    }
    trackByColKey(index, col) {
        return col.key;
    }
    isFkGroupExpanded(groupName) {
        if (this.colSearchQuery && this.colSearchQuery.trim())
            return true;
        return this.expandedFkGroups.has(groupName);
    }
    toggleFkGroupExpand(groupName) {
        if (this.expandedFkGroups.has(groupName)) {
            this.expandedFkGroups.delete(groupName);
        }
        else {
            this.expandedFkGroups.add(groupName);
        }
        this.expandedFkGroups = new Set(this.expandedFkGroups);
        this.cdr.markForCheck();
    }
    toggleColumnCheckbox(key) {
        if (this.selectedColumnKeys.has(key)) {
            if (this.selectedColumnKeys.size <= 1) {
                return; // At least 1 column must remain visible
            }
            this.selectedColumnKeys.delete(key);
        }
        else {
            this.selectedColumnKeys.add(key);
            this.ensureRowCellsForColumn(key);
        }
        this.selectedColumnKeys = new Set(this.selectedColumnKeys);
        this.cdr.markForCheck();
    }
    toggleFkGroupAll(groupName) {
        const groupCols = this.allConfigColumns.filter(c => c.group === groupName);
        const selectedCount = groupCols.filter(c => this.selectedColumnKeys.has(c.key)).length;
        const shouldSelectAll = selectedCount < groupCols.length;
        if (shouldSelectAll) {
            groupCols.forEach(c => {
                this.selectedColumnKeys.add(c.key);
                this.ensureRowCellsForColumn(c.key);
            });
        }
        else {
            groupCols.forEach(c => this.selectedColumnKeys.delete(c.key));
            if (this.selectedColumnKeys.size === 0) {
                const fallback = this.allConfigColumns.find(c => !c.group) || this.allConfigColumns[0];
                if (fallback) {
                    this.selectedColumnKeys.add(fallback.key);
                    this.ensureRowCellsForColumn(fallback.key);
                }
            }
        }
        this.selectedColumnKeys = new Set(this.selectedColumnKeys);
        this.cdr.markForCheck();
    }
    selectAllColumns(selectAll = true) {
        if (selectAll) {
            this.allConfigColumns.forEach(c => {
                this.selectedColumnKeys.add(c.key);
                this.ensureRowCellsForColumn(c.key);
            });
        }
        else {
            this.selectedColumnKeys.clear();
            if (this.allConfigColumns.length > 0) {
                const fallback = this.allConfigColumns.find(c => !c.group) || this.allConfigColumns[0];
                if (fallback) {
                    this.selectedColumnKeys.add(fallback.key);
                    this.ensureRowCellsForColumn(fallback.key);
                }
            }
        }
        this.selectedColumnKeys = new Set(this.selectedColumnKeys);
        this.cdr.markForCheck();
    }
    resetDefaultColumns() {
        this.selectedColumnKeys.clear();
        this.allConfigColumns.forEach(c => {
            if (c.default_selected) {
                this.selectedColumnKeys.add(c.key);
                this.ensureRowCellsForColumn(c.key);
            }
        });
        if (this.selectedColumnKeys.size === 0 && this.allConfigColumns.length > 0) {
            this.selectedColumnKeys.add(this.allConfigColumns[0].key);
            this.ensureRowCellsForColumn(this.allConfigColumns[0].key);
        }
        this.selectedColumnKeys = new Set(this.selectedColumnKeys);
        this.cdr.markForCheck();
    }
    ensureRowCellsForColumn(key) {
        const colDef = this.allConfigColumns.find(c => c.key === key);
        if (!colDef)
            return;
        const rows = this.state.rows();
        let updated = false;
        rows.forEach(r => {
            if (r.cells && !r.cells[key] && r._rawOriginal) {
                const dr = r._rawOriginal;
                let rawVal;
                if (colDef.is_fk_subcol) {
                    const refObj = dr[colDef.ref_as || colDef.ref_table];
                    if (refObj && typeof refObj === 'object') {
                        rawVal = refObj[colDef.sub_col_name];
                    }
                }
                else if (colDef.is_fk_main || colDef.type === 'ref') {
                    const joined = dr[colDef.ref_as || colDef.name || colDef.ref_table];
                    if (joined && typeof joined === 'object') {
                        const formatted = this.refCache.formatOption(colDef.ref_table, joined);
                        rawVal = formatted?.display;
                    }
                }
                else if (colDef.is_fk_raw) {
                    rawVal = dr[colDef.col_name] ?? dr[colDef.key];
                }
                else {
                    rawVal = dr[colDef.col_name] ?? dr[colDef.name] ?? dr[colDef.key];
                }
                r.cells[key] = {
                    value: String(rawVal ?? ''),
                    isValid: true,
                    refId: dr[colDef.col_name] !== undefined ? dr[colDef.col_name] : rawVal
                };
                updated = true;
            }
        });
        if (updated) {
            this.state.setRows([...rows]);
        }
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
        // Initialize & persist dark mode preference
        const savedTheme = localStorage.getItem('sutram_dark_mode');
        if (savedTheme === 'true' || document.body.classList.contains('dark-mode')) {
            this.isDarkMode = true;
            document.body.classList.add('dark-mode');
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
            localStorage.setItem('sutram_dark_mode', 'true');
        }
        else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('sutram_dark_mode', 'false');
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
    setTopTab(tab) {
        this.activeTopTab = tab;
        this.cdr.markForCheck();
    }
    get isCurrentSheetRough() {
        const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
        return !cur || cur.type === 'rough' || this.activeSheetId === 'blank' || this.activeSheetId.startsWith('rough_') || this.activeSheetId.startsWith('sheet_');
    }
    get filteredTables() {
        const q = (this.tableSearchQuery || '').toLowerCase().trim();
        if (!q)
            return this.tablesList;
        return this.tablesList.filter(t => t.table.toLowerCase().includes(q) ||
            (t.display_name && t.display_name.toLowerCase().includes(q)));
    }
    get filteredReports() {
        const q = (this.reportSearchQuery || '').toLowerCase().trim();
        if (!q)
            return this.reportsList;
        return this.reportsList.filter(r => r.title.toLowerCase().includes(q) ||
            r.desc.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q));
    }
    toggleFavoriteTable(tableName, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        if (this.favoriteTables.has(tableName)) {
            this.favoriteTables.delete(tableName);
        }
        else {
            this.favoriteTables.add(tableName);
        }
        localStorage.setItem('sutram_studio_favorites', JSON.stringify(Array.from(this.favoriteTables)));
        this.cdr.markForCheck();
    }
    toggleFavoriteReport(reportId, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        if (this.favoriteReports.has(reportId)) {
            this.favoriteReports.delete(reportId);
        }
        else {
            this.favoriteReports.add(reportId);
        }
        localStorage.setItem('sutram_favorite_reports', JSON.stringify(Array.from(this.favoriteReports)));
        this.cdr.markForCheck();
    }
    isTableOpen(tableName) {
        return this.sheetTabs.some(t => t.id === tableName || t.tableName === tableName);
    }
    isReportOpen(reportId) {
        return this.sheetTabs.some(t => t.id === 'rep_' + reportId || t.reportId === reportId);
    }
    openTableInSheet(tableName) {
        const foundTab = this.sheetTabs.find(t => t.id === tableName || t.tableName === tableName);
        if (foundTab) {
            this.switchSheet(foundTab.id);
        }
        else {
            const tableInfo = this.tablesList.find(t => t.table === tableName);
            const newTab = {
                id: tableName,
                title: tableInfo?.display_name || tableName,
                icon: 'pi-table',
                type: 'table',
                tableName: tableName,
                isLoaded: false,
                recordCount: 0
            };
            this.sheetTabs.push(newTab);
            this.switchSheet(newTab.id);
        }
        this.cdr.markForCheck();
    }
    openReportInSheet(report) {
        const tabId = 'rep_' + report.id;
        const foundTab = this.sheetTabs.find(t => t.id === tabId);
        if (foundTab) {
            this.switchSheet(foundTab.id);
        }
        else {
            const newTab = {
                id: tabId,
                title: report.title,
                icon: report.icon || 'pi-chart-bar',
                type: 'report',
                tableName: report.table,
                reportId: report.id,
                isLoaded: false,
                recordCount: 0
            };
            this.sheetTabs.push(newTab);
            this.switchSheet(newTab.id);
        }
        this.cdr.markForCheck();
    }
    closeSheet(tabId, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        if (this.sheetTabs.length <= 1)
            return;
        const idx = this.sheetTabs.findIndex(t => t.id === tabId);
        if (idx < 0)
            return;
        const wasActive = this.activeSheetId === tabId;
        this.sheetTabs.splice(idx, 1);
        if (wasActive) {
            const nextTab = this.sheetTabs[Math.max(0, idx - 1)] || this.sheetTabs[0];
            if (nextTab) {
                this.switchSheet(nextTab.id);
            }
        }
        this.cdr.markForCheck();
    }
    initBlankRoughSheet() {
        this.state.clearGrid();
        const defaultCols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(c => ({
            key: c,
            name: c,
            short_name: c,
            col_name: c,
            type: 'string',
            default_selected: true
        }));
        this.allConfigColumns = defaultCols;
        this.selectedColumnKeys = new Set(defaultCols.map(c => c.key));
        const roughHeaders = defaultCols.map(c => ({
            name: c.name,
            col_name: c.col_name,
            type: 'string'
        }));
        const mockCfg = {
            table: 'rough',
            display_name: 'Sheet (रफ)',
            headers: roughHeaders,
            duplicateOn: []
        };
        this.state.setConfig(mockCfg);
        const blankRow = this.createBlankRow(1, mockCfg);
        this.state.setRows([blankRow]);
    }
    saveRoughSheetLocally() {
        const currentRows = this.state.rows();
        const cleanRows = currentRows.map(r => ({
            rowNum: r.rowNum,
            cells: r.cells,
            hasError: r.hasError,
            isNew: r.isNew,
            isModified: r.isModified
        }));
        const dataToSave = {
            sheetId: this.activeSheetId,
            savedAt: new Date().toLocaleTimeString(),
            rows: cleanRows,
            allConfigColumns: this.allConfigColumns,
            selectedColumnKeys: Array.from(this.selectedColumnKeys)
        };
        try {
            localStorage.setItem(`sutram_rough_${this.activeSheetId}`, JSON.stringify(dataToSave));
            const curTab = this.sheetTabs.find(t => t.id === this.activeSheetId);
            if (curTab) {
                curTab.lastSaved = new Date().toLocaleTimeString();
                curTab.recordCount = currentRows.length;
            }
            this.lastSyncPerSheet[this.activeSheetId] = {
                time: new Date().toLocaleTimeString(),
                summary: `${currentRows.length} पंक्तियाँ सुरक्षित (Saved locally)`,
                hasError: false
            };
            this.syncToast = {
                visible: true,
                inProgress: false,
                percentage: 100,
                title: 'रफ शीट स्थानीय रूप से सुरक्षित (Saved Locally)',
                hasError: false,
                inserted: currentRows.length,
                updated: 0,
                deleted: 0,
                failed: 0,
                errors: []
            };
            this.cdr.detectChanges();
            setTimeout(() => {
                if (this.syncToast.visible && !this.syncToast.inProgress && !this.syncToast.hasError) {
                    this.syncToast = { ...this.syncToast, visible: false };
                    this.cdr.detectChanges();
                }
            }, 2500);
        }
        catch (e) {
            console.error('[SutramStudio] Local save failed:', e);
        }
    }
    loadTablesList() {
        const savedFavs = localStorage.getItem('sutram_studio_favorites');
        if (savedFavs) {
            try {
                this.favoriteTables = new Set(JSON.parse(savedFavs));
            }
            catch { }
        }
        else {
            this.favoriteTables = new Set(['item', 'aawak', 'bachat']);
        }
        const savedFavReps = localStorage.getItem('sutram_favorite_reports');
        if (savedFavReps) {
            try {
                this.favoriteReports = new Set(JSON.parse(savedFavReps));
            }
            catch { }
        }
        this.api.getRegisteredTables().subscribe({
            next: (tables) => {
                this.tablesList = tables;
                // Build active session sheets:
                // 1. Always start with Sheet 1 (रफ)
                const activeTabs = [
                    { id: 'rough_1', title: 'Sheet 1 (रफ)', icon: 'pi-file', type: 'rough', isLoaded: true }
                ];
                // 2. Add pinned / favorite tables only
                tables.forEach((t) => {
                    if (this.favoriteTables.has(t.table)) {
                        activeTabs.push({
                            id: t.table,
                            title: t.display_name || t.table,
                            icon: 'pi-table',
                            type: 'table',
                            tableName: t.table,
                            isLoaded: false,
                            recordCount: 0
                        });
                    }
                });
                this.sheetTabs = activeTabs;
                // Choose initial active sheet: favorite table if available, else rough_1
                const firstTable = activeTabs.find(t => t.type === 'table');
                if (firstTable) {
                    this.activeSheetId = firstTable.id;
                    this.selectedTableName = firstTable.id;
                    this.onTableSelect(firstTable.id, true);
                }
                else {
                    this.activeSheetId = 'rough_1';
                    this.selectedTableName = '';
                    this.switchSheet('rough_1');
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
        if (autoLoadData) {
            this.state.clearGrid();
            this.loadedDbRecordCount = 0;
        }
        this.isLoadingConfig = true;
        this.api.getTableConfig(tableName).subscribe({
            next: (cfg) => {
                this.state.setConfig(cfg);
                this.isLoadingConfig = false;
                // Build rich column configuration matching legacy studio only if not already built or fresh load
                if (autoLoadData || this.allConfigColumns.length === 0) {
                    this.buildConfigColumns(cfg);
                }
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
                config: this.state.config() || undefined,
                totalDbRecords: this.state.totalDbRecords(),
                loadedDbRecordCount: this.loadedDbRecordCount,
                deletedRowIds: this.state.deletedRowIds(),
                deletedRowsQueue: this.state.deletedRowsQueue(),
                allConfigColumns: [...this.allConfigColumns],
                selectedColumnKeys: new Set(this.selectedColumnKeys)
            };
        }
        this.activeSheetId = tabId;
        if (tabId === 'blank' || tabId.startsWith('rough_') || tabId.startsWith('sheet_')) {
            this.selectedTableName = '';
            this.state.setActiveTable(null);
            const saved = this.sheetWorkbooks[tabId];
            if (saved && saved.rows && saved.rows.length > 0) {
                this.state.setRows(saved.rows);
                this.state.deletedRowIds.set(saved.deletedRowIds || []);
                this.state.deletedRowsQueue.set(saved.deletedRowsQueue || []);
                if (saved.allConfigColumns)
                    this.allConfigColumns = [...saved.allConfigColumns];
                if (saved.selectedColumnKeys)
                    this.selectedColumnKeys = new Set(saved.selectedColumnKeys);
            }
            else {
                const localSaved = localStorage.getItem(`sutram_rough_${tabId}`);
                if (localSaved) {
                    try {
                        const parsed = JSON.parse(localSaved);
                        if (parsed.rows && parsed.rows.length > 0) {
                            this.state.setRows(parsed.rows);
                            if (parsed.allConfigColumns)
                                this.allConfigColumns = parsed.allConfigColumns;
                            if (parsed.selectedColumnKeys)
                                this.selectedColumnKeys = new Set(parsed.selectedColumnKeys);
                        }
                        else {
                            this.initBlankRoughSheet();
                        }
                    }
                    catch {
                        this.initBlankRoughSheet();
                    }
                }
                else {
                    this.initBlankRoughSheet();
                }
            }
            this.state.totalDbRecords.set(0);
            this.loadedDbRecordCount = 0;
            this.gridComponent?.resetScroll();
            this.cdr.markForCheck();
        }
        else {
            const saved = this.sheetWorkbooks[tabId];
            if (saved && saved.rows && saved.rows.length > 0) {
                // Instant in-memory restoration for previously visited sheets!
                this.selectedTableName = tabId;
                this.state.setActiveTable(tabId);
                if (saved.config) {
                    this.state.setConfig(saved.config);
                }
                if (saved.allConfigColumns && saved.selectedColumnKeys) {
                    this.allConfigColumns = [...saved.allConfigColumns];
                    this.selectedColumnKeys = new Set(saved.selectedColumnKeys);
                }
                this.state.setRows(saved.rows);
                this.state.deletedRowIds.set(saved.deletedRowIds || []);
                this.state.deletedRowsQueue.set(saved.deletedRowsQueue || []);
                if (saved.totalDbRecords !== undefined) {
                    this.state.totalDbRecords.set(saved.totalDbRecords);
                }
                if (saved.loadedDbRecordCount !== undefined) {
                    this.loadedDbRecordCount = saved.loadedDbRecordCount;
                }
                this.gridComponent?.resetScroll();
            }
            else {
                // First visit: load config and data chunk 1
                this.gridComponent?.resetScroll();
                this.onTableSelect(tabId, true);
            }
        }
        this.cdr.markForCheck();
    }
    addNewBlankSheet() {
        const roughCount = this.sheetTabs.filter(t => t.type === 'rough').length + 1;
        const newId = `rough_${Date.now()}`;
        const newTab = {
            id: newId,
            title: `Sheet ${roughCount} (रफ)`,
            icon: 'pi-file',
            type: 'rough',
            isLoaded: true
        };
        this.sheetTabs.push(newTab);
        this.switchSheet(newId);
    }
    /**
     * Converts a database row object into a verified SutramRow.
     * Utilizes SutramRefCacheService for Rule 8 bilingual formatting.
     */
    convertDbRecordToSutramRow(dr, rowNum, cfg) {
        const cells = {};
        const colsToPopulate = this.allConfigColumns.length > 0
            ? this.allConfigColumns
            : (cfg.headers || []).map((h) => ({
                key: h.col_name || h.name,
                name: h.name,
                short_name: h.name,
                col_name: h.col_name,
                type: h.type || 'string',
                ref_table: h.ref_table,
                ref_as: h.ref_as || h.ref_table,
                is_fk_main: !!h.ref_table,
                is_fk_subcol: false,
                is_fk_raw: false
            }));
        colsToPopulate.forEach((col) => {
            let rawVal;
            if (col.is_fk_subcol) {
                const refObj = dr[col.ref_as || col.ref_table];
                if (refObj && typeof refObj === 'object') {
                    rawVal = refObj[col.sub_col_name];
                }
            }
            else if (col.is_fk_main || col.type === 'ref') {
                const joined = dr[col.ref_as || col.name || col.ref_table];
                if (joined && typeof joined === 'object') {
                    const formatted = this.refCache.formatOption(col.ref_table, joined);
                    if (formatted && formatted.display) {
                        rawVal = formatted.display;
                    }
                }
            }
            else if (col.is_fk_raw) {
                rawVal = dr[col.col_name] ?? dr[col.key];
            }
            else {
                rawVal = dr[col.col_name];
                if (rawVal === undefined)
                    rawVal = dr[col.name];
                if (rawVal === undefined && col.key)
                    rawVal = dr[col.key];
            }
            if (rawVal === undefined) {
                const matchKey = Object.keys(dr).find((k) => k.toLowerCase() === (col.col_name || col.name || '').toLowerCase());
                if (matchKey)
                    rawVal = dr[matchKey];
            }
            const cellKey = col.key || col.name;
            const strVal = String(rawVal ?? '');
            cells[cellKey] = {
                value: strVal,
                originalValue: strVal,
                isValid: true,
                isModified: false,
                refId: dr[col.col_name] !== undefined ? dr[col.col_name] : rawVal
            };
            if (col.name && col.name !== cellKey) {
                cells[col.name] = cells[cellKey];
            }
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
     * Helper to check if a row contains any non-empty cell values
     */
    isRowPopulated(row) {
        if (!row || !row.cells)
            return false;
        for (const k in row.cells) {
            const val = row.cells[k]?.value;
            if (val !== undefined && val !== null && String(val).trim() !== '') {
                return true;
            }
        }
        return false;
    }
    /**
     * Creates an empty blank SutramRow initialized with column structure
     */
    createBlankRow(rowNum, cfg) {
        const cells = {};
        const colsToPopulate = this.allConfigColumns.length > 0
            ? this.allConfigColumns
            : (cfg.headers || []).map((h) => ({
                key: h.col_name || h.name,
                name: h.name
            }));
        colsToPopulate.forEach((col) => {
            const cellKey = col.key || col.name;
            cells[cellKey] = {
                value: '',
                originalValue: '',
                isValid: true,
                isModified: false,
                isNew: true
            };
            if (col.name && col.name !== cellKey) {
                cells[col.name] = cells[cellKey];
            }
        });
        return {
            rowNum,
            cells,
            hasError: false,
            errorCount: 0,
            isNew: true
        };
    }
    /**
     * Guarantees there is always one trailing blank row at the very end of the sheet
     */
    ensureTrailingBlankRow(rows, cfg) {
        if (!rows || rows.length === 0) {
            return [this.createBlankRow(1, cfg)];
        }
        const lastRow = rows[rows.length - 1];
        if (this.isRowPopulated(lastRow)) {
            return [...rows, this.createBlankRow(rows.length + 1, cfg)];
        }
        return rows;
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
        let sortColKey = activeSort?.colKey;
        if (sortColKey && cfg) {
            const foundCol = this.allConfigColumns.find(c => c.key === sortColKey || c.name === sortColKey);
            if (foundCol && foundCol.col_name) {
                sortColKey = foundCol.col_name;
            }
            else {
                const foundHeader = (cfg.headers || []).find((h) => h.name === sortColKey || h.col_name === sortColKey);
                if (foundHeader && foundHeader.col_name) {
                    sortColKey = foundHeader.col_name;
                }
            }
        }
        // Serialize column filters for backend API
        const apiFilters = {};
        for (const [colKey, valSet] of Object.entries(columnFilters)) {
            if (valSet && valSet.size > 0) {
                let dbKey = colKey;
                const foundCol = this.allConfigColumns.find(c => c.key === colKey || c.name === colKey);
                if (foundCol && foundCol.col_name) {
                    dbKey = foundCol.col_name;
                }
                apiFilters[dbKey] = Array.from(valSet);
            }
        }
        this.api.getTableDataChunk(tableName, {
            limit,
            offset,
            search: searchQuery || undefined,
            sort: sortColKey,
            order: activeSort?.order,
            filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined
        }).subscribe({
            next: (res) => {
                this.state.isLoadingDb.set(false);
                this.state.totalDbRecords.set(res.total);
                if (isReset) {
                    this.loadedDbRecordCount = res.rows ? res.rows.length : 0;
                    this.gridComponent?.resetScroll();
                }
                else {
                    this.loadedDbRecordCount += res.rows ? res.rows.length : 0;
                }
                const existingRows = isReset ? [] : this.state.rows();
                // Remove trailing empty blank row before appending next chunk so it doesn't get stuck in the middle
                const cleanExisting = (!isReset && existingRows.length > 0 && !this.isRowPopulated(existingRows[existingRows.length - 1]))
                    ? existingRows.slice(0, -1)
                    : existingRows;
                const startIndex = cleanExisting.length;
                const builtRows = (res.rows || []).map((dr, idx) => {
                    return this.convertDbRecordToSutramRow(dr, startIndex + idx + 1, cfg);
                });
                this.audit.auditAll(builtRows, cfg.headers);
                let combined = isReset ? builtRows : [...cleanExisting, ...builtRows];
                // Always ensure one trailing blank row at the very end (whether 0, 10, or 250+ records)
                combined = this.ensureTrailingBlankRow(combined, cfg);
                this.state.setRows(combined);
                const tab = this.sheetTabs.find((t) => t.id === tableName);
                if (tab) {
                    tab.isLoaded = true;
                    tab.recordCount = res.total !== undefined ? res.total : this.loadedDbRecordCount;
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.state.isLoadingDb.set(false);
                console.error('[SutramStudio] Load DB data chunk failed:', err);
                this.cdr.detectChanges();
            }
        });
    }
    /**
     * Infinite scroll trigger emitted from grid when scrolling near bottom
     */
    onLoadMore() {
        if (this.state.isLoadingDb())
            return;
        const loadedCount = this.loadedDbRecordCount;
        const totalCount = this.state.totalDbRecords();
        if (totalCount > 0 && loadedCount < totalCount && this.selectedTableName) {
            this.loadDataChunk(this.selectedTableName, loadedCount, 100, false);
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
        const withBlank = this.ensureTrailingBlankRow(builtRows, cfg);
        this.state.setRows(withBlank);
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
        // 0. Commit any active in-cell edit before gathering rows to sync
        if (this.gridComponent && this.gridComponent.editingCell) {
            this.gridComponent.commitCellEdit();
        }
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
                this.cdr.detectChanges();
                return;
            }
        }
        this.isCancelRequested = false;
        this.rejectedRowsDuringImport = [];
        this.showProgressModal = false; // Status is shown via live toastr & bottom status bar
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
        // Live Toastr initialization
        this.syncToast = {
            visible: true,
            inProgress: true,
            percentage: 0,
            title: 'डेटाबेस में सिंक हो रहा है (Syncing to Database)...',
            hasError: false,
            inserted: 0,
            updated: 0,
            deleted: 0,
            failed: 0,
            errors: []
        };
        this.cdr.detectChanges();
        const syncedRowNums = [];
        try {
            // 3. Dispatch deleted rows if any exist
            if (deletedIds.length > 0) {
                try {
                    const delRes = await firstValueFrom(this.api.deleteRows(this.selectedTableName, deletedIds));
                    const delCount = delRes?.count || deletedIds.length;
                    progress.deleted = delCount;
                    this.syncToast = { ...this.syncToast, deleted: delCount };
                    this.state.totalDbRecords.update((n) => Math.max(0, n - delCount));
                    this.state.clearDeletedRowIds();
                }
                catch (delErr) {
                    progress.rejected += deletedIds.length;
                    this.syncToast = { ...this.syncToast, failed: this.syncToast.failed + deletedIds.length };
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
                this.syncToast = { ...this.syncToast, percentage: progress.percentage };
                this.state.importProgress.set({ ...progress });
                this.cdr.detectChanges();
            }
            // 4. Dispatch rows to sync (insert / update)
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
                        ? await firstValueFrom(this.api.updateRow(this.selectedTableName, payload))
                        : await firstValueFrom(this.api.importRow(this.selectedTableName, payload));
                    if (res?.status === 'inserted') {
                        progress.inserted++;
                        syncedRowNums.push(r.rowNum);
                        if (rowId)
                            syncedRowNums.push(rowId);
                        this.state.totalDbRecords.update((n) => n + 1);
                    }
                    else if (res?.status === 'updated') {
                        progress.updated++;
                        syncedRowNums.push(r.rowNum);
                        if (rowId)
                            syncedRowNums.push(rowId);
                    }
                    else if (res?.status === 'duplicate') {
                        progress.duplicate++;
                        syncedRowNums.push(r.rowNum);
                        if (rowId)
                            syncedRowNums.push(rowId);
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
                this.syncToast = {
                    ...this.syncToast,
                    percentage: progress.percentage,
                    title: `सिंक जारी है (${progress.current}/${progress.total})...`,
                    inserted: progress.inserted,
                    updated: progress.updated,
                    deleted: progress.deleted || 0,
                    failed: progress.rejected
                };
                this.state.importProgress.set({ ...progress });
                this.cdr.detectChanges();
            }
            // Mark successfully synced rows as clean
            if (syncedRowNums.length > 0) {
                this.state.markRowsSynced(syncedRowNums);
            }
            progress.isActive = false;
            this.state.importProgress.set({ ...progress });
            const hasErr = progress.rejected > 0;
            this.syncToast = {
                visible: true,
                inProgress: false,
                percentage: 100,
                title: hasErr
                    ? 'सिंक चेतावनी के साथ संपन्न (Sync Finished with Warnings)'
                    : 'सिंक सफलतापूर्वक संपन्न (Sync Completed Successfully)',
                hasError: hasErr,
                inserted: progress.inserted,
                updated: progress.updated,
                deleted: progress.deleted || 0,
                failed: progress.rejected,
                errors: this.rejectedRowsDuringImport.map(x => x._error || 'Row operation failed')
            };
            this.recordSheetLastSync(progress, hasErr);
            this.cdr.detectChanges();
            // Auto-dismiss toast after 3.5 seconds if successful
            if (!hasErr) {
                setTimeout(() => {
                    if (this.syncToast.visible && !this.syncToast.inProgress && !this.syncToast.hasError) {
                        this.syncToast = { ...this.syncToast, visible: false };
                        this.cdr.detectChanges();
                    }
                }, 3500);
            }
        }
        catch (globalErr) {
            console.error('[SutramStudio] DB Sync Error:', globalErr);
            this.syncToast = {
                visible: true,
                inProgress: false,
                percentage: 100,
                title: 'सिंक में त्रुटि (Sync Failed)',
                hasError: true,
                inserted: progress.inserted,
                updated: progress.updated,
                deleted: progress.deleted || 0,
                failed: progress.rejected + 1,
                errors: [globalErr?.message || 'Database sync encountered an unexpected error.']
            };
            this.recordSheetLastSync(progress, true);
            this.cdr.detectChanges();
        }
        finally {
            this.state.isImporting.set(false);
            this.cdr.detectChanges();
        }
    }
    recordSheetLastSync(progress, hasErr) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const parts = [];
        if (progress.updated > 0)
            parts.push(`${progress.updated} Updated`);
        if (progress.inserted > 0)
            parts.push(`${progress.inserted} Inserted`);
        if ((progress.deleted || 0) > 0)
            parts.push(`${progress.deleted} Deleted`);
        if (progress.rejected > 0)
            parts.push(`${progress.rejected} Failed`);
        const summary = parts.length > 0 ? parts.join(', ') : 'All in sync';
        this.lastSyncPerSheet[this.activeSheetId] = {
            time: timeStr,
            summary,
            hasError: hasErr
        };
    }
    dismissSyncToast() {
        this.syncToast = { ...this.syncToast, visible: false, inProgress: false };
        this.cdr.detectChanges();
    }
    onStudioGlobalKeydown(event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            event.stopPropagation();
            if (this.isCurrentSheetRough) {
                this.saveRoughSheetLocally();
                return;
            }
            if (this.state.isImporting())
                return;
            if (this.state.hasErrors()) {
                this.syncToast = {
                    visible: true,
                    inProgress: false,
                    percentage: 0,
                    title: 'कृपया पहले त्रुटियों को ठीक करें (Fix errors before syncing)',
                    hasError: true,
                    inserted: 0,
                    updated: 0,
                    deleted: 0,
                    failed: this.state.stats().errorRows,
                    errors: ['शीट में अमान्य डेटा या त्रुटियाँ मौजूद हैं।']
                };
                this.cdr.detectChanges();
                return;
            }
            if (this.state.pendingChangesCount() > 0) {
                this.startImport();
            }
            else {
                this.syncToast = {
                    visible: true,
                    inProgress: false,
                    percentage: 100,
                    title: 'डेटाबेस पहले से सिंक है (Already in sync)',
                    hasError: false,
                    inserted: 0,
                    updated: 0,
                    deleted: 0,
                    failed: 0,
                    errors: []
                };
                this.cdr.detectChanges();
                setTimeout(() => {
                    if (this.syncToast.visible && !this.syncToast.inProgress && !this.syncToast.hasError) {
                        this.syncToast = { ...this.syncToast, visible: false };
                        this.cdr.detectChanges();
                    }
                }, 2500);
            }
        }
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
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SutramExcelStudioComponent, selectors: [["sutram-excel-studio"]], viewQuery: function SutramExcelStudioComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.gridComponent = _t.first);
        } }, hostBindings: function SutramExcelStudioComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown", function SutramExcelStudioComponent_keydown_HostBindingHandler($event) { return ctx.onStudioGlobalKeydown($event); }, false, i0.ɵɵresolveDocument);
        } }, inputs: { table: "table", mode: "mode", apiBase: "apiBase", enableFilters: "enableFilters", enableSorting: "enableSorting", enableSearch: "enableSearch", enableControlBar: "enableControlBar", enableStatsBar: "enableStatsBar", enableUpload: "enableUpload", enableAudit: "enableAudit", enableAddRow: "enableAddRow", enableCorrections: "enableCorrections", enableLoadData: "enableLoadData", enableVerify: "enableVerify", enableSync: "enableSync", enableDelete: "enableDelete", enableTabs: "enableTabs", enableZoom: "enableZoom" }, decls: 92, vars: 48, consts: [[1, "sutram-excel-container"], [1, "studio-header"], [1, "ribbon-menu-bar"], [1, "menu-bar-left"], [1, "brand"], [1, "brand-icon"], [1, "pi", "pi-table"], [1, "brand-title"], [1, "version-tag"], [1, "ribbon-tabs-nav"], ["type", "button", 1, "ribbon-tab-btn", 3, "click"], [1, "pi", "pi-home"], [1, "pi", "pi-database"], [1, "ribbon-badge"], [1, "pi", "pi-chart-bar"], [1, "menu-bar-right"], [1, "mode-pill-toggle"], [1, "mode-pill-btn", 3, "click"], [1, "pi", "pi-pencil"], [1, "pi", "pi-bolt"], ["title", "\u0932\u093E\u0907\u091F / \u0921\u093E\u0930\u094D\u0915 \u092E\u094B\u0921", 1, "cmd-btn", 2, "padding", "3px 6px", 3, "click"], [1, "pi", 3, "ngClass"], [1, "ribbon-strip"], ["class", "ribbon-content-row", 4, "ngIf"], ["class", "ribbon-scroll-row", 4, "ngIf"], [1, "formula-bar-row"], [1, "coord-box"], [1, "active-col-chip"], [2, "font-weight", "700", "font-style", "italic", "color", "var(--text-muted)", "margin", "0 4px"], ["type", "text", "placeholder", "Select a cell or type value here...", 1, "formula-input", 3, "ngModel", "ngModelChange"], ["styleClass", "sutram-col-config-popover shadow-lg", 3, "dismissable"], ["colConfigOp", ""], ["pTemplate", "content"], [1, "status-strip", 3, "ngClass"], [2, "display", "flex", "align-items", "center", "gap", "6px"], [4, "ngIf"], [1, "spreadsheet-canvas", "flex-grow-1"], [3, "headers", "rows", "filterOnlyErrors", "enableDelete", "loadMore", "filterChanged", "sortChanged", "solveAllTriggered", "openConfig"], ["grid", ""], [1, "studio-footer"], [1, "sheet-tabs-bar"], ["class", "tab-pill", 3, "active-tab", "click", 4, "ngFor", "ngForOf"], ["title", "Add Blank Sheet", 1, "add-tab-btn", 3, "click"], [1, "pi", "pi-plus", 2, "font-size", "10px"], [1, "bottom-status-subrow"], [2, "display", "flex", "align-items", "center", "gap", "10px"], ["class", "text-primary small fw-semibold", 4, "ngIf"], ["class", "badge bg-soft-warning text-warning small fw-semibold", 4, "ngIf"], ["style", "color: #10b981; font-weight: 600;", 4, "ngIf"], ["style", "color: #ef4444; font-weight: 600;", 4, "ngIf"], ["class", "last-sync-badge", 3, "sync-error", 4, "ngIf"], [2, "font-size", "10.5px", "opacity", "0.8"], [1, "zoom-controls"], ["title", "Zoom Out (-10%)", 1, "zoom-btn", 3, "click"], [1, "pi", "pi-minus"], ["title", "Reset to 100%", 1, "zoom-display", 3, "click"], ["title", "Zoom In (+10%)", 1, "zoom-btn", 3, "click"], [1, "pi", "pi-plus"], ["class", "sync-toast-hud shadow-lg", 4, "ngIf"], [3, "visible", "report", "availableHeaders", "visibleChange", "confirmed"], [3, "visible", "groups", "visibleChange"], [1, "ribbon-content-row"], [1, "ribbon-group"], [1, "ribbon-group-items"], ["title", "Bold (Ctrl+B)", 1, "ribbon-tool-btn", 3, "click"], [2, "font-weight", "800", "font-size", "13px"], [1, "ribbon-tool-lbl"], [1, "ribbon-mini-col"], ["title", "Align Left", 1, "ribbon-mini-btn", 3, "click"], [1, "pi", "pi-align-left"], ["title", "Align Center", 1, "ribbon-mini-btn", 3, "click"], [1, "pi", "pi-align-center"], ["title", "Align Right", 1, "ribbon-mini-btn", 3, "click"], [1, "pi", "pi-align-right"], ["title", "Choose Visible Columns", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-sliders-h", 2, "color", "var(--primary)"], [1, "ribbon-group-name"], [1, "ribbon-v-sep"], ["class", "ribbon-tool-btn", "title", "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0938\u0947 \u0907\u0938 \u091F\u0947\u092C\u0932 \u0915\u093E \u0932\u093E\u0907\u0935 \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0915\u0930\u0947\u0902", 3, "click", 4, "ngIf"], ["title", "\u092C\u093E\u0939\u0930\u0940 Excel (.xlsx) \u0916\u094B\u0932\u0947\u0902", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-folder-open"], ["type", "file", "accept", ".xlsx, .xls, .csv", 2, "display", "none", 3, "change"], ["fileInput", ""], ["title", "Excel \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-download"], ["title", "\u0936\u0940\u091F \u0916\u093E\u0932\u0940 \u0915\u0930\u0947\u0902", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-trash", "text-danger"], ["title", "\u092B\u093C\u093F\u0932\u094D\u091F\u0930 \u091A\u093E\u0932\u0942/\u092C\u0902\u0926", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-filter"], ["title", "\u0938\u0949\u0930\u094D\u091F\u093F\u0902\u0917 \u091A\u093E\u0932\u0942/\u092C\u0902\u0926", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-sort-alt"], [1, "ribbon-search-field"], [1, "pi", "pi-search", "search-ico"], ["type", "text", "placeholder", "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0938\u0940\u0927\u093E \u0916\u094B\u091C\u0947\u0902...", 1, "ribbon-search-inp", 3, "ngModel", "ngModelChange"], ["class", "clear-btn-inline", 3, "click", 4, "ngIf"], ["class", "spin-inline", 4, "ngIf"], ["class", "ribbon-tool-btn ribbon-btn-action", "title", "\u0930\u092B \u0936\u0940\u091F \u0915\u094B \u0932\u094B\u0915\u0932 \u0938\u094D\u091F\u094B\u0930\u0947\u091C \u092E\u0947\u0902 \u0938\u0939\u0947\u091C\u0947\u0902 (Ctrl+S)", 3, "click", 4, "ngIf"], ["class", "ribbon-tool-btn ribbon-btn-action", "title", "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0938\u0947\u0935/\u0907\u092E\u094D\u092A\u094B\u0930\u094D\u091F \u0915\u0930\u0947\u0902 (Ctrl+S)", 3, "disabled", "click", 4, "ngIf"], ["title", "\u0915\u0941\u0932 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0930\u093F\u0915\u0949\u0930\u094D\u0921\u094D\u0938 \u090F\u0935\u0902 \u0932\u094B\u0921 \u0938\u094D\u0925\u093F\u0924\u093F", 1, "ribbon-record-pill"], ["title", "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0938\u0947 \u0907\u0938 \u091F\u0947\u092C\u0932 \u0915\u093E \u0932\u093E\u0907\u0935 \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0915\u0930\u0947\u0902", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-database", "text-success"], [1, "clear-btn-inline", 3, "click"], [1, "spin-inline"], [1, "pi", "pi-spin", "pi-spinner"], ["title", "\u0930\u092B \u0936\u0940\u091F \u0915\u094B \u0932\u094B\u0915\u0932 \u0938\u094D\u091F\u094B\u0930\u0947\u091C \u092E\u0947\u0902 \u0938\u0939\u0947\u091C\u0947\u0902 (Ctrl+S)", 1, "ribbon-tool-btn", "ribbon-btn-action", 3, "click"], [1, "pi", "pi-save"], ["title", "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0938\u0947\u0935/\u0907\u092E\u094D\u092A\u094B\u0930\u094D\u091F \u0915\u0930\u0947\u0902 (Ctrl+S)", 1, "ribbon-tool-btn", "ribbon-btn-action", 3, "disabled", "click"], [1, "pi", "pi-cloud-upload"], ["class", "sync-count-tag", 4, "ngIf"], [1, "sync-count-tag"], [1, "ribbon-scroll-row"], [1, "ribbon-search-field", 2, "width", "140px", "min-width", "140px", "margin-right", "6px"], ["type", "text", "placeholder", "\u0924\u093E\u0932\u093F\u0915\u093E \u0916\u094B\u091C\u0947\u0902...", 1, "ribbon-search-inp", 3, "ngModel", "ngModelChange"], [1, "ribbon-boxes-track"], ["class", "ribbon-small-box", 3, "active-box", "title", "click", 4, "ngFor", "ngForOf"], [1, "ribbon-small-box", 3, "title", "click"], ["type", "button", 1, "box-star-btn", 3, "title", "click"], [1, "box-icon-wrap"], [1, "box-info"], [1, "box-name-hin"], [1, "box-name-eng"], ["class", "box-dot", "title", "\u0936\u0940\u091F \u0916\u0941\u0932\u0940 \u0939\u0948", 4, "ngIf"], ["title", "\u0936\u0940\u091F \u0916\u0941\u0932\u0940 \u0939\u0948", 1, "box-dot"], ["type", "text", "placeholder", "\u0930\u093F\u092A\u094B\u0930\u094D\u091F \u0916\u094B\u091C\u0947\u0902...", 1, "ribbon-search-inp", 3, "ngModel", "ngModelChange"], ["class", "ribbon-small-box report-box", 3, "active-box", "title", "click", 4, "ngFor", "ngForOf"], [1, "ribbon-small-box", "report-box", 3, "title", "click"], [1, "box-icon-wrap", "report-icon-bg"], [1, "col-dropdown-menu"], [1, "col-dd-header"], [1, "col-dd-search-wrap"], [1, "pi", "pi-search", "col-dd-search-icon"], ["type", "text", "placeholder", "Search columns / FK...", 1, "col-dd-search-input", 3, "ngModel", "ngModelChange"], ["type", "button", "class", "btn-clear-search-inline", 3, "click", 4, "ngIf"], [1, "col-dd-actions"], [1, "col-dd-actions-left"], ["type", "button", 1, "col-dd-act-btn", 3, "click"], [1, "col-dd-count"], [1, "col-dd-body"], ["class", "col-dd-empty", 4, "ngIf"], [1, "col-dd-footer"], [1, "small", "text-muted", 2, "font-size", "10.5px"], ["type", "button", 1, "btn", "btn-sm", "btn-primary", "py-1", "px-3", 2, "font-size", "11.5px", "font-weight", "600", 3, "click"], ["type", "button", 1, "btn-clear-search-inline", 3, "click"], [1, "pi", "pi-times"], [1, "col-dd-section-title"], ["class", "col-dd-item", 3, "click", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "col-dd-item", 3, "click"], [1, "col-dd-item-left"], ["type", "checkbox", 1, "custom-check", 2, "pointer-events", "none", 3, "checked"], [1, "col-dd-item-name", 3, "title"], ["style", "color: #ef4444; margin-left: 2px;", 4, "ngIf"], [1, "type-badge"], [2, "color", "#ef4444", "margin-left", "2px"], [1, "col-dd-section-title", 2, "margin-top", "8px"], ["class", "col-dd-group", 3, "fk-active-group", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "col-dd-group"], [1, "col-dd-group-header"], [1, "col-dd-group-left", 2, "cursor", "pointer", "flex-grow", "1", 3, "click"], [1, "pi", "pi-chevron-right", "fk-expand-toggle"], [1, "col-dd-item-name"], [1, "pi", "pi-link", 2, "color", "var(--primary, #4f46e5)", "font-size", "10px", "margin-right", "3px"], [2, "text-transform", "capitalize"], [2, "font-size", "10px", "color", "var(--text-muted)", "font-weight", "400", "margin-left", "3px"], [1, "col-dd-group-right", 2, "cursor", "pointer", "display", "flex", "align-items", "center", "gap", "6px", 3, "click"], [1, "fk-group-pill"], ["class", "col-dd-group-items", 4, "ngIf"], [1, "col-dd-group-items"], [1, "col-dd-empty"], [1, "pi", "pi-search", "me-1"], [1, "cmd-btn", "cmd-btn-warning", 2, "padding", "2px 8px", 3, "click"], [1, "tab-pill", 3, "click"], [1, "pi", 2, "font-size", "11px", 3, "ngClass"], ["class", "sheet-tab-rough-badge", 4, "ngIf"], ["class", "sheet-tab-badge", 4, "ngIf"], ["type", "button", "class", "tab-close-btn", "title", "\u0936\u0940\u091F \u092C\u0902\u0926 \u0915\u0930\u0947\u0902", 3, "click", 4, "ngIf"], [1, "sheet-tab-rough-badge"], [1, "sheet-tab-badge"], ["type", "button", "title", "\u0936\u0940\u091F \u092C\u0902\u0926 \u0915\u0930\u0947\u0902", 1, "tab-close-btn", 3, "click"], [1, "text-primary", "small", "fw-semibold"], [1, "pi", "pi-spin", "pi-spinner", "me-1"], [1, "badge", "bg-soft-warning", "text-warning", "small", "fw-semibold"], [1, "pi", "pi-trash", "me-1"], [2, "color", "#10b981", "font-weight", "600"], [2, "color", "#ef4444", "font-weight", "600"], [1, "last-sync-badge"], [1, "pi", "pi-history", "me-1"], [1, "sync-toast-hud", "shadow-lg"], [1, "sync-toast-header"], [1, "sync-toast-title"], [1, "sync-toast-close", 3, "click"], ["class", "sync-progress-wrap px-3 pt-2", 4, "ngIf"], [1, "sync-toast-body"], [1, "sync-toast-stats"], ["class", "sync-badge-chip chip-success", 4, "ngIf"], ["class", "sync-badge-chip chip-info", 4, "ngIf"], ["class", "sync-badge-chip chip-warning", 4, "ngIf"], ["class", "sync-badge-chip chip-danger", 4, "ngIf"], ["class", "sync-toast-errors", 4, "ngIf"], [1, "sync-progress-wrap", "px-3", "pt-2"], [1, "d-flex", "justify-content-between", "align-items-center", "mb-1", 2, "font-size", "11px", "color", "var(--text-muted, #64748b)"], [1, "sync-progress-track"], [1, "sync-progress-bar"], [1, "sync-badge-chip", "chip-success"], [1, "sync-badge-chip", "chip-info"], [1, "pi", "pi-refresh"], [1, "sync-badge-chip", "chip-warning"], [1, "pi", "pi-trash"], [1, "sync-badge-chip", "chip-danger"], [1, "sync-toast-errors"], [4, "ngFor", "ngForOf"]], template: function SutramExcelStudioComponent_Template(rf, ctx) { if (rf & 1) {
            const _r114 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "div", 0)(1, "header", 1)(2, "div", 2)(3, "div", 3)(4, "div", 4)(5, "div", 5);
            i0.ɵɵelement(6, "i", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "div", 7)(8, "span");
            i0.ɵɵtext(9, "Sutram Studio");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "span", 8);
            i0.ɵɵtext(11, "v2.0");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(12, "nav", 9)(13, "button", 10);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_13_listener() { return ctx.setTopTab("home"); });
            i0.ɵɵelement(14, "i", 11);
            i0.ɵɵelementStart(15, "span");
            i0.ɵɵtext(16, "\u0939\u094B\u092E (Home)");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "button", 10);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_17_listener() { return ctx.setTopTab("tables"); });
            i0.ɵɵelement(18, "i", 12);
            i0.ɵɵelementStart(19, "span");
            i0.ɵɵtext(20, "\u0924\u093E\u0932\u093F\u0915\u093E\u090F\u0902 (Tables)");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "span", 13);
            i0.ɵɵtext(22);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(23, "button", 10);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_23_listener() { return ctx.setTopTab("reports"); });
            i0.ɵɵelement(24, "i", 14);
            i0.ɵɵelementStart(25, "span");
            i0.ɵɵtext(26, "\u0930\u093F\u092A\u094B\u0930\u094D\u091F\u094D\u0938 (Reports)");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "span", 13);
            i0.ɵɵtext(28);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(29, "div", 15)(30, "div", 16)(31, "button", 17);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_31_listener() { return ctx.setStudioMode("normal"); });
            i0.ɵɵelement(32, "i", 18);
            i0.ɵɵtext(33, " Normal ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(34, "button", 17);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_34_listener() { return ctx.setStudioMode("intelligent"); });
            i0.ɵɵelement(35, "i", 19);
            i0.ɵɵtext(36, " Smart ");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(37, "button", 20);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_37_listener() { return ctx.toggleTheme(); });
            i0.ɵɵelement(38, "i", 21);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(39, "div", 22);
            i0.ɵɵtemplate(40, SutramExcelStudioComponent_div_40_Template, 70, 15, "div", 23);
            i0.ɵɵtemplate(41, SutramExcelStudioComponent_div_41_Template, 7, 3, "div", 24);
            i0.ɵɵtemplate(42, SutramExcelStudioComponent_div_42_Template, 7, 3, "div", 24);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(43, "div", 25)(44, "div", 26);
            i0.ɵɵtext(45);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(46, "span", 27);
            i0.ɵɵtext(47);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(48, "span", 28);
            i0.ɵɵtext(49, "fx");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(50, "input", 29);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_input_ngModelChange_50_listener($event) { return ctx.onFormulaChange($event); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(51, "p-overlayPanel", 30, 31);
            i0.ɵɵtemplate(53, SutramExcelStudioComponent_ng_template_53_Template, 25, 7, "ng-template", 32);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(54, "div", 33)(55, "div", 34);
            i0.ɵɵelement(56, "i", 21);
            i0.ɵɵelementStart(57, "span");
            i0.ɵɵtext(58);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(59, SutramExcelStudioComponent_div_59_Template, 4, 1, "div", 35);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(60, "main", 36)(61, "sutram-grid", 37, 38);
            i0.ɵɵlistener("loadMore", function SutramExcelStudioComponent_Template_sutram_grid_loadMore_61_listener() { return ctx.onLoadMore(); })("filterChanged", function SutramExcelStudioComponent_Template_sutram_grid_filterChanged_61_listener() { return ctx.onGridFilterChanged(); })("sortChanged", function SutramExcelStudioComponent_Template_sutram_grid_sortChanged_61_listener() { return ctx.onGridSortChanged(); })("solveAllTriggered", function SutramExcelStudioComponent_Template_sutram_grid_solveAllTriggered_61_listener($event) { return ctx.onGridSolveAll($event); })("openConfig", function SutramExcelStudioComponent_Template_sutram_grid_openConfig_61_listener($event) { i0.ɵɵrestoreView(_r114); const _r3 = i0.ɵɵreference(52); return i0.ɵɵresetView(_r3.toggle($event)); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(63, "footer", 39)(64, "div", 40);
            i0.ɵɵtemplate(65, SutramExcelStudioComponent_div_65_Template, 7, 7, "div", 41);
            i0.ɵɵelementStart(66, "button", 42);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_66_listener() { return ctx.addNewBlankSheet(); });
            i0.ɵɵelement(67, "i", 43);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(68, "div", 44)(69, "div", 45)(70, "span");
            i0.ɵɵtext(71);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(72, "span");
            i0.ɵɵtext(73);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(74, SutramExcelStudioComponent_span_74_Template, 3, 0, "span", 46);
            i0.ɵɵtemplate(75, SutramExcelStudioComponent_span_75_Template, 3, 1, "span", 47);
            i0.ɵɵtemplate(76, SutramExcelStudioComponent_span_76_Template, 2, 0, "span", 48);
            i0.ɵɵtemplate(77, SutramExcelStudioComponent_span_77_Template, 2, 1, "span", 49);
            i0.ɵɵtemplate(78, SutramExcelStudioComponent_span_78_Template, 3, 4, "span", 50);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(79, "div", 45)(80, "span", 51);
            i0.ɵɵtext(81, "Ctrl+S to Sync | Enter next row | Tab next col | Click # to select row");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(82, "div", 52)(83, "button", 53);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_83_listener() { return ctx.zoomOut(); });
            i0.ɵɵelement(84, "i", 54);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(85, "span", 55);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_span_click_85_listener() { return ctx.resetZoom(); });
            i0.ɵɵtext(86);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(87, "button", 56);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_87_listener() { return ctx.zoomIn(); });
            i0.ɵɵelement(88, "i", 57);
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵtemplate(89, SutramExcelStudioComponent_div_89_Template, 16, 8, "div", 58);
            i0.ɵɵelementStart(90, "sutram-header-scanner", 59);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_sutram_header_scanner_visibleChange_90_listener($event) { return ctx.showScannerModal = $event; })("confirmed", function SutramExcelStudioComponent_Template_sutram_header_scanner_confirmed_90_listener($event) { return ctx.onScannerConfirmed($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(91, "sutram-correction-sidebar", 60);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_sutram_correction_sidebar_visibleChange_91_listener($event) { return ctx.showSidebar = $event; });
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵclassProp("dark-mode", ctx.isDarkMode);
            i0.ɵɵadvance(13);
            i0.ɵɵclassProp("active", ctx.activeTopTab === "home");
            i0.ɵɵadvance(4);
            i0.ɵɵclassProp("active", ctx.activeTopTab === "tables");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.tablesList.length || 21);
            i0.ɵɵadvance(1);
            i0.ɵɵclassProp("active", ctx.activeTopTab === "reports");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.reportsList.length);
            i0.ɵɵadvance(3);
            i0.ɵɵclassProp("active-normal", ctx.mode === "normal");
            i0.ɵɵadvance(3);
            i0.ɵɵclassProp("active-smart", ctx.mode === "intelligent");
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngClass", ctx.isDarkMode ? "pi-sun" : "pi-moon");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.activeTopTab === "home");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.activeTopTab === "tables");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.activeTopTab === "reports");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.activeCoord);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.activeColChip);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngModel", ctx.formulaValue);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("dismissable", true);
            i0.ɵɵadvance(3);
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
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngForOf", ctx.sheetTabs);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1("Sheet: ", ctx.activeSheetId, "");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate2("Rows: ", ctx.state.rows().length, "", ctx.state.totalDbRecords() > ctx.state.rows().length ? " / " + ctx.state.totalDbRecords() : "", "");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.isLoadingDb());
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.deletedRowIds().length > 0);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.stats().errorRows === 0);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.stats().errorRows > 0);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.lastSyncPerSheet[ctx.activeSheetId]);
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate1("", (ctx.zoomLevel * 100).toFixed(0), "%");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngIf", ctx.syncToast.visible);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("visible", ctx.showScannerModal)("report", ctx.scanReport)("availableHeaders", ctx.state.headers());
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("visible", ctx.showSidebar)("groups", ctx.state.correctionGroups());
        } }, dependencies: [i6.NgClass, i6.NgForOf, i6.NgIf, i7.DefaultValueAccessor, i7.NgControlStatus, i7.NgModel, i8.PrimeTemplate, i9.OverlayPanel, i10.SutramGridComponent, i11.SutramHeaderScannerComponent, i12.SutramCorrectionSidebarComponent], styles: ["\n\n\n\n\n\n\n\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n\n.sutram-excel-container[_ngcontent-%COMP%] {\n  --primary: #4f46e5;\n  --primary-hover: #4338ca;\n  --primary-soft: #e0e7ff;\n  --success: #10b981;\n  --success-soft: #d1fae5;\n  --warning: #f59e0b;\n  --warning-soft: #fef3c7;\n  --danger: #ef4444;\n  --danger-soft: #fee2e2;\n  --bg: #f8fafc;\n  --surface: #ffffff;\n  --surface-border: #e2e8f0;\n  --text: #0f172a;\n  --text-muted: #64748b;\n  --radius: 6px;\n  --header-bg: #f1f5f9;\n  --header-text: #1e293b;\n  --cell-border: rgba(125, 125, 125, 0.18);\n  --cell-height: 23px;\n  --header-height: 38px;\n  --cell-edited-bg: #fef9c3;\n  --cell-edited-border: #eab308;\n  --row-edited-bg: #fffbeb;\n  --row-new-bg: #dcfce7;\n  --row-new-border: #22c55e;\n\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n  background-color: var(--bg);\n  color: var(--text);\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  user-select: none;\n\n  &.dark-mode {\n    --bg: #0f172a;\n    --surface: #1e293b;\n    --surface-border: #334155;\n    --text: #f8fafc;\n    --text-muted: #94a3b8;\n    --header-bg: #1e293b;\n    --header-text: #cbd5e1;\n    --cell-border: rgba(255, 255, 255, 0.1);\n    --cell-edited-bg: rgba(234, 179, 8, 0.22);\n    --cell-edited-border: #facc15;\n    --row-edited-bg: rgba(234, 179, 8, 0.12);\n    --row-new-bg: rgba(34, 197, 94, 0.18);\n    --row-new-border: #4ade80;\n  }\n}\n\n\n\n\n\n.studio-header[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n  user-select: none;\n}\n\n\n\n.ribbon-menu-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2px 10px;\n  height: 32px;\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n}\n\n.menu-bar-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.brand[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.brand-icon[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 11px;\n}\n.brand-title[_ngcontent-%COMP%] {\n  font-size: 11.5px;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  color: var(--text);\n\n  .version-tag {\n    font-size: 9px;\n    padding: 1px 4px;\n    background: rgba(16, 185, 129, 0.18);\n    color: #059669;\n    border-radius: 3px;\n    font-weight: 700;\n  }\n}\n\n\n\n.ribbon-tabs-nav[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n.ribbon-tab-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 3px 11px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.12s ease;\n\n  i {\n    font-size: 10.5px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.08);\n    color: var(--text);\n  }\n\n  &.active {\n    background: var(--surface);\n    color: var(--primary);\n    border-color: var(--surface-border) var(--surface-border) transparent var(--surface-border);\n    border-bottom: 2px solid var(--primary);\n    font-weight: 700;\n  }\n}\n.ribbon-badge[_ngcontent-%COMP%] {\n  font-size: 9px;\n  padding: 1px 4px;\n  border-radius: 999px;\n  background: rgba(79, 70, 229, 0.12);\n  color: var(--primary);\n  font-weight: 700;\n}\n\n.menu-bar-right[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.mode-pill-toggle[_ngcontent-%COMP%] {\n  background: rgba(125, 125, 125, 0.12);\n  border-radius: 999px;\n  padding: 2px;\n  display: flex;\n  gap: 2px;\n}\n.mode-pill-btn[_ngcontent-%COMP%] {\n  padding: 2px 9px;\n  border-radius: 999px;\n  font-size: 10px;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  i { font-size: 9.5px; }\n}\n.mode-pill-btn.active-normal[_ngcontent-%COMP%] {\n  background: #3b82f6;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.35);\n}\n.mode-pill-btn.active-smart[_ngcontent-%COMP%] {\n  background: #10b981;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.35);\n}\n\n\n\n.ribbon-strip[_ngcontent-%COMP%] {\n  background: var(--surface);\n  padding: 4px 10px;\n  height: 60px;\n  display: flex;\n  align-items: center;\n  overflow: hidden;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);\n}\n\n\n\n.ribbon-content-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n\n.ribbon-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: space-between;\n  height: 52px;\n  padding: 0 4px;\n}\n\n.ribbon-group-items[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-grow: 1;\n}\n\n.ribbon-group-name[_ngcontent-%COMP%] {\n  font-size: 8.5px;\n  color: var(--text-muted);\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  margin-top: 1px;\n}\n\n.ribbon-v-sep[_ngcontent-%COMP%] {\n  width: 1px;\n  height: 40px;\n  background: var(--surface-border);\n  opacity: 0.75;\n  margin: 0 4px;\n}\n\n.ribbon-tool-btn[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 2px;\n  padding: 2px 7px;\n  height: 42px;\n  border-radius: 4px;\n  border: 1px solid transparent;\n  background: transparent;\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.12s;\n  font-size: 10.5px;\n\n  i {\n    font-size: 13px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.09);\n    border-color: var(--surface-border);\n  }\n\n  &.active {\n    background: var(--primary-soft);\n    color: var(--primary);\n    border-color: rgba(79, 70, 229, 0.3);\n    font-weight: 700;\n  }\n\n  .ribbon-tool-lbl {\n    font-size: 9px;\n    white-space: nowrap;\n    font-weight: 500;\n  }\n}\n\n.ribbon-mini-col[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: row;\n  gap: 2px;\n}\n\n.ribbon-mini-btn[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 3px;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  font-size: 9.5px;\n\n  &:hover { background: rgba(125, 125, 125, 0.1); }\n}\n\n.ribbon-search-field[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 165px;\n\n  .search-ico {\n    position: absolute;\n    left: 7px;\n    font-size: 9.5px;\n    color: var(--text-muted);\n    pointer-events: none;\n  }\n\n  .ribbon-search-inp {\n    width: 100%;\n    height: 24px;\n    padding: 2px 20px 2px 22px;\n    font-size: 10.5px;\n    border-radius: 4px;\n    border: 1px solid var(--surface-border);\n    background: var(--surface);\n    color: var(--text);\n    outline: none;\n    transition: border-color 0.12s ease;\n\n    &:focus {\n      border-color: var(--primary);\n    }\n  }\n\n  .clear-btn-inline {\n    position: absolute;\n    right: 5px;\n    background: transparent;\n    border: none;\n    font-size: 9px;\n    cursor: pointer;\n    color: var(--text-muted);\n  }\n\n  .spin-inline {\n    position: absolute;\n    right: 5px;\n    font-size: 9px;\n    color: var(--primary);\n  }\n}\n\n.ribbon-btn-action[_ngcontent-%COMP%] {\n  background: var(--primary) !important;\n  color: #ffffff !important;\n  border-color: var(--primary) !important;\n  font-weight: 700 !important;\n\n  &:hover {\n    filter: brightness(1.1);\n  }\n\n  .sync-count-tag {\n    font-size: 8.5px;\n    padding: 0 4px;\n    background: #ffffff;\n    color: var(--primary);\n    border-radius: 999px;\n    font-weight: 800;\n    margin-left: 2px;\n  }\n}\n\n.ribbon-record-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 7px;\n  background: rgba(125, 125, 125, 0.08);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--text-muted);\n  height: 24px;\n}\n\n\n\n.ribbon-scroll-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.ribbon-boxes-track[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  overflow-x: auto;\n  scrollbar-width: thin;\n  height: 100%;\n  flex-grow: 1;\n  padding: 2px 2px;\n\n  &::-webkit-scrollbar {\n    height: 4px;\n  }\n  &::-webkit-scrollbar-thumb {\n    background: rgba(125, 125, 125, 0.25);\n    border-radius: 2px;\n  }\n}\n\n.ribbon-small-box[_ngcontent-%COMP%] {\n  position: relative;\n  flex-shrink: 0;\n  min-width: 115px;\n  max-width: 140px;\n  height: 46px;\n  background: var(--surface);\n  border: 1px solid var(--surface-border);\n  border-radius: 5px;\n  padding: 3px 8px 3px 6px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: all 0.12s ease;\n  user-select: none;\n\n  &:hover {\n    border-color: var(--primary);\n    background: var(--primary-soft);\n    transform: translateY(-1px);\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);\n  }\n\n  &.active-box {\n    border-color: rgba(16, 185, 129, 0.6);\n    background: rgba(16, 185, 129, 0.08);\n  }\n\n  .box-star-btn {\n    position: absolute;\n    top: 2px;\n    right: 2px;\n    width: 15px;\n    height: 15px;\n    border: none;\n    background: transparent;\n    cursor: pointer;\n    color: var(--text-muted);\n    font-size: 9px;\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 2;\n    transition: all 0.12s;\n\n    &:hover {\n      color: #f59e0b;\n      transform: scale(1.2);\n    }\n\n    &.starred {\n      color: #f59e0b;\n    }\n  }\n\n  .box-icon-wrap {\n    width: 25px;\n    height: 25px;\n    border-radius: 4px;\n    background: var(--primary-soft);\n    color: var(--primary);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 11px;\n    flex-shrink: 0;\n\n    &.report-icon-bg {\n      background: rgba(16, 185, 129, 0.15);\n      color: #059669;\n    }\n  }\n\n  .box-info {\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n    padding-right: 10px;\n\n    .box-name-hin {\n      font-size: 10.5px;\n      font-weight: 700;\n      color: var(--text);\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .box-name-eng {\n      font-size: 9px;\n      color: var(--text-muted);\n      font-family: monospace;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n  }\n\n  .box-dot {\n    position: absolute;\n    bottom: 3px;\n    right: 3px;\n    width: 5px;\n    height: 5px;\n    border-radius: 50%;\n    background: #10b981;\n  }\n}\n\n.btn-group-cmd[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.cmd-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  transition: all 0.15s;\n  user-select: none;\n\n  i {\n    font-size: 10.5px;\n  }\n}\n.cmd-btn[_ngcontent-%COMP%]:hover { background: rgba(125, 125, 125, 0.1); }\n.cmd-btn.active[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.cmd-btn-primary[_ngcontent-%COMP%] { background: var(--primary); color: white; border-color: var(--primary); }\n.cmd-btn-primary[_ngcontent-%COMP%]:hover { background: var(--primary-hover); }\n.cmd-btn-success[_ngcontent-%COMP%] { background: var(--success); color: white; border-color: var(--success); }\n.cmd-btn-success[_ngcontent-%COMP%]:hover { background: #059669; }\n.cmd-btn-warning[_ngcontent-%COMP%] { background: var(--warning-soft); color: #b45309; border-color: rgba(245, 158, 11, 0.3); }\n\n.sync-badge-count[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: #f59e0b;\n  color: #ffffff;\n  font-size: 9.5px;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 999px;\n  margin-left: 4px;\n  line-height: 1.1;\n}\n\n\n\n.formula-bar-row[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n}\n.coord-box[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 22px;\n  line-height: 18px;\n  text-align: center;\n  font-weight: 700;\n  font-size: 11px;\n  padding: 1px 3px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  background: rgba(125, 125, 125, 0.05);\n}\n.active-col-chip[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n  padding: 1px 6px;\n  height: 20px;\n  line-height: 17px;\n  border-radius: 4px;\n  font-size: 10.5px;\n  font-weight: 600;\n  white-space: nowrap;\n  max-width: 170px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.formula-input[_ngcontent-%COMP%] {\n  flex-grow: 1;\n  height: 22px;\n  padding: 2px 7px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 11.5px;\n  font-family: inherit;\n  outline: none;\n  background: var(--surface);\n  color: var(--text);\n}\n.formula-input[_ngcontent-%COMP%]:focus { border-color: var(--primary); }\n\n\n\n.control-settings-bar[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  flex-shrink: 0;\n  font-size: 11px;\n}\n.ctrl-bar-left[_ngcontent-%COMP%], .ctrl-bar-right[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.ctrl-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 8px;\n  height: 23px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text-muted);\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n\n  i {\n    font-size: 10px;\n  }\n}\n.ctrl-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text);\n}\n.ctrl-btn.active[_ngcontent-%COMP%] {\n  color: var(--primary);\n  background: var(--primary-soft);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.ctrl-btn-danger[_ngcontent-%COMP%] {\n  color: var(--danger);\n  background: var(--danger-soft);\n  border-color: rgba(239, 68, 68, 0.3);\n}\n.ctrl-btn-danger[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.2);\n}\n.ctrl-dot[_ngcontent-%COMP%] {\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  background: #10b981;\n  display: inline-block;\n}\n.ctrl-search-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  flex-grow: 1;\n  max-width: 420px;\n}\n.ctrl-search-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 8px;\n  color: var(--text-muted);\n  font-size: 10px;\n  pointer-events: none;\n}\n.ctrl-search-input[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 23px;\n  padding: 2px 24px 2px 24px;\n  border: 1px solid var(--surface-border);\n  border-radius: 999px;\n  font-size: 11px;\n  background: rgba(125, 125, 125, 0.05);\n  color: var(--text);\n  outline: none;\n  transition: all 0.15s;\n}\n.ctrl-search-input[_ngcontent-%COMP%]:focus {\n  border-color: var(--primary);\n  background: var(--surface);\n  box-shadow: 0 0 0 2px var(--primary-soft);\n}\n.ctrl-search-clear[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 6px;\n  background: none;\n  border: none;\n  font-size: 10px;\n  color: var(--text-muted);\n  cursor: pointer;\n  padding: 1px 4px;\n  border-radius: 50%;\n}\n.ctrl-search-clear[_ngcontent-%COMP%]:hover {\n  color: var(--danger);\n  background: rgba(125, 125, 125, 0.15);\n}\n.ctrl-search-spinner[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 24px;\n  color: var(--primary);\n  font-size: 10px;\n}\n.ctrl-record-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 1px 7px;\n  height: 21px;\n  border-radius: 999px;\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text-muted);\n  font-size: 10px;\n  font-weight: 600;\n  white-space: nowrap;\n\n  i {\n    font-size: 10px;\n  }\n}\n\n\n\n.status-strip[_ngcontent-%COMP%] {\n  padding: 3px 14px;\n  font-size: 11.5px;\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  background: rgba(125, 125, 125, 0.04);\n}\n.status-strip.strip-error[_ngcontent-%COMP%] { background: #fef2f2; color: #991b1b; }\n.status-strip.strip-clean[_ngcontent-%COMP%] { background: #f0fdf4; color: #166534; }\n.status-strip.strip-suggestion[_ngcontent-%COMP%] { background: #fffbeb; color: #92400e; }\n\n\n\n.spreadsheet-canvas[_ngcontent-%COMP%] {\n  flex-grow: 1;\n  overflow: hidden;\n  background: var(--surface);\n  position: relative;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n\n  sutram-grid {\n    display: block;\n    width: 100%;\n    height: 100%;\n    flex: 1;\n    min-height: 0;\n  }\n}\n\n\n\n.studio-footer[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  background: var(--surface);\n  border-top: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n}\n.sheet-tabs-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  background: rgba(125, 125, 125, 0.05);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 2px 6px;\n  overflow-x: auto;\n  scrollbar-width: none;\n}\n.sheet-tabs-bar[_ngcontent-%COMP%]::-webkit-scrollbar { display: none; }\n\n.tab-pill[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 12px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11.5px;\n  font-weight: 600;\n  cursor: pointer;\n  color: var(--text-muted);\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  white-space: nowrap;\n  transition: all 0.15s;\n}\n.tab-pill[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.1);\n  color: var(--text);\n}\n.tab-pill.active-tab[_ngcontent-%COMP%] {\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-color: rgba(16, 185, 129, 0.25);\n  border-bottom: 2px solid #10b981;\n  font-weight: 700;\n}\n\n.sheet-tab-badge[_ngcontent-%COMP%] {\n  font-size: 9.5px;\n  padding: 1px 5px;\n  background: rgba(16, 185, 129, 0.2);\n  color: #059669;\n  border-radius: 999px;\n  font-weight: 700;\n}\n\n.add-tab-btn[_ngcontent-%COMP%] {\n  padding: 2px 8px;\n  border: 1px dashed rgba(125, 125, 125, 0.4);\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  color: var(--primary);\n  margin-left: 4px;\n}\n.add-tab-btn[_ngcontent-%COMP%]:hover { background: rgba(79, 70, 229, 0.1); }\n\n.sheet-tab-rough-badge[_ngcontent-%COMP%] {\n  font-size: 9px;\n  padding: 1px 4px;\n  background: rgba(245, 158, 11, 0.2);\n  color: #d97706;\n  border-radius: 3px;\n  font-weight: 700;\n  text-transform: uppercase;\n}\n\n.tab-close-btn[_ngcontent-%COMP%] {\n  margin-left: 3px;\n  width: 15px;\n  height: 15px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted);\n  border-radius: 3px;\n  cursor: pointer;\n  font-size: 9.5px;\n  line-height: 1;\n  padding: 0;\n  transition: all 0.12s;\n\n  &:hover {\n    background: rgba(239, 68, 68, 0.18);\n    color: #ef4444;\n  }\n}\n\n.bottom-status-subrow[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 3px 14px;\n  font-size: 11px;\n  color: var(--text-muted);\n}\n.zoom-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  padding: 1px 4px;\n}\n.zoom-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  color: var(--text);\n  padding: 1px 5px;\n  font-size: 11px;\n}\n.zoom-display[_ngcontent-%COMP%] {\n  font-weight: 700;\n  cursor: pointer;\n  padding: 0 4px;\n}\n\n\n\n.sync-toast-hud[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 50px;\n  right: 20px;\n  z-index: 2500;\n  min-width: 320px;\n  max-width: 440px;\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);\n  overflow: hidden;\n  animation: _ngcontent-%COMP%_toastSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);\n  font-size: 11.5px;\n}\n@keyframes _ngcontent-%COMP%_toastSlideIn {\n  from { opacity: 0; transform: translateY(-12px) scale(0.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n.sync-toast-header[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--surface-border);\n  background: rgba(125, 125, 125, 0.04);\n}\n.sync-toast-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-weight: 700;\n  font-size: 12px;\n}\n.sync-toast-close[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: var(--text-muted);\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 5px;\n  border-radius: 3px;\n}\n.sync-toast-close[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.12);\n  color: var(--text);\n}\n.sync-toast-body[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.sync-toast-stats[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.sync-badge-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n}\n.chip-success[_ngcontent-%COMP%] {\n  background: var(--success-soft);\n  color: var(--success);\n}\n.chip-info[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n}\n.chip-warning[_ngcontent-%COMP%] {\n  background: var(--warning-soft);\n  color: #b45309;\n}\n.chip-danger[_ngcontent-%COMP%] {\n  background: var(--danger-soft);\n  color: var(--danger);\n}\n.sync-toast-errors[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  padding: 6px 8px;\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.2);\n  border-radius: 4px;\n  font-size: 10.5px;\n  color: #ef4444;\n  max-height: 140px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n\n\n\n.last-sync-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 1px 7px;\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-radius: 4px;\n  font-weight: 600;\n  font-size: 10.5px;\n  border: 1px solid rgba(16, 185, 129, 0.25);\n\n  &.sync-error {\n    background: rgba(239, 68, 68, 0.12);\n    color: #ef4444;\n    border-color: rgba(239, 68, 68, 0.25);\n  }\n}\n\n\n\n.sync-progress-wrap[_ngcontent-%COMP%] {\n  width: 100%;\n}\n.sync-progress-track[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 6px;\n  background: rgba(125, 125, 125, 0.2);\n  border-radius: 999px;\n  overflow: hidden;\n}\n.sync-progress-bar[_ngcontent-%COMP%] {\n  height: 100%;\n  background: linear-gradient(90deg, #3b82f6, #10b981);\n  border-radius: 999px;\n  transition: width 0.2s ease-in-out;\n}\n\n\n\n\n\n  .sutram-col-config-popover {\n  width: 340px !important;\n  height: 500px !important;\n  max-height: calc(100vh - 120px) !important;\n  font-size: 11.5px;\n  border-radius: 8px !important;\n  overflow: hidden !important;\n  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1) !important;\n  border: 1px solid var(--surface-border, #e2e8f0) !important;\n  background: var(--surface, #ffffff) !important;\n  color: var(--text, #0f172a) !important;\n  display: flex !important;\n  flex-direction: column !important;\n\n  .p-overlaypanel-content {\n    padding: 0 !important;\n    background: transparent !important;\n    color: inherit !important;\n    width: 100% !important;\n    height: 100% !important;\n    display: flex !important;\n    flex-direction: column !important;\n    flex: 1 1 auto !important;\n    min-height: 0 !important;\n    overflow: hidden !important;\n  }\n}\n\n.col-dropdown-menu[_ngcontent-%COMP%] {\n  width: 100% !important;\n  height: 100% !important;\n  max-height: none !important;\n  background: var(--surface, #ffffff);\n  color: var(--text, #0f172a);\n  border-radius: 8px;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  flex: 1 1 auto;\n  min-height: 0;\n  user-select: none;\n\n  .col-dd-header {\n    padding: 8px 10px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n    background: rgba(125, 125, 125, 0.03);\n    flex-shrink: 0 !important;\n  }\n\n  .col-dd-search-wrap {\n    position: relative;\n    display: flex;\n    align-items: center;\n\n    .col-dd-search-icon {\n      position: absolute;\n      left: 8px;\n      color: var(--text-muted, #64748b);\n      font-size: 11px;\n      pointer-events: none;\n    }\n\n    .col-dd-search-input {\n      width: 100%;\n      height: 28px;\n      padding: 4px 26px;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      border-radius: 4px;\n      font-size: 11.5px;\n      background: var(--bg, #f8fafc);\n      color: var(--text, #0f172a);\n      outline: none;\n      transition: border-color 0.12s;\n\n      &:focus {\n        border-color: var(--primary, #4f46e5);\n      }\n    }\n\n    .btn-clear-search-inline {\n      position: absolute;\n      right: 8px;\n      background: transparent;\n      border: none;\n      color: var(--text-muted, #64748b);\n      cursor: pointer;\n      font-size: 11px;\n      padding: 0;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n\n      &:hover {\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .col-dd-actions {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0 2px;\n\n    .col-dd-actions-left {\n      display: flex;\n      gap: 4px;\n    }\n\n    .col-dd-act-btn {\n      padding: 2px 7px;\n      font-size: 10.5px;\n      font-weight: 600;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      background: var(--surface, #ffffff);\n      color: var(--text-muted, #64748b);\n      border-radius: 3px;\n      cursor: pointer;\n      transition: all 0.12s;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n        color: var(--text, #0f172a);\n      }\n    }\n\n    .col-dd-count {\n      font-size: 10.5px;\n      color: var(--text-muted, #64748b);\n      font-weight: 600;\n    }\n  }\n\n  .col-dd-body {\n    padding: 6px 8px;\n    overflow-y: auto !important;\n    overflow-x: hidden !important;\n    flex: 1 1 0 !important;\n    min-height: 0 !important;\n    max-height: none !important;\n    display: flex;\n    flex-direction: column;\n    gap: 3px;\n    overscroll-behavior: contain;\n    scrollbar-width: thin;\n\n    &::-webkit-scrollbar {\n      width: 5px;\n    }\n    &::-webkit-scrollbar-track {\n      background: rgba(125, 125, 125, 0.05);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb {\n      background: rgba(125, 125, 125, 0.3);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb:hover {\n      background: var(--primary, #4f46e5);\n    }\n  }\n\n  .col-dd-section-title {\n    font-size: 10px;\n    font-weight: 700;\n    color: var(--text-muted, #64748b);\n    margin: 3px 0 2px 4px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    flex-shrink: 0 !important;\n  }\n\n  .col-dd-item {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 4px 6px;\n    border-radius: 4px;\n    cursor: pointer;\n    user-select: none;\n    transition: background 0.1s;\n    font-size: 11.5px;\n    color: var(--text, #0f172a);\n    flex-shrink: 0 !important;\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.08);\n    }\n\n    .col-dd-item-left {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .col-dd-item-name {\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n  }\n\n  .custom-check {\n    width: 14px;\n    height: 14px;\n    cursor: pointer;\n    accent-color: var(--primary, #4f46e5);\n    margin: 0;\n    flex-shrink: 0;\n  }\n\n  .type-badge {\n    font-size: 9.5px;\n    padding: 1px 5px;\n    border-radius: 3px;\n    background: rgba(125, 125, 125, 0.12);\n    color: var(--text-muted, #64748b);\n    font-family: 'JetBrains Mono', monospace;\n    flex-shrink: 0;\n  }\n\n  \n\n  .col-dd-group {\n    border: 1px solid var(--surface-border, #e2e8f0);\n    border-radius: 5px;\n    margin: 3px 0;\n    overflow: hidden;\n    background: rgba(125, 125, 125, 0.02);\n    flex-shrink: 0 !important;\n\n    &.fk-active-group {\n      border-color: rgba(79, 70, 229, 0.35);\n    }\n\n    .col-dd-group-header {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      padding: 5px 8px;\n      background: rgba(125, 125, 125, 0.06);\n      cursor: pointer;\n      user-select: none;\n      font-size: 11.5px;\n      font-weight: 600;\n      flex-shrink: 0 !important;\n      min-height: 28px !important;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n      }\n\n      .col-dd-group-left {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        overflow: hidden;\n      }\n\n      .fk-expand-toggle {\n        font-size: 10px;\n        color: var(--text-muted, #64748b);\n        width: 12px;\n        text-align: center;\n        transition: transform 0.18s ease;\n\n        &.rotated {\n          transform: rotate(90deg);\n        }\n      }\n\n      .fk-group-pill {\n        font-size: 9.5px;\n        padding: 1px 5px;\n        border-radius: 999px;\n        font-weight: 600;\n      }\n    }\n\n    .col-dd-group-items {\n      padding: 3px 4px 4px 18px;\n      background: var(--surface, #ffffff);\n      border-top: 1px solid var(--surface-border, #e2e8f0);\n      display: flex;\n      flex-direction: column;\n      gap: 2px;\n      max-height: none !important;\n      overflow: visible !important;\n    }\n  }\n\n  .col-dd-empty {\n    padding: 16px;\n    text-align: center;\n    color: var(--text-muted, #64748b);\n    font-size: 11.5px;\n  }\n\n  .col-dd-footer {\n    padding: 6px 10px;\n    border-top: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    background: rgba(125, 125, 125, 0.03);\n    flex-shrink: 0 !important;\n  }\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramExcelStudioComponent, [{
        type: Component,
        args: [{ selector: 'sutram-excel-studio', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-excel-studio.component.html -->\n<div class=\"sutram-excel-container\" [class.dark-mode]=\"isDarkMode\">\n\n  <!-- 1. TOP EXCEL-STYLE RIBBON HEADER (Few cm area) -->\n  <header class=\"studio-header\">\n    <!-- Top Menu Bar: Brand, Ribbon Tabs, Mode Switch & Theme -->\n    <div class=\"ribbon-menu-bar\">\n      <div class=\"menu-bar-left\">\n        <div class=\"brand\">\n          <div class=\"brand-icon\"><i class=\"pi pi-table\"></i></div>\n          <div class=\"brand-title\">\n            <span>Sutram Studio</span>\n            <span class=\"version-tag\">v2.0</span>\n          </div>\n        </div>\n\n        <!-- Excel Ribbon Tabs: Home, Tables, Reports -->\n        <nav class=\"ribbon-tabs-nav\">\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'home'\"\n                  (click)=\"setTopTab('home')\">\n            <i class=\"pi pi-home\"></i>\n            <span>\u0939\u094B\u092E (Home)</span>\n          </button>\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'tables'\"\n                  (click)=\"setTopTab('tables')\">\n            <i class=\"pi pi-database\"></i>\n            <span>\u0924\u093E\u0932\u093F\u0915\u093E\u090F\u0902 (Tables)</span>\n            <span class=\"ribbon-badge\">{{ tablesList.length || 21 }}</span>\n          </button>\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'reports'\"\n                  (click)=\"setTopTab('reports')\">\n            <i class=\"pi pi-chart-bar\"></i>\n            <span>\u0930\u093F\u092A\u094B\u0930\u094D\u091F\u094D\u0938 (Reports)</span>\n            <span class=\"ribbon-badge\">{{ reportsList.length }}</span>\n          </button>\n        </nav>\n      </div>\n\n      <!-- Menu Bar Right: Mode Switcher & Dark Mode Toggle -->\n      <div class=\"menu-bar-right\">\n        <div class=\"mode-pill-toggle\">\n          <button class=\"mode-pill-btn\" [class.active-normal]=\"mode === 'normal'\" (click)=\"setStudioMode('normal')\">\n            <i class=\"pi pi-pencil\"></i> Normal\n          </button>\n          <button class=\"mode-pill-btn\" [class.active-smart]=\"mode === 'intelligent'\" (click)=\"setStudioMode('intelligent')\">\n            <i class=\"pi pi-bolt\"></i> Smart\n          </button>\n        </div>\n\n        <button class=\"cmd-btn\" style=\"padding: 3px 6px;\" (click)=\"toggleTheme()\" title=\"\u0932\u093E\u0907\u091F / \u0921\u093E\u0930\u094D\u0915 \u092E\u094B\u0921\">\n          <i class=\"pi\" [ngClass]=\"isDarkMode ? 'pi-sun' : 'pi-moon'\"></i>\n        </button>\n      </div>\n    </div>\n\n    <!-- Ribbon Content Strip (Few cm area, switches with tabs, horizontally scrollable) -->\n    <div class=\"ribbon-strip\">\n\n      <!-- RIBBON TAB 1: HOME TOOLS -->\n      <div *ngIf=\"activeTopTab === 'home'\" class=\"ribbon-content-row\">\n        <!-- Section: Style & Format -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\" [class.active]=\"isBoldActive\" (click)=\"isBoldActive = !isBoldActive\" title=\"Bold (Ctrl+B)\">\n              <span style=\"font-weight: 800; font-size: 13px;\">B</span>\n              <span class=\"ribbon-tool-lbl\">Bold</span>\n            </button>\n            <div class=\"ribbon-mini-col\">\n              <button class=\"ribbon-mini-btn\" (click)=\"textAlign = 'left'\" title=\"Align Left\"><i class=\"pi pi-align-left\"></i></button>\n              <button class=\"ribbon-mini-btn\" (click)=\"textAlign = 'center'\" title=\"Align Center\"><i class=\"pi pi-align-center\"></i></button>\n              <button class=\"ribbon-mini-btn\" (click)=\"textAlign = 'right'\" title=\"Align Right\"><i class=\"pi pi-align-right\"></i></button>\n            </div>\n            <button class=\"ribbon-tool-btn\" (click)=\"colConfigOp.toggle($event)\" title=\"Choose Visible Columns\">\n              <i class=\"pi pi-sliders-h\" style=\"color: var(--primary);\"></i>\n              <span class=\"ribbon-tool-lbl\">Columns ({{ visibleHeadersCount }})</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">\u092A\u094D\u0930\u093E\u0930\u0942\u092A (Format)</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\"></div>\n\n        <!-- Section: Data Actions -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button *ngIf=\"!isCurrentSheetRough\" class=\"ribbon-tool-btn\" (click)=\"loadTableDataFromDb()\" title=\"\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0938\u0947 \u0907\u0938 \u091F\u0947\u092C\u0932 \u0915\u093E \u0932\u093E\u0907\u0935 \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0915\u0930\u0947\u0902\">\n              <i class=\"pi pi-database text-success\"></i>\n              <span class=\"ribbon-tool-lbl\">Load Data</span>\n            </button>\n            <button class=\"ribbon-tool-btn\" (click)=\"fileInput.click()\" title=\"\u092C\u093E\u0939\u0930\u0940 Excel (.xlsx) \u0916\u094B\u0932\u0947\u0902\">\n              <i class=\"pi pi-folder-open\"></i>\n              <span class=\"ribbon-tool-lbl\">Open File</span>\n            </button>\n            <input #fileInput type=\"file\" accept=\".xlsx, .xls, .csv\" style=\"display:none;\" (change)=\"onFileUpload($event)\">\n            <button class=\"ribbon-tool-btn\" (click)=\"exportExcel()\" title=\"Excel \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902\">\n              <i class=\"pi pi-download\"></i>\n              <span class=\"ribbon-tool-lbl\">Export</span>\n            </button>\n            <button class=\"ribbon-tool-btn\" (click)=\"state.clearGrid()\" title=\"\u0936\u0940\u091F \u0916\u093E\u0932\u0940 \u0915\u0930\u0947\u0902\">\n              <i class=\"pi pi-trash text-danger\"></i>\n              <span class=\"ribbon-tool-lbl\">Clear</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">\u0921\u0947\u091F\u093E (Data)</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\"></div>\n\n        <!-- Section: Search & Filters -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\" [class.active]=\"state.filtersEnabled()\" (click)=\"state.toggleFiltersEnabled()\" title=\"\u092B\u093C\u093F\u0932\u094D\u091F\u0930 \u091A\u093E\u0932\u0942/\u092C\u0902\u0926\">\n              <i class=\"pi pi-filter\"></i>\n              <span class=\"ribbon-tool-lbl\">Filters</span>\n            </button>\n            <button class=\"ribbon-tool-btn\" [class.active]=\"state.sortingEnabled()\" (click)=\"state.toggleSortingEnabled()\" title=\"\u0938\u0949\u0930\u094D\u091F\u093F\u0902\u0917 \u091A\u093E\u0932\u0942/\u092C\u0902\u0926\">\n              <i class=\"pi pi-sort-alt\"></i>\n              <span class=\"ribbon-tool-lbl\">Sorting</span>\n            </button>\n            <div class=\"ribbon-search-field\">\n              <i class=\"pi pi-search search-ico\"></i>\n              <input type=\"text\"\n                     class=\"ribbon-search-inp\"\n                     placeholder=\"\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0938\u0940\u0927\u093E \u0916\u094B\u091C\u0947\u0902...\"\n                     [ngModel]=\"state.dbSearchQuery()\"\n                     (ngModelChange)=\"onDbSearchInput($event)\">\n              <button *ngIf=\"state.dbSearchQuery()\" class=\"clear-btn-inline\" (click)=\"clearDbSearch()\">\u2715</button>\n              <span *ngIf=\"state.isLoadingDb()\" class=\"spin-inline\"><i class=\"pi pi-spin pi-spinner\"></i></span>\n            </div>\n          </div>\n          <span class=\"ribbon-group-name\">\u0916\u094B\u091C \u0935 \u092B\u093C\u093F\u0932\u094D\u091F\u0930 (Search)</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\"></div>\n\n        <!-- Section: Save / Sync -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <!-- Case A: Rough Sheet -> Save Locally -->\n            <button *ngIf=\"isCurrentSheetRough\"\n                    class=\"ribbon-tool-btn ribbon-btn-action\"\n                    (click)=\"saveRoughSheetLocally()\"\n                    title=\"\u0930\u092B \u0936\u0940\u091F \u0915\u094B \u0932\u094B\u0915\u0932 \u0938\u094D\u091F\u094B\u0930\u0947\u091C \u092E\u0947\u0902 \u0938\u0939\u0947\u091C\u0947\u0902 (Ctrl+S)\">\n              <i class=\"pi pi-save\"></i>\n              <span class=\"ribbon-tool-lbl\">\u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0938\u0939\u0947\u091C\u0947\u0902</span>\n            </button>\n\n            <!-- Case B: Database Table Sheet -> Sync to DB -->\n            <button *ngIf=\"!isCurrentSheetRough\"\n                    class=\"ribbon-tool-btn ribbon-btn-action\"\n                    [disabled]=\"state.pendingChangesCount() === 0 || state.hasErrors()\"\n                    (click)=\"startImport()\"\n                    title=\"\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0938\u0947\u0935/\u0907\u092E\u094D\u092A\u094B\u0930\u094D\u091F \u0915\u0930\u0947\u0902 (Ctrl+S)\">\n              <i class=\"pi pi-cloud-upload\"></i>\n              <span class=\"ribbon-tool-lbl\">Sync to DB</span>\n              <span *ngIf=\"state.pendingChangesCount() > 0\" class=\"sync-count-tag\">{{ state.pendingChangesCount() }}</span>\n            </button>\n\n            <div class=\"ribbon-record-pill\" title=\"\u0915\u0941\u0932 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0930\u093F\u0915\u0949\u0930\u094D\u0921\u094D\u0938 \u090F\u0935\u0902 \u0932\u094B\u0921 \u0938\u094D\u0925\u093F\u0924\u093F\">\n              <i class=\"pi pi-database\"></i>\n              <span>{{ state.rows().length }} / {{ state.totalDbRecords() }}</span>\n            </div>\n          </div>\n          <span class=\"ribbon-group-name\">\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u0930\u0947\u0902 (Save / Sync)</span>\n        </div>\n      </div>\n\n      <!-- RIBBON TAB 2: TABLES (Horizontal Scrolling Strip with Small Simple Boxes) -->\n      <div *ngIf=\"activeTopTab === 'tables'\" class=\"ribbon-scroll-row\">\n        <!-- Quick search input inside tables strip -->\n        <div class=\"ribbon-search-field\" style=\"width: 140px; min-width: 140px; margin-right: 6px;\">\n          <i class=\"pi pi-search search-ico\"></i>\n          <input type=\"text\"\n                 class=\"ribbon-search-inp\"\n                 placeholder=\"\u0924\u093E\u0932\u093F\u0915\u093E \u0916\u094B\u091C\u0947\u0902...\"\n                 [(ngModel)]=\"tableSearchQuery\">\n          <button *ngIf=\"tableSearchQuery\" class=\"clear-btn-inline\" (click)=\"tableSearchQuery = ''\">\u2715</button>\n        </div>\n\n        <!-- Small simple boxes for each table -->\n        <div class=\"ribbon-boxes-track\">\n          <div *ngFor=\"let tbl of filteredTables\"\n               class=\"ribbon-small-box\"\n               [class.active-box]=\"isTableOpen(tbl.table)\"\n               (click)=\"openTableInSheet(tbl.table)\"\n               [title]=\"(tbl.display_name || tbl.table) + ' (' + tbl.table + ')'\">\n\n            <!-- Corner Star Favorite Button -->\n            <button type=\"button\"\n                    class=\"box-star-btn\"\n                    [class.starred]=\"favoriteTables.has(tbl.table)\"\n                    (click)=\"toggleFavoriteTable(tbl.table, $event)\"\n                    [title]=\"favoriteTables.has(tbl.table) ? '\u092A\u0938\u0902\u0926\u0940\u0926\u093E \u0938\u0947 \u0939\u091F\u093E\u090F\u0902' : '\u0938\u094D\u091F\u093E\u0930\u094D\u091F\u0905\u092A \u0921\u093F\u092B\u093C\u0949\u0932\u094D\u091F \u092E\u0947\u0902 \u091C\u094B\u0921\u093C\u0947\u0902'\">\n              <i class=\"pi\" [ngClass]=\"favoriteTables.has(tbl.table) ? 'pi-star-fill' : 'pi-star'\"></i>\n            </button>\n\n            <div class=\"box-icon-wrap\">\n              <i class=\"pi pi-table\"></i>\n            </div>\n            <div class=\"box-info\">\n              <span class=\"box-name-hin\">{{ tbl.display_name || tbl.table }}</span>\n              <span class=\"box-name-eng\">{{ tbl.table }}</span>\n            </div>\n            <span *ngIf=\"isTableOpen(tbl.table)\" class=\"box-dot\" title=\"\u0936\u0940\u091F \u0916\u0941\u0932\u0940 \u0939\u0948\"></span>\n          </div>\n        </div>\n      </div>\n\n      <!-- RIBBON TAB 3: REPORTS (Horizontal Scrolling Strip with Small Simple Boxes) -->\n      <div *ngIf=\"activeTopTab === 'reports'\" class=\"ribbon-scroll-row\">\n        <!-- Quick search input inside reports strip -->\n        <div class=\"ribbon-search-field\" style=\"width: 140px; min-width: 140px; margin-right: 6px;\">\n          <i class=\"pi pi-search search-ico\"></i>\n          <input type=\"text\"\n                 class=\"ribbon-search-inp\"\n                 placeholder=\"\u0930\u093F\u092A\u094B\u0930\u094D\u091F \u0916\u094B\u091C\u0947\u0902...\"\n                 [(ngModel)]=\"reportSearchQuery\">\n          <button *ngIf=\"reportSearchQuery\" class=\"clear-btn-inline\" (click)=\"reportSearchQuery = ''\">\u2715</button>\n        </div>\n\n        <!-- Small simple boxes for each report -->\n        <div class=\"ribbon-boxes-track\">\n          <div *ngFor=\"let rep of filteredReports\"\n               class=\"ribbon-small-box report-box\"\n               [class.active-box]=\"isReportOpen(rep.id)\"\n               (click)=\"openReportInSheet(rep)\"\n               [title]=\"rep.title + ' \u2014 ' + (rep.desc || '')\">\n\n            <!-- Corner Star Favorite Button -->\n            <button type=\"button\"\n                    class=\"box-star-btn\"\n                    [class.starred]=\"favoriteReports.has(rep.id)\"\n                    (click)=\"toggleFavoriteReport(rep.id, $event)\"\n                    [title]=\"favoriteReports.has(rep.id) ? '\u092A\u0938\u0902\u0926\u0940\u0926\u093E \u0938\u0947 \u0939\u091F\u093E\u090F\u0902' : '\u0938\u094D\u091F\u093E\u0930\u094D\u091F\u0905\u092A \u0921\u093F\u092B\u093C\u0949\u0932\u094D\u091F \u092E\u0947\u0902 \u091C\u094B\u0921\u093C\u0947\u0902'\">\n              <i class=\"pi\" [ngClass]=\"favoriteReports.has(rep.id) ? 'pi-star-fill' : 'pi-star'\"></i>\n            </button>\n\n            <div class=\"box-icon-wrap report-icon-bg\">\n              <i class=\"pi\" [ngClass]=\"rep.icon\"></i>\n            </div>\n            <div class=\"box-info\">\n              <span class=\"box-name-hin\">{{ rep.title }}</span>\n              <span class=\"box-name-eng\">{{ rep.category }}</span>\n            </div>\n            <span *ngIf=\"isReportOpen(rep.id)\" class=\"box-dot\" title=\"\u0936\u0940\u091F \u0916\u0941\u0932\u0940 \u0939\u0948\"></span>\n          </div>\n        </div>\n      </div>\n\n    </div>\n  </header>\n\n  <!-- 2. FORMULA BAR ROW (ALWAYS VISIBLE) -->\n  <div class=\"formula-bar-row\">\n    <div class=\"coord-box\">{{ activeCoord }}</div>\n    <span class=\"active-col-chip\">{{ activeColChip }}</span>\n\n    <span style=\"font-weight: 700; font-style: italic; color: var(--text-muted); margin: 0 4px;\">fx</span>\n    <input type=\"text\"\n           class=\"formula-input\"\n           [ngModel]=\"formulaValue\"\n           (ngModelChange)=\"onFormulaChange($event)\"\n           placeholder=\"Select a cell or type value here...\">\n  </div>\n\n  <!-- Column Config Popover (Replicating Legacy Studio) -->\n  <p-overlayPanel #colConfigOp [dismissable]=\"true\" styleClass=\"sutram-col-config-popover shadow-lg\">\n    <ng-template pTemplate=\"content\">\n      <div class=\"col-dropdown-menu\">\n        <!-- Header: Search Bar & Action Strip -->\n        <div class=\"col-dd-header\">\n          <div class=\"col-dd-search-wrap\">\n            <i class=\"pi pi-search col-dd-search-icon\"></i>\n            <input type=\"text\"\n                   class=\"col-dd-search-input\"\n                   placeholder=\"Search columns / FK...\"\n                   [(ngModel)]=\"colSearchQuery\" />\n            <button *ngIf=\"colSearchQuery\"\n                    type=\"button\"\n                    class=\"btn-clear-search-inline\"\n                    (click)=\"colSearchQuery = ''\">\n              <i class=\"pi pi-times\"></i>\n            </button>\n          </div>\n\n          <div class=\"col-dd-actions\">\n            <div class=\"col-dd-actions-left\">\n              <button type=\"button\" class=\"col-dd-act-btn\" (click)=\"selectAllColumns(true)\">All</button>\n              <button type=\"button\" class=\"col-dd-act-btn\" (click)=\"selectAllColumns(false)\">None</button>\n              <button type=\"button\" class=\"col-dd-act-btn\" (click)=\"resetDefaultColumns()\">Reset</button>\n            </div>\n            <span class=\"col-dd-count\">{{ selectedColumnKeys.size }} of {{ allConfigColumns.length }} visible</span>\n          </div>\n        </div>\n\n        <!-- Body: Standard Columns & FK Groups -->\n        <div class=\"col-dd-body\">\n          <!-- 1. Standard Columns -->\n          <ng-container *ngIf=\"filteredDirectCols.length > 0\">\n            <div class=\"col-dd-section-title\">Standard Columns</div>\n            <div *ngFor=\"let col of filteredDirectCols; trackBy: trackByColKey\"\n                 class=\"col-dd-item\"\n                 (click)=\"toggleColumnCheckbox(col.key)\">\n              <div class=\"col-dd-item-left\">\n                <input type=\"checkbox\"\n                       class=\"custom-check\"\n                       [checked]=\"isColumnSelected(col.key)\"\n                       style=\"pointer-events: none;\" />\n                <span class=\"col-dd-item-name\" [title]=\"col.name\">\n                  {{ col.name }}<span *ngIf=\"col.not_null\" style=\"color: #ef4444; margin-left: 2px;\">*</span>\n                </span>\n              </div>\n              <span class=\"type-badge\">{{ col.type || 'string' }}</span>\n            </div>\n          </ng-container>\n\n          <!-- 2. Foreign Key Reference Groups -->\n          <ng-container *ngIf=\"filteredFkGroups.length > 0\">\n            <div class=\"col-dd-section-title\" style=\"margin-top: 8px;\">FK Reference Groups</div>\n            <div *ngFor=\"let grp of filteredFkGroups; trackBy: trackByGroupName\"\n                 class=\"col-dd-group\"\n                 [class.fk-active-group]=\"grp.selectedCount > 0\">\n              <!-- Group Accordion Header -->\n              <div class=\"col-dd-group-header\">\n                <div class=\"col-dd-group-left\"\n                     (click)=\"toggleFkGroupExpand(grp.name)\"\n                     style=\"cursor: pointer; flex-grow: 1;\">\n                  <i class=\"pi pi-chevron-right fk-expand-toggle\"\n                     [class.rotated]=\"isFkGroupExpanded(grp.name)\"></i>\n                  <span class=\"col-dd-item-name\">\n                    <i class=\"pi pi-link\" style=\"color: var(--primary, #4f46e5); font-size: 10px; margin-right: 3px;\"></i>\n                    <strong style=\"text-transform: capitalize;\">{{ grp.name }}</strong>\n                    <span style=\"font-size: 10px; color: var(--text-muted); font-weight: 400; margin-left: 3px;\">({{ grp.refTable }})</span>\n                  </span>\n                </div>\n                <div class=\"col-dd-group-right\"\n                     (click)=\"toggleFkGroupAll(grp.name)\"\n                     style=\"cursor: pointer; display: flex; align-items: center; gap: 6px;\">\n                  <input type=\"checkbox\"\n                         class=\"custom-check\"\n                         [checked]=\"grp.isAllChecked\"\n                         style=\"pointer-events: none;\" />\n                  <span class=\"fk-group-pill\"\n                        [style.background]=\"grp.selectedCount > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(125, 125, 125, 0.1)'\"\n                        [style.color]=\"grp.selectedCount > 0 ? '#059669' : 'var(--text-muted)'\">\n                    {{ grp.selectedCount }}/{{ grp.totalCount }}\n                  </span>\n                </div>\n              </div>\n\n              <!-- Group Sub-items (when expanded) -->\n              <div *ngIf=\"isFkGroupExpanded(grp.name)\" class=\"col-dd-group-items\">\n                <div *ngFor=\"let col of grp.columns; trackBy: trackByColKey\"\n                     class=\"col-dd-item\"\n                     (click)=\"toggleColumnCheckbox(col.key)\">\n                  <div class=\"col-dd-item-left\">\n                    <input type=\"checkbox\"\n                           class=\"custom-check\"\n                           [checked]=\"isColumnSelected(col.key)\"\n                           style=\"pointer-events: none;\" />\n                    <span class=\"col-dd-item-name\"\n                          [style.font-weight]=\"col.is_fk_main ? '600' : 'normal'\"\n                          [title]=\"col.name\">\n                      {{ col.short_name || col.name }}\n                    </span>\n                  </div>\n                  <span class=\"type-badge\">{{ col.is_fk_main ? 'display' : (col.is_fk_raw ? 'id' : (col.type || 'string')) }}</span>\n                </div>\n              </div>\n            </div>\n          </ng-container>\n\n          <!-- Empty State -->\n          <div *ngIf=\"filteredDirectCols.length === 0 && filteredFkGroups.length === 0\" class=\"col-dd-empty\">\n            <i class=\"pi pi-search me-1\"></i> No matching columns found\n          </div>\n        </div>\n\n        <!-- Footer: Click outside hint + Done button -->\n        <div class=\"col-dd-footer\">\n          <span class=\"small text-muted\" style=\"font-size: 10.5px;\">Click outside or press Esc</span>\n          <button type=\"button\" class=\"btn btn-sm btn-primary py-1 px-3\" style=\"font-size: 11.5px; font-weight: 600;\" (click)=\"colConfigOp.hide()\">Done</button>\n        </div>\n      </div>\n    </ng-template>\n  </p-overlayPanel>\n\n  <!-- 3. STATUS & BATCH FIX SUGGESTION STRIP (ALWAYS VISIBLE) -->\n  <div class=\"status-strip\" [ngClass]=\"statusStripClass\">\n    <div style=\"display: flex; align-items: center; gap: 6px;\">\n      <i class=\"pi\" [ngClass]=\"statusStripIcon\"></i>\n      <span>{{ statusStripMessage }}</span>\n    </div>\n    <div *ngIf=\"state.unresolvedCorrectionsCount() > 0\">\n      <button class=\"cmd-btn cmd-btn-warning\" style=\"padding: 2px 8px;\" (click)=\"showSidebar = true\">\n        <i class=\"pi pi-bolt\"></i> \u0917\u0932\u0924\u093F\u092F\u093E\u0901 ({{ state.unresolvedCorrectionsCount() }})\n      </button>\n    </div>\n  </div>\n\n  <!-- 4. SPREADSHEET CANVAS (ALWAYS VISIBLE! 100% REMAINING HEIGHT) -->\n  <main class=\"spreadsheet-canvas flex-grow-1\" [style.zoom]=\"zoomLevel\">\n    <sutram-grid #grid\n                 [headers]=\"visibleHeaders\"\n                 [rows]=\"state.rows()\"\n                 [filterOnlyErrors]=\"state.filterOnlyErrors()\"\n                 [enableDelete]=\"enableDelete\"\n                 (loadMore)=\"onLoadMore()\"\n                 (filterChanged)=\"onGridFilterChanged()\"\n                 (sortChanged)=\"onGridSortChanged()\"\n                 (solveAllTriggered)=\"onGridSolveAll($event)\"\n                 (openConfig)=\"colConfigOp.toggle($event)\">\n    </sutram-grid>\n  </main>\n\n  <!-- 5. BOTTOM MULTI-SHEET TAB BAR & STATUS BAR -->\n  <footer class=\"studio-footer\">\n    <!-- Sub-row A: Sheet Tabs Strip -->\n    <div class=\"sheet-tabs-bar\">\n      <div *ngFor=\"let tab of sheetTabs\"\n           class=\"tab-pill\"\n           [class.active-tab]=\"activeSheetId === tab.id\"\n           (click)=\"switchSheet(tab.id)\">\n        <i class=\"pi\" [ngClass]=\"tab.icon\" style=\"font-size: 11px;\"></i>\n        <span>{{ tab.title }}</span>\n        <span *ngIf=\"tab.type === 'rough'\" class=\"sheet-tab-rough-badge\">\u0930\u092B</span>\n        <span *ngIf=\"tab.isLoaded && (tab.recordCount || 0) > 0\" class=\"sheet-tab-badge\">\n          {{ tab.recordCount }}\n        </span>\n        <button *ngIf=\"sheetTabs.length > 1\"\n                type=\"button\"\n                class=\"tab-close-btn\"\n                (click)=\"closeSheet(tab.id, $event)\"\n                title=\"\u0936\u0940\u091F \u092C\u0902\u0926 \u0915\u0930\u0947\u0902\">\u2715</button>\n      </div>\n\n      <button class=\"add-tab-btn\" (click)=\"addNewBlankSheet()\" title=\"Add Blank Sheet\">\n        <i class=\"pi pi-plus\" style=\"font-size: 10px;\"></i>\n      </button>\n    </div>\n\n    <!-- Sub-row B: Status Bar with Scale / Zoom Controls -->\n    <div class=\"bottom-status-subrow\">\n      <div style=\"display: flex; align-items: center; gap: 10px;\">\n        <span>Sheet: {{ activeSheetId }}</span>\n        <span>Rows: {{ state.rows().length }}{{ state.totalDbRecords() > state.rows().length ? ' / ' + state.totalDbRecords() : '' }}</span>\n        <span *ngIf=\"state.isLoadingDb()\" class=\"text-primary small fw-semibold\">\n          <i class=\"pi pi-spin pi-spinner me-1\"></i>Loading more...\n        </span>\n        <span *ngIf=\"state.deletedRowIds().length > 0\" class=\"badge bg-soft-warning text-warning small fw-semibold\">\n          <i class=\"pi pi-trash me-1\"></i>{{ state.deletedRowIds().length }} Deleted\n        </span>\n        <span *ngIf=\"state.stats().errorRows === 0\" style=\"color: #10b981; font-weight: 600;\">\u2713 100% In Sync</span>\n        <span *ngIf=\"state.stats().errorRows > 0\" style=\"color: #ef4444; font-weight: 600;\">{{ state.stats().errorRows }} \u0924\u094D\u0930\u0941\u091F\u093F\u092F\u093E\u0901</span>\n\n        <!-- Last Sync Status of the active sheet -->\n        <span *ngIf=\"lastSyncPerSheet[activeSheetId]\"\n              class=\"last-sync-badge\"\n              [class.sync-error]=\"lastSyncPerSheet[activeSheetId].hasError\">\n          <i class=\"pi pi-history me-1\"></i>\u0905\u0902\u0924\u093F\u092E \u0938\u093F\u0902\u0915 ({{ lastSyncPerSheet[activeSheetId].time }}): {{ lastSyncPerSheet[activeSheetId].summary }}\n        </span>\n      </div>\n\n      <div style=\"display: flex; align-items: center; gap: 10px;\">\n        <span style=\"font-size: 10.5px; opacity: 0.8;\">Ctrl+S to Sync | Enter next row | Tab next col | Click # to select row</span>\n\n        <!-- Scale / Zoom Controls -->\n        <div class=\"zoom-controls\">\n          <button class=\"zoom-btn\" (click)=\"zoomOut()\" title=\"Zoom Out (-10%)\"><i class=\"pi pi-minus\"></i></button>\n          <span class=\"zoom-display\" (click)=\"resetZoom()\" title=\"Reset to 100%\">{{ (zoomLevel * 100).toFixed(0) }}%</span>\n          <button class=\"zoom-btn\" (click)=\"zoomIn()\" title=\"Zoom In (+10%)\"><i class=\"pi pi-plus\"></i></button>\n        </div>\n      </div>\n    </div>\n  </footer>\n\n  <!-- 6. Floating Sync Toast HUD (Live Progress & Completion) -->\n  <div *ngIf=\"syncToast.visible\" class=\"sync-toast-hud shadow-lg\">\n    <div class=\"sync-toast-header\">\n      <div class=\"sync-toast-title\">\n        <i class=\"pi\"\n           [ngClass]=\"syncToast.inProgress ? 'pi-spin pi-sync text-primary' : (syncToast.hasError ? 'pi-exclamation-circle text-warning' : 'pi-check-circle text-success')\"></i>\n        <span>{{ syncToast.title }}</span>\n      </div>\n      <button class=\"sync-toast-close\" (click)=\"dismissSyncToast()\">\u2715</button>\n    </div>\n\n    <!-- Live Progress Bar when Sync is running -->\n    <div *ngIf=\"syncToast.inProgress\" class=\"sync-progress-wrap px-3 pt-2\">\n      <div class=\"d-flex justify-content-between align-items-center mb-1\" style=\"font-size: 11px; color: var(--text-muted, #64748b);\">\n        <span>{{ syncToast.percentage }}% \u092A\u0942\u0930\u094D\u0923</span>\n        <span>{{ state.importProgress().current }} / {{ state.importProgress().total }}</span>\n      </div>\n      <div class=\"sync-progress-track\">\n        <div class=\"sync-progress-bar\" [style.width.%]=\"syncToast.percentage\"></div>\n      </div>\n    </div>\n\n    <div class=\"sync-toast-body\">\n      <div class=\"sync-toast-stats\">\n        <span *ngIf=\"syncToast.inserted > 0\" class=\"sync-badge-chip chip-success\">\n          <i class=\"pi pi-plus\"></i> {{ syncToast.inserted }} Inserted\n        </span>\n        <span *ngIf=\"syncToast.updated > 0\" class=\"sync-badge-chip chip-info\">\n          <i class=\"pi pi-refresh\"></i> {{ syncToast.updated }} Updated\n        </span>\n        <span *ngIf=\"syncToast.deleted > 0\" class=\"sync-badge-chip chip-warning\">\n          <i class=\"pi pi-trash\"></i> {{ syncToast.deleted }} Deleted\n        </span>\n        <span *ngIf=\"syncToast.failed > 0\" class=\"sync-badge-chip chip-danger\">\n          <i class=\"pi pi-times\"></i> {{ syncToast.failed }} Failed\n        </span>\n      </div>\n      <div *ngIf=\"syncToast.errors.length > 0\" class=\"sync-toast-errors\">\n        <div *ngFor=\"let err of syncToast.errors\">\u2022 {{ err }}</div>\n      </div>\n    </div>\n  </div>\n\n  <!-- Smart Header Scanner Modal -->\n  <sutram-header-scanner [(visible)]=\"showScannerModal\"\n                         [report]=\"scanReport\"\n                         [availableHeaders]=\"state.headers()\"\n                         (confirmed)=\"onScannerConfirmed($event)\">\n  </sutram-header-scanner>\n\n  <!-- Batch Correction Sidebar -->\n  <sutram-correction-sidebar [(visible)]=\"showSidebar\"\n                             [groups]=\"state.correctionGroups()\">\n  </sutram-correction-sidebar>\n\n</div>\n", styles: ["/**\n * sutram-excel-studio.component.scss\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n * Pixel-Perfect Enterprise Excel Studio Styling.\n * Exact replication of Sutram Excel Studio v2.0 UI.\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n */\n\n:host {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n\n.sutram-excel-container {\n  --primary: #4f46e5;\n  --primary-hover: #4338ca;\n  --primary-soft: #e0e7ff;\n  --success: #10b981;\n  --success-soft: #d1fae5;\n  --warning: #f59e0b;\n  --warning-soft: #fef3c7;\n  --danger: #ef4444;\n  --danger-soft: #fee2e2;\n  --bg: #f8fafc;\n  --surface: #ffffff;\n  --surface-border: #e2e8f0;\n  --text: #0f172a;\n  --text-muted: #64748b;\n  --radius: 6px;\n  --header-bg: #f1f5f9;\n  --header-text: #1e293b;\n  --cell-border: rgba(125, 125, 125, 0.18);\n  --cell-height: 23px;\n  --header-height: 38px;\n  --cell-edited-bg: #fef9c3;\n  --cell-edited-border: #eab308;\n  --row-edited-bg: #fffbeb;\n  --row-new-bg: #dcfce7;\n  --row-new-border: #22c55e;\n\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n  background-color: var(--bg);\n  color: var(--text);\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  user-select: none;\n\n  &.dark-mode {\n    --bg: #0f172a;\n    --surface: #1e293b;\n    --surface-border: #334155;\n    --text: #f8fafc;\n    --text-muted: #94a3b8;\n    --header-bg: #1e293b;\n    --header-text: #cbd5e1;\n    --cell-border: rgba(255, 255, 255, 0.1);\n    --cell-edited-bg: rgba(234, 179, 8, 0.22);\n    --cell-edited-border: #facc15;\n    --row-edited-bg: rgba(234, 179, 8, 0.12);\n    --row-new-bg: rgba(34, 197, 94, 0.18);\n    --row-new-border: #4ade80;\n  }\n}\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n * 1. TOP EXCEL-STYLE RIBBON HEADER\n * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n.studio-header {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n  user-select: none;\n}\n\n/* 1A. Ribbon Top Menu Bar (Brand + Tabs + Mode Switcher) */\n.ribbon-menu-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2px 10px;\n  height: 32px;\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n}\n\n.menu-bar-left {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.brand {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.brand-icon {\n  width: 22px;\n  height: 22px;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 11px;\n}\n.brand-title {\n  font-size: 11.5px;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  color: var(--text);\n\n  .version-tag {\n    font-size: 9px;\n    padding: 1px 4px;\n    background: rgba(16, 185, 129, 0.18);\n    color: #059669;\n    border-radius: 3px;\n    font-weight: 700;\n  }\n}\n\n/* Ribbon Tabs Navigation */\n.ribbon-tabs-nav {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n.ribbon-tab-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 3px 11px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.12s ease;\n\n  i {\n    font-size: 10.5px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.08);\n    color: var(--text);\n  }\n\n  &.active {\n    background: var(--surface);\n    color: var(--primary);\n    border-color: var(--surface-border) var(--surface-border) transparent var(--surface-border);\n    border-bottom: 2px solid var(--primary);\n    font-weight: 700;\n  }\n}\n.ribbon-badge {\n  font-size: 9px;\n  padding: 1px 4px;\n  border-radius: 999px;\n  background: rgba(79, 70, 229, 0.12);\n  color: var(--primary);\n  font-weight: 700;\n}\n\n.menu-bar-right {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.mode-pill-toggle {\n  background: rgba(125, 125, 125, 0.12);\n  border-radius: 999px;\n  padding: 2px;\n  display: flex;\n  gap: 2px;\n}\n.mode-pill-btn {\n  padding: 2px 9px;\n  border-radius: 999px;\n  font-size: 10px;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  i { font-size: 9.5px; }\n}\n.mode-pill-btn.active-normal {\n  background: #3b82f6;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.35);\n}\n.mode-pill-btn.active-smart {\n  background: #10b981;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.35);\n}\n\n/* 1B. Ribbon Content Strip (Few cm area) */\n.ribbon-strip {\n  background: var(--surface);\n  padding: 4px 10px;\n  height: 60px;\n  display: flex;\n  align-items: center;\n  overflow: hidden;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);\n}\n\n/* Home Panel Toolbar (Grouped items) */\n.ribbon-content-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n\n.ribbon-group {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: space-between;\n  height: 52px;\n  padding: 0 4px;\n}\n\n.ribbon-group-items {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-grow: 1;\n}\n\n.ribbon-group-name {\n  font-size: 8.5px;\n  color: var(--text-muted);\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  margin-top: 1px;\n}\n\n.ribbon-v-sep {\n  width: 1px;\n  height: 40px;\n  background: var(--surface-border);\n  opacity: 0.75;\n  margin: 0 4px;\n}\n\n.ribbon-tool-btn {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 2px;\n  padding: 2px 7px;\n  height: 42px;\n  border-radius: 4px;\n  border: 1px solid transparent;\n  background: transparent;\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.12s;\n  font-size: 10.5px;\n\n  i {\n    font-size: 13px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.09);\n    border-color: var(--surface-border);\n  }\n\n  &.active {\n    background: var(--primary-soft);\n    color: var(--primary);\n    border-color: rgba(79, 70, 229, 0.3);\n    font-weight: 700;\n  }\n\n  .ribbon-tool-lbl {\n    font-size: 9px;\n    white-space: nowrap;\n    font-weight: 500;\n  }\n}\n\n.ribbon-mini-col {\n  display: flex;\n  flex-direction: row;\n  gap: 2px;\n}\n\n.ribbon-mini-btn {\n  width: 22px;\n  height: 22px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 3px;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  font-size: 9.5px;\n\n  &:hover { background: rgba(125, 125, 125, 0.1); }\n}\n\n.ribbon-search-field {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 165px;\n\n  .search-ico {\n    position: absolute;\n    left: 7px;\n    font-size: 9.5px;\n    color: var(--text-muted);\n    pointer-events: none;\n  }\n\n  .ribbon-search-inp {\n    width: 100%;\n    height: 24px;\n    padding: 2px 20px 2px 22px;\n    font-size: 10.5px;\n    border-radius: 4px;\n    border: 1px solid var(--surface-border);\n    background: var(--surface);\n    color: var(--text);\n    outline: none;\n    transition: border-color 0.12s ease;\n\n    &:focus {\n      border-color: var(--primary);\n    }\n  }\n\n  .clear-btn-inline {\n    position: absolute;\n    right: 5px;\n    background: transparent;\n    border: none;\n    font-size: 9px;\n    cursor: pointer;\n    color: var(--text-muted);\n  }\n\n  .spin-inline {\n    position: absolute;\n    right: 5px;\n    font-size: 9px;\n    color: var(--primary);\n  }\n}\n\n.ribbon-btn-action {\n  background: var(--primary) !important;\n  color: #ffffff !important;\n  border-color: var(--primary) !important;\n  font-weight: 700 !important;\n\n  &:hover {\n    filter: brightness(1.1);\n  }\n\n  .sync-count-tag {\n    font-size: 8.5px;\n    padding: 0 4px;\n    background: #ffffff;\n    color: var(--primary);\n    border-radius: 999px;\n    font-weight: 800;\n    margin-left: 2px;\n  }\n}\n\n.ribbon-record-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 7px;\n  background: rgba(125, 125, 125, 0.08);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--text-muted);\n  height: 24px;\n}\n\n/* 1C. Tables & Reports Strip (Horizontal Scrolling Track with Small Boxes) */\n.ribbon-scroll-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.ribbon-boxes-track {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  overflow-x: auto;\n  scrollbar-width: thin;\n  height: 100%;\n  flex-grow: 1;\n  padding: 2px 2px;\n\n  &::-webkit-scrollbar {\n    height: 4px;\n  }\n  &::-webkit-scrollbar-thumb {\n    background: rgba(125, 125, 125, 0.25);\n    border-radius: 2px;\n  }\n}\n\n.ribbon-small-box {\n  position: relative;\n  flex-shrink: 0;\n  min-width: 115px;\n  max-width: 140px;\n  height: 46px;\n  background: var(--surface);\n  border: 1px solid var(--surface-border);\n  border-radius: 5px;\n  padding: 3px 8px 3px 6px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: all 0.12s ease;\n  user-select: none;\n\n  &:hover {\n    border-color: var(--primary);\n    background: var(--primary-soft);\n    transform: translateY(-1px);\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);\n  }\n\n  &.active-box {\n    border-color: rgba(16, 185, 129, 0.6);\n    background: rgba(16, 185, 129, 0.08);\n  }\n\n  .box-star-btn {\n    position: absolute;\n    top: 2px;\n    right: 2px;\n    width: 15px;\n    height: 15px;\n    border: none;\n    background: transparent;\n    cursor: pointer;\n    color: var(--text-muted);\n    font-size: 9px;\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 2;\n    transition: all 0.12s;\n\n    &:hover {\n      color: #f59e0b;\n      transform: scale(1.2);\n    }\n\n    &.starred {\n      color: #f59e0b;\n    }\n  }\n\n  .box-icon-wrap {\n    width: 25px;\n    height: 25px;\n    border-radius: 4px;\n    background: var(--primary-soft);\n    color: var(--primary);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 11px;\n    flex-shrink: 0;\n\n    &.report-icon-bg {\n      background: rgba(16, 185, 129, 0.15);\n      color: #059669;\n    }\n  }\n\n  .box-info {\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n    padding-right: 10px;\n\n    .box-name-hin {\n      font-size: 10.5px;\n      font-weight: 700;\n      color: var(--text);\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .box-name-eng {\n      font-size: 9px;\n      color: var(--text-muted);\n      font-family: monospace;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n  }\n\n  .box-dot {\n    position: absolute;\n    bottom: 3px;\n    right: 3px;\n    width: 5px;\n    height: 5px;\n    border-radius: 50%;\n    background: #10b981;\n  }\n}\n\n.btn-group-cmd {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.cmd-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  transition: all 0.15s;\n  user-select: none;\n\n  i {\n    font-size: 10.5px;\n  }\n}\n.cmd-btn:hover { background: rgba(125, 125, 125, 0.1); }\n.cmd-btn.active {\n  background: var(--primary-soft);\n  color: var(--primary);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.cmd-btn-primary { background: var(--primary); color: white; border-color: var(--primary); }\n.cmd-btn-primary:hover { background: var(--primary-hover); }\n.cmd-btn-success { background: var(--success); color: white; border-color: var(--success); }\n.cmd-btn-success:hover { background: #059669; }\n.cmd-btn-warning { background: var(--warning-soft); color: #b45309; border-color: rgba(245, 158, 11, 0.3); }\n\n.sync-badge-count {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: #f59e0b;\n  color: #ffffff;\n  font-size: 9.5px;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 999px;\n  margin-left: 4px;\n  line-height: 1.1;\n}\n\n/* 2. FORMULA BAR ROW */\n.formula-bar-row {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n}\n.coord-box {\n  width: 48px;\n  height: 22px;\n  line-height: 18px;\n  text-align: center;\n  font-weight: 700;\n  font-size: 11px;\n  padding: 1px 3px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  background: rgba(125, 125, 125, 0.05);\n}\n.active-col-chip {\n  background: var(--primary-soft);\n  color: var(--primary);\n  padding: 1px 6px;\n  height: 20px;\n  line-height: 17px;\n  border-radius: 4px;\n  font-size: 10.5px;\n  font-weight: 600;\n  white-space: nowrap;\n  max-width: 170px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.formula-input {\n  flex-grow: 1;\n  height: 22px;\n  padding: 2px 7px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 11.5px;\n  font-family: inherit;\n  outline: none;\n  background: var(--surface);\n  color: var(--text);\n}\n.formula-input:focus { border-color: var(--primary); }\n\n/* 3. CONTROL SETTINGS BAR & DIRECT DB SEARCH */\n.control-settings-bar {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  flex-shrink: 0;\n  font-size: 11px;\n}\n.ctrl-bar-left, .ctrl-bar-right {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.ctrl-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 8px;\n  height: 23px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text-muted);\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n\n  i {\n    font-size: 10px;\n  }\n}\n.ctrl-btn:hover {\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text);\n}\n.ctrl-btn.active {\n  color: var(--primary);\n  background: var(--primary-soft);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.ctrl-btn-danger {\n  color: var(--danger);\n  background: var(--danger-soft);\n  border-color: rgba(239, 68, 68, 0.3);\n}\n.ctrl-btn-danger:hover {\n  background: rgba(239, 68, 68, 0.2);\n}\n.ctrl-dot {\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  background: #10b981;\n  display: inline-block;\n}\n.ctrl-search-wrap {\n  position: relative;\n  display: flex;\n  align-items: center;\n  flex-grow: 1;\n  max-width: 420px;\n}\n.ctrl-search-icon {\n  position: absolute;\n  left: 8px;\n  color: var(--text-muted);\n  font-size: 10px;\n  pointer-events: none;\n}\n.ctrl-search-input {\n  width: 100%;\n  height: 23px;\n  padding: 2px 24px 2px 24px;\n  border: 1px solid var(--surface-border);\n  border-radius: 999px;\n  font-size: 11px;\n  background: rgba(125, 125, 125, 0.05);\n  color: var(--text);\n  outline: none;\n  transition: all 0.15s;\n}\n.ctrl-search-input:focus {\n  border-color: var(--primary);\n  background: var(--surface);\n  box-shadow: 0 0 0 2px var(--primary-soft);\n}\n.ctrl-search-clear {\n  position: absolute;\n  right: 6px;\n  background: none;\n  border: none;\n  font-size: 10px;\n  color: var(--text-muted);\n  cursor: pointer;\n  padding: 1px 4px;\n  border-radius: 50%;\n}\n.ctrl-search-clear:hover {\n  color: var(--danger);\n  background: rgba(125, 125, 125, 0.15);\n}\n.ctrl-search-spinner {\n  position: absolute;\n  right: 24px;\n  color: var(--primary);\n  font-size: 10px;\n}\n.ctrl-record-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 1px 7px;\n  height: 21px;\n  border-radius: 999px;\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text-muted);\n  font-size: 10px;\n  font-weight: 600;\n  white-space: nowrap;\n\n  i {\n    font-size: 10px;\n  }\n}\n\n/* 4. STATUS & BATCH SUGGESTION STRIP */\n.status-strip {\n  padding: 3px 14px;\n  font-size: 11.5px;\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  background: rgba(125, 125, 125, 0.04);\n}\n.status-strip.strip-error { background: #fef2f2; color: #991b1b; }\n.status-strip.strip-clean { background: #f0fdf4; color: #166534; }\n.status-strip.strip-suggestion { background: #fffbeb; color: #92400e; }\n\n/* 5. SPREADSHEET CANVAS */\n.spreadsheet-canvas {\n  flex-grow: 1;\n  overflow: hidden;\n  background: var(--surface);\n  position: relative;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n\n  sutram-grid {\n    display: block;\n    width: 100%;\n    height: 100%;\n    flex: 1;\n    min-height: 0;\n  }\n}\n\n/* 6. BOTTOM MULTI-SHEET TAB BAR & STATUS BAR */\n.studio-footer {\n  flex-shrink: 0;\n  background: var(--surface);\n  border-top: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n}\n.sheet-tabs-bar {\n  display: flex;\n  align-items: center;\n  background: rgba(125, 125, 125, 0.05);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 2px 6px;\n  overflow-x: auto;\n  scrollbar-width: none;\n}\n.sheet-tabs-bar::-webkit-scrollbar { display: none; }\n\n.tab-pill {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 12px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11.5px;\n  font-weight: 600;\n  cursor: pointer;\n  color: var(--text-muted);\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  white-space: nowrap;\n  transition: all 0.15s;\n}\n.tab-pill:hover {\n  background: rgba(125, 125, 125, 0.1);\n  color: var(--text);\n}\n.tab-pill.active-tab {\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-color: rgba(16, 185, 129, 0.25);\n  border-bottom: 2px solid #10b981;\n  font-weight: 700;\n}\n\n.sheet-tab-badge {\n  font-size: 9.5px;\n  padding: 1px 5px;\n  background: rgba(16, 185, 129, 0.2);\n  color: #059669;\n  border-radius: 999px;\n  font-weight: 700;\n}\n\n.add-tab-btn {\n  padding: 2px 8px;\n  border: 1px dashed rgba(125, 125, 125, 0.4);\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  color: var(--primary);\n  margin-left: 4px;\n}\n.add-tab-btn:hover { background: rgba(79, 70, 229, 0.1); }\n\n.sheet-tab-rough-badge {\n  font-size: 9px;\n  padding: 1px 4px;\n  background: rgba(245, 158, 11, 0.2);\n  color: #d97706;\n  border-radius: 3px;\n  font-weight: 700;\n  text-transform: uppercase;\n}\n\n.tab-close-btn {\n  margin-left: 3px;\n  width: 15px;\n  height: 15px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted);\n  border-radius: 3px;\n  cursor: pointer;\n  font-size: 9.5px;\n  line-height: 1;\n  padding: 0;\n  transition: all 0.12s;\n\n  &:hover {\n    background: rgba(239, 68, 68, 0.18);\n    color: #ef4444;\n  }\n}\n\n.bottom-status-subrow {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 3px 14px;\n  font-size: 11px;\n  color: var(--text-muted);\n}\n.zoom-controls {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  padding: 1px 4px;\n}\n.zoom-btn {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  color: var(--text);\n  padding: 1px 5px;\n  font-size: 11px;\n}\n.zoom-display {\n  font-weight: 700;\n  cursor: pointer;\n  padding: 0 4px;\n}\n\n/* 7. FLOATING SYNC TOAST HUD */\n.sync-toast-hud {\n  position: fixed;\n  top: 50px;\n  right: 20px;\n  z-index: 2500;\n  min-width: 320px;\n  max-width: 440px;\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);\n  overflow: hidden;\n  animation: toastSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);\n  font-size: 11.5px;\n}\n@keyframes toastSlideIn {\n  from { opacity: 0; transform: translateY(-12px) scale(0.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n.sync-toast-header {\n  padding: 8px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--surface-border);\n  background: rgba(125, 125, 125, 0.04);\n}\n.sync-toast-title {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-weight: 700;\n  font-size: 12px;\n}\n.sync-toast-close {\n  background: none;\n  border: none;\n  color: var(--text-muted);\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 5px;\n  border-radius: 3px;\n}\n.sync-toast-close:hover {\n  background: rgba(125, 125, 125, 0.12);\n  color: var(--text);\n}\n.sync-toast-body {\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.sync-toast-stats {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.sync-badge-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n}\n.chip-success {\n  background: var(--success-soft);\n  color: var(--success);\n}\n.chip-info {\n  background: var(--primary-soft);\n  color: var(--primary);\n}\n.chip-warning {\n  background: var(--warning-soft);\n  color: #b45309;\n}\n.chip-danger {\n  background: var(--danger-soft);\n  color: var(--danger);\n}\n.sync-toast-errors {\n  margin-top: 4px;\n  padding: 6px 8px;\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.2);\n  border-radius: 4px;\n  font-size: 10.5px;\n  color: #ef4444;\n  max-height: 140px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n\n/* Last Sync Status in Bottom Bar */\n.last-sync-badge {\n  display: inline-flex;\n  align-items: center;\n  padding: 1px 7px;\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-radius: 4px;\n  font-weight: 600;\n  font-size: 10.5px;\n  border: 1px solid rgba(16, 185, 129, 0.25);\n\n  &.sync-error {\n    background: rgba(239, 68, 68, 0.12);\n    color: #ef4444;\n    border-color: rgba(239, 68, 68, 0.25);\n  }\n}\n\n/* Live Progress Bar inside Toast */\n.sync-progress-wrap {\n  width: 100%;\n}\n.sync-progress-track {\n  width: 100%;\n  height: 6px;\n  background: rgba(125, 125, 125, 0.2);\n  border-radius: 999px;\n  overflow: hidden;\n}\n.sync-progress-bar {\n  height: 100%;\n  background: linear-gradient(90deg, #3b82f6, #10b981);\n  border-radius: 999px;\n  transition: width 0.2s ease-in-out;\n}\n\n/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n * Instant Column Configuration Dropdown Menu (Replicating Legacy Studio)\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n::ng-deep .sutram-col-config-popover {\n  width: 340px !important;\n  height: 500px !important;\n  max-height: calc(100vh - 120px) !important;\n  font-size: 11.5px;\n  border-radius: 8px !important;\n  overflow: hidden !important;\n  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1) !important;\n  border: 1px solid var(--surface-border, #e2e8f0) !important;\n  background: var(--surface, #ffffff) !important;\n  color: var(--text, #0f172a) !important;\n  display: flex !important;\n  flex-direction: column !important;\n\n  .p-overlaypanel-content {\n    padding: 0 !important;\n    background: transparent !important;\n    color: inherit !important;\n    width: 100% !important;\n    height: 100% !important;\n    display: flex !important;\n    flex-direction: column !important;\n    flex: 1 1 auto !important;\n    min-height: 0 !important;\n    overflow: hidden !important;\n  }\n}\n\n.col-dropdown-menu {\n  width: 100% !important;\n  height: 100% !important;\n  max-height: none !important;\n  background: var(--surface, #ffffff);\n  color: var(--text, #0f172a);\n  border-radius: 8px;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  flex: 1 1 auto;\n  min-height: 0;\n  user-select: none;\n\n  .col-dd-header {\n    padding: 8px 10px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n    background: rgba(125, 125, 125, 0.03);\n    flex-shrink: 0 !important;\n  }\n\n  .col-dd-search-wrap {\n    position: relative;\n    display: flex;\n    align-items: center;\n\n    .col-dd-search-icon {\n      position: absolute;\n      left: 8px;\n      color: var(--text-muted, #64748b);\n      font-size: 11px;\n      pointer-events: none;\n    }\n\n    .col-dd-search-input {\n      width: 100%;\n      height: 28px;\n      padding: 4px 26px;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      border-radius: 4px;\n      font-size: 11.5px;\n      background: var(--bg, #f8fafc);\n      color: var(--text, #0f172a);\n      outline: none;\n      transition: border-color 0.12s;\n\n      &:focus {\n        border-color: var(--primary, #4f46e5);\n      }\n    }\n\n    .btn-clear-search-inline {\n      position: absolute;\n      right: 8px;\n      background: transparent;\n      border: none;\n      color: var(--text-muted, #64748b);\n      cursor: pointer;\n      font-size: 11px;\n      padding: 0;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n\n      &:hover {\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .col-dd-actions {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0 2px;\n\n    .col-dd-actions-left {\n      display: flex;\n      gap: 4px;\n    }\n\n    .col-dd-act-btn {\n      padding: 2px 7px;\n      font-size: 10.5px;\n      font-weight: 600;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      background: var(--surface, #ffffff);\n      color: var(--text-muted, #64748b);\n      border-radius: 3px;\n      cursor: pointer;\n      transition: all 0.12s;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n        color: var(--text, #0f172a);\n      }\n    }\n\n    .col-dd-count {\n      font-size: 10.5px;\n      color: var(--text-muted, #64748b);\n      font-weight: 600;\n    }\n  }\n\n  .col-dd-body {\n    padding: 6px 8px;\n    overflow-y: auto !important;\n    overflow-x: hidden !important;\n    flex: 1 1 0 !important;\n    min-height: 0 !important;\n    max-height: none !important;\n    display: flex;\n    flex-direction: column;\n    gap: 3px;\n    overscroll-behavior: contain;\n    scrollbar-width: thin;\n\n    &::-webkit-scrollbar {\n      width: 5px;\n    }\n    &::-webkit-scrollbar-track {\n      background: rgba(125, 125, 125, 0.05);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb {\n      background: rgba(125, 125, 125, 0.3);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb:hover {\n      background: var(--primary, #4f46e5);\n    }\n  }\n\n  .col-dd-section-title {\n    font-size: 10px;\n    font-weight: 700;\n    color: var(--text-muted, #64748b);\n    margin: 3px 0 2px 4px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    flex-shrink: 0 !important;\n  }\n\n  .col-dd-item {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 4px 6px;\n    border-radius: 4px;\n    cursor: pointer;\n    user-select: none;\n    transition: background 0.1s;\n    font-size: 11.5px;\n    color: var(--text, #0f172a);\n    flex-shrink: 0 !important;\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.08);\n    }\n\n    .col-dd-item-left {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .col-dd-item-name {\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n  }\n\n  .custom-check {\n    width: 14px;\n    height: 14px;\n    cursor: pointer;\n    accent-color: var(--primary, #4f46e5);\n    margin: 0;\n    flex-shrink: 0;\n  }\n\n  .type-badge {\n    font-size: 9.5px;\n    padding: 1px 5px;\n    border-radius: 3px;\n    background: rgba(125, 125, 125, 0.12);\n    color: var(--text-muted, #64748b);\n    font-family: 'JetBrains Mono', monospace;\n    flex-shrink: 0;\n  }\n\n  /* FK Grouping */\n  .col-dd-group {\n    border: 1px solid var(--surface-border, #e2e8f0);\n    border-radius: 5px;\n    margin: 3px 0;\n    overflow: hidden;\n    background: rgba(125, 125, 125, 0.02);\n    flex-shrink: 0 !important;\n\n    &.fk-active-group {\n      border-color: rgba(79, 70, 229, 0.35);\n    }\n\n    .col-dd-group-header {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      padding: 5px 8px;\n      background: rgba(125, 125, 125, 0.06);\n      cursor: pointer;\n      user-select: none;\n      font-size: 11.5px;\n      font-weight: 600;\n      flex-shrink: 0 !important;\n      min-height: 28px !important;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n      }\n\n      .col-dd-group-left {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        overflow: hidden;\n      }\n\n      .fk-expand-toggle {\n        font-size: 10px;\n        color: var(--text-muted, #64748b);\n        width: 12px;\n        text-align: center;\n        transition: transform 0.18s ease;\n\n        &.rotated {\n          transform: rotate(90deg);\n        }\n      }\n\n      .fk-group-pill {\n        font-size: 9.5px;\n        padding: 1px 5px;\n        border-radius: 999px;\n        font-weight: 600;\n      }\n    }\n\n    .col-dd-group-items {\n      padding: 3px 4px 4px 18px;\n      background: var(--surface, #ffffff);\n      border-top: 1px solid var(--surface-border, #e2e8f0);\n      display: flex;\n      flex-direction: column;\n      gap: 2px;\n      max-height: none !important;\n      overflow: visible !important;\n    }\n  }\n\n  .col-dd-empty {\n    padding: 16px;\n    text-align: center;\n    color: var(--text-muted, #64748b);\n    font-size: 11.5px;\n  }\n\n  .col-dd-footer {\n    padding: 6px 10px;\n    border-top: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    background: rgba(125, 125, 125, 0.03);\n    flex-shrink: 0 !important;\n  }\n}\n\n\n\n"] }]
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
        }], gridComponent: [{
            type: ViewChild,
            args: ['grid']
        }], onStudioGlobalKeydown: [{
            type: HostListener,
            args: ['document:keydown', ['$event']]
        }] }); })();
