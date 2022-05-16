import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { FilterpipePipe } from '../pipe/filterpipe.pipe';
import { AuthService } from '../services/auth.service';
import { ExcelExportService } from '../services/excel-export.service';
import { observable, Observable, Subject } from 'rxjs';
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
  units: any = [];
  conditions: any = [];
  subitems: any = [];
  pbks: any = [];
  aawak_types: any = [];
  products: any = [];
  categories: any = [];
  isCondition: any = false;
  productsAll: any = [];
  states: any = [];
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
    nimmit: null
  };
  cat: any;
  settings: any = {};
  exportAJdata$ = new Subject();

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
  }

  ngOnInit(): void {
    this.spinner.show();
    this.getaawakData(1);
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.conditions = result.condition ? result.condition : [];
      this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.products = result.product ? result.product : [];
      this.categories = result.category ? result.category : [];
    });
  }

  getaawakData(pageNo: any) {
    this.isLoader = true;
    this.filterBody.pageNo = pageNo;
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

  exportAJdataData() {
    this.isLoader = true;
    this.filterBody.pageNo = this.pageNo;
    this.http.put(this.api.getUrl('AAWAK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.aawakData = data['result'];
        this.aawakAll = data['result'];
        this.total_count = data['total_count'];
        // this.isLoader = false;
        if (data["result"].length < data["total_count"]) {
          this.getMoreAJ();
        }
      }
      this.isLoader = false;
    });

    this.exportAJdata$.subscribe((result: any) => {
      for (let i in result) {
        let newJson = result.map((res: any) => {
          let jawakArray: any[] = []
          res.jawak_detail.forEach((jres: any) => {
            jawakArray.push({
              'Date': jres.date ? jres.date : '-',
              'Item': jres.item_id ? jres.item_hin : '-',
              'Qty': jres.qty ? jres.qty : '-',
              'Unit': jres.unit_id ? jres.unit_short : '-',
              'Jawak MM': jres.jawak_mm_id ? jres.jawak_mm_hin : '-'
            })
          });
          return {
            'Date': res.date ? res.date : '-',
            'Item': res.item_id ? res.item_hin : '-',
            'Aawak MM': res.aawak_mm_id ? res.aawak_mm_hin : '-',
            'Aawak Type': res.aawak_type_id ? res.aawak_type_hin : '-',
            'Qty': res.qty ? res.qty : '-',
            'Unit': res.unit_id ? res.unit_short : '-',
            'Jawak Detail': jawakArray,
          }
        })
        this.allAJData.push(newJson[0]);
      }
      if (this.allAJData.length < 3) {
        this.getMoreAJ();
      }
      else {
        this.export(this.allAJData);
        this.isLoader = false;
      }
    });
  }


  getMoreAJ() {
    this.isLoader = true;
    this.filterBody.pageNo = this.pageNo + 1;
    this.http.put(this.api.getUrl('AAWAK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data["result"].length > 0) {
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
    this.excelExportService.generateExcel(json, 'AawakJawak');
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
      let item = this.items.find((i: { _id: any; }) => i._id == ev);
      this.products = this.productsAll.filter((p: { item_id: any; }) => p.item_id == ev);
      if (this.cat) {
        this.subitems = item.subitems.filter((s: { category_id: any; }) => s.category_id == this.cat);
      }
      else {
        this.subitems = item.subitems;
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
      const data = reader.result;
      workBooks = XLSX.read(data, { type: 'binary' });
      jsonData = workBooks.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBooks.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      // const dataString = JSON.stringify(jsonData);
      let exceldata = jsonData[workBooks.SheetNames[0]];
      for (let i in exceldata) {

      }

    }
    reader.readAsBinaryString(file);
    ev = '';
  }

}
