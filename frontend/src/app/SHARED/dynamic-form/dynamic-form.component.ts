import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { GlobalService } from '../../services/global.service';
import { HttpService } from '../../services/http.service';
import { FormConfig, FormField } from 'src/app/services/form-config.service';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnChanges {

  @Input() config!: FormConfig;
  @Input() isEdit: boolean = false;
  @Input() getData: any;
  @Output() response = new EventEmitter();

  form!: FormGroup;
  isLoader: boolean = false;
  lists: any = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
    // Load all dropdown lists
    this.gs.observeList().subscribe(result => {
      this.lists = result;
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData && changes.getData.currentValue) {
      this.form.patchValue(changes.getData.currentValue);
    }
  }

  initializeForm() {
    const group: any = {};
    this.config.fields.forEach((field: any) => {
      const validators = field.required ? [Validators.required] : [];
      group[field.key] = [null, validators];
    });
    this.form = this.fb.group(group);
  }

  isFieldVisible(field: FormField): boolean {
    if (field.settingsKey && this.config.settings) {
      const keys = field.settingsKey.split('.');
      let settingValue = this.config.settings;
      for (const key of keys) {
        settingValue = settingValue?.[key];
      }
      return !!settingValue;
    }
    return true;
  }

  getFilteredOptions(field: FormField): any[] {
    if (!field.options) return [];
    return field.options;
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoader = true;
      const apiUrl = this.isEdit ? this.config.api.update : this.config.api.create;
      const method = this.isEdit ? 'put' : 'post';

      const body = this.isEdit ?
        { query: { _id: this.getData._id }, set: this.form.value } :
        this.form.value;

      this.http[method](this.api.getUrl(apiUrl) + (this.isEdit ? '' : this.auth.webUser.dept_id), body)
        .subscribe((data: any) => {
          if (data['result'] && data['success']) {
            this.form.reset();
            this.isLoader = false;
            this.toastr.success(`${this.config.title} ${this.isEdit ? 'Updated' : 'Added'} Successfully.`);
            this.response.emit(data['result']);
          } else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        }, err => {
          this.toastr.error(err['error']);
          this.isLoader = false;
        });
    } else {
      this.gs.validationFireOnSubmit(this.form);
    }
  }
}
