/**
 * sutram-import-progress.component.ts
 * ─────────────────────────────────────────────────────────────
 * Streaming Import Progress Dialog using PrimeNG p-dialog and p-progressBar.
 * Displays live row-by-row status and activates Error Report download
 * when rejected rows exist.
 * ─────────────────────────────────────────────────────────────
 */
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../services/sutram-excel-api.service";
import * as i2 from "@angular/common";
import * as i3 from "primeng/api";
import * as i4 from "primeng/button";
import * as i5 from "primeng/dialog";
import * as i6 from "primeng/progressbar";
function SutramImportProgressComponent_div_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 20)(1, "div", 14)(2, "small", 9);
    i0.ɵɵtext(3, "Deleted");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "strong", 15);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.progress.deleted);
} }
function SutramImportProgressComponent_div_35_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 21)(1, "div", 22)(2, "div")(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "small", 23);
    i0.ɵɵtext(6, "\u0924\u094D\u0930\u0941\u091F\u093F \u0935\u093F\u0935\u0930\u0923 \u0915\u0947 \u0938\u093E\u0925 Excel \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "button", 24);
    i0.ɵɵlistener("click", function SutramImportProgressComponent_div_35_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r4); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.downloadErrorReport()); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("", ctx_r1.progress.rejected, " \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u093E\u0901 \u0930\u093F\u091C\u0947\u0915\u094D\u091F \u0939\u0941\u0908\u0902!");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("loading", ctx_r1.isDownloadingReport);
} }
function SutramImportProgressComponent_ng_template_36_button_1_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 28);
    i0.ɵɵlistener("click", function SutramImportProgressComponent_ng_template_36_button_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r8); const ctx_r7 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r7.cancelRequested.emit()); });
    i0.ɵɵelementEnd();
} }
function SutramImportProgressComponent_ng_template_36_button_2_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 29);
    i0.ɵɵlistener("click", function SutramImportProgressComponent_ng_template_36_button_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r9 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r9.close()); });
    i0.ɵɵelementEnd();
} }
function SutramImportProgressComponent_ng_template_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 25);
    i0.ɵɵtemplate(1, SutramImportProgressComponent_ng_template_36_button_1_Template, 1, 0, "button", 26);
    i0.ɵɵtemplate(2, SutramImportProgressComponent_ng_template_36_button_2_Template, 1, 0, "button", 27);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", ctx_r2.progress.isActive);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("ngIf", !ctx_r2.progress.isActive);
} }
const _c0 = function () { return { width: "520px", maxWidth: "95vw" }; };
export class SutramImportProgressComponent {
    api;
    visible = false;
    progress = {
        current: 0,
        total: 0,
        percentage: 0,
        inserted: 0,
        updated: 0,
        duplicate: 0,
        rejected: 0,
        isActive: false
    };
    tableName = '';
    rejectedRows = [];
    visibleChange = new EventEmitter();
    cancelRequested = new EventEmitter();
    isDownloadingReport = false;
    constructor(api) {
        this.api = api;
    }
    downloadErrorReport() {
        if (!this.rejectedRows || this.rejectedRows.length === 0)
            return;
        this.isDownloadingReport = true;
        this.api.downloadErrorReport(this.tableName, this.rejectedRows).subscribe({
            next: (blob) => {
                this.isDownloadingReport = false;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rejected_${this.tableName}_${Date.now()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            },
            error: (err) => {
                this.isDownloadingReport = false;
                console.error('[SutramImportProgress] Error report download failed:', err);
            }
        });
    }
    close() {
        this.visible = false;
        this.visibleChange.emit(false);
    }
    static ɵfac = function SutramImportProgressComponent_Factory(t) { return new (t || SutramImportProgressComponent)(i0.ɵɵdirectiveInject(i1.SutramExcelApiService)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SutramImportProgressComponent, selectors: [["sutram-import-progress"]], inputs: { visible: "visible", progress: "progress", tableName: "tableName", rejectedRows: "rejectedRows" }, outputs: { visibleChange: "visibleChange", cancelRequested: "cancelRequested" }, decls: 37, vars: 25, consts: [["header", "\u0907\u092E\u094D\u092A\u094B\u0930\u094D\u091F \u092A\u094D\u0930\u0917\u0924\u093F (Import Progress)", 3, "visible", "modal", "closable", "visibleChange"], [1, "py-3", "text-center"], [1, "mb-3", "px-2"], [1, "d-flex", "justify-content-between", "mb-1"], [1, "small", "fw-bold"], [1, "small", "fw-bold", "text-primary"], ["styleClass", "sutram-progress", 3, "value", "showValue"], [1, "row", "g-2", "mb-3"], [1, "card", "p-2", "bg-soft-success", "border", "border-success"], [1, "text-muted", "d-block", 2, "font-size", "11px"], [1, "fs-5", "text-success"], [1, "card", "p-2", "bg-soft-primary", "border", "border-primary"], [1, "fs-5", "text-primary"], ["class", "col", 4, "ngIf"], [1, "card", "p-2", "bg-soft-warning", "border", "border-warning"], [1, "fs-5", "text-warning"], [1, "card", "p-2", "bg-soft-danger", "border", "border-danger"], [1, "fs-5", "text-danger"], ["class", "alert alert-danger p-2 text-start mb-2", 4, "ngIf"], ["pTemplate", "footer"], [1, "col"], [1, "alert", "alert-danger", "p-2", "text-start", "mb-2"], [1, "d-flex", "align-items-center", "justify-content-between"], [1, "d-block", "text-muted"], ["pButton", "", "label", "Error Report (.xlsx)", "icon", "pi pi-download", 1, "p-button-sm", "p-button-danger", 3, "loading", "click"], [1, "d-flex", "justify-content-end", "gap-2"], ["pButton", "", "label", "\u0930\u094B\u0915\u0947\u0902 (Cancel)", "class", "p-button-outlined p-button-danger", 3, "click", 4, "ngIf"], ["pButton", "", "label", "\u0938\u092E\u093E\u092A\u094D\u0924 (Done)", "class", "p-button-primary", 3, "click", 4, "ngIf"], ["pButton", "", "label", "\u0930\u094B\u0915\u0947\u0902 (Cancel)", 1, "p-button-outlined", "p-button-danger", 3, "click"], ["pButton", "", "label", "\u0938\u092E\u093E\u092A\u094D\u0924 (Done)", 1, "p-button-primary", 3, "click"]], template: function SutramImportProgressComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "p-dialog", 0);
            i0.ɵɵlistener("visibleChange", function SutramImportProgressComponent_Template_p_dialog_visibleChange_0_listener($event) { return ctx.visible = $event; });
            i0.ɵɵelementStart(1, "div", 1)(2, "div", 2)(3, "div", 3)(4, "span", 4);
            i0.ɵɵtext(5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "span", 5);
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd()();
            i0.ɵɵelement(8, "p-progressBar", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "div", 7)(10, "div")(11, "div", 8)(12, "small", 9);
            i0.ɵɵtext(13, "Inserted");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "strong", 10);
            i0.ɵɵtext(15);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(16, "div")(17, "div", 11)(18, "small", 9);
            i0.ɵɵtext(19, "Updated");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "strong", 12);
            i0.ɵɵtext(21);
            i0.ɵɵelementEnd()()();
            i0.ɵɵtemplate(22, SutramImportProgressComponent_div_22_Template, 6, 1, "div", 13);
            i0.ɵɵelementStart(23, "div")(24, "div", 14)(25, "small", 9);
            i0.ɵɵtext(26, "Duplicate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "strong", 15);
            i0.ɵɵtext(28);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(29, "div")(30, "div", 16)(31, "small", 9);
            i0.ɵɵtext(32, "Rejected");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "strong", 17);
            i0.ɵɵtext(34);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵtemplate(35, SutramImportProgressComponent_div_35_Template, 8, 2, "div", 18);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(36, SutramImportProgressComponent_ng_template_36_Template, 3, 2, "ng-template", 19);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵstyleMap(i0.ɵɵpureFunction0(24, _c0));
            i0.ɵɵproperty("visible", ctx.visible)("modal", true)("closable", !ctx.progress.isActive);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate2("", ctx.progress.current, " / ", ctx.progress.total, " \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u093E\u0901 \u092A\u094D\u0930\u0938\u0902\u0938\u094D\u0915\u0943\u0924");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("", ctx.progress.percentage, "%");
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("value", ctx.progress.percentage)("showValue", false);
            i0.ɵɵadvance(2);
            i0.ɵɵclassMap((ctx.progress.deleted || 0) > 0 ? "col" : "col-3");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.progress.inserted);
            i0.ɵɵadvance(1);
            i0.ɵɵclassMap((ctx.progress.deleted || 0) > 0 ? "col" : "col-3");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.progress.updated);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", (ctx.progress.deleted || 0) > 0);
            i0.ɵɵadvance(1);
            i0.ɵɵclassMap((ctx.progress.deleted || 0) > 0 ? "col" : "col-3");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.progress.duplicate);
            i0.ɵɵadvance(1);
            i0.ɵɵclassMap((ctx.progress.deleted || 0) > 0 ? "col" : "col-3");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.progress.rejected);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngIf", ctx.progress.rejected > 0 && !ctx.progress.isActive);
        } }, dependencies: [i2.NgIf, i3.PrimeTemplate, i4.ButtonDirective, i5.Dialog, i6.ProgressBar], styles: [".sutram-progress[_ngcontent-%COMP%] {\n  height: 12px;\n  border-radius: 6px;\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramImportProgressComponent, [{
        type: Component,
        args: [{ selector: 'sutram-import-progress', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-import-progress.component.html -->\n<p-dialog [(visible)]=\"visible\"\n          [modal]=\"true\"\n          [style]=\"{ width: '520px', maxWidth: '95vw' }\"\n          [closable]=\"!progress.isActive\"\n          header=\"\u0907\u092E\u094D\u092A\u094B\u0930\u094D\u091F \u092A\u094D\u0930\u0917\u0924\u093F (Import Progress)\">\n\n  <div class=\"py-3 text-center\">\n\n    <!-- Progress Bar -->\n    <div class=\"mb-3 px-2\">\n      <div class=\"d-flex justify-content-between mb-1\">\n        <span class=\"small fw-bold\">{{ progress.current }} / {{ progress.total }} \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u093E\u0901 \u092A\u094D\u0930\u0938\u0902\u0938\u094D\u0915\u0943\u0924</span>\n        <span class=\"small fw-bold text-primary\">{{ progress.percentage }}%</span>\n      </div>\n      <p-progressBar [value]=\"progress.percentage\" [showValue]=\"false\" styleClass=\"sutram-progress\"></p-progressBar>\n    </div>\n\n    <!-- Live Status Counters Grid -->\n    <div class=\"row g-2 mb-3\">\n      <div [class]=\"(progress.deleted || 0) > 0 ? 'col' : 'col-3'\">\n        <div class=\"card p-2 bg-soft-success border border-success\">\n          <small class=\"text-muted d-block\" style=\"font-size: 11px;\">Inserted</small>\n          <strong class=\"fs-5 text-success\">{{ progress.inserted }}</strong>\n        </div>\n      </div>\n      <div [class]=\"(progress.deleted || 0) > 0 ? 'col' : 'col-3'\">\n        <div class=\"card p-2 bg-soft-primary border border-primary\">\n          <small class=\"text-muted d-block\" style=\"font-size: 11px;\">Updated</small>\n          <strong class=\"fs-5 text-primary\">{{ progress.updated }}</strong>\n        </div>\n      </div>\n      <div *ngIf=\"(progress.deleted || 0) > 0\" class=\"col\">\n        <div class=\"card p-2 bg-soft-warning border border-warning\">\n          <small class=\"text-muted d-block\" style=\"font-size: 11px;\">Deleted</small>\n          <strong class=\"fs-5 text-warning\">{{ progress.deleted }}</strong>\n        </div>\n      </div>\n      <div [class]=\"(progress.deleted || 0) > 0 ? 'col' : 'col-3'\">\n        <div class=\"card p-2 bg-soft-warning border border-warning\">\n          <small class=\"text-muted d-block\" style=\"font-size: 11px;\">Duplicate</small>\n          <strong class=\"fs-5 text-warning\">{{ progress.duplicate }}</strong>\n        </div>\n      </div>\n      <div [class]=\"(progress.deleted || 0) > 0 ? 'col' : 'col-3'\">\n        <div class=\"card p-2 bg-soft-danger border border-danger\">\n          <small class=\"text-muted d-block\" style=\"font-size: 11px;\">Rejected</small>\n          <strong class=\"fs-5 text-danger\">{{ progress.rejected }}</strong>\n        </div>\n      </div>\n    </div>\n\n    <!-- Error Report Download Action if rejected rows exist -->\n    <div *ngIf=\"progress.rejected > 0 && !progress.isActive\" class=\"alert alert-danger p-2 text-start mb-2\">\n      <div class=\"d-flex align-items-center justify-content-between\">\n        <div>\n          <strong>{{ progress.rejected }} \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u093E\u0901 \u0930\u093F\u091C\u0947\u0915\u094D\u091F \u0939\u0941\u0908\u0902!</strong>\n          <small class=\"d-block text-muted\">\u0924\u094D\u0930\u0941\u091F\u093F \u0935\u093F\u0935\u0930\u0923 \u0915\u0947 \u0938\u093E\u0925 Excel \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902</small>\n        </div>\n        <button pButton\n                label=\"Error Report (.xlsx)\"\n                icon=\"pi pi-download\"\n                class=\"p-button-sm p-button-danger\"\n                [loading]=\"isDownloadingReport\"\n                (click)=\"downloadErrorReport()\">\n        </button>\n      </div>\n    </div>\n\n  </div>\n\n  <ng-template pTemplate=\"footer\">\n    <div class=\"d-flex justify-content-end gap-2\">\n      <button *ngIf=\"progress.isActive\"\n              pButton\n              label=\"\u0930\u094B\u0915\u0947\u0902 (Cancel)\"\n              class=\"p-button-outlined p-button-danger\"\n              (click)=\"cancelRequested.emit()\">\n      </button>\n      <button *ngIf=\"!progress.isActive\"\n              pButton\n              label=\"\u0938\u092E\u093E\u092A\u094D\u0924 (Done)\"\n              class=\"p-button-primary\"\n              (click)=\"close()\">\n      </button>\n    </div>\n  </ng-template>\n\n</p-dialog>\n", styles: [".sutram-progress {\n  height: 12px;\n  border-radius: 6px;\n}\n"] }]
    }], function () { return [{ type: i1.SutramExcelApiService }]; }, { visible: [{
            type: Input
        }], progress: [{
            type: Input
        }], tableName: [{
            type: Input
        }], rejectedRows: [{
            type: Input
        }], visibleChange: [{
            type: Output
        }], cancelRequested: [{
            type: Output
        }] }); })();
