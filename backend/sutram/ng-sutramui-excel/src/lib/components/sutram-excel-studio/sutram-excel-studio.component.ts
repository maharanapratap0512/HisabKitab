/**
 * sutram-excel-studio.component.ts
 * ─────────────────────────────────────────────────────────────
 * Master Studio Component hosting the toolbar, audit metrics,
 * virtual grid, header scanner, correction sidebar, and streaming importer.
 * ─────────────────────────────────────────────────────────────
 */

import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import * as XLSX from 'xlsx';
import { SutramExcelStateService } from '../../services/sutram-excel-state.service';
import { SutramExcelApiService } from '../../services/sutram-excel-api.service';
import { SutramExcelScannerService } from '../../services/sutram-excel-scanner.service';
import { SutramAuditService } from '../../services/sutram-audit.service';
import { SutramScanReport, SutramScanMatch } from '../../models/sutram-excel.model';

import { SutramRefCacheService } from '../../services/sutram-ref-cache.service';

@Component({
  selector: 'sutram-excel-studio',
  templateUrl: './sutram-excel-studio.component.html',
  styleUrls: ['./sutram-excel-studio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SutramExcelStudioComponent implements OnInit {
  @Input() set table(tableName: string) {
    if (tableName) {
      this.onTableSelect(tableName);
    }
  }
  @Input() mode: 'normal' | 'intelligent' = 'intelligent';
  @Input() apiBase: string = '/_sutram/excel';

  public tablesList: Array<{ table: string; display_name: string }> = [];
  public selectedTableName: string = '';
  public isLoadingConfig: boolean = false;

  // Sheet tabs state
  public sheetTabs: Array<{ id: string; title: string; icon: string; isLoaded: boolean; recordCount?: number }> = [];
  public activeSheetId: string = 'blank';
  public sheetWorkbooks: { [sheetId: string]: any[] } = {};

  // Zoom / Scale state
  public zoomLevel: number = 1.0;

  // Scanner modal state
  public showScannerModal: boolean = false;
  public scanReport: SutramScanReport | null = null;
  private pendingRawRows: any[] = [];

  // Correction sidebar state
  public showSidebar: boolean = false;

  // Import progress modal state
  public showProgressModal: boolean = false;
  public rejectedRowsDuringImport: any[] = [];
  private isCancelRequested: boolean = false;

  constructor(
    public state: SutramExcelStateService,
    private api: SutramExcelApiService,
    private scanner: SutramExcelScannerService,
    private audit: SutramAuditService,
    public refCache: SutramRefCacheService,
    private cdr: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    if (this.apiBase) {
      this.api.setBaseUri(this.apiBase);
    }
    this.state.isAuditMode.set(this.mode === 'intelligent');
    this.loadTablesList();
  }

  public loadTablesList(): void {
    this.api.getRegisteredTables().subscribe({
      next: (tables: any[]) => {
        this.tablesList = tables;
        this.sheetTabs = [
          { id: 'blank', title: 'Blank Sheet', icon: 'pi-file', isLoaded: false },
          ...tables.map((t: any) => ({
            id: t.table,
            title: t.display_name || t.table,
            icon: 'pi-table',
            isLoaded: false,
            recordCount: 0
          }))
        ];
        if (!this.selectedTableName && tables.length > 0) {
          this.activeSheetId = tables[0].table;
          this.onTableSelect(tables[0].table);
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('[SutramStudio] Load tables failed:', err)
    });
  }

  public onTableSelect(tableName: string, autoLoadData: boolean = true): void {
    if (!tableName) return;
    this.selectedTableName = tableName;
    this.state.setActiveTable(tableName);
    this.isLoadingConfig = true;

    this.api.getTableConfig(tableName).subscribe({
      next: (cfg: any) => {
        this.state.setConfig(cfg);
        this.isLoadingConfig = false;
        this.state.clearGrid();

        // Preload all referenced FK tables
        if (cfg && cfg.headers) {
          const refTables = cfg.headers
            .filter((h: any) => h.ref_table || h.type === 'ref')
            .map((h: any) => h.ref_table)
            .filter(Boolean);
          this.refCache.preloadTables(refTables);
        }

        if (autoLoadData) {
          this.loadTableDataFromDb();
        }

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isLoadingConfig = false;
        console.error('[SutramStudio] Load config failed:', err);
        this.cdr.markForCheck();
      }
    });
  }

  public switchSheet(tabId: string): void {
    if (this.activeSheetId === tabId) return;

    // Preserve current sheet state
    if (this.activeSheetId) {
      this.sheetWorkbooks[this.activeSheetId] = this.state.rows();
    }

    this.activeSheetId = tabId;

    if (tabId === 'blank' || tabId.startsWith('sheet_')) {
      this.selectedTableName = '';
      this.state.clearGrid();
      this.cdr.markForCheck();
    } else {
      if (this.sheetWorkbooks[tabId]) {
        this.selectedTableName = tabId;
        this.state.setActiveTable(tabId);
        this.state.setRows(this.sheetWorkbooks[tabId]);
      } else {
        this.onTableSelect(tabId, true);
      }
    }
    this.cdr.markForCheck();
  }

  public addNewBlankSheet(): void {
    const customCount = this.sheetTabs.filter(t => t.id.startsWith('sheet_')).length + 2;
    const newId = `sheet_${Date.now()}`;
    this.sheetTabs.push({ id: newId, title: `Sheet ${customCount}`, icon: 'pi-file', isLoaded: false });
    this.switchSheet(newId);
  }

  public loadTableDataFromDb(): void {
    const cfg = this.state.config();
    if (!cfg || !this.selectedTableName) return;

    this.api.getTableData(this.selectedTableName, 500, 0).subscribe({
      next: (dbRows: any[]) => {
        if (!dbRows || dbRows.length === 0) return;
        const builtRows: any[] = dbRows.map((dr: any, idx: number) => {
          const cells: any = {};
          cfg.headers.forEach((h: any) => {
            let rawVal: any;
            if (h.ref_table || h.type === 'ref') {
              const joined = dr[h.ref_as || h.name || h.ref_table];
              if (joined && typeof joined === 'object') {
                const tbl = (h.ref_table || h.ref_as || '').toLowerCase();
                if (tbl) {
                  const hin = joined[`${tbl}_hin`];
                  const eng = joined[`${tbl}_eng`];
                  const code = joined[`${tbl}_code`];
                  const full = joined[`${tbl}_full`];
                  const short = joined[`${tbl}_short`];
                  const name = joined[`${tbl}_name`];

                  if (hin && eng) rawVal = code ? `${hin} : ${eng} : ${code}` : `${hin} : ${eng}`;
                  else if (hin && code) rawVal = `${hin} : ${code}`;
                  else if (hin) rawVal = hin;
                  else if (full) rawVal = short ? `${full} (${short})` : full;
                  else if (name) rawVal = name;
                }
                if (rawVal === undefined) {
                  const hinKey = Object.keys(joined).find((k: string) => k.endsWith('_hin'));
                  if (hinKey) {
                    const prefix = hinKey.slice(0, -4);
                    const engVal = joined[`${prefix}_eng`];
                    rawVal = engVal ? `${joined[hinKey]} : ${engVal}` : joined[hinKey];
                  } else {
                    rawVal = joined.name || joined.title || Object.values(joined).find((v: any) => typeof v === 'string') || Object.values(joined)[0];
                  }
                }
              }
            }
            if (rawVal === undefined) rawVal = dr[h.col_name];
            if (rawVal === undefined) rawVal = dr[h.name];
            if (rawVal === undefined) {
              const matchKey = Object.keys(dr).find((k: string) => k.toLowerCase() === (h.col_name || h.name || '').toLowerCase());
              if (matchKey) rawVal = dr[matchKey];
            }
            cells[h.name] = {
              value: String(rawVal ?? ''),
              isValid: true,
              refId: dr[h.col_name] !== undefined ? dr[h.col_name] : rawVal
            };
          });
          return {
            rowNum: idx + 1,
            cells,
            hasError: false,
            errorCount: 0
          };
        });

        this.audit.auditAll(builtRows, cfg.headers);
        this.state.setRows(builtRows);

        const tab = this.sheetTabs.find(t => t.id === this.selectedTableName);
        if (tab) {
          tab.isLoaded = true;
          tab.recordCount = builtRows.length;
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('[SutramStudio] Load DB data failed:', err)
    });
  }

  public zoomIn(): void {
    if (this.zoomLevel < 1.6) {
      this.zoomLevel = Math.min(1.6, Math.round((this.zoomLevel + 0.1) * 10) / 10);
      this.cdr.markForCheck();
    }
  }

  public zoomOut(): void {
    if (this.zoomLevel > 0.6) {
      this.zoomLevel = Math.max(0.6, Math.round((this.zoomLevel - 0.1) * 10) / 10);
      this.cdr.markForCheck();
    }
  }

  public resetZoom(): void {
    this.zoomLevel = 1.0;
    this.cdr.markForCheck();
  }

  // ── File Parsing & Header Scanning ───────────────────────────

  public onFileUpload(event: any): void {
    const file = event?.target?.files?.[0] || event?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      if (!rawJson || rawJson.length === 0) return;

      const headers: string[] = (rawJson[0] || []).map(h => String(h || '').trim());
      this.pendingRawRows = rawJson.slice(1);

      const cfg = this.state.config();
      if (!cfg) return;

      // Run smart header scan
      this.scanReport = this.scanner.scan(headers, cfg, this.pendingRawRows);
      this.showScannerModal = true;
      this.cdr.markForCheck();
    };

    reader.readAsArrayBuffer(file);
    // Reset file input value
    if (event.target) event.target.value = '';
  }

  public onScannerConfirmed(matches: SutramScanMatch[]): void {
    const cfg = this.state.config();
    if (!cfg) return;

    const builtRows = this.scanner.buildSutramRows(this.pendingRawRows, matches, cfg.headers);
    this.audit.auditAll(builtRows, cfg.headers);
    this.state.setRows(builtRows);
    this.showScannerModal = false;
    this.pendingRawRows = [];
    this.cdr.markForCheck();
  }

  // ── Server-Side Verification ─────────────────────────────────

  public verifyData(): void {
    const cfg = this.state.config();
    if (!cfg || !this.selectedTableName) return;

    const rows = this.state.rows();
    if (rows.length === 0) return;

    this.state.isVerifying.set(true);

    // Extract raw objects for verify API
    const rawObjects = rows.map((r: any) => {
      const obj: any = {};
      cfg.headers.forEach((h: any) => (obj[h.name] = r.cells[h.name]?.value));
      return obj;
    });

    this.api.verifyRows(this.selectedTableName, rawObjects).subscribe({
      next: (res: any) => {
        this.state.isVerifying.set(false);
        this.state.setCorrections(res.correctionList || []);

        // If corrections exist, open sidebar
        if (res.correctionList && res.correctionList.length > 0) {
          this.showSidebar = true;
        }

        // Re-audit with server resolved IDs
        if (res.rows && res.rows.length === rows.length) {
          const updatedRows = [...rows];
          res.rows.forEach((resolvedObj: any, idx: number) => {
            cfg.headers.forEach((h: any) => {
              if (resolvedObj[h.col_name] !== undefined) {
                updatedRows[idx].cells[h.name].refId = resolvedObj[h.col_name];
              }
            });
          });
          this.state.setRows(updatedRows);
        }

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.state.isVerifying.set(false);
        console.error('[SutramStudio] Verify failed:', err);
        this.cdr.markForCheck();
      }
    });
  }

  public addNewRow(): void {
    const row = this.state.addNewBlankRow();
    this.cdr.markForCheck();
  }

  // ── Streaming Import Pipeline ────────────────────────────────

  public async startImport(): Promise<void> {
    const cfg = this.state.config();
    if (!cfg || !this.selectedTableName) return;

    const rows = this.state.rows();
    if (rows.length === 0) return;

    // 1. Mandatory Pre-Sync Audit: Check foreign keys and required constraints
    // If ANY row in the sheet contains dirty data, halt immediately!
    const preSyncAudit = this.audit.auditRowsBeforeSync(rows, cfg.headers);
    if (!preSyncAudit.canSync) {
      const firstErr = preSyncAudit.errorDetails[0];
      const errMsg = `डेटाबेस सिंक रोका गया! कुल ${preSyncAudit.totalErrors} त्रुटियां पाई गईं (पंक्ति ${firstErr.rowNum}: ${firstErr.message})। केवल शुद्ध डेटा ही सिंक किया जा सकता है।`;
      console.warn('[SutramStudio] DB Sync Blocked:', errMsg);
      alert(errMsg);
      this.cdr.markForCheck();
      return;
    }

    // 2. Identify rows to sync: only modified or newly added rows!
    const rowsToSync = rows.filter((r: any) => (r.isNew || r.isModified) && this.audit.rowHasData(r, cfg.headers));
    if (rowsToSync.length === 0) {
      alert('सिंक करने के लिए कोई नया या संशोधित डेटा नहीं मिला (No modified or new rows found to sync)।');
      return;
    }

    this.isCancelRequested = false;
    this.rejectedRowsDuringImport = [];
    this.showProgressModal = true;
    this.state.isImporting.set(true);

    const progress = {
      current: 0,
      total: rowsToSync.length,
      percentage: 0,
      inserted: 0,
      updated: 0,
      duplicate: 0,
      rejected: 0,
      isActive: true
    };
    this.state.importProgress.set({ ...progress });

    const syncedRowNums: number[] = [];

    for (let i = 0; i < rowsToSync.length; i++) {
      if (this.isCancelRequested) break;

      const r = rowsToSync[i];
      const payload: any = {};

      cfg.headers.forEach((h: any) => {
        const cell = r.cells[h.name];
        const val = cell?.refId !== undefined ? cell.refId : cell?.value;
        payload[h.col_name] = val;
      });

      try {
        const res = await this.api.importRow(this.selectedTableName, payload).toPromise();
        if (res?.status === 'inserted') {
          progress.inserted++;
          syncedRowNums.push(r.rowNum);
        } else if (res?.status === 'updated') {
          progress.updated++;
          syncedRowNums.push(r.rowNum);
        } else if (res?.status === 'duplicate') {
          progress.duplicate++;
          syncedRowNums.push(r.rowNum);
        } else {
          progress.rejected++;
          this.rejectedRowsDuringImport.push({ ...payload, _error: res?.error || 'Rejected' });
        }
      } catch (err: any) {
        progress.rejected++;
        this.rejectedRowsDuringImport.push({ ...payload, _error: err?.message || 'Network error' });
      }

      progress.current = i + 1;
      progress.percentage = Math.round((progress.current / progress.total) * 100);
      this.state.importProgress.set({ ...progress });
      this.cdr.markForCheck();
    }

    // Mark successfully synced rows as clean
    this.state.markRowsSynced(syncedRowNums);

    progress.isActive = false;
    this.state.importProgress.set({ ...progress });
    this.state.isImporting.set(false);
    this.cdr.markForCheck();
  }

  public cancelImport(): void {
    this.isCancelRequested = true;
  }

  // ── "Solve All" Handler from Grid ────────────────────────────

  public onGridSolveAll(event: {
    colKey: string;
    badValue: string;
    resolvedDisplay: string;
    resolvedId?: any;
    saveToDict: boolean;
  }): void {
    this.state.applyBatchCorrection(
      event.colKey,
      event.badValue,
      event.resolvedDisplay,
      event.resolvedId
    );

    if (event.saveToDict) {
      const header = this.state.headers().find((h: any) => h.name === event.colKey);
      const refType = header?.ref_table || event.colKey;

      this.api.addDictionaryEntry({
        type: refType,
        name: event.badValue,
        ref_id: event.resolvedId !== undefined ? event.resolvedId : event.resolvedDisplay
      }).subscribe();
    }
  }
}
