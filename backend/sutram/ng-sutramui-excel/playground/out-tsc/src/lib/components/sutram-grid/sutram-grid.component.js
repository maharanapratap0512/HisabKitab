/**
 * sutram-grid.component.ts
 * ─────────────────────────────────────────────────────────────
 * Interactive PrimeNG Virtual Table Component for Excel Editing.
 * Supports in-cell FK dropdown autocomplete, bilingual search,
 * cell modification tracking (eye-protect mode), new row highlighting,
 * and inline batch mistake resolution prompts.
 * ─────────────────────────────────────────────────────────────
 */
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { cleanString } from '../../utils/normalization.utils';
import * as i0 from "@angular/core";
import * as i1 from "../../services/sutram-excel-state.service";
import * as i2 from "../../services/sutram-clipboard.service";
import * as i3 from "../../services/sutram-audit.service";
import * as i4 from "../../services/sutram-ref-cache.service";
import * as i5 from "@angular/common";
import * as i6 from "@angular/forms";
import * as i7 from "primeng/table";
import * as i8 from "primeng/api";
import * as i9 from "primeng/inputtext";
import * as i10 from "primeng/contextmenu";
import * as i11 from "primeng/autocomplete";
import * as i12 from "primeng/overlaypanel";
function SutramGridComponent_ng_template_5_div_0_button_10_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 36);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_button_10_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r12); const ctx_r11 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r11.filterChecklistSearch = ""); });
    i0.ɵɵelement(1, "i", 17);
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_5_div_0_div_19_span_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 43);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(item_r13.code);
} }
function SutramGridComponent_ng_template_5_div_0_div_19_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 44);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(item_r13.count);
} }
function SutramGridComponent_ng_template_5_div_0_div_19_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 37);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_div_19_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r19); const item_r13 = restoredCtx.$implicit; const ctx_r18 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r18.toggleChecklistItem(item_r13.value)); });
    i0.ɵɵelementStart(1, "div", 38)(2, "input", 39);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_div_19_Template_input_click_2_listener($event) { return $event.stopPropagation(); })("change", function SutramGridComponent_ng_template_5_div_0_div_19_Template_input_change_2_listener() { const restoredCtx = i0.ɵɵrestoreView(_r19); const item_r13 = restoredCtx.$implicit; const ctx_r21 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r21.toggleChecklistItem(item_r13.value)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 40);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(5, SutramGridComponent_ng_template_5_div_0_div_19_span_5_Template, 2, 1, "span", 41);
    i0.ɵɵtemplate(6, SutramGridComponent_ng_template_5_div_0_div_19_span_6_Template, 2, 1, "span", 42);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r13 = ctx.$implicit;
    const ctx_r9 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r9.selectedChecklistValues.has(item_r13.value));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("title", item_r13.display);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", item_r13.display, " ");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", item_r13.code);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", item_r13.count !== undefined && item_r13.count > 0);
} }
function SutramGridComponent_ng_template_5_div_0_div_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 45);
    i0.ɵɵtext(1, " No values found ");
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_5_div_0_Template(rf, ctx) { if (rf & 1) {
    const _r23 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12)(1, "div", 13)(2, "span", 14);
    i0.ɵɵelement(3, "i", 15);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 16);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r23); i0.ɵɵnextContext(2); const _r1 = i0.ɵɵreference(4); return i0.ɵɵresetView(_r1.hide()); });
    i0.ɵɵelement(6, "i", 17);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 18);
    i0.ɵɵelement(8, "i", 19);
    i0.ɵɵelementStart(9, "input", 20);
    i0.ɵɵlistener("ngModelChange", function SutramGridComponent_ng_template_5_div_0_Template_input_ngModelChange_9_listener($event) { i0.ɵɵrestoreView(_r23); const ctx_r24 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r24.filterChecklistSearch = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(10, SutramGridComponent_ng_template_5_div_0_button_10_Template, 2, 0, "button", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "div", 22)(12, "div", 23)(13, "input", 24);
    i0.ɵɵlistener("change", function SutramGridComponent_ng_template_5_div_0_Template_input_change_13_listener($event) { i0.ɵɵrestoreView(_r23); const ctx_r25 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r25.toggleSelectAllChecklist($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "label", 25);
    i0.ɵɵtext(15, " (Select All) ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "span", 26);
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "div", 27);
    i0.ɵɵtemplate(19, SutramGridComponent_ng_template_5_div_0_div_19_Template, 7, 5, "div", 28);
    i0.ɵɵtemplate(20, SutramGridComponent_ng_template_5_div_0_div_20_Template, 2, 0, "div", 29);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(21, "div", 30);
    i0.ɵɵelementStart(22, "div", 31)(23, "button", 32);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_Template_button_click_23_listener() { i0.ɵɵrestoreView(_r23); const ctx_r26 = i0.ɵɵnextContext(2); const _r1 = i0.ɵɵreference(4); return i0.ɵɵresetView(ctx_r26.clearCurrentColFilter(_r1)); });
    i0.ɵɵtext(24, " Clear ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "div", 33)(26, "button", 34);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_Template_button_click_26_listener() { i0.ɵɵrestoreView(_r23); i0.ɵɵnextContext(2); const _r1 = i0.ɵɵreference(4); return i0.ɵɵresetView(_r1.hide()); });
    i0.ɵɵtext(27, " Cancel ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "button", 35);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_Template_button_click_28_listener() { i0.ɵɵrestoreView(_r23); const ctx_r28 = i0.ɵɵnextContext(2); const _r1 = i0.ɵɵreference(4); return i0.ɵɵresetView(ctx_r28.applyCurrentColFilter(_r1)); });
    i0.ɵɵtext(29, " Apply ");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r7 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r7.activeFilterCol.name, " Filter ");
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngModel", ctx_r7.filterChecklistSearch);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r7.filterChecklistSearch);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r7.isAllChecklistSelected());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2(" ", ctx_r7.selectedChecklistValues.size, " / ", ctx_r7.currentChecklistItems.length, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r7.filteredChecklistItems);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r7.filteredChecklistItems.length === 0);
} }
function SutramGridComponent_ng_template_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, SutramGridComponent_ng_template_5_div_0_Template, 30, 8, "div", 11);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ngIf", ctx_r2.activeFilterCol);
} }
function SutramGridComponent_ng_template_7_th_4_span_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 60);
    i0.ɵɵtext(1, "*");
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_7_th_4_span_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 61);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r31 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("title", col_r31.ref_table || col_r31.name);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", col_r31.ref_table || col_r31.name, " ");
} }
function SutramGridComponent_ng_template_7_th_4_span_10_Template(rf, ctx) { if (rf & 1) {
    const _r40 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 62);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_7_th_4_span_10_Template_span_click_0_listener() { i0.ɵɵrestoreView(_r40); const col_r31 = i0.ɵɵnextContext().$implicit; const ctx_r38 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r38.onHeaderClick(col_r31)); });
    i0.ɵɵelement(1, "i", 63);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r31 = i0.ɵɵnextContext().$implicit;
    const ctx_r35 = i0.ɵɵnextContext(2);
    let tmp_0_0;
    let tmp_1_0;
    let tmp_2_0;
    i0.ɵɵclassProp("is-sorted", ((tmp_0_0 = ctx_r35.state.activeSort()) == null ? null : tmp_0_0.colKey) === col_r31.name);
    i0.ɵɵproperty("title", ((tmp_1_0 = ctx_r35.state.activeSort()) == null ? null : tmp_1_0.colKey) === col_r31.name ? ((tmp_1_0 = ctx_r35.state.activeSort()) == null ? null : tmp_1_0.order) === "ASC" ? "Sorted: ASC" : "Sorted: DESC" : "Sort");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ((tmp_2_0 = ctx_r35.state.activeSort()) == null ? null : tmp_2_0.colKey) === col_r31.name ? ((tmp_2_0 = ctx_r35.state.activeSort()) == null ? null : tmp_2_0.order) === "ASC" ? "pi-sort-amount-up-alt text-primary" : "pi-sort-amount-down text-primary" : "pi-sort-alt text-muted");
} }
function SutramGridComponent_ng_template_7_th_4_span_11_Template(rf, ctx) { if (rf & 1) {
    const _r44 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 64);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_7_th_4_span_11_Template_span_click_0_listener($event) { i0.ɵɵrestoreView(_r44); const col_r31 = i0.ɵɵnextContext().$implicit; const ctx_r42 = i0.ɵɵnextContext(2); const _r1 = i0.ɵɵreference(4); return i0.ɵɵresetView(ctx_r42.openColumnFilter($event, col_r31, _r1)); });
    i0.ɵɵelement(1, "i", 63);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r31 = i0.ɵɵnextContext().$implicit;
    const ctx_r36 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("is-filtered", ctx_r36.isColumnFiltered(col_r31.name));
    i0.ɵɵproperty("title", ctx_r36.isColumnFiltered(col_r31.name) ? "Filter Active" : "Filter");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ctx_r36.isColumnFiltered(col_r31.name) ? "pi-filter-fill text-primary" : "pi-filter");
} }
function SutramGridComponent_ng_template_7_th_4_Template(rf, ctx) { if (rf & 1) {
    const _r47 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "th", 50);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_7_th_4_Template_th_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r47); const col_r31 = restoredCtx.$implicit; const ctx_r46 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r46.onHeaderClick(col_r31)); });
    i0.ɵɵelementStart(1, "div", 51)(2, "span", 52)(3, "strong", 53);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 54);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, SutramGridComponent_ng_template_7_th_4_span_7_Template, 2, 0, "span", 55);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 56);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_7_th_4_Template_div_click_8_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵtemplate(9, SutramGridComponent_ng_template_7_th_4_span_9_Template, 2, 2, "span", 57);
    i0.ɵɵtemplate(10, SutramGridComponent_ng_template_7_th_4_span_10_Template, 2, 4, "span", 58);
    i0.ɵɵtemplate(11, SutramGridComponent_ng_template_7_th_4_span_11_Template, 2, 4, "span", 59);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const col_r31 = ctx.$implicit;
    const idx_r32 = ctx.index;
    const ctx_r30 = i0.ɵɵnextContext(2);
    i0.ɵɵstyleProp("width", ctx_r30.getColumnWidth(col_r31), "px")("min-width", ctx_r30.getColumnWidth(col_r31), "px")("max-width", ctx_r30.getColumnWidth(col_r31), "px");
    i0.ɵɵclassProp("sortable-th", ctx_r30.state.sortingEnabled());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("title", col_r31.description || col_r31.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r30.getColLetter(idx_r32));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(col_r31.name);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r31.not_null);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", col_r31.type === "ref" || col_r31.ref_table);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r30.state.sortingEnabled());
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r30.state.filtersEnabled());
} }
function SutramGridComponent_ng_template_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "th", 46)(2, "div", 47);
    i0.ɵɵelement(3, "i", 48);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(4, SutramGridComponent_ng_template_7_th_4_Template, 12, 15, "th", 49);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const columns_r29 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngForOf", columns_r29);
} }
function SutramGridComponent_ng_template_8_span_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 71);
    i0.ɵɵtext(1, "+");
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_8_span_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 72);
    i0.ɵɵtext(1, "\u2022");
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_ng_template_1_span_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 84);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r62 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(item_r62.code);
} }
function SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 81)(1, "span", 82);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_ng_template_1_span_3_Template, 2, 1, "span", 83);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r62 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r62.display);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", item_r62.code);
} }
function SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_Template(rf, ctx) { if (rf & 1) {
    const _r67 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p-autoComplete", 79);
    i0.ɵɵlistener("ngModelChange", function SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_Template_p_autoComplete_ngModelChange_0_listener($event) { i0.ɵɵrestoreView(_r67); const col_r55 = i0.ɵɵnextContext(2).$implicit; const row_r49 = i0.ɵɵnextContext().$implicit; return i0.ɵɵresetView(row_r49.cells[col_r55.name].value = $event); })("completeMethod", function SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_Template_p_autoComplete_completeMethod_0_listener($event) { i0.ɵɵrestoreView(_r67); const col_r55 = i0.ɵɵnextContext(2).$implicit; const row_r49 = i0.ɵɵnextContext().$implicit; const ctx_r69 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r69.searchRefOptions($event, col_r55, row_r49)); })("onSelect", function SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_Template_p_autoComplete_onSelect_0_listener($event) { i0.ɵɵrestoreView(_r67); const col_r55 = i0.ɵɵnextContext(2).$implicit; const ctx_r73 = i0.ɵɵnextContext(); const rowIndex_r50 = ctx_r73.rowIndex; const row_r49 = ctx_r73.$implicit; const ctx_r72 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r72.onRefSuggestionSelect($event, rowIndex_r50, col_r55.name, row_r49)); })("onBlur", function SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_Template_p_autoComplete_onBlur_0_listener() { i0.ɵɵrestoreView(_r67); const col_r55 = i0.ɵɵnextContext(2).$implicit; const ctx_r76 = i0.ɵɵnextContext(); const rowIndex_r50 = ctx_r76.rowIndex; const row_r49 = ctx_r76.$implicit; const ctx_r75 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r75.onCellBlur(rowIndex_r50, col_r55.name, row_r49)); })("keydown", function SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_Template_p_autoComplete_keydown_0_listener($event) { i0.ɵɵrestoreView(_r67); const col_r55 = i0.ɵɵnextContext(2).$implicit; const ctx_r79 = i0.ɵɵnextContext(); const rowIndex_r50 = ctx_r79.rowIndex; const row_r49 = ctx_r79.$implicit; const ctx_r78 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r78.onCellKeydown($event, rowIndex_r50, col_r55.name, row_r49)); });
    i0.ɵɵtemplate(1, SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_ng_template_1_Template, 4, 2, "ng-template", 80);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r55 = i0.ɵɵnextContext(2).$implicit;
    const row_r49 = i0.ɵɵnextContext().$implicit;
    const ctx_r58 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ngModel", row_r49.cells[col_r55.name].value)("suggestions", ctx_r58.filteredSuggestions)("dropdown", true)("forceSelection", false);
} }
function SutramGridComponent_ng_template_8_td_6_ng_template_3_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    const _r85 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "input", 85);
    i0.ɵɵlistener("ngModelChange", function SutramGridComponent_ng_template_8_td_6_ng_template_3_ng_template_1_Template_input_ngModelChange_0_listener($event) { i0.ɵɵrestoreView(_r85); const col_r55 = i0.ɵɵnextContext(2).$implicit; const row_r49 = i0.ɵɵnextContext().$implicit; return i0.ɵɵresetView(row_r49.cells[col_r55.name].value = $event); })("blur", function SutramGridComponent_ng_template_8_td_6_ng_template_3_ng_template_1_Template_input_blur_0_listener() { i0.ɵɵrestoreView(_r85); const col_r55 = i0.ɵɵnextContext(2).$implicit; const ctx_r88 = i0.ɵɵnextContext(); const rowIndex_r50 = ctx_r88.rowIndex; const row_r49 = ctx_r88.$implicit; const ctx_r87 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r87.onCellBlur(rowIndex_r50, col_r55.name, row_r49)); })("keydown", function SutramGridComponent_ng_template_8_td_6_ng_template_3_ng_template_1_Template_input_keydown_0_listener($event) { i0.ɵɵrestoreView(_r85); const col_r55 = i0.ɵɵnextContext(2).$implicit; const ctx_r91 = i0.ɵɵnextContext(); const rowIndex_r50 = ctx_r91.rowIndex; const row_r49 = ctx_r91.$implicit; const ctx_r90 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r90.onCellKeydown($event, rowIndex_r50, col_r55.name, row_r49)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r55 = i0.ɵɵnextContext(2).$implicit;
    const row_r49 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("ngModel", row_r49.cells[col_r55.name].value);
} }
function SutramGridComponent_ng_template_8_td_6_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, SutramGridComponent_ng_template_8_td_6_ng_template_3_p_autoComplete_0_Template, 2, 4, "p-autoComplete", 77);
    i0.ɵɵtemplate(1, SutramGridComponent_ng_template_8_td_6_ng_template_3_ng_template_1_Template, 1, 1, "ng-template", null, 78, i0.ɵɵtemplateRefExtractor);
} if (rf & 2) {
    const _r59 = i0.ɵɵreference(2);
    const col_r55 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("ngIf", col_r55.type === "ref" || col_r55.ref_table)("ngIfElse", _r59);
} }
function SutramGridComponent_ng_template_8_td_6_ng_template_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 86);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r55 = i0.ɵɵnextContext().$implicit;
    const row_r49 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(row_r49.cells[col_r55.name] == null ? null : row_r49.cells[col_r55.name].value);
} }
function SutramGridComponent_ng_template_8_td_6_Template(rf, ctx) { if (rf & 1) {
    const _r100 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td", 73);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_8_td_6_Template_td_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r100); const col_r55 = restoredCtx.$implicit; const rowIndex_r50 = i0.ɵɵnextContext().rowIndex; const ctx_r98 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r98.onCellClick(rowIndex_r50, col_r55.name)); });
    i0.ɵɵelementStart(1, "div", 74)(2, "p-cellEditor");
    i0.ɵɵtemplate(3, SutramGridComponent_ng_template_8_td_6_ng_template_3_Template, 3, 2, "ng-template", 75);
    i0.ɵɵtemplate(4, SutramGridComponent_ng_template_8_td_6_ng_template_4_Template, 2, 1, "ng-template", 76);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const col_r55 = ctx.$implicit;
    const ctx_r101 = i0.ɵɵnextContext();
    const row_r49 = ctx_r101.$implicit;
    const rowIndex_r50 = ctx_r101.rowIndex;
    const ctx_r54 = i0.ɵɵnextContext();
    let tmp_4_0;
    i0.ɵɵstyleProp("width", ctx_r54.getColumnWidth(col_r55), "px")("min-width", ctx_r54.getColumnWidth(col_r55), "px")("max-width", ctx_r54.getColumnWidth(col_r55), "px");
    i0.ɵɵproperty("pEditableColumn", row_r49.cells[col_r55.name] == null ? null : row_r49.cells[col_r55.name].value);
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("cell-active", ((tmp_4_0 = ctx_r54.state.selectedCell()) == null ? null : tmp_4_0.rowIdx) === rowIndex_r50 && ((tmp_4_0 = ctx_r54.state.selectedCell()) == null ? null : tmp_4_0.colKey) === col_r55.name)("cell-bad", !(row_r49.cells[col_r55.name] == null ? null : row_r49.cells[col_r55.name].isValid))("cell-edited", row_r49.cells[col_r55.name] == null ? null : row_r49.cells[col_r55.name].isModified)("cell-new", row_r49.isNew);
    i0.ɵɵproperty("title", (row_r49.cells[col_r55.name] == null ? null : row_r49.cells[col_r55.name].errorMsg) || "");
} }
function SutramGridComponent_ng_template_8_Template(rf, ctx) { if (rf & 1) {
    const _r103 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr", 65)(1, "td", 66);
    i0.ɵɵlistener("contextmenu", function SutramGridComponent_ng_template_8_Template_td_contextmenu_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r103); const row_r49 = restoredCtx.$implicit; const ctx_r102 = i0.ɵɵnextContext(); const _r0 = i0.ɵɵreference(2); return i0.ɵɵresetView(ctx_r102.openRowContextMenu($event, row_r49, _r0)); });
    i0.ɵɵtemplate(2, SutramGridComponent_ng_template_8_span_2_Template, 2, 0, "span", 67);
    i0.ɵɵtemplate(3, SutramGridComponent_ng_template_8_span_3_Template, 2, 0, "span", 68);
    i0.ɵɵelementStart(4, "span", 69);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(6, SutramGridComponent_ng_template_8_td_6_Template, 5, 16, "td", 70);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r49 = ctx.$implicit;
    const columns_r51 = ctx.columns;
    i0.ɵɵclassProp("row-new", row_r49.isNew)("row-edited", !row_r49.isNew && row_r49.isModified)("row-has-error", row_r49.hasError)("row-synced", row_r49.isSynced);
    i0.ɵɵproperty("pContextMenuRow", row_r49);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", row_r49.isNew);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !row_r49.isNew && row_r49.isModified);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r49.rowNum);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", columns_r51);
} }
function SutramGridComponent_ng_template_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 87);
    i0.ɵɵelement(2, "i", 88);
    i0.ɵɵtext(3, " \u0915\u094B\u0908 \u0921\u0947\u091F\u093E \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u090A\u092A\u0930 \u0938\u0947 Excel \u092B\u093C\u093E\u0907\u0932 \u0916\u094B\u0932\u0947\u0902 \u092F\u093E 'Load Data' \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964 ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵattribute("colspan", ctx_r5.headers.length + 1);
} }
function SutramGridComponent_div_10_Template(rf, ctx) { if (rf & 1) {
    const _r105 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 89)(1, "div", 90)(2, "div", 91);
    i0.ɵɵelement(3, "i", 92);
    i0.ɵɵelementStart(4, "strong", 93);
    i0.ɵɵtext(5, "\u0938\u094D\u092E\u093E\u0930\u094D\u091F \u092C\u0948\u091A \u0938\u0941\u0927\u093E\u0930 (Solve All Matches)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 94);
    i0.ɵɵlistener("click", function SutramGridComponent_div_10_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r105); const ctx_r104 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r104.dismissPrompt()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 95)(8, "p", 96);
    i0.ɵɵtext(9, " \u0906\u092A\u0928\u0947 \u092A\u0902\u0915\u094D\u0924\u093F ");
    i0.ɵɵelementStart(10, "strong");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(12, " \u092E\u0947\u0902 '");
    i0.ɵɵelementStart(13, "strong");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(15, "' \u0915\u094B \u092C\u0926\u0932\u0915\u0930 '");
    i0.ɵɵelementStart(16, "strong");
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(18, "' \u091A\u0941\u0928\u093E \u0939\u0948\u0964 ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "div", 97);
    i0.ɵɵelement(20, "i", 98);
    i0.ɵɵelementStart(21, "span");
    i0.ɵɵtext(22, " \u0915\u0949\u0932\u092E ");
    i0.ɵɵelementStart(23, "strong");
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(25, " \u092E\u0947\u0902 ");
    i0.ɵɵelementStart(26, "strong");
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(28, " \u0905\u0928\u094D\u092F \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u094B\u0902 \u092E\u0947\u0902 \u092D\u0940 \u092F\u0939\u0940 \u0905\u092E\u093E\u0928\u094D\u092F \u092E\u093E\u0928 \u0939\u0948\u0964 ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "div", 99)(30, "input", 100);
    i0.ɵɵlistener("ngModelChange", function SutramGridComponent_div_10_Template_input_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r105); const ctx_r106 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r106.promptState.saveToDictionary = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "label", 101);
    i0.ɵɵtext(32, " \u092D\u0935\u093F\u0937\u094D\u092F \u0915\u0947 \u0932\u093F\u090F \u0921\u093F\u0915\u094D\u0936\u0928\u0930\u0940 \u092E\u0947\u0902 \u0938\u0939\u0947\u091C\u0947\u0902 (Save alias mapping to dictionary) ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(33, "div", 102)(34, "button", 103);
    i0.ɵɵlistener("click", function SutramGridComponent_div_10_Template_button_click_34_listener() { i0.ɵɵrestoreView(_r105); const ctx_r107 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r107.applySingleCellOnly()); });
    i0.ɵɵtext(35, " \u0915\u0947\u0935\u0932 \u0907\u0938\u0940 \u092A\u0902\u0915\u094D\u0924\u093F \u092E\u0947\u0902 (Single Row Only) ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "button", 104);
    i0.ɵɵlistener("click", function SutramGridComponent_div_10_Template_button_click_36_listener() { i0.ɵɵrestoreView(_r105); const ctx_r108 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r108.confirmSolveAll()); });
    i0.ɵɵtext(37);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r6 = i0.ɵɵnextContext();
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate1("#", ctx_r6.promptState.rowIdx + 1, "");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r6.promptState.originalBadValue);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r6.promptState.newSelectedDisplay);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(ctx_r6.promptState.colKey);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r6.promptState.matchingCount);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r6.promptState.saveToDictionary);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1(" \u0938\u092D\u0940 ", ctx_r6.promptState.matchingCount + 1, " \u0938\u0941\u0927\u093E\u0930\u0947\u0902 (Solve All) ");
} }
export class SutramGridComponent {
    state;
    clipboard;
    audit;
    refCache;
    el;
    headers = [];
    rows = [];
    filterOnlyErrors = false;
    enableDelete = true;
    cellChanged = new EventEmitter();
    solveAllTriggered = new EventEmitter();
    loadMore = new EventEmitter();
    filterChanged = new EventEmitter();
    sortChanged = new EventEmitter();
    // Autocomplete suggestions state
    filteredSuggestions = [];
    // Inline "Solve All" prompt state
    promptState = {
        visible: false,
        rowIdx: -1,
        colKey: '',
        originalBadValue: '',
        newSelectedValue: null,
        newSelectedDisplay: '',
        matchingCount: 0,
        saveToDictionary: true
    };
    // Excel Column Header Filter Popover State
    activeFilterCol = null;
    filterChecklistSearch = '';
    currentChecklistItems = [];
    selectedChecklistValues = new Set();
    // Context menu items
    contextMenuItems = [];
    contextSelectedRow = null;
    scrollCleanup;
    constructor(state, clipboard, audit, refCache, el) {
        this.state = state;
        this.clipboard = clipboard;
        this.audit = audit;
        this.refCache = refCache;
        this.el = el;
        this.initContextMenu();
    }
    ngOnChanges(changes) {
        if (changes['headers'] && this.headers) {
            const refTables = this.headers
                .filter(h => h.ref_table || h.type === 'ref')
                .map(h => h.ref_table)
                .filter(Boolean);
            this.refCache.preloadTables(refTables);
        }
        if (changes['enableDelete']) {
            this.initContextMenu();
        }
    }
    ngAfterViewInit() {
        const wrapper = this.el.nativeElement.querySelector('.p-datatable-wrapper');
        if (wrapper) {
            const scrollHandler = () => {
                if (wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 150) {
                    this.loadMore.emit();
                }
            };
            wrapper.addEventListener('scroll', scrollHandler, { passive: true });
            this.scrollCleanup = () => wrapper.removeEventListener('scroll', scrollHandler);
        }
    }
    ngOnDestroy() {
        if (this.scrollCleanup) {
            this.scrollCleanup();
        }
    }
    initContextMenu() {
        const items = [
            {
                label: 'कॉपी करें (Copy)',
                icon: 'pi pi-copy',
                command: () => this.copySelectedRow()
            },
            {
                label: 'ऊपर पंक्ति जोड़ें (Insert Row Above)',
                icon: 'pi pi-arrow-up',
                command: () => this.insertRowAbove()
            },
            {
                label: 'नीचे पंक्ति जोड़ें (Insert Row Below)',
                icon: 'pi pi-arrow-down',
                command: () => this.insertRowBelow()
            }
        ];
        if (this.enableDelete) {
            items.push({ separator: true }, {
                label: 'पंक्ति हटाएं (Delete Row)',
                icon: 'pi pi-trash',
                command: () => this.deleteSelectedRow()
            });
        }
        this.contextMenuItems = items;
    }
    get visibleRows() {
        let result = this.rows;
        if (this.filterOnlyErrors) {
            result = result.filter(r => r.hasError);
        }
        const colFilters = this.state.columnFilters();
        const filterKeys = Object.keys(colFilters);
        if (this.state.filtersEnabled() && filterKeys.length > 0) {
            result = result.filter(r => {
                for (const colKey of filterKeys) {
                    const allowed = colFilters[colKey];
                    if (!allowed || allowed.size === 0)
                        continue;
                    const cell = r.cells[colKey];
                    const rawVal = cell ? String(cell.value ?? '').trim() : '';
                    const refId = cell?.refId !== undefined && cell?.refId !== null ? String(cell.refId) : null;
                    if (rawVal === '') {
                        if (!allowed.has('__BLANK__') && !allowed.has(''))
                            return false;
                    }
                    else {
                        const matchesVal = allowed.has(rawVal);
                        const matchesId = refId !== null && allowed.has(refId);
                        if (!matchesVal && !matchesId)
                            return false;
                    }
                }
                return true;
            });
        }
        const sort = this.state.activeSort();
        if (this.state.sortingEnabled() && sort && sort.colKey) {
            const { colKey, order } = sort;
            const colDef = this.headers.find(h => h.name === colKey);
            const isNum = colDef?.type === 'number';
            result = [...result].sort((a, b) => {
                const valA = a.cells[colKey]?.value;
                const valB = b.cells[colKey]?.value;
                if (valA === valB)
                    return 0;
                if (valA === undefined || valA === null || valA === '')
                    return 1;
                if (valB === undefined || valB === null || valB === '')
                    return -1;
                if (isNum) {
                    const numA = Number(valA);
                    const numB = Number(valB);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return order === 'ASC' ? numA - numB : numB - numA;
                    }
                }
                const cmp = String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base', numeric: true });
                return order === 'ASC' ? cmp : -cmp;
            });
        }
        return result;
    }
    // ── Column Filter Popover Methods ────────────────────────────
    isColumnFiltered(colName) {
        const filters = this.state.columnFilters();
        return !!filters[colName] && filters[colName].size > 0;
    }
    isSortActive(colName, order) {
        const s = this.state.activeSort();
        return s?.colKey === colName && s?.order === order;
    }
    openColumnFilter(event, col, op) {
        event.stopPropagation();
        this.activeFilterCol = col;
        this.filterChecklistSearch = '';
        this.selectedChecklistValues.clear();
        const isFk = col.type === 'ref' || !!col.ref_table;
        const itemsMap = new Map();
        // For Foreign Key columns: load all options from SutramRefCacheService (Rule 8)
        if (isFk && col.ref_table) {
            const refOptions = this.refCache.getOptions(col.ref_table);
            for (const opt of refOptions) {
                itemsMap.set(opt.display, {
                    display: opt.display,
                    value: opt.display,
                    code: opt.code,
                    count: 0
                });
            }
        }
        // Tally occurrences from loaded rows and capture distinct non-ref values or blanks
        let blankCount = 0;
        for (const r of this.rows) {
            const cell = r.cells[col.name];
            const val = cell?.value !== undefined && cell?.value !== null ? String(cell.value).trim() : '';
            if (val === '') {
                blankCount++;
            }
            else {
                if (itemsMap.has(val)) {
                    const item = itemsMap.get(val);
                    item.count = (item.count || 0) + 1;
                }
                else {
                    itemsMap.set(val, {
                        display: val,
                        value: val,
                        count: 1
                    });
                }
            }
        }
        const itemsList = Array.from(itemsMap.values());
        if (col.type === 'number') {
            itemsList.sort((a, b) => (Number(a.value) || 0) - (Number(b.value) || 0));
        }
        else {
            itemsList.sort((a, b) => a.display.localeCompare(b.display, undefined, { numeric: true }));
        }
        if (blankCount > 0) {
            itemsList.push({
                display: '(रिक्त / Blanks)',
                value: '__BLANK__',
                count: blankCount
            });
        }
        this.currentChecklistItems = itemsList;
        const existing = this.state.columnFilters()[col.name];
        if (existing && existing.size > 0) {
            this.selectedChecklistValues = new Set(existing);
        }
        else {
            this.selectedChecklistValues = new Set(itemsList.map(i => i.value));
        }
        op.toggle(event);
    }
    get filteredChecklistItems() {
        if (!this.filterChecklistSearch)
            return this.currentChecklistItems;
        const q = cleanString(this.filterChecklistSearch);
        return this.currentChecklistItems.filter(i => {
            const d = cleanString(i.display);
            const c = i.code ? cleanString(i.code) : '';
            return d.includes(q) || c.includes(q);
        });
    }
    isAllChecklistSelected() {
        if (this.currentChecklistItems.length === 0)
            return false;
        return this.selectedChecklistValues.size === this.currentChecklistItems.length;
    }
    toggleSelectAllChecklist(event) {
        const checked = event.target.checked;
        if (checked) {
            this.selectedChecklistValues = new Set(this.currentChecklistItems.map(i => i.value));
        }
        else {
            this.selectedChecklistValues.clear();
        }
    }
    toggleChecklistItem(value) {
        if (this.selectedChecklistValues.has(value)) {
            this.selectedChecklistValues.delete(value);
        }
        else {
            this.selectedChecklistValues.add(value);
        }
    }
    applyCurrentColFilter(op) {
        if (!this.activeFilterCol)
            return;
        const colName = this.activeFilterCol.name;
        if (this.selectedChecklistValues.size === 0 ||
            this.selectedChecklistValues.size === this.currentChecklistItems.length) {
            this.state.clearColumnFilter(colName);
        }
        else {
            this.state.setColumnFilter(colName, new Set(this.selectedChecklistValues));
        }
        this.filterChanged.emit(this.state.columnFilters());
        op.hide();
    }
    clearCurrentColFilter(op) {
        if (!this.activeFilterCol)
            return;
        this.state.clearColumnFilter(this.activeFilterCol.name);
        this.selectedChecklistValues = new Set(this.currentChecklistItems.map(i => i.value));
        this.filterChanged.emit(this.state.columnFilters());
        op.hide();
    }
    /**
     * Directly cycle column sort on clicking table header: None -> ASC -> DESC -> None
     */
    onHeaderClick(col) {
        if (!this.state.sortingEnabled() || !col?.name)
            return;
        const currentSort = this.state.activeSort();
        if (currentSort?.colKey === col.name) {
            if (currentSort.order === 'ASC') {
                this.state.setSort(col.name, 'DESC');
            }
            else {
                this.state.clearSort();
            }
        }
        else {
            this.state.setSort(col.name, 'ASC');
        }
        this.sortChanged.emit(this.state.activeSort());
    }
    applySort(colKey, order, op) {
        this.state.setSort(colKey, order);
        this.sortChanged.emit(this.state.activeSort());
        if (op)
            op.hide();
    }
    clearSort(op) {
        this.state.clearSort();
        this.sortChanged.emit(null);
        if (op)
            op.hide();
    }
    /**
     * Cell clicked / focused
     */
    onCellClick(rowIdx, colKey) {
        this.state.setSelectedCell({ rowIdx, colKey });
    }
    /**
     * Search suggestions for Foreign Key reference autocomplete
     */
    searchRefOptions(event, header, row) {
        const query = event?.query || '';
        const refTable = header.ref_table || header.name;
        let parentId = undefined;
        if (refTable.toLowerCase() === 'subitem' && row) {
            const itemHeader = this.headers.find(h => h.ref_table === 'item' || h.name.includes('item'));
            if (itemHeader && row.cells[itemHeader.name]) {
                parentId = row.cells[itemHeader.name].refId || row.cells[itemHeader.name].value;
            }
        }
        this.filteredSuggestions = this.refCache.searchOptions(refTable, query, parentId, 30);
    }
    /**
     * Selection from reference autocomplete dropdown
     */
    onRefSuggestionSelect(option, rowIdx, colKey, cell, header, row) {
        if (!option)
            return;
        const originalValue = cell.value ? String(cell.value) : '';
        const resolvedDisplay = option.display || option.hin || option.eng || '';
        const resolvedId = option.id !== undefined ? option.id : resolvedDisplay;
        // Track modification
        if (cell.originalValue === undefined) {
            cell.originalValue = originalValue;
        }
        if (originalValue !== resolvedDisplay) {
            cell.isModified = true;
            if (row)
                row.isModified = true;
        }
        cell.value = resolvedDisplay;
        cell.refId = resolvedId;
        cell.refDisplay = resolvedDisplay;
        // Validate cell
        this.audit.validateCell(cell, header, row, this.headers);
        if (row) {
            this.audit.validateRow(row, this.headers);
        }
        // Check if other rows have the exact same old value to offer "Solve All"
        if (originalValue && originalValue !== resolvedDisplay) {
            const sameCount = this.state.findSameMistakeRowIndices(colKey, originalValue).length;
            if (sameCount > 1) {
                this.promptState = {
                    visible: true,
                    rowIdx,
                    colKey,
                    originalBadValue: originalValue,
                    newSelectedValue: resolvedId,
                    newSelectedDisplay: resolvedDisplay,
                    matchingCount: sameCount,
                    saveToDictionary: true
                };
            }
        }
        this.cellChanged.emit({ rowIdx, colKey, value: cell.value });
    }
    /**
     * Value edited directly in cell
     */
    onCellValueCommit(rowIdx, colKey, cell, header, row) {
        if (cell.originalValue === undefined) {
            cell.originalValue = cell.value;
        }
        const valStr = cell.value === null || cell.value === undefined ? '' : String(cell.value).trim();
        const origStr = cell.originalValue === null || cell.originalValue === undefined ? '' : String(cell.originalValue).trim();
        if (valStr !== origStr) {
            cell.isModified = true;
            if (row)
                row.isModified = true;
        }
        this.audit.validateCell(cell, header, row, this.headers);
        if (row) {
            this.audit.validateRow(row, this.headers);
        }
        this.cellChanged.emit({ rowIdx, colKey, value: cell.value });
    }
    /**
     * User clicked "Apply to All" in prompt
     */
    confirmSolveAll() {
        this.solveAllTriggered.emit({
            colKey: this.promptState.colKey,
            badValue: this.promptState.originalBadValue || '',
            resolvedDisplay: this.promptState.newSelectedDisplay || '',
            resolvedId: this.promptState.newSelectedValue,
            saveToDict: this.promptState.saveToDictionary
        });
        this.promptState.visible = false;
    }
    /**
     * User chose to update only this single cell
     */
    applySingleCellOnly() {
        this.state.updateCellValue(this.promptState.rowIdx, this.promptState.colKey, this.promptState.newSelectedDisplay, this.promptState.newSelectedValue);
        this.promptState.visible = false;
    }
    dismissPrompt() {
        this.promptState.visible = false;
    }
    // ── Context Menu Handlers ────────────────────────────────────
    copySelectedRow() {
        if (this.contextSelectedRow) {
            this.clipboard.copyRowsToClipboard([this.contextSelectedRow], this.headers);
        }
    }
    insertRowAbove() {
        if (!this.contextSelectedRow)
            return;
        const idx = this.rows.findIndex(r => r.rowNum === this.contextSelectedRow.rowNum);
        if (idx !== -1) {
            const newRow = {
                rowNum: this.rows.length + 1,
                cells: {},
                hasError: false,
                errorCount: 0,
                isNew: true
            };
            this.headers.forEach(h => (newRow.cells[h.name] = { value: '', isValid: true, isNew: true }));
            const updated = [...this.rows];
            updated.splice(idx, 0, newRow);
            this.state.setRows(updated);
        }
    }
    insertRowBelow() {
        if (!this.contextSelectedRow)
            return;
        const idx = this.rows.findIndex(r => r.rowNum === this.contextSelectedRow.rowNum);
        if (idx !== -1) {
            const newRow = {
                rowNum: this.rows.length + 1,
                cells: {},
                hasError: false,
                errorCount: 0,
                isNew: true
            };
            this.headers.forEach(h => (newRow.cells[h.name] = { value: '', isValid: true, isNew: true }));
            const updated = [...this.rows];
            updated.splice(idx + 1, 0, newRow);
            this.state.setRows(updated);
        }
    }
    deleteSelectedRow() {
        if (!this.contextSelectedRow)
            return;
        const idx = this.rows.findIndex(r => r.rowNum === this.contextSelectedRow.rowNum);
        this.state.trackDeletedRow(this.contextSelectedRow, idx);
        const updated = this.rows.filter(r => r.rowNum !== this.contextSelectedRow.rowNum);
        this.state.setRows(updated);
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
    getColumnWidth(col) {
        if (col.width)
            return col.width;
        const name = (col.name || '').toLowerCase();
        if (name === '_id' || name === 'id')
            return 60;
        if (name === 'active')
            return 80;
        if (name === 'sort_order' || name === 'order' || name === 'roll_no')
            return 90;
        if (name === 'gender' || name.includes('code'))
            return 95;
        if (name === 'parent' || name === 'alias')
            return 120;
        return Math.max(130, Math.min(220, (col.name || '').length * 10 + 35));
    }
    openRowContextMenu(event, row, cm) {
        event.preventDefault();
        this.contextSelectedRow = row;
        if (cm)
            cm.show(event);
    }
    static ɵfac = function SutramGridComponent_Factory(t) { return new (t || SutramGridComponent)(i0.ɵɵdirectiveInject(i1.SutramExcelStateService), i0.ɵɵdirectiveInject(i2.SutramClipboardService), i0.ɵɵdirectiveInject(i3.SutramAuditService), i0.ɵɵdirectiveInject(i4.SutramRefCacheService), i0.ɵɵdirectiveInject(i0.ElementRef)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SutramGridComponent, selectors: [["sutram-grid"]], inputs: { headers: "headers", rows: "rows", filterOnlyErrors: "filterOnlyErrors", enableDelete: "enableDelete" }, outputs: { cellChanged: "cellChanged", solveAllTriggered: "solveAllTriggered", loadMore: "loadMore", filterChanged: "filterChanged", sortChanged: "sortChanged" }, features: [i0.ɵɵNgOnChangesFeature], decls: 11, vars: 13, consts: [[1, "sutram-grid-wrapper"], [3, "model"], ["cm", ""], ["styleClass", "sutram-col-filter-popover shadow-lg", 3, "showCloseIcon", "dismissable"], ["colFilterOp", ""], ["pTemplate", "content"], ["scrollHeight", "flex", "columnResizeMode", "expand", "styleClass", "p-datatable-gridlines p-datatable-sm sutram-grid-table", 3, "value", "columns", "virtualScroll", "virtualScrollItemSize", "scrollable", "resizableColumns", "reorderableColumns", "contextMenu", "contextMenuSelection", "contextMenuSelectionChange"], ["pTemplate", "header"], ["pTemplate", "body"], ["pTemplate", "emptymessage"], ["class", "inline-solve-prompt card shadow-lg p-3", 4, "ngIf"], ["class", "filter-popover-content", 4, "ngIf"], [1, "filter-popover-content"], [1, "popover-header", "d-flex", "align-items-center", "justify-content-between"], [1, "fw-bold", "fs-7", "text-truncate"], [1, "pi", "pi-filter", "me-1", "text-primary"], ["type", "button", 1, "btn-close-popover", 3, "click"], [1, "pi", "pi-times"], [1, "popover-search-box"], [1, "pi", "pi-search", "search-icon"], ["type", "text", "placeholder", "Search values...", 1, "form-control", "form-control-sm", "popover-search-input", 3, "ngModel", "ngModelChange"], ["type", "button", "class", "btn-clear-search-inline", 3, "click", 4, "ngIf"], [1, "popover-select-all-row", "d-flex", "align-items-center", "justify-content-between", "px-2", "py-1"], [1, "form-check", "m-0"], ["type", "checkbox", "id", "selectAllFilterVals", 1, "form-check-input", "cursor-pointer", 3, "checked", "change"], ["for", "selectAllFilterVals", 1, "form-check-label", "small", "fw-semibold", "cursor-pointer"], [1, "small", "text-muted"], [1, "popover-checklist-items"], ["class", "checklist-item d-flex align-items-center justify-content-between px-2 py-1 cursor-pointer", 3, "click", 4, "ngFor", "ngForOf"], ["class", "text-center py-3 text-muted small", 4, "ngIf"], [1, "popover-divider"], [1, "popover-footer", "d-flex", "align-items-center", "justify-content-between", "pt-2"], ["type", "button", 1, "btn", "btn-sm", "btn-outline-danger", "btn-xs", 3, "click"], [1, "d-flex", "gap-2"], ["type", "button", 1, "btn", "btn-sm", "btn-outline-secondary", "btn-xs", 3, "click"], ["type", "button", 1, "btn", "btn-sm", "btn-primary", "btn-xs", 3, "click"], ["type", "button", 1, "btn-clear-search-inline", 3, "click"], [1, "checklist-item", "d-flex", "align-items-center", "justify-content-between", "px-2", "py-1", "cursor-pointer", 3, "click"], [1, "d-flex", "align-items-center", "gap-2", "text-truncate"], ["type", "checkbox", 1, "form-check-input", "cursor-pointer", "m-0", 3, "checked", "click", "change"], [1, "item-label", "text-truncate", 3, "title"], ["class", "badge bg-light text-muted small ms-1", 4, "ngIf"], ["class", "item-count-badge", 4, "ngIf"], [1, "badge", "bg-light", "text-muted", "small", "ms-1"], [1, "item-count-badge"], [1, "text-center", "py-3", "text-muted", "small"], ["pFrozenColumn", "", 1, "corner-th", "corner-config-th", 2, "width", "48px", "min-width", "48px", "text-align", "center"], [2, "display", "flex", "align-items", "center", "justify-content", "center"], [1, "pi", "pi-cog", "corner-cog-icon", 2, "font-size", "13px", "color", "var(--text-muted, #64748b)"], ["pResizableColumn", "", "pReorderableColumn", "", "class", "sutram-th", 3, "width", "min-width", "max-width", "sortable-th", "click", 4, "ngFor", "ngForOf"], ["pResizableColumn", "", "pReorderableColumn", "", 1, "sutram-th", 3, "click"], [2, "display", "flex", "justify-content", "space-between", "align-items", "center", "position", "relative", "width", "100%"], [1, "col-header-title", "text-truncate", "d-flex", "align-items-center", 3, "title"], [2, "color", "var(--text-muted, #64748b)", "font-size", "11px", "margin-right", "5px"], [1, "text-truncate"], ["style", "color: #ef4444; margin-left: 2px;", 4, "ngIf"], [1, "col-header-controls", "d-flex", "align-items-center", 3, "click"], ["style", "font-size: 9px; padding: 1px 4px; background: rgba(59, 130, 246, 0.15); color: #2563eb; border-radius: 3px; font-weight: 600; margin-right: 4px;", 3, "title", 4, "ngIf"], ["class", "col-sort-trigger", 3, "is-sorted", "title", "click", 4, "ngIf"], ["class", "col-filter-trigger", 3, "is-filtered", "title", "click", 4, "ngIf"], [2, "color", "#ef4444", "margin-left", "2px"], [2, "font-size", "9px", "padding", "1px 4px", "background", "rgba(59, 130, 246, 0.15)", "color", "#2563eb", "border-radius", "3px", "font-weight", "600", "margin-right", "4px", 3, "title"], [1, "col-sort-trigger", 3, "title", "click"], [1, "pi", 3, "ngClass"], [1, "col-filter-trigger", 3, "title", "click"], [3, "pContextMenuRow"], ["pFrozenColumn", "", 1, "row-num-td", 2, "width", "48px", "min-width", "48px", "max-width", "48px", "text-align", "center", 3, "contextmenu"], ["style", "font-size: 10px; margin-right: 3px; font-weight: 700; color: #15803d;", 4, "ngIf"], ["style", "font-size: 10px; margin-right: 3px; font-weight: 700; color: #b45309;", 4, "ngIf"], [1, "row-num-text"], [3, "pEditableColumn", "width", "min-width", "max-width", "click", 4, "ngFor", "ngForOf"], [2, "font-size", "10px", "margin-right", "3px", "font-weight", "700", "color", "#15803d"], [2, "font-size", "10px", "margin-right", "3px", "font-weight", "700", "color", "#b45309"], [3, "pEditableColumn", "click"], [1, "cell-box", 3, "title"], ["pTemplate", "input"], ["pTemplate", "output"], ["field", "display", "appendTo", "body", "styleClass", "sutram-cell-autocomplete", 3, "ngModel", "suggestions", "dropdown", "forceSelection", "ngModelChange", "completeMethod", "onSelect", "onBlur", "keydown", 4, "ngIf", "ngIfElse"], ["plainInput", ""], ["field", "display", "appendTo", "body", "styleClass", "sutram-cell-autocomplete", 3, "ngModel", "suggestions", "dropdown", "forceSelection", "ngModelChange", "completeMethod", "onSelect", "onBlur", "keydown"], ["pTemplate", "item"], [1, "d-flex", "align-items-center", "justify-content-between", "w-100", "py-1"], [1, "fw-semibold"], ["class", "badge bg-light text-muted ms-2", 4, "ngIf"], [1, "badge", "bg-light", "text-muted", "ms-2"], ["type", "text", "pInputText", "", 1, "raw-cell-editor", 3, "ngModel", "ngModelChange", "blur", "keydown"], [1, "cell-value-text", "text-truncate"], [1, "text-center", "py-4", "text-muted"], [1, "pi", "pi-file-excel", "me-2", 2, "font-size", "16px"], [1, "inline-solve-prompt", "card", "shadow-lg", "p-3"], [1, "d-flex", "align-items-center", "justify-content-between", "pb-2", "mb-2", "border-bottom"], [1, "d-flex", "align-items-center", "gap-2"], [1, "pi", "pi-bolt", "text-warning", 2, "font-size", "16px"], [1, "fs-7"], ["type", "button", 1, "btn-close", 3, "click"], [1, "prompt-body", "text-start", "mb-3"], [1, "small", "text-muted", "mb-2"], [1, "alert", "alert-warning", "py-2", "px-3", "small", "d-flex", "align-items-center", "gap-2", "m-0"], [1, "pi", "pi-info-circle"], [1, "form-check", "mt-2"], ["type", "checkbox", "id", "chkDict", 1, "form-check-input", 3, "ngModel", "ngModelChange"], ["for", "chkDict", 1, "form-check-label", "small", "cursor-pointer"], [1, "prompt-actions", "d-flex", "justify-content-end", "gap-2"], ["type", "button", 1, "btn", "btn-sm", "btn-outline-secondary", 3, "click"], ["type", "button", 1, "btn", "btn-sm", "btn-success", 3, "click"]], template: function SutramGridComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵelement(1, "p-contextMenu", 1, 2);
            i0.ɵɵelementStart(3, "p-overlayPanel", 3, 4);
            i0.ɵɵtemplate(5, SutramGridComponent_ng_template_5_Template, 1, 1, "ng-template", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p-table", 6);
            i0.ɵɵlistener("contextMenuSelectionChange", function SutramGridComponent_Template_p_table_contextMenuSelectionChange_6_listener($event) { return ctx.contextSelectedRow = $event; });
            i0.ɵɵtemplate(7, SutramGridComponent_ng_template_7_Template, 5, 1, "ng-template", 7);
            i0.ɵɵtemplate(8, SutramGridComponent_ng_template_8_Template, 7, 13, "ng-template", 8);
            i0.ɵɵtemplate(9, SutramGridComponent_ng_template_9_Template, 4, 1, "ng-template", 9);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(10, SutramGridComponent_div_10_Template, 38, 7, "div", 10);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            const _r0 = i0.ɵɵreference(2);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("model", ctx.contextMenuItems);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("showCloseIcon", false)("dismissable", true);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("value", ctx.visibleRows)("columns", ctx.headers)("virtualScroll", true)("virtualScrollItemSize", 23)("scrollable", true)("resizableColumns", true)("reorderableColumns", true)("contextMenu", _r0)("contextMenuSelection", ctx.contextSelectedRow);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngIf", ctx.promptState.visible);
        } }, dependencies: [i5.NgClass, i5.NgForOf, i5.NgIf, i6.DefaultValueAccessor, i6.CheckboxControlValueAccessor, i6.NgControlStatus, i6.NgModel, i7.Table, i8.PrimeTemplate, i7.FrozenColumn, i7.ContextMenuRow, i7.ResizableColumn, i7.ReorderableColumn, i7.EditableColumn, i7.CellEditor, i9.InputText, i10.ContextMenu, i11.AutoComplete, i12.OverlayPanel], styles: ["\n\n\n\n\n\n\n\n\n\n\n.sutram-grid-wrapper[_ngcontent-%COMP%] {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n\n  ::ng-deep .p-datatable-wrapper {\n    height: 100% !important;\n  }\n\n  \n\n  ::ng-deep .p-datatable-thead > tr > th {\n    position: sticky;\n    top: 0;\n    z-index: 20;\n    background: var(--header-bg, #f1f5f9) !important;\n    color: var(--header-text, #1e293b) !important;\n    font-weight: 700 !important;\n    font-size: 13px !important;\n    height: var(--header-height, 38px) !important;\n    padding: 6px 10px !important;\n    border-right: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    border-bottom: 2px solid rgba(125, 125, 125, 0.35) !important;\n    white-space: nowrap !important;\n    user-select: none;\n    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);\n\n    &.sortable-th {\n      cursor: pointer !important;\n      transition: background-color 0.15s ease;\n\n      &:hover {\n        background-color: rgba(125, 125, 125, 0.1) !important;\n      }\n    }\n  }\n\n  \n\n  ::ng-deep th.corner-th {\n    width: 48px !important;\n    min-width: 48px !important;\n    max-width: 48px !important;\n    left: 0;\n    z-index: 25 !important;\n    text-align: center !important;\n    border-right: 2px solid rgba(125, 125, 125, 0.35) !important;\n    cursor: pointer;\n\n    &:hover .corner-cog-icon {\n      color: var(--primary, #4f46e5) !important;\n      transform: rotate(45deg);\n      transition: all 0.2s ease;\n    }\n  }\n\n  \n\n  .col-header-controls {\n    display: flex;\n    align-items: center;\n    gap: 3px;\n    margin-left: 4px;\n    flex-shrink: 0;\n  }\n  .col-sort-trigger, .col-filter-trigger {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 18px;\n    height: 18px;\n    border-radius: 3px;\n    cursor: pointer;\n    color: var(--text-muted, #64748b);\n    opacity: 0.65;\n    transition: all 0.12s ease;\n    font-size: 11px;\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.18);\n      opacity: 1;\n      color: var(--text, #0f172a);\n    }\n    &.is-sorted, &.is-filtered {\n      color: var(--primary, #4f46e5) !important;\n      opacity: 1 !important;\n      font-weight: 700;\n      background: var(--primary-soft, #e0e7ff);\n    }\n  }\n\n  \n\n  ::ng-deep .p-datatable-tbody > tr > td {\n    height: var(--cell-height, 23px) !important;\n    padding: 0 !important;\n    border-right: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    border-bottom: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    vertical-align: middle;\n    font-size: 11.5px;\n  }\n\n  \n\n  ::ng-deep td.row-num-td {\n    position: sticky;\n    left: 0;\n    z-index: 15;\n    width: 48px !important;\n    min-width: 48px !important;\n    max-width: 48px !important;\n    text-align: center;\n    background: var(--header-bg, #f1f5f9) !important;\n    border-right: 2px solid rgba(125, 125, 125, 0.35) !important;\n    color: var(--text-muted, #64748b);\n    font-size: 10.5px;\n    font-weight: 600;\n    user-select: none;\n    cursor: pointer;\n\n    &:hover {\n      background: rgba(59, 130, 246, 0.15) !important;\n    }\n  }\n\n  \n\n  .cell-box {\n    height: var(--cell-height, 23px);\n    padding: 1px 6px;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    display: flex;\n    align-items: center;\n    cursor: cell;\n    width: 100%;\n\n    &.cell-active {\n      box-shadow: inset 0 0 0 2px #3b82f6 !important;\n      z-index: 10;\n    }\n    &.cell-bad {\n      background-color: rgba(244, 63, 94, 0.18) !important;\n      color: #f43f5e !important;\n      font-weight: 600;\n      box-shadow: inset 0 0 0 1px #f43f5e;\n    }\n    &.cell-edited {\n      background-color: var(--cell-edited-bg, #fef9c3) !important;\n      box-shadow: inset 0 0 0 1px rgba(234, 179, 8, 0.45);\n    }\n    &.cell-new {\n      background-color: var(--row-new-bg, #dcfce7) !important;\n    }\n  }\n\n  \n\n  ::ng-deep tr.row-edited td {\n    background-color: var(--row-edited-bg, #fffbeb);\n\n    &.row-num-td {\n      background-color: rgba(234, 179, 8, 0.2) !important;\n      color: #b45309 !important;\n      font-weight: 700;\n      border-left: 3px solid var(--cell-edited-border, #eab308) !important;\n    }\n  }\n\n  \n\n  ::ng-deep tr.row-new td {\n    background-color: var(--row-new-bg, #dcfce7);\n\n    &.row-num-td {\n      background-color: rgba(34, 197, 94, 0.2) !important;\n      color: #15803d !important;\n      font-weight: 700;\n      border-left: 3px solid var(--row-new-border, #22c55e) !important;\n    }\n  }\n\n  .raw-cell-editor {\n    width: 100%;\n    height: var(--cell-height, 23px);\n    border: none;\n    outline: none;\n    background: transparent;\n    color: inherit;\n    font-family: inherit;\n    font-size: 11.5px;\n    padding: 1px 6px;\n  }\n}\n\n\n\n.inline-solve-prompt[_ngcontent-%COMP%] {\n  position: fixed;\n  bottom: 70px;\n  right: 25px;\n  z-index: 2100;\n  width: 440px;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 8px;\n  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);\n  animation: _ngcontent-%COMP%_promptSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);\n}\n@keyframes _ngcontent-%COMP%_promptSlideUp {\n  from { opacity: 0; transform: translateY(16px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n\n\n  .sutram-col-filter-popover {\n  width: 270px;\n  font-size: 12px;\n\n  .p-overlaypanel-content {\n    padding: 0 !important;\n  }\n}\n.filter-popover-content[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n\n  .popover-header {\n    padding: 8px 12px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    background: rgba(125, 125, 125, 0.04);\n  }\n  .popover-search-box {\n    position: relative;\n    padding: 6px 8px;\n\n    .search-icon {\n      position: absolute;\n      left: 14px;\n      top: 13px;\n      font-size: 11px;\n      color: var(--text-muted, #64748b);\n    }\n    .popover-search-input {\n      padding-left: 24px;\n      font-size: 11.5px;\n      height: 26px;\n      border-radius: 4px;\n    }\n  }\n  .popover-checklist-items {\n    max-height: 180px;\n    overflow-y: auto;\n  }\n  .checklist-item:hover {\n    background: rgba(125, 125, 125, 0.08);\n  }\n  .popover-footer {\n    padding: 8px 10px;\n    border-top: 1px solid var(--surface-border, #e2e8f0);\n  }\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramGridComponent, [{
        type: Component,
        args: [{ selector: 'sutram-grid', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-grid.component.html -->\n<div class=\"sutram-grid-wrapper\">\n\n  <!-- Right Click Context Menu -->\n  <p-contextMenu #cm [model]=\"contextMenuItems\"></p-contextMenu>\n\n  <!-- Excel-like Column Header Filter & Sort Popover -->\n  <p-overlayPanel #colFilterOp\n                  [showCloseIcon]=\"false\"\n                  [dismissable]=\"true\"\n                  styleClass=\"sutram-col-filter-popover shadow-lg\">\n    <ng-template pTemplate=\"content\">\n      <div *ngIf=\"activeFilterCol\" class=\"filter-popover-content\">\n        <!-- Popover Header -->\n        <div class=\"popover-header d-flex align-items-center justify-content-between\">\n          <span class=\"fw-bold fs-7 text-truncate\">\n            <i class=\"pi pi-filter me-1 text-primary\"></i>\n            {{ activeFilterCol.name }} Filter\n          </span>\n          <button type=\"button\" class=\"btn-close-popover\" (click)=\"colFilterOp.hide()\">\n            <i class=\"pi pi-times\"></i>\n          </button>\n        </div>\n\n        <!-- Popover Search Box -->\n        <div class=\"popover-search-box\">\n          <i class=\"pi pi-search search-icon\"></i>\n          <input type=\"text\"\n                 class=\"form-control form-control-sm popover-search-input\"\n                 placeholder=\"Search values...\"\n                 [(ngModel)]=\"filterChecklistSearch\" />\n          <button *ngIf=\"filterChecklistSearch\"\n                  type=\"button\"\n                  class=\"btn-clear-search-inline\"\n                  (click)=\"filterChecklistSearch = ''\">\n            <i class=\"pi pi-times\"></i>\n          </button>\n        </div>\n\n        <!-- Select All / Clear All Row -->\n        <div class=\"popover-select-all-row d-flex align-items-center justify-content-between px-2 py-1\">\n          <div class=\"form-check m-0\">\n            <input type=\"checkbox\"\n                   class=\"form-check-input cursor-pointer\"\n                   id=\"selectAllFilterVals\"\n                   [checked]=\"isAllChecklistSelected()\"\n                   (change)=\"toggleSelectAllChecklist($event)\" />\n            <label class=\"form-check-label small fw-semibold cursor-pointer\" for=\"selectAllFilterVals\">\n              (Select All)\n            </label>\n          </div>\n          <span class=\"small text-muted\">\n            {{ selectedChecklistValues.size }} / {{ currentChecklistItems.length }}\n          </span>\n        </div>\n\n        <!-- Checklist Values Container -->\n        <div class=\"popover-checklist-items\">\n          <div *ngFor=\"let item of filteredChecklistItems\"\n               class=\"checklist-item d-flex align-items-center justify-content-between px-2 py-1 cursor-pointer\"\n               (click)=\"toggleChecklistItem(item.value)\">\n            <div class=\"d-flex align-items-center gap-2 text-truncate\">\n              <input type=\"checkbox\"\n                     class=\"form-check-input cursor-pointer m-0\"\n                     [checked]=\"selectedChecklistValues.has(item.value)\"\n                     (click)=\"$event.stopPropagation()\"\n                     (change)=\"toggleChecklistItem(item.value)\" />\n              <span class=\"item-label text-truncate\" [title]=\"item.display\">\n                {{ item.display }}\n              </span>\n            </div>\n            <span *ngIf=\"item.code\" class=\"badge bg-light text-muted small ms-1\">{{ item.code }}</span>\n            <span *ngIf=\"item.count !== undefined && item.count > 0\" class=\"item-count-badge\">{{ item.count }}</span>\n          </div>\n\n          <div *ngIf=\"filteredChecklistItems.length === 0\" class=\"text-center py-3 text-muted small\">\n            No values found\n          </div>\n        </div>\n\n        <div class=\"popover-divider\"></div>\n\n        <!-- Footer Actions -->\n        <div class=\"popover-footer d-flex align-items-center justify-content-between pt-2\">\n          <button type=\"button\"\n                  class=\"btn btn-sm btn-outline-danger btn-xs\"\n                  (click)=\"clearCurrentColFilter(colFilterOp)\">\n            Clear\n          </button>\n          <div class=\"d-flex gap-2\">\n            <button type=\"button\"\n                    class=\"btn btn-sm btn-outline-secondary btn-xs\"\n                    (click)=\"colFilterOp.hide()\">\n              Cancel\n            </button>\n            <button type=\"button\"\n                    class=\"btn btn-sm btn-primary btn-xs\"\n                    (click)=\"applyCurrentColFilter(colFilterOp)\">\n              Apply\n            </button>\n          </div>\n        </div>\n\n      </div>\n    </ng-template>\n  </p-overlayPanel>\n\n  <!-- PrimeNG Virtual Table -->\n  <p-table [value]=\"visibleRows\"\n           [columns]=\"headers\"\n           [virtualScroll]=\"true\"\n           [virtualScrollItemSize]=\"23\"\n           [scrollable]=\"true\"\n           scrollHeight=\"flex\"\n           [resizableColumns]=\"true\"\n           columnResizeMode=\"expand\"\n           [reorderableColumns]=\"true\"\n           [contextMenu]=\"cm\"\n           [(contextMenuSelection)]=\"contextSelectedRow\"\n           styleClass=\"p-datatable-gridlines p-datatable-sm sutram-grid-table\">\n\n    <!-- Table Header Row -->\n    <ng-template pTemplate=\"header\" let-columns>\n      <tr>\n        <!-- Interactive Corner Config Trigger (#) -->\n        <th class=\"corner-th corner-config-th\" pFrozenColumn style=\"width: 48px; min-width: 48px; text-align: center;\">\n          <div style=\"display: flex; align-items: center; justify-content: center;\">\n            <i class=\"pi pi-cog corner-cog-icon\" style=\"font-size: 13px; color: var(--text-muted, #64748b);\"></i>\n          </div>\n        </th>\n\n        <!-- Dynamic Schema Columns with Letters (A, B, C...) -->\n        <th *ngFor=\"let col of columns; let idx = index\"\n            pResizableColumn\n            pReorderableColumn\n            [style.width.px]=\"getColumnWidth(col)\"\n            [style.min-width.px]=\"getColumnWidth(col)\"\n            [style.max-width.px]=\"getColumnWidth(col)\"\n            class=\"sutram-th\"\n            [class.sortable-th]=\"state.sortingEnabled()\"\n            (click)=\"onHeaderClick(col)\">\n          <div style=\"display: flex; justify-content: space-between; align-items: center; position: relative; width: 100%;\">\n            <span class=\"col-header-title text-truncate d-flex align-items-center\" [title]=\"col.description || col.name\">\n              <strong style=\"color: var(--text-muted, #64748b); font-size: 11px; margin-right: 5px;\">{{ getColLetter(idx) }}</strong>\n              <span class=\"text-truncate\">{{ col.name }}</span>\n              <span *ngIf=\"col.not_null\" style=\"color: #ef4444; margin-left: 2px;\">*</span>\n            </span>\n\n            <!-- Header Action Controls: Sort Trigger, Filter Trigger & FK Pill -->\n            <div class=\"col-header-controls d-flex align-items-center\" (click)=\"$event.stopPropagation()\">\n              <span *ngIf=\"col.type === 'ref' || col.ref_table\"\n                    style=\"font-size: 9px; padding: 1px 4px; background: rgba(59, 130, 246, 0.15); color: #2563eb; border-radius: 3px; font-weight: 600; margin-right: 4px;\"\n                    [title]=\"col.ref_table || col.name\">\n                {{ col.ref_table || col.name }}\n              </span>\n\n              <span *ngIf=\"state.sortingEnabled()\"\n                    class=\"col-sort-trigger\"\n                    [class.is-sorted]=\"state.activeSort()?.colKey === col.name\"\n                    (click)=\"onHeaderClick(col)\"\n                    [title]=\"state.activeSort()?.colKey === col.name ? (state.activeSort()?.order === 'ASC' ? 'Sorted: ASC' : 'Sorted: DESC') : 'Sort'\">\n                <i class=\"pi\"\n                   [ngClass]=\"state.activeSort()?.colKey === col.name\n                     ? (state.activeSort()?.order === 'ASC' ? 'pi-sort-amount-up-alt text-primary' : 'pi-sort-amount-down text-primary')\n                     : 'pi-sort-alt text-muted'\"></i>\n              </span>\n\n              <span *ngIf=\"state.filtersEnabled()\"\n                    class=\"col-filter-trigger\"\n                    [class.is-filtered]=\"isColumnFiltered(col.name)\"\n                    (click)=\"openColumnFilter($event, col, colFilterOp)\"\n                    [title]=\"isColumnFiltered(col.name) ? 'Filter Active' : 'Filter'\">\n                <i class=\"pi\" [ngClass]=\"isColumnFiltered(col.name) ? 'pi-filter-fill text-primary' : 'pi-filter'\"></i>\n              </span>\n            </div>\n          </div>\n        </th>\n      </tr>\n    </ng-template>\n\n    <!-- Table Body Rows -->\n    <ng-template pTemplate=\"body\" let-row let-rowIndex=\"rowIndex\" let-columns=\"columns\">\n      <tr [pContextMenuRow]=\"row\"\n          [class.row-new]=\"row.isNew\"\n          [class.row-edited]=\"!row.isNew && row.isModified\"\n          [class.row-has-error]=\"row.hasError\"\n          [class.row-synced]=\"row.isSynced\">\n\n        <!-- Sticky Row Number TD (48px) -->\n        <td class=\"row-num-td\"\n            pFrozenColumn\n            style=\"width: 48px; min-width: 48px; max-width: 48px; text-align: center;\"\n            (contextmenu)=\"openRowContextMenu($event, row, cm)\">\n          <span *ngIf=\"row.isNew\" style=\"font-size: 10px; margin-right: 3px; font-weight: 700; color: #15803d;\">+</span>\n          <span *ngIf=\"!row.isNew && row.isModified\" style=\"font-size: 10px; margin-right: 3px; font-weight: 700; color: #b45309;\">\u2022</span>\n          <span class=\"row-num-text\">{{ row.rowNum }}</span>\n        </td>\n\n        <!-- Compact Data Cells (23px height) -->\n        <td *ngFor=\"let col of columns\"\n            [pEditableColumn]=\"row.cells[col.name]?.value\"\n            [style.width.px]=\"getColumnWidth(col)\"\n            [style.min-width.px]=\"getColumnWidth(col)\"\n            [style.max-width.px]=\"getColumnWidth(col)\"\n            (click)=\"onCellClick(rowIndex, col.name)\">\n\n          <div class=\"cell-box\"\n               [class.cell-active]=\"state.selectedCell()?.rowIdx === rowIndex && state.selectedCell()?.colKey === col.name\"\n               [class.cell-bad]=\"!row.cells[col.name]?.isValid\"\n               [class.cell-edited]=\"row.cells[col.name]?.isModified\"\n               [class.cell-new]=\"row.isNew\"\n               [title]=\"row.cells[col.name]?.errorMsg || ''\">\n\n            <p-cellEditor>\n              <!-- In-Cell Edit Mode -->\n              <ng-template pTemplate=\"input\">\n                <p-autoComplete *ngIf=\"col.type === 'ref' || col.ref_table; else plainInput\"\n                                [(ngModel)]=\"row.cells[col.name].value\"\n                                [suggestions]=\"filteredSuggestions\"\n                                (completeMethod)=\"searchRefOptions($event, col, row)\"\n                                field=\"display\"\n                                [dropdown]=\"true\"\n                                [forceSelection]=\"false\"\n                                appendTo=\"body\"\n                                styleClass=\"sutram-cell-autocomplete\"\n                                (onSelect)=\"onRefSuggestionSelect($event, rowIndex, col.name, row)\"\n                                (onBlur)=\"onCellBlur(rowIndex, col.name, row)\"\n                                (keydown)=\"onCellKeydown($event, rowIndex, col.name, row)\">\n                  <ng-template let-item pTemplate=\"item\">\n                    <div class=\"d-flex align-items-center justify-content-between w-100 py-1\">\n                      <span class=\"fw-semibold\">{{ item.display }}</span>\n                      <span *ngIf=\"item.code\" class=\"badge bg-light text-muted ms-2\">{{ item.code }}</span>\n                    </div>\n                  </ng-template>\n                </p-autoComplete>\n\n                <ng-template #plainInput>\n                  <input type=\"text\"\n                         pInputText\n                         [(ngModel)]=\"row.cells[col.name].value\"\n                         class=\"raw-cell-editor\"\n                         (blur)=\"onCellBlur(rowIndex, col.name, row)\"\n                         (keydown)=\"onCellKeydown($event, rowIndex, col.name, row)\" />\n                </ng-template>\n              </ng-template>\n\n              <!-- In-Cell Normal Mode -->\n              <ng-template pTemplate=\"output\">\n                <span class=\"cell-value-text text-truncate\">{{ row.cells[col.name]?.value }}</span>\n              </ng-template>\n            </p-cellEditor>\n\n          </div>\n        </td>\n      </tr>\n    </ng-template>\n\n    <!-- Empty State Message -->\n    <ng-template pTemplate=\"emptymessage\">\n      <tr>\n        <td [attr.colspan]=\"headers.length + 1\" class=\"text-center py-4 text-muted\">\n          <i class=\"pi pi-file-excel me-2\" style=\"font-size: 16px;\"></i>\n          \u0915\u094B\u0908 \u0921\u0947\u091F\u093E \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u090A\u092A\u0930 \u0938\u0947 Excel \u092B\u093C\u093E\u0907\u0932 \u0916\u094B\u0932\u0947\u0902 \u092F\u093E 'Load Data' \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964\n        </td>\n      </tr>\n    </ng-template>\n\n  </p-table>\n\n  <!-- Inline \"Solve All\" Batch Mistake Prompt Modal -->\n  <div *ngIf=\"promptState.visible\" class=\"inline-solve-prompt card shadow-lg p-3\">\n    <div class=\"d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom\">\n      <div class=\"d-flex align-items-center gap-2\">\n        <i class=\"pi pi-bolt text-warning\" style=\"font-size: 16px;\"></i>\n        <strong class=\"fs-7\">\u0938\u094D\u092E\u093E\u0930\u094D\u091F \u092C\u0948\u091A \u0938\u0941\u0927\u093E\u0930 (Solve All Matches)</strong>\n      </div>\n      <button type=\"button\" class=\"btn-close\" (click)=\"dismissPrompt()\"></button>\n    </div>\n\n    <div class=\"prompt-body text-start mb-3\">\n      <p class=\"small text-muted mb-2\">\n        \u0906\u092A\u0928\u0947 \u092A\u0902\u0915\u094D\u0924\u093F <strong>#{{ promptState.rowIdx + 1 }}</strong> \u092E\u0947\u0902 '<strong>{{ promptState.originalBadValue }}</strong>' \u0915\u094B \u092C\u0926\u0932\u0915\u0930\n        '<strong>{{ promptState.newSelectedDisplay }}</strong>' \u091A\u0941\u0928\u093E \u0939\u0948\u0964\n      </p>\n      <div class=\"alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 m-0\">\n        <i class=\"pi pi-info-circle\"></i>\n        <span>\n          \u0915\u0949\u0932\u092E <strong>{{ promptState.colKey }}</strong> \u092E\u0947\u0902 <strong>{{ promptState.matchingCount }}</strong> \u0905\u0928\u094D\u092F \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u094B\u0902 \u092E\u0947\u0902 \u092D\u0940 \u092F\u0939\u0940 \u0905\u092E\u093E\u0928\u094D\u092F \u092E\u093E\u0928 \u0939\u0948\u0964\n        </span>\n      </div>\n      <div class=\"form-check mt-2\">\n        <input class=\"form-check-input\" type=\"checkbox\" id=\"chkDict\" [(ngModel)]=\"promptState.saveToDictionary\">\n        <label class=\"form-check-label small cursor-pointer\" for=\"chkDict\">\n          \u092D\u0935\u093F\u0937\u094D\u092F \u0915\u0947 \u0932\u093F\u090F \u0921\u093F\u0915\u094D\u0936\u0928\u0930\u0940 \u092E\u0947\u0902 \u0938\u0939\u0947\u091C\u0947\u0902 (Save alias mapping to dictionary)\n        </label>\n      </div>\n    </div>\n\n    <div class=\"prompt-actions d-flex justify-content-end gap-2\">\n      <button type=\"button\" class=\"btn btn-sm btn-outline-secondary\" (click)=\"applySingleCellOnly()\">\n        \u0915\u0947\u0935\u0932 \u0907\u0938\u0940 \u092A\u0902\u0915\u094D\u0924\u093F \u092E\u0947\u0902 (Single Row Only)\n      </button>\n      <button type=\"button\" class=\"btn btn-sm btn-success\" (click)=\"confirmSolveAll()\">\n        \u0938\u092D\u0940 {{ promptState.matchingCount + 1 }} \u0938\u0941\u0927\u093E\u0930\u0947\u0902 (Solve All)\n      </button>\n    </div>\n  </div>\n\n</div>\n", styles: ["/**\n * sutram-grid.component.scss\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n * Pixel-Perfect Enterprise PrimeNG Virtual Table Styles.\n * Exact replication of Sutram Excel Studio v2.0 Grid:\n * Big Header Row (38px) + Compact Data Cells (23px).\n * Active cell blue box-shadow highlight, row status borders.\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n */\n\n.sutram-grid-wrapper {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n\n  ::ng-deep .p-datatable-wrapper {\n    height: 100% !important;\n  }\n\n  /* Big Header Row (38px) */\n  ::ng-deep .p-datatable-thead > tr > th {\n    position: sticky;\n    top: 0;\n    z-index: 20;\n    background: var(--header-bg, #f1f5f9) !important;\n    color: var(--header-text, #1e293b) !important;\n    font-weight: 700 !important;\n    font-size: 13px !important;\n    height: var(--header-height, 38px) !important;\n    padding: 6px 10px !important;\n    border-right: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    border-bottom: 2px solid rgba(125, 125, 125, 0.35) !important;\n    white-space: nowrap !important;\n    user-select: none;\n    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);\n\n    &.sortable-th {\n      cursor: pointer !important;\n      transition: background-color 0.15s ease;\n\n      &:hover {\n        background-color: rgba(125, 125, 125, 0.1) !important;\n      }\n    }\n  }\n\n  /* Corner Config \u2699\uFE0F Trigger */\n  ::ng-deep th.corner-th {\n    width: 48px !important;\n    min-width: 48px !important;\n    max-width: 48px !important;\n    left: 0;\n    z-index: 25 !important;\n    text-align: center !important;\n    border-right: 2px solid rgba(125, 125, 125, 0.35) !important;\n    cursor: pointer;\n\n    &:hover .corner-cog-icon {\n      color: var(--primary, #4f46e5) !important;\n      transform: rotate(45deg);\n      transition: all 0.2s ease;\n    }\n  }\n\n  /* Column Header Controls */\n  .col-header-controls {\n    display: flex;\n    align-items: center;\n    gap: 3px;\n    margin-left: 4px;\n    flex-shrink: 0;\n  }\n  .col-sort-trigger, .col-filter-trigger {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 18px;\n    height: 18px;\n    border-radius: 3px;\n    cursor: pointer;\n    color: var(--text-muted, #64748b);\n    opacity: 0.65;\n    transition: all 0.12s ease;\n    font-size: 11px;\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.18);\n      opacity: 1;\n      color: var(--text, #0f172a);\n    }\n    &.is-sorted, &.is-filtered {\n      color: var(--primary, #4f46e5) !important;\n      opacity: 1 !important;\n      font-weight: 700;\n      background: var(--primary-soft, #e0e7ff);\n    }\n  }\n\n  /* Compact Small Data Cells (23px height) */\n  ::ng-deep .p-datatable-tbody > tr > td {\n    height: var(--cell-height, 23px) !important;\n    padding: 0 !important;\n    border-right: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    border-bottom: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    vertical-align: middle;\n    font-size: 11.5px;\n  }\n\n  /* Sticky Row Number TD (48px) */\n  ::ng-deep td.row-num-td {\n    position: sticky;\n    left: 0;\n    z-index: 15;\n    width: 48px !important;\n    min-width: 48px !important;\n    max-width: 48px !important;\n    text-align: center;\n    background: var(--header-bg, #f1f5f9) !important;\n    border-right: 2px solid rgba(125, 125, 125, 0.35) !important;\n    color: var(--text-muted, #64748b);\n    font-size: 10.5px;\n    font-weight: 600;\n    user-select: none;\n    cursor: pointer;\n\n    &:hover {\n      background: rgba(59, 130, 246, 0.15) !important;\n    }\n  }\n\n  /* Cell Box & Excel Active Cell Blue Outline */\n  .cell-box {\n    height: var(--cell-height, 23px);\n    padding: 1px 6px;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    display: flex;\n    align-items: center;\n    cursor: cell;\n    width: 100%;\n\n    &.cell-active {\n      box-shadow: inset 0 0 0 2px #3b82f6 !important;\n      z-index: 10;\n    }\n    &.cell-bad {\n      background-color: rgba(244, 63, 94, 0.18) !important;\n      color: #f43f5e !important;\n      font-weight: 600;\n      box-shadow: inset 0 0 0 1px #f43f5e;\n    }\n    &.cell-edited {\n      background-color: var(--cell-edited-bg, #fef9c3) !important;\n      box-shadow: inset 0 0 0 1px rgba(234, 179, 8, 0.45);\n    }\n    &.cell-new {\n      background-color: var(--row-new-bg, #dcfce7) !important;\n    }\n  }\n\n  /* Eye Protect Warm Yellow for Edited Rows */\n  ::ng-deep tr.row-edited td {\n    background-color: var(--row-edited-bg, #fffbeb);\n\n    &.row-num-td {\n      background-color: rgba(234, 179, 8, 0.2) !important;\n      color: #b45309 !important;\n      font-weight: 700;\n      border-left: 3px solid var(--cell-edited-border, #eab308) !important;\n    }\n  }\n\n  /* Soft Light Green Shade for New Added Rows */\n  ::ng-deep tr.row-new td {\n    background-color: var(--row-new-bg, #dcfce7);\n\n    &.row-num-td {\n      background-color: rgba(34, 197, 94, 0.2) !important;\n      color: #15803d !important;\n      font-weight: 700;\n      border-left: 3px solid var(--row-new-border, #22c55e) !important;\n    }\n  }\n\n  .raw-cell-editor {\n    width: 100%;\n    height: var(--cell-height, 23px);\n    border: none;\n    outline: none;\n    background: transparent;\n    color: inherit;\n    font-family: inherit;\n    font-size: 11.5px;\n    padding: 1px 6px;\n  }\n}\n\n/* Inline Batch Mistake Prompt Modal */\n.inline-solve-prompt {\n  position: fixed;\n  bottom: 70px;\n  right: 25px;\n  z-index: 2100;\n  width: 440px;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 8px;\n  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);\n  animation: promptSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);\n}\n@keyframes promptSlideUp {\n  from { opacity: 0; transform: translateY(16px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n/* Column Header Filter Popover */\n::ng-deep .sutram-col-filter-popover {\n  width: 270px;\n  font-size: 12px;\n\n  .p-overlaypanel-content {\n    padding: 0 !important;\n  }\n}\n.filter-popover-content {\n  display: flex;\n  flex-direction: column;\n\n  .popover-header {\n    padding: 8px 12px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    background: rgba(125, 125, 125, 0.04);\n  }\n  .popover-search-box {\n    position: relative;\n    padding: 6px 8px;\n\n    .search-icon {\n      position: absolute;\n      left: 14px;\n      top: 13px;\n      font-size: 11px;\n      color: var(--text-muted, #64748b);\n    }\n    .popover-search-input {\n      padding-left: 24px;\n      font-size: 11.5px;\n      height: 26px;\n      border-radius: 4px;\n    }\n  }\n  .popover-checklist-items {\n    max-height: 180px;\n    overflow-y: auto;\n  }\n  .checklist-item:hover {\n    background: rgba(125, 125, 125, 0.08);\n  }\n  .popover-footer {\n    padding: 8px 10px;\n    border-top: 1px solid var(--surface-border, #e2e8f0);\n  }\n}\n"] }]
    }], function () { return [{ type: i1.SutramExcelStateService }, { type: i2.SutramClipboardService }, { type: i3.SutramAuditService }, { type: i4.SutramRefCacheService }, { type: i0.ElementRef }]; }, { headers: [{
            type: Input
        }], rows: [{
            type: Input
        }], filterOnlyErrors: [{
            type: Input
        }], enableDelete: [{
            type: Input
        }], cellChanged: [{
            type: Output
        }], solveAllTriggered: [{
            type: Output
        }], loadMore: [{
            type: Output
        }], filterChanged: [{
            type: Output
        }], sortChanged: [{
            type: Output
        }] }); })();
