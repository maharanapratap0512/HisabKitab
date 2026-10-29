/**
 * sutram-dictionary-view.component.ts
 * ─────────────────────────────────────────────────────────────
 * Dictionary Manager View using PrimeNG p-table.
 * Allows searching, editing, and soft-deleting persistent correction rules
 * stored in xls_dictionary.
 * ─────────────────────────────────────────────────────────────
 */
import { Component, ChangeDetectionStrategy } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../services/sutram-excel-api.service";
import * as i2 from "@angular/forms";
import * as i3 from "primeng/table";
import * as i4 from "primeng/api";
import * as i5 from "primeng/button";
import * as i6 from "primeng/inputtext";
function SutramDictionaryViewComponent_ng_template_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "th", 11);
    i0.ɵɵtext(2, "ID");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "th");
    i0.ɵɵtext(4, "\u092A\u094D\u0930\u0915\u093E\u0930 (Type)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "th");
    i0.ɵɵtext(6, "\u0905\u091C\u094D\u091E\u093E\u0924 \u0928\u093E\u092E (Unknown Name)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "th");
    i0.ɵɵtext(8, "\u091F\u093E\u0930\u0917\u0947\u091F ID (Target Ref ID)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "th");
    i0.ɵɵtext(10, "\u0928\u094B\u091F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "th", 12);
    i0.ɵɵtext(12, "\u090F\u0915\u094D\u0936\u0928");
    i0.ɵɵelementEnd()();
} }
function SutramDictionaryViewComponent_ng_template_12_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td")(4, "span", 13);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "td")(7, "strong", 14);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "td")(10, "span", 15);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "td")(13, "small", 3);
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "td", 16)(16, "button", 17);
    i0.ɵɵlistener("click", function SutramDictionaryViewComponent_ng_template_12_Template_button_click_16_listener() { const restoredCtx = i0.ɵɵrestoreView(_r5); const item_r3 = restoredCtx.$implicit; const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.deleteEntry(item_r3._id)); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r3 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r3._id);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r3.type);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("\"", item_r3.name, "\"");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r3.ref_id);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r3.extra_note || "-");
} }
function SutramDictionaryViewComponent_ng_template_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 18);
    i0.ɵɵtext(2, " \u0915\u094B\u0908 \u0921\u093F\u0915\u094D\u0936\u0928\u0930\u0940 \u0928\u093F\u092F\u092E \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 ");
    i0.ɵɵelementEnd()();
} }
export class SutramDictionaryViewComponent {
    api;
    cdr;
    entries = [];
    isLoading = false;
    filterType = '';
    searchQuery = '';
    constructor(api, cdr) {
        this.api = api;
        this.cdr = cdr;
    }
    ngOnInit() {
        this.loadEntries();
    }
    loadEntries() {
        this.isLoading = true;
        this.api.getDictionary(this.filterType || undefined).subscribe({
            next: (list) => {
                this.entries = list;
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isLoading = false;
                console.error('[SutramDictionaryView] Load failed:', err);
                this.cdr.markForCheck();
            }
        });
    }
    deleteEntry(id) {
        if (!confirm('क्या आप इस डिक्शनरी नियम को हटाना चाहते हैं?'))
            return;
        this.api.deleteDictionaryEntry(id).subscribe({
            next: () => {
                this.entries = this.entries.filter(e => e._id !== id);
                this.cdr.markForCheck();
            },
            error: (err) => console.error('[SutramDictionaryView] Delete failed:', err)
        });
    }
    onFilterChange() {
        this.loadEntries();
    }
    static ɵfac = function SutramDictionaryViewComponent_Factory(t) { return new (t || SutramDictionaryViewComponent)(i0.ɵɵdirectiveInject(i1.SutramExcelApiService), i0.ɵɵdirectiveInject(i0.ChangeDetectorRef)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SutramDictionaryViewComponent, selectors: [["sutram-dictionary-view"]], decls: 14, vars: 6, consts: [[1, "sutram-dictionary-container", "card", "p-3", "border", "shadow-sm"], [1, "d-flex", "align-items-center", "justify-content-between", "mb-3", "flex-wrap", "gap-2"], [1, "m-0", "fw-bold"], [1, "text-muted"], [1, "d-flex", "gap-2"], ["type", "text", "pInputText", "", "placeholder", "\u0916\u094B\u091C\u0947\u0902 (Search)...", 1, "p-inputtext-sm", 3, "ngModel", "ngModelChange"], ["pButton", "", "icon", "pi pi-refresh", "title", "\u0930\u0940\u0932\u094B\u0921 \u0915\u0930\u0947\u0902", 1, "p-button-outlined", "p-button-sm", 3, "loading", "click"], ["styleClass", "p-datatable-sm p-datatable-gridlines", 3, "value", "loading", "paginator", "rows"], ["pTemplate", "header"], ["pTemplate", "body"], ["pTemplate", "emptymessage"], [2, "width", "80px"], [2, "width", "90px", "text-align", "center"], [1, "badge", "bg-soft-primary", "text-primary"], [1, "text-danger"], [1, "badge", "bg-soft-success", "text-success", "fs-6"], [1, "text-center"], ["pButton", "", "icon", "pi pi-trash", "title", "\u0939\u091F\u093E\u090F\u0902", 1, "p-button-rounded", "p-button-danger", "p-button-text", "p-button-sm", 3, "click"], ["colspan", "6", 1, "text-center", "p-4", "text-muted"]], template: function SutramDictionaryViewComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div")(3, "h5", 2);
            i0.ɵɵtext(4, "\u0921\u093F\u0915\u094D\u0936\u0928\u0930\u0940 \u092E\u0947\u092E\u094B\u0930\u0940 (Correction Memory)");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "small", 3);
            i0.ɵɵtext(6, "\u092F\u0939\u093E\u0901 \u0938\u0939\u0947\u091C\u0947 \u0917\u090F \u090F\u0932\u093F\u092F\u093E\u0938 \u0914\u0930 \u0915\u0930\u0947\u0915\u094D\u0936\u0928 \u0928\u093F\u092F\u092E \u0938\u094D\u0935\u0924\u0903 \u0939\u0930 Excel \u0907\u092E\u094D\u092A\u094B\u0930\u094D\u091F \u092E\u0947\u0902 \u0932\u093E\u0917\u0942 \u0939\u094B\u0924\u0947 \u0939\u0948\u0902\u0964");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(7, "div", 4)(8, "input", 5);
            i0.ɵɵlistener("ngModelChange", function SutramDictionaryViewComponent_Template_input_ngModelChange_8_listener($event) { return ctx.searchQuery = $event; });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "button", 6);
            i0.ɵɵlistener("click", function SutramDictionaryViewComponent_Template_button_click_9_listener() { return ctx.loadEntries(); });
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(10, "p-table", 7);
            i0.ɵɵtemplate(11, SutramDictionaryViewComponent_ng_template_11_Template, 13, 0, "ng-template", 8);
            i0.ɵɵtemplate(12, SutramDictionaryViewComponent_ng_template_12_Template, 17, 5, "ng-template", 9);
            i0.ɵɵtemplate(13, SutramDictionaryViewComponent_ng_template_13_Template, 3, 0, "ng-template", 10);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(8);
            i0.ɵɵproperty("ngModel", ctx.searchQuery);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("loading", ctx.isLoading);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("value", ctx.entries)("loading", ctx.isLoading)("paginator", true)("rows", 15);
        } }, dependencies: [i2.DefaultValueAccessor, i2.NgControlStatus, i2.NgModel, i3.Table, i4.PrimeTemplate, i5.ButtonDirective, i6.InputText], styles: [".sutram-dictionary-container[_ngcontent-%COMP%] {\n  border-radius: 8px;\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramDictionaryViewComponent, [{
        type: Component,
        args: [{ selector: 'sutram-dictionary-view', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-dictionary-view.component.html -->\n<div class=\"sutram-dictionary-container card p-3 border shadow-sm\">\n\n  <div class=\"d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2\">\n    <div>\n      <h5 class=\"m-0 fw-bold\">\u0921\u093F\u0915\u094D\u0936\u0928\u0930\u0940 \u092E\u0947\u092E\u094B\u0930\u0940 (Correction Memory)</h5>\n      <small class=\"text-muted\">\u092F\u0939\u093E\u0901 \u0938\u0939\u0947\u091C\u0947 \u0917\u090F \u090F\u0932\u093F\u092F\u093E\u0938 \u0914\u0930 \u0915\u0930\u0947\u0915\u094D\u0936\u0928 \u0928\u093F\u092F\u092E \u0938\u094D\u0935\u0924\u0903 \u0939\u0930 Excel \u0907\u092E\u094D\u092A\u094B\u0930\u094D\u091F \u092E\u0947\u0902 \u0932\u093E\u0917\u0942 \u0939\u094B\u0924\u0947 \u0939\u0948\u0902\u0964</small>\n    </div>\n\n    <div class=\"d-flex gap-2\">\n      <input type=\"text\"\n             pInputText\n             class=\"p-inputtext-sm\"\n             placeholder=\"\u0916\u094B\u091C\u0947\u0902 (Search)...\"\n             [(ngModel)]=\"searchQuery\" />\n\n      <button pButton\n              icon=\"pi pi-refresh\"\n              class=\"p-button-outlined p-button-sm\"\n              [loading]=\"isLoading\"\n              (click)=\"loadEntries()\"\n              title=\"\u0930\u0940\u0932\u094B\u0921 \u0915\u0930\u0947\u0902\">\n      </button>\n    </div>\n  </div>\n\n  <!-- PrimeNG Table for Dictionary Entries -->\n  <p-table [value]=\"entries\"\n           [loading]=\"isLoading\"\n           [paginator]=\"true\"\n           [rows]=\"15\"\n           styleClass=\"p-datatable-sm p-datatable-gridlines\">\n\n    <ng-template pTemplate=\"header\">\n      <tr>\n        <th style=\"width: 80px;\">ID</th>\n        <th>\u092A\u094D\u0930\u0915\u093E\u0930 (Type)</th>\n        <th>\u0905\u091C\u094D\u091E\u093E\u0924 \u0928\u093E\u092E (Unknown Name)</th>\n        <th>\u091F\u093E\u0930\u0917\u0947\u091F ID (Target Ref ID)</th>\n        <th>\u0928\u094B\u091F</th>\n        <th style=\"width: 90px; text-align: center;\">\u090F\u0915\u094D\u0936\u0928</th>\n      </tr>\n    </ng-template>\n\n    <ng-template pTemplate=\"body\" let-item>\n      <tr>\n        <td>{{ item._id }}</td>\n        <td>\n          <span class=\"badge bg-soft-primary text-primary\">{{ item.type }}</span>\n        </td>\n        <td>\n          <strong class=\"text-danger\">\"{{ item.name }}\"</strong>\n        </td>\n        <td>\n          <span class=\"badge bg-soft-success text-success fs-6\">{{ item.ref_id }}</span>\n        </td>\n        <td>\n          <small class=\"text-muted\">{{ item.extra_note || '-' }}</small>\n        </td>\n        <td class=\"text-center\">\n          <button pButton\n                  icon=\"pi pi-trash\"\n                  class=\"p-button-rounded p-button-danger p-button-text p-button-sm\"\n                  (click)=\"deleteEntry(item._id)\"\n                  title=\"\u0939\u091F\u093E\u090F\u0902\">\n          </button>\n        </td>\n      </tr>\n    </ng-template>\n\n    <ng-template pTemplate=\"emptymessage\">\n      <tr>\n        <td colspan=\"6\" class=\"text-center p-4 text-muted\">\n          \u0915\u094B\u0908 \u0921\u093F\u0915\u094D\u0936\u0928\u0930\u0940 \u0928\u093F\u092F\u092E \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964\n        </td>\n      </tr>\n    </ng-template>\n\n  </p-table>\n\n</div>\n", styles: [".sutram-dictionary-container {\n  border-radius: 8px;\n}\n"] }]
    }], function () { return [{ type: i1.SutramExcelApiService }, { type: i0.ChangeDetectorRef }]; }, null); })();
