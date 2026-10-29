/**
 * sutram-correction-sidebar.component.ts
 * ─────────────────────────────────────────────────────────────
 * Collapsible Batch Correction Sidebar using PrimeNG p-sidebar.
 * Displays grouped unmatched values from verify API, allowing batch
 * resolution and one-click saving to xls_dictionary.
 * ─────────────────────────────────────────────────────────────
 */
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../services/sutram-excel-state.service";
import * as i2 from "../../services/sutram-excel-api.service";
import * as i3 from "@angular/common";
import * as i4 from "@angular/forms";
import * as i5 from "primeng/api";
import * as i6 from "primeng/button";
import * as i7 from "primeng/sidebar";
function SutramCorrectionSidebarComponent_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵelement(1, "i", 7);
    i0.ɵɵelementStart(2, "h6", 8);
    i0.ɵɵtext(3, "\u0938\u0941\u0927\u093E\u0930 \u092A\u0948\u0928\u0932 (Corrections)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 9);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("", ctx_r0.groups.length, " \u0905\u0928\u0938\u0941\u0932\u091D\u0947");
} }
function SutramCorrectionSidebarComponent_div_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10);
    i0.ɵɵelement(1, "i", 11);
    i0.ɵɵelementStart(2, "strong");
    i0.ɵɵtext(3, "\u092C\u0927\u093E\u0908! \u0915\u094B\u0908 \u0917\u0932\u0924\u0940 \u0936\u0947\u0937 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964");
    i0.ɵɵelementEnd()();
} }
function SutramCorrectionSidebarComponent_div_6_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12)(1, "div", 13)(2, "div", 14)(3, "span", 15);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "small", 16);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 17)(8, "small", 18);
    i0.ɵɵtext(9, "\u092B\u093C\u093E\u0907\u0932 \u092E\u0947\u0902 \u0932\u093F\u0916\u093E \u092E\u093E\u0928 (Unknown Value):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "strong", 19);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 20)(13, "label", 21);
    i0.ɵɵtext(14, "\u0938\u0939\u0940 \u092E\u093E\u0928 \u091A\u0941\u0928\u0947\u0902 (Replace with):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "input", 22);
    i0.ɵɵlistener("ngModelChange", function SutramCorrectionSidebarComponent_div_6_Template_input_ngModelChange_15_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r5); const grp_r3 = restoredCtx.$implicit; return i0.ɵɵresetView(grp_r3.resolvedDisplay = $event); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 23)(17, "input", 24);
    i0.ɵɵlistener("ngModelChange", function SutramCorrectionSidebarComponent_div_6_Template_input_ngModelChange_17_listener($event) { const restoredCtx = i0.ɵɵrestoreView(_r5); const grp_r3 = restoredCtx.$implicit; return i0.ɵɵresetView(grp_r3.saveToDictionary = $event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "label", 25);
    i0.ɵɵtext(19, " \u0921\u093F\u0915\u094D\u0936\u0928\u0930\u0940 \u092E\u0947\u0902 \u0938\u0947\u0935 \u0915\u0930\u0947\u0902 (\u092D\u0935\u093F\u0937\u094D\u092F \u0915\u0947 \u0932\u093F\u090F \u092F\u093E\u0926 \u0930\u0916\u0947\u0902) ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "button", 26);
    i0.ɵɵlistener("click", function SutramCorrectionSidebarComponent_div_6_Template_button_click_20_listener() { const restoredCtx = i0.ɵɵrestoreView(_r5); const grp_r3 = restoredCtx.$implicit; const ctx_r7 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r7.resolveGroup(grp_r3, grp_r3.resolvedDisplay, grp_r3.resolvedId)); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const grp_r3 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(grp_r3.type);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", grp_r3.occurrences, " \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u094B\u0902 \u092E\u0947\u0902 \u092E\u093F\u0932\u093E");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("\"", grp_r3.name, "\"");
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngModel", grp_r3.resolvedDisplay);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "dict_" + grp_r3.groupKey)("ngModel", grp_r3.saveToDictionary);
    i0.ɵɵadvance(1);
    i0.ɵɵproperty("for", "dict_" + grp_r3.groupKey);
    i0.ɵɵadvance(2);
    i0.ɵɵpropertyInterpolate1("label", "\u0938\u092D\u0940 ", grp_r3.occurrences, " \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u093E\u0901 \u092C\u0926\u0932\u0947\u0902");
    i0.ɵɵproperty("disabled", !grp_r3.resolvedDisplay);
} }
const _c0 = function () { return { width: "420px", maxWidth: "90vw" }; };
export class SutramCorrectionSidebarComponent {
    state;
    api;
    visible = false;
    groups = [];
    visibleChange = new EventEmitter();
    resolved = new EventEmitter();
    constructor(state, api) {
        this.state = state;
        this.api = api;
    }
    resolveGroup(group, newDisplay, newId) {
        if (!newDisplay)
            return;
        // Apply batch correction to grid
        this.state.applyBatchCorrection(group.type, group.name, newDisplay, newId);
        // If Save to Dictionary checked, call backend API
        if (group.saveToDictionary) {
            this.api.addDictionaryEntry({
                type: group.type,
                name: group.name,
                ref_id: newId !== undefined ? newId : newDisplay
            }).subscribe({
                next: () => console.log(`[SutramCorrection] Saved to dictionary: ${group.name} -> ${newDisplay}`),
                error: (err) => console.error('[SutramCorrection] Dictionary save failed:', err)
            });
        }
        group.isResolved = true;
        this.resolved.emit({ group, newDisplay, newId });
    }
    close() {
        this.visible = false;
        this.visibleChange.emit(false);
    }
    static ɵfac = function SutramCorrectionSidebarComponent_Factory(t) { return new (t || SutramCorrectionSidebarComponent)(i0.ɵɵdirectiveInject(i1.SutramExcelStateService), i0.ɵɵdirectiveInject(i2.SutramExcelApiService)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SutramCorrectionSidebarComponent, selectors: [["sutram-correction-sidebar"]], inputs: { visible: "visible", groups: "groups" }, outputs: { visibleChange: "visibleChange", resolved: "resolved" }, decls: 7, vars: 6, consts: [["position", "right", 3, "visible", "visibleChange", "onHide"], ["pTemplate", "header"], [1, "sidebar-body", "py-2"], [1, "text-muted", "small", "mb-3"], ["class", "text-center py-5 text-muted", 4, "ngIf"], ["class", "correction-card card mb-3 border shadow-sm", 4, "ngFor", "ngForOf"], [1, "d-flex", "align-items-center", "gap-2"], [1, "pi", "pi-bolt", "text-warning", "fs-5"], [1, "m-0", "fw-bold"], [1, "badge", "bg-danger", "ms-auto"], [1, "text-center", "py-5", "text-muted"], [1, "pi", "pi-check-circle", "text-success", "fs-1", "mb-2", "d-block"], [1, "correction-card", "card", "mb-3", "border", "shadow-sm"], [1, "card-body", "p-3"], [1, "d-flex", "align-items-center", "justify-content-between", "mb-2"], [1, "badge", "bg-soft-primary", "text-primary", "text-uppercase"], [1, "text-danger", "fw-bold"], [1, "unknown-value-box", "bg-light", "rounded", "p-2", "mb-2"], [1, "text-muted", "d-block"], [1, "text-danger", "fs-6"], [1, "mb-2"], [1, "form-label", "small", "fw-bold"], ["type", "text", "placeholder", "\u0938\u0939\u0940 \u092E\u093E\u0928 \u092F\u0939\u093E\u0901 \u0932\u093F\u0916\u0947\u0902...", 1, "form-control", "form-control-sm", 3, "ngModel", "ngModelChange"], [1, "form-check", "mb-3"], ["type", "checkbox", 1, "form-check-input", 3, "id", "ngModel", "ngModelChange"], [1, "form-check-label", "small", 3, "for"], ["pButton", "", "icon", "pi pi-check", 1, "p-button-sm", "p-button-success", "w-100", 3, "label", "disabled", "click"]], template: function SutramCorrectionSidebarComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "p-sidebar", 0);
            i0.ɵɵlistener("visibleChange", function SutramCorrectionSidebarComponent_Template_p_sidebar_visibleChange_0_listener($event) { return ctx.visible = $event; })("onHide", function SutramCorrectionSidebarComponent_Template_p_sidebar_onHide_0_listener() { return ctx.close(); });
            i0.ɵɵtemplate(1, SutramCorrectionSidebarComponent_ng_template_1_Template, 6, 1, "ng-template", 1);
            i0.ɵɵelementStart(2, "div", 2)(3, "p", 3);
            i0.ɵɵtext(4, " \u0928\u0940\u091A\u0947 \u0926\u0940 \u0917\u0908 \u0905\u091C\u094D\u091E\u093E\u0924 \u0935\u0948\u0932\u094D\u092F\u0942\u091C \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0938\u0947 \u092E\u0947\u0932 \u0928\u0939\u0940\u0902 \u0916\u093E\u0924\u0940 \u0939\u0948\u0902\u0964 \u092F\u0939\u093E\u0901 \u0938\u0939\u0940 \u092E\u093E\u0928 \u091A\u0941\u0928\u0915\u0930 \u0938\u092D\u0940 \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u094B\u0902 \u092E\u0947\u0902 \u090F\u0915 \u0938\u093E\u0925 \u0938\u0941\u0927\u093E\u0930\u0947\u0902\u0964 ");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(5, SutramCorrectionSidebarComponent_div_5_Template, 4, 0, "div", 4);
            i0.ɵɵtemplate(6, SutramCorrectionSidebarComponent_div_6_Template, 21, 9, "div", 5);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵstyleMap(i0.ɵɵpureFunction0(5, _c0));
            i0.ɵɵproperty("visible", ctx.visible);
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("ngIf", ctx.groups.length === 0);
            i0.ɵɵadvance(1);
            i0.ɵɵproperty("ngForOf", ctx.groups);
        } }, dependencies: [i3.NgForOf, i3.NgIf, i4.DefaultValueAccessor, i4.CheckboxControlValueAccessor, i4.NgControlStatus, i4.NgModel, i5.PrimeTemplate, i6.ButtonDirective, i7.Sidebar], styles: [".correction-card[_ngcontent-%COMP%] {\n  border-radius: 8px;\n  transition: all 0.2s ease-in-out;\n\n  &:hover {\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);\n  }\n}"], changeDetection: 0 });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramCorrectionSidebarComponent, [{
        type: Component,
        args: [{ selector: 'sutram-correction-sidebar', changeDetection: ChangeDetectionStrategy.OnPush, template: "<!-- sutram-correction-sidebar.component.html -->\n<p-sidebar [(visible)]=\"visible\"\n           position=\"right\"\n           [style]=\"{ width: '420px', maxWidth: '90vw' }\"\n           (onHide)=\"close()\">\n\n  <ng-template pTemplate=\"header\">\n    <div class=\"d-flex align-items-center gap-2\">\n      <i class=\"pi pi-bolt text-warning fs-5\"></i>\n      <h6 class=\"m-0 fw-bold\">\u0938\u0941\u0927\u093E\u0930 \u092A\u0948\u0928\u0932 (Corrections)</h6>\n      <span class=\"badge bg-danger ms-auto\">{{ groups.length }} \u0905\u0928\u0938\u0941\u0932\u091D\u0947</span>\n    </div>\n  </ng-template>\n\n  <div class=\"sidebar-body py-2\">\n    <p class=\"text-muted small mb-3\">\n      \u0928\u0940\u091A\u0947 \u0926\u0940 \u0917\u0908 \u0905\u091C\u094D\u091E\u093E\u0924 \u0935\u0948\u0932\u094D\u092F\u0942\u091C \u0921\u0947\u091F\u093E\u092C\u0947\u0938 \u0938\u0947 \u092E\u0947\u0932 \u0928\u0939\u0940\u0902 \u0916\u093E\u0924\u0940 \u0939\u0948\u0902\u0964 \u092F\u0939\u093E\u0901 \u0938\u0939\u0940 \u092E\u093E\u0928 \u091A\u0941\u0928\u0915\u0930 \u0938\u092D\u0940 \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u094B\u0902 \u092E\u0947\u0902 \u090F\u0915 \u0938\u093E\u0925 \u0938\u0941\u0927\u093E\u0930\u0947\u0902\u0964\n    </p>\n\n    <!-- List of Groups -->\n    <div *ngIf=\"groups.length === 0\" class=\"text-center py-5 text-muted\">\n      <i class=\"pi pi-check-circle text-success fs-1 mb-2 d-block\"></i>\n      <strong>\u092C\u0927\u093E\u0908! \u0915\u094B\u0908 \u0917\u0932\u0924\u0940 \u0936\u0947\u0937 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964</strong>\n    </div>\n\n    <div *ngFor=\"let grp of groups\" class=\"correction-card card mb-3 border shadow-sm\">\n      <div class=\"card-body p-3\">\n        <div class=\"d-flex align-items-center justify-content-between mb-2\">\n          <span class=\"badge bg-soft-primary text-primary text-uppercase\">{{ grp.type }}</span>\n          <small class=\"text-danger fw-bold\">{{ grp.occurrences }} \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u094B\u0902 \u092E\u0947\u0902 \u092E\u093F\u0932\u093E</small>\n        </div>\n\n        <div class=\"unknown-value-box bg-light rounded p-2 mb-2\">\n          <small class=\"text-muted d-block\">\u092B\u093C\u093E\u0907\u0932 \u092E\u0947\u0902 \u0932\u093F\u0916\u093E \u092E\u093E\u0928 (Unknown Value):</small>\n          <strong class=\"text-danger fs-6\">\"{{ grp.name }}\"</strong>\n        </div>\n\n        <div class=\"mb-2\">\n          <label class=\"form-label small fw-bold\">\u0938\u0939\u0940 \u092E\u093E\u0928 \u091A\u0941\u0928\u0947\u0902 (Replace with):</label>\n          <input type=\"text\"\n                 class=\"form-control form-control-sm\"\n                 placeholder=\"\u0938\u0939\u0940 \u092E\u093E\u0928 \u092F\u0939\u093E\u0901 \u0932\u093F\u0916\u0947\u0902...\"\n                 [(ngModel)]=\"grp.resolvedDisplay\">\n        </div>\n\n        <div class=\"form-check mb-3\">\n          <input class=\"form-check-input\"\n                 type=\"checkbox\"\n                 [id]=\"'dict_' + grp.groupKey\"\n                 [(ngModel)]=\"grp.saveToDictionary\">\n          <label class=\"form-check-label small\" [for]=\"'dict_' + grp.groupKey\">\n            \u0921\u093F\u0915\u094D\u0936\u0928\u0930\u0940 \u092E\u0947\u0902 \u0938\u0947\u0935 \u0915\u0930\u0947\u0902 (\u092D\u0935\u093F\u0937\u094D\u092F \u0915\u0947 \u0932\u093F\u090F \u092F\u093E\u0926 \u0930\u0916\u0947\u0902)\n          </label>\n        </div>\n\n        <button pButton\n                label=\"\u0938\u092D\u0940 {{ grp.occurrences }} \u092A\u0902\u0915\u094D\u0924\u093F\u092F\u093E\u0901 \u092C\u0926\u0932\u0947\u0902\"\n                icon=\"pi pi-check\"\n                class=\"p-button-sm p-button-success w-100\"\n                [disabled]=\"!grp.resolvedDisplay\"\n                (click)=\"resolveGroup(grp, grp.resolvedDisplay, grp.resolvedId)\">\n        </button>\n      </div>\n    </div>\n\n  </div>\n\n</p-sidebar>\n", styles: [".correction-card {\n  border-radius: 8px;\n  transition: all 0.2s ease-in-out;\n\n  &:hover {\n    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);\n  }\n}\n"] }]
    }], function () { return [{ type: i1.SutramExcelStateService }, { type: i2.SutramExcelApiService }]; }, { visible: [{
            type: Input
        }], groups: [{
            type: Input
        }], visibleChange: [{
            type: Output
        }], resolved: [{
            type: Output
        }] }); })();
