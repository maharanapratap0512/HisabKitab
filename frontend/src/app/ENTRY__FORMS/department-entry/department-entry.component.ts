import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-department-entry',
  templateUrl: './department-entry.component.html',
  styleUrls: ['./department-entry.component.scss']
})
export class DepartmentEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  deptForm: FormGroup;
  isLoader: boolean = false;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.deptForm = this.fb.group({
      dept_eng: [null, Validators.required],
      dept_hin: [null],
      dept_code: [null],
      settings: [{}],
      password: [null, Validators.required]
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("dept-changes", changes);
    if (changes.getData.currentValue) {
      this.deptForm.patchValue({
        dept_eng: changes.getData.currentValue.dept_eng,
        dept_hin: changes.getData.currentValue.dept_hin,
        dept_code: changes.getData.currentValue.dept_code,
        settings: changes.getData.currentValue.settings,
        password: changes.getData.currentValue.password
      });
    }
  }

  deptFormSubmit() {
    if (this.deptForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('DEPT'), this.deptForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.department.unshift(data['result']);
          this.deptForm.reset();
          this.isLoader = false;
          this.toastr.success("Department added successfully.");
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
      this.gs.validationFireOnSubmit(this.deptForm);
    }
  }

  deptFormUpdate() {
    if (this.deptForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        dept_eng: this.deptForm.value.dept_eng,
        dept_hin: this.deptForm.value.dept_hin,
        dept_code: this.deptForm.value.dept_code,
        password: this.deptForm.value.password,
        settings: this.deptForm.value.settings,
      };
      this.http.put(this.api.getUrl('DEPT'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.department.splice(this.gs.Lists.department.indexOf((i: { _id: any }) => i._id == this.getData._id), 1, data['result']);
          this.deptForm.reset();
          this.isLoader = false;
          this.toastr.success("Department updated successfully.");
          this.response.emit(data['result']);
        }
        else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.deptForm);
    }
  }

}
