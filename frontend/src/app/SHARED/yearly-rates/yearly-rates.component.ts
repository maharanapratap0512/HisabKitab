import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import { ContextMenuItem } from 'src/app/SHARED/context-menu.directive';
import { SelectionService } from 'src/app/services/selection.service';

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

  // Matrix View properties
  viewMode: 'matrix' | 'list' = 'matrix';
  matrixYears: number[] = [];
  matrixData: any[] = [];
  editingCell: { key: string; year: number; rateValue: number | null } | null = null;

  constructor(
    private http: HttpService,
    private api: ApiService,
    public auth: AuthService,
    public gs: GlobalService,
    private toastr: ToastrService,
    public selectionService: SelectionService
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
    this.editingCell = null;
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
        this.buildMatrixData();
      } else {
        this.toastr.error('Failed to load item rates.');
      }
    }, (err) => {
      this.isLoader = false;
      this.toastr.error(err?.error?.message || 'Error loading item rates.');
    });
  }

  buildMatrixData() {
    const currentYear = new Date().getFullYear();
    const years = (this.itemRates || []).map(r => Number(r.year)).filter(Boolean);
    
    let minYear = years.length ? Math.min(...years) : currentYear - 2;
    let maxYear = years.length ? Math.max(...years) : currentYear;

    minYear = Math.min(minYear, currentYear - 1);
    maxYear = Math.max(maxYear, currentYear);

    const yList: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      yList.push(y);
    }
    this.matrixYears = yList;

    const rowMap = new Map<string, any>();

    // First populate from itemRates
    (this.itemRates || []).forEach(r => {
      const key = `${r.item_id}_${r.subitem_id || 0}`;
      if (!rowMap.has(key)) {
        rowMap.set(key, {
          key: key,
          item_id: r.item_id,
          subitem_id: r.subitem_id || null,
          item_hin: r.item_hin,
          item_eng: r.item_eng,
          subitem_hin: r.subitem_hin,
          subitem_eng: r.subitem_eng,
          rates: {}
        });
      }
      const row = rowMap.get(key);
      row.rates[r.year] = r;
    });

    // Populate from itemmix itemData as well
    if (this.itemData && this.itemData.length) {
      this.itemData.forEach((itm: any) => {
        const keyMain = `${itm.item_id || itm._id}_0`;
        if (!rowMap.has(keyMain)) {
          rowMap.set(keyMain, {
            key: keyMain,
            item_id: itm.item_id || itm._id,
            subitem_id: null,
            item_hin: itm.item_hin,
            item_eng: itm.item_eng,
            subitem_hin: null,
            subitem_eng: null,
            rates: {}
          });
        }
        
        if (itm.subitems && Array.isArray(itm.subitems)) {
          itm.subitems.forEach((sub: any) => {
            const keySub = `${itm.item_id || itm._id}_${sub.subitem_id || sub._id}`;
            if (!rowMap.has(keySub)) {
              rowMap.set(keySub, {
                key: keySub,
                item_id: itm.item_id || itm._id,
                subitem_id: sub.subitem_id || sub._id,
                item_hin: itm.item_hin,
                item_eng: itm.item_eng,
                subitem_hin: sub.subitem_hin,
                subitem_eng: sub.subitem_eng,
                rates: {}
              });
            }
          });
        }
      });
    }

    this.matrixData = Array.from(rowMap.values());
  }

  get filteredMatrixData(): any[] {
    if (!this.matrixData) return [];
    let list = this.matrixData;

    // To prevent browser hang on 5000+ items, default to showing only items with existing rates
    // unless the user explicitly uses a filter (dropdown or search text).
    const hasDropdownFilter = this.selectedItemmix && this.selectedItemmix.length > 0;
    const hasSearchFilter = this.rateFilter.search && this.rateFilter.search.trim();

    if (!hasDropdownFilter && !hasSearchFilter) {
      list = list.filter(r => r.rates && Object.keys(r.rates).length > 0);
    }

    if (hasDropdownFilter) {
      list = list.filter(r => {
        return this.selectedItemmix.some((str: any) => {
          if (typeof str === 'string') {
            const parts = str.split(':');
            const iId = parts[0] ? Number(parts[0]) : null;
            const sId = parts[1] ? Number(parts[1]) : null;
            if (sId) {
              return Number(r.item_id) === iId && Number(r.subitem_id) === sId;
            } else if (iId) {
              return Number(r.item_id) === iId;
            }
          }
          return false;
        });
      });
    }

    if (this.rateFilter.search && this.rateFilter.search.trim()) {
      const q = this.rateFilter.search.toLowerCase().trim();
      list = list.filter(r => {
        const iHin = (r.item_hin || '').toLowerCase();
        const iEng = (r.item_eng || '').toLowerCase();
        const sHin = (r.subitem_hin || '').toLowerCase();
        const sEng = (r.subitem_eng || '').toLowerCase();
        return iHin.includes(q) || iEng.includes(q) || sHin.includes(q) || sEng.includes(q);
      });
    }

    return list;
  }

  startEditCell(row: any, year: number) {
    const currentRate = row.rates && row.rates[year] ? row.rates[year].rate : null;
    this.editingCell = {
      key: row.key,
      year: year,
      rateValue: currentRate
    };
  }

  cancelEditCell() {
    this.editingCell = null;
  }

  saveCellRate(row: any, year: number) {
    if (!this.editingCell || this.editingCell.rateValue === null || this.editingCell.rateValue === undefined || (this.editingCell.rateValue as any) === '') {
      this.toastr.warning('Please enter a valid rate.');
      return;
    }

    const payload = {
      item_id: row.item_id,
      subitem_id: row.subitem_id || null,
      year: year,
      rate: Number(this.editingCell.rateValue)
    };

    this.isLoader = true;
    this.http.post(this.api.getUrl('ITEMRATE') + this.auth.webUser.dept_id, payload).subscribe((res: any) => {
      this.isLoader = false;
      if (res && res.success) {
        this.toastr.success(`Rate ₹${payload.rate} saved for ${year}.`);
        this.editingCell = null;
        this.getItemRates();
      } else {
        this.toastr.error(res?.message || 'Failed to save rate.');
      }
    }, (err) => {
      this.isLoader = false;
      this.toastr.error(err?.error?.message || 'Error saving rate.');
    });
  }

  getContextMenuItems(row: any, year: number): ContextMenuItem[] {
    const rateRecord = row.rates && row.rates[year];
    const hasRecord = rateRecord && rateRecord.rate !== undefined && rateRecord.rate !== null;

    return [
      {
        label: `Apply ₹${hasRecord ? rateRecord.rate : ''} Rate to Aawak & Jawak (${year})`,
        icon: 'uil uil-check-circle text-success',
        disabled: !hasRecord,
        action: () => {
          if (hasRecord) {
            this.applyRateRow({
              item_id: row.item_id,
              subitem_id: row.subitem_id,
              year: year,
              rate: rateRecord.rate
            });
          }
        }
      },
      {
        label: `Edit ${year} Rate`,
        icon: 'uil uil-pen text-primary',
        action: () => {
          this.startEditCell(row, year);
        }
      },
      {
        label: `Delete ${year} Rate`,
        icon: 'uil uil-trash text-danger',
        disabled: !rateRecord || !rateRecord._id,
        action: () => {
          if (rateRecord && rateRecord._id) {
            this.deleteRateRow(rateRecord._id);
          }
        }
      }
    ];
  }

  getItemContextMenuItems(row: any): ContextMenuItem[] {
    const hasRates = row.rates && Object.keys(row.rates).some(year => row.rates[year] && row.rates[year].rate !== undefined && row.rates[year].rate !== null);

    return [
      {
        label: `Apply All Rates for ${row.item_hin}${row.subitem_hin ? ' - ' + row.subitem_hin : ''}`,
        icon: 'uil uil-check-circle text-success',
        disabled: !hasRates,
        action: () => {
          if (hasRates) {
            Swal.fire({
              title: 'Apply All Rates to Aawak & Jawak?',
              text: `This will update the rates for all years available for ${row.item_hin}.`,
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Yes, Apply All',
              cancelButtonText: 'Cancel'
            }).then((result) => {
              if (result.isConfirmed) {
                // Collect all valid rates for this item and apply them sequentially or via a bulk backend call.
                // For simplicity, we apply them sequentially.
                this.isLoader = true;
                const years = Object.keys(row.rates);
                let completed = 0;
                let errors = 0;

                const processNext = (index: number) => {
                  if (index >= years.length) {
                    this.isLoader = false;
                    if (errors === 0) {
                      this.toastr.success(`All rates applied successfully.`);
                    } else {
                      this.toastr.warning(`Applied with ${errors} errors.`);
                    }
                    return;
                  }

                  const year = years[index];
                  const rateRecord = row.rates[year];
                  if (rateRecord && rateRecord.rate !== undefined && rateRecord.rate !== null) {
                    const payload = {
                      dept_id: this.auth.webUser.dept_id,
                      item_id: row.item_id,
                      subitem_id: row.subitem_id,
                      year: Number(year),
                      rate: rateRecord.rate
                    };
                    this.http.post(this.api.getUrl('ITEMRATE') + 'apply/bulk', payload).subscribe((res: any) => {
                      if (!res || !res.success) errors++;
                      processNext(index + 1);
                    }, () => {
                      errors++;
                      processNext(index + 1);
                    });
                  } else {
                    processNext(index + 1);
                  }
                };

                processNext(0);
              }
            });
          }
        }
      },
      {
        label: `Delete All Rates for ${row.item_hin}${row.subitem_hin ? ' - ' + row.subitem_hin : ''}`,
        icon: 'uil uil-trash text-danger',
        disabled: !hasRates,
        action: () => {
          if (hasRates) {
            let rateIdsToDelete: string[] = [];
            Object.keys(row.rates).forEach(year => {
              if (row.rates[year] && row.rates[year]._id) {
                rateIdsToDelete.push(row.rates[year]._id);
              }
            });

            if (rateIdsToDelete.length === 0) {
              this.toastr.warning('No rates found to delete.');
              return;
            }

            Swal.fire({
              title: 'Delete All Rates?',
              text: `Are you sure you want to delete all yearly rates (${rateIdsToDelete.length} records) for this item?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, Delete All',
              cancelButtonText: 'Cancel'
            }).then((result) => {
              if (result.isConfirmed) {
                this.isLoader = true;
                this.http.post(this.api.getUrl('ITEMRATE') + 'delete/bulk', { ids: rateIdsToDelete }).subscribe((res: any) => {
                  this.isLoader = false;
                  if (res && res.success) {
                    this.toastr.success(`Successfully deleted all rates for this item.`);
                    this.getItemRates();
                  } else {
                    this.toastr.error(res?.message || 'Failed to delete rates.');
                  }
                }, (err) => {
                  this.isLoader = false;
                  this.toastr.error(err?.error?.message || 'Error deleting rates.');
                });
              }
            });
          }
        }
      }
    ];
  }

  get filteredItemRates(): any[] {
    if (!this.itemRates) return [];
    return this.itemRates.filter(r => {
      if (this.rateFilter.year && Number(r.year) !== Number(this.rateFilter.year)) {
        return false;
      }
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

  deleteSelectedMatrix() {
    const selectedKeys = this.selectionService.getSelected('yearly-rate-matrix');
    if (!selectedKeys || selectedKeys.length === 0) return;

    let rateIdsToDelete: string[] = [];
    selectedKeys.forEach(key => {
      const row = this.matrixData.find(r => r.key === key);
      if (row && row.rates) {
        Object.keys(row.rates).forEach(year => {
          if (row.rates[year] && row.rates[year]._id) {
            rateIdsToDelete.push(row.rates[year]._id);
          }
        });
      }
    });

    if (rateIdsToDelete.length === 0) {
      this.toastr.warning('No existing rates found for the selected items to delete.');
      return;
    }

    Swal.fire({
      title: 'Bulk Delete Rates?',
      text: `Are you sure you want to delete all yearly rates (${rateIdsToDelete.length} records) for the selected items? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete All',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoader = true;
        this.http.post(this.api.getUrl('ITEMRATE') + 'delete/bulk', { ids: rateIdsToDelete }).subscribe((res: any) => {
          this.isLoader = false;
          if (res && res.success) {
            this.toastr.success(`Successfully deleted ${rateIdsToDelete.length} rate records.`);
            this.selectionService.clear('yearly-rate-matrix');
            this.getItemRates();
          } else {
            this.toastr.error(res?.message || 'Failed to delete bulk rates.');
          }
        }, (err) => {
          this.isLoader = false;
          this.toastr.error(err?.error?.message || 'Error deleting bulk rates.');
        });
      }
    });
  }

  applySelectedMatrix() {
    const selectedKeys = this.selectionService.getSelected('yearly-rate-matrix');
    if (!selectedKeys || selectedKeys.length === 0) return;

    let ratesToApply: any[] = [];
    selectedKeys.forEach(key => {
      const row = this.matrixData.find(r => r.key === key);
      if (row && row.rates) {
        Object.keys(row.rates).forEach(year => {
          if (row.rates[year] && row.rates[year].rate !== undefined && row.rates[year].rate !== null) {
            ratesToApply.push({
              dept_id: this.auth.webUser.dept_id,
              item_id: row.item_id,
              subitem_id: row.subitem_id,
              year: Number(year),
              rate: row.rates[year].rate
            });
          }
        });
      }
    });

    if (ratesToApply.length === 0) {
      this.toastr.warning('No existing valid rates found for the selected items to apply.');
      return;
    }

    Swal.fire({
      title: 'Bulk Apply Rates?',
      text: `Are you sure you want to apply all yearly rates (${ratesToApply.length} records) for the selected items to all matching Aawak & Jawak entries?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Apply All',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoader = true;
        let completed = 0;
        let errors = 0;
        let totalAawak = 0;
        let totalJawak = 0;

        const processNext = (index: number) => {
          if (index >= ratesToApply.length) {
            this.isLoader = false;
            if (errors === 0) {
              this.toastr.success(`Successfully applied ${ratesToApply.length} rate records. Updated ${totalAawak} Aawak and ${totalJawak} Jawak entries.`);
              this.selectionService.clear('yearly-rate-matrix');
            } else {
              this.toastr.warning(`Applied with ${errors} errors.`);
            }
            return;
          }

          const payload = ratesToApply[index];
          this.http.post(this.api.getUrl('ITEMRATE') + 'apply/bulk', payload).subscribe((res: any) => {
            if (res && res.success) {
               totalAawak += (res.aawakCount || 0);
               totalJawak += (res.jawakCount || 0);
            } else {
               errors++;
            }
            processNext(index + 1);
          }, () => {
            errors++;
            processNext(index + 1);
          });
        };

        processNext(0);
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
