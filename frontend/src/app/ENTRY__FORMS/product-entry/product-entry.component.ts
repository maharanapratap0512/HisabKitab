import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, ValidationErrors, FormArray } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
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
  productFormMain: FormGroup;
  // productFormSub: FormGroup;
  itemForms: FormArray<FormGroup>;
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
  aawak_types: any = [];
  subitems: any = [];
  items: any = [];
  itemAll: any = [];
  units: any = [];
  nimitts: any = [];
  cat: any = null;
  categories: any = [];
  categoryAll: any = [];
  settings: any = {};
  product_code: any = null;
  sr_num: any = null;

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
      company_name: [null],
      price: [null],
      condition_id: [null, Validators.required],
      aawak_type_id: [null, Validators.required],
      warranty_period: [null],
      warranty_from: [null],
      purchase_date: [null],
      purchase_from: [null],
      purchased_by: [null],
      // code_sr_num: [null, Validators.required],
      product_detail: [null],
      item_id: [null, Validators.required],
      subitem_id: [null],
      unit_id: [1, Validators.required],
      mm_id: [null, Validators.required],
      document: [[]],
      dept_id: [this.auth.webUser.dept_id],
      accessories: [null],
      nimitt_id: [null],
      isbill: false,
      is_xl: false,
      products: [[]],
      awk_id: [null],
      voucher_no: [null],
      bunch_no: [null],
      qty: [null, Validators.required],
      auto_awk: [true],
    });

    this.productFormMain = this.fb.group({
      purchase_date: [null],
      purchased_by: [null],
      mm_id: [null, Validators.required],
      dept_id: [this.auth.webUser.dept_id],
      nimitt_id: [null],
      items: [[]],
      bunch_no: [null],
      auto_awk: [true],
    });

    this.settings = this.auth.webUser.settings;
    this.itemForms = fb.array([fb.group({
      model_name: [null],
      company_name: [null],
      price: [null],
      condition_id: [null, Validators.required],
      aawak_type_id: [null, Validators.required],
      warranty_period: [null],
      warranty_from: [null],
      product_detail: [null],
      item_id: [null, Validators.required],
      subitem_id: [null],
      unit_id: [1, Validators.required],
      purchase_from: [null],
      document: [[]],
      accessories: [null],
      isbill: false,
      is_xl: false,
      voucher_no: [null],
      bunch_no: [null],
      qty: [null, Validators.required],
      products: [[]],
      awk_id: [null],
    })]);

    this.itemForms.valueChanges.subscribe(changes => {
      let status = true;
      for (let itForm of this.itemForms.controls) {
        if (!itForm.valid) {
          status = false;
          break;
        }
      }

      if (status) {
        this.itemForms.push(fb.group({
          model_name: [null],
          company_name: [null],
          price: [null],
          condition_id: [null, Validators.required],
          aawak_type_id: [null, Validators.required],
          warranty_period: [null],
          warranty_from: [null],
          product_detail: [null],
          item_id: [null, Validators.required],
          subitem_id: [null],
          unit_id: [1, Validators.required],
          purchase_from: [null],
          document: [[]],
          accessories: [null],
          isbill: false,
          is_xl: false,
          voucher_no: [null],
          bunch_no: [null],
          qty: [null, Validators.required],
          products: [[]],
          awk_id: [null],
        }));
      }
    });


    this.productFormMain.patchValue({
      purchase_date: gs.dateString
    })
    this.productForm.patchValue({
      purchase_date: gs.dateString
    })


  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.itemAll = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.departments = result.department ? result.department : [];
      this.conditions = result.condition ? result.condition : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      // this.subitems = result.subitem ? result.subitem : [];
      this.units = result.unit ? result.unit : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });

    // console.log(this.productFormArr);

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("product-changes", changes);
    if (changes.isEdit && changes.isEdit.currentValue) {
      this.gs.observeList().subscribe(result => {
        this.items = result.itemmix ? result.itemmix : [];
        this.nimitts = result.nimitt ? result.nimitt : [];
        this.conditions = result.condition ? result.condition : [];
        this.aawak_types = result.aawak_type ? result.aawak_type : [];
        this.categories = result.category ? result.category : [];
      });
    }
    if (changes.getData && changes.getData.currentValue) {
      this.getData = changes.getData.currentValue;
      console.log(this.getData);

      this.deptSelected(changes.getData.currentValue.dept_id)
      // this.itemSelected(changes.getData.currentValue.item_id)

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
        aawak_type_id: changes.getData.currentValue.aawak_type_id,
        price: changes.getData.currentValue.price,
        product_detail: changes.getData.currentValue.product_detail,
        accessories: changes.getData.currentValue.accessories,
        purchase_from: changes.getData.currentValue.purchase_from,
        warranty_period: changes.getData.currentValue.warranty_period,
        dept_id: changes.getData.currentValue.dept_id,
        document: changes.getData.currentValue.document,
        warranty_from: changes.getData.currentValue.warranty_from,
        isbill: changes.getData.currentValue.isbill,
        is_xl: changes.getData.currentValue.is_xl,
        nimitt_id: changes.getData.currentValue.nimitt_id,
        products: changes.getData.currentValue.products ? changes.getData.currentValue.products : [],
        voucher_no: changes.getData.currentValue.voucher_no,
        bunch_no: changes.getData.currentValue.bunch_no,
        qty: changes.getData.currentValue.qty,
        awk_id: changes.getData.currentValue.awk_id,

      });

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

  bunchProductSubmit() {
    this.productFormMain.value.items = []
    for (let i = 0; i < this.itemForms.controls.length; i++) {
      if (this.itemForms.controls[i].valid) {
        this.productFormMain.value.items.push(this.itemForms.controls[i].value);
      } else {
        this.itemForms.controls.splice(i, 1);
      }
    }

    if (this.productFormMain.valid && this.productFormMain.value.items.length > 0) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('PRODUCT') + 'bunch/' + this.auth.webUser.dept_id, this.productFormMain.value).subscribe((data: any) => {
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
        ...this.productForm.value
      };

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

  productAdd() {
    this.productForm.value.products.push({ product_code: this.product_code, sr_num: this.sr_num });
    this.productForm.patchValue({
      qty: this.productForm.value.products.length,
      unit_id: 1
    })
    console.log("this.productForm.value", this.productForm.value);
    this.product_code = null;
    this.sr_num = null;
  }


  deleteProduct(index: number, id: any): void {
    if (index) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.isLoader = true;
          if (id) {
            this.http.delete(this.api.getUrl('PRODUCT') + '/' + id).subscribe((data: any) => {
              if (data['success']) {
                this.isLoader = false;
                this.productForm.value.products.splice(index, 1);
                this.toastr.success('Deleted Successfully');
              }
              else {
                this.toastr.error(data['message']);
              }
            });
          } else {
            this.productForm.value.products.splice(index, 1);
            this.toastr.success('Deleted Successfully');
          }

          // updating up unit and qty after delete.
          if (this.productForm.value.products.length > 0) {
            this.productForm.patchValue({
              qty: this.productForm.value.products.length,
            });
          } else {
            this.productForm.patchValue({
              qty: this.productForm.value.products.length,
              unit_id: null
            });
          }
          this.isLoader = false;
        }
      })
    }
  }

  deleteProductAll(): void {
    this.productForm.patchValue({
      products: [],
      qty: null,
      unit_id: null
    });
  }

  productAddNew(i: any) {
    this.itemForms.controls[i].value.products.push({ product_code: this.product_code, sr_num: this.sr_num });
    this.itemForms.controls[i].patchValue({
      qty: this.itemForms.controls[i].value.products.length,
      unit_id: 1
    })
    // console.log("this.itemForms.controls[i].value", this.itemForms.controls[i].value);
    this.product_code = null;
    this.sr_num = null;
  }

  deleteProductNew(i: any, index: number): void {
    this.itemForms.controls[i].value.products.splice(index, 1);
    if (this.itemForms.controls[i].value.products.length > 0) {
      this.itemForms.controls[i].patchValue({
        qty: this.itemForms.controls[i].value.products.length,
      });
    } else {
      this.itemForms.controls[i].patchValue({
        qty: this.itemForms.controls[i].value.products.length,
        unit_id: null
      });
    }
  }

  deleteProductAllNew(i: any): void {
    this.itemForms.controls[i].patchValue({
      products: [],
      qty: null,
      unit_id: null
    });
  }

  mmAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#productEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.mms.unshift(ev);
      this.productForm.patchValue({
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

  addNimittResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#productEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.productForm.patchValue(
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
