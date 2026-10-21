import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { TableFieldsService } from 'src/app/services/table-fields.service';
import { SelectionService } from 'src/app/services/selection.service';
declare var $: any;

@Component({
  selector: 'app-data-view',
  templateUrl: './data-view.component.html',
  styleUrls: ['./data-view.component.scss']
})
export class DataViewComponent implements OnInit {

  @Input() getData: any;
  @Input() Type: any = "";
  @Input() isEdit: any;
  @Input() isLocal: boolean = false;
  @Output() response = new EventEmitter();
  isLoader: boolean = false;
  fields: any = [];
  records: any;
  recordsAll: any;
  apiName: any;
  term: any;
  editData: any;
  showModal: string = "";
  importType: string = '';
  settings: any = null;
  delType: any = null;
  delID: any = null;
  dictTypes: any = null;
  states: any[] = [];
  countries: any[] = [];
  filterStateIds: any[] = [];
  filterCountryIds: any[] = [];


  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    protected gs: GlobalService,
    private excelExportService: ExcelExportService,
    public auth: AuthService,
    private tableFieldsService: TableFieldsService,
    public selectionService: SelectionService,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    // this.Type = this.route.snapshot.paramMap.get('type');
    this.route.paramMap.subscribe(params => {
      if (params.get('type')) {
        this.Type = params.get('type');
        this.importType = '';
        this.records = null;
        this.configureType();
      }
    });

    this.auth.settingsUpdated$.subscribe(() => {
      this.configureType();
    });

