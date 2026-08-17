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
import { SelectionService } from 'src/app/services/selection.service';
import { TourService } from 'src/app/services/tour.service';
import { JAWAK_NEW_TOUR_CONFIG } from './jawak-new.tour';
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

  isLoader: boolean = false;
  showModal = '';
  editData: any = null;
  editIndex: any = null;
  total_count: any = 0;
  term: any;
  loadingStatus: any = '';


  flatJawakItems: any[] = [];
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
  filteredItems: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    public fs: FormService,
    public selectionService: SelectionService,
    private tourService: TourService
  ) { }

  startTour(tourType: string = 'master') {
    if (tourType === 'master') {
      this.tourService.startTour(JAWAK_NEW_TOUR_CONFIG);
    } else {
      const miniTour = JAWAK_NEW_TOUR_CONFIG.miniTours?.find((m) => m.id === tourType);
      if (miniTour) {
        this.tourService.startTour(JAWAK_NEW_TOUR_CONFIG, miniTour.stepIndexes);
      } else {
        this.tourService.startTour(JAWAK_NEW_TOUR_CONFIG);
      }
    }
  }

  resetTourStatus() {
    this.tourService.resetAllTours();
    this.toastr.success('Tour progress reset successfully!', 'Guided Tour');
  }


  ngOnInit(): void {
    this.spinner.show();
    this.settings = this.auth.webUser.settings;
    this.settings.jawak.view_mode = this.settings.jawak.view_mode || 'voucher';
    this.gs.observeList().subscribe((result: any) => {
      this.mms = result.mm || [];
      this.items = result.itemmix || [];
      this.filteredItems = this.items;
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
      this.filterItemsByCategory();
    });
    this.filterBody.mm_id = this.settings.defaultMM ? [this.settings.defaultMM] : [];
    this.filterBody.unlinkedOnly = false;
    this.getFilteredData();
  }

  filterItemsByCategory() {
    if (this.filterBody.categories && this.filterBody.categories.length > 0) {
      this.filteredItems = this.items.map((i: any) => {
        const itemMatches = i.categories && i.categories.some((c: any) => this.filterBody.categories.includes(c._id));
        const matchingSubitems = i.subitems ? i.subitems.filter((sub: any) =>
          sub.categories && sub.categories.some((c: any) => this.filterBody.categories.includes(c._id))
        ) : [];

        if (itemMatches || matchingSubitems.length > 0) {
          return {
            ...i,
            subitems: matchingSubitems,
            matchesCategory: itemMatches
          };
        }
        return null;
      }).filter((i: any) => i !== null);
    } else {
      this.filteredItems = this.items;
    }
  }

  getFilteredJawaks(jawaks: any[]): any[] {
    if (!jawaks) return [];
    let list = jawaks;
    if (this.filterBody.categories && this.filterBody.categories.length > 0) {
      list = list.filter((item: any) => {
        const scats = item.scategories || [];
        const icats = item.icategories || [];
        const scatIds = scats.map((c: any) => c._id);
        const icatIds = icats.map((c: any) => c._id);

        return scatIds.some((id: any) => this.filterBody.categories.includes(id)) ||
          (scats.length === 0 && icatIds.some((id: any) => this.filterBody.categories.includes(id)));
      });
    }
    if (this.filterBody.unlinkedOnly) {
      list = list.filter((item: any) => !item.aawak_splits || !Array.isArray(item.aawak_splits) || item.aawak_splits.length === 0);
    }
    if (this.filterBody.notReceivedOnly) {
      list = list.filter((item: any) => !item.is_recieved);
    }
    return list;
  }

  getJawakData(): void {
    this.isLoader = true;
    this.http.put(this.api.getUrl('JAWAK') + 'voucher/' + this.auth.webUser.dept_id, this.filterBody)
      .subscribe((data: any) => {
        if (data && data.result) {
          this.jawakAll = data.result;
          for (let i in this.jawakAll) {
            this.jawakAll[i].sr_no = i;
            for (let j in this.jawakAll[i].jawaks) {
              this.jawakAll[i].jawaks[j].categories_hin = '';
              this.jawakAll[i].jawaks[j].categories_eng = '';
              const scats = this.jawakAll[i].jawaks[j].scategories || [];
              const icats = this.jawakAll[i].jawaks[j].icategories || [];
              const scatIds = scats.map((c: any) => c._id);
              const icatIds = icats.map((c: any) => c._id);

              if (scats.length > 0) {
                for (let k in this.categories) {
                  if (scatIds.includes(this.categories[k]._id)) {
                    this.jawakAll[i].jawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                    this.jawakAll[i].jawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                  }
                }
              } else {
                for (let k in this.categories) {
                  if (icatIds.includes(this.categories[k]._id)) {
                    this.jawakAll[i].jawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                    this.jawakAll[i].jawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                  }
                }
              }
            }
            this.jawakAll[i].temp_id = this.jawakAll[i].voucher_no || 'temp_' + i;
            this.jawakAll[i].expanded = this.expandAll;
          }
          this.jawakData = this.jawakAll;
          this.flatJawakItems = this.jawakData.reduce((acc: any[], row: any) => acc.concat(this.getFilteredJawaks(row.jawaks)), []);
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

  excelFile: any;
  excelImport(event: any) {
    this.excelFile = event;
    this.showModal = 'ei_jawak';
    $('#jawakPageModal').modal('show');
  }

  importResponse(type: any) {
    this.getFilteredData();
  }

  onAawakRefSaved(event: any, item: any) {
    if (event) {
      item.aawak_ref_id = event;
    }
    if (this.filterBody.unlinkedOnly) {
      this.getFilteredData();
    }
  }

  toggleReceived(data: any) {
    const newStatus = data.is_recieved ? 0 : 1;
    this.http.put(this.api.getUrl('JAWAK') + '/received/' + data._id, { is_recieved: newStatus }).subscribe((res: any) => {
      if (res && res.success) {
        data.is_recieved = newStatus;
        this.toastr.success('Status updated successfully');
      } else {
        this.toastr.error('Failed to update status');
      }
    }, err => {
      this.toastr.error('Failed to update status');
    });
  }

  toggleUnlinkedFilter() {
    this.filterBody.unlinkedOnly = !this.filterBody.unlinkedOnly;
    this.onHeaderFilterChange();
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

  clearFilter() {
    this.filterBody = {};
    this.filterBody.mm_id = this.settings.defaultMM ? [this.settings.defaultMM] : [];
    this.filterBody.unlinkedOnly = false;
    this.pageNo = 1;
    this.filterItemsByCategory();
    this.getFilteredData();
  }

  onHeaderFilterChange() {
    this.pageNo = 1;
    this.filterItemsByCategory();

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
          for (let j in this.jawakAll[i].jawaks) {
            this.jawakAll[i].jawaks[j].categories_hin = '';
            this.jawakAll[i].jawaks[j].categories_eng = '';
            const scats = this.jawakAll[i].jawaks[j].scategories || [];
            const icats = this.jawakAll[i].jawaks[j].icategories || [];
            const scatIds = scats.map((c: any) => c._id);
            const icatIds = icats.map((c: any) => c._id);

            if (scats.length > 0) {
              for (let k in this.categories) {
                if (scatIds.includes(this.categories[k]._id)) {
                  this.jawakAll[i].jawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                  this.jawakAll[i].jawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                }
              }
            } else {
              for (let k in this.categories) {
                if (icatIds.includes(this.categories[k]._id)) {
                  this.jawakAll[i].jawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                  this.jawakAll[i].jawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                }
              }
            }
          }
          this.jawakAll[i].temp_id = this.jawakAll[i].voucher_no || 'temp_' + i;
        }
        this.jawakData = this.jawakAll;
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  editJawak(i: any, data: any): void {
    this.editData = JSON.parse(JSON.stringify(data));
    this.editIndex = i;
    this.openModal('Edit Jawak');
  }

  showImages(row: any) {
    this.editData = row;
    this.openModal('Show Images');
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


  deleteMultiple() {
    let mode = this.settings.jawak.viewMode;
    let context = mode === 'voucher' ? 'jawak-new-voucher' : 'jawak-new-individual';
    let selectedIds = this.selectionService.getSelected(context);

    if (selectedIds.length === 0) {
      this.toastr.warning('Please select at least one item to delete');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `You won't be able to revert this! You are about to delete ${selectedIds.length} ${mode === 'voucher' ? 'voucher(s)' : 'item(s)'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        let s_count = 0;
        for (let id of selectedIds) {
          let res: any = mode === 'voucher' ? await this.fnDeleteVoucher(id) : await this.fnDeleteIndividual(id);
          if (res) s_count += 1;
        }
        let msg = `${s_count} Deleted Successfully out of ${selectedIds.length}`;
        this.selectionService.clear(context);
        this.toastr.success(msg);
      }
    });
  }

  bulkEditMultiple() {
    let mode = this.settings.jawak.viewMode;
    let context = mode === 'voucher' ? 'jawak-new-voucher' : 'jawak-new-individual';
    let selectedIds = this.selectionService.getSelected(context);
    if (selectedIds.length === 0) {
      this.toastr.warning('Please select at least one item to edit');
      return;
    }
    this.toastr.info(`Bulk edit for ${selectedIds.length} items will be implemented next.`);
  }

  expandAll: boolean = true;

  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    this.jawakData.forEach(v => v.expanded = this.expandAll);
  }

  async fnDeleteVoucher(voucherNo: any) {
    return new Promise((resolve, reject) => {
      let index = this.jawakData.findIndex((x: any) => x.temp_id === voucherNo);
      if (index === -1) return resolve(false);
      let ids: any = JSON.stringify(this.jawakData[index].jawaks.map((j: { _id: any; }) => j._id));
      this.http.delete(this.api.getUrl('JAWAK') + 'voucher/' + ids).subscribe((data: any) => {
        if (data.success) {
          this.jawakData.splice(index, 1);
          this.flatJawakItems = this.jawakData.reduce((acc: any[], row: any) => acc.concat(this.getFilteredJawaks(row.jawaks)), []);
          return resolve(true);
        } else {
          this.toastr.error(data.message || 'Error deleting.');
          return resolve(false);
        }
      }, err => resolve(false));
    });
  }

  async fnDeleteIndividual(id: any) {
    return new Promise((resolve, reject) => {
      this.http.delete(this.api.getUrl('JAWAK') + id).subscribe((data: any) => {
        if (data.success) {
          for (let i = 0; i < this.jawakData.length; i++) {
            let j = this.jawakData[i].jawaks.findIndex((x: any) => x._id === id);
            if (j !== -1) {
              this.jawakData[i].jawaks.splice(j, 1);
              if (this.jawakData[i].jawaks.length === 0) {
                this.jawakData.splice(i, 1);
              }
              break;
            }
          }
          this.flatJawakItems = this.jawakData.reduce((acc: any[], row: any) => acc.concat(this.getFilteredJawaks(row.jawaks)), []);
          return resolve(true);
        } else {
          this.toastr.error(data.message || 'Error deleting record.');
          return resolve(false);
        }
      }, err => resolve(false));
    });
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
              this.flatJawakItems = this.jawakData.reduce((acc: any[], row: any) => acc.concat(this.getFilteredJawaks(row.jawaks)), []);
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
              this.flatJawakItems = this.jawakData.reduce((acc: any[], row: any) => acc.concat(this.getFilteredJawaks(row.jawaks)), []);
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
