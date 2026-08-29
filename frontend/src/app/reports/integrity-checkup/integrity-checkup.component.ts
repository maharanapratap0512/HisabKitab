import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IntegrityCheckupService } from 'src/app/services/integrity-checkup.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';

import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-integrity-checkup',
  templateUrl: './integrity-checkup.component.html',
  styleUrls: ['./integrity-checkup.component.scss']
})
export class IntegrityCheckupComponent implements OnInit {
  @ViewChild('consoleBox') private consoleBox!: ElementRef;
  @ViewChild('resultsSection') private resultsSection!: ElementRef;

  tests: any[] = [];
  selectedTest: any = null;
  mismatches: any[] = [];
  duplicateGroups: any[] = [];
  logs: string[] = [];
  
  isScanning: boolean = false;
  isResolving: boolean = false;
  hasRunScan: boolean = false;

  // Dynamic comparison columns setting
  comparisonColumns = [
    { id: 'pkt_num', label: 'Pkt Num / पैकेट नंबर', default: true, selected: true },
    { id: 'date', label: 'Date / तारीख', default: true, selected: true },
    { id: 'mm_id', label: 'Main MM / मिनीमधुबन', default: true, selected: true },
    { id: 'aj_mm_id', label: 'Aawak/Jawak MM', default: true, selected: true },
    { id: 'item_id', label: 'Item / आइटम', default: true, selected: true },
    { id: 'subitem_id', label: 'Subitem / सबआइटम', default: true, selected: true },
    { id: 'unit_id', label: 'Unit / यूनिट', default: true, selected: true },
    { id: 'qty', label: 'Quantity / मात्रा', default: true, selected: true },
    { id: 'type_id', label: 'Type / आवक-जावक टाइप', default: true, selected: true },
    { id: 'condition_id', label: 'Condition / कन्डिशन', default: false, selected: false },
    { id: 'pbk_id', label: 'PBK / Person', default: false, selected: false },
    { id: 'aawak_source_id', label: 'Aawak Source', default: false, selected: false },
    { id: 'usage_list_id', label: 'Usage List', default: false, selected: false },
    { id: 'rate', label: 'Rate / रेट', default: false, selected: false },
    { id: 'actual_amt', label: 'Amount / राशि', default: false, selected: false },
    { id: 'lot_no', label: 'Lot No', default: false, selected: false },
    { id: 'item_detail', label: 'Item Detail', default: false, selected: false },
    { id: 'description', label: 'Description / विवरण', default: false, selected: false }
  ];

  // Quick edit modal state
  showEditModal: boolean = false;
  editingEntry: any = null;
  showModal: string = '';
  editData: any = null;

  constructor(
    private integrityService: IntegrityCheckupService,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    public auth: AuthService,
    public gs: GlobalService
  ) { }

  ngOnInit(): void {
    this.loadTests();
  }

  loadTests() {
    this.integrityService.getTests().subscribe((res: any) => {
      if (res.success) {
        this.tests = res.tests;
        if (this.tests.length > 0) {
          this.selectTest(this.tests[0]);
        }
      } else {
        this.toastr.error(res.message || 'Failed to load integrity tests.');
      }
    }, err => {
      const errorMsg = err?.error?.message || err?.message || 'Failed to load integrity tests.';
      this.toastr.error(errorMsg);
    });
  }

  selectTest(test: any) {
    this.selectedTest = test;
    this.mismatches = [];
    this.duplicateGroups = [];
    this.logs = [];
    this.hasRunScan = false;
  }

  toggleColumn(col: any) {
    col.selected = !col.selected;
  }

  selectAllColumns() {
    this.comparisonColumns.forEach(c => c.selected = true);
  }

  resetDefaultColumns() {
    this.comparisonColumns.forEach(c => c.selected = c.default);
  }

  getSelectedColumnKeys(): string[] {
    return this.comparisonColumns.filter(c => c.selected).map(c => c.id);
  }

