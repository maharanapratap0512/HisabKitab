import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ExcelImportService } from '../services/excel-import.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
import Swal from 'sweetalert2';
import { ExcelExportService } from '../services/excel-export.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-excel-import',
  templateUrl: './excel-import.component.html',
  styleUrls: ['./excel-import.component.scss']
})
export class ExcelImportComponent implements OnInit {
  @Input() importType: any;
  @Input() stepNo: any = 0;
  @Input() excelFile: any;
  @Output() response = new EventEmitter();
  itemsPerPage = 100;
  page1: any = 1;
  page2: any = 1;
  page_excel: any = 1;
  page_in: any = 1;
  page_up: any = 1;
  page_dp: any = 1;
  page_rj: any = 1;
  page_unmatched: any = 1;
  processedCount: any = 0;
  processing: any = false;
  progressStyle: string = "width: 0%";
  import$ = new Subject();
  update$ = new Subject();

  isLoader: any = false;
  items: any = [];
  cat: any = null;
  products: any = [];
  productsAll: any = [];
  itemAll: any = [];
  subitems: any = [];
  subitem_lists: any = [];
  units: any = [];
  states: any = [];
  districts: any = [];
  cities: any = [];
  mms: any = [];
  conditions: any = [];
  genders: any = [];
  relations: any = [];
  categories: any = [];
  pbks: any = [];
  aawak_types: any = [];
  jawak_types: any = [];
  nimitts: any = [];
  excelArr: any = [];
  excelArrObj: any = [];
  headerList: any = [];
  swHeaderList: any = [];
  headerConfig: any = [];
  secondHeader: any = false;
  header1: any = 0;
  header2: any = null;
  excelData: any = [];
  unmatchedData: any = [];
  newInsertedData: any = [];
  duplicateDate: any = [];
  willUpdateData: any = [];
  updateFailData: any = [];
  rejectedData: any = [];
  settings: any;
  constructor(
    public EIService: ExcelImportService,
    public excelExportService: ExcelExportService,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
  ) {
    this.gs.observeList().subscribe(result => {
      this.itemAll = result.itemmix ? result.itemmix : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.subitem_lists = result.subitem_list ? result.subitem_list : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.districts = result.district ? result.district : [];
      this.cities = result.city ? result.city : [];
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      this.genders = result.gender ? result.gender : [];
      this.relations = result.relation ? result.relation : [];
      // this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });
    this.settings = this.auth.webUser.settings;
  }

  ngOnInit(): void {
    if (this.importType) {
      for (let i in this.EIService.importList) {
        if (this.EIService.importList[i].name == this.importType) {
          this.importType = this.EIService.importList[i];
          this.importTypeChanged(this.EIService.importList[i]);
          break;
        }
      }
    }

    if (this.excelFile) {
      this.excelImport(this.excelFile)
    }

  }

  ngOnChange(changes: SimpleChanges) {
    console.log(changes);
    if (changes.excelFile) {
      this.excelImport(changes.excelFile)
    }
  }


  finish() {
    this.import$.complete();
    this.response.emit(true);
  }

  importTypeChanged(ev: any) {
    this.headerConfig = this.EIService.config[ev.name];
    this.secondHeader = ev.secondHeader
  }

  excelImport(ev: any) {
    if (ev) {
      let workBooks: any = null;
      const reader = new FileReader();
      const file = ev.target.files[0];
      reader.onload = (event) => {
        this.isLoader = true;
        // this.loadingStatus = "फाइल लोड की जा रही है ।";        
        const data = reader.result;
        workBooks = XLSX.read(data, { type: 'binary' });
        this.excelArr = XLSX.utils.sheet_to_json(workBooks.Sheets[workBooks.SheetNames[0]], { header: 1 });
        this.headerChanged(0)
        this.isLoader = false;
        ev = null
      }
      reader.readAsBinaryString(file);
    }
    else {
      ev = null;
    }
  }

  headerChanged(index: any) {
    // reset header found status
    for (let j in this.headerConfig) {
      this.headerConfig[j].found = false;
      this.headerConfig[j].index = null;
    }
    //matching incoming header with header set in config object.
    for (let i in this.excelArr[index]) {
      let header = this.excelArr[index][i].trim().toLowerCase();
      for (let j in this.headerConfig) {
        if (this.headerConfig[j].name == header || this.headerConfig[j].alt_names.includes(header)) {
          this.headerConfig[j].found = true;
          this.headerConfig[j].index = i;
        }
      }
    }
    //verifying that all required header are found or not?
    this.stepNo = 1;
    for (let i in this.headerConfig) {
      if (this.headerConfig[i].not_null && !this.headerConfig[i].found) {
        this.stepNo = 0;
        break;
      }
    }
  }

  setExcelToObjectArray() {
    this.isLoader = true;
    this.headerList = this.getHeaderList();
    this.excelArrObj = [];
    //loop through all rows after header row.
    for (let i = this.header1 + 1; i < this.excelArr.length; i++) {
      let row: any = {};
      //filtering blank rows, length 0 means no data in row
      if (this.excelArr[i].length) {
        //loop for all required coluns configured in service Config object for preparing row object.
        for (let j in this.headerConfig) {
          //verify header found in excel and excel columns index saved in config?
          if (this.headerConfig[j].index) {
            //assign excel data to matched object key and prepare whole row object
            if (this.headerConfig[j].type == "array") {
              row[this.headerConfig[j].col_name] = this.excelArr[i][this.headerConfig[j].index].split(",");
            } else {
              row[this.headerConfig[j].col_name] = this.excelArr[i][this.headerConfig[j].index];
            }
          }
        }
        // push object into array.
        this.excelArrObj.push(row);
      }
    }

    if (this.importType.name == 'subitem_list') {
      this.excelArrObj = this.excelArrObj.filter((e: { subitem_hin: string | null; }) => e.subitem_hin)
    } else if (this.importType.name == 'item') {
      this.excelArrObj = this.excelArrObj.filter((e: { subitem_hin: string | null; }) => !e.subitem_hin)
    } else if (this.importType.name == 'subitem') {
      this.excelArrObj = this.excelArrObj.filter((e: { subitem_hin: string | null; }) => e.subitem_hin)
    }
    this.stepNo = 2;
    this.isLoader = false;
  }

  verifyExcelData() {
    this.isLoader = true;
    this.http.put(this.api.getUrl('EXCELIMPORT') + 'verify/' + this.auth.webUser.dept_id, { importType: this.importType, excelData: this.excelArrObj, config: this.headerConfig, itemConfig: this.EIService.config.item }).subscribe((res: any) => {
      if (res && res.excelData) {
        this.excelArrObj = res.excelData;
        this.unmatchedData = res.correctionList;
        this.stepNo = 3;
      } else {
        this.toastr.error(res['message']);
        this.isLoader = false;
      }
    }, (err: any) => {
      this.toastr.error(err['error']);
      this.isLoader = false;

    });
    this.isLoader = false;
  }

  ignoreCorrection(data: any, i: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'हाँ, जी। '
    }).then((result) => {
      if (result.isConfirmed) {
        this.unmatchedData[i].ignore = true;
      }
    });

  }

