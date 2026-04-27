import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { FormService } from 'src/app/services/form.service';
declare var $: any;

@Component({
  selector: 'app-jawak-new',
  templateUrl: './jawak-new.component.html',
  styleUrls: ['./jawak-new.component.scss']
})
export class JawakNewComponent implements OnInit {
  @ViewChild('TABLE', { static: false }) el!: ElementRef<HTMLInputElement>;

  // Pagination and UI
  page = 1;
  pageNo = 0;
  itemsPerPage = 100;
  totalItems: any;

  isLoader = false;
  showModal = '';
  editData: any = null;
  editIndex: any = null;
  total_count: any = 0;
  term: any = '';
  loadingStatus: any = '';
  viewMode: 'voucher' | 'individual' = 'voucher';

  // Datasets
  jawakData: any[] = [];
  jawakAll: any[] = [];
  items: any = [];
  subitems: any = [];
  units: any = [];
  mms: any = [];
  conditions: any = [];
  departments: any = [];
  pbks: any = [];
  jawak_types: any = [];
  aawak_sources: any = [];
  products: any = [];
  categories: any = [];
  usagelists: any = [];
  nimitts: any = [];
  states: any = [];
  settings: any;

  // Filter/Search
  filterBody: any = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    public fs: FormService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.settings = this.auth.webUser.settings;
    this.settings.jawak.view_mode = this.settings.jawak.view_mode || 'voucher';
    this.gs.observeList().subscribe((result: any) => {
      this.mms = result.mm || [];
      this.items = result.itemmix || [];
      this.units = result.unit || [];
      this.states = result.state || [];
      this.conditions = result.condition || [];
      this.departments = result.department || [];
      this.pbks = result.pbk || [];
      this.jawak_types = result.jawak_type || [];
      this.aawak_sources = result.aawak_source || [];
      this.usagelists = result.usagelist || [];
      this.products = result.product || [];
      this.categories = result.category || [];
      this.nimitts = result.nimitt || [];
      this.isLoader = true;
    });
    this.filterBody.mm_id = this.settings.defaultMM ? [this.settings.defaultMM] : [];
    this.getFilteredData();
  }

  getJawakData(): void {
    this.isLoader = true;
    this.http.put(this.api.getUrl('JAWAK') + 'voucher/' + this.auth.webUser.dept_id, this.filterBody)
      .subscribe((data: any) => {
        if (data && data.result) {
          this.jawakAll = data.result;
          for (let i in this.jawakAll) {
            this.jawakAll[i].sr_no = i;
            for (let j in this.jawakAll[i].aawaks) {
              this.jawakAll[i].aawaks[j].categories_hin = '';
              this.jawakAll[i].aawaks[j].categories_eng = '';
              if (this.jawakAll[i].aawaks[j].scategories && this.jawakAll[i].aawaks[j].scategories.length > 0) {

                for (let k in this.categories) {
                  if (this.jawakAll[i].aawaks[j].scategories.includes(this.categories[k]._id)) {
                    this.jawakAll[i].aawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                    this.jawakAll[i].aawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                  }
                }
              } else {
                for (let k in this.categories) {
                  if (this.jawakAll[i].aawaks[j].icategories.includes(this.categories[k]._id)) {
                    this.jawakAll[i].aawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                    this.jawakAll[i].aawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                  }
                }
              }
            }
          }
          this.jawakData = [...this.jawakAll];
          this.total_count = data['total_count'];
        }
        this.isLoader = false;
      }, err => {
        this.toastr.error('Failed to load Jawak data.');
        this.isLoader = false;
      });
  }

  changeView(mode: 'voucher' | 'individual') {
    this.viewMode = mode;
    this.auth.webUser.settings.jawak.view_mode = mode;
    this.auth.updateSettings()
  }

  UISettingsChanged() {
    this.auth.webUser.settings = this.settings;
    this.auth.updateSettings()
  }

  getJawakPage(page: any = null) {
    if (page) {
      this.pageNo = page;
      this.getFilteredData();
    }
  }

  yearClick(year: any) {
    this.filterBody.year = year;
    this.pageNo = 0;
    this.getFilteredData();
  }

  onHeaderFilterChange() {
    this.pageNo = 1;

    // Handle Item-Subitem mixed selection
    if (this.filterBody.item_subitem_mix) {
      const item_ids: any[] = [];
      const subitem_ids: any[] = [];

      this.filterBody.item_subitem_mix.forEach((val: string) => {
        const parts = val.split(':');
        const itemId = parts[0];
        const subitemId = parts[1];

        if (itemId && !item_ids.includes(itemId)) {
          item_ids.push(itemId);
        }
        if (subitemId && !subitem_ids.includes(subitemId)) {
          subitem_ids.push(subitemId);
        }
      });

      this.filterBody.item_id = item_ids;
      this.filterBody.subitem_id = subitem_ids;
    }

    this.getFilteredData();
  }

  getFilteredData(pageNo: any = null) {
    this.isLoader = true;
    this.loadingStatus = "मैं आत्मा शांत स्वरूप हूँ ।";
    this.filterBody.pageNo = this.pageNo;
    // AUTO select all mm if mm not selected and state selected for mm.
    if (!this.filterBody.mm_id?.length && this.filterBody.mm_states) {
      this.filterBody.mm_id = this.mms.filter((m: { state_id: any; }) => this.filterBody.mm_states.includes(m.state_id)).map((mm: { _id: any; }) => mm._id);
    }
    // AUTO select all jawak mm if jawak mm not selected and jawak state selected for jawak mm.
    if (!this.filterBody.aj_mm_id?.length && this.filterBody.jwk_mm_states) {
      this.filterBody.aj_mm_id = this.mms.filter((m: { state_id: any; }) => this.filterBody.jwk_mm_states.includes(m.state_id)).map((mm: { _id: any; }) => mm._id);
    }
    this.http.put(this.api.getUrl('JAWAK') + 'voucher/' + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.jawakAll = data['result'];
        for (let i in this.jawakAll) {
          this.jawakAll[i].sr_no = i;
          for (let j in this.jawakAll[i].aawaks) {
            this.jawakAll[i].aawaks[j].categories_hin = '';
            this.jawakAll[i].aawaks[j].categories_eng = '';
            if (this.jawakAll[i].aawaks[j].scategories && this.jawakAll[i].aawaks[j].scategories.length > 0) {

              for (let k in this.categories) {
                if (this.jawakAll[i].aawaks[j].scategories.includes(this.categories[k]._id)) {
                  this.jawakAll[i].aawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                  this.jawakAll[i].aawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                }
              }
            } else {
              for (let k in this.categories) {
                if (this.jawakAll[i].aawaks[j].icategories.includes(this.categories[k]._id)) {
                  this.jawakAll[i].aawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                  this.jawakAll[i].aawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                }
              }
            }
          }
        }
        this.jawakData = [...this.jawakAll];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  editJawak(i: any, data: any): void {
    this.editData = { ...data };
    this.editIndex = i;
    this.fs.patchFormJawak({ ...data });
    this.openModal('Edit Jawak');
  }

  closeModal(): void {
    this.showModal = '';
    this.editData = null;
    $('#jawakPageModal').modal('hide');
  }

  openModal(type: any) {
    this.showModal = type;
    $('#jawakPageModal').modal('show');
  }

  addJawakResponse(ev: any): void {
    this.isLoader = true;
    if (ev && ev.length && ev[0].date) {
      this.jawakData.unshift(ev[0]);
      this.isLoader = false;
    } else {
      this.toastr.info('Saved in Draft.');
      this.isLoader = false;
    }
    this.closeModal();
  }

  editJawakResponse(ev: any): void {
    this.isLoader = true;
    if (ev && ev.length) {
      this.jawakData.splice(this.editIndex, 1, ev[0]);
      this.editIndex = null;
      this.closeModal();
      this.isLoader = false;
    } else {
      this.toastr.error('Something went Wrong.');
      this.isLoader = false;
    }
  }

  addJawakBunchResponse(ev: any) {
    this.isLoader = true;
    if (ev && ev.length && ev[0].date) {
      this.jawakData.unshift(ev[0]);
      this.isLoader = false;
    } else {
      this.toastr.info('Saved in Draft.');
      this.isLoader = false;
    }
    this.closeModal();
  }


  deleteJawak(i: number, srNo: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'All jawaks in Bunch will be deleted. You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        let ids: any = JSON.stringify(this.jawakData[srNo].jawaks.map((j: { _id: any; }) => j._id));

        this.http.delete(this.api.getUrl('JAWAK') + 'voucher/' + ids)
          .subscribe((data: any) => {
            if (data.success) {
              this.jawakData.splice(i, 1);
              this.toastr.success('Deleted Successfully');
            } else {
              this.toastr.error(data.message || 'Error deleting.');
            }
          });
      }
    });
  }

  deleteOne(i: number, j: number, id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('JAWAK') + id)
          .subscribe((data: any) => {
            if (data.success) {
              this.jawakData[i].jawaks.splice(j, 1);
              this.toastr.success('Deleted Successfully');
            } else {
              this.toastr.error(data.message || 'Error deleting record.');
            }
          });
      }
    });
  }

  // Add further detail/add/row CRUD as in aawak, referencing fs.jawakFormMain for form structure

  toggleExpand(voucher: any): void {
    voucher.expanded = !voucher.expanded;
  }
}
