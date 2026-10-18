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
  isEditForm: any = false;
  itemForm: FormGroup;
  categories: any = [];
  units: any = [];
  isLoader: boolean = false;
  showModal: string = '';
  viewType: any;
  viewData: any = [];
  imagepath: any = [];
  mainSettings: any = {};
  settings: any = {};
  itemFormSettings: any = {}
  editDoc: any = {};
  docFile: any = [];
  auto_close: any = true;

  // Yearly Rates UI state
  currentYear: number = new Date().getFullYear();
  currentYearRate: any = null;
  showOtherYears: boolean = false;
  yearlyRatesList: { year: number; rate: any; _id?: number }[] = [];
  newCustomYear: number | null = null;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    public api: ApiService,
    protected gs: GlobalService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
    this.itemForm = this.fb.group({
      item_hin: [null, Validators.required],
      item_eng: [null],
      item_roman: [null],
      item_code: [null],
      unit_id: [null],
      categories: [[], Validators.required],
      extra_note: [null],
      restrict_month: [null],
      restrict_year: [null],
      min_rate: [0],
      max_rate: [0],
      document: [[]]
    });

  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.units = result.unit ? result.unit : [];
      this.categories = result.category ? result.category : [];
    });
    this.settings = this.auth.webUser.settings.item;
    this.mainSettings = this.auth.webUser.settings;
    if (!this.getData || !this.getData._id) {
      this.initYearlyRates();
    }
  }

  initYearlyRates(existingRates: any[] = []) {
    const existingMap: { [y: number]: any } = {};
    for (const r of existingRates) {
      if (r.year && r.rate !== null && r.rate !== undefined) {
        existingMap[Number(r.year)] = { rate: Number(r.rate), _id: r._id };
      }
    }
    this.currentYearRate = existingMap[this.currentYear] !== undefined ? existingMap[this.currentYear].rate : null;

    const baseYears = [
      this.currentYear,
      this.currentYear - 1,
      this.currentYear - 2,
      this.currentYear - 3,
      this.currentYear - 4,
      this.currentYear - 5
    ];
    const allYears = Array.from(new Set([...baseYears, ...Object.keys(existingMap).map(Number)])).sort((a, b) => b - a);
    this.yearlyRatesList = allYears.map(y => ({
      year: y,
      rate: existingMap[y] !== undefined ? existingMap[y].rate : null,
      _id: existingMap[y] !== undefined ? existingMap[y]._id : undefined
    }));
  }

  loadItemRates(itemId: number) {
    this.http.get(this.api.getUrl('ITEMRATE') + 'item/' + this.auth.webUser.dept_id + '/' + itemId).subscribe((res: any) => {
      if (res && res.success) {
        this.initYearlyRates(res.result || []);
      } else {
        this.initYearlyRates();
      }
    }, () => {
      this.initYearlyRates();
    });
  }

  onCurrentYearRateChange(val: any) {
    const num = (val !== null && val !== undefined && val !== '') ? Number(val) : null;
    this.currentYearRate = num;
    let found = this.yearlyRatesList.find(y => y.year === this.currentYear);
    if (found) {
      found.rate = num;
    } else {
      this.yearlyRatesList.push({ year: this.currentYear, rate: num });
      this.yearlyRatesList.sort((a, b) => b.year - a.year);
    }
  }

  onYearlyRateChange(yrObj: any) {
    if (yrObj.year === this.currentYear) {
      this.currentYearRate = yrObj.rate !== null && yrObj.rate !== undefined && yrObj.rate !== '' ? Number(yrObj.rate) : null;
    }
  }

  addCustomYearRate() {
    if (!this.newCustomYear) return;
    const yr = Number(this.newCustomYear);
    if (isNaN(yr) || yr < 2000 || yr > 2100) {
      this.toastr.warning('कृपया सही वर्ष दर्ज करें (उदा. 2023, 2028)');
      return;
    }
    if (this.yearlyRatesList.some(y => y.year === yr)) {
      this.toastr.info(`वर्ष ${yr} पहले से सूची में है।`);
      return;
    }
    this.yearlyRatesList.push({ year: yr, rate: null });
    this.yearlyRatesList.sort((a, b) => b.year - a.year);
    this.newCustomYear = null;
  }

  saveYearlyRates(itemId: number, callback?: () => void) {
    const validRates = this.yearlyRatesList.filter(r => r.rate !== null && r.rate !== undefined && !isNaN(Number(r.rate)));
    if (!validRates.length) {
      if (callback) callback();
      return;
    }
    const payload = {
      item_id: itemId,
      subitem_id: null,
      rates: validRates
    };
    this.http.post(this.api.getUrl('ITEMRATE') + 'item/bulk/' + this.auth.webUser.dept_id, payload).subscribe((res: any) => {
      if (!res.success) {
        this.toastr.error(res.message || 'Error saving yearly rates.');
      }
      if (callback) callback();
    }, (err: any) => {
      this.toastr.error(err?.error?.message || 'Error saving yearly rates.');
      if (callback) callback();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData.currentValue) {
      if (typeof changes.getData.currentValue.document == 'string') {
        changes.getData.currentValue.document = JSON.parse(changes.getData.currentValue.document.trim() != '' ? changes.getData.currentValue.document : '[]');
      }
      let categoriesVal = changes.getData.currentValue.categories;
      if (typeof categoriesVal === 'string') {
        try {
          categoriesVal = JSON.parse(categoriesVal);
        } catch (e) { }
      }
      if (Array.isArray(categoriesVal)) {
        categoriesVal = categoriesVal
          .map((c: any) => (typeof c === 'object' && c !== null) ? c._id : c)
          .filter((id: any) => id !== null && id !== undefined);
      } else {
        categoriesVal = [];
      }
      this.itemForm.patchValue({
        item_hin: changes.getData.currentValue.item_hin,
        item_eng: changes.getData.currentValue.item_eng ? changes.getData.currentValue.item_eng : null,
        item_roman: changes.getData.currentValue.item_roman ? changes.getData.currentValue.item_roman : null,
        item_code: changes.getData.currentValue.item_code ? changes.getData.currentValue.item_code : null,
        unit_id: changes.getData.currentValue.unit_id ? changes.getData.currentValue.unit_id : null,
        categories: categoriesVal,
        extra_note: changes.getData.currentValue.extra_note ? changes.getData.currentValue.extra_note : null,
        restrict_month: changes.getData.currentValue.restrict_month ? changes.getData.currentValue.restrict_month : null,
        restrict_year: changes.getData.currentValue.restrict_year ? changes.getData.currentValue.restrict_year : null,
        min_rate: changes.getData.currentValue.min_rate ? changes.getData.currentValue.min_rate : 0,
        max_rate: changes.getData.currentValue.max_rate ? changes.getData.currentValue.max_rate : 0,
        document: changes.getData.currentValue.document ? changes.getData.currentValue.document : []
      });
      this.imagepath = (changes.getData.currentValue.document && changes.getData.currentValue.document.images) ? changes.getData.currentValue.document.images : null;

      if (changes.getData.currentValue._id) {
        this.loadItemRates(changes.getData.currentValue._id);
      } else {
        this.initYearlyRates();
      }
    }
    console.log("this.itemForm.value.document", this.imagepath);

  }

  saveFormSettings() {
    this.isEditForm = false;
    this.auth.updateSettings();
    this.settings = this.auth.webUser.settings.item;
  }

  closeModal() {
    $('#itemComponent > #showModal').modal('hide');
    this.showModal = '';
  }

  itemFormSubmit() {
    if (this.itemForm.valid) {
      this.isLoader = true;
      // console.log(this.itemForm.value);
      this.http.post(this.api.getUrl('ITEM') + this.auth.webUser.dept_id, this.itemForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          const newItem = data['result'];
          this.saveYearlyRates(newItem._id, () => {
            this.gs.Lists.itemmix.unshift(newItem);
            this.itemForm.reset({
              unit_id: newItem.unit_id,
              categories: newItem.categories
            });
            this.initYearlyRates();
            this.isLoader = false;
            this.toastr.success("Item Added Successfully.");
            this.response.emit(newItem);
          });
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
        item_roman: this.itemForm.value.item_roman,
        item_code: this.itemForm.value.item_code,
        unit_id: this.itemForm.value.unit_id,
        categories: this.itemForm.value.categories,
        extra_note: this.itemForm.value.extra_note,
        document: this.itemForm.value.document ? this.itemForm.value.document : [],
        restrict_month: this.itemForm.value.restrict_month ? this.itemForm.value.restrict_month : null,
        restrict_year: this.itemForm.value.restrict_year ? this.itemForm.value.restrict_year : null,
        min_rate: this.itemForm.value.min_rate ? this.itemForm.value.min_rate : 0,
        max_rate: this.itemForm.value.max_rate ? this.itemForm.value.max_rate : 0,
      };
      this.http.put(this.api.getUrl('ITEM'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.saveYearlyRates(this.getData._id, () => {
            this.gs.Lists.itemmix.splice(this.gs.Lists.itemmix.indexOf((i: { _id: any }) => i._id == this.getData._id), 1, data['result']);
            this.itemForm.reset();
            this.initYearlyRates();
            this.isLoader = false;
            this.toastr.success("Item Updated successfully.");
            this.response.emit(data['result']);
          });
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
      this.closeModal();
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
      this.closeModal();
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
      this.closeModal();
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
