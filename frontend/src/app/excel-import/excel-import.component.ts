import { Component, OnInit } from '@angular/core';
import { ExcelImportService } from '../services/excel-import.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-excel-import',
  templateUrl: './excel-import.component.html',
  styleUrls: ['./excel-import.component.scss']
})
export class ExcelImportComponent implements OnInit {
  importType: any;
  isLoader: any = false;
  items: any = [];
  products: any = [];
  productsAll: any = [];
  itemAll: any = [];
  subitems: any = [];
  units: any = [];
  states: any = [];
  mms: any = [];
  conditions: any = [];
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
  stepNo: any = 0;
  excelData: any = [];
  unmatchedData: any = [];
  newInsertedData: any = [];
  duplicateDate: any = [];
  willUpdateData: any = [];
  rejectedData: any = [];
  settings: any;
  constructor(
    public EIService: ExcelImportService,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.gs.observeList().subscribe(result => {
      this.itemAll = result.itemmix ? result.itemmix : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      // this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });
    this.settings = this.auth.webUser.settings;
  }

  ngOnInit(): void {
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
            row[this.headerConfig[j].name] = this.excelArr[i][this.headerConfig[j].index];
          }
        }
        // push object into array.
        this.excelArrObj.push(row);
      }
    }
    this.stepNo = 2;
    this.isLoader = false;
  }

  verifyExcelData() {
    this.isLoader = true;
    this.http.put(this.api.getUrl('EXCELIMPORT') + 'verify/' + this.auth.webUser.dept_id, { excelData: this.excelArrObj, config: this.headerConfig }).subscribe((res: any) => {
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

    for (let i in this.excelArrObj) {
      for (let j in conf) {
        if (this.excelArrObj[i][conf[j].name] == data.value) {
          this.excelArrObj[i][conf[j].ref_field] = data.id;
        }
      }
    }
    this.unmatchedData[index].done = true;
  }

  finalImport() {
    this.swHeaderList = this.getSwHeaderList();
    if (this.unmatchedData.length > 0) {

    }
    for (let i in this.excelArrObj) {
      this.http.put(this.api.getUrl('EXCELIMPORT') + 'final/' + this.auth.webUser.dept_id, { importType: this.importType, headerList: this.headerList, excelData: this.excelArrObj[i] }).subscribe((res: any) => {
        console.log(res);
        switch (res.result.status) {
          case 'inserted': this.newInsertedData.push(res.result.data)
            break;
          case 'update': this.willUpdateData.push(res.result.data)
            break;
          case 'duplicate': this.duplicateDate.push(res.result.data)
            break;
          default:
        }

      });
    }

  }

  updateData() {
    for (let i in this.willUpdateData) {
      this.http.put(this.api.getUrl('EXCELIMPORT') + 'update/' + this.auth.webUser.dept_id, { importType: this.importType, headerList: this.headerList, excelData: this.willUpdateData[i] }).subscribe((res: any) => {
        console.log(res);
        this.willUpdateData[i].status = true;

      });
    }
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

}
