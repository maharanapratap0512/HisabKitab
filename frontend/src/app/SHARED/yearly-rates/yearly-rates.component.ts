import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-yearly-rates',
  templateUrl: './yearly-rates.component.html',
  styleUrls: ['./yearly-rates.component.scss']
})
export class YearlyRatesComponent implements OnInit, OnDestroy {

  @Input() itemData: any[] = [];
  @Output() closed = new EventEmitter<void>();

  modalId: string = 'yearlyRatesModal_' + Math.random().toString(36).substring(2, 9);
  isLoader: boolean = false;
  private listSub?: Subscription;

  rateObj: any = { year: new Date().getFullYear(), rate: null, item_id: null, subitem_id: null };
  itemRates: any[] = [];
  rateFilter: any = { year: null, search: '' };
  selectedItemmix: any[] = [];

  constructor(
    private http: HttpService,
    private api: ApiService,
    public auth: AuthService,
    public gs: GlobalService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.listSub = this.gs.observeList().subscribe((res: any) => {
      if (res && res.itemmix) {
        this.itemData = res.itemmix;
      }
    });
  }

  openModal() {
    this.rateObj = { year: new Date().getFullYear(), rate: null, item_id: null, subitem_id: null };
    this.rateFilter = { year: null, search: '' };
    this.selectedItemmix = [];
    if ((!this.itemData || !this.itemData.length) && this.gs.Lists && this.gs.Lists.itemmix) {
      this.itemData = this.gs.Lists.itemmix;
    }
    this.getItemRates();
    setTimeout(() => {
      if (typeof $ !== 'undefined') {
        $('#' + this.modalId).appendTo('body').modal('show');
      }
    }, 50);
  }

  closeModal() {
    if (typeof $ !== 'undefined') {
      $('#' + this.modalId).modal('hide');
    }
    this.closed.emit();
  }

  getItemRates() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('ITEMRATE') + this.auth.webUser.dept_id).subscribe((res: any) => {
      this.isLoader = false;
      if (res && res.success) {
        this.itemRates = res.result || [];
      } else {
        this.toastr.error('Failed to load item rates.');
      }
    }, (err) => {
      this.isLoader = false;
      this.toastr.error(err?.error?.message || 'Error loading item rates.');
    });
  }

  get filteredItemRates(): any[] {
    if (!this.itemRates) return [];
    return this.itemRates.filter(r => {
      // 1. Year filter
      if (this.rateFilter.year && Number(r.year) !== Number(this.rateFilter.year)) {
        return false;
      }

      // 2. Dropdown Item & Subitem Filter (selectedItemmix)
      if (this.selectedItemmix && this.selectedItemmix.length > 0) {
        let matchesDropdown = false;
        this.selectedItemmix.forEach((str: any) => {
          if (typeof str === 'string') {
            const parts = str.split(':');
            const iId = parts[0] ? Number(parts[0]) : null;
            const sId = parts[1] ? Number(parts[1]) : null;
            if (sId) {
              if (Number(r.item_id) === iId && Number(r.subitem_id) === sId) {
                matchesDropdown = true;
              }
            } else if (iId) {
              if (Number(r.item_id) === iId) {
                matchesDropdown = true;
              }
            }
          }
        });
        if (!matchesDropdown) return false;
      }

      // 3. Quick Search filter
      if (this.rateFilter.search && this.rateFilter.search.trim()) {
        const q = this.rateFilter.search.toLowerCase().trim();
        const itemHin = (r.item_hin || '').toLowerCase();
        const itemEng = (r.item_eng || '').toLowerCase();
        const subitemHin = (r.subitem_hin || '').toLowerCase();
        const subitemEng = (r.subitem_eng || '').toLowerCase();
        const match = itemHin.includes(q) || itemEng.includes(q) || subitemHin.includes(q) || subitemEng.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }

  get rateYears(): number[] {
    const yearsFromRates = (this.itemRates || []).map(r => Number(r.year)).filter(Boolean);
    const gsYears = (this.gs && this.gs.years) ? this.gs.years : [2026, 2025, 2024, 2023, 2022];
    const combined = Array.from(new Set([...yearsFromRates, ...gsYears]));
    return combined.sort((a, b) => b - a);
  }

  onRateItemChange(ev: any) {
    if (ev && typeof ev === 'object') {
      this.rateObj.item_id = ev.item_id || null;
      this.rateObj.subitem_id = ev.subitem_id || null;
    } else if (ev) {
      this.rateObj.item_id = ev;
    } else {
      this.rateObj.item_id = null;
      this.rateObj.subitem_id = null;
    }
  }

  saveRate(apply: boolean = false) {
    if (!this.rateObj.item_id || !this.rateObj.year || this.rateObj.rate === null || this.rateObj.rate === undefined) {
      this.toastr.warning('Please select Item, Year, and enter Rate.');
      return;
    }

    this.isLoader = true;
    this.http.post(this.api.getUrl('ITEMRATE') + this.auth.webUser.dept_id, this.rateObj).subscribe((res: any) => {
      this.isLoader = false;
      if (res && res.success) {
        this.toastr.success(res.message || 'Rate saved successfully.');
        this.getItemRates();
        if (apply) {
          this.applyRateRow(this.rateObj);
        } else {
          this.rateObj = { year: new Date().getFullYear(), rate: null, item_id: null, subitem_id: null };
        }
      } else {
        this.toastr.error(res?.message || 'Failed to save rate.');
      }
    }, (err) => {
      this.isLoader = false;
      this.toastr.error(err?.error?.message || 'Error saving rate.');
    });
  }

  applyRateRow(row: any) {
    if (!row.item_id || !row.year || row.rate === null || row.rate === undefined) {
      this.toastr.warning('Invalid rate parameters.');
      return;
    }

    Swal.fire({
      title: 'Apply Rate to Aawak & Jawak?',
      text: `This will update the rate to ₹${row.rate} for all Aawak & Jawak entries of Year ${row.year} in this department.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Apply Rate',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoader = true;
        const payload = {
          dept_id: this.auth.webUser.dept_id,
          item_id: row.item_id,
          subitem_id: row.subitem_id,
          year: row.year,
          rate: row.rate
        };
        this.http.post(this.api.getUrl('ITEMRATE') + 'apply/bulk', payload).subscribe((res: any) => {
          this.isLoader = false;
          if (res && res.success) {
            this.toastr.success(res.message || 'Rates applied successfully.');
          } else {
            this.toastr.error(res?.message || 'Failed to apply rate.');
          }
        }, (err) => {
          this.isLoader = false;
          this.toastr.error(err?.error?.message || 'Error applying rate.');
        });
      }
    });
  }

  deleteRateRow(id: any) {
    Swal.fire({
      title: 'Delete Rate Record?',
      text: 'Are you sure you want to delete this rate record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoader = true;
        this.http.delete(this.api.getUrl('ITEMRATE') + id).subscribe((res: any) => {
          this.isLoader = false;
          if (res && res.success) {
            this.toastr.success('Rate record deleted.');
            this.getItemRates();
          } else {
            this.toastr.error('Failed to delete rate.');
          }
        }, (err) => {
          this.isLoader = false;
          this.toastr.error(err?.error?.message || 'Error deleting rate.');
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.listSub) {
      this.listSub.unsubscribe();
    }
    if (typeof $ !== 'undefined' && this.modalId) {
      $('#' + this.modalId).modal('hide');
      $('#' + this.modalId).remove();
    }
  }
}
