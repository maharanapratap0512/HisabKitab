/**
 * sutram-grid.component.ts
 * ─────────────────────────────────────────────────────────────
 * Interactive Spreadsheet Grid Component for Sutram Excel Studio.
 * Features:
 *  - Excel-grade single-click cell selection & Formula bar sync
 *  - Double-click, Enter, F2, or direct-typing inline cell editing
 *  - Smart FK Reference autocomplete with bilingual search & keyboard selection
 *  - Pixel-perfect right-click context menu (Row & Cell actions, Duplicate, Delete)
 *  - Eye-protect warm yellow for edited cells, light green for new rows
 *  - Inline "Solve All Mistakes" batch prompt modal
 * ─────────────────────────────────────────────────────────────
 */
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener } from '@angular/core';
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
import * as i9 from "primeng/overlaypanel";
function SutramGridComponent_div_1_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 14);
    i0.ɵɵlistener("click", function SutramGridComponent_div_1_ng_container_1_Template_div_click_1_listener() { i0.ɵɵrestoreView(_r13); const ctx_r12 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r12.copyActiveCell()); });
    i0.ɵɵelement(2, "i", 18);
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "\u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902 (Copy)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "kbd", 19);
    i0.ɵɵtext(6, "Ctrl+C");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 14);
    i0.ɵɵlistener("click", function SutramGridComponent_div_1_ng_container_1_Template_div_click_7_listener() { i0.ɵɵrestoreView(_r13); const ctx_r14 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r14.cutActiveCell()); });
    i0.ɵɵelement(8, "i", 20);
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10, "\u0915\u091F \u0915\u0930\u0947\u0902 (Cut)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "kbd", 19);
    i0.ɵɵtext(12, "Ctrl+X");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div", 14);
    i0.ɵɵlistener("click", function SutramGridComponent_div_1_ng_container_1_Template_div_click_13_listener() { i0.ɵɵrestoreView(_r13); const ctx_r15 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r15.pasteToActiveCell()); });
    i0.ɵɵelement(14, "i", 21);
    i0.ɵɵelementStart(15, "span");
    i0.ɵɵtext(16, "\u092A\u0947\u0938\u094D\u091F \u0915\u0930\u0947\u0902 (Paste)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "kbd", 19);
    i0.ɵɵtext(18, "Ctrl+V");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(19, "div", 22);
    i0.ɵɵelementContainerEnd();
} }
function SutramGridComponent_div_1_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 14);
    i0.ɵɵlistener("click", function SutramGridComponent_div_1_ng_container_2_Template_div_click_1_listener() { i0.ɵɵrestoreView(_r17); const ctx_r16 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r16.copySelectedRow()); });
    i0.ɵɵelement(2, "i", 18);
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "\u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902 (Copy)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(5, "div", 22);
    i0.ɵɵelementContainerEnd();
} }
function SutramGridComponent_div_1_ng_container_15_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelement(1, "div", 22);
    i0.ɵɵelementStart(2, "div", 23);
    i0.ɵɵlistener("click", function SutramGridComponent_div_1_ng_container_15_Template_div_click_2_listener() { i0.ɵɵrestoreView(_r19); const ctx_r18 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r18.deleteRow()); });
    i0.ɵɵelement(3, "i", 24);
    i0.ɵɵelementStart(4, "span", 25);
    i0.ɵɵtext(5, "\u092A\u0902\u0915\u094D\u0924\u093F \u0939\u091F\u093E\u090F\u0902 (Delete Row)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementContainerEnd();
} }
function SutramGridComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵlistener("click", function SutramGridComponent_div_1_Template_div_click_0_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵtemplate(1, SutramGridComponent_div_1_ng_container_1_Template, 20, 0, "ng-container", 13);
    i0.ɵɵtemplate(2, SutramGridComponent_div_1_ng_container_2_Template, 6, 0, "ng-container", 13);
    i0.ɵɵelementStart(3, "div", 14);
    i0.ɵɵlistener("click", function SutramGridComponent_div_1_Template_div_click_3_listener() { i0.ɵɵrestoreView(_r22); const ctx_r21 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r21.insertRowAbove()); });
    i0.ɵɵelement(4, "i", 15);
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6, "\u090A\u092A\u0930 \u092A\u0902\u0915\u094D\u0924\u093F \u091C\u094B\u0921\u093C\u0947\u0902 (Insert Row Above)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 14);
    i0.ɵɵlistener("click", function SutramGridComponent_div_1_Template_div_click_7_listener() { i0.ɵɵrestoreView(_r22); const ctx_r23 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r23.insertRowBelow()); });
    i0.ɵɵelement(8, "i", 16);
    i0.ɵɵelementStart(9, "span");
    i0.ɵɵtext(10, "\u0928\u0940\u091A\u0947 \u092A\u0902\u0915\u094D\u0924\u093F \u091C\u094B\u0921\u093C\u0947\u0902 (Insert Row Below)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 14);
    i0.ɵɵlistener("click", function SutramGridComponent_div_1_Template_div_click_11_listener() { i0.ɵɵrestoreView(_r22); const ctx_r24 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r24.duplicateRow()); });
    i0.ɵɵelement(12, "i", 17);
    i0.ɵɵelementStart(13, "span");
    i0.ɵɵtext(14, "\u092A\u0902\u0915\u094D\u0924\u093F \u0921\u0941\u092A\u094D\u0932\u093F\u0915\u0947\u091F \u0915\u0930\u0947\u0902 (Duplicate Row)");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(15, SutramGridComponent_div_1_ng_container_15_Template, 6, 0, "ng-container", 13);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("top", ctx_r0.contextMenuState.y, "px")("left", ctx_r0.contextMenuState.x, "px");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r0.contextMenuState.type === "cell");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r0.contextMenuState.type === "row");
    i0.ɵɵadvance(13);
    i0.ɵɵproperty("ngIf", ctx_r0.enableDelete);
} }
function SutramGridComponent_div_2_div_7_span_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r27 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(opt_r27.code);
} }
function SutramGridComponent_div_2_div_7_Template(rf, ctx) { if (rf & 1) {
    const _r32 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 32);
    i0.ɵɵlistener("mousedown", function SutramGridComponent_div_2_div_7_Template_div_mousedown_0_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r32); const opt_r27 = restoredCtx.$implicit; const ctx_r31 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r31.selectDropdownOption(opt_r27, $event, true)); });
    i0.ɵɵelementStart(1, "span", 33);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(3, SutramGridComponent_div_2_div_7_span_3_Template, 2, 1, "span", 34);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opt_r27 = ctx.$implicit;
    const i_r28 = ctx.index;
    const ctx_r25 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("highlighted", i_r28 === ctx_r25.highlightedIdx);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(opt_r27.display);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", opt_r27.code);
} }
function SutramGridComponent_div_2_div_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 36);
    i0.ɵɵelement(1, "i", 37);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r26 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" No matching ", (ctx_r26.editingColDef == null ? null : ctx_r26.editingColDef.ref_table) || (ctx_r26.editingColDef == null ? null : ctx_r26.editingColDef.name), " found ");
} }
function SutramGridComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 26);
    i0.ɵɵlistener("mousedown", function SutramGridComponent_div_2_Template_div_mousedown_0_listener($event) { return $event.preventDefault(); });
    i0.ɵɵelementStart(1, "div", 27)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "small", 28);
    i0.ɵɵtext(5, "\u2191\u2193 to navigate, Enter to select");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 29);
    i0.ɵɵtemplate(7, SutramGridComponent_div_2_div_7_Template, 4, 4, "div", 30);
    i0.ɵɵtemplate(8, SutramGridComponent_div_2_div_8_Template, 3, 1, "div", 31);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("top", ctx_r1.dropdownPos.top, "px")("left", ctx_r1.dropdownPos.left, "px")("min-width", ctx_r1.dropdownPos.minWidth, "px");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("Select ", (ctx_r1.editingColDef == null ? null : ctx_r1.editingColDef.ref_table) || (ctx_r1.editingColDef == null ? null : ctx_r1.editingColDef.name), " (", ctx_r1.dropdownOptions.length, ")");
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngForOf", ctx_r1.dropdownOptions);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r1.dropdownOptions.length === 0);
} }
function SutramGridComponent_ng_template_5_div_0_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 68);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r35 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", ctx_r35.activeFilterCol.ref_table || "ref", " ");
} }
function SutramGridComponent_ng_template_5_div_0_button_12_Template(rf, ctx) { if (rf & 1) {
    const _r40 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 69);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_button_12_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r40); const ctx_r39 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r39.filterChecklistSearch = ""); });
    i0.ɵɵelement(1, "i", 46);
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_5_div_0_div_28_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 77);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r41 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(item_r41.code);
} }
function SutramGridComponent_ng_template_5_div_0_div_28_span_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 78);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r41 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(item_r41.count);
} }
function SutramGridComponent_ng_template_5_div_0_div_28_Template(rf, ctx) { if (rf & 1) {
    const _r47 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 70);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_div_28_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r47); const item_r41 = restoredCtx.$implicit; const ctx_r46 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r46.toggleChecklistItem(item_r41.value)); });
    i0.ɵɵelementStart(1, "div", 71)(2, "input", 72);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_div_28_Template_input_click_2_listener($event) { return $event.stopPropagation(); })("change", function SutramGridComponent_ng_template_5_div_0_div_28_Template_input_change_2_listener() { const restoredCtx = i0.ɵɵrestoreView(_r47); const item_r41 = restoredCtx.$implicit; const ctx_r49 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r49.toggleChecklistItem(item_r41.value)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 73);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 74);
    i0.ɵɵtemplate(6, SutramGridComponent_ng_template_5_div_0_div_28_span_6_Template, 2, 1, "span", 75);
    i0.ɵɵtemplate(7, SutramGridComponent_ng_template_5_div_0_div_28_span_7_Template, 2, 1, "span", 76);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r41 = ctx.$implicit;
    const ctx_r37 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r37.selectedChecklistValues.has(item_r41.value));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("title", item_r41.display);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", item_r41.display, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", item_r41.code);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", item_r41.count !== undefined && item_r41.count > 0);
} }
function SutramGridComponent_ng_template_5_div_0_div_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 79);
    i0.ɵɵelement(1, "i", 37);
    i0.ɵɵtext(2, " No matching values ");
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_5_div_0_Template(rf, ctx) { if (rf & 1) {
    const _r51 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 39)(1, "div", 40)(2, "div", 41);
    i0.ɵɵelement(3, "i", 42);
    i0.ɵɵelementStart(4, "span", 43);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(6, SutramGridComponent_ng_template_5_div_0_span_6_Template, 2, 1, "span", 44);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 45);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r51); i0.ɵɵnextContext(2); const _r2 = i0.ɵɵreference(4); return i0.ɵɵresetView(_r2.hide()); });
    i0.ɵɵelement(8, "i", 46);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 47);
    i0.ɵɵelement(10, "i", 48);
    i0.ɵɵelementStart(11, "input", 49);
    i0.ɵɵlistener("ngModelChange", function SutramGridComponent_ng_template_5_div_0_Template_input_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r51); const ctx_r52 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r52.filterChecklistSearch = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(12, SutramGridComponent_ng_template_5_div_0_button_12_Template, 2, 0, "button", 50);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 51)(14, "label", 52)(15, "input", 53);
    i0.ɵɵlistener("change", function SutramGridComponent_ng_template_5_div_0_Template_input_change_15_listener($event) { i0.ɵɵrestoreView(_r51); const ctx_r53 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r53.toggleSelectAllChecklist($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17, "(Select All)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "div", 54)(19, "button", 55);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_Template_button_click_19_listener() { i0.ɵɵrestoreView(_r51); const ctx_r54 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r54.selectAllFilteredItems()); });
    i0.ɵɵtext(20, "All");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "span", 56);
    i0.ɵɵtext(22, "\u00B7");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "button", 55);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_Template_button_click_23_listener() { i0.ɵɵrestoreView(_r51); const ctx_r55 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r55.clearAllFilteredItems()); });
    i0.ɵɵtext(24, "Clear");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(25, "span", 57);
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(27, "div", 58);
    i0.ɵɵtemplate(28, SutramGridComponent_ng_template_5_div_0_div_28_Template, 8, 5, "div", 59);
    i0.ɵɵtemplate(29, SutramGridComponent_ng_template_5_div_0_div_29_Template, 3, 0, "div", 60);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "div", 61)(31, "button", 62);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_Template_button_click_31_listener() { i0.ɵɵrestoreView(_r51); const ctx_r56 = i0.ɵɵnextContext(2); const _r2 = i0.ɵɵreference(4); return i0.ɵɵresetView(ctx_r56.clearCurrentColFilter(_r2)); });
    i0.ɵɵelement(32, "i", 63);
    i0.ɵɵtext(33, "Reset ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "div", 64)(35, "button", 65);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_Template_button_click_35_listener() { i0.ɵɵrestoreView(_r51); i0.ɵɵnextContext(2); const _r2 = i0.ɵɵreference(4); return i0.ɵɵresetView(_r2.hide()); });
    i0.ɵɵtext(36, " Cancel ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "button", 66);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_5_div_0_Template_button_click_37_listener() { i0.ɵɵrestoreView(_r51); const ctx_r58 = i0.ɵɵnextContext(2); const _r2 = i0.ɵɵreference(4); return i0.ɵɵresetView(ctx_r58.applyCurrentColFilter(_r2)); });
    i0.ɵɵelement(38, "i", 67);
    i0.ɵɵtext(39, " Apply ");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r34 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", ctx_r34.activeFilterCol.name);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(ctx_r34.activeFilterCol.name);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r34.activeFilterCol.ref_table || ctx_r34.activeFilterCol.type === "ref");
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngModel", ctx_r34.filterChecklistSearch);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r34.filterChecklistSearch);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("checked", ctx_r34.isAllChecklistSelected());
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate2(" ", ctx_r34.selectedChecklistValues.size, " / ", ctx_r34.currentChecklistItems.length, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r34.filteredChecklistItems);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r34.filteredChecklistItems.length === 0);
} }
function SutramGridComponent_ng_template_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, SutramGridComponent_ng_template_5_div_0_Template, 40, 10, "div", 38);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("ngIf", ctx_r3.activeFilterCol);
} }
function SutramGridComponent_ng_template_8_th_4_span_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 96);
    i0.ɵɵtext(1, "*");
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_8_th_4_span_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 97);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r61 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("title", "Reference: " + (col_r61.ref_table || col_r61.group));
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", col_r61.ref_table || col_r61.group, " ");
} }
function SutramGridComponent_ng_template_8_th_4_span_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 98);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r61 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("title", "FK: " + (col_r61.ref_table || col_r61.name));
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", col_r61.ref_table || col_r61.name, " ");
} }
function SutramGridComponent_ng_template_8_th_4_span_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 99);
    i0.ɵɵtext(1, " id ");
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_8_th_4_span_12_Template(rf, ctx) { if (rf & 1) {
    const _r73 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 100);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_8_th_4_span_12_Template_span_click_0_listener() { i0.ɵɵrestoreView(_r73); const col_r61 = i0.ɵɵnextContext().$implicit; const ctx_r71 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r71.onHeaderClick(col_r61)); });
    i0.ɵɵelement(1, "i", 101);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r61 = i0.ɵɵnextContext().$implicit;
    const ctx_r67 = i0.ɵɵnextContext(2);
    let tmp_0_0;
    let tmp_1_0;
    let tmp_2_0;
    i0.ɵɵclassProp("is-sorted", ((tmp_0_0 = ctx_r67.state.activeSort()) == null ? null : tmp_0_0.colKey) === (col_r61.key || col_r61.name));
    i0.ɵɵproperty("title", ((tmp_1_0 = ctx_r67.state.activeSort()) == null ? null : tmp_1_0.colKey) === (col_r61.key || col_r61.name) ? ((tmp_1_0 = ctx_r67.state.activeSort()) == null ? null : tmp_1_0.order) === "ASC" ? "Sorted: ASC" : "Sorted: DESC" : "Sort");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ((tmp_2_0 = ctx_r67.state.activeSort()) == null ? null : tmp_2_0.colKey) === (col_r61.key || col_r61.name) ? ((tmp_2_0 = ctx_r67.state.activeSort()) == null ? null : tmp_2_0.order) === "ASC" ? "pi-sort-amount-up-alt text-primary" : "pi-sort-amount-down text-primary" : "pi-sort-alt text-muted");
} }
function SutramGridComponent_ng_template_8_th_4_span_13_Template(rf, ctx) { if (rf & 1) {
    const _r77 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 102);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_8_th_4_span_13_Template_span_click_0_listener($event) { i0.ɵɵrestoreView(_r77); const col_r61 = i0.ɵɵnextContext().$implicit; const ctx_r75 = i0.ɵɵnextContext(2); const _r2 = i0.ɵɵreference(4); return i0.ɵɵresetView(ctx_r75.openColumnFilter($event, col_r61, _r2)); });
    i0.ɵɵelement(1, "i", 101);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r61 = i0.ɵɵnextContext().$implicit;
    const ctx_r68 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("is-filtered", ctx_r68.isColumnFiltered(col_r61.key || col_r61.name));
    i0.ɵɵproperty("title", ctx_r68.isColumnFiltered(col_r61.key || col_r61.name) ? "Filter Active" : "Filter");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngClass", ctx_r68.isColumnFiltered(col_r61.key || col_r61.name) ? "pi-filter-fill text-primary" : "pi-filter");
} }
function SutramGridComponent_ng_template_8_th_4_Template(rf, ctx) { if (rf & 1) {
    const _r80 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "th", 84);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_8_th_4_Template_th_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r80); const col_r61 = restoredCtx.$implicit; const ctx_r79 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r79.onHeaderClick(col_r61)); });
    i0.ɵɵelementStart(1, "div", 85)(2, "span", 86)(3, "strong", 87);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 88);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(7, SutramGridComponent_ng_template_8_th_4_span_7_Template, 2, 0, "span", 89);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 90);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_8_th_4_Template_div_click_8_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵtemplate(9, SutramGridComponent_ng_template_8_th_4_span_9_Template, 2, 2, "span", 91);
    i0.ɵɵtemplate(10, SutramGridComponent_ng_template_8_th_4_span_10_Template, 2, 2, "span", 92);
    i0.ɵɵtemplate(11, SutramGridComponent_ng_template_8_th_4_span_11_Template, 2, 0, "span", 93);
    i0.ɵɵtemplate(12, SutramGridComponent_ng_template_8_th_4_span_12_Template, 2, 4, "span", 94);
    i0.ɵɵtemplate(13, SutramGridComponent_ng_template_8_th_4_span_13_Template, 2, 4, "span", 95);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const col_r61 = ctx.$implicit;
    const idx_r62 = ctx.index;
    const ctx_r60 = i0.ɵɵnextContext(2);
    i0.ɵɵstyleProp("width", ctx_r60.getColumnWidth(col_r61), "px")("min-width", ctx_r60.getColumnWidth(col_r61), "px")("max-width", ctx_r60.getColumnWidth(col_r61), "px");
    i0.ɵɵclassProp("sortable-th", ctx_r60.state.sortingEnabled());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("title", col_r61.description || col_r61.short_name || col_r61.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r60.getColLetter(idx_r62));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(col_r61.short_name || col_r61.name);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r61.not_null);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", col_r61.is_fk_subcol);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !col_r61.is_fk_subcol && (col_r61.type === "ref" || col_r61.ref_table || col_r61.is_fk_main));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", col_r61.is_fk_raw);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r60.state.sortingEnabled());
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r60.state.filtersEnabled());
} }
function SutramGridComponent_ng_template_8_Template(rf, ctx) { if (rf & 1) {
    const _r83 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "th", 80);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_8_Template_th_click_1_listener($event) { i0.ɵɵrestoreView(_r83); const ctx_r82 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r82.openConfig.emit($event)); });
    i0.ɵɵelementStart(2, "div", 81);
    i0.ɵɵelement(3, "i", 82);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(4, SutramGridComponent_ng_template_8_th_4_Template, 14, 17, "th", 83);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const columns_r59 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngForOf", columns_r59);
} }
function SutramGridComponent_ng_template_9_span_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 108);
    i0.ɵɵtext(1, "+");
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_9_span_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 109);
    i0.ɵɵtext(1, "\u2022");
    i0.ɵɵelementEnd();
} }
function SutramGridComponent_ng_template_9_td_6_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    const _r96 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "input", 113, 114);
    i0.ɵɵlistener("ngModelChange", function SutramGridComponent_ng_template_9_td_6_ng_container_2_Template_input_ngModelChange_1_listener($event) { i0.ɵɵrestoreView(_r96); const ctx_r95 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r95.editingValue = $event); })("input", function SutramGridComponent_ng_template_9_td_6_ng_container_2_Template_input_input_1_listener() { i0.ɵɵrestoreView(_r96); const col_r90 = i0.ɵɵnextContext().$implicit; const row_r84 = i0.ɵɵnextContext().$implicit; const ctx_r97 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r97.onEditorInput(ctx_r97.editingValue, col_r90, row_r84)); })("keydown", function SutramGridComponent_ng_template_9_td_6_ng_container_2_Template_input_keydown_1_listener($event) { i0.ɵɵrestoreView(_r96); const col_r90 = i0.ɵɵnextContext().$implicit; const ctx_r101 = i0.ɵɵnextContext(); const rowIndex_r85 = ctx_r101.rowIndex; const row_r84 = ctx_r101.$implicit; const ctx_r100 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r100.onCellEditorKeydown($event, rowIndex_r85, col_r90.key || col_r90.name, row_r84)); })("blur", function SutramGridComponent_ng_template_9_td_6_ng_container_2_Template_input_blur_1_listener() { i0.ɵɵrestoreView(_r96); const col_r90 = i0.ɵɵnextContext().$implicit; const ctx_r104 = i0.ɵɵnextContext(); const rowIndex_r85 = ctx_r104.rowIndex; const row_r84 = ctx_r104.$implicit; const ctx_r103 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r103.onCellEditorBlur(rowIndex_r85, col_r90.key || col_r90.name, row_r84)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r91 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngModel", ctx_r91.editingValue);
} }
function SutramGridComponent_ng_template_9_td_6_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 115);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r90 = i0.ɵɵnextContext().$implicit;
    const row_r84 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(row_r84.cells[col_r90.key || col_r90.name] == null ? null : row_r84.cells[col_r90.key || col_r90.name].value);
} }
function SutramGridComponent_ng_template_9_td_6_Template(rf, ctx) { if (rf & 1) {
    const _r110 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "td")(1, "div", 110);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_9_td_6_Template_div_click_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r110); const col_r90 = restoredCtx.$implicit; const rowIndex_r85 = i0.ɵɵnextContext().rowIndex; const ctx_r108 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r108.onCellClick(rowIndex_r85, col_r90.key || col_r90.name, $event)); })("dblclick", function SutramGridComponent_ng_template_9_td_6_Template_div_dblclick_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r110); const col_r90 = restoredCtx.$implicit; const ctx_r112 = i0.ɵɵnextContext(); const rowIndex_r85 = ctx_r112.rowIndex; const row_r84 = ctx_r112.$implicit; const ctx_r111 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r111.startCellEdit(rowIndex_r85, col_r90.key || col_r90.name, row_r84, $event)); })("contextmenu", function SutramGridComponent_ng_template_9_td_6_Template_div_contextmenu_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r110); const col_r90 = restoredCtx.$implicit; const ctx_r114 = i0.ɵɵnextContext(); const rowIndex_r85 = ctx_r114.rowIndex; const row_r84 = ctx_r114.$implicit; const ctx_r113 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r113.openCellContextMenu($event, rowIndex_r85, col_r90.key || col_r90.name, row_r84)); });
    i0.ɵɵtemplate(2, SutramGridComponent_ng_template_9_td_6_ng_container_2_Template, 3, 1, "ng-container", 111);
    i0.ɵɵtemplate(3, SutramGridComponent_ng_template_9_td_6_ng_template_3_Template, 2, 1, "ng-template", null, 112, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r90 = ctx.$implicit;
    const _r92 = i0.ɵɵreference(4);
    const ctx_r115 = i0.ɵɵnextContext();
    const rowIndex_r85 = ctx_r115.rowIndex;
    const row_r84 = ctx_r115.$implicit;
    const ctx_r89 = i0.ɵɵnextContext();
    let tmp_3_0;
    i0.ɵɵstyleProp("width", ctx_r89.getColumnWidth(col_r90), "px")("min-width", ctx_r89.getColumnWidth(col_r90), "px")("max-width", ctx_r89.getColumnWidth(col_r90), "px");
    i0.ɵɵadvance(1);
    i0.ɵɵclassProp("cell-active", ((tmp_3_0 = ctx_r89.state.selectedCell()) == null ? null : tmp_3_0.rowIdx) === rowIndex_r85 && ((tmp_3_0 = ctx_r89.state.selectedCell()) == null ? null : tmp_3_0.colKey) === (col_r90.key || col_r90.name))("cell-editing", ctx_r89.isCellEditing(rowIndex_r85, col_r90.key || col_r90.name))("cell-bad", !(row_r84.cells[col_r90.key || col_r90.name] == null ? null : row_r84.cells[col_r90.key || col_r90.name].isValid))("cell-edited", row_r84.cells[col_r90.key || col_r90.name] == null ? null : row_r84.cells[col_r90.key || col_r90.name].isModified)("cell-new", row_r84.isNew && ctx_r89.isRowPopulated(row_r84));
    i0.ɵɵproperty("title", (row_r84.cells[col_r90.key || col_r90.name] == null ? null : row_r84.cells[col_r90.key || col_r90.name].errorMessage) || "");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r89.isCellEditing(rowIndex_r85, col_r90.key || col_r90.name))("ngIfElse", _r92);
} }
function SutramGridComponent_ng_template_9_Template(rf, ctx) { if (rf & 1) {
    const _r117 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td", 103);
    i0.ɵɵlistener("click", function SutramGridComponent_ng_template_9_Template_td_click_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r117); const rowIndex_r85 = restoredCtx.rowIndex; const row_r84 = restoredCtx.$implicit; const ctx_r116 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r116.onRowHeaderClick(rowIndex_r85, row_r84, $event)); })("contextmenu", function SutramGridComponent_ng_template_9_Template_td_contextmenu_1_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r117); const row_r84 = restoredCtx.$implicit; const rowIndex_r85 = restoredCtx.rowIndex; const ctx_r118 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r118.openRowContextMenu($event, row_r84, rowIndex_r85)); });
    i0.ɵɵtemplate(2, SutramGridComponent_ng_template_9_span_2_Template, 2, 0, "span", 104);
    i0.ɵɵtemplate(3, SutramGridComponent_ng_template_9_span_3_Template, 2, 0, "span", 105);
    i0.ɵɵelementStart(4, "span", 106);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(6, SutramGridComponent_ng_template_9_td_6_Template, 5, 19, "td", 107);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r84 = ctx.$implicit;
    const rowIndex_r85 = ctx.rowIndex;
    const columns_r86 = ctx.columns;
    const ctx_r6 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("row-new", row_r84.isNew && ctx_r6.isRowPopulated(row_r84))("row-edited", !row_r84.isNew && row_r84.isModified)("row-has-error", row_r84.hasError)("row-synced", row_r84.isSynced)("row-selected", ctx_r6.selectedRowIdx === rowIndex_r85);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", row_r84.isNew && ctx_r6.isRowPopulated(row_r84));
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !row_r84.isNew && row_r84.isModified);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r84.rowNum);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", columns_r86);
} }
function SutramGridComponent_ng_template_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 116);
    i0.ɵɵelement(2, "i", 117);
    i0.ɵɵtext(3, " \u0915\u094B\u0908 \u0921\u0947\u091F\u093E \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u090A\u092A\u0930 \u0938\u0947 Excel \u092B\u093C\u093E\u0907\u0932 \u0916\u094B\u0932\u0947\u0902 \u092F\u093E 'Load Data' \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964 ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r7 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵattribute("colspan", ctx_r7.headers.length + 1);
} }
function SutramGridComponent_div_11_Template(rf, ctx) { if (rf & 1) {
    const _r120 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 118)(1, "div", 119)(2, "div", 120);
    i0.ɵɵelement(3, "i", 121);
    i0.ɵɵelementStart(4, "strong", 122);
    i0.ɵɵtext(5, "\u0938\u094D\u092E\u093E\u0930\u094D\u091F \u092C\u0948\u091A \u0938\u0941\u0927\u093E\u0930 (Solve All Matches)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 123);
    i0.ɵɵlistener("click", function SutramGridComponent_div_11_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r120); const ctx_r119 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r119.dismissPrompt()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 124)(8, "p", 125);
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
    i0.ɵɵelementStart(19, "div", 126);
    i0.ɵɵelement(20, "i", 127);
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
    i0.ɵɵelementStart(29, "div", 128)(30, "input", 129);
    i0.ɵɵlistener("ngModelChange", function SutramGridComponent_div_11_Template_input_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r120); const ctx_r121 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r121.promptState.saveToDictionary = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "label", 130);
    i0.ɵɵtext(32, " \u092D\u0935\u093F\u0937\u094D\u092F \u0915\u0947 \u0932\u093F\u090F \u0921\u093F\u0915\u094D\u0936\u0928\u0930\u0940 \u092E\u0947\u0902 \u0938\u0939\u0947\u091C\u0947\u0902 (Save alias mapping to dictionary) ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(33, "div", 131)(34, "button", 132);
    i0.ɵɵlistener("click", function SutramGridComponent_div_11_Template_button_click_34_listener() { i0.ɵɵrestoreView(_r120); const ctx_r122 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r122.applySingleCellOnly()); });
    i0.ɵɵtext(35, " \u0915\u0947\u0935\u0932 \u0907\u0938\u0940 \u092A\u0902\u0915\u094D\u0924\u093F \u092E\u0947\u0902 (Single Row Only) ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "button", 133);
    i0.ɵɵlistener("click", function SutramGridComponent_div_11_Template_button_click_36_listener() { i0.ɵɵrestoreView(_r120); const ctx_r123 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r123.confirmSolveAll()); });
    i0.ɵɵtext(37);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r8 = i0.ɵɵnextContext();
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate1("#", ctx_r8.promptState.rowIdx + 1, "");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r8.promptState.originalBadValue);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r8.promptState.newSelectedDisplay);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(ctx_r8.promptState.colKey);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r8.promptState.matchingCount);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r8.promptState.saveToDictionary);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1(" \u0938\u092D\u0940 ", ctx_r8.promptState.matchingCount + 1, " \u0938\u0941\u0927\u093E\u0930\u0947\u0902 (Solve All) ");
} }
const _c0 = function () { return { autoSize: false, numToleratedItems: 30 }; };
export class SutramGridComponent {
    state;
    clipboard;
    audit;
    refCache;
    el;
    cdr;
    headers = [];
    rows = [];
    filterOnlyErrors = false;
    enableDelete = true;
    cellChanged = new EventEmitter();
    solveAllTriggered = new EventEmitter();
    loadMore = new EventEmitter();
    filterChanged = new EventEmitter();
    sortChanged = new EventEmitter();
    openConfig = new EventEmitter();
    // ── Inline Cell Editing State ────────────────────────────────
    editingCell = null;
    editingValue = '';
    originalEditingValue = '';
    editingColDef = null;
    // ── Smart FK Autocomplete Dropdown State ─────────────────────
    dropdownOpen = false;
    dropdownOptions = [];
    highlightedIdx = -1;
    dropdownPos = { top: 0, left: 0, minWidth: 270 };
    // ── Row Selection State ─────────────────────────────────────
    selectedRowIdx = null;
    // ── Sleek Custom Context Menu State ──────────────────────────
    contextMenuState = {
        visible: false,
        type: 'row',
        x: 0,
        y: 0,
        rowIdx: -1,
        colKey: null,
        row: null
    };
    // ── Column Filter Popover State ──────────────────────────────
    activeFilterCol = null;
    filterChecklistSearch = '';
    currentChecklistItems = [];
    selectedChecklistValues = new Set();
    // ── Inline Batch Mistake Prompt State ────────────────────────
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
    scrollCleanups = [];
    lastLoadMoreEmitTime = 0;
    lastKnownScrollTop = 0;
    isRestoringScroll = false;
    isResetting = false;
    trackByRowNum = (index, row) => {
        return row.rowNum ?? row._id ?? row.id ?? index;
    };
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
    constructor(state, clipboard, audit, refCache, el, cdr) {
        this.state = state;
        this.clipboard = clipboard;
        this.audit = audit;
        this.refCache = refCache;
        this.el = el;
        this.cdr = cdr;
    }
    ngOnChanges(changes) {
        if (changes['headers'] && this.headers) {
            const refTables = this.headers
                .filter(h => h.ref_table || h.type === 'ref')
                .map(h => h.ref_table)
                .filter(Boolean);
            this.refCache.preloadTables(refTables);
        }
        if (changes['rows']) {
            const prev = changes['rows'].previousValue;
            const curr = changes['rows'].currentValue;
            // When new chunks are appended, preserve scroll position so speedy scrolling doesn't jump to top
            if (prev && curr && curr.length > prev.length && this.lastKnownScrollTop > 40) {
                const savedScroll = this.lastKnownScrollTop;
                requestAnimationFrame(() => {
                    const scrollerEl = this.el.nativeElement.querySelector('.p-scroller');
                    if (scrollerEl && scrollerEl.scrollTop < savedScroll - 30) {
                        this.isRestoringScroll = true;
                        scrollerEl.scrollTop = savedScroll;
                        setTimeout(() => { this.isRestoringScroll = false; }, 60);
                    }
                });
            }
        }
    }
    resetScroll() {
        this.isResetting = true;
        this.lastKnownScrollTop = 0;
        const scrollerEl = this.el.nativeElement.querySelector('.p-scroller');
        if (scrollerEl) {
            scrollerEl.scrollTop = 0;
        }
        setTimeout(() => {
            this.isResetting = false;
        }, 250);
    }
    ngAfterViewInit() {
        this.setupInfiniteScroll();
    }
    ngOnDestroy() {
        this.scrollCleanups.forEach(fn => fn());
        this.scrollCleanups = [];
    }
    /**
     * Evaluates if any scrollable container is near the bottom and emits loadMore
     */
    checkAndEmitLoadMore(scrollEl) {
        const el = scrollEl
            || this.el.nativeElement.querySelector('.p-scroller')
            || this.el.nativeElement.querySelector('.p-scroller-viewport')
            || this.el.nativeElement.querySelector('.p-datatable-wrapper');
        if (!el)
            return;
        const scrollHeight = el.scrollHeight;
        const scrollTop = el.scrollTop;
        const clientHeight = el.clientHeight;
        // 500px prefetch threshold ensures smooth loading ahead of time during fast scrolling
        const threshold = 500;
        const isNearBottom = (scrollTop + clientHeight >= scrollHeight - threshold);
        if (isNearBottom) {
            const now = Date.now();
            if (now - this.lastLoadMoreEmitTime > 300) {
                this.lastLoadMoreEmitTime = now;
                this.loadMore.emit();
            }
        }
    }
    /**
     * Sets up multi-layer scroll detection for PrimeNG virtual scrolling and outer wrappers
     */
    setupInfiniteScroll() {
        const root = this.el.nativeElement;
        if (!root)
            return;
        // 1. Capture-phase scroll listener on host element (catches scroll on .p-scroller, .p-datatable-wrapper, etc.)
        const onScrollCapture = (e) => {
            const target = e.target;
            if (target && target.scrollHeight > target.clientHeight) {
                if (this.isRestoringScroll)
                    return;
                // Glitch Jump Guard: If target.scrollTop dropped to 0 while user was scrolled down (> 120px)
                if (target.scrollTop === 0 && this.lastKnownScrollTop > 120 && !this.isResetting) {
                    const restoreVal = this.lastKnownScrollTop;
                    this.isRestoringScroll = true;
                    target.scrollTop = restoreVal;
                    requestAnimationFrame(() => {
                        if (target.scrollTop === 0) {
                            target.scrollTop = restoreVal;
                        }
                        setTimeout(() => {
                            this.isRestoringScroll = false;
                        }, 60);
                    });
                    return;
                }
                if (target.scrollTop > 0) {
                    this.lastKnownScrollTop = target.scrollTop;
                }
                this.checkAndEmitLoadMore(target);
            }
            else {
                this.checkAndEmitLoadMore();
            }
        };
        root.addEventListener('scroll', onScrollCapture, { passive: true, capture: true });
        this.scrollCleanups.push(() => root.removeEventListener('scroll', onScrollCapture, true));
        // 2. Direct wheel listener: if user scrolls wheel downward when already near the bottom
        const onWheel = (e) => {
            if (e.deltaY > 0) {
                this.checkAndEmitLoadMore();
            }
        };
        root.addEventListener('wheel', onWheel, { passive: true });
        this.scrollCleanups.push(() => root.removeEventListener('wheel', onWheel));
        // 3. Arrow Down / Page Down keyboard navigation
        const onKeyDown = (e) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'End') {
                setTimeout(() => this.checkAndEmitLoadMore(), 50);
            }
        };
        root.addEventListener('keydown', onKeyDown, { passive: true });
        this.scrollCleanups.push(() => root.removeEventListener('keydown', onKeyDown));
        // 4. Also watch canvas if present
        const canvas = root.closest('.spreadsheet-canvas');
        if (canvas) {
            const onCanvasScroll = () => this.checkAndEmitLoadMore(canvas);
            canvas.addEventListener('scroll', onCanvasScroll, { passive: true });
            this.scrollCleanups.push(() => canvas.removeEventListener('scroll', onCanvasScroll));
        }
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
    // ── Cell Selection & Inline Editing ──────────────────────────
    isCellEditing(rowIdx, colKey) {
        return this.editingCell?.rowIdx === rowIdx && this.editingCell?.colKey === colKey;
    }
    isFkColumn(col) {
        return !!col && (col.type === 'ref' || !!col.ref_table) && !!col.ref_table;
    }
    onCellClick(rowIdx, colKey, event) {
        if (this.contextMenuState.visible) {
            this.closeContextMenu();
        }
        this.selectedRowIdx = null; // Clear full row selection when individual cell clicked
        // If clicking on another cell while editing, commit current edit first
        if (this.editingCell && (this.editingCell.rowIdx !== rowIdx || this.editingCell.colKey !== colKey)) {
            this.commitCellEdit();
        }
        this.state.setSelectedCell({ rowIdx, colKey });
        this.cdr.markForCheck();
    }
    onRowHeaderClick(rowIdx, row, event) {
        if (this.contextMenuState.visible) {
            this.closeContextMenu();
        }
        if (this.editingCell) {
            this.commitCellEdit();
        }
        this.selectedRowIdx = rowIdx; // Select entire row
        const firstCol = this.headers[0]?.name || '';
        this.state.setSelectedCell({ rowIdx, colKey: firstCol });
        this.cdr.markForCheck();
    }
    startCellEdit(rowIdx, colKey, row, event, initialChar) {
        this.closeContextMenu();
        if (this.editingCell && (this.editingCell.rowIdx !== rowIdx || this.editingCell.colKey !== colKey)) {
            this.commitCellEdit();
        }
        this.state.setSelectedCell({ rowIdx, colKey });
        const colDef = this.headers.find(h => h.name === colKey) || null;
        this.editingColDef = colDef;
        const curVal = row.cells[colKey]?.value;
        this.originalEditingValue = curVal !== undefined && curVal !== null ? String(curVal) : '';
        this.editingValue = initialChar !== undefined ? initialChar : this.originalEditingValue;
        this.editingCell = { rowIdx, colKey };
        // Auto-focus input
        setTimeout(() => {
            const inputEl = this.el.nativeElement.querySelector('.raw-cell-editor');
            if (inputEl) {
                inputEl.focus();
                if (initialChar === undefined) {
                    inputEl.select();
                }
            }
        }, 10);
        // If FK column, open autocomplete dropdown
        if (this.isFkColumn(colDef)) {
            let targetEl = null;
            if (event?.target) {
                targetEl = event.target.closest('.cell-box');
            }
            if (!targetEl) {
                targetEl = this.el.nativeElement.querySelector('.cell-box.cell-active');
            }
            if (targetEl) {
                this.positionFkDropdown(targetEl.getBoundingClientRect());
            }
            this.updateFkOptions(colDef, this.editingValue, row);
        }
        else {
            this.dropdownOpen = false;
        }
        this.cdr.markForCheck();
    }
    onEditorInput(val, col, row) {
        this.editingValue = val;
        if (this.isFkColumn(col)) {
            const targetEl = this.el.nativeElement.querySelector('.cell-box.cell-editing');
            if (targetEl) {
                this.positionFkDropdown(targetEl.getBoundingClientRect());
            }
            this.updateFkOptions(col, val, row);
        }
    }
    positionFkDropdown(rect) {
        let top = rect.bottom + 2;
        let left = rect.left;
        const minWidth = Math.max(rect.width, 270);
        if (top + 200 > window.innerHeight) {
            top = Math.max(10, rect.top - 200);
        }
        if (left + minWidth > window.innerWidth) {
            left = Math.max(10, window.innerWidth - minWidth - 12);
        }
        this.dropdownPos = { top, left, minWidth };
        this.dropdownOpen = true;
    }
    updateFkOptions(col, query, row) {
        if (!col.ref_table)
            return;
        let parentId = undefined;
        if (col.ref_table.toLowerCase() === 'subitem' && row) {
            const itemHeader = this.headers.find(h => h.ref_table === 'item' || h.name.includes('item'));
            if (itemHeader && row.cells[itemHeader.name]) {
                parentId = row.cells[itemHeader.name].refId || row.cells[itemHeader.name].value;
            }
        }
        this.dropdownOptions = this.refCache.searchOptions(col.ref_table, query, parentId, 50);
        this.highlightedIdx = this.dropdownOptions.length > 0 ? 0 : -1;
        this.dropdownOpen = true;
        this.cdr.markForCheck();
    }
    selectDropdownOption(opt, event, moveToNextRow = true) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (!this.editingCell)
            return;
        const { rowIdx, colKey } = this.editingCell;
        const row = this.visibleRows[rowIdx];
        const col = this.editingColDef;
        this.editingValue = opt.display;
        this.dropdownOpen = false;
        this.editingCell = null;
        if (row && col) {
            const cell = row.cells[colKey];
            if (cell) {
                if (cell.originalValue === undefined) {
                    cell.originalValue = this.originalEditingValue;
                }
                const origStr = String(cell.originalValue ?? '').trim();
                const currentEditStr = String(this.originalEditingValue ?? '').trim();
                const changedFromCurrent = opt.display !== currentEditStr;
                const changedFromOriginal = opt.display !== origStr;
                if (!changedFromCurrent && !cell.isModified && !row.isNew) {
                    if (moveToNextRow) {
                        this.navigateCell(rowIdx + 1, colKey);
                    }
                    this.cdr.markForCheck();
                    return;
                }
                cell.value = opt.display;
                cell.refId = opt.id;
                cell.refDisplay = opt.display;
                cell.isValid = true;
                cell.errorMessage = undefined;
                if (changedFromOriginal) {
                    cell.isModified = true;
                }
                else if (!row.isNew) {
                    cell.isModified = false;
                }
                row.isModified = row.isNew || Object.values(row.cells).some((c) => c && c.isModified);
            }
            this.audit.validateCell(cell, col, row, this.headers);
            this.audit.validateRow(row, this.headers);
            this.cellChanged.emit({ rowIdx, colKey, value: opt.display });
            this.state.updateCellValue(rowIdx, colKey, opt.display, opt.id);
            if (rowIdx === this.visibleRows.length - 1 && this.isRowPopulated(row)) {
                this.state.addNewBlankRow();
            }
        }
        if (moveToNextRow) {
            this.navigateCell(rowIdx + 1, colKey);
        }
        this.cdr.markForCheck();
    }
    onCellEditorKeydown(event, rowIdx, colKey, row) {
        // Dropdown arrow navigation
        if (this.dropdownOpen && this.dropdownOptions.length > 0) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.highlightedIdx = Math.min(this.dropdownOptions.length - 1, this.highlightedIdx + 1);
                this.scrollHighlightedDropdownItem();
                this.cdr.markForCheck();
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.highlightedIdx = Math.max(0, this.highlightedIdx - 1);
                this.scrollHighlightedDropdownItem();
                this.cdr.markForCheck();
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                if (this.highlightedIdx >= 0 && this.dropdownOptions[this.highlightedIdx]) {
                    this.selectDropdownOption(this.dropdownOptions[this.highlightedIdx], undefined, true);
                }
                else {
                    this.commitCellEdit(true, false);
                }
                return;
            }
            if (event.key === 'Tab') {
                event.preventDefault();
                if (this.highlightedIdx >= 0 && this.dropdownOptions[this.highlightedIdx]) {
                    this.selectDropdownOption(this.dropdownOptions[this.highlightedIdx], undefined, false);
                }
                else {
                    this.commitCellEdit(false, true);
                }
                return;
            }
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            this.commitCellEdit(true, false); // advance to next row
            return;
        }
        if (event.key === 'Tab') {
            event.preventDefault();
            if (event.shiftKey) {
                this.commitCellEdit(false, false);
                this.navigateCell(rowIdx, this.getPrevColKey(colKey));
            }
            else {
                this.commitCellEdit(false, true); // advance to next column
            }
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            this.cancelCellEdit();
            return;
        }
    }
    onCellEditorBlur(rowIdx, colKey, row) {
        // Delay slightly to permit any mousedown on autocomplete dropdown to execute first
        setTimeout(() => {
            if (this.isCellEditing(rowIdx, colKey)) {
                this.commitCellEdit();
            }
        }, 150);
    }
    commitCellEdit(moveToNextRow = false, moveToNextCol = false) {
        if (!this.editingCell)
            return;
        const { rowIdx, colKey } = this.editingCell;
        const row = this.visibleRows[rowIdx];
        const col = this.headers.find(h => h.name === colKey);
        const newVal = (this.editingValue ?? '').trim();
        this.editingCell = null;
        this.dropdownOpen = false;
        if (row && col) {
            const cell = row.cells[colKey];
            if (cell) {
                if (cell.originalValue === undefined) {
                    cell.originalValue = this.originalEditingValue;
                }
                const origStr = String(cell.originalValue ?? '').trim();
                const currentEditStr = String(this.originalEditingValue ?? '').trim();
                const changedFromCurrent = newVal !== currentEditStr;
                const changedFromOriginal = newVal !== origStr;
                // If data hasn't changed at all during this edit session and cell was not already modified,
                // do not mark anything modified or dirty!
                if (!changedFromCurrent && !cell.isModified && !row.isNew) {
                    if (moveToNextRow) {
                        this.navigateCell(rowIdx + 1, colKey);
                    }
                    else if (moveToNextCol) {
                        this.navigateCell(rowIdx, this.getNextColKey(colKey));
                    }
                    this.cdr.markForCheck();
                    return;
                }
                cell.value = newVal;
                if (changedFromOriginal) {
                    cell.isModified = true;
                }
                else if (!row.isNew) {
                    cell.isModified = false;
                }
                // Foreign Key validation & auto-matching
                if (this.isFkColumn(col)) {
                    const match = this.refCache.findRefMatch(col.ref_table, newVal);
                    if (match.found) {
                        cell.value = match.display;
                        cell.refId = match.id;
                        cell.refDisplay = match.display;
                        cell.isValid = true;
                        cell.errorMessage = undefined;
                    }
                    else if (newVal !== '') {
                        cell.isValid = false;
                        cell.errorMessage = `अमान्य ${col.name}: '${col.ref_table}' में नहीं मिला`;
                        if (this.originalEditingValue && changedFromCurrent) {
                            const sameCount = this.state.findSameMistakeRowIndices(colKey, this.originalEditingValue).length;
                            if (sameCount > 1) {
                                this.promptState = {
                                    visible: true,
                                    rowIdx,
                                    colKey,
                                    originalBadValue: this.originalEditingValue,
                                    newSelectedValue: null,
                                    newSelectedDisplay: newVal,
                                    matchingCount: sameCount,
                                    saveToDictionary: true
                                };
                            }
                        }
                    }
                }
                row.isModified = row.isNew || Object.values(row.cells).some((c) => c && c.isModified);
                this.audit.validateCell(cell, col, row, this.headers);
                this.audit.validateRow(row, this.headers);
                this.cellChanged.emit({ rowIdx, colKey, value: cell.value });
                this.state.updateCellValue(rowIdx, colKey, cell.value, cell.refId);
                if (rowIdx === this.visibleRows.length - 1 && this.isRowPopulated(row)) {
                    this.state.addNewBlankRow();
                }
            }
        }
        if (moveToNextRow) {
            this.navigateCell(rowIdx + 1, colKey);
        }
        else if (moveToNextCol) {
            this.navigateCell(rowIdx, this.getNextColKey(colKey));
        }
        this.cdr.markForCheck();
    }
    cancelCellEdit() {
        this.editingCell = null;
        this.dropdownOpen = false;
        this.cdr.markForCheck();
    }
    scrollHighlightedDropdownItem() {
        setTimeout(() => {
            const el = this.el.nativeElement.querySelector('.ref-dropdown-item.highlighted');
            if (el) {
                el.scrollIntoView({ block: 'nearest' });
            }
        }, 10);
    }
    navigateCell(targetRowIdx, targetColKey) {
        if (this.visibleRows.length === 0)
            return;
        const rowIdx = Math.max(0, Math.min(this.visibleRows.length - 1, targetRowIdx));
        const colExists = this.headers.some(h => h.name === targetColKey);
        const colKey = colExists ? targetColKey : (this.headers[0]?.name || '');
        this.state.setSelectedCell({ rowIdx, colKey });
        this.cdr.markForCheck();
    }
    getNextColKey(curColKey) {
        const idx = this.headers.findIndex(h => h.name === curColKey);
        if (idx >= 0 && idx + 1 < this.headers.length) {
            return this.headers[idx + 1].name;
        }
        return curColKey;
    }
    getPrevColKey(curColKey) {
        const idx = this.headers.findIndex(h => h.name === curColKey);
        if (idx > 0) {
            return this.headers[idx - 1].name;
        }
        return curColKey;
    }
    // ── Keyboard Navigation Across Canvas ────────────────────────
    onDocumentKeydown(event) {
        if (this.contextMenuState.visible) {
            if (event.key === 'Escape') {
                this.closeContextMenu();
                event.preventDefault();
            }
            return;
        }
        if (this.editingCell) {
            if (event.key === 'Escape') {
                this.cancelCellEdit();
                event.preventDefault();
            }
            return;
        }
        const sel = this.state.selectedCell();
        if (!sel)
            return;
        // Ignore if focus is in an input outside grid (e.g. formula bar or top search bar)
        const activeEl = document.activeElement;
        if (activeEl &&
            (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
            !activeEl.classList.contains('raw-cell-editor')) {
            return;
        }
        // ── Row-Level Keyboard Operations (When entire row is selected) ─
        if (this.selectedRowIdx !== null) {
            const curRowIdx = this.selectedRowIdx;
            const targetRow = this.visibleRows[curRowIdx];
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.selectedRowIdx = Math.min(this.visibleRows.length - 1, curRowIdx + 1);
                const firstCol = this.headers[0]?.name || '';
                this.state.setSelectedCell({ rowIdx: this.selectedRowIdx, colKey: firstCol });
                this.cdr.markForCheck();
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.selectedRowIdx = Math.max(0, curRowIdx - 1);
                const firstCol = this.headers[0]?.name || '';
                this.state.setSelectedCell({ rowIdx: this.selectedRowIdx, colKey: firstCol });
                this.cdr.markForCheck();
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.selectedRowIdx = null;
                this.cdr.markForCheck();
                return;
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
                event.preventDefault();
                if (targetRow) {
                    this.clipboard.copyRowsToClipboard([targetRow], this.headers);
                }
                return;
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
                event.preventDefault();
                this.pasteRowData(curRowIdx);
                return;
            }
            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                this.clearSelectedRow(curRowIdx);
                return;
            }
        }
        const { rowIdx, colKey } = sel;
        const row = this.visibleRows[rowIdx];
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.navigateCell(rowIdx + 1, colKey);
        }
        else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.navigateCell(rowIdx - 1, colKey);
        }
        else if (event.key === 'ArrowRight') {
            event.preventDefault();
            this.navigateCell(rowIdx, this.getNextColKey(colKey));
        }
        else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this.navigateCell(rowIdx, this.getPrevColKey(colKey));
        }
        else if (event.key === 'Enter' || event.key === 'F2') {
            event.preventDefault();
            if (row)
                this.startCellEdit(rowIdx, colKey, row);
        }
        else if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault();
            this.state.updateCellValue(rowIdx, colKey, '');
            this.cellChanged.emit({ rowIdx, colKey, value: '' });
            this.cdr.markForCheck();
        }
        else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
            if (row) {
                const val = row.cells[colKey]?.value ?? '';
                navigator.clipboard.writeText(String(val));
            }
        }
        else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
            navigator.clipboard.readText().then(text => {
                if (text !== undefined && text !== null) {
                    const val = text.trim();
                    this.state.updateCellValue(rowIdx, colKey, val);
                    this.cellChanged.emit({ rowIdx, colKey, value: val });
                    this.cdr.markForCheck();
                }
            });
        }
        else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            // Direct typing into selected cell starts edit immediately!
            if (row) {
                this.startCellEdit(rowIdx, colKey, row, undefined, event.key);
            }
        }
    }
    async pasteRowData(rowIdx) {
        const matrix = await this.clipboard.readClipboardMatrix();
        if (!matrix || matrix.length === 0)
            return;
        const targetRow = this.visibleRows[rowIdx];
        if (!targetRow)
            return;
        const rowValues = matrix[0];
        this.headers.forEach((h, colIndex) => {
            if (colIndex < rowValues.length) {
                const val = (rowValues[colIndex] ?? '').trim();
                this.state.updateCellValue(rowIdx, h.name, val);
                this.cellChanged.emit({ rowIdx, colKey: h.name, value: val });
            }
        });
        this.cdr.markForCheck();
    }
    clearSelectedRow(rowIdx) {
        const targetRow = this.visibleRows[rowIdx];
        if (!targetRow)
            return;
        this.headers.forEach(h => {
            this.state.updateCellValue(rowIdx, h.name, '');
            this.cellChanged.emit({ rowIdx, colKey: h.name, value: '' });
        });
        this.cdr.markForCheck();
    }
    onDocumentClick(event) {
        if (this.contextMenuState.visible) {
            const target = event.target;
            if (!target.closest('.custom-context-menu')) {
                this.closeContextMenu();
            }
        }
        if (this.editingCell) {
            const target = event.target;
            if (!target.closest('.raw-cell-editor') && !target.closest('.ref-dropdown-menu')) {
                this.commitCellEdit();
            }
        }
    }
    onWindowChange() {
        if (this.contextMenuState.visible) {
            this.closeContextMenu();
        }
        if (this.dropdownOpen) {
            const targetEl = this.el.nativeElement.querySelector('.cell-box.cell-editing');
            if (targetEl) {
                this.positionFkDropdown(targetEl.getBoundingClientRect());
            }
            else {
                this.dropdownOpen = false;
            }
            this.cdr.markForCheck();
        }
    }
    // ── Context Menu Actions (Row & Cell) ────────────────────────
    openRowContextMenu(event, row, rowIdx) {
        event.preventDefault();
        event.stopPropagation();
        this.selectedRowIdx = rowIdx;
        const firstCol = this.headers[0]?.name || '';
        this.state.setSelectedCell({ rowIdx, colKey: firstCol });
        this.positionContextMenu(event, 'row', rowIdx, null, row);
    }
    openCellContextMenu(event, rowIdx, colKey, row) {
        event.preventDefault();
        event.stopPropagation();
        this.selectedRowIdx = null;
        this.state.setSelectedCell({ rowIdx, colKey });
        this.positionContextMenu(event, 'cell', rowIdx, colKey, row);
    }
    positionContextMenu(event, type, rowIdx, colKey, row) {
        const menuWidth = 220;
        const menuHeight = type === 'cell' ? 240 : 160;
        let x = event.clientX;
        let y = event.clientY;
        if (x + menuWidth > window.innerWidth) {
            x = Math.max(10, window.innerWidth - menuWidth - 10);
        }
        if (y + menuHeight > window.innerHeight) {
            y = Math.max(10, window.innerHeight - menuHeight - 10);
        }
        this.contextMenuState = {
            visible: true,
            type,
            x,
            y,
            rowIdx,
            colKey,
            row
        };
        this.cdr.markForCheck();
    }
    closeContextMenu() {
        if (this.contextMenuState.visible) {
            this.contextMenuState.visible = false;
            this.cdr.markForCheck();
        }
    }
    copyActiveCell() {
        const { row, colKey } = this.contextMenuState;
        this.closeContextMenu();
        if (row && colKey) {
            const val = row.cells[colKey]?.value ?? '';
            navigator.clipboard.writeText(String(val));
        }
    }
    cutActiveCell() {
        const { rowIdx, colKey, row } = this.contextMenuState;
        this.closeContextMenu();
        if (row && colKey && rowIdx >= 0) {
            const val = row.cells[colKey]?.value ?? '';
            navigator.clipboard.writeText(String(val));
            this.state.updateCellValue(rowIdx, colKey, '');
            this.cellChanged.emit({ rowIdx, colKey, value: '' });
            this.cdr.markForCheck();
        }
    }
    pasteToActiveCell() {
        const { rowIdx, colKey } = this.contextMenuState;
        this.closeContextMenu();
        if (colKey && rowIdx >= 0) {
            navigator.clipboard.readText().then(text => {
                if (text !== undefined && text !== null) {
                    const val = text.trim();
                    this.state.updateCellValue(rowIdx, colKey, val);
                    this.cellChanged.emit({ rowIdx, colKey, value: val });
                    this.cdr.markForCheck();
                }
            });
        }
    }
    copySelectedRow() {
        const row = this.contextMenuState.row ||
            (this.contextMenuState.rowIdx >= 0 ? this.rows[this.contextMenuState.rowIdx] : null);
        this.closeContextMenu();
        if (row) {
            this.clipboard.copyRowsToClipboard([row], this.headers);
        }
    }
    insertRowAbove() {
        const rowIdx = this.contextMenuState.rowIdx;
        this.closeContextMenu();
        if (rowIdx < 0)
            return;
        const newCells = {};
        this.headers.forEach(h => {
            newCells[h.name] = {
                value: '',
                isValid: !h.not_null,
                isModified: false,
                isNew: true
            };
        });
        const newRow = {
            rowNum: rowIdx + 1,
            cells: newCells,
            hasError: false,
            errorCount: 0,
            isNew: true
        };
        const current = [...this.rows];
        current.splice(rowIdx, 0, newRow);
        current.forEach((r, idx) => (r.rowNum = idx + 1));
        this.state.setRows(current);
        this.state.setSelectedCell({ rowIdx, colKey: this.headers[0]?.name || '' });
        this.cdr.markForCheck();
    }
    insertRowBelow() {
        const rowIdx = this.contextMenuState.rowIdx;
        this.closeContextMenu();
        if (rowIdx < 0)
            return;
        const newCells = {};
        this.headers.forEach(h => {
            newCells[h.name] = {
                value: '',
                isValid: !h.not_null,
                isModified: false,
                isNew: true
            };
        });
        const newRow = {
            rowNum: rowIdx + 2,
            cells: newCells,
            hasError: false,
            errorCount: 0,
            isNew: true
        };
        const current = [...this.rows];
        current.splice(rowIdx + 1, 0, newRow);
        current.forEach((r, idx) => (r.rowNum = idx + 1));
        this.state.setRows(current);
        this.state.setSelectedCell({ rowIdx: rowIdx + 1, colKey: this.headers[0]?.name || '' });
        this.cdr.markForCheck();
    }
    duplicateRow() {
        const rowIdx = this.contextMenuState.rowIdx;
        const srcRow = this.contextMenuState.row || this.rows[rowIdx];
        this.closeContextMenu();
        if (!srcRow || rowIdx < 0)
            return;
        const clonedCells = {};
        for (const h of this.headers) {
            const srcCell = srcRow.cells[h.name];
            clonedCells[h.name] = {
                value: srcCell?.value ?? '',
                isValid: true,
                isModified: false,
                isNew: true,
                refId: srcCell?.refId,
                refDisplay: srcCell?.refDisplay
            };
        }
        const clonedRow = {
            rowNum: rowIdx + 2,
            cells: clonedCells,
            hasError: false,
            errorCount: 0,
            isNew: true
        };
        const current = [...this.rows];
        current.splice(rowIdx + 1, 0, clonedRow);
        current.forEach((r, idx) => (r.rowNum = idx + 1));
        this.state.setRows(current);
        this.state.setSelectedCell({ rowIdx: rowIdx + 1, colKey: this.headers[0]?.name || '' });
        this.cdr.markForCheck();
    }
    deleteSelectedRow() {
        this.deleteRow();
    }
    deleteRow() {
        const rowIdx = this.contextMenuState.rowIdx;
        const targetRow = this.contextMenuState.row || this.rows[rowIdx];
        this.closeContextMenu();
        if (!targetRow || rowIdx < 0 || this.rows.length <= 1)
            return;
        this.state.trackDeletedRow(targetRow, rowIdx);
        const updated = this.rows.filter((_, idx) => idx !== rowIdx);
        updated.forEach((r, idx) => (r.rowNum = idx + 1));
        this.state.setRows(updated);
        const nextRowIdx = Math.min(rowIdx, updated.length - 1);
        this.state.setSelectedCell({ rowIdx: nextRowIdx, colKey: this.headers[0]?.name || '' });
        this.cdr.markForCheck();
    }
    // ── Column Filter Popover Methods ────────────────────────────
    isColumnFiltered(colName) {
        const filters = this.state.columnFilters();
        return !!filters[colName] && filters[colName].size > 0;
    }
    openColumnFilter(event, col, op) {
        event.stopPropagation();
        this.activeFilterCol = col;
        this.filterChecklistSearch = '';
        this.selectedChecklistValues.clear();
        const isFk = col.type === 'ref' || !!col.ref_table;
        const itemsMap = new Map();
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
    selectAllFilteredItems() {
        for (const item of this.filteredChecklistItems) {
            this.selectedChecklistValues.add(item.value);
        }
        this.cdr.markForCheck();
    }
    clearAllFilteredItems() {
        for (const item of this.filteredChecklistItems) {
            this.selectedChecklistValues.delete(item.value);
        }
        this.cdr.markForCheck();
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
    // ── Batch Fix Prompt Methods ─────────────────────────────────
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
    applySingleCellOnly() {
        this.state.updateCellValue(this.promptState.rowIdx, this.promptState.colKey, this.promptState.newSelectedDisplay, this.promptState.newSelectedValue);
        this.promptState.visible = false;
    }
    dismissPrompt() {
        this.promptState.visible = false;
    }
    // ── Column Geometry & Headers ────────────────────────────────
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
        const name = (col.short_name || col.name || col.col_name || '').toLowerCase();
        const key = (col.key || '').toLowerCase();
        if (name === '_id' || name === 'id' || col.is_fk_raw || key.endsWith('_id'))
            return 75;
        if (name === 'active')
            return 80;
        if (name === 'sort_order' || name === 'order' || name === 'roll_no')
            return 90;
        if (name === 'gender' || name.includes('code'))
            return 95;
        if (name.includes('date') || name.includes('time'))
            return 120;
        if (col.is_fk_main || col.ref_table || col.type === 'ref') {
            return Math.max(160, Math.min(260, (col.short_name || col.name || '').length * 11 + 55));
        }
        return Math.max(130, Math.min(220, (col.short_name || col.name || '').length * 10 + 35));
    }
    static ɵfac = function SutramGridComponent_Factory(t) { return new (t || SutramGridComponent)(i0.ɵɵdirectiveInject(i1.SutramExcelStateService), i0.ɵɵdirectiveInject(i2.SutramClipboardService), i0.ɵɵdirectiveInject(i3.SutramAuditService), i0.ɵɵdirectiveInject(i4.SutramRefCacheService), i0.ɵɵdirectiveInject(i0.ElementRef), i0.ɵɵdirectiveInject(i0.ChangeDetectorRef)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SutramGridComponent, selectors: [["sutram-grid"]], hostBindings: function SutramGridComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown", function SutramGridComponent_keydown_HostBindingHandler($event) { return ctx.onDocumentKeydown($event); }, false, i0.ɵɵresolveDocument)("click", function SutramGridComponent_click_HostBindingHandler($event) { return ctx.onDocumentClick($event); }, false, i0.ɵɵresolveDocument)("scroll", function SutramGridComponent_scroll_HostBindingHandler() { return ctx.onWindowChange(); }, false, i0.ɵɵresolveWindow)("resize", function SutramGridComponent_resize_HostBindingHandler() { return ctx.onWindowChange(); }, false, i0.ɵɵresolveWindow);
        } }, inputs: { headers: "headers", rows: "rows", filterOnlyErrors: "filterOnlyErrors", enableDelete: "enableDelete" }, outputs: { cellChanged: "cellChanged", solveAllTriggered: "solveAllTriggered", loadMore: "loadMore", filterChanged: "filterChanged", sortChanged: "sortChanged", openConfig: "openConfig" }, features: [i0.ɵɵNgOnChangesFeature], decls: 12, vars: 15, consts: [[1, "sutram-grid-wrapper", 3, "contextmenu"], ["class", "custom-context-menu shadow-lg", 3, "top", "left", "click", 4, "ngIf"], ["class", "ref-dropdown-menu shadow-lg", 3, "top", "left", "min-width", "mousedown", 4, "ngIf"], ["styleClass", "sutram-col-filter-popover shadow-lg", 3, "showCloseIcon", "dismissable"], ["colFilterOp", ""], ["pTemplate", "content"], ["scrollHeight", "flex", "columnResizeMode", "expand", "styleClass", "p-datatable-gridlines p-datatable-sm sutram-grid-table", 3, "value", "columns", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "rowTrackBy", "scrollable", "resizableColumns", "reorderableColumns"], ["pTable", ""], ["pTemplate", "header"], ["pTemplate", "body"], ["pTemplate", "emptymessage"], ["class", "inline-solve-prompt card shadow-lg p-3", 4, "ngIf"], [1, "custom-context-menu", "shadow-lg", 3, "click"], [4, "ngIf"], [1, "context-menu-item", 3, "click"], [1, "pi", "pi-arrow-up"], [1, "pi", "pi-arrow-down"], [1, "pi", "pi-clone"], [1, "pi", "pi-copy"], [1, "ms-auto"], [1, "pi", "pi-file-edit"], [1, "pi", "pi-clipboard"], [1, "context-menu-divider"], [1, "context-menu-item", "text-danger", 3, "click"], [1, "pi", "pi-trash", 2, "color", "#ef4444"], [2, "color", "#ef4444", "font-weight", "600"], [1, "ref-dropdown-menu", "shadow-lg", 3, "mousedown"], [1, "ref-dropdown-header"], [2, "opacity", "0.8", "font-weight", "400"], [1, "ref-dropdown-items-wrap", 2, "max-height", "185px", "overflow-y", "auto"], ["class", "ref-dropdown-item", 3, "highlighted", "mousedown", 4, "ngFor", "ngForOf"], ["class", "ref-dropdown-empty", 4, "ngIf"], [1, "ref-dropdown-item", 3, "mousedown"], [1, "ref-item-label", "text-truncate"], ["class", "ref-item-badge", 4, "ngIf"], [1, "ref-item-badge"], [1, "ref-dropdown-empty"], [1, "pi", "pi-search", "me-1"], ["class", "filter-popover-content", 4, "ngIf"], [1, "filter-popover-content"], [1, "popover-header"], [1, "popover-title", "text-truncate"], [1, "pi", "pi-filter-fill", "text-primary"], [1, "col-name", "text-truncate", 3, "title"], ["class", "badge-type", 4, "ngIf"], ["type", "button", "title", "Close", 1, "btn-popover-close", 3, "click"], [1, "pi", "pi-times"], [1, "popover-search-wrap"], [1, "pi", "pi-search", "search-icon"], ["type", "text", "placeholder", "Search in list...", 1, "popover-search-input", 3, "ngModel", "ngModelChange"], ["type", "button", "class", "btn-clear-search-inline", 3, "click", 4, "ngIf"], [1, "popover-action-strip"], [1, "select-all-label"], ["type", "checkbox", 1, "custom-check", 3, "checked", "change"], [1, "quick-links"], ["type", "button", 1, "btn-link-action", 3, "click"], [1, "divider"], [1, "count-pill"], [1, "popover-checklist-items"], ["class", "checklist-item", 3, "click", 4, "ngFor", "ngForOf"], ["class", "empty-list-state", 4, "ngIf"], [1, "popover-footer"], ["type", "button", 1, "btn-filter-clear", 3, "click"], [1, "pi", "pi-trash", "me-1"], [1, "footer-actions-right"], ["type", "button", 1, "btn-filter-cancel", 3, "click"], ["type", "button", 1, "btn-filter-apply", 3, "click"], [1, "pi", "pi-check"], [1, "badge-type"], ["type", "button", 1, "btn-clear-search-inline", 3, "click"], [1, "checklist-item", 3, "click"], [1, "item-left", "text-truncate"], ["type", "checkbox", 1, "custom-check", 3, "checked", "click", "change"], [1, "item-label", "text-truncate", 3, "title"], [1, "item-right"], ["class", "item-code-chip", 4, "ngIf"], ["class", "item-count-badge", 4, "ngIf"], [1, "item-code-chip"], [1, "item-count-badge"], [1, "empty-list-state"], ["pFrozenColumn", "", "title", "Configure Columns (\u0915\u0949\u0932\u092E \u091A\u0941\u0928\u0947\u0902)", 1, "corner-th", "corner-config-th", 2, "width", "34px", "min-width", "34px", "max-width", "34px", "text-align", "center", 3, "click"], [2, "display", "flex", "align-items", "center", "justify-content", "center"], [1, "pi", "pi-cog", "corner-cog-icon", 2, "font-size", "12px", "color", "var(--text-muted, #64748b)"], ["pResizableColumn", "", "pReorderableColumn", "", "class", "sutram-th", 3, "width", "min-width", "max-width", "sortable-th", "click", 4, "ngFor", "ngForOf"], ["pResizableColumn", "", "pReorderableColumn", "", 1, "sutram-th", 3, "click"], [2, "display", "flex", "justify-content", "space-between", "align-items", "center", "position", "relative", "width", "100%"], [1, "col-header-title", "text-truncate", "d-flex", "align-items-center", 3, "title"], [2, "color", "var(--text-muted, #64748b)", "font-size", "11px", "margin-right", "5px"], [1, "text-truncate"], ["style", "color: #ef4444; margin-left: 2px;", 4, "ngIf"], [1, "col-header-controls", "d-flex", "align-items-center", 3, "click"], ["style", "font-size: 9px; padding: 1px 4px; background: rgba(16, 185, 129, 0.15); color: #059669; border-radius: 3px; font-weight: 600; margin-right: 4px;", 3, "title", 4, "ngIf"], ["style", "font-size: 9px; padding: 1px 4px; background: rgba(59, 130, 246, 0.15); color: #2563eb; border-radius: 3px; font-weight: 600; margin-right: 4px;", 3, "title", 4, "ngIf"], ["style", "font-size: 9px; padding: 1px 4px; background: rgba(245, 158, 11, 0.15); color: #d97706; border-radius: 3px; font-weight: 600; margin-right: 4px;", "title", "Raw ID", 4, "ngIf"], ["class", "col-sort-trigger", 3, "is-sorted", "title", "click", 4, "ngIf"], ["class", "col-filter-trigger", 3, "is-filtered", "title", "click", 4, "ngIf"], [2, "color", "#ef4444", "margin-left", "2px"], [2, "font-size", "9px", "padding", "1px 4px", "background", "rgba(16, 185, 129, 0.15)", "color", "#059669", "border-radius", "3px", "font-weight", "600", "margin-right", "4px", 3, "title"], [2, "font-size", "9px", "padding", "1px 4px", "background", "rgba(59, 130, 246, 0.15)", "color", "#2563eb", "border-radius", "3px", "font-weight", "600", "margin-right", "4px", 3, "title"], ["title", "Raw ID", 2, "font-size", "9px", "padding", "1px 4px", "background", "rgba(245, 158, 11, 0.15)", "color", "#d97706", "border-radius", "3px", "font-weight", "600", "margin-right", "4px"], [1, "col-sort-trigger", 3, "title", "click"], [1, "pi", 3, "ngClass"], [1, "col-filter-trigger", 3, "title", "click"], ["pFrozenColumn", "", 1, "row-num-td", 2, "width", "34px", "min-width", "34px", "max-width", "34px", "text-align", "center", 3, "click", "contextmenu"], ["class", "row-state-dot dot-new", 4, "ngIf"], ["class", "row-state-dot dot-edited", 4, "ngIf"], [1, "row-num-text"], [3, "width", "min-width", "max-width", 4, "ngFor", "ngForOf"], [1, "row-state-dot", "dot-new"], [1, "row-state-dot", "dot-edited"], [1, "cell-box", 3, "title", "click", "dblclick", "contextmenu"], [4, "ngIf", "ngIfElse"], ["normalMode", ""], ["type", "text", 1, "raw-cell-editor", 3, "ngModel", "ngModelChange", "input", "keydown", "blur"], ["cellEditorInput", ""], [1, "cell-value-text", "text-truncate"], [1, "text-center", "py-4", "text-muted"], [1, "pi", "pi-file-excel", "me-2", 2, "font-size", "16px"], [1, "inline-solve-prompt", "card", "shadow-lg", "p-3"], [1, "d-flex", "align-items-center", "justify-content-between", "pb-2", "mb-2", "border-bottom"], [1, "d-flex", "align-items-center", "gap-2"], [1, "pi", "pi-bolt", "text-warning", 2, "font-size", "16px"], [1, "fs-7"], ["type", "button", 1, "btn-close", 3, "click"], [1, "prompt-body", "text-start", "mb-3"], [1, "small", "text-muted", "mb-2"], [1, "alert", "alert-warning", "py-2", "px-3", "small", "d-flex", "align-items-center", "gap-2", "m-0"], [1, "pi", "pi-info-circle"], [1, "form-check", "mt-2"], ["type", "checkbox", "id", "chkDict", 1, "form-check-input", 3, "ngModel", "ngModelChange"], ["for", "chkDict", 1, "form-check-label", "small", "cursor-pointer"], [1, "prompt-actions", "d-flex", "justify-content-end", "gap-2"], ["type", "button", 1, "btn", "btn-sm", "btn-outline-secondary", 3, "click"], ["type", "button", 1, "btn", "btn-sm", "btn-success", 3, "click"]], template: function SutramGridComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵlistener("contextmenu", function SutramGridComponent_Template_div_contextmenu_0_listener($event) { return $event.preventDefault(); });
            i0.ɵɵtemplate(1, SutramGridComponent_div_1_Template, 16, 7, "div", 1);
            i0.ɵɵtemplate(2, SutramGridComponent_div_2_Template, 9, 10, "div", 2);
            i0.ɵɵelementStart(3, "p-overlayPanel", 3, 4);
            i0.ɵɵtemplate(5, SutramGridComponent_ng_template_5_Template, 1, 1, "ng-template", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p-table", 6, 7);
            i0.ɵɵtemplate(8, SutramGridComponent_ng_template_8_Template, 5, 1, "ng-template", 8);
            i0.ɵɵtemplate(9, SutramGridComponent_ng_template_9_Template, 7, 14, "ng-template", 9);
            i0.ɵɵtemplate(10, SutramGridComponent_ng_template_10_Template, 4, 1, "ng-template", 10);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(11, SutramGridComponent_div_11_Template, 38, 7, "div", 11);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.contextMenuState.visible);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.dropdownOpen && ctx.isFkColumn(ctx.editingColDef));
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("showCloseIcon", false)("dismissable", true);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("value", ctx.visibleRows)("columns", ctx.headers)("virtualScroll", true)("virtualScrollItemSize", 23)("virtualScrollOptions", i0.ɵɵpureFunction0(14, _c0))("rowTrackBy", ctx.trackByRowNum)("scrollable", true)("resizableColumns", true)("reorderableColumns", true);
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("ngIf", ctx.promptState.visible);
        } }, dependencies: [i5.NgClass, i5.NgForOf, i5.NgIf, i6.DefaultValueAccessor, i6.CheckboxControlValueAccessor, i6.NgControlStatus, i6.NgModel, i7.Table, i8.PrimeTemplate, i7.FrozenColumn, i7.ResizableColumn, i7.ReorderableColumn, i9.OverlayPanel], styles: ["\n\n\n\n\n\n\n\n\n\n\n\n[_nghost-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.sutram-grid-wrapper[_ngcontent-%COMP%] {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n\n  ::ng-deep .p-datatable-wrapper {\n    height: 100% !important;\n  }\n\n  \n\n  ::ng-deep .p-datatable-thead > tr > th {\n    position: sticky;\n    top: 0;\n    z-index: 20;\n    background: var(--header-bg, #f1f5f9) !important;\n    color: var(--header-text, #1e293b) !important;\n    font-weight: 700 !important;\n    font-size: 13px !important;\n    height: var(--header-height, 38px) !important;\n    padding: 6px 10px !important;\n    border-right: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    border-bottom: 2px solid rgba(125, 125, 125, 0.35) !important;\n    white-space: nowrap !important;\n    user-select: none;\n    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);\n\n    &.sortable-th {\n      cursor: pointer !important;\n      transition: background-color 0.15s ease;\n\n      &:hover {\n        background-color: rgba(125, 125, 125, 0.1) !important;\n      }\n    }\n  }\n\n  \n\n  \n\n  ::ng-deep th.corner-th {\n    width: 34px !important;\n    min-width: 34px !important;\n    max-width: 34px !important;\n    left: 0;\n    z-index: 25 !important;\n    text-align: center !important;\n    background: var(--header-bg, #f1f5f9) !important;\n    border-right: 1px solid rgba(125, 125, 125, 0.35) !important;\n    cursor: pointer;\n\n    .corner-cog-icon {\n      font-size: 10px !important;\n      color: var(--text-muted, #64748b);\n      transition: all 0.2s ease;\n    }\n\n    &:hover .corner-cog-icon {\n      color: var(--primary, #4f46e5) !important;\n      transform: rotate(45deg);\n    }\n  }\n\n  \n\n  .col-header-controls {\n    display: flex;\n    align-items: center;\n    gap: 1.5px;\n    margin-left: 2px;\n    flex-shrink: 0;\n  }\n  .col-sort-trigger, .col-filter-trigger {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 13px;\n    height: 13px;\n    border-radius: 2px;\n    cursor: pointer;\n    color: var(--text-muted, #64748b);\n    opacity: 0.65;\n    transition: all 0.12s ease;\n    font-size: 8px;\n    line-height: 1;\n\n    i.pi {\n      font-size: 8px !important;\n    }\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.18);\n      opacity: 1;\n      color: var(--text, #0f172a);\n    }\n    &.is-sorted, &.is-filtered {\n      color: var(--primary, #4f46e5) !important;\n      opacity: 1 !important;\n      font-weight: 700;\n      background: var(--primary-soft, #e0e7ff);\n    }\n  }\n\n  \n\n  ::ng-deep .p-datatable-tbody > tr {\n    background-color: var(--surface, #ffffff) !important;\n    color: var(--text, #0f172a) !important;\n  }\n  ::ng-deep .p-datatable-tbody > tr > td {\n    height: var(--cell-height, 23px) !important;\n    padding: 0 !important;\n    background-color: var(--surface, #ffffff) !important;\n    color: var(--text, #0f172a) !important;\n    border-right: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    border-bottom: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    vertical-align: middle;\n    font-size: 11.5px;\n  }\n\n  \n\n  ::ng-deep td.row-num-td {\n    position: sticky;\n    left: 0;\n    z-index: 15;\n    width: 34px !important;\n    min-width: 34px !important;\n    max-width: 34px !important;\n    text-align: center;\n    background: var(--header-bg, #f1f5f9) !important;\n    border-right: 1px solid rgba(125, 125, 125, 0.35) !important;\n    color: var(--text-muted, #64748b);\n    font-size: 11px;\n    font-weight: 500;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n    user-select: none;\n    cursor: pointer;\n    letter-spacing: -0.2px;\n    padding: 0 !important;\n    transition: background-color 0.12s ease;\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.16) !important;\n      color: var(--text, #1e293b);\n    }\n\n    .row-state-dot {\n      font-size: 10px;\n      font-weight: 700;\n      margin-right: 2px;\n      &.dot-new { color: #15803d; }\n      &.dot-edited { color: #b45309; }\n    }\n  }\n\n  \n\n  ::ng-deep tr.row-selected {\n    background-color: rgba(59, 130, 246, 0.12) !important;\n\n    > td {\n      background-color: rgba(59, 130, 246, 0.12) !important;\n      border-top: 1px solid rgba(59, 130, 246, 0.4) !important;\n      border-bottom: 1px solid rgba(59, 130, 246, 0.4) !important;\n    }\n\n    > td.row-num-td {\n      background-color: #2563eb !important;\n      color: #ffffff !important;\n      font-weight: 700 !important;\n      border-top: 1px solid #2563eb !important;\n      border-bottom: 1px solid #2563eb !important;\n      border-right: 1px solid #1d4ed8 !important;\n\n      .row-state-dot {\n        color: #ffffff !important;\n      }\n    }\n\n    .cell-box {\n      background-color: transparent !important;\n    }\n  }\n\n  \n\n  .cell-box {\n    height: var(--cell-height, 23px);\n    padding: 0 6px;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    display: flex;\n    align-items: center;\n    cursor: cell;\n    width: 100%;\n    position: relative;\n\n    &.cell-active {\n      box-shadow: inset 0 0 0 2px #3b82f6 !important;\n      z-index: 10;\n    }\n    &.cell-editing {\n      padding: 0 !important;\n      box-shadow: inset 0 0 0 2px #3b82f6 !important;\n      background: var(--surface, #ffffff) !important;\n      z-index: 20;\n    }\n    &.cell-bad {\n      background-color: rgba(244, 63, 94, 0.18) !important;\n      color: #f43f5e !important;\n      font-weight: 600;\n      box-shadow: inset 0 0 0 1px #f43f5e;\n    }\n    &.cell-edited {\n      background-color: var(--cell-edited-bg, #fef9c3) !important;\n      box-shadow: inset 0 0 0 1px rgba(234, 179, 8, 0.45);\n    }\n    &.cell-new {\n      background-color: var(--row-new-bg, #dcfce7) !important;\n    }\n  }\n\n  \n\n  ::ng-deep tr.row-edited td {\n    background-color: var(--row-edited-bg, #fffbeb);\n\n    &.row-num-td {\n      background-color: rgba(234, 179, 8, 0.2) !important;\n      color: #b45309 !important;\n      font-weight: 700;\n      border-left: 3px solid var(--cell-edited-border, #eab308) !important;\n    }\n  }\n\n  \n\n  ::ng-deep tr.row-new td {\n    background-color: var(--row-new-bg, #dcfce7);\n\n    &.row-num-td {\n      background-color: rgba(34, 197, 94, 0.2) !important;\n      color: #15803d !important;\n      font-weight: 700;\n      border-left: 3px solid var(--row-new-border, #22c55e) !important;\n    }\n  }\n\n  .raw-cell-editor {\n    width: 100%;\n    height: 100%;\n    border: none;\n    outline: none;\n    background: transparent;\n    color: var(--text, inherit);\n    font-family: inherit;\n    font-size: 11.5px;\n    padding: 0 6px;\n    margin: 0;\n    box-sizing: border-box;\n  }\n}\n\n\n\n\n\n.custom-context-menu[_ngcontent-%COMP%] {\n  position: fixed;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 6px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);\n  min-width: 220px;\n  max-width: 280px;\n  z-index: 100000;\n  padding: 4px 0;\n  white-space: nowrap;\n  animation: _ngcontent-%COMP%_contextMenuPop 0.12s ease-out;\n  user-select: none;\n\n  .context-menu-item {\n    padding: 6px 14px;\n    font-size: 11.5px;\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    color: var(--text, #0f172a);\n    transition: background 0.12s ease;\n    white-space: nowrap;\n\n    i {\n      font-size: 12px;\n      color: var(--text-muted, #64748b);\n      width: 14px;\n      text-align: center;\n      flex-shrink: 0;\n    }\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.1);\n      color: var(--text, #0f172a);\n\n      i {\n        color: var(--primary, #4f46e5);\n      }\n    }\n\n    &.text-danger {\n      color: #ef4444 !important;\n      &:hover {\n        background: rgba(239, 68, 68, 0.1) !important;\n      }\n    }\n\n    kbd {\n      font-size: 10px;\n      padding: 1px 4px;\n      background: rgba(125, 125, 125, 0.12);\n      border-radius: 3px;\n      font-family: inherit;\n      color: var(--text-muted, #64748b);\n    }\n  }\n\n  .context-menu-divider {\n    height: 1px;\n    background: var(--surface-border, #e2e8f0);\n    margin: 4px 0;\n  }\n}\n\n@keyframes _ngcontent-%COMP%_contextMenuPop {\n  from {\n    opacity: 0;\n    transform: scale(0.96);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n\n\n\n\n\n.ref-dropdown-menu[_ngcontent-%COMP%] {\n  position: fixed;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 6px;\n  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.28), 0 8px 10px -6px rgba(0, 0, 0, 0.2);\n  max-height: 220px;\n  overflow-y: auto;\n  z-index: 100001;\n  font-size: 11.5px;\n  font-family: inherit;\n  animation: _ngcontent-%COMP%_fadeInDropdown 0.12s ease-out;\n  box-sizing: border-box;\n\n  .ref-dropdown-header {\n    padding: 5px 9px;\n    font-size: 10px;\n    font-weight: 700;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    background: var(--header-bg, #f1f5f9);\n    color: var(--text-muted, #64748b);\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    position: sticky;\n    top: 0;\n    z-index: 2;\n  }\n\n  .ref-dropdown-item {\n    padding: 6px 10px;\n    cursor: pointer;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    color: var(--text, #0f172a);\n    border-bottom: 1px solid var(--cell-border, rgba(125, 125, 125, 0.1));\n    transition: background 0.12s ease;\n    line-height: 1.3;\n\n    &:last-child {\n      border-bottom: none;\n    }\n\n    &:hover,\n    &.highlighted {\n      background: var(--primary-soft, #e0e7ff) !important;\n      color: var(--primary, #4f46e5) !important;\n      font-weight: 600;\n    }\n\n    .ref-item-badge {\n      font-size: 9.5px;\n      font-weight: 600;\n      padding: 1px 6px;\n      border-radius: 3px;\n      background: rgba(100, 116, 139, 0.15);\n      color: var(--text-muted, #64748b);\n      margin-left: 8px;\n      flex-shrink: 0;\n    }\n  }\n\n  .ref-dropdown-empty {\n    padding: 10px;\n    color: var(--text-muted, #64748b);\n    font-style: italic;\n    text-align: center;\n  }\n}\n\n@keyframes _ngcontent-%COMP%_fadeInDropdown {\n  from {\n    opacity: 0;\n    transform: translateY(-4px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n\n\n\n\n.inline-solve-prompt[_ngcontent-%COMP%] {\n  position: fixed;\n  bottom: 70px;\n  right: 25px;\n  z-index: 2100;\n  width: 440px;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 8px;\n  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);\n  animation: _ngcontent-%COMP%_promptSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);\n}\n@keyframes _ngcontent-%COMP%_promptSlideUp {\n  from {\n    opacity: 0;\n    transform: translateY(16px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n\n\n\n\n  .sutram-col-filter-popover {\n  width: 290px !important;\n  font-size: 12px;\n  border-radius: 8px !important;\n  overflow: hidden;\n  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08) !important;\n  border: 1px solid var(--surface-border, #e2e8f0) !important;\n  background: var(--surface, #ffffff) !important;\n  color: var(--text, #0f172a) !important;\n\n  .p-overlaypanel-content {\n    padding: 0 !important;\n    background: transparent !important;\n    color: inherit !important;\n  }\n}\n\n.filter-popover-content[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  background: var(--surface, #ffffff);\n  color: var(--text, #0f172a);\n  border-radius: 8px;\n  overflow: hidden;\n\n  .popover-header {\n    padding: 9px 12px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    background: rgba(125, 125, 125, 0.05);\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n\n    .popover-title {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      font-weight: 700;\n      font-size: 12px;\n      color: var(--text, #0f172a);\n\n      .col-name {\n        max-width: 170px;\n      }\n      .badge-type {\n        font-size: 9px;\n        padding: 1px 5px;\n        border-radius: 3px;\n        background: rgba(59, 130, 246, 0.15);\n        color: #2563eb;\n        font-weight: 600;\n      }\n    }\n\n    .btn-popover-close {\n      background: transparent;\n      border: none;\n      width: 22px;\n      height: 22px;\n      border-radius: 4px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      cursor: pointer;\n      color: var(--text-muted, #64748b);\n      transition: all 0.15s ease;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.15);\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .popover-search-wrap {\n    position: relative;\n    padding: 8px 10px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n\n    .search-icon {\n      position: absolute;\n      left: 18px;\n      top: 17px;\n      font-size: 11px;\n      color: var(--text-muted, #64748b);\n      pointer-events: none;\n    }\n    .popover-search-input {\n      width: 100%;\n      height: 28px;\n      padding: 4px 26px;\n      font-size: 11.5px;\n      border-radius: 5px;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      background: var(--bg, #f8fafc);\n      color: var(--text, #0f172a);\n      outline: none;\n      transition: border-color 0.15s, box-shadow 0.15s;\n\n      &:focus {\n        border-color: #3b82f6;\n        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);\n      }\n    }\n    .btn-clear-search-inline {\n      position: absolute;\n      right: 18px;\n      top: 15px;\n      background: transparent;\n      border: none;\n      color: var(--text-muted, #64748b);\n      cursor: pointer;\n      padding: 0;\n      font-size: 11px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n\n      &:hover {\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .popover-action-strip {\n    padding: 6px 12px;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    background: rgba(125, 125, 125, 0.02);\n    border-bottom: 1px solid var(--cell-border, rgba(125, 125, 125, 0.1));\n    font-size: 11px;\n\n    .select-all-label {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      cursor: pointer;\n      font-weight: 600;\n      color: var(--text, #0f172a);\n      user-select: none;\n      margin: 0;\n    }\n\n    .quick-links {\n      display: flex;\n      align-items: center;\n      gap: 4px;\n\n      .btn-link-action {\n        background: transparent;\n        border: none;\n        color: #3b82f6;\n        cursor: pointer;\n        padding: 0 3px;\n        font-size: 11px;\n        font-weight: 600;\n        text-decoration: none;\n\n        &:hover {\n          text-decoration: underline;\n        }\n      }\n      .divider {\n        color: var(--text-muted, #64748b);\n        opacity: 0.5;\n      }\n    }\n\n    .count-pill {\n      font-size: 10px;\n      color: var(--text-muted, #64748b);\n      font-weight: 500;\n    }\n  }\n\n  .popover-checklist-items {\n    max-height: 180px;\n    overflow-y: auto;\n    padding: 3px 0;\n\n    &::-webkit-scrollbar {\n      width: 5px;\n    }\n    &::-webkit-scrollbar-thumb {\n      background: rgba(125, 125, 125, 0.3);\n      border-radius: 4px;\n    }\n\n    .checklist-item {\n      padding: 5px 12px;\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      gap: 8px;\n      cursor: pointer;\n      user-select: none;\n      transition: background-color 0.1s ease;\n      color: var(--text, #0f172a);\n\n      &:hover {\n        background: rgba(59, 130, 246, 0.08);\n      }\n\n      .item-left {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        flex-grow: 1;\n        min-width: 0;\n      }\n\n      .item-label {\n        font-size: 11.5px;\n        color: var(--text, #0f172a);\n      }\n\n      .item-right {\n        display: flex;\n        align-items: center;\n        gap: 4px;\n        flex-shrink: 0;\n      }\n\n      .item-code-chip {\n        font-size: 9.5px;\n        padding: 1px 5px;\n        border-radius: 3px;\n        background: rgba(125, 125, 125, 0.12);\n        color: var(--text-muted, #64748b);\n        font-weight: 500;\n      }\n\n      .item-count-badge {\n        font-size: 10px;\n        padding: 1px 6px;\n        border-radius: 999px;\n        background: rgba(125, 125, 125, 0.12);\n        color: var(--text-muted, #64748b);\n        font-weight: 500;\n      }\n    }\n\n    .empty-list-state {\n      padding: 16px;\n      text-align: center;\n      color: var(--text-muted, #64748b);\n      font-size: 11.5px;\n    }\n  }\n\n  .custom-check {\n    width: 14px;\n    height: 14px;\n    accent-color: #3b82f6;\n    cursor: pointer;\n    margin: 0;\n    flex-shrink: 0;\n  }\n\n  .popover-footer {\n    padding: 8px 12px;\n    border-top: 1px solid var(--surface-border, #e2e8f0);\n    background: rgba(125, 125, 125, 0.04);\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 8px;\n\n    .btn-filter-clear {\n      background: transparent;\n      border: 1px solid transparent;\n      color: #ef4444;\n      font-size: 11px;\n      font-weight: 600;\n      padding: 3px 8px;\n      border-radius: 4px;\n      cursor: pointer;\n      transition: all 0.15s ease;\n\n      &:hover {\n        background: rgba(239, 68, 68, 0.1);\n      }\n    }\n\n    .footer-actions-right {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n    }\n\n    .btn-filter-cancel {\n      background: transparent;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      color: var(--text-muted, #64748b);\n      font-size: 11px;\n      font-weight: 600;\n      padding: 3px 10px;\n      border-radius: 4px;\n      cursor: pointer;\n      transition: all 0.15s ease;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n        color: var(--text, #0f172a);\n      }\n    }\n\n    .btn-filter-apply {\n      background: #3b82f6;\n      border: 1px solid #3b82f6;\n      color: #ffffff;\n      font-size: 11px;\n      font-weight: 600;\n      padding: 3px 12px;\n      border-radius: 4px;\n      cursor: pointer;\n      display: inline-flex;\n      align-items: center;\n      gap: 4px;\n      transition: all 0.15s ease;\n\n      &:hover {\n        background: #2563eb;\n      }\n    }\n  }\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramGridComponent, [{
        type: Component,
        args: [{ selector: 'sutram-grid', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-grid.component.html -->\n<div class=\"sutram-grid-wrapper\" (contextmenu)=\"$event.preventDefault()\">\n\n  <!-- 1. Sleek Pixel-Perfect Custom Context Menu (Replaces p-contextMenu) -->\n  <div *ngIf=\"contextMenuState.visible\"\n       class=\"custom-context-menu shadow-lg\"\n       [style.top.px]=\"contextMenuState.y\"\n       [style.left.px]=\"contextMenuState.x\"\n       (click)=\"$event.stopPropagation()\">\n\n    <!-- Cell Actions (Copy, Cut, Paste) -->\n    <ng-container *ngIf=\"contextMenuState.type === 'cell'\">\n      <div class=\"context-menu-item\" (click)=\"copyActiveCell()\">\n        <i class=\"pi pi-copy\"></i>\n        <span>\u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902 (Copy)</span>\n        <kbd class=\"ms-auto\">Ctrl+C</kbd>\n      </div>\n      <div class=\"context-menu-item\" (click)=\"cutActiveCell()\">\n        <i class=\"pi pi-file-edit\"></i>\n        <span>\u0915\u091F \u0915\u0930\u0947\u0902 (Cut)</span>\n        <kbd class=\"ms-auto\">Ctrl+X</kbd>\n      </div>\n      <div class=\"context-menu-item\" (click)=\"pasteToActiveCell()\">\n        <i class=\"pi pi-clipboard\"></i>\n        <span>\u092A\u0947\u0938\u094D\u091F \u0915\u0930\u0947\u0902 (Paste)</span>\n        <kbd class=\"ms-auto\">Ctrl+V</kbd>\n      </div>\n      <div class=\"context-menu-divider\"></div>\n    </ng-container>\n\n    <!-- Copy Row (Row Header Action) -->\n    <ng-container *ngIf=\"contextMenuState.type === 'row'\">\n      <div class=\"context-menu-item\" (click)=\"copySelectedRow()\">\n        <i class=\"pi pi-copy\"></i>\n        <span>\u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902 (Copy)</span>\n      </div>\n      <div class=\"context-menu-divider\"></div>\n    </ng-container>\n\n    <!-- Row Operations (Insert Above, Insert Below, Duplicate Row) -->\n    <div class=\"context-menu-item\" (click)=\"insertRowAbove()\">\n      <i class=\"pi pi-arrow-up\"></i>\n      <span>\u090A\u092A\u0930 \u092A\u0902\u0915\u094D\u0924\u093F \u091C\u094B\u0921\u093C\u0947\u0902 (Insert Row Above)</span>\n    </div>\n    <div class=\"context-menu-item\" (click)=\"insertRowBelow()\">\n      <i class=\"pi pi-arrow-down\"></i>\n      <span>\u0928\u0940\u091A\u0947 \u092A\u0902\u0915\u094D\u0924\u093F \u091C\u094B\u0921\u093C\u0947\u0902 (Insert Row Below)</span>\n    </div>\n    <div class=\"context-menu-item\" (click)=\"duplicateRow()\">\n      <i class=\"pi pi-clone\"></i>\n      <span>\u092A\u0902\u0915\u094D\u0924\u093F \u0921\u0941\u092A\u094D\u0932\u093F\u0915\u0947\u091F \u0915\u0930\u0947\u0902 (Duplicate Row)</span>\n    </div>\n\n    <!-- Delete Row (Soft Red) -->\n    <ng-container *ngIf=\"enableDelete\">\n      <div class=\"context-menu-divider\"></div>\n      <div class=\"context-menu-item text-danger\" (click)=\"deleteRow()\">\n        <i class=\"pi pi-trash\" style=\"color: #ef4444;\"></i>\n        <span style=\"color: #ef4444; font-weight: 600;\">\u092A\u0902\u0915\u094D\u0924\u093F \u0939\u091F\u093E\u090F\u0902 (Delete Row)</span>\n      </div>\n    </ng-container>\n  </div>\n\n  <!-- 2. Floating Smart FK Reference Dropdown Menu (Smart Mode live lookup) -->\n  <div *ngIf=\"dropdownOpen && isFkColumn(editingColDef)\"\n       class=\"ref-dropdown-menu shadow-lg\"\n       [style.top.px]=\"dropdownPos.top\"\n       [style.left.px]=\"dropdownPos.left\"\n       [style.min-width.px]=\"dropdownPos.minWidth\"\n       (mousedown)=\"$event.preventDefault()\">\n\n    <div class=\"ref-dropdown-header\">\n      <span>Select {{ editingColDef?.ref_table || editingColDef?.name }} ({{ dropdownOptions.length }})</span>\n      <small style=\"opacity: 0.8; font-weight: 400;\">\u2191\u2193 to navigate, Enter to select</small>\n    </div>\n\n    <div class=\"ref-dropdown-items-wrap\" style=\"max-height: 185px; overflow-y: auto;\">\n      <div *ngFor=\"let opt of dropdownOptions; let i = index\"\n           class=\"ref-dropdown-item\"\n           [class.highlighted]=\"i === highlightedIdx\"\n           (mousedown)=\"selectDropdownOption(opt, $event, true)\">\n        <span class=\"ref-item-label text-truncate\">{{ opt.display }}</span>\n        <span *ngIf=\"opt.code\" class=\"ref-item-badge\">{{ opt.code }}</span>\n      </div>\n\n      <div *ngIf=\"dropdownOptions.length === 0\" class=\"ref-dropdown-empty\">\n        <i class=\"pi pi-search me-1\"></i>\n        No matching {{ editingColDef?.ref_table || editingColDef?.name }} found\n      </div>\n    </div>\n  </div>\n\n  <!-- 3. Excel-like Column Header Filter & Sort Popover -->\n  <p-overlayPanel #colFilterOp\n                  [showCloseIcon]=\"false\"\n                  [dismissable]=\"true\"\n                  styleClass=\"sutram-col-filter-popover shadow-lg\">\n    <ng-template pTemplate=\"content\">\n      <div *ngIf=\"activeFilterCol\" class=\"filter-popover-content\">\n        <!-- Popover Header -->\n        <div class=\"popover-header\">\n          <div class=\"popover-title text-truncate\">\n            <i class=\"pi pi-filter-fill text-primary\"></i>\n            <span class=\"col-name text-truncate\" [title]=\"activeFilterCol.name\">{{ activeFilterCol.name }}</span>\n            <span *ngIf=\"activeFilterCol.ref_table || activeFilterCol.type === 'ref'\" class=\"badge-type\">\n              {{ activeFilterCol.ref_table || 'ref' }}\n            </span>\n          </div>\n          <button type=\"button\" class=\"btn-popover-close\" (click)=\"colFilterOp.hide()\" title=\"Close\">\n            <i class=\"pi pi-times\"></i>\n          </button>\n        </div>\n\n        <!-- Search Bar -->\n        <div class=\"popover-search-wrap\">\n          <i class=\"pi pi-search search-icon\"></i>\n          <input type=\"text\"\n                 class=\"popover-search-input\"\n                 placeholder=\"Search in list...\"\n                 [(ngModel)]=\"filterChecklistSearch\" />\n          <button *ngIf=\"filterChecklistSearch\"\n                  type=\"button\"\n                  class=\"btn-clear-search-inline\"\n                  (click)=\"filterChecklistSearch = ''\">\n            <i class=\"pi pi-times\"></i>\n          </button>\n        </div>\n\n        <!-- Action Strip: Select All & Quick Links -->\n        <div class=\"popover-action-strip\">\n          <label class=\"select-all-label\">\n            <input type=\"checkbox\"\n                   class=\"custom-check\"\n                   [checked]=\"isAllChecklistSelected()\"\n                   (change)=\"toggleSelectAllChecklist($event)\" />\n            <span>(Select All)</span>\n          </label>\n          <div class=\"quick-links\">\n            <button type=\"button\" class=\"btn-link-action\" (click)=\"selectAllFilteredItems()\">All</button>\n            <span class=\"divider\">\u00B7</span>\n            <button type=\"button\" class=\"btn-link-action\" (click)=\"clearAllFilteredItems()\">Clear</button>\n          </div>\n          <span class=\"count-pill\">\n            {{ selectedChecklistValues.size }} / {{ currentChecklistItems.length }}\n          </span>\n        </div>\n\n        <!-- Checklist Values Container -->\n        <div class=\"popover-checklist-items\">\n          <div *ngFor=\"let item of filteredChecklistItems\"\n               class=\"checklist-item\"\n               (click)=\"toggleChecklistItem(item.value)\">\n            <div class=\"item-left text-truncate\">\n              <input type=\"checkbox\"\n                     class=\"custom-check\"\n                     [checked]=\"selectedChecklistValues.has(item.value)\"\n                     (click)=\"$event.stopPropagation()\"\n                     (change)=\"toggleChecklistItem(item.value)\" />\n              <span class=\"item-label text-truncate\" [title]=\"item.display\">\n                {{ item.display }}\n              </span>\n            </div>\n            <div class=\"item-right\">\n              <span *ngIf=\"item.code\" class=\"item-code-chip\">{{ item.code }}</span>\n              <span *ngIf=\"item.count !== undefined && item.count > 0\" class=\"item-count-badge\">{{ item.count }}</span>\n            </div>\n          </div>\n\n          <div *ngIf=\"filteredChecklistItems.length === 0\" class=\"empty-list-state\">\n            <i class=\"pi pi-search me-1\"></i> No matching values\n          </div>\n        </div>\n\n        <!-- Footer Actions -->\n        <div class=\"popover-footer\">\n          <button type=\"button\"\n                  class=\"btn-filter-clear\"\n                  (click)=\"clearCurrentColFilter(colFilterOp)\">\n            <i class=\"pi pi-trash me-1\"></i>Reset\n          </button>\n          <div class=\"footer-actions-right\">\n            <button type=\"button\"\n                    class=\"btn-filter-cancel\"\n                    (click)=\"colFilterOp.hide()\">\n              Cancel\n            </button>\n            <button type=\"button\"\n                    class=\"btn-filter-apply\"\n                    (click)=\"applyCurrentColFilter(colFilterOp)\">\n              <i class=\"pi pi-check\"></i> Apply\n            </button>\n          </div>\n        </div>\n\n      </div>\n    </ng-template>\n  </p-overlayPanel>\n\n  <!-- 4. PrimeNG Virtual Table -->\n  <p-table #pTable\n           [value]=\"visibleRows\"\n           [columns]=\"headers\"\n           [virtualScroll]=\"true\"\n           [virtualScrollItemSize]=\"23\"\n           [virtualScrollOptions]=\"{ autoSize: false, numToleratedItems: 30 }\"\n           [rowTrackBy]=\"trackByRowNum\"\n           [scrollable]=\"true\"\n           scrollHeight=\"flex\"\n           [resizableColumns]=\"true\"\n           columnResizeMode=\"expand\"\n           [reorderableColumns]=\"true\"\n           styleClass=\"p-datatable-gridlines p-datatable-sm sutram-grid-table\">\n\n    <!-- Table Header Row -->\n    <ng-template pTemplate=\"header\" let-columns>\n      <tr>\n        <!-- Corner Cog Config Trigger -->\n        <th class=\"corner-th corner-config-th\" pFrozenColumn style=\"width: 34px; min-width: 34px; max-width: 34px; text-align: center;\"\n            (click)=\"openConfig.emit($event)\" title=\"Configure Columns (\u0915\u0949\u0932\u092E \u091A\u0941\u0928\u0947\u0902)\">\n          <div style=\"display: flex; align-items: center; justify-content: center;\">\n            <i class=\"pi pi-cog corner-cog-icon\" style=\"font-size: 12px; color: var(--text-muted, #64748b);\"></i>\n          </div>\n        </th>\n\n        <!-- Dynamic Schema Columns with Letters (A, B, C...) -->\n        <th *ngFor=\"let col of columns; let idx = index\"\n            pResizableColumn\n            pReorderableColumn\n            [style.width.px]=\"getColumnWidth(col)\"\n            [style.min-width.px]=\"getColumnWidth(col)\"\n            [style.max-width.px]=\"getColumnWidth(col)\"\n            class=\"sutram-th\"\n            [class.sortable-th]=\"state.sortingEnabled()\"\n            (click)=\"onHeaderClick(col)\">\n          <div style=\"display: flex; justify-content: space-between; align-items: center; position: relative; width: 100%;\">\n            <span class=\"col-header-title text-truncate d-flex align-items-center\" [title]=\"col.description || col.short_name || col.name\">\n              <strong style=\"color: var(--text-muted, #64748b); font-size: 11px; margin-right: 5px;\">{{ getColLetter(idx) }}</strong>\n              <span class=\"text-truncate\">{{ col.short_name || col.name }}</span>\n              <span *ngIf=\"col.not_null\" style=\"color: #ef4444; margin-left: 2px;\">*</span>\n            </span>\n\n            <!-- Header Action Controls: FK Pill, Sort & Filter Trigger -->\n            <div class=\"col-header-controls d-flex align-items-center\" (click)=\"$event.stopPropagation()\">\n              <span *ngIf=\"col.is_fk_subcol\"\n                    style=\"font-size: 9px; padding: 1px 4px; background: rgba(16, 185, 129, 0.15); color: #059669; border-radius: 3px; font-weight: 600; margin-right: 4px;\"\n                    [title]=\"'Reference: ' + (col.ref_table || col.group)\">\n                {{ col.ref_table || col.group }}\n              </span>\n\n              <span *ngIf=\"!col.is_fk_subcol && (col.type === 'ref' || col.ref_table || col.is_fk_main)\"\n                    style=\"font-size: 9px; padding: 1px 4px; background: rgba(59, 130, 246, 0.15); color: #2563eb; border-radius: 3px; font-weight: 600; margin-right: 4px;\"\n                    [title]=\"'FK: ' + (col.ref_table || col.name)\">\n                {{ col.ref_table || col.name }}\n              </span>\n\n              <span *ngIf=\"col.is_fk_raw\"\n                    style=\"font-size: 9px; padding: 1px 4px; background: rgba(245, 158, 11, 0.15); color: #d97706; border-radius: 3px; font-weight: 600; margin-right: 4px;\"\n                    title=\"Raw ID\">\n                id\n              </span>\n\n              <span *ngIf=\"state.sortingEnabled()\"\n                    class=\"col-sort-trigger\"\n                    [class.is-sorted]=\"state.activeSort()?.colKey === (col.key || col.name)\"\n                    (click)=\"onHeaderClick(col)\"\n                    [title]=\"state.activeSort()?.colKey === (col.key || col.name) ? (state.activeSort()?.order === 'ASC' ? 'Sorted: ASC' : 'Sorted: DESC') : 'Sort'\">\n                <i class=\"pi\"\n                   [ngClass]=\"state.activeSort()?.colKey === (col.key || col.name)\n                     ? (state.activeSort()?.order === 'ASC' ? 'pi-sort-amount-up-alt text-primary' : 'pi-sort-amount-down text-primary')\n                     : 'pi-sort-alt text-muted'\"></i>\n              </span>\n\n              <span *ngIf=\"state.filtersEnabled()\"\n                    class=\"col-filter-trigger\"\n                    [class.is-filtered]=\"isColumnFiltered(col.key || col.name)\"\n                    (click)=\"openColumnFilter($event, col, colFilterOp)\"\n                    [title]=\"isColumnFiltered(col.key || col.name) ? 'Filter Active' : 'Filter'\">\n                <i class=\"pi\" [ngClass]=\"isColumnFiltered(col.key || col.name) ? 'pi-filter-fill text-primary' : 'pi-filter'\"></i>\n              </span>\n            </div>\n          </div>\n        </th>\n      </tr>\n    </ng-template>\n\n    <!-- Table Body Rows -->\n    <ng-template pTemplate=\"body\" let-row let-rowIndex=\"rowIndex\" let-columns=\"columns\">\n      <tr [class.row-new]=\"row.isNew && isRowPopulated(row)\"\n          [class.row-edited]=\"!row.isNew && row.isModified\"\n          [class.row-has-error]=\"row.hasError\"\n          [class.row-synced]=\"row.isSynced\"\n          [class.row-selected]=\"selectedRowIdx === rowIndex\">\n\n        <!-- Sticky Row Number TD (34px, Authentic Excel Look) -->\n        <td class=\"row-num-td\"\n            pFrozenColumn\n            style=\"width: 34px; min-width: 34px; max-width: 34px; text-align: center;\"\n            (click)=\"onRowHeaderClick(rowIndex, row, $event)\"\n            (contextmenu)=\"openRowContextMenu($event, row, rowIndex)\">\n          <span *ngIf=\"row.isNew && isRowPopulated(row)\" class=\"row-state-dot dot-new\">+</span>\n          <span *ngIf=\"!row.isNew && row.isModified\" class=\"row-state-dot dot-edited\">\u2022</span>\n          <span class=\"row-num-text\">{{ row.rowNum }}</span>\n        </td>\n\n        <!-- Compact Small Data Cells (23px height) -->\n        <td *ngFor=\"let col of columns\"\n            [style.width.px]=\"getColumnWidth(col)\"\n            [style.min-width.px]=\"getColumnWidth(col)\"\n            [style.max-width.px]=\"getColumnWidth(col)\">\n\n          <div class=\"cell-box\"\n               [class.cell-active]=\"state.selectedCell()?.rowIdx === rowIndex && state.selectedCell()?.colKey === (col.key || col.name)\"\n               [class.cell-editing]=\"isCellEditing(rowIndex, col.key || col.name)\"\n               [class.cell-bad]=\"!row.cells[col.key || col.name]?.isValid\"\n               [class.cell-edited]=\"row.cells[col.key || col.name]?.isModified\"\n               [class.cell-new]=\"row.isNew && isRowPopulated(row)\"\n               [title]=\"row.cells[col.key || col.name]?.errorMessage || ''\"\n               (click)=\"onCellClick(rowIndex, col.key || col.name, $event)\"\n               (dblclick)=\"startCellEdit(rowIndex, col.key || col.name, row, $event)\"\n               (contextmenu)=\"openCellContextMenu($event, rowIndex, col.key || col.name, row)\">\n\n            <!-- In-Cell Edit Mode Input -->\n            <ng-container *ngIf=\"isCellEditing(rowIndex, col.key || col.name); else normalMode\">\n              <input #cellEditorInput\n                     type=\"text\"\n                     class=\"raw-cell-editor\"\n                     [(ngModel)]=\"editingValue\"\n                     (input)=\"onEditorInput(editingValue, col, row)\"\n                     (keydown)=\"onCellEditorKeydown($event, rowIndex, col.key || col.name, row)\"\n                     (blur)=\"onCellEditorBlur(rowIndex, col.key || col.name, row)\" />\n            </ng-container>\n\n            <!-- Normal Output Mode -->\n            <ng-template #normalMode>\n              <span class=\"cell-value-text text-truncate\">{{ row.cells[col.key || col.name]?.value }}</span>\n            </ng-template>\n\n          </div>\n        </td>\n      </tr>\n    </ng-template>\n\n    <!-- Empty State Message -->\n    <ng-template pTemplate=\"emptymessage\">\n      <tr>\n        <td [attr.colspan]=\"headers.length + 1\" class=\"text-center py-4 text-muted\">\n          <i class=\"pi pi-file-excel me-2\" style=\"font-size: 16px;\"></i>\n          \u0915\u094B\u0908 \u0921\u0947\u091F\u093E \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u090A\u092A\u0930 \u0938\u0947 Excel \u092B\u093C\u093E\u0907\u0932 \u0916\u094B\u0932\u0947\u0902 \u092F\u093E 'Load Data' \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964\n        </td>\n      </tr>\n    </ng-template>\n\n  </p-table>\n\n  <!-- 5. Inline \"Solve All\" Batch Mistake Prompt Modal -->\n  <div *ngIf=\"promptState.visible\" class=\"inline-solve-prompt card shadow-lg p-3\">\n    <div class=\"d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom\">\n      <div class=\"d-flex align-items-center gap-2\">\n        <i class=\"pi pi-bolt text-warning\" style=\"font-size: 16px;\"></i>\n        <strong class=\"fs-7\">\u0938\u094D\u092E\u093E\u0930\u094D\u091F \u092C\u0948\u091A \u0938\u0941\u0927\u093E\u0930 (Solve All Matches)</strong>\n      </div>\n      <button type=\"button\" class=\"btn-close\" (click)=\"dismissPrompt()\"></button>\n    </div>\n\n    <div class=\"prompt-body text-start mb-3\">\n      <p class=\"small text-muted mb-2\">\n        \u0906\u092A\u0928\u0947 \u092A\u0902\u0915\u094D\u0924\u093F <strong>#{{ promptState.rowIdx + 1 }}</strong> \u092E\u0947\u0902 '<strong>{{ promptState.originalBadValue }}</strong>' \u0915\u094B \u092C\u0926\u0932\u0915\u0930\n        '<strong>{{ promptState.newSelectedDisplay }}</strong>' \u091A\u0941\u0928\u093E \u0939\u0948\u0964\n      </p>\n      <div class=\"alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 m-0\">\n        <i class=\"pi pi-info-circle\"></i>\n        <span>\n          \u0915\u0949\u0932\u092E <strong>{{ promptState.colKey }}</strong> \u092E\u0947\u0902 <strong>{{ promptState.matchingCount }}</strong> \u0905\u0928\u094D\u092F \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u094B\u0902 \u092E\u0947\u0902 \u092D\u0940 \u092F\u0939\u0940 \u0905\u092E\u093E\u0928\u094D\u092F \u092E\u093E\u0928 \u0939\u0948\u0964\n        </span>\n      </div>\n      <div class=\"form-check mt-2\">\n        <input class=\"form-check-input\" type=\"checkbox\" id=\"chkDict\" [(ngModel)]=\"promptState.saveToDictionary\">\n        <label class=\"form-check-label small cursor-pointer\" for=\"chkDict\">\n          \u092D\u0935\u093F\u0937\u094D\u092F \u0915\u0947 \u0932\u093F\u090F \u0921\u093F\u0915\u094D\u0936\u0928\u0930\u0940 \u092E\u0947\u0902 \u0938\u0939\u0947\u091C\u0947\u0902 (Save alias mapping to dictionary)\n        </label>\n      </div>\n    </div>\n\n    <div class=\"prompt-actions d-flex justify-content-end gap-2\">\n      <button type=\"button\" class=\"btn btn-sm btn-outline-secondary\" (click)=\"applySingleCellOnly()\">\n        \u0915\u0947\u0935\u0932 \u0907\u0938\u0940 \u092A\u0902\u0915\u094D\u0924\u093F \u092E\u0947\u0902 (Single Row Only)\n      </button>\n      <button type=\"button\" class=\"btn btn-sm btn-success\" (click)=\"confirmSolveAll()\">\n        \u0938\u092D\u0940 {{ promptState.matchingCount + 1 }} \u0938\u0941\u0927\u093E\u0930\u0947\u0902 (Solve All)\n      </button>\n    </div>\n  </div>\n\n</div>\n", styles: ["/**\n * sutram-grid.component.scss\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n * Pixel-Perfect Enterprise PrimeNG Virtual Table Styles.\n * Exact replication of Sutram Excel Studio v2.0 Grid:\n * Big Header Row (38px) + Compact Data Cells (23px).\n * In-cell inline editor, active cell blue outline, eye-protect\n * dirty state, custom context menu, and smart FK autocomplete dropdown.\n * \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n */\n\n:host {\n  display: block;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.sutram-grid-wrapper {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n\n  ::ng-deep .p-datatable-wrapper {\n    height: 100% !important;\n  }\n\n  /* Big Header Row (38px) */\n  ::ng-deep .p-datatable-thead > tr > th {\n    position: sticky;\n    top: 0;\n    z-index: 20;\n    background: var(--header-bg, #f1f5f9) !important;\n    color: var(--header-text, #1e293b) !important;\n    font-weight: 700 !important;\n    font-size: 13px !important;\n    height: var(--header-height, 38px) !important;\n    padding: 6px 10px !important;\n    border-right: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    border-bottom: 2px solid rgba(125, 125, 125, 0.35) !important;\n    white-space: nowrap !important;\n    user-select: none;\n    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);\n\n    &.sortable-th {\n      cursor: pointer !important;\n      transition: background-color 0.15s ease;\n\n      &:hover {\n        background-color: rgba(125, 125, 125, 0.1) !important;\n      }\n    }\n  }\n\n  /* Corner Config \u2699\uFE0F Trigger */\n  /* Corner Config \u2699\uFE0F Trigger (34px, Authentic Excel Look) */\n  ::ng-deep th.corner-th {\n    width: 34px !important;\n    min-width: 34px !important;\n    max-width: 34px !important;\n    left: 0;\n    z-index: 25 !important;\n    text-align: center !important;\n    background: var(--header-bg, #f1f5f9) !important;\n    border-right: 1px solid rgba(125, 125, 125, 0.35) !important;\n    cursor: pointer;\n\n    .corner-cog-icon {\n      font-size: 10px !important;\n      color: var(--text-muted, #64748b);\n      transition: all 0.2s ease;\n    }\n\n    &:hover .corner-cog-icon {\n      color: var(--primary, #4f46e5) !important;\n      transform: rotate(45deg);\n    }\n  }\n\n  /* Column Header Controls */\n  .col-header-controls {\n    display: flex;\n    align-items: center;\n    gap: 1.5px;\n    margin-left: 2px;\n    flex-shrink: 0;\n  }\n  .col-sort-trigger, .col-filter-trigger {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 13px;\n    height: 13px;\n    border-radius: 2px;\n    cursor: pointer;\n    color: var(--text-muted, #64748b);\n    opacity: 0.65;\n    transition: all 0.12s ease;\n    font-size: 8px;\n    line-height: 1;\n\n    i.pi {\n      font-size: 8px !important;\n    }\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.18);\n      opacity: 1;\n      color: var(--text, #0f172a);\n    }\n    &.is-sorted, &.is-filtered {\n      color: var(--primary, #4f46e5) !important;\n      opacity: 1 !important;\n      font-weight: 700;\n      background: var(--primary-soft, #e0e7ff);\n    }\n  }\n\n  /* Compact Small Data Cells (23px height) */\n  ::ng-deep .p-datatable-tbody > tr {\n    background-color: var(--surface, #ffffff) !important;\n    color: var(--text, #0f172a) !important;\n  }\n  ::ng-deep .p-datatable-tbody > tr > td {\n    height: var(--cell-height, 23px) !important;\n    padding: 0 !important;\n    background-color: var(--surface, #ffffff) !important;\n    color: var(--text, #0f172a) !important;\n    border-right: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    border-bottom: 1px solid var(--cell-border, rgba(125, 125, 125, 0.18)) !important;\n    vertical-align: middle;\n    font-size: 11.5px;\n  }\n\n  /* Sticky Row Number TD (34px, Authentic Excel Look) */\n  ::ng-deep td.row-num-td {\n    position: sticky;\n    left: 0;\n    z-index: 15;\n    width: 34px !important;\n    min-width: 34px !important;\n    max-width: 34px !important;\n    text-align: center;\n    background: var(--header-bg, #f1f5f9) !important;\n    border-right: 1px solid rgba(125, 125, 125, 0.35) !important;\n    color: var(--text-muted, #64748b);\n    font-size: 11px;\n    font-weight: 500;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n    user-select: none;\n    cursor: pointer;\n    letter-spacing: -0.2px;\n    padding: 0 !important;\n    transition: background-color 0.12s ease;\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.16) !important;\n      color: var(--text, #1e293b);\n    }\n\n    .row-state-dot {\n      font-size: 10px;\n      font-weight: 700;\n      margin-right: 2px;\n      &.dot-new { color: #15803d; }\n      &.dot-edited { color: #b45309; }\n    }\n  }\n\n  /* Full Row Selected State (Authentic Excel Selection) */\n  ::ng-deep tr.row-selected {\n    background-color: rgba(59, 130, 246, 0.12) !important;\n\n    > td {\n      background-color: rgba(59, 130, 246, 0.12) !important;\n      border-top: 1px solid rgba(59, 130, 246, 0.4) !important;\n      border-bottom: 1px solid rgba(59, 130, 246, 0.4) !important;\n    }\n\n    > td.row-num-td {\n      background-color: #2563eb !important;\n      color: #ffffff !important;\n      font-weight: 700 !important;\n      border-top: 1px solid #2563eb !important;\n      border-bottom: 1px solid #2563eb !important;\n      border-right: 1px solid #1d4ed8 !important;\n\n      .row-state-dot {\n        color: #ffffff !important;\n      }\n    }\n\n    .cell-box {\n      background-color: transparent !important;\n    }\n  }\n\n  /* Cell Box & Excel Active Cell Blue Outline */\n  .cell-box {\n    height: var(--cell-height, 23px);\n    padding: 0 6px;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    display: flex;\n    align-items: center;\n    cursor: cell;\n    width: 100%;\n    position: relative;\n\n    &.cell-active {\n      box-shadow: inset 0 0 0 2px #3b82f6 !important;\n      z-index: 10;\n    }\n    &.cell-editing {\n      padding: 0 !important;\n      box-shadow: inset 0 0 0 2px #3b82f6 !important;\n      background: var(--surface, #ffffff) !important;\n      z-index: 20;\n    }\n    &.cell-bad {\n      background-color: rgba(244, 63, 94, 0.18) !important;\n      color: #f43f5e !important;\n      font-weight: 600;\n      box-shadow: inset 0 0 0 1px #f43f5e;\n    }\n    &.cell-edited {\n      background-color: var(--cell-edited-bg, #fef9c3) !important;\n      box-shadow: inset 0 0 0 1px rgba(234, 179, 8, 0.45);\n    }\n    &.cell-new {\n      background-color: var(--row-new-bg, #dcfce7) !important;\n    }\n  }\n\n  /* Eye Protect Warm Yellow for Edited Rows */\n  ::ng-deep tr.row-edited td {\n    background-color: var(--row-edited-bg, #fffbeb);\n\n    &.row-num-td {\n      background-color: rgba(234, 179, 8, 0.2) !important;\n      color: #b45309 !important;\n      font-weight: 700;\n      border-left: 3px solid var(--cell-edited-border, #eab308) !important;\n    }\n  }\n\n  /* Soft Light Green Shade for New Added Rows */\n  ::ng-deep tr.row-new td {\n    background-color: var(--row-new-bg, #dcfce7);\n\n    &.row-num-td {\n      background-color: rgba(34, 197, 94, 0.2) !important;\n      color: #15803d !important;\n      font-weight: 700;\n      border-left: 3px solid var(--row-new-border, #22c55e) !important;\n    }\n  }\n\n  .raw-cell-editor {\n    width: 100%;\n    height: 100%;\n    border: none;\n    outline: none;\n    background: transparent;\n    color: var(--text, inherit);\n    font-family: inherit;\n    font-size: 11.5px;\n    padding: 0 6px;\n    margin: 0;\n    box-sizing: border-box;\n  }\n}\n\n/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   Right Click Custom Context Menu (Clean, Sleek & Non-wrapping)\n   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.custom-context-menu {\n  position: fixed;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 6px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);\n  min-width: 220px;\n  max-width: 280px;\n  z-index: 100000;\n  padding: 4px 0;\n  white-space: nowrap;\n  animation: contextMenuPop 0.12s ease-out;\n  user-select: none;\n\n  .context-menu-item {\n    padding: 6px 14px;\n    font-size: 11.5px;\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    color: var(--text, #0f172a);\n    transition: background 0.12s ease;\n    white-space: nowrap;\n\n    i {\n      font-size: 12px;\n      color: var(--text-muted, #64748b);\n      width: 14px;\n      text-align: center;\n      flex-shrink: 0;\n    }\n\n    &:hover {\n      background: rgba(125, 125, 125, 0.1);\n      color: var(--text, #0f172a);\n\n      i {\n        color: var(--primary, #4f46e5);\n      }\n    }\n\n    &.text-danger {\n      color: #ef4444 !important;\n      &:hover {\n        background: rgba(239, 68, 68, 0.1) !important;\n      }\n    }\n\n    kbd {\n      font-size: 10px;\n      padding: 1px 4px;\n      background: rgba(125, 125, 125, 0.12);\n      border-radius: 3px;\n      font-family: inherit;\n      color: var(--text-muted, #64748b);\n    }\n  }\n\n  .context-menu-divider {\n    height: 1px;\n    background: var(--surface-border, #e2e8f0);\n    margin: 4px 0;\n  }\n}\n\n@keyframes contextMenuPop {\n  from {\n    opacity: 0;\n    transform: scale(0.96);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n\n/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   Smart Mode Foreign Key Autocomplete Dropdown Menu\n   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ref-dropdown-menu {\n  position: fixed;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 6px;\n  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.28), 0 8px 10px -6px rgba(0, 0, 0, 0.2);\n  max-height: 220px;\n  overflow-y: auto;\n  z-index: 100001;\n  font-size: 11.5px;\n  font-family: inherit;\n  animation: fadeInDropdown 0.12s ease-out;\n  box-sizing: border-box;\n\n  .ref-dropdown-header {\n    padding: 5px 9px;\n    font-size: 10px;\n    font-weight: 700;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    background: var(--header-bg, #f1f5f9);\n    color: var(--text-muted, #64748b);\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    position: sticky;\n    top: 0;\n    z-index: 2;\n  }\n\n  .ref-dropdown-item {\n    padding: 6px 10px;\n    cursor: pointer;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    color: var(--text, #0f172a);\n    border-bottom: 1px solid var(--cell-border, rgba(125, 125, 125, 0.1));\n    transition: background 0.12s ease;\n    line-height: 1.3;\n\n    &:last-child {\n      border-bottom: none;\n    }\n\n    &:hover,\n    &.highlighted {\n      background: var(--primary-soft, #e0e7ff) !important;\n      color: var(--primary, #4f46e5) !important;\n      font-weight: 600;\n    }\n\n    .ref-item-badge {\n      font-size: 9.5px;\n      font-weight: 600;\n      padding: 1px 6px;\n      border-radius: 3px;\n      background: rgba(100, 116, 139, 0.15);\n      color: var(--text-muted, #64748b);\n      margin-left: 8px;\n      flex-shrink: 0;\n    }\n  }\n\n  .ref-dropdown-empty {\n    padding: 10px;\n    color: var(--text-muted, #64748b);\n    font-style: italic;\n    text-align: center;\n  }\n}\n\n@keyframes fadeInDropdown {\n  from {\n    opacity: 0;\n    transform: translateY(-4px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   Inline Batch Mistake Prompt Modal\n   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.inline-solve-prompt {\n  position: fixed;\n  bottom: 70px;\n  right: 25px;\n  z-index: 2100;\n  width: 440px;\n  background: var(--surface, #ffffff);\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 8px;\n  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);\n  animation: promptSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);\n}\n@keyframes promptSlideUp {\n  from {\n    opacity: 0;\n    transform: translateY(16px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n   Column Header Filter Popover (Modern Enterprise UI)\n   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n::ng-deep .sutram-col-filter-popover {\n  width: 290px !important;\n  font-size: 12px;\n  border-radius: 8px !important;\n  overflow: hidden;\n  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08) !important;\n  border: 1px solid var(--surface-border, #e2e8f0) !important;\n  background: var(--surface, #ffffff) !important;\n  color: var(--text, #0f172a) !important;\n\n  .p-overlaypanel-content {\n    padding: 0 !important;\n    background: transparent !important;\n    color: inherit !important;\n  }\n}\n\n.filter-popover-content {\n  display: flex;\n  flex-direction: column;\n  background: var(--surface, #ffffff);\n  color: var(--text, #0f172a);\n  border-radius: 8px;\n  overflow: hidden;\n\n  .popover-header {\n    padding: 9px 12px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n    background: rgba(125, 125, 125, 0.05);\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n\n    .popover-title {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      font-weight: 700;\n      font-size: 12px;\n      color: var(--text, #0f172a);\n\n      .col-name {\n        max-width: 170px;\n      }\n      .badge-type {\n        font-size: 9px;\n        padding: 1px 5px;\n        border-radius: 3px;\n        background: rgba(59, 130, 246, 0.15);\n        color: #2563eb;\n        font-weight: 600;\n      }\n    }\n\n    .btn-popover-close {\n      background: transparent;\n      border: none;\n      width: 22px;\n      height: 22px;\n      border-radius: 4px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      cursor: pointer;\n      color: var(--text-muted, #64748b);\n      transition: all 0.15s ease;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.15);\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .popover-search-wrap {\n    position: relative;\n    padding: 8px 10px;\n    border-bottom: 1px solid var(--surface-border, #e2e8f0);\n\n    .search-icon {\n      position: absolute;\n      left: 18px;\n      top: 17px;\n      font-size: 11px;\n      color: var(--text-muted, #64748b);\n      pointer-events: none;\n    }\n    .popover-search-input {\n      width: 100%;\n      height: 28px;\n      padding: 4px 26px;\n      font-size: 11.5px;\n      border-radius: 5px;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      background: var(--bg, #f8fafc);\n      color: var(--text, #0f172a);\n      outline: none;\n      transition: border-color 0.15s, box-shadow 0.15s;\n\n      &:focus {\n        border-color: #3b82f6;\n        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);\n      }\n    }\n    .btn-clear-search-inline {\n      position: absolute;\n      right: 18px;\n      top: 15px;\n      background: transparent;\n      border: none;\n      color: var(--text-muted, #64748b);\n      cursor: pointer;\n      padding: 0;\n      font-size: 11px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n\n      &:hover {\n        color: var(--text, #0f172a);\n      }\n    }\n  }\n\n  .popover-action-strip {\n    padding: 6px 12px;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    background: rgba(125, 125, 125, 0.02);\n    border-bottom: 1px solid var(--cell-border, rgba(125, 125, 125, 0.1));\n    font-size: 11px;\n\n    .select-all-label {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      cursor: pointer;\n      font-weight: 600;\n      color: var(--text, #0f172a);\n      user-select: none;\n      margin: 0;\n    }\n\n    .quick-links {\n      display: flex;\n      align-items: center;\n      gap: 4px;\n\n      .btn-link-action {\n        background: transparent;\n        border: none;\n        color: #3b82f6;\n        cursor: pointer;\n        padding: 0 3px;\n        font-size: 11px;\n        font-weight: 600;\n        text-decoration: none;\n\n        &:hover {\n          text-decoration: underline;\n        }\n      }\n      .divider {\n        color: var(--text-muted, #64748b);\n        opacity: 0.5;\n      }\n    }\n\n    .count-pill {\n      font-size: 10px;\n      color: var(--text-muted, #64748b);\n      font-weight: 500;\n    }\n  }\n\n  .popover-checklist-items {\n    max-height: 180px;\n    overflow-y: auto;\n    padding: 3px 0;\n\n    &::-webkit-scrollbar {\n      width: 5px;\n    }\n    &::-webkit-scrollbar-thumb {\n      background: rgba(125, 125, 125, 0.3);\n      border-radius: 4px;\n    }\n\n    .checklist-item {\n      padding: 5px 12px;\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      gap: 8px;\n      cursor: pointer;\n      user-select: none;\n      transition: background-color 0.1s ease;\n      color: var(--text, #0f172a);\n\n      &:hover {\n        background: rgba(59, 130, 246, 0.08);\n      }\n\n      .item-left {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        flex-grow: 1;\n        min-width: 0;\n      }\n\n      .item-label {\n        font-size: 11.5px;\n        color: var(--text, #0f172a);\n      }\n\n      .item-right {\n        display: flex;\n        align-items: center;\n        gap: 4px;\n        flex-shrink: 0;\n      }\n\n      .item-code-chip {\n        font-size: 9.5px;\n        padding: 1px 5px;\n        border-radius: 3px;\n        background: rgba(125, 125, 125, 0.12);\n        color: var(--text-muted, #64748b);\n        font-weight: 500;\n      }\n\n      .item-count-badge {\n        font-size: 10px;\n        padding: 1px 6px;\n        border-radius: 999px;\n        background: rgba(125, 125, 125, 0.12);\n        color: var(--text-muted, #64748b);\n        font-weight: 500;\n      }\n    }\n\n    .empty-list-state {\n      padding: 16px;\n      text-align: center;\n      color: var(--text-muted, #64748b);\n      font-size: 11.5px;\n    }\n  }\n\n  .custom-check {\n    width: 14px;\n    height: 14px;\n    accent-color: #3b82f6;\n    cursor: pointer;\n    margin: 0;\n    flex-shrink: 0;\n  }\n\n  .popover-footer {\n    padding: 8px 12px;\n    border-top: 1px solid var(--surface-border, #e2e8f0);\n    background: rgba(125, 125, 125, 0.04);\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 8px;\n\n    .btn-filter-clear {\n      background: transparent;\n      border: 1px solid transparent;\n      color: #ef4444;\n      font-size: 11px;\n      font-weight: 600;\n      padding: 3px 8px;\n      border-radius: 4px;\n      cursor: pointer;\n      transition: all 0.15s ease;\n\n      &:hover {\n        background: rgba(239, 68, 68, 0.1);\n      }\n    }\n\n    .footer-actions-right {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n    }\n\n    .btn-filter-cancel {\n      background: transparent;\n      border: 1px solid var(--surface-border, #e2e8f0);\n      color: var(--text-muted, #64748b);\n      font-size: 11px;\n      font-weight: 600;\n      padding: 3px 10px;\n      border-radius: 4px;\n      cursor: pointer;\n      transition: all 0.15s ease;\n\n      &:hover {\n        background: rgba(125, 125, 125, 0.1);\n        color: var(--text, #0f172a);\n      }\n    }\n\n    .btn-filter-apply {\n      background: #3b82f6;\n      border: 1px solid #3b82f6;\n      color: #ffffff;\n      font-size: 11px;\n      font-weight: 600;\n      padding: 3px 12px;\n      border-radius: 4px;\n      cursor: pointer;\n      display: inline-flex;\n      align-items: center;\n      gap: 4px;\n      transition: all 0.15s ease;\n\n      &:hover {\n        background: #2563eb;\n      }\n    }\n  }\n}\n"] }]
    }], function () { return [{ type: i1.SutramExcelStateService }, { type: i2.SutramClipboardService }, { type: i3.SutramAuditService }, { type: i4.SutramRefCacheService }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }]; }, { headers: [{
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
        }], openConfig: [{
            type: Output
        }], onDocumentKeydown: [{
            type: HostListener,
            args: ['document:keydown', ['$event']]
        }], onDocumentClick: [{
            type: HostListener,
            args: ['document:click', ['$event']]
        }], onWindowChange: [{
            type: HostListener,
            args: ['window:scroll']
        }, {
            type: HostListener,
            args: ['window:resize']
        }] }); })();
