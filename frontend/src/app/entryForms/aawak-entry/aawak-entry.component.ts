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
  selector: 'app-aawak-entry',
  templateUrl: './aawak-entry.component.html',
  styleUrls: ['./aawak-entry.component.scss']
})
export class AawakEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any = false;
  @Output() response = new EventEmitter();
  aawakForm: FormGroup;
  states: any = [];
  aawaks: any = [];
  departments: any = [];
  showModal: string = ''
  isLoader: boolean = false;
  viewType: any;
  parentAawak: any;
  viewData: any = [];
  items: any = [];
  units: any = [];
  mms: any = [];
  conditions: any = [];
  subitems: any = [];
  pbks: any = [];
  qty: any;
  oldQty: any;
  unit: any;
  cat: any;
  rate: any;
  amnt: any;
  aawak_types: any = [];
  products: any = [];
  categories: any = [];
  isCondition: any = false;
  productsAll: any = [];

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.aawakForm = this.fb.group({
      pkt_num: [null],
      date: [null, Validators.required],
      mm_id: [null, Validators.required],
      aawak_mm_id: [null],
      dept_id: [this.auth.webUser.dept_id],
      pbk_id: [null],
      aawak_type_id: [null, Validators.required],
      item_id: [null, Validators.required],
      subitem_id: [null],
      product_id: [null],
      unit_id: [null, Validators.required],
      condition_id: [null],
      qty: [null, Validators.required],
      rate: [null],
      actual_amt: [null],
      nimmit: [null],
      item_detail: [null],
      description: [null],
      remaining_qty: [null]
    });
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.items = result.itemmix ? result.itemmix : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.products = result.product ? result.product : [];
      this.categories = result.category ? result.category : [];
    });
  }

  openModal(name: any) {
    this.showModal = name;
    $('#aawakEntryComponent > #' + name).modal('show')
  }

  closeModal(name: any) {
    this.showModal = name;
    $('#aawakEntryComponent > #' + this.showModal).modal('hide')
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("changes.getData.currentValue", changes.getData.currentValue);

    if (changes.getData.currentValue) {
      this.aawakForm.patchValue({
        pkt_num: changes.getData.currentValue.pkt_num,
        date: changes.getData.currentValue.date,
        mm_id: changes.getData.currentValue.mm_id,
        aawak_mm_id: changes.getData.currentValue.aawak_mm_id,
        dept_id: changes.getData.currentValue.dept_id,
        pbk_id: changes.getData.currentValue.pbk_id,
        aawak_type_id: changes.getData.currentValue.aawak_type_id,
        item_id: changes.getData.currentValue.item_id,
        subitem_id: changes.getData.currentValue.subitem_id,
        product_id: changes.getData.currentValue.product_id,
        unit_id: changes.getData.currentValue.unit_id,
        condition_id: changes.getData.currentValue.condition_id,
        qty: changes.getData.currentValue.qty,
        rate: changes.getData.currentValue.rate,
        actual_amt: changes.getData.currentValue.actual_amt,
        nimmit: changes.getData.currentValue.nimmit,
        item_detail: changes.getData.currentValue.item_detail,
        description: changes.getData.currentValue.description,
        remaining_qty: changes.getData.currentValue.remaining_qty
      });
      this.qty = changes.getData.currentValue.qty;
      this.rate = changes.getData.currentValue.rate;
      this.amnt = changes.getData.currentValue.actual_amt;
      this.oldQty = changes.getData.currentValue.qty
      this.unit = changes.getData.currentValue.unit_short;
      setTimeout(() => {
        this.itemSelected(changes.getData.currentValue.item_id);
        if (changes.getData.currentValue.subitem_id) {
          this.subitemSelected(changes.getData.currentValue.subitem_id);
          setTimeout(() => {
            this.aawakForm.patchValue({
              subitem_id: changes.getData.currentValue.subitem_id
            })
          }, 50);
        }
      }, 100);
    }
  }


  aawakFormSubmit() {
    if (this.aawakForm.valid) {
      this.isLoader = true;
      this.aawakForm.patchValue({
        remaining_qty: this.qty
      })
      this.http.post(this.api.getUrl('AAWAK') + this.auth.webUser.dept_id, this.aawakForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.qty = null;
          this.rate = null;
          this.amnt = null;
          this.aawakForm.reset();
          this.isLoader = false;
          this.toastr.success('Aawak Added Successfully.');
          console.log("sub");
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.aawakForm);
    }
  }

  aawakFormUpdate() {
    if (this.aawakForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        pkt_num: this.aawakForm.value.pkt_num,
        date: this.aawakForm.value.date,
        mm_id: this.aawakForm.value.mm_id,
        aawak_mm_id: this.aawakForm.value.aawak_mm_id,
        dept_id: this.aawakForm.value.dept_id,
        pbk_id: this.aawakForm.value.pbk_id,
        aawak_type_id: this.aawakForm.value.aawak_type_id,
        item_id: this.aawakForm.value.item_id,
        subitem_id: this.aawakForm.value.subitem_id,
        product_id: this.aawakForm.value.product_id,
        unit_id: this.aawakForm.value.unit_id,
        condition_id: this.aawakForm.value.condition_id,
        qty: this.aawakForm.value.qty,
        rate: this.aawakForm.value.rate,
        actual_amt: this.aawakForm.value.actual_amt,
        nimmit: this.aawakForm.value.nimmit,
        item_detail: this.aawakForm.value.item_detail,
        description: this.aawakForm.value.description,
        remaining_qty: this.aawakForm.value.remaining_qty + (this.aawakForm.value.qty - this.oldQty),
      };
      this.http.put(this.api.getUrl('AAWAK'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.qty = null;
          this.rate = null;
          this.amnt = null;
          this.aawakForm.reset();
          this.isLoader = false;
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
    }
    else {
      this.gs.validationFireOnSubmit(this.aawakForm);
    }
  }

  stateAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#aawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.states.unshift(ev);
      this.aawakForm.patchValue({ state_id: ev._id });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  departmentAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#aawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.departments.unshift(ev);
      this.aawakForm.patchValue(
        {
          dept_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      console.log("err", ev);
      this.isLoader = false;
    }
  }

  mmAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#aawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.mms.unshift(ev);
      this.aawakForm.patchValue(
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

  itemAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#aawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.subitems.unshift(ev);
      this.aawakForm.patchValue(
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
      $('#aawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.subitems.unshift(ev);
      this.aawakForm.patchValue(
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
      $('#aawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.conditions.unshift(ev);
      this.aawakForm.patchValue(
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

  unitAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#aawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.units.unshift(ev);
      this.aawakForm.patchValue(
        {
          unit_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  ammAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#aawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.aawakForm.patchValue(
        {
          aawak_mm_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  pbkAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#aawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.aawakForm.patchValue(
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

  productAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#aawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.aawakForm.patchValue(
        {
          product_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }


  setView(type: string) {
    this.viewType = type;
    switch (type) {
      case 'Condition':
        this.viewData = this.gs.Lists.condition;
        $('#aawakEntryComponent > #dataView').modal('show');
        break;
      case 'Department':
        this.viewData = this.gs.Lists.department;
        $('#aawakEntryComponent > #dataView').modal('show');
        break;
      case 'Unit':
        this.viewData = this.gs.Lists.unit;
        $('#aawakEntryComponent > #dataView').modal('show');
        break;
    }
  }

  parentAawakSelected(ev: any) {
    this.parentAawak = ev ? ev : '';
    let parentAawak = this.aawaks.find((i: { _id: any; }) => i._id == ev);
    this.aawakForm.patchValue({
      aawak_hin: parentAawak ? parentAawak.aawak_hin : null,
      aawak_eng: parentAawak ? parentAawak.aawak_eng : null,
      aawak_code: parentAawak ? parentAawak.aawak_code : null,
      state_id: parentAawak ? parentAawak.state_id : null,
    });
  }

  qtyclick() {
    if (this.qty && this.rate) {
      let actual_amt = this.qty * this.rate
      this.aawakForm.patchValue({
        actual_amt: actual_amt.toFixed(2)
      });
    }
    else if (this.qty && this.amnt) {
      let rate = this.amnt / this.qty
      this.aawakForm.patchValue({
        rate: rate.toFixed(2)
      });
    }
  }

  rateclick() {
    if (this.qty && this.rate) {
      let actual_amt = this.qty * this.rate;
      this.aawakForm.patchValue({
        actual_amt: actual_amt.toFixed(2)
      });
    }
    else if (this.rate && this.amnt) {
      let quantity = this.amnt / this.rate;
      this.aawakForm.patchValue({
        quantity: quantity.toFixed(2)
      });
      this.qty = quantity;
    }
  }

  amntclick() {
    if (this.qty && this.amnt) {
      let rate = this.amnt / this.qty
      this.aawakForm.patchValue({
        rate: rate.toFixed(2)
      });
    }
    else if (this.rate && this.amnt) {
      let quantity = this.amnt / this.rate
      this.aawakForm.patchValue({
        quantity: quantity.toFixed(2)
      });
    }
  }

  pbkbystate(ev: any) { }

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
      this.items = this.gs.Lists.itemmix;
    }
    this.unit = null;
    this.aawakForm.patchValue({
      item_id: null,
      subitem_id: null,
      unit_id: null,
      product_id: null
    })
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

      if (this.cat && this.cat != item.category_id) {
        this.aawakForm.setControl('subitem_id', this.fb.control(null, [Validators.required]));
      } else {
        this.aawakForm.setControl('subitem_id', this.fb.control(null));
      }
      this.unit = item.unit_short;
      this.aawakForm.patchValue({
        unit_id: item.unit_id
      });
    }
    else {
      this.subitems = [];
      this.unit = null;
      this.aawakForm.patchValue({
        unit_id: null
      });
    }
  }

  subitemSelected(ev: any) {
    if (ev) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
      this.products = this.productsAll.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
      this.aawakForm.patchValue({
        unit_id: subitem.unit_id
      });
      this.unit = subitem.unit_short;
    }
    else {
      this.products = this.productsAll;
    }
  }

  productSelected(ev: any) {
    this.isCondition = true;
    let product = this.products.find((p: { _id: any; }) => p._id == ev);
    this.aawakForm.patchValue({
      condition_id: product ? product.condition_id : null
    });
  }

  deptSelected(ev: any) {
    console.log("ev", ev);
  }


}
