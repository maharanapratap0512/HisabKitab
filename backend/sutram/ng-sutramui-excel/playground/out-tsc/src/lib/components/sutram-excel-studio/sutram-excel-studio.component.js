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
import * as i9 from "primeng/dropdown";
import * as i10 from "primeng/button";
import * as i11 from "primeng/inputtext";
import * as i12 from "primeng/dialog";
import * as i13 from "primeng/overlaypanel";
import * as i14 from "primeng/checkbox";
import * as i15 from "../sutram-grid/sutram-grid.component";
import * as i16 from "../sutram-header-scanner/sutram-header-scanner.component";
import * as i17 from "../sutram-correction-sidebar/sutram-correction-sidebar.component";
const _c0 = ["grid"];
const _c1 = ["fileInput"];
function SutramExcelStudioComponent_div_34_Template(rf, ctx) { if (rf & 1) {
    const _r37 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 114)(1, "button", 115);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_34_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r37); const ctx_r36 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r36.setStudioMode("normal")); });
    i0.ɵɵelement(2, "i", 116);
    i0.ɵɵtext(3, " Normal ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 115);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_34_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r37); const ctx_r38 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r38.setStudioMode("intelligent")); });
    i0.ɵɵelement(5, "i", 117);
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
    const _r40 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 118);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_button_35_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r40); const ctx_r39 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r39.saveRoughSheetLocally()); });
    i0.ɵɵelement(1, "i", 119);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "Save");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("title", ctx_r1.isCurrentSheetReport ? "Save report locally (Ctrl+S)" : "Save sheet locally (Ctrl+S)");
} }
function SutramExcelStudioComponent_button_36_span_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 123);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r41 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(ctx_r41.state.pendingChangesCount());
} }
function SutramExcelStudioComponent_button_36_Template(rf, ctx) { if (rf & 1) {
    const _r43 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 120);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_button_36_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r43); const ctx_r42 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r42.startImport()); });
    i0.ɵɵelement(1, "i", 121);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "Sync DB");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_button_36_span_4_Template, 2, 1, "span", 122);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("has-pending", ctx_r2.state.pendingChangesCount() > 0);
    i0.ɵɵproperty("disabled", ctx_r2.state.pendingChangesCount() === 0 || ctx_r2.state.hasErrors());
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngIf", ctx_r2.state.pendingChangesCount() > 0);
} }
function SutramExcelStudioComponent_div_46_button_24_Template(rf, ctx) { if (rf & 1) {
    const _r47 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 151);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_46_button_24_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r47); const ctx_r46 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r46.onRefreshData()); });
    i0.ɵɵelement(1, "i", 152);
    i0.ɵɵelementStart(2, "span", 129);
    i0.ɵɵtext(3, "Refresh");
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_div_46_Template(rf, ctx) { if (rf & 1) {
    const _r49 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 124)(1, "div", 125)(2, "div", 126)(3, "button", 127);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_46_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r49); const ctx_r48 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r48.toggleBold()); });
    i0.ɵɵelementStart(4, "span", 128);
    i0.ɵɵtext(5, "B");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 129);
    i0.ɵɵtext(7, "Bold");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 130)(9, "button", 131);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_46_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r49); const ctx_r50 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r50.setTextAlign("left")); });
    i0.ɵɵelement(10, "i", 132);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 133);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_46_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r49); const ctx_r51 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r51.setTextAlign("center")); });
    i0.ɵɵelement(12, "i", 134);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 135);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_46_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r49); const ctx_r52 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r52.setTextAlign("right")); });
    i0.ɵɵelement(14, "i", 136);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "button", 137);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_46_Template_button_click_15_listener($event) { i0.ɵɵrestoreView(_r49); i0.ɵɵnextContext(); const _r10 = i0.ɵɵreference(66); return i0.ɵɵresetView(_r10.toggle($event)); });
    i0.ɵɵelement(16, "i", 138);
    i0.ɵɵelementStart(17, "span", 129);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(19, "span", 139);
    i0.ɵɵtext(20, "Format");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(21, "div", 140);
    i0.ɵɵelementStart(22, "div", 125)(23, "div", 126);
    i0.ɵɵtemplate(24, SutramExcelStudioComponent_div_46_button_24_Template, 4, 0, "button", 141);
    i0.ɵɵelementStart(25, "button", 142);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_46_Template_button_click_25_listener() { i0.ɵɵrestoreView(_r49); const ctx_r54 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r54.openFileManager()); });
    i0.ɵɵelement(26, "i", 143);
    i0.ɵɵelementStart(27, "span", 129);
    i0.ɵɵtext(28, "Open File");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "input", 144, 145);
    i0.ɵɵlistener("change", function SutramExcelStudioComponent_div_46_Template_input_change_29_listener($event) { i0.ɵɵrestoreView(_r49); const ctx_r55 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r55.onFileUpload($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "button", 146);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_46_Template_button_click_31_listener() { i0.ɵɵrestoreView(_r49); const ctx_r56 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r56.exportExcel()); });
    i0.ɵɵelement(32, "i", 21);
    i0.ɵɵelementStart(33, "span", 129);
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(35, "span", 139);
    i0.ɵɵtext(36, "Data");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(37, "div", 140);
    i0.ɵɵelementStart(38, "div", 125)(39, "div", 126)(40, "button", 147);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_46_Template_button_click_40_listener() { i0.ɵɵrestoreView(_r49); const ctx_r57 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r57.state.toggleFiltersEnabled()); });
    i0.ɵɵelement(41, "i", 148);
    i0.ɵɵelementStart(42, "span", 129);
    i0.ɵɵtext(43, "Filters");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(44, "button", 149);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_46_Template_button_click_44_listener() { i0.ɵɵrestoreView(_r49); const ctx_r58 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r58.state.toggleSortingEnabled()); });
    i0.ɵɵelement(45, "i", 150);
    i0.ɵɵelementStart(46, "span", 129);
    i0.ɵɵtext(47, "Sorting");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(48, "span", 139);
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
function SutramExcelStudioComponent_div_47_button_4_Template(rf, ctx) { if (rf & 1) {
    const _r62 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 159);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_47_button_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r62); const ctx_r61 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r61.tableSearchQuery = ""); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_47_div_6_span_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 166);
} }
function SutramExcelStudioComponent_div_47_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r66 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 160);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_47_div_6_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r66); const tbl_r63 = restoredCtx.$implicit; const ctx_r65 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r65.openTableInSheet(tbl_r63.table)); });
    i0.ɵɵelementStart(1, "button", 161);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_47_div_6_Template_button_click_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r66); const tbl_r63 = restoredCtx.$implicit; const ctx_r67 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r67.toggleFavoriteTable(tbl_r63.table, $event)); });
    i0.ɵɵelement(2, "i", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 162);
    i0.ɵɵelement(4, "i", 6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 163)(6, "span", 164);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(8, SutramExcelStudioComponent_div_47_div_6_span_8_Template, 1, 0, "span", 165);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tbl_r63 = ctx.$implicit;
    const ctx_r60 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("active-box", ctx_r60.isTableOpen(tbl_r63.table));
    i0.ɵɵproperty("title", tbl_r63.display_name ? tbl_r63.display_name + " (" + tbl_r63.table + ")" : tbl_r63.table);
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("starred", ctx_r60.favoriteTables.has(tbl_r63.table));
    i0.ɵɵproperty("title", ctx_r60.favoriteTables.has(tbl_r63.table) ? "Remove favorite" : "Add to startup sheets");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ctx_r60.favoriteTables.has(tbl_r63.table) ? "pi-star-fill" : "pi-star");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(tbl_r63.display_name || tbl_r63.table);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r60.isTableOpen(tbl_r63.table));
} }
function SutramExcelStudioComponent_div_47_Template(rf, ctx) { if (rf & 1) {
    const _r69 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 153)(1, "div", 154);
    i0.ɵɵelement(2, "i", 35);
    i0.ɵɵelementStart(3, "input", 155);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_47_Template_input_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r69); const ctx_r68 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r68.tableSearchQuery = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_47_button_4_Template, 2, 0, "button", 156);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 157);
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_div_47_div_6_Template, 9, 9, "div", 158);
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
function SutramExcelStudioComponent_div_48_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 170);
    i0.ɵɵelement(1, "i", 171);
    i0.ɵɵelementStart(2, "span", 172);
    i0.ɵɵtext(3, "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0915\u094B\u0908 \u0930\u093F\u092A\u094B\u0930\u094D\u091F \u092F\u093E \u0935\u094D\u092F\u0942 \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948 (No dynamic reports or views in database)");
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_div_48_div_2_button_3_Template(rf, ctx) { if (rf & 1) {
    const _r75 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 159);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_48_div_2_button_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r75); const ctx_r74 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r74.reportSearchQuery = ""); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_48_div_2_Template(rf, ctx) { if (rf & 1) {
    const _r77 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 154);
    i0.ɵɵelement(1, "i", 35);
    i0.ɵɵelementStart(2, "input", 173);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_48_div_2_Template_input_ngModelChange_2_listener($event) { i0.ɵɵrestoreView(_r77); const ctx_r76 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r76.reportSearchQuery = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_div_48_div_2_button_3_Template, 2, 0, "button", 156);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r71 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", ctx_r71.reportSearchQuery);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r71.reportSearchQuery);
} }
function SutramExcelStudioComponent_div_48_div_3_div_1_span_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 166);
} }
function SutramExcelStudioComponent_div_48_div_3_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r82 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 175);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_48_div_3_div_1_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r82); const rep_r79 = restoredCtx.$implicit; const ctx_r81 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r81.openReportInSheet(rep_r79)); });
    i0.ɵɵelementStart(1, "button", 161);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_48_div_3_div_1_Template_button_click_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r82); const rep_r79 = restoredCtx.$implicit; const ctx_r83 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r83.toggleFavoriteReport(rep_r79.id, $event)); });
    i0.ɵɵelement(2, "i", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 176);
    i0.ɵɵelement(4, "i", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 163)(6, "span", 164);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(8, SutramExcelStudioComponent_div_48_div_3_div_1_span_8_Template, 1, 0, "span", 165);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const rep_r79 = ctx.$implicit;
    const ctx_r78 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("active-box", ctx_r78.isReportOpen(rep_r79.id));
    i0.ɵɵproperty("title", (rep_r79.display_name || rep_r79.title || rep_r79.table || rep_r79.id) + " \u2014 " + (rep_r79.desc || ""));
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("starred", ctx_r78.favoriteReports.has(rep_r79.id));
    i0.ɵɵproperty("title", ctx_r78.favoriteReports.has(rep_r79.id) ? "Remove favorite" : "Add to startup sheets");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ctx_r78.favoriteReports.has(rep_r79.id) ? "pi-star-fill" : "pi-star");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", rep_r79.icon || "pi-chart-bar");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(rep_r79.display_name || rep_r79.title || rep_r79.table || rep_r79.id);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r78.isReportOpen(rep_r79.id));
} }
function SutramExcelStudioComponent_div_48_div_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 157);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_div_48_div_3_div_1_Template, 9, 10, "div", 174);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r72 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", ctx_r72.filteredReports);
} }
function SutramExcelStudioComponent_div_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 153);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_div_48_div_1_Template, 4, 0, "div", 167);
    i0.ɵɵtemplate(2, SutramExcelStudioComponent_div_48_div_2_Template, 4, 2, "div", 168);
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_div_48_div_3_Template, 2, 1, "div", 169);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !ctx_r5.reportsList || ctx_r5.reportsList.length === 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r5.reportsList && ctx_r5.reportsList.length > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r5.reportsList && ctx_r5.reportsList.length > 0);
} }
function SutramExcelStudioComponent_div_49_div_10_Template(rf, ctx) { if (rf & 1) {
    const _r88 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 125)(1, "div", 126)(2, "button", 189);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_49_div_10_Template_button_click_2_listener($event) { i0.ɵɵrestoreView(_r88); i0.ɵɵnextContext(2); const _r10 = i0.ɵɵreference(66); return i0.ɵɵresetView(_r10.toggle($event)); });
    i0.ɵɵelement(3, "i", 190);
    i0.ɵɵelementStart(4, "span", 129);
    i0.ɵɵtext(5, "Columns");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(6, "span", 139);
    i0.ɵɵtext(7, "DISPLAY");
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_div_49_div_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 140);
} }
function SutramExcelStudioComponent_div_49_div_12_Template(rf, ctx) { if (rf & 1) {
    const _r90 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 125)(1, "div", 126)(2, "button", 191);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_49_div_12_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r90); const ctx_r89 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r89.isAdmin ? ctx_r89.openUiSutrasModal() : null); });
    i0.ɵɵelement(3, "i", 192);
    i0.ɵɵelementStart(4, "span", 129);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 191);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_49_div_12_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r90); const ctx_r91 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r91.isAdmin ? ctx_r91.openBackendSutrasModal() : null); });
    i0.ɵɵelement(7, "i", 12);
    i0.ɵɵelementStart(8, "span", 129);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "span", 139);
    i0.ɵɵtext(11, "TRIGGERS");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r86 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("btn-disabled-role", !ctx_r86.isAdmin);
    i0.ɵɵproperty("disabled", !ctx_r86.isAdmin)("title", ctx_r86.isAdmin ? "UI Trigger: Reactive cell formulas & custom client logic" : "UI Triggers require Admin role");
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("color", ctx_r86.isAdmin ? "#06b6d4" : "#94a3b8");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("UI ", !ctx_r86.isAdmin ? "\uD83D\uDD12" : "", "");
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("btn-disabled-role", !ctx_r86.isAdmin);
    i0.ɵɵproperty("disabled", !ctx_r86.isAdmin)("title", ctx_r86.isAdmin ? "DB Trigger: Server triggers, Raw SQL & database cascades" : "DB Triggers require Admin role");
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("color", ctx_r86.isAdmin ? "#f59e0b" : "#94a3b8");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("DB ", !ctx_r86.isAdmin ? "\uD83D\uDD12" : "", "");
} }
function SutramExcelStudioComponent_div_49_Template(rf, ctx) { if (rf & 1) {
    const _r93 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 124)(1, "div", 125)(2, "div", 177)(3, "div", 178);
    i0.ɵɵelement(4, "i", 21);
    i0.ɵɵelementStart(5, "span", 179);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(7, "span", 139);
    i0.ɵɵtext(8, "ACTIVE SHEET");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(9, "div", 140);
    i0.ɵɵtemplate(10, SutramExcelStudioComponent_div_49_div_10_Template, 8, 0, "div", 180);
    i0.ɵɵtemplate(11, SutramExcelStudioComponent_div_49_div_11_Template, 1, 0, "div", 181);
    i0.ɵɵtemplate(12, SutramExcelStudioComponent_div_49_div_12_Template, 12, 14, "div", 180);
    i0.ɵɵelement(13, "div", 140);
    i0.ɵɵelementStart(14, "div", 125)(15, "div", 126)(16, "button", 182);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_49_Template_button_click_16_listener() { i0.ɵɵrestoreView(_r93); const ctx_r92 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r92.setBooleanStyle("checkbox")); });
    i0.ɵɵelement(17, "i", 183);
    i0.ɵɵelementStart(18, "span", 129);
    i0.ɵɵtext(19, "Checkbox");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "button", 184);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_49_Template_button_click_20_listener() { i0.ɵɵrestoreView(_r93); const ctx_r94 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r94.setBooleanStyle("badge")); });
    i0.ɵɵelement(21, "i", 185);
    i0.ɵɵelementStart(22, "span", 129);
    i0.ɵɵtext(23, "Badge");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(24, "span", 139);
    i0.ɵɵtext(25, "BOOLEAN");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(26, "div", 140);
    i0.ɵɵelementStart(27, "div", 125)(28, "div", 126)(29, "button", 186);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_49_Template_button_click_29_listener() { i0.ɵɵrestoreView(_r93); const ctx_r95 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r95.openUserManagementModal()); });
    i0.ɵɵelement(30, "i", 187);
    i0.ɵɵelementStart(31, "span", 129);
    i0.ɵɵtext(32, "Users");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(33, "button", 188);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_49_Template_button_click_33_listener() { i0.ɵɵrestoreView(_r93); const ctx_r96 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r96.toggleRole()); });
    i0.ɵɵelement(34, "i", 21);
    i0.ɵɵelementStart(35, "span", 129);
    i0.ɵɵtext(36);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(37, "span", 139);
    i0.ɵɵtext(38, "USERS & ACCESS");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r6 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", "Active Sheet: " + ctx_r6.currentActiveSheetTitle);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ctx_r6.isCurrentSheetRough ? "pi-file" : ctx_r6.isCurrentSheetReport ? "pi-chart-bar" : "pi-table");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r6.currentActiveSheetTitle);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngIf", ctx_r6.isCurrentSheetTable);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r6.isCurrentSheetTable);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r6.isCurrentSheetTable);
    i0.ɵɵadvance(4);
    i0.ɵɵclassProp("active", ctx_r6.booleanDisplayStyle === "checkbox");
    i0.ɵɵadvance(4);
    i0.ɵɵclassProp("active", ctx_r6.booleanDisplayStyle === "badge");
    i0.ɵɵadvance(13);
    i0.ɵɵproperty("title", "Current Role: " + ctx_r6.currentUser.role + " (Click to toggle role)");
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("color", ctx_r6.isAdmin ? "#a855f7" : "#10b981");
    i0.ɵɵproperty("ngClass", ctx_r6.isAdmin ? "pi-shield" : "pi-user");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r6.isAdmin ? "Admin" : "Author");
} }
function SutramExcelStudioComponent_button_62_Template(rf, ctx) { if (rf & 1) {
    const _r98 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 193);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_button_62_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r98); const ctx_r97 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r97.clearDbSearch()); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_span_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 194);
    i0.ɵɵelement(1, "i", 195);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 196);
    i0.ɵɵelement(1, "i", 12);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", ctx_r9.state.rows().length, " / ", ctx_r9.state.totalDbRecords(), "");
} }
function SutramExcelStudioComponent_ng_template_67_button_6_Template(rf, ctx) { if (rf & 1) {
    const _r107 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 224);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_button_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r107); const ctx_r106 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r106.colSearchQuery = ""); });
    i0.ɵɵelement(1, "i", 225);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_67_ng_container_18_div_4_span_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 235);
    i0.ɵɵtext(1, "*");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_67_ng_container_18_div_4_Template(rf, ctx) { if (rf & 1) {
    const _r112 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 229);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_ng_container_18_div_4_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r112); const col_r109 = restoredCtx.$implicit; const ctx_r111 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r111.toggleColumnCheckbox(col_r109.key)); });
    i0.ɵɵelementStart(1, "div", 230);
    i0.ɵɵelement(2, "input", 231);
    i0.ɵɵelementStart(3, "span", 232);
    i0.ɵɵtext(4);
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_ng_template_67_ng_container_18_div_4_span_5_Template, 2, 0, "span", 233);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "span", 234);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r109 = ctx.$implicit;
    const ctx_r108 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r108.isColumnSelected(col_r109.key));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("title", col_r109.name);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", col_r109.name, "");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r109.not_null);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(col_r109.type || "string");
} }
function SutramExcelStudioComponent_ng_template_67_ng_container_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 226);
    i0.ɵɵelement(2, "i", 227);
    i0.ɵɵtext(3, " Standard Columns ");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_ng_template_67_ng_container_18_div_4_Template, 8, 5, "div", 228);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r100 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngForOf", ctx_r100.filteredDirectCols)("ngForTrackBy", ctx_r100.trackByColKey);
} }
function SutramExcelStudioComponent_ng_template_67_ng_container_19_div_4_span_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 243);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r114 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("(", col_r114.key, ")");
} }
function SutramExcelStudioComponent_ng_template_67_ng_container_19_div_4_Template(rf, ctx) { if (rf & 1) {
    const _r118 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 239);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_ng_container_19_div_4_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r118); const col_r114 = restoredCtx.$implicit; const ctx_r117 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r117.toggleColumnCheckbox(col_r114.key)); });
    i0.ɵɵelementStart(1, "div", 230);
    i0.ɵɵelement(2, "input", 231);
    i0.ɵɵelementStart(3, "span", 240);
    i0.ɵɵtext(4, "fx");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 232)(6, "strong");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(8, SutramExcelStudioComponent_ng_template_67_ng_container_19_div_4_span_8_Template, 2, 1, "span", 241);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "span", 242);
    i0.ɵɵtext(10, "formula");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r114 = ctx.$implicit;
    const ctx_r113 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r113.isColumnSelected(col_r114.key));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", col_r114.short_name || col_r114.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(col_r114.short_name || col_r114.name);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r114.short_name && col_r114.short_name !== col_r114.key);
} }
function SutramExcelStudioComponent_ng_template_67_ng_container_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 236);
    i0.ɵɵelement(2, "i", 237);
    i0.ɵɵtext(3, " UI Formulas & Temp (fx) ");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_ng_template_67_ng_container_19_div_4_Template, 11, 4, "div", 238);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r101 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngForOf", ctx_r101.filteredComputedCols)("ngForTrackBy", ctx_r101.trackByColKey);
} }
function SutramExcelStudioComponent_ng_template_67_ng_container_20_div_4_div_13_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r125 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 229);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_ng_container_20_div_4_div_13_div_1_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r125); const col_r123 = restoredCtx.$implicit; const ctx_r124 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r124.toggleColumnCheckbox(col_r123.key)); });
    i0.ɵɵelementStart(1, "div", 230);
    i0.ɵɵelement(2, "input", 231);
    i0.ɵɵelementStart(3, "span", 232);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "span", 234);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r123 = ctx.$implicit;
    const ctx_r122 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r122.isColumnSelected(col_r123.key));
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("font-weight", col_r123.is_fk_main ? "600" : "normal");
    i0.ɵɵproperty("title", col_r123.name);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", col_r123.short_name || col_r123.name, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(col_r123.is_fk_main ? "display" : col_r123.is_fk_raw ? "id" : col_r123.type || "string");
} }
function SutramExcelStudioComponent_ng_template_67_ng_container_20_div_4_div_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 257);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_ng_template_67_ng_container_20_div_4_div_13_div_1_Template, 7, 6, "div", 228);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const grp_r120 = i0.ɵɵnextContext().$implicit;
    const ctx_r121 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", grp_r120.columns)("ngForTrackBy", ctx_r121.trackByColKey);
} }
function SutramExcelStudioComponent_ng_template_67_ng_container_20_div_4_Template(rf, ctx) { if (rf & 1) {
    const _r128 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 247)(1, "div", 248)(2, "div", 249);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_ng_container_20_div_4_Template_div_click_2_listener() { const restoredCtx = i0.ɵɵrestoreView(_r128); const grp_r120 = restoredCtx.$implicit; const ctx_r127 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r127.toggleFkGroupExpand(grp_r120.name)); });
    i0.ɵɵelement(3, "i", 250);
    i0.ɵɵelementStart(4, "span", 251)(5, "strong", 252);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 253);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "div", 254);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_ng_container_20_div_4_Template_div_click_9_listener() { const restoredCtx = i0.ɵɵrestoreView(_r128); const grp_r120 = restoredCtx.$implicit; const ctx_r129 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r129.toggleFkGroupAll(grp_r120.name)); });
    i0.ɵɵelement(10, "input", 231);
    i0.ɵɵelementStart(11, "span", 255);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(13, SutramExcelStudioComponent_ng_template_67_ng_container_20_div_4_div_13_Template, 2, 2, "div", 256);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const grp_r120 = ctx.$implicit;
    const ctx_r119 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("fk-active-group", grp_r120.selectedCount > 0);
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("rotated", ctx_r119.isFkGroupExpanded(grp_r120.name));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(grp_r120.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("(", grp_r120.refTable, ")");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", grp_r120.isAllChecked);
    i0.ɵɵadvance(1);
    i0.ɵɵstyleProp("background", grp_r120.selectedCount > 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(125, 125, 125, 0.1)")("color", grp_r120.selectedCount > 0 ? "#059669" : "var(--text-muted)");
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate2(" ", grp_r120.selectedCount, "/", grp_r120.totalCount, " ");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r119.isFkGroupExpanded(grp_r120.name));
} }
function SutramExcelStudioComponent_ng_template_67_ng_container_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 244);
    i0.ɵɵelement(2, "i", 245);
    i0.ɵɵtext(3, " FK Reference Groups ");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_ng_template_67_ng_container_20_div_4_Template, 14, 14, "div", 246);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r102 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngForOf", ctx_r102.filteredFkGroups)("ngForTrackBy", ctx_r102.trackByGroupName);
} }
function SutramExcelStudioComponent_ng_template_67_div_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 258);
    i0.ɵɵelement(1, "i", 259);
    i0.ɵɵtext(2, " No matching columns found ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_67_div_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 258);
    i0.ɵɵelement(1, "i", 260);
    i0.ɵɵtext(2, " No columns currently visible. Select columns on the left. ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_67_div_37_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 283);
    i0.ɵɵtext(1, "\u26A1 fx");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_67_div_37_span_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 284);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r130 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("title", "FK Display: " + col_r130.ref_table);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("\uD83D\uDD17 ", col_r130.ref_table, "");
} }
function SutramExcelStudioComponent_ng_template_67_div_37_span_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 285);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r130 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("title", "FK Subcol: " + col_r130.ref_table);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("\u21B3 ", col_r130.sub_col_name, "");
} }
function SutramExcelStudioComponent_ng_template_67_div_37_span_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 286);
    i0.ɵɵtext(1, "# id");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_67_div_37_span_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 287);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r130 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(col_r130.type || "text");
} }
function SutramExcelStudioComponent_ng_template_67_div_37_div_21_option_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 292);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r144 = ctx.$implicit;
    i0.ɵɵproperty("value", opt_r144.value);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(opt_r144.label);
} }
function SutramExcelStudioComponent_ng_template_67_div_37_div_21_Template(rf, ctx) { if (rf & 1) {
    const _r147 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 288)(1, "select", 289);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_ng_template_67_div_37_div_21_Template_select_ngModelChange_1_listener($event) { i0.ɵɵrestoreView(_r147); const col_r130 = i0.ɵɵnextContext().$implicit; return i0.ɵɵresetView(col_r130.display_format = $event); })("ngModelChange", function SutramExcelStudioComponent_ng_template_67_div_37_div_21_Template_select_ngModelChange_1_listener() { i0.ɵɵrestoreView(_r147); const col_r130 = i0.ɵɵnextContext().$implicit; const ctx_r148 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r148.onColumnFormatChange(col_r130)); });
    i0.ɵɵelementStart(2, "option", 290);
    i0.ɵɵtext(3, "Default Date");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_ng_template_67_div_37_div_21_option_4_Template, 2, 2, "option", 291);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r130 = i0.ɵɵnextContext().$implicit;
    const ctx_r137 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngModel", col_r130.display_format);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngValue", null);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r137.dateFormatOptions);
} }
function SutramExcelStudioComponent_ng_template_67_div_37_div_22_option_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 292);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r152 = ctx.$implicit;
    i0.ɵɵproperty("value", opt_r152.value);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(opt_r152.label);
} }
function SutramExcelStudioComponent_ng_template_67_div_37_div_22_Template(rf, ctx) { if (rf & 1) {
    const _r155 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 288)(1, "select", 293);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_ng_template_67_div_37_div_22_Template_select_ngModelChange_1_listener($event) { i0.ɵɵrestoreView(_r155); const col_r130 = i0.ɵɵnextContext().$implicit; return i0.ɵɵresetView(col_r130.display_format = $event); })("ngModelChange", function SutramExcelStudioComponent_ng_template_67_div_37_div_22_Template_select_ngModelChange_1_listener() { i0.ɵɵrestoreView(_r155); const col_r130 = i0.ɵɵnextContext().$implicit; const ctx_r156 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r156.onColumnFormatChange(col_r130)); });
    i0.ɵɵelementStart(2, "option", 290);
    i0.ɵɵtext(3, "Raw Number");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_ng_template_67_div_37_div_22_option_4_Template, 2, 2, "option", 291);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r130 = i0.ɵɵnextContext().$implicit;
    const ctx_r138 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngModel", col_r130.display_format);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngValue", null);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r138.numberDecimalOptions);
} }
function SutramExcelStudioComponent_ng_template_67_div_37_div_23_span_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 297);
    i0.ɵɵtext(1, "Formula (fx)");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_ng_template_67_div_37_div_23_span_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 298);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r130 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(col_r130.type || "Text");
} }
function SutramExcelStudioComponent_ng_template_67_div_37_div_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 294);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_ng_template_67_div_37_div_23_span_1_Template, 2, 0, "span", 295);
    i0.ɵɵtemplate(2, SutramExcelStudioComponent_ng_template_67_div_37_div_23_span_2_Template, 2, 1, "span", 296);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r130 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r130.is_temp);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !col_r130.is_temp);
} }
function SutramExcelStudioComponent_ng_template_67_div_37_Template(rf, ctx) { if (rf & 1) {
    const _r164 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 261)(1, "div", 262)(2, "span", 263);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 264)(5, "button", 265);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_div_37_Template_button_click_5_listener() { const restoredCtx = i0.ɵɵrestoreView(_r164); const col_r130 = restoredCtx.$implicit; const ctx_r163 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r163.moveSelectedColUp(col_r130.key)); });
    i0.ɵɵelement(6, "i", 266);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 267);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_div_37_Template_button_click_7_listener() { const restoredCtx = i0.ɵɵrestoreView(_r164); const col_r130 = restoredCtx.$implicit; const ctx_r165 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r165.moveSelectedColDown(col_r130.key)); });
    i0.ɵɵelement(8, "i", 268);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "div", 269)(10, "div", 270)(11, "span", 271);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(13, SutramExcelStudioComponent_ng_template_67_div_37_span_13_Template, 2, 0, "span", 272);
    i0.ɵɵtemplate(14, SutramExcelStudioComponent_ng_template_67_div_37_span_14_Template, 2, 2, "span", 273);
    i0.ɵɵtemplate(15, SutramExcelStudioComponent_ng_template_67_div_37_span_15_Template, 2, 2, "span", 274);
    i0.ɵɵtemplate(16, SutramExcelStudioComponent_ng_template_67_div_37_span_16_Template, 2, 0, "span", 275);
    i0.ɵɵtemplate(17, SutramExcelStudioComponent_ng_template_67_div_37_span_17_Template, 2, 1, "span", 276);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "div", 277)(19, "input", 278);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_ng_template_67_div_37_Template_input_ngModelChange_19_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r164); const col_r130 = restoredCtx.$implicit; return i0.ɵɵresetView(col_r130.label = $event); })("ngModelChange", function SutramExcelStudioComponent_ng_template_67_div_37_Template_input_ngModelChange_19_listener() { const restoredCtx = i0.ɵɵrestoreView(_r164); const col_r130 = restoredCtx.$implicit; const ctx_r167 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r167.onColumnLabelChange(col_r130)); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(20, "div", 279);
    i0.ɵɵtemplate(21, SutramExcelStudioComponent_ng_template_67_div_37_div_21_Template, 5, 3, "div", 280);
    i0.ɵɵtemplate(22, SutramExcelStudioComponent_ng_template_67_div_37_div_22_Template, 5, 3, "div", 280);
    i0.ɵɵtemplate(23, SutramExcelStudioComponent_ng_template_67_div_37_div_23_Template, 3, 2, "div", 281);
    i0.ɵɵelementStart(24, "button", 282);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_div_37_Template_button_click_24_listener() { const restoredCtx = i0.ɵɵrestoreView(_r164); const col_r130 = restoredCtx.$implicit; const ctx_r168 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r168.toggleColumnCheckbox(col_r130.key)); });
    i0.ɵɵelement(25, "i", 225);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const col_r130 = ctx.$implicit;
    const i_r131 = ctx.index;
    const ctx_r105 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("title", "Column " + ctx_r105.getColLetter(i_r131));
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", ctx_r105.getColLetter(i_r131), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", i_r131 === 0);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", i_r131 === ctx_r105.selectedOrderedColumns.length - 1);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", col_r130.key);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(col_r130.col_name || col_r130.key);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r130.is_temp);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r130.is_fk_main);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r130.is_fk_subcol);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r130.is_fk_raw);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !col_r130.is_temp && !col_r130.is_fk_main && !col_r130.is_fk_subcol && !col_r130.is_fk_raw);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngModel", col_r130.label)("placeholder", col_r130.short_name || col_r130.name || col_r130.key);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r105.isDateCol(col_r130));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r105.isNumberCol(col_r130));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !ctx_r105.isDateCol(col_r130) && !ctx_r105.isNumberCol(col_r130));
} }
function SutramExcelStudioComponent_ng_template_67_Template(rf, ctx) { if (rf & 1) {
    const _r170 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 197)(1, "div", 198)(2, "div", 199)(3, "div", 200);
    i0.ɵɵelement(4, "i", 201);
    i0.ɵɵelementStart(5, "input", 202);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_ng_template_67_Template_input_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r170); const ctx_r169 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r169.colSearchQuery = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_ng_template_67_button_6_Template, 2, 0, "button", 203);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 204)(8, "div", 205)(9, "button", 206);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r170); const ctx_r171 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r171.selectAllColumns(true)); });
    i0.ɵɵtext(10, "All");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 206);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r170); const ctx_r172 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r172.selectAllColumns(false)); });
    i0.ɵɵtext(12, "None");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 206);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r170); const ctx_r173 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r173.resetDefaultColumns()); });
    i0.ɵɵtext(14, "Reset");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "span", 207);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(17, "div", 208);
    i0.ɵɵtemplate(18, SutramExcelStudioComponent_ng_template_67_ng_container_18_Template, 5, 2, "ng-container", 45);
    i0.ɵɵtemplate(19, SutramExcelStudioComponent_ng_template_67_ng_container_19_Template, 5, 2, "ng-container", 45);
    i0.ɵɵtemplate(20, SutramExcelStudioComponent_ng_template_67_ng_container_20_Template, 5, 2, "ng-container", 45);
    i0.ɵɵtemplate(21, SutramExcelStudioComponent_ng_template_67_div_21_Template, 3, 0, "div", 209);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div", 210)(23, "div", 211)(24, "div", 212)(25, "span", 213);
    i0.ɵɵelement(26, "i", 214);
    i0.ɵɵtext(27, " Selected Columns (\u0915\u094D\u0930\u092E \u090F\u0935\u0902 \u092A\u094D\u0930\u093E\u0930\u0942\u092A) ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "span", 215);
    i0.ɵɵtext(29);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(30, "div", 216);
    i0.ɵɵtext(31, " Use ");
    i0.ɵɵelementStart(32, "strong", 217);
    i0.ɵɵtext(33, "\u25B2 / \u25BC");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(34, " to reorder, edit labels, or select formats ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(35, "div", 218);
    i0.ɵɵtemplate(36, SutramExcelStudioComponent_ng_template_67_div_36_Template, 3, 0, "div", 209);
    i0.ɵɵtemplate(37, SutramExcelStudioComponent_ng_template_67_div_37_Template, 26, 16, "div", 219);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(38, "div", 220)(39, "span", 221);
    i0.ɵɵelement(40, "i", 222);
    i0.ɵɵtext(41, " Live updates active & saved to table ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "button", 223);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_67_Template_button_click_42_listener() { i0.ɵɵrestoreView(_r170); i0.ɵɵnextContext(); const _r10 = i0.ɵɵreference(66); return i0.ɵɵresetView(_r10.hide()); });
    i0.ɵɵtext(43, " Done ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r11 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngModel", ctx_r11.colSearchQuery);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r11.colSearchQuery);
    i0.ɵɵadvance(10);
    i0.ɵɵtextInterpolate2("", ctx_r11.selectedColumnKeys.size, " of ", ctx_r11.allConfigColumns.length, " visible");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r11.filteredDirectCols.length > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r11.filteredComputedCols.length > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r11.filteredFkGroups.length > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r11.filteredDirectCols.length === 0 && ctx_r11.filteredComputedCols.length === 0 && ctx_r11.filteredFkGroups.length === 0);
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate1("", ctx_r11.selectedOrderedColumns.length, " Visible");
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngIf", ctx_r11.selectedOrderedColumns.length === 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", ctx_r11.selectedOrderedColumns)("ngForTrackBy", ctx_r11.trackByColKey);
} }
function SutramExcelStudioComponent_div_73_Template(rf, ctx) { if (rf & 1) {
    const _r176 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div")(1, "button", 299);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_73_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r176); const ctx_r175 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r175.showSidebar = true); });
    i0.ɵɵelement(2, "i", 117);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r12 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" \u0917\u0932\u0924\u093F\u092F\u093E\u0901 (", ctx_r12.state.unresolvedCorrectionsCount(), ") ");
} }
function SutramExcelStudioComponent_div_79_span_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 307);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r177 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", tab_r177.title, " ");
} }
function SutramExcelStudioComponent_div_79_input_3_Template(rf, ctx) { if (rf & 1) {
    const _r185 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "input", 308);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_79_input_3_Template_input_ngModelChange_0_listener($event) { i0.ɵɵrestoreView(_r185); const ctx_r184 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r184.renamingTabTitle = $event); })("keyup.enter", function SutramExcelStudioComponent_div_79_input_3_Template_input_keyup_enter_0_listener() { i0.ɵɵrestoreView(_r185); const tab_r177 = i0.ɵɵnextContext().$implicit; const ctx_r186 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r186.saveTabRename(tab_r177)); })("keyup.escape", function SutramExcelStudioComponent_div_79_input_3_Template_input_keyup_escape_0_listener() { i0.ɵɵrestoreView(_r185); const ctx_r188 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r188.cancelTabRename()); })("blur", function SutramExcelStudioComponent_div_79_input_3_Template_input_blur_0_listener() { i0.ɵɵrestoreView(_r185); const tab_r177 = i0.ɵɵnextContext().$implicit; const ctx_r189 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r189.saveTabRename(tab_r177)); })("click", function SutramExcelStudioComponent_div_79_input_3_Template_input_click_0_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r177 = i0.ɵɵnextContext().$implicit;
    const ctx_r179 = i0.ɵɵnextContext();
    i0.ɵɵproperty("id", "tab-rename-input-" + tab_r177.id)("ngModel", ctx_r179.renamingTabTitle);
} }
function SutramExcelStudioComponent_div_79_span_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 309);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r177 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", tab_r177.recordCount, " ");
} }
function SutramExcelStudioComponent_div_79_button_5_Template(rf, ctx) { if (rf & 1) {
    const _r196 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 310);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_79_button_5_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r196); const tab_r177 = i0.ɵɵnextContext().$implicit; const ctx_r194 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r194.startRenameTab(tab_r177, $event)); });
    i0.ɵɵelement(1, "i", 311);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_79_button_6_Template(rf, ctx) { if (rf & 1) {
    const _r199 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 312);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_79_button_6_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r199); const tab_r177 = i0.ɵɵnextContext().$implicit; const ctx_r197 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r197.closeSheet(tab_r177.id, $event)); });
    i0.ɵɵtext(1, "\u2715");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_79_Template(rf, ctx) { if (rf & 1) {
    const _r201 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 300);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_79_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r201); const tab_r177 = restoredCtx.$implicit; const ctx_r200 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r200.switchSheet(tab_r177.id)); })("dblclick", function SutramExcelStudioComponent_div_79_Template_div_dblclick_0_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r201); const tab_r177 = restoredCtx.$implicit; const ctx_r202 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r202.startRenameTab(tab_r177, $event)); })("contextmenu", function SutramExcelStudioComponent_div_79_Template_div_contextmenu_0_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r201); const tab_r177 = restoredCtx.$implicit; const ctx_r203 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r203.openTabContextMenu($event, tab_r177)); });
    i0.ɵɵelement(1, "i", 301);
    i0.ɵɵtemplate(2, SutramExcelStudioComponent_div_79_span_2_Template, 2, 1, "span", 302);
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_div_79_input_3_Template, 1, 2, "input", 303);
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_79_span_4_Template, 2, 1, "span", 304);
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_div_79_button_5_Template, 2, 0, "button", 305);
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_div_79_button_6_Template, 2, 0, "button", 306);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tab_r177 = ctx.$implicit;
    const ctx_r14 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active-tab", ctx_r14.activeSheetId === tab_r177.id);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", tab_r177.icon);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r14.renamingTabId !== tab_r177.id);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r14.renamingTabId === tab_r177.id);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", tab_r177.isLoaded && (tab_r177.recordCount || 0) > 0);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r14.renamingTabId !== tab_r177.id && (tab_r177.type === "rough" || tab_r177.id.startsWith("rough_") || tab_r177.id.startsWith("sheet_")));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r14.sheetTabs.length > 1);
} }
function SutramExcelStudioComponent_div_82_div_5_Template(rf, ctx) { if (rf & 1) {
    const _r206 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 317);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_82_div_5_Template_div_click_0_listener($event) { i0.ɵɵrestoreView(_r206); const ctx_r205 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r205.deleteSheet(ctx_r205.tabContextMenu.tab, $event)); });
    i0.ɵɵelement(1, "i", 318);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "\u0936\u0940\u091F \u0939\u091F\u093E\u090F\u0902 / \u0921\u093F\u0932\u0940\u091F \u0915\u0930\u0947\u0902 (Delete Sheet)");
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_div_82_Template(rf, ctx) { if (rf & 1) {
    const _r209 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 313);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_82_Template_div_click_0_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementStart(1, "div", 314);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_82_Template_div_click_1_listener($event) { i0.ɵɵrestoreView(_r209); const ctx_r208 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r208.startRenameTab(ctx_r208.tabContextMenu.tab, $event)); });
    i0.ɵɵelement(2, "i", 315);
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "\u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Rename Sheet)");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_div_82_div_5_Template, 4, 0, "div", 316);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r15 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("left", ctx_r15.tabContextMenu.x, "px")("top", ctx_r15.tabContextMenu.y, "px");
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngIf", ctx_r15.tabContextMenu.tab);
} }
function SutramExcelStudioComponent_span_89_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 319);
    i0.ɵɵelement(1, "i", 320);
    i0.ɵɵtext(2, "Loading more... ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_span_90_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 321);
    i0.ɵɵelement(1, "i", 322);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r17 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r17.state.deletedRowIds().length, " Deleted ");
} }
function SutramExcelStudioComponent_span_91_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 323);
    i0.ɵɵtext(1, "\u2713 100% In Sync");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_span_92_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 324);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r19 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("", ctx_r19.state.stats().errorRows, " \u0924\u094D\u0930\u0941\u091F\u093F\u092F\u093E\u0901");
} }
function SutramExcelStudioComponent_span_93_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 325);
    i0.ɵɵelement(1, "i", 326);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r20 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("sync-error", ctx_r20.lastSyncPerSheet[ctx_r20.activeSheetId].hasError);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("\u0905\u0902\u0924\u093F\u092E \u0938\u093F\u0902\u0915 (", ctx_r20.lastSyncPerSheet[ctx_r20.activeSheetId].time, "): ", ctx_r20.lastSyncPerSheet[ctx_r20.activeSheetId].summary, " ");
} }
function SutramExcelStudioComponent_div_104_div_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 339)(1, "div", 340)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 341);
    i0.ɵɵelement(7, "div", 342);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r210 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", ctx_r210.syncToast.percentage, "% \u092A\u0942\u0930\u094D\u0923");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r210.state.importProgress().current, " / ", ctx_r210.state.importProgress().total, "");
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("width", ctx_r210.syncToast.percentage, "%");
} }
function SutramExcelStudioComponent_div_104_span_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 343);
    i0.ɵɵelement(1, "i", 68);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r211 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r211.syncToast.inserted, " Inserted ");
} }
function SutramExcelStudioComponent_div_104_span_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 344);
    i0.ɵɵelement(1, "i", 345);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r212 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r212.syncToast.updated, " Updated ");
} }
function SutramExcelStudioComponent_div_104_span_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 346);
    i0.ɵɵelement(1, "i", 318);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r213 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r213.syncToast.deleted, " Deleted ");
} }
function SutramExcelStudioComponent_div_104_span_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 347);
    i0.ɵɵelement(1, "i", 225);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r214 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r214.syncToast.failed, " Failed ");
} }
function SutramExcelStudioComponent_div_104_div_15_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const err_r217 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("\u2022 ", err_r217, "");
} }
function SutramExcelStudioComponent_div_104_div_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 348);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_div_104_div_15_div_1_Template, 2, 1, "div", 113);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r215 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", ctx_r215.syncToast.errors);
} }
function SutramExcelStudioComponent_div_104_Template(rf, ctx) { if (rf & 1) {
    const _r219 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 327)(1, "div", 328)(2, "div", 329);
    i0.ɵɵelement(3, "i", 21);
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 330);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_104_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r219); const ctx_r218 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r218.dismissSyncToast()); });
    i0.ɵɵtext(7, "\u2715");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(8, SutramExcelStudioComponent_div_104_div_8_Template, 8, 5, "div", 331);
    i0.ɵɵelementStart(9, "div", 332)(10, "div", 333);
    i0.ɵɵtemplate(11, SutramExcelStudioComponent_div_104_span_11_Template, 3, 1, "span", 334);
    i0.ɵɵtemplate(12, SutramExcelStudioComponent_div_104_span_12_Template, 3, 1, "span", 335);
    i0.ɵɵtemplate(13, SutramExcelStudioComponent_div_104_span_13_Template, 3, 1, "span", 336);
    i0.ɵɵtemplate(14, SutramExcelStudioComponent_div_104_span_14_Template, 3, 1, "span", 337);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(15, SutramExcelStudioComponent_div_104_div_15_Template, 2, 1, "div", 338);
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
function SutramExcelStudioComponent_div_113_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 349);
    i0.ɵɵelement(1, "i", 350);
    i0.ɵɵelementStart(2, "span")(3, "strong");
    i0.ɵɵtext(4, "Author Mode (View Only):");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(5, " \u0915\u0947\u0935\u0932 Admin \u0915\u094B UI \u0938\u0942\u0924\u094D\u0930 \u091C\u094B\u0921\u093C\u0928\u0947, \u092C\u0926\u0932\u0928\u0947 \u092F\u093E \u0939\u091F\u093E\u0928\u0947 \u0915\u093E \u0905\u0927\u093F\u0915\u093E\u0930 \u0939\u0948\u0964 (Only Admin can create/edit/delete triggers)");
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_div_114_div_8_Template(rf, ctx) { if (rf & 1) {
    const _r224 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 371)(1, "label", 372);
    i0.ɵɵtext(2, "Display Name (\u0915\u0949\u0932\u092E \u0936\u0940\u0930\u094D\u0937\u0915):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "input", 373);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_114_div_8_Template_input_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r224); const ctx_r223 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r223.newUiSutra.display_name = $event); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r220 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r220.newUiSutra.display_name);
} }
function SutramExcelStudioComponent_div_114_span_18_Template(rf, ctx) { if (rf & 1) {
    const _r227 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 374);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_114_span_18_Template_span_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r227); const col_r225 = restoredCtx.$implicit; const ctx_r226 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r226.insertColIntoFormula(col_r225.name || col_r225.col_name)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r225 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" + [", col_r225.name || col_r225.col_name, "] ");
} }
function SutramExcelStudioComponent_div_114_div_19_span_3_Template(rf, ctx) { if (rf & 1) {
    const _r231 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 376);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_114_div_19_span_3_Template_span_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r231); const rc_r229 = restoredCtx.$implicit; const ctx_r230 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r230.insertColIntoFormula(rc_r229.name || rc_r229.key)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const rc_r229 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" + [", rc_r229.name || rc_r229.key, "] ");
} }
function SutramExcelStudioComponent_div_114_div_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 365)(1, "span", 362);
    i0.ɵɵtext(2, "Ref Columns (\u0938\u0942\u0924\u094D\u0930 \u0939\u0947\u0924\u0941):");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_div_114_div_19_span_3_Template, 2, 1, "span", 375);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r222 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r222.referenceColumns);
} }
function SutramExcelStudioComponent_div_114_Template(rf, ctx) { if (rf & 1) {
    const _r233 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 351)(1, "div", 352);
    i0.ɵɵtext(2, "Add UI Reactive Trigger (\u0928\u092F\u093E UI \u0938\u0942\u0924\u094D\u0930 \u091C\u094B\u0921\u093C\u0947\u0902)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 353)(4, "div")(5, "label", 354);
    i0.ɵɵtext(6, "Target Column (\u0932\u0915\u094D\u0937\u094D\u092F \u0915\u0949\u0932\u092E):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p-dropdown", 355);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_114_Template_p_dropdown_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r233); const ctx_r232 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r232.selectedTargetColValue = $event); })("onChange", function SutramExcelStudioComponent_div_114_Template_p_dropdown_onChange_7_listener($event) { i0.ɵɵrestoreView(_r233); const ctx_r234 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r234.onTargetColChange($event)); })("ngModelChange", function SutramExcelStudioComponent_div_114_Template_p_dropdown_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r233); const ctx_r235 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r235.onTargetColChange($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(8, SutramExcelStudioComponent_div_114_div_8_Template, 4, 1, "div", 356);
    i0.ɵɵelementStart(9, "div", 357)(10, "label", 354);
    i0.ɵɵtext(11, "Formula / Expression / Code (e.g. [colB], [qty] * [rate], AGE([dob])):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "input", 358);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_114_Template_input_ngModelChange_12_listener($event) { i0.ɵɵrestoreView(_r233); const ctx_r236 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r236.newUiSutra.formula = $event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div", 359)(14, "button", 360);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_114_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r233); const ctx_r237 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r237.addUiSutra()); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "div", 361)(16, "span", 362);
    i0.ɵɵtext(17, "Table Columns:");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(18, SutramExcelStudioComponent_div_114_span_18_Template, 2, 1, "span", 363);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(19, SutramExcelStudioComponent_div_114_div_19_Template, 4, 1, "div", 364);
    i0.ɵɵelementStart(20, "div", 365)(21, "span", 362);
    i0.ɵɵtext(22, "Helpers:");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "span", 366);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_114_Template_span_click_23_listener() { i0.ɵɵrestoreView(_r233); const ctx_r238 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r238.insertFnIntoFormula("AGE([dob])")); });
    i0.ɵɵtext(24, " + AGE([dob]) ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "span", 367);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_114_Template_span_click_25_listener() { i0.ɵɵrestoreView(_r233); const ctx_r239 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r239.insertFnIntoFormula("DAYS([end_date], [start_date])")); });
    i0.ɵɵtext(26, " + DAYS(d1, d2) ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "span", 368);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_114_Template_span_click_27_listener() { i0.ɵɵrestoreView(_r233); const ctx_r240 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r240.insertFnIntoFormula("IF([condition], true_val, false_val)")); });
    i0.ɵɵtext(28, " + IF(cond, a, b) ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "span", 369);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_114_Template_span_click_29_listener() { i0.ɵɵrestoreView(_r233); const ctx_r241 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r241.insertFnIntoFormula("ROUND([val], 2)")); });
    i0.ɵɵtext(30, " + ROUND(n, 2) ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "span", 370);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_114_Template_span_click_31_listener() { i0.ɵɵrestoreView(_r233); const ctx_r242 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r242.insertFnIntoFormula("UPPER([text])")); });
    i0.ɵɵtext(32, " + UPPER(str) ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r23 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵstyleProp("flex", ctx_r23.newUiSutra.is_temp ? "0 0 260px" : "0 0 300px");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("options", ctx_r23.targetColDropdownOptions)("ngModel", ctx_r23.selectedTargetColValue)("appendTo", "body");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r23.newUiSutra.is_temp);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngModel", ctx_r23.newUiSutra.formula);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r23.selectedTargetColValue || (ctx_r23.newUiSutra.is_temp ? !(ctx_r23.newUiSutra.display_name == null ? null : ctx_r23.newUiSutra.display_name.trim()) : !ctx_r23.newUiSutra.target_col) || !(ctx_r23.newUiSutra.formula == null ? null : ctx_r23.newUiSutra.formula.trim()));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngForOf", ctx_r23.currentTableColumns);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r23.referenceColumns.length > 0);
} }
function SutramExcelStudioComponent_div_117_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 377);
    i0.ɵɵtext(1, " \u0905\u092D\u0940 \u0907\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u092E\u0947\u0902 \u0915\u094B\u0908 UI \u0938\u0942\u0924\u094D\u0930 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u090A\u092A\u0930 \u0926\u093F\u090F \u0917\u090F \u092B\u0949\u0930\u094D\u092E \u0938\u0947 \u0928\u092F\u093E \u0938\u0942\u0924\u094D\u0930 \u091C\u094B\u0921\u093C\u0947\u0902\u0964 ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_118_tr_15_span_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 389);
    i0.ɵɵelement(1, "i", 390);
    i0.ɵɵtext(2, "Temp (fx) ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_118_tr_15_span_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 391);
    i0.ɵɵelement(1, "i", 392);
    i0.ɵɵtext(2, "DB Column ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_118_tr_15_span_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 393);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const s_r244 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("(", s_r244.target_col, ")");
} }
function SutramExcelStudioComponent_div_118_tr_15_button_13_Template(rf, ctx) { if (rf & 1) {
    const _r254 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 394);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_118_tr_15_button_13_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r254); const i_r245 = i0.ɵɵnextContext().index; const ctx_r252 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r252.removeUiSutra(i_r245)); });
    i0.ɵɵelement(1, "i", 318);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_118_tr_15_span_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 298);
    i0.ɵɵtext(1, "\uD83D\uDD12 View");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_118_tr_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 381);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td");
    i0.ɵɵtemplate(4, SutramExcelStudioComponent_div_118_tr_15_span_4_Template, 3, 0, "span", 382);
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_div_118_tr_15_span_5_Template, 3, 0, "span", 383);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "td", 384)(7, "strong");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(9, SutramExcelStudioComponent_div_118_tr_15_span_9_Template, 2, 1, "span", 385);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "td", 386);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "td", 387);
    i0.ɵɵtemplate(13, SutramExcelStudioComponent_div_118_tr_15_button_13_Template, 2, 0, "button", 388);
    i0.ɵɵtemplate(14, SutramExcelStudioComponent_div_118_tr_15_span_14_Template, 2, 0, "span", 296);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const s_r244 = ctx.$implicit;
    const i_r245 = ctx.index;
    const ctx_r243 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i_r245 + 1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", s_r244.is_temp);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !s_r244.is_temp);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(s_r244.display_name || s_r244.target_col);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", s_r244.is_temp && s_r244.target_col);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(s_r244.formula);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r243.isAdmin);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !ctx_r243.isAdmin);
} }
function SutramExcelStudioComponent_div_118_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 106)(1, "table", 107)(2, "thead")(3, "tr")(4, "th", 378);
    i0.ɵɵtext(5, "#");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "th", 379);
    i0.ɵɵtext(7, "\u092A\u094D\u0930\u0915\u093E\u0930 (Type)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th", 111);
    i0.ɵɵtext(9, "\u0915\u0949\u0932\u092E \u0928\u093E\u092E");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th");
    i0.ɵɵtext(11, "\u0938\u092E\u0940\u0915\u0930\u0923 (Formula)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "th", 380);
    i0.ɵɵtext(13, "\u0939\u091F\u093E\u090F\u0902");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(14, "tbody");
    i0.ɵɵtemplate(15, SutramExcelStudioComponent_div_118_tr_15_Template, 15, 8, "tr", 113);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r25 = i0.ɵɵnextContext();
    i0.ɵɵadvance(15);
    i0.ɵɵproperty("ngForOf", ctx_r25.uiSutrasList);
} }
function SutramExcelStudioComponent_ng_template_119_button_2_Template(rf, ctx) { if (rf & 1) {
    const _r257 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 398);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_119_button_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r257); const ctx_r256 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r256.saveUiSutras()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r255 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("loading", ctx_r255.isSavingUiSutras);
} }
function SutramExcelStudioComponent_ng_template_119_Template(rf, ctx) { if (rf & 1) {
    const _r259 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 395)(1, "button", 396);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_119_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r259); const ctx_r258 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r258.showUiSutrasModal = false); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(2, SutramExcelStudioComponent_ng_template_119_button_2_Template, 1, 1, "button", 397);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r26 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r26.isAdmin);
} }
function SutramExcelStudioComponent_div_126_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 349);
    i0.ɵɵelement(1, "i", 350);
    i0.ɵɵelementStart(2, "span")(3, "strong");
    i0.ɵɵtext(4, "Author Mode (View Only):");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(5, " \u0915\u0947\u0935\u0932 Admin \u0915\u094B \u092C\u0948\u0915\u090F\u0902\u0921 \u091F\u094D\u0930\u093F\u0917\u0930 \u091C\u094B\u0921\u093C\u0928\u0947 \u092F\u093E \u0939\u091F\u093E\u0928\u0947 \u0915\u093E \u0905\u0927\u093F\u0915\u093E\u0930 \u0939\u0948\u0964 (Only Admin can create/delete database triggers)");
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_div_127_div_16_span_15_Template(rf, ctx) { if (rf & 1) {
    const _r267 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 415);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_127_div_16_span_15_Template_span_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r267); const h_r265 = restoredCtx.$implicit; const ctx_r266 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r266.insertColIntoTriggerSql(h_r265.name, ":new.")); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const h_r265 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" +:new.", h_r265.name, " ");
} }
function SutramExcelStudioComponent_div_127_div_16_ng_container_16_span_1_Template(rf, ctx) { if (rf & 1) {
    const _r271 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 417);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_127_div_16_ng_container_16_span_1_Template_span_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r271); const h_r269 = restoredCtx.$implicit; const ctx_r270 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r270.insertColIntoTriggerSql(h_r269.name, ":old.")); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const h_r269 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" +:old.", h_r269.name, " ");
} }
function SutramExcelStudioComponent_div_127_div_16_ng_container_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵtemplate(1, SutramExcelStudioComponent_div_127_div_16_ng_container_16_span_1_Template, 2, 1, "span", 416);
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r263 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", ctx_r263.visibleHeaders);
} }
function SutramExcelStudioComponent_div_127_div_16_div_17_span_3_Template(rf, ctx) { if (rf & 1) {
    const _r275 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 419);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_127_div_16_div_17_span_3_Template_span_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r275); const t_r273 = restoredCtx.$implicit; const ctx_r274 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r274.insertTextIntoTriggerSql(t_r273.table)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const t_r273 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", t_r273.table, " ");
} }
function SutramExcelStudioComponent_div_127_div_16_div_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 365)(1, "span", 362);
    i0.ɵɵtext(2, "Tables:");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_div_127_div_16_div_17_span_3_Template, 2, 1, "span", 418);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r264 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r264.tablesList);
} }
function SutramExcelStudioComponent_div_127_div_16_Template(rf, ctx) { if (rf & 1) {
    const _r277 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 409)(1, "div", 410)(2, "label", 411);
    i0.ɵɵtext(3, "SQL \u0915\u094D\u0935\u0947\u0930\u0940 (Raw SQL Query):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 412);
    i0.ɵɵtext(5, "\u0928\u092F\u093E \u092E\u093E\u0928: ");
    i0.ɵɵelementStart(6, "code");
    i0.ɵɵtext(7, ":new.col");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(8, " | \u092A\u0941\u0930\u093E\u0928\u093E \u092E\u093E\u0928: ");
    i0.ɵɵelementStart(9, "code");
    i0.ɵɵtext(10, ":old.col");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(11, "textarea", 413);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_127_div_16_Template_textarea_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r277); const ctx_r276 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r276.newTriggerDef.raw_sql = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 365)(13, "span", 362);
    i0.ɵɵtext(14, "Columns:");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(15, SutramExcelStudioComponent_div_127_div_16_span_15_Template, 2, 1, "span", 414);
    i0.ɵɵtemplate(16, SutramExcelStudioComponent_div_127_div_16_ng_container_16_Template, 2, 1, "ng-container", 45);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(17, SutramExcelStudioComponent_div_127_div_16_div_17_Template, 4, 1, "div", 364);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r260 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(11);
    i0.ɵɵproperty("ngModel", ctx_r260.newTriggerDef.raw_sql);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngForOf", ctx_r260.visibleHeaders);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r260.newTriggerDef.event !== "INSERT");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r260.tablesList.length > 0);
} }
function SutramExcelStudioComponent_div_127_div_17_ng_template_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 426)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 427);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r280 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r280.display_name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r280.table);
} }
function SutramExcelStudioComponent_div_127_div_17_ng_template_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 428);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "span", 393);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r281 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(item_r281.display_name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("(", item_r281.table, ")");
} }
function SutramExcelStudioComponent_div_127_div_17_Template(rf, ctx) { if (rf & 1) {
    const _r283 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 420)(1, "div", 404)(2, "label", 354);
    i0.ɵɵtext(3, "Target Table (\u0932\u0915\u094D\u0937\u094D\u092F \u0924\u093E\u0932\u093F\u0915\u093E):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p-dropdown", 421);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_127_div_17_Template_p_dropdown_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r283); const ctx_r282 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r282.newTriggerDef.target_table = $event); });
    i0.ɵɵtemplate(5, SutramExcelStudioComponent_div_127_div_17_ng_template_5_Template, 5, 2, "ng-template", 422);
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_div_127_div_17_ng_template_6_Template, 4, 2, "ng-template", 423);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 424)(8, "label", 354);
    i0.ɵɵtext(9, "Field Mapping JSON (\u092B\u0940\u0932\u094D\u0921 \u092E\u0948\u092A):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "input", 425);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_127_div_17_Template_input_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r283); const ctx_r284 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r284.newTriggerDef.field_map_str = $event); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r261 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("options", ctx_r261.tablesList)("ngModel", ctx_r261.newTriggerDef.target_table)("filter", true)("appendTo", "body");
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngModel", ctx_r261.newTriggerDef.field_map_str);
} }
const _c2 = function () { return { label: "INSERT (\u0928\u0908 \u092A\u0902\u0915\u094D\u0924\u093F)", value: "INSERT" }; };
const _c3 = function () { return { label: "UPDATE (\u0938\u0902\u0936\u094B\u0927\u0928)", value: "UPDATE" }; };
const _c4 = function () { return { label: "DELETE (\u0935\u093F\u0932\u094B\u092A\u0928)", value: "DELETE" }; };
const _c5 = function (a0, a1, a2) { return [a0, a1, a2]; };
const _c6 = function () { return { label: "\u26A1 Raw SQL (\u0915\u0938\u094D\u091F\u092E SQL \u0915\u094D\u0935\u0947\u0930\u0940 \u2014 \u0905\u0928\u0941\u0936\u0902\u0938\u093F\u0924)", value: "raw_sql" }; };
const _c7 = function () { return { label: "\uD83D\uDD04 Update Row (\u0905\u0928\u094D\u092F \u0924\u093E\u0932\u093F\u0915\u093E \u0905\u092A\u0921\u0947\u091F)", value: "update_row" }; };
const _c8 = function () { return { label: "\u2795 Insert Row (\u0905\u0928\u094D\u092F \u0924\u093E\u0932\u093F\u0915\u093E \u092E\u0947\u0902 \u0907\u0928\u094D\u0938\u0930\u094D\u091F)", value: "insert_row" }; };
const _c9 = function () { return { label: "\u274C Delete Row (\u0905\u0928\u094D\u092F \u0924\u093E\u0932\u093F\u0915\u093E \u0938\u0947 \u0935\u093F\u0932\u094B\u092A\u0928)", value: "delete_row" }; };
const _c10 = function (a0, a1, a2, a3) { return [a0, a1, a2, a3]; };
function SutramExcelStudioComponent_div_127_Template(rf, ctx) { if (rf & 1) {
    const _r286 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 351)(1, "div", 93);
    i0.ɵɵtext(2, "\u0928\u092F\u093E \u0938\u0930\u094D\u0935\u0930 \u091F\u094D\u0930\u093F\u0917\u0930 \u092C\u0928\u093E\u090F\u0902 (Create Database Trigger)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 399)(4, "div", 400)(5, "label", 354);
    i0.ɵɵtext(6, "\u091F\u094D\u0930\u093F\u0917\u0930 \u0915\u093E \u0928\u093E\u092E (Identifier):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "input", 401);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_127_Template_input_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r286); const ctx_r285 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r285.newTriggerDef.trigger_name = $event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 402)(9, "label", 354);
    i0.ɵɵtext(10, "\u0907\u0935\u0947\u0902\u091F (Event):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p-dropdown", 403);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_127_Template_p_dropdown_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r286); const ctx_r287 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r287.newTriggerDef.event = $event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 404)(13, "label", 354);
    i0.ɵɵtext(14, "\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 \u092A\u094D\u0930\u0915\u093E\u0930 (Action Type):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "p-dropdown", 403);
    i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_div_127_Template_p_dropdown_ngModelChange_15_listener($event) { i0.ɵɵrestoreView(_r286); const ctx_r288 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r288.newTriggerDef.action_type = $event); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(16, SutramExcelStudioComponent_div_127_div_16_Template, 18, 4, "div", 405);
    i0.ɵɵtemplate(17, SutramExcelStudioComponent_div_127_div_17_Template, 11, 5, "div", 406);
    i0.ɵɵelementStart(18, "div", 407)(19, "button", 408);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_127_Template_button_click_19_listener() { i0.ɵɵrestoreView(_r286); const ctx_r289 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r289.createBackendTrigger()); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r28 = i0.ɵɵnextContext();
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngModel", ctx_r28.newTriggerDef.trigger_name);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("options", i0.ɵɵpureFunction3(13, _c5, i0.ɵɵpureFunction0(10, _c2), i0.ɵɵpureFunction0(11, _c3), i0.ɵɵpureFunction0(12, _c4)))("ngModel", ctx_r28.newTriggerDef.event)("appendTo", "body");
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("options", i0.ɵɵpureFunction4(21, _c10, i0.ɵɵpureFunction0(17, _c6), i0.ɵɵpureFunction0(18, _c7), i0.ɵɵpureFunction0(19, _c8), i0.ɵɵpureFunction0(20, _c9)))("ngModel", ctx_r28.newTriggerDef.action_type)("appendTo", "body");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r28.newTriggerDef.action_type === "raw_sql");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r28.newTriggerDef.action_type !== "raw_sql");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r28.newTriggerDef.trigger_name || ctx_r28.newTriggerDef.action_type === "raw_sql" && !ctx_r28.newTriggerDef.raw_sql);
} }
function SutramExcelStudioComponent_div_130_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 377);
    i0.ɵɵtext(1, " \u0905\u092D\u0940 \u0907\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u092E\u0947\u0902 \u0915\u094B\u0908 \u092C\u0948\u0915\u090F\u0902\u0921 \u091F\u094D\u0930\u093F\u0917\u0930 \u0938\u0915\u094D\u0930\u093F\u092F \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u090A\u092A\u0930 \u0926\u093F\u090F \u0917\u090F \u092B\u0949\u0930\u094D\u092E \u0938\u0947 \u0928\u092F\u093E \u091F\u094D\u0930\u093F\u0917\u0930 \u092C\u0928\u093E\u090F\u0902\u0964 ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_131_tr_17_code_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "code", 435);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const t_r291 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(t_r291.actions[0] == null ? null : t_r291.actions[0].raw_sql);
} }
function SutramExcelStudioComponent_div_131_tr_17_span_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const t_r291 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(t_r291.target_table || t_r291.actions && (t_r291.actions[0] == null ? null : t_r291.actions[0].target_table) || "Standard Action");
} }
function SutramExcelStudioComponent_div_131_tr_17_button_16_Template(rf, ctx) { if (rf & 1) {
    const _r301 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 394);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_div_131_tr_17_button_16_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r301); const t_r291 = i0.ɵɵnextContext().$implicit; const ctx_r299 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r299.deleteBackendTrigger(t_r291._id)); });
    i0.ɵɵelement(1, "i", 318);
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_131_tr_17_span_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 298);
    i0.ɵɵtext(1, "\uD83D\uDD12 View");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_div_131_tr_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 381);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td", 384)(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "td", 387)(7, "span", 431);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "td", 387)(10, "span", 432);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "td", 433);
    i0.ɵɵtemplate(13, SutramExcelStudioComponent_div_131_tr_17_code_13_Template, 2, 1, "code", 434);
    i0.ɵɵtemplate(14, SutramExcelStudioComponent_div_131_tr_17_span_14_Template, 2, 1, "span", 45);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "td", 387);
    i0.ɵɵtemplate(16, SutramExcelStudioComponent_div_131_tr_17_button_16_Template, 2, 0, "button", 388);
    i0.ɵɵtemplate(17, SutramExcelStudioComponent_div_131_tr_17_span_17_Template, 2, 0, "span", 296);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const t_r291 = ctx.$implicit;
    const i_r292 = ctx.index;
    const ctx_r290 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i_r292 + 1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(t_r291.trigger_name);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", t_r291.event === "INSERT" ? "event-pill-insert" : t_r291.event === "UPDATE" ? "event-pill-update" : "event-pill-delete");
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", t_r291.event, " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(t_r291.actions && (t_r291.actions[0] == null ? null : t_r291.actions[0].action_type) || t_r291.action_type || "raw_sql");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", t_r291.actions && (t_r291.actions[0] == null ? null : t_r291.actions[0].raw_sql));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !t_r291.actions || !(t_r291.actions[0] == null ? null : t_r291.actions[0].raw_sql));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r290.isAdmin);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !ctx_r290.isAdmin);
} }
function SutramExcelStudioComponent_div_131_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 106)(1, "table", 107)(2, "thead")(3, "tr")(4, "th", 378);
    i0.ɵɵtext(5, "#");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "th", 111);
    i0.ɵɵtext(7, "\u091F\u094D\u0930\u093F\u0917\u0930 \u0928\u093E\u092E");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th", 429);
    i0.ɵɵtext(9, "\u0907\u0935\u0947\u0902\u091F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th", 430);
    i0.ɵɵtext(11, "\u092A\u094D\u0930\u0915\u093E\u0930");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "th");
    i0.ɵɵtext(13, "\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 / SQL \u0915\u094D\u0935\u0947\u0930\u0940");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "th", 380);
    i0.ɵɵtext(15, "\u0939\u091F\u093E\u090F\u0902");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "tbody");
    i0.ɵɵtemplate(17, SutramExcelStudioComponent_div_131_tr_17_Template, 18, 9, "tr", 113);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r30 = i0.ɵɵnextContext();
    i0.ɵɵadvance(17);
    i0.ɵɵproperty("ngForOf", ctx_r30.backendTriggersList);
} }
function SutramExcelStudioComponent_ng_template_132_Template(rf, ctx) { if (rf & 1) {
    const _r303 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 395)(1, "button", 436);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_132_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r303); const ctx_r302 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r302.showBackendSutrasModal = false); });
    i0.ɵɵelementEnd()();
} }
function SutramExcelStudioComponent_button_156_Template(rf, ctx) { if (rf & 1) {
    const _r305 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 437);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_button_156_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r305); const ctx_r304 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r304.cancelUserEdit()); });
    i0.ɵɵtext(1, " Cancel Edit ");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_tr_196_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 444);
    i0.ɵɵtext(1, "Active");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_tr_196_i_20_Template(rf, ctx) { if (rf & 1) {
    const _r312 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "i", 445);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_tr_196_i_20_Template_i_click_0_listener() { i0.ɵɵrestoreView(_r312); const u_r306 = i0.ɵɵnextContext().$implicit; const ctx_r310 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r310.deleteUser(u_r306)); });
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_tr_196_Template(rf, ctx) { if (rf & 1) {
    const _r314 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td", 381);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td")(4, "strong", 384);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, SutramExcelStudioComponent_tr_196_span_6_Template, 2, 0, "span", 438);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "td");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "td")(10, "span", 24);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "td", 387)(13, "span", 439);
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "td", 412);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "td", 387)(18, "div", 440)(19, "i", 441);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_tr_196_Template_i_click_19_listener() { const restoredCtx = i0.ɵɵrestoreView(_r314); const u_r306 = restoredCtx.$implicit; const ctx_r313 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r313.editUser(u_r306)); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(20, SutramExcelStudioComponent_tr_196_i_20_Template, 1, 0, "i", 442);
    i0.ɵɵelementStart(21, "button", 443);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_tr_196_Template_button_click_21_listener() { const restoredCtx = i0.ɵɵrestoreView(_r314); const u_r306 = restoredCtx.$implicit; const ctx_r315 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r315.setCurrentActiveUser(u_r306)); });
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const u_r306 = ctx.$implicit;
    const i_r307 = ctx.index;
    const ctx_r33 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i_r307 + 1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(u_r306.username);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r33.currentUser.username === u_r306.username);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(u_r306.display_name || "\u2014");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("admin-tag", u_r306.role === "admin")("author-tag", u_r306.role === "author");
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", u_r306.role === "admin" ? "\uD83D\uDC51 Admin" : "\uD83D\uDC64 Author", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active-pill", u_r306.active)("inactive-pill", !u_r306.active);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", u_r306.active ? "Active" : "Inactive", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(u_r306.created_at || "\u2014");
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngIf", u_r306.username !== "admin");
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("btn-use-account-active", ctx_r33.currentUser.username === u_r306.username);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", ctx_r33.currentUser.username === u_r306.username ? "\u2713 Active" : "Switch", " ");
} }
function SutramExcelStudioComponent_tr_197_span_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵelement(1, "i", 320);
    i0.ɵɵtext(2, " \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_tr_197_span_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "\u0915\u094B\u0908 \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E (No users found)");
    i0.ɵɵelementEnd();
} }
function SutramExcelStudioComponent_tr_197_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 446);
    i0.ɵɵtemplate(2, SutramExcelStudioComponent_tr_197_span_2_Template, 3, 0, "span", 45);
    i0.ɵɵtemplate(3, SutramExcelStudioComponent_tr_197_span_3_Template, 2, 0, "span", 45);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r34 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx_r34.isLoadingUsers);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !ctx_r34.isLoadingUsers);
} }
function SutramExcelStudioComponent_ng_template_198_Template(rf, ctx) { if (rf & 1) {
    const _r319 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 395)(1, "button", 436);
    i0.ɵɵlistener("click", function SutramExcelStudioComponent_ng_template_198_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r319); const ctx_r318 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r318.showUserManagementModal = false); });
    i0.ɵɵelementEnd()();
} }
const _c11 = function () { return { width: "94vw", maxWidth: "980px" }; };
const _c12 = function () { return { width: "94vw", maxWidth: "860px" }; };
export class SutramExcelStudioComponent {
    state;
    api;
    scanner;
    audit;
    refCache;
    cdr;
    set table(tableName) {
        if (tableName) {
            this.selectedTableName = tableName;
            if (this.activeSheetId !== tableName) {
                this.openTableInSheet(tableName);
            }
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
    // ── Dynamic Reports & Views Catalog ──────────────────────────
    reportsList = [];
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
        return n === '_id' || n.includes('_by_dept_id') || n === 'verify' || n === 'hl';
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
                    ref_select: h.ref_select,
                    ref_data: h.ref_data,
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
        // Always merge temporary formula columns from active uiSutrasList
        this.syncTempColumnsToGrid();
    }
    get filteredDirectCols() {
        const q = (this.colSearchQuery || '').trim().toLowerCase();
        return this.allConfigColumns.filter(c => {
            if (c.group || c.is_temp)
                return false;
            if (!q)
                return true;
            return (c.name && c.name.toLowerCase().includes(q)) ||
                (c.short_name && c.short_name.toLowerCase().includes(q)) ||
                (c.label && c.label.toLowerCase().includes(q)) ||
                (c.key && c.key.toLowerCase().includes(q));
        });
    }
    get filteredComputedCols() {
        const q = (this.colSearchQuery || '').trim().toLowerCase();
        return this.allConfigColumns.filter(c => {
            if (!c.is_temp && c.group !== 'Computed (fx)')
                return false;
            if (!q)
                return true;
            return (c.name && c.name.toLowerCase().includes(q)) ||
                (c.short_name && c.short_name.toLowerCase().includes(q)) ||
                (c.label && c.label.toLowerCase().includes(q)) ||
                (c.key && c.key.toLowerCase().includes(q));
        });
    }
    get filteredFkGroups() {
        const q = (this.colSearchQuery || '').trim().toLowerCase();
        const groupsMap = new Map();
        this.allConfigColumns.forEach(c => {
            if (c.group && !c.is_temp && c.group !== 'Computed (fx)') {
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
                    (c.short_name && c.short_name.toLowerCase().includes(q)) ||
                    (c.label && c.label.toLowerCase().includes(q));
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
    get selectedOrderedColumns() {
        return this.allConfigColumns.filter(c => this.selectedColumnKeys.has(c.key));
    }
    moveSelectedColUp(colKey) {
        const selKeys = this.selectedOrderedColumns.map(c => c.key);
        const selIdx = selKeys.indexOf(colKey);
        if (selIdx <= 0)
            return;
        const prevSelKey = selKeys[selIdx - 1];
        const curIdx = this.allConfigColumns.findIndex(c => c.key === colKey);
        if (curIdx === -1)
            return;
        const [removed] = this.allConfigColumns.splice(curIdx, 1);
        const targetIdx = this.allConfigColumns.findIndex(c => c.key === prevSelKey);
        if (targetIdx !== -1) {
            this.allConfigColumns.splice(targetIdx, 0, removed);
        }
        else {
            this.allConfigColumns.unshift(removed);
        }
        this.allConfigColumns = [...this.allConfigColumns];
        this.autoSaveColumnConfig();
        this.cdr.markForCheck();
    }
    moveSelectedColDown(colKey) {
        const selKeys = this.selectedOrderedColumns.map(c => c.key);
        const selIdx = selKeys.indexOf(colKey);
        if (selIdx === -1 || selIdx >= selKeys.length - 1)
            return;
        const nextSelKey = selKeys[selIdx + 1];
        const curIdx = this.allConfigColumns.findIndex(c => c.key === colKey);
        if (curIdx === -1)
            return;
        const [removed] = this.allConfigColumns.splice(curIdx, 1);
        const targetIdx = this.allConfigColumns.findIndex(c => c.key === nextSelKey);
        if (targetIdx !== -1) {
            this.allConfigColumns.splice(targetIdx + 1, 0, removed);
        }
        else {
            this.allConfigColumns.push(removed);
        }
        this.allConfigColumns = [...this.allConfigColumns];
        this.autoSaveColumnConfig();
        this.cdr.markForCheck();
    }
    isDateCol(col) {
        if (!col)
            return false;
        const t = (col.type || col.field_type || '').toLowerCase();
        const k = (col.key || col.name || col.col_name || '').toLowerCase();
        return t === 'date' || t === 'datetime' || k.endsWith('_date') || k === 'date';
    }
    isNumberCol(col) {
        if (!col)
            return false;
        const t = (col.type || col.field_type || '').toLowerCase();
        const k = (col.key || col.name || col.col_name || '').toLowerCase();
        return t === 'number' || t === 'integer' || t === 'numeric' || t === 'float' || t === 'decimal' ||
            k === 'price' || k === 'amount' || k === 'total' || k === 'rate' || k === 'qty' || k === 'quantity';
    }
    saveColConfigTimeout = null;
    onColumnLabelChange(col) {
        this.cdr.markForCheck();
        if (this.saveColConfigTimeout)
            clearTimeout(this.saveColConfigTimeout);
        this.saveColConfigTimeout = setTimeout(() => {
            this.autoSaveColumnConfig();
        }, 600);
    }
    onColumnFormatChange(col) {
        this.cdr.markForCheck();
        this.autoSaveColumnConfig();
    }
    autoSaveColumnConfig() {
        const tbl = this.currentActiveTableName;
        if (!tbl || this.isCurrentSheetReport || this.isCurrentSheetRough)
            return;
        const selectedKeys = Array.from(this.selectedColumnKeys);
        const columnsPayload = this.allConfigColumns.map((c, i) => ({
            key: c.key,
            name: c.name,
            col_name: c.col_name || c.name || c.key,
            short_name: c.short_name,
            label: c.label || c.short_name || c.name,
            type: c.type,
            field_type: c.type || 'text',
            visible_list: this.selectedColumnKeys.has(c.key),
            display_format: c.display_format || null,
            ref_select: c.ref_select || null,
            sort_order: i
        }));
        const payload = {
            table_name: tbl,
            columns: columnsPayload,
            selected_keys: selectedKeys
        };
        // Save to localStorage immediately as local cache
        try {
            localStorage.setItem(`sutram_table_col_config_${tbl}`, JSON.stringify(payload));
        }
        catch { }
        // Save to backend sys_meta
        this.api.saveTableUiConfig(tbl, payload).subscribe({
            next: () => { },
            error: (err) => console.warn('[SutramStudio] Auto-saving col config error:', err)
        });
    }
    applySavedUiConfig(savedConfig) {
        if (!savedConfig)
            return;
        const savedCols = savedConfig.columns || (Array.isArray(savedConfig) ? savedConfig : []);
        const selectedKeys = savedConfig.selected_keys || [];
        // 1. Restore exact visibility selection ONLY if explicit non-empty selected_keys provided
        if (Array.isArray(selectedKeys) && selectedKeys.length > 0) {
            this.selectedColumnKeys = new Set(selectedKeys);
            selectedKeys.forEach(k => this.ensureRowCellsForColumn(k));
        }
        // 2. Restore custom label and display_format by exact key
        const colMap = new Map();
        savedCols.forEach(sc => {
            const k = sc.key || sc.name || sc.column_name;
            if (k)
                colMap.set(k, sc);
        });
        this.allConfigColumns.forEach(c => {
            const saved = colMap.get(c.key);
            if (saved) {
                if (saved.label !== undefined && saved.label !== null && String(saved.label).trim() !== '') {
                    c.label = saved.label;
                }
                if (saved.display_format !== undefined)
                    c.display_format = saved.display_format;
            }
        });
        // 3. Restore column order if sort_order was specified
        if (savedCols.some((sc) => sc.sort_order !== undefined)) {
            const orderMap = new Map();
            savedCols.forEach((sc, idx) => {
                const k = sc.key || sc.name || sc.column_name;
                if (k)
                    orderMap.set(k, sc.sort_order !== undefined ? sc.sort_order : idx);
            });
            this.allConfigColumns.sort((a, b) => {
                const orderA = orderMap.has(a.key) ? orderMap.get(a.key) : 9999;
                const orderB = orderMap.has(b.key) ? orderMap.get(b.key) : 9999;
                return orderA - orderB;
            });
        }
        this.allConfigColumns = [...this.allConfigColumns];
        this.selectedColumnKeys = new Set(this.selectedColumnKeys);
        this.cdr.markForCheck();
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
        this.autoSaveColumnConfig();
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
        this.autoSaveColumnConfig();
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
        this.autoSaveColumnConfig();
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
        this.autoSaveColumnConfig();
        this.cdr.markForCheck();
    }
    ensureRowCellsForColumn(key) {
        const colDef = this.allConfigColumns.find(c => c.key === key);
        if (!colDef)
            return;
        const rows = this.state.rows();
        let updated = false;
        if (colDef.is_temp) {
            rows.forEach((r, idx) => {
                if (!r.cells)
                    r.cells = {};
                if (!r.cells[key]) {
                    r.cells[key] = { value: '', isValid: true, isModified: false };
                }
                this.evaluateUiSutrasForRow(r, idx, true);
            });
            this.state.rows.set([...rows]);
            this.cdr.markForCheck();
            return;
        }
        rows.forEach(r => {
            if (r.cells && !r.cells[key] && r._rawOriginal) {
                const dr = r._rawOriginal;
                let rawVal;
                if (colDef.is_fk_subcol) {
                    const refObj = dr[colDef.ref_as || colDef.ref_table];
                    if (refObj && typeof refObj === 'object') {
                        rawVal = refObj[colDef.sub_col_name];
                    }
                    if (rawVal === undefined) {
                        rawVal = dr[key] ?? dr[`${colDef.ref_as || colDef.ref_table}.${colDef.sub_col_name}`] ?? dr[`${colDef.ref_table}_${colDef.sub_col_name}`] ?? dr[colDef.sub_col_name];
                    }
                    if (rawVal === undefined && colDef.ref_table) {
                        const rawFkId = dr[colDef.col_name] ?? dr[`${colDef.ref_table}_id`] ?? dr[colDef.ref_table];
                        if (rawFkId !== undefined && rawFkId !== null && rawFkId !== '') {
                            const match = this.refCache.findRefMatch(colDef.ref_table, '', undefined, rawFkId);
                            if (match.found && match.item && match.item[colDef.sub_col_name] !== undefined) {
                                rawVal = match.item[colDef.sub_col_name];
                            }
                        }
                    }
                }
                else if (colDef.is_fk_main || colDef.type === 'ref') {
                    const joined = dr[colDef.ref_as || colDef.name || colDef.ref_table];
                    if (joined && typeof joined === 'object') {
                        const formatted = this.refCache.formatOption(colDef.ref_table, joined, colDef.ref_select);
                        rawVal = formatted?.display;
                    }
                    else {
                        const rawFkId = dr[colDef.col_name] ?? dr[colDef.key] ?? dr[`${colDef.ref_table}_id`];
                        if (rawFkId !== undefined && rawFkId !== null && rawFkId !== '') {
                            const match = this.refCache.findRefMatch(colDef.ref_table, '', undefined, rawFkId);
                            if (match.found && match.display) {
                                rawVal = match.display;
                            }
                        }
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
        // Load persisted active user and role
        const savedActiveUser = localStorage.getItem('sutram_active_user');
        if (savedActiveUser) {
            try {
                const parsed = JSON.parse(savedActiveUser);
                if (parsed && (parsed.role === 'admin' || parsed.role === 'author')) {
                    this.currentUser = parsed;
                }
            }
            catch { }
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
                    this.allConfigColumns
                        .filter(c => c.is_fk_subcol && (c.ref_table || '').toLowerCase().trim() === cleanLoaded && this.selectedColumnKeys.has(c.key))
                        .forEach(c => this.ensureRowCellsForColumn(c.key));
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
    get currentActiveTableName() {
        const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
        return cur?.tableName || (cur?.type === 'table' ? cur.id : '') || this.selectedTableName || '';
    }
    get currentActiveSheetTitle() {
        const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
        if (!cur || cur.type === 'rough')
            return 'Rough Sheet';
        return cur.title || cur.tableName || cur.id;
    }
    // ── Settings Modals State ─────────────────────────────────────
    showTableConfigModal = false;
    showUiSutrasModal = false;
    showBackendSutrasModal = false;
    // 1. Table & Column Configuration
    tableConfigColumns = [];
    isSavingTableConfig = false;
    dateFormatOptions = [
        { label: 'DD/MM/YYYY (e.g. 10/11/2026)', value: 'DD/MM/YYYY' },
        { label: 'YYYY-MM-DD (e.g. 2026-11-10)', value: 'YYYY-MM-DD' },
        { label: 'DD-MMM-YYYY (e.g. 10-Nov-2026)', value: 'DD-MMM-YYYY' },
        { label: 'MM/DD/YYYY (e.g. 11/10/2026)', value: 'MM/DD/YYYY' }
    ];
    numberDecimalOptions = [
        { label: '0 Decimals (पूर्णांक / Integer)', value: '0' },
        { label: '2 Decimals (0.00)', value: '2' },
        { label: '4 Decimals (0.0000)', value: '4' },
        { label: 'मुद्रा प्रारूप (₹ Currency)', value: 'currency' }
    ];
    // 2. UI Sutras (Client-side Reactive Formulas & Temp Display Columns)
    uiSutrasList = [];
    isSavingUiSutras = false;
    selectedTargetColValue = null;
    newUiSutra = {
        target_col: '',
        display_name: '',
        formula: '',
        is_temp: false
    };
    targetColDropdownOptions = [];
    buildTargetColDropdownOptions() {
        const list = [
            { value: '__temp__', label: '➕ Temp Column (Virtual / स्क्रीन-ओनली Read-Only)', isTemp: true }
        ];
        // Gather ONLY direct physical columns of the CURRENT table:
        // Exclude temp/virtual columns and exclude reference table sub-columns (is_fk_subcol, dot notation)
        let sourceCols = [];
        if (this.allConfigColumns && this.allConfigColumns.length > 0) {
            sourceCols = this.allConfigColumns.filter(c => !c.is_temp &&
                !c.is_virtual &&
                !c.is_fk_subcol &&
                !(c.key && c.key.includes('.')) &&
                !c.sub_col_name);
        }
        if (sourceCols.length === 0 && this.state.headers().length > 0) {
            sourceCols = this.state.headers().filter((h) => !h.is_temp &&
                !h.is_virtual &&
                !h.is_fk_subcol &&
                !(h.key && h.key.includes('.')) &&
                !h.sub_col_name);
        }
        if (sourceCols.length === 0) {
            const cfg = this.state.config();
            if (cfg && cfg.headers) {
                sourceCols = cfg.headers.filter((h) => !h.is_temp &&
                    !h.is_virtual &&
                    !h.is_fk_subcol &&
                    !(h.key && h.key.includes('.')) &&
                    !h.sub_col_name);
            }
        }
        const seen = new Set();
        for (const col of sourceCols) {
            if (col.is_fk_subcol || (col.key && col.key.includes('.')) || col.sub_col_name)
                continue;
            const colId = col.name || col.col_name || col.key;
            if (!colId || seen.has(colId))
                continue;
            seen.add(colId);
            const displayLabel = col.name
                ? (col.col_name && col.col_name !== col.name ? `${col.name} (${col.col_name})` : col.name)
                : colId;
            list.push({
                value: colId,
                label: `${displayLabel} (DB Column)`
            });
        }
        this.targetColDropdownOptions = list;
    }
    get currentTableColumns() {
        const list = [];
        const sourceCols = (this.allConfigColumns && this.allConfigColumns.length > 0)
            ? this.allConfigColumns
            : (this.state.headers() || []);
        const seen = new Set();
        for (const c of sourceCols) {
            if (c.is_temp || c.is_virtual || c.is_fk_subcol || (c.key && c.key.includes('.')) || c.sub_col_name)
                continue;
            const colId = c.name || c.col_name || c.key;
            if (!colId || seen.has(colId))
                continue;
            seen.add(colId);
            list.push(c);
        }
        return list;
    }
    get referenceColumns() {
        const list = [];
        if (!this.allConfigColumns || this.allConfigColumns.length === 0)
            return list;
        const seen = new Set();
        for (const c of this.allConfigColumns) {
            if (c.is_fk_subcol || (c.key && c.key.includes('.')) || c.sub_col_name) {
                const colId = c.key || c.name || c.col_name;
                if (!colId || seen.has(colId))
                    continue;
                seen.add(colId);
                list.push(c);
            }
        }
        return list;
    }
    onTargetColChange(event) {
        const val = (event && typeof event === 'object' && 'value' in event) ? event.value : event;
        this.selectedTargetColValue = val;
        if (val === '__temp__') {
            this.newUiSutra.is_temp = true;
            this.newUiSutra.target_col = '';
            this.newUiSutra.display_name = '';
        }
        else if (val) {
            this.newUiSutra.is_temp = false;
            this.newUiSutra.target_col = val;
            this.newUiSutra.display_name = val;
        }
        else {
            this.newUiSutra.is_temp = false;
            this.newUiSutra.target_col = '';
            this.newUiSutra.display_name = '';
        }
        this.cdr.markForCheck();
    }
    // 3. Backend Sutras (Server-side Triggers)
    backendTriggersList = [];
    isLoadingTriggers = false;
    newTriggerDef = {
        trigger_name: '',
        event: 'INSERT',
        action_type: 'raw_sql',
        raw_sql: '',
        target_table: '',
        field_map_str: '{}'
    };
    // 4. Role & User Management (Frontend Rights Control)
    currentUser = {
        username: 'admin',
        display_name: 'Administrator',
        role: 'admin'
    };
    showUserManagementModal = false;
    usersList = [];
    isLoadingUsers = false;
    isSavingUser = false;
    editingUserId = null;
    userFormData = {
        username: '',
        password: '',
        display_name: '',
        role: 'author',
        active: 1
    };
    roleDropdownOptions = [
        { label: '👑 Admin (पूर्ण नियंत्रण - Triggers, Schema, Rules)', value: 'admin' },
        { label: '👤 Author (ऑपरेशनल - View, Edit, Column Visibility & Style)', value: 'author' }
    ];
    get isAdmin() {
        return this.currentUser?.role === 'admin';
    }
    get isAuthor() {
        return this.currentUser?.role === 'author';
    }
    switchRole(role) {
        if (!this.currentUser) {
            this.currentUser = { username: 'admin', display_name: 'Administrator', role: 'admin' };
        }
        this.currentUser.role = role;
        localStorage.setItem('sutram_active_user', JSON.stringify(this.currentUser));
        this.cdr.markForCheck();
    }
    toggleRole() {
        this.switchRole(this.isAdmin ? 'author' : 'admin');
    }
    // ── Table Config Actions ─────────────────────────────────────
    openTableConfigModal() {
        const tbl = this.currentActiveTableName;
        if (!tbl)
            return;
        this.api.getTableUiConfig(tbl).subscribe({
            next: (res) => {
                if (res && res.columns) {
                    this.tableConfigColumns = res.columns.filter((c) => c.name !== 'hl' && c.column_name !== 'hl');
                }
                else {
                    this.tableConfigColumns = (this.allConfigColumns.length > 0 ? this.allConfigColumns : this.visibleHeaders)
                        .filter(c => c.name !== 'hl')
                        .map(c => ({
                        column_name: c.name,
                        label: c.label || c.short_name || c.name,
                        field_type: c.type || 'text',
                        visible_list: this.selectedColumnKeys.has(c.key || c.name),
                        display_format: c.display_format || null,
                        ref_select: c.ref_select || null,
                        sort_order: 0
                    }));
                }
                this.showTableConfigModal = true;
                this.cdr.markForCheck();
            },
            error: () => {
                this.tableConfigColumns = (this.allConfigColumns.length > 0 ? this.allConfigColumns : this.visibleHeaders)
                    .filter(c => c.name !== 'hl')
                    .map(c => ({
                    column_name: c.name,
                    label: c.label || c.short_name || c.name,
                    field_type: c.type || 'text',
                    visible_list: this.selectedColumnKeys.has(c.key || c.name),
                    display_format: c.display_format || null,
                    ref_select: c.ref_select || null,
                    sort_order: 0
                }));
                this.showTableConfigModal = true;
                this.cdr.markForCheck();
            }
        });
    }
    moveConfigColUp(idx) {
        if (idx <= 0)
            return;
        const temp = this.tableConfigColumns[idx];
        this.tableConfigColumns[idx] = this.tableConfigColumns[idx - 1];
        this.tableConfigColumns[idx - 1] = temp;
        this.tableConfigColumns.forEach((c, i) => c.sort_order = i);
    }
    moveConfigColDown(idx) {
        if (idx >= this.tableConfigColumns.length - 1)
            return;
        const temp = this.tableConfigColumns[idx];
        this.tableConfigColumns[idx] = this.tableConfigColumns[idx + 1];
        this.tableConfigColumns[idx + 1] = temp;
        this.tableConfigColumns.forEach((c, i) => c.sort_order = i);
    }
    saveTableConfig() {
        const tbl = this.currentActiveTableName;
        if (!tbl)
            return;
        this.isSavingTableConfig = true;
        this.api.saveTableUiConfig(tbl, { columns: this.tableConfigColumns }).subscribe({
            next: () => {
                this.isSavingTableConfig = false;
                this.showTableConfigModal = false;
                const newSelected = new Set();
                this.tableConfigColumns.forEach(c => {
                    if (c.visible_list !== false) {
                        newSelected.add(c.column_name || c.name);
                    }
                });
                this.selectedColumnKeys = newSelected;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isSavingTableConfig = false;
                console.error('[SutramStudio] Error saving table config:', err);
            }
        });
    }
    get nonTempHeaders() {
        return this.visibleHeaders.filter(h => !h.is_temp && !h.is_virtual);
    }
    // ── UI Sutras Actions ────────────────────────────────────────
    loadUiSutras(tableName, callback) {
        if (!tableName)
            return;
        this.api.getUiSutras(tableName).subscribe({
            next: (list) => {
                this.uiSutrasList = list || [];
                this.syncTempColumnsToGrid();
                if (callback)
                    callback();
                const rows = this.state.rows();
                if (rows && rows.length > 0 && this.uiSutrasList.length > 0) {
                    rows.forEach((r, idx) => this.evaluateUiSutrasForRow(r, idx, true));
                    this.state.rows.set([...rows]);
                }
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            },
            error: () => {
                this.uiSutrasList = [];
                if (callback)
                    callback();
                this.cdr.markForCheck();
            }
        });
    }
    syncTempColumnsToGrid() {
        if (!this.uiSutrasList || this.uiSutrasList.length === 0)
            return;
        let anyAdded = false;
        for (const s of this.uiSutrasList) {
            if (s.is_temp) {
                const colKey = s.target_col;
                const exists = this.allConfigColumns.some(c => c.key === colKey);
                if (!exists) {
                    const tempCol = {
                        key: colKey,
                        name: colKey,
                        short_name: s.display_name || colKey,
                        col_name: colKey,
                        group: 'Computed (fx)',
                        is_temp: true,
                        is_virtual: true,
                        readonly: true,
                        type: 'string',
                        not_null: false,
                        default_selected: true
                    };
                    this.allConfigColumns.push(tempCol);
                    this.selectedColumnKeys.add(colKey);
                    anyAdded = true;
                }
                else {
                    if (!this.selectedColumnKeys.has(colKey)) {
                        this.selectedColumnKeys.add(colKey);
                        anyAdded = true;
                    }
                }
                // Initialize cell in all loaded rows if missing
                const rows = this.state.rows();
                for (const r of rows) {
                    if (r.cells && !r.cells[colKey]) {
                        r.cells[colKey] = { value: '', isValid: true, isModified: false };
                    }
                }
            }
        }
        if (anyAdded) {
            this.allConfigColumns = [...this.allConfigColumns];
            this.selectedColumnKeys = new Set(this.selectedColumnKeys);
        }
        const rows = this.state.rows();
        if (rows && rows.length > 0) {
            rows.forEach((r, idx) => this.evaluateUiSutrasForRow(r, idx, true));
            this.state.rows.set([...rows]);
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
    }
    openUiSutrasModal() {
        const tbl = this.currentActiveTableName;
        if (!tbl)
            return;
        this.loadUiSutras(tbl, () => {
            this.buildTargetColDropdownOptions();
            this.newUiSutra = { target_col: '', display_name: '', formula: '', is_temp: false };
            this.selectedTargetColValue = null;
            this.showUiSutrasModal = true;
            this.cdr.markForCheck();
        });
    }
    addUiSutra() {
        if (!this.newUiSutra.formula)
            return;
        if (this.newUiSutra.is_temp) {
            if (!this.newUiSutra.display_name?.trim())
                return;
            const cleanKey = this.newUiSutra.display_name
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9_]+/g, '_')
                .replace(/^_+|_+$/g, '');
            this.newUiSutra.target_col = cleanKey ? `col_${cleanKey}` : `temp_${Date.now()}`;
        }
        else {
            if (!this.newUiSutra.target_col)
                return;
            this.newUiSutra.display_name = this.newUiSutra.target_col;
        }
        this.uiSutrasList.push({ ...this.newUiSutra });
        this.newUiSutra = { target_col: '', display_name: '', formula: '', is_temp: false };
        this.selectedTargetColValue = null;
        this.buildTargetColDropdownOptions();
    }
    removeUiSutra(idx) {
        const removed = this.uiSutrasList[idx];
        this.uiSutrasList.splice(idx, 1);
        if (removed && removed.is_temp) {
            this.allConfigColumns = this.allConfigColumns.filter(c => c.key !== removed.target_col);
            this.selectedColumnKeys.delete(removed.target_col);
            this.buildTargetColDropdownOptions();
            this.cdr.markForCheck();
        }
    }
    insertColIntoFormula(colName) {
        this.newUiSutra.formula = (this.newUiSutra.formula || '') + `[${colName}]`;
    }
    insertFnIntoFormula(fnText) {
        this.newUiSutra.formula = (this.newUiSutra.formula || '') + fnText;
    }
    saveUiSutras() {
        const tbl = this.currentActiveTableName;
        if (!tbl)
            return;
        this.isSavingUiSutras = true;
        this.api.saveUiSutras(tbl, this.uiSutrasList).subscribe({
            next: () => {
                this.isSavingUiSutras = false;
                this.showUiSutrasModal = false;
                this.syncTempColumnsToGrid();
                const rows = this.state.rows();
                rows.forEach((r, idx) => this.evaluateUiSutrasForRow(r, idx, false));
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isSavingUiSutras = false;
                console.error('[SutramStudio] Error saving UI sutras:', err);
            }
        });
    }
    // ── Backend Sutras Actions ───────────────────────────────────
    openBackendSutrasModal() {
        const tbl = this.currentActiveTableName;
        if (!tbl)
            return;
        this.isLoadingTriggers = true;
        this.api.getTableTriggers(tbl).subscribe({
            next: (res) => {
                this.isLoadingTriggers = false;
                this.backendTriggersList = res || [];
                this.newTriggerDef = {
                    trigger_name: `trg_${tbl}_sync`,
                    event: 'INSERT',
                    action_type: 'raw_sql',
                    raw_sql: '',
                    target_table: this.tablesList.length > 0 ? this.tablesList[0].table : '',
                    field_map_str: '{}'
                };
                this.showBackendSutrasModal = true;
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoadingTriggers = false;
                this.backendTriggersList = [];
                this.newTriggerDef = {
                    trigger_name: `trg_${tbl}_sync`,
                    event: 'INSERT',
                    action_type: 'raw_sql',
                    raw_sql: '',
                    target_table: this.tablesList.length > 0 ? this.tablesList[0].table : '',
                    field_map_str: '{}'
                };
                this.showBackendSutrasModal = true;
                this.cdr.markForCheck();
            }
        });
    }
    insertColIntoTriggerSql(colName, prefix = ':new.') {
        const snippet = `${prefix}${colName}`;
        this.newTriggerDef.raw_sql = (this.newTriggerDef.raw_sql || '') + snippet;
    }
    insertTextIntoTriggerSql(text) {
        this.newTriggerDef.raw_sql = (this.newTriggerDef.raw_sql || '') + text;
    }
    createBackendTrigger() {
        const tbl = this.currentActiveTableName;
        if (!tbl || !this.newTriggerDef.trigger_name)
            return;
        let fieldMap = {};
        try {
            fieldMap = JSON.parse(this.newTriggerDef.field_map_str || '{}');
        }
        catch { }
        const payload = {
            trigger_name: this.newTriggerDef.trigger_name,
            label: this.newTriggerDef.trigger_name,
            source_table: tbl,
            event: this.newTriggerDef.event,
            actions: [
                {
                    sort_order: 0,
                    action_type: this.newTriggerDef.action_type || 'raw_sql',
                    target_table: this.newTriggerDef.target_table || null,
                    field_map: fieldMap,
                    raw_sql: this.newTriggerDef.raw_sql ? this.newTriggerDef.raw_sql.trim() : null
                }
            ]
        };
        this.api.createTrigger(payload).subscribe({
            next: () => {
                this.openBackendSutrasModal();
            },
            error: (err) => console.error('[SutramStudio] Create trigger error:', err)
        });
    }
    deleteBackendTrigger(id) {
        this.api.deleteTrigger(id).subscribe({
            next: () => {
                this.backendTriggersList = this.backendTriggersList.filter(t => t._id !== id);
                this.cdr.markForCheck();
            },
            error: (err) => console.error('[SutramStudio] Delete trigger error:', err)
        });
    }
    // ── User Management Actions ──────────────────────────────────
    openUserManagementModal() {
        this.showUserManagementModal = true;
        this.editingUserId = null;
        this.userFormData = {
            username: '',
            password: '',
            display_name: '',
            role: 'author',
            active: 1
        };
        this.loadUsers();
        this.cdr.markForCheck();
    }
    loadUsers() {
        this.isLoadingUsers = true;
        this.api.getUsers().subscribe({
            next: (users) => {
                this.usersList = users || [];
                this.isLoadingUsers = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isLoadingUsers = false;
                console.error('[SutramStudio] Error loading users:', err);
                this.cdr.markForCheck();
            }
        });
    }
    openAddUser() {
        this.editingUserId = null;
        this.userFormData = {
            username: '',
            password: '',
            display_name: '',
            role: 'author',
            active: 1
        };
    }
    editUser(u) {
        this.editingUserId = u._id;
        this.userFormData = {
            username: u.username,
            password: '',
            display_name: u.display_name || u.username,
            role: u.role || 'author',
            active: u.active !== undefined ? u.active : 1
        };
    }
    cancelUserEdit() {
        this.editingUserId = null;
        this.userFormData = { username: '', password: '', display_name: '', role: 'author', active: 1 };
    }
    saveUser() {
        if (!this.userFormData.username?.trim())
            return;
        if (!this.editingUserId && !this.userFormData.password?.trim())
            return;
        this.isSavingUser = true;
        if (this.editingUserId) {
            this.api.updateUser(this.editingUserId, this.userFormData).subscribe({
                next: () => {
                    this.isSavingUser = false;
                    this.cancelUserEdit();
                    this.loadUsers();
                },
                error: (err) => {
                    this.isSavingUser = false;
                    alert('Error updating user: ' + (err?.error?.error || err.message));
                }
            });
        }
        else {
            this.api.createUser(this.userFormData).subscribe({
                next: () => {
                    this.isSavingUser = false;
                    this.cancelUserEdit();
                    this.loadUsers();
                },
                error: (err) => {
                    this.isSavingUser = false;
                    alert('Error creating user: ' + (err?.error?.error || err.message));
                }
            });
        }
    }
    deleteUser(u) {
        if (!confirm(`Are you sure you want to delete user "${u.username}"?`))
            return;
        this.api.deleteUser(u._id).subscribe({
            next: () => {
                this.loadUsers();
            },
            error: (err) => {
                alert('Error deleting user: ' + (err?.error?.error || err.message));
            }
        });
    }
    setCurrentActiveUser(u) {
        this.currentUser = {
            username: u.username,
            display_name: u.display_name || u.username,
            role: u.role || 'author'
        };
        localStorage.setItem('sutram_active_user', JSON.stringify(this.currentUser));
        this.cdr.markForCheck();
    }
    // ── Reactive Cell Changed & Highlight Auto-persistence ────────
    onGridCellChanged(event) {
        const rows = this.state.rows();
        const row = rows[event.rowIdx];
        if (!row)
            return;
        if (event.colKey === 'hl') {
            const rowId = row._rawOriginal?._id ?? row._rawOriginal?.id ?? row.cells?.['_id']?.value;
            if (rowId !== undefined && rowId !== null && this.currentActiveTableName && !this.isCurrentSheetRough) {
                this.api.updateRow(this.currentActiveTableName, {
                    _id: rowId,
                    hl: event.value ? 1 : 0
                }).subscribe({
                    next: () => {
                        if (row._rawOriginal)
                            row._rawOriginal.hl = event.value ? 1 : 0;
                        this.cdr.markForCheck();
                    },
                    error: (err) => console.warn('[SutramStudio] Error persisting row highlight:', err)
                });
            }
            return;
        }
        if (this.uiSutrasList.length > 0) {
            this.evaluateUiSutrasForRow(row, event.rowIdx);
        }
    }
    evaluateUiSutrasForRow(row, rowIdx, isInitialOrDisplayLoad = false) {
        if (!row || !row.cells || this.uiSutrasList.length === 0)
            return;
        let anyChanged = false;
        const helpers = {
            AGE: (dobVal) => {
                if (!dobVal)
                    return '';
                const birth = new Date(dobVal);
                if (isNaN(birth.getTime()))
                    return '';
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                return age >= 0 ? age : 0;
            },
            DAYS: (d1, d2) => {
                if (!d1 || !d2)
                    return 0;
                const t1 = new Date(d1).getTime();
                const t2 = new Date(d2).getTime();
                if (isNaN(t1) || isNaN(t2))
                    return 0;
                return Math.round(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24));
            },
            YEAR: (d) => {
                if (!d)
                    return '';
                const dt = new Date(d);
                return isNaN(dt.getTime()) ? '' : dt.getFullYear();
            },
            MONTH: (d) => {
                if (!d)
                    return '';
                const dt = new Date(d);
                return isNaN(dt.getTime()) ? '' : dt.getMonth() + 1;
            },
            DAY: (d) => {
                if (!d)
                    return '';
                const dt = new Date(d);
                return isNaN(dt.getTime()) ? '' : dt.getDate();
            },
            IF: (cond, a, b) => (cond ? a : b),
            ROUND: (num, decimals = 2) => {
                const n = Number(num);
                if (isNaN(n))
                    return 0;
                const factor = Math.pow(10, decimals);
                return Math.round(n * factor) / factor;
            },
            UPPER: (str) => (str !== null && str !== undefined ? String(str).toUpperCase() : ''),
            LOWER: (str) => (str !== null && str !== undefined ? String(str).toLowerCase() : ''),
            COALESCE: (...args) => args.find(v => v !== null && v !== undefined && v !== '') ?? ''
        };
        const colNames = Object.keys(row.cells);
        // Helper to get raw or cell value across all aliases (col_name, name, key, short_name)
        const getColValue = (colIdentifier) => {
            if (!colIdentifier)
                return undefined;
            // 1. Direct cell match in row.cells
            if (row.cells[colIdentifier] && row.cells[colIdentifier].value !== undefined) {
                return row.cells[colIdentifier].value;
            }
            // 2. Match in allConfigColumns or cfg.headers by name, col_name, key, or short_name
            const match = this.allConfigColumns.find(c => c.name === colIdentifier ||
                c.col_name === colIdentifier ||
                c.key === colIdentifier ||
                c.short_name === colIdentifier);
            if (match) {
                if (match.col_name && row.cells[match.col_name]?.value !== undefined) {
                    return row.cells[match.col_name].value;
                }
                if (match.name && row.cells[match.name]?.value !== undefined) {
                    return row.cells[match.name].value;
                }
                if (match.key && row.cells[match.key]?.value !== undefined) {
                    return row.cells[match.key].value;
                }
            }
            // 3. Fallback to row root property or raw original
            if (row[colIdentifier] !== undefined) {
                return row[colIdentifier];
            }
            if (row._rawOriginal && row._rawOriginal[colIdentifier] !== undefined) {
                return row._rawOriginal[colIdentifier];
            }
            return undefined;
        };
        for (const sutra of this.uiSutrasList) {
            if (!sutra.target_col || !sutra.formula)
                continue;
            // RULE: On initial/display load, ONLY calculate temp/virtual columns!
            // Never overwrite stored database values in physical columns!
            if (isInitialOrDisplayLoad && !sutra.is_temp) {
                continue;
            }
            try {
                const rawFormula = sutra.formula.trim();
                let finalVal = undefined;
                // 1. Direct Column Copy: e.g. [colB] or colB
                const directBracketMatch = rawFormula.match(/^\[([^\]]+)\]$/);
                const directColName = directBracketMatch ? directBracketMatch[1] : (colNames.includes(rawFormula) ? rawFormula : null);
                if (directColName) {
                    const srcVal = getColValue(directColName);
                    finalVal = (srcVal !== undefined) ? srcVal : null;
                }
                else {
                    // 2. Computed Expression / Function block
                    const rowData = {};
                    for (const c of colNames) {
                        rowData[c] = row.cells[c]?.value;
                    }
                    this.allConfigColumns.forEach(c => {
                        const cell = row.cells[c.col_name] || row.cells[c.name] || (c.key ? row.cells[c.key] : undefined);
                        if (cell && cell.value !== undefined) {
                            if (c.col_name)
                                rowData[c.col_name] = cell.value;
                            if (c.name)
                                rowData[c.name] = cell.value;
                            if (c.key)
                                rowData[c.key] = cell.value;
                        }
                    });
                    for (const k of Object.keys(row)) {
                        if (k !== 'cells' && !(k in rowData)) {
                            rowData[k] = row[k];
                        }
                    }
                    let code = rawFormula;
                    code = code.replace(/\[([^\]]+)\]/g, "row['$1']");
                    if (code.includes('return ')) {
                        const fn = new Function('row', 'helpers', `
              'use strict';
              const { AGE, DAYS, YEAR, MONTH, DAY, IF, ROUND, UPPER, LOWER, COALESCE } = helpers;
              ${code}
            `);
                        finalVal = fn(rowData, helpers);
                    }
                    else {
                        const fn = new Function('row', 'helpers', `
              'use strict';
              const { AGE, DAYS, YEAR, MONTH, DAY, IF, ROUND, UPPER, LOWER, COALESCE } = helpers;
              return (${code});
            `);
                        finalVal = fn(rowData, helpers);
                    }
                }
                if (finalVal !== undefined) {
                    const currentVal = row.cells[sutra.target_col]?.value;
                    if (currentVal !== finalVal) {
                        if (sutra.is_temp) {
                            // Temp column: In-memory only, never marks row modified/dirty
                            if (row.cells[sutra.target_col]) {
                                row.cells[sutra.target_col].value = finalVal;
                                row.cells[sutra.target_col].refId = finalVal;
                                row.cells[sutra.target_col].isModified = false;
                            }
                            else {
                                row.cells[sutra.target_col] = { value: finalVal, refId: finalVal, isValid: true, isModified: false };
                            }
                            anyChanged = true;
                        }
                        else {
                            // Real DB column: update all alias keys in row.cells and mark modified so it persists to DB
                            const matchingCol = this.allConfigColumns.find(c => c.name === sutra.target_col ||
                                c.col_name === sutra.target_col ||
                                c.key === sutra.target_col);
                            const keysToUpdate = new Set();
                            keysToUpdate.add(sutra.target_col);
                            if (matchingCol?.col_name)
                                keysToUpdate.add(matchingCol.col_name);
                            if (matchingCol?.name)
                                keysToUpdate.add(matchingCol.name);
                            if (matchingCol?.key)
                                keysToUpdate.add(matchingCol.key);
                            keysToUpdate.forEach(k => {
                                if (row.cells[k]) {
                                    row.cells[k].value = finalVal;
                                    row.cells[k].refId = finalVal;
                                    row.cells[k].isModified = true;
                                }
                                else {
                                    row.cells[k] = { value: finalVal, refId: finalVal, isValid: true, isModified: true };
                                }
                            });
                            row.isModified = true;
                            this.state.updateCellValue(rowIdx, sutra.target_col, finalVal, finalVal);
                            if (matchingCol?.col_name && matchingCol.col_name !== sutra.target_col) {
                                this.state.updateCellValue(rowIdx, matchingCol.col_name, finalVal, finalVal);
                            }
                            anyChanged = true;
                        }
                    }
                }
            }
            catch (e) {
                console.warn('[SutramStudio] UI Sutra eval error for col', sutra.target_col, e);
            }
        }
        if (anyChanged) {
            this.cdr.markForCheck();
        }
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
        this.persistOpenTabs();
        this.cdr.markForCheck();
    }
    persistOpenTabs() {
        try {
            if (this.activeSheetId) {
                localStorage.setItem('sutram_studio_last_active_tab', this.activeSheetId);
            }
            if (Array.isArray(this.sheetTabs) && this.sheetTabs.length > 0) {
                const toSave = this.sheetTabs.map(t => ({
                    id: t.id,
                    title: t.title,
                    type: t.type,
                    tableName: t.tableName,
                    reportId: t.reportId
                }));
                localStorage.setItem('sutram_studio_open_tabs', JSON.stringify(toSave));
            }
        }
        catch { }
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
    /**
     * Refreshes the list of tables in Sutram Studio (e.g. after dynamic table creation).
     * Optionally opens and activates the specified table sheet.
     */
    refreshStudioTables(activeTableName) {
        this.api.getRegisteredTables().subscribe({
            next: (tables) => {
                this.tablesList = tables || [];
                if (activeTableName) {
                    this.openTableInSheet(activeTableName);
                }
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('[SutramStudio] Refresh tables failed:', err);
                if (activeTableName) {
                    this.openTableInSheet(activeTableName);
                }
                this.cdr.markForCheck();
            }
        });
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
            this.favoriteTables = new Set();
        }
        const savedFavReps = localStorage.getItem('sutram_favorite_reports');
        if (savedFavReps) {
            try {
                this.favoriteReports = new Set(JSON.parse(savedFavReps));
            }
            catch { }
        }
        // Dynamic Reports fetching from API
        if (!this.reportsList || this.reportsList.length === 0) {
            this.api.getReports().subscribe({
                next: (reps) => {
                    this.reportsList = reps || [];
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    console.warn('[SutramStudio] Dynamic reports load warning:', err?.message || err);
                    this.reportsList = [];
                    this.cdr.markForCheck();
                }
            });
        }
        this.api.getRegisteredTables().subscribe({
            next: (tables) => {
                this.tablesList = tables;
                // Build active session sheets:
                // 1. Always start with Sheet 1
                const activeTabs = [
                    { id: 'rough_1', title: 'Sheet 1', icon: 'pi-file', type: 'rough', isLoaded: true }
                ];
                const existingTabIds = new Set(activeTabs.map(t => t.id));
                // 2. Restore previously opened sheets/tabs if any
                try {
                    const raw = localStorage.getItem('sutram_studio_open_tabs');
                    if (raw) {
                        const savedTabs = JSON.parse(raw);
                        if (Array.isArray(savedTabs)) {
                            savedTabs.forEach((st) => {
                                if (st.id && !existingTabIds.has(st.id)) {
                                    if (st.type === 'table') {
                                        const tableInfo = tables.find(t => t.table === (st.tableName || st.id));
                                        activeTabs.push({
                                            id: st.id,
                                            title: st.title || tableInfo?.display_name || st.tableName || st.id,
                                            icon: 'pi-table',
                                            type: 'table',
                                            tableName: st.tableName || st.id,
                                            isLoaded: false,
                                            recordCount: 0
                                        });
                                        existingTabIds.add(st.id);
                                    }
                                    else if (st.type === 'rough' && st.id !== 'rough_1') {
                                        activeTabs.push({
                                            id: st.id,
                                            title: st.title || 'Sheet',
                                            icon: 'pi-file',
                                            type: 'rough',
                                            isLoaded: false
                                        });
                                        existingTabIds.add(st.id);
                                    }
                                }
                            });
                        }
                    }
                }
                catch { }
                // 3. Add pinned / favorite tables not already opened
                tables.forEach((t) => {
                    if (this.favoriteTables.has(t.table) && !existingTabIds.has(t.table)) {
                        activeTabs.push({
                            id: t.table,
                            title: t.display_name || t.table,
                            icon: 'pi-table',
                            type: 'table',
                            tableName: t.table,
                            isLoaded: false,
                            recordCount: 0
                        });
                        existingTabIds.add(t.table);
                    }
                });
                this.sheetTabs = activeTabs;
                // Choose initial active sheet: last active tab if valid, else first table, else rough_1
                const lastActive = localStorage.getItem('sutram_studio_last_active_tab');
                const targetTab = (lastActive && activeTabs.find(t => t.id === lastActive))
                    ? activeTabs.find(t => t.id === lastActive)
                    : (activeTabs.find(t => t.type === 'table') || activeTabs[0]);
                if (targetTab.type === 'table' && targetTab.tableName) {
                    this.activeSheetId = targetTab.id;
                    this.selectedTableName = targetTab.tableName;
                    this.onTableSelect(targetTab.tableName, true);
                }
                else {
                    this.activeSheetId = targetTab.id;
                    this.selectedTableName = '';
                    this.switchSheet(targetTab.id);
                }
                this.persistOpenTabs();
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
        this.persistOpenTabs();
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
                // Check localStorage first for instant restore
                let restoredFromLocal = false;
                try {
                    const cached = localStorage.getItem(`sutram_table_col_config_${tableName}`);
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        if (parsed && Array.isArray(parsed.selected_keys) && parsed.selected_keys.length > 0) {
                            this.applySavedUiConfig(parsed);
                            restoredFromLocal = true;
                        }
                    }
                }
                catch { }
                // Apply any saved UI column preferences from backend sys_meta
                this.api.getTableUiConfig(tableName).subscribe({
                    next: (uiRes) => {
                        if (uiRes && Array.isArray(uiRes.selected_keys) && uiRes.selected_keys.length > 0) {
                            this.applySavedUiConfig(uiRes);
                            try {
                                localStorage.setItem(`sutram_table_col_config_${tableName}`, JSON.stringify(uiRes));
                            }
                            catch { }
                        }
                        else if (restoredFromLocal) {
                            // Sync local preferences to backend sys_meta if backend was clean
                            this.autoSaveColumnConfig();
                        }
                    },
                    error: () => { }
                });
                // Auto-load UI reactive sutras / formulas for this table and sync temp columns
                this.loadUiSutras(tableName, () => {
                    this.syncTempColumnsToGrid();
                });
                // Preload all referenced FK tables and register their display configurations
                if (cfg && cfg.headers) {
                    const refHeaders = cfg.headers.filter((h) => h.ref_table || h.type === 'ref');
                    for (const h of refHeaders) {
                        const cols = h.ref_select || (h.ref_data ? [h.ref_data] : []);
                        if (h.ref_table && cols.length > 0) {
                            this.refCache.registerTableConfig(h.ref_table, {
                                ref_select: cols,
                                ref_data: h.ref_data
                            });
                        }
                    }
                    const refTables = refHeaders
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
        this.persistOpenTabs();
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
                if (rawVal === undefined) {
                    rawVal = dr[col.key] ?? dr[`${col.ref_as || col.ref_table}.${col.sub_col_name}`] ?? dr[`${col.ref_table}_${col.sub_col_name}`] ?? dr[col.sub_col_name];
                }
                if (rawVal === undefined && col.ref_table) {
                    const rawFkId = dr[col.col_name] ?? dr[`${col.ref_table}_id`] ?? dr[col.ref_table];
                    if (rawFkId !== undefined && rawFkId !== null && rawFkId !== '') {
                        const match = this.refCache.findRefMatch(col.ref_table, '', undefined, rawFkId);
                        if (match.found && match.item && match.item[col.sub_col_name] !== undefined) {
                            rawVal = match.item[col.sub_col_name];
                        }
                    }
                }
            }
            else if (col.is_fk_main || col.type === 'ref') {
                const joined = dr[col.ref_as || col.name || col.ref_table];
                if (joined && typeof joined === 'object') {
                    const formatted = this.refCache.formatOption(col.ref_table, joined, col.ref_select);
                    if (formatted && formatted.display) {
                        rawVal = formatted.display;
                    }
                }
                else {
                    // If not joined object, match by foreign key ID
                    const rawFkId = dr[col.col_name] ?? dr[col.key] ?? dr[`${col.ref_table}_id`];
                    if (rawFkId !== undefined && rawFkId !== null && rawFkId !== '') {
                        const match = this.refCache.findRefMatch(col.ref_table, '', undefined, rawFkId);
                        if (match.found && match.display) {
                            rawVal = match.display;
                        }
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
            if (col.col_name && col.col_name !== cellKey) {
                cells[col.col_name] = cells[cellKey];
            }
        });
        const isHl = !!(dr.hl === 1 || dr.hl === true || dr.hl === '1');
        if (!cells['hl']) {
            cells['hl'] = {
                value: isHl ? 1 : 0,
                originalValue: isHl ? 1 : 0,
                isValid: true,
                isModified: false
            };
        }
        return {
            rowNum,
            cells,
            hasError: false,
            errorCount: 0,
            isHighlighted: isHl,
            hl: isHl ? 1 : 0,
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
            if (col.col_name && col.col_name !== cellKey) {
                cells[col.col_name] = cells[cellKey];
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
                // Evaluate UI reactive sutras on loaded rows (initial display load: only temp columns)
                if (this.uiSutrasList && this.uiSutrasList.length > 0) {
                    combined.forEach((r, idx) => this.evaluateUiSutrasForRow(r, idx, true));
                }
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
                    if (h.is_temp || h.is_virtual)
                        return;
                    const cell = r.cells[h.col_name] || r.cells[h.name] || (h.key ? r.cells[h.key] : undefined);
                    let val;
                    const isFk = !!(h.ref_table || h.type === 'ref');
                    if (isFk) {
                        val = (cell?.refId !== undefined && cell?.refId !== null && cell?.refId !== '')
                            ? cell.refId
                            : (cell?.value ?? null);
                    }
                    else {
                        val = (cell?.value !== undefined && cell?.value !== null)
                            ? cell.value
                            : (cell?.refId !== undefined && cell?.refId !== null ? cell.refId : null);
                    }
                    if (val === '') {
                        const colType = (h.type || '').toLowerCase();
                        if (['number', 'integer', 'int', 'float', 'double', 'decimal', 'date', 'datetime', 'timestamp'].includes(colType)) {
                            val = null;
                        }
                    }
                    payload[h.col_name] = val;
                });
                const rowId = r._id || r._rawOriginal?._id || r._rawOriginal?.id;
                const isUpdate = !r.isNew && !!rowId;
                if (isUpdate) {
                    payload._id = rowId;
                }
                else {
                    delete payload._id;
                    delete payload.id;
                }
                if (r.hl !== undefined) {
                    payload.hl = r.hl ? 1 : 0;
                }
                try {
                    const res = isUpdate
                        ? await firstValueFrom(this.api.updateRow(this.selectedTableName, payload))
                        : await firstValueFrom(this.api.importRow(this.selectedTableName, payload));
                    if (res?.status === 'inserted') {
                        progress.inserted++;
                        syncedRowNums.push(r.rowNum);
                        const anyRes = res;
                        const newInsertedId = anyRes?.newData?._id || anyRes?.data?._id || (typeof anyRes?.newData === 'number' ? anyRes.newData : null);
                        if (newInsertedId) {
                            r._id = newInsertedId;
                            if (r._rawOriginal)
                                r._rawOriginal._id = newInsertedId;
                            if (r.cells && r.cells['_id'])
                                r.cells['_id'].value = newInsertedId;
                            syncedRowNums.push(newInsertedId);
                        }
                        if (rowId)
                            syncedRowNums.push(rowId);
                        this.state.totalDbRecords.update((n) => n + 1);
                        r.isNew = false;
                        r.isModified = false;
                    }
                    else if (res?.status === 'updated') {
                        progress.updated++;
                        syncedRowNums.push(r.rowNum);
                        if (rowId)
                            syncedRowNums.push(rowId);
                        r.isModified = false;
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
        } }, inputs: { table: "table", mode: "mode", apiBase: "apiBase", enableFilters: "enableFilters", enableSorting: "enableSorting", enableSearch: "enableSearch", enableControlBar: "enableControlBar", enableStatsBar: "enableStatsBar", enableUpload: "enableUpload", enableAudit: "enableAudit", enableAddRow: "enableAddRow", enableCorrections: "enableCorrections", enableLoadData: "enableLoadData", enableVerify: "enableVerify", enableSync: "enableSync", enableDelete: "enableDelete", enableTabs: "enableTabs", enableZoom: "enableZoom", reportsList: "reportsList" }, decls: 199, vars: 135, consts: [[1, "sutram-excel-container"], [1, "studio-header"], [1, "ribbon-menu-bar"], [1, "menu-bar-left"], [1, "brand"], [1, "brand-icon"], [1, "pi", "pi-table"], [1, "brand-title"], [1, "version-tag"], [1, "ribbon-tabs-nav"], ["type", "button", 1, "ribbon-tab-btn", 3, "click"], [1, "pi", "pi-home"], [1, "pi", "pi-database"], [1, "ribbon-badge"], [1, "pi", "pi-chart-bar"], [1, "pi", "pi-cog"], [1, "menu-bar-right"], ["class", "mode-pill-toggle", 4, "ngIf"], ["type", "button", "class", "cmd-btn-save-top", 3, "title", "click", 4, "ngIf"], ["type", "button", "class", "cmd-btn-sync-top", "title", "Sync changes to Database (Ctrl+S)", 3, "has-pending", "disabled", "click", 4, "ngIf"], ["title", "Toggle Light / Dark Mode", 1, "cmd-btn", 2, "padding", "3px 6px", 3, "click"], [1, "pi", 3, "ngClass"], [1, "user-role-badge-pill", 3, "title", "click"], [1, "user-name-txt"], [1, "role-pill-tag"], [1, "ribbon-strip"], ["class", "ribbon-content-row", 4, "ngIf"], ["class", "ribbon-scroll-row", 4, "ngIf"], [1, "formula-bar-row"], [1, "coord-box"], [1, "active-col-chip"], [2, "font-weight", "700", "font-style", "italic", "color", "var(--text-muted)", "margin", "0 4px"], ["type", "text", "placeholder", "Select a cell or type value here...", 1, "formula-input", 3, "ngModel", "ngModelChange"], [1, "formula-bar-right-area"], [1, "formula-search-field"], [1, "pi", "pi-search", "search-ico"], ["type", "text", "placeholder", "Direct DB Search...", 1, "formula-search-inp", 3, "ngModel", "ngModelChange"], ["class", "clear-btn-inline", "title", "Clear search", 3, "click", 4, "ngIf"], ["class", "spin-inline", 4, "ngIf"], ["class", "formula-record-pill", "title", "Total database records", 4, "ngIf"], ["styleClass", "sutram-col-config-popover shadow-lg", 3, "dismissable"], ["colConfigOp", ""], ["pTemplate", "content"], [1, "status-strip", 3, "ngClass"], [2, "display", "flex", "align-items", "center", "gap", "6px"], [4, "ngIf"], [1, "spreadsheet-canvas", "flex-grow-1"], [3, "headers", "rows", "filterOnlyErrors", "enableDelete", "isBold", "textAlign", "booleanStyle", "loadMore", "filterChanged", "sortChanged", "cellChanged", "solveAllTriggered", "openConfig"], ["grid", ""], [1, "studio-footer"], [1, "sheet-tabs-bar"], ["class", "tab-pill", 3, "active-tab", "click", "dblclick", "contextmenu", 4, "ngFor", "ngForOf"], ["title", "Add Blank Sheet", 1, "add-tab-btn", 3, "click"], [1, "pi", "pi-plus", 2, "font-size", "10px"], ["class", "tab-context-menu", 3, "left", "top", "click", 4, "ngIf"], [1, "bottom-status-subrow"], [2, "display", "flex", "align-items", "center", "gap", "10px"], ["class", "text-primary small fw-semibold", 4, "ngIf"], ["class", "badge bg-soft-warning text-warning small fw-semibold", 4, "ngIf"], ["style", "color: #10b981; font-weight: 600;", 4, "ngIf"], ["style", "color: #ef4444; font-weight: 600;", 4, "ngIf"], ["class", "last-sync-badge", 3, "sync-error", 4, "ngIf"], [2, "font-size", "10.5px", "opacity", "0.8"], [1, "zoom-controls"], ["title", "Zoom Out (-10%)", 1, "zoom-btn", 3, "click"], [1, "pi", "pi-minus"], ["title", "Reset to 100%", 1, "zoom-display", 3, "click"], ["title", "Zoom In (+10%)", 1, "zoom-btn", 3, "click"], [1, "pi", "pi-plus"], ["class", "sync-toast-hud shadow-lg", 4, "ngIf"], [3, "visible", "fileName", "sheetNames", "currentSheetName", "sheetHeaders", "sampleRows", "totalRows", "tablesList", "selectedTable", "report", "availableHeaders", "isTableConfigLoading", "savedSheets", "visibleChange", "sheetChange", "targetTableChange", "openDirectNormal", "openMappedToTable", "openSavedSheet", "deleteSavedSheet", "triggerFileInput"], [3, "visible", "groups", "visibleChange"], ["styleClass", "sutram-studio-dialog", 3, "visible", "modal", "dismissableMask", "draggable", "resizable", "header", "visibleChange"], [1, "dialog-body-wrap"], [1, "dialog-info-banner", "info"], [1, "pi", "pi-info-circle", "banner-icon"], ["class", "dialog-info-banner warning mb-2", 4, "ngIf"], ["class", "dialog-subcard", 4, "ngIf"], [1, "subcard-title", "mb-1"], ["class", "dialog-empty-box", 4, "ngIf"], ["class", "dialog-table-card", 4, "ngIf"], ["pTemplate", "footer"], [1, "dialog-info-banner", "warning"], [1, "pi", "pi-bolt", "banner-icon"], ["styleClass", "sutram-studio-dialog", "header", "\uD83D\uDC65 \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u090F\u0935\u0902 \u0905\u0927\u093F\u0915\u093E\u0930 \u092A\u094D\u0930\u092C\u0902\u0927\u0928 (User & Rights Management)", 3, "visible", "modal", "dismissableMask", "draggable", "resizable", "visibleChange"], [1, "dialog-info-banner", "info", "d-flex", "justify-content-between", "align-items-center"], [1, "d-flex", "align-items-center", "gap-2"], [1, "pi", "pi-shield", "banner-icon"], [1, "d-flex", "align-items-center", "gap-1"], ["type", "button", 1, "btn-role-switch", 3, "click"], [1, "dialog-subtext"], [1, "subcard-config", "mb-2"], [1, "subcard-header", "d-flex", "justify-content-between", "align-items-center"], [1, "subcard-title"], ["type", "button", "class", "btn-link-mini text-muted", 3, "click", 4, "ngIf"], [1, "subcard-grid", "d-flex", "flex-wrap", "gap-2", "align-items-end", "mt-2"], [2, "flex", "1", "min-width", "140px"], [1, "field-lbl"], ["type", "text", "pInputText", "", "placeholder", "e.g. rohit", 1, "w-100", "formula-input", 3, "ngModel", "disabled", "ngModelChange"], ["type", "password", "pInputText", "", 1, "w-100", "formula-input", 3, "ngModel", "placeholder", "ngModelChange"], [2, "flex", "1.2", "min-width", "160px"], ["type", "text", "pInputText", "", "placeholder", "e.g. Rohit Sharma", 1, "w-100", "formula-input", 3, "ngModel", "ngModelChange"], ["styleClass", "w-100", 3, "options", "ngModel", "appendTo", "ngModelChange"], [2, "display", "flex", "align-items", "center", "gap", "8px", "padding-bottom", "6px"], ["label", "\u0938\u0915\u094D\u0930\u093F\u092F", 3, "binary", "ngModel", "ngModelChange"], ["pButton", "", "type", "button", "icon", "pi pi-check", 1, "p-button-sm", "p-button-primary", 3, "label", "loading", "click"], [1, "dialog-table-card"], [1, "dialog-data-table"], [1, "text-center", 2, "width", "35px"], [2, "width", "110px"], [1, "text-center", 2, "width", "80px"], [2, "width", "140px"], [1, "text-center", 2, "width", "130px"], [4, "ngFor", "ngForOf"], [1, "mode-pill-toggle"], [1, "mode-pill-btn", 3, "click"], [1, "pi", "pi-pencil"], [1, "pi", "pi-bolt"], ["type", "button", 1, "cmd-btn-save-top", 3, "title", "click"], [1, "pi", "pi-save"], ["type", "button", "title", "Sync changes to Database (Ctrl+S)", 1, "cmd-btn-sync-top", 3, "disabled", "click"], [1, "pi", "pi-cloud-upload"], ["class", "sync-badge-count", 4, "ngIf"], [1, "sync-badge-count"], [1, "ribbon-content-row"], [1, "ribbon-group"], [1, "ribbon-group-items"], ["title", "Bold (Ctrl+B)", 1, "ribbon-tool-btn", 3, "click"], [2, "font-weight", "800", "font-size", "13px"], [1, "ribbon-tool-lbl"], [1, "ribbon-mini-col"], ["title", "Align Left", 1, "ribbon-mini-btn", 3, "click"], [1, "pi", "pi-align-left"], ["title", "Align Center", 1, "ribbon-mini-btn", 3, "click"], [1, "pi", "pi-align-center"], ["title", "Align Right", 1, "ribbon-mini-btn", 3, "click"], [1, "pi", "pi-align-right"], ["title", "Choose Visible Columns", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-sliders-h", 2, "color", "var(--primary)"], [1, "ribbon-group-name"], [1, "ribbon-v-sep"], ["class", "ribbon-tool-btn", "title", "Refresh data from database", 3, "click", 4, "ngIf"], ["title", "Open Excel (.xlsx) file or saved sheets", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-folder-open"], ["type", "file", "accept", ".xlsx, .xls, .csv", 2, "display", "none", 3, "change"], ["fileInput", ""], ["title", "Export sheet to Excel", 1, "ribbon-tool-btn", 3, "disabled", "click"], ["title", "Toggle Filters", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-filter"], ["title", "Toggle Sorting", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-sort-alt"], ["title", "Refresh data from database", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-refresh", "text-success"], [1, "ribbon-scroll-row"], [1, "ribbon-search-field", 2, "width", "140px", "min-width", "140px", "margin-right", "6px"], ["type", "text", "placeholder", "Search tables...", 1, "ribbon-search-inp", 3, "ngModel", "ngModelChange"], ["class", "clear-btn-inline", 3, "click", 4, "ngIf"], [1, "ribbon-boxes-track"], ["class", "ribbon-small-box", 3, "active-box", "title", "click", 4, "ngFor", "ngForOf"], [1, "clear-btn-inline", 3, "click"], [1, "ribbon-small-box", 3, "title", "click"], ["type", "button", 1, "box-star-btn", 3, "title", "click"], [1, "box-icon-wrap"], [1, "box-info"], [1, "box-name-eng-main"], ["class", "box-dot", "title", "Sheet open", 4, "ngIf"], ["title", "Sheet open", 1, "box-dot"], ["class", "ribbon-empty-state", 4, "ngIf"], ["class", "ribbon-search-field", "style", "width: 140px; min-width: 140px; margin-right: 6px;", 4, "ngIf"], ["class", "ribbon-boxes-track", 4, "ngIf"], [1, "ribbon-empty-state"], [1, "pi", "pi-info-circle", "text-muted"], [1, "text-muted"], ["type", "text", "placeholder", "Search reports...", 1, "ribbon-search-inp", 3, "ngModel", "ngModelChange"], ["class", "ribbon-small-box report-box", 3, "active-box", "title", "click", 4, "ngFor", "ngForOf"], [1, "ribbon-small-box", "report-box", 3, "title", "click"], [1, "box-icon-wrap", "report-icon-bg"], [1, "ribbon-group-items", 2, "align-items", "center", "padding", "2px 6px"], [1, "active-sheet-badge-pill", 3, "title"], [1, "sheet-title-text"], ["class", "ribbon-group", 4, "ngIf"], ["class", "ribbon-v-sep", 4, "ngIf"], ["title", "Excel style clickable checkbox", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-check-square", 2, "color", "#10b981"], ["title", "Status pill badge (Yes / No)", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-tag", 2, "color", "#3b82f6"], ["title", "User Management: Manage users, roles (Admin / Author) and rights", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-users", 2, "color", "#ec4899"], [1, "ribbon-tool-btn", 3, "title", "click"], ["title", "Configure visible columns, display order, labels and formats", 1, "ribbon-tool-btn", 3, "click"], [1, "pi", "pi-sliders-h", 2, "color", "#6366f1"], [1, "ribbon-tool-btn", 3, "disabled", "title", "click"], [1, "pi", "pi-desktop"], ["title", "Clear search", 1, "clear-btn-inline", 3, "click"], [1, "spin-inline"], [1, "pi", "pi-spin", "pi-spinner"], ["title", "Total database records", 1, "formula-record-pill"], [1, "col-dd-split-container"], [1, "col-dd-left-pane"], [1, "col-dd-header"], [1, "col-dd-search-wrap"], [1, "pi", "pi-search", "col-dd-search-icon"], ["type", "text", "placeholder", "Search columns / FK / fx...", 1, "col-dd-search-input", 3, "ngModel", "ngModelChange"], ["type", "button", "class", "btn-clear-search-inline", 3, "click", 4, "ngIf"], [1, "col-dd-actions"], [1, "col-dd-actions-left"], ["type", "button", 1, "col-dd-act-btn", 3, "click"], [1, "col-dd-count"], [1, "col-dd-body"], ["class", "col-dd-empty", 4, "ngIf"], [1, "col-dd-right-pane"], [1, "col-dd-right-header"], [1, "col-dd-right-title-wrap"], [1, "col-dd-right-title"], [1, "pi", "pi-sliders-v", "text-primary", "me-1"], [1, "col-dd-right-badge"], [1, "col-dd-right-sub"], [2, "color", "var(--primary, #4f46e5)"], [1, "col-dd-right-body"], ["class", "col-selected-card", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "col-dd-footer"], [1, "small", "text-muted", 2, "font-size", "10.5px"], [1, "pi", "pi-check-circle", "text-success", "me-1"], ["type", "button", 1, "btn", "btn-sm", "btn-primary", "py-1", "px-3", 2, "font-size", "11.5px", "font-weight", "600", 3, "click"], ["type", "button", 1, "btn-clear-search-inline", 3, "click"], [1, "pi", "pi-times"], [1, "col-dd-section-title"], [1, "pi", "pi-list", 2, "font-size", "10px", "margin-right", "4px"], ["class", "col-dd-item", 3, "click", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "col-dd-item", 3, "click"], [1, "col-dd-item-left"], ["type", "checkbox", 1, "custom-check", 2, "pointer-events", "none", 3, "checked"], [1, "col-dd-item-name", 3, "title"], ["style", "color: #ef4444; margin-left: 2px;", 4, "ngIf"], [1, "type-badge"], [2, "color", "#ef4444", "margin-left", "2px"], [1, "col-dd-section-title", "fx-section-title"], [1, "pi", "pi-bolt", 2, "color", "#8b5cf6", "font-size", "10px", "margin-right", "4px"], ["class", "col-dd-item fx-item", 3, "click", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "col-dd-item", "fx-item", 3, "click"], [1, "badge-fx-mini"], ["style", "font-size: 10px; color: var(--text-muted); margin-left: 4px;", 4, "ngIf"], [1, "type-badge", "badge-fx-type"], [2, "font-size", "10px", "color", "var(--text-muted)", "margin-left", "4px"], [1, "col-dd-section-title", 2, "margin-top", "8px"], [1, "pi", "pi-link", 2, "color", "var(--primary, #4f46e5)", "font-size", "10px", "margin-right", "4px"], ["class", "col-dd-group", 3, "fk-active-group", 4, "ngFor", "ngForOf", "ngForTrackBy"], [1, "col-dd-group"], [1, "col-dd-group-header"], [1, "col-dd-group-left", 2, "cursor", "pointer", "flex-grow", "1", 3, "click"], [1, "pi", "pi-chevron-right", "fk-expand-toggle"], [1, "col-dd-item-name"], [2, "text-transform", "capitalize"], [2, "font-size", "10px", "color", "var(--text-muted)", "font-weight", "400", "margin-left", "3px"], [1, "col-dd-group-right", 2, "cursor", "pointer", "display", "flex", "align-items", "center", "gap", "6px", 3, "click"], [1, "fk-group-pill"], ["class", "col-dd-group-items", 4, "ngIf"], [1, "col-dd-group-items"], [1, "col-dd-empty"], [1, "pi", "pi-search", "me-1"], [1, "pi", "pi-info-circle", "me-1"], [1, "col-selected-card"], [1, "col-card-order-controls"], [1, "col-card-letter-badge", 3, "title"], [1, "col-card-arrows"], ["type", "button", "title", "Move Left / Earlier", 1, "btn-arrow", 3, "disabled", "click"], [1, "pi", "pi-chevron-up"], ["type", "button", "title", "Move Right / Later", 1, "btn-arrow", 3, "disabled", "click"], [1, "pi", "pi-chevron-down"], [1, "col-card-meta"], [1, "col-card-meta-top"], [1, "col-card-key-txt", 3, "title"], ["class", "badge-fx-mini", "title", "Computed Temp Column", 4, "ngIf"], ["class", "badge-fk-pill", 3, "title", 4, "ngIf"], ["class", "badge-sub-pill", 3, "title", 4, "ngIf"], ["class", "badge-raw-pill", "title", "Raw foreign key ID", 4, "ngIf"], ["class", "badge-std-pill", 4, "ngIf"], [1, "col-card-label-wrap"], ["type", "text", "title", "Edit header label", 1, "col-card-label-inp", 3, "ngModel", "placeholder", "ngModelChange"], [1, "col-card-format-ctrls"], ["class", "col-card-select-wrap", 4, "ngIf"], ["class", "col-card-plain-type", 4, "ngIf"], ["type", "button", "title", "Hide this column from sheet", 1, "btn-col-hide", 3, "click"], ["title", "Computed Temp Column", 1, "badge-fx-mini"], [1, "badge-fk-pill", 3, "title"], [1, "badge-sub-pill", 3, "title"], ["title", "Raw foreign key ID", 1, "badge-raw-pill"], [1, "badge-std-pill"], [1, "col-card-select-wrap"], ["title", "Choose date display format", 1, "col-card-select", 3, "ngModel", "ngModelChange"], [3, "ngValue"], [3, "value", 4, "ngFor", "ngForOf"], [3, "value"], ["title", "Choose number decimal format", 1, "col-card-select", 3, "ngModel", "ngModelChange"], [1, "col-card-plain-type"], ["class", "text-purple-xs", 4, "ngIf"], ["class", "text-muted-xs", 4, "ngIf"], [1, "text-purple-xs"], [1, "text-muted-xs"], [1, "cmd-btn", "cmd-btn-warning", 2, "padding", "2px 8px", 3, "click"], [1, "tab-pill", 3, "click", "dblclick", "contextmenu"], [1, "pi", 2, "font-size", "11px", 3, "ngClass"], ["class", "tab-title-text", "title", "\u0921\u092C\u0932-\u0915\u094D\u0932\u093F\u0915 \u092F\u093E \u0930\u093E\u0907\u091F-\u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0915\u0947 \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Double-click or right-click to rename)", 4, "ngIf"], ["type", "text", "class", "tab-inline-rename-input", 3, "id", "ngModel", "ngModelChange", "keyup.enter", "keyup.escape", "blur", "click", 4, "ngIf"], ["class", "sheet-tab-badge", 4, "ngIf"], ["type", "button", "class", "tab-edit-btn", "title", "\u0936\u0940\u091F \u0915\u093E \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Rename sheet)", 3, "click", 4, "ngIf"], ["type", "button", "class", "tab-close-btn", "title", "Close sheet", 3, "click", 4, "ngIf"], ["title", "\u0921\u092C\u0932-\u0915\u094D\u0932\u093F\u0915 \u092F\u093E \u0930\u093E\u0907\u091F-\u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0915\u0947 \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Double-click or right-click to rename)", 1, "tab-title-text"], ["type", "text", 1, "tab-inline-rename-input", 3, "id", "ngModel", "ngModelChange", "keyup.enter", "keyup.escape", "blur", "click"], [1, "sheet-tab-badge"], ["type", "button", "title", "\u0936\u0940\u091F \u0915\u093E \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Rename sheet)", 1, "tab-edit-btn", 3, "click"], [1, "pi", "pi-pencil", 2, "font-size", "8.5px"], ["type", "button", "title", "Close sheet", 1, "tab-close-btn", 3, "click"], [1, "tab-context-menu", 3, "click"], [1, "tab-context-menu-item", 3, "click"], [1, "pi", "pi-pencil", "text-primary"], ["class", "tab-context-menu-item text-danger", 3, "click", 4, "ngIf"], [1, "tab-context-menu-item", "text-danger", 3, "click"], [1, "pi", "pi-trash"], [1, "text-primary", "small", "fw-semibold"], [1, "pi", "pi-spin", "pi-spinner", "me-1"], [1, "badge", "bg-soft-warning", "text-warning", "small", "fw-semibold"], [1, "pi", "pi-trash", "me-1"], [2, "color", "#10b981", "font-weight", "600"], [2, "color", "#ef4444", "font-weight", "600"], [1, "last-sync-badge"], [1, "pi", "pi-history", "me-1"], [1, "sync-toast-hud", "shadow-lg"], [1, "sync-toast-header"], [1, "sync-toast-title"], [1, "sync-toast-close", 3, "click"], ["class", "sync-progress-wrap px-3 pt-2", 4, "ngIf"], [1, "sync-toast-body"], [1, "sync-toast-stats"], ["class", "sync-badge-chip chip-success", 4, "ngIf"], ["class", "sync-badge-chip chip-info", 4, "ngIf"], ["class", "sync-badge-chip chip-warning", 4, "ngIf"], ["class", "sync-badge-chip chip-danger", 4, "ngIf"], ["class", "sync-toast-errors", 4, "ngIf"], [1, "sync-progress-wrap", "px-3", "pt-2"], [1, "d-flex", "justify-content-between", "align-items-center", "mb-1", 2, "font-size", "11px", "color", "var(--text-muted, #64748b)"], [1, "sync-progress-track"], [1, "sync-progress-bar"], [1, "sync-badge-chip", "chip-success"], [1, "sync-badge-chip", "chip-info"], [1, "pi", "pi-refresh"], [1, "sync-badge-chip", "chip-warning"], [1, "sync-badge-chip", "chip-danger"], [1, "sync-toast-errors"], [1, "dialog-info-banner", "warning", "mb-2"], [1, "pi", "pi-lock", "banner-icon"], [1, "dialog-subcard"], [1, "subcard-title", "mb-2"], [1, "subcard-grid", "d-flex", "align-items-end", "gap-2"], [1, "dialog-label"], ["optionLabel", "label", "optionValue", "value", "placeholder", "-- Select Target Column --", "styleClass", "dialog-ctrl-dropdown", 3, "options", "ngModel", "appendTo", "ngModelChange", "onChange"], ["style", "flex: 0 0 220px;", 4, "ngIf"], [2, "flex", "1 1 auto", "min-width", "220px"], ["type", "text", "pInputText", "", "placeholder", "e.g. [colB] or [qty] * [rate] or AGE([dob])", 1, "dialog-ctrl-input", "font-mono", 3, "ngModel", "ngModelChange"], [2, "flex", "0 0 75px"], ["pButton", "", "type", "button", "icon", "pi pi-plus", "label", "Add", 1, "p-button-sm", "p-button-success", "dialog-btn-add", "w-100", 3, "disabled", "click"], [1, "chips-row"], [1, "chips-label"], ["class", "quick-chip", "title", "\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0924\u093E\u0932\u093F\u0915\u093E \u0915\u093E \u0915\u0949\u0932\u092E", 3, "click", 4, "ngFor", "ngForOf"], ["class", "chips-row mt-1", 4, "ngIf"], [1, "chips-row", "mt-1"], ["title", "Calculate age from Date of Birth", 1, "quick-chip", "chip-blue", 3, "click"], ["title", "Difference in days", 1, "quick-chip", "chip-blue", 3, "click"], ["title", "Conditional logic", 1, "quick-chip", "chip-blue", 3, "click"], ["title", "Round number", 1, "quick-chip", "chip-blue", 3, "click"], ["title", "Uppercase text", 1, "quick-chip", "chip-blue", 3, "click"], [2, "flex", "0 0 220px"], [1, "dialog-label", "text-primary"], ["type", "text", "pInputText", "", "placeholder", "e.g. Age, Full Name, Days Left", 1, "dialog-ctrl-input", "font-bold", 3, "ngModel", "ngModelChange"], ["title", "\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0924\u093E\u0932\u093F\u0915\u093E \u0915\u093E \u0915\u0949\u0932\u092E", 1, "quick-chip", 3, "click"], ["class", "quick-chip chip-orange", "title", "\u0930\u0947\u092B\u0930\u0947\u0902\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u0915\u093E \u0915\u0949\u0932\u092E (\u0915\u0947\u0935\u0932 \u0938\u0942\u0924\u094D\u0930/\u092B\u0949\u0930\u094D\u092E\u0942\u0932\u093E \u092E\u0947\u0902 \u0921\u0947\u091F\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0947 \u0932\u093F\u090F)", 3, "click", 4, "ngFor", "ngForOf"], ["title", "\u0930\u0947\u092B\u0930\u0947\u0902\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u0915\u093E \u0915\u0949\u0932\u092E (\u0915\u0947\u0935\u0932 \u0938\u0942\u0924\u094D\u0930/\u092B\u0949\u0930\u094D\u092E\u0942\u0932\u093E \u092E\u0947\u0902 \u0921\u0947\u091F\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0947 \u0932\u093F\u090F)", 1, "quick-chip", "chip-orange", 3, "click"], [1, "dialog-empty-box"], [1, "text-center", 2, "width", "38px"], [2, "width", "100px"], [1, "text-center", 2, "width", "50px"], [1, "text-center", "text-muted", "font-mono", "col-idx"], ["class", "quick-chip chip-blue font-bold", 4, "ngIf"], ["class", "quick-chip chip-green font-bold", 4, "ngIf"], [1, "font-mono"], ["class", "text-muted-xs font-mono ms-1", 4, "ngIf"], [1, "font-mono", "text-primary", "formula-cell"], [1, "text-center"], ["type", "button", "class", "mini-del-btn", "title", "\u0939\u091F\u093E\u090F\u0902", 3, "click", 4, "ngIf"], [1, "quick-chip", "chip-blue", "font-bold"], [1, "pi", "pi-eye", "me-1"], [1, "quick-chip", "chip-green", "font-bold"], [1, "pi", "pi-database", "me-1"], [1, "text-muted-xs", "font-mono", "ms-1"], ["type", "button", "title", "\u0939\u091F\u093E\u090F\u0902", 1, "mini-del-btn", 3, "click"], [1, "dialog-footer-actions"], ["pButton", "", "type", "button", "label", "\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902 (Cancel)", 1, "p-button-text", "p-button-sm", "dialog-btn-cancel", 3, "click"], ["pButton", "", "type", "button", "label", "\u0938\u0947\u0935 \u0915\u0930\u0947\u0902 (Save Formulas)", "icon", "pi pi-check", "class", "p-button-sm p-button-primary dialog-btn-save", 3, "loading", "click", 4, "ngIf"], ["pButton", "", "type", "button", "label", "\u0938\u0947\u0935 \u0915\u0930\u0947\u0902 (Save Formulas)", "icon", "pi pi-check", 1, "p-button-sm", "p-button-primary", "dialog-btn-save", 3, "loading", "click"], [1, "subcard-grid", "mb-2"], [1, "subcard-col-4"], ["type", "text", "pInputText", "", "placeholder", "e.g. trg_stock_update", 1, "dialog-ctrl-input", "font-mono", 3, "ngModel", "ngModelChange"], [1, "subcard-col-3"], ["styleClass", "dialog-ctrl-dropdown", 3, "options", "ngModel", "appendTo", "ngModelChange"], [1, "subcard-col-5"], ["class", "mt-2", 4, "ngIf"], ["class", "subcard-grid mt-2", 4, "ngIf"], [1, "d-flex", "justify-content-end", "mt-2", "pt-1"], ["pButton", "", "type", "button", "icon", "pi pi-bolt", "label", "\u091F\u094D\u0930\u093F\u0917\u0930 \u092C\u0928\u093E\u090F\u0902 (Create Trigger)", 1, "p-button-sm", "p-button-warning", "dialog-btn-add", 3, "disabled", "click"], [1, "mt-2"], [1, "d-flex", "align-items-center", "justify-content-between", "mb-1"], [1, "dialog-label", "mb-0"], [1, "text-muted-xs", "font-mono"], ["rows", "3", "placeholder", "UPDATE target_table SET col = col + :new.qty WHERE id = :new.target_id;", 1, "dialog-ctrl-textarea", "font-mono", 3, "ngModel", "ngModelChange"], ["class", "quick-chip chip-green", 3, "click", 4, "ngFor", "ngForOf"], [1, "quick-chip", "chip-green", 3, "click"], ["class", "quick-chip chip-orange", 3, "click", 4, "ngFor", "ngForOf"], [1, "quick-chip", "chip-orange", 3, "click"], ["class", "quick-chip chip-blue", 3, "click", 4, "ngFor", "ngForOf"], [1, "quick-chip", "chip-blue", 3, "click"], [1, "subcard-grid", "mt-2"], ["optionLabel", "display_name", "optionValue", "table", "filterBy", "display_name,table", "placeholder", "-- Select Target Table --", "styleClass", "dialog-ctrl-dropdown", 3, "options", "ngModel", "filter", "appendTo", "ngModelChange"], ["pTemplate", "item"], ["pTemplate", "selectedItem"], [1, "subcard-col-7"], ["type", "text", "pInputText", "", "placeholder", "{\"stock_qty\": \":new.qty\"}", 1, "dialog-ctrl-input", "font-mono", 3, "ngModel", "ngModelChange"], [1, "d-flex", "align-items-center", "justify-content-between", 2, "width", "100%"], [1, "text-muted-xs", "font-mono", "ms-2"], [1, "font-semibold"], [1, "text-center", 2, "width", "75px"], [1, "text-center", 2, "width", "85px"], [1, "event-pill", 3, "ngClass"], [1, "type-pill"], [1, "font-mono", "text-muted-xs"], ["class", "trigger-code-snippet", 4, "ngIf"], [1, "trigger-code-snippet"], ["pButton", "", "type", "button", "label", "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902 (Close)", 1, "p-button-text", "p-button-sm", "dialog-btn-cancel", 3, "click"], ["type", "button", 1, "btn-link-mini", "text-muted", 3, "click"], ["class", "badge-current-user ms-1", 4, "ngIf"], [1, "status-pill"], [1, "d-flex", "align-items-center", "justify-content-center", "gap-2"], ["title", "Edit User", 1, "pi", "pi-pencil", "i-outline-primary", "cursor-pointer", 3, "click"], ["class", "pi pi-trash i-outline-danger cursor-pointer", "title", "Delete User", 3, "click", 4, "ngIf"], ["type", "button", "title", "Use this account", 1, "btn-use-account", 3, "click"], [1, "badge-current-user", "ms-1"], ["title", "Delete User", 1, "pi", "pi-trash", "i-outline-danger", "cursor-pointer", 3, "click"], ["colspan", "7", 1, "text-center", "text-muted", "py-3"]], template: function SutramExcelStudioComponent_Template(rf, ctx) { if (rf & 1) {
            const _r320 = i0.ɵɵgetCurrentView();
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
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(39, "div", 22);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_div_click_39_listener() { return ctx.toggleRole(); });
            i0.ɵɵelement(40, "i", 21);
            i0.ɵɵelementStart(41, "span", 23);
            i0.ɵɵtext(42);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(43, "span", 24);
            i0.ɵɵtext(44);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(45, "div", 25);
            i0.ɵɵtemplate(46, SutramExcelStudioComponent_div_46_Template, 50, 17, "div", 26);
            i0.ɵɵtemplate(47, SutramExcelStudioComponent_div_47_Template, 7, 3, "div", 27);
            i0.ɵɵtemplate(48, SutramExcelStudioComponent_div_48_Template, 4, 3, "div", 27);
            i0.ɵɵtemplate(49, SutramExcelStudioComponent_div_49_Template, 39, 15, "div", 26);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(50, "div", 28)(51, "div", 29);
            i0.ɵɵtext(52);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(53, "span", 30);
            i0.ɵɵtext(54);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(55, "span", 31);
            i0.ɵɵtext(56, "fx");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(57, "input", 32);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_input_ngModelChange_57_listener($event) { return ctx.onFormulaChange($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(58, "div", 33)(59, "div", 34);
            i0.ɵɵelement(60, "i", 35);
            i0.ɵɵelementStart(61, "input", 36);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_input_ngModelChange_61_listener($event) { return ctx.onDbSearchInput($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(62, SutramExcelStudioComponent_button_62_Template, 2, 0, "button", 37);
            i0.ɵɵtemplate(63, SutramExcelStudioComponent_span_63_Template, 2, 0, "span", 38);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(64, SutramExcelStudioComponent_div_64_Template, 4, 2, "div", 39);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(65, "p-overlayPanel", 40, 41);
            i0.ɵɵtemplate(67, SutramExcelStudioComponent_ng_template_67_Template, 44, 12, "ng-template", 42);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(68, "div", 43)(69, "div", 44);
            i0.ɵɵelement(70, "i", 21);
            i0.ɵɵelementStart(71, "span");
            i0.ɵɵtext(72);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(73, SutramExcelStudioComponent_div_73_Template, 4, 1, "div", 45);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(74, "main", 46)(75, "sutram-grid", 47, 48);
            i0.ɵɵlistener("loadMore", function SutramExcelStudioComponent_Template_sutram_grid_loadMore_75_listener() { return ctx.onLoadMore(); })("filterChanged", function SutramExcelStudioComponent_Template_sutram_grid_filterChanged_75_listener() { return ctx.onGridFilterChanged(); })("sortChanged", function SutramExcelStudioComponent_Template_sutram_grid_sortChanged_75_listener() { return ctx.onGridSortChanged(); })("cellChanged", function SutramExcelStudioComponent_Template_sutram_grid_cellChanged_75_listener($event) { return ctx.onGridCellChanged($event); })("solveAllTriggered", function SutramExcelStudioComponent_Template_sutram_grid_solveAllTriggered_75_listener($event) { return ctx.onGridSolveAll($event); })("openConfig", function SutramExcelStudioComponent_Template_sutram_grid_openConfig_75_listener($event) { i0.ɵɵrestoreView(_r320); const _r10 = i0.ɵɵreference(66); return i0.ɵɵresetView(_r10.toggle($event)); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(77, "footer", 49)(78, "div", 50);
            i0.ɵɵtemplate(79, SutramExcelStudioComponent_div_79_Template, 7, 8, "div", 51);
            i0.ɵɵelementStart(80, "button", 52);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_80_listener() { return ctx.addNewBlankSheet(); });
            i0.ɵɵelement(81, "i", 53);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(82, SutramExcelStudioComponent_div_82_Template, 6, 5, "div", 54);
            i0.ɵɵelementStart(83, "div", 55)(84, "div", 56)(85, "span");
            i0.ɵɵtext(86);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(87, "span");
            i0.ɵɵtext(88);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(89, SutramExcelStudioComponent_span_89_Template, 3, 0, "span", 57);
            i0.ɵɵtemplate(90, SutramExcelStudioComponent_span_90_Template, 3, 1, "span", 58);
            i0.ɵɵtemplate(91, SutramExcelStudioComponent_span_91_Template, 2, 0, "span", 59);
            i0.ɵɵtemplate(92, SutramExcelStudioComponent_span_92_Template, 2, 1, "span", 60);
            i0.ɵɵtemplate(93, SutramExcelStudioComponent_span_93_Template, 3, 4, "span", 61);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(94, "div", 56)(95, "span", 62);
            i0.ɵɵtext(96, "Ctrl+S to Sync | Enter next row | Tab next col | Click # to select row");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(97, "div", 63)(98, "button", 64);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_98_listener() { return ctx.zoomOut(); });
            i0.ɵɵelement(99, "i", 65);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(100, "span", 66);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_span_click_100_listener() { return ctx.resetZoom(); });
            i0.ɵɵtext(101);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(102, "button", 67);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_102_listener() { return ctx.zoomIn(); });
            i0.ɵɵelement(103, "i", 68);
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵtemplate(104, SutramExcelStudioComponent_div_104_Template, 16, 8, "div", 69);
            i0.ɵɵelementStart(105, "sutram-header-scanner", 70);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_sutram_header_scanner_visibleChange_105_listener($event) { return ctx.showScannerModal = $event; })("sheetChange", function SutramExcelStudioComponent_Template_sutram_header_scanner_sheetChange_105_listener($event) { return ctx.onUploadedSheetChange($event); })("targetTableChange", function SutramExcelStudioComponent_Template_sutram_header_scanner_targetTableChange_105_listener($event) { return ctx.onScannerTargetTableChange($event); })("openDirectNormal", function SutramExcelStudioComponent_Template_sutram_header_scanner_openDirectNormal_105_listener($event) { return ctx.onDirectOpenAsNormalSheet($event); })("openMappedToTable", function SutramExcelStudioComponent_Template_sutram_header_scanner_openMappedToTable_105_listener($event) { return ctx.onScannerConfirmedMapped($event); })("openSavedSheet", function SutramExcelStudioComponent_Template_sutram_header_scanner_openSavedSheet_105_listener($event) { return ctx.onOpenSavedSheet($event); })("deleteSavedSheet", function SutramExcelStudioComponent_Template_sutram_header_scanner_deleteSavedSheet_105_listener($event) { return ctx.onDeleteSavedSheet($event); })("triggerFileInput", function SutramExcelStudioComponent_Template_sutram_header_scanner_triggerFileInput_105_listener() { return ctx.triggerBrowseFile(); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(106, "sutram-correction-sidebar", 71);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_sutram_correction_sidebar_visibleChange_106_listener($event) { return ctx.showSidebar = $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(107, "p-dialog", 72);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_p_dialog_visibleChange_107_listener($event) { return ctx.showUiSutrasModal = $event; });
            i0.ɵɵelementStart(108, "div", 73)(109, "div", 74);
            i0.ɵɵelement(110, "i", 75);
            i0.ɵɵelementStart(111, "span");
            i0.ɵɵtext(112, "\u091C\u092C \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0917\u094D\u0930\u093F\u0921 \u092E\u0947\u0902 \u0921\u0947\u091F\u093E \u091F\u093E\u0907\u092A \u0915\u0930\u0924\u093E \u0939\u0948, \u0924\u092C \u092F\u0939 \u0938\u0942\u0924\u094D\u0930 \u0924\u0924\u094D\u0915\u093E\u0932 \u0917\u0923\u0928\u093E \u0915\u0930\u0915\u0947 \u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u0915\u0949\u0932\u092E \u0915\u094B \u0938\u094D\u0935\u0924\u0903 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964");
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(113, SutramExcelStudioComponent_div_113_Template, 6, 0, "div", 76);
            i0.ɵɵtemplate(114, SutramExcelStudioComponent_div_114_Template, 33, 10, "div", 77);
            i0.ɵɵelementStart(115, "div", 78);
            i0.ɵɵtext(116, "\u0938\u0915\u094D\u0930\u093F\u092F \u0938\u0942\u0924\u094D\u0930 (Active UI Formulas):");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(117, SutramExcelStudioComponent_div_117_Template, 2, 0, "div", 79);
            i0.ɵɵtemplate(118, SutramExcelStudioComponent_div_118_Template, 16, 1, "div", 80);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(119, SutramExcelStudioComponent_ng_template_119_Template, 3, 1, "ng-template", 81);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(120, "p-dialog", 72);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_p_dialog_visibleChange_120_listener($event) { return ctx.showBackendSutrasModal = $event; });
            i0.ɵɵelementStart(121, "div", 73)(122, "div", 82);
            i0.ɵɵelement(123, "i", 83);
            i0.ɵɵelementStart(124, "span");
            i0.ɵɵtext(125, "\u0938\u0930\u094D\u0935\u0930-\u0938\u093E\u0907\u0921 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u091F\u094D\u0930\u093F\u0917\u0930 \u2014 \u0907\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u092E\u0947\u0902 \u0921\u0947\u091F\u093E \u0907\u0928\u094D\u0938\u0930\u094D\u091F, \u0905\u092A\u0921\u0947\u091F \u092F\u093E \u0921\u093F\u0932\u0940\u091F \u0939\u094B\u0928\u0947 \u092A\u0930 \u0938\u094D\u0935\u0924\u0903 \u0915\u0938\u094D\u091F\u092E SQL \u0915\u094D\u0935\u0947\u0930\u0940 \u092F\u093E \u0915\u094D\u0930\u0949\u0938-\u0924\u093E\u0932\u093F\u0915\u093E \u0938\u093F\u0902\u0915 \u091A\u0932\u093E\u090F\u0902\u0964");
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(126, SutramExcelStudioComponent_div_126_Template, 6, 0, "div", 76);
            i0.ɵɵtemplate(127, SutramExcelStudioComponent_div_127_Template, 20, 26, "div", 77);
            i0.ɵɵelementStart(128, "div", 78);
            i0.ɵɵtext(129, "\u0938\u0915\u094D\u0930\u093F\u092F \u092C\u0948\u0915\u090F\u0902\u0921 \u091F\u094D\u0930\u093F\u0917\u0930\u094D\u0938 (Active Triggers):");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(130, SutramExcelStudioComponent_div_130_Template, 2, 0, "div", 79);
            i0.ɵɵtemplate(131, SutramExcelStudioComponent_div_131_Template, 18, 1, "div", 80);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(132, SutramExcelStudioComponent_ng_template_132_Template, 2, 0, "ng-template", 81);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(133, "p-dialog", 84);
            i0.ɵɵlistener("visibleChange", function SutramExcelStudioComponent_Template_p_dialog_visibleChange_133_listener($event) { return ctx.showUserManagementModal = $event; });
            i0.ɵɵelementStart(134, "div", 73)(135, "div", 85)(136, "div", 86);
            i0.ɵɵelement(137, "i", 87);
            i0.ɵɵelementStart(138, "span");
            i0.ɵɵtext(139, " \u0938\u0915\u094D\u0930\u093F\u092F \u0916\u093E\u0924\u093E: ");
            i0.ɵɵelementStart(140, "strong");
            i0.ɵɵtext(141);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(142);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(143, "div", 88)(144, "button", 89);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_144_listener() { return ctx.switchRole("admin"); });
            i0.ɵɵtext(145, " \uD83D\uDC51 Admin ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(146, "button", 89);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_146_listener() { return ctx.switchRole("author"); });
            i0.ɵɵtext(147, " \uD83D\uDC64 Author ");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(148, "div", 90);
            i0.ɵɵtext(149, " Admin: \u092A\u0942\u0930\u094D\u0923 \u0905\u0927\u093F\u0915\u093E\u0930 (Triggers, Schema, Rules, User Management).");
            i0.ɵɵelement(150, "br");
            i0.ɵɵtext(151, " Author: \u0911\u092A\u0930\u0947\u0936\u0928\u0932 \u0905\u0927\u093F\u0915\u093E\u0930 (\u0921\u0947\u091F\u093E \u0909\u092A\u092F\u094B\u0917, \u0915\u0949\u0932\u092E \u0926\u0943\u0936\u094D\u092F\u0924\u093E Show/Hide, \u0921\u093F\u0938\u094D\u092A\u094D\u0932\u0947 \u092B\u0949\u0930\u094D\u092E\u0947\u091F\u093F\u0902\u0917). ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(152, "div", 91)(153, "div", 92)(154, "span", 93);
            i0.ɵɵtext(155);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(156, SutramExcelStudioComponent_button_156_Template, 2, 0, "button", 94);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(157, "div", 95)(158, "div", 96)(159, "label", 97);
            i0.ɵɵtext(160, "\u092F\u0942\u091C\u0930\u0928\u0947\u092E (Username)*");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(161, "input", 98);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_input_ngModelChange_161_listener($event) { return ctx.userFormData.username = $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(162, "div", 96)(163, "label", 97);
            i0.ɵɵtext(164);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(165, "input", 99);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_input_ngModelChange_165_listener($event) { return ctx.userFormData.password = $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(166, "div", 100)(167, "label", 97);
            i0.ɵɵtext(168, "\u092A\u094D\u0930\u0926\u0930\u094D\u0936\u093F\u0924 \u0928\u093E\u092E (Display Name)");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(169, "input", 101);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_input_ngModelChange_169_listener($event) { return ctx.userFormData.display_name = $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(170, "div", 100)(171, "label", 97);
            i0.ɵɵtext(172, "\u092D\u0942\u092E\u093F\u0915\u093E (Role)*");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(173, "p-dropdown", 102);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_p_dropdown_ngModelChange_173_listener($event) { return ctx.userFormData.role = $event; });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(174, "div", 103)(175, "p-checkbox", 104);
            i0.ɵɵlistener("ngModelChange", function SutramExcelStudioComponent_Template_p_checkbox_ngModelChange_175_listener($event) { return ctx.userFormData.active = $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(176, "button", 105);
            i0.ɵɵlistener("click", function SutramExcelStudioComponent_Template_button_click_176_listener() { return ctx.saveUser(); });
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(177, "div", 106)(178, "table", 107)(179, "thead")(180, "tr")(181, "th", 108);
            i0.ɵɵtext(182, "#");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(183, "th");
            i0.ɵɵtext(184, "\u092F\u0942\u091C\u0930\u0928\u0947\u092E");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(185, "th");
            i0.ɵɵtext(186, "\u092A\u094D\u0930\u0926\u0930\u094D\u0936\u093F\u0924 \u0928\u093E\u092E");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(187, "th", 109);
            i0.ɵɵtext(188, "\u092D\u0942\u092E\u093F\u0915\u093E (Role)");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(189, "th", 110);
            i0.ɵɵtext(190, "\u0938\u094D\u0925\u093F\u0924\u093F");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(191, "th", 111);
            i0.ɵɵtext(192, "\u092C\u0928\u093E\u092F\u093E \u0917\u092F\u093E");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(193, "th", 112);
            i0.ɵɵtext(194, "\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(195, "tbody");
            i0.ɵɵtemplate(196, SutramExcelStudioComponent_tr_196_Template, 23, 19, "tr", 113);
            i0.ɵɵtemplate(197, SutramExcelStudioComponent_tr_197_Template, 4, 2, "tr", 45);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵtemplate(198, SutramExcelStudioComponent_ng_template_198_Template, 2, 0, "ng-template", 81);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵclassProp("dark-mode", ctx.isDarkMode);
            i0.ɵɵadvance(13);
            i0.ɵɵclassProp("active", ctx.activeTopTab === "home");
            i0.ɵɵadvance(4);
            i0.ɵɵclassProp("active", ctx.activeTopTab === "tables");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.tablesList.length);
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
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("title", "Active User: " + (ctx.currentUser.display_name || ctx.currentUser.username) + " (" + (ctx.isAdmin ? "Admin Mode" : "Author Mode") + ")\nClick to toggle role");
            i0.ɵɵadvance(1);
            i0.ɵɵstyleProp("color", ctx.isAdmin ? "#a855f7" : "#10b981");
            i0.ɵɵproperty("ngClass", ctx.isAdmin ? "pi-shield" : "pi-user");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.currentUser.username);
            i0.ɵɵadvance(1);
            i0.ɵɵclassProp("admin-tag", ctx.isAdmin)("author-tag", ctx.isAuthor);
            i0.ɵɵadvance(1);
            i0.ɵɵtextInterpolate1(" ", ctx.isAdmin ? "\uD83D\uDC51 Admin" : "\uD83D\uDC64 Author", " ");
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
            i0.ɵɵadvance(1);
            i0.ɵɵstyleMap(i0.ɵɵpureFunction0(132, _c11));
            i0.ɵɵpropertyInterpolate1("header", "\uD83E\uDDEE UI \u0938\u0942\u0924\u094D\u0930 \u0935\u093F\u0928\u094D\u092F\u093E\u0938 (Live Reactive Formulas): ", ctx.currentActiveSheetTitle, "");
            i0.ɵɵproperty("visible", ctx.showUiSutrasModal)("modal", true)("dismissableMask", true)("draggable", false)("resizable", false);
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("ngIf", !ctx.isAdmin);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.isAdmin);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngIf", ctx.uiSutrasList.length === 0);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.uiSutrasList.length > 0);
            i0.ɵɵadvance(2);
            i0.ɵɵstyleMap(i0.ɵɵpureFunction0(133, _c11));
            i0.ɵɵpropertyInterpolate1("header", "\u26A1 \u092C\u0948\u0915\u090F\u0902\u0921 \u0938\u0942\u0924\u094D\u0930 \u0935\u093F\u0928\u094D\u092F\u093E\u0938 (Server Database Triggers): ", ctx.currentActiveSheetTitle, "");
            i0.ɵɵproperty("visible", ctx.showBackendSutrasModal)("modal", true)("dismissableMask", true)("draggable", false)("resizable", false);
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("ngIf", !ctx.isAdmin);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.isAdmin);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngIf", ctx.backendTriggersList.length === 0);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.backendTriggersList.length > 0);
            i0.ɵɵadvance(2);
            i0.ɵɵstyleMap(i0.ɵɵpureFunction0(134, _c12));
            i0.ɵɵproperty("visible", ctx.showUserManagementModal)("modal", true)("dismissableMask", true)("draggable", false)("resizable", false);
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(ctx.currentUser.username);
            i0.ɵɵadvance(1);
            i0.ɵɵtextInterpolate1(" (", ctx.isAdmin ? "\uD83D\uDC51 Admin (\u092A\u0942\u0930\u094D\u0923 \u0905\u0927\u093F\u0915\u093E\u0930)" : "\uD83D\uDC64 Author (\u0938\u0940\u092E\u093F\u0924 \u0905\u0927\u093F\u0915\u093E\u0930)", ") ");
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active-role", ctx.isAdmin);
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active-role", ctx.isAuthor);
            i0.ɵɵadvance(9);
            i0.ɵɵtextInterpolate1(" ", ctx.editingUserId ? "\u270F\uFE0F \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0947\u0902 (Edit User #" + ctx.editingUserId + ")" : "\u2795 \u0928\u092F\u093E \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u091C\u094B\u0921\u093C\u0947\u0902 (Add New User)", " ");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.editingUserId);
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("ngModel", ctx.userFormData.username)("disabled", !!ctx.editingUserId);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.editingUserId ? "\u0928\u092F\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 (Password)" : "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 (Password)*");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngModel", ctx.userFormData.password)("placeholder", ctx.editingUserId ? "\u0916\u093E\u0932\u0940 \u091B\u094B\u0921\u093C\u0947\u0902 \u092F\u0926\u093F \u0928\u0939\u0940\u0902 \u092C\u0926\u0932\u0928\u093E" : "e.g. pass123");
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngModel", ctx.userFormData.display_name);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("options", ctx.roleDropdownOptions)("ngModel", ctx.userFormData.role)("appendTo", "body");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("binary", true)("ngModel", ctx.userFormData.active);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("label", ctx.editingUserId ? "\u0905\u092A\u0921\u0947\u091F" : "\u091C\u094B\u0921\u093C\u0947\u0902")("loading", ctx.isSavingUser);
            i0.ɵɵadvance(20);
            i0.ɵɵproperty("ngForOf", ctx.usersList);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.usersList.length === 0);
        } }, dependencies: [i6.NgClass, i6.NgForOf, i6.NgIf, i7.NgSelectOption, i7.ɵNgSelectMultipleOption, i7.DefaultValueAccessor, i7.SelectControlValueAccessor, i7.NgControlStatus, i7.NgModel, i8.PrimeTemplate, i9.Dropdown, i10.ButtonDirective, i11.InputText, i12.Dialog, i13.OverlayPanel, i14.Checkbox, i15.SutramGridComponent, i16.SutramHeaderScannerComponent, i17.SutramCorrectionSidebarComponent], styles: ["\n\n\n\n\n\n\n\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n\n.sutram-excel-container[_ngcontent-%COMP%] {\n  --primary: #4f46e5;\n  --primary-hover: #4338ca;\n  --primary-soft: #e0e7ff;\n  --success: #10b981;\n  --success-soft: #d1fae5;\n  --warning: #f59e0b;\n  --warning-soft: #fef3c7;\n  --danger: #ef4444;\n  --danger-soft: #fee2e2;\n  --bg: #f8fafc;\n  --surface: #ffffff;\n  --surface-border: #e2e8f0;\n  --text: #0f172a;\n  --text-muted: #64748b;\n  --radius: 6px;\n  --header-bg: #f1f5f9;\n  --header-text: #1e293b;\n  --cell-border: rgba(125, 125, 125, 0.18);\n  --cell-height: 23px;\n  --header-height: 38px;\n  --cell-edited-bg: #fef9c3;\n  --cell-edited-border: #eab308;\n  --row-edited-bg: #fffbeb;\n  --row-new-bg: #dcfce7;\n  --row-new-border: #22c55e;\n\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n  background-color: var(--bg);\n  color: var(--text);\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  user-select: none;\n\n  &.dark-mode {\n    --bg: #0f172a;\n    --surface: #1e293b;\n    --surface-border: #334155;\n    --text: #f8fafc;\n    --text-muted: #94a3b8;\n    --header-bg: #1e293b;\n    --header-text: #cbd5e1;\n    --cell-border: rgba(255, 255, 255, 0.1);\n    --cell-edited-bg: rgba(234, 179, 8, 0.22);\n    --cell-edited-border: #facc15;\n    --row-edited-bg: rgba(234, 179, 8, 0.12);\n    --row-new-bg: rgba(34, 197, 94, 0.18);\n    --row-new-border: #4ade80;\n  }\n}\n\n\n\n\n\n.studio-header[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n  user-select: none;\n}\n\n\n\n.ribbon-menu-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2px 10px;\n  height: 32px;\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n}\n\n.menu-bar-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.brand[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.brand-icon[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 11px;\n}\n.brand-title[_ngcontent-%COMP%] {\n  font-size: 11.5px;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  color: var(--text);\n\n  .version-tag {\n    font-size: 9px;\n    padding: 1px 4px;\n    background: rgba(16, 185, 129, 0.18);\n    color: #059669;\n    border-radius: 3px;\n    font-weight: 700;\n  }\n}\n\n\n\n.ribbon-tabs-nav[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n.ribbon-tab-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 3px 11px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.12s ease;\n\n  i {\n    font-size: 10.5px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.08);\n    color: var(--text);\n  }\n\n  &.active {\n    background: var(--surface);\n    color: var(--primary);\n    border-color: var(--surface-border) var(--surface-border) transparent var(--surface-border);\n    border-bottom: 2px solid var(--primary);\n    font-weight: 700;\n  }\n}\n.ribbon-badge[_ngcontent-%COMP%] {\n  font-size: 9px;\n  padding: 1px 4px;\n  border-radius: 999px;\n  background: rgba(79, 70, 229, 0.12);\n  color: var(--primary);\n  font-weight: 700;\n}\n\n.menu-bar-right[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.mode-pill-toggle[_ngcontent-%COMP%] {\n  background: rgba(125, 125, 125, 0.12);\n  border-radius: 999px;\n  padding: 2px;\n  display: flex;\n  gap: 2px;\n}\n.mode-pill-btn[_ngcontent-%COMP%] {\n  padding: 2px 9px;\n  border-radius: 999px;\n  font-size: 10px;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  i { font-size: 9.5px; }\n}\n.mode-pill-btn.active-normal[_ngcontent-%COMP%] {\n  background: #3b82f6;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.35);\n}\n.mode-pill-btn.active-smart[_ngcontent-%COMP%] {\n  background: #10b981;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.35);\n}\n\n.cmd-btn-save-top[_ngcontent-%COMP%], .cmd-btn-sync-top[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 2px 10px;\n  height: 24px;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.15s ease;\n\n  i {\n    font-size: 11px;\n  }\n\n  &:hover:not(:disabled) {\n    background: rgba(125, 125, 125, 0.1);\n    border-color: var(--primary);\n    color: var(--primary);\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n\n  &.has-pending {\n    background: #10b981;\n    color: #ffffff;\n    border-color: #059669;\n    box-shadow: 0 1px 4px rgba(16, 185, 129, 0.35);\n\n    &:hover {\n      background: #059669;\n      color: #ffffff;\n    }\n  }\n\n  .sync-badge-count {\n    font-size: 9px;\n    padding: 1px 5px;\n    border-radius: 999px;\n    background: #ffffff;\n    color: #059669;\n    font-weight: 800;\n    line-height: 1;\n  }\n}\n\n\n\n.ribbon-strip[_ngcontent-%COMP%] {\n  background: var(--surface);\n  padding: 4px 10px;\n  height: 60px;\n  display: flex;\n  align-items: center;\n  overflow: hidden;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);\n}\n\n\n\n.ribbon-content-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n\n.ribbon-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: space-between;\n  height: 52px;\n  padding: 0 4px;\n}\n\n.ribbon-group-items[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-grow: 1;\n}\n\n.ribbon-group-name[_ngcontent-%COMP%] {\n  font-size: 8.5px;\n  color: var(--text-muted);\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  margin-top: 1px;\n}\n\n.ribbon-v-sep[_ngcontent-%COMP%] {\n  width: 1px;\n  height: 40px;\n  background: var(--surface-border);\n  opacity: 0.75;\n  margin: 0 4px;\n}\n\n.ribbon-tool-btn[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 2px;\n  padding: 2px 7px;\n  height: 42px;\n  border-radius: 4px;\n  border: 1px solid transparent;\n  background: transparent;\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.12s;\n  font-size: 10.5px;\n\n  i {\n    font-size: 13px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.09);\n    border-color: var(--surface-border);\n  }\n\n  &.active {\n    background: var(--primary-soft);\n    color: var(--primary);\n    border-color: rgba(79, 70, 229, 0.3);\n    font-weight: 700;\n  }\n\n  .ribbon-tool-lbl {\n    font-size: 9px;\n    white-space: nowrap;\n    font-weight: 500;\n  }\n}\n\n.ribbon-mini-col[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: row;\n  gap: 2px;\n}\n\n.ribbon-mini-btn[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 22px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 3px;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  font-size: 9.5px;\n\n  &:hover { background: rgba(125, 125, 125, 0.1); }\n\n  &.active-align {\n    background: var(--primary-soft);\n    color: var(--primary);\n    border-color: rgba(79, 70, 229, 0.35);\n  }\n}\n\n.ribbon-search-field[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 165px;\n\n  .search-ico {\n    position: absolute;\n    left: 7px;\n    font-size: 9.5px;\n    color: var(--text-muted);\n    pointer-events: none;\n  }\n\n  .ribbon-search-inp {\n    width: 100%;\n    height: 24px;\n    padding: 2px 20px 2px 22px;\n    font-size: 10.5px;\n    border-radius: 4px;\n    border: 1px solid var(--surface-border);\n    background: var(--surface);\n    color: var(--text);\n    outline: none;\n    transition: border-color 0.12s ease;\n\n    &:focus {\n      border-color: var(--primary);\n    }\n  }\n\n  .clear-btn-inline {\n    position: absolute;\n    right: 5px;\n    background: transparent;\n    border: none;\n    font-size: 9px;\n    cursor: pointer;\n    color: var(--text-muted);\n  }\n\n  .spin-inline {\n    position: absolute;\n    right: 5px;\n    font-size: 9px;\n    color: var(--primary);\n  }\n}\n\n.ribbon-btn-action[_ngcontent-%COMP%] {\n  background: var(--primary) !important;\n  color: #ffffff !important;\n  border-color: var(--primary) !important;\n  font-weight: 700 !important;\n\n  &:hover {\n    filter: brightness(1.1);\n  }\n\n  .sync-count-tag {\n    font-size: 8.5px;\n    padding: 0 4px;\n    background: #ffffff;\n    color: var(--primary);\n    border-radius: 999px;\n    font-weight: 800;\n    margin-left: 2px;\n  }\n}\n\n.ribbon-record-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 7px;\n  background: rgba(125, 125, 125, 0.08);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--text-muted);\n  height: 24px;\n}\n\n\n\n.ribbon-scroll-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.ribbon-empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 11px;\n  color: var(--text-muted);\n  padding: 4px 12px;\n  background: rgba(125, 125, 125, 0.05);\n  border-radius: 4px;\n  border: 1px dashed var(--surface-border);\n}\n\n.ribbon-boxes-track[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  overflow-x: auto;\n  scrollbar-width: thin;\n  height: 100%;\n  flex-grow: 1;\n  padding: 2px 2px;\n\n  &::-webkit-scrollbar {\n    height: 4px;\n  }\n  &::-webkit-scrollbar-thumb {\n    background: rgba(125, 125, 125, 0.25);\n    border-radius: 2px;\n  }\n}\n\n.ribbon-small-box[_ngcontent-%COMP%] {\n  position: relative;\n  flex-shrink: 0;\n  min-width: 115px;\n  max-width: 140px;\n  height: 46px;\n  background: var(--surface);\n  border: 1px solid var(--surface-border);\n  border-radius: 5px;\n  padding: 3px 8px 3px 6px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: all 0.12s ease;\n  user-select: none;\n\n  &:hover {\n    border-color: var(--primary);\n    background: var(--primary-soft);\n    transform: translateY(-1px);\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);\n  }\n\n  &.active-box {\n    border-color: rgba(16, 185, 129, 0.6);\n    background: rgba(16, 185, 129, 0.08);\n  }\n\n  .box-star-btn {\n    position: absolute;\n    top: 2px;\n    right: 2px;\n    width: 15px;\n    height: 15px;\n    border: none;\n    background: transparent;\n    cursor: pointer;\n    color: var(--text-muted);\n    font-size: 9px;\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 2;\n    transition: all 0.12s;\n\n    &:hover {\n      color: #f59e0b;\n      transform: scale(1.2);\n    }\n\n    &.starred {\n      color: #f59e0b;\n    }\n  }\n\n  .box-icon-wrap {\n    width: 25px;\n    height: 25px;\n    border-radius: 4px;\n    background: var(--primary-soft);\n    color: var(--primary);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 11px;\n    flex-shrink: 0;\n\n    &.report-icon-bg {\n      background: rgba(16, 185, 129, 0.15);\n      color: #059669;\n    }\n  }\n\n  .box-info {\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n    padding-right: 10px;\n\n    .box-name-eng-main {\n      font-size: 11px;\n      font-weight: 600;\n      color: var(--text);\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .box-name-hin {\n      font-size: 10.5px;\n      font-weight: 700;\n      color: var(--text);\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .box-name-eng {\n      font-size: 9px;\n      color: var(--text-muted);\n      font-family: monospace;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n  }\n\n  .box-dot {\n    position: absolute;\n    bottom: 3px;\n    right: 3px;\n    width: 5px;\n    height: 5px;\n    border-radius: 50%;\n    background: #10b981;\n  }\n}\n\n.btn-group-cmd[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.cmd-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  transition: all 0.15s;\n  user-select: none;\n\n  i {\n    font-size: 10.5px;\n  }\n}\n.cmd-btn[_ngcontent-%COMP%]:hover { background: rgba(125, 125, 125, 0.1); }\n.cmd-btn.active[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.cmd-btn-primary[_ngcontent-%COMP%] { background: var(--primary); color: white; border-color: var(--primary); }\n.cmd-btn-primary[_ngcontent-%COMP%]:hover { background: var(--primary-hover); }\n.cmd-btn-success[_ngcontent-%COMP%] { background: var(--success); color: white; border-color: var(--success); }\n.cmd-btn-success[_ngcontent-%COMP%]:hover { background: #059669; }\n.cmd-btn-warning[_ngcontent-%COMP%] { background: var(--warning-soft); color: #b45309; border-color: rgba(245, 158, 11, 0.3); }\n\n.sync-badge-count[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: #f59e0b;\n  color: #ffffff;\n  font-size: 9.5px;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 999px;\n  margin-left: 4px;\n  line-height: 1.1;\n}\n\n\n\n.formula-bar-row[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n}\n.coord-box[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 22px;\n  line-height: 18px;\n  text-align: center;\n  font-weight: 700;\n  font-size: 11px;\n  padding: 1px 3px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  background: rgba(125, 125, 125, 0.05);\n}\n.active-col-chip[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n  padding: 1px 6px;\n  height: 20px;\n  line-height: 17px;\n  border-radius: 4px;\n  font-size: 10.5px;\n  font-weight: 600;\n  white-space: nowrap;\n  max-width: 170px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.formula-input[_ngcontent-%COMP%] {\n  flex-grow: 1;\n  height: 22px;\n  padding: 2px 7px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 11.5px;\n  font-family: inherit;\n  outline: none;\n  background: var(--surface);\n  color: var(--text);\n}\n.formula-input[_ngcontent-%COMP%]:focus { border-color: var(--primary); }\n\n.formula-bar-right-area[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n  margin-left: 4px;\n}\n\n.formula-search-field[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 175px;\n\n  .search-ico {\n    position: absolute;\n    left: 7px;\n    font-size: 9.5px;\n    color: var(--text-muted);\n    pointer-events: none;\n  }\n\n  .formula-search-inp {\n    width: 100%;\n    height: 22px;\n    padding: 2px 20px 2px 22px;\n    font-size: 10.5px;\n    border-radius: 4px;\n    border: 1px solid var(--surface-border);\n    background: var(--surface);\n    color: var(--text);\n    outline: none;\n    transition: border-color 0.12s ease;\n\n    &:focus {\n      border-color: var(--primary);\n    }\n  }\n\n  .clear-btn-inline {\n    position: absolute;\n    right: 5px;\n    background: transparent;\n    border: none;\n    font-size: 9px;\n    cursor: pointer;\n    color: var(--text-muted);\n  }\n\n  .spin-inline {\n    position: absolute;\n    right: 5px;\n    font-size: 9px;\n    color: var(--primary);\n  }\n}\n\n.formula-record-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 1px 7px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--text-muted);\n  height: 22px;\n  white-space: nowrap;\n}\n.control-settings-bar[_ngcontent-%COMP%] {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  flex-shrink: 0;\n  font-size: 11px;\n}\n.ctrl-bar-left[_ngcontent-%COMP%], .ctrl-bar-right[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.ctrl-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 8px;\n  height: 23px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text-muted);\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n\n  i {\n    font-size: 10px;\n  }\n}\n.ctrl-btn[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text);\n}\n.ctrl-btn.active[_ngcontent-%COMP%] {\n  color: var(--primary);\n  background: var(--primary-soft);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.ctrl-btn-danger[_ngcontent-%COMP%] {\n  color: var(--danger);\n  background: var(--danger-soft);\n  border-color: rgba(239, 68, 68, 0.3);\n}\n.ctrl-btn-danger[_ngcontent-%COMP%]:hover {\n  background: rgba(239, 68, 68, 0.2);\n}\n.ctrl-dot[_ngcontent-%COMP%] {\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  background: #10b981;\n  display: inline-block;\n}\n.ctrl-search-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n  flex-grow: 1;\n  max-width: 420px;\n}\n.ctrl-search-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 8px;\n  color: var(--text-muted);\n  font-size: 10px;\n  pointer-events: none;\n}\n.ctrl-search-input[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 23px;\n  padding: 2px 24px 2px 24px;\n  border: 1px solid var(--surface-border);\n  border-radius: 999px;\n  font-size: 11px;\n  background: rgba(125, 125, 125, 0.05);\n  color: var(--text);\n  outline: none;\n  transition: all 0.15s;\n}\n.ctrl-search-input[_ngcontent-%COMP%]:focus {\n  border-color: var(--primary);\n  background: var(--surface);\n  box-shadow: 0 0 0 2px var(--primary-soft);\n}\n.ctrl-search-clear[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 6px;\n  background: none;\n  border: none;\n  font-size: 10px;\n  color: var(--text-muted);\n  cursor: pointer;\n  padding: 1px 4px;\n  border-radius: 50%;\n}\n.ctrl-search-clear[_ngcontent-%COMP%]:hover {\n  color: var(--danger);\n  background: rgba(125, 125, 125, 0.15);\n}\n.ctrl-search-spinner[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 24px;\n  color: var(--primary);\n  font-size: 10px;\n}\n.ctrl-record-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 1px 7px;\n  height: 21px;\n  border-radius: 999px;\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text-muted);\n  font-size: 10px;\n  font-weight: 600;\n  white-space: nowrap;\n\n  i {\n    font-size: 10px;\n  }\n}\n\n\n\n.status-strip[_ngcontent-%COMP%] {\n  padding: 3px 14px;\n  font-size: 11.5px;\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  background: rgba(125, 125, 125, 0.04);\n}\n.status-strip.strip-error[_ngcontent-%COMP%] { background: #fef2f2; color: #991b1b; }\n.status-strip.strip-clean[_ngcontent-%COMP%] { background: #f0fdf4; color: #166534; }\n.status-strip.strip-suggestion[_ngcontent-%COMP%] { background: #fffbeb; color: #92400e; }\n\n\n\n.spreadsheet-canvas[_ngcontent-%COMP%] {\n  flex-grow: 1;\n  overflow: hidden;\n  background: var(--surface);\n  position: relative;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n\n  sutram-grid {\n    display: block;\n    width: 100%;\n    height: 100%;\n    flex: 1;\n    min-height: 0;\n  }\n}\n\n\n\n.studio-footer[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  background: var(--surface);\n  border-top: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n}\n.sheet-tabs-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  background: rgba(125, 125, 125, 0.05);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 2px 6px;\n  overflow-x: auto;\n  scrollbar-width: none;\n}\n.sheet-tabs-bar[_ngcontent-%COMP%]::-webkit-scrollbar { display: none; }\n\n.tab-pill[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 12px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11.5px;\n  font-weight: 600;\n  cursor: pointer;\n  color: var(--text-muted);\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  white-space: nowrap;\n  transition: all 0.15s;\n}\n.tab-pill[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.1);\n  color: var(--text);\n}\n.tab-pill.active-tab[_ngcontent-%COMP%] {\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-color: rgba(16, 185, 129, 0.25);\n  border-bottom: 2px solid #10b981;\n  font-weight: 700;\n}\n\n.sheet-tab-badge[_ngcontent-%COMP%] {\n  font-size: 9.5px;\n  padding: 1px 5px;\n  background: rgba(16, 185, 129, 0.2);\n  color: #059669;\n  border-radius: 999px;\n  font-weight: 700;\n}\n\n.add-tab-btn[_ngcontent-%COMP%] {\n  padding: 2px 8px;\n  border: 1px dashed rgba(125, 125, 125, 0.4);\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  color: var(--primary);\n  margin-left: 4px;\n}\n.add-tab-btn[_ngcontent-%COMP%]:hover { background: rgba(79, 70, 229, 0.1); }\n\n.sheet-tab-rough-badge[_ngcontent-%COMP%] {\n  font-size: 9px;\n  padding: 1px 4px;\n  background: rgba(245, 158, 11, 0.2);\n  color: #d97706;\n  border-radius: 3px;\n  font-weight: 700;\n  text-transform: uppercase;\n}\n\n.tab-close-btn[_ngcontent-%COMP%] {\n  margin-left: 3px;\n  width: 15px;\n  height: 15px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted);\n  border-radius: 3px;\n  cursor: pointer;\n  font-size: 9.5px;\n  line-height: 1;\n  padding: 0;\n  transition: all 0.12s;\n\n  &:hover {\n    background: rgba(239, 68, 68, 0.18);\n    color: #ef4444;\n  }\n}\n\n.tab-edit-btn[_ngcontent-%COMP%] {\n  margin-left: 2px;\n  width: 15px;\n  height: 15px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted);\n  border-radius: 3px;\n  cursor: pointer;\n  padding: 0;\n  opacity: 0.5;\n  transition: all 0.12s;\n\n  &:hover {\n    opacity: 1;\n    background: rgba(59, 130, 246, 0.15);\n    color: var(--primary, #3b82f6);\n  }\n}\n\n.tab-inline-rename-input[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 600;\n  padding: 1px 5px;\n  height: 19px;\n  min-width: 70px;\n  max-width: 160px;\n  border: 1px solid var(--primary, #3b82f6);\n  border-radius: 3px;\n  background: var(--surface-card, #ffffff);\n  color: var(--text, #1e293b);\n  outline: none;\n  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);\n}\n\n.tab-context-menu[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: 9999;\n  background: var(--surface-card, #ffffff);\n  border: 1px solid var(--surface-border, rgba(125, 125, 125, 0.25));\n  border-radius: 6px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);\n  min-width: 175px;\n  padding: 4px;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.tab-context-menu-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 10px;\n  font-size: 11.5px;\n  font-weight: 500;\n  color: var(--text);\n  border-radius: 4px;\n  cursor: pointer;\n  user-select: none;\n  transition: background 0.12s;\n\n  i {\n    font-size: 12px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.12);\n  }\n\n  &.text-danger:hover {\n    background: rgba(239, 68, 68, 0.12);\n  }\n}\n\n.bottom-status-subrow[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 3px 14px;\n  font-size: 11px;\n  color: var(--text-muted);\n}\n.zoom-controls[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  padding: 1px 4px;\n}\n.zoom-btn[_ngcontent-%COMP%] {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  color: var(--text);\n  padding: 1px 5px;\n  font-size: 11px;\n}\n.zoom-display[_ngcontent-%COMP%] {\n  font-weight: 700;\n  cursor: pointer;\n  padding: 0 4px;\n}\n\n\n\n.sync-toast-hud[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 50px;\n  right: 20px;\n  z-index: 2500;\n  min-width: 320px;\n  max-width: 440px;\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);\n  overflow: hidden;\n  animation: _ngcontent-%COMP%_toastSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);\n  font-size: 11.5px;\n}\n@keyframes _ngcontent-%COMP%_toastSlideIn {\n  from { opacity: 0; transform: translateY(-12px) scale(0.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n.sync-toast-header[_ngcontent-%COMP%] {\n  padding: 8px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--surface-border);\n  background: rgba(125, 125, 125, 0.04);\n}\n.sync-toast-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-weight: 700;\n  font-size: 12px;\n}\n.sync-toast-close[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: var(--text-muted);\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 5px;\n  border-radius: 3px;\n}\n.sync-toast-close[_ngcontent-%COMP%]:hover {\n  background: rgba(125, 125, 125, 0.12);\n  color: var(--text);\n}\n.sync-toast-body[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.sync-toast-stats[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.sync-badge-chip[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n}\n.chip-success[_ngcontent-%COMP%] {\n  background: var(--success-soft);\n  color: var(--success);\n}\n.chip-info[_ngcontent-%COMP%] {\n  background: var(--primary-soft);\n  color: var(--primary);\n}\n.chip-warning[_ngcontent-%COMP%] {\n  background: var(--warning-soft);\n  color: #b45309;\n}\n.chip-danger[_ngcontent-%COMP%] {\n  background: var(--danger-soft);\n  color: var(--danger);\n}\n.sync-toast-errors[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  padding: 6px 8px;\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.2);\n  border-radius: 4px;\n  font-size: 10.5px;\n  color: #ef4444;\n  max-height: 140px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n\n\n\n.last-sync-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 1px 7px;\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-radius: 4px;\n  font-weight: 600;\n  font-size: 10.5px;\n  border: 1px solid rgba(16, 185, 129, 0.25);\n\n  &.sync-error {\n    background: rgba(239, 68, 68, 0.12);\n    color: #ef4444;\n    border-color: rgba(239, 68, 68, 0.25);\n  }\n}\n\n\n\n.sync-progress-wrap[_ngcontent-%COMP%] {\n  width: 100%;\n}\n.sync-progress-track[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 6px;\n  background: rgba(125, 125, 125, 0.2);\n  border-radius: 999px;\n  overflow: hidden;\n}\n.sync-progress-bar[_ngcontent-%COMP%] {\n  height: 100%;\n  background: linear-gradient(90deg, #3b82f6, #10b981);\n  border-radius: 999px;\n  transition: width 0.2s ease-in-out;\n}\n\n\n\n\n\n  .sutram-col-config-popover {\n  width: min(94vw, 760px) !important;\n  height: 520px !important;\n  max-height: calc(100vh - 80px) !important;\n  font-size: 11.5px;\n  border-radius: 8px !important;\n  overflow: hidden !important;\n  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1) !important;\n  border: 1px solid var(--surface-border, #e2e8f0) !important;\n  background: var(--surface, #ffffff) !important;\n  color: var(--text, #0f172a) !important;\n  display: flex !important;\n  flex-direction: column !important;\n\n  .p-overlaypanel-content {\n    padding: 0 !important;\n    background: transparent !important;\n    color: inherit !important;\n    width: 100% !important;\n    height: 100% !important;\n    display: flex !important;\n    flex-direction: column !important;\n    flex: 1 1 auto !important;\n    min-height: 0 !important;\n    overflow: hidden !important;\n  }\n}\n\n.col-dd-split-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: row;\n  width: 100%;\n  flex: 1 1 0;\n  min-height: 0;\n  overflow: hidden;\n  background: var(--surface, #ffffff);\n}\n\n\n\n.col-dd-left-pane[_ngcontent-%COMP%] {\n  width: 325px;\n  min-width: 300px;\n  max-width: 340px;\n  border-right: 1px solid var(--surface-border, #e2e8f0);\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-height: 0;\n  background: var(--surface, #ffffff);\n  flex-shrink: 0;\n\n  .col-dd-header {\n    padding: 8px 10px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n    background: rgba(125, 125, 125, 0.03);\n    flex-shrink: 0 !important;\n  }\n\n  .col-dd-search-wrap {\n    position: relative;\n    display: flex;\n    align-items: center;\n\n    .col-dd-search-icon {\n      position: absolute;\n      left: 8px;\n      color: var(--text-muted, #64748b);\n      font-size: 11px;\n      pointer-events: none;\n    }\n\n    .col-dd-search-input {\n      width: 100%;\n      height: 28px;\n      padding: 4px 26px;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      border-radius: 4px;\n      font-size: 11.5px;\n      background: var(--bg, #f8fafc);\n      color: var(--text, #0f172a);\n      outline: none;\n      transition: border-color 0.12s;\n\n      &:focus {\n        border-color: var(--primary, #4f46e5);\n      }\n    }\n\n    .btn-clear-search-inline {\n      position: absolute;\n      right: 8px;\n      background: transparent;\n      border: none;\n      color: var(--text-muted, #64748b);\n      cursor: pointer;\n      font-size: 11px;\n      padding: 0;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n\n      &:hover {\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .col-dd-actions {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0 2px;\n\n    .col-dd-actions-left {\n      display: flex;\n      gap: 4px;\n    }\n\n    .col-dd-act-btn {\n      padding: 2px 7px;\n      font-size: 10.5px;\n      font-weight: 600;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      background: var(--surface, #ffffff);\n      color: var(--text-muted, #64748b);\n      border-radius: 3px;\n      cursor: pointer;\n      transition: all 0.12s;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n        color: var(--text, #0f172a);\n      }\n    }\n\n    .col-dd-count {\n      font-size: 10.5px;\n      color: var(--text-muted, #64748b);\n      font-weight: 600;\n    }\n  }\n\n  .col-dd-body {\n    padding: 6px 8px;\n    overflow-y: auto !important;\n    overflow-x: hidden !important;\n    flex: 1 1 0 !important;\n    min-height: 0 !important;\n    display: flex;\n    flex-direction: column;\n    gap: 3px;\n    overscroll-behavior: contain;\n    scrollbar-width: thin;\n\n    &::-webkit-scrollbar {\n      width: 5px;\n    }\n    &::-webkit-scrollbar-track {\n      background: rgba(125, 125, 125, 0.05);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb {\n      background: rgba(125, 125, 125, 0.3);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb:hover {\n      background: var(--primary, #4f46e5);\n    }\n  }\n\n  .col-dd-section-title {\n    font-size: 10px;\n    font-weight: 700;\n    color: var(--text-muted, #64748b);\n    margin: 4px 0 2px 4px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    flex-shrink: 0 !important;\n    display: flex;\n    align-items: center;\n\n    &.fx-section-title {\n      color: #7c3aed !important;\n      margin-top: 8px;\n    }\n  }\n\n  .col-dd-item {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 4px 6px;\n    border-radius: 4px;\n    cursor: pointer;\n    user-select: none;\n    transition: background 0.1s;\n    font-size: 11.5px;\n    color: var(--text, #0f172a);\n    flex-shrink: 0 !important;\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.08);\n    }\n\n    &.fx-item:hover {\n      background: rgba(139, 92, 246, 0.08) !important;\n    }\n\n    .col-dd-item-left {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .col-dd-item-name {\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n  }\n\n  .custom-check {\n    width: 14px;\n    height: 14px;\n    cursor: pointer;\n    accent-color: var(--primary, #4f46e5);\n    margin: 0;\n    flex-shrink: 0;\n  }\n\n  .badge-fx-mini {\n    font-size: 8.5px;\n    font-weight: 700;\n    padding: 1px 4px;\n    border-radius: 3px;\n    background: rgba(139, 92, 246, 0.15);\n    color: #7c3aed;\n    flex-shrink: 0;\n  }\n\n  .type-badge {\n    font-size: 9.5px;\n    padding: 1px 5px;\n    border-radius: 3px;\n    background: rgba(125, 125, 125, 0.12);\n    color: var(--text-muted, #64748b);\n    font-family: 'JetBrains Mono', monospace;\n    flex-shrink: 0;\n\n    &.badge-fx-type {\n      background: rgba(139, 92, 246, 0.12) !important;\n      color: #7c3aed !important;\n    }\n  }\n\n  \n\n  .col-dd-group {\n    border: 1px solid var(--surface-border, #e2e8f0);\n    border-radius: 5px;\n    margin: 3px 0;\n    overflow: hidden;\n    background: rgba(125, 125, 125, 0.02);\n    flex-shrink: 0 !important;\n\n    &.fk-active-group {\n      border-color: rgba(79, 70, 229, 0.35);\n    }\n\n    .col-dd-group-header {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      padding: 5px 8px;\n      background: rgba(125, 125, 125, 0.06);\n      cursor: pointer;\n      user-select: none;\n      font-size: 11.5px;\n      font-weight: 600;\n      flex-shrink: 0 !important;\n      min-height: 28px !important;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n      }\n\n      .col-dd-group-left {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        overflow: hidden;\n      }\n\n      .fk-expand-toggle {\n        font-size: 10px;\n        color: var(--text-muted, #64748b);\n        width: 12px;\n        text-align: center;\n        transition: transform 0.18s ease;\n\n        &.rotated {\n          transform: rotate(90deg);\n        }\n      }\n\n      .fk-group-pill {\n        font-size: 9.5px;\n        padding: 1px 5px;\n        border-radius: 999px;\n        font-weight: 600;\n      }\n    }\n\n    .col-dd-group-items {\n      padding: 3px 4px 4px 18px;\n      background: var(--surface, #ffffff);\n      border-top: 1px solid var(--surface-border, #e2e8f0);\n      display: flex;\n      flex-direction: column;\n      gap: 2px;\n      max-height: none !important;\n      overflow: visible !important;\n    }\n  }\n\n  .col-dd-empty {\n    padding: 16px;\n    text-align: center;\n    color: var(--text-muted, #64748b);\n    font-size: 11.5px;\n  }\n}\n\n\n\n.col-dd-right-pane[_ngcontent-%COMP%] {\n  flex: 1 1 0;\n  min-width: 350px;\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-height: 0;\n  background: var(--surface-ground, rgba(125, 125, 125, 0.02));\n\n  .col-dd-right-header {\n    padding: 8px 12px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    background: var(--surface, #ffffff);\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n    flex-shrink: 0;\n\n    .col-dd-right-title-wrap {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n\n      .col-dd-right-title {\n        font-size: 11.5px;\n        font-weight: 700;\n        color: var(--text, #0f172a);\n        display: flex;\n        align-items: center;\n      }\n\n      .col-dd-right-badge {\n        font-size: 10px;\n        font-weight: 600;\n        padding: 2px 7px;\n        border-radius: 999px;\n        background: rgba(79, 70, 229, 0.12);\n        color: var(--primary, #4f46e5);\n      }\n    }\n\n    .col-dd-right-sub {\n      font-size: 10px;\n      color: var(--text-muted, #64748b);\n    }\n  }\n\n  .col-dd-right-body {\n    padding: 8px 10px;\n    overflow-y: auto !important;\n    overflow-x: hidden !important;\n    flex: 1 1 0;\n    min-height: 0;\n    display: flex;\n    flex-direction: column;\n    gap: 5px;\n    scrollbar-width: thin;\n\n    &::-webkit-scrollbar {\n      width: 5px;\n    }\n    &::-webkit-scrollbar-thumb {\n      background: rgba(125, 125, 125, 0.3);\n      border-radius: 3px;\n    }\n  }\n\n  .col-dd-empty {\n    padding: 20px;\n    text-align: center;\n    color: var(--text-muted, #64748b);\n    font-size: 11.5px;\n  }\n}\n\n\n\n.col-selected-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 5px 8px;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 6px;\n  transition: all 0.15s ease;\n  flex-shrink: 0;\n\n  &:hover {\n    border-color: rgba(79, 70, 229, 0.4);\n    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);\n  }\n\n  \n\n  .col-card-order-controls {\n    display: flex;\n    align-items: center;\n    gap: 4px;\n    flex-shrink: 0;\n\n    .col-card-letter-badge {\n      width: 22px;\n      height: 22px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      background: rgba(125, 125, 125, 0.1);\n      color: var(--text, #0f172a);\n      border-radius: 4px;\n      font-size: 11px;\n      font-weight: 700;\n      font-family: monospace;\n    }\n\n    .col-card-arrows {\n      display: flex;\n      flex-direction: column;\n      gap: 1px;\n\n      .btn-arrow {\n        width: 16px;\n        height: 11px;\n        padding: 0;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        background: transparent;\n        border: 1px solid var(--surface-border, #e2e8f0);\n        border-radius: 2px;\n        color: var(--text-muted, #64748b);\n        cursor: pointer;\n        font-size: 7px;\n        transition: all 0.1s;\n\n        &:hover:not(:disabled) {\n          background: var(--primary, #4f46e5);\n          border-color: var(--primary, #4f46e5);\n          color: #ffffff;\n        }\n\n        &:disabled {\n          opacity: 0.3;\n          cursor: default;\n        }\n      }\n    }\n  }\n\n  \n\n  .col-card-meta {\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n    flex: 1 1 0;\n    min-width: 0;\n\n    .col-card-meta-top {\n      display: flex;\n      align-items: center;\n      gap: 4px;\n      overflow: hidden;\n\n      .col-card-key-txt {\n        font-size: 11px;\n        font-weight: 600;\n        color: var(--text, #0f172a);\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n\n      .badge-fx-mini {\n        font-size: 8.5px;\n        font-weight: 700;\n        padding: 0 4px;\n        border-radius: 3px;\n        background: rgba(139, 92, 246, 0.15);\n        color: #7c3aed;\n        flex-shrink: 0;\n      }\n\n      .badge-fk-pill {\n        font-size: 8.5px;\n        padding: 0 4px;\n        border-radius: 3px;\n        background: rgba(59, 130, 246, 0.12);\n        color: #2563eb;\n        font-weight: 600;\n        flex-shrink: 0;\n      }\n      .badge-sub-pill {\n        font-size: 8.5px;\n        padding: 0 4px;\n        border-radius: 3px;\n        background: rgba(16, 185, 129, 0.12);\n        color: #059669;\n        font-weight: 600;\n        flex-shrink: 0;\n      }\n      .badge-raw-pill {\n        font-size: 8.5px;\n        padding: 0 4px;\n        border-radius: 3px;\n        background: rgba(245, 158, 11, 0.12);\n        color: #d97706;\n        font-weight: 600;\n        flex-shrink: 0;\n      }\n      .badge-std-pill {\n        font-size: 8.5px;\n        padding: 0 4px;\n        border-radius: 3px;\n        background: rgba(125, 125, 125, 0.1);\n        color: var(--text-muted, #64748b);\n        font-family: monospace;\n        flex-shrink: 0;\n      }\n    }\n\n    .col-card-label-wrap {\n      display: flex;\n\n      .col-card-label-inp {\n        width: 100%;\n        height: 22px;\n        padding: 2px 6px;\n        font-size: 10.5px;\n        border: 1px solid var(--surface-border, #e2e8f0);\n        border-radius: 3px;\n        background: var(--bg, #f8fafc);\n        color: var(--text, #0f172a);\n        outline: none;\n        transition: border-color 0.12s;\n\n        &:focus {\n          border-color: var(--primary, #4f46e5);\n          background: var(--surface, #ffffff);\n        }\n      }\n    }\n  }\n\n  \n\n  .col-card-format-ctrls {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    flex-shrink: 0;\n\n    .col-card-select-wrap {\n      .col-card-select {\n        height: 24px;\n        font-size: 10px;\n        padding: 2px 4px;\n        border: 1px solid var(--surface-border, #e2e8f0);\n        border-radius: 4px;\n        background: var(--surface, #ffffff);\n        color: var(--text, #0f172a);\n        outline: none;\n        cursor: pointer;\n        max-width: 125px;\n\n        &:focus {\n          border-color: var(--primary, #4f46e5);\n        }\n      }\n    }\n\n    .col-card-plain-type {\n      min-width: 75px;\n      text-align: center;\n\n      .text-purple-xs {\n        font-size: 9.5px;\n        font-weight: 600;\n        color: #7c3aed;\n      }\n      .text-muted-xs {\n        font-size: 9.5px;\n        color: var(--text-muted, #64748b);\n      }\n    }\n\n    .btn-col-hide {\n      width: 22px;\n      height: 22px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      background: transparent;\n      border: 1px solid transparent;\n      border-radius: 4px;\n      color: var(--text-muted, #64748b);\n      cursor: pointer;\n      font-size: 11px;\n      transition: all 0.12s;\n\n      &:hover {\n        background: rgba(239, 68, 68, 0.1);\n        border-color: rgba(239, 68, 68, 0.2);\n        color: #ef4444;\n      }\n    }\n  }\n}\n\n\n\n.col-dd-footer[_ngcontent-%COMP%] {\n  padding: 6px 12px;\n  border-top: 1px solid var(--surface-border, #e2e8f0);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  background: var(--surface, #ffffff);\n  flex-shrink: 0 !important;\n}\n\n\n\n.active-sheet-badge-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 10px;\n  border-radius: 6px;\n  background: rgba(99, 102, 241, 0.12);\n  border: 1px solid rgba(99, 102, 241, 0.3);\n  color: #4f46e5;\n  font-size: 11px;\n  font-weight: 600;\n  white-space: nowrap;\n  max-width: 170px;\n\n  i {\n    font-size: 11px;\n  }\n\n  .sheet-title-text {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n}\n\n.dark-theme[_nghost-%COMP%]   .active-sheet-badge-pill[_ngcontent-%COMP%], .dark-theme   [_nghost-%COMP%]   .active-sheet-badge-pill[_ngcontent-%COMP%], .dark-mode[_nghost-%COMP%]   .active-sheet-badge-pill[_ngcontent-%COMP%], .dark-mode   [_nghost-%COMP%]   .active-sheet-badge-pill[_ngcontent-%COMP%] {\n  background: rgba(99, 102, 241, 0.22);\n  border-color: rgba(99, 102, 241, 0.45);\n  color: #818cf8;\n}\n\n\n\n\n\n\n\n\n  .sutram-studio-dialog {\n  .p-dialog-header {\n    background: var(--surface, #ffffff);\n    color: var(--text, #0f172a);\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    padding: 8px 12px !important;\n    font-size: 12px !important;\n    font-weight: 700;\n\n    .p-dialog-title {\n      font-size: 12px !important;\n      font-weight: 700;\n      display: flex;\n      align-items: center;\n      gap: 6px;\n    }\n\n    .p-dialog-header-icon {\n      width: 22px !important;\n      height: 22px !important;\n      font-size: 11px !important;\n      border-radius: 4px;\n      color: var(--text-muted, #64748b);\n      &:hover {\n        background: var(--surface-hover, rgba(0,0,0,0.05));\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .p-dialog-content {\n    background: var(--surface-ground, #f8fafc);\n    color: var(--text, #0f172a);\n    padding: 10px 12px !important;\n    overflow-y: auto;\n    font-size: 11.5px;\n  }\n\n  .p-dialog-footer {\n    background: var(--surface, #ffffff);\n    border-top: 1px solid var(--surface-border, #e2e8f0);\n    padding: 7px 12px !important;\n  }\n}\n\n.dialog-body-wrap[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.dialog-subtext[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--text-muted, #64748b);\n  line-height: 1.35;\n}\n\n.dialog-info-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 6px 10px;\n  font-size: 11px;\n  border-radius: 5px;\n  line-height: 1.3;\n\n  &.info {\n    background: rgba(59, 130, 246, 0.08);\n    border: 1px solid rgba(59, 130, 246, 0.2);\n    color: var(--text, #0f172a);\n    .banner-icon { color: #2563eb; }\n  }\n\n  &.warning {\n    background: rgba(245, 158, 11, 0.08);\n    border: 1px solid rgba(245, 158, 11, 0.25);\n    color: var(--text, #0f172a);\n    .banner-icon { color: #d97706; }\n  }\n\n  .banner-icon {\n    font-size: 12px;\n    flex-shrink: 0;\n  }\n}\n\n.dialog-subcard[_ngcontent-%COMP%] {\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 6px;\n  padding: 8px 10px;\n}\n\n.subcard-title[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 700;\n  color: var(--text, #0f172a);\n  margin-bottom: 6px;\n}\n\n.subcard-grid[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-end;\n  gap: 8px;\n  flex-wrap: wrap;\n\n  .subcard-col-2 { width: calc(16.66% - 7px); }\n  .subcard-col-3 { width: calc(25% - 6px); }\n  .subcard-col-4 { width: calc(33.33% - 6px); }\n  .subcard-col-5 { width: calc(41.66% - 5px); }\n  .subcard-col-6 { width: calc(50% - 4px); }\n  .subcard-col-7 { width: calc(58.33% - 4px); }\n}\n\n.dialog-label[_ngcontent-%COMP%] {\n  font-size: 10px;\n  font-weight: 700;\n  color: var(--text-muted, #64748b);\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  margin-bottom: 3px;\n  display: block;\n}\n\n.dialog-ctrl-input[_ngcontent-%COMP%] {\n  height: 26px !important;\n  font-size: 11.5px !important;\n  padding: 2px 7px !important;\n  border-radius: 4px !important;\n  width: 100% !important;\n}\n\n.dialog-ctrl-textarea[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 5px 8px;\n  font-size: 11px;\n  line-height: 1.4;\n  border-radius: 4px;\n  border: 1px solid var(--surface-border, #cbd5e1);\n  background: var(--surface, #ffffff);\n  color: var(--text, #0f172a);\n  resize: vertical;\n\n  &:focus {\n    outline: none;\n    border-color: #3b82f6;\n  }\n}\n\n  .dialog-ctrl-dropdown {\n  height: 26px !important;\n  font-size: 11.5px !important;\n  width: 100% !important;\n\n  .p-dropdown-label {\n    padding: 2px 7px !important;\n    font-size: 11.5px !important;\n    line-height: 22px !important;\n  }\n  .p-dropdown-trigger {\n    width: 22px !important;\n  }\n}\n\n.dialog-btn-add[_ngcontent-%COMP%] {\n  height: 26px !important;\n  font-size: 11px !important;\n  padding: 0 10px !important;\n  border-radius: 4px !important;\n}\n\n.chips-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-top: 5px;\n}\n\n.chips-label[_ngcontent-%COMP%] {\n  font-size: 10px;\n  color: var(--text-muted, #64748b);\n  font-weight: 600;\n}\n\n.quick-chip[_ngcontent-%COMP%] {\n  font-size: 9.5px;\n  font-family: var(--font-mono, monospace);\n  padding: 1px 6px;\n  border-radius: 3px;\n  background: var(--surface-ground, #f1f5f9);\n  color: var(--text, #0f172a);\n  border: 1px solid var(--surface-border, #cbd5e1);\n  cursor: pointer;\n  user-select: none;\n  transition: all 0.15s ease;\n\n  &:hover {\n    background: #e2e8f0;\n    border-color: #94a3b8;\n  }\n\n  &.chip-green {\n    background: rgba(16, 185, 129, 0.08);\n    color: #059669;\n    border-color: rgba(16, 185, 129, 0.25);\n    &:hover { background: rgba(16, 185, 129, 0.18); }\n  }\n\n  &.chip-orange {\n    background: rgba(245, 158, 11, 0.08);\n    color: #d97706;\n    border-color: rgba(245, 158, 11, 0.25);\n    &:hover { background: rgba(245, 158, 11, 0.18); }\n  }\n\n  &.chip-blue {\n    background: rgba(59, 130, 246, 0.08);\n    color: #2563eb;\n    border-color: rgba(59, 130, 246, 0.25);\n    &:hover { background: rgba(59, 130, 246, 0.18); }\n  }\n}\n\n.dialog-table-card[_ngcontent-%COMP%] {\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 5px;\n  overflow: hidden;\n  max-height: 58vh;\n  overflow-y: auto;\n}\n\n.dialog-data-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 11.5px;\n\n  thead tr {\n    position: sticky;\n    top: 0;\n    z-index: 2;\n  }\n\n  th {\n    font-size: 10px;\n    font-weight: 700;\n    text-transform: uppercase;\n    letter-spacing: 0.3px;\n    padding: 5px 8px;\n    background: var(--surface-ground, #f8fafc);\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    color: var(--text-muted, #64748b);\n  }\n\n  td {\n    padding: 4px 8px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    vertical-align: middle;\n    color: var(--text, #0f172a);\n  }\n\n  tr:hover td {\n    background: var(--surface-hover, rgba(0,0,0,0.02));\n  }\n}\n\n.col-idx[_ngcontent-%COMP%] {\n  font-size: 10px;\n}\n\n.col-ident-cell[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n}\n\n.col-name-txt[_ngcontent-%COMP%] {\n  font-family: var(--font-mono, monospace);\n  font-weight: 600;\n  font-size: 11.5px;\n}\n\n.type-pill[_ngcontent-%COMP%] {\n  font-size: 9px;\n  font-weight: 600;\n  font-family: var(--font-mono, monospace);\n  padding: 1px 5px;\n  border-radius: 3px;\n  background: rgba(59, 130, 246, 0.08);\n  color: #2563eb;\n  border: 1px solid rgba(59, 130, 246, 0.2);\n  text-transform: lowercase;\n}\n\n.pk-pill[_ngcontent-%COMP%] {\n  font-size: 8.5px;\n  font-weight: 700;\n  font-family: var(--font-mono, monospace);\n  padding: 1px 4px;\n  border-radius: 3px;\n  background: rgba(245, 158, 11, 0.12);\n  color: #d97706;\n  border: 1px solid rgba(245, 158, 11, 0.25);\n}\n\n.event-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 9.5px;\n  font-weight: 700;\n  font-family: var(--font-mono, monospace);\n  padding: 1px 6px;\n  border-radius: 3px;\n\n  &.event-pill-insert {\n    background: rgba(16, 185, 129, 0.1);\n    color: #059669;\n    border: 1px solid rgba(16, 185, 129, 0.25);\n  }\n  &.event-pill-update {\n    background: rgba(59, 130, 246, 0.1);\n    color: #2563eb;\n    border: 1px solid rgba(59, 130, 246, 0.25);\n  }\n  &.event-pill-delete {\n    background: rgba(239, 68, 68, 0.1);\n    color: #dc2626;\n    border: 1px solid rgba(239, 68, 68, 0.25);\n  }\n}\n\n.dialog-table-input[_ngcontent-%COMP%] {\n  height: 24px !important;\n  font-size: 11.5px !important;\n  padding: 2px 7px !important;\n  border-radius: 3px !important;\n  width: 100% !important;\n}\n\n  .dialog-table-dropdown {\n  height: 24px !important;\n  font-size: 11.5px !important;\n  width: 100% !important;\n\n  .p-dropdown-label {\n    padding: 1px 6px !important;\n    font-size: 11.5px !important;\n    line-height: 22px !important;\n  }\n  .p-dropdown-trigger {\n    width: 20px !important;\n  }\n}\n\n.text-muted-xs[_ngcontent-%COMP%] {\n  font-size: 10.5px;\n  color: var(--text-muted, #64748b);\n}\n\n.btn-group-mini[_ngcontent-%COMP%] {\n  display: inline-flex;\n  gap: 2px;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 4px;\n  padding: 1px;\n}\n\n.mini-icon-btn[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 18px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted, #64748b);\n  border-radius: 2px;\n  cursor: pointer;\n  padding: 0;\n\n  &:hover:not(:disabled) {\n    background: var(--surface-hover, rgba(0,0,0,0.06));\n    color: var(--text, #0f172a);\n  }\n  &:disabled {\n    opacity: 0.3;\n    cursor: default;\n  }\n  i {\n    font-size: 9px;\n  }\n}\n\n.mini-del-btn[_ngcontent-%COMP%] {\n  width: 22px;\n  height: 20px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: 1px solid rgba(239, 68, 68, 0.25);\n  background: rgba(239, 68, 68, 0.05);\n  color: #dc2626;\n  border-radius: 3px;\n  cursor: pointer;\n  padding: 0;\n\n  &:hover {\n    background: rgba(239, 68, 68, 0.15);\n  }\n  i {\n    font-size: 10px;\n  }\n}\n\n.formula-cell[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 600;\n}\n\n.trigger-code-snippet[_ngcontent-%COMP%] {\n  background: var(--surface-ground, #f1f5f9);\n  padding: 2px 5px;\n  border-radius: 3px;\n  font-size: 10.5px;\n  color: var(--text, #0f172a);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  white-space: pre-wrap;\n  word-break: break-all;\n}\n\n.dialog-empty-box[_ngcontent-%COMP%] {\n  text-align: center;\n  color: var(--text-muted, #64748b);\n  padding: 14px 10px;\n  font-size: 11px;\n  border: 1px dashed var(--surface-border, #cbd5e1);\n  border-radius: 5px;\n}\n\n.dialog-footer-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 6px;\n}\n\n.dialog-btn-cancel[_ngcontent-%COMP%] {\n  height: 26px !important;\n  font-size: 11.5px !important;\n  padding: 0 10px !important;\n}\n\n.dialog-btn-save[_ngcontent-%COMP%] {\n  height: 26px !important;\n  font-size: 11.5px !important;\n  padding: 0 12px !important;\n}\n\n\n\n.user-role-badge-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  background: var(--surface-card, rgba(0, 0, 0, 0.04));\n  border: 1px solid var(--surface-border, #e2e8f0);\n  padding: 2px 8px;\n  border-radius: 12px;\n  cursor: pointer;\n  font-size: 11px;\n  font-weight: 600;\n  color: var(--text, #1e293b);\n  user-select: none;\n  transition: all 0.15s ease;\n\n  &:hover {\n    background: var(--surface-hover, rgba(0, 0, 0, 0.08));\n    border-color: var(--primary-color, #6366f1);\n  }\n\n  .user-name-txt {\n    font-size: 11px;\n    font-weight: 700;\n    font-family: monospace;\n  }\n}\n\n.role-pill-tag[_ngcontent-%COMP%] {\n  font-size: 9.5px;\n  font-weight: 700;\n  padding: 1px 6px;\n  border-radius: 999px;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n\n  &.admin-tag {\n    background: rgba(168, 85, 247, 0.15);\n    color: #9333ea;\n    border: 1px solid rgba(168, 85, 247, 0.3);\n  }\n\n  &.author-tag {\n    background: rgba(16, 185, 129, 0.15);\n    color: #059669;\n    border: 1px solid rgba(16, 185, 129, 0.3);\n  }\n}\n\n.dark-mode[_ngcontent-%COMP%] {\n  .role-pill-tag {\n    &.admin-tag {\n      background: rgba(168, 85, 247, 0.25);\n      color: #c084fc;\n    }\n    &.author-tag {\n      background: rgba(16, 185, 129, 0.25);\n      color: #34d399;\n    }\n  }\n}\n\n.btn-disabled-role[_ngcontent-%COMP%] {\n  opacity: 0.55 !important;\n  cursor: not-allowed !important;\n  filter: grayscale(0.5);\n}\n\n.btn-role-switch[_ngcontent-%COMP%] {\n  background: transparent;\n  border: 1px solid var(--surface-border, #cbd5e1);\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 2px 8px;\n  color: var(--text-muted, #64748b);\n  cursor: pointer;\n  transition: all 0.15s ease;\n\n  &:hover {\n    color: var(--text, #0f172a);\n    border-color: var(--text, #0f172a);\n  }\n\n  &.active-role {\n    background: var(--primary-color, #6366f1);\n    color: #ffffff !important;\n    border-color: var(--primary-color, #6366f1);\n  }\n}\n\n.badge-current-user[_ngcontent-%COMP%] {\n  font-size: 9px;\n  font-weight: 700;\n  background: rgba(59, 130, 246, 0.15);\n  color: #2563eb;\n  padding: 1px 4px;\n  border-radius: 3px;\n}\n\n.status-pill[_ngcontent-%COMP%] {\n  font-size: 10px;\n  font-weight: 600;\n  padding: 1px 6px;\n  border-radius: 4px;\n\n  &.active-pill {\n    background: rgba(16, 185, 129, 0.15);\n    color: #059669;\n  }\n\n  &.inactive-pill {\n    background: rgba(100, 116, 139, 0.15);\n    color: #64748b;\n  }\n}\n\n.btn-use-account[_ngcontent-%COMP%] {\n  font-size: 10.5px;\n  font-weight: 600;\n  padding: 2px 6px;\n  border-radius: 4px;\n  border: 1px solid var(--surface-border, #cbd5e1);\n  background: var(--surface, #ffffff);\n  color: var(--text, #0f172a);\n  cursor: pointer;\n  transition: all 0.15s;\n\n  &:hover {\n    background: var(--surface-hover, rgba(0, 0, 0, 0.05));\n    border-color: var(--primary-color, #6366f1);\n  }\n\n  &.btn-use-account-active {\n    background: rgba(16, 185, 129, 0.15);\n    color: #059669;\n    border-color: rgba(16, 185, 129, 0.4);\n    cursor: default;\n  }\n}\n\n.btn-link-mini[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  font-size: 11px;\n  cursor: pointer;\n  text-decoration: underline;\n  padding: 0;\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramExcelStudioComponent, [{
        type: Component,
        args: [{ selector: 'sutram-excel-studio', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-excel-studio.component.html -->\n<div class=\"sutram-excel-container\" [class.dark-mode]=\"isDarkMode\">\n\n  <!-- 1. TOP EXCEL-STYLE RIBBON HEADER (Few cm area) -->\n  <header class=\"studio-header\">\n    <!-- Top Menu Bar: Brand, Ribbon Tabs, Mode Switch & Theme -->\n    <div class=\"ribbon-menu-bar\">\n      <div class=\"menu-bar-left\">\n        <div class=\"brand\">\n          <div class=\"brand-icon\"><i class=\"pi pi-table\"></i></div>\n          <div class=\"brand-title\">\n            <span>Sutram Studio</span>\n            <span class=\"version-tag\">v2.0</span>\n          </div>\n        </div>\n\n        <!-- Excel Ribbon Tabs: Home, Tables, Reports -->\n        <nav class=\"ribbon-tabs-nav\">\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'home'\"\n                  (click)=\"setTopTab('home')\">\n            <i class=\"pi pi-home\"></i>\n            <span>Home</span>\n          </button>\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'tables'\"\n                  (click)=\"setTopTab('tables')\">\n            <i class=\"pi pi-database\"></i>\n            <span>Tables</span>\n            <span class=\"ribbon-badge\">{{ tablesList.length }}</span>\n          </button>\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'reports'\"\n                  (click)=\"setTopTab('reports')\">\n            <i class=\"pi pi-chart-bar\"></i>\n            <span>Reports</span>\n            <span class=\"ribbon-badge\">{{ reportsList.length }}</span>\n          </button>\n          <button type=\"button\"\n                  class=\"ribbon-tab-btn\"\n                  [class.active]=\"activeTopTab === 'settings'\"\n                  (click)=\"setTopTab('settings')\">\n            <i class=\"pi pi-cog\"></i>\n            <span>Settings</span>\n          </button>\n        </nav>\n      </div>\n\n      <!-- Menu Bar Right: Mode Switcher, Save / Sync DB, & Dark Mode Toggle -->\n      <div class=\"menu-bar-right\">\n        <!-- Mode Switcher: Only for database tables -->\n        <div *ngIf=\"!isCurrentSheetRough && !isCurrentSheetReport\" class=\"mode-pill-toggle\">\n          <button class=\"mode-pill-btn\" [class.active-normal]=\"mode === 'normal'\" (click)=\"setStudioMode('normal')\">\n            <i class=\"pi pi-pencil\"></i> Normal\n          </button>\n          <button class=\"mode-pill-btn\" [class.active-smart]=\"mode === 'intelligent'\" (click)=\"setStudioMode('intelligent')\">\n            <i class=\"pi pi-bolt\"></i> Smart\n          </button>\n        </div>\n\n        <!-- Shifted: Save / Sync DB shifted between Mode Switcher and Theme Toggle -->\n        <!-- Case A: Rough Sheet OR Report Sheet -> Save Locally -->\n        <button *ngIf=\"isCurrentSheetRough || isCurrentSheetReport\"\n                type=\"button\"\n                class=\"cmd-btn-save-top\"\n                (click)=\"saveRoughSheetLocally()\"\n                [title]=\"isCurrentSheetReport ? 'Save report locally (Ctrl+S)' : 'Save sheet locally (Ctrl+S)'\">\n          <i class=\"pi pi-save\"></i>\n          <span>Save</span>\n        </button>\n\n        <!-- Case B: Database Entry Table Sheet -> Sync to DB -->\n        <button *ngIf=\"!isCurrentSheetRough && !isCurrentSheetReport\"\n                type=\"button\"\n                class=\"cmd-btn-sync-top\"\n                [class.has-pending]=\"state.pendingChangesCount() > 0\"\n                [disabled]=\"state.pendingChangesCount() === 0 || state.hasErrors()\"\n                (click)=\"startImport()\"\n                title=\"Sync changes to Database (Ctrl+S)\">\n          <i class=\"pi pi-cloud-upload\"></i>\n          <span>Sync DB</span>\n          <span *ngIf=\"state.pendingChangesCount() > 0\" class=\"sync-badge-count\">{{ state.pendingChangesCount() }}</span>\n        </button>\n\n        <button class=\"cmd-btn\" style=\"padding: 3px 6px;\" (click)=\"toggleTheme()\" title=\"Toggle Light / Dark Mode\">\n          <i class=\"pi\" [ngClass]=\"isDarkMode ? 'pi-sun' : 'pi-moon'\"></i>\n        </button>\n\n        <!-- User & Role Pill Indicator with Quick Role Toggle -->\n        <div class=\"user-role-badge-pill\"\n             (click)=\"toggleRole()\"\n             [title]=\"'Active User: ' + (currentUser.display_name || currentUser.username) + ' (' + (isAdmin ? 'Admin Mode' : 'Author Mode') + ')\\nClick to toggle role'\">\n          <i class=\"pi\" [ngClass]=\"isAdmin ? 'pi-shield' : 'pi-user'\" [style.color]=\"isAdmin ? '#a855f7' : '#10b981'\"></i>\n          <span class=\"user-name-txt\">{{ currentUser.username }}</span>\n          <span class=\"role-pill-tag\" [class.admin-tag]=\"isAdmin\" [class.author-tag]=\"isAuthor\">\n            {{ isAdmin ? '\uD83D\uDC51 Admin' : '\uD83D\uDC64 Author' }}\n          </span>\n        </div>\n      </div>\n    </div>\n\n    <!-- Ribbon Content Strip (Few cm area, switches with tabs, horizontally scrollable) -->\n    <div class=\"ribbon-strip\">\n\n      <!-- RIBBON TAB 1: HOME TOOLS -->\n      <div *ngIf=\"activeTopTab === 'home'\" class=\"ribbon-content-row\">\n        <!-- Section: Style & Format -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\" [class.active]=\"isBoldActive\" (click)=\"toggleBold()\" title=\"Bold (Ctrl+B)\">\n              <span style=\"font-weight: 800; font-size: 13px;\">B</span>\n              <span class=\"ribbon-tool-lbl\">Bold</span>\n            </button>\n            <div class=\"ribbon-mini-col\">\n              <button class=\"ribbon-mini-btn\" [class.active-align]=\"textAlign === 'left'\" (click)=\"setTextAlign('left')\" title=\"Align Left\"><i class=\"pi pi-align-left\"></i></button>\n              <button class=\"ribbon-mini-btn\" [class.active-align]=\"textAlign === 'center'\" (click)=\"setTextAlign('center')\" title=\"Align Center\"><i class=\"pi pi-align-center\"></i></button>\n              <button class=\"ribbon-mini-btn\" [class.active-align]=\"textAlign === 'right'\" (click)=\"setTextAlign('right')\" title=\"Align Right\"><i class=\"pi pi-align-right\"></i></button>\n            </div>\n            <button class=\"ribbon-tool-btn\" (click)=\"colConfigOp.toggle($event)\" title=\"Choose Visible Columns\">\n              <i class=\"pi pi-sliders-h\" style=\"color: var(--primary);\"></i>\n              <span class=\"ribbon-tool-lbl\">Columns ({{ visibleHeadersCount }})</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">Format</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\"></div>\n\n        <!-- Section: Data Actions (Refresh, Open File, Export - Clear button removed) -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button *ngIf=\"!isCurrentSheetRough\" class=\"ribbon-tool-btn\" (click)=\"onRefreshData()\" title=\"Refresh data from database\">\n              <i class=\"pi pi-refresh text-success\"></i>\n              <span class=\"ribbon-tool-lbl\">Refresh</span>\n            </button>\n            <button class=\"ribbon-tool-btn\" (click)=\"openFileManager()\" title=\"Open Excel (.xlsx) file or saved sheets\">\n              <i class=\"pi pi-folder-open\"></i>\n              <span class=\"ribbon-tool-lbl\">Open File</span>\n            </button>\n            <input #fileInput type=\"file\" accept=\".xlsx, .xls, .csv\" style=\"display:none;\" (change)=\"onFileUpload($event)\">\n            <button class=\"ribbon-tool-btn\"\n                    [disabled]=\"isExportingExcel\"\n                    (click)=\"exportExcel()\"\n                    title=\"Export sheet to Excel\">\n              <i class=\"pi\" [ngClass]=\"isExportingExcel ? 'pi-spin pi-spinner text-primary' : 'pi-download'\"></i>\n              <span class=\"ribbon-tool-lbl\">{{ isExportingExcel ? 'Exporting...' : 'Export' }}</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">Data</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\"></div>\n\n        <!-- Section: Sort & Filter -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\" [class.active]=\"state.filtersEnabled()\" (click)=\"state.toggleFiltersEnabled()\" title=\"Toggle Filters\">\n              <i class=\"pi pi-filter\"></i>\n              <span class=\"ribbon-tool-lbl\">Filters</span>\n            </button>\n            <button class=\"ribbon-tool-btn\" [class.active]=\"state.sortingEnabled()\" (click)=\"state.toggleSortingEnabled()\" title=\"Toggle Sorting\">\n              <i class=\"pi pi-sort-alt\"></i>\n              <span class=\"ribbon-tool-lbl\">Sorting</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">Sort & Filter</span>\n        </div>\n      </div>\n\n      <!-- RIBBON TAB 2: TABLES (Horizontal Scrolling Strip with Small Simple Boxes) -->\n      <div *ngIf=\"activeTopTab === 'tables'\" class=\"ribbon-scroll-row\">\n        <!-- Quick search input inside tables strip -->\n        <div class=\"ribbon-search-field\" style=\"width: 140px; min-width: 140px; margin-right: 6px;\">\n          <i class=\"pi pi-search search-ico\"></i>\n          <input type=\"text\"\n                 class=\"ribbon-search-inp\"\n                 placeholder=\"Search tables...\"\n                 [(ngModel)]=\"tableSearchQuery\">\n          <button *ngIf=\"tableSearchQuery\" class=\"clear-btn-inline\" (click)=\"tableSearchQuery = ''\">\u2715</button>\n        </div>\n\n        <!-- Small simple boxes for each table -->\n        <div class=\"ribbon-boxes-track\">\n          <div *ngFor=\"let tbl of filteredTables\"\n               class=\"ribbon-small-box\"\n               [class.active-box]=\"isTableOpen(tbl.table)\"\n               (click)=\"openTableInSheet(tbl.table)\"\n               [title]=\"tbl.display_name ? (tbl.display_name + ' (' + tbl.table + ')') : tbl.table\">\n\n            <!-- Corner Star Favorite Button -->\n            <button type=\"button\"\n                    class=\"box-star-btn\"\n                    [class.starred]=\"favoriteTables.has(tbl.table)\"\n                    (click)=\"toggleFavoriteTable(tbl.table, $event)\"\n                    [title]=\"favoriteTables.has(tbl.table) ? 'Remove favorite' : 'Add to startup sheets'\">\n              <i class=\"pi\" [ngClass]=\"favoriteTables.has(tbl.table) ? 'pi-star-fill' : 'pi-star'\"></i>\n            </button>\n\n            <div class=\"box-icon-wrap\">\n              <i class=\"pi pi-table\"></i>\n            </div>\n            <div class=\"box-info\">\n              <span class=\"box-name-eng-main\">{{ tbl.display_name || tbl.table }}</span>\n            </div>\n            <span *ngIf=\"isTableOpen(tbl.table)\" class=\"box-dot\" title=\"Sheet open\"></span>\n          </div>\n        </div>\n      </div>\n\n      <!-- RIBBON TAB 3: REPORTS (Horizontal Scrolling Strip with Small Simple Boxes) -->\n      <div *ngIf=\"activeTopTab === 'reports'\" class=\"ribbon-scroll-row\">\n        <!-- Empty state when no dynamic reports or views exist -->\n        <div *ngIf=\"!reportsList || reportsList.length === 0\" class=\"ribbon-empty-state\">\n          <i class=\"pi pi-info-circle text-muted\"></i>\n          <span class=\"text-muted\">\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0947\u0902 \u0915\u094B\u0908 \u0930\u093F\u092A\u094B\u0930\u094D\u091F \u092F\u093E \u0935\u094D\u092F\u0942 \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948 (No dynamic reports or views in database)</span>\n        </div>\n\n        <!-- Quick search input inside reports strip -->\n        <div *ngIf=\"reportsList && reportsList.length > 0\" class=\"ribbon-search-field\" style=\"width: 140px; min-width: 140px; margin-right: 6px;\">\n          <i class=\"pi pi-search search-ico\"></i>\n          <input type=\"text\"\n                 class=\"ribbon-search-inp\"\n                 placeholder=\"Search reports...\"\n                 [(ngModel)]=\"reportSearchQuery\">\n          <button *ngIf=\"reportSearchQuery\" class=\"clear-btn-inline\" (click)=\"reportSearchQuery = ''\">\u2715</button>\n        </div>\n\n        <!-- Small simple boxes for each report -->\n        <div *ngIf=\"reportsList && reportsList.length > 0\" class=\"ribbon-boxes-track\">\n          <div *ngFor=\"let rep of filteredReports\"\n               class=\"ribbon-small-box report-box\"\n               [class.active-box]=\"isReportOpen(rep.id)\"\n               (click)=\"openReportInSheet(rep)\"\n               [title]=\"(rep.display_name || rep.title || rep.table || rep.id) + ' \u2014 ' + (rep.desc || '')\">\n\n            <!-- Corner Star Favorite Button -->\n            <button type=\"button\"\n                    class=\"box-star-btn\"\n                    [class.starred]=\"favoriteReports.has(rep.id)\"\n                    (click)=\"toggleFavoriteReport(rep.id, $event)\"\n                    [title]=\"favoriteReports.has(rep.id) ? 'Remove favorite' : 'Add to startup sheets'\">\n              <i class=\"pi\" [ngClass]=\"favoriteReports.has(rep.id) ? 'pi-star-fill' : 'pi-star'\"></i>\n            </button>\n\n            <div class=\"box-icon-wrap report-icon-bg\">\n              <i class=\"pi\" [ngClass]=\"rep.icon || 'pi-chart-bar'\"></i>\n            </div>\n            <div class=\"box-info\">\n              <span class=\"box-name-eng-main\">{{ rep.display_name || rep.title || rep.table || rep.id }}</span>\n            </div>\n            <span *ngIf=\"isReportOpen(rep.id)\" class=\"box-dot\" title=\"Sheet open\"></span>\n          </div>\n        </div>\n      </div>\n\n      <!-- RIBBON TAB 4: SETTINGS (Contextual to Active Open Sheet) -->\n      <div *ngIf=\"activeTopTab === 'settings'\" class=\"ribbon-content-row\">\n        <!-- Active Sheet Context Badge -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\" style=\"align-items: center; padding: 2px 6px;\">\n            <div class=\"active-sheet-badge-pill\" [title]=\"'Active Sheet: ' + currentActiveSheetTitle\">\n              <i class=\"pi\" [ngClass]=\"isCurrentSheetRough ? 'pi-file' : (isCurrentSheetReport ? 'pi-chart-bar' : 'pi-table')\"></i>\n              <span class=\"sheet-title-text\">{{ currentActiveSheetTitle }}</span>\n            </div>\n          </div>\n          <span class=\"ribbon-group-name\">ACTIVE SHEET</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\"></div>\n\n        <!-- Section: Table & Column Configuration -->\n        <div class=\"ribbon-group\" *ngIf=\"isCurrentSheetTable\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\"\n                    (click)=\"colConfigOp.toggle($event)\"\n                    title=\"Configure visible columns, display order, labels and formats\">\n              <i class=\"pi pi-sliders-h\" style=\"color: #6366f1;\"></i>\n              <span class=\"ribbon-tool-lbl\">Columns</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">DISPLAY</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\" *ngIf=\"isCurrentSheetTable\"></div>\n\n        <!-- Section: Triggers (UI & DB) -->\n        <div class=\"ribbon-group\" *ngIf=\"isCurrentSheetTable\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\"\n                    [disabled]=\"!isAdmin\"\n                    [class.btn-disabled-role]=\"!isAdmin\"\n                    (click)=\"isAdmin ? openUiSutrasModal() : null\"\n                    [title]=\"isAdmin ? 'UI Trigger: Reactive cell formulas & custom client logic' : 'UI Triggers require Admin role'\">\n              <i class=\"pi pi-desktop\" [style.color]=\"isAdmin ? '#06b6d4' : '#94a3b8'\"></i>\n              <span class=\"ribbon-tool-lbl\">UI {{ !isAdmin ? '\uD83D\uDD12' : '' }}</span>\n            </button>\n            <button class=\"ribbon-tool-btn\"\n                    [disabled]=\"!isAdmin\"\n                    [class.btn-disabled-role]=\"!isAdmin\"\n                    (click)=\"isAdmin ? openBackendSutrasModal() : null\"\n                    [title]=\"isAdmin ? 'DB Trigger: Server triggers, Raw SQL & database cascades' : 'DB Triggers require Admin role'\">\n              <i class=\"pi pi-database\" [style.color]=\"isAdmin ? '#f59e0b' : '#94a3b8'\"></i>\n              <span class=\"ribbon-tool-lbl\">DB {{ !isAdmin ? '\uD83D\uDD12' : '' }}</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">TRIGGERS</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\"></div>\n\n        <!-- Section: Boolean Display Style (Only Checkbox and Badge) -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\"\n                    [class.active]=\"booleanDisplayStyle === 'checkbox'\"\n                    (click)=\"setBooleanStyle('checkbox')\"\n                    title=\"Excel style clickable checkbox\">\n              <i class=\"pi pi-check-square\" style=\"color: #10b981;\"></i>\n              <span class=\"ribbon-tool-lbl\">Checkbox</span>\n            </button>\n            <button class=\"ribbon-tool-btn\"\n                    [class.active]=\"booleanDisplayStyle === 'badge'\"\n                    (click)=\"setBooleanStyle('badge')\"\n                    title=\"Status pill badge (Yes / No)\">\n              <i class=\"pi pi-tag\" style=\"color: #3b82f6;\"></i>\n              <span class=\"ribbon-tool-lbl\">Badge</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">BOOLEAN</span>\n        </div>\n\n        <div class=\"ribbon-v-sep\"></div>\n\n        <!-- Section: Users & Access Management -->\n        <div class=\"ribbon-group\">\n          <div class=\"ribbon-group-items\">\n            <button class=\"ribbon-tool-btn\"\n                    (click)=\"openUserManagementModal()\"\n                    title=\"User Management: Manage users, roles (Admin / Author) and rights\">\n              <i class=\"pi pi-users\" style=\"color: #ec4899;\"></i>\n              <span class=\"ribbon-tool-lbl\">Users</span>\n            </button>\n            <button class=\"ribbon-tool-btn\"\n                    (click)=\"toggleRole()\"\n                    [title]=\"'Current Role: ' + currentUser.role + ' (Click to toggle role)'\">\n              <i class=\"pi\" [ngClass]=\"isAdmin ? 'pi-shield' : 'pi-user'\" [style.color]=\"isAdmin ? '#a855f7' : '#10b981'\"></i>\n              <span class=\"ribbon-tool-lbl\">{{ isAdmin ? 'Admin' : 'Author' }}</span>\n            </button>\n          </div>\n          <span class=\"ribbon-group-name\">USERS & ACCESS</span>\n        </div>\n      </div>\n\n    </div>\n  </header>\n\n  <!-- 2. FORMULA BAR ROW (ALWAYS VISIBLE) -->\n  <div class=\"formula-bar-row\">\n    <div class=\"coord-box\">{{ activeCoord }}</div>\n    <span class=\"active-col-chip\">{{ activeColChip }}</span>\n\n    <span style=\"font-weight: 700; font-style: italic; color: var(--text-muted); margin: 0 4px;\">fx</span>\n    <input type=\"text\"\n           class=\"formula-input\"\n           [ngModel]=\"formulaValue\"\n           (ngModelChange)=\"onFormulaChange($event)\"\n           placeholder=\"Select a cell or type value here...\">\n\n    <!-- Direct DB Search & Record Counter (Shifted to Right Area of Formula Bar) -->\n    <div class=\"formula-bar-right-area\">\n      <div class=\"formula-search-field\">\n        <i class=\"pi pi-search search-ico\"></i>\n        <input type=\"text\"\n               class=\"formula-search-inp\"\n               placeholder=\"Direct DB Search...\"\n               [ngModel]=\"state.dbSearchQuery()\"\n               (ngModelChange)=\"onDbSearchInput($event)\">\n        <button *ngIf=\"state.dbSearchQuery()\" class=\"clear-btn-inline\" (click)=\"clearDbSearch()\" title=\"Clear search\">\u2715</button>\n        <span *ngIf=\"state.isLoadingDb()\" class=\"spin-inline\"><i class=\"pi pi-spin pi-spinner\"></i></span>\n      </div>\n      <div *ngIf=\"!isCurrentSheetRough\" class=\"formula-record-pill\" title=\"Total database records\">\n        <i class=\"pi pi-database\"></i>\n        <span>{{ state.rows().length }} / {{ state.totalDbRecords() }}</span>\n      </div>\n    </div>\n  </div>\n\n  <!-- Column Config Popover (Replicating Legacy Studio) -->\n  <!-- Column Config Popover (Unified 2-Section Double-Width Panel) -->\n  <p-overlayPanel #colConfigOp [dismissable]=\"true\" styleClass=\"sutram-col-config-popover shadow-lg\">\n    <ng-template pTemplate=\"content\">\n      <div class=\"col-dd-split-container\">\n        \n        <!-- \u2500\u2500 LEFT PANE: COLUMN VISIBILITY & GROUPS \u2500\u2500 -->\n        <div class=\"col-dd-left-pane\">\n          <!-- Header: Search Bar & Actions -->\n          <div class=\"col-dd-header\">\n            <div class=\"col-dd-search-wrap\">\n              <i class=\"pi pi-search col-dd-search-icon\"></i>\n              <input type=\"text\"\n                     class=\"col-dd-search-input\"\n                     placeholder=\"Search columns / FK / fx...\"\n                     [(ngModel)]=\"colSearchQuery\" />\n              <button *ngIf=\"colSearchQuery\"\n                      type=\"button\"\n                      class=\"btn-clear-search-inline\"\n                      (click)=\"colSearchQuery = ''\">\n                <i class=\"pi pi-times\"></i>\n              </button>\n            </div>\n\n            <div class=\"col-dd-actions\">\n              <div class=\"col-dd-actions-left\">\n                <button type=\"button\" class=\"col-dd-act-btn\" (click)=\"selectAllColumns(true)\">All</button>\n                <button type=\"button\" class=\"col-dd-act-btn\" (click)=\"selectAllColumns(false)\">None</button>\n                <button type=\"button\" class=\"col-dd-act-btn\" (click)=\"resetDefaultColumns()\">Reset</button>\n              </div>\n              <span class=\"col-dd-count\">{{ selectedColumnKeys.size }} of {{ allConfigColumns.length }} visible</span>\n            </div>\n          </div>\n\n          <!-- Body: Standard Columns, Computed UI Formulas, FK Groups -->\n          <div class=\"col-dd-body\">\n            \n            <!-- 1. Standard Direct Columns -->\n            <ng-container *ngIf=\"filteredDirectCols.length > 0\">\n              <div class=\"col-dd-section-title\">\n                <i class=\"pi pi-list\" style=\"font-size: 10px; margin-right: 4px;\"></i> Standard Columns\n              </div>\n              <div *ngFor=\"let col of filteredDirectCols; trackBy: trackByColKey\"\n                   class=\"col-dd-item\"\n                   (click)=\"toggleColumnCheckbox(col.key)\">\n                <div class=\"col-dd-item-left\">\n                  <input type=\"checkbox\"\n                         class=\"custom-check\"\n                         [checked]=\"isColumnSelected(col.key)\"\n                         style=\"pointer-events: none;\" />\n                  <span class=\"col-dd-item-name\" [title]=\"col.name\">\n                    {{ col.name }}<span *ngIf=\"col.not_null\" style=\"color: #ef4444; margin-left: 2px;\">*</span>\n                  </span>\n                </div>\n                <span class=\"type-badge\">{{ col.type || 'string' }}</span>\n              </div>\n            </ng-container>\n\n            <!-- 2. UI Formulas & Computed Temp Columns (fx) -->\n            <ng-container *ngIf=\"filteredComputedCols.length > 0\">\n              <div class=\"col-dd-section-title fx-section-title\">\n                <i class=\"pi pi-bolt\" style=\"color: #8b5cf6; font-size: 10px; margin-right: 4px;\"></i> UI Formulas & Temp (fx)\n              </div>\n              <div *ngFor=\"let col of filteredComputedCols; trackBy: trackByColKey\"\n                   class=\"col-dd-item fx-item\"\n                   (click)=\"toggleColumnCheckbox(col.key)\">\n                <div class=\"col-dd-item-left\">\n                  <input type=\"checkbox\"\n                         class=\"custom-check\"\n                         [checked]=\"isColumnSelected(col.key)\"\n                         style=\"pointer-events: none;\" />\n                  <span class=\"badge-fx-mini\">fx</span>\n                  <span class=\"col-dd-item-name\" [title]=\"col.short_name || col.name\">\n                    <strong>{{ col.short_name || col.name }}</strong>\n                    <span *ngIf=\"col.short_name && col.short_name !== col.key\" style=\"font-size: 10px; color: var(--text-muted); margin-left: 4px;\">({{ col.key }})</span>\n                  </span>\n                </div>\n                <span class=\"type-badge badge-fx-type\">formula</span>\n              </div>\n            </ng-container>\n\n            <!-- 3. Foreign Key Reference Groups -->\n            <ng-container *ngIf=\"filteredFkGroups.length > 0\">\n              <div class=\"col-dd-section-title\" style=\"margin-top: 8px;\">\n                <i class=\"pi pi-link\" style=\"color: var(--primary, #4f46e5); font-size: 10px; margin-right: 4px;\"></i> FK Reference Groups\n              </div>\n              <div *ngFor=\"let grp of filteredFkGroups; trackBy: trackByGroupName\"\n                   class=\"col-dd-group\"\n                   [class.fk-active-group]=\"grp.selectedCount > 0\">\n                <!-- Group Accordion Header -->\n                <div class=\"col-dd-group-header\">\n                  <div class=\"col-dd-group-left\"\n                       (click)=\"toggleFkGroupExpand(grp.name)\"\n                       style=\"cursor: pointer; flex-grow: 1;\">\n                    <i class=\"pi pi-chevron-right fk-expand-toggle\"\n                       [class.rotated]=\"isFkGroupExpanded(grp.name)\"></i>\n                    <span class=\"col-dd-item-name\">\n                      <strong style=\"text-transform: capitalize;\">{{ grp.name }}</strong>\n                      <span style=\"font-size: 10px; color: var(--text-muted); font-weight: 400; margin-left: 3px;\">({{ grp.refTable }})</span>\n                    </span>\n                  </div>\n                  <div class=\"col-dd-group-right\"\n                       (click)=\"toggleFkGroupAll(grp.name)\"\n                       style=\"cursor: pointer; display: flex; align-items: center; gap: 6px;\">\n                    <input type=\"checkbox\"\n                           class=\"custom-check\"\n                           [checked]=\"grp.isAllChecked\"\n                           style=\"pointer-events: none;\" />\n                    <span class=\"fk-group-pill\"\n                          [style.background]=\"grp.selectedCount > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(125, 125, 125, 0.1)'\"\n                          [style.color]=\"grp.selectedCount > 0 ? '#059669' : 'var(--text-muted)'\">\n                      {{ grp.selectedCount }}/{{ grp.totalCount }}\n                    </span>\n                  </div>\n                </div>\n\n                <!-- Group Sub-items (when expanded) -->\n                <div *ngIf=\"isFkGroupExpanded(grp.name)\" class=\"col-dd-group-items\">\n                  <div *ngFor=\"let col of grp.columns; trackBy: trackByColKey\"\n                       class=\"col-dd-item\"\n                       (click)=\"toggleColumnCheckbox(col.key)\">\n                    <div class=\"col-dd-item-left\">\n                      <input type=\"checkbox\"\n                             class=\"custom-check\"\n                             [checked]=\"isColumnSelected(col.key)\"\n                             style=\"pointer-events: none;\" />\n                      <span class=\"col-dd-item-name\"\n                            [style.font-weight]=\"col.is_fk_main ? '600' : 'normal'\"\n                            [title]=\"col.name\">\n                        {{ col.short_name || col.name }}\n                      </span>\n                    </div>\n                    <span class=\"type-badge\">{{ col.is_fk_main ? 'display' : (col.is_fk_raw ? 'id' : (col.type || 'string')) }}</span>\n                  </div>\n                </div>\n              </div>\n            </ng-container>\n\n            <!-- Empty State -->\n            <div *ngIf=\"filteredDirectCols.length === 0 && filteredComputedCols.length === 0 && filteredFkGroups.length === 0\" class=\"col-dd-empty\">\n              <i class=\"pi pi-search me-1\"></i> No matching columns found\n            </div>\n          </div>\n        </div>\n\n        <!-- \u2500\u2500 RIGHT PANE: SELECTED COLUMNS ORDER & FORMATTING \u2500\u2500 -->\n        <div class=\"col-dd-right-pane\">\n          <!-- Right Header -->\n          <div class=\"col-dd-right-header\">\n            <div class=\"col-dd-right-title-wrap\">\n              <span class=\"col-dd-right-title\">\n                <i class=\"pi pi-sliders-v text-primary me-1\"></i> Selected Columns (\u0915\u094D\u0930\u092E \u090F\u0935\u0902 \u092A\u094D\u0930\u093E\u0930\u0942\u092A)\n              </span>\n              <span class=\"col-dd-right-badge\">{{ selectedOrderedColumns.length }} Visible</span>\n            </div>\n            <div class=\"col-dd-right-sub\">\n              Use <strong style=\"color: var(--primary, #4f46e5);\">\u25B2 / \u25BC</strong> to reorder, edit labels, or select formats\n            </div>\n          </div>\n\n          <!-- Right Body: Scrollable Cards -->\n          <div class=\"col-dd-right-body\">\n            <div *ngIf=\"selectedOrderedColumns.length === 0\" class=\"col-dd-empty\">\n              <i class=\"pi pi-info-circle me-1\"></i> No columns currently visible. Select columns on the left.\n            </div>\n\n            <div *ngFor=\"let col of selectedOrderedColumns; let i = index; trackBy: trackByColKey\"\n                 class=\"col-selected-card\">\n              \n              <!-- 1. Left: Order Index & Move Up / Down -->\n              <div class=\"col-card-order-controls\">\n                <span class=\"col-card-letter-badge\" [title]=\"'Column ' + getColLetter(i)\">\n                  {{ getColLetter(i) }}\n                </span>\n                <div class=\"col-card-arrows\">\n                  <button type=\"button\"\n                          class=\"btn-arrow\"\n                          [disabled]=\"i === 0\"\n                          (click)=\"moveSelectedColUp(col.key)\"\n                          title=\"Move Left / Earlier\">\n                    <i class=\"pi pi-chevron-up\"></i>\n                  </button>\n                  <button type=\"button\"\n                          class=\"btn-arrow\"\n                          [disabled]=\"i === selectedOrderedColumns.length - 1\"\n                          (click)=\"moveSelectedColDown(col.key)\"\n                          title=\"Move Right / Later\">\n                    <i class=\"pi pi-chevron-down\"></i>\n                  </button>\n                </div>\n              </div>\n\n              <!-- 2. Middle: Column Identity & Editable Label -->\n              <div class=\"col-card-meta\">\n                <div class=\"col-card-meta-top\">\n                  <span class=\"col-card-key-txt\" [title]=\"col.key\">{{ col.col_name || col.key }}</span>\n                  <span *ngIf=\"col.is_temp\" class=\"badge-fx-mini\" title=\"Computed Temp Column\">\u26A1 fx</span>\n                  <span *ngIf=\"col.is_fk_main\" class=\"badge-fk-pill\" [title]=\"'FK Display: ' + col.ref_table\">\uD83D\uDD17 {{ col.ref_table }}</span>\n                  <span *ngIf=\"col.is_fk_subcol\" class=\"badge-sub-pill\" [title]=\"'FK Subcol: ' + col.ref_table\">\u21B3 {{ col.sub_col_name }}</span>\n                  <span *ngIf=\"col.is_fk_raw\" class=\"badge-raw-pill\" title=\"Raw foreign key ID\"># id</span>\n                  <span *ngIf=\"!col.is_temp && !col.is_fk_main && !col.is_fk_subcol && !col.is_fk_raw\" class=\"badge-std-pill\">{{ col.type || 'text' }}</span>\n                </div>\n                <div class=\"col-card-label-wrap\">\n                  <input type=\"text\"\n                         class=\"col-card-label-inp\"\n                         [(ngModel)]=\"col.label\"\n                         (ngModelChange)=\"onColumnLabelChange(col)\"\n                         [placeholder]=\"col.short_name || col.name || col.key\"\n                         title=\"Edit header label\" />\n                </div>\n              </div>\n\n              <!-- 3. Right: Formatting Controls & Hide Button -->\n              <div class=\"col-card-format-ctrls\">\n                <!-- Date Format Select -->\n                <div *ngIf=\"isDateCol(col)\" class=\"col-card-select-wrap\">\n                  <select class=\"col-card-select\"\n                          [(ngModel)]=\"col.display_format\"\n                          (ngModelChange)=\"onColumnFormatChange(col)\"\n                          title=\"Choose date display format\">\n                    <option [ngValue]=\"null\">Default Date</option>\n                    <option *ngFor=\"let opt of dateFormatOptions\" [value]=\"opt.value\">{{ opt.label }}</option>\n                  </select>\n                </div>\n\n                <!-- Number Format Select -->\n                <div *ngIf=\"isNumberCol(col)\" class=\"col-card-select-wrap\">\n                  <select class=\"col-card-select\"\n                          [(ngModel)]=\"col.display_format\"\n                          (ngModelChange)=\"onColumnFormatChange(col)\"\n                          title=\"Choose number decimal format\">\n                    <option [ngValue]=\"null\">Raw Number</option>\n                    <option *ngFor=\"let opt of numberDecimalOptions\" [value]=\"opt.value\">{{ opt.label }}</option>\n                  </select>\n                </div>\n\n                <!-- Static Indicator for Text / Fx -->\n                <div *ngIf=\"!isDateCol(col) && !isNumberCol(col)\" class=\"col-card-plain-type\">\n                  <span *ngIf=\"col.is_temp\" class=\"text-purple-xs\">Formula (fx)</span>\n                  <span *ngIf=\"!col.is_temp\" class=\"text-muted-xs\">{{ col.type || 'Text' }}</span>\n                </div>\n\n                <!-- Hide / Remove Column Button -->\n                <button type=\"button\"\n                        class=\"btn-col-hide\"\n                        (click)=\"toggleColumnCheckbox(col.key)\"\n                        title=\"Hide this column from sheet\">\n                  <i class=\"pi pi-times\"></i>\n                </button>\n              </div>\n\n            </div>\n          </div>\n        </div>\n\n      </div>\n\n      <!-- Footer: Auto-save status hint + Done button -->\n      <div class=\"col-dd-footer\">\n        <span class=\"small text-muted\" style=\"font-size: 10.5px;\">\n          <i class=\"pi pi-check-circle text-success me-1\"></i> Live updates active & saved to table\n        </span>\n        <button type=\"button\"\n                class=\"btn btn-sm btn-primary py-1 px-3\"\n                style=\"font-size: 11.5px; font-weight: 600;\"\n                (click)=\"colConfigOp.hide()\">\n          Done\n        </button>\n      </div>\n    </ng-template>\n  </p-overlayPanel>\n\n  <!-- 3. STATUS & BATCH FIX SUGGESTION STRIP (ALWAYS VISIBLE) -->\n  <div class=\"status-strip\" [ngClass]=\"statusStripClass\">\n    <div style=\"display: flex; align-items: center; gap: 6px;\">\n      <i class=\"pi\" [ngClass]=\"statusStripIcon\"></i>\n      <span>{{ statusStripMessage }}</span>\n    </div>\n    <div *ngIf=\"!isCurrentSheetReport && state.unresolvedCorrectionsCount() > 0\">\n      <button class=\"cmd-btn cmd-btn-warning\" style=\"padding: 2px 8px;\" (click)=\"showSidebar = true\">\n        <i class=\"pi pi-bolt\"></i> \u0917\u0932\u0924\u093F\u092F\u093E\u0901 ({{ state.unresolvedCorrectionsCount() }})\n      </button>\n    </div>\n  </div>\n\n  <!-- 4. SPREADSHEET CANVAS (ALWAYS VISIBLE! 100% REMAINING HEIGHT) -->\n  <main class=\"spreadsheet-canvas flex-grow-1\" [style.zoom]=\"zoomLevel\">\n    <sutram-grid #grid\n                 [headers]=\"visibleHeaders\"\n                 [rows]=\"state.rows()\"\n                 [filterOnlyErrors]=\"state.filterOnlyErrors()\"\n                 [enableDelete]=\"enableDelete\"\n                 [isBold]=\"isBoldActive\"\n                 [textAlign]=\"textAlign\"\n                 [booleanStyle]=\"booleanDisplayStyle\"\n                 (loadMore)=\"onLoadMore()\"\n                 (filterChanged)=\"onGridFilterChanged()\"\n                 (sortChanged)=\"onGridSortChanged()\"\n                 (cellChanged)=\"onGridCellChanged($event)\"\n                 (solveAllTriggered)=\"onGridSolveAll($event)\"\n                 (openConfig)=\"colConfigOp.toggle($event)\">\n    </sutram-grid>\n  </main>\n\n  <!-- 5. BOTTOM MULTI-SHEET TAB BAR & STATUS BAR -->\n  <footer class=\"studio-footer\">\n    <!-- Sub-row A: Sheet Tabs Strip -->\n    <div class=\"sheet-tabs-bar\">\n      <div *ngFor=\"let tab of sheetTabs\"\n           class=\"tab-pill\"\n           [class.active-tab]=\"activeSheetId === tab.id\"\n           (click)=\"switchSheet(tab.id)\"\n           (dblclick)=\"startRenameTab(tab, $event)\"\n           (contextmenu)=\"openTabContextMenu($event, tab)\">\n        <i class=\"pi\" [ngClass]=\"tab.icon\" style=\"font-size: 11px;\"></i>\n\n        <!-- Regular Sheet Tab Title -->\n        <span *ngIf=\"renamingTabId !== tab.id\"\n              class=\"tab-title-text\"\n              title=\"\u0921\u092C\u0932-\u0915\u094D\u0932\u093F\u0915 \u092F\u093E \u0930\u093E\u0907\u091F-\u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0915\u0947 \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Double-click or right-click to rename)\">\n          {{ tab.title }}\n        </span>\n\n        <!-- Inline Sheet Rename Input -->\n        <input *ngIf=\"renamingTabId === tab.id\"\n               [id]=\"'tab-rename-input-' + tab.id\"\n               type=\"text\"\n               class=\"tab-inline-rename-input\"\n               [(ngModel)]=\"renamingTabTitle\"\n               (keyup.enter)=\"saveTabRename(tab)\"\n               (keyup.escape)=\"cancelTabRename()\"\n               (blur)=\"saveTabRename(tab)\"\n               (click)=\"$event.stopPropagation()\">\n\n        <!-- Record Count Badge -->\n        <span *ngIf=\"tab.isLoaded && (tab.recordCount || 0) > 0\" class=\"sheet-tab-badge\">\n          {{ tab.recordCount }}\n        </span>\n\n        <!-- Inline Rename Button for Rough Sheets -->\n        <button *ngIf=\"renamingTabId !== tab.id && (tab.type === 'rough' || tab.id.startsWith('rough_') || tab.id.startsWith('sheet_'))\"\n                type=\"button\"\n                class=\"tab-edit-btn\"\n                (click)=\"startRenameTab(tab, $event)\"\n                title=\"\u0936\u0940\u091F \u0915\u093E \u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Rename sheet)\">\n          <i class=\"pi pi-pencil\" style=\"font-size: 8.5px;\"></i>\n        </button>\n\n        <!-- Close Sheet Button -->\n        <button *ngIf=\"sheetTabs.length > 1\"\n                type=\"button\"\n                class=\"tab-close-btn\"\n                (click)=\"closeSheet(tab.id, $event)\"\n                title=\"Close sheet\">\u2715</button>\n      </div>\n\n      <button class=\"add-tab-btn\" (click)=\"addNewBlankSheet()\" title=\"Add Blank Sheet\">\n        <i class=\"pi pi-plus\" style=\"font-size: 10px;\"></i>\n      </button>\n    </div>\n\n    <!-- Tab Context Menu (Right Click on Sheet Tab) -->\n    <div *ngIf=\"tabContextMenu.visible\"\n         class=\"tab-context-menu\"\n         [style.left.px]=\"tabContextMenu.x\"\n         [style.top.px]=\"tabContextMenu.y\"\n         (click)=\"$event.stopPropagation()\">\n      <div class=\"tab-context-menu-item\"\n           (click)=\"startRenameTab(tabContextMenu.tab!, $event)\">\n        <i class=\"pi pi-pencil text-primary\"></i>\n        <span>\u0928\u093E\u092E \u092C\u0926\u0932\u0947\u0902 (Rename Sheet)</span>\n      </div>\n      <div *ngIf=\"tabContextMenu.tab\"\n           class=\"tab-context-menu-item text-danger\"\n           (click)=\"deleteSheet(tabContextMenu.tab, $event)\">\n        <i class=\"pi pi-trash\"></i>\n        <span>\u0936\u0940\u091F \u0939\u091F\u093E\u090F\u0902 / \u0921\u093F\u0932\u0940\u091F \u0915\u0930\u0947\u0902 (Delete Sheet)</span>\n      </div>\n    </div>\n\n    <!-- Sub-row B: Status Bar with Scale / Zoom Controls -->\n    <div class=\"bottom-status-subrow\">\n      <div style=\"display: flex; align-items: center; gap: 10px;\">\n        <span>Sheet: {{ activeSheetId }}</span>\n        <span>Rows: {{ state.rows().length }}{{ state.totalDbRecords() > state.rows().length ? ' / ' + state.totalDbRecords() : '' }}</span>\n        <span *ngIf=\"state.isLoadingDb()\" class=\"text-primary small fw-semibold\">\n          <i class=\"pi pi-spin pi-spinner me-1\"></i>Loading more...\n        </span>\n        <span *ngIf=\"state.deletedRowIds().length > 0\" class=\"badge bg-soft-warning text-warning small fw-semibold\">\n          <i class=\"pi pi-trash me-1\"></i>{{ state.deletedRowIds().length }} Deleted\n        </span>\n        <span *ngIf=\"state.stats().errorRows === 0\" style=\"color: #10b981; font-weight: 600;\">\u2713 100% In Sync</span>\n        <span *ngIf=\"state.stats().errorRows > 0\" style=\"color: #ef4444; font-weight: 600;\">{{ state.stats().errorRows }} \u0924\u094D\u0930\u0941\u091F\u093F\u092F\u093E\u0901</span>\n\n        <!-- Last Sync Status of the active sheet -->\n        <span *ngIf=\"lastSyncPerSheet[activeSheetId]\"\n              class=\"last-sync-badge\"\n              [class.sync-error]=\"lastSyncPerSheet[activeSheetId].hasError\">\n          <i class=\"pi pi-history me-1\"></i>\u0905\u0902\u0924\u093F\u092E \u0938\u093F\u0902\u0915 ({{ lastSyncPerSheet[activeSheetId].time }}): {{ lastSyncPerSheet[activeSheetId].summary }}\n        </span>\n      </div>\n\n      <div style=\"display: flex; align-items: center; gap: 10px;\">\n        <span style=\"font-size: 10.5px; opacity: 0.8;\">Ctrl+S to Sync | Enter next row | Tab next col | Click # to select row</span>\n\n        <!-- Scale / Zoom Controls -->\n        <div class=\"zoom-controls\">\n          <button class=\"zoom-btn\" (click)=\"zoomOut()\" title=\"Zoom Out (-10%)\"><i class=\"pi pi-minus\"></i></button>\n          <span class=\"zoom-display\" (click)=\"resetZoom()\" title=\"Reset to 100%\">{{ (zoomLevel * 100).toFixed(0) }}%</span>\n          <button class=\"zoom-btn\" (click)=\"zoomIn()\" title=\"Zoom In (+10%)\"><i class=\"pi pi-plus\"></i></button>\n        </div>\n      </div>\n    </div>\n  </footer>\n\n  <!-- 6. Floating Sync Toast HUD (Live Progress & Completion) -->\n  <div *ngIf=\"syncToast.visible\" class=\"sync-toast-hud shadow-lg\">\n    <div class=\"sync-toast-header\">\n      <div class=\"sync-toast-title\">\n        <i class=\"pi\"\n           [ngClass]=\"syncToast.inProgress ? 'pi-spin pi-sync text-primary' : (syncToast.hasError ? 'pi-exclamation-circle text-warning' : 'pi-check-circle text-success')\"></i>\n        <span>{{ syncToast.title }}</span>\n      </div>\n      <button class=\"sync-toast-close\" (click)=\"dismissSyncToast()\">\u2715</button>\n    </div>\n\n    <!-- Live Progress Bar when Sync is running -->\n    <div *ngIf=\"syncToast.inProgress\" class=\"sync-progress-wrap px-3 pt-2\">\n      <div class=\"d-flex justify-content-between align-items-center mb-1\" style=\"font-size: 11px; color: var(--text-muted, #64748b);\">\n        <span>{{ syncToast.percentage }}% \u092A\u0942\u0930\u094D\u0923</span>\n        <span>{{ state.importProgress().current }} / {{ state.importProgress().total }}</span>\n      </div>\n      <div class=\"sync-progress-track\">\n        <div class=\"sync-progress-bar\" [style.width.%]=\"syncToast.percentage\"></div>\n      </div>\n    </div>\n\n    <div class=\"sync-toast-body\">\n      <div class=\"sync-toast-stats\">\n        <span *ngIf=\"syncToast.inserted > 0\" class=\"sync-badge-chip chip-success\">\n          <i class=\"pi pi-plus\"></i> {{ syncToast.inserted }} Inserted\n        </span>\n        <span *ngIf=\"syncToast.updated > 0\" class=\"sync-badge-chip chip-info\">\n          <i class=\"pi pi-refresh\"></i> {{ syncToast.updated }} Updated\n        </span>\n        <span *ngIf=\"syncToast.deleted > 0\" class=\"sync-badge-chip chip-warning\">\n          <i class=\"pi pi-trash\"></i> {{ syncToast.deleted }} Deleted\n        </span>\n        <span *ngIf=\"syncToast.failed > 0\" class=\"sync-badge-chip chip-danger\">\n          <i class=\"pi pi-times\"></i> {{ syncToast.failed }} Failed\n        </span>\n      </div>\n      <div *ngIf=\"syncToast.errors.length > 0\" class=\"sync-toast-errors\">\n        <div *ngFor=\"let err of syncToast.errors\">\u2022 {{ err }}</div>\n      </div>\n    </div>\n  </div>\n\n  <!-- Smart Header Scanner & Dual-Mode Open File Modal -->\n  <sutram-header-scanner [(visible)]=\"showScannerModal\"\n                         [fileName]=\"uploadedFileName\"\n                         [sheetNames]=\"uploadedSheetNames\"\n                         [currentSheetName]=\"selectedUploadedSheet\"\n                         [sheetHeaders]=\"uploadedSheetHeaders\"\n                         [sampleRows]=\"uploadedSampleRows\"\n                         [totalRows]=\"uploadedTotalRows\"\n                         [tablesList]=\"tablesList\"\n                         [selectedTable]=\"scannerTargetTable\"\n                         [report]=\"scanReport\"\n                         [availableHeaders]=\"scannerAvailableHeaders\"\n                         [isTableConfigLoading]=\"isScannerConfigLoading\"\n                         [savedSheets]=\"savedSheetsList\"\n                         (sheetChange)=\"onUploadedSheetChange($event)\"\n                         (targetTableChange)=\"onScannerTargetTableChange($event)\"\n                         (openDirectNormal)=\"onDirectOpenAsNormalSheet($event)\"\n                         (openMappedToTable)=\"onScannerConfirmedMapped($event)\"\n                         (openSavedSheet)=\"onOpenSavedSheet($event)\"\n                         (deleteSavedSheet)=\"onDeleteSavedSheet($event)\"\n                         (triggerFileInput)=\"triggerBrowseFile()\">\n  </sutram-header-scanner>\n\n  <!-- Batch Correction Sidebar -->\n  <sutram-correction-sidebar [(visible)]=\"showSidebar\"\n                             [groups]=\"state.correctionGroups()\">\n  </sutram-correction-sidebar>\n\n\n  <!-- \u2500\u2500 2. UI Sutras (Client-side Reactive Formulas) Dialog \u2500\u2500\u2500\u2500\u2500 -->\n  <p-dialog [(visible)]=\"showUiSutrasModal\"\n            [modal]=\"true\"\n            [dismissableMask]=\"true\"\n            [draggable]=\"false\"\n            [resizable]=\"false\"\n            [style]=\"{ width: '94vw', maxWidth: '980px' }\"\n            styleClass=\"sutram-studio-dialog\"\n            header=\"\uD83E\uDDEE UI \u0938\u0942\u0924\u094D\u0930 \u0935\u093F\u0928\u094D\u092F\u093E\u0938 (Live Reactive Formulas): {{ currentActiveSheetTitle }}\">\n    <div class=\"dialog-body-wrap\">\n      <div class=\"dialog-info-banner info\">\n        <i class=\"pi pi-info-circle banner-icon\"></i>\n        <span>\u091C\u092C \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0917\u094D\u0930\u093F\u0921 \u092E\u0947\u0902 \u0921\u0947\u091F\u093E \u091F\u093E\u0907\u092A \u0915\u0930\u0924\u093E \u0939\u0948, \u0924\u092C \u092F\u0939 \u0938\u0942\u0924\u094D\u0930 \u0924\u0924\u094D\u0915\u093E\u0932 \u0917\u0923\u0928\u093E \u0915\u0930\u0915\u0947 \u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u0915\u0949\u0932\u092E \u0915\u094B \u0938\u094D\u0935\u0924\u0903 \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964</span>\n      </div>\n\n      <div *ngIf=\"!isAdmin\" class=\"dialog-info-banner warning mb-2\">\n        <i class=\"pi pi-lock banner-icon\"></i>\n        <span><strong>Author Mode (View Only):</strong> \u0915\u0947\u0935\u0932 Admin \u0915\u094B UI \u0938\u0942\u0924\u094D\u0930 \u091C\u094B\u0921\u093C\u0928\u0947, \u092C\u0926\u0932\u0928\u0947 \u092F\u093E \u0939\u091F\u093E\u0928\u0947 \u0915\u093E \u0905\u0927\u093F\u0915\u093E\u0930 \u0939\u0948\u0964 (Only Admin can create/edit/delete triggers)</span>\n      </div>\n\n      <!-- Add New Formula Card -->\n      <div class=\"dialog-subcard\" *ngIf=\"isAdmin\">\n        <div class=\"subcard-title mb-2\">Add UI Reactive Trigger (\u0928\u092F\u093E UI \u0938\u0942\u0924\u094D\u0930 \u091C\u094B\u0921\u093C\u0947\u0902)</div>\n\n        <div class=\"subcard-grid d-flex align-items-end gap-2\">\n          <!-- Target Column Dropdown (1st option is Temp Column) -->\n          <div [style.flex]=\"newUiSutra.is_temp ? '0 0 260px' : '0 0 300px'\">\n            <label class=\"dialog-label\">Target Column (\u0932\u0915\u094D\u0937\u094D\u092F \u0915\u0949\u0932\u092E):</label>\n            <p-dropdown [options]=\"targetColDropdownOptions\"\n                        [(ngModel)]=\"selectedTargetColValue\"\n                        (onChange)=\"onTargetColChange($event)\"\n                        (ngModelChange)=\"onTargetColChange($event)\"\n                        optionLabel=\"label\"\n                        optionValue=\"value\"\n                        placeholder=\"-- Select Target Column --\"\n                        styleClass=\"dialog-ctrl-dropdown\"\n                        [appendTo]=\"'body'\">\n            </p-dropdown>\n          </div>\n\n          <!-- When Temp Column is selected: Display Name input shows up immediately! -->\n          <div *ngIf=\"newUiSutra.is_temp\" style=\"flex: 0 0 220px;\">\n            <label class=\"dialog-label text-primary\">Display Name (\u0915\u0949\u0932\u092E \u0936\u0940\u0930\u094D\u0937\u0915):</label>\n            <input type=\"text\"\n                   pInputText\n                   class=\"dialog-ctrl-input font-bold\"\n                   [(ngModel)]=\"newUiSutra.display_name\"\n                   placeholder=\"e.g. Age, Full Name, Days Left\" />\n          </div>\n\n          <!-- Formula / Expression / Code input -->\n          <div style=\"flex: 1 1 auto; min-width: 220px;\">\n            <label class=\"dialog-label\">Formula / Expression / Code (e.g. [colB], [qty] * [rate], AGE([dob])):</label>\n            <input type=\"text\"\n                   pInputText\n                   class=\"dialog-ctrl-input font-mono\"\n                   [(ngModel)]=\"newUiSutra.formula\"\n                   placeholder=\"e.g. [colB] or [qty] * [rate] or AGE([dob])\" />\n          </div>\n\n          <!-- Add Button -->\n          <div style=\"flex: 0 0 75px;\">\n            <button pButton type=\"button\"\n                    icon=\"pi pi-plus\"\n                    label=\"Add\"\n                    class=\"p-button-sm p-button-success dialog-btn-add w-100\"\n                    [disabled]=\"!selectedTargetColValue || (newUiSutra.is_temp ? !newUiSutra.display_name?.trim() : !newUiSutra.target_col) || !newUiSutra.formula?.trim()\"\n                    (click)=\"addUiSutra()\">\n            </button>\n          </div>\n        </div>\n\n        <!-- Quick Column Insert Chips: Current Table Columns -->\n        <div class=\"chips-row\">\n          <span class=\"chips-label\">Table Columns:</span>\n          <span *ngFor=\"let col of currentTableColumns\"\n                class=\"quick-chip\"\n                (click)=\"insertColIntoFormula(col.name || col.col_name)\"\n                title=\"\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0924\u093E\u0932\u093F\u0915\u093E \u0915\u093E \u0915\u0949\u0932\u092E\">\n            + [{{ col.name || col.col_name }}]\n          </span>\n        </div>\n\n        <!-- Quick Reference Columns Chips: Available for Formula calculations -->\n        <div class=\"chips-row mt-1\" *ngIf=\"referenceColumns.length > 0\">\n          <span class=\"chips-label\">Ref Columns (\u0938\u0942\u0924\u094D\u0930 \u0939\u0947\u0924\u0941):</span>\n          <span *ngFor=\"let rc of referenceColumns\"\n                class=\"quick-chip chip-orange\"\n                (click)=\"insertColIntoFormula(rc.name || rc.key)\"\n                title=\"\u0930\u0947\u092B\u0930\u0947\u0902\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u0915\u093E \u0915\u0949\u0932\u092E (\u0915\u0947\u0935\u0932 \u0938\u0942\u0924\u094D\u0930/\u092B\u0949\u0930\u094D\u092E\u0942\u0932\u093E \u092E\u0947\u0902 \u0921\u0947\u091F\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0947 \u0932\u093F\u090F)\">\n            + [{{ rc.name || rc.key }}]\n          </span>\n        </div>\n\n        <!-- Quick Helpers Insert Chips -->\n        <div class=\"chips-row mt-1\">\n          <span class=\"chips-label\">Helpers:</span>\n          <span class=\"quick-chip chip-blue\" (click)=\"insertFnIntoFormula('AGE([dob])')\" title=\"Calculate age from Date of Birth\">\n            + AGE([dob])\n          </span>\n          <span class=\"quick-chip chip-blue\" (click)=\"insertFnIntoFormula('DAYS([end_date], [start_date])')\" title=\"Difference in days\">\n            + DAYS(d1, d2)\n          </span>\n          <span class=\"quick-chip chip-blue\" (click)=\"insertFnIntoFormula('IF([condition], true_val, false_val)')\" title=\"Conditional logic\">\n            + IF(cond, a, b)\n          </span>\n          <span class=\"quick-chip chip-blue\" (click)=\"insertFnIntoFormula('ROUND([val], 2)')\" title=\"Round number\">\n            + ROUND(n, 2)\n          </span>\n          <span class=\"quick-chip chip-blue\" (click)=\"insertFnIntoFormula('UPPER([text])')\" title=\"Uppercase text\">\n            + UPPER(str)\n          </span>\n        </div>\n      </div>\n\n      <!-- Existing Formulas List -->\n      <div class=\"subcard-title mb-1\">\u0938\u0915\u094D\u0930\u093F\u092F \u0938\u0942\u0924\u094D\u0930 (Active UI Formulas):</div>\n      <div *ngIf=\"uiSutrasList.length === 0\" class=\"dialog-empty-box\">\n        \u0905\u092D\u0940 \u0907\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u092E\u0947\u0902 \u0915\u094B\u0908 UI \u0938\u0942\u0924\u094D\u0930 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u090A\u092A\u0930 \u0926\u093F\u090F \u0917\u090F \u092B\u0949\u0930\u094D\u092E \u0938\u0947 \u0928\u092F\u093E \u0938\u0942\u0924\u094D\u0930 \u091C\u094B\u0921\u093C\u0947\u0902\u0964\n      </div>\n\n      <div *ngIf=\"uiSutrasList.length > 0\" class=\"dialog-table-card\">\n        <table class=\"dialog-data-table\">\n          <thead>\n            <tr>\n              <th style=\"width: 38px;\" class=\"text-center\">#</th>\n              <th style=\"width: 100px;\">\u092A\u094D\u0930\u0915\u093E\u0930 (Type)</th>\n              <th style=\"width: 140px;\">\u0915\u0949\u0932\u092E \u0928\u093E\u092E</th>\n              <th>\u0938\u092E\u0940\u0915\u0930\u0923 (Formula)</th>\n              <th style=\"width: 50px;\" class=\"text-center\">\u0939\u091F\u093E\u090F\u0902</th>\n            </tr>\n          </thead>\n          <tbody>\n            <tr *ngFor=\"let s of uiSutrasList; let i = index\">\n              <td class=\"text-center text-muted font-mono col-idx\">{{ i + 1 }}</td>\n              <td>\n                <span *ngIf=\"s.is_temp\" class=\"quick-chip chip-blue font-bold\">\n                  <i class=\"pi pi-eye me-1\"></i>Temp (fx)\n                </span>\n                <span *ngIf=\"!s.is_temp\" class=\"quick-chip chip-green font-bold\">\n                  <i class=\"pi pi-database me-1\"></i>DB Column\n                </span>\n              </td>\n              <td class=\"font-mono\">\n                <strong>{{ s.display_name || s.target_col }}</strong>\n                <span *ngIf=\"s.is_temp && s.target_col\" class=\"text-muted-xs font-mono ms-1\">({{ s.target_col }})</span>\n              </td>\n              <td class=\"font-mono text-primary formula-cell\">{{ s.formula }}</td>\n              <td class=\"text-center\">\n                <button *ngIf=\"isAdmin\" type=\"button\" class=\"mini-del-btn\" (click)=\"removeUiSutra(i)\" title=\"\u0939\u091F\u093E\u090F\u0902\">\n                  <i class=\"pi pi-trash\"></i>\n                </button>\n                <span *ngIf=\"!isAdmin\" class=\"text-muted-xs\">\uD83D\uDD12 View</span>\n              </td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n    </div>\n    <ng-template pTemplate=\"footer\">\n      <div class=\"dialog-footer-actions\">\n        <button pButton type=\"button\" label=\"\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902 (Cancel)\" class=\"p-button-text p-button-sm dialog-btn-cancel\" (click)=\"showUiSutrasModal = false\"></button>\n        <button *ngIf=\"isAdmin\" pButton type=\"button\" label=\"\u0938\u0947\u0935 \u0915\u0930\u0947\u0902 (Save Formulas)\" icon=\"pi pi-check\" class=\"p-button-sm p-button-primary dialog-btn-save\" [loading]=\"isSavingUiSutras\" (click)=\"saveUiSutras()\"></button>\n      </div>\n    </ng-template>\n  </p-dialog>\n\n  <!-- \u2500\u2500 3. Backend Sutras (Server Database Triggers) Dialog \u2500\u2500\u2500\u2500\u2500 -->\n  <p-dialog [(visible)]=\"showBackendSutrasModal\"\n            [modal]=\"true\"\n            [dismissableMask]=\"true\"\n            [draggable]=\"false\"\n            [resizable]=\"false\"\n            [style]=\"{ width: '94vw', maxWidth: '980px' }\"\n            styleClass=\"sutram-studio-dialog\"\n            header=\"\u26A1 \u092C\u0948\u0915\u090F\u0902\u0921 \u0938\u0942\u0924\u094D\u0930 \u0935\u093F\u0928\u094D\u092F\u093E\u0938 (Server Database Triggers): {{ currentActiveSheetTitle }}\">\n    <div class=\"dialog-body-wrap\">\n      <div class=\"dialog-info-banner warning\">\n        <i class=\"pi pi-bolt banner-icon\"></i>\n        <span>\u0938\u0930\u094D\u0935\u0930-\u0938\u093E\u0907\u0921 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u091F\u094D\u0930\u093F\u0917\u0930 \u2014 \u0907\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u092E\u0947\u0902 \u0921\u0947\u091F\u093E \u0907\u0928\u094D\u0938\u0930\u094D\u091F, \u0905\u092A\u0921\u0947\u091F \u092F\u093E \u0921\u093F\u0932\u0940\u091F \u0939\u094B\u0928\u0947 \u092A\u0930 \u0938\u094D\u0935\u0924\u0903 \u0915\u0938\u094D\u091F\u092E SQL \u0915\u094D\u0935\u0947\u0930\u0940 \u092F\u093E \u0915\u094D\u0930\u0949\u0938-\u0924\u093E\u0932\u093F\u0915\u093E \u0938\u093F\u0902\u0915 \u091A\u0932\u093E\u090F\u0902\u0964</span>\n      </div>\n\n      <div *ngIf=\"!isAdmin\" class=\"dialog-info-banner warning mb-2\">\n        <i class=\"pi pi-lock banner-icon\"></i>\n        <span><strong>Author Mode (View Only):</strong> \u0915\u0947\u0935\u0932 Admin \u0915\u094B \u092C\u0948\u0915\u090F\u0902\u0921 \u091F\u094D\u0930\u093F\u0917\u0930 \u091C\u094B\u0921\u093C\u0928\u0947 \u092F\u093E \u0939\u091F\u093E\u0928\u0947 \u0915\u093E \u0905\u0927\u093F\u0915\u093E\u0930 \u0939\u0948\u0964 (Only Admin can create/delete database triggers)</span>\n      </div>\n\n      <!-- Add Trigger Card -->\n      <div class=\"dialog-subcard\" *ngIf=\"isAdmin\">\n        <div class=\"subcard-title\">\u0928\u092F\u093E \u0938\u0930\u094D\u0935\u0930 \u091F\u094D\u0930\u093F\u0917\u0930 \u092C\u0928\u093E\u090F\u0902 (Create Database Trigger)</div>\n        \n        <!-- Row 1: Name, Event, Action Type -->\n        <div class=\"subcard-grid mb-2\">\n          <div class=\"subcard-col-4\">\n            <label class=\"dialog-label\">\u091F\u094D\u0930\u093F\u0917\u0930 \u0915\u093E \u0928\u093E\u092E (Identifier):</label>\n            <input type=\"text\"\n                   pInputText\n                   class=\"dialog-ctrl-input font-mono\"\n                   [(ngModel)]=\"newTriggerDef.trigger_name\"\n                   placeholder=\"e.g. trg_stock_update\" />\n          </div>\n          <div class=\"subcard-col-3\">\n            <label class=\"dialog-label\">\u0907\u0935\u0947\u0902\u091F (Event):</label>\n            <p-dropdown [options]=\"[{label:'INSERT (\u0928\u0908 \u092A\u0902\u0915\u094D\u0924\u093F)', value:'INSERT'},{label:'UPDATE (\u0938\u0902\u0936\u094B\u0927\u0928)', value:'UPDATE'},{label:'DELETE (\u0935\u093F\u0932\u094B\u092A\u0928)', value:'DELETE'}]\"\n                        [(ngModel)]=\"newTriggerDef.event\"\n                        styleClass=\"dialog-ctrl-dropdown\"\n                        [appendTo]=\"'body'\">\n            </p-dropdown>\n          </div>\n          <div class=\"subcard-col-5\">\n            <label class=\"dialog-label\">\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 \u092A\u094D\u0930\u0915\u093E\u0930 (Action Type):</label>\n            <p-dropdown [options]=\"[{label:'\u26A1 Raw SQL (\u0915\u0938\u094D\u091F\u092E SQL \u0915\u094D\u0935\u0947\u0930\u0940 \u2014 \u0905\u0928\u0941\u0936\u0902\u0938\u093F\u0924)', value:'raw_sql'},{label:'\uD83D\uDD04 Update Row (\u0905\u0928\u094D\u092F \u0924\u093E\u0932\u093F\u0915\u093E \u0905\u092A\u0921\u0947\u091F)', value:'update_row'},{label:'\u2795 Insert Row (\u0905\u0928\u094D\u092F \u0924\u093E\u0932\u093F\u0915\u093E \u092E\u0947\u0902 \u0907\u0928\u094D\u0938\u0930\u094D\u091F)', value:'insert_row'},{label:'\u274C Delete Row (\u0905\u0928\u094D\u092F \u0924\u093E\u0932\u093F\u0915\u093E \u0938\u0947 \u0935\u093F\u0932\u094B\u092A\u0928)', value:'delete_row'}]\"\n                        [(ngModel)]=\"newTriggerDef.action_type\"\n                        styleClass=\"dialog-ctrl-dropdown\"\n                        [appendTo]=\"'body'\">\n            </p-dropdown>\n          </div>\n        </div>\n\n        <!-- Row 2A: Raw SQL Query Editor (Default & Primary Feature) -->\n        <div *ngIf=\"newTriggerDef.action_type === 'raw_sql'\" class=\"mt-2\">\n          <div class=\"d-flex align-items-center justify-content-between mb-1\">\n            <label class=\"dialog-label mb-0\">SQL \u0915\u094D\u0935\u0947\u0930\u0940 (Raw SQL Query):</label>\n            <span class=\"text-muted-xs font-mono\">\u0928\u092F\u093E \u092E\u093E\u0928: <code>:new.col</code> | \u092A\u0941\u0930\u093E\u0928\u093E \u092E\u093E\u0928: <code>:old.col</code></span>\n          </div>\n          <textarea rows=\"3\"\n                    class=\"dialog-ctrl-textarea font-mono\"\n                    [(ngModel)]=\"newTriggerDef.raw_sql\"\n                    placeholder=\"UPDATE target_table SET col = col + :new.qty WHERE id = :new.target_id;\"></textarea>\n          \n          <!-- Quick Column Tags for SQL -->\n          <div class=\"chips-row mt-1\">\n            <span class=\"chips-label\">Columns:</span>\n            <span *ngFor=\"let h of visibleHeaders\"\n                  class=\"quick-chip chip-green\"\n                  (click)=\"insertColIntoTriggerSql(h.name, ':new.')\">\n              +:new.{{ h.name }}\n            </span>\n            <ng-container *ngIf=\"newTriggerDef.event !== 'INSERT'\">\n              <span *ngFor=\"let h of visibleHeaders\"\n                    class=\"quick-chip chip-orange\"\n                    (click)=\"insertColIntoTriggerSql(h.name, ':old.')\">\n                +:old.{{ h.name }}\n              </span>\n            </ng-container>\n          </div>\n\n          <!-- Quick Target Table Chips -->\n          <div class=\"chips-row mt-1\" *ngIf=\"tablesList.length > 0\">\n            <span class=\"chips-label\">Tables:</span>\n            <span *ngFor=\"let t of tablesList\"\n                  class=\"quick-chip chip-blue\"\n                  (click)=\"insertTextIntoTriggerSql(t.table)\">\n              {{ t.table }}\n            </span>\n          </div>\n        </div>\n\n        <!-- Row 2B: OR Target Table & Field Map for update_row/insert_row -->\n        <div *ngIf=\"newTriggerDef.action_type !== 'raw_sql'\" class=\"subcard-grid mt-2\">\n          <div class=\"subcard-col-5\">\n            <label class=\"dialog-label\">Target Table (\u0932\u0915\u094D\u0937\u094D\u092F \u0924\u093E\u0932\u093F\u0915\u093E):</label>\n            <p-dropdown [options]=\"tablesList\"\n                        [(ngModel)]=\"newTriggerDef.target_table\"\n                        optionLabel=\"display_name\"\n                        optionValue=\"table\"\n                        [filter]=\"true\"\n                        filterBy=\"display_name,table\"\n                        placeholder=\"-- Select Target Table --\"\n                        styleClass=\"dialog-ctrl-dropdown\"\n                        [appendTo]=\"'body'\">\n              <ng-template let-item pTemplate=\"item\">\n                <div class=\"d-flex align-items-center justify-content-between\" style=\"width: 100%;\">\n                  <span>{{ item.display_name }}</span>\n                  <span class=\"text-muted-xs font-mono ms-2\">{{ item.table }}</span>\n                </div>\n              </ng-template>\n              <ng-template let-item pTemplate=\"selectedItem\">\n                <span class=\"font-semibold\">{{ item.display_name }}</span>\n                <span class=\"text-muted-xs font-mono ms-1\">({{ item.table }})</span>\n              </ng-template>\n            </p-dropdown>\n          </div>\n          <div class=\"subcard-col-7\">\n            <label class=\"dialog-label\">Field Mapping JSON (\u092B\u0940\u0932\u094D\u0921 \u092E\u0948\u092A):</label>\n            <input type=\"text\"\n                   pInputText\n                   class=\"dialog-ctrl-input font-mono\"\n                   [(ngModel)]=\"newTriggerDef.field_map_str\"\n                   placeholder='{\"stock_qty\": \":new.qty\"}' />\n          </div>\n        </div>\n\n        <!-- Submit Row -->\n        <div class=\"d-flex justify-content-end mt-2 pt-1\">\n          <button pButton type=\"button\"\n                  icon=\"pi pi-bolt\"\n                  label=\"\u091F\u094D\u0930\u093F\u0917\u0930 \u092C\u0928\u093E\u090F\u0902 (Create Trigger)\"\n                  class=\"p-button-sm p-button-warning dialog-btn-add\"\n                  [disabled]=\"!newTriggerDef.trigger_name || (newTriggerDef.action_type === 'raw_sql' && !newTriggerDef.raw_sql)\"\n                  (click)=\"createBackendTrigger()\">\n          </button>\n        </div>\n      </div>\n\n      <!-- Existing Triggers List -->\n      <div class=\"subcard-title mb-1\">\u0938\u0915\u094D\u0930\u093F\u092F \u092C\u0948\u0915\u090F\u0902\u0921 \u091F\u094D\u0930\u093F\u0917\u0930\u094D\u0938 (Active Triggers):</div>\n      <div *ngIf=\"backendTriggersList.length === 0\" class=\"dialog-empty-box\">\n        \u0905\u092D\u0940 \u0907\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u092E\u0947\u0902 \u0915\u094B\u0908 \u092C\u0948\u0915\u090F\u0902\u0921 \u091F\u094D\u0930\u093F\u0917\u0930 \u0938\u0915\u094D\u0930\u093F\u092F \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u090A\u092A\u0930 \u0926\u093F\u090F \u0917\u090F \u092B\u0949\u0930\u094D\u092E \u0938\u0947 \u0928\u092F\u093E \u091F\u094D\u0930\u093F\u0917\u0930 \u092C\u0928\u093E\u090F\u0902\u0964\n      </div>\n\n      <div *ngIf=\"backendTriggersList.length > 0\" class=\"dialog-table-card\">\n        <table class=\"dialog-data-table\">\n          <thead>\n            <tr>\n              <th style=\"width: 38px;\" class=\"text-center\">#</th>\n              <th style=\"width: 140px;\">\u091F\u094D\u0930\u093F\u0917\u0930 \u0928\u093E\u092E</th>\n              <th style=\"width: 75px;\" class=\"text-center\">\u0907\u0935\u0947\u0902\u091F</th>\n              <th style=\"width: 85px;\" class=\"text-center\">\u092A\u094D\u0930\u0915\u093E\u0930</th>\n              <th>\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 / SQL \u0915\u094D\u0935\u0947\u0930\u0940</th>\n              <th style=\"width: 50px;\" class=\"text-center\">\u0939\u091F\u093E\u090F\u0902</th>\n            </tr>\n          </thead>\n          <tbody>\n            <tr *ngFor=\"let t of backendTriggersList; let i = index\">\n              <td class=\"text-center text-muted font-mono col-idx\">{{ i + 1 }}</td>\n              <td class=\"font-mono\">\n                <strong>{{ t.trigger_name }}</strong>\n              </td>\n              <td class=\"text-center\">\n                <span class=\"event-pill\" [ngClass]=\"t.event === 'INSERT' ? 'event-pill-insert' : (t.event === 'UPDATE' ? 'event-pill-update' : 'event-pill-delete')\">\n                  {{ t.event }}\n                </span>\n              </td>\n              <td class=\"text-center\">\n                <span class=\"type-pill\">{{ (t.actions && t.actions[0]?.action_type) || t.action_type || 'raw_sql' }}</span>\n              </td>\n              <td class=\"font-mono text-muted-xs\">\n                <code *ngIf=\"t.actions && t.actions[0]?.raw_sql\" class=\"trigger-code-snippet\">{{ t.actions[0]?.raw_sql }}</code>\n                <span *ngIf=\"!t.actions || !t.actions[0]?.raw_sql\">{{ t.target_table || (t.actions && t.actions[0]?.target_table) || 'Standard Action' }}</span>\n              </td>\n              <td class=\"text-center\">\n                <button *ngIf=\"isAdmin\" type=\"button\" class=\"mini-del-btn\" (click)=\"deleteBackendTrigger(t._id)\" title=\"\u0939\u091F\u093E\u090F\u0902\">\n                  <i class=\"pi pi-trash\"></i>\n                </button>\n                <span *ngIf=\"!isAdmin\" class=\"text-muted-xs\">\uD83D\uDD12 View</span>\n              </td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n    </div>\n    <ng-template pTemplate=\"footer\">\n      <div class=\"dialog-footer-actions\">\n        <button pButton type=\"button\" label=\"\u092C\u0902\u0926 \u0915\u0930\u0947\u0902 (Close)\" class=\"p-button-text p-button-sm dialog-btn-cancel\" (click)=\"showBackendSutrasModal = false\"></button>\n      </div>\n    </ng-template>\n  </p-dialog>\n\n  <!-- \u2500\u2500 4. User & Role Management Dialog \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\n  <p-dialog [(visible)]=\"showUserManagementModal\"\n            [modal]=\"true\"\n            [dismissableMask]=\"true\"\n            [draggable]=\"false\"\n            [resizable]=\"false\"\n            [style]=\"{ width: '94vw', maxWidth: '860px' }\"\n            styleClass=\"sutram-studio-dialog\"\n            header=\"\uD83D\uDC65 \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u090F\u0935\u0902 \u0905\u0927\u093F\u0915\u093E\u0930 \u092A\u094D\u0930\u092C\u0902\u0927\u0928 (User & Rights Management)\">\n    <div class=\"dialog-body-wrap\">\n      <!-- Info / Quick Role Switch Banner -->\n      <div class=\"dialog-info-banner info d-flex justify-content-between align-items-center\">\n        <div class=\"d-flex align-items-center gap-2\">\n          <i class=\"pi pi-shield banner-icon\"></i>\n          <span>\n            \u0938\u0915\u094D\u0930\u093F\u092F \u0916\u093E\u0924\u093E: <strong>{{ currentUser.username }}</strong>\n            ({{ isAdmin ? '\uD83D\uDC51 Admin (\u092A\u0942\u0930\u094D\u0923 \u0905\u0927\u093F\u0915\u093E\u0930)' : '\uD83D\uDC64 Author (\u0938\u0940\u092E\u093F\u0924 \u0905\u0927\u093F\u0915\u093E\u0930)' }})\n          </span>\n        </div>\n        <div class=\"d-flex align-items-center gap-1\">\n          <button type=\"button\"\n                  class=\"btn-role-switch\"\n                  [class.active-role]=\"isAdmin\"\n                  (click)=\"switchRole('admin')\">\n            \uD83D\uDC51 Admin\n          </button>\n          <button type=\"button\"\n                  class=\"btn-role-switch\"\n                  [class.active-role]=\"isAuthor\"\n                  (click)=\"switchRole('author')\">\n            \uD83D\uDC64 Author\n          </button>\n        </div>\n      </div>\n\n      <div class=\"dialog-subtext\">\n        Admin: \u092A\u0942\u0930\u094D\u0923 \u0905\u0927\u093F\u0915\u093E\u0930 (Triggers, Schema, Rules, User Management).<br>\n        Author: \u0911\u092A\u0930\u0947\u0936\u0928\u0932 \u0905\u0927\u093F\u0915\u093E\u0930 (\u0921\u0947\u091F\u093E \u0909\u092A\u092F\u094B\u0917, \u0915\u0949\u0932\u092E \u0926\u0943\u0936\u094D\u092F\u0924\u093E Show/Hide, \u0921\u093F\u0938\u094D\u092A\u094D\u0932\u0947 \u092B\u0949\u0930\u094D\u092E\u0947\u091F\u093F\u0902\u0917).\n      </div>\n\n      <!-- Add / Edit User Form Card -->\n      <div class=\"subcard-config mb-2\">\n        <div class=\"subcard-header d-flex justify-content-between align-items-center\">\n          <span class=\"subcard-title\">\n            {{ editingUserId ? '\u270F\uFE0F \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0947\u0902 (Edit User #' + editingUserId + ')' : '\u2795 \u0928\u092F\u093E \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u091C\u094B\u0921\u093C\u0947\u0902 (Add New User)' }}\n          </span>\n          <button *ngIf=\"editingUserId\" type=\"button\" class=\"btn-link-mini text-muted\" (click)=\"cancelUserEdit()\">\n            Cancel Edit\n          </button>\n        </div>\n\n        <div class=\"subcard-grid d-flex flex-wrap gap-2 align-items-end mt-2\">\n          <div style=\"flex: 1; min-width: 140px;\">\n            <label class=\"field-lbl\">\u092F\u0942\u091C\u0930\u0928\u0947\u092E (Username)*</label>\n            <input type=\"text\"\n                   pInputText\n                   [(ngModel)]=\"userFormData.username\"\n                   placeholder=\"e.g. rohit\"\n                   [disabled]=\"!!editingUserId\"\n                   class=\"w-100 formula-input\" />\n          </div>\n\n          <div style=\"flex: 1; min-width: 140px;\">\n            <label class=\"field-lbl\">{{ editingUserId ? '\u0928\u092F\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 (Password)' : '\u092A\u093E\u0938\u0935\u0930\u094D\u0921 (Password)*' }}</label>\n            <input type=\"password\"\n                   pInputText\n                   [(ngModel)]=\"userFormData.password\"\n                   [placeholder]=\"editingUserId ? '\u0916\u093E\u0932\u0940 \u091B\u094B\u0921\u093C\u0947\u0902 \u092F\u0926\u093F \u0928\u0939\u0940\u0902 \u092C\u0926\u0932\u0928\u093E' : 'e.g. pass123'\"\n                   class=\"w-100 formula-input\" />\n          </div>\n\n          <div style=\"flex: 1.2; min-width: 160px;\">\n            <label class=\"field-lbl\">\u092A\u094D\u0930\u0926\u0930\u094D\u0936\u093F\u0924 \u0928\u093E\u092E (Display Name)</label>\n            <input type=\"text\"\n                   pInputText\n                   [(ngModel)]=\"userFormData.display_name\"\n                   placeholder=\"e.g. Rohit Sharma\"\n                   class=\"w-100 formula-input\" />\n          </div>\n\n          <div style=\"flex: 1.2; min-width: 160px;\">\n            <label class=\"field-lbl\">\u092D\u0942\u092E\u093F\u0915\u093E (Role)*</label>\n            <p-dropdown [options]=\"roleDropdownOptions\"\n                        [(ngModel)]=\"userFormData.role\"\n                        styleClass=\"w-100\"\n                        [appendTo]=\"'body'\">\n            </p-dropdown>\n          </div>\n\n          <div style=\"display: flex; align-items: center; gap: 8px; padding-bottom: 6px;\">\n            <p-checkbox [binary]=\"true\"\n                        label=\"\u0938\u0915\u094D\u0930\u093F\u092F\"\n                        [(ngModel)]=\"userFormData.active\">\n            </p-checkbox>\n            <button pButton\n                    type=\"button\"\n                    [label]=\"editingUserId ? '\u0905\u092A\u0921\u0947\u091F' : '\u091C\u094B\u0921\u093C\u0947\u0902'\"\n                    icon=\"pi pi-check\"\n                    class=\"p-button-sm p-button-primary\"\n                    [loading]=\"isSavingUser\"\n                    (click)=\"saveUser()\">\n            </button>\n          </div>\n        </div>\n      </div>\n\n      <!-- Users List Table -->\n      <div class=\"dialog-table-card\">\n        <table class=\"dialog-data-table\">\n          <thead>\n            <tr>\n              <th style=\"width: 35px;\" class=\"text-center\">#</th>\n              <th>\u092F\u0942\u091C\u0930\u0928\u0947\u092E</th>\n              <th>\u092A\u094D\u0930\u0926\u0930\u094D\u0936\u093F\u0924 \u0928\u093E\u092E</th>\n              <th style=\"width: 110px;\">\u092D\u0942\u092E\u093F\u0915\u093E (Role)</th>\n              <th style=\"width: 80px;\" class=\"text-center\">\u0938\u094D\u0925\u093F\u0924\u093F</th>\n              <th style=\"width: 140px;\">\u092C\u0928\u093E\u092F\u093E \u0917\u092F\u093E</th>\n              <th style=\"width: 130px;\" class=\"text-center\">\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908</th>\n            </tr>\n          </thead>\n          <tbody>\n            <tr *ngFor=\"let u of usersList; let i = index\">\n              <td class=\"text-center text-muted font-mono col-idx\">{{ i + 1 }}</td>\n              <td>\n                <strong class=\"font-mono\">{{ u.username }}</strong>\n                <span *ngIf=\"currentUser.username === u.username\" class=\"badge-current-user ms-1\">Active</span>\n              </td>\n              <td>{{ u.display_name || '\u2014' }}</td>\n              <td>\n                <span class=\"role-pill-tag\" [class.admin-tag]=\"u.role === 'admin'\" [class.author-tag]=\"u.role === 'author'\">\n                  {{ u.role === 'admin' ? '\uD83D\uDC51 Admin' : '\uD83D\uDC64 Author' }}\n                </span>\n              </td>\n              <td class=\"text-center\">\n                <span class=\"status-pill\" [class.active-pill]=\"u.active\" [class.inactive-pill]=\"!u.active\">\n                  {{ u.active ? 'Active' : 'Inactive' }}\n                </span>\n              </td>\n              <td class=\"text-muted-xs font-mono\">{{ u.created_at || '\u2014' }}</td>\n              <td class=\"text-center\">\n                <div class=\"d-flex align-items-center justify-content-center gap-2\">\n                  <i class=\"pi pi-pencil i-outline-primary cursor-pointer\"\n                     (click)=\"editUser(u)\"\n                     title=\"Edit User\">\n                  </i>\n                  <i *ngIf=\"u.username !== 'admin'\"\n                     class=\"pi pi-trash i-outline-danger cursor-pointer\"\n                     (click)=\"deleteUser(u)\"\n                     title=\"Delete User\">\n                  </i>\n                  <button type=\"button\"\n                          class=\"btn-use-account\"\n                          [class.btn-use-account-active]=\"currentUser.username === u.username\"\n                          (click)=\"setCurrentActiveUser(u)\"\n                          title=\"Use this account\">\n                    {{ currentUser.username === u.username ? '\u2713 Active' : 'Switch' }}\n                  </button>\n                </div>\n              </td>\n            </tr>\n            <tr *ngIf=\"usersList.length === 0\">\n              <td colspan=\"7\" class=\"text-center text-muted py-3\">\n                <span *ngIf=\"isLoadingUsers\"><i class=\"pi pi-spin pi-spinner me-1\"></i> \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...</span>\n                <span *ngIf=\"!isLoadingUsers\">\u0915\u094B\u0908 \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E (No users found)</span>\n              </td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n    </div>\n    <ng-template pTemplate=\"footer\">\n      <div class=\"dialog-footer-actions\">\n        <button pButton type=\"button\" label=\"\u092C\u0902\u0926 \u0915\u0930\u0947\u0902 (Close)\" class=\"p-button-text p-button-sm dialog-btn-cancel\" (click)=\"showUserManagementModal = false\"></button>\n      </div>\n    </ng-template>\n  </p-dialog>\n\n</div>\n\n", styles: ["/**\n * sutram-excel-studio.component.scss\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n * Pixel-Perfect Enterprise Excel Studio Styling.\n * Exact replication of Sutram Excel Studio v2.0 UI.\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n */\n\n:host {\n  display: block;\n  width: 100%;\n  height: 100%;\n}\n\n.sutram-excel-container {\n  --primary: #4f46e5;\n  --primary-hover: #4338ca;\n  --primary-soft: #e0e7ff;\n  --success: #10b981;\n  --success-soft: #d1fae5;\n  --warning: #f59e0b;\n  --warning-soft: #fef3c7;\n  --danger: #ef4444;\n  --danger-soft: #fee2e2;\n  --bg: #f8fafc;\n  --surface: #ffffff;\n  --surface-border: #e2e8f0;\n  --text: #0f172a;\n  --text-muted: #64748b;\n  --radius: 6px;\n  --header-bg: #f1f5f9;\n  --header-text: #1e293b;\n  --cell-border: rgba(125, 125, 125, 0.18);\n  --cell-height: 23px;\n  --header-height: 38px;\n  --cell-edited-bg: #fef9c3;\n  --cell-edited-border: #eab308;\n  --row-edited-bg: #fffbeb;\n  --row-new-bg: #dcfce7;\n  --row-new-border: #22c55e;\n\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n  background-color: var(--bg);\n  color: var(--text);\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  user-select: none;\n\n  &.dark-mode {\n    --bg: #0f172a;\n    --surface: #1e293b;\n    --surface-border: #334155;\n    --text: #f8fafc;\n    --text-muted: #94a3b8;\n    --header-bg: #1e293b;\n    --header-text: #cbd5e1;\n    --cell-border: rgba(255, 255, 255, 0.1);\n    --cell-edited-bg: rgba(234, 179, 8, 0.22);\n    --cell-edited-border: #facc15;\n    --row-edited-bg: rgba(234, 179, 8, 0.12);\n    --row-new-bg: rgba(34, 197, 94, 0.18);\n    --row-new-border: #4ade80;\n  }\n}\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n * 1. TOP EXCEL-STYLE RIBBON HEADER\n * \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n.studio-header {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n  flex-shrink: 0;\n  user-select: none;\n}\n\n/* 1A. Ribbon Top Menu Bar (Brand + Tabs + Mode Switcher) */\n.ribbon-menu-bar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 2px 10px;\n  height: 32px;\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n}\n\n.menu-bar-left {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.brand {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.brand-icon {\n  width: 22px;\n  height: 22px;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  font-size: 11px;\n}\n.brand-title {\n  font-size: 11.5px;\n  font-weight: 700;\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  color: var(--text);\n\n  .version-tag {\n    font-size: 9px;\n    padding: 1px 4px;\n    background: rgba(16, 185, 129, 0.18);\n    color: #059669;\n    border-radius: 3px;\n    font-weight: 700;\n  }\n}\n\n/* Ribbon Tabs Navigation */\n.ribbon-tabs-nav {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n}\n.ribbon-tab-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 3px 11px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.12s ease;\n\n  i {\n    font-size: 10.5px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.08);\n    color: var(--text);\n  }\n\n  &.active {\n    background: var(--surface);\n    color: var(--primary);\n    border-color: var(--surface-border) var(--surface-border) transparent var(--surface-border);\n    border-bottom: 2px solid var(--primary);\n    font-weight: 700;\n  }\n}\n.ribbon-badge {\n  font-size: 9px;\n  padding: 1px 4px;\n  border-radius: 999px;\n  background: rgba(79, 70, 229, 0.12);\n  color: var(--primary);\n  font-weight: 700;\n}\n\n.menu-bar-right {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.mode-pill-toggle {\n  background: rgba(125, 125, 125, 0.12);\n  border-radius: 999px;\n  padding: 2px;\n  display: flex;\n  gap: 2px;\n}\n.mode-pill-btn {\n  padding: 2px 9px;\n  border-radius: 999px;\n  font-size: 10px;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  background: transparent;\n  color: var(--text-muted);\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n\n  i { font-size: 9.5px; }\n}\n.mode-pill-btn.active-normal {\n  background: #3b82f6;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.35);\n}\n.mode-pill-btn.active-smart {\n  background: #10b981;\n  color: #ffffff;\n  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.35);\n}\n\n.cmd-btn-save-top,\n.cmd-btn-sync-top {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 2px 10px;\n  height: 24px;\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.15s ease;\n\n  i {\n    font-size: 11px;\n  }\n\n  &:hover:not(:disabled) {\n    background: rgba(125, 125, 125, 0.1);\n    border-color: var(--primary);\n    color: var(--primary);\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n\n  &.has-pending {\n    background: #10b981;\n    color: #ffffff;\n    border-color: #059669;\n    box-shadow: 0 1px 4px rgba(16, 185, 129, 0.35);\n\n    &:hover {\n      background: #059669;\n      color: #ffffff;\n    }\n  }\n\n  .sync-badge-count {\n    font-size: 9px;\n    padding: 1px 5px;\n    border-radius: 999px;\n    background: #ffffff;\n    color: #059669;\n    font-weight: 800;\n    line-height: 1;\n  }\n}\n\n/* 1B. Ribbon Content Strip (Few cm area) */\n.ribbon-strip {\n  background: var(--surface);\n  padding: 4px 10px;\n  height: 60px;\n  display: flex;\n  align-items: center;\n  overflow: hidden;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);\n}\n\n/* Home Panel Toolbar (Grouped items) */\n.ribbon-content-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n\n.ribbon-group {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: space-between;\n  height: 52px;\n  padding: 0 4px;\n}\n\n.ribbon-group-items {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-grow: 1;\n}\n\n.ribbon-group-name {\n  font-size: 8.5px;\n  color: var(--text-muted);\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  margin-top: 1px;\n}\n\n.ribbon-v-sep {\n  width: 1px;\n  height: 40px;\n  background: var(--surface-border);\n  opacity: 0.75;\n  margin: 0 4px;\n}\n\n.ribbon-tool-btn {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 2px;\n  padding: 2px 7px;\n  height: 42px;\n  border-radius: 4px;\n  border: 1px solid transparent;\n  background: transparent;\n  color: var(--text);\n  cursor: pointer;\n  transition: all 0.12s;\n  font-size: 10.5px;\n\n  i {\n    font-size: 13px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.09);\n    border-color: var(--surface-border);\n  }\n\n  &.active {\n    background: var(--primary-soft);\n    color: var(--primary);\n    border-color: rgba(79, 70, 229, 0.3);\n    font-weight: 700;\n  }\n\n  .ribbon-tool-lbl {\n    font-size: 9px;\n    white-space: nowrap;\n    font-weight: 500;\n  }\n}\n\n.ribbon-mini-col {\n  display: flex;\n  flex-direction: row;\n  gap: 2px;\n}\n\n.ribbon-mini-btn {\n  width: 22px;\n  height: 22px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 3px;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  font-size: 9.5px;\n\n  &:hover { background: rgba(125, 125, 125, 0.1); }\n\n  &.active-align {\n    background: var(--primary-soft);\n    color: var(--primary);\n    border-color: rgba(79, 70, 229, 0.35);\n  }\n}\n\n.ribbon-search-field {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 165px;\n\n  .search-ico {\n    position: absolute;\n    left: 7px;\n    font-size: 9.5px;\n    color: var(--text-muted);\n    pointer-events: none;\n  }\n\n  .ribbon-search-inp {\n    width: 100%;\n    height: 24px;\n    padding: 2px 20px 2px 22px;\n    font-size: 10.5px;\n    border-radius: 4px;\n    border: 1px solid var(--surface-border);\n    background: var(--surface);\n    color: var(--text);\n    outline: none;\n    transition: border-color 0.12s ease;\n\n    &:focus {\n      border-color: var(--primary);\n    }\n  }\n\n  .clear-btn-inline {\n    position: absolute;\n    right: 5px;\n    background: transparent;\n    border: none;\n    font-size: 9px;\n    cursor: pointer;\n    color: var(--text-muted);\n  }\n\n  .spin-inline {\n    position: absolute;\n    right: 5px;\n    font-size: 9px;\n    color: var(--primary);\n  }\n}\n\n.ribbon-btn-action {\n  background: var(--primary) !important;\n  color: #ffffff !important;\n  border-color: var(--primary) !important;\n  font-weight: 700 !important;\n\n  &:hover {\n    filter: brightness(1.1);\n  }\n\n  .sync-count-tag {\n    font-size: 8.5px;\n    padding: 0 4px;\n    background: #ffffff;\n    color: var(--primary);\n    border-radius: 999px;\n    font-weight: 800;\n    margin-left: 2px;\n  }\n}\n\n.ribbon-record-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 7px;\n  background: rgba(125, 125, 125, 0.08);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--text-muted);\n  height: 24px;\n}\n\n/* 1C. Tables & Reports Strip (Horizontal Scrolling Track with Small Boxes) */\n.ribbon-scroll-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.ribbon-empty-state {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 11px;\n  color: var(--text-muted);\n  padding: 4px 12px;\n  background: rgba(125, 125, 125, 0.05);\n  border-radius: 4px;\n  border: 1px dashed var(--surface-border);\n}\n\n.ribbon-boxes-track {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  overflow-x: auto;\n  scrollbar-width: thin;\n  height: 100%;\n  flex-grow: 1;\n  padding: 2px 2px;\n\n  &::-webkit-scrollbar {\n    height: 4px;\n  }\n  &::-webkit-scrollbar-thumb {\n    background: rgba(125, 125, 125, 0.25);\n    border-radius: 2px;\n  }\n}\n\n.ribbon-small-box {\n  position: relative;\n  flex-shrink: 0;\n  min-width: 115px;\n  max-width: 140px;\n  height: 46px;\n  background: var(--surface);\n  border: 1px solid var(--surface-border);\n  border-radius: 5px;\n  padding: 3px 8px 3px 6px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  transition: all 0.12s ease;\n  user-select: none;\n\n  &:hover {\n    border-color: var(--primary);\n    background: var(--primary-soft);\n    transform: translateY(-1px);\n    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);\n  }\n\n  &.active-box {\n    border-color: rgba(16, 185, 129, 0.6);\n    background: rgba(16, 185, 129, 0.08);\n  }\n\n  .box-star-btn {\n    position: absolute;\n    top: 2px;\n    right: 2px;\n    width: 15px;\n    height: 15px;\n    border: none;\n    background: transparent;\n    cursor: pointer;\n    color: var(--text-muted);\n    font-size: 9px;\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    z-index: 2;\n    transition: all 0.12s;\n\n    &:hover {\n      color: #f59e0b;\n      transform: scale(1.2);\n    }\n\n    &.starred {\n      color: #f59e0b;\n    }\n  }\n\n  .box-icon-wrap {\n    width: 25px;\n    height: 25px;\n    border-radius: 4px;\n    background: var(--primary-soft);\n    color: var(--primary);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 11px;\n    flex-shrink: 0;\n\n    &.report-icon-bg {\n      background: rgba(16, 185, 129, 0.15);\n      color: #059669;\n    }\n  }\n\n  .box-info {\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n    padding-right: 10px;\n\n    .box-name-eng-main {\n      font-size: 11px;\n      font-weight: 600;\n      color: var(--text);\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .box-name-hin {\n      font-size: 10.5px;\n      font-weight: 700;\n      color: var(--text);\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n\n    .box-name-eng {\n      font-size: 9px;\n      color: var(--text-muted);\n      font-family: monospace;\n      white-space: nowrap;\n      overflow: hidden;\n      text-overflow: ellipsis;\n    }\n  }\n\n  .box-dot {\n    position: absolute;\n    bottom: 3px;\n    right: 3px;\n    width: 5px;\n    height: 5px;\n    border-radius: 50%;\n    background: #10b981;\n  }\n}\n\n.btn-group-cmd {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.cmd-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  cursor: pointer;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text);\n  transition: all 0.15s;\n  user-select: none;\n\n  i {\n    font-size: 10.5px;\n  }\n}\n.cmd-btn:hover { background: rgba(125, 125, 125, 0.1); }\n.cmd-btn.active {\n  background: var(--primary-soft);\n  color: var(--primary);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.cmd-btn-primary { background: var(--primary); color: white; border-color: var(--primary); }\n.cmd-btn-primary:hover { background: var(--primary-hover); }\n.cmd-btn-success { background: var(--success); color: white; border-color: var(--success); }\n.cmd-btn-success:hover { background: #059669; }\n.cmd-btn-warning { background: var(--warning-soft); color: #b45309; border-color: rgba(245, 158, 11, 0.3); }\n\n.sync-badge-count {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: #f59e0b;\n  color: #ffffff;\n  font-size: 9.5px;\n  font-weight: 700;\n  padding: 1px 5px;\n  border-radius: 999px;\n  margin-left: 4px;\n  line-height: 1.1;\n}\n\n/* 2. FORMULA BAR ROW */\n.formula-bar-row {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n}\n.coord-box {\n  width: 48px;\n  height: 22px;\n  line-height: 18px;\n  text-align: center;\n  font-weight: 700;\n  font-size: 11px;\n  padding: 1px 3px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  background: rgba(125, 125, 125, 0.05);\n}\n.active-col-chip {\n  background: var(--primary-soft);\n  color: var(--primary);\n  padding: 1px 6px;\n  height: 20px;\n  line-height: 17px;\n  border-radius: 4px;\n  font-size: 10.5px;\n  font-weight: 600;\n  white-space: nowrap;\n  max-width: 170px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.formula-input {\n  flex-grow: 1;\n  height: 22px;\n  padding: 2px 7px;\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 11.5px;\n  font-family: inherit;\n  outline: none;\n  background: var(--surface);\n  color: var(--text);\n}\n.formula-input:focus { border-color: var(--primary); }\n\n.formula-bar-right-area {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-shrink: 0;\n  margin-left: 4px;\n}\n\n.formula-search-field {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 175px;\n\n  .search-ico {\n    position: absolute;\n    left: 7px;\n    font-size: 9.5px;\n    color: var(--text-muted);\n    pointer-events: none;\n  }\n\n  .formula-search-inp {\n    width: 100%;\n    height: 22px;\n    padding: 2px 20px 2px 22px;\n    font-size: 10.5px;\n    border-radius: 4px;\n    border: 1px solid var(--surface-border);\n    background: var(--surface);\n    color: var(--text);\n    outline: none;\n    transition: border-color 0.12s ease;\n\n    &:focus {\n      border-color: var(--primary);\n    }\n  }\n\n  .clear-btn-inline {\n    position: absolute;\n    right: 5px;\n    background: transparent;\n    border: none;\n    font-size: 9px;\n    cursor: pointer;\n    color: var(--text-muted);\n  }\n\n  .spin-inline {\n    position: absolute;\n    right: 5px;\n    font-size: 9px;\n    color: var(--primary);\n  }\n}\n\n.formula-record-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 1px 7px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--text-muted);\n  height: 22px;\n  white-space: nowrap;\n}\n.control-settings-bar {\n  background: var(--surface);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 3px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  flex-shrink: 0;\n  font-size: 11px;\n}\n.ctrl-bar-left, .ctrl-bar-right {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n.ctrl-btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 8px;\n  height: 23px;\n  border-radius: var(--radius);\n  font-size: 10.5px;\n  font-weight: 600;\n  border: 1px solid var(--surface-border);\n  background: var(--surface);\n  color: var(--text-muted);\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n\n  i {\n    font-size: 10px;\n  }\n}\n.ctrl-btn:hover {\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text);\n}\n.ctrl-btn.active {\n  color: var(--primary);\n  background: var(--primary-soft);\n  border-color: rgba(79, 70, 229, 0.35);\n}\n.ctrl-btn-danger {\n  color: var(--danger);\n  background: var(--danger-soft);\n  border-color: rgba(239, 68, 68, 0.3);\n}\n.ctrl-btn-danger:hover {\n  background: rgba(239, 68, 68, 0.2);\n}\n.ctrl-dot {\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  background: #10b981;\n  display: inline-block;\n}\n.ctrl-search-wrap {\n  position: relative;\n  display: flex;\n  align-items: center;\n  flex-grow: 1;\n  max-width: 420px;\n}\n.ctrl-search-icon {\n  position: absolute;\n  left: 8px;\n  color: var(--text-muted);\n  font-size: 10px;\n  pointer-events: none;\n}\n.ctrl-search-input {\n  width: 100%;\n  height: 23px;\n  padding: 2px 24px 2px 24px;\n  border: 1px solid var(--surface-border);\n  border-radius: 999px;\n  font-size: 11px;\n  background: rgba(125, 125, 125, 0.05);\n  color: var(--text);\n  outline: none;\n  transition: all 0.15s;\n}\n.ctrl-search-input:focus {\n  border-color: var(--primary);\n  background: var(--surface);\n  box-shadow: 0 0 0 2px var(--primary-soft);\n}\n.ctrl-search-clear {\n  position: absolute;\n  right: 6px;\n  background: none;\n  border: none;\n  font-size: 10px;\n  color: var(--text-muted);\n  cursor: pointer;\n  padding: 1px 4px;\n  border-radius: 50%;\n}\n.ctrl-search-clear:hover {\n  color: var(--danger);\n  background: rgba(125, 125, 125, 0.15);\n}\n.ctrl-search-spinner {\n  position: absolute;\n  right: 24px;\n  color: var(--primary);\n  font-size: 10px;\n}\n.ctrl-record-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 1px 7px;\n  height: 21px;\n  border-radius: 999px;\n  background: rgba(125, 125, 125, 0.08);\n  color: var(--text-muted);\n  font-size: 10px;\n  font-weight: 600;\n  white-space: nowrap;\n\n  i {\n    font-size: 10px;\n  }\n}\n\n/* 4. STATUS & BATCH SUGGESTION STRIP */\n.status-strip {\n  padding: 3px 14px;\n  font-size: 11.5px;\n  border-bottom: 1px solid var(--surface-border);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  flex-shrink: 0;\n  background: rgba(125, 125, 125, 0.04);\n}\n.status-strip.strip-error { background: #fef2f2; color: #991b1b; }\n.status-strip.strip-clean { background: #f0fdf4; color: #166534; }\n.status-strip.strip-suggestion { background: #fffbeb; color: #92400e; }\n\n/* 5. SPREADSHEET CANVAS */\n.spreadsheet-canvas {\n  flex-grow: 1;\n  overflow: hidden;\n  background: var(--surface);\n  position: relative;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n\n  sutram-grid {\n    display: block;\n    width: 100%;\n    height: 100%;\n    flex: 1;\n    min-height: 0;\n  }\n}\n\n/* 6. BOTTOM MULTI-SHEET TAB BAR & STATUS BAR */\n.studio-footer {\n  flex-shrink: 0;\n  background: var(--surface);\n  border-top: 1px solid var(--surface-border);\n  display: flex;\n  flex-direction: column;\n}\n.sheet-tabs-bar {\n  display: flex;\n  align-items: center;\n  background: rgba(125, 125, 125, 0.05);\n  border-bottom: 1px solid var(--surface-border);\n  padding: 2px 6px;\n  overflow-x: auto;\n  scrollbar-width: none;\n}\n.sheet-tabs-bar::-webkit-scrollbar { display: none; }\n\n.tab-pill {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 12px;\n  border-radius: 4px 4px 0 0;\n  font-size: 11.5px;\n  font-weight: 600;\n  cursor: pointer;\n  color: var(--text-muted);\n  border: 1px solid transparent;\n  border-bottom: 2px solid transparent;\n  white-space: nowrap;\n  transition: all 0.15s;\n}\n.tab-pill:hover {\n  background: rgba(125, 125, 125, 0.1);\n  color: var(--text);\n}\n.tab-pill.active-tab {\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-color: rgba(16, 185, 129, 0.25);\n  border-bottom: 2px solid #10b981;\n  font-weight: 700;\n}\n\n.sheet-tab-badge {\n  font-size: 9.5px;\n  padding: 1px 5px;\n  background: rgba(16, 185, 129, 0.2);\n  color: #059669;\n  border-radius: 999px;\n  font-weight: 700;\n}\n\n.add-tab-btn {\n  padding: 2px 8px;\n  border: 1px dashed rgba(125, 125, 125, 0.4);\n  border-radius: 4px;\n  background: transparent;\n  cursor: pointer;\n  color: var(--primary);\n  margin-left: 4px;\n}\n.add-tab-btn:hover { background: rgba(79, 70, 229, 0.1); }\n\n.sheet-tab-rough-badge {\n  font-size: 9px;\n  padding: 1px 4px;\n  background: rgba(245, 158, 11, 0.2);\n  color: #d97706;\n  border-radius: 3px;\n  font-weight: 700;\n  text-transform: uppercase;\n}\n\n.tab-close-btn {\n  margin-left: 3px;\n  width: 15px;\n  height: 15px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted);\n  border-radius: 3px;\n  cursor: pointer;\n  font-size: 9.5px;\n  line-height: 1;\n  padding: 0;\n  transition: all 0.12s;\n\n  &:hover {\n    background: rgba(239, 68, 68, 0.18);\n    color: #ef4444;\n  }\n}\n\n.tab-edit-btn {\n  margin-left: 2px;\n  width: 15px;\n  height: 15px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted);\n  border-radius: 3px;\n  cursor: pointer;\n  padding: 0;\n  opacity: 0.5;\n  transition: all 0.12s;\n\n  &:hover {\n    opacity: 1;\n    background: rgba(59, 130, 246, 0.15);\n    color: var(--primary, #3b82f6);\n  }\n}\n\n.tab-inline-rename-input {\n  font-size: 11px;\n  font-weight: 600;\n  padding: 1px 5px;\n  height: 19px;\n  min-width: 70px;\n  max-width: 160px;\n  border: 1px solid var(--primary, #3b82f6);\n  border-radius: 3px;\n  background: var(--surface-card, #ffffff);\n  color: var(--text, #1e293b);\n  outline: none;\n  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);\n}\n\n.tab-context-menu {\n  position: fixed;\n  z-index: 9999;\n  background: var(--surface-card, #ffffff);\n  border: 1px solid var(--surface-border, rgba(125, 125, 125, 0.25));\n  border-radius: 6px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);\n  min-width: 175px;\n  padding: 4px;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.tab-context-menu-item {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 10px;\n  font-size: 11.5px;\n  font-weight: 500;\n  color: var(--text);\n  border-radius: 4px;\n  cursor: pointer;\n  user-select: none;\n  transition: background 0.12s;\n\n  i {\n    font-size: 12px;\n  }\n\n  &:hover {\n    background: rgba(125, 125, 125, 0.12);\n  }\n\n  &.text-danger:hover {\n    background: rgba(239, 68, 68, 0.12);\n  }\n}\n\n.bottom-status-subrow {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 3px 14px;\n  font-size: 11px;\n  color: var(--text-muted);\n}\n.zoom-controls {\n  display: flex;\n  align-items: center;\n  gap: 2px;\n  background: rgba(125, 125, 125, 0.08);\n  border: 1px solid var(--surface-border);\n  border-radius: 4px;\n  padding: 1px 4px;\n}\n.zoom-btn {\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  color: var(--text);\n  padding: 1px 5px;\n  font-size: 11px;\n}\n.zoom-display {\n  font-weight: 700;\n  cursor: pointer;\n  padding: 0 4px;\n}\n\n/* 7. FLOATING SYNC TOAST HUD */\n.sync-toast-hud {\n  position: fixed;\n  top: 50px;\n  right: 20px;\n  z-index: 2500;\n  min-width: 320px;\n  max-width: 440px;\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--surface-border);\n  border-radius: 8px;\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);\n  overflow: hidden;\n  animation: toastSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);\n  font-size: 11.5px;\n}\n@keyframes toastSlideIn {\n  from { opacity: 0; transform: translateY(-12px) scale(0.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n.sync-toast-header {\n  padding: 8px 12px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--surface-border);\n  background: rgba(125, 125, 125, 0.04);\n}\n.sync-toast-title {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-weight: 700;\n  font-size: 12px;\n}\n.sync-toast-close {\n  background: none;\n  border: none;\n  color: var(--text-muted);\n  cursor: pointer;\n  font-size: 12px;\n  padding: 2px 5px;\n  border-radius: 3px;\n}\n.sync-toast-close:hover {\n  background: rgba(125, 125, 125, 0.12);\n  color: var(--text);\n}\n.sync-toast-body {\n  padding: 10px 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.sync-toast-stats {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  flex-wrap: wrap;\n}\n.sync-badge-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 3px 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  font-weight: 600;\n}\n.chip-success {\n  background: var(--success-soft);\n  color: var(--success);\n}\n.chip-info {\n  background: var(--primary-soft);\n  color: var(--primary);\n}\n.chip-warning {\n  background: var(--warning-soft);\n  color: #b45309;\n}\n.chip-danger {\n  background: var(--danger-soft);\n  color: var(--danger);\n}\n.sync-toast-errors {\n  margin-top: 4px;\n  padding: 6px 8px;\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.2);\n  border-radius: 4px;\n  font-size: 10.5px;\n  color: #ef4444;\n  max-height: 140px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n}\n\n/* Last Sync Status in Bottom Bar */\n.last-sync-badge {\n  display: inline-flex;\n  align-items: center;\n  padding: 1px 7px;\n  background: rgba(16, 185, 129, 0.12);\n  color: #10b981;\n  border-radius: 4px;\n  font-weight: 600;\n  font-size: 10.5px;\n  border: 1px solid rgba(16, 185, 129, 0.25);\n\n  &.sync-error {\n    background: rgba(239, 68, 68, 0.12);\n    color: #ef4444;\n    border-color: rgba(239, 68, 68, 0.25);\n  }\n}\n\n/* Live Progress Bar inside Toast */\n.sync-progress-wrap {\n  width: 100%;\n}\n.sync-progress-track {\n  width: 100%;\n  height: 6px;\n  background: rgba(125, 125, 125, 0.2);\n  border-radius: 999px;\n  overflow: hidden;\n}\n.sync-progress-bar {\n  height: 100%;\n  background: linear-gradient(90deg, #3b82f6, #10b981);\n  border-radius: 999px;\n  transition: width 0.2s ease-in-out;\n}\n\n/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n * Instant Column Configuration Dropdown Menu (Replicating Legacy Studio)\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n::ng-deep .sutram-col-config-popover {\n  width: min(94vw, 760px) !important;\n  height: 520px !important;\n  max-height: calc(100vh - 80px) !important;\n  font-size: 11.5px;\n  border-radius: 8px !important;\n  overflow: hidden !important;\n  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1) !important;\n  border: 1px solid var(--surface-border, #e2e8f0) !important;\n  background: var(--surface, #ffffff) !important;\n  color: var(--text, #0f172a) !important;\n  display: flex !important;\n  flex-direction: column !important;\n\n  .p-overlaypanel-content {\n    padding: 0 !important;\n    background: transparent !important;\n    color: inherit !important;\n    width: 100% !important;\n    height: 100% !important;\n    display: flex !important;\n    flex-direction: column !important;\n    flex: 1 1 auto !important;\n    min-height: 0 !important;\n    overflow: hidden !important;\n  }\n}\n\n.col-dd-split-container {\n  display: flex;\n  flex-direction: row;\n  width: 100%;\n  flex: 1 1 0;\n  min-height: 0;\n  overflow: hidden;\n  background: var(--surface, #ffffff);\n}\n\n/* \u2500\u2500 LEFT PANE: VISIBILITY & GROUPS \u2500\u2500 */\n.col-dd-left-pane {\n  width: 325px;\n  min-width: 300px;\n  max-width: 340px;\n  border-right: 1px solid var(--surface-border, #e2e8f0);\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-height: 0;\n  background: var(--surface, #ffffff);\n  flex-shrink: 0;\n\n  .col-dd-header {\n    padding: 8px 10px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n    background: rgba(125, 125, 125, 0.03);\n    flex-shrink: 0 !important;\n  }\n\n  .col-dd-search-wrap {\n    position: relative;\n    display: flex;\n    align-items: center;\n\n    .col-dd-search-icon {\n      position: absolute;\n      left: 8px;\n      color: var(--text-muted, #64748b);\n      font-size: 11px;\n      pointer-events: none;\n    }\n\n    .col-dd-search-input {\n      width: 100%;\n      height: 28px;\n      padding: 4px 26px;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      border-radius: 4px;\n      font-size: 11.5px;\n      background: var(--bg, #f8fafc);\n      color: var(--text, #0f172a);\n      outline: none;\n      transition: border-color 0.12s;\n\n      &:focus {\n        border-color: var(--primary, #4f46e5);\n      }\n    }\n\n    .btn-clear-search-inline {\n      position: absolute;\n      right: 8px;\n      background: transparent;\n      border: none;\n      color: var(--text-muted, #64748b);\n      cursor: pointer;\n      font-size: 11px;\n      padding: 0;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n\n      &:hover {\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .col-dd-actions {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 0 2px;\n\n    .col-dd-actions-left {\n      display: flex;\n      gap: 4px;\n    }\n\n    .col-dd-act-btn {\n      padding: 2px 7px;\n      font-size: 10.5px;\n      font-weight: 600;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      background: var(--surface, #ffffff);\n      color: var(--text-muted, #64748b);\n      border-radius: 3px;\n      cursor: pointer;\n      transition: all 0.12s;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n        color: var(--text, #0f172a);\n      }\n    }\n\n    .col-dd-count {\n      font-size: 10.5px;\n      color: var(--text-muted, #64748b);\n      font-weight: 600;\n    }\n  }\n\n  .col-dd-body {\n    padding: 6px 8px;\n    overflow-y: auto !important;\n    overflow-x: hidden !important;\n    flex: 1 1 0 !important;\n    min-height: 0 !important;\n    display: flex;\n    flex-direction: column;\n    gap: 3px;\n    overscroll-behavior: contain;\n    scrollbar-width: thin;\n\n    &::-webkit-scrollbar {\n      width: 5px;\n    }\n    &::-webkit-scrollbar-track {\n      background: rgba(125, 125, 125, 0.05);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb {\n      background: rgba(125, 125, 125, 0.3);\n      border-radius: 3px;\n    }\n    &::-webkit-scrollbar-thumb:hover {\n      background: var(--primary, #4f46e5);\n    }\n  }\n\n  .col-dd-section-title {\n    font-size: 10px;\n    font-weight: 700;\n    color: var(--text-muted, #64748b);\n    margin: 4px 0 2px 4px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    flex-shrink: 0 !important;\n    display: flex;\n    align-items: center;\n\n    &.fx-section-title {\n      color: #7c3aed !important;\n      margin-top: 8px;\n    }\n  }\n\n  .col-dd-item {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    padding: 4px 6px;\n    border-radius: 4px;\n    cursor: pointer;\n    user-select: none;\n    transition: background 0.1s;\n    font-size: 11.5px;\n    color: var(--text, #0f172a);\n    flex-shrink: 0 !important;\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.08);\n    }\n\n    &.fx-item:hover {\n      background: rgba(139, 92, 246, 0.08) !important;\n    }\n\n    .col-dd-item-left {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n    .col-dd-item-name {\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n  }\n\n  .custom-check {\n    width: 14px;\n    height: 14px;\n    cursor: pointer;\n    accent-color: var(--primary, #4f46e5);\n    margin: 0;\n    flex-shrink: 0;\n  }\n\n  .badge-fx-mini {\n    font-size: 8.5px;\n    font-weight: 700;\n    padding: 1px 4px;\n    border-radius: 3px;\n    background: rgba(139, 92, 246, 0.15);\n    color: #7c3aed;\n    flex-shrink: 0;\n  }\n\n  .type-badge {\n    font-size: 9.5px;\n    padding: 1px 5px;\n    border-radius: 3px;\n    background: rgba(125, 125, 125, 0.12);\n    color: var(--text-muted, #64748b);\n    font-family: 'JetBrains Mono', monospace;\n    flex-shrink: 0;\n\n    &.badge-fx-type {\n      background: rgba(139, 92, 246, 0.12) !important;\n      color: #7c3aed !important;\n    }\n  }\n\n  /* FK Grouping */\n  .col-dd-group {\n    border: 1px solid var(--surface-border, #e2e8f0);\n    border-radius: 5px;\n    margin: 3px 0;\n    overflow: hidden;\n    background: rgba(125, 125, 125, 0.02);\n    flex-shrink: 0 !important;\n\n    &.fk-active-group {\n      border-color: rgba(79, 70, 229, 0.35);\n    }\n\n    .col-dd-group-header {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      padding: 5px 8px;\n      background: rgba(125, 125, 125, 0.06);\n      cursor: pointer;\n      user-select: none;\n      font-size: 11.5px;\n      font-weight: 600;\n      flex-shrink: 0 !important;\n      min-height: 28px !important;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n      }\n\n      .col-dd-group-left {\n        display: flex;\n        align-items: center;\n        gap: 6px;\n        overflow: hidden;\n      }\n\n      .fk-expand-toggle {\n        font-size: 10px;\n        color: var(--text-muted, #64748b);\n        width: 12px;\n        text-align: center;\n        transition: transform 0.18s ease;\n\n        &.rotated {\n          transform: rotate(90deg);\n        }\n      }\n\n      .fk-group-pill {\n        font-size: 9.5px;\n        padding: 1px 5px;\n        border-radius: 999px;\n        font-weight: 600;\n      }\n    }\n\n    .col-dd-group-items {\n      padding: 3px 4px 4px 18px;\n      background: var(--surface, #ffffff);\n      border-top: 1px solid var(--surface-border, #e2e8f0);\n      display: flex;\n      flex-direction: column;\n      gap: 2px;\n      max-height: none !important;\n      overflow: visible !important;\n    }\n  }\n\n  .col-dd-empty {\n    padding: 16px;\n    text-align: center;\n    color: var(--text-muted, #64748b);\n    font-size: 11.5px;\n  }\n}\n\n/* \u2500\u2500 RIGHT PANE: ORDER & FORMATTING \u2500\u2500 */\n.col-dd-right-pane {\n  flex: 1 1 0;\n  min-width: 350px;\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  min-height: 0;\n  background: var(--surface-ground, rgba(125, 125, 125, 0.02));\n\n  .col-dd-right-header {\n    padding: 8px 12px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    background: var(--surface, #ffffff);\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n    flex-shrink: 0;\n\n    .col-dd-right-title-wrap {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n\n      .col-dd-right-title {\n        font-size: 11.5px;\n        font-weight: 700;\n        color: var(--text, #0f172a);\n        display: flex;\n        align-items: center;\n      }\n\n      .col-dd-right-badge {\n        font-size: 10px;\n        font-weight: 600;\n        padding: 2px 7px;\n        border-radius: 999px;\n        background: rgba(79, 70, 229, 0.12);\n        color: var(--primary, #4f46e5);\n      }\n    }\n\n    .col-dd-right-sub {\n      font-size: 10px;\n      color: var(--text-muted, #64748b);\n    }\n  }\n\n  .col-dd-right-body {\n    padding: 8px 10px;\n    overflow-y: auto !important;\n    overflow-x: hidden !important;\n    flex: 1 1 0;\n    min-height: 0;\n    display: flex;\n    flex-direction: column;\n    gap: 5px;\n    scrollbar-width: thin;\n\n    &::-webkit-scrollbar {\n      width: 5px;\n    }\n    &::-webkit-scrollbar-thumb {\n      background: rgba(125, 125, 125, 0.3);\n      border-radius: 3px;\n    }\n  }\n\n  .col-dd-empty {\n    padding: 20px;\n    text-align: center;\n    color: var(--text-muted, #64748b);\n    font-size: 11.5px;\n  }\n}\n\n/* \u2500\u2500 SELECTED COLUMN CARD IN RIGHT PANE \u2500\u2500 */\n.col-selected-card {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 5px 8px;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 6px;\n  transition: all 0.15s ease;\n  flex-shrink: 0;\n\n  &:hover {\n    border-color: rgba(79, 70, 229, 0.4);\n    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);\n  }\n\n  /* 1. Left order & buttons */\n  .col-card-order-controls {\n    display: flex;\n    align-items: center;\n    gap: 4px;\n    flex-shrink: 0;\n\n    .col-card-letter-badge {\n      width: 22px;\n      height: 22px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      background: rgba(125, 125, 125, 0.1);\n      color: var(--text, #0f172a);\n      border-radius: 4px;\n      font-size: 11px;\n      font-weight: 700;\n      font-family: monospace;\n    }\n\n    .col-card-arrows {\n      display: flex;\n      flex-direction: column;\n      gap: 1px;\n\n      .btn-arrow {\n        width: 16px;\n        height: 11px;\n        padding: 0;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        background: transparent;\n        border: 1px solid var(--surface-border, #e2e8f0);\n        border-radius: 2px;\n        color: var(--text-muted, #64748b);\n        cursor: pointer;\n        font-size: 7px;\n        transition: all 0.1s;\n\n        &:hover:not(:disabled) {\n          background: var(--primary, #4f46e5);\n          border-color: var(--primary, #4f46e5);\n          color: #ffffff;\n        }\n\n        &:disabled {\n          opacity: 0.3;\n          cursor: default;\n        }\n      }\n    }\n  }\n\n  /* 2. Middle column meta & label */\n  .col-card-meta {\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n    flex: 1 1 0;\n    min-width: 0;\n\n    .col-card-meta-top {\n      display: flex;\n      align-items: center;\n      gap: 4px;\n      overflow: hidden;\n\n      .col-card-key-txt {\n        font-size: 11px;\n        font-weight: 600;\n        color: var(--text, #0f172a);\n        overflow: hidden;\n        text-overflow: ellipsis;\n        white-space: nowrap;\n      }\n\n      .badge-fx-mini {\n        font-size: 8.5px;\n        font-weight: 700;\n        padding: 0 4px;\n        border-radius: 3px;\n        background: rgba(139, 92, 246, 0.15);\n        color: #7c3aed;\n        flex-shrink: 0;\n      }\n\n      .badge-fk-pill {\n        font-size: 8.5px;\n        padding: 0 4px;\n        border-radius: 3px;\n        background: rgba(59, 130, 246, 0.12);\n        color: #2563eb;\n        font-weight: 600;\n        flex-shrink: 0;\n      }\n      .badge-sub-pill {\n        font-size: 8.5px;\n        padding: 0 4px;\n        border-radius: 3px;\n        background: rgba(16, 185, 129, 0.12);\n        color: #059669;\n        font-weight: 600;\n        flex-shrink: 0;\n      }\n      .badge-raw-pill {\n        font-size: 8.5px;\n        padding: 0 4px;\n        border-radius: 3px;\n        background: rgba(245, 158, 11, 0.12);\n        color: #d97706;\n        font-weight: 600;\n        flex-shrink: 0;\n      }\n      .badge-std-pill {\n        font-size: 8.5px;\n        padding: 0 4px;\n        border-radius: 3px;\n        background: rgba(125, 125, 125, 0.1);\n        color: var(--text-muted, #64748b);\n        font-family: monospace;\n        flex-shrink: 0;\n      }\n    }\n\n    .col-card-label-wrap {\n      display: flex;\n\n      .col-card-label-inp {\n        width: 100%;\n        height: 22px;\n        padding: 2px 6px;\n        font-size: 10.5px;\n        border: 1px solid var(--surface-border, #e2e8f0);\n        border-radius: 3px;\n        background: var(--bg, #f8fafc);\n        color: var(--text, #0f172a);\n        outline: none;\n        transition: border-color 0.12s;\n\n        &:focus {\n          border-color: var(--primary, #4f46e5);\n          background: var(--surface, #ffffff);\n        }\n      }\n    }\n  }\n\n  /* 3. Right format selector & hide button */\n  .col-card-format-ctrls {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    flex-shrink: 0;\n\n    .col-card-select-wrap {\n      .col-card-select {\n        height: 24px;\n        font-size: 10px;\n        padding: 2px 4px;\n        border: 1px solid var(--surface-border, #e2e8f0);\n        border-radius: 4px;\n        background: var(--surface, #ffffff);\n        color: var(--text, #0f172a);\n        outline: none;\n        cursor: pointer;\n        max-width: 125px;\n\n        &:focus {\n          border-color: var(--primary, #4f46e5);\n        }\n      }\n    }\n\n    .col-card-plain-type {\n      min-width: 75px;\n      text-align: center;\n\n      .text-purple-xs {\n        font-size: 9.5px;\n        font-weight: 600;\n        color: #7c3aed;\n      }\n      .text-muted-xs {\n        font-size: 9.5px;\n        color: var(--text-muted, #64748b);\n      }\n    }\n\n    .btn-col-hide {\n      width: 22px;\n      height: 22px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      background: transparent;\n      border: 1px solid transparent;\n      border-radius: 4px;\n      color: var(--text-muted, #64748b);\n      cursor: pointer;\n      font-size: 11px;\n      transition: all 0.12s;\n\n      &:hover {\n        background: rgba(239, 68, 68, 0.1);\n        border-color: rgba(239, 68, 68, 0.2);\n        color: #ef4444;\n      }\n    }\n  }\n}\n\n/* \u2500\u2500 OVERALL POPOVER FOOTER \u2500\u2500 */\n.col-dd-footer {\n  padding: 6px 12px;\n  border-top: 1px solid var(--surface-border, #e2e8f0);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  background: var(--surface, #ffffff);\n  flex-shrink: 0 !important;\n}\n\n/* Active Sheet Context Badge Pill */\n.active-sheet-badge-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  padding: 4px 10px;\n  border-radius: 6px;\n  background: rgba(99, 102, 241, 0.12);\n  border: 1px solid rgba(99, 102, 241, 0.3);\n  color: #4f46e5;\n  font-size: 11px;\n  font-weight: 600;\n  white-space: nowrap;\n  max-width: 170px;\n\n  i {\n    font-size: 11px;\n  }\n\n  .sheet-title-text {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n}\n\n:host-context(.dark-theme) .active-sheet-badge-pill,\n:host-context(.dark-mode) .active-sheet-badge-pill {\n  background: rgba(99, 102, 241, 0.22);\n  border-color: rgba(99, 102, 241, 0.45);\n  color: #818cf8;\n}\n\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n/* \u2500\u2500 SUTRAM STUDIO MODALS & DIALOGS (Compact Excel Scaling) \u2500\u2500\u2500\u2500\u2500\u2500 */\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\n\n::ng-deep .sutram-studio-dialog {\n  .p-dialog-header {\n    background: var(--surface, #ffffff);\n    color: var(--text, #0f172a);\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    padding: 8px 12px !important;\n    font-size: 12px !important;\n    font-weight: 700;\n\n    .p-dialog-title {\n      font-size: 12px !important;\n      font-weight: 700;\n      display: flex;\n      align-items: center;\n      gap: 6px;\n    }\n\n    .p-dialog-header-icon {\n      width: 22px !important;\n      height: 22px !important;\n      font-size: 11px !important;\n      border-radius: 4px;\n      color: var(--text-muted, #64748b);\n      &:hover {\n        background: var(--surface-hover, rgba(0,0,0,0.05));\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .p-dialog-content {\n    background: var(--surface-ground, #f8fafc);\n    color: var(--text, #0f172a);\n    padding: 10px 12px !important;\n    overflow-y: auto;\n    font-size: 11.5px;\n  }\n\n  .p-dialog-footer {\n    background: var(--surface, #ffffff);\n    border-top: 1px solid var(--surface-border, #e2e8f0);\n    padding: 7px 12px !important;\n  }\n}\n\n.dialog-body-wrap {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.dialog-subtext {\n  font-size: 11px;\n  color: var(--text-muted, #64748b);\n  line-height: 1.35;\n}\n\n.dialog-info-banner {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 6px 10px;\n  font-size: 11px;\n  border-radius: 5px;\n  line-height: 1.3;\n\n  &.info {\n    background: rgba(59, 130, 246, 0.08);\n    border: 1px solid rgba(59, 130, 246, 0.2);\n    color: var(--text, #0f172a);\n    .banner-icon { color: #2563eb; }\n  }\n\n  &.warning {\n    background: rgba(245, 158, 11, 0.08);\n    border: 1px solid rgba(245, 158, 11, 0.25);\n    color: var(--text, #0f172a);\n    .banner-icon { color: #d97706; }\n  }\n\n  .banner-icon {\n    font-size: 12px;\n    flex-shrink: 0;\n  }\n}\n\n.dialog-subcard {\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 6px;\n  padding: 8px 10px;\n}\n\n.subcard-title {\n  font-size: 11px;\n  font-weight: 700;\n  color: var(--text, #0f172a);\n  margin-bottom: 6px;\n}\n\n.subcard-grid {\n  display: flex;\n  align-items: flex-end;\n  gap: 8px;\n  flex-wrap: wrap;\n\n  .subcard-col-2 { width: calc(16.66% - 7px); }\n  .subcard-col-3 { width: calc(25% - 6px); }\n  .subcard-col-4 { width: calc(33.33% - 6px); }\n  .subcard-col-5 { width: calc(41.66% - 5px); }\n  .subcard-col-6 { width: calc(50% - 4px); }\n  .subcard-col-7 { width: calc(58.33% - 4px); }\n}\n\n.dialog-label {\n  font-size: 10px;\n  font-weight: 700;\n  color: var(--text-muted, #64748b);\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n  margin-bottom: 3px;\n  display: block;\n}\n\n.dialog-ctrl-input {\n  height: 26px !important;\n  font-size: 11.5px !important;\n  padding: 2px 7px !important;\n  border-radius: 4px !important;\n  width: 100% !important;\n}\n\n.dialog-ctrl-textarea {\n  width: 100%;\n  padding: 5px 8px;\n  font-size: 11px;\n  line-height: 1.4;\n  border-radius: 4px;\n  border: 1px solid var(--surface-border, #cbd5e1);\n  background: var(--surface, #ffffff);\n  color: var(--text, #0f172a);\n  resize: vertical;\n\n  &:focus {\n    outline: none;\n    border-color: #3b82f6;\n  }\n}\n\n::ng-deep .dialog-ctrl-dropdown {\n  height: 26px !important;\n  font-size: 11.5px !important;\n  width: 100% !important;\n\n  .p-dropdown-label {\n    padding: 2px 7px !important;\n    font-size: 11.5px !important;\n    line-height: 22px !important;\n  }\n  .p-dropdown-trigger {\n    width: 22px !important;\n  }\n}\n\n.dialog-btn-add {\n  height: 26px !important;\n  font-size: 11px !important;\n  padding: 0 10px !important;\n  border-radius: 4px !important;\n}\n\n.chips-row {\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-top: 5px;\n}\n\n.chips-label {\n  font-size: 10px;\n  color: var(--text-muted, #64748b);\n  font-weight: 600;\n}\n\n.quick-chip {\n  font-size: 9.5px;\n  font-family: var(--font-mono, monospace);\n  padding: 1px 6px;\n  border-radius: 3px;\n  background: var(--surface-ground, #f1f5f9);\n  color: var(--text, #0f172a);\n  border: 1px solid var(--surface-border, #cbd5e1);\n  cursor: pointer;\n  user-select: none;\n  transition: all 0.15s ease;\n\n  &:hover {\n    background: #e2e8f0;\n    border-color: #94a3b8;\n  }\n\n  &.chip-green {\n    background: rgba(16, 185, 129, 0.08);\n    color: #059669;\n    border-color: rgba(16, 185, 129, 0.25);\n    &:hover { background: rgba(16, 185, 129, 0.18); }\n  }\n\n  &.chip-orange {\n    background: rgba(245, 158, 11, 0.08);\n    color: #d97706;\n    border-color: rgba(245, 158, 11, 0.25);\n    &:hover { background: rgba(245, 158, 11, 0.18); }\n  }\n\n  &.chip-blue {\n    background: rgba(59, 130, 246, 0.08);\n    color: #2563eb;\n    border-color: rgba(59, 130, 246, 0.25);\n    &:hover { background: rgba(59, 130, 246, 0.18); }\n  }\n}\n\n.dialog-table-card {\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 5px;\n  overflow: hidden;\n  max-height: 58vh;\n  overflow-y: auto;\n}\n\n.dialog-data-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 11.5px;\n\n  thead tr {\n    position: sticky;\n    top: 0;\n    z-index: 2;\n  }\n\n  th {\n    font-size: 10px;\n    font-weight: 700;\n    text-transform: uppercase;\n    letter-spacing: 0.3px;\n    padding: 5px 8px;\n    background: var(--surface-ground, #f8fafc);\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    color: var(--text-muted, #64748b);\n  }\n\n  td {\n    padding: 4px 8px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    vertical-align: middle;\n    color: var(--text, #0f172a);\n  }\n\n  tr:hover td {\n    background: var(--surface-hover, rgba(0,0,0,0.02));\n  }\n}\n\n.col-idx {\n  font-size: 10px;\n}\n\n.col-ident-cell {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n}\n\n.col-name-txt {\n  font-family: var(--font-mono, monospace);\n  font-weight: 600;\n  font-size: 11.5px;\n}\n\n.type-pill {\n  font-size: 9px;\n  font-weight: 600;\n  font-family: var(--font-mono, monospace);\n  padding: 1px 5px;\n  border-radius: 3px;\n  background: rgba(59, 130, 246, 0.08);\n  color: #2563eb;\n  border: 1px solid rgba(59, 130, 246, 0.2);\n  text-transform: lowercase;\n}\n\n.pk-pill {\n  font-size: 8.5px;\n  font-weight: 700;\n  font-family: var(--font-mono, monospace);\n  padding: 1px 4px;\n  border-radius: 3px;\n  background: rgba(245, 158, 11, 0.12);\n  color: #d97706;\n  border: 1px solid rgba(245, 158, 11, 0.25);\n}\n\n.event-pill {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 9.5px;\n  font-weight: 700;\n  font-family: var(--font-mono, monospace);\n  padding: 1px 6px;\n  border-radius: 3px;\n\n  &.event-pill-insert {\n    background: rgba(16, 185, 129, 0.1);\n    color: #059669;\n    border: 1px solid rgba(16, 185, 129, 0.25);\n  }\n  &.event-pill-update {\n    background: rgba(59, 130, 246, 0.1);\n    color: #2563eb;\n    border: 1px solid rgba(59, 130, 246, 0.25);\n  }\n  &.event-pill-delete {\n    background: rgba(239, 68, 68, 0.1);\n    color: #dc2626;\n    border: 1px solid rgba(239, 68, 68, 0.25);\n  }\n}\n\n.dialog-table-input {\n  height: 24px !important;\n  font-size: 11.5px !important;\n  padding: 2px 7px !important;\n  border-radius: 3px !important;\n  width: 100% !important;\n}\n\n::ng-deep .dialog-table-dropdown {\n  height: 24px !important;\n  font-size: 11.5px !important;\n  width: 100% !important;\n\n  .p-dropdown-label {\n    padding: 1px 6px !important;\n    font-size: 11.5px !important;\n    line-height: 22px !important;\n  }\n  .p-dropdown-trigger {\n    width: 20px !important;\n  }\n}\n\n.text-muted-xs {\n  font-size: 10.5px;\n  color: var(--text-muted, #64748b);\n}\n\n.btn-group-mini {\n  display: inline-flex;\n  gap: 2px;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 4px;\n  padding: 1px;\n}\n\n.mini-icon-btn {\n  width: 20px;\n  height: 18px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: none;\n  background: transparent;\n  color: var(--text-muted, #64748b);\n  border-radius: 2px;\n  cursor: pointer;\n  padding: 0;\n\n  &:hover:not(:disabled) {\n    background: var(--surface-hover, rgba(0,0,0,0.06));\n    color: var(--text, #0f172a);\n  }\n  &:disabled {\n    opacity: 0.3;\n    cursor: default;\n  }\n  i {\n    font-size: 9px;\n  }\n}\n\n.mini-del-btn {\n  width: 22px;\n  height: 20px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: 1px solid rgba(239, 68, 68, 0.25);\n  background: rgba(239, 68, 68, 0.05);\n  color: #dc2626;\n  border-radius: 3px;\n  cursor: pointer;\n  padding: 0;\n\n  &:hover {\n    background: rgba(239, 68, 68, 0.15);\n  }\n  i {\n    font-size: 10px;\n  }\n}\n\n.formula-cell {\n  font-size: 11px;\n  font-weight: 600;\n}\n\n.trigger-code-snippet {\n  background: var(--surface-ground, #f1f5f9);\n  padding: 2px 5px;\n  border-radius: 3px;\n  font-size: 10.5px;\n  color: var(--text, #0f172a);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  white-space: pre-wrap;\n  word-break: break-all;\n}\n\n.dialog-empty-box {\n  text-align: center;\n  color: var(--text-muted, #64748b);\n  padding: 14px 10px;\n  font-size: 11px;\n  border: 1px dashed var(--surface-border, #cbd5e1);\n  border-radius: 5px;\n}\n\n.dialog-footer-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 6px;\n}\n\n.dialog-btn-cancel {\n  height: 26px !important;\n  font-size: 11.5px !important;\n  padding: 0 10px !important;\n}\n\n.dialog-btn-save {\n  height: 26px !important;\n  font-size: 11.5px !important;\n  padding: 0 12px !important;\n}\n\n/* \u2500\u2500 Role & User Management Styling \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.user-role-badge-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  background: var(--surface-card, rgba(0, 0, 0, 0.04));\n  border: 1px solid var(--surface-border, #e2e8f0);\n  padding: 2px 8px;\n  border-radius: 12px;\n  cursor: pointer;\n  font-size: 11px;\n  font-weight: 600;\n  color: var(--text, #1e293b);\n  user-select: none;\n  transition: all 0.15s ease;\n\n  &:hover {\n    background: var(--surface-hover, rgba(0, 0, 0, 0.08));\n    border-color: var(--primary-color, #6366f1);\n  }\n\n  .user-name-txt {\n    font-size: 11px;\n    font-weight: 700;\n    font-family: monospace;\n  }\n}\n\n.role-pill-tag {\n  font-size: 9.5px;\n  font-weight: 700;\n  padding: 1px 6px;\n  border-radius: 999px;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n\n  &.admin-tag {\n    background: rgba(168, 85, 247, 0.15);\n    color: #9333ea;\n    border: 1px solid rgba(168, 85, 247, 0.3);\n  }\n\n  &.author-tag {\n    background: rgba(16, 185, 129, 0.15);\n    color: #059669;\n    border: 1px solid rgba(16, 185, 129, 0.3);\n  }\n}\n\n.dark-mode {\n  .role-pill-tag {\n    &.admin-tag {\n      background: rgba(168, 85, 247, 0.25);\n      color: #c084fc;\n    }\n    &.author-tag {\n      background: rgba(16, 185, 129, 0.25);\n      color: #34d399;\n    }\n  }\n}\n\n.btn-disabled-role {\n  opacity: 0.55 !important;\n  cursor: not-allowed !important;\n  filter: grayscale(0.5);\n}\n\n.btn-role-switch {\n  background: transparent;\n  border: 1px solid var(--surface-border, #cbd5e1);\n  border-radius: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 2px 8px;\n  color: var(--text-muted, #64748b);\n  cursor: pointer;\n  transition: all 0.15s ease;\n\n  &:hover {\n    color: var(--text, #0f172a);\n    border-color: var(--text, #0f172a);\n  }\n\n  &.active-role {\n    background: var(--primary-color, #6366f1);\n    color: #ffffff !important;\n    border-color: var(--primary-color, #6366f1);\n  }\n}\n\n.badge-current-user {\n  font-size: 9px;\n  font-weight: 700;\n  background: rgba(59, 130, 246, 0.15);\n  color: #2563eb;\n  padding: 1px 4px;\n  border-radius: 3px;\n}\n\n.status-pill {\n  font-size: 10px;\n  font-weight: 600;\n  padding: 1px 6px;\n  border-radius: 4px;\n\n  &.active-pill {\n    background: rgba(16, 185, 129, 0.15);\n    color: #059669;\n  }\n\n  &.inactive-pill {\n    background: rgba(100, 116, 139, 0.15);\n    color: #64748b;\n  }\n}\n\n.btn-use-account {\n  font-size: 10.5px;\n  font-weight: 600;\n  padding: 2px 6px;\n  border-radius: 4px;\n  border: 1px solid var(--surface-border, #cbd5e1);\n  background: var(--surface, #ffffff);\n  color: var(--text, #0f172a);\n  cursor: pointer;\n  transition: all 0.15s;\n\n  &:hover {\n    background: var(--surface-hover, rgba(0, 0, 0, 0.05));\n    border-color: var(--primary-color, #6366f1);\n  }\n\n  &.btn-use-account-active {\n    background: rgba(16, 185, 129, 0.15);\n    color: #059669;\n    border-color: rgba(16, 185, 129, 0.4);\n    cursor: default;\n  }\n}\n\n.btn-link-mini {\n  background: none;\n  border: none;\n  font-size: 11px;\n  cursor: pointer;\n  text-decoration: underline;\n  padding: 0;\n}\n\n\n\n\n\n"] }]
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
        }], reportsList: [{
            type: Input
        }], onStudioGlobalClick: [{
            type: HostListener,
            args: ['document:click', ['$event']]
        }], onStudioGlobalKeydown: [{
            type: HostListener,
            args: ['document:keydown', ['$event']]
        }] }); })();
