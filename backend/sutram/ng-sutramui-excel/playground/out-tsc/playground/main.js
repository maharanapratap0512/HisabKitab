import 'zone.js';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { SutramExcelModule } from '../src/lib/sutram-excel.module';
import * as i0 from "@angular/core";
import * as i1 from "../src/lib/components/sutram-excel-studio/sutram-excel-studio.component";
export class PlaygroundAppComponent {
    static ɵfac = function PlaygroundAppComponent_Factory(t) { return new (t || PlaygroundAppComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PlaygroundAppComponent, selectors: [["app-root"]], decls: 1, vars: 2, consts: [[3, "table", "apiBase"]], template: function PlaygroundAppComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "sutram-excel-studio", 0);
        } if (rf & 2) {
            i0.ɵɵproperty("table", "item")("apiBase", "/_sutram/excel");
        } }, dependencies: [i1.SutramExcelStudioComponent], styles: ["[_nghost-%COMP%] {\n      display: block;\n      width: 100vw;\n      height: 100vh;\n      overflow: hidden;\n    }"] });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PlaygroundAppComponent, [{
        type: Component,
        args: [{ selector: 'app-root', template: `
    <sutram-excel-studio 
      [table]="'item'" 
      [apiBase]="'/_sutram/excel'">
    </sutram-excel-studio>
  `, styles: ["\n    :host {\n      display: block;\n      width: 100vw;\n      height: 100vh;\n      overflow: hidden;\n    }\n  "] }]
    }], null, null); })();
export class PlaygroundAppModule {
    static ɵfac = function PlaygroundAppModule_Factory(t) { return new (t || PlaygroundAppModule)(); };
    static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: PlaygroundAppModule, bootstrap: [PlaygroundAppComponent] });
    static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [BrowserModule,
            BrowserAnimationsModule,
            HttpClientModule,
            SutramExcelModule] });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PlaygroundAppModule, [{
        type: NgModule,
        args: [{
                declarations: [PlaygroundAppComponent],
                imports: [
                    BrowserModule,
                    BrowserAnimationsModule,
                    HttpClientModule,
                    SutramExcelModule
                ],
                bootstrap: [PlaygroundAppComponent]
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(PlaygroundAppModule, { declarations: [PlaygroundAppComponent], imports: [BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        SutramExcelModule] }); })();
platformBrowserDynamic().bootstrapModule(PlaygroundAppModule)
    .catch(err => console.error(err));
