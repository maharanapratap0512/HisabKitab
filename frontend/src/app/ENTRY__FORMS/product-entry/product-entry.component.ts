import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
declare var $: any;

@Component({
  selector: 'app-product-entry',
  templateUrl: './product-entry.component.html',
  styleUrls: ['./product-entry.component.scss']
})

export class ProductEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  productForm: FormGroup;
  allList: any = {};
  mms: any = [];
  viewData: any = [];
  viewType: any;
  showModal: string = '';
  isLoader: boolean = false;
  imagebase: any = [];
  imagepath: any;
  departments: any = [];
  conditions: any = [];
  subitems: any = [];
  items: any = [];
  itemAll: any = [];
  units: any = [];
  nimitts: any = [];
  cat: any = null;
  categories: any = [];
  categoryAll: any = [];
  settings: any = {};

  constructor(private fb: FormBuilder,
    private http: HttpService,
    public api: ApiService,
    private toastr: ToastrService,
    public gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.productForm = this.fb.group({
      model_name: [null],
      sr_num: [null, Validators.required],
      company_name: [null],
      price: [null],
      condition_id: [null, Validators.required],
      warranty_period: [null],
      warranty_from: [null],
      purchase_date: [null],
      purchase_from: [null],
      purchased_by: [null],
      product_code: [null, Validators.required],
      product_detail: [null],
      item_id: [null, Validators.required],
      subitem_id: [null],
      unit_id: [1],
      mm_id: [null, Validators.required],
      document: [[]],
      dept_id: [this.auth.webUser.dept_id],
      accessories: [null],
      nimitt_id: [null],
      isbill: false
    });
    this.settings = this.auth.webUser.settings;
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.items = result.itemmix && this.auth.webUser.dept_id > 2 ? result.itemmix : [];
      this.itemAll = result.itemmix && this.auth.webUser.dept_id > 2 ? result.itemmix : [];
      this.categories = result.category && this.auth.webUser.dept_id > 2 ? result.category : [];
      this.departments = result.department ? result.department : [];
      this.conditions = result.condition ? result.condition : [];
      this.subitems = result.subitem ? result.subitem : [];
      this.units = result.unit ? result.unit : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("product-changes", changes);
    if (changes.isEdit && changes.isEdit.currentValue) {
      this.gs.observeList().subscribe(result => {
        this.items = result.itemmix ? result.itemmix : [];
        this.nimitts = result.nimitt ? result.nimitt : [];
        this.conditions = result.condition ? result.condition : [];
        this.categories = result.category ? result.category : [];
      });
    }
    if (changes.getData && changes.getData.currentValue) {
      this.getData = changes.getData.currentValue;
      console.log(this.getData);

      this.productForm.patchValue({
        mm_id: changes.getData.currentValue.mm_id,
        purchased_by: changes.getData.currentValue.purchased_by,
        purchase_date: changes.getData.currentValue.purchase_date,
        item_id: changes.getData.currentValue.item_id,
        unit_id: changes.getData.currentValue.unit_id,
        subitem_id: changes.getData.currentValue.subitem_id,
        product_code: changes.getData.currentValue.product_code,
        company_name: changes.getData.currentValue.company_name,
        model_name: changes.getData.currentValue.model_name,
        sr_num: changes.getData.currentValue.sr_num,
        condition_id: changes.getData.currentValue.condition_id,
        price: changes.getData.currentValue.price,
        product_detail: changes.getData.currentValue.product_detail,
        accessories: changes.getData.currentValue.accessories,
        purchase_from: changes.getData.currentValue.purchase_from,
        warranty_period: changes.getData.currentValue.warranty_period,
        dept_id: changes.getData.currentValue.dept_id,
        document: changes.getData.currentValue.document,
        warranty_from: changes.getData.currentValue.warranty_from,
        isbill: changes.getData.currentValue.isbill,
        nimitt_id: changes.getData.currentValue.nimitt_id
      });
      this.sr_numChanged({target:{value:changes.getData.currentValue.sr_num}});
      this.codeChanged({target:{value:changes.getData.currentValue.product_code}});
      this.imagepath = (changes.getData.currentValue.document.images ? changes.getData.currentValue.document.images : null)
    }
  }

  imagesSelectResponse(ev: any) {
    console.log("prod", ev);
    if (ev) {
      this.isLoader = true;
      $('#productEntryComponent > #addImages').modal('hide');
      this.showModal = '';
      this.imagepath = ev;
      this.productForm.patchValue({
        document: { images: ev }
      });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }

  setView(type: string) {
    this.viewType = type;
    switch (type) {
      case 'Condition':
        this.viewData = this.gs.Lists.condition;
        $('#productEntryComponent > #dataView').modal('show');
        break;
      case 'Gender':
        this.viewData = this.gs.Lists.gender;
        $('#productEntryComponent > #dataView').modal('show');
        break;
      case 'Status':
        this.viewData = this.gs.Lists.status;
        $('#productEntryComponent > #dataView').modal('show');
        break;
    }
  }

  productFormSubmit() {
    if (this.productForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('PRODUCT') + this.auth.webUser.dept_id, this.productForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.productForm.reset({ active: true });
          this.isLoader = false;
          this.toastr.success("Product Added Successfully.")
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
      this.gs.validationFireOnSubmit(this.productForm);
    }
  }

  productFormUpdate() {
    if (this.productForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        mm_id: this.productForm.value.mm_id,
        purchased_by: this.productForm.value.purchased_by,
        purchase_date: this.productForm.value.purchase_date,
        item_id: this.productForm.value.item_id,
        unit_id: this.productForm.value.unit_id,
        subitem_id: this.productForm.value.subitem_id,
        product_code: this.productForm.value.product_code,
        company_name: this.productForm.value.company_name,
        model_name: this.productForm.value.model_name,
        sr_num: this.productForm.value.sr_num,
        condition_id: this.productForm.value.condition_id,
        price: this.productForm.value.price,
        product_detail: this.productForm.value.product_detail,
        accessories: this.productForm.value.accessories,
        purchase_from: this.productForm.value.purchase_from,
        warranty_period: this.productForm.value.warranty_period,
        dept_id: this.productForm.value.dept_id,
        warranty_from: this.productForm.value.warranty_from,
        nimitt_id: this.productForm.value.nimitt_id,
        document: this.productForm.value.document,
        isbill: this.productForm.value.isbill
      };
      // console.log("body", body);

      this.http.put(this.api.getUrl('PRODUCT'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.productForm.reset();
          this.isLoader = false;
          this.toastr.success("Product Updated Successfully");
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
      this.gs.validationFireOnSubmit(this.productForm);
    }
  }

  sr_numChanged(ev: any) {
    if (ev.target.value) {
      this.productForm.controls['product_code'].clearValidators();                 
    } else {    
      this.productForm.controls['product_code'].setValidators(Validators.required);                 
    }
    this.productForm.controls['product_code'].updateValueAndValidity();
  }
  codeChanged(ev: any) {
    if (ev.target.value) {
      this.productForm.controls['sr_num'].clearValidators();                 
    } else {    
      this.productForm.controls['sr_num'].setValidators(Validators.required);                 
    }
    this.productForm.controls['sr_num'].updateValueAndValidity();
  }

  mmAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#productEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.mms.unshift(ev);
      this.productForm.patchValue(
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
    console.log("ev", ev);

    if (ev._id) {
      $('#productEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.subitems.unshift(ev);
      this.productForm.patchValue(
        {
          item_id: ev._id
        });
      this.itemSelected(ev._id);
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
      $('#productEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.subitems.unshift(ev);
      this.itemSelected(ev.item_id);
      this.productForm.patchValue(
        {
          item_id: ev.item_id,
          subitem_id: ev._id
        });
      this.subitemSelected(ev._id);
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
      $('#productEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.conditions.unshift(ev);
      this.productForm.patchValue(
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

  deptSelected(ev: any) {
    if (ev) {
      this.getItemData(ev);
      this.getCategoryData(ev);
    } else {
      this.itemAll = [];
      this.items = [];
      this.categoryAll = [];
      this.categories = [];
    }
  }

  catSelected(ev: any) {
    if (ev) {
      this.cat = ev;
      this.items = this.itemAll.filter((i: { category_id: any, categories: any }) => i.category_id == ev || i.categories.includes(ev));
    }
    else {
      this.cat = null;
      this.items = this.itemAll;
    }
    this.productForm.patchValue({
      item_id: null,
      subitem_id: null,
      unit_id: null

    });
  }

  itemSelected(ev: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);
      console.log("item", item);

      if (this.cat) {
        this.subitems = item.subitems.filter((s: { categories: any; }) => s.categories.includes(this.cat));
      }
      else {
        this.subitems = item.subitems;
      }

      if (this.cat && !item.categories.includes(this.cat)) {
        // this.aawakForm.setControl('subitem_id', this.fb.control(null, [Validators.required]));
        this.productForm.patchValue({
          subitem_id: this.subitems[0]._id
        });
      }
      this.productForm.patchValue({
        unit_id: item.unit_id
      })
    }
    else {
      this.subitems = [];
      this.productForm.patchValue({
        unit_id: null,
        subitem_id: null
      });
    }
  }

  subitemSelected(ev: any) {
    if (ev) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
      this.productForm.patchValue({
        unit_id: subitem.unit_id
      })
    }
    else {

    }
  }

  getItemData(ev: any) {
    this.http.put(this.api.getUrl('ITEMMIX') + ev, {}).subscribe((data: any) => {
      if (data['result']) {
        this.itemAll = data['result'];
        this.items = this.itemAll;
      }
    });
  }

  getCategoryData(ev: any) {
    this.http.get(this.api.getUrl('CATEGORY') + ev).subscribe((data) => {
      if (data['result']) {
        this.categoryAll = data['result'];
        this.categories = this.categoryAll;
      }
    });
  }

}
