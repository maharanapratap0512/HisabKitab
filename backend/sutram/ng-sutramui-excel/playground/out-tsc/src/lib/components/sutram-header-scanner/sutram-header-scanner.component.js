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
import * as i4 from "primeng/button";
import * as i5 from "primeng/dialog";
function SutramHeaderScannerComponent_div_1_div_1_span_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 17);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r5 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1(" ", col_r5.name, " ");
} }
function SutramHeaderScannerComponent_div_1_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13);
    i0.ɵɵelement(1, "i", 14);
    i0.ɵɵelementStart(2, "div")(3, "strong");
    i0.ɵɵtext(4, "\u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0915\u0949\u0932\u092E \u0905\u0928\u0941\u092A\u0938\u094D\u0925\u093F\u0924 \u0939\u0948\u0902 (Missing Required):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 15);
    i0.ɵɵtemplate(6, SutramHeaderScannerComponent_div_1_div_1_span_6_Template, 2, 1, "span", 16);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngForOf", ctx_r2.report.missingMandatory);
} }
function SutramHeaderScannerComponent_div_1_tr_22_i_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "i", 27);
} }
function SutramHeaderScannerComponent_div_1_tr_22_i_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "i", 28);
} }
function SutramHeaderScannerComponent_div_1_tr_22_i_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "i", 29);
} }
function SutramHeaderScannerComponent_div_1_tr_22_option_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 30);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const target_r11 = ctx.$implicit;
    i0.ɵɵproperty("value", target_r11.name);
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate2(" ", target_r11.name, " ", target_r11.not_null ? "*" : "", " ");
} }
function SutramHeaderScannerComponent_div_1_tr_22_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td")(2, "div", 18)(3, "span", 19);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(7, "td", 20);
    i0.ɵɵtemplate(8, SutramHeaderScannerComponent_div_1_tr_22_i_8_Template, 1, 0, "i", 21);
    i0.ɵɵtemplate(9, SutramHeaderScannerComponent_div_1_tr_22_i_9_Template, 1, 0, "i", 22);
    i0.ɵɵtemplate(10, SutramHeaderScannerComponent_div_1_tr_22_i_10_Template, 1, 0, "i", 23);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "td")(12, "select", 24);
    i0.ɵɵlistener("change", function SutramHeaderScannerComponent_div_1_tr_22_Template_select_change_12_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r13); const match_r6 = restoredCtx.$implicit; const ctx_r12 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r12.onTargetColumnChange(match_r6, $event.target.value)); });
    i0.ɵɵelementStart(13, "option", 25);
    i0.ɵɵtext(14, "-- \u0915\u0949\u0932\u092E \u091A\u0941\u0928\u0947\u0902 (\u091B\u094B\u0921\u093C\u0947\u0902) --");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(15, SutramHeaderScannerComponent_div_1_tr_22_option_15_Template, 2, 3, "option", 26);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const match_r6 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("Col ", match_r6.sheetColIndex + 1, "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(match_r6.sheetHeader);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", match_r6.status === "matched");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", match_r6.status === "manual");
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", match_r6.status === "unmatched");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", match_r6.targetColKey || "");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r3.availableHeaders);
} }
function SutramHeaderScannerComponent_div_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵtemplate(1, SutramHeaderScannerComponent_div_1_div_1_Template, 7, 1, "div", 4);
    i0.ɵɵelementStart(2, "div", 5)(3, "small", 6);
    i0.ɵɵtext(4, " \u0915\u0941\u0932 ");
    i0.ɵɵelementStart(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(7, " \u092E\u0947\u0902 \u0938\u0947 ");
    i0.ɵɵelementStart(8, "strong");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(10, " \u0915\u0949\u0932\u092E \u092E\u0948\u092A \u0939\u094B \u091A\u0941\u0915\u0947 \u0939\u0948\u0902 ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 7)(12, "table", 8)(13, "thead", 9)(14, "tr")(15, "th", 10);
    i0.ɵɵtext(16, "Excel \u092B\u093C\u093E\u0907\u0932 \u0915\u093E \u0939\u0947\u0921\u0930");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "th", 11);
    i0.ɵɵtext(18, "\u2192");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "th", 10);
    i0.ɵɵtext(20, "\u091F\u093E\u0930\u0917\u0947\u091F \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0915\u0949\u0932\u092E");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(21, "tbody");
    i0.ɵɵtemplate(22, SutramHeaderScannerComponent_div_1_tr_22_Template, 16, 7, "tr", 12);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r0.report.missingMandatory.length > 0);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.report.totalSheetCols);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.matchedCount);
    i0.ɵɵadvance(13);
    i0.ɵɵproperty("ngForOf", ctx_r0.report.matches);
} }
function SutramHeaderScannerComponent_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 31)(1, "button", 32);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_template_2_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r15); const ctx_r14 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r14.close()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 33);
    i0.ɵɵlistener("click", function SutramHeaderScannerComponent_ng_template_2_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r15); const ctx_r16 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r16.confirm()); });
    i0.ɵɵelementEnd()();
} }
const _c0 = function () { return { width: "750px", maxWidth: "95vw" }; };
export class SutramHeaderScannerComponent {
    visible = false;
    report = null;
    availableHeaders = [];
    visibleChange = new EventEmitter();
    confirmed = new EventEmitter();
    cancelled = new EventEmitter();
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
    confirm() {
        if (this.report) {
            this.confirmed.emit(this.report.matches);
        }
        this.close();
    }
    close() {
        this.visible = false;
        this.visibleChange.emit(false);
        this.cancelled.emit();
    }
    static ɵfac = function SutramHeaderScannerComponent_Factory(t) { return new (t || SutramHeaderScannerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SutramHeaderScannerComponent, selectors: [["sutram-header-scanner"]], inputs: { visible: "visible", report: "report", availableHeaders: "availableHeaders" }, outputs: { visibleChange: "visibleChange", confirmed: "confirmed", cancelled: "cancelled" }, decls: 3, vars: 7, consts: [["header", "Excel \u0936\u0940\u091F \u0939\u0947\u0921\u0930 \u0938\u094D\u0915\u0948\u0928\u0930 (Smart Header Matcher)", 3, "visible", "modal", "closable", "visibleChange", "onHide"], ["class", "p-2", 4, "ngIf"], ["pTemplate", "footer"], [1, "p-2"], ["class", "alert alert-warning d-flex align-items-center mb-3 p-2", 4, "ngIf"], [1, "d-flex", "justify-content-between", "align-items-center", "mb-2", "px-1"], [1, "text-muted"], [1, "border", "rounded", "overflow-hidden", 2, "max-height", "340px", "overflow-y", "auto"], [1, "table", "table-sm", "table-hover", "align-middle", "mb-0", 2, "font-size", "13px"], [1, "table-light"], [2, "width", "45%"], [2, "width", "10%", "text-align", "center"], [4, "ngFor", "ngForOf"], [1, "alert", "alert-warning", "d-flex", "align-items-center", "mb-3", "p-2"], [1, "pi", "pi-exclamation-triangle", "text-warning", "fs-4", "me-2"], [1, "d-flex", "flex-wrap", "gap-1", "mt-1"], ["class", "badge bg-danger", 4, "ngFor", "ngForOf"], [1, "badge", "bg-danger"], [1, "d-flex", "align-items-center", "gap-2"], [1, "badge", "bg-secondary", 2, "font-size", "10px"], [1, "text-center", "text-muted"], ["class", "pi pi-check text-success", "title", "\u0911\u091F\u094B-\u092E\u0948\u091A", 4, "ngIf"], ["class", "pi pi-user-edit text-primary", "title", "\u092E\u0948\u0928\u094D\u092F\u0941\u0905\u0932 \u091A\u092F\u0928", 4, "ngIf"], ["class", "pi pi-times text-danger", "title", "\u0905\u0928\u092E\u0948\u092A\u094D\u0921", 4, "ngIf"], [1, "form-select", "form-select-sm", 3, "value", "change"], ["value", ""], [3, "value", 4, "ngFor", "ngForOf"], ["title", "\u0911\u091F\u094B-\u092E\u0948\u091A", 1, "pi", "pi-check", "text-success"], ["title", "\u092E\u0948\u0928\u094D\u092F\u0941\u0905\u0932 \u091A\u092F\u0928", 1, "pi", "pi-user-edit", "text-primary"], ["title", "\u0905\u0928\u092E\u0948\u092A\u094D\u0921", 1, "pi", "pi-times", "text-danger"], [3, "value"], [1, "d-flex", "justify-content-end", "gap-2"], ["pButton", "", "label", "\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902", 1, "p-button-text", "p-button-secondary", 3, "click"], ["pButton", "", "label", "\u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0947\u0902 \u0914\u0930 \u0917\u094D\u0930\u093F\u0921 \u092E\u0947\u0902 \u0916\u094B\u0932\u0947\u0902", "icon", "pi pi-check", 1, "p-button-primary", 3, "click"]], template: function SutramHeaderScannerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "p-dialog", 0);
            i0.ɵɵlistener("visibleChange", function SutramHeaderScannerComponent_Template_p_dialog_visibleChange_0_listener($event) { return ctx.visible = $event; })("onHide", function SutramHeaderScannerComponent_Template_p_dialog_onHide_0_listener() { return ctx.close(); });
            i0.ɵɵtemplate(1, SutramHeaderScannerComponent_div_1_Template, 23, 4, "div", 1);
            i0.ɵɵtemplate(2, SutramHeaderScannerComponent_ng_template_2_Template, 3, 0, "ng-template", 2);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵstyleMap(i0.ɵɵpureFunction0(6, _c0));
            i0.ɵɵproperty("visible", ctx.visible)("modal", true)("closable", true);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.report);
        } }, dependencies: [i1.NgForOf, i1.NgIf, i2.NgSelectOption, i2.ɵNgSelectMultipleOption, i3.PrimeTemplate, i4.ButtonDirective, i5.Dialog], styles: [".alert[_ngcontent-%COMP%] {\n  border-radius: 6px;\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramHeaderScannerComponent, [{
        type: Component,
        args: [{ selector: 'sutram-header-scanner', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-header-scanner.component.html -->\n<p-dialog [(visible)]=\"visible\"\n          [modal]=\"true\"\n          [style]=\"{ width: '750px', maxWidth: '95vw' }\"\n          [closable]=\"true\"\n          (onHide)=\"close()\"\n          header=\"Excel \u0936\u0940\u091F \u0939\u0947\u0921\u0930 \u0938\u094D\u0915\u0948\u0928\u0930 (Smart Header Matcher)\">\n\n  <div *ngIf=\"report\" class=\"p-2\">\n\n    <!-- Missing Mandatory Columns Warning Banner -->\n    <div *ngIf=\"report.missingMandatory.length > 0\" class=\"alert alert-warning d-flex align-items-center mb-3 p-2\">\n      <i class=\"pi pi-exclamation-triangle text-warning fs-4 me-2\"></i>\n      <div>\n        <strong>\u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0915\u0949\u0932\u092E \u0905\u0928\u0941\u092A\u0938\u094D\u0925\u093F\u0924 \u0939\u0948\u0902 (Missing Required):</strong>\n        <div class=\"d-flex flex-wrap gap-1 mt-1\">\n          <span *ngFor=\"let col of report.missingMandatory\" class=\"badge bg-danger\">\n            {{ col.name }}\n          </span>\n        </div>\n      </div>\n    </div>\n\n    <!-- Match Summary Bar -->\n    <div class=\"d-flex justify-content-between align-items-center mb-2 px-1\">\n      <small class=\"text-muted\">\n        \u0915\u0941\u0932 <strong>{{ report.totalSheetCols }}</strong> \u092E\u0947\u0902 \u0938\u0947 <strong>{{ matchedCount }}</strong> \u0915\u0949\u0932\u092E \u092E\u0948\u092A \u0939\u094B \u091A\u0941\u0915\u0947 \u0939\u0948\u0902\n      </small>\n    </div>\n\n    <!-- Matches Table -->\n    <div class=\"border rounded overflow-hidden\" style=\"max-height: 340px; overflow-y: auto;\">\n      <table class=\"table table-sm table-hover align-middle mb-0\" style=\"font-size: 13px;\">\n        <thead class=\"table-light\">\n          <tr>\n            <th style=\"width: 45%;\">Excel \u092B\u093C\u093E\u0907\u0932 \u0915\u093E \u0939\u0947\u0921\u0930</th>\n            <th style=\"width: 10%; text-align: center;\">\u2192</th>\n            <th style=\"width: 45%;\">\u091F\u093E\u0930\u0917\u0947\u091F \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0915\u0949\u0932\u092E</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr *ngFor=\"let match of report.matches\">\n            <td>\n              <div class=\"d-flex align-items-center gap-2\">\n                <span class=\"badge bg-secondary\" style=\"font-size: 10px;\">Col {{ match.sheetColIndex + 1 }}</span>\n                <strong>{{ match.sheetHeader }}</strong>\n              </div>\n            </td>\n            <td class=\"text-center text-muted\">\n              <i *ngIf=\"match.status === 'matched'\" class=\"pi pi-check text-success\" title=\"\u0911\u091F\u094B-\u092E\u0948\u091A\"></i>\n              <i *ngIf=\"match.status === 'manual'\" class=\"pi pi-user-edit text-primary\" title=\"\u092E\u0948\u0928\u094D\u092F\u0941\u0905\u0932 \u091A\u092F\u0928\"></i>\n              <i *ngIf=\"match.status === 'unmatched'\" class=\"pi pi-times text-danger\" title=\"\u0905\u0928\u092E\u0948\u092A\u094D\u0921\"></i>\n            </td>\n            <td>\n              <select class=\"form-select form-select-sm\"\n                      [value]=\"match.targetColKey || ''\"\n                      (change)=\"onTargetColumnChange(match, $any($event.target).value)\">\n                <option value=\"\">-- \u0915\u0949\u0932\u092E \u091A\u0941\u0928\u0947\u0902 (\u091B\u094B\u0921\u093C\u0947\u0902) --</option>\n                <option *ngFor=\"let target of availableHeaders\" [value]=\"target.name\">\n                  {{ target.name }} {{ target.not_null ? '*' : '' }}\n                </option>\n              </select>\n            </td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n\n  </div>\n\n  <ng-template pTemplate=\"footer\">\n    <div class=\"d-flex justify-content-end gap-2\">\n      <button pButton label=\"\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902\" class=\"p-button-text p-button-secondary\" (click)=\"close()\"></button>\n      <button pButton label=\"\u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0947\u0902 \u0914\u0930 \u0917\u094D\u0930\u093F\u0921 \u092E\u0947\u0902 \u0916\u094B\u0932\u0947\u0902\" icon=\"pi pi-check\" class=\"p-button-primary\" (click)=\"confirm()\"></button>\n    </div>\n  </ng-template>\n\n</p-dialog>\n", styles: [".alert {\n  border-radius: 6px;\n}\n"] }]
    }], null, { visible: [{
            type: Input
        }], report: [{
            type: Input
        }], availableHeaders: [{
            type: Input
        }], visibleChange: [{
            type: Output
        }], confirmed: [{
            type: Output
        }], cancelled: [{
            type: Output
        }] }); })();
