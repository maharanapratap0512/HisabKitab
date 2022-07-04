import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
declare var $: any;

@Component({
  selector: 'app-nimitt-entry',
  templateUrl: './nimitt-entry.component.html',
  styleUrls: ['./nimitt-entry.component.scss']
})
export class NimittEntryComponent implements OnInit {

  @Input() getData: any;
  @Output() response = new EventEmitter();
  @Input() isEdit: any;
  @Input() isVisible: any;
  nimittForm: FormGroup;
  isLoader: boolean = false;
  states: any = [];
  genders: any = [];
  showModal: string = '';
  viewData: any = [];
  viewType: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
    this.nimittForm = this.fb.group({
      nimitt_eng: [null, Validators.required],
      nimitt_hin: [null, Validators.required],
      roll_no: [null, Validators.required],
      relative_name: [null, Validators.required],
      gender: [null, Validators.required],
      townarea: [null, Validators.required],
      state_id: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.states = result.state ? result.state : [];
      this.genders = result.gender ? result.gender : [];
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData.currentValue) {
      this.nimittForm.patchValue({
        nimitt_eng: changes.getData.currentValue.nimitt_eng,
        nimitt_hin: changes.getData.currentValue.nimitt_hin,
        roll_no: changes.getData.currentValue.roll_no,
        relative_name: changes.getData.currentValue.relative_name,
        gender: changes.getData.currentValue.gender,
        townarea: changes.getData.currentValue.townarea,
        state_id: changes.getData.currentValue.state_id
      });
    }
  }

  openModal(name: any) {
    this.showModal = name;
    $('#nimittEntryComponent > #' + name).modal('show')
  }

  closeModal(name: any) {
    this.showModal = name;
    $('#nimittEntryComponent > #' + this.showModal).modal('hide')
  }

  nimittFormSubmit() {
    if (this.nimittForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('NIMITT') + this.auth.webUser.dept_id, this.nimittForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.nimitt.unshift(data['result']);
          this.nimittForm.reset({ active: true });
          this.isLoader = false;
          this.toastr.success('Category Added Successfully.');
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
      this.gs.validationFireOnSubmit(this.nimittForm);
    }
  }

  nimittFormUpdate() {
    if (this.nimittForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        nimitt_eng: this.nimittForm.value.nimitt_eng,
        nimitt_hin: this.nimittForm.value.nimitt_hin,
        isverify: this.nimittForm.value.isverify,
        active: this.nimittForm.value.active
      };
      this.http.put(this.api.getUrl('NIMITT'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.nimitt.splice(this.gs.Lists.nimitt.indexOf((i: { _id: any }) => i._id == this.getData._id), 1, data['result']);
          this.nimittForm.reset();
          this.isLoader = false;
          this.toastr.success("Category Updated Successfuly")
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['error'].message);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['message']);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.nimittForm);
    }
  }

  setView(type: string) {
    this.viewType = type;
    switch (type) {
      case 'Gender':
        this.viewData = this.gs.Lists.gender;
        $('#nimittEntryComponent > #dataView').modal('show');
        break;
    }
  }

  stateAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#nimittEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.nimittForm.patchValue({ state_id: ev._id });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }


}
