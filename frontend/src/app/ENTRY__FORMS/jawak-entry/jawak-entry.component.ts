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
      aawak_splits: [[]],
      nimitt_id: [null],
      is_xl: [null],
      is_process: [null],
      is_recieved: [0],
      hl: [0],
      dept_id: [this.auth.webUser.dept_id],
      auto_awk: [null],
      auto_reawk: [null],
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
      const data = changes.getData.currentValue;

      let splits = data.aawak_splits;
      if (typeof splits === 'string') {
        try { splits = JSON.parse(splits); } catch (e) { splits = []; }
      }
      if (!Array.isArray(splits)) {
        splits = [];
      }
      this.aawak_splits = splits;

      const aawakId = (splits.length > 0)
        ? (splits[0].aawak_id || splits[0]._id)
        : null;

      this.jawakForm.patchValue({
        date: data.date,
        date_sent: data.date_sent || null,
        mm_id: data.mm_id,
        pkt_num: data.pkt_num,
        lot_no: data.lot_no || null,
        jawak_mm_id: data.jawak_mm_id,
        pbk_id: data.pbk_id,
        item_id: data.item_id,
        subitem_id: data.subitem_id,
        usage_list_id: data.usage_list_id,
        item_detail: data.item_detail,
        product_id: data.product_id,
        condition_id: data.condition_id,
        qty: data.qty,
        remaining_qty: data.remaining_qty ? data.remaining_qty : 0,
        rate: data.rate ? data.rate : null,
        actual_amt: data.actual_amt ? data.actual_amt : null,
        company_name: data.company_name,
        jawak_type_id: data.jawak_type_id,
        aawak_source_id: data.aawak_source_id || null,
        unit_id: data.unit_id,
        description: data.description,
        parchi_place: data.parchi_place ? data.parchi_place : null,
        sell_repair_place: data.sell_repair_place ? data.sell_repair_place : null,
        aawak_splits: splits,
        nimitt_id: data.nimitt_id,
        dept_id: data.dept_id,
        is_xl: data.is_xl ? data.is_xl : 0,
        is_process: data.is_process ? data.is_process : 0,
        is_recieved: data.is_recieved ? data.is_recieved : 0,
        hl: data.hl ? data.hl : 0,
        unit_short: data.unit_short,
        auto_awk: data.auto_awk ? data.auto_awk : 0,
        auto_reawk: data.auto_reawk ? data.auto_reawk : 0,
        aawak_type_id: data.aawak_type_id ? data.aawak_type_id : null,
        aawak_dept_id: data.aawak_dept_id ? data.aawak_dept_id : null,
        aawak_date: data.aawak_date ? data.aawak_date : null,
        re_aawak_type_id: data.re_aawak_type_id ? data.re_aawak_type_id : null,
      });

      // Patch jawak_id in enz if editing
      if (data.enz) {
        this.jawakForm.get('enz')?.patchValue({
          _id: data.enz._id,
          container_capacity: data.enz.container_capacity
        });
      }

      setTimeout(() => {
        this.itemSelected(data);
        if (data.subitem_id) {
          this.subitemSelected(data);
        }
      }, 100);

      if (aawakId) {
        this.fetchAawakRef(aawakId);
      } else {
        this.aawakRef = null;
      }
    }
    if (changes.aawakRef && changes.aawakRef.currentValue) {
      this.aawakRef = changes.aawakRef.currentValue;
      const refId = this.aawakRef._id || this.aawakRef.aawak_id;
      if (!this.aawak_splits || !this.aawak_splits.length) {
        this.aawak_splits = [{ aawak_id: refId, split_qty: this.aawakRef.remaining_qty || this.aawakRef.Stock || 0, is_split: 0 }];
      }
      this.jawakForm.patchValue({
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
        aawak_ref_id: refId,
        aawak_splits: this.aawak_splits,
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

  fetchAawakRef(id: string) {
    const body = { _id: id, limit: 1 };
    this.http.put(this.api.getUrl('AAWAK') + 'filter/' + this.auth.webUser.dept_id, body).subscribe((res: any) => {
      if (res && res.success && res.result && res.result.length > 0) {
        this.aawakRef = res.result[0];
        if (!this.getData?._id) {
          this.jawakForm.patchValue({
            lot_no: this.aawakRef.lot_no,
            mm_id: this.aawakRef.mm_id,
            item_id: this.aawakRef.item_id,
            subitem_id: this.aawakRef.subitem_id,
            item_detail: this.aawakRef.item_detail,
            product_id: this.aawakRef.product_id ? this.aawakRef.product_id : null,
            condition_id: this.aawakRef.condition_id,
            company_name: this.aawakRef.company_name,
            unit_id: this.aawakRef.unit_id,
            aawak_source_id: this.aawakRef.aawak_source_id,
            nimitt_id: this.aawakRef.nimitt_id ? this.aawakRef.nimitt_id : null,
            dept_id: this.aawakRef.dept_id,
            unit_short: this.aawakRef.unit_short,
            aawak_type_id: this.aawakRef.aawak_type_id ? this.aawakRef.aawak_type_id : null,
          });
        }
      }
    });
  }

  onAawakRefChange(ev: any) {
    if (ev) {
      this.aawakRef = ev;
      this.jawakForm.patchValue({
        lot_no: ev.lot_no,
        mm_id: ev.mm_id,
        item_id: ev.item_id,
        subitem_id: ev.subitem_id,
        item_detail: ev.item_detail,
        product_id: ev.product_id ? ev.product_id : null,
        condition_id: ev.condition_id,
        company_name: ev.company_name,
        unit_id: ev.unit_id,
        aawak_source_id: ev.aawak_source_id,
        nimitt_id: ev.nimitt_id ? ev.nimitt_id : null,
        dept_id: ev.dept_id,
        unit_short: ev.unit_short,
        aawak_type_id: ev.aawak_type_id ? ev.aawak_type_id : null,
      });
    } else {
      this.aawakRef = null;
    }
  }

  aawak_splits: any[] = [];

  onAawakSplitsSelected(event: any) {
    if (event && event.splits && event.splits.length > 0) {
      const primary = event.primaryAawak || event.splits[0].aawak_obj || event.splits[0];
      this.aawak_splits = event.splits;
      this.jawakForm.patchValue({
        aawak_ref_id: primary._id || primary.aawak_id,
        aawak_splits: event.splits,
        qty: event.totalQty || this.jawakForm.get('qty')?.value
      });
      this.onAawakRefChange(primary);
    } else {
      this.aawak_splits = [];
      this.jawakForm.patchValue({
        aawak_ref_id: null,
        aawak_splits: []
      });
      this.onAawakRefChange(null);
    }
  }

  unlinkAawak() {
    this.aawak_splits = [];
    this.jawakForm.patchValue({
      aawak_ref_id: null,
      aawak_splits: []
    });
    this.onAawakRefChange(null);
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
    const item_id = ev && typeof ev === 'object' ? ev.item_id : ev;
    if (item_id) {
      let item = this.items.find((i: { _id: any; }) => i._id == item_id);
      if (item) {
        this.subitems = this.cat ? item.subitems.filter((s: { category_id: any; }) => s.category_id == this.cat) : item.subitems;

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
          this.lookupItemRate();
        }
      }
    } else {
      this.subitems = [];
      if (!this.isEdit) {
        this.jawakForm.patchValue({ unit_id: null, unit_short: null });
      }
    }
  }

  lookupItemRate() {
    const item_id = this.jawakForm.get('item_id')?.value;
    const subitem_id = this.jawakForm.get('subitem_id')?.value;
    const dateVal = this.jawakForm.get('date')?.value;
    if (!item_id || !dateVal) return;

    const year = new Date(dateVal).getFullYear();
    if (isNaN(year)) return;

    const url = `${this.api.getUrl('ITEMRATE')}lookup/${this.auth.webUser.dept_id}?item_id=${item_id}&subitem_id=${subitem_id || ''}&year=${year}`;
    this.http.get(url).subscribe((res: any) => {
      if (res && res.success && res.rate !== null && res.rate !== undefined) {
        const qty = Number(this.jawakForm.get('qty')?.value || 0);
        const rate = Number(res.rate);
        const actual_amt = qty ? Math.round(qty * rate * 100) / 100 : null;
        this.jawakForm.patchValue({ rate: rate, actual_amt: actual_amt });
      }
    });
  }

  subitemSelected(ev: any) {
    const subitem_id = ev && typeof ev === 'object' ? ev.subitem_id : ev;
    if (subitem_id) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == subitem_id);
      if (subitem) {
        this.products = this.productsAll.filter((p: { subitem_id: any; }) => p.subitem_id == subitem_id);
        if (!this.isEdit) {
          this.jawakForm.patchValue({
            unit_id: subitem.unit_id,
            unit_short: subitem.unit_short ? subitem.unit_short : null
          });
          this.lookupItemRate();
        }
      }
    } else {
      this.products = this.productsAll;
      if (!this.isEdit) {
        this.lookupItemRate();
      }
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