import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { iif } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
declare var $: any;

@Component({
  selector: 'app-subitem-list-entry',
  templateUrl: './subitem-list-entry.component.html',
  styleUrls: ['./subitem-list-entry.component.scss']
})
export class SubitemListEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any = null;
  @Output() response = new EventEmitter();
  subitemListForm: FormGroup;
  items: any = [];
  subitem_list: any = [];
  categories: any = [];
  units: any = [];
  isLoader: boolean = false;
  showModal: string = '';

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.subitemListForm = this.fb.group({
      subitem_hin: [null, Validators.required],
      subitem_eng: [null],
      extra_note:[null]
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("subitem_list-changes", changes);
    if (changes.getData.currentValue) {
      this.subitemListForm.patchValue({
        subitem_hin: changes.getData.currentValue.subitem_hin,
        subitem_eng: changes.getData.currentValue.subitem_eng,
        extra_note: changes.getData.currentValue.extra_note,
      });
    }
  }

  subitemListFormSubmit() {
    if (this.subitemListForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('SUBITEMLIST') + this.auth.webUser.dept_id, this.subitemListForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.subitem_list.unshift(data['result'])
          this.subitemListForm.reset();
          this.isLoader = false;
          this.toastr.success('Subitem List Added Successfully.')
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
      this.gs.validationFireOnSubmit(this.subitemListForm);
    }
  }

  subitemListFormUpdate() {
    if (this.subitemListForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        subitem_hin: this.subitemListForm.value.subitem_hin,
        subitem_eng: this.subitemListForm.value.subitem_eng,
        extra_note: this.subitemListForm.value.extra_note
      };
      this.http.put(this.api.getUrl('SUBITEMLIST'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.subitem_list.splice(this.gs.Lists.subitem.indexOf((i: { _id: any }) => { i._id == this.getData._id }), 1, data['result']);
          this.subitemListForm.reset();
          this.isLoader = false;
          this.toastr.success('Subitem List Updated Successfully.')
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
      this.gs.validationFireOnSubmit(this.subitemListForm);
    }
  }

}
