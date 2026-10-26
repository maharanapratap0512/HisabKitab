import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExcelStudioUiComponent } from './components/excel-studio-ui/excel-studio-ui.component';
import { FormatScannerModalComponent } from './components/format-scanner-modal/format-scanner-modal.component';
import { ExcelStudioService } from './services/excel-studio.service';
import { MasterIndexerService } from './services/master-indexer.service';

@NgModule({
  declarations: [
    // Exportable declarations when packaged as independent module
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  providers: [
    ExcelStudioService,
    MasterIndexerService
  ]
})
export class ExcelStudioModule { }
