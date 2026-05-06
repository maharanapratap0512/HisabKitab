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


  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    protected gs: GlobalService,
    private excelExportService: ExcelExportService,
    public auth: AuthService,
    private tableFieldsService: TableFieldsService,
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
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("changes", changes);
    if (changes.getData.currentValue) {
      this.records = changes.getData.currentValue;
    }
    if (changes.Type.currentValue) {
      this.Type = changes.Type.currentValue;
      this.configureType();
    }
    console.log(this.records, this.Type);
  }


  configureType() {
    this.settings = null;
    let tableName = this.Type;
    
    switch (this.Type) {
      case 'mm': this.settings = this.auth.webUser.settings.mm;
        this.apiName = 'MM';
        break;
      case 'country': 
        this.apiName = 'COUNTRY';
        break;
      case 'zone': 
        this.apiName = 'ZONE';
        break;
      case 'district': 
        this.apiName = 'DISTRICT';
        break;
      case 'state': 
        this.apiName = 'STATE';
        break;
      case 'category': this.settings = this.auth.webUser.settings.category;
        this.apiName = 'CATEGORY';
        break;
      case 'unit': 
        this.apiName = 'UNIT';
        break;
      case 'gender':
      case 'mm_type':
      case 'relation':
      case 'status':
      case 'aawak_type':
      case 'aawak_source':
      case 'usage_list':
      case 'jawak_type':
      case 'condition': this.settings = this.auth.webUser.settings.support_list;
        this.apiName = 'SUPPORTLIST';
        this.importType = 'support_list';
        tableName = 'support_list';
        break;
      case 'subitem_list': this.settings = this.auth.webUser.settings.item;
        this.apiName = 'SUBITEMLIST';
        break;
      case 'department': this.settings = this.auth.webUser.settings.department;
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
      this.http.get(this.api.getUrl(this.apiName) + this.auth.webUser.dept_id).subscribe((data) => {
        if (data['result'] && data['success']) {
          this.recordsAll = data['result'];
          this.records = this.recordsAll;
          // console.log("hi", new Set(this.recordsAll.map((item: { type: any; }) => item.type)));
          this.dictTypes = [...new Set(this.recordsAll.map((item: { type: any; }) => item.type))]
        }
        this.isLoader = false;
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
      if (this.isEdit) {
        for (let i in this.records) {
          if (this.records[i]._id == ev._id) {
            this.records[i] = ev;
          }
        }
      } else if (this.apiName != 'SUPPORTLIST') {
        this.records.unshift(ev);
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


  delete(i: any, id: any) {
    this.delID = id;
    this.delType = this.Type;
    this.openModal('delete_advance');
  }

  deleteResponse(ev: any) {
    if (ev) {
      this.closeModal();
      this.toastr.success(this.Type + " deleted successfully.");
      this.getDataFromDB();
    }
  }

}
