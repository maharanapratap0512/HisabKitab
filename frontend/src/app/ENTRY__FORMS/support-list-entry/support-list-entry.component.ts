import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-support-list-entry',
  templateUrl: './support-list-entry.component.html',
  styleUrls: ['./support-list-entry.component.scss']
})
export class SupportListEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Input() list_type: any;
  @Output() response = new EventEmitter();
  supportListForm: FormGroup;
  isLoader: boolean = false;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.supportListForm = this.fb.group({
      list_type: [null, Validators.required],
      list_name_eng: [null, Validators.required],
      list_name_hin: [null, Validators.required],
      list_name_roman: [null],
      lock: 0,
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("list_name-changes", changes);
    if (changes.list_type) {
      this.supportListForm.patchValue({
        list_type: changes.list_type.currentValue
      });
    }
    if (changes.getData) {
      this.supportListForm.patchValue({
        list_type: changes.getData.currentValue.list_type,
        list_name_eng: changes.getData.currentValue.list_name_eng,
        list_name_hin: changes.getData.currentValue.list_name_hin,
        list_name_roman: changes.getData.currentValue.list_name_roman ? changes.getData.currentValue.list_name_roman : null,
        lock: changes.getData.currentValue.lock ? changes.getData.currentValue.lock : 0,
      });
    }
  }

  supportListFormSubmit() {
    console.log("submited");

    if (this.supportListForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('SUPPORTLIST') + this.auth.webUser.dept_id, this.supportListForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists[this.list_type].unshift(data['result']);
          this.supportListForm.reset();
          this.isLoader = false;
          this.toastr.success("Added successfully.");
          this.response.emit(data['result']);
        } else {

          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, (err) => {
        console.log(err);

        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.supportListForm);
    }
  }

  supportListFormUpdate() {
    if (this.supportListForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        list_type: this.getData.list_type,
        list_name_eng: this.supportListForm.value.list_name_eng,
        list_name_hin: this.supportListForm.value.list_name_hin,
        list_name_roman: this.supportListForm.value.list_name_roman,
        lock: this.supportListForm.value.lock,
      };
      this.http.put(this.api.getUrl('SUPPORTLIST'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists[this.list_type].splice(this.gs.Lists[this.list_type].indexOf((i: { _id: any }) => i._id == this.getData._id), 1, data['result']);
          this.supportListForm.reset();
          this.isLoader = false;
          this.toastr.success("Updated successfully.");
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
      this.gs.validationFireOnSubmit(this.supportListForm);
    }
  }

}
