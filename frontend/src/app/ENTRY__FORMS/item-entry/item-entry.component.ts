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
  itemForm: FormGroup;
  categories: any = [];
  units: any = [];
  isLoader: boolean = false;
  showModal: string = '';
  viewType: any;
  viewData: any = [];
  imagepath: any = [];
  settings: any = {};
  editDoc: any = {};
  docFile: any = [];
  auto_close:any = true;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    public api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
    this.itemForm = this.fb.group({
      item_hin: [null, Validators.required],
      item_eng: [null, Validators.required],
      item_code: [null],
      unit_id: [null],
      categories: [[], Validators.required],
      extra_note: [null],
      document: [[]]
    });
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.units = result.unit ? result.unit : [];
      this.categories = result.category ? result.category : [];
    });
    this.settings = this.auth.webUser.settings;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData.currentValue) {
      this.itemForm.patchValue({
        item_hin: changes.getData.currentValue.item_hin,
        item_eng: changes.getData.currentValue.item_eng ? changes.getData.currentValue.item_eng : null,
        item_code: changes.getData.currentValue.item_code ? changes.getData.currentValue.item_code : null,
        unit_id: changes.getData.currentValue.unit_id ? changes.getData.currentValue.unit_id : null,
        categories: changes.getData.currentValue.categories,
        extra_note: changes.getData.currentValue.extra_note ? changes.getData.currentValue.extra_note : null,
        document: changes.getData.currentValue.document ? changes.getData.currentValue.document : []
      });
      this.imagepath = (changes.getData.currentValue.document && changes.getData.currentValue.document.images) ? changes.getData.currentValue.document.images : null;
    }
    console.log("this.itemForm.value.document", this.imagepath);

  }

  itemFormSubmit() {
    if (this.itemForm.valid) {
      this.isLoader = true;
      // console.log(this.itemForm.value);
      this.http.post(this.api.getUrl('ITEM') + this.auth.webUser.dept_id, this.itemForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.itemmix.unshift(data['result']);
          this.itemForm.reset();
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
        item_code: this.itemForm.value.item_code,
        unit_id: this.itemForm.value.unit_id,
        categories: this.itemForm.value.categories,
        extra_note: this.itemForm.value.extra_note,
        document: this.itemForm.value.document ? this.itemForm.value.document : [],
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
      $('#itemComponent > #showModal').modal('hide');
      this.showModal = '';
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
      $('#itemComponent > #showModal').modal('hide');
      this.showModal = '';
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
      $('#itemComponent > #showModal').modal('hide');
      this.showModal = '';
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
