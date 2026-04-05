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

  dictTypes: any = null;


  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    protected gs: GlobalService,
    private excelExportService: ExcelExportService,
    public auth: AuthService,
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
    switch (this.Type) {
      case 'mm': this.settings = this.auth.webUser.settings.mm;
        this.setMMFields();
        this.apiName = 'MM';
        break;
      case 'country': this.setCountryFields();
        this.apiName = 'COUNTRY';
        break;
      case 'zone': this.setZoneFields();
        this.apiName = 'ZONE';
        break;
      case 'district': this.setDistrictFields();
        this.apiName = 'DISTRICT';
        break;
      case 'state': this.setStateFields();
        this.apiName = 'STATE';
        break;
      case 'category': this.settings = this.auth.webUser.settings.category;
        this.setCategoryFields();
        this.apiName = 'CATEGORY';
        break;
      case 'unit': this.setUnitFields();
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
        this.setSupportListFields();
        this.apiName = 'SUPPORTLIST';
        this.importType = 'support_list'
        break;
      case 'subitem_list': this.settings = this.auth.webUser.settings.item;
        this.setSubitemListFields();
        this.apiName = 'SUBITEMLIST';
        break;
      case 'department': this.settings = this.auth.webUser.settings.department;
        this.setDepartmentFields();
        this.apiName = 'DEPARTMENT';
        break;
      case 'jawak': this.setJawakFields();
        this.apiName = 'JAWAK';
        break;
      case 'lot_no': this.setLotNoFields();
        this.apiName = 'LIST';
        break;
      case 'dict': this.setDictFields();
        this.apiName = 'DICT';
        break;
    }
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
    if (this.apiName == 'SUPPORTLIST') {
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
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.isLocal) {
          this.records.splice(i, 1);
          this.toastr.success('deleted successfully.');
          this.isLoader = false;
        } else {
          this.http.delete(this.api.getUrl(this.apiName) + '/' + id).subscribe((data: any) => {
            if (data['success']) {
              this.isLoader = false;
              this.records.splice(i, 1);
              this.toastr.success('deleted successfully.');
            }
            else {
              this.toastr.error(data['message']);
              this.isLoader = false;
            }
          }, err => {
            this.toastr.error(err['error']);
          });
        }
      }
    });
    this.isLoader = false;
  }


  setSupportListFields() {
    this.fields = [
      {
        title: "Name(Hin)",
        columns: ["list_name_hin"]
      }, {
        title: "Name(Eng)",
        columns: ["list_name_eng"]
      }
    ]
    if (this.settings && this.settings.list_name_roman) {
      this.fields.push({
        title: "Name(Roman)",
        columns: ["list_name_roman"]
      });
    }

  }

  setDictFields() {
    this.fields = [
      {
        title: "Type",
        columns: ["type"]
      }, {
        title: "name",
        columns: ["name"]
      }, {
        title: "Extra Note",
        columns: ["extra_note"]
      }, {
        title: "Original Name",
        columns: ["original_name"]
      }, {
        title: "Sub Name",
        columns: ["sub_name"]
      }
    ]

  }

  setDepartmentFields() {
    this.fields = [
      {
        title: "Name(Hin)",
        columns: ["dept_hin"]
      }, {
        title: "Name(Eng)",
        columns: ["dept_eng"]
      }, {
        title: "Code",
        columns: ["dept_code"]
      }
    ]
  }

  setCategoryFields() {
    this.fields = [
      {
        title: "Category(Hin)",
        columns: ["category_hin"]
      }
    ]
    if (this.settings && this.settings.category_eng) {
      this.fields.push({
        title: "Category(Eng)",
        columns: ["category_eng"]
      });
    }
    if (this.settings && this.settings.category_roman) {
      this.fields.push({
        title: "Category(Roman)",
        columns: ["category_roman"]
      });
    }
  }

  setCountryFields() {
    this.fields = [
      {
        title: "Country(Hin)",
        columns: ["country_hin"]
      }, {
        title: "Country(Eng)",
        columns: ["country_eng"]
      }
    ]
  }

  setUnitFields() {
    this.fields = [
      {
        title: "Unit(Full)",
        columns: ["unit_full"]
      }, {
        title: "Unit(Short)",
        columns: ["unit_short"]
      }
    ]
  }

  setMMFields() {
    this.fields = [
      {
        title: "MM(Hin)",
        columns: ["mm_hin"]
      }
    ]
    if (this.settings && this.settings.mm_eng) {
      this.fields.push({
        title: "MM(Eng)",
        columns: ["mm_eng"]
      });
    }
    if (this.settings && this.settings.mm_roman) {
      this.fields.push({
        title: "MM(Roman)",
        columns: ["mm_roman"]
      });
    }
    if (this.settings && this.settings.mm_code) {
      this.fields.push({
        title: "MM Code",
        columns: ["mm_code"]
      });
    }
    this.fields.push(...[{
      title: "MM Type",
      columns: ["mm_type"]
    }, {
      title: "Parent MM",
      columns: ["parent_mm_hin", "parent_mm_eng", "parent_mm_code"]
    }, {
      title: "State",
      columns: ["state_hin", "state_eng"]
    }, {
      title: "Opening Date",
      columns: ["opening_date"]
    }]);


  }

  setZoneFields() {
    this.fields = [
      {
        title: "Zone(Hin)",
        columns: ["zone_hin"]
      }, {
        title: "Zone(Eng)",
        columns: ["zone_eng"]
      }, {
        title: "Country",
        columns: ["country_hin", "country_eng"]
      }
    ]
  }

  setDistrictFields() {
    this.fields = [
      {
        title: "District(Hin)",
        columns: ["district_hin"]
      }, {
        title: "District(Eng)",
        columns: ["district_eng"]
      }, {
        title: "State",
        columns: ["state_hin", "state_eng"]
      }, {
        title: "Country",
        columns: ["country_hin", "country_eng"]
      }
    ]
  }

  setStateFields() {
    this.fields = [
      {
        title: "State(Hin)",
        columns: ["state_hin"]
      }, {
        title: "State(Eng)",
        columns: ["state_eng"]
      }, {
        title: "Zone",
        columns: ["zone_hin", "zone_eng"]
      }, {
        title: "Country",
        columns: ["country_hin", "country_eng"]
      }
    ]
  }

  setSubitemListFields() {
    this.fields = [
      {
        title: "Subitem(Hin)",
        columns: ["subitem_hin"]
      }
    ]
    if (this.settings && this.settings.subitem_eng) {
      this.fields.push({
        title: "Subitem(Eng)",
        columns: ["subitem_eng"]
      });
    }
    if (this.settings && this.settings.subitem_roman) {
      this.fields.push({
        title: "Subitem(Roman)",
        columns: ["subitem_roman"]
      });
    }
  }


  setJawakFields() {
    this.fields = [
      {
        title: "Date",
        columns: ["date"]
      }, {
        title: "Pkt No.",
        columns: ["pkt_num"]
      }, {
        title: "Jawak MM",
        columns: ["jawak_mm_hin", "jawak_mm_eng"]
      }, {
        title: "Item",
        columns: ["item_hin", "subitem_hin", "item_eng", "subitem_eng"]
      }, {
        title: "Qty",
        columns: ["qty", "unit_short"]
      }, {
        title: "Item Detail",
        columns: ["item_detail"]
      }, {
        title: "Jawak Type",
        columns: ["jawak_type_hin", "jawak_type_eng"]
      }, {
        title: "Description",
        columns: ["description"]
      }, {
        title: "Nimitt",
        columns: ["nimitt_hin"]
      }
    ]
  }

  setLotNoFields() {
    this.fields = [
      {
        title: "Date",
        columns: ["date"]
      }, {
        title: "Lot No.",
        columns: ["lot_no"]
      }, {
        title: "MM",
        columns: ["mm_hin"]
      }, {
        title: "Aawak MM",
        columns: ["aawak_mm_hin"]
      }, {
        title: "Item - Subitem",
        columns: ["item_hin", "subitem_hin"]
      }, {
        title: "Qty",
        columns: ["qty", "unit_short"]
      }, {
        title: "Rate",
        columns: ["rate"]
      }, {
        title: "Aawak Source",
        columns: ["aawak_source_hin"]
      }, {
        title: "Aawak Type",
        columns: ["aawak_type_hin"]
      }
    ]
  }

  setDictionaryFields() {
    this.fields = [
      {
        title: "Excle Name",
        columns: ["name"]
      }, {
        title: "Actual Name",
        columns: ["act_name"]
      }, {
        title: "Extra Note",
        columns: ["extra_note"]
      }
    ]
  }


}
