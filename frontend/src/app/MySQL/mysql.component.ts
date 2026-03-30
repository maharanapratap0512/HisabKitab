import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { ApiService } from '../services/api.service';
import { GlobalService } from '../services/global.service';
import { ExcelExportService } from '../services/excel-export.service';
import * as XLSX from 'xlsx';

interface Procedure {
  procedure_name: string;
  type: string;
  created_date: string;
  last_modified: string;
  parameters?: Parameter[];
}

interface Parameter {
  name: string;
  mode: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
}

interface TableColumn {
  name: string;
  type: number;
  length?: number;
  flags?: number;
}

@Component({
  selector: 'app-mysql',
  templateUrl: './mysql.component.html',
  styleUrls: ['./mysql.component.scss']
})
export class MysqlComponent implements OnInit, OnDestroy {

  // ── Connection ────────────────────────────────────────────
  connectionForm: FormGroup;
  isConnected = false;
  isLoading = false;
  autoConnecting = false;
  connectionId: string = '';
  errorMessage = '';

  // ── Database / Procedure ──────────────────────────────────
  databases: string[] = [];
  procedures: Procedure[] = [];
  selectedDatabase = '';
  selectedProcedure = '';
  selectedProcedureData: Procedure | null = null;
  parameterValues: { [key: string]: any } = {};

  // ── Results ───────────────────────────────────────────────
  procedureResults: any[] = [];
  tableColumns: TableColumn[] = [];

  // ── Active Tab ────────────────────────────────────────────
  activeTab: 'import' | 'mapping' | 'procedures' = 'mapping';

  // ── SQL Import ────────────────────────────────────────────
  importFile: File | null = null;
  importFileName = '';
  isImporting = false;
  importProgress = 0;
  importCurrentStatement = '';
  importStatus: 'idle' | 'running' | 'success' | 'error' = 'idle';
  importMessage = '';
  importLogs: { status: 'ok' | 'error'; text: string }[] = [];
  isDragOver = false;
  importMysqlPath = '';

  // ── Excel Mapping ─────────────────────────────────────────
  mappingFile: File | null = null;
  mappingFileName = '';
  mappingRows: any[] = [];
  mappingColumns: string[] = [];
  isMappingLoading = false;
  mappingError = '';
  mappingResult: any = null;
  mappingProgress = 0;
  mappingTotalRows = 0;
  mappingProcessedRows = 0;
  mappingResultTab: 'mapped' | 'unmatched' = 'mapped';

  // ── Migration Result State ────────────────────────────────
  activeMigrationTab: 'matched' | 'unmatched' = 'matched';
  displaySection: 'aawak' | 'jawak' | 'closing' = 'aawak';
  exportType: 'aawak' | 'jawak' | 'closing' | 'all' = 'aawak';
  exportRange: string = '';
  exportSewadhariRange: string = '';

