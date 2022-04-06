import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
declare var $: any;
@Component({
  selector: 'app-jawak-entry',
  templateUrl: './jawak-entry.component.html',
  styleUrls: ['./jawak-entry.component.scss']
})
export class JawakEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  jawakForm: FormGroup;
  allList: any = {};
  mms: any = [];
  pbks: any = [];
  products: any = [];
  productsAll: any = [];
  viewData: any = [];
  viewType: any;
  showModal: String = '';
  isLoader: boolean = false;
  imagebase: any = [];
  imagepath: any;
  departments: any = [];
  unit_short: any = "";
  conditions: any = [];
  subitems: any = [];
  items: any = [];
  jawak_types: any = [];
  units: any = [];
  states: any = [];
  categories: any = [];
  isCondition: any = false;
  remaining_qty: any;
  ref_id:any = null;
  cat: any;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    public api: ApiService,
    private toastr: ToastrService,
    public gs: GlobalService,
    public auth: AuthService,
    private spinner: NgxSpinnerService
  ) {
    this.jawakForm = this.fb.group({
      date: [null, Validators.required],
      mm_id: [null, Validators.required],
      pkt_num: [null],
      jawak_mm_id: [null],
      pbk_id: [null],
      item_id: [null, Validators.required],
      subitem_id: [null],
      item_detail: [null],
      product_id: [null],
      condition_id: [null],
      qty: [null, Validators.required],
      jawak_type_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      description: [null],
      aawak_ref_id: [null],
      nimmit: [null],
      dept_id: [this.auth.webUser.dept_id],
    });
  }

  ngOnInit(): void {
    console.log("jawak-ngOnInit");
    this.mms = this.gs.Lists.mm;
    // this.departments = this.gs.Lists.department;
    this.conditions = this.gs.Lists.condition;
    this.jawak_types = this.gs.Lists.jawak_type;
    // this.subitems = this.gs.Lists.subitem;
    this.items = this.gs.Lists.itemmix;
    this.categories = this.gs.Lists.category;
    this.units = this.gs.Lists.unit;
    this.pbks = this.gs.Lists.pbk;
    this.states = this.gs.Lists.state;
    this.loadProduct();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("pbk-changes", changes);
    if (changes.getData.currentValue) {
      this.jawakForm.patchValue({
        date: changes.getData.currentValue.date,
        mm_id: changes.getData.currentValue.mm_id,
        pkt_num: changes.getData.currentValue.pkt_num,
        jawak_mm_id: changes.getData.currentValue.jawak_mm_id,
        pbk_id: changes.getData.currentValue.pbk_id,
        item_id: changes.getData.currentValue.item_id,
        subitem_id: changes.getData.currentValue.subitem_id,
        item_detail: changes.getData.currentValue.item_detail,
        product_id: changes.getData.currentValue.product_id,
        condition_id: changes.getData.currentValue.condition_id,
        qty: changes.getData.currentValue.qty,
        jawak_type_id: changes.getData.currentValue.jawak_type_id,
        unit_id: changes.getData.currentValue.unit_id,
        description: changes.getData.currentValue.description,
        aawak_ref_id: changes.getData.currentValue.aawak_ref_id,
        nimmit: changes.getData.currentValue.nimmit,
        dept_id: changes.getData.currentValue.dept_id,
      });
      if (changes.getData.currentValue.aawak_ref_id) {
        this.ref_id = changes.getData.currentValue.aawak_ref_id;
      }
      // this.unit_short = changes.getData.currentValue.unit_id
    }
  }

  loadProduct() {
    this.http.get(this.api.getUrl('PRODUCT') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.productsAll = data['result'];
        this.products = data['result'];
      }
    });
  }

  openModal(type: String) {
    this.showModal = type;
    $('#jawakEntryComponent > #showModal').modal('show');
  }

  setView(type: string) {
    this.viewType = type;
    switch (type) {
      case 'Condition':
        this.viewData = this.gs.Lists.condition;
        $('#jawakEntryComponent > #dataView').modal('show');
        break;
      case 'Gender':
        this.viewData = this.gs.Lists.gender;
        $('#jawakEntryComponent > #dataView').modal('show');
        break;
      case 'Status':
        this.viewData = this.gs.Lists.status;
        $('#jawakEntryComponent > #dataView').modal('show');
        break;
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

  catSelected(ev: any) {
    if (ev) {
      this.cat = ev;
      this.items = this.gs.Lists.itemmix.filter((i: { category_id: any, categories: any }) => i.category_id == ev || i.categories.includes(ev));
    }
    else {
      this.cat = null;
      this.items = this.gs.Lists.item;
    }
    this.unit_short = null;
    this.jawakForm.patchValue({
      item_id: null,
      subitem_id: null,
      unit_id: null,
      product_id: null
    })
  }

  itemSelected(ev: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);
      if (this.cat) {
        this.subitems = item.subitems.filter((s: { category_id: any; }) => s.category_id == this.cat);
      }
      else {
        this.subitems = item.subitems;
      }

      if (this.cat && this.cat != item.category_id) {
        this.jawakForm.setControl('subitem_id', this.fb.control(null, [Validators.required]));
      } else {
        this.jawakForm.setControl('subitem_id', this.fb.control(null));
      }
      this.unit_short = item.unit_short;
      this.jawakForm.patchValue({
        unit_id: item.unit_id
      });
    }
    else {
      this.subitems = [];
      this.unit_short = null;
      this.jawakForm.patchValue({
        unit_id: null
      });
    }
  }

  subitemSelected(ev: any) {
    if (ev) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
      this.products = this.productsAll.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
      this.jawakForm.patchValue({
        unit_id: subitem.unit_id,
      });
      this.unit_short = subitem.unit_short;

    }
    else {
      this.products = this.productsAll;
    }
  }

  productSelected(ev: any) {
    this.isCondition = true;
    let product = this.products.find((p: { _id: any; }) => p._id == ev);
    this.jawakForm.patchValue({
      condition_id: product ? product.condition_id : null
    });
  }

  jawakFormSubmit() {
    console.log("clicked");
    
    if (this.jawakForm.valid) {
      console.log("form valid");
      
      this.isLoader = true;
      this.http.post(this.api.getUrl('JAWAK') + this.auth.webUser.dept_id, this.jawakForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.pbk.unshift(data['result'])
          this.jawakForm.reset({ active: true });
          this.isLoader = false;
          this.toastr.success("PBK Added Successfully.")
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['error'].message);
        this.isLoader = false;
      });
    }
    else {
      console.log("form invalid", this.jawakForm);
      
      this.gs.validationFireOnSubmit(this.jawakForm);
    }
  }

  jawakFormUpdate() {
    if (this.jawakForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        date: this.jawakForm.value.date,
        mm_id: this.jawakForm.value.mm_id,
        pkt_num: this.jawakForm.value.pkt_num,
        jawak_mm_id: this.jawakForm.value.jawak_mm_id,
        pbk_id: this.jawakForm.value.pbk_id,
        item_id: this.jawakForm.value.item_id,
        subitem_id: this.jawakForm.value.subitem_id,
        item_detail: this.jawakForm.value.item_detail,
        product_id: this.jawakForm.value.product_id,
        condition_id: this.jawakForm.value.condition_id,
        qty: this.jawakForm.value.qty,
        jawak_type_id: this.jawakForm.value.jawak_type_id,
        unit_id: this.jawakForm.value.unit_id,
        description: this.jawakForm.value.description,
        aawak_ref_id: this.jawakForm.value.aawak_ref_id,
        nimmit: this.jawakForm.value.nimmit,
        dept_id: this.jawakForm.value.dept_id,
      };
      this.http.put(this.api.getUrl('JAWAK'), body).subscribe((data: any) => {
        if (data && data['success']) {
          // this.gs.Lists.pbk.splice(this.gs.Lists.pbk.indexOf((i: { _id: any }) => { i._id == this.getData._id }), 1, data['result'])
          this.jawakForm.reset();
          this.isLoader = false;
          this.toastr.success("Jawak Updated Successfully");
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['error'].message);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.jawakForm);
    }
  }

  mmAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#jawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.mms.unshift(ev);
      this.jawakForm.patchValue(
        {
          mm_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  jmmAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#jawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.mms.unshift(ev);
      this.jawakForm.patchValue(
        {
          jawak_mm_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  itemAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#jawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.subitems.unshift(ev);
      this.jawakForm.patchValue(
        {
          item_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  subitemAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#jawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.subitems.unshift(ev);
      this.jawakForm.patchValue(
        {
          subitem_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  conditionAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#jawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.conditions.unshift(ev);
      this.jawakForm.patchValue(
        {
          condition_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  pbkAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#jawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.conditions.unshift(ev);
      this.jawakForm.patchValue(
        {
          pbk_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  deptSelected(ev: any) {
    console.log("ev", ev);
  }


}