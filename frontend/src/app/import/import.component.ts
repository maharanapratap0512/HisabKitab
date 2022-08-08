import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  isLoader: boolean = false;
  @Input() importData: any;
  @Output() response = new EventEmitter();
  term: any;
  items: any = [];
  itemAll: any = [];
  subitems: any = [];
  units: any = [];
  states: any = [];
  mms: any = [];
  conditions: any = [];
  categories: any = [];
  pbks: any = [];
  aawak_types: any = [];
  jawak_types: any = [];
  nimitts: any = [];
  settings: any = [];
  unmatchedData: any = [];
  um_items: any = [];
  um_mms: any = [];
  um_units: any = [];
  um_pbks: any = [];
  cat: any = null;


  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.gs.observeList().subscribe(result => {
      this.itemAll = result.itemmix ? result.itemmix : [];
      this.items = result.itemmix && this.auth.webUser.dept_id > 2 ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      // this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });
    this.settings = this.auth.webUser.settings;
  }

  ngOnInit(): void {

    this.getImportData();
    this.getUnmatchedList();
  }

  getImportData() {
    this.http.get(this.api.getUrl('IMPORTEXPORT')).subscribe((data: any) => {
      if (data.success) {
        this.importData = data.result;
        for (let i in this.importData) {
          console.log("this.importData[i]", this.importData[i]);

          if (this.importData[i].date && this.importData[i].mm_id && (this.importData[i].aj_mm_id || this.importData[i].pbk_id) && this.importData[i].item_id && this.importData[i].qty && this.importData[i].unit_id && this.importData[i].aj_type_id) {
            this.importData[i].valid = true;
          } else {
            this.importData[i].valid = false;
          }
          for (let j in this.importData[i].jawak_detail) {
            if (this.importData[i].jawak_detail[j].aj_mm_id && this.importData[i].jawak_detail[j].qty && this.importData[i].jawak_detail[j].aj_type_id) {
              this.importData[i].jawak_detail[j].valid = true;
            } else {
              this.importData[i].jawak_detail[j].valid = false;
            }
            if (this.importData[i].jawak_detail[j].aj_mm_id && !this.importData[i].jawak_detail[j].aj_mm_hin) {
              let getmm = this.mms.find((m: { _id: any; }) => m._id == this.importData[i].jawak_detail[j].aj_mm_id);
              if (getmm) {
                this.importData[i].jawak_detail[j].aj_mm_hin = getmm.mm_hin;
                this.importData[i].jawak_detail[j].aj_mm_code = getmm.mm_code;
              }
            }
            if (this.importData[i].jawak_detail[j].nimitt_id && !this.importData[i].jawak_detail[j].nimmit_hin) {
              let getnimitt = this.nimitts.find((m: { _id: any; }) => m._id == this.importData[i].jawak_detail[j].nimitt_id);
              if (getnimitt) {
                this.importData[i].jawak_detail[j].nimitt_hin = getnimitt.nimitt_hin;
                this.importData[i].jawak_detail[j].nimitt_state_hin = getnimitt.state_hin;
              }
            }
            if (this.importData[i].jawak_detail[j].aj_type_id && !this.importData[i].jawak_detail[j].aj_type_hin) {
              let getaj_type = this.jawak_types.find((m: { _id: any; }) => m._id == this.importData[i].jawak_detail[j].aj_type_id);
              if (getaj_type) {
                this.importData[i].jawak_detail[j].aj_type_hin = getaj_type.list_name_hin;
              }
            }
            if (this.importData[i].jawak_detail[j].unit_id && !this.importData[i].jawak_detail[j].unit_short) {
              let getunit = this.units.find((m: { _id: any; }) => m._id == this.importData[i].jawak_detail[j].unit_id);
              if (getunit) {
                this.importData[i].jawak_detail[j].unit_short = getunit.unit_short;
              }
            }
          }
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.importData && changes.importData.currentValue) {
      this.importData = changes.importData.currentValue;
    }
  }

  getUnmatchedList() {
    this.http.get(this.api.getUrl('IMPORTEXPORT') + 'correction').subscribe((data: any) => {
      if (data.result) {
        this.unmatchedData = data.result;
      }
    });
  }

  catSelected(ev: any) {
    if (ev) {
      this.cat = ev;
      this.items = this.itemAll.filter((i: { category_id: any, categories: any }) => i.category_id == ev || i.categories.includes(ev));
    }
    else {
      this.cat = null;
      this.items = this.itemAll;
    }
  }

  itemSelected(ev: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);
      let category_ids = this.categories.map((c: { _id: any; }) => c._id);
      if (this.cat) {
        this.subitems = item.subitems.filter((s: { category_id: any; }) => s.category_id == this.cat);
      }
      else {
        this.subitems = item.subitems.filter(((s: { category_id: any; }) => category_ids.includes(s.category_id)));
      }
    }
    else {
      this.subitems = [];
    }
  }

  applyCorrection() {

    this.http.put(this.api.getUrl('IMPORTEXPORT') + 'correction', this.unmatchedData).subscribe((data: any) => {
      // this.unmatchedData = data;
      this.getUnmatchedList();
      this.getImportData();
    });

  }

  importFinal() {
    let valid = this.importData.filter((i: { valid: boolean, jawak_detail: any[]; }) => i.valid == false && i.jawak_detail.filter((j: { valid: Boolean; }) => j.valid == false).length == 0);

    if (valid == 0) {
      this.http.put(this.api.getUrl('IMPORTEXPORT') + 'final', this.importData).subscribe((data: any) => {
        this.response.emit(1);
      });
    } else {
      Swal.fire({
        title: 'Error!',
        text: "Some invalid row exists",
        icon: 'error',
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }



  }


  clearTempImport() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('IMPORTEXPORT') + 'all').subscribe((data: any) => {
          this.response.emit("deleted");
        });
      }
    });
  }

}