  categorizedResult: any = {
    matched: { aawak: [], jawak: [], closing: [] },
    unmatched: { aawak: [], jawak: [], closing: [] }
  };

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private apiService: ApiService,
    private globalService: GlobalService,
    private excelService: ExcelExportService
  ) {
    this.connectionForm = this.fb.group({
      host: ['localhost', [Validators.required]],
      user: ['root', [Validators.required]],
      password: ['', [Validators.required]],
      port: ['3306', [Validators.required, Validators.pattern(/^\d+$/)]],
      mysqlPath: ['', []]
    });
  }

  ngOnInit(): void {
    this.loadSavedConfig();
  }

  ngOnDestroy(): void {
    if (this.connectionId) this.closeConnection();
  }

  // ─────────────────────────────────────────────────────────
  // PAGE LOAD — restore previous session
  // ─────────────────────────────────────────────────────────

  private loadSavedConfig(): void {
    this.autoConnecting = true;

    this.httpService.get(this.apiService.getUrl('BASE') + 'mysql/connection-status').subscribe({
      next: (response: any) => {
        const data = response.success ? response.data : null;
        const config = data?.config ?? null;

        // Always pre-fill form from saved config
        if (config) {
          this.connectionForm.patchValue({
            host: config.host || 'localhost',
            user: config.user || 'root',
            password: config.password || '',
            port: config.port || '3306',
            mysqlPath: config.mysqlPath || '',
          });
        }

        // Live connection available — restore full state
        if (data?.connectionId && data?.databases?.length) {
          this.isConnected = true;
          this.databases = data.databases;
          this.connectionId = data.connectionId;

          if (config?.lastDatabase && data.databases.includes(config.lastDatabase)) {
            this.selectedDatabase = config.lastDatabase;
            this.onDatabaseChange();
          }

          this.autoConnecting = false;
          return;
        }

        // No live connection (auto-connect failed) — form pre-filled, wait for user
        this.autoConnecting = false;
      },
      error: () => {
        this.autoConnecting = false;
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // CONNECTION
  // ─────────────────────────────────────────────────────────

  testConnection(): void {
    if (this.connectionForm.invalid) { this.markFormGroupTouched(); return; }
    this.isLoading = true;
    this.errorMessage = '';
    this.httpService.post(this.apiService.getUrl('BASE') + 'mysql/test-connection', this.connectionForm.value).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) { this.globalService['toastr'].success('Connection successful!'); }
        else { this.errorMessage = response.message; }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Connection failed';
      }
    });
  }

  connect(): void {
    if (this.connectionForm.invalid) { this.markFormGroupTouched(); return; }
    this.isLoading = true;
    this.errorMessage = '';
    this.httpService.post(this.apiService.getUrl('BASE') + 'mysql/databases', this.connectionForm.value).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.isConnected = true;
          this.databases = response.data;
          this.connectionId = response.connectionId;
          this.globalService['toastr'].success('Connected successfully!');
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Connection failed';
      }
    });
  }

  disconnect(): void {
    this.closeConnection();
    this.httpService.delete(this.apiService.getUrl('BASE') + 'mysql/clear-config').subscribe();
    this.resetForm();
  }

  private closeConnection(): void {
    if (this.connectionId) {
      this.httpService.delete(this.apiService.getUrl('BASE') + `mysql/connection/${this.connectionId}`).subscribe({
        next: () => console.log('Connection closed'),
        error: (err: any) => console.error('Error closing connection:', err)
      });
    }
  }

  private resetForm(): void {
    this.isConnected = false; this.connectionId = ''; this.databases = [];
    this.procedures = []; this.selectedDatabase = ''; this.selectedProcedure = '';
    this.procedureResults = []; this.tableColumns = []; this.errorMessage = '';
    this.selectedProcedureData = null; this.parameterValues = {};
    this.resetImportState(); this.resetMappingState();
  }

  // ─────────────────────────────────────────────────────────
  // DATABASE / PROCEDURE
  // ─────────────────────────────────────────────────────────

  onDatabaseChange(): void {
    if (!this.selectedDatabase || !this.connectionId) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.procedures = [];
    this.selectedProcedure = '';
    this.resetImportState();

    this.httpService.post(
      this.apiService.getUrl('BASE') + `mysql/procedures/${this.connectionId}`,
      { database: this.selectedDatabase }
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) { this.procedures = response.data; }
        else { this.errorMessage = response.message; }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load procedures';
      }
    });
  }

  onProcedureChange(): void {
    this.selectedProcedureData = this.procedures.find(p => p.procedure_name === this.selectedProcedure) || null;
    this.parameterValues = {};
    if (this.selectedProcedureData?.parameters) {
      this.selectedProcedureData.parameters.forEach(param => {
        this.parameterValues[param.name] = this.getDefaultValueForType(param.type);
      });
    }
  }

  private getDefaultValueForType(type: string): any {
    const t = type.toUpperCase();
    if (t.includes('INT') || t.includes('DECIMAL') || t.includes('NUMERIC')) return 0;
    if (t.includes('VARCHAR') || t.includes('TEXT') || t.includes('CHAR')) return '';
    if (t.includes('DATE') || t.includes('TIME')) return new Date().toISOString().split('T')[0];
    if (t.includes('BIT') || t.includes('BOOL')) return false;
    return '';
  }

  public isTextType(type: string): boolean {
    const t = type.toUpperCase();
    return t.includes('VARCHAR') || t.includes('TEXT') || t.includes('CHAR');
  }

  public isNumberType(type: string): boolean {
    const t = type.toUpperCase();
    return t.includes('INT') || t.includes('DECIMAL') || t.includes('NUMERIC') || t.includes('FLOAT') || t.includes('DOUBLE');
  }

  public isDateType(type: string): boolean {
    const t = type.toUpperCase();
    return t.includes('DATE') || t.includes('TIME') || t.includes('DATETIME');
  }

  public isBooleanType(type: string): boolean {
    const t = type.toUpperCase();
    return t.includes('BIT') || t.includes('BOOL') || t.includes('BOOLEAN');
  }

  executeProcedure(): void {
    if (!this.selectedProcedure || !this.connectionId) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.procedureResults = [];

    const parameters = this.selectedProcedureData?.parameters?.map(p => this.parameterValues[p.name]) || [];

    this.httpService.post(
      this.apiService.getUrl('BASE') + `mysql/execute/${this.connectionId}`,
      { procedureName: this.selectedProcedure, parameters }
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.procedureResults = response.results || [];
          this.globalService['toastr'].success('Procedure executed successfully.');
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to execute procedure';
      }
    });
  }

  getColumns(resultSet: any): string[] {
    if (resultSet.columns && resultSet.columns.length > 0) {
      return resultSet.columns.map((c: any) => c.name);
    }
    if (resultSet.data && resultSet.data.length > 0) {
      return Object.keys(resultSet.data[0]);
    }
    return [];
  }

  getObjectKeys(obj: any): string[] { return obj ? Object.keys(obj) : []; }

  private markFormGroupTouched(): void {
    Object.keys(this.connectionForm.controls).forEach(key => {
      this.connectionForm.get(key)?.markAsTouched();
    });
  }

  // ─────────────────────────────────────────────────────────
  // SQL IMPORT
  // ─────────────────────────────────────────────────────────

  onDragOver(event: DragEvent): void { event.preventDefault(); event.stopPropagation(); this.isDragOver = true; }
  onDragLeave(event: DragEvent): void { event.preventDefault(); event.stopPropagation(); this.isDragOver = false; }

  onDrop(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation();
    this.isDragOver = false;
    if (this.isImporting) return;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.setImportFile(files[0]);
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) { this.setImportFile(input.files[0]); input.value = ''; }
  }

  private setImportFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.sql')) { this.errorMessage = 'Please select a valid .sql file'; return; }
    this.importFile = file; this.importFileName = file.name;
    this.errorMessage = ''; this.importStatus = 'idle';
    this.importMessage = ''; this.importLogs = [];
    this.importProgress = 0; this.importCurrentStatement = '';
  }

  resetImportFile(): void { this.importFile = null; this.importFileName = ''; this.resetImportState(); }

  private resetImportState(): void {
    this.importStatus = 'idle'; this.importMessage = ''; this.importLogs = [];
    this.importProgress = 0; this.importCurrentStatement = ''; this.isImporting = false;
  }

  get importTargetDb(): string { return this.selectedDatabase || 'testMysql'; }

  importSqlFile(): void {
    if (!this.importFile || !this.connectionId) return;
    this.isImporting = true; this.importStatus = 'running';
    this.importProgress = 0; this.importCurrentStatement = '';
    this.importMessage = ''; this.importLogs = []; this.errorMessage = '';

    const formData = new FormData();
    formData.append('file', this.importFile);
    formData.append('database', this.importTargetDb);
    if (this.importMysqlPath.trim()) {
      formData.append('mysqlPath', this.importMysqlPath.trim());
    }

    fetch(this.apiService.getUrl('BASE') + `mysql/import/${this.connectionId}`, { method: 'POST', body: formData })
      .then(async (response) => {
        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: 'Import request failed' }));
          this.handleImportError(err.message || 'Import failed');
          return;
        }
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const pump = async (): Promise<void> => {
          const { done, value } = await reader.read();
          if (done) { if (this.importStatus === 'running') this.importStatus = 'success'; this.isImporting = false; return; }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try { this.handleImportEvent(JSON.parse(line.slice(6))); } catch { }
            }
          }
          return pump();
        };
        await pump();
      })
      .catch((err) => this.handleImportError(err?.message || 'Network error during import'));
  }

  private handleImportEvent(event: any): void {
    switch (event.type) {
      case 'start':
        this.importMessage = event.message; this.importProgress = 10;
        this.importLogs.push({ status: 'ok', text: event.message });
        break;
      case 'progress':
        this.importCurrentStatement = event.message ?? '';
        if (this.importLogs.length >= 200) this.importLogs.shift();
        this.importLogs.push({ status: 'ok', text: event.message });
        if (this.importProgress < 90) this.importProgress += 0.5;
        break;
      case 'error':
        this.handleImportError(event.message);
        break;
      case 'done':
        this.importProgress = 100; this.importStatus = event.success ? 'success' : 'error';
        this.importMessage = event.message; this.isImporting = false;
        this.importLogs.push({ status: event.success ? 'ok' : 'error', text: event.message });
        if (event.success) {
          this.globalService['toastr'].success(event.message);
          this.httpService.post(this.apiService.getUrl('BASE') + 'mysql/databases', this.connectionForm.value).subscribe({
            next: (r: any) => {
              if (r.success) {
                this.databases = r.data;
                if (!this.selectedDatabase && r.data.includes('testMysql')) {
                  this.selectedDatabase = 'testMysql';
                  this.onDatabaseChange();
                } else if (this.selectedDatabase) {
                  this.onDatabaseChange();
                }
              }
            }
          });
        }
        break;
    }
  }

  private handleImportError(message: string): void {
    this.importStatus = 'error'; this.importMessage = message;
    this.isImporting = false;
    this.importLogs.push({ status: 'error', text: message });
  }

  // ─────────────────────────────────────────────────────────
  // EXCEL MAPPING
  // ─────────────────────────────────────────────────────────

  onMappingFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        this.mappingError = 'Please select a valid Excel (.xlsx/.xls) or CSV file';
        return;
      }
      this.mappingFile = file; this.mappingFileName = file.name;
      this.mappingError = ''; this.mappingResult = null;
      input.value = '';
    }
  }

  resetMappingFile(): void { this.mappingFile = null; this.mappingFileName = ''; this.resetMappingState(); }

  private resetMappingState(): void {
    this.mappingRows = []; this.mappingColumns = [];
    this.mappingError = ''; this.mappingResult = null; this.isMappingLoading = false;
  }

  runMigration(): void {
    if (!this.mappingFile || !this.connectionId) return;
    if (!this.selectedDatabase) { this.mappingError = 'Please select a database before running migration'; return; }

    this.isMappingLoading = true; this.mappingError = '';
    this.mappingResult = { mapped: [], unmatched: [] };
    this.categorizedResult = {
      matched: { aawak: [], jawak: [], closing: [] },
      unmatched: { aawak: [], jawak: [], closing: [] }
    };
    this.mappingProgress = 0;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const mappingRows = XLSX.utils.sheet_to_json(worksheet);

        fetch(this.apiService.getUrl('BASE') + `mysql/migrate/${this.connectionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ database: this.selectedDatabase, mappingRows })
        })
          .then(async (response) => {
            if (!response.ok) {
              const err = await response.json().catch(() => ({ message: 'Migration request failed' }));
              throw new Error(err.message || 'Migration failed');
            }
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            const pump = async (): Promise<void> => {
              const { done, value } = await reader.read();
              if (done) { this.isMappingLoading = false; return; }
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() ?? '';
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try { this.handleMigrationEvent(JSON.parse(line.slice(6))); } catch { }
                }
              }
              return pump();
            };
            return pump();
          })
          .catch((err) => {
            this.isMappingLoading = false;
            this.mappingError = err.message || 'Network error during migration';
            this.globalService['toastr'].error(this.mappingError);
          });
      } catch (err) {
        this.isMappingLoading = false;
        this.mappingError = 'Error parsing Excel file';
      }
    };
    reader.readAsArrayBuffer(this.mappingFile);
  }

  private handleMigrationEvent(event: any): void {
    switch (event.type) {
      case 'start':
        this.mappingTotalRows = event.total || 0;
        this.mappingProcessedRows = 0;
        this.globalService['toastr'].info(event.message);
        break;
      case 'progress':
        if (event.mapped) {
          this.mappingResult.mapped.push(...event.mapped);
          event.mapped.forEach((row: any) => {
            const type = (row.entry_type || '').toLowerCase();
            if (this.categorizedResult.matched[type]) {
              this.categorizedResult.matched[type].push(row);
            } else {
              this.categorizedResult.matched.aawak.push(row);
            }
          });
        }
        if (event.unmatched) {
          this.mappingResult.unmatched.push(...event.unmatched);
          event.unmatched.forEach((row: any) => {
            const type = (row.entry_type || '').toLowerCase();
            if (this.categorizedResult.unmatched[type]) {
              this.categorizedResult.unmatched[type].push(row);
            } else {
              this.categorizedResult.unmatched.aawak.push(row);
            }
          });
        }
        this.mappingProgress = event.progress;
        this.mappingProcessedRows = event.processed || this.mappingProcessedRows;
        if (event.total) this.mappingTotalRows = event.total;
        break;
      case 'done':
        this.isMappingLoading = false;
        this.mappingProgress = 100;
        if (event.stats) { this.mappingProcessedRows = event.stats.total; }
        this.globalService['toastr'].success(event.message);
        break;
      case 'error':
        this.isMappingLoading = false;
        this.mappingError = event.message;
        this.globalService['toastr'].error(event.message);
        break;
    }
  }

  exportMappingResult(): void {
    if (!this.mappingResult) return;
    this.excelService.addSheet(this.mappingResult.mapped, 'Mapped Rows');
    this.excelService.addSheet(this.mappingResult.unmatched, 'Unmatched Rows');
    const fileName = `migration_result_${new Date().toISOString().slice(0, 10)}`;
    this.excelService.saveAsExcel(fileName);
  }

  get activeData(): any[] {
    return this.categorizedResult[this.activeMigrationTab][this.displaySection] || [];
  }

  getExportRanges(): string[] {
    if (this.exportType === 'all') return ['All Data'];
    const data = this.categorizedResult[this.activeMigrationTab][this.exportType] || [];
    const total = data.length;
    if (total === 0) return [];
    const ranges: string[] = [];
    const chunkSize = 10000;
    for (let i = 0; i < total; i += chunkSize) {
      ranges.push(`${i + 1} - ${Math.min(i + chunkSize, total)}`);
    }
    return ranges;
  }

  exportChunk(): void {
    const tab = this.activeMigrationTab;
    const type = this.exportType;
    const rangeStr = this.exportRange;

    if (!rangeStr) {
      this.globalService['toastr'].warning('Please select a range to export.');
      return;
    }

    let dataToExport: any[] = [];
    let fileNameSuffix = '';

    if (type === 'all') {
      dataToExport = tab === 'matched' ? this.mappingResult.mapped : this.mappingResult.unmatched;
      fileNameSuffix = 'all';
    } else {
      const allTypeData = this.categorizedResult[tab][type] || [];
      if (rangeStr === 'All Data') {
        dataToExport = allTypeData;
        fileNameSuffix = `${type}_all`;
      } else {
        const parts = rangeStr.split(' - ');
        const start = parseInt(parts[0]) - 1;
        const end = parseInt(parts[1]);
        dataToExport = allTypeData.slice(start, end);
        fileNameSuffix = `${type}_${rangeStr.replace(/ /g, '')}`;
      }
    }

    if (dataToExport.length === 0) {
      this.globalService['toastr'].warning('No data to export for selected range.');
      return;
    }

    // Map to reduced columns as requested
    const mappedData = dataToExport;
    // const mappedData = dataToExport.map((row: any) => ({
    //   'ID': row.id || row.sr_id,
    //   'Entry Date': row.entry_date || row.date || '',
    //   'Category': row.category || '',
    //   'Item': row.item || '',
    //   'Subitem': row.subitem || '',
    //   'Quantity': row.qty || row.quantity || 0,
    //   'Unit': row.unit || '',
    //   'Sewadhari Name': row.sewadhari_name || row.sewadhari || ''
    // }));

    const sheetName = `${tab.charAt(0).toUpperCase() + tab.slice(1)} ${type}`;
    this.excelService.addSheet(mappedData, sheetName);
    const fileName = `${tab}_${fileNameSuffix}_${new Date().toISOString().slice(0, 10)}`;
    this.excelService.saveAsExcel(fileName);
    this.globalService['toastr'].success(`Exported ${dataToExport.length} rows to Excel.`);
  }

  getSewadhariExportRanges(): string[] {
    if (this.exportType === 'all') return ['All Data'];
    const allData = this.categorizedResult[this.activeMigrationTab][this.exportType] || [];
    const filteredData = allData.filter((row: any) => row.sewadhari_id !== null && row.sewadhari_id !== undefined && row.sewadhari_id !== '' && row.sewadhari_id !== 0);
    const total = filteredData.length;
    if (total === 0) return [];

    const ranges: string[] = [];
    const chunkSize = 10000;
    for (let i = 0; i < total; i += chunkSize) {
      ranges.push(`${i + 1} - ${Math.min(i + chunkSize, total)}`);
    }
    return ranges;
  }

  exportSewadhariChunk(): void {
    const tab = this.activeMigrationTab;
    const type = this.exportType;
    const rangeStr = this.exportSewadhariRange;

    if (!rangeStr) {
      this.globalService['toastr'].warning('Please select a sewadhari range to export.');
      return;
    }

    const allData = this.categorizedResult[tab][type] || [];
    const filteredData = allData.filter((row: any) => row.sewadhari_id !== null && row.sewadhari_id !== undefined && row.sewadhari_id !== '' && row.sewadhari_id !== 0);

    if (filteredData.length === 0) {
      this.globalService['toastr'].warning('No sewadhari data to export.');
      return;
    }

    let dataToExport: any[] = [];
    if (rangeStr === 'All Data') {
      dataToExport = filteredData;
    } else {
      const parts = rangeStr.split(' - ');
      const start = parseInt(parts[0]) - 1;
      const end = parseInt(parts[1]);
      dataToExport = filteredData.slice(start, end);
    }

    // Map to reduced columns as requested
    const mappedData = dataToExport.map(row => ({
      'Pbk (hin)': row.sewadhari_name || '',
      'Pbk (Eng)': row.sewadhari_name_eng || '',
      'Jawak Place': row.aj_mm_name_hin || '',
      'Date': row.date ? this.globalService.formatDisplayDate(row.date) : '',
      'Category': row.category || '',
      'Item (Hin)': row.item || '',
      'Item (Eng)': row.item || '',
      'Subitem (Hin)': row.subitem || '',
      'Subitem (Eng)': row.subitem || '',
      'Quantity': row.qty || row.quantity || 0,
      'Unit': row.unit || '',
      'Rate': row.price || 0,
      'Amount': row.amount || 0,
      'Awak Type': row.aj_type_hin || '',
      'Awak Type (Eng)': row.aj_type_eng || '',
      'Packet No': row.pkt_num || '',
      'Aawak Place': row.mm_name_hin || '',
    }));

    const sheetName = `Sewadhari ${type}`;
    this.excelService.addSheet(mappedData, sheetName);
    const fileName = `sewadhari_${tab}_${type}_${new Date().toISOString().slice(0, 10)}`;
    this.excelService.saveAsExcel(fileName);
    this.globalService['toastr'].success(`Exported ${mappedData.length} sewadhari rows to Excel.`);
  }

  exportResultSet(resultSet: any, index: number): void {
    if (!resultSet || !resultSet.data || resultSet.data.length === 0) {
      this.globalService['toastr'].warning('No data to export for this result set.');
      return;
    }
    const tableName = resultSet.tableName || `Result_Set_${index + 1}`;
    this.excelService.addSheet(resultSet.data, tableName);
    const fileName = `${this.selectedProcedure || 'procedure'}_${tableName}_${new Date().toISOString().slice(0, 10)}`;
    this.excelService.saveAsExcel(fileName);
    this.globalService['toastr'].success(`Exported ${resultSet.data.length} rows from ${tableName} to Excel.`);
  }
}
