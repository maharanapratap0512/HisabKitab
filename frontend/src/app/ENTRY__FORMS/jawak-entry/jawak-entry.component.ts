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
  @Input() aawakRef: any;
  @Input() isEdit: any;
  @Input() noAPICall: any = false;
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
  conditions: any = [];
  subitems: any = [];
  items: any = [];
  jawak_types: any = [];
  aawak_types: any = [];
  units: any = [];
  nimitts: any = [];
  states: any = [];
  categories: any = [];
  usage_lists: any = [];
  usage_types: any = [];
  remaining_qty: any;
  ref_id: any = null;
  cat: any;
  settings: any = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    public api: ApiService,
    private toastr: ToastrService,
    public gs: GlobalService,
    public auth: AuthService,
    private spinner: NgxSpinnerService
  ) {
    this.settings = this.auth.webUser.settings;
    this.jawakForm = this.fb.group({
      date: [null, Validators.required],
      date_sent: [null],
      mm_id: [null, Validators.required],
      pkt_num: [null],
      lot_no: [null],
      jawak_mm_id: [null],
      pbk_id: [null],
      item_id: [null, Validators.required],
      subitem_id: [null],
      usage_list_id: [null],
      item_detail: [null],
      product_id: [null],
      condition_id: [null],
      company_name: [null],
      qty: [null, Validators.required],
      rate: [null],
      actual_amt: [null],
      aawak_source_id: [null],
      jawak_type_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      unit_short: '',
      description: [null],
      parchi_place: [null],
      sell_repair_place: [null],
      aawak_ref_id: [null],
      nimitt_id: [null],
      is_xl: [null],
      is_process: [null],
      dept_id: [this.auth.webUser.dept_id],
      auto_awk: [this.settings.jawak.auto_awk],
      auto_reawk: [this.settings.jawak.auto_reawk],
      aawak_type_id: [null],
      aawak_dept_id: [this.auth.webUser.dept_id],
      aawak_date: [null],
      re_aawak_type_id: [null],
      enz: this.fb.group({
        _id: [null],
        container_capacity: [null]
      })
    });

    this.jawakForm.get('auto_awk')?.valueChanges.subscribe(val => {
      if (val) {
        this.jawakForm.get('aawak_dept_id')?.setValidators([Validators.required]);
        this.jawakForm.get('aawak_type_id')?.setValidators([Validators.required]);
      } else {
        this.jawakForm.get('aawak_dept_id')?.clearValidators();
        this.jawakForm.get('aawak_type_id')?.clearValidators();
      }
      this.jawakForm.get('aawak_dept_id')?.updateValueAndValidity();
      this.jawakForm.get('aawak_type_id')?.updateValueAndValidity();
    });

    this.jawakForm.get('auto_reawk')?.valueChanges.subscribe(val => {
      if (val) {
        this.jawakForm.get('aawak_date')?.setValidators([Validators.required]);
        this.jawakForm.get('re_aawak_type_id')?.setValidators([Validators.required]);
      } else {
        this.jawakForm.get('aawak_date')?.clearValidators();
        this.jawakForm.get('re_aawak_type_id')?.clearValidators();
      }
      this.jawakForm.get('aawak_date')?.updateValueAndValidity();
      this.jawakForm.get('re_aawak_type_id')?.updateValueAndValidity();
    });

    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.units = result.unit ? result.unit : [];
      this.usage_lists = result.usage_list ? result.usage_list : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.states = result.state ? result.state : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
      this.usage_types = result.usage_type ? result.usage_type : [];
    });

    this.getDepartments();

  }

  async ngOnInit(): Promise<void> {
    console.log("jawak-ngOnInit");
    this.loadProduct();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("jawak-changes", changes);
    if (changes.getData && changes.getData.currentValue) {
      this.jawakForm.patchValue({
        date: changes.getData.currentValue.date,
        date_sent: changes.getData.currentValue.date_sent || null,
        mm_id: changes.getData.currentValue.mm_id,
        pkt_num: changes.getData.currentValue.pkt_num,
        lot_no: changes.getData.currentValue.lot_no || null,
        jawak_mm_id: changes.getData.currentValue.jawak_mm_id,
        pbk_id: changes.getData.currentValue.pbk_id,
        item_id: changes.getData.currentValue.item_id,
        subitem_id: changes.getData.currentValue.subitem_id,
        usage_list_id: changes.getData.currentValue.usage_list_id,
        item_detail: changes.getData.currentValue.item_detail,
        product_id: changes.getData.currentValue.product_id,
        condition_id: changes.getData.currentValue.condition_id,
        qty: changes.getData.currentValue.qty,
        remaining_qty: changes.getData.currentValue.remaining_qty ? changes.getData.currentValue.remaining_qty : 0,
        rate: changes.getData.currentValue.rate ? changes.getData.currentValue.rate : null,
        actual_amt: changes.getData.currentValue.actual_amt ? changes.getData.currentValue.actual_amt : null,
        company_name: changes.getData.currentValue.company_name,
        jawak_type_id: changes.getData.currentValue.jawak_type_id,
        aawak_source_id: changes.getData.currentValue.aawak_source_id || null,
        unit_id: changes.getData.currentValue.unit_id,
        description: changes.getData.currentValue.description,
        parchi_place: changes.getData.currentValue.parchi_place ? changes.getData.currentValue.parchi_place : null,
        sell_repair_place: changes.getData.currentValue.sell_repair_place ? changes.getData.currentValue.sell_repair_place : null,
        aawak_ref_id: changes.getData.currentValue.aawak_ref_id,
        nimitt_id: changes.getData.currentValue.nimitt_id,
        dept_id: changes.getData.currentValue.dept_id,
        is_xl: changes.getData.currentValue.is_xl ? changes.getData.currentValue.is_xl : 0,
        is_process: changes.getData.currentValue.is_process ? changes.getData.currentValue.is_process : 0,
        unit_short: changes.getData.currentValue.unit_short,
        auto_awk: changes.getData.currentValue.auto_awk ? changes.getData.currentValue.auto_awk : 0,
        auto_reawk: changes.getData.currentValue.auto_reawk ? changes.getData.currentValue.auto_reawk : 0,
        aawak_type_id: changes.getData.currentValue.aawak_type_id ? changes.getData.currentValue.aawak_type_id : null,
        aawak_dept_id: changes.getData.currentValue.aawak_dept_id ? changes.getData.currentValue.aawak_dept_id : null,
        aawak_date: changes.getData.currentValue.aawak_date ? changes.getData.currentValue.aawak_date : null,
        re_aawak_type_id: changes.getData.currentValue.re_aawak_type_id ? changes.getData.currentValue.re_aawak_type_id : null,
      });

      // Patch jawak_id in enz if editing
      if (changes.getData.currentValue.enz) {
        this.jawakForm.get('enz')?.patchValue({
          _id: changes.getData.currentValue.enz._id,
          container_capacity: changes.getData.currentValue.enz.container_capacity
        });
      }

      setTimeout(() => {
        this.itemSelected(changes.getData.currentValue.item_id);
        if (changes.getData.currentValue.subitem_id) {
          this.subitemSelected(changes.getData.currentValue.subitem_id);
          setTimeout(() => {
            this.jawakForm.patchValue({
              subitem_id: changes.getData.currentValue.subitem_id
            })
          }, 50);
        }
      }, 100);
    }
    if (changes.aawakRef && changes.aawakRef.currentValue) {
      this.aawakRef = changes.aawakRef.currentValue;
      this.jawakForm.patchValue({
        date: this.aawakRef.date,
        date_sent: this.aawakRef.date,
        lot_no: this.aawakRef.lot_no,
        mm_id: this.aawakRef.mm_id,
        item_id: this.aawakRef.item_id,
        subitem_id: this.aawakRef.subitem_id,
        item_detail: this.aawakRef.item_detail,
        product_id: this.aawakRef.product_id ? this.aawakRef.product_id : null,
        condition_id: this.aawakRef.condition_id,
        company_name: this.aawakRef.company_name,
        qty: this.aawakRef.remaining_qty ? this.aawakRef.remaining_qty : this.aawakRef.Stock,
        remaining_qty: this.aawakRef.remaining_qty ? this.aawakRef.remaining_qty : 0,
        rate: this.aawakRef.rate ? this.aawakRef.rate : null,
        actual_amt: this.aawakRef.actual_amt ? this.aawakRef.actual_amt : null,
        unit_id: this.aawakRef.unit_id,
        aawak_source_id: this.aawakRef.aawak_source_id,
        description: this.aawakRef.description,
        parchi_place: this.aawakRef.parchi_place ? this.aawakRef.parchi_place : null,
        sell_repair_place: this.aawakRef.sell_repair_place ? this.aawakRef.sell_repair_place : null,
        aawak_ref_id: (this.aawakRef._id ? this.aawakRef._id : null),
        nimitt_id: this.aawakRef.nimitt_id ? this.aawakRef.nimitt_id : null,
        dept_id: this.aawakRef.dept_id,
        is_xl: 0,
        unit_short: this.aawakRef.unit_short,
        aawak_type_id: this.aawakRef.aawak_type_id ? this.aawakRef.aawak_type_id : null,
      });
    }

  }

  getDepartments() {
    this.http.get(this.api.getUrl('DEPT')).subscribe((data: any) => {
      this.departments = data['result'] || [];
    })
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
      case 'jawak_type':
        this.viewData = this.gs.Lists.jawak_type;
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

    this.jawakForm.patchValue({
      item_id: null,
      subitem_id: null,
      unit_id: null,
      product_id: null,
      unit_short: null
    })
  }

  itemSelected(ev: any) {
    if (ev) {
      console.log("ev", ev);
      let item = this.items.find((i: { _id: any; }) => i._id == ev);
      if (item) {
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
        if (!this.isEdit) {
          this.jawakForm.patchValue({
            unit_id: item.unit_id,
            unit_short: item.unit_short
          });
        }
      }
    }
    else {
      this.subitems = [];
      if (!this.isEdit) {
        this.jawakForm.patchValue({
          unit_id: null,
          unit_short: null
        });
      }
    }
  }

  subitemSelected(ev: any) {
    if (ev) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
      if (subitem) {
        this.products = this.productsAll.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
        if (!this.isEdit) {
          this.jawakForm.patchValue({
            unit_id: subitem.unit_id,
            unit_short: subitem.unit_short ? subitem.unit_short : null
          });
        }
      }

    }
    else {
      this.products = this.productsAll;
    }
  }

  productSelected(ev: any) {
    // this.isCondition = true;
    let product = this.products.find((p: { _id: any; }) => p._id == ev);
    this.jawakForm.patchValue({
      condition_id: product ? product.condition_id : null
    });
  }

  jawakFormSubmit() {
    console.log("clicked", this.jawakForm.value);

    if (this.jawakForm.valid) {
      console.log("form valid");
      if (this.noAPICall) {
        this.response.emit(this.jawakForm.value);
      } else {
        this.isLoader = true;
        this.http.post(this.api.getUrl('JAWAK') + 'new/' + this.auth.webUser.dept_id, this.jawakForm.value).subscribe((data: any) => {
          if (data['result'] && data['success']) {
            this.gs.Lists.pbk.unshift(data['result'])
            this.jawakForm.reset({ active: true });
            this.isLoader = false;
            this.toastr.success("Jawak Added Successfully.")
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

    }
    else {
      console.log("form invalid", this.jawakForm);

      this.gs.validationFireOnSubmit(this.jawakForm);
    }
  }

  jawakFormUpdate() {
    if (this.jawakForm.valid) {
      if (this.noAPICall && !this.getData._id) {
        this.response.emit(this.jawakForm.value);
      } else {
        this.isLoader = true;
        let body = { query: {}, set: {} };
        body.query = {
          _id: this.getData._id
        }
        body.set = {
          ...this.jawakForm.value,
          _id: this.getData._id,
        };
        this.http.put(this.api.getUrl('JAWAK') + 'new/', body).subscribe((data: any) => {
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
          this.toastr.error(err['error']);
          this.isLoader = false;
        });
      }
    }
    else {
      this.gs.validationFireOnSubmit(this.jawakForm);
    }
  }

  qtyclick() {
    if (this.jawakForm.value.qty && this.jawakForm.value.rate) {
      let actual_amt = this.jawakForm.value.qty * this.jawakForm.value.rate
      this.jawakForm.patchValue({
        actual_amt: actual_amt.toFixed(2)
      });
    }
    else if (this.jawakForm.value.qty && this.jawakForm.value.amnt) {
      let rate = this.jawakForm.value.amnt / this.jawakForm.value.qty
      this.jawakForm.patchValue({
        rate: rate.toFixed(2)
      });
    }
  }

  rateclick() {
    if (!this.jawakForm.value.actual_amt && this.jawakForm.value.qty && this.jawakForm.value.rate) {
      let actual_amt = this.jawakForm.value.qty * this.jawakForm.value.rate;
      this.jawakForm.patchValue({
        actual_amt: actual_amt.toFixed(2)
      });
    }
    else if (!this.jawakForm.value.actual_amt && this.jawakForm.value.rate && this.jawakForm.value.amnt) {
      let quantity = this.jawakForm.value.amnt / this.jawakForm.value.rate;
      this.jawakForm.patchValue({
        qty: quantity.toFixed(2)
      });
    }
  }

  amntclick() {
    if (!this.jawakForm.value.rate && this.jawakForm.value.qty && this.jawakForm.value.actual_amt) {
      let rate = this.jawakForm.value.actual_amt / this.jawakForm.value.qty
      this.jawakForm.patchValue({
        rate: rate.toFixed(2)
      });
    }
    else if (!this.jawakForm.value.qty && this.jawakForm.value.rate && this.jawakForm.value.actual_amt) {
      let quantity = this.jawakForm.value.actual_amt / this.jawakForm.value.rate
      this.jawakForm.patchValue({
        qty: quantity.toFixed(2)
      });
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

  nimittAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#jawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.states.unshift(ev);
      this.jawakForm.patchValue(
        {
          nimitt_id: ev._id
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

  jawakTypeAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#jawakEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.jawakForm.patchValue(
        {
          jawak_type_id: ev._id
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