  runScan() {
    if (!this.selectedTest) return;
    if (this.selectedTest.id === 'duplicate-aj-assumption') {
      this.runScanStream();
      return;
    }

    this.isScanning = true;
    this.mismatches = [];
    this.duplicateGroups = [];
    this.logs = [];
    this.logs.push(`Starting integrity scan for test: ${this.selectedTest.name}...`);

    const selectedCols = this.getSelectedColumnKeys();

    this.integrityService.scan(this.selectedTest.id, selectedCols).subscribe((res: any) => {
      this.isScanning = false;
      this.hasRunScan = true;
      if (res.success) {
        this.mismatches = res.result || [];
        this.logs.push(`[Complete] Integrity scan finished.`);
        this.logs.push(`Total mismatches found: ${this.mismatches.length}`);
        if (this.mismatches.length === 0) {
          this.toastr.success('No integrity mismatches found!');
        } else {
          this.toastr.warning(`Found ${this.mismatches.length} mismatches!`);
          this.scrollToResults();
        }
        this.scrollConsoleToBottom();
      } else {
        this.logs.push(`[Error] Scan failed: ${res.message || 'Unknown error'}`);
        this.toastr.error(res.message || 'Integrity scan failed.');
        this.scrollConsoleToBottom();
      }
    }, err => {
      this.isScanning = false;
      const errorMsg = err?.error?.message || err?.message || 'Integrity scan failed.';
      this.logs.push(`[Error] Scan failed: ${errorMsg}`);
      this.toastr.error(errorMsg);
      this.scrollConsoleToBottom();
    });
  }

