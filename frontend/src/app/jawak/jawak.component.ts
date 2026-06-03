import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ExcelExportService } from '../services/excel-export.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
declare var $: any;

@Component({
  selector: 'app-jawak',
  templateUrl: './jawak.component.html',
  styleUrls: ['./jawak.component.scss']
})
export class JawakComponent implements OnInit {

  page = 1;
  itemsPerPage = 100;
  currentPage: any;
  totalItems: any;

  isLoader: boolean = false;
  isDeleting: boolean = false;
  toBeDelete: any = [];

  term: any;
  loadingStatus: any = '';
  showModal: String = '';
  total_count: any = 0;
  jawakData: any = [];
  editData: any = {};
  mms: any = [];
  months: any = [];
  viewData: any = [];
  items: any = [];
  units: any = [];
  conditions: any = [];
  subitems: any = [];
  pbks: any = [];
  nimitts: any = [];
  jawak_types: any = [];
  products: any = [];
  categories: any = [];
  isCondition: any = false;
  productsAll: any = [];
  states: any = [];
  zones: any = [];
  departments: any = [];
  pageNo: any = 0;
  exportJwkdata$ = new Subject();
  allJwkData: any = [];
  jwkCount: any = 0;
  filterBody: any = {
    date: null,
    month: null,
    year: null,
    pbk_id: [],
    mm_id: [],
    zone_id: [],
    jawak_mm_id: [],
    jawak_type_id: [],
    product_id: [],
    item_id: [],
    subitem_id: [],
    usage_list_id: [],
    condition_id: [],
    nimitt_id: null,
    pkt_num: null,
    unlinkedOnly: false,
    itemOnly: false
  };
  selectedItemmix: any[] = [];
  cat: any;
  settings: any = {};


  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public gs: GlobalService,
    public auth: AuthService,
    public excelExportService: ExcelExportService
  ) {
    this.settings = this.auth.webUser.settings;
  }

  ngOnInit(): void {
    this.filterBody.mm_id = this.settings.defaultMM ? [this.settings.defaultMM] : [];
    this.getJawakData(1);
    this.months = this.gs.months;
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.units = result.unit ? result.unit : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.states = result.state ? result.state : [];
      this.zones = result.zone ? result.zone : [];
    });
  }

  openModal(type: String) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  exportExcel() {
    this.isLoader = true;
    this.loadingStatus = "डाटा प्रोसेस हो रहा है... ";
    this.pageNo = 0;
    this.jwkCount = 0;
    this.allJwkData = [];
    this.exportJwkdata$ = new Subject();
    let footerRow: any = {
      'Date': '*',
      'Pkt No': 'Total',
      'Jawak MM': 0,
      'Qty': 0,
      'Amount': 0,
    }; // Object to store totals for footer
    let uniqueMM = new Set();
    let uniqueJawakMM = new Set();
    let uniqueUnit = new Set();

    this.getMoreAJ();

    this.exportJwkdata$.subscribe(async (result: any) => {
      for (let i = 0; i < result.length; i++) {
        uniqueMM.add(result[i].mm_id);
        uniqueJawakMM.add(result[i].jawak_mm_id);
        uniqueUnit.add(result[i].unit_id);

        this.allJwkData.push({
          'Date': result[i].date ? this.gs.formatDisplayDate(result[i].date) : '-',
          'Pkt No': result[i].pkt_num ? result[i].pkt_num : '-',
          'MM': result[i].mm_id ? result[i].mm_hin : '-',
          'Item': result[i].item_id ? result[i].item_hin : '-',
          'Subitem': result[i].subitem_id ? result[i].subitem_hin : '-',
          'Condition': result[i].condition_id ? result[i].condition_hin : '-',
          'Company': result[i].company_name ? result[i].company_name : '-',
          'Jawak MM': result[i].jawak_mm_id ? result[i].jawak_mm_hin : '-',
          'Kisko Diya': result[i].pbk_id ? result[i].roll_no || '_____' + result[i].pbk_hin : '-',
          'Qty': result[i].qty ? result[i].qty : '-',
          'Unit': result[i].unit_id ? result[i].unit_short : '-',
          'Rate': result[i].rate ? result[i].rate : '-',
          'Amount': result[i].actual_amt ? result[i].actual_amt : '-',
          'Jawak Type': result[i].jawak_type_id ? result[i].jawak_type_hin : '-',
          'kaha Becha/Repaired': result[i].sell_repair_place ? result[i].sell_repair_place : '-',
          'kaha parchi shown': result[i].parchi_place ? result[i].parchi_place : '-',
          'Item Detail': result[i].item_detail ? result[i].item_detail : '-',
          'Jawak Detail': result[i].description ? result[i].description : '-',
        });

        footerRow['Qty'] += result[i].qty ? result[i].qty : 0;
        footerRow['Amount'] += result[i].actual_amt ? result[i].actual_amt : 0;
      }

      this.loadingStatus = `डाटा प्रोसेस हो रहा है... (${this.allJwkData.length} / ${this.total_count})`;
      if (this.allJwkData.length < this.total_count) {
        this.getMoreAJ();
      }
      else {
        footerRow['MM'] = uniqueMM.size + ' MMs';
        footerRow['Unit'] = uniqueUnit.size + ' Units';
        footerRow['Jawak MM'] = uniqueJawakMM.size + ' Mms';
        this.allJwkData.push(footerRow)
        let date = new Date();
        this.excelExportService.exportAsExcelFile(this.allJwkData, "Jawak_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
        this.isLoader = false;
      }
    });
  }

  excelFile: any;
  excelImport(event: any) {
    this.excelFile = event;
    this.showModal = 'ei_jawak';
    $('#showModal').modal('show');
  }

  importResponse(type: any) {
    this.getJawakData(1);
  }

  getMoreAJ() {
    // this.isLoader = true;
    this.filterBody.pageNo = this.pageNo + 1;
    this.http.put(this.api.getUrl('JAWAK') + 'filter/' + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data["result"].length) {
        if (data["pageNo"]) {
          this.pageNo = data["pageNo"];
        }
        this.total_count = data.total_count;
        this.loadingStatus = `डाटा डाउनलोड हो रहा है... (API: ${this.pageNo})`;
        this.exportJwkdata$.next(data['result']);
        // this.isLoader = false;
      }
      // this.isLoader = false;
    });
  }

  yearClick(year: any) {
    this.filterBody.year = year;
    this.getJawakData(1);
  }

  getJawakData(pageNo: any) {
    this.isLoader = true;
    this.filterBody.pageNo = pageNo;
    // AUTO select all mm if mm not selected and state selected for mm.
    if (!this.filterBody.mm_id.length && this.filterBody.mm_states) {
      this.filterBody.mm_id = this.mms.filter((m: { state_id: any; }) => this.filterBody.mm_states.includes(m.state_id)).map((mm: { _id: any; }) => mm._id);
    }
    // AUTO select all jawak mm if jawak mm not selected and jawak state selected for jawak mm.
    if (!this.filterBody.jawak_mm_id.length && this.filterBody.jwk_mm_states) {
      this.filterBody.jawak_mm_id = this.mms.filter((m: { state_id: any; }) => this.filterBody.jwk_mm_states.includes(m.state_id)).map((mm: { _id: any; }) => mm._id);
    }
    // Combined item-subitem logic
    this.updateFilterItemSubitem(this.selectedItemmix);

    this.http.put(this.api.getUrl('JAWAK') + 'filter/' + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.jawakData = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  addJawakResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#showModal').modal('hide');
      this.showModal = '';
      this.jawakData.unshift(ev);
      this.isLoader = false;
    }
    else {
      console.log("err", ev)
      this.isLoader = false;
    }
  }

  editJawakResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#showModal').modal('hide');
      this.showModal = '';
      this.jawakData.splice(this.jawakData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      console.log("err", ev);
      this.isLoader = false;
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Jawak'
    $('#showModal').modal('show');
  }

  onAawakRefSaved(updatedJawak: any, index: number) {
    if (updatedJawak && updatedJawak._id) {
      this.jawakData[index].aawak_ref_id = updatedJawak.aawak_ref_id;
    }
  }

  toggleReceived(data: any) {
    const newStatus = data.is_recieved ? 0 : 1;
    this.http.put(this.api.getUrl('JAWAK') + '/received/' + data._id, { is_recieved: newStatus }).subscribe((res: any) => {
      if (res && res.success) {
        data.is_recieved = newStatus;
        this.toastr.success('Status updated successfully');
      } else {
        this.toastr.error('Failed to update status');
      }
    }, err => {
      this.toastr.error('Failed to update status');
    });
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
        this.isLoader = true;
        this.http.delete(this.api.getUrl('JAWAK') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.jawakData.splice(i, 1);
            this.gs.Lists.mm.splice(this.gs.Lists.mm.indexOf((i: { _id: any; }) => i._id == id), 1);
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

  deleteSelection(i: any, id: any) {
    console.log(this.jawakData[i].delete);

    if (this.jawakData[i].delete) {
      this.toBeDelete.push(id);
    } else {
      for (let j in this.toBeDelete) {
        if (this.toBeDelete[j] == id) {
          this.toBeDelete.splice(j, 1);
          break;
        }
      }
    }
    console.log(this.toBeDelete);

  }

  deleteSelectAll() {
    if (this.jawakData.length == this.toBeDelete.length) {
      for (let i in this.jawakData) {
        this.jawakData[i].delete = false;
      }
      this.toBeDelete = [];
    } else {
      for (let i in this.jawakData) {
        this.jawakData[i].delete = true;
        this.toBeDelete.push(this.jawakData[i]._id);
      }
    }
    console.log(this.toBeDelete);

  }


  deleteMultiple() {
    if (!this.isDeleting) {
      this.isDeleting = true;
    } else {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          let s_count = 0;
          for (let id of this.toBeDelete) {
            let res: any = await this.fnDelete(id);
            console.log(res);
            if (res) {
              s_count += 1;
            }

          }
          let msg = s_count + " Deleted Successfully out of " + this.toBeDelete.length;

          this.toBeDelete = [];
          this.toastr.error(msg);
          this.isDeleting = !this.isDeleting;
        } else {
          this.isDeleting = !this.isDeleting;
        }
      });
    }

  }

  async fnDelete(id: any) {
    return new Promise((resolve, reject) => {
      this.http.delete(this.api.getUrl('JAWAK') + id).subscribe((data: any) => {
        if (data['success']) {
          for (let i in this.jawakData) {
            if (this.jawakData[i]._id == id) {
              this.jawakData.splice(i, 1);
            }
            this.total_count -= 1;
          }
          return resolve(true);
        }
        else {
          this.toastr.error(data['message']);
          return reject(false);
        }
      }, (err) => {
        return reject(false);
      });
    })

  }

  stateSelected(ev: any) {
    // if (ev)
    //   this.aawakData = this.aawakAll.filter((aawak: { state_id: any; }) => aawak.state_id == ev);
    // else
    //   this.aawakData = this.aawakAll;
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

  updateFilterItemSubitem(ev: any) {
    if (Array.isArray(ev)) {
      this.filterBody.item_id = [];
      this.filterBody.subitem_id = [];
      ev.forEach((item: any) => {
        let item_id, subitem_id;
        if (typeof item === 'string') {
          const parts = item.split(':');
          item_id = parts[0] ? parseInt(parts[0]) : null;
          subitem_id = parts[1] ? parseInt(parts[1]) : null;
        } else {
          item_id = item.item_id;
          subitem_id = item.subitem_id;
        }
        if (item_id && !this.filterBody.item_id.includes(item_id)) {
          this.filterBody.item_id.push(item_id);
        }
        if (subitem_id && !this.filterBody.subitem_id.includes(subitem_id)) {
          this.filterBody.subitem_id.push(subitem_id);
        }
      });
    } else {
      this.filterBody.item_id = [];
      this.filterBody.subitem_id = [];
    }
  }

  getItemSubitemArray() {
    const res: string[] = [];
    this.filterBody.item_id.forEach((id: any) => res.push(id + ':'));
    this.filterBody.subitem_id.forEach((sid: any) => {
      // We need to find the parent item_id for this subitem to construct the correct string "itemId:subitemId"
      // But in filterBody, we don't store the pairing.
      // This is a limitation of the current filter structure if we combine them.
    });
    return res;
  }
}
