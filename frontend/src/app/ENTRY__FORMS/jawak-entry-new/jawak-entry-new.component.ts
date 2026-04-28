import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';
import { ContextMenuItem } from 'src/app/SHARED/context-menu.directive';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormService } from 'src/app/services/form.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
declare var $: any;

@Component({
  selector: 'app-jawak-entry-new',
  templateUrl: './jawak-entry-new.component.html',
  styleUrls: ['./jawak-entry-new.component.scss']
})
export class JawakEntryNewComponent implements OnInit {

  @ViewChild('fMain') fMain!: NgForm;
  @Input() isEdit: any;
  @Input() getData: any;
  @Output() response = new EventEmitter();
  aawakLoader: boolean = false;
  isLoader: boolean = false;
  showModal: string = ''

  states: any = [];
  departments: any = [];
  items: any = [];
  subitems: any = [];
  itemAll: any = [];
  units: any = [];
  mms: any = [];
  conditions: any = [];
  categories: any = [];
  pbks: any = [];
  aawak_types: any = [];
  usage_lists: any = [];
  usage_types: any = [];
  aawak_sources: any = [];
  jawak_types: any = [];
  nimitts: any = [];
  products: any = [];
  settings: any = {};
  imagepath: any;
  imageIndex: any = null;
  lotNoAll: any = [];
  lotNos: any = [];
  keyword: any = 'lot_no';
  aawaksAll: any = [];
  aawaks: any = [];
  aawakFilter: any = {
    max_date: null,
    mm_id: null,
    item_id: null,
    subitem_id: null,
    condition_id: null,
    unit_id: null,
    aawak_source_id: null,
    remaining_qty: true
  }
  insertIndex: any = 0;

  contextMenuItems: ContextMenuItem[] = [
  ];


  constructor(private http: HttpService,
    public api: ApiService,
    private toastr: ToastrService,
    public gs: GlobalService,
    public auth: AuthService,
    public fs: FormService,) {

    this.gs.observeList().subscribe(result => {
      this.items = result.itemmix ? result.itemmix : [];
      this.itemAll = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      this.departments = result.department ? result.department : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.usage_lists = result.usage_list ? result.usage_list : [];
      this.aawak_sources = result.aawak_source ? result.aawak_source : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
      this.usage_types = result.usage_type ? result.usage_type : [];
    });
    this.settings = this.auth.webUser.settings;
    fs.jawakFormMain.mm_id = this.settings.defaultMM;
    this.getLotNo();
  }

  ngOnInit(): void {

    setTimeout(() => {
      if (this.fMain) {
        this.getRemainingAawakData();
        this.fMain.statusChanges?.pipe(debounceTime(200)).subscribe(() => {
          this.fs.jawakFormStatusChanges();
          this.getRemainingAawakData();
        });
      }
    }, 500);
  }

