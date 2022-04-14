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
  selector: 'app-pbk-entry',
  templateUrl: './pbk-entry.component.html',
  styleUrls: ['./pbk-entry.component.scss']
})
export class PbkEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  pbkForm: FormGroup;
  allList: any = {};
  states: any = [];
  relative2: boolean = false;
  cities: any = [];
  mms: any = [];
  genders: any = [];
  viewData: any = [];
  viewType: any;
  statuses: any = [];
  relations: any = [];
  showModal: string = '';
  isLoader: boolean = false;
  imagepath:any;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    public api: ApiService,
    private toastr: ToastrService,
    public gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.pbkForm = this.fb.group({
      roll_no: [null],
      pbk_eng: [null],
      pbk_hin: [null, Validators.required],
      relation: [null],
      relative_name: [null],
      relative_ref: [null],
      gender: [null, Validators.required],
      age: [null],
      birth_date: [null],
      status: [null],
      townarea: [null],
      address: [null],
      city_id: [null],
      state_id: [null, Validators.required],
      mo_no: [null],
      alt_mo_no: [null],
      class_mm_id: [null],
      bhatti_date: [null],
      document:[null]
    });
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.states = result.state ? result.state : [];
      this.cities = result.cities ? result.cities : []
      this.mms = result.mm ? result.mm : [];
      this.genders = result.gender ? result.gender : [];
      this.relations = result.relation ? result.relation : [];
      this.statuses = result.status ? result.status : [];
    });
    // this.getStates();
    // this.getMMs();
    // this.getCities();
  }


  ngOnChanges(changes: SimpleChanges) {
    console.log("pbk-changes", changes);
    if (this.isEdit && changes.getData.currentValue) {
      this.pbkForm.patchValue({
        roll_no: changes.getData.currentValue.roll_no,
        pbk_eng: changes.getData.currentValue.pbk_eng,
        pbk_hin: changes.getData.currentValue.pbk_hin,
        relation: changes.getData.currentValue.relation,
        relative_name: changes.getData.currentValue.relative_name,
        relative_ref: changes.getData.currentValue.relative_ref,
        status: changes.getData.currentValue.status,
        gender: changes.getData.currentValue.gender,
        age: changes.getData.currentValue.age,
        birth_date: changes.getData.currentValue.birth_date,
        townarea: changes.getData.currentValue.townarea,
        address: changes.getData.currentValue.address,
        city_id: changes.getData.currentValue.city_id,
        state_id: changes.getData.currentValue.state_id,
        mo_no: changes.getData.currentValue.mo_no,
        alt_mo_no: changes.getData.currentValue.alt_mo_no,
        class_mm_id: changes.getData.currentValue.class_mm_id,
        bhatti_date: changes.getData.currentValue.bhatti_date,
        document: changes.getData.currentValue.document
      });
      this.imagepath = changes.getData.currentValue.document.images ? changes.getData.currentValue.document.images[0]: null;
    }
  }


  setView(type: string) {
    this.viewType = type;
    switch (type) {
      case 'Relation':
        this.viewData = this.gs.Lists.relation;
        $('#pbkEntryComponent > #dataView').modal('show');
        break;
      case 'Gender':
        this.viewData = this.gs.Lists.gender;
        $('#pbkEntryComponent > #dataView').modal('show');
        break;
      case 'Status':
        this.viewData = this.gs.Lists.status;
        $('#pbkEntryComponent > #dataView').modal('show');
        break;

    }
  }

  imagesSelectResponse(ev: any) {
    if (ev.path) {
      this.isLoader = true;
      $('#pbkEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.imagepath = ev.path;
      this.pbkForm.patchValue({
        document: { images: [ev.path] }
      });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }


  pbkFormSubmit() {
    if (this.pbkForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('PBK') + this.auth.webUser.dept_id, this.pbkForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.pbk.unshift(data['result'])
          this.pbkForm.reset({ active: true });
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
      this.gs.validationFireOnSubmit(this.pbkForm);
    }
  }

  pbkFormUpdate() {
    if (this.pbkForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        roll_no: this.pbkForm.value.roll_no,
        pbk_eng: this.pbkForm.value.pbk_eng,
        pbk_hin: this.pbkForm.value.pbk_hin,
        relation: this.pbkForm.value.relation,
        relative_name: this.pbkForm.value.relative_name,
        relative_ref: this.pbkForm.value.relative_ref,
        status: this.pbkForm.value.status,
        gender: this.pbkForm.value.gender,
        age: this.pbkForm.value.age,
        birth_date: this.pbkForm.value.birth_date,
        townarea: this.pbkForm.value.townarea,
        address: this.pbkForm.value.address,
        city_id: this.pbkForm.value.city_id,
        state_id: this.pbkForm.value.state_id,
        mo_no: this.pbkForm.value.mo_no,
        alt_mo_no: this.pbkForm.value.alt_mo_no,
        class_mm_id: this.pbkForm.value.class_mm_id,
        bhatti_date: this.pbkForm.value.bhatti_date,
        document: this.pbkForm.value.document,
      };
      this.http.put(this.api.getUrl('PBK'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.pbk.splice(this.gs.Lists.pbk.indexOf((i: { _id: any }) => { i._id == this.getData._id }), 1, data['result'])
          this.pbkForm.reset();
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
      this.gs.validationFireOnSubmit(this.pbkForm);
    }
  }

  stateSelected(event: any) {
    if (event) {
      this.isLoader = true;
      this.cities = this.gs.Lists.city.filter((c: { state_id: any; }) => c.state_id == event);
      this.isLoader = false;
    }
  }

  citySelected(event: any) {
    if (event) {
      this.isLoader = true;
      let city = this.cities.find((c: { _id: any; }) => c._id == event);
      if (city) {
        this.pbkForm.patchValue({
          state_id: city.state_id
        });
        this.isLoader = false;
      }
    }
  }

  age(date: any) {
    let bdate = new Date(date);
    const timeDiff = Math.abs(Date.now() - bdate.getTime());
    // this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
    this.pbkForm.patchValue({
      age: Math.floor((timeDiff / (1000 * 3600 * 24)) / 365)
    });
  }

  StateAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#pbkEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.states.unshift(ev);
      this.pbkForm.patchValue(
        {
          state_id: ev._id
        });
      this.stateSelected(ev._id);
    }
    else {
      console.log("message", ev);

    }
    this.isLoader = false;
  }

  cityAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#pbkEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.cities.unshift(ev);
      this.pbkForm.patchValue(
        {
          city_id: ev._id,
          state_id: ev.state_id
        });
    }
    else {
      console.log("message", ev);

    }
    this.isLoader = false;
  }

  mmAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#pbkEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.mms.unshift(ev);
      this.pbkForm.patchValue(
        {
          class_mm_id: ev._id
        });
    }
    else {
      console.log("message", ev);

    }
    this.isLoader = false;
  }

  genderAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#pbkEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.genders.unshift(ev);
      this.pbkForm.patchValue(
        {
          gender: ev.list_name_eng
        });
    }
    else {
      console.log("message", ev);

    }
    this.isLoader = false;
  }

  relationAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#pbkEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.relations.unshift(ev);
      this.pbkForm.patchValue(
        {
          relation: ev.list_name_eng
        });
    }
    else {
      console.log("message", ev);

    }
    this.isLoader = false;
  }

  statusAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#pbkEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.statuses.unshift(ev);
      this.pbkForm.patchValue(
        {
          status: ev.list_name_eng
        });
    }
    else {
      console.log("message", ev);

    }
    this.isLoader = false;
  }
}
