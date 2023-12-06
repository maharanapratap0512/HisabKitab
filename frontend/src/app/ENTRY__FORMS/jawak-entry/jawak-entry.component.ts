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
  units: any = [];
  nimitts: any = [];
  states: any = [];
  categories: any = [];
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
    this.jawakForm = this.fb.group({
      date: [null, Validators.required],
      mm_id: [null, Validators.required],
      pkt_num: [null],
      jawak_mm_id: [null],
      pbk_id: [null],
      item_id: [null, Validators.required],
      subitem_id: [null],
      usage_category_id: [null],
      item_detail: [null],
      product_id: [null],
      condition_id: [null],
      company_name: [null],
      qty: [null, Validators.required],
      jawak_type_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      unit_short:'',
      description: [null],
      aawak_ref_id: [null],
      nimitt_id: [null],
      is_xl: [null],
      dept_id: [this.auth.webUser.dept_id]
    });

    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.units = result.unit ? result.unit : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.states = result.state ? result.state : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });
    this.settings = this.auth.webUser.settings;
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
        mm_id: changes.getData.currentValue.mm_id,
        pkt_num: changes.getData.currentValue.pkt_num,
        jawak_mm_id: changes.getData.currentValue.jawak_mm_id,
        pbk_id: changes.getData.currentValue.pbk_id,
        item_id: changes.getData.currentValue.item_id,
        subitem_id: changes.getData.currentValue.subitem_id,
        usage_category_id: changes.getData.currentValue.usage_category_id,
        item_detail: changes.getData.currentValue.item_detail,
        product_id: changes.getData.currentValue.product_id,
        condition_id: changes.getData.currentValue.condition_id,
        qty: changes.getData.currentValue.qty,
        company_name: changes.getData.currentValue.company_name,
        jawak_type_id: changes.getData.currentValue.jawak_type_id,
        unit_id: changes.getData.currentValue.unit_id,
        description: changes.getData.currentValue.description,
        aawak_ref_id: changes.getData.currentValue.aawak_ref_id,
        nimitt_id: changes.getData.currentValue.nimitt_id,
        dept_id: changes.getData.currentValue.dept_id,
        is_xl: changes.getData.currentValue.is_xl ? changes.getData.currentValue.is_xl : 0,
        unit_short: changes.getData.currentValue.unit_short
      });


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
        mm_id: this.aawakRef.mm_id,
        item_id: this.aawakRef.item_id,
        subitem_id: this.aawakRef.subitem_id,
        item_detail: this.aawakRef.item_detail,
        product_id: this.aawakRef.product_id ? this.aawakRef.product_id : null,
        condition_id: this.aawakRef.condition_id,
        company_name: this.aawakRef.company_name,
        qty: this.aawakRef.remaining_qty ? this.aawakRef.remaining_qty : this.aawakRef.Stock,
        unit_id: this.aawakRef.unit_id,
        description: this.aawakRef.description,
        aawak_ref_id: (this.aawakRef._id ? this.aawakRef._id : null),
        nimitt_id: this.aawakRef.nimitt_id ? this.aawakRef.nimitt_id : null,
        dept_id: this.aawakRef.dept_id,
        is_xl: 0,
        unit_short: this.aawakRef.unit_short
      });
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
        if(!this.isEdit){
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
        if(!this.isEdit){
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
    console.log("clicked");

    if (this.jawakForm.valid) {
      console.log("form valid");

      this.isLoader = true;
      this.http.post(this.api.getUrl('JAWAK') + 'new/' + this.auth.webUser.dept_id, this.jawakForm.value).subscribe((data: any) => {
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
        this.toastr.error(err['error']);
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
        _id: this.getData._id,
        date: this.jawakForm.value.date,
        mm_id: this.jawakForm.value.mm_id,
        pkt_num: this.jawakForm.value.pkt_num,
        jawak_mm_id: this.jawakForm.value.jawak_mm_id,
        pbk_id: this.jawakForm.value.pbk_id,
        item_id: this.jawakForm.value.item_id,
        subitem_id: this.jawakForm.value.subitem_id,
        usage_category_id: this.jawakForm.value.usage_category_id,
        item_detail: this.jawakForm.value.item_detail,
        product_id: this.jawakForm.value.product_id,
        condition_id: this.jawakForm.value.condition_id,
        company_name: this.jawakForm.value.company_name,
        qty: this.jawakForm.value.qty,
        jawak_type_id: this.jawakForm.value.jawak_type_id,
        unit_id: this.jawakForm.value.unit_id,
        description: this.jawakForm.value.description,
        aawak_ref_id: this.jawakForm.value.aawak_ref_id,
        nimitt_id: this.jawakForm.value.nimitt_id,
        dept_id: this.jawakForm.value.dept_id,
        is_xl: this.jawakForm.value.is_xl,
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