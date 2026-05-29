import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { TableFieldsService } from '../../services/table-fields.service';
import { AuthService } from '../../services/auth.service';
declare var $: any;

@Component({
  selector: 'app-db-generate',
  templateUrl: './db-generate.component.html',
  styleUrls: ['./db-generate.component.scss']
})
export class DbGenerateComponent implements OnChanges {
  @Input() dept_id: any;

  config: any = {};
  tableKeys: string[] = [];

  skippedTables: Set<string> = new Set();
  activeTable: string = '';

  tableData: any[] = [];
  tableColumns: any[] = [];
  searchTerm: string = '';

  // format: { tableName: Set<number | string> }
  selections: any = {};
  deptConf: any = {};

  isLoader = false;

  constructor(
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private tableFieldsService: TableFieldsService,
    public auth: AuthService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dept_id'] && this.dept_id) {
      this.fetchDeptConfig();
    }
  }

  openModal() {
    if (!this.dept_id) {
      this.toastr.warning('Please select a department first');
      return;
    }
    $('#dbGenerateModal').modal('show');
    this.fetchConfig();
  }

  fetchConfig() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('DEPT') + 'dbgenerate/config').subscribe((res: any) => {
      this.isLoader = false;
      if (res.success) {
        this.config = res.result;
        // Filter out 'auto' handle type tables from UI selection
        this.tableKeys = Object.keys(this.config).filter(key => this.config[key].handle_type !== 'auto');

        // Initialize selections based on config
        this.tableKeys.forEach(k => {
          if (!this.selections[k]) {
            this.selections[k] = new Set();
            if (this.deptConf[k] && this.deptConf[k].config_value) {
              let parsed = typeof this.deptConf[k].config_value === 'string' ? JSON.parse(this.deptConf[k].config_value) : this.deptConf[k].config_value;
              if (Array.isArray(parsed)) parsed.forEach((val: any) => this.selections[k].add(val));
            }
          }
        });

        // Sort keys: optional first, compulsory bottom
        this.tableKeys.sort((a, b) => {
          let aComp = this.config[a].compulsory ? 1 : 0;
          let bComp = this.config[b].compulsory ? 1 : 0;
          return aComp - bComp;
        });

        if (this.tableKeys.length > 0) {
          this.setActiveTable(this.tableKeys[0]);
        }
      }
    }, (err: any) => {
      this.isLoader = false;
      this.toastr.error('Failed to load configuration');
    });
  }

  fetchDeptConfig() {
    this.http.get(this.api.getUrl('DEPTCONFIG') + this.dept_id).subscribe((res: any) => {
      if (res.success) {
        this.deptConf = {};
        for (let item of res.result) {
          this.deptConf[item.config_key] = item;
          // populate selections from existing config if modal is already opened
          if (this.selections[item.config_key]) {
            this.selections[item.config_key].clear();
            let parsed = typeof item.config_value === 'string' ? JSON.parse(item.config_value) : item.config_value;
            if (Array.isArray(parsed)) parsed.forEach((val: any) => this.selections[item.config_key].add(val));
          }
        }
      }
    });
  }

  toggleTable(tableName: string, event: any) {
    if (event.target.checked) {
      this.skippedTables.delete(tableName);
    } else {
      this.skippedTables.add(tableName);
    }
  }

  setActiveTable(tableName: string) {
    this.activeTable = tableName;
    this.searchTerm = '';
    this.loadTableData(tableName);
  }

  loadTableData(tableName: string) {
    const tableConfig = this.config[tableName];

    // Map tableName to correct settings key
    let settingsKey = tableName;
    if (tableName === 'subitem') settingsKey = 'item';
    else if (['gender', 'mm_type', 'relation', 'status', 'aawak_type', 'aawak_source', 'usage_list', 'jawak_type', 'condition'].includes(tableName)) settingsKey = 'support_list';

    // Set table columns dynamically
    const settings = this.auth?.webUser?.settings ? this.auth.webUser.settings[settingsKey] : null;
    this.tableColumns = this.tableFieldsService.getFieldsForTable(tableName, settings);

    if (tableConfig.handle_type === 'dept_id' || tableConfig.handle_type === 'all') {
      this.tableData = []; // No manual selection needed for these
      return;
    }

    this.isLoader = true;
    this.http.get(this.api.getUrl('DEPT') + 'dbgenerate/data/' + tableName).subscribe((res: any) => {
      this.isLoader = false;
      if (res.success) {
        this.tableData = res.result;

        // Auto-select locked rows
        this.tableData.forEach(row => {
          if (row.lock == 1 || (tableConfig.lock_column && row[tableConfig.lock_column])) {
            this.selections[tableName].add(row._id);
          }
        });

        // Sort locked rows to appear first
        this.tableData.sort((a, b) => {
          let aLock = (a.lock == 1 || (tableConfig.lock_column && a[tableConfig.lock_column])) ? 1 : 0;
          let bLock = (b.lock == 1 || (tableConfig.lock_column && b[tableConfig.lock_column])) ? 1 : 0;
          return bLock - aLock;
        });
      }
    }, (err: any) => {
      this.isLoader = false;
    });
  }



  toggleRowSelection(row: any, tableName: string) {
    const tableConfig = this.config[tableName];
    // Prevent unchecking locked rows
    if (row.lock == 1 || (tableConfig.lock_column && row[tableConfig.lock_column])) return;

    if (this.selections[tableName].has(row._id)) {
      this.selections[tableName].delete(row._id);
    } else {
      this.selections[tableName].add(row._id);
    }
  }

  toggleAllRows(selectAll: boolean) {
    const tableName = this.activeTable;
    const tableConfig = this.config[tableName];

    if (selectAll) {
      this.tableData.forEach(row => this.selections[tableName].add(row._id));
    } else {
      this.tableData.forEach(row => {
        if (!(row.lock == 1 || (tableConfig.lock_column && row[tableConfig.lock_column]))) {
          this.selections[tableName].delete(row._id);
        }
      });
    }
  }

  async generateDB() {
    this.spinner.show();

    // 1. Bulk Save Selections
    let configsToSave: any = {};
    let customSelections: any = {};

    for (let k of this.tableKeys) {
      if (this.config[k].handle_type === 'department_config') {
        configsToSave[k] = Array.from(this.selections[k]);
      } else if (this.config[k].handle_type === 'custom_selection') {
        customSelections[k] = Array.from(this.selections[k]);
      }
    }

    try {
      await this.http.put(this.api.getUrl('DEPT') + 'dbgenerate/config/bulk', {
        dept_id: this.dept_id,
        configs: configsToSave
      }).toPromise();

      // 2. Call DB Generate API
      let skippedArray = Array.from(this.skippedTables);
      const res: any = await this.http.post(this.api.getUrl('DEPT') + 'dbfull/' + this.dept_id, {
        skipped_tables: skippedArray,
        custom_selections: customSelections
      }).toPromise();

      if (res && res.success && res.result && res.result.path) {
        $('#dbGenerateModal').modal('hide');
        Swal.fire({
          title: 'Database Generated',
          text: "FullPath : " + res.result.path,
          icon: 'success',
          showDenyButton: true,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Ok, Got it.',
          denyButtonText: '<i class="mdi mdi-download"></i> Download',
          denyButtonColor: '#28a745'
        }).then((result) => {
          if (result.isDenied) {
            this.downloadFile(res.result.path);
          }
        });
      } else {
        this.toastr.error('Failed to generate DB.');
      }
    } catch (err) {
      this.toastr.error('An error occurred during generation.');
      console.error(err);
    } finally {
      this.spinner.hide();
    }
  }

  downloadFile(filePath: string) {
    let fileName = filePath.split('/').pop() || 'Database.db';
    this.http.downloadData(this.api.getUrl('DOWNLOAD') + '?path=' + filePath).subscribe((blob: any) => {
      FileSaver.saveAs(blob, fileName);
    });
  }
}