  correctionSubmit(data: any, index: any) {
    let conf = this.headerList.filter((h: { ref_table: any; }) => h.ref_table == data.type);
    console.log("data", data, "conf", conf);
    console.log(this.excelArrObj);


    for (let i in this.excelArrObj) {
      for (let j in conf) {
        if (this.excelArrObj[i][conf[j].name] == data.value) {
          this.excelArrObj[i][conf[j].ref_field] = data.id;
        }
      }
    }
    this.unmatchedData[index].done = true;
    this.unmatchedData[index].ignore = false;
  }

  async processImport(i: number = 0) {
    if (await this.verifyForRejection(this.excelArrObj[i])) {
      this.rejectedData.push(this.excelArrObj[i]);
      this.import$.next(0);
    } else {
      this.http.put(this.api.getUrl('EXCELIMPORT') + 'final/' + this.auth.webUser.dept_id, { importType: this.importType, headerList: this.headerList, excelData: this.excelArrObj[i] }).subscribe((res: any) => {
        this.import$.next(res);
      }, (err: any) => {
        this.rejectedData.push(this.excelArrObj[i]);
        this.import$.next(0);
      });
    }
  }

  async finalImport() {
    this.newInsertedData = []
    this.willUpdateData = []
    this.duplicateDate = []
    this.rejectedData = []
    this.swHeaderList = this.getSwHeaderList();
    this.processedCount = 0;

    this.import$.subscribe((res: any) => {
      this.processedCount++;
      this.progressStyle = "width:" + (this.processedCount * 100) / this.excelArrObj.length + "%;";
      if (res) {
        switch (res.result.status) {
          case 'inserted': this.newInsertedData.push(res.result.data.newData)
            break;
          case 'update': this.willUpdateData.push(res.result.data)
            break;
          case 'duplicate': this.duplicateDate.push(res.result.data)
            break;
          default: this.rejectedData.push(res.result.data)
        }
      }

      if (this.excelArrObj.length > this.processedCount) {
        this.processImport(this.processedCount);
      } else {
        this.import$.complete();
        this.stepNo = 4;
        this.toastr.success("import complete. test your result")
      }

    });

    await this.processImport();

  }

