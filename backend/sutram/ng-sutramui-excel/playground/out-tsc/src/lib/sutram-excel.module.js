/**
 * sutram-excel.module.ts
 * ─────────────────────────────────────────────────────────────
 * Angular Module packaging all ng-sutramui-excel components,
 * PrimeNG integrations, and services.
 * ─────────────────────────────────────────────────────────────
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// PrimeNG UI Modules
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';
import { ProgressBarModule } from 'primeng/progressbar';
import { ContextMenuModule } from 'primeng/contextmenu';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CheckboxModule } from 'primeng/checkbox';
// Sutram Excel Components
import { SutramExcelStudioComponent } from './components/sutram-excel-studio/sutram-excel-studio.component';
import { SutramGridComponent } from './components/sutram-grid/sutram-grid.component';
import { SutramHeaderScannerComponent } from './components/sutram-header-scanner/sutram-header-scanner.component';
import { SutramCorrectionSidebarComponent } from './components/sutram-correction-sidebar/sutram-correction-sidebar.component';
import { SutramImportProgressComponent } from './components/sutram-import-progress/sutram-import-progress.component';
import { SutramDictionaryViewComponent } from './components/sutram-dictionary-view/sutram-dictionary-view.component';
// Services
import { SutramExcelApiService } from './services/sutram-excel-api.service';
import { SutramExcelStateService } from './services/sutram-excel-state.service';
import { SutramExcelScannerService } from './services/sutram-excel-scanner.service';
import { SutramAuditService } from './services/sutram-audit.service';
import { SutramClipboardService } from './services/sutram-clipboard.service';
import { SutramRefCacheService } from './services/sutram-ref-cache.service';
import * as i0 from "@angular/core";
const COMPONENTS = [
    SutramExcelStudioComponent,
    SutramGridComponent,
    SutramHeaderScannerComponent,
    SutramCorrectionSidebarComponent,
    SutramImportProgressComponent,
    SutramDictionaryViewComponent
];
export class SutramExcelModule {
    static ɵfac = function SutramExcelModule_Factory(t) { return new (t || SutramExcelModule)(); };
    static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SutramExcelModule });
    static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [
            SutramExcelApiService,
            SutramExcelStateService,
            SutramExcelScannerService,
            SutramAuditService,
            SutramClipboardService,
            SutramRefCacheService
        ], imports: [CommonModule,
            FormsModule,
            HttpClientModule,
            TableModule,
            DropdownModule,
            ButtonModule,
            InputTextModule,
            DialogModule,
            SidebarModule,
            ProgressBarModule,
            ContextMenuModule,
            AutoCompleteModule,
            OverlayPanelModule,
            CheckboxModule] });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramExcelModule, [{
        type: NgModule,
        args: [{
                declarations: [...COMPONENTS],
                imports: [
                    CommonModule,
                    FormsModule,
                    HttpClientModule,
                    TableModule,
                    DropdownModule,
                    ButtonModule,
                    InputTextModule,
                    DialogModule,
                    SidebarModule,
                    ProgressBarModule,
                    ContextMenuModule,
                    AutoCompleteModule,
                    OverlayPanelModule,
                    CheckboxModule
                ],
                providers: [
                    SutramExcelApiService,
                    SutramExcelStateService,
                    SutramExcelScannerService,
                    SutramAuditService,
                    SutramClipboardService,
                    SutramRefCacheService
                ],
                exports: [...COMPONENTS]
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(SutramExcelModule, { declarations: [SutramExcelStudioComponent,
        SutramGridComponent,
        SutramHeaderScannerComponent,
        SutramCorrectionSidebarComponent,
        SutramImportProgressComponent,
        SutramDictionaryViewComponent], imports: [CommonModule,
        FormsModule,
        HttpClientModule,
        TableModule,
        DropdownModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        SidebarModule,
        ProgressBarModule,
        ContextMenuModule,
        AutoCompleteModule,
        OverlayPanelModule,
        CheckboxModule], exports: [SutramExcelStudioComponent,
        SutramGridComponent,
        SutramHeaderScannerComponent,
        SutramCorrectionSidebarComponent,
        SutramImportProgressComponent,
        SutramDictionaryViewComponent] }); })();
