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
const _c1 = ["fileInput"];
function SutramExcelStudioComponent_div_34_Template(rf, ctx) { if (rf & 1) {
    const _r23 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 69)(1, "button", 70);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_34_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r23); const ctx_r22 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r22.setStudioMode("normal")); });
    i0.ɵɵelement(2, "i", 71);
    i0.ɵɵtext(3, " Normal ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 70);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_34_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r23); const ctx_r24 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r24.setStudioMode("intelligent")); });
    i0.ɵɵelement(5, "i", 72);
    i0.ɵɵtext(6, " Smart ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("active-normal", ctx_r0.mode === "normal");
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active-smart", ctx_r0.mode === "intelligent");
} }
function SutramExcelStudioComponent_button_35_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 73);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_button_35_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r26); const ctx_r25 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r25.saveRoughSheetLocally()); });
    i0.ɵɵelement(1, "i", 74);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "Save");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("title", ctx_r1.isCurrentSheetReport ? "Save report locally (Ctrl+S)" : "Save sheet locally (Ctrl+S)");
} }
function SutramExcelStudioComponent_button_36_span_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 78);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r27 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(ctx_r27.state.pendingChangesCount());
} }
function SutramExcelStudioComponent_button_36_Template(rf, ctx) { if (rf & 1) {
    const _r29 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 75);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_button_36_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r29); const ctx_r28 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r28.startImport()); });
    i0.ɵɵelement(1, "i", 76);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "Sync DB");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_button_36_span_4_Template, 2, 1, "span", 77);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("has-pending", ctx_r2.state.pendingChangesCount() > 0);
    i0.ɵɵproperty("disabled", ctx_r2.state.pendingChangesCount() === 0 || ctx_r2.state.hasErrors());
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngIf", ctx_r2.state.pendingChangesCount() > 0);
} }
function SutramExcelStudioComponent_div_40_button_24_Template(rf, ctx) { if (rf & 1) {
    const _r33 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 106);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_button_24_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r33); const ctx_r32 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r32.onRefreshData()); });
    i0.ɵɵelement(1, "i", 107);
    i0.ɵɵelementStart(2, "span", 84);
    i0.ɵɵtext(3, "Refresh");
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_div_40_Template(rf, ctx) { if (rf & 1) {
    const _r35 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 79)(1, "div", 80)(2, "div", 81)(3, "button", 82);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r35); const ctx_r34 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r34.toggleBold()); });
    i0.ɵɵelementStart(4, "span", 83);
    i0.ɵɵtext(5, "B");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 84);
    i0.ɵɵtext(7, "Bold");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 85)(9, "button", 86);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r35); const ctx_r36 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r36.setTextAlign("left")); });
    i0.ɵɵelement(10, "i", 87);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 88);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r35); const ctx_r37 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r37.setTextAlign("center")); });
    i0.ɵɵelement(12, "i", 89);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 90);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r35); const ctx_r38 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r38.setTextAlign("right")); });
    i0.ɵɵelement(14, "i", 91);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "button", 92);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_15_listener($event) { i0.ɵɵrestoreView(_r35); i0.ɵɵnextContext(); const _r10 = i0.ɵɵreference(60); return i0.ɵɵresetView(_r10.toggle($event)); });
    i0.ɵɵelement(16, "i", 93);
    i0.ɵɵelementStart(17, "span", 84);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(19, "span", 94);
    i0.ɵɵtext(20, "Format");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(21, "div", 95);
    i0.ɵɵelementStart(22, "div", 80)(23, "div", 81);
    i0.ɵɵtemplate(24, SutramExcelStudioComponent_div_40_button_24_Template, 4, 0, "button", 96);
    i0.ɵɵelementStart(25, "button", 97);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_25_listener() { i0.ɵɵrestoreView(_r35); const ctx_r40 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r40.openFileManager()); });
    i0.ɵɵelement(26, "i", 98);
    i0.ɵɵelementStart(27, "span", 84);
    i0.ɵɵtext(28, "Open File");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "input", 99, 100);
    i0.ɵɵlistener("change", function SutramExcelStudioComponent_div_40_Template_input_change_29_listener($event) { i0.ɵɵrestoreView(_r35); const ctx_r41 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r41.onFileUpload($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "button", 101);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_31_listener() { i0.ɵɵrestoreView(_r35); const ctx_r42 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r42.exportExcel()); });
    i0.ɵɵelement(32, "i", 21);
    i0.ɵɵelementStart(33, "span", 84);
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(35, "span", 94);
    i0.ɵɵtext(36, "Data");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(37, "div", 95);
    i0.ɵɵelementStart(38, "div", 80)(39, "div", 81)(40, "button", 102);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_40_listener() { i0.ɵɵrestoreView(_r35); const ctx_r43 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r43.state.toggleFiltersEnabled()); });
    i0.ɵɵelement(41, "i", 103);
    i0.ɵɵelementStart(42, "span", 84);
    i0.ɵɵtext(43, "Filters");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(44, "button", 104);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_40_Template_button_click_44_listener() { i0.ɵɵrestoreView(_r35); const ctx_r44 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r44.state.toggleSortingEnabled()); });
    i0.ɵɵelement(45, "i", 105);
    i0.ɵɵelementStart(46, "span", 84);
    i0.ɵɵtext(47, "Sorting");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(48, "span", 94);
    i0.ɵɵtext(49, "Sort & Filter");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r3.isBoldActive);
    i0.ɵɵadvance(6);
    i0.ɵɵclassProp("active-align", ctx_r3.textAlign === "left");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active-align", ctx_r3.textAlign === "center");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active-align", ctx_r3.textAlign === "right");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("Columns (", ctx_r3.visibleHeadersCount, ")");
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngIf", !ctx_r3.isCurrentSheetRough);
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("disabled", ctx_r3.isExportingExcel);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ctx_r3.isExportingExcel ? "pi-spin pi-spinner text-primary" : "pi-download");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r3.isExportingExcel ? "Exporting..." : "Export");
    i0.ɵɵadvance(6);
    i0.ɵɵclassProp("active", ctx_r3.state.filtersEnabled());
    i0.ɵɵadvance(4);
    i0.ɵɵclassProp("active", ctx_r3.state.sortingEnabled());
} }
function SutramExcelStudioComponent_div_41_button_4_Template(rf, ctx) { if (rf & 1) {
    const _r48 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 114);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_41_button_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r48); const ctx_r47 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r47.tableSearchQuery = ""); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_41_div_6_span_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 121);
} }
function SutramExcelStudioComponent_div_41_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r52 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 115);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_41_div_6_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r52); const tbl_r49 = restoredCtx.$implicit; const ctx_r51 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r51.openTableInSheet(tbl_r49.table)); });
    i0.ɵɵelementStart(1, "button", 116);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_41_div_6_Template_button_click_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r52); const tbl_r49 = restoredCtx.$implicit; const ctx_r53 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r53.toggleFavoriteTable(tbl_r49.table, $event)); });
    i0.ɵɵelement(2, "i", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 117);
    i0.ɵɵelement(4, "i", 6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 118)(6, "span", 119);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(8, SutramExcelStudioComponent_div_41_div_6_span_8_Template, 1, 0, "span", 120);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tbl_r49 = ctx.$implicit;
    const ctx_r46 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("active-box", ctx_r46.isTableOpen(tbl_r49.table));
    i0.ɵɵproperty("title", tbl_r49.display_name ? tbl_r49.display_name + " (" + tbl_r49.table + ")" : tbl_r49.table);
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("starred", ctx_r46.favoriteTables.has(tbl_r49.table));
    i0.ɵɵproperty("title", ctx_r46.favoriteTables.has(tbl_r49.table) ? "Remove favorite" : "Add to startup sheets");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ctx_r46.favoriteTables.has(tbl_r49.table) ? "pi-star-fill" : "pi-star");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(tbl_r49.display_name || tbl_r49.table);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r46.isTableOpen(tbl_r49.table));
} }
function SutramExcelStudioComponent_div_41_Template(rf, ctx) { if (rf & 1) {
    const _r55 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 108)(1, "div", 109);
    i0.ɵɵelement(2, "i", 32);
    i0.ɵɵelementStart(3, "input", 110);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_41_Template_input_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r55); const ctx_r54 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r54.tableSearchQuery = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_41_button_4_Template, 2, 0, "button", 111);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 112);
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_div_41_div_6_Template, 9, 9, "div", 113);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r4.tableSearchQuery);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r4.tableSearchQuery);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r4.filteredTables);
} }
function SutramExcelStudioComponent_div_42_button_4_Template(rf, ctx) { if (rf & 1) {
    const _r59 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 114);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_42_button_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r59); const ctx_r58 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r58.reportSearchQuery = ""); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_42_div_6_span_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 121);
} }
function SutramExcelStudioComponent_div_42_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r63 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 124);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_42_div_6_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r63); const rep_r60 = restoredCtx.$implicit; const ctx_r62 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r62.openReportInSheet(rep_r60)); });
    i0.ɵɵelementStart(1, "button", 116);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_42_div_6_Template_button_click_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r63); const rep_r60 = restoredCtx.$implicit; const ctx_r64 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r64.toggleFavoriteReport(rep_r60.id, $event)); });
    i0.ɵɵelement(2, "i", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 125);
    i0.ɵɵelement(4, "i", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 118)(6, "span", 119);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(8, SutramExcelStudioComponent_div_42_div_6_span_8_Template, 1, 0, "span", 120);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const rep_r60 = ctx.$implicit;
    const ctx_r57 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("active-box", ctx_r57.isReportOpen(rep_r60.id));
    i0.ɵɵproperty("title", (rep_r60.display_name || rep_r60.title || rep_r60.table || rep_r60.id) + " \u2014 " + (rep_r60.desc || ""));
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("starred", ctx_r57.favoriteReports.has(rep_r60.id));
    i0.ɵɵproperty("title", ctx_r57.favoriteReports.has(rep_r60.id) ? "Remove favorite" : "Add to startup sheets");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ctx_r57.favoriteReports.has(rep_r60.id) ? "pi-star-fill" : "pi-star");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", rep_r60.icon);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(rep_r60.display_name || rep_r60.title || rep_r60.table || rep_r60.id);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r57.isReportOpen(rep_r60.id));
} }
function SutramExcelStudioComponent_div_42_Template(rf, ctx) { if (rf & 1) {
    const _r66 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 108)(1, "div", 109);
    i0.ɵɵelement(2, "i", 32);
    i0.ɵɵelementStart(3, "input", 122);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_42_Template_input_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r66); const ctx_r65 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r65.reportSearchQuery = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_42_button_4_Template, 2, 0, "button", 111);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 112);
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_div_42_div_6_Template, 9, 10, "div", 123);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r5.reportSearchQuery);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r5.reportSearchQuery);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r5.filteredReports);
} }
function SutramExcelStudioComponent_div_43_Template(rf, ctx) { if (rf & 1) {
    const _r68 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 79)(1, "div", 80)(2, "div", 81)(3, "button", 126);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_43_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r68); const ctx_r67 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r67.setBooleanStyle("checkbox")); });
    i0.ɵɵelement(4, "i", 127);
    i0.ɵɵelementStart(5, "span", 84);
    i0.ɵɵtext(6, "Checkbox");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "button", 128);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_43_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r68); const ctx_r69 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r69.setBooleanStyle("badge")); });
    i0.ɵɵelement(8, "i", 129);
    i0.ɵɵelementStart(9, "span", 84);
    i0.ɵɵtext(10, "Badge");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(11, "span", 94);
    i0.ɵɵtext(12, "Boolean");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r6 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r6.booleanDisplayStyle === "checkbox");
    i0.ɵɵadvance(4);
    i0.ɵɵclassProp("active", ctx_r6.booleanDisplayStyle === "badge");
} }
function SutramExcelStudioComponent_button_56_Template(rf, ctx) { if (rf & 1) {
    const _r71 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 130);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_button_56_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r71); const ctx_r70 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r70.clearDbSearch()); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_span_57_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 131);
    i0.ɵɵelement(1, "i", 132);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_58_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 133);
    i0.ɵɵelement(1, "i", 12);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", ctx_r9.state.rows().length, " / ", ctx_r9.state.totalDbRecords(), "");
} }
function SutramExcelStudioComponent_ng_template_61_button_5_Template(rf, ctx) { if (rf & 1) {
    const _r77 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 149);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_61_button_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r77); const ctx_r76 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r76.colSearchQuery = ""); });
    i0.ɵɵelement(1, "i", 150);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_61_ng_container_17_div_3_span_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 159);
    i0.ɵɵtext(1, "*");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_61_ng_container_17_div_3_Template(rf, ctx) { if (rf & 1) {
    const _r82 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 153);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_61_ng_container_17_div_3_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r82); const col_r79 = restoredCtx.$implicit; const ctx_r81 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r81.toggleColumnCheckbox(col_r79.key)); });
    i0.ɵɵelementStart(1, "div", 154);
    i0.ɵɵelement(2, "input", 155);
    i0.ɵɵelementStart(3, "span", 156);
    i0.ɵɵtext(4);
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_ng_template_61_ng_container_17_div_3_span_5_Template, 2, 0, "span", 157);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "span", 158);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r79 = ctx.$implicit;
    const ctx_r78 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r78.isColumnSelected(col_r79.key));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("title", col_r79.name);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", col_r79.name, "");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r79.not_null);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(col_r79.type || "string");
} }
function SutramExcelStudioComponent_ng_template_61_ng_container_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 151);
    i0.ɵɵtext(2, "Standard Columns");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_ng_template_61_ng_container_17_div_3_Template, 8, 5, "div", 152);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r73 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r73.filteredDirectCols)("ngForTrackBy", ctx_r73.trackByColKey);
} }
function SutramExcelStudioComponent_ng_template_61_ng_container_18_div_3_div_14_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r89 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 153);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_61_ng_container_18_div_3_div_14_div_1_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r89); const col_r87 = restoredCtx.$implicit; const ctx_r88 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r88.toggleColumnCheckbox(col_r87.key)); });
    i0.ɵɵelementStart(1, "div", 154);
    i0.ɵɵelement(2, "input", 155);
    i0.ɵɵelementStart(3, "span", 156);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "span", 158);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r87 = ctx.$implicit;
    const ctx_r86 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r86.isColumnSelected(col_r87.key));
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("font-weight", col_r87.is_fk_main ? "600" : "normal");
    i0.ɵɵproperty("title", col_r87.name);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", col_r87.short_name || col_r87.name, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(col_r87.is_fk_main ? "display" : col_r87.is_fk_raw ? "id" : col_r87.type || "string");
} }
function SutramExcelStudioComponent_ng_template_61_ng_container_18_div_3_div_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 173);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_ng_template_61_ng_container_18_div_3_div_14_div_1_Template, 7, 6, "div", 152);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const grp_r84 = i0.ɵɵnextContext().$implicit;
    const ctx_r85 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", grp_r84.columns)("ngForTrackBy", ctx_r85.trackByColKey);
} }
function SutramExcelStudioComponent_ng_template_61_ng_container_18_div_3_Template(rf, ctx) { if (rf & 1) {
    const _r92 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 162)(1, "div", 163)(2, "div", 164);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_61_ng_container_18_div_3_Template_div_click_2_listener() { const restoredCtx = i0.ɵɵrestoreView(_r92); const grp_r84 = restoredCtx.$implicit; const ctx_r91 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r91.toggleFkGroupExpand(grp_r84.name)); });
    i0.ɵɵelement(3, "i", 165);
    i0.ɵɵelementStart(4, "span", 166);
    i0.ɵɵelement(5, "i", 167);
    i0.ɵɵelementStart(6, "strong", 168);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span", 169);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "div", 170);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_61_ng_container_18_div_3_Template_div_click_10_listener() { const restoredCtx = i0.ɵɵrestoreView(_r92); const grp_r84 = restoredCtx.$implicit; const ctx_r93 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r93.toggleFkGroupAll(grp_r84.name)); });
    i0.ɵɵelement(11, "input", 155);
    i0.ɵɵelementStart(12, "span", 171);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(14, SutramExcelStudioComponent_ng_template_61_ng_container_18_div_3_div_14_Template, 2, 2, "div", 172);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const grp_r84 = ctx.$implicit;
    const ctx_r83 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("fk-active-group", grp_r84.selectedCount > 0);
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("rotated", ctx_r83.isFkGroupExpanded(grp_r84.name));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(grp_r84.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("(", grp_r84.refTable, ")");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", grp_r84.isAllChecked);
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("background", grp_r84.selectedCount > 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(125, 125, 125, 0.1)")("color", grp_r84.selectedCount > 0 ? "#059669" : "var(--text-muted)");
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate2(" ", grp_r84.selectedCount, "/", grp_r84.totalCount, " ");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r83.isFkGroupExpanded(grp_r84.name));
} }
function SutramExcelStudioComponent_ng_template_61_ng_container_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 160);
    i0.ɵɵtext(2, "FK Reference Groups");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_ng_template_61_ng_container_18_div_3_Template, 15, 14, "div", 161);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r74 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r74.filteredFkGroups)("ngForTrackBy", ctx_r74.trackByGroupName);
} }
function SutramExcelStudioComponent_ng_template_61_div_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 174);
    i0.ɵɵelement(1, "i", 175);
    i0.ɵɵtext(2, " No matching columns found ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_61_Template(rf, ctx) { if (rf & 1) {
    const _r95 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 134)(1, "div", 135)(2, "div", 136);
    i0.ɵɵelement(3, "i", 137);
    i0.ɵɵelementStart(4, "input", 138);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_ng_template_61_Template_input_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r95); const ctx_r94 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r94.colSearchQuery = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_ng_template_61_button_5_Template, 2, 0, "button", 139);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 140)(7, "div", 141)(8, "button", 142);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_61_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r95); const ctx_r96 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r96.selectAllColumns(true)); });
    i0.ɵɵtext(9, "All");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 142);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_61_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r95); const ctx_r97 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r97.selectAllColumns(false)); });
    i0.ɵɵtext(11, "None");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "button", 142);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_61_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r95); const ctx_r98 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r98.resetDefaultColumns()); });
    i0.ɵɵtext(13, "Reset");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "span", 143);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "div", 144);
    i0.ɵɵtemplate(17, SutramExcelStudioComponent_ng_template_61_ng_container_17_Template, 4, 2, "ng-container", 42);
    i0.ɵɵtemplate(18, SutramExcelStudioComponent_ng_template_61_ng_container_18_Template, 4, 2, "ng-container", 42);
    i0.ɵɵtemplate(19, SutramExcelStudioComponent_ng_template_61_div_19_Template, 3, 0, "div", 145);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "div", 146)(21, "span", 147);
    i0.ɵɵtext(22, "Click outside or press Esc");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "button", 148);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_61_Template_button_click_23_listener() { i0.ɵɵrestoreView(_r95); i0.ɵɵnextContext(); const _r10 = i0.ɵɵreference(60); return i0.ɵɵresetView(_r10.hide()); });
    i0.ɵɵtext(24, "Done");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r11 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngModel", ctx_r11.colSearchQuery);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r11.colSearchQuery);
    i0.ɵɵadvance(10);
    i0.ɵɵtextInterpolate2("", ctx_r11.selectedColumnKeys.size, " of ", ctx_r11.allConfigColumns.length, " visible");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r11.filteredDirectCols.length > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r11.filteredFkGroups.length > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r11.filteredDirectCols.length === 0 && ctx_r11.filteredFkGroups.length === 0);
} }
function SutramExcelStudioComponent_div_67_Template(rf, ctx) { if (rf & 1) {
    const _r101 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div")(1, "button", 176);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_67_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r101); const ctx_r100 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r100.showSidebar = true); });
    i0.ɵɵelement(2, "i", 72);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r12 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" \u0917\u0932\u0924\u093F\u092F\u093E\u0901 (", ctx_r12.state.unresolvedCorrectionsCount(), ") ");
} }
function SutramExcelStudioComponent_div_73_span_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 184);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r102 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", tab_r102.title, " ");
} }
function SutramExcelStudioComponent_div_73_input_3_Template(rf, ctx) { if (rf & 1) {
    const _r110 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "input", 185);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_73_input_3_Template_input_ngModelChange_0_listener($event) { i0.ɵɵrestoreView(_r110); const ctx_r109 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r109.renamingTabTitle = $event); })("keyup.enter", function SutramExcelStudioComponent_div_73_input_3_Template_input_keyup_enter_0_listener() { i0.ɵɵrestoreView(_r110); const tab_r102 = i0.ɵɵnextContext().$implicit; const ctx_r111 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r111.saveTabRename(tab_r102)); })("keyup.escape", function SutramExcelStudioComponent_div_73_input_3_Template_input_keyup_escape_0_listener() { i0.ɵɵrestoreView(_r110); const ctx_r113 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r113.cancelTabRename()); })("blur", function SutramExcelStudioComponent_div_73_input_3_Template_input_blur_0_listener() { i0.ɵɵrestoreView(_r110); const tab_r102 = i0.ɵɵnextContext().$implicit; const ctx_r114 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r114.saveTabRename(tab_r102)); })("click", function SutramExcelStudioComponent_div_73_input_3_Template_input_click_0_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r102 = i0.ɵɵnextContext().$implicit;
    const ctx_r104 = i0.ɵɵnextContext();
    i0.ɵɵproperty("id", "tab-rename-input-" + tab_r102.id)("ngModel", ctx_r104.renamingTabTitle);
} }
function SutramExcelStudioComponent_div_73_span_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 186);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r102 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", tab_r102.recordCount, " ");
} }
function SutramExcelStudioComponent_div_73_button_5_Template(rf, ctx) { if (rf & 1) {
    const _r121 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 187);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_73_button_5_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r121); const tab_r102 = i0.ɵɵnextContext().$implicit; const ctx_r119 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r119.startRenameTab(tab_r102, $event)); });
    i0.ɵɵelement(1, "i", 188);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_73_button_6_Template(rf, ctx) { if (rf & 1) {
    const _r124 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 189);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_73_button_6_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r124); const tab_r102 = i0.ɵɵnextContext().$implicit; const ctx_r122 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r122.closeSheet(tab_r102.id, $event)); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_73_Template(rf, ctx) { if (rf & 1) {
    const _r126 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 177);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_73_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r126); const tab_r102 = restoredCtx.$implicit; const ctx_r125 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r125.switchSheet(tab_r102.id)); })("dblclick", function SutramExcelStudioComponent_div_73_Template_div_dblclick_0_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r126); const tab_r102 = restoredCtx.$implicit; const ctx_r127 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r127.startRenameTab(tab_r102, $event)); })("contextmenu", function SutramExcelStudioComponent_div_73_Template_div_contextmenu_0_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r126); const tab_r102 = restoredCtx.$implicit; const ctx_r128 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r128.openTabContextMenu($event, tab_r102)); });
    i0.ɵɵelement(1, "i", 178);
    i0.ɵɵtemplate(2, SutramExcelStudioComponent_div_73_span_2_Template, 2, 1, "span", 179);
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_div_73_input_3_Template, 1, 2, "input", 180);
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_73_span_4_Template, 2, 1, "span", 181);
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_div_73_button_5_Template, 2, 0, "button", 182);
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_div_73_button_6_Template, 2, 0, "button", 183);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r102 = ctx.$implicit;
    const ctx_r14 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active-tab", ctx_r14.activeSheetId === tab_r102.id);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", tab_r102.icon);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r14.renamingTabId !== tab_r102.id);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r14.renamingTabId === tab_r102.id);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", tab_r102.isLoaded && (tab_r102.recordCount || 0) > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r14.renamingTabId !== tab_r102.id && (tab_r102.type === "rough" || tab_r102.id.startsWith("rough_") || tab_r102.id.startsWith("sheet_")));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r14.sheetTabs.length > 1);
} }
function SutramExcelStudioComponent_div_76_div_5_Template(rf, ctx) { if (rf & 1) {
    const _r131 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 194);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_76_div_5_Template_div_click_0_listener($event) { i0.ɵɵrestoreView(_r131); const ctx_r130 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r130.deleteSheet(ctx_r130.tabContextMenu.tab, $event)); });
    i0.ɵɵelement(1, "i", 195);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "\u0936\u0940\u091F \u0939\u091F\u093E\u090F\u0902 / \u0921\u093F\u0932\u0940\u091F \u0915\u0930\u0947\u0902 (Delete Sheet)");
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_div_76_Template(rf, ctx) { if (rf & 1) {
    const _r134 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 190);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_76_Template_div_click_0_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementStart(1, "div", 191);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_76_Template_div_click_1_listener($event) { i0.ɵɵrestoreView(_r134); const ctx_r133 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r133.startRenameTab(ctx_r133.tabContextMenu.tab, $event)); });
    i0.ɵɵelement(2, "i", 192);
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "\u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Rename Sheet)");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_div_76_div_5_Template, 4, 0, "div", 193);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r15 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("left", ctx_r15.tabContextMenu.x, "px")("top", ctx_r15.tabContextMenu.y, "px");
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngIf", ctx_r15.tabContextMenu.tab);
} }
function SutramExcelStudioComponent_span_83_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 196);
    i0.ɵɵelement(1, "i", 197);
    i0.ɵɵtext(2, "Loading more... ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_span_84_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 198);
    i0.ɵɵelement(1, "i", 199);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r17 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r17.state.deletedRowIds().length, " Deleted ");
} }
function SutramExcelStudioComponent_span_85_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 200);
    i0.ɵɵtext(1, "\u2713 100% In Sync");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_span_86_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 201);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r19 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("", ctx_r19.state.stats().errorRows, " \u0924\u094D\u0930\u0941\u091F\u093F\u092F\u093E\u0901");
} }
function SutramExcelStudioComponent_span_87_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 202);
    i0.ɵɵelement(1, "i", 203);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r20 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("sync-error", ctx_r20.lastSyncPerSheet[ctx_r20.activeSheetId].hasError);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("\u0905\u0902\u0924\u093F\u092E \u0938\u093F\u0902\u0915 (", ctx_r20.lastSyncPerSheet[ctx_r20.activeSheetId].time, "): ", ctx_r20.lastSyncPerSheet[ctx_r20.activeSheetId].summary, " ");
} }
function SutramExcelStudioComponent_div_98_div_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 216)(1, "div", 217)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 218);
    i0.ɵɵelement(7, "div", 219);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r135 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", ctx_r135.syncToast.percentage, "% \u092A\u0942\u0930\u094D\u0923");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r135.state.importProgress().current, " / ", ctx_r135.state.importProgress().total, "");
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("width", ctx_r135.syncToast.percentage, "%");
} }
function SutramExcelStudioComponent_div_98_span_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 220);
    i0.ɵɵelement(1, "i", 65);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r136 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r136.syncToast.inserted, " Inserted ");
} }
function SutramExcelStudioComponent_div_98_span_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 221);
    i0.ɵɵelement(1, "i", 222);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r137 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r137.syncToast.updated, " Updated ");
} }
function SutramExcelStudioComponent_div_98_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 223);
    i0.ɵɵelement(1, "i", 195);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r138 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r138.syncToast.deleted, " Deleted ");
} }
function SutramExcelStudioComponent_div_98_span_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 224);
    i0.ɵɵelement(1, "i", 150);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r139 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r139.syncToast.failed, " Failed ");
} }
function SutramExcelStudioComponent_div_98_div_15_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const err_r142 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("\u2022 ", err_r142, "");
} }
function SutramExcelStudioComponent_div_98_div_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 225);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_div_98_div_15_div_1_Template, 2, 1, "div", 226);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r140 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", ctx_r140.syncToast.errors);
} }
function SutramExcelStudioComponent_div_98_Template(rf, ctx) { if (rf & 1) {
    const _r144 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 204)(1, "div", 205)(2, "div", 206);
    i0.ɵɵelement(3, "i", 21);
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 207);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_98_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r144); const ctx_r143 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r143.dismissSyncToast()); });
    i0.ɵɵtext(7, "\u2715");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(8, SutramExcelStudioComponent_div_98_div_8_Template, 8, 5, "div", 208);
    i0.ɵɵelementStart(9, "div", 209)(10, "div", 210);
    i0.ɵɵtemplate(11, SutramExcelStudioComponent_div_98_span_11_Template, 3, 1, "span", 211);
    i0.ɵɵtemplate(12, SutramExcelStudioComponent_div_98_span_12_Template, 3, 1, "span", 212);
    i0.ɵɵtemplate(13, SutramExcelStudioComponent_div_98_span_13_Template, 3, 1, "span", 213);
    i0.ɵɵtemplate(14, SutramExcelStudioComponent_div_98_span_14_Template, 3, 1, "span", 214);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(15, SutramExcelStudioComponent_div_98_div_15_Template, 2, 1, "div", 215);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r21 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngClass", ctx_r21.syncToast.inProgress ? "pi-spin pi-sync text-primary" : ctx_r21.syncToast.hasError ? "pi-exclamation-circle text-warning" : "pi-check-circle text-success");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r21.syncToast.title);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r21.syncToast.inProgress);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngIf", ctx_r21.syncToast.inserted > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r21.syncToast.updated > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r21.syncToast.deleted > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r21.syncToast.failed > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r21.syncToast.errors.length > 0);
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
    fileInputRef;
    savedSheetsList = [];
    // ── Top Ribbon Navigation & Catalogs State ───────────────────
    activeTopTab = 'home';
    tableSearchQuery = '';
    reportSearchQuery = '';
    favoriteTables = new Set();
    favoriteReports = new Set();
    // ── Configurable Boolean Display Settings ────────────────────
    booleanDisplayStyle = 'checkbox';
    // ── Pre-configured Reports Catalog (CTE & SQL Views) ─────────
    reportsList = [
        {
            id: 'mn_awk_type_wise',
            display_name: 'मासिक आवक प्रकार सार (Aawak Summary)',
            title: 'मासिक आवक प्रकार सार (Aawak Summary)',
            desc: 'Monthly Aawak Type Saar',
            icon: 'pi-chart-line',
            table: 'mn_awk_type_wise',
            category: 'Aawak / Inventory'
        },
        {
            id: 'mn_jwk_aj_type',
            display_name: 'मासिक जावक प्रकार सार (Jawak Summary)',
            title: 'मासिक जावक प्रकार सार (Jawak Summary)',
            desc: 'Monthly Jawak Type Saar',
            icon: 'pi-chart-bar',
            table: 'mn_jwk_aj_type',
            category: 'Jawak / Inventory'
        },
        {
            id: 'bachat_summary',
            display_name: 'बचत सारांश (Bachat Summary)',
            title: 'बचत सारांश (Bachat Summary)',
            desc: 'Bachat Stock Summary',
            icon: 'pi-percentage',
            table: 'bachat',
            category: 'Stock Balance'
        },
        {
            id: 'pbk_closing',
            display_name: 'पीबीके क्लोजिंग (PBK Closing)',
            title: 'पीबीके क्लोजिंग (PBK Closing)',
            desc: 'PBK Closing Statement',
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
    // Tab Renaming & Tab Context Menu State
    renamingTabId = null;
    renamingTabTitle = '';
    tabContextMenu = {
        visible: false,
        x: 0,
        y: 0,
        tab: null
    };
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
    isExportingExcel = false;
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
    // Scanner modal state & Dual-Mode Open File
    showScannerModal = false;
    scanReport = null;
    uploadedWorkbook = null;
    uploadedFileName = '';
    uploadedSheetNames = [];
    selectedUploadedSheet = '';
    uploadedAllRawRows = [];
    uploadedSheetHeaders = [];
    uploadedRawRows = [];
    uploadedSampleRows = [];
    uploadedTotalRows = 0;
    scannerTargetTable = '';
    scannerTableConfig = null;
    scannerAvailableHeaders = [];
    isScannerConfigLoading = false;
    pendingRawRows = [];
    // Correction sidebar state
    showSidebar = false;
    // Import progress modal state
    showProgressModal = false;
    rejectedRowsDuringImport = [];
    isCancelRequested = false;
    // DB Search & Ref Cache Subscriptions
    searchSubject = new Subject();
    searchSub;
    refLoadedSub;
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
                // Safe unwrapping for JSON / nested objects to prevent "[object Object]"
                if (rawVal !== null && typeof rawVal === 'object') {
                    if (rawVal.display)
                        rawVal = rawVal.display;
                    else if (rawVal.name)
                        rawVal = rawVal.name;
                    else if (rawVal.title)
                        rawVal = rawVal.title;
                    else if (rawVal.label)
                        rawVal = rawVal.label;
                    else if (rawVal.url)
                        rawVal = rawVal.url;
                    else if (Array.isArray(rawVal))
                        rawVal = rawVal.length > 0 ? JSON.stringify(rawVal) : '';
                    else if (Object.keys(rawVal).length === 0)
                        rawVal = '';
                    else
                        rawVal = JSON.stringify(rawVal);
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
        if (this.isCurrentSheetReport)
            return 'strip-clean';
        if (this.state.stats().errorRows > 0)
            return 'strip-error';
        if (this.mode === 'intelligent')
            return 'strip-suggestion';
        return 'strip-clean';
    }
    get statusStripIcon() {
        if (this.isCurrentSheetReport)
            return 'pi-chart-bar text-primary';
        if (this.state.stats().errorRows > 0)
            return 'pi-exclamation-triangle text-danger';
        if (this.mode === 'intelligent')
            return 'pi-bolt text-primary';
        return 'pi-info-circle text-primary';
    }
    get statusStripMessage() {
        if (this.isCurrentSheetReport) {
            return 'Report view loaded. Filter, sort, or export to Excel anytime.';
        }
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
        // Load persisted boolean display settings
        const savedBoolStyle = localStorage.getItem('sutram_boolean_style');
        if (savedBoolStyle && ['checkbox', 'badge'].includes(savedBoolStyle)) {
            this.booleanDisplayStyle = savedBoolStyle;
        }
        this.state.isAuditMode.set(this.mode === 'intelligent');
        this.state.filtersEnabled.set(this.enableFilters);
        this.state.sortingEnabled.set(this.enableSorting);
        // Refresh saved local sheets list from localStorage
        this.refreshSavedSheetsList();
        // Debounced direct database search
        this.searchSub = this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((query) => {
            this.state.dbSearchQuery.set(query);
            if (this.selectedTableName) {
                this.loadDataChunk(this.selectedTableName, 0, 100, true);
            }
        });
        // Reactive listener: automatically re-audit current grid rows whenever a referenced FK dataset finishes caching
        this.refLoadedSub = this.refCache.tableLoaded$.subscribe((loadedTable) => {
            const cfg = this.state.config();
            if (!cfg || !cfg.headers)
                return;
            const cleanLoaded = (loadedTable || '').toLowerCase().trim();
            const hasRef = cfg.headers.some((h) => (h.ref_table || '').toLowerCase().trim() === cleanLoaded);
            if (hasRef) {
                const rows = this.state.rows();
                if (rows && rows.length > 0) {
                    this.audit.auditAll(rows, cfg.headers);
                    this.state.setRows([...rows]);
                    this.cdr.markForCheck();
                }
            }
        });
        this.loadTablesList();
    }
    ngOnDestroy() {
        this.searchSub?.unsubscribe();
        this.refLoadedSub?.unsubscribe();
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
        if (this.isExportingExcel)
            return;
        const curTab = this.sheetTabs.find(t => t.id === this.activeSheetId);
        const targetTable = curTab?.tableName || this.selectedTableName;
        const isRough = this.isCurrentSheetRough;
        // Case 1: Rough / Blank Sheet (In-Memory Export)
        if (isRough || !targetTable) {
            const rows = this.state.rows().filter(r => this.isRowPopulated(r));
            if (!rows || rows.length === 0) {
                alert('डाउनलोड करने के लिए शीट में कोई डेटा नहीं है (No data to export)');
                return;
            }
            this.downloadExcelWorkbook(rows, this.activeSheetId || 'Sheet1');
            return;
        }
        // Case 2: Database Table / Report -> Fetch ALL matching rows based on active filters, search & sort
        const cfg = this.state.config();
        if (!cfg) {
            alert('तालिका कॉन्फ़िगरेशन अभी लोड नहीं हुआ है (Configuration not ready)');
            return;
        }
        this.isExportingExcel = true;
        this.cdr.markForCheck();
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
        const apiFilters = this.buildApiFilters();
        this.api.getTableDataChunk(targetTable, {
            export: true,
            search: searchQuery || undefined,
            sort: sortColKey,
            order: activeSort?.order,
            filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined
        }).subscribe({
            next: (res) => {
                this.isExportingExcel = false;
                const dbRows = res.rows || [];
                if (dbRows.length === 0) {
                    alert('फिल्टर के अनुसार कोई डेटा नहीं मिला (No matching records to export)');
                    this.cdr.markForCheck();
                    return;
                }
                // Convert db records to SutramRow format for clean column mapping & FK display
                const builtRows = dbRows.map((dr, idx) => {
                    return this.convertDbRecordToSutramRow(dr, idx + 1, cfg);
                });
                // Overlay any unsaved in-memory edits for modified rows
                const currentMemoryRows = this.state.rows();
                const modifiedMemoryMap = new Map();
                for (const mr of currentMemoryRows) {
                    if (mr.isModified) {
                        const idVal = mr.cells['_id']?.value || mr.cells['id']?.value;
                        if (idVal)
                            modifiedMemoryMap.set(String(idVal), mr);
                    }
                }
                if (modifiedMemoryMap.size > 0) {
                    builtRows.forEach(br => {
                        const idVal = br.cells['_id']?.value || br.cells['id']?.value;
                        if (idVal && modifiedMemoryMap.has(String(idVal))) {
                            const memRow = modifiedMemoryMap.get(String(idVal));
                            Object.keys(memRow.cells).forEach(k => {
                                if (memRow.cells[k]?.isModified) {
                                    br.cells[k] = { ...memRow.cells[k] };
                                }
                            });
                        }
                    });
                }
                // Include any newly added un-synced rows
                const newMemoryRows = currentMemoryRows.filter(r => r.isNew && this.isRowPopulated(r));
                const allFinalRows = [...newMemoryRows, ...builtRows];
                const sheetTitle = curTab?.title || targetTable;
                this.downloadExcelWorkbook(allFinalRows, sheetTitle);
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isExportingExcel = false;
                console.error('[SutramStudio] Export failed:', err);
                alert('एक्सेल निर्यात विफल रहा (Export failed): ' + (err?.message || 'Server error'));
                this.cdr.markForCheck();
            }
        });
    }
    downloadExcelWorkbook(rows, sheetName) {
        const headers = this.visibleHeaders;
        const exportData = rows.map(r => {
            const obj = {};
            headers.forEach(h => {
                const colTitle = h.name || h.col_name || h.key;
                let cellVal = r.cells[h.key]?.value ?? r.cells[h.name]?.value ?? r.cells[h.col_name]?.value ?? '';
                if (this.isBooleanColumn(h)) {
                    cellVal = this.isCellTrue(cellVal) ? 'Yes' : 'No';
                }
                obj[colTitle] = cellVal;
            });
            return obj;
        });
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        const cleanSheetName = (sheetName || 'Sheet1').replace(/[*?:/\\\[\]]/g, '').slice(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
        const filename = `${sheetName || 'export'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);
    }
    isBooleanColumn(col) {
        if (!col)
            return false;
        const t = (col.type || '').toLowerCase();
        if (t === 'boolean' || t === 'bool')
            return true;
        const colName = (col.col_name || col.name || col.key || '').toLowerCase();
        return (colName === 'active' ||
            colName === 'verify' ||
            colName.startsWith('is_') ||
            colName.startsWith('has_') ||
            colName.endsWith('_status') ||
            colName.endsWith('_flag'));
    }
    isCellTrue(val) {
        return (val === true ||
            val === 1 ||
            val === '1' ||
            val === 'true' ||
            val === 'TRUE' ||
            val === 'yes' ||
            val === 'YES' ||
            val === 'y' ||
            val === 'Y' ||
            val === 'सक्रिय');
    }
    setTopTab(tab) {
        this.activeTopTab = tab;
        this.cdr.markForCheck();
    }
    setBooleanStyle(style) {
        this.booleanDisplayStyle = style;
        localStorage.setItem('sutram_boolean_style', style);
        this.cdr.markForCheck();
    }
    get isCurrentSheetRough() {
        const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
        return !cur || cur.type === 'rough' || this.activeSheetId === 'blank' || this.activeSheetId.startsWith('rough_') || this.activeSheetId.startsWith('sheet_');
    }
    get isCurrentSheetReport() {
        const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
        return !!cur && cur.type === 'report';
    }
    get isCurrentSheetTable() {
        const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
        return !!cur && cur.type === 'table';
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
            const tabTitle = tableInfo?.display_name || tableName;
            const newTab = {
                id: tableName,
                title: tabTitle,
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
        this.mode = 'normal';
        this.state.isAuditMode.set(false);
        const tabId = 'rep_' + report.id;
        const foundTab = this.sheetTabs.find(t => t.id === tabId);
        if (foundTab) {
            this.switchSheet(foundTab.id);
        }
        else {
            const reportTitle = report.display_name || report.title || report.table || report.id;
            const newTab = {
                id: tabId,
                title: reportTitle,
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
    // ── Sheet Tab Inline Renaming & Context Menu ──────────────────
    startRenameTab(tab, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.renamingTabId = tab.id;
        this.renamingTabTitle = tab.title;
        this.closeTabContextMenu();
        this.cdr.markForCheck();
        setTimeout(() => {
            const el = document.getElementById(`tab-rename-input-${tab.id}`);
            if (el) {
                el.focus();
                el.select();
            }
        }, 50);
    }
    saveTabRename(tab) {
        if (this.renamingTabId !== tab.id)
            return;
        const trimmed = (this.renamingTabTitle || '').trim();
        if (trimmed && trimmed !== tab.title) {
            tab.title = trimmed;
            if (this.sheetWorkbooks[tab.id]?.config) {
                this.sheetWorkbooks[tab.id].config.display_name = trimmed;
            }
            if (this.activeSheetId === tab.id) {
                const currentCfg = this.state.config();
                if (currentCfg) {
                    this.state.setConfig({
                        ...currentCfg,
                        display_name: trimmed
                    });
                }
            }
            try {
                const localSaved = localStorage.getItem(`sutram_rough_${tab.id}`);
                if (localSaved) {
                    const parsed = JSON.parse(localSaved);
                    parsed.title = trimmed;
                    localStorage.setItem(`sutram_rough_${tab.id}`, JSON.stringify(parsed));
                }
            }
            catch (e) {
                console.warn('Could not update localStorage title:', e);
            }
        }
        this.renamingTabId = null;
        this.renamingTabTitle = '';
        this.cdr.markForCheck();
    }
    cancelTabRename() {
        this.renamingTabId = null;
        this.renamingTabTitle = '';
        this.cdr.markForCheck();
    }
    openTabContextMenu(event, tab) {
        event.preventDefault();
        event.stopPropagation();
        const menuHeight = 85;
        const menuWidth = 190;
        const x = Math.min(event.clientX, window.innerWidth - menuWidth - 10);
        const y = event.clientY + menuHeight > window.innerHeight
            ? Math.max(10, event.clientY - menuHeight)
            : event.clientY;
        this.tabContextMenu = {
            visible: true,
            x,
            y,
            tab
        };
        this.cdr.markForCheck();
    }
    closeTabContextMenu() {
        if (this.tabContextMenu.visible) {
            this.tabContextMenu.visible = false;
            this.tabContextMenu.tab = null;
            this.cdr.markForCheck();
        }
    }
    deleteSheet(tab, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.closeTabContextMenu();
        const tabId = tab.id;
        // 1. Remove from localStorage
        try {
            localStorage.removeItem(`sutram_rough_${tabId}`);
        }
        catch (e) {
            console.warn('Could not remove rough sheet from localStorage:', e);
        }
        // 2. Remove from in-memory cache and sync tracking
        delete this.sheetWorkbooks[tabId];
        delete this.lastSyncPerSheet[tabId];
        // 3. Remove from sheetTabs
        const idx = this.sheetTabs.findIndex(t => t.id === tabId);
        if (idx >= 0) {
            this.sheetTabs.splice(idx, 1);
        }
        // 4. If active sheet was deleted, switch to adjacent sheet or create new blank sheet
        if (this.activeSheetId === tabId) {
            if (this.sheetTabs.length > 0) {
                const nextTab = this.sheetTabs[Math.max(0, idx - 1)] || this.sheetTabs[0];
                this.switchSheet(nextTab.id);
            }
            else {
                this.addNewBlankSheet();
            }
        }
        // 5. If this tab was a table tab pinned from favorites, unpin it
        if (tab.type === 'table' && tab.tableName) {
            this.favoriteTables.delete(tab.tableName);
            localStorage.setItem('sutram_studio_favorites', JSON.stringify(Array.from(this.favoriteTables)));
        }
        this.refreshSavedSheetsList();
        this.cdr.markForCheck();
    }
    // ── Saved Local Sheets Management & File Manager ──────────────
    refreshSavedSheetsList() {
        const list = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sutram_rough_')) {
                    const sheetId = key.replace('sutram_rough_', '');
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        list.push({
                            sheetId,
                            title: parsed.title || sheetId,
                            savedAt: parsed.savedAt || '',
                            rowCount: Array.isArray(parsed.rows) ? parsed.rows.length : 0
                        });
                    }
                }
            }
        }
        catch (e) {
            console.warn('Error reading saved sheets from localStorage:', e);
        }
        this.savedSheetsList = list;
        this.cdr.markForCheck();
    }
    openFileManager() {
        this.refreshSavedSheetsList();
        this.showScannerModal = true;
        this.cdr.markForCheck();
    }
    triggerBrowseFile() {
        if (this.fileInputRef?.nativeElement) {
            this.fileInputRef.nativeElement.click();
        }
    }
    onOpenSavedSheet(sheetId) {
        this.showScannerModal = false;
        let existingTab = this.sheetTabs.find(t => t.id === sheetId);
        if (!existingTab) {
            let sheetTitle = 'Saved Sheet';
            try {
                const raw = localStorage.getItem(`sutram_rough_${sheetId}`);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    sheetTitle = parsed.title || sheetTitle;
                }
            }
            catch { }
            existingTab = {
                id: sheetId,
                title: sheetTitle,
                icon: 'pi-file',
                type: 'rough',
                isLoaded: true
            };
            this.sheetTabs.push(existingTab);
        }
        this.switchSheet(sheetId);
        this.cdr.markForCheck();
    }
    onDeleteSavedSheet(sheetId) {
        try {
            localStorage.removeItem(`sutram_rough_${sheetId}`);
        }
        catch (e) {
            console.warn('Could not remove sheet from localStorage:', e);
        }
        delete this.sheetWorkbooks[sheetId];
        delete this.lastSyncPerSheet[sheetId];
        const idx = this.sheetTabs.findIndex(t => t.id === sheetId);
        if (idx >= 0) {
            this.sheetTabs.splice(idx, 1);
            if (this.activeSheetId === sheetId) {
                if (this.sheetTabs.length > 0) {
                    const nextTab = this.sheetTabs[Math.max(0, idx - 1)] || this.sheetTabs[0];
                    this.switchSheet(nextTab.id);
                }
                else {
                    this.addNewBlankSheet();
                }
            }
        }
        this.refreshSavedSheetsList();
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
            display_name: 'Sheet 1',
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
        const curTab = this.sheetTabs.find(t => t.id === this.activeSheetId);
        const dataToSave = {
            sheetId: this.activeSheetId,
            title: curTab?.title,
            savedAt: new Date().toLocaleTimeString(),
            rows: cleanRows,
            allConfigColumns: this.allConfigColumns,
            selectedColumnKeys: Array.from(this.selectedColumnKeys)
        };
        try {
            localStorage.setItem(`sutram_rough_${this.activeSheetId}`, JSON.stringify(dataToSave));
            const curTab = this.sheetTabs.find(t => t.id === this.activeSheetId);
            const isReport = curTab?.type === 'report';
            if (curTab) {
                curTab.lastSaved = new Date().toLocaleTimeString();
                curTab.recordCount = currentRows.length;
            }
            this.lastSyncPerSheet[this.activeSheetId] = {
                time: new Date().toLocaleTimeString(),
                summary: isReport
                    ? `${currentRows.length} पंक्तियाँ रिपोर्ट सुरक्षित (Report saved locally)`
                    : `${currentRows.length} पंक्तियाँ सुरक्षित (Saved locally)`,
                hasError: false
            };
            this.syncToast = {
                visible: true,
                inProgress: false,
                percentage: 100,
                title: isReport ? 'रिपोर्ट स्थानीय रूप से सुरक्षित (Report Saved Locally)' : 'रफ शीट स्थानीय रूप से सुरक्षित (Saved Locally)',
                hasError: false,
                inserted: currentRows.length,
                updated: 0,
                deleted: 0,
                failed: 0,
                errors: []
            };
            this.refreshSavedSheetsList();
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
                // 1. Always start with Sheet 1
                const activeTabs = [
                    { id: 'rough_1', title: 'Sheet 1', icon: 'pi-file', type: 'rough', isLoaded: true }
                ];
                // 2. Add pinned / favorite tables (using display_name if mentioned, else table name)
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
                        if (parsed.title) {
                            const currentTab = this.sheetTabs.find(t => t.id === tabId);
                            if (currentTab)
                                currentTab.title = parsed.title;
                        }
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
            const curTab = this.sheetTabs.find(t => t.id === tabId);
            if (curTab?.type === 'report') {
                this.mode = 'normal';
                this.state.isAuditMode.set(false);
            }
            const targetTable = curTab?.tableName || tabId;
            const saved = this.sheetWorkbooks[tabId];
            if (saved && saved.rows && saved.rows.length > 0) {
                // Instant in-memory restoration for previously visited sheets!
                this.selectedTableName = targetTable;
                this.state.setActiveTable(targetTable);
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
                this.onTableSelect(targetTable, true);
            }
        }
        this.cdr.markForCheck();
    }
    addNewBlankSheet() {
        const roughCount = this.sheetTabs.filter(t => t.type === 'rough').length + 1;
        const newId = `rough_${Date.now()}`;
        const newTab = {
            id: newId,
            title: `Sheet ${roughCount}`,
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
            // Safe unwrapping for JSON / nested objects to prevent "[object Object]"
            if (rawVal !== null && typeof rawVal === 'object') {
                if (rawVal.display)
                    rawVal = rawVal.display;
                else if (rawVal.name)
                    rawVal = rawVal.name;
                else if (rawVal.title)
                    rawVal = rawVal.title;
                else if (rawVal.label)
                    rawVal = rawVal.label;
                else if (rawVal.url)
                    rawVal = rawVal.url;
                else if (Array.isArray(rawVal))
                    rawVal = rawVal.length > 0 ? JSON.stringify(rawVal) : '';
                else if (Object.keys(rawVal).length === 0)
                    rawVal = '';
                else
                    rawVal = JSON.stringify(rawVal);
            }
            const cellKey = col.key || col.name;
            const strVal = String(rawVal ?? '');
            // Resolve true DB Foreign Key ID hint
            let refIdVal = undefined;
            if (col.is_fk_main || col.type === 'ref' || col.ref_table) {
                const fkCol = col.col_name || `${col.ref_table}_id` || col.key;
                if (dr[fkCol] !== undefined) {
                    refIdVal = dr[fkCol];
                }
                else if (dr[`${col.key}_id`] !== undefined) {
                    refIdVal = dr[`${col.key}_id`];
                }
                else if (dr[col.key] !== undefined && typeof dr[col.key] !== 'object') {
                    refIdVal = dr[col.key];
                }
            }
            cells[cellKey] = {
                value: strVal,
                originalValue: strVal,
                isValid: true,
                isModified: false,
                refId: refIdVal !== undefined ? refIdVal : (col.col_name && dr[col.col_name] !== undefined ? dr[col.col_name] : rawVal)
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
     * Serializes active column filters into an API-ready filter object,
     * automatically resolving FK display values to numeric/underlying IDs if applicable.
     */
    buildApiFilters() {
        const columnFilters = this.state.columnFilters();
        const apiFilters = {};
        for (const [colKey, valSet] of Object.entries(columnFilters)) {
            if (valSet && valSet.size > 0) {
                let dbKey = colKey;
                const foundCol = this.allConfigColumns.find(c => c.key === colKey || c.name === colKey);
                if (foundCol && foundCol.col_name) {
                    dbKey = foundCol.col_name;
                }
                const rawVals = Array.from(valSet);
                if (foundCol && (foundCol.is_fk_main || foundCol.type === 'ref' || foundCol.ref_table) && foundCol.ref_table) {
                    const options = this.refCache.getOptions(foundCol.ref_table);
                    apiFilters[dbKey] = rawVals.map(val => {
                        if (val === '__BLANK__')
                            return '__BLANK__';
                        const match = options.find(o => o.display === val || String(o.id) === String(val));
                        return match ? match.id : val;
                    });
                }
                else {
                    apiFilters[dbKey] = rawVals;
                }
            }
        }
        return apiFilters;
    }
    /**
     * Chunked lazy loading with direct database search, sort, and filters.
     */
    loadDataChunk(tableName, offset = 0, limit = 100, isReset = true) {
        const cfg = this.state.config();
        if (!cfg || !tableName)
            return;
        if (this.state.isLoadingDb() && !isReset)
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
        // Serialize column filters for backend API (resolving FK display values if needed)
        const apiFilters = this.buildApiFilters();
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
                if (!this.isCurrentSheetReport) {
                    this.audit.auditAll(builtRows, cfg.headers);
                }
                else {
                    builtRows.forEach(r => {
                        r.hasError = false;
                        if (r.cells) {
                            Object.values(r.cells).forEach((c) => {
                                c.isValid = true;
                                c.errorMessage = undefined;
                            });
                        }
                    });
                }
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
        this.state.dbSearchQuery.set(query);
        this.searchSubject.next(query);
    }
    clearDbSearch() {
        this.state.dbSearchQuery.set('');
        this.searchSubject.next('');
        if (this.selectedTableName) {
            this.loadDataChunk(this.selectedTableName, 0, 100, true);
        }
        this.cdr.markForCheck();
    }
    toggleBold() {
        this.isBoldActive = !this.isBoldActive;
        this.cdr.markForCheck();
    }
    setTextAlign(align) {
        this.textAlign = align;
        this.cdr.markForCheck();
    }
    /**
     * Refresh Button Handler:
     * Reloads table data from DB with a warning confirmation if tracked changes are unsynced.
     */
    onRefreshData() {
        if (!this.selectedTableName)
            return;
        const pendingCount = this.state.pendingChangesCount();
        if (pendingCount > 0) {
            const confirmDiscard = window.confirm(`Warning: You have ${pendingCount} unsaved change(s) in this sheet that will be lost.\n\nDo you want to discard your changes and reload from database?`);
            if (!confirmDiscard) {
                return;
            }
        }
        // Discard tracking and reload freshly from database
        this.state.deletedRowIds.set([]);
        this.state.deletedRowsQueue.set([]);
        this.loadTableDataFromDb();
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
    // ── File Parsing & Dual-Mode Open File ───────────────────────────
    getExcelColLetter(colIdx) {
        let letter = '';
        let temp = colIdx + 1;
        while (temp > 0) {
            const mod = (temp - 1) % 26;
            letter = String.fromCharCode(65 + mod) + letter;
            temp = Math.floor((temp - mod) / 26);
        }
        return letter;
    }
    parseCurrentUploadedSheet() {
        if (!this.uploadedWorkbook || !this.selectedUploadedSheet)
            return;
        const worksheet = this.uploadedWorkbook.Sheets[this.selectedUploadedSheet];
        if (!worksheet)
            return;
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        if (!rawJson || rawJson.length === 0) {
            this.uploadedAllRawRows = [];
            this.uploadedSheetHeaders = [];
            this.uploadedRawRows = [];
            this.uploadedSampleRows = [];
            this.uploadedTotalRows = 0;
            this.scanReport = null;
            return;
        }
        this.uploadedAllRawRows = rawJson;
        this.uploadedTotalRows = rawJson.length;
        // Intelligently detect the real header row for Format Matcher (handles merged/title row 0)
        const detected = this.scanner.detectBestHeaderRow(rawJson, this.scannerTableConfig);
        this.uploadedSheetHeaders = detected.headers;
        this.uploadedRawRows = detected.dataRows;
        this.uploadedSampleRows = this.uploadedRawRows.slice(0, 3);
        this.pendingRawRows = this.uploadedRawRows;
        if (this.scannerTableConfig) {
            this.scanReport = this.scanner.scan(this.uploadedSheetHeaders, this.scannerTableConfig, this.uploadedSampleRows);
            this.scanReport.headerRowIndex = detected.headerRowIndex;
        }
    }
    loadScannerTableConfig(tableName) {
        if (!tableName)
            return;
        this.scannerTargetTable = tableName;
        const applyTableCfg = (cfg) => {
            this.scannerTableConfig = cfg;
            this.scannerAvailableHeaders = cfg.headers || [];
            // Re-detect best header row now that we have the target table's schema
            if (this.uploadedAllRawRows && this.uploadedAllRawRows.length > 0) {
                const detected = this.scanner.detectBestHeaderRow(this.uploadedAllRawRows, cfg);
                this.uploadedSheetHeaders = detected.headers;
                this.uploadedRawRows = detected.dataRows;
                this.uploadedSampleRows = this.uploadedRawRows.slice(0, 3);
                this.pendingRawRows = this.uploadedRawRows;
            }
            this.scanReport = this.scanner.scan(this.uploadedSheetHeaders, cfg, this.uploadedSampleRows);
            this.isScannerConfigLoading = false;
            this.cdr.markForCheck();
        };
        const currentCfg = this.state.config();
        if (currentCfg && currentCfg.table === tableName) {
            applyTableCfg(currentCfg);
            return;
        }
        this.isScannerConfigLoading = true;
        this.api.getTableConfig(tableName).subscribe({
            next: (cfg) => {
                applyTableCfg(cfg);
            },
            error: (err) => {
                this.isScannerConfigLoading = false;
                console.error('[SutramStudio] Load scanner table config failed:', err);
                this.cdr.markForCheck();
            }
        });
    }
    onFileUpload(event) {
        const file = event?.target?.files?.[0] || event?.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0)
                return;
            this.uploadedFileName = file.name;
            this.uploadedWorkbook = workbook;
            this.uploadedSheetNames = [...workbook.SheetNames];
            this.selectedUploadedSheet = workbook.SheetNames[0];
            this.parseCurrentUploadedSheet();
            // Determine default target table for Mode 2
            let defaultTable = this.selectedTableName;
            if (!defaultTable && this.tablesList && this.tablesList.length > 0) {
                defaultTable = this.tablesList[0].table;
            }
            if (defaultTable) {
                this.loadScannerTableConfig(defaultTable);
            }
            else {
                this.scanReport = null;
                this.scannerTableConfig = null;
                this.scannerAvailableHeaders = [];
            }
            this.refreshSavedSheetsList();
            this.showScannerModal = true;
            this.cdr.markForCheck();
        };
        reader.readAsArrayBuffer(file);
        if (event.target)
            event.target.value = '';
    }
    onUploadedSheetChange(sheetName) {
        if (!sheetName || sheetName === this.selectedUploadedSheet)
            return;
        this.selectedUploadedSheet = sheetName;
        this.parseCurrentUploadedSheet();
        this.cdr.markForCheck();
    }
    onScannerTargetTableChange(tableName) {
        this.loadScannerTableConfig(tableName);
    }
    onDirectOpenAsNormalSheet(data) {
        const rawAllRows = this.uploadedAllRawRows || [];
        if (rawAllRows.length === 0)
            return;
        // 1. Calculate max columns across all rows in the raw sheet
        let maxCols = 8;
        for (const r of rawAllRows) {
            if (Array.isArray(r) && r.length > maxCols) {
                maxCols = r.length;
            }
        }
        // At least 10 columns for comfortable spreadsheet view
        maxCols = Math.max(maxCols, 10);
        // 2. Generate standard Excel column definitions (A, B, C, D...)
        const cols = [];
        for (let c = 0; c < maxCols; c++) {
            const letter = this.getExcelColLetter(c);
            cols.push({
                key: letter,
                name: letter,
                short_name: letter,
                col_name: letter,
                type: 'string',
                default_selected: true
            });
        }
        this.allConfigColumns = cols;
        this.selectedColumnKeys = new Set(cols.map(c => c.key));
        const roughHeaders = cols.map(c => ({
            name: c.name,
            col_name: c.col_name,
            type: 'string'
        }));
        // Create unique tab for this rough sheet
        const roughCount = this.sheetTabs.filter(t => t.type === 'rough').length + 1;
        const sheetTitle = data?.sheetName || this.selectedUploadedSheet || this.uploadedFileName?.replace(/\.[^/.]+$/, '') || `Sheet ${roughCount}`;
        const newId = `rough_${Date.now()}`;
        const newTab = {
            id: newId,
            title: sheetTitle,
            icon: 'pi-file',
            type: 'rough',
            isLoaded: true
        };
        this.sheetTabs.push(newTab);
        const mockCfg = {
            table: 'rough',
            display_name: sheetTitle,
            headers: roughHeaders,
            duplicateOn: []
        };
        this.state.setConfig(mockCfg);
        // 3. Populate all rows as-is starting from row 0!
        // No row is discarded as a header: row 0 (e.g. merge & center title) appears in row 1!
        const sutramRows = rawAllRows.map((rawRow, rIdx) => {
            const cells = {};
            cols.forEach((col, cIdx) => {
                const rawVal = Array.isArray(rawRow) ? rawRow[cIdx] : '';
                const valStr = rawVal !== undefined && rawVal !== null ? String(rawVal) : '';
                cells[col.key] = {
                    value: valStr,
                    originalValue: valStr,
                    isValid: true,
                    isModified: false
                };
            });
            return {
                rowNum: rIdx + 1,
                cells,
                hasError: false,
                errorCount: 0,
                _rawOriginal: rawRow
            };
        });
        // Append 1 trailing blank row for immediate spreadsheet typing
        const blankRow = this.createBlankRow(sutramRows.length + 1, mockCfg);
        sutramRows.push(blankRow);
        // 4. Switch to this new sheet tab in normal mode (audit mode disabled)
        this.mode = 'normal';
        this.state.isAuditMode.set(false);
        this.selectedTableName = '';
        this.state.setActiveTable(null);
        this.activeSheetId = newId;
        this.state.setRows(sutramRows);
        // Save as local rough sheet immediately so it is tracked in saved sheets
        this.saveRoughSheetLocally();
        this.showScannerModal = false;
        this.gridComponent?.resetScroll();
        this.cdr.markForCheck();
    }
    onScannerConfirmedMapped(event) {
        const targetTable = event.targetTable;
        if (!targetTable)
            return;
        let foundTab = this.sheetTabs.find(t => t.id === targetTable || t.tableName === targetTable);
        if (!foundTab) {
            const tableInfo = this.tablesList.find(t => t.table === targetTable);
            foundTab = {
                id: targetTable,
                title: tableInfo?.display_name || targetTable,
                icon: 'pi-table',
                type: 'table',
                tableName: targetTable,
                isLoaded: true
            };
            this.sheetTabs.push(foundTab);
        }
        const applyMappedData = (cfg) => {
            this.selectedTableName = targetTable;
            this.activeSheetId = targetTable;
            this.state.setActiveTable(targetTable);
            this.state.setConfig(cfg);
            this.buildConfigColumns(cfg);
            const builtRows = this.scanner.buildSutramRows(this.uploadedRawRows, event.matches, cfg.headers);
            this.audit.auditAll(builtRows, cfg.headers);
            const withBlank = this.ensureTrailingBlankRow(builtRows, cfg);
            this.state.setRows(withBlank);
            this.showScannerModal = false;
            this.uploadedRawRows = [];
            this.gridComponent?.resetScroll();
            this.cdr.markForCheck();
        };
        if (this.scannerTableConfig && this.scannerTableConfig.table === targetTable) {
            applyMappedData(this.scannerTableConfig);
        }
        else {
            this.api.getTableConfig(targetTable).subscribe({
                next: (cfg) => {
                    this.scannerTableConfig = cfg;
                    applyMappedData(cfg);
                },
                error: (err) => {
                    console.error('[SutramStudio] Failed to load table config for mapping:', err);
                }
            });
        }
    }
    onScannerConfirmed(matches) {
        if (this.scannerTargetTable) {
            this.onScannerConfirmedMapped({ targetTable: this.scannerTargetTable, matches });
        }
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
    onStudioGlobalClick() {
        if (this.tabContextMenu.visible) {
            this.closeTabContextMenu();
        }
    }
    onStudioGlobalKeydown(event) {
        if (event.key === 'Escape') {
            if (this.renamingTabId) {
                this.cancelTabRename();
                return;
            }
            if (this.tabContextMenu.visible) {
                this.closeTabContextMenu();
                return;
            }
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
            event.preventDefault();
            event.stopPropagation();
            this.toggleBold();
            return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
            event.preventDefault();
            event.stopPropagation();
            if (this.isCurrentSheetRough || this.isCurrentSheetReport) {
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
            i0.ɵɵviewQuery(_c1, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.gridComponent = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.fileInputRef = _t.first);
        } }, hostBindings: function SutramExcelStudioComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_click_HostBindingHandler($event) { return ctx.onStudioGlobalClick($event); }, false, i0.ɵɵresolveDocument)("keydown", function SutramExcelStudioComponent_keydown_HostBindingHandler($event) { return ctx.onStudioGlobalKeydown($event); }, false, i0.ɵɵresolveDocument);
        } }, inputs: { table: "table", mode: "mode", apiBase: "apiBase", enableFilters: "enableFilters", enableSorting: "enableSorting", enableSearch: "enableSearch", enableControlBar: "enableControlBar", enableStatsBar: "enableStatsBar", enableUpload: "enableUpload", enableAudit: "enableAudit", enableAddRow: "enableAddRow", enableCorrections: "enableCorrections", enableLoadData: "enableLoadData", enableVerify: "enableVerify", enableSync: "enableSync", enableDelete: "enableDelete", enableTabs: "enableTabs", enableZoom: "enableZoom" }, decls: 101, vars: 68, consts: [[1, "sutram-excel-container"], [1, "studio-header"], [1, "ribbon-menu-bar"], [1, "menu-bar-left"], [1, "brand"], [1, "brand-icon"], [1, "pi", "pi-table"], [1, "brand-title"], [1, "version-tag"], [1, "ribbon-tabs-nav"], ["type", "button", 1, "ribbon-tab-btn", 3, "click"], [1, "pi", "pi-home"], [1, "pi", "pi-database"], [1, "ribbon-badge"], [1, "pi", "pi-chart-bar"], [1, "pi", "pi-cog"], [1, "menu-bar-right"], ["class", "mode-pill-toggle", 4, "ngIf"], ["type", "button", "class", "cmd-btn-save-top", 3, "title", "click", 4, "ngIf"], ["type", "button", "class", "cmd-btn-sync-top", "title", "Sync changes to Database (Ctrl+S)", 3, "has-pending", "disabled", "click", 4, "ngIf"], ["title", "Toggle Light / Dark Mode", 1, "cmd-btn", 2, "padding", "3px 6px", 3, "click"], [1, "pi", 3, "ngClass"], [1, "ribbon-strip"], ["class", "ribbon-content-row", 4, "ngIf"], ["class", "ribbon-scroll-row", 4, "ngIf"], [1, "formula-bar-row"], [1, "coord-box"], [1, "active-col-chip"], [2, "font-weight", "700", "font-style", "italic", "color", "var(--text-muted)", "margin", "0 4px"], ["type", "text", "placeholder", "Select a cell or type value here...", 1, "formula-input", 3, "ngModel", "ngModelChange"], [1, "formula-bar-right-area"], [1, "formula-search-field"], [1, "pi", "pi-search", "search-ico"], ["type", "text", "placeholder", "Direct DB Search...", 1, "formula-search-inp", 3, "ngModel", "ngModelChange"], ["class", "clear-btn-inline", "title", "Clear search", 3, "click", 4, "ngIf"], ["class", "spin-inline", 4, "ngIf"], ["class", "formula-record-pill", "title", "Total database records", 4, "ngIf"], ["styleClass", "sutram-col-config-popover shadow-lg", 3, "dismissable"], ["colConfigOp", ""], ["pTemplate", "content"], [1, "status-strip", 3, "ngClass"], [2, "display", "flex", "align-items", "center", "gap", "6px"], [4, "ngIf"], [1, "spreadsheet-canvas", "flex-grow-1"], [3, "headers", "rows", "filterOnlyErrors", "enableDelete", "isBold", "textAlign", "booleanStyle", "loadMore", "filterChanged", "sortChanged", "solveAllTriggered", "openConfig"], ["grid", ""], [1, "studio-footer"], [1, "sheet-tabs-bar"], ["class", "tab-pill", 3, "active-tab", "click", "dblclick", "contextmenu", 4, "ngFor", "ngForOf"], ["title", "Add Blank Sheet", 1, "add-tab-btn", 3, "click"], [1, "pi", "pi-plus", 2, "font-size", "10px"], ["class", "tab-context-menu", 3, "left", "top", "click", 4, "ngIf"], [1, "bottom-status-subrow"], [2, "display", "flex", "align-items", "center", "gap", "10px"], ["class", "text-primary small fw-semibold", 4, "ngIf"], ["class", "badge bg-soft-warning text-warning small fw-semibold", 4, "ngIf"], ["style", "color: #10b981; font-weight: 600;", 4, "ngIf"], ["style", "color: #ef4444; font-weight: 600;", 4, "ngIf"], ["class", "last-sync-badge", 3, "sync-error", 4, "ngIf"], [2, "font-size", "10.5px", "opacity", "0.8"], [1, "zoom-controls"], ["title", "Zoom Out (-10%)", 1, "zoom-btn", 3, "click"], [1, "pi", "pi-minus"], ["title", "Reset to 100%", 1, "zoom-display", 3, "click"], ["title", "Zoom In (+10%)", 1, "zoom-btn", 3, "click"], [1, "pi", "pi-plus"], ["class", "sync-toast-hud shadow-lg", 4, "ngIf"], [3, "visible", "fileName", "sheetNames", "currentSheetName", "sheetHeaders", "sampleRows", "totalRows", "tablesList", "selectedTable", "report", "availableHeaders", "isTableConfigLoading", "savedSheets", "visibleChange", "sheetChange", "targetTableChange", "openDirectNormal", "openMappedToTable", "openSavedSheet", "deleteSavedSheet", "triggerFileInput"], [3, "visible", "groups", "visibleChange"], [1, "mode-pill-toggle"], [1, "mode-pill-btn", 3, "click"], [1, "pi", "pi-pencil"], [1, "pi", "pi-bolt"], ["type", "button", 1, "cmd-btn-save-top", 3, "title", "click"], [1, "pi", "pi-save"], ["type", "button", "title", "Sync changes to Database (Ctrl+S)", 1, "cmd-btn-sync-top", 3, "disabled", "click"], [1, "pi", "pi-cloud-upload"], ["class", "sync-badge-count", 4, "ngIf"], [1, "sync-badge-count"], [1, "ribbon-content-row"], [1, "ribbon-group"], [1, "ribbon-group-items"], ["title", "Bold (Ctrl+B)", 1, "ribbon-tool-btn", 3, "click"], [2, "font-weight", "800", "font-size", "13px"], [1, "ribbon-tool-lbl"], [1, "ribbon-mini-col"], ["title", "Align Left", 1, "ribbon-mini-btn", 3, "click"], [1, "pi", "pi-align-left"], ["title", "Align Center", 1, "ribbon-mini-btn", 3, "click"], [1, "pi", "pi-align-center"], ["title", "Align Right", 1, "ribbon-mini-btn", 3, "click"], [1, "pi", "pi-align-right"], ["title", "Choose Visible Columns", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-sliders-h", 2, "color", "var(--primary)"], [1, "ribbon-group-name"], [1, "ribbon-v-sep"], ["class", "ribbon-tool-btn", "title", "Refresh data from database", 3, "click", 4, "ngIf"], ["title", "Open Excel (.xlsx) file or saved sheets", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-folder-open"], ["type", "file", "accept", ".xlsx, .xls, .csv", 2, "display", "none", 3, "change"], ["fileInput", ""], ["title", "Export sheet to Excel", 1, "ribbon-tool-btn", 3, "disabled", "click"], ["title", "Toggle Filters", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-filter"], ["title", "Toggle Sorting", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-sort-alt"], ["title", "Refresh data from database", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-refresh", "text-success"], [1, "ribbon-scroll-row"], [1, "ribbon-search-field", 2, "width", "140px", "min-width", "140px", "margin-right", "6px"], ["type", "text", "placeholder", "Search tables...", 1, "ribbon-search-inp", 3, "ngModel", "ngModelChange"], ["class", "clear-btn-inline", 3, "click", 4, "ngIf"], [1, "ribbon-boxes-track"], ["class", "ribbon-small-box", 3, "active-box", "title", "click", 4, "ngFor", "ngForOf"], [1, "clear-btn-inline", 3, "click"], [1, "ribbon-small-box", 3, "title", "click"], ["type", "button", 1, "box-star-btn", 3, "title", "click"], [1, "box-icon-wrap"], [1, "box-info"], [1, "box-name-eng-main"], ["class", "box-dot", "title", "Sheet open", 4, "ngIf"], ["title", "Sheet open", 1, "box-dot"], ["type", "text", "placeholder", "Search reports...", 1, "ribbon-search-inp", 3, "ngModel", "ngModelChange"], ["class", "ribbon-small-box report-box", 3, "active-box", "title", "click", 4, "ngFor", "ngForOf"], [1, "ribbon-small-box", "report-box", 3, "title", "click"], [1, "box-icon-wrap", "report-icon-bg"], ["title", "Excel style clickable checkbox", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-check-square", 2, "color", "#10b981"], ["title", "Status pill badge (Yes / No)", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-tag", 2, "color", "#3b82f6"], ["title", "Clear search", 1, "clear-btn-inline", 3, "click"], [1, "spin-inline"], [1, "pi", "pi-spin", "pi-spinner"], ["title", "Total database records", 1, "formula-record-pill"], [1, "col-dropdown-menu"], [1, "col-dd-header"], [1, "col-dd-search-wrap"], [1, "pi", "pi-search", "col-dd-search-icon"], ["type", "text", "placeholder", "Search columns / FK...", 1, "col-dd-search-input", 3, "ngModel", "ngModelChange"], ["type", "button", "class", "btn-clear-search-inline", 3, "click", 4, "ngIf"], [1, "col-dd-actions"], [1, "col-dd-actions-left"], ["type", "button", 1, "col-dd-act-btn", 3, "click"], [1, "col-dd-count"], [1, "col-dd-body"], ["class", "col-dd-empty", 4, "ngIf"], [1, "col-dd-footer"], [1, "small", "text-muted", 2, "font-size", "10.5px"], ["type", "button", 1, "btn", "btn-sm", "btn-primary", "py-1", "px-3", 2, "font-size", "11.5px", "font-weight", "600", 3, "click"], ["type", "button", 1, "btn-clear-search-inline", 3, "click"], [1, "pi", "pi-times"], [1, "col-dd-section-title"], ["class", "col-dd-item", 3, "click", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "col-dd-item", 3, "click"], [1, "col-dd-item-left"], ["type", "checkbox", 1, "custom-check", 2, "pointer-events", "none", 3, "checked"], [1, "col-dd-item-name", 3, "title"], ["style", "color: #ef4444; margin-left: 2px;", 4, "ngIf"], [1, "type-badge"], [2, "color", "#ef4444", "margin-left", "2px"], [1, "col-dd-section-title", 2, "margin-top", "8px"], ["class", "col-dd-group", 3, "fk-active-group", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "col-dd-group"], [1, "col-dd-group-header"], [1, "col-dd-group-left", 2, "cursor", "pointer", "flex-grow", "1", 3, "click"], [1, "pi", "pi-chevron-right", "fk-expand-toggle"], [1, "col-dd-item-name"], [1, "pi", "pi-link", 2, "color", "var(--primary, #4f46e5)", "font-size", "10px", "margin-right", "3px"], [2, "text-transform", "capitalize"], [2, "font-size", "10px", "color", "var(--text-muted)", "font-weight", "400", "margin-left", "3px"], [1, "col-dd-group-right", 2, "cursor", "pointer", "display", "flex", "align-items", "center", "gap", "6px", 3, "click"], [1, "fk-group-pill"], ["class", "col-dd-group-items", 4, "ngIf"], [1, "col-dd-group-items"], [1, "col-dd-empty"], [1, "pi", "pi-search", "me-1"], [1, "cmd-btn", "cmd-btn-warning", 2, "padding", "2px 8px", 3, "click"], [1, "tab-pill", 3, "click", "dblclick", "contextmenu"], [1, "pi", 2, "font-size", "11px", 3, "ngClass"], ["class", "tab-title-text", "title", "\u0921\u092C\u0932-\u0915\u094D\u0932\u093F\u0915 \u092F\u093E \u0930\u093E\u0907\u091F-\u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0915\u0947 \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Double-click or right-click to rename)", 4, "ngIf"], ["type", "text", "class", "tab-inline-rename-input", 3, "id", "ngModel", "ngModelChange", "keyup.enter", "keyup.escape", "blur", "click", 4, "ngIf"], ["class", "sheet-tab-badge", 4, "ngIf"], ["type", "button", "class", "tab-edit-btn", "title", "\u0936\u0940\u091F \u0915\u093E \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Rename sheet)", 3, "click", 4, "ngIf"], ["type", "button", "class", "tab-close-btn", "title", "Close sheet", 3, "click", 4, "ngIf"], ["title", "\u0921\u092C\u0932-\u0915\u094D\u0932\u093F\u0915 \u092F\u093E \u0930\u093E\u0907\u091F-\u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0915\u0947 \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Double-click or right-click to rename)", 1, "tab-title-text"], ["type", "text", 1, "tab-inline-rename-input", 3, "id", "ngModel", "ngModelChange", "keyup.enter", "keyup.escape", "blur", "click"], [1, "sheet-tab-badge"], ["type", "button", "title", "\u0936\u0940\u091F \u0915\u093E \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Rename sheet)", 1, "tab-edit-btn", 3, "click"], [1, "pi", "pi-pencil", 2, "font-size", "8.5px"], ["type", "button", "title", "Close sheet", 1, "tab-close-btn", 3, "click"], [1, "tab-context-menu", 3, "click"], [1, "tab-context-menu-item", 3, "click"], [1, "pi", "pi-pencil", "text-primary"], ["class", "tab-context-menu-item text-danger", 3, "click", 4, "ngIf"], [1, "tab-context-menu-item", "text-danger", 3, "click"], [1, "pi", "pi-trash"], [1, "text-primary", "small", "fw-semibold"], [1, "pi", "pi-spin", "pi-spinner", "me-1"], [1, "badge", "bg-soft-warning", "text-warning", "small", "fw-semibold"], [1, "pi", "pi-trash", "me-1"], [2, "color", "#10b981", "font-weight", "600"], [2, "color", "#ef4444", "font-weight", "600"], [1, "last-sync-badge"], [1, "pi", "pi-history", "me-1"], [1, "sync-toast-hud", "shadow-lg"], [1, "sync-toast-header"], [1, "sync-toast-title"], [1, "sync-toast-close", 3, "click"], ["class", "sync-progress-wrap px-3 pt-2", 4, "ngIf"], [1, "sync-toast-body"], [1, "sync-toast-stats"], ["class", "sync-badge-chip chip-success", 4, "ngIf"], ["class", "sync-badge-chip chip-info", 4, "ngIf"], ["class", "sync-badge-chip chip-warning", 4, "ngIf"], ["class", "sync-badge-chip chip-danger", 4, "ngIf"], ["class", "sync-toast-errors", 4, "ngIf"], [1, "sync-progress-wrap", "px-3", "pt-2"], [1, "d-flex", "justify-content-between", "align-items-center", "mb-1", 2, "font-size", "11px", "color", "var(--text-muted, #64748b)"], [1, "sync-progress-track"], [1, "sync-progress-bar"], [1, "sync-badge-chip", "chip-success"], [1, "sync-badge-chip", "chip-info"], [1, "pi", "pi-refresh"], [1, "sync-badge-chip", "chip-warning"], [1, "sync-badge-chip", "chip-danger"], [1, "sync-toast-errors"], [4, "ngFor", "ngForOf"]], template: function SutramExcelStudioComponent_Template(rf, ctx) { if (rf & 1) {
            const _r145 = i0.ɵɵgetCurrentView();
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
            i0.ɵɵtext(16, "Home");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "button", 10);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_17_listener() { return ctx.setTopTab("tables"); });
            i0.ɵɵelement(18, "i", 12);
            i0.ɵɵelementStart(19, "span");
            i0.ɵɵtext(20, "Tables");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "span", 13);
            i0.ɵɵtext(22);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(23, "button", 10);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_23_listener() { return ctx.setTopTab("reports"); });
            i0.ɵɵelement(24, "i", 14);
            i0.ɵɵelementStart(25, "span");
            i0.ɵɵtext(26, "Reports");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "span", 13);
            i0.ɵɵtext(28);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(29, "button", 10);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_29_listener() { return ctx.setTopTab("settings"); });
            i0.ɵɵelement(30, "i", 15);
            i0.ɵɵelementStart(31, "span");
            i0.ɵɵtext(32, "Settings");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(33, "div", 16);
            i0.ɵɵtemplate(34, SutramExcelStudioComponent_div_34_Template, 7, 4, "div", 17);
            i0.ɵɵtemplate(35, SutramExcelStudioComponent_button_35_Template, 4, 1, "button", 18);
            i0.ɵɵtemplate(36, SutramExcelStudioComponent_button_36_Template, 5, 4, "button", 19);
            i0.ɵɵelementStart(37, "button", 20);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_37_listener() { return ctx.toggleTheme(); });
            i0.ɵɵelement(38, "i", 21);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(39, "div", 22);
            i0.ɵɵtemplate(40, SutramExcelStudioComponent_div_40_Template, 50, 17, "div", 23);
            i0.ɵɵtemplate(41, SutramExcelStudioComponent_div_41_Template, 7, 3, "div", 24);
            i0.ɵɵtemplate(42, SutramExcelStudioComponent_div_42_Template, 7, 3, "div", 24);
            i0.ɵɵtemplate(43, SutramExcelStudioComponent_div_43_Template, 13, 4, "div", 23);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(44, "div", 25)(45, "div", 26);
            i0.ɵɵtext(46);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(47, "span", 27);
            i0.ɵɵtext(48);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(49, "span", 28);
            i0.ɵɵtext(50, "fx");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(51, "input", 29);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_input_ngModelChange_51_listener($event) { return ctx.onFormulaChange($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(52, "div", 30)(53, "div", 31);
            i0.ɵɵelement(54, "i", 32);
            i0.ɵɵelementStart(55, "input", 33);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_input_ngModelChange_55_listener($event) { return ctx.onDbSearchInput($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(56, SutramExcelStudioComponent_button_56_Template, 2, 0, "button", 34);
            i0.ɵɵtemplate(57, SutramExcelStudioComponent_span_57_Template, 2, 0, "span", 35);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(58, SutramExcelStudioComponent_div_58_Template, 4, 2, "div", 36);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(59, "p-overlayPanel", 37, 38);
            i0.ɵɵtemplate(61, SutramExcelStudioComponent_ng_template_61_Template, 25, 7, "ng-template", 39);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(62, "div", 40)(63, "div", 41);
            i0.ɵɵelement(64, "i", 21);
            i0.ɵɵelementStart(65, "span");
            i0.ɵɵtext(66);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(67, SutramExcelStudioComponent_div_67_Template, 4, 1, "div", 42);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(68, "main", 43)(69, "sutram-grid", 44, 45);
            i0.ɵɵlistener("loadMore", function SutramExcelStudioComponent_Template_sutram_grid_loadMore_69_listener() { return ctx.onLoadMore(); })("filterChanged", function SutramExcelStudioComponent_Template_sutram_grid_filterChanged_69_listener() { return ctx.onGridFilterChanged(); })("sortChanged", function SutramExcelStudioComponent_Template_sutram_grid_sortChanged_69_listener() { return ctx.onGridSortChanged(); })("solveAllTriggered", function SutramExcelStudioComponent_Template_sutram_grid_solveAllTriggered_69_listener($event) { return ctx.onGridSolveAll($event); })("openConfig", function SutramExcelStudioComponent_Template_sutram_grid_openConfig_69_listener($event) { i0.ɵɵrestoreView(_r145); const _r10 = i0.ɵɵreference(60); return i0.ɵɵresetView(_r10.toggle($event)); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(71, "footer", 46)(72, "div", 47);
            i0.ɵɵtemplate(73, SutramExcelStudioComponent_div_73_Template, 7, 8, "div", 48);
            i0.ɵɵelementStart(74, "button", 49);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_74_listener() { return ctx.addNewBlankSheet(); });
            i0.ɵɵelement(75, "i", 50);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(76, SutramExcelStudioComponent_div_76_Template, 6, 5, "div", 51);
            i0.ɵɵelementStart(77, "div", 52)(78, "div", 53)(79, "span");
            i0.ɵɵtext(80);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(81, "span");
            i0.ɵɵtext(82);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(83, SutramExcelStudioComponent_span_83_Template, 3, 0, "span", 54);
            i0.ɵɵtemplate(84, SutramExcelStudioComponent_span_84_Template, 3, 1, "span", 55);
            i0.ɵɵtemplate(85, SutramExcelStudioComponent_span_85_Template, 2, 0, "span", 56);
            i0.ɵɵtemplate(86, SutramExcelStudioComponent_span_86_Template, 2, 1, "span", 57);
            i0.ɵɵtemplate(87, SutramExcelStudioComponent_span_87_Template, 3, 4, "span", 58);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(88, "div", 53)(89, "span", 59);
            i0.ɵɵtext(90, "Ctrl+S to Sync | Enter next row | Tab next col | Click # to select row");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(91, "div", 60)(92, "button", 61);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_92_listener() { return ctx.zoomOut(); });
            i0.ɵɵelement(93, "i", 62);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(94, "span", 63);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_span_click_94_listener() { return ctx.resetZoom(); });
            i0.ɵɵtext(95);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(96, "button", 64);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_96_listener() { return ctx.zoomIn(); });
            i0.ɵɵelement(97, "i", 65);
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵtemplate(98, SutramExcelStudioComponent_div_98_Template, 16, 8, "div", 66);
            i0.ɵɵelementStart(99, "sutram-header-scanner", 67);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_sutram_header_scanner_visibleChange_99_listener($event) { return ctx.showScannerModal = $event; })("sheetChange", function SutramExcelStudioComponent_Template_sutram_header_scanner_sheetChange_99_listener($event) { return ctx.onUploadedSheetChange($event); })("targetTableChange", function SutramExcelStudioComponent_Template_sutram_header_scanner_targetTableChange_99_listener($event) { return ctx.onScannerTargetTableChange($event); })("openDirectNormal", function SutramExcelStudioComponent_Template_sutram_header_scanner_openDirectNormal_99_listener($event) { return ctx.onDirectOpenAsNormalSheet($event); })("openMappedToTable", function SutramExcelStudioComponent_Template_sutram_header_scanner_openMappedToTable_99_listener($event) { return ctx.onScannerConfirmedMapped($event); })("openSavedSheet", function SutramExcelStudioComponent_Template_sutram_header_scanner_openSavedSheet_99_listener($event) { return ctx.onOpenSavedSheet($event); })("deleteSavedSheet", function SutramExcelStudioComponent_Template_sutram_header_scanner_deleteSavedSheet_99_listener($event) { return ctx.onDeleteSavedSheet($event); })("triggerFileInput", function SutramExcelStudioComponent_Template_sutram_header_scanner_triggerFileInput_99_listener() { return ctx.triggerBrowseFile(); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(100, "sutram-correction-sidebar", 68);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_sutram_correction_sidebar_visibleChange_100_listener($event) { return ctx.showSidebar = $event; });
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
            i0.ɵɵadvance(1);
            i0.ɵɵclassProp("active", ctx.activeTopTab === "settings");
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("ngIf", !ctx.isCurrentSheetRough && !ctx.isCurrentSheetReport);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.isCurrentSheetRough || ctx.isCurrentSheetReport);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", !ctx.isCurrentSheetRough && !ctx.isCurrentSheetReport);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngClass", ctx.isDarkMode ? "pi-sun" : "pi-moon");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.activeTopTab === "home");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.activeTopTab === "tables");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.activeTopTab === "reports");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.activeTopTab === "settings");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.activeCoord);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.activeColChip);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngModel", ctx.formulaValue);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngModel", ctx.state.dbSearchQuery());
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.dbSearchQuery());
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.state.isLoadingDb());
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", !ctx.isCurrentSheetRough);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("dismissable", true);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngClass", ctx.statusStripClass);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngClass", ctx.statusStripIcon);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.statusStripMessage);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", !ctx.isCurrentSheetReport && ctx.state.unresolvedCorrectionsCount() > 0);
            i0.ɵɵadvance(1);
            i0.ɵɵstyleProp("zoom", ctx.zoomLevel);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("headers", ctx.visibleHeaders)("rows", ctx.state.rows())("filterOnlyErrors", ctx.state.filterOnlyErrors())("enableDelete", ctx.enableDelete)("isBold", ctx.isBoldActive)("textAlign", ctx.textAlign)("booleanStyle", ctx.booleanDisplayStyle);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngForOf", ctx.sheetTabs);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngIf", ctx.tabContextMenu.visible);
            i0.ɵɵadvance(4);
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
            i0.ɵɵproperty("visible", ctx.showScannerModal)("fileName", ctx.uploadedFileName)("sheetNames", ctx.uploadedSheetNames)("currentSheetName", ctx.selectedUploadedSheet)("sheetHeaders", ctx.uploadedSheetHeaders)("sampleRows", ctx.uploadedSampleRows)("totalRows", ctx.uploadedTotalRows)("tablesList", ctx.tablesList)("selectedTable", ctx.scannerTargetTable)("report", ctx.scanReport)("availableHeaders", ctx.scannerAvailableHeaders)("isTableConfigLoading", ctx.isScannerConfigLoading)("savedSheets", ctx.savedSheetsList);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("visible", ctx.showSidebar)("groups", ctx.state.correctionGroups());
        } }, dependencies: [i6.NgClass, i6.NgForOf, i6.NgIf, i7.DefaultValueAccessor, i7.NgControlStatus, i7.NgModel, i8.PrimeTemplate, i9.OverlayPanel, i10.SutramGridComponent, i11.SutramHeaderScannerComponent, i12.SutramCorrectionSidebarComponent], styles: ["\n\n\n\n\n\n\n\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n\n.sutram-excel-container[_ngcontent-%COMP%] {\n  --primary: #4f46e5;\n  --primary-hover: #4338ca;\n  --primary-soft: #e0e7ff;\n  --success: #10b981;\n  --success-soft: #d1fae5;\n  --warning: #f59e0b;\n  --warning-soft: #fef3c7;\n  --danger: #ef4444;\n  --danger-soft: #fee2e2;\n  --bg: #f8fafc;\n  --surface: #ffffff;\n  --surface-border: #e2e8f0;\n  --text: #0f172a;\n  --text-muted: #64748b;\n  --radius: 6px;\n  --header-bg: #f1f5f9;\n  --header-text: #1e293b;\n  --cell-border: rgba(125, 125, 125, 0.18);\n  --cell-height: 23px;\n  --header-height: 38px;\n  --cell-edited-bg: #fef9c3;\n  --cell-edited-border: #eab308;\n  --row-edited-bg: #fffbeb;\n  --row-new-bg: #dcfce7;\n  --row-new-border: #22c55e;\n\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n  background-color: var(--bg);\n  color: var(--text);\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  user-select: none;\n\n  &.dark-mode {\n    --bg: #0f172a;\n    --surface: #1e293b;\n    --surface-border: #334155;\n    --text: #f8fafc;\n    --text-muted: #94a3b8;\n    --header-bg: #1e293b;\n    --header-text: #cbd5e1;\n    --cell-border: rgba(255, 255, 255, 0.1);\n    --cell-edited-bg: rgba(234, 179, 8, 0.22);\n    --cell-edited-border: #facc15;\n    --row-edited-bg: rgba(234, 179, 8, 0.12);\n    --row-new-bg: rgba(34, 197, 94, 0.18);\n    --row-new-border: #4ade80;\n  }\n}\n\n\n\n\n\n.studio-header[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n  user-select: none;\n}\n\n\n\n.ribbon-menu-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2px 10px;\n  height: 32px;\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n}\n\n.menu-bar-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.brand[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.brand-icon[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 11px;\n}\n.brand-title[_ngcontent-%COMP%] {\n  font-size: 11.5px;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  color: var(--text);\n\n  .version-tag {\n    font-size: 9px;\n    padding: 1px 4px;\n    background: rgba(16, 185, 129, 0.18);\n    color: #059669;\n    border-radius: 3px;\n    font-weight: 700;\n  }\n}\n\n\n\n.ribbon-tabs-nav[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n.ribbon-tab-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 3px 11px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.12s ease;\n\n  i {\n    font-size: 10.5px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.08);\n    color: var(--text);\n  }\n\n  &.active {\n    background: var(--surface);\n    color: var(--primary);\n    border-color: var(--surface-border) var(--surface-border) transparent var(--surface-border);\n    border-bottom: 2px solid var(--primary);\n    font-weight: 700;\n  }\n}\n.ribbon-badge[_ngcontent-%COMP%] {\n  font-size: 9px;\n  padding: 1px 4px;\n  border-radius: 999px;\n  background: rgba(79, 70, 229, 0.12);\n  color: var(--primary);\n  font-weight: 700;\n}\n\n.menu-bar-right[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.mode-pill-toggle[_ngcontent-%COMP%] {\n  background: rgba(125, 125, 125, 0.12);\n  border-radius: 999px;\n  padding: 2px;\n  display: flex;\n  gap: 2px;\n}\n.mode-pill-btn[_ngcontent-%COMP%] {\n  padding: 2px 9px;\n  border-radius: 999px;\n  font-size: 10px;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  i { font-size: 9.5px; }\n}\n.mode-pill-btn.active-normal[_ngcontent-%COMP%] {\n  background: #3b82f6;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.35);\n}\n.mode-pill-btn.active-smart[_ngcontent-%COMP%] {\n  background: #10b981;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.35);\n}\n\n.cmd-btn-save-top[_ngcontent-%COMP%], .cmd-btn-sync-top[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 2px 10px;\n  height: 24px;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.15s ease;\n\n  i {\n    font-size: 11px;\n  }\n\n  &:hover:not(:disabled) {\n    background: rgba(125, 125, 125, 0.1);\n    border-color: var(--primary);\n    color: var(--primary);\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n\n  &.has-pending {\n    background: #10b981;\n    color: #ffffff;\n    border-color: #059669;\n    box-shadow: 0 1px 4px rgba(16, 185, 129, 0.35);\n\n    &:hover {\n      background: #059669;\n      color: #ffffff;\n    }\n  }\n\n  .sync-badge-count {\n    font-size: 9px;\n    padding: 1px 5px;\n    border-radius: 999px;\n    background: #ffffff;\n    color: #059669;\n    font-weight: 800;\n    line-height: 1;\n  }\n}\n\n\n\n.ribbon-strip[_ngcontent-%COMP%] {\n  background: var(--surface);\n  padding: 4px 10px;\n  height: 60px;\n  display: flex;\n  align-items: center;\n  overflow: hidden;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);\n}\n\n\n\n.ribbon-content-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n\n.ribbon-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: space-between;\n  height: 52px;\n  padding: 0 4px;\n}\n\n.ribbon-group-items[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-grow: 1;\n}\n\n.ribbon-group-name[_ngcontent-%COMP%] {\n  font-size: 8.5px;\n  color: var(--text-muted);\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  margin-top: 1px;\n}\n\n.ribbon-v-sep[_ngcontent-%COMP%] {\n  width: 1px;\n  height: 40px;\n  background: var(--surface-border);\n  opacity: 0.75;\n  margin: 0 4px;\n}\n\n.ribbon-tool-btn[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 2px;\n  padding: 2px 7px;\n  height: 42px;\n  border-radius: 4px;\n  border: 1px solid transparent;\n  background: transparent;\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.12s;\n  font-size: 10.5px;\n\n  i {\n    font-size: 13px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.09);\n    border-color: var(--surface-border);\n  }\n\n  &.active {\n    background: var(--primary-soft);\n    color: var(--primary);\n    border-color: rgba(79, 70, 229, 0.3);\n    font-weight: 700;\n  }\n\n  .ribbon-tool-lbl {\n    font-size: 9px;\n    white-space: nowrap;\n    font-weight: 500;\n  }\n}\n\n.ribbon-mini-col[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: row;\n  gap: 2px;\n}\n\n.ribbon-mini-btn[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 3px;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  font-size: 9.5px;\n\n  &:hover { background: rgba(125, 125, 125, 0.1); }\n\n  &.active-align {\n    background: var(--primary-soft);\n    color: var(--primary);\n    border-color: rgba(79, 70, 229, 0.35);\n  }\n}\n\n.ribbon-search-field[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 165px;\n\n  .search-ico {\n    position: absolute;\n    left: 7px;\n    font-size: 9.5px;\n    color: var(--text-muted);\n    pointer-events: none;\n  }\n\n  .ribbon-search-inp {\n    width: 100%;\n    height: 24px;\n    padding: 2px 20px 2px 22px;\n    font-size: 10.5px;\n    border-radius: 4px;\n    border: 1px solid var(--surface-border);\n    background: var(--surface);\n    color: var(--text);\n    outline: none;\n    transition: border-color 0.12s ease;\n\n    &:focus {\n      border-color: var(--primary);\n    }\n  }\n\n  .clear-btn-inline {\n    position: absolute;\n    right: 5px;\n    background: transparent;\n    border: none;\n    font-size: 9px;\n    cursor: pointer;\n    color: var(--text-muted);\n  }\n\n  .spin-inline {\n    position: absolute;\n    right: 5px;\n    font-size: 9px;\n    color: var(--primary);\n  }\n}\n\n.ribbon-btn-action[_ngcontent-%COMP%] {\n  background: var(--primary) !important;\n  color: #ffffff !important;\n  border-color: var(--primary) !important;\n  font-weight: 700 !important;\n\n  &:hover {\n    filter: brightness(1.1);\n  }\n\n  .sync-count-tag {\n    font-size: 8.5px;\n    padding: 0 4px;\n    background: #ffffff;\n    color: var(--primary);\n    border-radius: 999px;\n    font-weight: 800;\n    margin-left: 2px;\n  }\n}\n\n.ribbon-record-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 7px;\n  background: rgba(125, 125, 125, 0.08);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--text-muted);\n  height: 24px;\n}\n\n\n\n.ribbon-scroll-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.ribbon-boxes-track[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  overflow-x: auto;\n  scrollbar-width: thin;\n  height: 100%;\n  flex-grow: 1;\n  padding: 2px 2px;\n\n  &::-webkit-scrollbar {\n    height: 4px;\n  }\n  &::-webkit-scrollbar-thumb {\n    background: rgba(125, 125, 125, 0.25);\n    border-radius: 2px;\n  }\n}\n\n.ribbon-small-box[_ngcontent-%COMP%] {\n  position: relative;\n  flex-shrink: 0;\n  min-width: 115px;\n  max-width: 140px;\n  height: 46px;\n  background: var(--surface);\n  border: 1px solid var(--surface-border);\n  border-radius: 5px;\n  padding: 3px 8px 3px 6px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: all 0.12s ease;\n  user-select: none;\n\n  &:hover {\n    border-color: var(--primary);\n    background: var(--primary-soft);\n    transform: translateY(-1px);\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);\n  }\n\n  &.active-box {\n    border-color: rgba(16, 185, 129, 0.6);\n    background: rgba(16, 185, 129, 0.08);\n  }\n\n  .box-star-btn {\n    position: absolute;\n    top: 2px;\n    right: 2px;\n    width: 15px;\n    height: 15px;\n    border: none;\n    background: transparent;\n    cursor: pointer;\n    color: var(--text-muted);\n    font-size: 9px;\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 2;\n    transition: all 0.12s;\n\n    &:hover {\n      color: #f59e0b;\n      transform: scale(1.2);\n    }\n\n    &.starred {\n      color: #f59e0b;\n    }\n  }\n\n  .box-icon-wrap {\n    width: 25px;\n    height: 25px;\n    border-radius: 4px;\n    background: var(--primary-soft);\n    color: var(--primary);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 11px;\n    flex-shrink: 0;\n\n    &.report-icon-bg {\n      background: rgba(16, 185, 129, 0.15);\n      color: #059669;\n    }\n  }\n\n  .box-info {\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n    padding-right: 10px;\n\n    .box-name-eng-main {\n      font-size: 11px;\n      font-weight: 600;\n      color: var(--text);\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .box-name-hin {\n      font-size: 10.5px;\n      font-weight: 700;\n      color: var(--text);\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .box-name-eng {\n      font-size: 9px;\n      color: var(--text-muted);\n      font-family: monospace;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n  }\n\n  .box-dot {\n    position: absolute;\n    bottom: 3px;\n    right: 3px;\n    width: 5px;\n    height: 5px;\n    border-radius: 50%;\n    background: #10b981;\n  }\n}\n\n.btn-group-cmd[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.cmd-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  transition: all 0.15s;\n  user-select: none;\n\n  i {\n    font-size: 10.5px;\n  }\n}\n.cmd-btn[_ngcontent-%COMP%]:hover { background: rgba(125, 125, 125, 0.1); }\n.cmd-btn.active[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.cmd-btn-primary[_ngcontent-%COMP%] { background: var(--primary); color: white; border-color: var(--primary); }\n.cmd-btn-primary[_ngcontent-%COMP%]:hover { background: var(--primary-hover); }\n.cmd-btn-success[_ngcontent-%COMP%] { background: var(--success); color: white; border-color: var(--success); }\n.cmd-btn-success[_ngcontent-%COMP%]:hover { background: #059669; }\n.cmd-btn-warning[_ngcontent-%COMP%] { background: var(--warning-soft); color: #b45309; border-color: rgba(245, 158, 11, 0.3); }\n\n.sync-badge-count[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: #f59e0b;\n  color: #ffffff;\n  font-size: 9.5px;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 999px;\n  margin-left: 4px;\n  line-height: 1.1;\n}\n\n\n\n.formula-bar-row[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n}\n.coord-box[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 22px;\n  line-height: 18px;\n  text-align: center;\n  font-weight: 700;\n  font-size: 11px;\n  padding: 1px 3px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  background: rgba(125, 125, 125, 0.05);\n}\n.active-col-chip[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n  padding: 1px 6px;\n  height: 20px;\n  line-height: 17px;\n  border-radius: 4px;\n  font-size: 10.5px;\n  font-weight: 600;\n  white-space: nowrap;\n  max-width: 170px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.formula-input[_ngcontent-%COMP%] {\n  flex-grow: 1;\n  height: 22px;\n  padding: 2px 7px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 11.5px;\n  font-family: inherit;\n  outline: none;\n  background: var(--surface);\n  color: var(--text);\n}\n.formula-input[_ngcontent-%COMP%]:focus { border-color: var(--primary); }\n\n.formula-bar-right-area[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n  margin-left: 4px;\n}\n\n.formula-search-field[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 175px;\n\n  .search-ico {\n    position: absolute;\n    left: 7px;\n    font-size: 9.5px;\n    color: var(--text-muted);\n    pointer-events: none;\n  }\n\n  .formula-search-inp {\n    width: 100%;\n    height: 22px;\n    padding: 2px 20px 2px 22px;\n    font-size: 10.5px;\n    border-radius: 4px;\n    border: 1px solid var(--surface-border);\n    background: var(--surface);\n    color: var(--text);\n    outline: none;\n    transition: border-color 0.12s ease;\n\n    &:focus {\n      border-color: var(--primary);\n    }\n  }\n\n  .clear-btn-inline {\n    position: absolute;\n    right: 5px;\n    background: transparent;\n    border: none;\n    font-size: 9px;\n    cursor: pointer;\n    color: var(--text-muted);\n  }\n\n  .spin-inline {\n    position: absolute;\n    right: 5px;\n    font-size: 9px;\n    color: var(--primary);\n  }\n}\n\n.formula-record-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 1px 7px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--text-muted);\n  height: 22px;\n  white-space: nowrap;\n}\n.control-settings-bar[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  flex-shrink: 0;\n  font-size: 11px;\n}\n.ctrl-bar-left[_ngcontent-%COMP%], .ctrl-bar-right[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.ctrl-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 8px;\n  height: 23px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text-muted);\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n\n  i {\n    font-size: 10px;\n  }\n}\n.ctrl-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text);\n}\n.ctrl-btn.active[_ngcontent-%COMP%] {\n  color: var(--primary);\n  background: var(--primary-soft);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.ctrl-btn-danger[_ngcontent-%COMP%] {\n  color: var(--danger);\n  background: var(--danger-soft);\n  border-color: rgba(239, 68, 68, 0.3);\n}\n.ctrl-btn-danger[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.2);\n}\n.ctrl-dot[_ngcontent-%COMP%] {\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  background: #10b981;\n  display: inline-block;\n}\n.ctrl-search-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  flex-grow: 1;\n  max-width: 420px;\n}\n.ctrl-search-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 8px;\n  color: var(--text-muted);\n  font-size: 10px;\n  pointer-events: none;\n}\n.ctrl-search-input[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 23px;\n  padding: 2px 24px 2px 24px;\n  border: 1px solid var(--surface-border);\n  border-radius: 999px;\n  font-size: 11px;\n  background: rgba(125, 125, 125, 0.05);\n  color: var(--text);\n  outline: none;\n  transition: all 0.15s;\n}\n.ctrl-search-input[_ngcontent-%COMP%]:focus {\n  border-color: var(--primary);\n  background: var(--surface);\n  box-shadow: 0 0 0 2px var(--primary-soft);\n}\n.ctrl-search-clear[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 6px;\n  background: none;\n  border: none;\n  font-size: 10px;\n  color: var(--text-muted);\n  cursor: pointer;\n  padding: 1px 4px;\n  border-radius: 50%;\n}\n.ctrl-search-clear[_ngcontent-%COMP%]:hover {\n  color: var(--danger);\n  background: rgba(125, 125, 125, 0.15);\n}\n.ctrl-search-spinner[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 24px;\n  color: var(--primary);\n  font-size: 10px;\n}\n.ctrl-record-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 1px 7px;\n  height: 21px;\n  border-radius: 999px;\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text-muted);\n  font-size: 10px;\n  font-weight: 600;\n  white-space: nowrap;\n\n  i {\n    font-size: 10px;\n  }\n}\n\n\n\n.status-strip[_ngcontent-%COMP%] {\n  padding: 3px 14px;\n  font-size: 11.5px;\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  background: rgba(125, 125, 125, 0.04);\n}\n.status-strip.strip-error[_ngcontent-%COMP%] { background: #fef2f2; color: #991b1b; }\n.status-strip.strip-clean[_ngcontent-%COMP%] { background: #f0fdf4; color: #166534; }\n.status-strip.strip-suggestion[_ngcontent-%COMP%] { background: #fffbeb; color: #92400e; }\n\n\n\n.spreadsheet-canvas[_ngcontent-%COMP%] {\n  flex-grow: 1;\n  overflow: hidden;\n  background: var(--surface);\n  position: relative;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n\n  sutram-grid {\n    display: block;\n    width: 100%;\n    height: 100%;\n    flex: 1;\n    min-height: 0;\n  }\n}\n\n\n\n.studio-footer[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  background: var(--surface);\n  border-top: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n}\n.sheet-tabs-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  background: rgba(125, 125, 125, 0.05);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 2px 6px;\n  overflow-x: auto;\n  scrollbar-width: none;\n}\n.sheet-tabs-bar[_ngcontent-%COMP%]::-webkit-scrollbar { display: none; }\n\n.tab-pill[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 12px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11.5px;\n  font-weight: 600;\n  cursor: pointer;\n  color: var(--text-muted);\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  white-space: nowrap;\n  transition: all 0.15s;\n}\n.tab-pill[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.1);\n  color: var(--text);\n}\n.tab-pill.active-tab[_ngcontent-%COMP%] {\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-color: rgba(16, 185, 129, 0.25);\n  border-bottom: 2px solid #10b981;\n  font-weight: 700;\n}\n\n.sheet-tab-badge[_ngcontent-%COMP%] {\n  font-size: 9.5px;\n  padding: 1px 5px;\n  background: rgba(16, 185, 129, 0.2);\n  color: #059669;\n  border-radius: 999px;\n  font-weight: 700;\n}\n\n.add-tab-btn[_ngcontent-%COMP%] {\n  padding: 2px 8px;\n  border: 1px dashed rgba(125, 125, 125, 0.4);\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  color: var(--primary);\n  margin-left: 4px;\n}\n.add-tab-btn[_ngcontent-%COMP%]:hover { background: rgba(79, 70, 229, 0.1); }\n\n.sheet-tab-rough-badge[_ngcontent-%COMP%] {\n  font-size: 9px;\n  padding: 1px 4px;\n  background: rgba(245, 158, 11, 0.2);\n  color: #d97706;\n  border-radius: 3px;\n  font-weight: 700;\n  text-transform: uppercase;\n}\n\n.tab-close-btn[_ngcontent-%COMP%] {\n  margin-left: 3px;\n  width: 15px;\n  height: 15px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted);\n  border-radius: 3px;\n  cursor: pointer;\n  font-size: 9.5px;\n  line-height: 1;\n  padding: 0;\n  transition: all 0.12s;\n\n  &:hover {\n    background: rgba(239, 68, 68, 0.18);\n    color: #ef4444;\n  }\n}\n\n.tab-edit-btn[_ngcontent-%COMP%] {\n  margin-left: 2px;\n  width: 15px;\n  height: 15px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted);\n  border-radius: 3px;\n  cursor: pointer;\n  padding: 0;\n  opacity: 0.5;\n  transition: all 0.12s;\n\n  &:hover {\n    opacity: 1;\n    background: rgba(59, 130, 246, 0.15);\n    color: var(--primary, #3b82f6);\n  }\n}\n\n.tab-inline-rename-input[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 600;\n  padding: 1px 5px;\n  height: 19px;\n  min-width: 70px;\n  max-width: 160px;\n  border: 1px solid var(--primary, #3b82f6);\n  border-radius: 3px;\n  background: var(--surface-card, #ffffff);\n  color: var(--text, #1e293b);\n  outline: none;\n  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);\n}\n\n.tab-context-menu[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: 9999;\n  background: var(--surface-card, #ffffff);\n  border: 1px solid var(--surface-border, rgba(125, 125, 125, 0.25));\n  border-radius: 6px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);\n  min-width: 175px;\n  padding: 4px;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.tab-context-menu-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 10px;\n  font-size: 11.5px;\n  font-weight: 500;\n  color: var(--text);\n  border-radius: 4px;\n  cursor: pointer;\n  user-select: none;\n  transition: background 0.12s;\n\n  i {\n    font-size: 12px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.12);\n  }\n\n  &.text-danger:hover {\n    background: rgba(239, 68, 68, 0.12);\n  }\n}\n\n.bottom-status-subrow[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 3px 14px;\n  font-size: 11px;\n  color: var(--text-muted);\n}\n.zoom-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  padding: 1px 4px;\n}\n.zoom-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  color: var(--text);\n  padding: 1px 5px;\n  font-size: 11px;\n}\n.zoom-display[_ngcontent-%COMP%] {\n  font-weight: 700;\n  cursor: pointer;\n  padding: 0 4px;\n}\n\n\n\n.sync-toast-hud[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 50px;\n  right: 20px;\n  z-index: 2500;\n  min-width: 320px;\n  max-width: 440px;\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);\n  overflow: hidden;\n  animation: _ngcontent-%COMP%_toastSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);\n  font-size: 11.5px;\n}\n@keyframes _ngcontent-%COMP%_toastSlideIn {\n  from { opacity: 0; transform: translateY(-12px) scale(0.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n.sync-toast-header[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--surface-border);\n  background: rgba(125, 125, 125, 0.04);\n}\n.sync-toast-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-weight: 700;\n  font-size: 12px;\n}\n.sync-toast-close[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: var(--text-muted);\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 5px;\n  border-radius: 3px;\n}\n.sync-toast-close[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.12);\n  color: var(--text);\n}\n.sync-toast-body[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.sync-toast-stats[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.sync-badge-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n}\n.chip-success[_ngcontent-%COMP%] {\n  background: var(--success-soft);\n  color: var(--success);\n}\n.chip-info[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n}\n.chip-warning[_ngcontent-%COMP%] {\n  background: var(--warning-soft);\n  color: #b45309;\n}\n.chip-danger[_ngcontent-%COMP%] {\n  background: var(--danger-soft);\n  color: var(--danger);\n}\n.sync-toast-errors[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  padding: 6px 8px;\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.2);\n  border-radius: 4px;\n  font-size: 10.5px;\n  color: #ef4444;\n  max-height: 140px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n\n\n\n.last-sync-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 1px 7px;\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-radius: 4px;\n  font-weight: 600;\n  font-size: 10.5px;\n  border: 1px solid rgba(16, 185, 129, 0.25);\n\n  &.sync-error {\n    background: rgba(239, 68, 68, 0.12);\n    color: #ef4444;\n    border-color: rgba(239, 68, 68, 0.25);\n  }\n}\n\n\n\n.sync-progress-wrap[_ngcontent-%COMP%] {\n  width: 100%;\n}\n.sync-progress-track[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 6px;\n  background: rgba(125, 125, 125, 0.2);\n  border-radius: 999px;\n  overflow: hidden;\n}\n.sync-progress-bar[_ngcontent-%COMP%] {\n  height: 100%;\n  background: linear-gradient(90deg, #3b82f6, #10b981);\n  border-radius: 999px;\n  transition: width 0.2s ease-in-out;\n}\n\n\n\n\n\n  .sutram-col-config-popover {\n  width: 340px !important;\n  height: 500px !important;\n  max-height: calc(100vh - 120px) !important;\n  font-size: 11.5px;\n  border-radius: 8px !important;\n  overflow: hidden !important;\n  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1) !important;\n  border: 1px solid var(--surface-border, #e2e8f0) !important;\n  background: var(--surface, #ffffff) !important;\n  color: var(--text, #0f172a) !important;\n  display: flex !important;\n  flex-direction: column !important;\n\n  .p-overlaypanel-content {\n    padding: 0 !important;\n    background: transparent !important;\n    color: inherit !important;\n    width: 100% !important;\n    height: 100% !important;\n    display: flex !important;\n    flex-direction: column !important;\n    flex: 1 1 auto !important;\n    min-height: 0 !important;\n    overflow: hidden !important;\n  }\n}\n\n.col-dropdown-menu[_ngcontent-%COMP%] {\n  width: 100% !important;\n  height: 100% !important;\n  max-height: none !important;\n  background: var(--surface, #ffffff);\n  color: var(--text, #0f172a);\n  border-radius: 8px;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  flex: 1 1 auto;\n  min-height: 0;\n  user-select: none;\n\n  .col-dd-header {\n    padding: 8px 10px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n    background: rgba(125, 125, 125, 0.03);\n    flex-shrink: 0 !important;\n  }\n\n  .col-dd-search-wrap {\n    position: relative;\n    display: flex;\n    align-items: center;\n\n    .col-dd-search-icon {\n      position: absolute;\n      left: 8px;\n      color: var(--text-muted, #64748b);\n      font-size: 11px;\n      pointer-events: none;\n    }\n\n    .col-dd-search-input {\n      width: 100%;\n      height: 28px;\n      padding: 4px 26px;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      border-radius: 4px;\n      font-size: 11.5px;\n      background: var(--bg, #f8fafc);\n      color: var(--text, #0f172a);\n      outline: none;\n      transition: border-color 0.12s;\n\n      &:focus {\n        border-color: var(--primary, #4f46e5);\n      }\n    }\n\n    .btn-clear-search-inline {\n      position: absolute;\n      right: 8px;\n      background: transparent;\n      border: none;\n      color: var(--text-muted, #64748b);\n      cursor: pointer;\n      font-size: 11px;\n      padding: 0;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n\n      &:hover {\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .col-dd-actions {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0 2px;\n\n    .col-dd-actions-left {\n      display: flex;\n      gap: 4px;\n    }\n\n    .col-dd-act-btn {\n      padding: 2px 7px;\n      font-size: 10.5px;\n      font-weight: 600;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      background: var(--surface, #ffffff);\n      color: var(--text-muted, #64748b);\n      border-radius: 3px;\n      cursor: pointer;\n      transition: all 0.12s;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n        color: var(--text, #0f172a);\n      }\n    }\n\n    .col-dd-count {\n      font-size: 10.5px;\n      color: var(--text-muted, #64748b);\n      font-weight: 600;\n    }\n  }\n\n  .col-dd-body {\n    padding: 6px 8px;\n    overflow-y: auto !important;\n    overflow-x: hidden !important;\n    flex: 1 1 0 !important;\n    min-height: 0 !important;\n    max-height: none !important;\n    display: flex;\n    flex-direction: column;\n    gap: 3px;\n    overscroll-behavior: contain;\n    scrollbar-width: thin;\n\n    &::-webkit-scrollbar {\n      width: 5px;\n    }\n    &::-webkit-scrollbar-track {\n      background: rgba(125, 125, 125, 0.05);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb {\n      background: rgba(125, 125, 125, 0.3);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb:hover {\n      background: var(--primary, #4f46e5);\n    }\n  }\n\n  .col-dd-section-title {\n    font-size: 10px;\n    font-weight: 700;\n    color: var(--text-muted, #64748b);\n    margin: 3px 0 2px 4px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    flex-shrink: 0 !important;\n  }\n\n  .col-dd-item {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 4px 6px;\n    border-radius: 4px;\n    cursor: pointer;\n    user-select: none;\n    transition: background 0.1s;\n    font-size: 11.5px;\n    color: var(--text, #0f172a);\n    flex-shrink: 0 !important;\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.08);\n    }\n\n    .col-dd-item-left {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .col-dd-item-name {\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n  }\n\n  .custom-check {\n    width: 14px;\n    height: 14px;\n    cursor: pointer;\n    accent-color: var(--primary, #4f46e5);\n    margin: 0;\n    flex-shrink: 0;\n  }\n\n  .type-badge {\n    font-size: 9.5px;\n    padding: 1px 5px;\n    border-radius: 3px;\n    background: rgba(125, 125, 125, 0.12);\n    color: var(--text-muted, #64748b);\n    font-family: 'JetBrains Mono', monospace;\n    flex-shrink: 0;\n  }\n\n  \n\n  .col-dd-group {\n    border: 1px solid var(--surface-border, #e2e8f0);\n    border-radius: 5px;\n    margin: 3px 0;\n    overflow: hidden;\n    background: rgba(125, 125, 125, 0.02);\n    flex-shrink: 0 !important;\n\n    &.fk-active-group {\n      border-color: rgba(79, 70, 229, 0.35);\n    }\n\n    .col-dd-group-header {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      padding: 5px 8px;\n      background: rgba(125, 125, 125, 0.06);\n      cursor: pointer;\n      user-select: none;\n      font-size: 11.5px;\n      font-weight: 600;\n      flex-shrink: 0 !important;\n      min-height: 28px !important;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n      }\n\n      .col-dd-group-left {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        overflow: hidden;\n      }\n\n      .fk-expand-toggle {\n        font-size: 10px;\n        color: var(--text-muted, #64748b);\n        width: 12px;\n        text-align: center;\n        transition: transform 0.18s ease;\n\n        &.rotated {\n          transform: rotate(90deg);\n        }\n      }\n\n      .fk-group-pill {\n        font-size: 9.5px;\n        padding: 1px 5px;\n        border-radius: 999px;\n        font-weight: 600;\n      }\n    }\n\n    .col-dd-group-items {\n      padding: 3px 4px 4px 18px;\n      background: var(--surface, #ffffff);\n      border-top: 1px solid var(--surface-border, #e2e8f0);\n      display: flex;\n      flex-direction: column;\n      gap: 2px;\n      max-height: none !important;\n      overflow: visible !important;\n    }\n  }\n\n  .col-dd-empty {\n    padding: 16px;\n    text-align: center;\n    color: var(--text-muted, #64748b);\n    font-size: 11.5px;\n  }\n\n  .col-dd-footer {\n    padding: 6px 10px;\n    border-top: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    background: rgba(125, 125, 125, 0.03);\n    flex-shrink: 0 !important;\n  }\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramExcelStudioComponent, [{
        type: Component,
        args: [{ selector: 'sutram-excel-studio', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-excel-studio.component.html -->\n<div class=\"sutram-excel-container\" [class.dark-mode]=\"isDarkMode\">\n\n  <!-- 1. TOP EXCEL-STYLE RIBBON HEADER (Few cm area) -->\n  <header class=\"studio-header\">\n    <!-- Top Menu Bar: Brand, Ribbon Tabs, Mode Switch & Theme -->\n    <div class=\"ribbon-menu-bar\">\n      <div class=\"menu-bar-left\">\n        <div class=\"brand\">\n          <div class=\"brand-icon\"><i class=\"pi pi-table\"></i></div>\n          <div class=\"brand-title\">\n            <span>Sutram Studio</span>\n            <span class=\"version-tag\">v2.0</span>\n          </div>\n        </div>\n\n        <!-- Excel Ribbon Tabs: Home, Tables, Reports -->\n        <nav class=\"ribbon-tabs-nav\">\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'home'\"\n                  (click)=\"setTopTab('home')\">\n            <i class=\"pi pi-home\"></i>\n            <span>Home</span>\n          </button>\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'tables'\"\n                  (click)=\"setTopTab('tables')\">\n            <i class=\"pi pi-database\"></i>\n            <span>Tables</span>\n            <span class=\"ribbon-badge\">{{ tablesList.length || 21 }}</span>\n          </button>\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'reports'\"\n                  (click)=\"setTopTab('reports')\">\n            <i class=\"pi pi-chart-bar\"></i>\n            <span>Reports</span>\n            <span class=\"ribbon-badge\">{{ reportsList.length }}</span>\n          </button>\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'settings'\"\n                  (click)=\"setTopTab('settings')\">\n            <i class=\"pi pi-cog\"></i>\n            <span>Settings</span>\n          </button>\n        </nav>\n      </div>\n\n      <!-- Menu Bar Right: Mode Switcher, Save / Sync DB, & Dark Mode Toggle -->\n      <div class=\"menu-bar-right\">\n        <!-- Mode Switcher: Only for database tables -->\n        <div *ngIf=\"!isCurrentSheetRough && !isCurrentSheetReport\" class=\"mode-pill-toggle\">\n          <button class=\"mode-pill-btn\" [class.active-normal]=\"mode === 'normal'\" (click)=\"setStudioMode('normal')\">\n            <i class=\"pi pi-pencil\"></i> Normal\n          </button>\n          <button class=\"mode-pill-btn\" [class.active-smart]=\"mode === 'intelligent'\" (click)=\"setStudioMode('intelligent')\">\n            <i class=\"pi pi-bolt\"></i> Smart\n          </button>\n        </div>\n\n        <!-- Shifted: Save / Sync DB shifted between Mode Switcher and Theme Toggle -->\n        <!-- Case A: Rough Sheet OR Report Sheet -> Save Locally -->\n        <button *ngIf=\"isCurrentSheetRough || isCurrentSheetReport\"\n                type=\"button\"\n                class=\"cmd-btn-save-top\"\n                (click)=\"saveRoughSheetLocally()\"\n                [title]=\"isCurrentSheetReport ? 'Save report locally (Ctrl+S)' : 'Save sheet locally (Ctrl+S)'\">\n          <i class=\"pi pi-save\"></i>\n          <span>Save</span>\n        </button>\n\n        <!-- Case B: Database Entry Table Sheet -> Sync to DB -->\n        <button *ngIf=\"!isCurrentSheetRough && !isCurrentSheetReport\"\n                type=\"button\"\n                class=\"cmd-btn-sync-top\"\n                [class.has-pending]=\"state.pendingChangesCount() > 0\"\n                [disabled]=\"state.pendingChangesCount() === 0 || state.hasErrors()\"\n                (click)=\"startImport()\"\n                title=\"Sync changes to Database (Ctrl+S)\">\n          <i class=\"pi pi-cloud-upload\"></i>\n          <span>Sync DB</span>\n          <span *ngIf=\"state.pendingChangesCount() > 0\" class=\"sync-badge-count\">{{ state.pendingChangesCount() }}</span>\n        </button>\n\n        <button class=\"cmd-btn\" style=\"padding: 3px 6px;\" (click)=\"toggleTheme()\" title=\"Toggle Light / Dark Mode\">\n          <i class=\"pi\" [ngClass]=\"isDarkMode ? 'pi-sun' : 'pi-moon'\"></i>\n        </button>\n      </div>\n    </div>\n\n    <!-- Ribbon Content Strip (Few cm area, switches with tabs, horizontally scrollable) -->\n    <div class=\"ribbon-strip\">\n\n      <!-- RIBBON TAB 1: HOME TOOLS -->\n      <div *ngIf=\"activeTopTab === 'home'\" class=\"ribbon-content-row\">\n        <!-- Section: Style & Format -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\" [class.active]=\"isBoldActive\" (click)=\"toggleBold()\" title=\"Bold (Ctrl+B)\">\n              <span style=\"font-weight: 800; font-size: 13px;\">B</span>\n              <span class=\"ribbon-tool-lbl\">Bold</span>\n            </button>\n            <div class=\"ribbon-mini-col\">\n              <button class=\"ribbon-mini-btn\" [class.active-align]=\"textAlign === 'left'\" (click)=\"setTextAlign('left')\" title=\"Align Left\"><i class=\"pi pi-align-left\"></i></button>\n              <button class=\"ribbon-mini-btn\" [class.active-align]=\"textAlign === 'center'\" (click)=\"setTextAlign('center')\" title=\"Align Center\"><i class=\"pi pi-align-center\"></i></button>\n              <button class=\"ribbon-mini-btn\" [class.active-align]=\"textAlign === 'right'\" (click)=\"setTextAlign('right')\" title=\"Align Right\"><i class=\"pi pi-align-right\"></i></button>\n            </div>\n            <button class=\"ribbon-tool-btn\" (click)=\"colConfigOp.toggle($event)\" title=\"Choose Visible Columns\">\n              <i class=\"pi pi-sliders-h\" style=\"color: var(--primary);\"></i>\n              <span class=\"ribbon-tool-lbl\">Columns ({{ visibleHeadersCount }})</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">Format</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\"></div>\n\n        <!-- Section: Data Actions (Refresh, Open File, Export - Clear button removed) -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button *ngIf=\"!isCurrentSheetRough\" class=\"ribbon-tool-btn\" (click)=\"onRefreshData()\" title=\"Refresh data from database\">\n              <i class=\"pi pi-refresh text-success\"></i>\n              <span class=\"ribbon-tool-lbl\">Refresh</span>\n            </button>\n            <button class=\"ribbon-tool-btn\" (click)=\"openFileManager()\" title=\"Open Excel (.xlsx) file or saved sheets\">\n              <i class=\"pi pi-folder-open\"></i>\n              <span class=\"ribbon-tool-lbl\">Open File</span>\n            </button>\n            <input #fileInput type=\"file\" accept=\".xlsx, .xls, .csv\" style=\"display:none;\" (change)=\"onFileUpload($event)\">\n            <button class=\"ribbon-tool-btn\"\n                    [disabled]=\"isExportingExcel\"\n                    (click)=\"exportExcel()\"\n                    title=\"Export sheet to Excel\">\n              <i class=\"pi\" [ngClass]=\"isExportingExcel ? 'pi-spin pi-spinner text-primary' : 'pi-download'\"></i>\n              <span class=\"ribbon-tool-lbl\">{{ isExportingExcel ? 'Exporting...' : 'Export' }}</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">Data</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\"></div>\n\n        <!-- Section: Sort & Filter -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\" [class.active]=\"state.filtersEnabled()\" (click)=\"state.toggleFiltersEnabled()\" title=\"Toggle Filters\">\n              <i class=\"pi pi-filter\"></i>\n              <span class=\"ribbon-tool-lbl\">Filters</span>\n            </button>\n            <button class=\"ribbon-tool-btn\" [class.active]=\"state.sortingEnabled()\" (click)=\"state.toggleSortingEnabled()\" title=\"Toggle Sorting\">\n              <i class=\"pi pi-sort-alt\"></i>\n              <span class=\"ribbon-tool-lbl\">Sorting</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">Sort & Filter</span>\n        </div>\n      </div>\n\n      <!-- RIBBON TAB 2: TABLES (Horizontal Scrolling Strip with Small Simple Boxes) -->\n      <div *ngIf=\"activeTopTab === 'tables'\" class=\"ribbon-scroll-row\">\n        <!-- Quick search input inside tables strip -->\n        <div class=\"ribbon-search-field\" style=\"width: 140px; min-width: 140px; margin-right: 6px;\">\n          <i class=\"pi pi-search search-ico\"></i>\n          <input type=\"text\"\n                 class=\"ribbon-search-inp\"\n                 placeholder=\"Search tables...\"\n                 [(ngModel)]=\"tableSearchQuery\">\n          <button *ngIf=\"tableSearchQuery\" class=\"clear-btn-inline\" (click)=\"tableSearchQuery = ''\">\u2715</button>\n        </div>\n\n        <!-- Small simple boxes for each table -->\n        <div class=\"ribbon-boxes-track\">\n          <div *ngFor=\"let tbl of filteredTables\"\n               class=\"ribbon-small-box\"\n               [class.active-box]=\"isTableOpen(tbl.table)\"\n               (click)=\"openTableInSheet(tbl.table)\"\n               [title]=\"tbl.display_name ? (tbl.display_name + ' (' + tbl.table + ')') : tbl.table\">\n\n            <!-- Corner Star Favorite Button -->\n            <button type=\"button\"\n                    class=\"box-star-btn\"\n                    [class.starred]=\"favoriteTables.has(tbl.table)\"\n                    (click)=\"toggleFavoriteTable(tbl.table, $event)\"\n                    [title]=\"favoriteTables.has(tbl.table) ? 'Remove favorite' : 'Add to startup sheets'\">\n              <i class=\"pi\" [ngClass]=\"favoriteTables.has(tbl.table) ? 'pi-star-fill' : 'pi-star'\"></i>\n            </button>\n\n            <div class=\"box-icon-wrap\">\n              <i class=\"pi pi-table\"></i>\n            </div>\n            <div class=\"box-info\">\n              <span class=\"box-name-eng-main\">{{ tbl.display_name || tbl.table }}</span>\n            </div>\n            <span *ngIf=\"isTableOpen(tbl.table)\" class=\"box-dot\" title=\"Sheet open\"></span>\n          </div>\n        </div>\n      </div>\n\n      <!-- RIBBON TAB 3: REPORTS (Horizontal Scrolling Strip with Small Simple Boxes) -->\n      <div *ngIf=\"activeTopTab === 'reports'\" class=\"ribbon-scroll-row\">\n        <!-- Quick search input inside reports strip -->\n        <div class=\"ribbon-search-field\" style=\"width: 140px; min-width: 140px; margin-right: 6px;\">\n          <i class=\"pi pi-search search-ico\"></i>\n          <input type=\"text\"\n                 class=\"ribbon-search-inp\"\n                 placeholder=\"Search reports...\"\n                 [(ngModel)]=\"reportSearchQuery\">\n          <button *ngIf=\"reportSearchQuery\" class=\"clear-btn-inline\" (click)=\"reportSearchQuery = ''\">\u2715</button>\n        </div>\n\n        <!-- Small simple boxes for each report -->\n        <div class=\"ribbon-boxes-track\">\n          <div *ngFor=\"let rep of filteredReports\"\n               class=\"ribbon-small-box report-box\"\n               [class.active-box]=\"isReportOpen(rep.id)\"\n               (click)=\"openReportInSheet(rep)\"\n               [title]=\"(rep.display_name || rep.title || rep.table || rep.id) + ' \u2014 ' + (rep.desc || '')\">\n\n            <!-- Corner Star Favorite Button -->\n            <button type=\"button\"\n                    class=\"box-star-btn\"\n                    [class.starred]=\"favoriteReports.has(rep.id)\"\n                    (click)=\"toggleFavoriteReport(rep.id, $event)\"\n                    [title]=\"favoriteReports.has(rep.id) ? 'Remove favorite' : 'Add to startup sheets'\">\n              <i class=\"pi\" [ngClass]=\"favoriteReports.has(rep.id) ? 'pi-star-fill' : 'pi-star'\"></i>\n            </button>\n\n            <div class=\"box-icon-wrap report-icon-bg\">\n              <i class=\"pi\" [ngClass]=\"rep.icon\"></i>\n            </div>\n            <div class=\"box-info\">\n              <span class=\"box-name-eng-main\">{{ rep.display_name || rep.title || rep.table || rep.id }}</span>\n            </div>\n            <span *ngIf=\"isReportOpen(rep.id)\" class=\"box-dot\" title=\"Sheet open\"></span>\n          </div>\n        </div>\n      </div>\n\n      <!-- RIBBON TAB 4: SETTINGS (Concise & Minimal: Checkbox & Badge) -->\n      <div *ngIf=\"activeTopTab === 'settings'\" class=\"ribbon-content-row\">\n        <!-- Section: Boolean Display Style (Only Checkbox and Badge) -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\"\n                    [class.active]=\"booleanDisplayStyle === 'checkbox'\"\n                    (click)=\"setBooleanStyle('checkbox')\"\n                    title=\"Excel style clickable checkbox\">\n              <i class=\"pi pi-check-square\" style=\"color: #10b981;\"></i>\n              <span class=\"ribbon-tool-lbl\">Checkbox</span>\n            </button>\n            <button class=\"ribbon-tool-btn\"\n                    [class.active]=\"booleanDisplayStyle === 'badge'\"\n                    (click)=\"setBooleanStyle('badge')\"\n                    title=\"Status pill badge (Yes / No)\">\n              <i class=\"pi pi-tag\" style=\"color: #3b82f6;\"></i>\n              <span class=\"ribbon-tool-lbl\">Badge</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">Boolean</span>\n        </div>\n      </div>\n\n    </div>\n  </header>\n\n  <!-- 2. FORMULA BAR ROW (ALWAYS VISIBLE) -->\n  <div class=\"formula-bar-row\">\n    <div class=\"coord-box\">{{ activeCoord }}</div>\n    <span class=\"active-col-chip\">{{ activeColChip }}</span>\n\n    <span style=\"font-weight: 700; font-style: italic; color: var(--text-muted); margin: 0 4px;\">fx</span>\n    <input type=\"text\"\n           class=\"formula-input\"\n           [ngModel]=\"formulaValue\"\n           (ngModelChange)=\"onFormulaChange($event)\"\n           placeholder=\"Select a cell or type value here...\">\n\n    <!-- Direct DB Search & Record Counter (Shifted to Right Area of Formula Bar) -->\n    <div class=\"formula-bar-right-area\">\n      <div class=\"formula-search-field\">\n        <i class=\"pi pi-search search-ico\"></i>\n        <input type=\"text\"\n               class=\"formula-search-inp\"\n               placeholder=\"Direct DB Search...\"\n               [ngModel]=\"state.dbSearchQuery()\"\n               (ngModelChange)=\"onDbSearchInput($event)\">\n        <button *ngIf=\"state.dbSearchQuery()\" class=\"clear-btn-inline\" (click)=\"clearDbSearch()\" title=\"Clear search\">\u2715</button>\n        <span *ngIf=\"state.isLoadingDb()\" class=\"spin-inline\"><i class=\"pi pi-spin pi-spinner\"></i></span>\n      </div>\n      <div *ngIf=\"!isCurrentSheetRough\" class=\"formula-record-pill\" title=\"Total database records\">\n        <i class=\"pi pi-database\"></i>\n        <span>{{ state.rows().length }} / {{ state.totalDbRecords() }}</span>\n      </div>\n    </div>\n  </div>\n\n  <!-- Column Config Popover (Replicating Legacy Studio) -->\n  <p-overlayPanel #colConfigOp [dismissable]=\"true\" styleClass=\"sutram-col-config-popover shadow-lg\">\n    <ng-template pTemplate=\"content\">\n      <div class=\"col-dropdown-menu\">\n        <!-- Header: Search Bar & Action Strip -->\n        <div class=\"col-dd-header\">\n          <div class=\"col-dd-search-wrap\">\n            <i class=\"pi pi-search col-dd-search-icon\"></i>\n            <input type=\"text\"\n                   class=\"col-dd-search-input\"\n                   placeholder=\"Search columns / FK...\"\n                   [(ngModel)]=\"colSearchQuery\" />\n            <button *ngIf=\"colSearchQuery\"\n                    type=\"button\"\n                    class=\"btn-clear-search-inline\"\n                    (click)=\"colSearchQuery = ''\">\n              <i class=\"pi pi-times\"></i>\n            </button>\n          </div>\n\n          <div class=\"col-dd-actions\">\n            <div class=\"col-dd-actions-left\">\n              <button type=\"button\" class=\"col-dd-act-btn\" (click)=\"selectAllColumns(true)\">All</button>\n              <button type=\"button\" class=\"col-dd-act-btn\" (click)=\"selectAllColumns(false)\">None</button>\n              <button type=\"button\" class=\"col-dd-act-btn\" (click)=\"resetDefaultColumns()\">Reset</button>\n            </div>\n            <span class=\"col-dd-count\">{{ selectedColumnKeys.size }} of {{ allConfigColumns.length }} visible</span>\n          </div>\n        </div>\n\n        <!-- Body: Standard Columns & FK Groups -->\n        <div class=\"col-dd-body\">\n          <!-- 1. Standard Columns -->\n          <ng-container *ngIf=\"filteredDirectCols.length > 0\">\n            <div class=\"col-dd-section-title\">Standard Columns</div>\n            <div *ngFor=\"let col of filteredDirectCols; trackBy: trackByColKey\"\n                 class=\"col-dd-item\"\n                 (click)=\"toggleColumnCheckbox(col.key)\">\n              <div class=\"col-dd-item-left\">\n                <input type=\"checkbox\"\n                       class=\"custom-check\"\n                       [checked]=\"isColumnSelected(col.key)\"\n                       style=\"pointer-events: none;\" />\n                <span class=\"col-dd-item-name\" [title]=\"col.name\">\n                  {{ col.name }}<span *ngIf=\"col.not_null\" style=\"color: #ef4444; margin-left: 2px;\">*</span>\n                </span>\n              </div>\n              <span class=\"type-badge\">{{ col.type || 'string' }}</span>\n            </div>\n          </ng-container>\n\n          <!-- 2. Foreign Key Reference Groups -->\n          <ng-container *ngIf=\"filteredFkGroups.length > 0\">\n            <div class=\"col-dd-section-title\" style=\"margin-top: 8px;\">FK Reference Groups</div>\n            <div *ngFor=\"let grp of filteredFkGroups; trackBy: trackByGroupName\"\n                 class=\"col-dd-group\"\n                 [class.fk-active-group]=\"grp.selectedCount > 0\">\n              <!-- Group Accordion Header -->\n              <div class=\"col-dd-group-header\">\n                <div class=\"col-dd-group-left\"\n                     (click)=\"toggleFkGroupExpand(grp.name)\"\n                     style=\"cursor: pointer; flex-grow: 1;\">\n                  <i class=\"pi pi-chevron-right fk-expand-toggle\"\n                     [class.rotated]=\"isFkGroupExpanded(grp.name)\"></i>\n                  <span class=\"col-dd-item-name\">\n                    <i class=\"pi pi-link\" style=\"color: var(--primary, #4f46e5); font-size: 10px; margin-right: 3px;\"></i>\n                    <strong style=\"text-transform: capitalize;\">{{ grp.name }}</strong>\n                    <span style=\"font-size: 10px; color: var(--text-muted); font-weight: 400; margin-left: 3px;\">({{ grp.refTable }})</span>\n                  </span>\n                </div>\n                <div class=\"col-dd-group-right\"\n                     (click)=\"toggleFkGroupAll(grp.name)\"\n                     style=\"cursor: pointer; display: flex; align-items: center; gap: 6px;\">\n                  <input type=\"checkbox\"\n                         class=\"custom-check\"\n                         [checked]=\"grp.isAllChecked\"\n                         style=\"pointer-events: none;\" />\n                  <span class=\"fk-group-pill\"\n                        [style.background]=\"grp.selectedCount > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(125, 125, 125, 0.1)'\"\n                        [style.color]=\"grp.selectedCount > 0 ? '#059669' : 'var(--text-muted)'\">\n                    {{ grp.selectedCount }}/{{ grp.totalCount }}\n                  </span>\n                </div>\n              </div>\n\n              <!-- Group Sub-items (when expanded) -->\n              <div *ngIf=\"isFkGroupExpanded(grp.name)\" class=\"col-dd-group-items\">\n                <div *ngFor=\"let col of grp.columns; trackBy: trackByColKey\"\n                     class=\"col-dd-item\"\n                     (click)=\"toggleColumnCheckbox(col.key)\">\n                  <div class=\"col-dd-item-left\">\n                    <input type=\"checkbox\"\n                           class=\"custom-check\"\n                           [checked]=\"isColumnSelected(col.key)\"\n                           style=\"pointer-events: none;\" />\n                    <span class=\"col-dd-item-name\"\n                          [style.font-weight]=\"col.is_fk_main ? '600' : 'normal'\"\n                          [title]=\"col.name\">\n                      {{ col.short_name || col.name }}\n                    </span>\n                  </div>\n                  <span class=\"type-badge\">{{ col.is_fk_main ? 'display' : (col.is_fk_raw ? 'id' : (col.type || 'string')) }}</span>\n                </div>\n              </div>\n            </div>\n          </ng-container>\n\n          <!-- Empty State -->\n          <div *ngIf=\"filteredDirectCols.length === 0 && filteredFkGroups.length === 0\" class=\"col-dd-empty\">\n            <i class=\"pi pi-search me-1\"></i> No matching columns found\n          </div>\n        </div>\n\n        <!-- Footer: Click outside hint + Done button -->\n        <div class=\"col-dd-footer\">\n          <span class=\"small text-muted\" style=\"font-size: 10.5px;\">Click outside or press Esc</span>\n          <button type=\"button\" class=\"btn btn-sm btn-primary py-1 px-3\" style=\"font-size: 11.5px; font-weight: 600;\" (click)=\"colConfigOp.hide()\">Done</button>\n        </div>\n      </div>\n    </ng-template>\n  </p-overlayPanel>\n\n  <!-- 3. STATUS & BATCH FIX SUGGESTION STRIP (ALWAYS VISIBLE) -->\n  <div class=\"status-strip\" [ngClass]=\"statusStripClass\">\n    <div style=\"display: flex; align-items: center; gap: 6px;\">\n      <i class=\"pi\" [ngClass]=\"statusStripIcon\"></i>\n      <span>{{ statusStripMessage }}</span>\n    </div>\n    <div *ngIf=\"!isCurrentSheetReport && state.unresolvedCorrectionsCount() > 0\">\n      <button class=\"cmd-btn cmd-btn-warning\" style=\"padding: 2px 8px;\" (click)=\"showSidebar = true\">\n        <i class=\"pi pi-bolt\"></i> \u0917\u0932\u0924\u093F\u092F\u093E\u0901 ({{ state.unresolvedCorrectionsCount() }})\n      </button>\n    </div>\n  </div>\n\n  <!-- 4. SPREADSHEET CANVAS (ALWAYS VISIBLE! 100% REMAINING HEIGHT) -->\n  <main class=\"spreadsheet-canvas flex-grow-1\" [style.zoom]=\"zoomLevel\">\n    <sutram-grid #grid\n                 [headers]=\"visibleHeaders\"\n                 [rows]=\"state.rows()\"\n                 [filterOnlyErrors]=\"state.filterOnlyErrors()\"\n                 [enableDelete]=\"enableDelete\"\n                 [isBold]=\"isBoldActive\"\n                 [textAlign]=\"textAlign\"\n                 [booleanStyle]=\"booleanDisplayStyle\"\n                 (loadMore)=\"onLoadMore()\"\n                 (filterChanged)=\"onGridFilterChanged()\"\n                 (sortChanged)=\"onGridSortChanged()\"\n                 (solveAllTriggered)=\"onGridSolveAll($event)\"\n                 (openConfig)=\"colConfigOp.toggle($event)\">\n    </sutram-grid>\n  </main>\n\n  <!-- 5. BOTTOM MULTI-SHEET TAB BAR & STATUS BAR -->\n  <footer class=\"studio-footer\">\n    <!-- Sub-row A: Sheet Tabs Strip -->\n    <div class=\"sheet-tabs-bar\">\n      <div *ngFor=\"let tab of sheetTabs\"\n           class=\"tab-pill\"\n           [class.active-tab]=\"activeSheetId === tab.id\"\n           (click)=\"switchSheet(tab.id)\"\n           (dblclick)=\"startRenameTab(tab, $event)\"\n           (contextmenu)=\"openTabContextMenu($event, tab)\">\n        <i class=\"pi\" [ngClass]=\"tab.icon\" style=\"font-size: 11px;\"></i>\n\n        <!-- Regular Sheet Tab Title -->\n        <span *ngIf=\"renamingTabId !== tab.id\"\n              class=\"tab-title-text\"\n              title=\"\u0921\u092C\u0932-\u0915\u094D\u0932\u093F\u0915 \u092F\u093E \u0930\u093E\u0907\u091F-\u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0915\u0947 \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Double-click or right-click to rename)\">\n          {{ tab.title }}\n        </span>\n\n        <!-- Inline Sheet Rename Input -->\n        <input *ngIf=\"renamingTabId === tab.id\"\n               [id]=\"'tab-rename-input-' + tab.id\"\n               type=\"text\"\n               class=\"tab-inline-rename-input\"\n               [(ngModel)]=\"renamingTabTitle\"\n               (keyup.enter)=\"saveTabRename(tab)\"\n               (keyup.escape)=\"cancelTabRename()\"\n               (blur)=\"saveTabRename(tab)\"\n               (click)=\"$event.stopPropagation()\">\n\n        <!-- Record Count Badge -->\n        <span *ngIf=\"tab.isLoaded && (tab.recordCount || 0) > 0\" class=\"sheet-tab-badge\">\n          {{ tab.recordCount }}\n        </span>\n\n        <!-- Inline Rename Button for Rough Sheets -->\n        <button *ngIf=\"renamingTabId !== tab.id && (tab.type === 'rough' || tab.id.startsWith('rough_') || tab.id.startsWith('sheet_'))\"\n                type=\"button\"\n                class=\"tab-edit-btn\"\n                (click)=\"startRenameTab(tab, $event)\"\n                title=\"\u0936\u0940\u091F \u0915\u093E \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Rename sheet)\">\n          <i class=\"pi pi-pencil\" style=\"font-size: 8.5px;\"></i>\n        </button>\n\n        <!-- Close Sheet Button -->\n        <button *ngIf=\"sheetTabs.length > 1\"\n                type=\"button\"\n                class=\"tab-close-btn\"\n                (click)=\"closeSheet(tab.id, $event)\"\n                title=\"Close sheet\">\u2715</button>\n      </div>\n\n      <button class=\"add-tab-btn\" (click)=\"addNewBlankSheet()\" title=\"Add Blank Sheet\">\n        <i class=\"pi pi-plus\" style=\"font-size: 10px;\"></i>\n      </button>\n    </div>\n\n    <!-- Tab Context Menu (Right Click on Sheet Tab) -->\n    <div *ngIf=\"tabContextMenu.visible\"\n         class=\"tab-context-menu\"\n         [style.left.px]=\"tabContextMenu.x\"\n         [style.top.px]=\"tabContextMenu.y\"\n         (click)=\"$event.stopPropagation()\">\n      <div class=\"tab-context-menu-item\"\n           (click)=\"startRenameTab(tabContextMenu.tab!, $event)\">\n        <i class=\"pi pi-pencil text-primary\"></i>\n        <span>\u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Rename Sheet)</span>\n      </div>\n      <div *ngIf=\"tabContextMenu.tab\"\n           class=\"tab-context-menu-item text-danger\"\n           (click)=\"deleteSheet(tabContextMenu.tab, $event)\">\n        <i class=\"pi pi-trash\"></i>\n        <span>\u0936\u0940\u091F \u0939\u091F\u093E\u090F\u0902 / \u0921\u093F\u0932\u0940\u091F \u0915\u0930\u0947\u0902 (Delete Sheet)</span>\n      </div>\n    </div>\n\n    <!-- Sub-row B: Status Bar with Scale / Zoom Controls -->\n    <div class=\"bottom-status-subrow\">\n      <div style=\"display: flex; align-items: center; gap: 10px;\">\n        <span>Sheet: {{ activeSheetId }}</span>\n        <span>Rows: {{ state.rows().length }}{{ state.totalDbRecords() > state.rows().length ? ' / ' + state.totalDbRecords() : '' }}</span>\n        <span *ngIf=\"state.isLoadingDb()\" class=\"text-primary small fw-semibold\">\n          <i class=\"pi pi-spin pi-spinner me-1\"></i>Loading more...\n        </span>\n        <span *ngIf=\"state.deletedRowIds().length > 0\" class=\"badge bg-soft-warning text-warning small fw-semibold\">\n          <i class=\"pi pi-trash me-1\"></i>{{ state.deletedRowIds().length }} Deleted\n        </span>\n        <span *ngIf=\"state.stats().errorRows === 0\" style=\"color: #10b981; font-weight: 600;\">\u2713 100% In Sync</span>\n        <span *ngIf=\"state.stats().errorRows > 0\" style=\"color: #ef4444; font-weight: 600;\">{{ state.stats().errorRows }} \u0924\u094D\u0930\u0941\u091F\u093F\u092F\u093E\u0901</span>\n\n        <!-- Last Sync Status of the active sheet -->\n        <span *ngIf=\"lastSyncPerSheet[activeSheetId]\"\n              class=\"last-sync-badge\"\n              [class.sync-error]=\"lastSyncPerSheet[activeSheetId].hasError\">\n          <i class=\"pi pi-history me-1\"></i>\u0905\u0902\u0924\u093F\u092E \u0938\u093F\u0902\u0915 ({{ lastSyncPerSheet[activeSheetId].time }}): {{ lastSyncPerSheet[activeSheetId].summary }}\n        </span>\n      </div>\n\n      <div style=\"display: flex; align-items: center; gap: 10px;\">\n        <span style=\"font-size: 10.5px; opacity: 0.8;\">Ctrl+S to Sync | Enter next row | Tab next col | Click # to select row</span>\n\n        <!-- Scale / Zoom Controls -->\n        <div class=\"zoom-controls\">\n          <button class=\"zoom-btn\" (click)=\"zoomOut()\" title=\"Zoom Out (-10%)\"><i class=\"pi pi-minus\"></i></button>\n          <span class=\"zoom-display\" (click)=\"resetZoom()\" title=\"Reset to 100%\">{{ (zoomLevel * 100).toFixed(0) }}%</span>\n          <button class=\"zoom-btn\" (click)=\"zoomIn()\" title=\"Zoom In (+10%)\"><i class=\"pi pi-plus\"></i></button>\n        </div>\n      </div>\n    </div>\n  </footer>\n\n  <!-- 6. Floating Sync Toast HUD (Live Progress & Completion) -->\n  <div *ngIf=\"syncToast.visible\" class=\"sync-toast-hud shadow-lg\">\n    <div class=\"sync-toast-header\">\n      <div class=\"sync-toast-title\">\n        <i class=\"pi\"\n           [ngClass]=\"syncToast.inProgress ? 'pi-spin pi-sync text-primary' : (syncToast.hasError ? 'pi-exclamation-circle text-warning' : 'pi-check-circle text-success')\"></i>\n        <span>{{ syncToast.title }}</span>\n      </div>\n      <button class=\"sync-toast-close\" (click)=\"dismissSyncToast()\">\u2715</button>\n    </div>\n\n    <!-- Live Progress Bar when Sync is running -->\n    <div *ngIf=\"syncToast.inProgress\" class=\"sync-progress-wrap px-3 pt-2\">\n      <div class=\"d-flex justify-content-between align-items-center mb-1\" style=\"font-size: 11px; color: var(--text-muted, #64748b);\">\n        <span>{{ syncToast.percentage }}% \u092A\u0942\u0930\u094D\u0923</span>\n        <span>{{ state.importProgress().current }} / {{ state.importProgress().total }}</span>\n      </div>\n      <div class=\"sync-progress-track\">\n        <div class=\"sync-progress-bar\" [style.width.%]=\"syncToast.percentage\"></div>\n      </div>\n    </div>\n\n    <div class=\"sync-toast-body\">\n      <div class=\"sync-toast-stats\">\n        <span *ngIf=\"syncToast.inserted > 0\" class=\"sync-badge-chip chip-success\">\n          <i class=\"pi pi-plus\"></i> {{ syncToast.inserted }} Inserted\n        </span>\n        <span *ngIf=\"syncToast.updated > 0\" class=\"sync-badge-chip chip-info\">\n          <i class=\"pi pi-refresh\"></i> {{ syncToast.updated }} Updated\n        </span>\n        <span *ngIf=\"syncToast.deleted > 0\" class=\"sync-badge-chip chip-warning\">\n          <i class=\"pi pi-trash\"></i> {{ syncToast.deleted }} Deleted\n        </span>\n        <span *ngIf=\"syncToast.failed > 0\" class=\"sync-badge-chip chip-danger\">\n          <i class=\"pi pi-times\"></i> {{ syncToast.failed }} Failed\n        </span>\n      </div>\n      <div *ngIf=\"syncToast.errors.length > 0\" class=\"sync-toast-errors\">\n        <div *ngFor=\"let err of syncToast.errors\">\u2022 {{ err }}</div>\n      </div>\n    </div>\n  </div>\n\n  <!-- Smart Header Scanner & Dual-Mode Open File Modal -->\n  <sutram-header-scanner [(visible)]=\"showScannerModal\"\n                         [fileName]=\"uploadedFileName\"\n                         [sheetNames]=\"uploadedSheetNames\"\n                         [currentSheetName]=\"selectedUploadedSheet\"\n                         [sheetHeaders]=\"uploadedSheetHeaders\"\n                         [sampleRows]=\"uploadedSampleRows\"\n                         [totalRows]=\"uploadedTotalRows\"\n                         [tablesList]=\"tablesList\"\n                         [selectedTable]=\"scannerTargetTable\"\n                         [report]=\"scanReport\"\n                         [availableHeaders]=\"scannerAvailableHeaders\"\n                         [isTableConfigLoading]=\"isScannerConfigLoading\"\n                         [savedSheets]=\"savedSheetsList\"\n                         (sheetChange)=\"onUploadedSheetChange($event)\"\n                         (targetTableChange)=\"onScannerTargetTableChange($event)\"\n                         (openDirectNormal)=\"onDirectOpenAsNormalSheet($event)\"\n                         (openMappedToTable)=\"onScannerConfirmedMapped($event)\"\n                         (openSavedSheet)=\"onOpenSavedSheet($event)\"\n                         (deleteSavedSheet)=\"onDeleteSavedSheet($event)\"\n                         (triggerFileInput)=\"triggerBrowseFile()\">\n  </sutram-header-scanner>\n\n  <!-- Batch Correction Sidebar -->\n  <sutram-correction-sidebar [(visible)]=\"showSidebar\"\n                             [groups]=\"state.correctionGroups()\">\n  </sutram-correction-sidebar>\n\n</div>\n", styles: ["/**\n * sutram-excel-studio.component.scss\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n * Pixel-Perfect Enterprise Excel Studio Styling.\n * Exact replication of Sutram Excel Studio v2.0 UI.\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n */\n\n:host {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n\n.sutram-excel-container {\n  --primary: #4f46e5;\n  --primary-hover: #4338ca;\n  --primary-soft: #e0e7ff;\n  --success: #10b981;\n  --success-soft: #d1fae5;\n  --warning: #f59e0b;\n  --warning-soft: #fef3c7;\n  --danger: #ef4444;\n  --danger-soft: #fee2e2;\n  --bg: #f8fafc;\n  --surface: #ffffff;\n  --surface-border: #e2e8f0;\n  --text: #0f172a;\n  --text-muted: #64748b;\n  --radius: 6px;\n  --header-bg: #f1f5f9;\n  --header-text: #1e293b;\n  --cell-border: rgba(125, 125, 125, 0.18);\n  --cell-height: 23px;\n  --header-height: 38px;\n  --cell-edited-bg: #fef9c3;\n  --cell-edited-border: #eab308;\n  --row-edited-bg: #fffbeb;\n  --row-new-bg: #dcfce7;\n  --row-new-border: #22c55e;\n\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n  background-color: var(--bg);\n  color: var(--text);\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  user-select: none;\n\n  &.dark-mode {\n    --bg: #0f172a;\n    --surface: #1e293b;\n    --surface-border: #334155;\n    --text: #f8fafc;\n    --text-muted: #94a3b8;\n    --header-bg: #1e293b;\n    --header-text: #cbd5e1;\n    --cell-border: rgba(255, 255, 255, 0.1);\n    --cell-edited-bg: rgba(234, 179, 8, 0.22);\n    --cell-edited-border: #facc15;\n    --row-edited-bg: rgba(234, 179, 8, 0.12);\n    --row-new-bg: rgba(34, 197, 94, 0.18);\n    --row-new-border: #4ade80;\n  }\n}\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n * 1. TOP EXCEL-STYLE RIBBON HEADER\n * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n.studio-header {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n  user-select: none;\n}\n\n/* 1A. Ribbon Top Menu Bar (Brand + Tabs + Mode Switcher) */\n.ribbon-menu-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2px 10px;\n  height: 32px;\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n}\n\n.menu-bar-left {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.brand {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.brand-icon {\n  width: 22px;\n  height: 22px;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 11px;\n}\n.brand-title {\n  font-size: 11.5px;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  color: var(--text);\n\n  .version-tag {\n    font-size: 9px;\n    padding: 1px 4px;\n    background: rgba(16, 185, 129, 0.18);\n    color: #059669;\n    border-radius: 3px;\n    font-weight: 700;\n  }\n}\n\n/* Ribbon Tabs Navigation */\n.ribbon-tabs-nav {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n.ribbon-tab-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 3px 11px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.12s ease;\n\n  i {\n    font-size: 10.5px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.08);\n    color: var(--text);\n  }\n\n  &.active {\n    background: var(--surface);\n    color: var(--primary);\n    border-color: var(--surface-border) var(--surface-border) transparent var(--surface-border);\n    border-bottom: 2px solid var(--primary);\n    font-weight: 700;\n  }\n}\n.ribbon-badge {\n  font-size: 9px;\n  padding: 1px 4px;\n  border-radius: 999px;\n  background: rgba(79, 70, 229, 0.12);\n  color: var(--primary);\n  font-weight: 700;\n}\n\n.menu-bar-right {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.mode-pill-toggle {\n  background: rgba(125, 125, 125, 0.12);\n  border-radius: 999px;\n  padding: 2px;\n  display: flex;\n  gap: 2px;\n}\n.mode-pill-btn {\n  padding: 2px 9px;\n  border-radius: 999px;\n  font-size: 10px;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  i { font-size: 9.5px; }\n}\n.mode-pill-btn.active-normal {\n  background: #3b82f6;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.35);\n}\n.mode-pill-btn.active-smart {\n  background: #10b981;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.35);\n}\n\n.cmd-btn-save-top,\n.cmd-btn-sync-top {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 2px 10px;\n  height: 24px;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.15s ease;\n\n  i {\n    font-size: 11px;\n  }\n\n  &:hover:not(:disabled) {\n    background: rgba(125, 125, 125, 0.1);\n    border-color: var(--primary);\n    color: var(--primary);\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n\n  &.has-pending {\n    background: #10b981;\n    color: #ffffff;\n    border-color: #059669;\n    box-shadow: 0 1px 4px rgba(16, 185, 129, 0.35);\n\n    &:hover {\n      background: #059669;\n      color: #ffffff;\n    }\n  }\n\n  .sync-badge-count {\n    font-size: 9px;\n    padding: 1px 5px;\n    border-radius: 999px;\n    background: #ffffff;\n    color: #059669;\n    font-weight: 800;\n    line-height: 1;\n  }\n}\n\n/* 1B. Ribbon Content Strip (Few cm area) */\n.ribbon-strip {\n  background: var(--surface);\n  padding: 4px 10px;\n  height: 60px;\n  display: flex;\n  align-items: center;\n  overflow: hidden;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);\n}\n\n/* Home Panel Toolbar (Grouped items) */\n.ribbon-content-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n\n.ribbon-group {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: space-between;\n  height: 52px;\n  padding: 0 4px;\n}\n\n.ribbon-group-items {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-grow: 1;\n}\n\n.ribbon-group-name {\n  font-size: 8.5px;\n  color: var(--text-muted);\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  margin-top: 1px;\n}\n\n.ribbon-v-sep {\n  width: 1px;\n  height: 40px;\n  background: var(--surface-border);\n  opacity: 0.75;\n  margin: 0 4px;\n}\n\n.ribbon-tool-btn {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 2px;\n  padding: 2px 7px;\n  height: 42px;\n  border-radius: 4px;\n  border: 1px solid transparent;\n  background: transparent;\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.12s;\n  font-size: 10.5px;\n\n  i {\n    font-size: 13px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.09);\n    border-color: var(--surface-border);\n  }\n\n  &.active {\n    background: var(--primary-soft);\n    color: var(--primary);\n    border-color: rgba(79, 70, 229, 0.3);\n    font-weight: 700;\n  }\n\n  .ribbon-tool-lbl {\n    font-size: 9px;\n    white-space: nowrap;\n    font-weight: 500;\n  }\n}\n\n.ribbon-mini-col {\n  display: flex;\n  flex-direction: row;\n  gap: 2px;\n}\n\n.ribbon-mini-btn {\n  width: 22px;\n  height: 22px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 3px;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  font-size: 9.5px;\n\n  &:hover { background: rgba(125, 125, 125, 0.1); }\n\n  &.active-align {\n    background: var(--primary-soft);\n    color: var(--primary);\n    border-color: rgba(79, 70, 229, 0.35);\n  }\n}\n\n.ribbon-search-field {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 165px;\n\n  .search-ico {\n    position: absolute;\n    left: 7px;\n    font-size: 9.5px;\n    color: var(--text-muted);\n    pointer-events: none;\n  }\n\n  .ribbon-search-inp {\n    width: 100%;\n    height: 24px;\n    padding: 2px 20px 2px 22px;\n    font-size: 10.5px;\n    border-radius: 4px;\n    border: 1px solid var(--surface-border);\n    background: var(--surface);\n    color: var(--text);\n    outline: none;\n    transition: border-color 0.12s ease;\n\n    &:focus {\n      border-color: var(--primary);\n    }\n  }\n\n  .clear-btn-inline {\n    position: absolute;\n    right: 5px;\n    background: transparent;\n    border: none;\n    font-size: 9px;\n    cursor: pointer;\n    color: var(--text-muted);\n  }\n\n  .spin-inline {\n    position: absolute;\n    right: 5px;\n    font-size: 9px;\n    color: var(--primary);\n  }\n}\n\n.ribbon-btn-action {\n  background: var(--primary) !important;\n  color: #ffffff !important;\n  border-color: var(--primary) !important;\n  font-weight: 700 !important;\n\n  &:hover {\n    filter: brightness(1.1);\n  }\n\n  .sync-count-tag {\n    font-size: 8.5px;\n    padding: 0 4px;\n    background: #ffffff;\n    color: var(--primary);\n    border-radius: 999px;\n    font-weight: 800;\n    margin-left: 2px;\n  }\n}\n\n.ribbon-record-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 7px;\n  background: rgba(125, 125, 125, 0.08);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--text-muted);\n  height: 24px;\n}\n\n/* 1C. Tables & Reports Strip (Horizontal Scrolling Track with Small Boxes) */\n.ribbon-scroll-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.ribbon-boxes-track {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  overflow-x: auto;\n  scrollbar-width: thin;\n  height: 100%;\n  flex-grow: 1;\n  padding: 2px 2px;\n\n  &::-webkit-scrollbar {\n    height: 4px;\n  }\n  &::-webkit-scrollbar-thumb {\n    background: rgba(125, 125, 125, 0.25);\n    border-radius: 2px;\n  }\n}\n\n.ribbon-small-box {\n  position: relative;\n  flex-shrink: 0;\n  min-width: 115px;\n  max-width: 140px;\n  height: 46px;\n  background: var(--surface);\n  border: 1px solid var(--surface-border);\n  border-radius: 5px;\n  padding: 3px 8px 3px 6px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: all 0.12s ease;\n  user-select: none;\n\n  &:hover {\n    border-color: var(--primary);\n    background: var(--primary-soft);\n    transform: translateY(-1px);\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);\n  }\n\n  &.active-box {\n    border-color: rgba(16, 185, 129, 0.6);\n    background: rgba(16, 185, 129, 0.08);\n  }\n\n  .box-star-btn {\n    position: absolute;\n    top: 2px;\n    right: 2px;\n    width: 15px;\n    height: 15px;\n    border: none;\n    background: transparent;\n    cursor: pointer;\n    color: var(--text-muted);\n    font-size: 9px;\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 2;\n    transition: all 0.12s;\n\n    &:hover {\n      color: #f59e0b;\n      transform: scale(1.2);\n    }\n\n    &.starred {\n      color: #f59e0b;\n    }\n  }\n\n  .box-icon-wrap {\n    width: 25px;\n    height: 25px;\n    border-radius: 4px;\n    background: var(--primary-soft);\n    color: var(--primary);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 11px;\n    flex-shrink: 0;\n\n    &.report-icon-bg {\n      background: rgba(16, 185, 129, 0.15);\n      color: #059669;\n    }\n  }\n\n  .box-info {\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n    padding-right: 10px;\n\n    .box-name-eng-main {\n      font-size: 11px;\n      font-weight: 600;\n      color: var(--text);\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .box-name-hin {\n      font-size: 10.5px;\n      font-weight: 700;\n      color: var(--text);\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .box-name-eng {\n      font-size: 9px;\n      color: var(--text-muted);\n      font-family: monospace;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n  }\n\n  .box-dot {\n    position: absolute;\n    bottom: 3px;\n    right: 3px;\n    width: 5px;\n    height: 5px;\n    border-radius: 50%;\n    background: #10b981;\n  }\n}\n\n.btn-group-cmd {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.cmd-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  transition: all 0.15s;\n  user-select: none;\n\n  i {\n    font-size: 10.5px;\n  }\n}\n.cmd-btn:hover { background: rgba(125, 125, 125, 0.1); }\n.cmd-btn.active {\n  background: var(--primary-soft);\n  color: var(--primary);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.cmd-btn-primary { background: var(--primary); color: white; border-color: var(--primary); }\n.cmd-btn-primary:hover { background: var(--primary-hover); }\n.cmd-btn-success { background: var(--success); color: white; border-color: var(--success); }\n.cmd-btn-success:hover { background: #059669; }\n.cmd-btn-warning { background: var(--warning-soft); color: #b45309; border-color: rgba(245, 158, 11, 0.3); }\n\n.sync-badge-count {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: #f59e0b;\n  color: #ffffff;\n  font-size: 9.5px;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 999px;\n  margin-left: 4px;\n  line-height: 1.1;\n}\n\n/* 2. FORMULA BAR ROW */\n.formula-bar-row {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n}\n.coord-box {\n  width: 48px;\n  height: 22px;\n  line-height: 18px;\n  text-align: center;\n  font-weight: 700;\n  font-size: 11px;\n  padding: 1px 3px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  background: rgba(125, 125, 125, 0.05);\n}\n.active-col-chip {\n  background: var(--primary-soft);\n  color: var(--primary);\n  padding: 1px 6px;\n  height: 20px;\n  line-height: 17px;\n  border-radius: 4px;\n  font-size: 10.5px;\n  font-weight: 600;\n  white-space: nowrap;\n  max-width: 170px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.formula-input {\n  flex-grow: 1;\n  height: 22px;\n  padding: 2px 7px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 11.5px;\n  font-family: inherit;\n  outline: none;\n  background: var(--surface);\n  color: var(--text);\n}\n.formula-input:focus { border-color: var(--primary); }\n\n.formula-bar-right-area {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n  margin-left: 4px;\n}\n\n.formula-search-field {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 175px;\n\n  .search-ico {\n    position: absolute;\n    left: 7px;\n    font-size: 9.5px;\n    color: var(--text-muted);\n    pointer-events: none;\n  }\n\n  .formula-search-inp {\n    width: 100%;\n    height: 22px;\n    padding: 2px 20px 2px 22px;\n    font-size: 10.5px;\n    border-radius: 4px;\n    border: 1px solid var(--surface-border);\n    background: var(--surface);\n    color: var(--text);\n    outline: none;\n    transition: border-color 0.12s ease;\n\n    &:focus {\n      border-color: var(--primary);\n    }\n  }\n\n  .clear-btn-inline {\n    position: absolute;\n    right: 5px;\n    background: transparent;\n    border: none;\n    font-size: 9px;\n    cursor: pointer;\n    color: var(--text-muted);\n  }\n\n  .spin-inline {\n    position: absolute;\n    right: 5px;\n    font-size: 9px;\n    color: var(--primary);\n  }\n}\n\n.formula-record-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 1px 7px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--text-muted);\n  height: 22px;\n  white-space: nowrap;\n}\n.control-settings-bar {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  flex-shrink: 0;\n  font-size: 11px;\n}\n.ctrl-bar-left, .ctrl-bar-right {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.ctrl-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 8px;\n  height: 23px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text-muted);\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n\n  i {\n    font-size: 10px;\n  }\n}\n.ctrl-btn:hover {\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text);\n}\n.ctrl-btn.active {\n  color: var(--primary);\n  background: var(--primary-soft);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.ctrl-btn-danger {\n  color: var(--danger);\n  background: var(--danger-soft);\n  border-color: rgba(239, 68, 68, 0.3);\n}\n.ctrl-btn-danger:hover {\n  background: rgba(239, 68, 68, 0.2);\n}\n.ctrl-dot {\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  background: #10b981;\n  display: inline-block;\n}\n.ctrl-search-wrap {\n  position: relative;\n  display: flex;\n  align-items: center;\n  flex-grow: 1;\n  max-width: 420px;\n}\n.ctrl-search-icon {\n  position: absolute;\n  left: 8px;\n  color: var(--text-muted);\n  font-size: 10px;\n  pointer-events: none;\n}\n.ctrl-search-input {\n  width: 100%;\n  height: 23px;\n  padding: 2px 24px 2px 24px;\n  border: 1px solid var(--surface-border);\n  border-radius: 999px;\n  font-size: 11px;\n  background: rgba(125, 125, 125, 0.05);\n  color: var(--text);\n  outline: none;\n  transition: all 0.15s;\n}\n.ctrl-search-input:focus {\n  border-color: var(--primary);\n  background: var(--surface);\n  box-shadow: 0 0 0 2px var(--primary-soft);\n}\n.ctrl-search-clear {\n  position: absolute;\n  right: 6px;\n  background: none;\n  border: none;\n  font-size: 10px;\n  color: var(--text-muted);\n  cursor: pointer;\n  padding: 1px 4px;\n  border-radius: 50%;\n}\n.ctrl-search-clear:hover {\n  color: var(--danger);\n  background: rgba(125, 125, 125, 0.15);\n}\n.ctrl-search-spinner {\n  position: absolute;\n  right: 24px;\n  color: var(--primary);\n  font-size: 10px;\n}\n.ctrl-record-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 1px 7px;\n  height: 21px;\n  border-radius: 999px;\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text-muted);\n  font-size: 10px;\n  font-weight: 600;\n  white-space: nowrap;\n\n  i {\n    font-size: 10px;\n  }\n}\n\n/* 4. STATUS & BATCH SUGGESTION STRIP */\n.status-strip {\n  padding: 3px 14px;\n  font-size: 11.5px;\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  background: rgba(125, 125, 125, 0.04);\n}\n.status-strip.strip-error { background: #fef2f2; color: #991b1b; }\n.status-strip.strip-clean { background: #f0fdf4; color: #166534; }\n.status-strip.strip-suggestion { background: #fffbeb; color: #92400e; }\n\n/* 5. SPREADSHEET CANVAS */\n.spreadsheet-canvas {\n  flex-grow: 1;\n  overflow: hidden;\n  background: var(--surface);\n  position: relative;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n\n  sutram-grid {\n    display: block;\n    width: 100%;\n    height: 100%;\n    flex: 1;\n    min-height: 0;\n  }\n}\n\n/* 6. BOTTOM MULTI-SHEET TAB BAR & STATUS BAR */\n.studio-footer {\n  flex-shrink: 0;\n  background: var(--surface);\n  border-top: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n}\n.sheet-tabs-bar {\n  display: flex;\n  align-items: center;\n  background: rgba(125, 125, 125, 0.05);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 2px 6px;\n  overflow-x: auto;\n  scrollbar-width: none;\n}\n.sheet-tabs-bar::-webkit-scrollbar { display: none; }\n\n.tab-pill {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 12px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11.5px;\n  font-weight: 600;\n  cursor: pointer;\n  color: var(--text-muted);\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  white-space: nowrap;\n  transition: all 0.15s;\n}\n.tab-pill:hover {\n  background: rgba(125, 125, 125, 0.1);\n  color: var(--text);\n}\n.tab-pill.active-tab {\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-color: rgba(16, 185, 129, 0.25);\n  border-bottom: 2px solid #10b981;\n  font-weight: 700;\n}\n\n.sheet-tab-badge {\n  font-size: 9.5px;\n  padding: 1px 5px;\n  background: rgba(16, 185, 129, 0.2);\n  color: #059669;\n  border-radius: 999px;\n  font-weight: 700;\n}\n\n.add-tab-btn {\n  padding: 2px 8px;\n  border: 1px dashed rgba(125, 125, 125, 0.4);\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  color: var(--primary);\n  margin-left: 4px;\n}\n.add-tab-btn:hover { background: rgba(79, 70, 229, 0.1); }\n\n.sheet-tab-rough-badge {\n  font-size: 9px;\n  padding: 1px 4px;\n  background: rgba(245, 158, 11, 0.2);\n  color: #d97706;\n  border-radius: 3px;\n  font-weight: 700;\n  text-transform: uppercase;\n}\n\n.tab-close-btn {\n  margin-left: 3px;\n  width: 15px;\n  height: 15px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted);\n  border-radius: 3px;\n  cursor: pointer;\n  font-size: 9.5px;\n  line-height: 1;\n  padding: 0;\n  transition: all 0.12s;\n\n  &:hover {\n    background: rgba(239, 68, 68, 0.18);\n    color: #ef4444;\n  }\n}\n\n.tab-edit-btn {\n  margin-left: 2px;\n  width: 15px;\n  height: 15px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted);\n  border-radius: 3px;\n  cursor: pointer;\n  padding: 0;\n  opacity: 0.5;\n  transition: all 0.12s;\n\n  &:hover {\n    opacity: 1;\n    background: rgba(59, 130, 246, 0.15);\n    color: var(--primary, #3b82f6);\n  }\n}\n\n.tab-inline-rename-input {\n  font-size: 11px;\n  font-weight: 600;\n  padding: 1px 5px;\n  height: 19px;\n  min-width: 70px;\n  max-width: 160px;\n  border: 1px solid var(--primary, #3b82f6);\n  border-radius: 3px;\n  background: var(--surface-card, #ffffff);\n  color: var(--text, #1e293b);\n  outline: none;\n  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);\n}\n\n.tab-context-menu {\n  position: fixed;\n  z-index: 9999;\n  background: var(--surface-card, #ffffff);\n  border: 1px solid var(--surface-border, rgba(125, 125, 125, 0.25));\n  border-radius: 6px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);\n  min-width: 175px;\n  padding: 4px;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.tab-context-menu-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 10px;\n  font-size: 11.5px;\n  font-weight: 500;\n  color: var(--text);\n  border-radius: 4px;\n  cursor: pointer;\n  user-select: none;\n  transition: background 0.12s;\n\n  i {\n    font-size: 12px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.12);\n  }\n\n  &.text-danger:hover {\n    background: rgba(239, 68, 68, 0.12);\n  }\n}\n\n.bottom-status-subrow {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 3px 14px;\n  font-size: 11px;\n  color: var(--text-muted);\n}\n.zoom-controls {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  padding: 1px 4px;\n}\n.zoom-btn {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  color: var(--text);\n  padding: 1px 5px;\n  font-size: 11px;\n}\n.zoom-display {\n  font-weight: 700;\n  cursor: pointer;\n  padding: 0 4px;\n}\n\n/* 7. FLOATING SYNC TOAST HUD */\n.sync-toast-hud {\n  position: fixed;\n  top: 50px;\n  right: 20px;\n  z-index: 2500;\n  min-width: 320px;\n  max-width: 440px;\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);\n  overflow: hidden;\n  animation: toastSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);\n  font-size: 11.5px;\n}\n@keyframes toastSlideIn {\n  from { opacity: 0; transform: translateY(-12px) scale(0.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n.sync-toast-header {\n  padding: 8px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--surface-border);\n  background: rgba(125, 125, 125, 0.04);\n}\n.sync-toast-title {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-weight: 700;\n  font-size: 12px;\n}\n.sync-toast-close {\n  background: none;\n  border: none;\n  color: var(--text-muted);\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 5px;\n  border-radius: 3px;\n}\n.sync-toast-close:hover {\n  background: rgba(125, 125, 125, 0.12);\n  color: var(--text);\n}\n.sync-toast-body {\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.sync-toast-stats {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.sync-badge-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n}\n.chip-success {\n  background: var(--success-soft);\n  color: var(--success);\n}\n.chip-info {\n  background: var(--primary-soft);\n  color: var(--primary);\n}\n.chip-warning {\n  background: var(--warning-soft);\n  color: #b45309;\n}\n.chip-danger {\n  background: var(--danger-soft);\n  color: var(--danger);\n}\n.sync-toast-errors {\n  margin-top: 4px;\n  padding: 6px 8px;\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.2);\n  border-radius: 4px;\n  font-size: 10.5px;\n  color: #ef4444;\n  max-height: 140px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n\n/* Last Sync Status in Bottom Bar */\n.last-sync-badge {\n  display: inline-flex;\n  align-items: center;\n  padding: 1px 7px;\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-radius: 4px;\n  font-weight: 600;\n  font-size: 10.5px;\n  border: 1px solid rgba(16, 185, 129, 0.25);\n\n  &.sync-error {\n    background: rgba(239, 68, 68, 0.12);\n    color: #ef4444;\n    border-color: rgba(239, 68, 68, 0.25);\n  }\n}\n\n/* Live Progress Bar inside Toast */\n.sync-progress-wrap {\n  width: 100%;\n}\n.sync-progress-track {\n  width: 100%;\n  height: 6px;\n  background: rgba(125, 125, 125, 0.2);\n  border-radius: 999px;\n  overflow: hidden;\n}\n.sync-progress-bar {\n  height: 100%;\n  background: linear-gradient(90deg, #3b82f6, #10b981);\n  border-radius: 999px;\n  transition: width 0.2s ease-in-out;\n}\n\n/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n * Instant Column Configuration Dropdown Menu (Replicating Legacy Studio)\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n::ng-deep .sutram-col-config-popover {\n  width: 340px !important;\n  height: 500px !important;\n  max-height: calc(100vh - 120px) !important;\n  font-size: 11.5px;\n  border-radius: 8px !important;\n  overflow: hidden !important;\n  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1) !important;\n  border: 1px solid var(--surface-border, #e2e8f0) !important;\n  background: var(--surface, #ffffff) !important;\n  color: var(--text, #0f172a) !important;\n  display: flex !important;\n  flex-direction: column !important;\n\n  .p-overlaypanel-content {\n    padding: 0 !important;\n    background: transparent !important;\n    color: inherit !important;\n    width: 100% !important;\n    height: 100% !important;\n    display: flex !important;\n    flex-direction: column !important;\n    flex: 1 1 auto !important;\n    min-height: 0 !important;\n    overflow: hidden !important;\n  }\n}\n\n.col-dropdown-menu {\n  width: 100% !important;\n  height: 100% !important;\n  max-height: none !important;\n  background: var(--surface, #ffffff);\n  color: var(--text, #0f172a);\n  border-radius: 8px;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  flex: 1 1 auto;\n  min-height: 0;\n  user-select: none;\n\n  .col-dd-header {\n    padding: 8px 10px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n    background: rgba(125, 125, 125, 0.03);\n    flex-shrink: 0 !important;\n  }\n\n  .col-dd-search-wrap {\n    position: relative;\n    display: flex;\n    align-items: center;\n\n    .col-dd-search-icon {\n      position: absolute;\n      left: 8px;\n      color: var(--text-muted, #64748b);\n      font-size: 11px;\n      pointer-events: none;\n    }\n\n    .col-dd-search-input {\n      width: 100%;\n      height: 28px;\n      padding: 4px 26px;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      border-radius: 4px;\n      font-size: 11.5px;\n      background: var(--bg, #f8fafc);\n      color: var(--text, #0f172a);\n      outline: none;\n      transition: border-color 0.12s;\n\n      &:focus {\n        border-color: var(--primary, #4f46e5);\n      }\n    }\n\n    .btn-clear-search-inline {\n      position: absolute;\n      right: 8px;\n      background: transparent;\n      border: none;\n      color: var(--text-muted, #64748b);\n      cursor: pointer;\n      font-size: 11px;\n      padding: 0;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n\n      &:hover {\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .col-dd-actions {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0 2px;\n\n    .col-dd-actions-left {\n      display: flex;\n      gap: 4px;\n    }\n\n    .col-dd-act-btn {\n      padding: 2px 7px;\n      font-size: 10.5px;\n      font-weight: 600;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      background: var(--surface, #ffffff);\n      color: var(--text-muted, #64748b);\n      border-radius: 3px;\n      cursor: pointer;\n      transition: all 0.12s;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n        color: var(--text, #0f172a);\n      }\n    }\n\n    .col-dd-count {\n      font-size: 10.5px;\n      color: var(--text-muted, #64748b);\n      font-weight: 600;\n    }\n  }\n\n  .col-dd-body {\n    padding: 6px 8px;\n    overflow-y: auto !important;\n    overflow-x: hidden !important;\n    flex: 1 1 0 !important;\n    min-height: 0 !important;\n    max-height: none !important;\n    display: flex;\n    flex-direction: column;\n    gap: 3px;\n    overscroll-behavior: contain;\n    scrollbar-width: thin;\n\n    &::-webkit-scrollbar {\n      width: 5px;\n    }\n    &::-webkit-scrollbar-track {\n      background: rgba(125, 125, 125, 0.05);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb {\n      background: rgba(125, 125, 125, 0.3);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb:hover {\n      background: var(--primary, #4f46e5);\n    }\n  }\n\n  .col-dd-section-title {\n    font-size: 10px;\n    font-weight: 700;\n    color: var(--text-muted, #64748b);\n    margin: 3px 0 2px 4px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    flex-shrink: 0 !important;\n  }\n\n  .col-dd-item {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 4px 6px;\n    border-radius: 4px;\n    cursor: pointer;\n    user-select: none;\n    transition: background 0.1s;\n    font-size: 11.5px;\n    color: var(--text, #0f172a);\n    flex-shrink: 0 !important;\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.08);\n    }\n\n    .col-dd-item-left {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .col-dd-item-name {\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n  }\n\n  .custom-check {\n    width: 14px;\n    height: 14px;\n    cursor: pointer;\n    accent-color: var(--primary, #4f46e5);\n    margin: 0;\n    flex-shrink: 0;\n  }\n\n  .type-badge {\n    font-size: 9.5px;\n    padding: 1px 5px;\n    border-radius: 3px;\n    background: rgba(125, 125, 125, 0.12);\n    color: var(--text-muted, #64748b);\n    font-family: 'JetBrains Mono', monospace;\n    flex-shrink: 0;\n  }\n\n  /* FK Grouping */\n  .col-dd-group {\n    border: 1px solid var(--surface-border, #e2e8f0);\n    border-radius: 5px;\n    margin: 3px 0;\n    overflow: hidden;\n    background: rgba(125, 125, 125, 0.02);\n    flex-shrink: 0 !important;\n\n    &.fk-active-group {\n      border-color: rgba(79, 70, 229, 0.35);\n    }\n\n    .col-dd-group-header {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      padding: 5px 8px;\n      background: rgba(125, 125, 125, 0.06);\n      cursor: pointer;\n      user-select: none;\n      font-size: 11.5px;\n      font-weight: 600;\n      flex-shrink: 0 !important;\n      min-height: 28px !important;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n      }\n\n      .col-dd-group-left {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        overflow: hidden;\n      }\n\n      .fk-expand-toggle {\n        font-size: 10px;\n        color: var(--text-muted, #64748b);\n        width: 12px;\n        text-align: center;\n        transition: transform 0.18s ease;\n\n        &.rotated {\n          transform: rotate(90deg);\n        }\n      }\n\n      .fk-group-pill {\n        font-size: 9.5px;\n        padding: 1px 5px;\n        border-radius: 999px;\n        font-weight: 600;\n      }\n    }\n\n    .col-dd-group-items {\n      padding: 3px 4px 4px 18px;\n      background: var(--surface, #ffffff);\n      border-top: 1px solid var(--surface-border, #e2e8f0);\n      display: flex;\n      flex-direction: column;\n      gap: 2px;\n      max-height: none !important;\n      overflow: visible !important;\n    }\n  }\n\n  .col-dd-empty {\n    padding: 16px;\n    text-align: center;\n    color: var(--text-muted, #64748b);\n    font-size: 11.5px;\n  }\n\n  .col-dd-footer {\n    padding: 6px 10px;\n    border-top: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    background: rgba(125, 125, 125, 0.03);\n    flex-shrink: 0 !important;\n  }\n}\n\n\n\n"] }]
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
        }], fileInputRef: [{
            type: ViewChild,
            args: ['fileInput']
        }], onStudioGlobalClick: [{
            type: HostListener,
            args: ['document:click', ['$event']]
        }], onStudioGlobalKeydown: [{
            type: HostListener,
            args: ['document:keydown', ['$event']]
        }] }); })();
