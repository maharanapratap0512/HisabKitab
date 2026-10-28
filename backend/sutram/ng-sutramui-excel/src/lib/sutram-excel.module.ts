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

const COMPONENTS = [
  SutramExcelStudioComponent,
  SutramGridComponent,
  SutramHeaderScannerComponent,
  SutramCorrectionSidebarComponent,
  SutramImportProgressComponent,
  SutramDictionaryViewComponent
];

@NgModule({
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
    AutoCompleteModule
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
})
export class SutramExcelModule {}
