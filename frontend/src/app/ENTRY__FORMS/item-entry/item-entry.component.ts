import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
declare var $: any;

@Component({
  selector: 'app-item-entry',
  templateUrl: './item-entry.component.html',
  styleUrls: ['./item-entry.component.scss']
})
export class ItemEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  isEditForm: any = false;
  itemForm: FormGroup;
  categories: any = [];
  units: any = [];
  isLoader: boolean = false;
  showModal: string = '';
  viewType: any;
  viewData: any = [];
  imagepath: any = [];
  mainSettings: any = {};
  settings: any = {};
  itemFormSettings: any = {}
  editDoc: any = {};
  docFile: any = [];
  auto_close: any = true;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    public api: ApiService,
    protected gs: GlobalService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
    this.itemForm = this.fb.group({
      item_hin: [null, Validators.required],
      item_eng: [null],
      item_roman: [null],
      item_code: [null],
      unit_id: [null],
      categories: [[], Validators.required],
      extra_note: [null],
      restrict_month: [null],
      restrict_year: [null],
      min_rate: [0],
      max_rate: [0],
      document: [[]]
    });

  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.units = result.unit ? result.unit : [];
      this.categories = result.category ? result.category : [];
    });
    this.settings = this.auth.webUser.settings.item;
    this.mainSettings = this.auth.webUser.settings;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData.currentValue) {
      if (typeof changes.getData.currentValue.document == 'string') {
        changes.getData.currentValue.document = JSON.parse(changes.getData.currentValue.document.trim() != '' ? changes.getData.currentValue.document : '[]');
      }
      this.itemForm.patchValue({
        item_hin: changes.getData.currentValue.item_hin,
        item_eng: changes.getData.currentValue.item_eng ? changes.getData.currentValue.item_eng : null,
        item_roman: changes.getData.currentValue.item_roman ? changes.getData.currentValue.item_roman : null,
        item_code: changes.getData.currentValue.item_code ? changes.getData.currentValue.item_code : null,
        unit_id: changes.getData.currentValue.unit_id ? changes.getData.currentValue.unit_id : null,
        categories: typeof changes.getData.currentValue.categories == 'string' ? JSON.parse(changes.getData.currentValue.categories) : changes.getData.currentValue.categories,
        extra_note: changes.getData.currentValue.extra_note ? changes.getData.currentValue.extra_note : null,
        restrict_month: changes.getData.currentValue.restrict_month ? changes.getData.currentValue.restrict_month : null,
        restrict_year: changes.getData.currentValue.restrict_year ? changes.getData.currentValue.restrict_year : null,
        min_rate: changes.getData.currentValue.min_rate ? changes.getData.currentValue.min_rate : 0,
        max_rate: changes.getData.currentValue.max_rate ? changes.getData.currentValue.max_rate : 0,
        document: changes.getData.currentValue.document ? changes.getData.currentValue.document : []
      });
      this.imagepath = (changes.getData.currentValue.document && changes.getData.currentValue.document.images) ? changes.getData.currentValue.document.images : null;
    }
    console.log("this.itemForm.value.document", this.imagepath);

  }

  saveFormSettings() {
    this.isEditForm = false;
    this.auth.updateSettings();
    this.settings = this.auth.webUser.settings.item;
  }

  closeModal() {
    $('#itemComponent > #showModal').modal('hide');
    this.showModal = '';
  }

  itemFormSubmit() {
    if (this.itemForm.valid) {
      this.isLoader = true;
      // console.log(this.itemForm.value);
      this.http.post(this.api.getUrl('ITEM') + this.auth.webUser.dept_id, this.itemForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.itemmix.unshift(data['result']);
          this.itemForm.reset({
            unit_id: data['result'].unit_id,
            categories: data['result'].categories
          });
          this.isLoader = false;
          this.toastr.success("Item Added Successfully.");
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
      this.gs.validationFireOnSubmit(this.itemForm);
    }
  }

  itemFormUpdate() {
    if (this.itemForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        item_hin: this.itemForm.value.item_hin,
        item_eng: this.itemForm.value.item_eng,
        item_roman: this.itemForm.value.item_roman,
        item_code: this.itemForm.value.item_code,
        unit_id: this.itemForm.value.unit_id,
        categories: this.itemForm.value.categories,
        extra_note: this.itemForm.value.extra_note,
        document: this.itemForm.value.document ? this.itemForm.value.document : [],
        restrict_month: this.itemForm.value.restrict_month ? this.itemForm.value.restrict_month : null,
        restrict_year: this.itemForm.value.restrict_year ? this.itemForm.value.restrict_year : null,
        min_rate: this.itemForm.value.min_rate ? this.itemForm.value.min_rate : 0,
        max_rate: this.itemForm.value.max_rate ? this.itemForm.value.max_rate : 0,
      };
      this.http.put(this.api.getUrl('ITEM'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.itemmix.splice(this.gs.Lists.itemmix.indexOf((i: { _id: any }) => i._id == this.getData._id), 1, data['result'])
          this.itemForm.reset();
          this.isLoader = false;
          this.toastr.success("Item Updated successfully.");
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
      this.gs.validationFireOnSubmit(this.itemForm);
    }
  }

  categoryAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.closeModal();
      // this.categories.unshift(ev);
      this.itemForm.patchValue(
        {
          categories: [].concat(this.itemForm.value.categories, ev._id)
        });

      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.");
      this.isLoader = false;
      console.log("message", ev);
    }
  }


  unitAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.closeModal();
      // this.units.unshift(ev);
      this.itemForm.patchValue(
        {
          unit_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("message", ev);
    }
  }

  imagesSelectResponse(ev: any) {
    console.log("imgres", ev);
    if (ev) {
      this.isLoader = true;
      this.closeModal();
      this.imagepath = ev;
      this.itemForm.patchValue({
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
      case 'Unit':
        this.viewData = this.gs.Lists.unit;
        $('#itemComponent > #dataView').modal('show');
        break;
      case 'Category':
        this.viewData = this.gs.Lists.category;
        $('#itemComponent > #dataView').modal('show');
        break;
    }
  }

}
