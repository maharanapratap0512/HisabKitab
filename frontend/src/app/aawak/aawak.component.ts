import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { AuthService } from '../services/auth.service';
import { ExcelExportService } from '../services/excel-export.service';
import { observable, Observable, of, Subject } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-aawak',
  templateUrl: './aawak.component.html',
  styleUrls: ['./aawak.component.scss']
})
export class AawakComponent implements OnInit {

  @ViewChild('TABLE') el!: ElementRef<HTMLInputElement>;
  page = 1;
  pageNo: any = 0;
  itemsPerPage = 100;
  currentPage: any;
  totalItems: any;

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  aawakData: any = [];
  aawakAll: any = [];
  total_count: any = 0;
  allAJData: any = [];
  mms: any = [];
  viewData: any = [];
  items: any = [];
  nimitts: any = [];
  units: any = [];
  conditions: any = [];
  subitems: any = [];
  pbks: any = [];
  aawak_types: any = [];
  jawak_types: any = [];
  products: any = [];
  categories: any = [];
  isCondition: any = false;
  productsAll: any = [];
  states: any = [];
  baseurl: any;
  departments: any = [];
  filterBody: any = {
    pbk_id: [],
    mm_id: [],
    aawak_mm_id: [],
    aawak_type_id: [],
    product_id: [],
    item_id: [],
    subitem_id: [],
    condition_id: [],
    pkt_num: null,
    nimitt_id: []
  };
  cat: any;
  settings: any = {};
  exportAJdata$ = new Subject();
  currentYear: any;
  importForm: any = {
    type: null,
    date: null,
    pkt_num: null,
    item_detail: null,
    qty: null,
    rate: null,
    actual_amt: null,
    company_name: null,
    description: null,
    isbill: null,
    document: null,
    mm: null,
    mm_id: null,
    pbk: {},
    pbk_id: null,
    aj_mm: null,
    aj_mm_id: null,
    item: null,
    item_id: null,
    subitem: null,
    subitem_id: null,
    product: null,
    product_id: null,
    condition: null,
    condition_id: null,
    unit: null,
    unit_id: null,
    aj_type: null,
    aj_type_id: null,
    nimmit: null,
    nimmit_id: null,
    dept: null,
    dept_id: null,
    ref_id: null,
    jawak_detail: []
  }
  importPending: any = false;
  dictionary: any = [];
  loadingStatus: any = "मैं आत्मा शांत स्वरूप हूँ ।";
  // months: any = [{no:1, name:'January'}]
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService,
  ) {
    this.settings = this.auth.webUser.settings;
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    this.spinner.show();
    this.getaawakData();
    this.checkTempImport();
    this.getDictionary();

    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.conditions = result.condition ? result.condition : [];
      this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.products = result.product ? result.product : [];
      this.categories = result.category ? result.category : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });
    this.baseurl = this.api.getUrl('BASE');
  }

  checkTempImport() {
    this.http.get(this.api.getUrl('IMPORTEXPORT')).subscribe((data: any) => {
      if (data.total_count > 0) {
        this.importPending = true;
      }
      else {
        this.importPending = false;
      }
    })
  }

  getaawakData(pageNo: any = null) {
    this.isLoader = true;
    this.loadingStatus = "मैं आत्मा शांत स्वरूप हूँ ।";
    this.http.get(this.api.getUrl('AAWAK') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.aawakData = data['result'];
        this.aawakAll = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  getDictionary() {
    this.http.get(this.api.getUrl('DICT')).subscribe((data: any) => {
      this.dictionary = data['result'] || [];
    });
  }

  getFilteredAawakData(pageNo: any = null) {
    this.isLoader = true;
    this.loadingStatus = "मैं आत्मा शांत स्वरूप हूँ ।";
    this.filterBody.pageNo = this.pageNo;
    this.http.put(this.api.getUrl('AAWAK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.aawakData = data['result'];
        this.aawakAll = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  exportAJdataData() {
    this.isLoader = true;
    this.loadingStatus = "मैं आत्मा शांत स्वरूप हूँ ।";
    this.pageNo = 0;
    this.allAJData = [];
    this.exportAJdata$ = new Subject();
    console.log("allAJData", this.allAJData);

    this.getMoreAJ();

    this.exportAJdata$.subscribe((result: any) => {
      console.log("exportAJdata", result);
      result.map((res: any, index: any) => {
        let jawakArray: any = []
        let bachat = res.qty;
        res.jawak_detail.forEach((jres: any) => {
          bachat -= jres.qty ? jres.qty : 0;
          jawakArray.push({
            'Date': jres.date ? jres.date : '-',
            'Jawak MM': jres.jawak_mm_id ? jres.jawak_mm_hin : '-',
            'Kisko Diya': jres.nimitt_id ? jres.nimitt_hin + '(' + jres.nimitt_state_hin + ')' : '-',
            'Jawak Type': jres.jawak_type_id ? jres.jawak_type_hin : '-',
            'Qty': jres.qty ? jres.qty : '-',
            'Unit': jres.unit_id ? jres.unit_short : '-',
            // 'Bachat': bachat
          })
        });
        jawakArray.push({
          'Jawak Type': 'बचत',
          'Qty': res.remaining_qty ? res.remaining_qty : 0,
          'Unit': res.unit_id ? res.unit_short : '',
          // 'Bachat': bachat
        })
        // console.log("res", res);
        // console.log("jawakArray", jawakArray);

        this.allAJData.push({
          'No': index + 1,
          'MM': res.mm_hin,
          'Date': res.date ? res.date : '-',
          'Pkt No': res.pkt_num ? res.pkt_num : '-',
          'Roll No': res.roll_no ? res.roll_no : '-',
          'Pbk': res.pbk_hin ? res.pbk_hin : '-',
          'Relation': res.relation ? res.relation : '-',
          'Relative': res.relative_name ? res.relative_name : '-',
          'Item': res.item_id ? res.item_hin : '-',
          'Subitem': res.subitem_id ? res.subitem_hin : '-',
          'Company': res.company_name ? res.company_name : '-',
          'Condition': res.condition_id ? res.condition_hin : '-',
          'Aawak MM': res.aawak_mm_id ? res.aawak_mm_hin : '-',
          'Aawak Type': res.aawak_type_id ? res.aawak_type_hin : '-',
          'Qty': res.qty ? res.qty : '-',
          'Unit': res.unit_id ? res.unit_short : '-',
          'Bill': res.isbill ? 'है' : '-',
          // 'बचत':res.remaining_qty ? res.remaining_qty : 0,       
          'Jawak Detail': jawakArray,
        });
      });

      if (this.allAJData.length < this.total_count) {
        this.getMoreAJ();
      }
      else {
        this.export(this.allAJData);
        this.isLoader = false;
      }
    });
  }


  getMoreAJ() {
    // this.isLoader = true;
    this.filterBody.pageNo = this.pageNo + 1;
    this.http.put(this.api.getUrl('AAWAK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data["result"].length) {
        if (data["pageNo"]) {
          this.pageNo = data["pageNo"];
        }
        this.exportAJdata$.next(data['result']);
        // this.isLoader = false;
      }
      // this.isLoader = false;
    });
  }


  export(json: any) {
    console.log("json", json);

    let date = new Date();
    let filename = "AJ_";
    if (this.filterBody.mm_id) {
      let mm = this.mms.find((m: { _id: any; }) => m._id == this.filterBody.mm_id);
      if (mm && mm.mm_hin) {
        filename += mm.mm_hin + "_";
      }
    }
    console.log(filename);

    this.excelExportService.generateExcel(json, filename + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
    // this.excelExportService.exportAsExcelFile(json, 'AawakJawak');
    // this.excelExportService.exportAsExcelFile(this.el.nativeElement, 'AawakJawak');
  }

  aawakDeptSelected(ev: any) {
    if (ev) {
      this.aawakData = this.aawakAll.filter((aawak: { dept_id: any; }) => aawak.dept_id == ev);
    }
    else {
      this.aawakData = this.aawakAll;
    }
  }

  addAawakResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      // $('#showModal').modal('hide');
      // this.showModal = '';
      this.aawakData.unshift(ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev)
    }
  }

  editAawakResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.aawakData.splice(this.aawakData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev);
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Aawak'
    $('#showModal').modal('show');
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
        this.http.delete(this.api.getUrl('AAWAK') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.aawakData.splice(i, 1);
            this.gs.Lists.aawak.splice(this.gs.Lists.aawak.indexOf((i: { _id: any; }) => i._id == id), 1);
            this.total_count -= 1;
            this.toastr.success('Deleted Successfully');
          }
          else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        });
      }
    })
  }

  // filter() {
  //   this.aawakData = this.aawakAll;
  //   for (let [key, value] of Object.entries(this.conditionObj)) {
  //     if (value)
  //       this.aawakData = this.aawakData.filter((b: any) => b[key] == value);
  //   }
  // }

  addJawak(data: any) {
    this.editData = data;
    this.showModal = "Add Jawak";
    $('#showModal').modal('show');
  }

  showJawak(id: any) {
    if (id) {
      this.http.get(this.api.getUrl('JAWAKBYAWK') + id).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.viewData = data['result'];
          this.openModal('Show Jawak');
        }
      });
    }
  }

  addJawakResponse(ev: any) {
    // this.isLoader = true;
    if (ev.aawak_ref_id) {
      let i = this.aawakData.findIndex((b: any) => b._id == ev.aawak_ref_id);
      this.aawakData[i].remaining_qty = (this.aawakData[i].remaining_qty ? this.aawakData[i].remaining_qty : 0) - ev.qty;
      this.aawakData[i].jawak_detail.push(ev);
      $('#showModal').modal('hide');
      this.showModal = '';
      // this.isLoader = false;
    }
  }

  openModal(type: any) {
    this.showModal = type;
    $('#showModal').modal('show');
    // console.log("modal", modal);

    // console.log("this.showModal",this.showModal);

  }

  closeModal() {
    this.showModal = "";
    $('#showModal').modal('hide');
  }

  stateSelected(ev: any) {
    if (ev)
      this.aawakData = this.aawakAll.filter((aawak: { state_id: any; }) => aawak.state_id == ev);
    else
      this.aawakData = this.aawakAll;
  }

  catSelected(ev: any) {
    if (ev) {
      this.cat = ev;
      this.items = this.gs.Lists.itemmix.filter((i: { category_id: any, categories: any }) => i.category_id == ev || i.categories.includes(ev));
    }
    else {
      this.cat = null;
      this.items = this.gs.Lists.itemmix;
    }
  }

  itemSelected(ev: any) {
    if (ev) {

      let items = this.items.filter((i: { _id: any; }) => ev.includes(i._id));
      this.products = this.productsAll.filter((p: { item_id: any; }) => ev.includes(p.item_id));
      this.subitems = [];
      console.log(items);

      if (this.cat) {
        for (let i in items) {
          this.subitems.push(...items[i].subitems.filter((s: { category_id: any; }) => s.category_id == this.cat));
        }
      }
      else {
        for (let i in items) {
          this.subitems.push(...items[i].subitems);
        }
      }
    }
    else {
      this.subitems = [];
    }
  }

  subitemSelected(ev: any) {
    if (ev) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
      this.products = this.productsAll.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
    }
    else {
      this.products = this.productsAll;
    }
  }

  productSelected(ev: any) {
    this.isCondition = true;
    let product = this.products.find((p: { _id: any; }) => p._id == ev);
  }

  excelImport(ev: any) {
    let workBooks: any = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      this.isLoader = true;
      this.loadingStatus = "फाइल लोड की जा रही है ।";
      const data = reader.result;
      workBooks = XLSX.read(data, { type: 'binary' });
      jsonData = workBooks.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBooks.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        return initial;
      }, {});

      this.loadingStatus = "फाइल का अध्ययन किया जा रहा है।";
      // const dataString = JSON.stringify(jsonData);      
      let sheetdata = jsonData[workBooks.SheetNames[0]];
      let filterdata = sheetdata.filter((i: any) => (!i.includes("बचत")));
      let exceldata = filterdata.filter((i: any) => (i.length));
      let awakStart: any = 0, jawakStart: any = 0, startRow: any = 0;

      for (let i = 0; i < exceldata.length; i++) {
        if (exceldata[i][0] && ['awk detail', 'awak detail', 'aawak detail', 'aawak', 'आवक'].includes(exceldata[i][0].toString().toLowerCase().trim())) {
          startRow = i;
          for (let k in exceldata[i]) {
            if (exceldata[i][k] && ['jwk detail', 'jawak detail', 'jawak', 'जावक'].includes(exceldata[i][k].toString().toLowerCase().trim())) {
              jawakStart = k;
              break;
            }
          }
          break;
        }
      }
      console.log("startRow", startRow);
      console.log("awakStart", awakStart);
      console.log("jawakStart", jawakStart);
      let finalJson: any = [];
      let columns = exceldata[startRow + 1].map((r: any) => (typeof r == "string" ? r.toLowerCase().trim() : r));

      console.log("columns", columns);
      console.log("exceldata", exceldata);

      this.loadingStatus = "डाटा पढ़ा एवं सॉफ्टवेयर के डाटा से जोड़ा जा रहा है।";
      for (let i = startRow + 2; i < exceldata.length; i++) {

        //aawak form
        var obj: any = {
          type: null,
          date: null,
          pkt_num: null,
          item_detail: null,
          qty: null,
          rate: null,
          actual_amt: null,
          company_name: null,
          description: null,
          isbill: null,
          document: null,
          mm: null,
          mm_id: null,
          pbk: {},
          pbk_id: null,
          aj_mm: null,
          aj_mm_id: null,
          item: null,
          item_id: null,
          subitem: null,
          subitem_id: null,
          product: null,
          product_id: null,
          condition: null,
          condition_id: null,
          unit: null,
          unit_id: null,
          aj_type: null,
          aj_type_id: null,
          nimitt: null,
          nimitt_id: null,
          dept: this.auth.webUser.dept_eng,
          dept_id: this.auth.webUser.dept_id,
          jawak_detail: []
        };
        //jawak form
        let jwkobj: any = {};

        //loop through element of row and separating to aawak and jawak form
        for (let j = 0; j < columns.length; j++) {
          //trim data if type string
          if (typeof exceldata[i][j] == "string") {
            exceldata[i][j] = exceldata[i][j].trim();
          }
          // set null if data id '', '-', or empty/undefine
          if (['', '-', undefined].includes(exceldata[i][j])) {
            exceldata[i][j] = null;
          }

          //for aawak value (0 to jawak start)
          if (j < jawakStart) {
            switch (columns[j]) {
              case "mm": obj.mm = exceldata[i][j];
                let getmm = this.mms.find((m: any) => [m.mm_hin, m.mm_eng, m.mm_code].includes(obj.mm));
                if (getmm) {
                  obj.mm_id = getmm._id;
                } else {
                  let dictmm = this.dictionary.find((d: any) => d.type == "mm" && d.name == obj.mm);
                  obj.mm_id = dictmm ? dictmm.id : null;
                }
                break;
              case "date": obj.date = exceldata[i][j];
                break;
              case "pkt no":
              case "pkt num":
              case "pkt_num":
              case "pkt": obj.pkt_num = exceldata[i][j];
                break;
              case "roll no":
              case "roll_no": obj.pbk.roll_no = exceldata[i][j];
                if (obj.pbk.roll_no) {
                  let getpbk = this.pbks.find((p: any) => p.roll_no == obj.pbk.roll_no);
                  obj.pbk_id = getpbk ? getpbk._id : null;
                }
                break;
              case "pbk":
              case "sewadhari": obj.pbk.name = exceldata[i][j];
                break;
              case "relation": obj.pbk.relation = exceldata[i][j];
                break;
              case "relative":
              case "relative_name":
              case "relative name": obj.pbk.relative = exceldata[i][j];
                break;
              case "item": obj.item = exceldata[i][j];
                let getitem = this.items.find((i: any) => [i.item_hin, i.item_eng, i.item_code].includes(obj.item));
                if (getitem) {
                  obj.item_id = getitem._id;
                } else {
                  let dictitem = this.dictionary.find((d: any) => d.type == "item" && d.name == obj.item && !d.extra_note)
                  obj.item_id = dictitem ? dictitem.id : null;
                }
                break;
              case "subitem": obj.subitem = exceldata[i][j];
                if (obj.item_id) {
                  let getitem = this.items.find((i: any) => i._id == obj.item_id);
                  let getsubitem = getitem.subitems.find((m: any) => [m.subitem_hin, m.subitem_eng, m.subitem_code].includes(obj.subitem));
                  obj.subitem_id = getsubitem ? getsubitem._id : null;
                }
                break;
              case "product":
              case "product_code":
              case "product code":
              case "serial no":
                obj.product = exceldata[i][j];
                let getproduct = this.products.find((p: any) => [p.sr_no, p.product_code].includes(obj.product));
                obj.product_id = getproduct ? getproduct._id : null;
                break;
              case "company":
              case "company name":
              case "company_name": obj.company_name = exceldata[i][j];
                break;
              case "condition": obj.condition = exceldata[i][j];
                let getcondition = this.conditions.find((c: any) => [c.list_name_hin, c.list_name_eng].includes(obj.condition));
                if (getcondition) {
                  obj.condition_id = getcondition._id;
                } else {
                  let dictcondition = this.dictionary.find((d: any) => d.type == "condition" && d.name == obj.condition)
                  obj.condition_id = dictcondition ? dictcondition.id : null;
                }
                break;
              case "aawak mm":
              case "aawak_mm":
              case "awk_mm":
              case "awk mm": obj.aj_mm = exceldata[i][j];
                let getawkmm = this.mms.find((m: any) => [m.mm_hin, m.mm_eng, m.mm_code].includes(obj.aj_mm));
                if (getawkmm) {
                  obj.aj_mm_id = getawkmm._id;
                } else {
                  let dictaj_mm = this.dictionary.find((d: any) => d.type == "aj_mm" && d.name == obj.aj_mm)
                  obj.aj_mm_id = dictaj_mm ? dictaj_mm.id : null;
                }
                break;
              case "aawak type":
              case "awk type":
              case "awk_type":
              case "aawak_type": obj.aj_type = exceldata[i][j];
                let getaawak_type = this.aawak_types.find((c: any) => [c.list_name_hin, c.list_name_eng].includes(obj.aj_type));
                if (getaawak_type) {
                  obj.aj_type_id = getaawak_type._id;
                } else {
                  let dictaj_type = this.dictionary.find((d: any) => d.type == "awk_type" && d.name == obj.aj_type)
                  obj.aj_type_id = dictaj_type ? dictaj_type.id : null;
                }
                break;
              case "qty":
              case "quantity": obj.qty = exceldata[i][j];
                break;
              case "price":
              case "rate": obj.rate = exceldata[i][j];
                break;
              case "amt":
              case "amount":
              case "actual amt":
              case "actual_amt": obj.actual_amt = exceldata[i][j];
                break;
              case "unit": obj.unit = exceldata[i][j];
                let getunit = this.units.find((u: any) => [u.unit_short, u.unit_full].includes(obj.unit));
                if (getunit) {
                  obj.unit_id = getunit._id;
                } else {
                  let dictunit = this.dictionary.find((d: any) => d.type == "unit" && d.name == obj.unit)
                  obj.unit_id = dictunit ? dictunit.id : null;
                }
                break;
              case "bill":
                if ([true, 'true', 'yes', 1].includes((typeof exceldata[i][j] == "string" ? exceldata[i][j].trim().toLowerCase() : exceldata[i][j]))) {
                  obj.isbill = 1;
                }
                else {
                  obj.isbill = 0;
                }
                break;
              case "nimitt":
                obj.nimitt = exceldata[i][j];
                let getnimitt = this.nimitts.find((n: any) => [n.nimitt_hin, n.nimitt_eng, n.roll_no].includes(obj.nimitt));
                if (getnimitt) {
                  obj.nimitt_id = getnimitt._id;
                } else {
                  let dictnimitt = this.dictionary.find((d: any) => d.type == "nimitt" && d.name == obj.nimitt)
                  obj.nimitt_id = dictnimitt ? dictnimitt.id : null;
                }
                break;
              case "dept":
                // case "department": obj.dept = exceldata[i][j];
                //   let getdept = this.departments.find((d: any) => [d.dept_hin, d.dept_eng, d.dept_code].includes(obj.dept));                
                break;
              default: obj[columns[j]] = exceldata[i][j];
            }

          }
          //for jawak value (jawak start to end)
          else {

            //jwk switch
            switch (columns[j]) {
              case "date": jwkobj.date = exceldata[i][j];
                break;
              case "jwk mm":
              case "jwk_mm":
              case "jawak_mm":
              case "jawak mm": jwkobj.aj_mm = exceldata[i][j];
                let getmm = this.mms.find((m: any) => [m.mm_hin, m.mm_eng, m.mm_code].includes(jwkobj.aj_mm));
                if (getmm) {
                  jwkobj.aj_mm_id = getmm._id;
                  jwkobj.aj_mm_hin = getmm.mm_hin;
                  jwkobj.aj_mm_code = getmm.mm_code;
                } else {
                  let dictaj_mm = this.dictionary.find((d: any) => d.type == "aj_mm" && d.name == jwkobj.aj_mm)
                  jwkobj.aj_mm_id = dictaj_mm ? dictaj_mm.id : null;
                }

                break;
              case "kisko diya":
              case "person":
              case "kisko_diya": jwkobj.nimitt = exceldata[i][j];
                let getnimitt = this.nimitts.find((n: any) => [n.nimitt_hin, n.nimitt_eng, n.roll_no].includes(jwkobj.nimitt));
                if (getnimitt) {
                  jwkobj.nimitt_id = getnimitt._id;
                  jwkobj.nimitt_hin = getnimitt.nimitt_hin;
                  jwkobj.nimitt_state_hin = getnimitt.state_hin;
                } else {
                  let dictnimitt = this.dictionary.find((d: any) => d.type == "nimitt" && d.name == jwkobj.nimitt)
                  jwkobj.nimitt_id = dictnimitt ? dictnimitt.id : null;
                }
                break;
              case "jwk_type":
              case "jwk type":
              case "jawak_type":
              case "jawak type": jwkobj.aj_type = exceldata[i][j];
                let getjawak_type = this.jawak_types.find((c: any) => [c.list_name_hin, c.list_name_eng].includes(jwkobj.aj_type));
                if (getjawak_type) {
                  jwkobj.aj_type_id = getjawak_type._id;
                  jwkobj.aj_type_hin = getjawak_type.list_name_hin;
                } else {
                  let dictaj_type = this.dictionary.find((d: any) => d.type == "jwk_type" && d.name == jwkobj.aj_type)
                  jwkobj.aj_type_id = dictaj_type ? dictaj_type.id : null;
                }
                break;
              case "qty":
              case "quantity": jwkobj.qty = exceldata[i][j];
                break;
              default:
                jwkobj[columns[j]] = exceldata[i][j];
            }

          }

          //old code 
          // j < jawakStart ? (exceldata[i][j] != undefined ? aawak_values.push(exceldata[i][j]) : aawak_values.push(null)) :
          //   (exceldata[i][j] != undefined ? jawak_values.push(exceldata[i][j]) : jawak_values.push(null));
        }

        if (obj.subitem && !obj.subitem_id) {
          let dictitem = this.dictionary.find((d: any) => d.type == "item" && d.name == obj.item && d.extra_note == obj.subitem)
          obj.item_id = dictitem ? dictitem.id : null;
          obj.subitem_id = dictitem ? dictitem.id2 : null;
        }
        // check for required Fields in aawak object
        if (obj.date && obj.mm && (obj.aj_mm || obj.pbk) && obj.qty && obj.unit && obj.aj_type) {
          finalJson.push(obj);
        }
        // check for required Fields in jawak object
        if (jwkobj.qty && (jwkobj.aj_mm || jwkobj.nimitt)) {
          finalJson[finalJson.length - 1].jawak_detail.push(jwkobj);
        }

      }
      console.log("finalJson", finalJson);


      this.loadingStatus = "डाटा को अपलोड किया जा रहा है।";
      //send data to backend
      this.http.post(this.api.getUrl('IMPORTEXPORT'), finalJson).subscribe((data: any) => {
        if (data.total_count) {
          this.openModal("import");
          this.importPending = true;
        }
        this.isLoader = false;
      });
    }


    reader.readAsBinaryString(file);
    ev = '';

  }

  importResponse(ev: any) {
    console.log("respose", ev);

    if (ev) {
      this.closeModal();
      this.checkTempImport();
      this.getaawakData();
    }
  }
}