    this.gs.observeList().subscribe((lists: any) => {
      if (lists) {
        this.states = lists.state ? [...lists.state] : [];
        this.countries = lists.country ? [...lists.country] : [];
        if (this.Type === 'district') {
          this.enrichFilterListsFromRecords();
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("changes", changes);
    if (changes.getData?.currentValue) {
      this.records = changes.getData.currentValue;
    }
    if (changes.Type?.currentValue) {
      this.Type = changes.Type.currentValue;
      this.configureType();
    }
    console.log(this.records, this.Type);
  }


  configureType() {
    this.settings = null;
    this.filterStateIds = [];
    this.filterCountryIds = [];
    let tableName = this.Type;

    switch (this.Type) {
      case 'mm': this.settings = this.auth.webUser?.settings?.mm;
        this.apiName = 'MM';
        break;
      case 'country':
        this.settings = this.auth.webUser?.settings?.country;
        this.apiName = 'COUNTRY';
        break;
      case 'zone':
        this.settings = this.auth.webUser?.settings?.zone;
        this.apiName = 'ZONE';
        break;
      case 'district':
        this.settings = this.auth.webUser?.settings?.district;
        this.apiName = 'DISTRICT';
        break;
      case 'state':
        this.settings = this.auth.webUser?.settings?.state;
        this.apiName = 'STATE';
        break;
      case 'city':
        this.settings = this.auth.webUser?.settings?.city;
        this.apiName = 'CITY';
        break;
      case 'category': this.settings = this.auth.webUser?.settings?.category;
        this.apiName = 'CATEGORY';
        break;
      case 'unit':
        this.settings = this.auth.webUser?.settings?.unit;
        this.apiName = 'UNIT';
        break;
      case 'point':
        this.settings = this.auth.webUser?.settings?.point;
        this.apiName = 'POINT';
        break;
      case 'gender':
      case 'mm_type':
      case 'relation':
      case 'status':
      case 'aawak_type':
      case 'aawak_source':
      case 'usage_list':
      case 'jawak_type':
      case 'condition':
      case 'prastav_type': this.settings = this.auth.webUser?.settings?.support_list;
        this.apiName = 'SUPPORTLIST';
        this.importType = 'support_list';
        tableName = 'support_list';
        break;
      case 'subitem_list': this.settings = this.auth.webUser?.settings?.subitem_list || this.auth.webUser?.settings?.item;
        this.apiName = 'SUBITEMLIST';
        break;
      case 'department': this.settings = this.auth.webUser?.settings?.department;
        this.apiName = 'DEPARTMENT';
        break;
      case 'jawak':
        this.apiName = 'JAWAK';
        break;
      case 'lot_no':
        this.apiName = 'LIST';
        break;
      case 'dict':
        this.apiName = 'DICT';
        break;
    }

    // Use the central service for fields setup
    this.fields = this.tableFieldsService.getFieldsForTable(tableName, this.settings);
    if (!this.importType) {
      this.importType = this.Type;
    }
    if (!this.records) {
      this.getDataFromDB();
    }

  }

  getDataFromDB() {
    this.isLoader = true;
    if (this.apiName == 'SUPPORTLIST') {
      this.gs.observeList().subscribe((Lists: any) => {
        this.records = Lists[this.Type] ? Lists[this.Type] : []
      })
    } else if (this.apiName == 'LIST') {
      this.http.get(this.api.getUrl(this.apiName) + 'lot_no/' + this.auth.webUser.dept_id).subscribe((data) => {
        if (data['result'] && data['success']) {
          this.records = data['result'];
        }
        this.isLoader = false;
      });
    } else {
      this.http.get(this.api.getUrl(this.apiName) + this.auth.webUser.dept_id).subscribe({
        next: (data: any) => {
          if (data['result'] && data['success']) {
            this.recordsAll = data['result'];
            this.records = this.recordsAll;
            // console.log("hi", new Set(this.recordsAll.map((item: { type: any; }) => item.type)));
            this.dictTypes = [...new Set(this.recordsAll.map((item: { type: any; }) => item.type))];
            if (this.Type === 'district') {
              this.enrichFilterListsFromRecords();
              if (this.filterStateIds?.length || this.filterCountryIds?.length) {
                this.applyCustomFilters();
              }
            }
          } else {
            this.toastr.error(data?.message || 'Failed to load data');
          }
          this.isLoader = false;
        },
        error: (err: any) => {
          this.toastr.error(err?.error?.message || err?.message || 'Error loading data');
          this.isLoader = false;
        }
      });
    }
    this.isLoader = false;
  }

  filterDictionary(ev: any) {
    if (ev) {
      this.records = this.recordsAll.filter((r: { type: any; }) => r.type == ev);
    } else {
      this.records = this.recordsAll
    }

  }

  closeModal() {
    this.showModal = "";
    $('#dataViewComponent > #showModal').modal('hide');
  }

  openModal(type: string) {
    if (this.apiName == 'SUPPORTLIST' && type != 'delete_advance' && type != 'excel_import') {
      this.showModal = 'support_list';
    } else {
      this.showModal = type;
    }
    $('#dataViewComponent > #showModal').modal('show');
  }

  edit(data: any) {
    this.isEdit = true;
    this.editData = data;
    this.openModal(this.Type);
  }

  add() {
    this.isEdit = false;
    this.editData = null;
    this.openModal(this.Type)
  }

  editResponse(ev: any) {
    if (ev._id) {
      if (this.Type === 'district' && ev.state_id) {
        this.enrichRecordWithLocation(ev);
      }
      if (this.isEdit) {
        for (let i in this.records) {
          if (this.records[i]._id == ev._id) {
            this.records[i] = ev;
          }
        }
        if (this.recordsAll && this.recordsAll !== this.records) {
          for (let i in this.recordsAll) {
            if (this.recordsAll[i]._id == ev._id) {
              this.recordsAll[i] = ev;
            }
          }
        }
      } else if (this.apiName != 'SUPPORTLIST') {
        this.records.unshift(ev);
        if (this.recordsAll && this.recordsAll !== this.records) {
          this.recordsAll.unshift(ev);
        }
      }
      if (this.Type === 'district' && (this.filterStateIds?.length || this.filterCountryIds?.length)) {
        this.applyCustomFilters();
      }
    }
    this.closeModal();
  }

  exportToExcel() {
    this.isLoader = true;
    let date = new Date();
    let exportData: any = [];
    for (let i = 0; i < this.records.length; i++) {
      let row: any = {};
      for (let field of this.fields) {
        for (let col of field.columns) {
          row[col] = this.records[i][col] ? this.records[i][col] : '';
        }
      }
      exportData.push(row);
    }

    this.excelExportService.exportAsExcelFile(exportData, this.Type + '_' + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
    this.isLoader = false;
  }


  async delete(i: any, id: any) {
    if (this.Type && this.Type.toLowerCase() === 'jawak') {
      const confirm = await Swal.fire({
        title: 'Delete Jawak Entry?',
        text: 'Are you sure you want to delete this Jawak entry? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (confirm.isConfirmed) {
        this.isLoader = true;
        this.http.delete(this.api.getUrl('JAWAK') + id).subscribe((res: any) => {
          this.isLoader = false;
          if (res && res.success) {
            this.toastr.success('Jawak deleted successfully.');
            if (Array.isArray(this.records)) {
              this.records = this.records.filter((r: any) => r._id != id);
            }
            this.response.emit({ action: 'delete', id });
          } else {
            this.toastr.error(res?.message || 'Failed to delete Jawak.');
          }
        }, err => {
          this.isLoader = false;
          this.toastr.error('Error deleting Jawak.');
        });
      }
      return;
    }

    this.delID = id;
    this.delType = this.Type;
    this.openModal('delete_advance');
  }

  async deleteSelected() {
    const selectedIds = this.selectionService.getSelected('data-view-' + this.Type);
    if (!selectedIds || selectedIds.length === 0) {
      this.toastr.warning('Please select at least one item to delete.');
      return;
    }

    if (this.Type && this.Type.toLowerCase() === 'jawak') {
      const confirm = await Swal.fire({
        title: `Delete ${selectedIds.length} Selected Jawak Entries?`,
        text: 'Are you sure you want to delete these Jawak entries? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete them!'
      });

      if (confirm.isConfirmed) {
        this.isLoader = true;
        let deletedCount = 0;
        const promises = selectedIds.map((id: any) =>
          this.http.delete(this.api.getUrl('JAWAK') + id).toPromise()
        );

        try {
          await Promise.all(promises);
          this.isLoader = false;
          this.toastr.success(`${selectedIds.length} Jawak entries deleted successfully.`);
          if (Array.isArray(this.records)) {
            this.records = this.records.filter((r: any) => !selectedIds.includes(r._id));
          }
          this.selectionService.clear('data-view-' + this.Type);
          this.response.emit({ action: 'deleteSelected', ids: selectedIds });
        } catch (e) {
          this.isLoader = false;
          this.toastr.error('Error deleting selected Jawak entries.');
        }
      }
      return;
    }

    this.delID = selectedIds;
    this.delType = this.Type;
    this.openModal('delete_advance');
  }

  deleteResponse(ev: any) {
    if (ev) {
      this.selectionService.clear('data-view-' + this.Type);
      this.closeModal();
      this.toastr.success(this.Type + " deleted successfully.");
      this.getDataFromDB();
    }
  }

  autoAssignZones() {
    Swal.fire({
      title: 'Auto Assign Zones?',
      text: 'This will remove all existing zones, reset state zone assignments to NULL, then auto-create standard Indian Zones and assign states. Continue?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffbc00',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Reset & Auto Assign'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoader = true;
        this.http.post(this.api.getUrl('ZONE') + 'auto-assign', {}).subscribe({
          next: (res: any) => {
            this.isLoader = false;
            if (res && res.success) {
              this.toastr.success(res.message || 'Zones auto assigned successfully.');
              this.getDataFromDB();
              this.gs.observeList(true).subscribe();
            } else {
              this.toastr.error(res.message || 'Failed to auto assign zones.');
            }
          },
          error: (err: any) => {
            this.isLoader = false;
            this.toastr.error(err.error?.message || 'Error occurred while auto assigning zones.');
          }
        });
      }
    });
  }

  // --- District Custom Filter Logic (State & Country) ---

  get filteredStates(): any[] {
    if (!this.filterCountryIds || this.filterCountryIds.length === 0) {
      return this.states;
    }
    const countryIds = this.filterCountryIds.map((id: any) => String(id));
    return (this.states || []).filter((st: any) => countryIds.includes(String(st.country_id)));
  }

  onCountryFilterChange() {
    if (this.filterCountryIds?.length && this.filterStateIds?.length) {
      const validStateIds = new Set(this.filteredStates.map((s: any) => String(s._id)));
      this.filterStateIds = this.filterStateIds.filter((id: any) => validStateIds.has(String(id)));
    }
    this.applyCustomFilters();
  }

  applyCustomFilters() {
    if (!this.recordsAll) return;
    let filtered = [...this.recordsAll];

    if (this.filterCountryIds && this.filterCountryIds.length > 0) {
      const countryIds = this.filterCountryIds.map((id: any) => String(id));
      filtered = filtered.filter((r: any) => {
        if (r.country_id != null) {
          return countryIds.includes(String(r.country_id));
        }
        const st = this.states.find((s: any) => String(s._id) === String(r.state_id));
        return st && countryIds.includes(String(st.country_id));
      });
    }

    if (this.filterStateIds && this.filterStateIds.length > 0) {
      const stateIds = this.filterStateIds.map((id: any) => String(id));
      filtered = filtered.filter((r: any) => stateIds.includes(String(r.state_id)));
    }

    this.records = filtered;
    this.selectionService.clear('data-view-' + this.Type);
  }

  clearStateFilter() {
    this.filterStateIds = [];
    this.applyCustomFilters();
  }

  clearCountryFilter() {
    this.filterCountryIds = [];
    this.applyCustomFilters();
  }

  clearAllCustomFilters() {
    this.filterStateIds = [];
    this.filterCountryIds = [];
    this.applyCustomFilters();
  }

  getSelectedCountryNames(): string[] {
    if (!this.filterCountryIds?.length) return [];
    return this.filterCountryIds.map((id: any) => {
      const c = this.countries.find((item: any) => String(item._id) === String(id));
      return c ? (c.country_hin ? `${c.country_hin} : ${c.country_eng}` : c.country_eng) : String(id);
    });
  }

  getSelectedStateNames(): string[] {
    if (!this.filterStateIds?.length) return [];
    return this.filterStateIds.map((id: any) => {
      const s = this.states.find((item: any) => String(item._id) === String(id));
      return s ? (s.state_hin ? `${s.state_hin} : ${s.state_eng}` : s.state_eng) : String(id);
    });
  }

  removeSelectedCountry(index: number) {
    this.filterCountryIds.splice(index, 1);
    this.onCountryFilterChange();
  }

  removeSelectedState(index: number) {
    this.filterStateIds.splice(index, 1);
    this.applyCustomFilters();
  }

  enrichFilterListsFromRecords() {
    if (this.Type !== 'district' || !Array.isArray(this.recordsAll)) return;

    if (!this.states || this.states.length === 0) {
      const stateMap = new Map();
      for (const r of this.recordsAll) {
        if (r.state_id && !stateMap.has(r.state_id)) {
          stateMap.set(r.state_id, {
            _id: r.state_id,
            state_hin: r.state_hin,
            state_eng: r.state_eng,
            country_id: r.country_id
          });
        }
      }
      this.states = Array.from(stateMap.values());
    } else {
      for (const st of this.states) {
        if (!st.country_id) {
          const match = this.recordsAll.find((r: any) => String(r.state_id) === String(st._id) && r.country_id);
          if (match) {
            st.country_id = match.country_id;
          }
        }
      }
    }

    if (!this.countries || this.countries.length === 0) {
      const countryMap = new Map();
      for (const r of this.recordsAll) {
        if (r.country_id && !countryMap.has(r.country_id)) {
          countryMap.set(r.country_id, {
            _id: r.country_id,
            country_hin: r.country_hin,
            country_eng: r.country_eng
          });
        }
      }
      this.countries = Array.from(countryMap.values());
    }
  }

  enrichRecordWithLocation(rec: any) {
    const matchedState = this.states.find((s: any) => String(s._id) === String(rec.state_id));
    if (matchedState) {
      rec.state_hin = rec.state_hin || matchedState.state_hin;
      rec.state_eng = rec.state_eng || matchedState.state_eng;
      rec.country_id = rec.country_id || matchedState.country_id;
      const matchedCountry = this.countries.find((c: any) => String(c._id) === String(rec.country_id));
      if (matchedCountry) {
        rec.country_hin = rec.country_hin || matchedCountry.country_hin;
        rec.country_eng = rec.country_eng || matchedCountry.country_eng;
      }
    }
  }

}
