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
  selector: 'app-mm-entry',
  templateUrl: './mm-entry.component.html',
  styleUrls: ['./mm-entry.component.scss']
})
export class MmEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  mmForm: FormGroup;
  states: any = [];
  nimitts: any = [];
  mms: any = [];
  mm_types: any = [];
  showModal: string = ''
  isLoader: boolean = false;
  viewType: any;
  parentMM: any;
  viewData: any = [];

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.mmForm = this.fb.group({
      mm_eng: [null],
      mm_hin: [null, Validators.required],
      mm_code: [null],
      mm_type: [null, Validators.required],
      parent_mm_id: [null],
      dept_id: [2, Validators.required],
      state_id: [null, Validators.required],
      opening_date: [null],
      mm_closed: [null],
      nimitt_id: [null],
      restrict_month: [null],
      restrict_year: [null],
    });
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.states = result.state ? result.state : [];
      this.mm_types = result.mm_type ? result.mm_type : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });
  }

  openModal(name: any) {
    this.showModal = name;
    $('#mmEntryComponent > #' + name).modal('show')
  }

  closeModal(name: any) {
    this.showModal = name;
    $('#mmEntryComponent > #' + this.showModal).modal('hide')
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData.currentValue) {
      this.mmForm.patchValue({
        mm_eng: changes.getData.currentValue.mm_eng,
        mm_hin: changes.getData.currentValue.mm_hin,
        mm_code: changes.getData.currentValue.mm_code,
        mm_type: changes.getData.currentValue.mm_type,
        parent_mm_id: changes.getData.currentValue.parent_mm_id,
        dept_id: changes.getData.currentValue.dept_id,
        state_id: changes.getData.currentValue.state_id,
        opening_date: changes.getData.currentValue.opening_date,
        mm_closed: changes.getData.currentValue.mm_closed,
        nimitt_id: changes.getData.currentValue.nimitt_id,
        restrict_month: changes.getData.currentValue.restrict_month ? changes.getData.currentValue.restrict_month : null,
        restrict_year: changes.getData.currentValue.restrict_year ? changes.getData.currentValue.restrict_year : null,
      });
    }
  }


  mmFormSubmit() {
    if (this.mmForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('MM') + this.auth.webUser.dept_id, this.mmForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.mm.unshift(data['result']);
          // this.mms.unshift(data['result']);
          this.mmForm.reset();
          this.isLoader = false;
          this.toastr.success('MM Added Successfully.');
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
      this.gs.validationFireOnSubmit(this.mmForm);
    }
  }

  mmFormUpdate() {
    if (this.mmForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        mm_eng: this.mmForm.value.mm_eng,
        mm_hin: this.mmForm.value.mm_hin,
        mm_code: this.mmForm.value.mm_code,
        mm_type: this.mmForm.value.mm_type,
        parent_mm_id: this.mmForm.value.parent_mm_id,
        dept_id: this.mmForm.value.dept_id,
        state_id: this.mmForm.value.state_id,
        opening_date: this.mmForm.value.opening_date,
        mm_closed: this.mmForm.value.mm_closed,
        nimitt_id: this.mmForm.value.nimitt_id,
        restrict_month: this.mmForm.value.restrict_month ? this.mmForm.value.restrict_month : null,
        restrict_year: this.mmForm.value.restrict_year ? this.mmForm.value.restrict_year : null,
      };
      this.http.put(this.api.getUrl('MM'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.mm.splice(this.gs.Lists.mm.indexOf((i: { _id: any }) => { i._id = this.getData._id }), 1, data['result']);
          this.mms.splice(this.mms.indexOf((i: { _id: any }) => { i._id = this.getData._id }), 1, data['result']);
          this.mmForm.reset();
          this.isLoader = false;
          this.toastr.success('MM Updated Successfully.');
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
      this.gs.validationFireOnSubmit(this.mmForm);
    }
  }

  stateAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#mmEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.mmForm.patchValue({ state_id: ev._id });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }

  nimittAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#mmEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.mmForm.patchValue({ nimitt_id: ev._id });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }

  mmTypeAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#mmEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.mmForm.patchValue({ mm_type: ev.list_name_eng });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }


  setView(type: string) {
    this.viewType = type;
    switch (type) {
      case 'mm_type':
        this.viewData = this.gs.Lists.mm_type;
        $('#mmEntryComponent > #dataView').modal('show');
        break;
    }
  }

  parentMmSelected(ev: any) {
    this.parentMM = ev ? ev : '';
    let parentMM = this.mms.find((i: { _id: any; }) => i._id == ev);
    this.mmForm.patchValue({
      mm_hin: parentMM ? parentMM.mm_hin : null,
      mm_eng: parentMM ? parentMM.mm_eng : null,
      mm_code: parentMM ? parentMM.mm_code : null,
      state_id: parentMM ? parentMM.state_id : null,
    });
  }

}