  async runScanStream() {
    if (!this.selectedTest) return;
    this.isScanning = true;
    this.mismatches = [];
    this.duplicateGroups = [];
    this.logs = [];
    this.hasRunScan = true;
    
    this.logs.push(`Starting real-time duplicate scan for: ${this.selectedTest.name}...`);
    this.scrollConsoleToBottom();

    const selectedCols = this.getSelectedColumnKeys();

    try {
      const stream = await this.integrityService.scanStream(this.selectedTest.id, selectedCols);
      if (!stream) {
        this.logs.push('[Error] Could not initialize scan stream from backend.');
        this.toastr.error('Could not initialize scan stream from backend.');
        this.isScanning = false;
        return;
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'log') {
              this.logs.push(data.message);
              this.scrollConsoleToBottom();
            } else if (data.type === 'group') {
              this.duplicateGroups.push(data.group);
              if (this.duplicateGroups.length === 1) {
                this.scrollToResults();
              }
            } else if (data.type === 'complete') {
              this.logs.push(`[Complete] Duplicate scan finished. Found ${data.count} duplicate groups.`);
              if (data.count === 0) {
                this.toastr.success('No duplicate entries found!');
              } else {
                this.toastr.warning(`Found ${data.count} duplicate groups!`);
                this.scrollToResults();
              }
              this.scrollConsoleToBottom();
            }
          } catch (e) {
            console.error('Failed to parse scan stream chunk', line, e);
          }
        }
      }
    } catch (err: any) {
      const errorMsg = err?.error?.message || err?.message || 'Scan stream failed.';
      this.logs.push(`[Fatal Error] ${errorMsg}`);
      this.toastr.error(`Scan failed: ${errorMsg}`);
      this.scrollConsoleToBottom();
    } finally {
      this.isScanning = false;
    }
  }

  deleteEntry(entry: any, groupIndex: number, entryIndex: number) {
    const isAawak = entry.record_type === 'aawak';
    const label = isAawak ? 'Aawak (आवक)' : 'Jawak (जावक)';
    const endpoint = isAawak ? 'AAWAK' : 'JAWAK';
    
    Swal.fire({
      title: `Delete ${label} Entry?`,
      text: `Are you sure you want to delete this ${label} entry (Voucher: ${entry.voucher_no || 'N/A'}, ID: ${entry._id})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete It!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl(endpoint) + '/' + entry._id).subscribe((res: any) => {
          if (res.success || res.status) {
            this.toastr.success(`${label} record deleted successfully.`);
            const group = this.duplicateGroups[groupIndex];
            if (group) {
              group.entries.splice(entryIndex, 1);
              group.match_count = group.entries.length;
              if (group.entries.length < 2) {
                this.duplicateGroups.splice(groupIndex, 1);
              }
            }
          } else {
            this.toastr.error(res.message || 'Delete failed.');
          }
        }, err => {
          this.toastr.error(err?.error?.message || err?.message || 'Delete failed.');
        });
      }
    });
  }

  editEntry(entry: any) {
    this.editData = JSON.parse(JSON.stringify(entry));
    if (entry.record_type === 'aawak') {
      this.showModal = 'Edit Aawak';
    } else {
      this.showModal = 'Edit Jawak';
    }
    setTimeout(() => {
      $('#showModal').modal('show');
    }, 50);
  }

  closeEditModal() {
    $('#showModal').modal('hide');
    this.showModal = '';
    this.editData = null;
  }

  onEditResponse(res: any) {
    $('#showModal').modal('hide');
    this.showModal = '';
    this.editData = null;
    if (res) {
      this.toastr.success('Entry updated successfully!');
      this.runScanStream();
    }
  }

  async runResolution() {
    if (!this.mismatches || this.mismatches.length === 0 || !this.selectedTest) return;
    this.isResolving = true;
    this.logs = [];
    this.logs.push('Starting mismatch resolution process...');
    this.scrollConsoleToBottom();

    try {
      const stream = await this.integrityService.resolveStream(this.mismatches, this.selectedTest.id);
      if (!stream) {
        this.logs.push('[Error] Could not initialize log stream.');
        this.isResolving = false;
        this.scrollConsoleToBottom();
        return;
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'log') {
              this.logs.push(data.message);
              this.scrollConsoleToBottom();
            } else if (data.type === 'complete') {
              this.logs.push(`[Complete] Resolution complete. Resolved count: ${data.count}`);
              this.toastr.success(`Resolved ${data.count} mismatch records!`);
              this.mismatches = [];
              this.scrollConsoleToBottom();
            }
          } catch (e) {
            console.error('Failed to parse log chunk', line, e);
          }
        }
      }
    } catch (err: any) {
      this.logs.push(`[Fatal Error] ${err.message}`);
      this.toastr.error('Resolution failed.');
      this.scrollConsoleToBottom();
    } finally {
      this.isResolving = false;
    }
  }

  async rebuildFullBachat() {
    const result = await Swal.fire({
      title: 'Rebuild All Bachat Summary Tables?',
      text: 'This will clear all bachat & bachat_new tables and recalculate stock from scratch for all Aawaks and Jawaks across all departments. Continue?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Rebuild Everything!'
    });

    if (!result.isConfirmed) return;

    this.isResolving = true;
    this.logs = [];
    this.logs.push('Starting Full Bachat & Bachat_New Rebuild process...');
    this.scrollConsoleToBottom();

    try {
      const stream = await this.integrityService.rebuildBachatStream();
      if (!stream) {
        this.logs.push('[Error] Could not initialize log stream.');
        this.isResolving = false;
        this.scrollConsoleToBottom();
        return;
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'log') {
              this.logs.push(data.message);
              this.scrollConsoleToBottom();
            } else if (data.type === 'complete') {
              this.logs.push(`[Complete] Full Bachat Rebuild complete. Processed count: ${data.count}`);
              this.toastr.success(`Full Bachat Summary Rebuilt successfully! (${data.count} entries processed)`);
              if (this.selectedTest) {
                this.runScan();
              }
              this.scrollConsoleToBottom();
            }
          } catch (e) {
            console.error('Failed to parse log chunk', line, e);
          }
        }
      }
    } catch (err: any) {
      this.logs.push(`[Fatal Error] ${err.message}`);
      this.toastr.error('Rebuild failed.');
      this.scrollConsoleToBottom();
    } finally {
      this.isResolving = false;
    }
  }

  private scrollToResults() {
    this.gs.smoothScrollTo(this.resultsSection);
  }

  private scrollConsoleToBottom() {
    setTimeout(() => {
      if (this.consoleBox) {
        this.consoleBox.nativeElement.scrollTop = this.consoleBox.nativeElement.scrollHeight;
      }
    }, 50);
  }
}

