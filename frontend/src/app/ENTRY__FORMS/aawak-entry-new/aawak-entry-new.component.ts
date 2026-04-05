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
  selector: 'app-aawak-entry-new',
  templateUrl: './aawak-entry-new.component.html',
  styleUrls: ['./aawak-entry-new.component.scss']
})
export class AawakEntryNewComponent implements OnInit {

  @ViewChild('fMain') fMain!: NgForm;
  @Input() isEdit: any;
  @Input() getData: any;
  @Output() response = new EventEmitter();
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
  editData: any;
  viewData: any;
  currentBatchRowIndex: any;

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
      // this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.usage_lists = result.usage_list ? result.usage_list : [];
      this.aawak_sources = result.aawak_source ? result.aawak_source : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });
    this.settings = this.auth.webUser.settings;
    this.getLotNo();
  }

  ngOnInit(): void {

    setTimeout(() => {
      if (this.fMain) {
        this.fMain.statusChanges?.pipe(debounceTime(200)).subscribe(() => {
          this.fs.formStatusChanges()
        });
      }
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isEdit && changes.isEdit.currentValue) {
    }
    if (changes.getData && changes.getData.currentValue) {
      this.fs.aawakFormMain = { ...this.fs.aawakForm, ...changes.getData.currentValue }
      this.fs.formStatusChanges()
      for (let i in this.fs.aawakFormMain.aawaks) {
        if (this.fs.aawakFormMain.aawaks[i].item_id) {
          this.itemSelected(this.fs.aawakFormMain.aawaks[i].item_id, i);
        }
      }

    }
  }

  ngOnDestroy(): void {
    if (this.isEdit) {
      this.fs.reset();
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

    this.fs.aawakFormMain.aawaks[row.i].hl = !row.hl;
  }

  selectEvent(ev: any, index: any) {
    if (ev.lot_no) {
      this.fs.aawakFormMain.aawaks[index].item_id = ev.item_id;
      this.itemSelected(ev.item_id, index);
      this.fs.aawakFormMain.aawaks[index].subitem_id = ev.subitem_id;
      this.fs.aawakFormMain.aawaks[index].condition_id = ev.condition_id;
      this.fs.aawakFormMain.aawaks[index].aawak_source_id = ev.aawak_source_id;
      this.fs.aawakFormMain.aawaks[index].rate = ev.rate;
      this.fs.aawakFormMain.aawaks[index].unit_id = ev.unit_id;
      this.fs.aawakFormMain.aawaks[index].lot_no = ev.lot_no;
    }

  }

  onChangeSearch(ev: any, index: any) {
    this.fs.aawakFormMain.aawaks[index].lot_no = ev;
  }

  focusoutLotNo(index: any) {
    let lot_no = this.lotNos.find((l: any) => l.lot_no == this.fs.aawakFormMain.aawaks[index].lot_no);
    if (lot_no) {
      this.selectEvent(lot_no, index);
    }
  }

  openModal(type: string) {
    this.showModal = type;
    $('#bunchAawakEntryComponent > #showModal').modal('show');
  }

  closeModal() {
    this.showModal = '';
    $('#bunchAawakEntryComponent > #showModal').modal('hide');
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
    $('#bunchAawakEntryComponent > #addImages').modal('show')
  }

  bunchAawakSubmit() {
    this.fs.submit = true;
    if (this.fs.valid()) {

      this.isLoader = true;
      this.http.post(this.api.getUrl('AAWAK') + 'bunch/' + this.auth.webUser.dept_id, this.fs.aawakFormMain).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.imagepath = null;
          this.isLoader = false;
          this.fs.reset();
          this.toastr.success('Aawak Added Successfully.');
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

  bunchAawakUpdate() {
    this.fs.submit = true;
    if (this.fs.valid()) {

      this.isLoader = true;
      this.http.put(this.api.getUrl('AAWAK') + 'bunch/' + this.auth.webUser.dept_id, this.fs.aawakFormMain).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.imagepath = null;
          this.isLoader = false;
          this.fs.reset();
          this.toastr.success('Aawak Updated Successfully.');
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

  itemSelected(ev: any, i: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);
      this.lotNos = this.lotNoAll.filter((l: { item_id: any; }) => l.item_id == ev);
      this.getProductData(ev);
      // this.subitems = item.subitems || [];
      this.fs.aawakFormMain.aawaks[i].subitems = item.subitems || [];

      if (!this.isEdit)
        this.fs.aawakFormMain.aawaks[i].unit_id = item.unit_id;
    }
    else {
      this.subitems = [];
      this.lotNos = this.lotNoAll;
      this.fs.aawakFormMain.aawaks[i].unit_id = null
      this.fs.aawakFormMain.aawaks[i].subitem_id = null
      this.fs.aawakFormMain.aawaks[i].lot_no = null;
    }
  }

  subitemSelected(ev: any, i: any) {
    if (ev) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
      this.lotNos = this.lotNos.filter((l: { subitem_id: any; }) => l.subitem_id == ev);
      this.products = this.products.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
      if (!this.isEdit && subitem)
        this.fs.aawakFormMain.aawaks[i].unit_id = subitem.unit_id;
    }
    else {
      if (this.fs.aawakFormMain.aawaks[i].item_id) {
        this.products = this.getProductData(this.fs.aawakFormMain.aawaks[i].item_id);
        this.lotNos = this.lotNoAll.filter((l: { item_id: any; }) => l.item_id == this.fs.aawakFormMain.aawaks[i].item_id);
      } else {
        this.products = []
        this.lotNos = this.lotNoAll;
        this.fs.aawakFormMain.aawaks[i].lot_no = null;
      }
    }
  }

  productSelected(ev: any, i: any) {
    // this.isCondition = true;
    let product = this.products.find((p: { _id: any; }) => p._id == ev);
    this.fs.aawakFormMain.aawaks[i].condition_id = product ? product.condition_id : null;
    this.fs.aawakFormMain.aawaks[i].item_id = product.item_id;
    this.fs.aawakFormMain.aawaks[i].subitem_id = product.subitem_id;
    this.fs.aawakFormMain.aawaks[i].qty = 1;
    this.fs.aawakFormMain.aawaks[i].unit_id = 1;
    this.fs.aawakFormMain.aawaks[i].rate = product.price ? product.price : null;
    this.rateClick(i);
  }

  qtyClick(i: any) {
    if (this.fs.aawakFormMain.aawaks[i].qty && this.fs.aawakFormMain.aawaks[i].rate) {
      let actual_amt = this.fs.aawakFormMain.aawaks[i].qty * this.fs.aawakFormMain.aawaks[i].rate
      this.fs.aawakFormMain.aawaks[i].actual_amt = actual_amt.toFixed(2);
    }
    else if (this.fs.aawakFormMain.aawaks[i].qty && this.fs.aawakFormMain.aawaks[i].actual_amt) {
      let rate = this.fs.aawakFormMain.aawaks[i].actual_amt / this.fs.aawakFormMain.aawaks[i].qty
      this.fs.aawakFormMain.aawaks[i].rate = rate.toFixed(2);
    }
  }

  rateClick(i: any) {
    if (!this.fs.aawakFormMain.aawaks[i].actual_amt && this.fs.aawakFormMain.aawaks[i].qty && this.fs.aawakFormMain.aawaks[i].rate) {
      let actual_amt = this.fs.aawakFormMain.aawaks[i].qty * this.fs.aawakFormMain.aawaks[i].rate;
      this.fs.aawakFormMain.aawaks[i].actual_amt = actual_amt.toFixed(2)
    }
    else if (!this.fs.aawakFormMain.aawaks[i].actual_amt && this.fs.aawakFormMain.aawaks[i].rate && this.fs.aawakFormMain.aawaks[i].actual_amt) {
      let quantity = this.fs.aawakFormMain.aawaks[i].actual_amt / this.fs.aawakFormMain.aawaks[i].rate;
      this.fs.aawakFormMain.aawaks[i].qty = quantity.toFixed(2)
    }
  }

  amntClick(i: any) {
    if (!this.fs.aawakFormMain.aawaks[i].rate && this.fs.aawakFormMain.aawaks[i].qty && this.fs.aawakFormMain.aawaks[i].actual_amt) {
      let rate = this.fs.aawakFormMain.aawaks[i].actual_amt / this.fs.aawakFormMain.aawaks[i].qty
      this.fs.aawakFormMain.aawaks[i].rate = rate.toFixed(2)
    }
    else if (!this.fs.aawakFormMain.aawaks[i].qty && this.fs.aawakFormMain.aawaks[i].rate && this.fs.aawakFormMain.aawaks[i].actual_amt) {
      let quantity = this.fs.aawakFormMain.aawaks[i].actual_amt / this.fs.aawakFormMain.aawaks[i].rate
      this.fs.aawakFormMain.aawaks[i].qty = quantity.toFixed(2)
    }
  }

  imagesSelectResponse(ev: any) {
    console.log("awk image", ev);
    if (ev) {
      this.isLoader = true;
      this.imagepath = ev;
      this.fs.aawakFormMain.aawaks[this.imageIndex].document = { images: ev }
      $('#bunchAawakEntryComponent > #addImages').modal('hide');
      this.showModal = '';
      this.imageIndex = null;
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }

  isRowValid(i: any) {
    let row = this.fs.aawakFormMain.aawaks[i];
    return (row.item_id && row.qty && row.unit_id && row.aawak_type_id);
  }

  getJawakQty(i: any) {
    let row = this.fs.aawakFormMain.aawaks[i];
    if (row.jawak_detail && row.jawak_detail.length > 0) {
      return row.jawak_detail.reduce((acc: any, curr: any) => acc + Number(curr.qty), 0);
    }
    return 0;
  }

  addJawak(i: any) {
    this.currentBatchRowIndex = i;
    let row = JSON.parse(JSON.stringify(this.fs.aawakFormMain.aawaks[i]));

    // Enrich with top-level fields
    row.date = this.fs.aawakFormMain.date;
    row.mm_id = this.fs.aawakFormMain.mm_id;
    row.aawak_mm_id = this.fs.aawakFormMain.aawak_mm_id;
    row.pbk_id = this.fs.aawakFormMain.pbk_id;
    row.nimitt_id = this.fs.aawakFormMain.nimitt_id;
    row.description = this.fs.aawakFormMain.description;
    row.dept_id = this.fs.aawakFormMain.dept_id;

    // Enrich with display labels
    if (row.mm_id) {
      let mm = this.mms.find((m: any) => m._id == row.mm_id);
      row.mm_hin = mm ? (mm.mm_hin || mm.mm_eng) : '';
    }
    if (row.aawak_mm_id) {
      let mm = this.mms.find((m: any) => m._id == row.aawak_mm_id);
      row.aawak_mm_hin = mm ? (mm.mm_hin || mm.mm_eng) : '';
    }
    if (row.item_id) {
      let item = this.items.find((it: any) => it._id == row.item_id);
      row.item_hin = item ? (item.item_hin || item.item_eng) : '';
    }
    if (row.subitem_id) {
      let item = this.items.find((it: any) => it._id == row.item_id);
      let subitem = item?.subitems?.find((s: any) => s._id == row.subitem_id);
      row.subitem_hin = subitem ? (subitem.subitem_hin || subitem.subitem_eng) : '';
    }
    if (row.unit_id) {
      let unit = this.units.find((u: any) => u._id == row.unit_id);
      row.unit_short = unit ? unit.unit_short : '';
    }
    if (row.aawak_type_id) {
      let type = this.aawak_types.find((t: any) => t._id == row.aawak_type_id);
      row.aawak_type_hin = type ? type.list_name_hin : '';
    }

    this.editData = row;
    this.openModal("Add Jawak");
  }

  showJawak(i: any) {
    this.viewData = this.fs.aawakFormMain.aawaks[i].jawak_detail;
    this.openModal("Show Jawak");
  }

  enrichJawak(jwk: any) {
    if (jwk.jawak_mm_id) {
      let mm = this.mms.find((m: any) => m._id == jwk.jawak_mm_id);
      jwk.jawak_mm_hin = mm ? (mm.mm_hin || mm.mm_eng) : '';
      jwk.jawak_mm_eng = mm ? mm.mm_eng : '';
    }
    if (jwk.item_id) {
      let item = this.items.find((it: any) => it._id == jwk.item_id);
      jwk.item_hin = item ? (item.item_hin || item.item_eng) : '';
      jwk.item_eng = item ? item.item_eng : '';
      if (jwk.subitem_id) {
        let subitem = item?.subitems?.find((s: any) => s._id == jwk.subitem_id);
        jwk.subitem_hin = subitem ? (subitem.subitem_hin || subitem.subitem_eng) : '';
        jwk.subitem_eng = subitem ? subitem.subitem_eng : '';
      }
    }
    if (jwk.unit_id) {
      let unit = this.units.find((u: any) => u._id == jwk.unit_id);
      jwk.unit_short = unit ? unit.unit_short : '';
    }
    if (jwk.jawak_type_id) {
      let type = this.jawak_types.find((t: any) => t._id == jwk.jawak_type_id);
      jwk.jawak_type_hin = type ? type.list_name_hin : '';
      jwk.jawak_type_eng = type ? type.list_name_eng : '';
    }
    if (jwk.nimitt_id) {
      let nimitt = this.nimitts.find((n: any) => n._id == jwk.nimitt_id);
      jwk.nimitt_hin = nimitt ? (nimitt.nimitt_hin || nimitt.nimitt_eng) : '';
    }
    return jwk;
  }

  addJawakResponse(ev: any) {
    if (ev) {
      let enriched = this.enrichJawak(ev);
      if (!this.fs.aawakFormMain.aawaks[this.currentBatchRowIndex].jawak_detail) {
        this.fs.aawakFormMain.aawaks[this.currentBatchRowIndex].jawak_detail = [];
      }
      this.fs.aawakFormMain.aawaks[this.currentBatchRowIndex].jawak_detail.push(enriched);
      this.toastr.success("Jawak added to row " + (this.currentBatchRowIndex + 1));
      this.closeModal();
    }
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
}
