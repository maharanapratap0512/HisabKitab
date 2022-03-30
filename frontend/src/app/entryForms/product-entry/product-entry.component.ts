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
  units: any = [];
  categories: any = [];

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
      sr_num: [null],
      company_name: [null],
      price: [null],
      condition_id: [null],
      warranty_period: [null],
      warranty_from: [null],
      purchase_date: [null],
      purchase_from: [null],
      purchased_by: [null],
      product_code: [null],
      product_detail: [null],
      item_id: [null],
      subitem_id: [null],
      mm_id: [null],
      document: [null],
      dept_id: [this.auth.webUser.dept_id],
      accessories: [null],
      nimmit: [null],
    });
  }

  ngOnInit(): void {
    console.log("product-ngOnInit");
    this.mms = this.gs.Lists.mm;
    this.departments = this.gs.Lists.department;
    this.conditions = this.gs.Lists.condition;
    this.subitems = this.gs.Lists.subitem;
    this.items = this.gs.Lists.item;
    this.categories = this.gs.Lists.category;
    this.units = this.gs.Lists.unit;

    // this.getStates();
    // this.getMMs();
    // this.getCities();
  }

  // getStates() {
  //   this.isLoader = true;
  //   this.http.get(this.api.getUrl('STATE')).subscribe((data) => {
  //     if (data['result'] && data['success']) {
  //       this.states = data['result'];
  //       this.isLoader = false;
  //     }
  //     this.isLoader = false;
  //   })
  // }

  // getCities() {
  //   this.isLoader = true;
  //   this.http.get(this.api.getUrl('CITY')).subscribe((data) => {
  //     if (data['result'] && data['success']) {
  //       this.cities = data['result'];
  //       this.allList.cities = data['result'];
  //       this.isLoader = false;
  //     }
  //     this.isLoader = false;
  //   })
  // }

  // getMMs() {
  //   this.isLoader = true;
  //   this.http.get(this.api.getUrl('MM')).subscribe((data) => {
  //     if (data['result'] && data['success']) {
  //       this.mms = data['result'];
  //       this.isLoader = false;
  //     }
  //     this.isLoader = false;
  //   })
  // }

  ngOnChanges(changes: SimpleChanges) {
    console.log("pbk-changes", changes);
    if (this.isEdit && changes.getData.currentValue) {
      this.productForm.patchValue({
        mm_id: changes.getData.currentValue.mm_id,
        purchased_by: changes.getData.currentValue.purchased_by,
        purchase_date: changes.getData.currentValue.purchase_date,
        item_id: changes.getData.currentValue.item_id,
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
        nimmit: changes.getData.currentValue.nimmit
      });
    }
  }

  imagesSelectResponse(ev: any) {
    if (ev.path) {
      this.isLoader = true;
      $('#productEntryComponent > #addImages').modal('hide');
      this.showModal = '';
      this.imagepath = ev.path;
      this.productForm.patchValue({
        document: { images: [ev.path] }
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
          this.gs.Lists.pbk.unshift(data['result'])
          this.productForm.reset({ active: true });
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
        nimmit: this.productForm.value.nimmit
      };
      this.http.put(this.api.getUrl('PBK'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.pbk.splice(this.gs.Lists.pbk.indexOf((i: { _id: any }) => { i._id == this.getData._id }), 1, data['result'])
          this.productForm.reset();
          this.isLoader = false;
          this.toastr.success("PBK Updated Successfully");
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
      this.gs.validationFireOnSubmit(this.productForm);
    }
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
    if (ev._id) {
      $('#productEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.subitems.unshift(ev);
      this.productForm.patchValue(
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
      $('#productEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.subitems.unshift(ev);
      this.productForm.patchValue(
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
    console.log("ev", ev);
  }
  catSelected(ev: any) {
    console.log("ev", ev);
  }

}
