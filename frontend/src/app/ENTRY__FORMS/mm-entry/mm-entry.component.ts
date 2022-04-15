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
  nimmits: any = [];
  mms: any = [];
  departments: any = [];
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
      parent_mm_id: [null],
      dept_id: [2, Validators.required],
      state_id: [null, Validators.required],
      opening_date: [null],
      nimmit_id:[null]
    });
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.states = result.state ? result.state : [];
      this.departments = result.department ? result.department : [];
      this.nimmits = result.nimmit ? result.nimmit : [];
    });
  }

  openModal(name: any) {
    console.log(" name", this.showModal);
    this.showModal = name;
    $('#mmEntryComponent > #' + name).modal('show')
  }

  closeModal(name: any) {
    this.showModal = name;
    $('#mmEntryComponent > #' + this.showModal).modal('hide')
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    
    if (changes.getData.currentValue) {
      this.mmForm.patchValue({
        mm_eng: changes.getData.currentValue.mm_eng,
        mm_hin: changes.getData.currentValue.mm_hin,
        mm_code: changes.getData.currentValue.mm_code,
        parent_mm_id: changes.getData.currentValue.parent_mm_id,
        dept_id: changes.getData.currentValue.dept_id,
        state_id: changes.getData.currentValue.state_id,
        opening_date: changes.getData.currentValue.opening_date,
        nimmit_id: changes.getData.currentValue.nimmit_id,
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
        parent_mm_id: this.mmForm.value.parent_mm_id,
        dept_id: this.mmForm.value.dept_id,
        state_id: this.mmForm.value.state_id,
        opening_date: this.mmForm.value.opening_date,
        nimmit_id: this.mmForm.value.nimmit_id
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
      // this.states.unshift(ev);
      this.mmForm.patchValue(
        {
          state_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  nimmitAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#mmEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.states.unshift(ev);
      this.mmForm.patchValue(
        {
          nimmit_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  departmentAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#mmEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      // this.departments.unshift(ev);
      this.mmForm.patchValue(
        {
          dept_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      console.log("err", ev);
      this.isLoader = false;
    }
  }


  setView(type: string) {
    this.viewType = type;
    switch (type) {
      case 'Department':
        this.viewData = this.gs.Lists.department;
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