  verifyForRejection(data: any) {
    for (let j in this.headerList) {
      if (this.headerList[j].not_null && !data[this.headerList[j].name]) {
        return true;
      } else if (this.headerList[j].ref_table && this.headerList[j].type == "array" && (data[this.headerList[j].name] && data[this.headerList[j].ref_field])) {
        if (data[this.headerList[j].ref_field].includes(null)) {
          return true;
        }
      } else if (this.headerList[j].ref_table && (data[this.headerList[j].name] && !data[this.headerList[j].ref_field])) {
        return true;
      }
    }
    return false;
  }

  processUpdate(i: number = 0) {
    this.http.put(this.api.getUrl('EXCELIMPORT') + 'update/' + this.auth.webUser.dept_id, { importType: this.importType, headerList: this.headerList, excelData: this.willUpdateData[i] }).subscribe((res: any) => {
      if (res.success) {
        this.willUpdateData[i].status = true;
      } else {
        this.updateFailData.push(this.willUpdateData[i]);
      }
      this.update$.next(res);
    }, (err) => {
      this.updateFailData.push(this.willUpdateData[i]);
      this.update$.next(0);
    });
  }

  updateData() {
    this.processedCount = 0;
    this.progressStyle = "width: 0%";
    this.processing = true;

    this.update$.subscribe((res: any) => {
      this.processedCount++;
      this.progressStyle = "background-color: #ffbc00 !important; width:" + (this.processedCount * 100) / this.willUpdateData.length + "%;";

      if (this.willUpdateData.length > this.processedCount) {
        this.processUpdate(this.processedCount);
      } else {
        this.update$.complete();
        this.stepNo = 5;
        this.toastr.success("Update complete, check your result");
      }
    })

    this.processUpdate();
  }

  getHeaderList() {
    return this.headerConfig.filter((h: { found: any; }) => h.found);
  }

  getSwHeaderList() {
    return this.headerConfig.map((h: { name: any; ref_data: any; found: any; }) => {
      if (h.found) {
        return h.ref_data ? h.ref_data : h.name;
      }
    });
  }

  itemSelected(ev: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);

      if (this.cat) {
        this.subitems = item.subitems.filter((s: { categories: any; }) => s.categories.includes(this.cat));
      }
      else {
        this.subitems = item.subitems;
      }
    }
    else {
      this.subitems = [];
    }
  }

  catSelected(ev: any) {
    if (ev) {
      this.cat = ev;
      this.items = this.itemAll.filter((i: { category_id: any, categories: any }) => i.category_id == ev || i.categories.includes(ev));
    }
    else {
      this.cat = null;
      this.items = this.itemAll;
    }
  }

  exportToExcel() {
    let date = new Date();

    this.excelExportService.exportAsExcelFile(this.rejectedData, this.importType.name + '_rejected_excel_import_data_' + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
  }

}