  async getRemainingAawakData() {
    this.aawakLoader = true;
    if (this.aawakFilter.max_date != this.fs.jawakFormMain.date || this.aawakFilter.mm_id != this.fs.jawakFormMain.mm_id) {

      // update filter object
      this.aawakFilter.max_date = this.fs.jawakFormMain.date;
      this.aawakFilter.mm_id = this.fs.jawakFormMain.mm_id;
      this.aawakFilter.limit = -1;
      this.http.put(this.api.getUrl('AAWAK') + 'filter/' + this.auth.webUser.dept_id, this.aawakFilter).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.aawaksAll = data['result'];
          this.aawaks = this.aawaksAll;
        }
      });
    } else {
      this.filterAawak();
    }
  }

  updateFilterObj(i: any) {
    const jwk = this.fs.jawakFormMain.jawaks[i];
    jwk.filterObj = {
      item_id: jwk.item_id,
      subitem_id: jwk.subitem_id,
    };
  }

  filterAawak() {
    this.aawakLoader = false;
    for (let i in this.fs.jawakFormMain.jawaks) {
      this.updateFilterObj(i);
    }
  }

  searchAawak(term: string, item: any) {
    term = term.toLowerCase();
    return item.lot_no?.toString().toLowerCase().includes(term) ||
      item.item_hin?.toLowerCase().includes(term) ||
      item.item_eng?.toLowerCase().includes(term) ||
      item.subitem_hin?.toLowerCase().includes(term) ||
      item.subitem_eng?.toLowerCase().includes(term) ||
      item.mm_hin?.toLowerCase().includes(term) ||
      item.mm_code?.toLowerCase().includes(term) ||
      item.aawak_mm_hin?.toLowerCase().includes(term);
  }

  async refAawakSelected(awk: any, i: any) {
    let awk_id = awk._id;
    if (awk_id) {
      this.fs.jawakFormMain.jawaks[i] = {
        ...this.fs.jawakFormMain.jawaks[i],
        item_id: awk.item_id,
        subitem_id: awk.subitem_id,
        condition_id: awk.condition_id,
        unit_id: awk.unit_id,
        aawak_source_id: awk.aawak_source_id,
        company_name: awk.company_name,
        rate: typeof awk.rate == 'number' ? awk.rate : 0,
        remaining_qty: awk.remaining_qty,
      }

      this.itemSubitemSelected(awk, i);

    } else {
      this.clearAawak(i);
    }

  }

  clearAawak(i: any) {
    this.fs.jawakFormMain.jawaks[i] = {
      ...this.fs.jawakFormMain.jawaks[i],
      aawak_ref_id: null,
      item_id: null,
      subitem_id: null,
      condition_id: null,
      unit_id: null,
      aawak_source_id: null,
      company_name: null,
      rate: null,
      remaining_qty: null,
    }
    this.itemSubitemSelected(null, i);
  }

  clearReport(i: any) {

  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes.isEdit && changes.isEdit.currentValue) {
    }
    if (changes.getData && changes.getData.currentValue) {
      this.fs.patchFormJawak(changes.getData.currentValue);
      this.fs.jawakFormStatusChanges()
      for (let i in this.fs.jawakFormMain.jawaks) {
        if (this.fs.jawakFormMain.jawaks[i].item_id) {
          this.itemSubitemSelected(this.fs.jawakFormMain.jawaks[i], i);
        }
      }

    }
  }

  ngOnDestroy(): void {
    if (this.isEdit) {
      this.fs.resetJawak();
    }
  }

  getContextMenuItems(row: any): ContextMenuItem[] {
    return [
      {
        label: row.hl ? 'Un-Highlight' : 'Highlight',
        icon: row.hl ? 'uil uil-eye-slash' : 'uil uil-eye',
        action: (data) => this.toggleHighlight(data)
      }
    ]
  }

  toggleHighlight(row: any) {
    console.log("clicked highlight", row);
    this.fs.jawakFormMain.jawaks[row.i].hl = !row.hl;
  }

  selectEvent(ev: any, index: any) {
    if (ev.lot_no) {
      this.fs.jawakFormMain.jawaks[index].item_id = ev.item_id;
      this.itemSubitemSelected(ev.item_id + ':' + (ev.subitem_id || ''), index);
      this.fs.jawakFormMain.jawaks[index].condition_id = ev.condition_id;
      this.fs.jawakFormMain.jawaks[index].aawak_source_id = ev.aawak_source_id;
      this.fs.jawakFormMain.jawaks[index].rate = ev.rate;
      this.fs.jawakFormMain.jawaks[index].unit_id = ev.unit_id;
    }

  }

  onChangeSearch(ev: any, index: any) {
    this.fs.jawakFormMain.jawaks[index].lot_no = ev;
  }

  focusoutLotNo(index: any) {
    let lot_no = this.lotNos.find((l: any) => l.lot_no == this.fs.jawakFormMain.jawaks[index].lot_no);
    if (lot_no) {
      this.selectEvent(lot_no, index);
    }
  }

  openModal(type: string) {
    this.showModal = type;
    $('#bunchJawakEntryComponent > #showModal').modal('show');
  }

  closeModal() {
    this.showModal = '';
    $('#bunchJawakEntryComponent > #showModal').modal('hide');
  }

  getLotNo() {
    this.http.get(this.api.getUrl('LIST') + 'lot_no/' + this.auth.webUser.dept_id).subscribe((data: any) => {
      this.lotNoAll = data['result'] || [];
      this.lotNos = data['result'] || [];
    })
  }

  openImageModal(index: any) {
    this.showModal = 'Add Image';
    this.imageIndex = index;
    $('#bunchJawakEntryComponent > #addImages').modal('show')
  }

  bunchJawakSubmit() {
    this.fs.submit = true;
    if (this.fs.validJawak()) {

      this.isLoader = true;
      this.http.post(this.api.getUrl('JAWAK') + 'bunch/' + this.auth.webUser.dept_id, this.fs.jawakFormMain).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.imagepath = null;
          this.isLoader = false;
          this.fs.resetJawak();
          this.toastr.success('Jawak Added Successfully.');
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.fs.submit = false;
        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    } else {
      this.fs.submit = false;
      this.toastr.error('Form is not valid');
      this.isLoader = false;
    }
  }

  bunchJawakUpdate() {
    this.fs.submit = true;
    if (this.fs.validJawak()) {

      this.isLoader = true;
      this.http.put(this.api.getUrl('JAWAK') + 'bunch/' + this.auth.webUser.dept_id, this.fs.jawakFormMain).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.imagepath = null;
          this.isLoader = false;
          this.fs.resetJawak();
          this.toastr.success('Jawak Updated Successfully.');
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.fs.submit = false;
        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    } else {
      this.fs.submit = false;
      this.toastr.error('Form is not valid');
      this.isLoader = false;
    }

  }

  stateSelected(ev: any) {
    if (ev) {
      this.pbks = this.gs.Lists.pbk.filter((p: { state_id: any; }) => p.state_id == ev);
    }
    else {
      this.pbks = this.gs.Lists.pbk;
    }
  }

  itemSubitemSelected(ev: any, i: any) {
    const jwk = this.fs.jawakFormMain.jawaks[i];
    if (ev) {
      const item_id = ev.item_id || jwk.item_id;
      const subitem_id = ev.subitem_id || jwk.subitem_id;
      jwk.item_id = item_id;
      jwk.subitem_id = subitem_id;

      let item: any = this.items.find((it: { _id: any; }) => it._id == item_id);
      if (item) {
        let subitem: any = item.subitems ? item.subitems.find((s: { _id: any; }) => s._id == subitem_id) : null;
        this.lotNos = this.lotNoAll.filter((l: { item_id: any; subitem_id: any; }) => l.item_id == item_id && l.subitem_id == subitem_id);
        this.getProductData(item_id);
        jwk.subitems = item.subitems || [];

        if (!this.isEdit) {
          if (subitem) jwk.unit_id = subitem.unit_id;
          else jwk.unit_id = item.unit_id;
        }
      }
      this.updateFilterObj(i);
    }
    else {
      jwk.item_id = null;
      jwk.subitem_id = null;
      jwk.subitems = [];
      this.lotNos = this.lotNoAll;
      jwk.unit_id = null;
      jwk.lot_no = null;
      this.updateFilterObj(i);
    }
  }

  subitemSelected(ev: any, i: any) {
    if (ev) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
      this.lotNos = this.lotNos.filter((l: { subitem_id: any; }) => l.subitem_id == ev);
      this.products = this.products.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
      if (!this.isEdit && subitem)
        this.fs.jawakFormMain.jawaks[i].unit_id = subitem.unit_id;
      this.updateFilterObj(i);
    }
    else {
      if (this.fs.jawakFormMain.jawaks[i].item_id) {
        this.products = this.getProductData(this.fs.jawakFormMain.jawaks[i].item_id);
        this.lotNos = this.lotNoAll.filter((l: { item_id: any; }) => l.item_id == this.fs.jawakFormMain.jawaks[i].item_id);
      } else {
        this.products = []
        this.lotNos = this.lotNoAll;
        this.fs.jawakFormMain.jawaks[i].lot_no = null;
      }
      this.updateFilterObj(i);
    }
  }

  productSelected(ev: any, i: any) {
    // this.isCondition = true;
    let product = this.products.find((p: { _id: any; }) => p._id == ev);
    this.fs.jawakFormMain.jawaks[i].condition_id = product ? product.condition_id : null;
    this.fs.jawakFormMain.jawaks[i].item_id = product.item_id;
    this.fs.jawakFormMain.jawaks[i].subitem_id = product.subitem_id;
    this.fs.jawakFormMain.jawaks[i].qty = 1;
    this.fs.jawakFormMain.jawaks[i].unit_id = 1;
    this.fs.jawakFormMain.jawaks[i].rate = product.price ? product.price : null;
    this.updateFilterObj(i);
    this.rateClick(i);
  }

  qtyClick(i: any) {
    if (this.fs.jawakFormMain.jawaks[i].qty && this.fs.jawakFormMain.jawaks[i].rate) {
      let actual_amt = this.fs.jawakFormMain.jawaks[i].qty * this.fs.jawakFormMain.jawaks[i].rate
      this.fs.jawakFormMain.jawaks[i].actual_amt = actual_amt.toFixed(2);
    }
    else if (this.fs.jawakFormMain.jawaks[i].qty && this.fs.jawakFormMain.jawaks[i].actual_amt) {
      let rate = this.fs.jawakFormMain.jawaks[i].actual_amt / this.fs.jawakFormMain.jawaks[i].qty
      this.fs.jawakFormMain.jawaks[i].rate = rate.toFixed(2);
    }
  }

  rateClick(i: any) {
    if (!this.fs.jawakFormMain.jawaks[i].actual_amt && this.fs.jawakFormMain.jawaks[i].qty && this.fs.jawakFormMain.jawaks[i].rate) {
      let actual_amt = this.fs.jawakFormMain.jawaks[i].qty * this.fs.jawakFormMain.jawaks[i].rate;
      this.fs.jawakFormMain.jawaks[i].actual_amt = actual_amt.toFixed(2)
    }
    else if (!this.fs.jawakFormMain.jawaks[i].actual_amt && this.fs.jawakFormMain.jawaks[i].rate && this.fs.jawakFormMain.jawaks[i].actual_amt) {
      let quantity = this.fs.jawakFormMain.jawaks[i].actual_amt / this.fs.jawakFormMain.jawaks[i].rate;
      this.fs.jawakFormMain.jawaks[i].qty = quantity.toFixed(2)
    }
  }

  amntClick(i: any) {
    if (!this.fs.jawakFormMain.jawaks[i].rate && this.fs.jawakFormMain.jawaks[i].qty && this.fs.jawakFormMain.jawaks[i].actual_amt) {
      let rate = this.fs.jawakFormMain.jawaks[i].actual_amt / this.fs.jawakFormMain.jawaks[i].qty
      this.fs.jawakFormMain.jawaks[i].rate = rate.toFixed(2)
    }
    else if (!this.fs.jawakFormMain.jawaks[i].qty && this.fs.jawakFormMain.jawaks[i].rate && this.fs.jawakFormMain.jawaks[i].actual_amt) {
      let quantity = this.fs.jawakFormMain.jawaks[i].actual_amt / this.fs.jawakFormMain.jawaks[i].rate
      this.fs.jawakFormMain.jawaks[i].qty = quantity.toFixed(2)
    }
  }

  imagesSelectResponse(ev: any) {
    console.log("awk image", ev);
    if (ev) {
      this.isLoader = true;
      this.imagepath = ev;
      this.fs.jawakFormMain.jawaks[this.imageIndex].document = { images: ev }
      $('#bunchJawakEntryComponent > #addImages').modal('hide');
      this.showModal = '';
      this.imageIndex = null;
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }

  addJawak(i: any) {

  }

  getProductData(item_id: any) {
    let body = {};
    if (item_id && item_id != undefined) {
      body = {
        item_id: item_id
      }

    }
    this.http.put(this.api.getUrl('PRODUCT') + 'unique/' + this.auth.webUser.dept_id, body).subscribe((data: any) => {
      if (data['result']) {
        this.products = data['result'];
      }
    });
  }

  usageTypeSelected(ev: any, i: any) {

    if (ev == 'add') {
      console.log(ev, i);
      this.insertIndex = i;
      this.openModal('Add Usage Type')
    }
  }

  usageTypeAddResponse(ev: any) {
    if (ev._id) {
      this.fs.jawakFormMain.jawaks[this.insertIndex].usage_report.usage_type = ev._id;
      this.closeModal();
    }
  }
}
