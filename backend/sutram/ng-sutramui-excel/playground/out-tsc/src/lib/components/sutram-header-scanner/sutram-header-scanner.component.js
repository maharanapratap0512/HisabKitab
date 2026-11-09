/**
 * sutram-header-scanner.component.ts
 * ─────────────────────────────────────────────────────────────
 * Smart Header Scanner Modal using PrimeNG p-dialog.
 * Matches sheet headers with schema columns and alerts on missing fields.
 * ─────────────────────────────────────────────────────────────
 */
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/forms";
import * as i3 from "primeng/api";
import * as i4 from "primeng/dropdown";
import * as i5 from "primeng/button";
import * as i6 from "primeng/dialog";
function SutramHeaderScannerComponent_ng_template_1_div_5_div_5_option_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 30);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const s_r11 = ctx.$implicit;
    i0.ɵɵproperty("value", s_r11);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(s_r11);
} }
function SutramHeaderScannerComponent_ng_template_1_div_5_div_5_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 26)(1, "small", 27);
    i0.ɵɵtext(2, "\u0936\u0940\u091F:");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 28);
    i0.ɵɵlistener("change", function SutramHeaderScannerComponent_ng_template_1_div_5_div_5_Template_select_change_3_listener($event) { i0.ɵɵrestoreView(_r13); const ctx_r12 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r12.onSheetSelect($event.target.value)); });
    i0.ɵɵtemplate(4, SutramHeaderScannerComponent_ng_template_1_div_5_div_5_option_4_Template, 2, 2, "option", 29);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r9.currentSheetName);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngForOf", ctx_r9.sheetNames);
} }
function SutramHeaderScannerComponent_ng_template_1_div_5_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "span", 21);
    i0.ɵɵelement(2, "i", 22);
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(5, SutramHeaderScannerComponent_ng_template_1_div_5_div_5_Template, 5, 2, "div", 23);
    i0.ɵɵelementStart(6, "button", 24);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_template_1_div_5_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r15); const ctx_r14 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r14.triggerFileInput.emit()); });
    i0.ɵɵelement(7, "i", 25);
    i0.ɵɵtext(8, "\u092B\u093C\u093E\u0907\u0932 \u092C\u0926\u0932\u0947\u0902 ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r7 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r7.fileName);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r7.sheetNames.length > 1);
} }
function SutramHeaderScannerComponent_ng_template_1_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div")(1, "button", 31);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_template_1_div_6_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r17); const ctx_r16 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r16.triggerFileInput.emit()); });
    i0.ɵɵelement(2, "i", 32);
    i0.ɵɵtext(3, "\u092B\u093C\u093E\u0907\u0932 \u091A\u0941\u0928\u0947\u0902 ");
    i0.ɵɵelementEnd()();
} }
function SutramHeaderScannerComponent_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16)(1, "div", 5);
    i0.ɵɵelement(2, "i", 17);
    i0.ɵɵelementStart(3, "span", 18);
    i0.ɵɵtext(4, "\u092B\u093C\u093E\u0907\u0932 \u0914\u0930 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0936\u0940\u091F\u094D\u0938 (Open File & Saved Sheets)");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(5, SutramHeaderScannerComponent_ng_template_1_div_5_Template, 9, 2, "div", 19);
    i0.ɵɵtemplate(6, SutramHeaderScannerComponent_ng_template_1_div_6_Template, 4, 0, "div", 20);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngIf", ctx_r0.fileName);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !ctx_r0.fileName);
} }
function SutramHeaderScannerComponent_div_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 33);
    i0.ɵɵelement(1, "i", 34);
    i0.ɵɵelementStart(2, "small");
    i0.ɵɵtext(3, "\u0915\u094B\u0908 \u0938\u0939\u0947\u091C\u0940 \u0917\u0908 \u0936\u0940\u091F \u0928\u0939\u0940\u0902 \u0939\u0948");
    i0.ɵɵelementEnd()();
} }
function SutramHeaderScannerComponent_div_13_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 35);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_div_13_Template_div_click_0_listener() { const restoredCtx = i0.ɵɵrestoreView(_r20); const s_r18 = restoredCtx.$implicit; const ctx_r19 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r19.onSelectSavedSheet(s_r18.sheetId)); });
    i0.ɵɵelementStart(1, "div", 36);
    i0.ɵɵelement(2, "i", 37);
    i0.ɵɵelementStart(3, "div", 38)(4, "div", 39);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "small", 40);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "button", 41);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_div_13_Template_button_click_8_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r20); const s_r18 = restoredCtx.$implicit; const ctx_r21 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r21.onDeleteSavedSheetClick(s_r18.sheetId, $event)); });
    i0.ɵɵelement(9, "i", 42);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const s_r18 = ctx.$implicit;
    i0.ɵɵproperty("title", "\u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0915\u0947 \u0916\u094B\u0932\u0947\u0902: " + s_r18.title);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(s_r18.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", s_r18.rowCount, " \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u093E\u0901", s_r18.savedAt ? " \u2022 " + s_r18.savedAt : "", " ");
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_div_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 73);
    i0.ɵɵelement(1, "i", 74);
    i0.ɵɵelementStart(2, "div", 75);
    i0.ɵɵtext(3, "\u0924\u093E\u0932\u093F\u0915\u093E \u0938\u094D\u0915\u0940\u092E\u093E \u0914\u0930 \u0938\u0902\u0926\u0930\u094D\u092D \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...");
    i0.ɵɵelementEnd()();
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_div_6_div_1_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 90);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const m_r29 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", m_r29.name, " ");
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_div_6_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 85)(1, "div", 86);
    i0.ɵɵelement(2, "i", 87);
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "\u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0915\u0949\u0932\u092E\u094D\u0938 \u091B\u0942\u091F \u0917\u090F \u0939\u0948\u0902 (Missing Mandatory Fields):");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 88);
    i0.ɵɵtemplate(6, SutramHeaderScannerComponent_ng_container_15_div_37_div_6_div_1_span_6_Template, 2, 1, "span", 89);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r26 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngForOf", ctx_r26.report.missingRequired);
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_span_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 99);
    i0.ɵɵtext(1, " \u2713 Exact ");
    i0.ɵɵelementEnd();
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 100);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const m_r30 = i0.ɵɵnextContext().$implicit;
    const ctx_r32 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" \u2248 ", ctx_r32.Math.round((m_r30.confidence || 0) * 100), "% ");
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_span_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 101);
    i0.ɵɵtext(1, " - \u091B\u0942\u091F\u093E ");
    i0.ɵɵelementEnd();
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_span_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 102);
    i0.ɵɵtext(1, " \u270E \u091A\u0941\u0928\u093E ");
    i0.ɵɵelementEnd();
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_Template(rf, ctx) { if (rf & 1) {
    const _r37 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td", 91)(2, "code");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "td", 92);
    i0.ɵɵtemplate(5, SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_span_5_Template, 2, 0, "span", 93);
    i0.ɵɵtemplate(6, SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_span_6_Template, 2, 1, "span", 94);
    i0.ɵɵtemplate(7, SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_span_7_Template, 2, 0, "span", 95);
    i0.ɵɵtemplate(8, SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_span_8_Template, 2, 0, "span", 96);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "td", 97)(10, "p-dropdown", 98);
    i0.ɵɵlistener("onChange", function SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_Template_p_dropdown_onChange_10_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r37); const m_r30 = restoredCtx.$implicit; const ctx_r36 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r36.onTargetColumnChange(m_r30, $event.value)); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const m_r30 = ctx.$implicit;
    const ctx_r27 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(m_r30.sheetHeader);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", m_r30.status === "exact");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", m_r30.status === "fuzzy");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", m_r30.status === "unmatched");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", m_r30.status === "manual");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("options", ctx_r27.columnSelectOptions)("ngModel", m_r30.targetColKey)("showClear", true)("filter", true);
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r39 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, SutramHeaderScannerComponent_ng_container_15_div_37_div_6_div_1_Template, 7, 1, "div", 76);
    i0.ɵɵelementStart(2, "div", 77)(3, "table", 78)(4, "thead")(5, "tr")(6, "th", 79);
    i0.ɵɵtext(7, "\u090F\u0915\u094D\u0938\u0947\u0932 \u0915\u0949\u0932\u092E (Excel Header)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th", 80);
    i0.ɵɵtext(9, "\u092E\u0948\u091A \u0938\u094D\u0925\u093F\u0924\u093F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th", 81);
    i0.ɵɵtext(11, "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0915\u0949\u0932\u092E (Target Field)");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "tbody");
    i0.ɵɵtemplate(13, SutramHeaderScannerComponent_ng_container_15_div_37_div_6_tr_13_Template, 11, 9, "tr", 82);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(14, "div", 83)(15, "button", 84);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_container_15_div_37_div_6_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r39); const ctx_r38 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r38.confirmMappedToTable()); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r24 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r24.report.missingRequired.length > 0);
    i0.ɵɵadvance(12);
    i0.ɵɵproperty("ngForOf", ctx_r24.report.matches);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r24.selectedTable || ctx_r24.isTableConfigLoading);
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_div_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 103);
    i0.ɵɵtext(1, " \u0915\u0943\u092A\u092F\u093E \u090A\u092A\u0930 \u0926\u093F\u090F \u0917\u090F \u0938\u0930\u094D\u091A \u0921\u094D\u0930\u0949\u092A\u0921\u093E\u0909\u0928 \u0938\u0947 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u091A\u0941\u0928\u0947\u0902\u0964 ");
    i0.ɵɵelementEnd();
} }
function SutramHeaderScannerComponent_ng_container_15_div_37_Template(rf, ctx) { if (rf & 1) {
    const _r41 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 67)(1, "div", 68)(2, "label", 69);
    i0.ɵɵtext(3, " \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u091A\u0941\u0928\u0947\u0902 (Select Target Table): ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p-dropdown", 70);
    i0.ɵɵlistener("ngModelChange", function SutramHeaderScannerComponent_ng_container_15_div_37_Template_p_dropdown_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r40 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r40.selectedTable = $event); })("onChange", function SutramHeaderScannerComponent_ng_container_15_div_37_Template_p_dropdown_onChange_4_listener($event) { i0.ɵɵrestoreView(_r41); const ctx_r42 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r42.onTableChange($event.value)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(5, SutramHeaderScannerComponent_ng_container_15_div_37_div_5_Template, 4, 0, "div", 71);
    i0.ɵɵtemplate(6, SutramHeaderScannerComponent_ng_container_15_div_37_div_6_Template, 16, 3, "div", 20);
    i0.ɵɵtemplate(7, SutramHeaderScannerComponent_ng_container_15_div_37_div_7_Template, 2, 0, "div", 72);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r22 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("options", ctx_r22.tableSelectOptions)("ngModel", ctx_r22.selectedTable)("filter", true);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r22.isTableConfigLoading);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !ctx_r22.isTableConfigLoading && ctx_r22.report && ctx_r22.selectedTable);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !ctx_r22.isTableConfigLoading && !ctx_r22.report && !ctx_r22.selectedTable);
} }
function SutramHeaderScannerComponent_ng_container_15_Template(rf, ctx) { if (rf & 1) {
    const _r44 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 43)(2, "div", 44);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_container_15_Template_div_click_2_listener() { i0.ɵɵrestoreView(_r44); const ctx_r43 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r43.confirmDirectNormal()); });
    i0.ɵɵelementStart(3, "div", 45);
    i0.ɵɵelement(4, "i", 46);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 47)(6, "div", 48)(7, "h6", 49);
    i0.ɵɵtext(8, "\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0936\u0940\u091F (Normal Sheet)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 50);
    i0.ɵɵtext(10, "Direct Load");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "p", 51);
    i0.ɵɵtext(12, "\u092C\u093F\u0928\u093E \u0915\u093F\u0938\u0940 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0948\u092A\u093F\u0902\u0917 \u0915\u0947 \u090F\u0915\u094D\u0938\u0947\u0932 \u092B\u093C\u093E\u0907\u0932 \u0915\u094B \u092C\u093F\u0932\u094D\u0915\u0941\u0932 \u091C\u0948\u0938\u093E \u0939\u0948 (As-Is) \u0924\u0941\u0930\u0902\u0924 \u0928\u0908 \u0936\u0940\u091F \u092E\u0947\u0902 \u0916\u094B\u0932\u0947\u0902\u0964");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div", 52);
    i0.ɵɵelement(14, "i", 53);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "div", 54);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_container_15_Template_div_click_15_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementStart(16, "label", 55);
    i0.ɵɵtext(17, "\u0936\u0940\u091F \u0915\u093E \u0928\u093E\u092E (Sheet Name):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "input", 56);
    i0.ɵɵlistener("ngModelChange", function SutramHeaderScannerComponent_ng_container_15_Template_input_ngModelChange_18_listener($event) { i0.ɵɵrestoreView(_r44); const ctx_r46 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r46.normalSheetCustomName = $event); })("keyup.enter", function SutramHeaderScannerComponent_ng_container_15_Template_input_keyup_enter_18_listener() { i0.ɵɵrestoreView(_r44); const ctx_r47 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r47.confirmDirectNormal()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "button", 57);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_container_15_Template_button_click_19_listener() { i0.ɵɵrestoreView(_r44); const ctx_r48 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r48.confirmDirectNormal()); });
    i0.ɵɵelement(20, "i", 58);
    i0.ɵɵtext(21, "\u0936\u0940\u091F \u0916\u094B\u0932\u0947\u0902 ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(22, "div", 59)(23, "div", 60);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_container_15_Template_div_click_23_listener() { i0.ɵɵrestoreView(_r44); const ctx_r49 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r49.toggleMatcherWizard()); });
    i0.ɵɵelementStart(24, "div", 61)(25, "div", 62);
    i0.ɵɵelement(26, "i", 63);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "div", 47)(28, "div", 48)(29, "h6", 49);
    i0.ɵɵtext(30, "\u092B\u0949\u0930\u094D\u092E\u0947\u091F \u092E\u0948\u091A\u0930 (Format Matcher)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "span", 64);
    i0.ɵɵtext(32, "Schema & Sync");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(33, "p", 51);
    i0.ɵɵtext(34, "\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u091A\u0941\u0928\u0947\u0902, \u0915\u0949\u0932\u092E\u094D\u0938 \u0911\u091F\u094B-\u092E\u0948\u091A \u0915\u0930\u0947\u0902 \u0914\u0930 \u0921\u0947\u091F\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0915\u0947 \u0938\u093E\u0925 \u0932\u094B\u0921 \u0915\u0930\u0947\u0902\u0964");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(35, "div", 52);
    i0.ɵɵelement(36, "i", 65);
    i0.ɵɵelementEnd()()();
    i0.ɵɵtemplate(37, SutramHeaderScannerComponent_ng_container_15_div_37_Template, 8, 6, "div", 66);
    i0.ɵɵelementEnd();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(18);
    i0.ɵɵproperty("ngModel", ctx_r3.normalSheetCustomName)("placeholder", ctx_r3.sheetNames.length > 0 ? ctx_r3.currentSheetName || ctx_r3.sheetNames[0] : "Sheet 1");
    i0.ɵɵadvance(4);
    i0.ɵɵclassProp("is-expanded", ctx_r3.showMatcherWizard);
    i0.ɵɵadvance(14);
    i0.ɵɵproperty("ngClass", ctx_r3.showMatcherWizard ? "pi-chevron-up text-primary" : "pi-chevron-down text-muted");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r3.showMatcherWizard);
} }
function SutramHeaderScannerComponent_ng_template_16_Template(rf, ctx) { if (rf & 1) {
    const _r51 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 104)(1, "div", 105);
    i0.ɵɵelement(2, "i", 106);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h6", 107);
    i0.ɵɵtext(4, "\u090F\u0915\u094D\u0938\u0947\u0932 \u092B\u093C\u093E\u0907\u0932 \u0906\u092F\u093E\u0924 \u0915\u0930\u0947\u0902 (Import Excel)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 108);
    i0.ɵɵtext(6, " \u0915\u0902\u092A\u094D\u092F\u0942\u091F\u0930 \u0938\u0947 \u0915\u094B\u0908 \u092D\u0940 .xlsx, .xls \u092F\u093E .csv \u092B\u093C\u093E\u0907\u0932 \u091A\u0941\u0928\u0947\u0902 \u0914\u0930 \u0909\u0938\u0947 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0936\u0940\u091F \u092F\u093E \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u0938\u0947 \u0911\u091F\u094B-\u092E\u0948\u091A \u0915\u0930\u0915\u0947 \u0916\u094B\u0932\u0947\u0902\u0964 ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 109);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_template_16_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r51); const ctx_r50 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r50.triggerFileInput.emit()); });
    i0.ɵɵelement(8, "i", 110);
    i0.ɵɵtext(9, "\u0915\u0902\u092A\u094D\u092F\u0942\u091F\u0930 \u0938\u0947 \u092B\u093C\u093E\u0907\u0932 \u091A\u0941\u0928\u0947\u0902 (Browse File) ");
    i0.ɵɵelementEnd()();
} }
function SutramHeaderScannerComponent_ng_template_18_Template(rf, ctx) { if (rf & 1) {
    const _r53 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 111)(1, "button", 112);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_template_18_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r53); const ctx_r52 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r52.close()); });
    i0.ɵɵelementEnd()();
} }
const _c0 = function () { return { width: "840px", maxWidth: "96vw" }; };
export class SutramHeaderScannerComponent {
    Math = Math;
    visible = false;
    fileName = '';
    sheetNames = [];
    currentSheetName = '';
    sheetHeaders = [];
    sampleRows = [];
    totalRows = 0;
    tablesList = [];
    selectedTable = '';
    report = null;
    availableHeaders = [];
    isTableConfigLoading = false;
    savedSheets = [];
    visibleChange = new EventEmitter();
    sheetChange = new EventEmitter();
    targetTableChange = new EventEmitter();
    openDirectNormal = new EventEmitter();
    openMappedToTable = new EventEmitter();
    openSavedSheet = new EventEmitter();
    deleteSavedSheet = new EventEmitter();
    triggerFileInput = new EventEmitter();
    cancelled = new EventEmitter();
    showMatcherWizard = false;
    normalSheetCustomName = '';
    onSelectSavedSheet(sheetId) {
        this.openSavedSheet.emit(sheetId);
    }
    onDeleteSavedSheetClick(sheetId, event) {
        event.stopPropagation();
        event.preventDefault();
        this.deleteSavedSheet.emit(sheetId);
    }
    get tableSelectOptions() {
        return (this.tablesList || []).map(t => ({
            label: t.display_name ? `${t.display_name} (${t.table})` : t.table,
            value: t.table
        }));
    }
    get columnSelectOptions() {
        return (this.availableHeaders || []).map(h => ({
            label: `${h.name}${h.not_null ? ' *' : ''}`,
            value: h.name
        }));
    }
    toggleMatcherWizard() {
        this.showMatcherWizard = !this.showMatcherWizard;
        if (this.showMatcherWizard) {
            const target = this.selectedTable || (this.tablesList.length > 0 ? this.tablesList[0].table : '');
            if (target) {
                this.selectedTable = target;
                this.targetTableChange.emit(target);
            }
        }
    }
    onSheetSelect(sheet) {
        if (sheet && sheet !== this.currentSheetName) {
            this.currentSheetName = sheet;
            this.normalSheetCustomName = sheet;
            this.sheetChange.emit(sheet);
        }
    }
    onTableChange(table) {
        this.selectedTable = table;
        this.targetTableChange.emit(table);
    }
    onTargetColumnChange(match, selectedKey) {
        if (!selectedKey) {
            match.targetColKey = null;
            match.targetHeader = undefined;
            match.status = 'unmatched';
            return;
        }
        const found = this.availableHeaders.find(h => h.name === selectedKey);
        if (found) {
            match.targetColKey = found.name;
            match.targetHeader = found;
            match.status = 'manual';
        }
    }
    get matchedCount() {
        return (this.report?.matches || []).filter(m => m.targetColKey).length;
    }
    confirmDirectNormal() {
        const finalName = (this.normalSheetCustomName || this.currentSheetName || this.fileName?.replace(/\.[^/.]+$/, '') || 'Sheet').trim();
        this.openDirectNormal.emit({
            sheetName: finalName,
            headers: this.sheetHeaders
        });
        this.close();
    }
    confirmMappedToTable() {
        if (!this.selectedTable || !this.report)
            return;
        this.openMappedToTable.emit({
            targetTable: this.selectedTable,
            matches: this.report.matches
        });
        this.close();
    }
    close() {
        this.visible = false;
        this.showMatcherWizard = false;
        this.normalSheetCustomName = '';
        this.visibleChange.emit(false);
        this.cancelled.emit();
    }
    static ɵfac = function SutramHeaderScannerComponent_Factory(t) { return new (t || SutramHeaderScannerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SutramHeaderScannerComponent, selectors: [["sutram-header-scanner"]], inputs: { visible: "visible", fileName: "fileName", sheetNames: "sheetNames", currentSheetName: "currentSheetName", sheetHeaders: "sheetHeaders", sampleRows: "sampleRows", totalRows: "totalRows", tablesList: "tablesList", selectedTable: "selectedTable", report: "report", availableHeaders: "availableHeaders", isTableConfigLoading: "isTableConfigLoading", savedSheets: "savedSheets" }, outputs: { visibleChange: "visibleChange", sheetChange: "sheetChange", targetTableChange: "targetTableChange", openDirectNormal: "openDirectNormal", openMappedToTable: "openMappedToTable", openSavedSheet: "openSavedSheet", deleteSavedSheet: "deleteSavedSheet", triggerFileInput: "triggerFileInput", cancelled: "cancelled" }, decls: 19, vars: 11, consts: [[3, "visible", "modal", "closable", "visibleChange", "onHide"], ["pTemplate", "header"], [1, "sutram-open-modal-container", "d-flex", "gap-3", "my-2", 2, "min-height", "380px"], [1, "saved-sheets-sidebar", "d-flex", "flex-column", "pe-3"], [1, "d-flex", "align-items-center", "justify-content-between", "mb-2", "pb-1", "border-bottom"], [1, "d-flex", "align-items-center", "gap-2"], [1, "pi", "pi-save", "text-primary", 2, "font-size", "13px"], [1, "fw-bold", "small"], [1, "badge", "bg-primary-soft", "text-primary", "rounded-pill", 2, "font-size", "10px"], [1, "saved-sheets-list", "flex-grow-1", "overflow-auto", 2, "max-height", "380px"], ["class", "text-center py-4 text-muted", 4, "ngIf"], ["class", "saved-sheet-item d-flex align-items-center justify-content-between p-2 mb-1 rounded cursor-pointer", 3, "title", "click", 4, "ngFor", "ngForOf"], [1, "open-file-main-pane", "flex-grow-1", "ps-1", "overflow-auto", 2, "max-height", "440px"], [4, "ngIf", "ngIfElse"], ["noFileSelectedTpl", ""], ["pTemplate", "footer"], [1, "d-flex", "align-items-center", "justify-content-between", "w-100", "pe-3", "flex-wrap", "gap-2"], [1, "pi", "pi-folder-open", "text-primary", "fs-5"], [1, "fw-bold", "fs-6"], ["class", "d-flex align-items-center gap-2", 4, "ngIf"], [4, "ngIf"], ["title", "\u092B\u093C\u093E\u0907\u0932 \u0915\u093E \u0928\u093E\u092E", 1, "badge", "bg-secondary-soft", "text-main", "border"], [1, "pi", "pi-file-excel", "text-success", "me-1"], ["class", "d-flex align-items-center gap-1", 4, "ngIf"], ["type", "button", "title", "\u0905\u0928\u094D\u092F \u090F\u0915\u094D\u0938\u0947\u0932 \u092B\u093C\u093E\u0907\u0932 \u091A\u0941\u0928\u0947\u0902", 1, "btn", "btn-outline-secondary", "btn-sm", "py-0", "px-2", 2, "height", "24px", "font-size", "11px", 3, "click"], [1, "pi", "pi-sync", "me-1"], [1, "d-flex", "align-items-center", "gap-1"], [1, "text-muted"], [1, "form-select", "form-select-sm", "py-0", "px-2", 2, "height", "26px", "font-size", "11px", 3, "value", "change"], [3, "value", 4, "ngFor", "ngForOf"], [3, "value"], ["type", "button", 1, "btn", "btn-primary", "btn-sm", "py-0", "px-2", 2, "height", "26px", "font-size", "11px", 3, "click"], [1, "pi", "pi-upload", "me-1"], [1, "text-center", "py-4", "text-muted"], [1, "pi", "pi-inbox", "fs-3", "mb-2", "d-block", "opacity-50"], [1, "saved-sheet-item", "d-flex", "align-items-center", "justify-content-between", "p-2", "mb-1", "rounded", "cursor-pointer", 3, "title", "click"], [1, "d-flex", "align-items-center", "gap-2", "overflow-hidden", "me-1"], [1, "pi", "pi-file-excel", "text-success", 2, "font-size", "15px", "flex-shrink", "0"], [1, "text-truncate"], [1, "fw-semibold", "small", "text-truncate", 2, "line-height", "1.2"], [1, "text-muted", 2, "font-size", "10px"], ["type", "button", "title", "\u0907\u0938 \u0938\u0939\u0947\u091C\u0940 \u0917\u0908 \u0936\u0940\u091F \u0915\u094B \u0939\u091F\u093E\u090F\u0902 (Delete)", 1, "btn", "btn-link", "text-danger", "p-0", "delete-saved-sheet-btn", 3, "click"], [1, "pi", "pi-trash", 2, "font-size", "12px"], [1, "open-mode-box", "normal-mode-box", "mb-3"], ["title", "\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0936\u0940\u091F \u092E\u0947\u0902 \u0938\u0940\u0927\u0947 \u0916\u094B\u0932\u0947\u0902", 1, "d-flex", "align-items-center", "gap-3", "cursor-pointer", 3, "click"], [1, "mode-icon-circle", "bg-success-soft"], [1, "pi", "pi-file-excel", "text-success", "fs-3"], [1, "flex-grow-1"], [1, "d-flex", "align-items-center", "gap-2", "mb-1"], [1, "mb-0", "fw-bold"], [1, "badge", "bg-success-soft", "text-success"], [1, "mode-desc", "mb-0"], [1, "mode-arrow-btn"], [1, "pi", "pi-arrow-right", "text-success", "fs-5"], [1, "mt-2", "pt-2", "border-top", "d-flex", "align-items-center", "gap-2", "flex-wrap", 3, "click"], [1, "form-label", "small", "mb-0", "text-muted", "text-nowrap"], ["type", "text", 1, "form-control", "form-control-sm", 2, "max-width", "240px", "height", "28px", "font-size", "12px", 3, "ngModel", "placeholder", "ngModelChange", "keyup.enter"], ["type", "button", 1, "btn", "btn-sm", "btn-success", "py-0", "px-3", 2, "height", "28px", "font-size", "12px", 3, "click"], [1, "pi", "pi-check", "me-1"], [1, "open-mode-box", "matcher-mode-box"], ["title", "\u092B\u0949\u0930\u094D\u092E\u0947\u091F \u092E\u0948\u091A\u0930 \u0935\u093F\u091C\u093C\u093E\u0930\u094D\u0921 \u0916\u094B\u0932\u0947\u0902", 1, "mode-box-trigger", "cursor-pointer", 3, "click"], [1, "d-flex", "align-items-center", "gap-3"], [1, "mode-icon-circle", "bg-primary-soft"], [1, "pi", "pi-database", "text-primary", "fs-3"], [1, "badge", "bg-primary-soft", "text-primary"], [1, "pi", 2, "font-size", "1.1rem", 3, "ngClass"], ["class", "matcher-wizard-container mt-3 pt-3", 4, "ngIf"], [1, "matcher-wizard-container", "mt-3", "pt-3"], [1, "mb-3"], [1, "form-label", "fw-bold", "small", "mb-1"], ["filterBy", "label,value", "filterPlaceholder", "\u0924\u093E\u0932\u093F\u0915\u093E \u0915\u093E \u0928\u093E\u092E \u0916\u094B\u091C\u0947\u0902...", "placeholder", "\u0924\u093E\u0932\u093F\u0915\u093E \u091A\u0941\u0928\u0947\u0902...", "styleClass", "w-100", 3, "options", "ngModel", "filter", "ngModelChange", "onChange"], ["class", "text-center py-4", 4, "ngIf"], ["class", "text-center py-3 text-muted small", 4, "ngIf"], [1, "text-center", "py-4"], [1, "pi", "pi-spin", "pi-spinner", "text-primary", "fs-2"], [1, "text-muted", "small", "mt-2"], ["class", "alert-mandatory p-2 mb-3", 4, "ngIf"], [1, "matches-table-scroll", "mb-3"], [1, "table", "table-sm", "table-hover", "mb-0", "matches-table"], [2, "width", "35%"], [2, "width", "15%", "text-align", "center"], [2, "width", "50%"], [4, "ngFor", "ngForOf"], [1, "mt-3"], ["pButton", "", "label", "\u0924\u093E\u0932\u093F\u0915\u093E \u092E\u0947\u0902 \u0932\u094B\u0921 \u0915\u0930\u0947\u0902 (Open & Map to Table)", "icon", "pi pi-check", 1, "p-button-primary", "w-100", "py-2", "fw-semibold", 3, "disabled", "click"], [1, "alert-mandatory", "p-2", "mb-3"], [1, "d-flex", "align-items-center", "gap-2", "text-danger", "fw-semibold", "small", "mb-1"], [1, "pi", "pi-exclamation-triangle"], [1, "d-flex", "flex-wrap", "gap-1", "ps-4"], ["class", "badge bg-danger", 4, "ngFor", "ngForOf"], [1, "badge", "bg-danger"], [1, "align-middle", "fw-medium"], [1, "align-middle", "text-center"], ["class", "badge bg-success", "title", "Exact match", 4, "ngIf"], ["class", "badge bg-info text-dark", "title", "Fuzzy / Alias match", 4, "ngIf"], ["class", "badge bg-secondary", "title", "No match found", 4, "ngIf"], ["class", "badge bg-primary", "title", "Manually mapped", 4, "ngIf"], [1, "align-middle"], ["filterPlaceholder", "\u092B\u093C\u0940\u0932\u094D\u0921 \u0916\u094B\u091C\u0947\u0902...", "placeholder", "(\u091B\u094B\u0921\u093C \u0926\u0947\u0902 / Skip)", "styleClass", "w-100 p-dropdown-sm", 3, "options", "ngModel", "showClear", "filter", "onChange"], ["title", "Exact match", 1, "badge", "bg-success"], ["title", "Fuzzy / Alias match", 1, "badge", "bg-info", "text-dark"], ["title", "No match found", 1, "badge", "bg-secondary"], ["title", "Manually mapped", 1, "badge", "bg-primary"], [1, "text-center", "py-3", "text-muted", "small"], [1, "text-center", "py-5", "px-3", "d-flex", "flex-column", "align-items-center", "justify-content-center", "h-100"], [1, "mode-icon-circle", "bg-success-soft", "mb-3", 2, "width", "56px", "height", "56px", "display", "flex", "align-items", "center", "justify-content", "center", "border-radius", "50%"], [1, "pi", "pi-file-excel", "text-success", "fs-2"], [1, "fw-bold", "mb-1"], [1, "text-muted", "small", "mb-3", 2, "max-width", "320px"], ["type", "button", 1, "btn", "btn-primary", "btn-sm", "px-3", "py-2", "fw-semibold", 3, "click"], [1, "pi", "pi-folder-open", "me-2"], [1, "d-flex", "justify-content-end"], ["pButton", "", "label", "\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902 (Cancel)", "icon", "pi pi-times", 1, "p-button-text", "p-button-secondary", 3, "click"]], template: function SutramHeaderScannerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "p-dialog", 0);
            i0.ɵɵlistener("visibleChange", function SutramHeaderScannerComponent_Template_p_dialog_visibleChange_0_listener($event) { return ctx.visible = $event; })("onHide", function SutramHeaderScannerComponent_Template_p_dialog_onHide_0_listener() { return ctx.close(); });
            i0.ɵɵtemplate(1, SutramHeaderScannerComponent_ng_template_1_Template, 7, 2, "ng-template", 1);
            i0.ɵɵelementStart(2, "div", 2)(3, "div", 3)(4, "div", 4)(5, "div", 5);
            i0.ɵɵelement(6, "i", 6);
            i0.ɵɵelementStart(7, "span", 7);
            i0.ɵɵtext(8, "\u0938\u0939\u0947\u091C\u0940 \u0917\u0908 \u0936\u0940\u091F\u094D\u0938");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "span", 8);
            i0.ɵɵtext(10);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "div", 9);
            i0.ɵɵtemplate(12, SutramHeaderScannerComponent_div_12_Template, 4, 0, "div", 10);
            i0.ɵɵtemplate(13, SutramHeaderScannerComponent_div_13_Template, 10, 4, "div", 11);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(14, "div", 12);
            i0.ɵɵtemplate(15, SutramHeaderScannerComponent_ng_container_15_Template, 38, 6, "ng-container", 13);
            i0.ɵɵtemplate(16, SutramHeaderScannerComponent_ng_template_16_Template, 10, 0, "ng-template", null, 14, i0.ɵɵtemplateRefExtractor);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(18, SutramHeaderScannerComponent_ng_template_18_Template, 2, 0, "ng-template", 15);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            const _r4 = i0.ɵɵreference(17);
            i0.ɵɵstyleMap(i0.ɵɵpureFunction0(10, _c0));
            i0.ɵɵproperty("visible", ctx.visible)("modal", true)("closable", true);
            i0.ɵɵadvance(10);
            i0.ɵɵtextInterpolate1(" ", ctx.savedSheets.length, " ");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.savedSheets.length === 0);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngForOf", ctx.savedSheets);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.fileName)("ngIfElse", _r4);
        } }, dependencies: [i1.NgClass, i1.NgForOf, i1.NgIf, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgModel, i3.PrimeTemplate, i4.Dropdown, i5.ButtonDirective, i6.Dialog], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.sutram-open-modal-body[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n}\n\n.open-mode-box[_ngcontent-%COMP%] {\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 8px;\n  background: var(--surface, #ffffff);\n  padding: 14px 16px;\n  transition: all 0.2s ease;\n\n  &.normal-mode-box {\n    border-left: 4px solid #10b981;\n\n    &:hover {\n      border-color: #10b981;\n      background: var(--bg, #f8fafc);\n      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.12);\n      transform: translateY(-1px);\n\n      .mode-arrow-btn {\n        transform: translateX(4px);\n      }\n    }\n  }\n\n  &.matcher-mode-box {\n    border-left: 4px solid #4f46e5;\n\n    &.is-expanded {\n      border-color: #4f46e5;\n      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);\n    }\n\n    &:not(.is-expanded):hover {\n      border-color: #4f46e5;\n      background: var(--bg, #f8fafc);\n      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.12);\n      transform: translateY(-1px);\n\n      .mode-arrow-btn {\n        transform: translateX(4px);\n      }\n    }\n  }\n}\n\n.mode-box-trigger[_ngcontent-%COMP%] {\n  user-select: none;\n}\n\n.mode-icon-circle[_ngcontent-%COMP%] {\n  width: 44px;\n  height: 44px;\n  border-radius: 8px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.mode-arrow-btn[_ngcontent-%COMP%] {\n  transition: transform 0.2s ease;\n  padding: 4px;\n}\n\n.mode-desc[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-muted, #64748b);\n  line-height: 1.4;\n}\n\n.matcher-wizard-container[_ngcontent-%COMP%] {\n  border-top: 1px dashed var(--surface-border, #e2e8f0);\n}\n\n.matches-table-scroll[_ngcontent-%COMP%] {\n  max-height: 230px;\n  overflow-y: auto;\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 6px;\n}\n\n.matches-table[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text, inherit);\n\n  thead th {\n    background: var(--header-bg, #f1f5f9);\n    color: var(--header-text, #1e293b);\n    position: sticky;\n    top: 0;\n    z-index: 2;\n    padding: 6px 8px;\n  }\n\n  tbody td {\n    padding: 4px 8px;\n  }\n}\n\n[_nghost-%COMP%]     {\n  .p-dropdown {\n    background: var(--surface, #ffffff);\n    border-color: var(--surface-border, #cbd5e1);\n    color: var(--text, inherit);\n\n    .p-dropdown-label {\n      font-size: 12px;\n      padding: 5px 8px;\n      color: var(--text, inherit);\n    }\n\n    &.p-dropdown-sm {\n      .p-dropdown-label {\n        font-size: 11px;\n        padding: 3px 6px;\n      }\n    }\n  }\n\n  .p-dropdown-panel {\n    background: var(--surface, #ffffff);\n    border-color: var(--surface-border, #cbd5e1);\n    color: var(--text, inherit);\n\n    .p-dropdown-items {\n      padding: 4px 0;\n\n      .p-dropdown-item {\n        font-size: 12px;\n        padding: 6px 10px;\n        color: var(--text, inherit);\n\n        &:hover, &.p-highlight {\n          background: var(--primary-soft, #e0e7ff);\n          color: var(--primary, #4f46e5);\n        }\n      }\n    }\n\n    .p-dropdown-filter-container {\n      padding: 6px;\n\n      .p-dropdown-filter {\n        font-size: 12px;\n        padding: 4px 8px;\n        background: var(--bg, #f8fafc);\n        border-color: var(--surface-border, #cbd5e1);\n        color: var(--text, inherit);\n      }\n    }\n  }\n}\n\n.alert-mandatory[_ngcontent-%COMP%] {\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.25);\n  border-radius: 6px;\n}\n\n.bg-secondary-soft[_ngcontent-%COMP%] {\n  background: rgba(100, 116, 139, 0.12);\n}\n\n.bg-success-soft[_ngcontent-%COMP%] {\n  background: rgba(16, 185, 129, 0.15);\n}\n\n.bg-primary-soft[_ngcontent-%COMP%] {\n  background: rgba(79, 70, 229, 0.15);\n}\n\n.cursor-pointer[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\n\n.sutram-open-modal-container[_ngcontent-%COMP%] {\n  display: flex;\n}\n\n.saved-sheets-sidebar[_ngcontent-%COMP%] {\n  width: 250px;\n  min-width: 250px;\n  border-right: 1px solid var(--surface-border, rgba(125, 125, 125, 0.2));\n}\n\n.saved-sheets-list[_ngcontent-%COMP%] {\n  scrollbar-width: thin;\n}\n\n.saved-sheet-item[_ngcontent-%COMP%] {\n  transition: all 0.15s ease;\n  border: 1px solid transparent;\n\n  &:hover {\n    background: var(--bg, rgba(125, 125, 125, 0.08));\n    border-color: var(--surface-border, rgba(125, 125, 125, 0.2));\n\n    .delete-saved-sheet-btn {\n      opacity: 1;\n    }\n  }\n\n  .delete-saved-sheet-btn {\n    opacity: 0.45;\n    transition: opacity 0.15s, transform 0.15s;\n    line-height: 1;\n    text-decoration: none;\n\n    &:hover {\n      opacity: 1;\n      transform: scale(1.15);\n    }\n  }\n}\n\n.open-file-main-pane[_ngcontent-%COMP%] {\n  scrollbar-width: thin;\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramHeaderScannerComponent, [{
        type: Component,
        args: [{ selector: 'sutram-header-scanner', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-header-scanner.component.html -->\n<p-dialog [(visible)]=\"visible\"\n          [modal]=\"true\"\n          [style]=\"{ width: '840px', maxWidth: '96vw' }\"\n          [closable]=\"true\"\n          (onHide)=\"close()\">\n\n  <!-- Dialog Header with File Info and Sheet Switcher -->\n  <ng-template pTemplate=\"header\">\n    <div class=\"d-flex align-items-center justify-content-between w-100 pe-3 flex-wrap gap-2\">\n      <div class=\"d-flex align-items-center gap-2\">\n        <i class=\"pi pi-folder-open text-primary fs-5\"></i>\n        <span class=\"fw-bold fs-6\">\u092B\u093C\u093E\u0907\u0932 \u0914\u0930 \u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0936\u0940\u091F\u094D\u0938 (Open File & Saved Sheets)</span>\n      </div>\n      <div *ngIf=\"fileName\" class=\"d-flex align-items-center gap-2\">\n        <span class=\"badge bg-secondary-soft text-main border\" title=\"\u092B\u093C\u093E\u0907\u0932 \u0915\u093E \u0928\u093E\u092E\">\n          <i class=\"pi pi-file-excel text-success me-1\"></i>\n          <strong>{{ fileName }}</strong>\n        </span>\n        <div *ngIf=\"sheetNames.length > 1\" class=\"d-flex align-items-center gap-1\">\n          <small class=\"text-muted\">\u0936\u0940\u091F:</small>\n          <select class=\"form-select form-select-sm py-0 px-2\"\n                  style=\"height: 26px; font-size: 11px;\"\n                  [value]=\"currentSheetName\"\n                  (change)=\"onSheetSelect($any($event.target).value)\">\n            <option *ngFor=\"let s of sheetNames\" [value]=\"s\">{{ s }}</option>\n          </select>\n        </div>\n        <button type=\"button\"\n                class=\"btn btn-outline-secondary btn-sm py-0 px-2\"\n                style=\"height: 24px; font-size: 11px;\"\n                (click)=\"triggerFileInput.emit()\"\n                title=\"\u0905\u0928\u094D\u092F \u090F\u0915\u094D\u0938\u0947\u0932 \u092B\u093C\u093E\u0907\u0932 \u091A\u0941\u0928\u0947\u0902\">\n          <i class=\"pi pi-sync me-1\"></i>\u092B\u093C\u093E\u0907\u0932 \u092C\u0926\u0932\u0947\u0902\n        </button>\n      </div>\n      <div *ngIf=\"!fileName\">\n        <button type=\"button\"\n                class=\"btn btn-primary btn-sm py-0 px-2\"\n                style=\"height: 26px; font-size: 11px;\"\n                (click)=\"triggerFileInput.emit()\">\n          <i class=\"pi pi-upload me-1\"></i>\u092B\u093C\u093E\u0907\u0932 \u091A\u0941\u0928\u0947\u0902\n        </button>\n      </div>\n    </div>\n  </ng-template>\n\n  <!-- Modal Content Container: 2-Column Split -->\n  <div class=\"sutram-open-modal-container d-flex gap-3 my-2\" style=\"min-height: 380px;\">\n\n    <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n    <!-- LEFT SIDEBAR: Saved Local Sheets List                   -->\n    <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n    <div class=\"saved-sheets-sidebar d-flex flex-column pe-3\">\n      <div class=\"d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom\">\n        <div class=\"d-flex align-items-center gap-2\">\n          <i class=\"pi pi-save text-primary\" style=\"font-size: 13px;\"></i>\n          <span class=\"fw-bold small\">\u0938\u0939\u0947\u091C\u0940 \u0917\u0908 \u0936\u0940\u091F\u094D\u0938</span>\n        </div>\n        <span class=\"badge bg-primary-soft text-primary rounded-pill\" style=\"font-size: 10px;\">\n          {{ savedSheets.length }}\n        </span>\n      </div>\n\n      <div class=\"saved-sheets-list flex-grow-1 overflow-auto\" style=\"max-height: 380px;\">\n        <div *ngIf=\"savedSheets.length === 0\" class=\"text-center py-4 text-muted\">\n          <i class=\"pi pi-inbox fs-3 mb-2 d-block opacity-50\"></i>\n          <small>\u0915\u094B\u0908 \u0938\u0939\u0947\u091C\u0940 \u0917\u0908 \u0936\u0940\u091F \u0928\u0939\u0940\u0902 \u0939\u0948</small>\n        </div>\n\n        <div *ngFor=\"let s of savedSheets\"\n             class=\"saved-sheet-item d-flex align-items-center justify-content-between p-2 mb-1 rounded cursor-pointer\"\n             (click)=\"onSelectSavedSheet(s.sheetId)\"\n             [title]=\"'\u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0915\u0947 \u0916\u094B\u0932\u0947\u0902: ' + s.title\">\n          <div class=\"d-flex align-items-center gap-2 overflow-hidden me-1\">\n            <i class=\"pi pi-file-excel text-success\" style=\"font-size: 15px; flex-shrink: 0;\"></i>\n            <div class=\"text-truncate\">\n              <div class=\"fw-semibold small text-truncate\" style=\"line-height: 1.2;\">{{ s.title }}</div>\n              <small class=\"text-muted\" style=\"font-size: 10px;\">\n                {{ s.rowCount }} \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u093E\u0901{{ s.savedAt ? ' \u2022 ' + s.savedAt : '' }}\n              </small>\n            </div>\n          </div>\n          <button type=\"button\"\n                  class=\"btn btn-link text-danger p-0 delete-saved-sheet-btn\"\n                  (click)=\"onDeleteSavedSheetClick(s.sheetId, $event)\"\n                  title=\"\u0907\u0938 \u0938\u0939\u0947\u091C\u0940 \u0917\u0908 \u0936\u0940\u091F \u0915\u094B \u0939\u091F\u093E\u090F\u0902 (Delete)\">\n            <i class=\"pi pi-trash\" style=\"font-size: 12px;\"></i>\n          </button>\n        </div>\n      </div>\n    </div>\n\n    <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n    <!-- RIGHT MAIN PANE: Uploaded File Actions OR Browse Prompt -->\n    <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n    <div class=\"open-file-main-pane flex-grow-1 ps-1 overflow-auto\" style=\"max-height: 440px;\">\n\n      <ng-container *ngIf=\"fileName; else noFileSelectedTpl\">\n        <!-- 1. NORMAL SHEET BOX (Click -> Direct As-Is Load) -->\n        <div class=\"open-mode-box normal-mode-box mb-3\">\n          <div class=\"d-flex align-items-center gap-3 cursor-pointer\"\n               (click)=\"confirmDirectNormal()\"\n               title=\"\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0936\u0940\u091F \u092E\u0947\u0902 \u0938\u0940\u0927\u0947 \u0916\u094B\u0932\u0947\u0902\">\n            <div class=\"mode-icon-circle bg-success-soft\">\n              <i class=\"pi pi-file-excel text-success fs-3\"></i>\n            </div>\n            <div class=\"flex-grow-1\">\n              <div class=\"d-flex align-items-center gap-2 mb-1\">\n                <h6 class=\"mb-0 fw-bold\">\u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0936\u0940\u091F (Normal Sheet)</h6>\n                <span class=\"badge bg-success-soft text-success\">Direct Load</span>\n              </div>\n              <p class=\"mode-desc mb-0\">\u092C\u093F\u0928\u093E \u0915\u093F\u0938\u0940 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u092E\u0948\u092A\u093F\u0902\u0917 \u0915\u0947 \u090F\u0915\u094D\u0938\u0947\u0932 \u092B\u093C\u093E\u0907\u0932 \u0915\u094B \u092C\u093F\u0932\u094D\u0915\u0941\u0932 \u091C\u0948\u0938\u093E \u0939\u0948 (As-Is) \u0924\u0941\u0930\u0902\u0924 \u0928\u0908 \u0936\u0940\u091F \u092E\u0947\u0902 \u0916\u094B\u0932\u0947\u0902\u0964</p>\n            </div>\n            <div class=\"mode-arrow-btn\">\n              <i class=\"pi pi-arrow-right text-success fs-5\"></i>\n            </div>\n          </div>\n\n          <!-- Quick Custom Sheet Name Input -->\n          <div class=\"mt-2 pt-2 border-top d-flex align-items-center gap-2 flex-wrap\" (click)=\"$event.stopPropagation()\">\n            <label class=\"form-label small mb-0 text-muted text-nowrap\">\u0936\u0940\u091F \u0915\u093E \u0928\u093E\u092E (Sheet Name):</label>\n            <input type=\"text\"\n                   class=\"form-control form-control-sm\"\n                   [(ngModel)]=\"normalSheetCustomName\"\n                   [placeholder]=\"sheetNames.length > 0 ? (currentSheetName || sheetNames[0]) : 'Sheet 1'\"\n                   (keyup.enter)=\"confirmDirectNormal()\"\n                   style=\"max-width: 240px; height: 28px; font-size: 12px;\">\n            <button type=\"button\" \n                    class=\"btn btn-sm btn-success py-0 px-3\" \n                    style=\"height: 28px; font-size: 12px;\"\n                    (click)=\"confirmDirectNormal()\">\n              <i class=\"pi pi-check me-1\"></i>\u0936\u0940\u091F \u0916\u094B\u0932\u0947\u0902\n            </button>\n          </div>\n        </div>\n\n        <!-- 2. FORMAT MATCHER BOX (Click reveals selection wizard) -->\n        <div class=\"open-mode-box matcher-mode-box\" [class.is-expanded]=\"showMatcherWizard\">\n          \n          <!-- Box Header Trigger (Clickable) -->\n          <div class=\"mode-box-trigger cursor-pointer\"\n               (click)=\"toggleMatcherWizard()\"\n               title=\"\u092B\u0949\u0930\u094D\u092E\u0947\u091F \u092E\u0948\u091A\u0930 \u0935\u093F\u091C\u093C\u093E\u0930\u094D\u0921 \u0916\u094B\u0932\u0947\u0902\">\n            <div class=\"d-flex align-items-center gap-3\">\n              <div class=\"mode-icon-circle bg-primary-soft\">\n                <i class=\"pi pi-database text-primary fs-3\"></i>\n              </div>\n              <div class=\"flex-grow-1\">\n                <div class=\"d-flex align-items-center gap-2 mb-1\">\n                  <h6 class=\"mb-0 fw-bold\">\u092B\u0949\u0930\u094D\u092E\u0947\u091F \u092E\u0948\u091A\u0930 (Format Matcher)</h6>\n                  <span class=\"badge bg-primary-soft text-primary\">Schema & Sync</span>\n                </div>\n                <p class=\"mode-desc mb-0\">\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u091A\u0941\u0928\u0947\u0902, \u0915\u0949\u0932\u092E\u094D\u0938 \u0911\u091F\u094B-\u092E\u0948\u091A \u0915\u0930\u0947\u0902 \u0914\u0930 \u0921\u0947\u091F\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0915\u0947 \u0938\u093E\u0925 \u0932\u094B\u0921 \u0915\u0930\u0947\u0902\u0964</p>\n              </div>\n              <div class=\"mode-arrow-btn\">\n                <i class=\"pi\" [ngClass]=\"showMatcherWizard ? 'pi-chevron-up text-primary' : 'pi-chevron-down text-muted'\" style=\"font-size: 1.1rem;\"></i>\n              </div>\n            </div>\n          </div>\n\n          <!-- Selection Wizard (Shown ONLY after clicking) -->\n          <div *ngIf=\"showMatcherWizard\" class=\"matcher-wizard-container mt-3 pt-3\">\n            \n            <!-- Target Table Dropdown (Searchable!) -->\n            <div class=\"mb-3\">\n              <label class=\"form-label fw-bold small mb-1\">\n                \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u091A\u0941\u0928\u0947\u0902 (Select Target Table):\n              </label>\n              <p-dropdown [options]=\"tableSelectOptions\"\n                          [(ngModel)]=\"selectedTable\"\n                          [filter]=\"true\"\n                          filterBy=\"label,value\"\n                          filterPlaceholder=\"\u0924\u093E\u0932\u093F\u0915\u093E \u0915\u093E \u0928\u093E\u092E \u0916\u094B\u091C\u0947\u0902...\"\n                          placeholder=\"\u0924\u093E\u0932\u093F\u0915\u093E \u091A\u0941\u0928\u0947\u0902...\"\n                          styleClass=\"w-100\"\n                          (onChange)=\"onTableChange($event.value)\">\n              </p-dropdown>\n            </div>\n\n            <!-- Loading Spinner for Schema -->\n            <div *ngIf=\"isTableConfigLoading\" class=\"text-center py-4\">\n              <i class=\"pi pi-spin pi-spinner text-primary fs-2\"></i>\n              <div class=\"text-muted small mt-2\">\u0924\u093E\u0932\u093F\u0915\u093E \u0938\u094D\u0915\u0940\u092E\u093E \u0914\u0930 \u0938\u0902\u0926\u0930\u094D\u092D \u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...</div>\n            </div>\n\n            <!-- Mapping View (When Table is Selected) -->\n            <div *ngIf=\"!isTableConfigLoading && report && selectedTable\">\n\n              <!-- Missing Required Alert -->\n              <div *ngIf=\"report.missingRequired.length > 0\" class=\"alert-mandatory p-2 mb-3\">\n                <div class=\"d-flex align-items-center gap-2 text-danger fw-semibold small mb-1\">\n                  <i class=\"pi pi-exclamation-triangle\"></i>\n                  <span>\u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0915\u0949\u0932\u092E\u094D\u0938 \u091B\u0942\u091F \u0917\u090F \u0939\u0948\u0902 (Missing Mandatory Fields):</span>\n                </div>\n                <div class=\"d-flex flex-wrap gap-1 ps-4\">\n                  <span *ngFor=\"let m of report.missingRequired\" class=\"badge bg-danger\">\n                    {{ m.name }}\n                  </span>\n                </div>\n              </div>\n\n              <!-- Header Matching Table -->\n              <div class=\"matches-table-scroll mb-3\">\n                <table class=\"table table-sm table-hover mb-0 matches-table\">\n                  <thead>\n                    <tr>\n                      <th style=\"width: 35%;\">\u090F\u0915\u094D\u0938\u0947\u0932 \u0915\u0949\u0932\u092E (Excel Header)</th>\n                      <th style=\"width: 15%; text-align: center;\">\u092E\u0948\u091A \u0938\u094D\u0925\u093F\u0924\u093F</th>\n                      <th style=\"width: 50%;\">\u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0915\u0949\u0932\u092E (Target Field)</th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    <tr *ngFor=\"let m of report.matches\">\n                      <td class=\"align-middle fw-medium\">\n                        <code>{{ m.sheetHeader }}</code>\n                      </td>\n                      <td class=\"align-middle text-center\">\n                        <span *ngIf=\"m.status === 'exact'\" class=\"badge bg-success\" title=\"Exact match\">\n                          \u2713 Exact\n                        </span>\n                        <span *ngIf=\"m.status === 'fuzzy'\" class=\"badge bg-info text-dark\" title=\"Fuzzy / Alias match\">\n                          \u2248 {{ Math.round((m.confidence || 0) * 100) }}%\n                        </span>\n                        <span *ngIf=\"m.status === 'unmatched'\" class=\"badge bg-secondary\" title=\"No match found\">\n                          - \u091B\u0942\u091F\u093E\n                        </span>\n                        <span *ngIf=\"m.status === 'manual'\" class=\"badge bg-primary\" title=\"Manually mapped\">\n                          \u270E \u091A\u0941\u0928\u093E\n                        </span>\n                      </td>\n                      <td class=\"align-middle\">\n                        <p-dropdown [options]=\"columnSelectOptions\"\n                                    [ngModel]=\"m.targetColKey\"\n                                    [showClear]=\"true\"\n                                    [filter]=\"true\"\n                                    filterPlaceholder=\"\u092B\u093C\u0940\u0932\u094D\u0921 \u0916\u094B\u091C\u0947\u0902...\"\n                                    placeholder=\"(\u091B\u094B\u0921\u093C \u0926\u0947\u0902 / Skip)\"\n                                    styleClass=\"w-100 p-dropdown-sm\"\n                                    (onChange)=\"onTargetColumnChange(m, $event.value)\">\n                        </p-dropdown>\n                      </td>\n                    </tr>\n                  </tbody>\n                </table>\n              </div>\n\n              <!-- Confirm Mapped Load Button -->\n              <div class=\"mt-3\">\n                <button pButton\n                        label=\"\u0924\u093E\u0932\u093F\u0915\u093E \u092E\u0947\u0902 \u0932\u094B\u0921 \u0915\u0930\u0947\u0902 (Open & Map to Table)\"\n                        icon=\"pi pi-check\"\n                        class=\"p-button-primary w-100 py-2 fw-semibold\"\n                        [disabled]=\"!selectedTable || isTableConfigLoading\"\n                        (click)=\"confirmMappedToTable()\">\n                </button>\n              </div>\n\n            </div>\n\n            <!-- Prompt if table not selected yet -->\n            <div *ngIf=\"!isTableConfigLoading && !report && !selectedTable\" class=\"text-center py-3 text-muted small\">\n              \u0915\u0943\u092A\u092F\u093E \u090A\u092A\u0930 \u0926\u093F\u090F \u0917\u090F \u0938\u0930\u094D\u091A \u0921\u094D\u0930\u0949\u092A\u0921\u093E\u0909\u0928 \u0938\u0947 \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u091A\u0941\u0928\u0947\u0902\u0964\n            </div>\n\n          </div>\n\n        </div>\n      </ng-container>\n\n      <!-- If no file is uploaded yet -->\n      <ng-template #noFileSelectedTpl>\n        <div class=\"text-center py-5 px-3 d-flex flex-column align-items-center justify-content-center h-100\">\n          <div class=\"mode-icon-circle bg-success-soft mb-3\" style=\"width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: 50%;\">\n            <i class=\"pi pi-file-excel text-success fs-2\"></i>\n          </div>\n          <h6 class=\"fw-bold mb-1\">\u090F\u0915\u094D\u0938\u0947\u0932 \u092B\u093C\u093E\u0907\u0932 \u0906\u092F\u093E\u0924 \u0915\u0930\u0947\u0902 (Import Excel)</h6>\n          <p class=\"text-muted small mb-3\" style=\"max-width: 320px;\">\n            \u0915\u0902\u092A\u094D\u092F\u0942\u091F\u0930 \u0938\u0947 \u0915\u094B\u0908 \u092D\u0940 .xlsx, .xls \u092F\u093E .csv \u092B\u093C\u093E\u0907\u0932 \u091A\u0941\u0928\u0947\u0902 \u0914\u0930 \u0909\u0938\u0947 \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0936\u0940\u091F \u092F\u093E \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0924\u093E\u0932\u093F\u0915\u093E \u0938\u0947 \u0911\u091F\u094B-\u092E\u0948\u091A \u0915\u0930\u0915\u0947 \u0916\u094B\u0932\u0947\u0902\u0964\n          </p>\n          <button type=\"button\" class=\"btn btn-primary btn-sm px-3 py-2 fw-semibold\" (click)=\"triggerFileInput.emit()\">\n            <i class=\"pi pi-folder-open me-2\"></i>\u0915\u0902\u092A\u094D\u092F\u0942\u091F\u0930 \u0938\u0947 \u092B\u093C\u093E\u0907\u0932 \u091A\u0941\u0928\u0947\u0902 (Browse File)\n          </button>\n        </div>\n      </ng-template>\n\n    </div>\n\n  </div>\n\n  <ng-template pTemplate=\"footer\">\n    <div class=\"d-flex justify-content-end\">\n      <button pButton label=\"\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902 (Cancel)\" icon=\"pi pi-times\" class=\"p-button-text p-button-secondary\" (click)=\"close()\"></button>\n    </div>\n  </ng-template>\n\n</p-dialog>\n", styles: [":host {\n  display: block;\n}\n\n.sutram-open-modal-body {\n  display: flex;\n  flex-direction: column;\n}\n\n.open-mode-box {\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 8px;\n  background: var(--surface, #ffffff);\n  padding: 14px 16px;\n  transition: all 0.2s ease;\n\n  &.normal-mode-box {\n    border-left: 4px solid #10b981;\n\n    &:hover {\n      border-color: #10b981;\n      background: var(--bg, #f8fafc);\n      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.12);\n      transform: translateY(-1px);\n\n      .mode-arrow-btn {\n        transform: translateX(4px);\n      }\n    }\n  }\n\n  &.matcher-mode-box {\n    border-left: 4px solid #4f46e5;\n\n    &.is-expanded {\n      border-color: #4f46e5;\n      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);\n    }\n\n    &:not(.is-expanded):hover {\n      border-color: #4f46e5;\n      background: var(--bg, #f8fafc);\n      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.12);\n      transform: translateY(-1px);\n\n      .mode-arrow-btn {\n        transform: translateX(4px);\n      }\n    }\n  }\n}\n\n.mode-box-trigger {\n  user-select: none;\n}\n\n.mode-icon-circle {\n  width: 44px;\n  height: 44px;\n  border-radius: 8px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.mode-arrow-btn {\n  transition: transform 0.2s ease;\n  padding: 4px;\n}\n\n.mode-desc {\n  font-size: 12px;\n  color: var(--text-muted, #64748b);\n  line-height: 1.4;\n}\n\n.matcher-wizard-container {\n  border-top: 1px dashed var(--surface-border, #e2e8f0);\n}\n\n.matches-table-scroll {\n  max-height: 230px;\n  overflow-y: auto;\n  border: 1px solid var(--surface-border, #e2e8f0);\n  border-radius: 6px;\n}\n\n.matches-table {\n  font-size: 12px;\n  color: var(--text, inherit);\n\n  thead th {\n    background: var(--header-bg, #f1f5f9);\n    color: var(--header-text, #1e293b);\n    position: sticky;\n    top: 0;\n    z-index: 2;\n    padding: 6px 8px;\n  }\n\n  tbody td {\n    padding: 4px 8px;\n  }\n}\n\n:host ::ng-deep {\n  .p-dropdown {\n    background: var(--surface, #ffffff);\n    border-color: var(--surface-border, #cbd5e1);\n    color: var(--text, inherit);\n\n    .p-dropdown-label {\n      font-size: 12px;\n      padding: 5px 8px;\n      color: var(--text, inherit);\n    }\n\n    &.p-dropdown-sm {\n      .p-dropdown-label {\n        font-size: 11px;\n        padding: 3px 6px;\n      }\n    }\n  }\n\n  .p-dropdown-panel {\n    background: var(--surface, #ffffff);\n    border-color: var(--surface-border, #cbd5e1);\n    color: var(--text, inherit);\n\n    .p-dropdown-items {\n      padding: 4px 0;\n\n      .p-dropdown-item {\n        font-size: 12px;\n        padding: 6px 10px;\n        color: var(--text, inherit);\n\n        &:hover, &.p-highlight {\n          background: var(--primary-soft, #e0e7ff);\n          color: var(--primary, #4f46e5);\n        }\n      }\n    }\n\n    .p-dropdown-filter-container {\n      padding: 6px;\n\n      .p-dropdown-filter {\n        font-size: 12px;\n        padding: 4px 8px;\n        background: var(--bg, #f8fafc);\n        border-color: var(--surface-border, #cbd5e1);\n        color: var(--text, inherit);\n      }\n    }\n  }\n}\n\n.alert-mandatory {\n  background: rgba(239, 68, 68, 0.08);\n  border: 1px solid rgba(239, 68, 68, 0.25);\n  border-radius: 6px;\n}\n\n.bg-secondary-soft {\n  background: rgba(100, 116, 139, 0.12);\n}\n\n.bg-success-soft {\n  background: rgba(16, 185, 129, 0.15);\n}\n\n.bg-primary-soft {\n  background: rgba(79, 70, 229, 0.15);\n}\n\n.cursor-pointer {\n  cursor: pointer;\n}\n\n.sutram-open-modal-container {\n  display: flex;\n}\n\n.saved-sheets-sidebar {\n  width: 250px;\n  min-width: 250px;\n  border-right: 1px solid var(--surface-border, rgba(125, 125, 125, 0.2));\n}\n\n.saved-sheets-list {\n  scrollbar-width: thin;\n}\n\n.saved-sheet-item {\n  transition: all 0.15s ease;\n  border: 1px solid transparent;\n\n  &:hover {\n    background: var(--bg, rgba(125, 125, 125, 0.08));\n    border-color: var(--surface-border, rgba(125, 125, 125, 0.2));\n\n    .delete-saved-sheet-btn {\n      opacity: 1;\n    }\n  }\n\n  .delete-saved-sheet-btn {\n    opacity: 0.45;\n    transition: opacity 0.15s, transform 0.15s;\n    line-height: 1;\n    text-decoration: none;\n\n    &:hover {\n      opacity: 1;\n      transform: scale(1.15);\n    }\n  }\n}\n\n.open-file-main-pane {\n  scrollbar-width: thin;\n}\n\n\n"] }]
    }], null, { visible: [{
            type: Input
        }], fileName: [{
            type: Input
        }], sheetNames: [{
            type: Input
        }], currentSheetName: [{
            type: Input
        }], sheetHeaders: [{
            type: Input
        }], sampleRows: [{
            type: Input
        }], totalRows: [{
            type: Input
        }], tablesList: [{
            type: Input
        }], selectedTable: [{
            type: Input
        }], report: [{
            type: Input
        }], availableHeaders: [{
            type: Input
        }], isTableConfigLoading: [{
            type: Input
        }], savedSheets: [{
            type: Input
        }], visibleChange: [{
            type: Output
        }], sheetChange: [{
            type: Output
        }], targetTableChange: [{
            type: Output
        }], openDirectNormal: [{
            type: Output
        }], openMappedToTable: [{
            type: Output
        }], openSavedSheet: [{
            type: Output
        }], deleteSavedSheet: [{
            type: Output
        }], triggerFileInput: [{
            type: Output
        }], cancelled: [{
            type: Output
        }] }); })();
