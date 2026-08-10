import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IntegrityCheckupService } from 'src/app/services/integrity-checkup.service';
import { AuthService } from 'src/app/services/auth.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-integrity-checkup',
  templateUrl: './integrity-checkup.component.html',
  styleUrls: ['./integrity-checkup.component.scss']
})
export class IntegrityCheckupComponent implements OnInit {
  @ViewChild('consoleBox') private consoleBox!: ElementRef;

  tests: any[] = [];
  selectedTest: any = null;
  mismatches: any[] = [];
  logs: string[] = [];
  
  isScanning: boolean = false;
  isResolving: boolean = false;
  hasRunScan: boolean = false;

  constructor(
    private integrityService: IntegrityCheckupService,
    private toastr: ToastrService,
    public auth: AuthService
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
      }
    }, err => {
      this.toastr.error('Failed to load integrity tests.');
    });
  }

  selectTest(test: any) {
    this.selectedTest = test;
    this.mismatches = [];
    this.logs = [];
    this.hasRunScan = false;
  }

  runScan() {
    if (!this.selectedTest) return;
    this.isScanning = true;
    this.mismatches = [];
    this.logs = [];
    this.logs.push(`Starting integrity scan for test: ${this.selectedTest.name}...`);

    this.integrityService.scan(this.selectedTest.id).subscribe((res: any) => {
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
        }
        this.scrollConsoleToBottom();
      }
    }, err => {
      this.isScanning = false;
      this.logs.push(`[Error] Scan failed: ${err.message}`);
      this.toastr.error('Integrity scan failed.');
      this.scrollConsoleToBottom();
    });
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
        
        // Keep the last partial line in the buffer
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

  private scrollConsoleToBottom() {
    setTimeout(() => {
      if (this.consoleBox) {
        this.consoleBox.nativeElement.scrollTop = this.consoleBox.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
