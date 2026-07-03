import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as e from 'express';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

declare var $: any;

@Component({
  selector: 'app-subitem-entry',
  templateUrl: './subitem-entry.component.html',
  styleUrls: ['./subitem-entry.component.scss']
})
export class SubitemEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any = null;
  @Output() response = new EventEmitter();
  subitemForm: FormGroup;
  items: any = [];
  subitem_list: any = [];
  categories: any = [];
  units: any = [];
  isLoader: boolean = false;
  showModal: string = '';
  viewType: any;
  viewData: any = [];
  imagepath: any;
  // subitem_hin:any;
  subitem_eng: any = false;
  settings: any = {};

  constructor(private fb: FormBuilder,
    private http: HttpService,
    public api: ApiService,
    private toastr: ToastrService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.subitemForm = this.fb.group({
      subitem_hin: [null, Validators.required],
      subitem_eng: [null],
      subitem_roman: [null],
      unit_id: [null],
      item_id: [null, Validators.required],
      categories: [[], Validators.required],
      extra_note: [null],
      document: [null],
      restrict_month: [null],
      restrict_year: [null],
      min_rate: [0],
      max_rate: [0],
    });
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.items = result.itemmix ? result.itemmix : []
      this.units = result.unit ? result.unit : []
      this.categories = result.category ? result.category : []
      this.subitem_list = result.subitem_list ? result.subitem_list : []
    });
    this.settings = this.auth.webUser.settings;
  }

  editDoc: any = {};
  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData && changes.getData.currentValue) {
      const doc = changes.getData.currentValue.document || {};
      let categoriesVal = changes.getData.currentValue.categories;
      if (typeof categoriesVal === 'string') {
        try {
          categoriesVal = JSON.parse(categoriesVal);
        } catch (e) { }
      }
      if (Array.isArray(categoriesVal)) {
        categoriesVal = categoriesVal
          .map((c: any) => (typeof c === 'object' && c !== null) ? c._id : c)
          .filter((id: any) => id !== null && id !== undefined);
      } else {
        categoriesVal = [];
      }
      this.subitemForm.patchValue({
        subitem_hin: changes.getData.currentValue.subitem_hin,
        subitem_eng: changes.getData.currentValue.subitem_eng,
        subitem_roman: changes.getData.currentValue.subitem_roman,
        unit_id: changes.getData.currentValue.unit_id,
        item_id: changes.getData.currentValue.item_id,
        categories: categoriesVal,
        extra_note: changes.getData.currentValue.extra_note ? changes.getData.currentValue.extra_note : null,
        document: doc,
        restrict_month: changes.getData.currentValue.restrict_month ? changes.getData.currentValue.restrict_month : null,
        restrict_year: changes.getData.currentValue.restrict_year ? changes.getData.currentValue.restrict_year : null,
        min_rate: changes.getData.currentValue.min_rate ? changes.getData.currentValue.min_rate : 0,
        max_rate: changes.getData.currentValue.max_rate ? changes.getData.currentValue.max_rate : 0,
      });
      this.imagepath = doc.images || [];
      this.editDoc = doc;
    }
  }

  subitemFormSubmit() {
    if (this.subitemForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('SUBITEM') + this.auth.webUser.dept_id, this.subitemForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          // this.gs.Lists.subitem.unshift(data['result'])
          let i = this.gs.Lists.itemmix.findIndex((i: { _id: any; }) => i._id == data['result'].item_id);
          this.gs.Lists.itemmix[i].subitems.push(data['result']);
          // this.gs.Lists.itemmix[i].categories.push(data['result'].categories);
          this.subitemForm.reset({
            item_id: data['result'].item_id,
            unit_id: data['result'].unit_id,
            categories: data['result'].categories
          });
          this.isLoader = false;
          this.toastr.success('SUBITEM added successfully.')
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
      this.gs.validationFireOnSubmit(this.subitemForm);
    }
  }

  subitemFormUpdate() {
    if (this.subitemForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        subitem_hin: this.subitemForm.value.subitem_hin,
        subitem_eng: this.subitemForm.value.subitem_eng,
        subitem_roman: this.subitemForm.value.subitem_roman,
        unit_id: this.subitemForm.value.unit_id,
        item_id: this.subitemForm.value.item_id,
        categories: this.subitemForm.value.categories,
        extra_note: this.subitemForm.value.extra_note,
        document: this.subitemForm.value.document,
        restrict_month: this.subitemForm.value.restrict_month ? this.subitemForm.value.restrict_month : null,
        restrict_year: this.subitemForm.value.restrict_year ? this.subitemForm.value.restrict_year : null,
        min_rate: this.subitemForm.value.min_rate ? this.subitemForm.value.min_rate : 0,
        max_rate: this.subitemForm.value.max_rate ? this.subitemForm.value.max_rate : 0,
      };
      this.http.put(this.api.getUrl('SUBITEM'), body).subscribe((data: any) => {
        if (data && data['success']) {
          let i = this.gs.Lists.itemmix.findIndex((i: { _id: any; }) => i._id == data['result'].item_id);
          this.gs.Lists.itemmix[i].subitems.splice(this.gs.Lists.itemmix[i].subitems.indexOf((i: { _id: any }) => { i._id == this.getData._id }), 1, data['result']);
          // this.gs.Lists.itemmix[i].categories.push(data['result'].categories);
          this.subitemForm.reset();
          this.isLoader = false;
          this.toastr.success('SUBITEM added successfully.')
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
      this.gs.validationFireOnSubmit(this.subitemForm);
    }
  }

  itemSelected(ev: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);
      if (item) {
        let itemCats = item.categories;
        if (typeof itemCats === 'string') {
          try { itemCats = JSON.parse(itemCats); } catch (e) {}
        }
        if (Array.isArray(itemCats)) {
          itemCats = itemCats
            .map((c: any) => (typeof c === 'object' && c !== null) ? c._id : c)
            .filter((id: any) => id !== null && id !== undefined);
        } else {
          itemCats = [];
        }
        this.subitemForm.patchValue({
          categories: itemCats,
          unit_id: item.unit_id
        });
      }
    }
  }

  onSubitemListChange(ev: any) {
    if (ev) {
      this.subitemForm.patchValue({
        subitem_hin: ev.subitem_hin,
        subitem_eng: ev.subitem_eng,
        subitem_roman: ev.subitem_roman
      });
    }
  }

  categoryAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#subitemComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.categories.unshift(ev);
      this.subitemForm.patchValue({
        categories: [].concat(this.subitemForm.value.categories, ev._id)
      });
      this.isLoader = false;
    }
    else {
      console.log("err", ev);
      this.isLoader = false;
    }
  }

  unitAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#subitemComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.units.unshift(ev);
      this.subitemForm.patchValue({
        unit_id: ev._id
      });
      this.isLoader = false;
    }
    else {
      console.log("err", ev);
      this.isLoader = false;
    }
  }

  itemAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#subitemComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.items.unshift(ev);
      this.subitemForm.patchValue({
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

  subitemListAddResponse(ev: any) {
    this.isLoader = true;
    console.log(ev);
    if (ev.subitem_hin) {

      $('#subitemComponent > #showModal').modal('hide');
      this.showModal = '';
      this.subitemForm.patchValue({
        subitem_hin: ev.subitem_hin,
        subitem_eng: ev.subitem_eng,
        subitem_roman: ev.subitem_roman
      });
      this.isLoader = false;
    }
    else {
      console.log("err", ev);
      this.isLoader = false;
    }
  }

  imagesSelectResponse(ev: any) {
    console.log("evvvv", ev);
    if (ev.length) {
      this.isLoader = true;
      $('#subitemComponent > #showModal').modal('hide');
      this.showModal = '';
      this.imagepath = ev;
      this.subitemForm.patchValue({
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
      case 'Subitem List':
        this.viewData = this.gs.Lists.subitem_list;
        $('#subitemComponent > #dataView').modal('show');
        break;
      case 'Unit':
        this.viewData = this.gs.Lists.unit;
        $('#subitemComponent > #dataView').modal('show');
        break;
      case 'Category':
        this.viewData = this.gs.Lists.category;
        $('#subitemComponent > #dataView').modal('show');
        break;
    }
  }
}
