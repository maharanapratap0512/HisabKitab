import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { debounceTime } from 'rxjs';
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
  lotNos: any = [];
  keyword: any = 'lot_no';


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
    if(this.isEdit){
      this.fs.reset();
    }
    
  }

  selectEvent(ev: any, index: any) {
    if (ev.lot_no) {
      this.fs.aawakFormMain.aawaks[index].item_id = ev.item_id;
      this.fs.aawakFormMain.aawaks[index].subitem_id = ev.subitem_id;
      this.fs.aawakFormMain.aawaks[index].condition_id = ev.condition_id;
      this.fs.aawakFormMain.aawaks[index].aawak_source_id = ev.aawak_source_id;
      this.fs.aawakFormMain.aawaks[index].rate = ev.rate;
      this.fs.aawakFormMain.aawaks[index].unit_id = ev.unit_id;
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
        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    } else {
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
        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    } else {
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

      this.getProductData(ev);
      // this.subitems = item.subitems || [];
      this.fs.aawakFormMain.aawaks[i].subitems = item.subitems || [];

      if (!this.isEdit)
        this.fs.aawakFormMain.aawaks[i].unit_id = item.unit_id;
    }
    else {
      this.subitems = [];
      this.fs.aawakFormMain.aawaks[i].unit_id = null
      this.fs.aawakFormMain.aawaks[i].subitem_id = null
    }
  }

  subitemSelected(ev: any, i: any) {
    if (ev) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
      this.products = this.products.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
      if (!this.isEdit && subitem)
        this.fs.aawakFormMain.aawaks[i].unit_id = subitem.unit_id; 
    }
    else {
      if (this.fs.aawakFormMain.aawaks[i].item_id) {
        this.products = this.getProductData(this.fs.aawakFormMain.aawaks[i].item_id);
      } else {
        this.products = []
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
}
