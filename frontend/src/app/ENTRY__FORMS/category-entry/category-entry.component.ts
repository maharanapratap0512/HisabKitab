import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-category-entry',
  templateUrl: './category-entry.component.html',
  styleUrls: ['./category-entry.component.scss']
})
export class CategoryEntryComponent implements OnInit {

  @Input() getData: any;
  @Output() response = new EventEmitter();
  @Input() isEdit: any;
  @Input() isVisible: any;
  categoryForm: FormGroup;
  isLoader: boolean = false;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.categoryForm = this.fb.group({
      category_eng: [null, Validators.required],
      category_hin: [null, Validators.required]
    });
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges) {
    console.log("cat-changes", changes);
    if (changes.getData.currentValue) {
      this.categoryForm.patchValue({
        category_eng: changes.getData.currentValue.category_eng,
        category_hin: changes.getData.currentValue.category_hin
      });
    }
  }

  categoryFormSubmit() {
    if (this.categoryForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('CATEGORY') + this.auth.webUser.dept_id, this.categoryForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.category.unshift(data['result']);
          this.categoryForm.reset({ active: true });
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
      this.gs.validationFireOnSubmit(this.categoryForm);
    }
  }

  categoryFormUpdate() {
    if (this.categoryForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        category_eng: this.categoryForm.value.category_eng,
        category_hin: this.categoryForm.value.category_hin,
        isverify: this.categoryForm.value.isverify,
        active: this.categoryForm.value.active
      };
      this.http.put(this.api.getUrl('CATEGORY'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.category.splice(this.gs.Lists.category.indexOf((i: { _id: any }) => i._id == this.getData._id), 1, data['result']);
          this.categoryForm.reset();
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
      this.gs.validationFireOnSubmit(this.categoryForm);
    }
  }

}
