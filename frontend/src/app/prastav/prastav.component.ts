import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { forkJoin } from 'rxjs';
import { SelectionService } from '../services/selection.service';
import { TourService } from '../services/tour.service';
import { PRASTAV_TOUR_CONFIG } from './prastav.tour';

declare var $: any;

@Component({
  selector: 'app-prastav',
  templateUrl: './prastav.component.html',
  styleUrls: ['./prastav.component.scss']
})
export class PrastavComponent implements OnInit {

  page = 1;
  pageNo = 0;
  itemsPerPage = 100;
  total_count = 0;
  term: any = '';
  settings: any = {};
  filterBody: any = {};

  expandAll = true;

  months = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
  ];

  getMonthName(m: number): string {
    return this.months.find(x => x.value == m)?.label || String(m);
  }

  prastavs: any[] = []; // Raw flat data
  groupedVouchers: any[] = []; // Layered data for Voucher Mode
  individualRows: any[] = []; // Denormalized data for Individual Mode with rowspans

  // Filter Lists
  mms: any[] = [];
  states: any[] = [];
  zones: any[] = [];
  pbks: any[] = [];
  items: any[] = [];
  prastavTypes: any[] = [];

  isEdit = false;
  selectedPrastav: any = null;
  jawakFocusMode: boolean = false;
  focusedLineIndex: number = 0;
  allJawakMode: boolean = false;

  constructor(
    public api: ApiService,
    public http: HttpService,
    public gs: GlobalService,
    public auth: AuthService,
    private toastr: ToastrService,
    public selectionService: SelectionService,
    private tourService: TourService
  ) {
  }

  startTour(tourType: string = 'master') {
    if (tourType === 'master') {
      this.tourService.startTour(PRASTAV_TOUR_CONFIG);
    } else {
      const miniTour = PRASTAV_TOUR_CONFIG.miniTours?.find((m) => m.id === tourType);
      if (miniTour) {
        this.tourService.startTour(PRASTAV_TOUR_CONFIG, miniTour.stepIndexes);
      } else {
        this.tourService.startTour(PRASTAV_TOUR_CONFIG);
      }
    }
  }

  resetTourStatus() {
    this.tourService.resetAllTours();
    this.toastr.success('Tour progress reset successfully!', 'Guided Tour');
  }


  UISettingsChanged() {
    this.auth.webUser.settings = this.settings;
    this.auth.updateSettings();
  }

  ngOnInit(): void {
    this.settings = this.auth.webUser?.settings || {};
    this.auth.settingsUpdated$?.subscribe((newSettings: any) => {
      this.settings = newSettings || this.auth.webUser?.settings || {};
    });
    if (this.settings.prastav) {
      this.settings.prastav.view_mode = this.settings?.prastav?.view_mode || 'voucher';
      this.settings.prastav.samePageEntryForm = this.settings?.prastav?.samePageEntryForm || false;
    } else {
      this.settings.prastav = { view_mode: "voucher", samePageEntryForm: false };
    }
    if (this.auth.webUser?.settings?.defaultMM) {
      this.filterBody.mm_id = [this.auth.webUser.settings.defaultMM];
    }
    this.getPrastavs();
    this.getFilterLists();
  }

  getFilterLists() {
    // Standard approach in this app is to subscribe to GlobalService list or fetch explicitly
    this.gs.observeList().subscribe((res: any) => {
      this.mms = res.mm || [];
      this.states = res.state || [];
      this.zones = res.zone || [];
      this.pbks = res.pbk || [];
      this.items = res.item || [];
      this.prastavTypes = res.prastav_type || [];
      if (this.prastavs && this.prastavs.length > 0) {
        this.processData();
      }
    });
  }

  getMmZone(mm: any, mmId?: any): string {
    if (mm?.zone_hin) return mm.zone_hin;
    if (mm?.zone_eng) return mm.zone_eng;
    if (mm?.zone?.zone_hin) return mm.zone.zone_hin;
    if (mm?.zone?.zone_eng) return mm.zone.zone_eng;

    const id = mmId || mm?._id;
    if (id && this.mms?.length) {
      const foundMm = this.mms.find((m: any) => m._id === id);
      if (foundMm) {
        if (foundMm.zone_hin) return foundMm.zone_hin;
        if (foundMm.zone_eng) return foundMm.zone_eng;

        // Chain: MM -> state -> zone
        if (foundMm.state_id && this.states?.length) {
          const foundState = this.states.find((s: any) => s._id === foundMm.state_id);
          if (foundState?.zone_id && this.zones?.length) {
            const foundZone = this.zones.find((z: any) => z._id === foundState.zone_id);
            if (foundZone) {
              return foundZone.zone_hin || foundZone.zone_eng || '';
            }
          }
        }
      }
    }
    return '';
  }

  getPrastavType(typeObj: any, typeId?: any): string {
    if (typeObj?.list_name_hin && typeObj?.list_name_eng) {
      return `${typeObj.list_name_hin} : ${typeObj.list_name_eng}`;
    }
    if (typeObj?.list_name_hin) return typeObj.list_name_hin;
    if (typeObj?.list_name_eng) return typeObj.list_name_eng;
    if (typeId && this.prastavTypes && this.prastavTypes.length > 0) {
      const pt = this.prastavTypes.find((t: any) => t._id == typeId);
      if (pt) {
        return pt.list_name_hin ? `${pt.list_name_hin} : ${pt.list_name_eng}` : pt.list_name_eng;
      }
    }
    return '';
  }

  getPrastavs() {
    this.filterBody.pageNo = this.pageNo;
    this.http.put(this.api.getUrl('PRASTAV'), this.filterBody)
      .subscribe((data: any) => {
        this.prastavs = data.result || [];
        this.total_count = data.total_count || 0;
        this.processData();
      });
  }

  getPrastavPage(page: any) {
    this.pageNo = page - 1;
    this.getPrastavs();
  }

  yearClick(year: any) {
    this.filterBody.year = year;
    this.pageNo = 0;
    this.getPrastavs();
  }

  monthClick(month: any) {
    this.filterBody.month = month;
    this.pageNo = 0;
    this.getPrastavs();
  }

  applyFilter() {
    this.pageNo = 0;
    this.getPrastavs();
  }

  clearFilter() {
    this.filterBody = {};
    this.pageNo = 0;
    this.getPrastavs();
  }

  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    this.groupedVouchers.forEach(v => {
      v.expanded = this.expandAll;
    });
  }

  processData() {
    // Pre-enrich mm with zone if not already present
    this.prastavs.forEach(p => {
      const zName = this.getMmZone(p.mm, p.mm_id);
      if (zName) {
        p.zone_hin = p.zone_hin || zName;
        if (p.mm) {
          p.mm.zone_hin = p.mm.zone_hin || zName;
        }
      }
    });

    // 1. Group by Voucher for Voucher Mode
    const vGroups = new Map();
    this.prastavs.forEach(p => {
      const vKey = p.voucher_no || 'temp_' + p._id;
      if (!vGroups.has(vKey)) {
        vGroups.set(vKey, {
          _id: vKey,
          voucher_no: p.voucher_no,
          date: p.date,
          mm: p.mm,
          mm_id: p.mm_id,
          zone_hin: p.zone_hin || p.mm?.zone_hin,
          zone_eng: p.zone_eng || p.mm?.zone_eng,
          pbk: p.pbk,
          pbk_count: p.pbk_count,
          prastav_type: p.prastav_type,
          type: p.type,
          note_details: p.note_details, // Capture note from the first item
          is_noted: p.is_noted,
          is_rejected: p.is_rejected || 0,
          reject_reason: p.reject_reason || null,
          items: [],
          expanded: this.expandAll, // Default open for Voucher Mode
          totalAmount: 0,
          vRows: [] // Internal rows for this voucher (Item spans Jawak)
        });
      }
      const vGroup = vGroups.get(vKey);
      if (!vGroup.prastav_type && p.prastav_type) {
        vGroup.prastav_type = p.prastav_type;
        vGroup.type = p.type;
      }
      vGroup.items.push(p);
      vGroup.totalAmount += parseFloat(p.amount || 0);
    });

    // 2. Pre-calculate Internal Rowspans for each Voucher's Item-Jawak Table
    this.groupedVouchers = Array.from(vGroups.values());
    this.groupedVouchers.forEach(v => {
      const vRows: any[] = [];
      v.items.forEach((item: any, iIdx: number) => {
        const iRowSpan = Math.max(1, item.jawaks?.length || 0);
        let isIFirst = true;
        if (item.jawaks && item.jawaks.length > 0) {
          item.jawaks.forEach((jawak: any, jIdx: number) => {
            vRows.push({
              _id: item._id,
              item,
              jawak,
              iRowSpan,
              isIFirst,
              sr: iIdx + 1
            });
            isIFirst = false;
          });
        } else {
          vRows.push({
            _id: item._id,
            item,
            jawak: null,
            iRowSpan,
            isIFirst,
            sr: iIdx + 1
          });
        }
      });
      v.vRows = vRows;
    });

    // 3. Flatten for Individual Mode with Triple Rowspan Logic
    const rows: any[] = [];
    this.groupedVouchers.forEach(v => {
      let vRowSpan = 0;
      v.vRows.forEach((vr: any) => vRowSpan++);

      let isVFirst = true;
      v.vRows.forEach((vr: any) => {
        rows.push({
          voucher: v,
          ...vr,
          vRowSpan,
          isVFirst
        });
        isVFirst = false;
      });
    });
    this.individualRows = rows;
  }

  async exportToExcel() {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Prastav Data');

    // Styling Definitions
    const borderThin: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    const headerFillPrastav: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF203764' } }; // Dark Blue
    const headerFillJawak: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF375623' } };   // Dark Green
    const boldWhite: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };

    ws.columns = [
      { header: 'Sr', key: 'sr', width: 5 },
      { header: 'Voucher #', key: 'v_no', width: 12 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Place (MM)', key: 'mm', width: 25 },
      { header: 'Person (PBK)', key: 'pbk', width: 25 },
      { header: 'Type', key: 'type', width: 18 },
      { header: 'Item', key: 'item', width: 25 },
      { header: 'Subitem', key: 'subitem', width: 20 },
      { header: 'Qty', key: 'qty', width: 10 },
      { header: 'Unit', key: 'unit', width: 8 },
      { header: 'Rate', key: 'rate', width: 10 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Note', key: 'note', width: 30 },
      { header: 'Jwk Date', key: 'j_date', width: 12 },
      { header: 'Source MM', key: 'j_source', width: 20 },
      { header: 'Receiver', key: 'j_receiver', width: 20 },
      { header: 'J-Qty', key: 'j_qty', width: 8 },
      { header: 'Bachat', key: 'j_bachat', width: 8 },
      { header: 'Status', key: 'j_status', width: 8 }
    ];

    // Header styling - Split into Prastav (1-13) and Jawak (14-19)
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      cell.font = boldWhite;
      cell.border = borderThin;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      if (colNumber <= 13) {
        cell.fill = headerFillPrastav;
      } else {
        cell.fill = headerFillJawak;
      }
    });

    this.groupedVouchers.forEach((v, vIdx) => {
      v.vRows.forEach((vr: any, rIdx: number) => {
        const rowData = {
          sr: vr.isIFirst ? vr.sr : '',
          v_no: vr.isIFirst ? (v.voucher_no || '') : '',
          date: vr.isIFirst ? (v.date || '') : '',
          mm: vr.isIFirst ? (v.mm?.mm_hin || '') : '',
          pbk: vr.isIFirst ? (v.pbk?.pbk_hin || '') : '',
          type: vr.isIFirst ? this.getPrastavType(v.type, v.prastav_type) : '',
          item: vr.isIFirst ? (vr.item.item?.item_hin || '') : '',
          subitem: vr.isIFirst ? (vr.item.subitem?.subitem_hin || '') : '',
          qty: vr.isIFirst ? (vr.item.qty || '') : '',
          unit: vr.isIFirst ? (vr.item.unit?.unit_short || '') : '',
          rate: vr.isIFirst ? (vr.item.rate || '') : '',
          amount: vr.isIFirst ? (vr.item.amount || '') : '',
          note: vr.isIFirst ? (v.note_details || '') : '',
          j_date: vr.jawak ? vr.jawak.date : '',
          j_source: vr.jawak ? vr.jawak.source_mm?.mm_hin : '',
          j_receiver: vr.jawak ? vr.jawak.kiske_dwara : '',
          j_qty: vr.jawak ? vr.jawak.qty : '',
          j_bachat: vr.jawak ? (vr.jawak.bachat ?? '') : '',
          j_status: vr.jawak ? (vr.jawak.is_received ? 'RCV' : 'PND') : ''
        };

        const row = ws.addRow(rowData);

        row.eachCell((cell, colNumber) => {
          cell.border = borderThin;
          cell.font = { size: 12 };

          // Styling for Prastav columns (slightly muted text for empty cells)
          if (colNumber <= 12 && !vr.isIFirst) {
            cell.font = { color: { argb: 'FFA0A0A0' }, size: 12 };
          }

          // Alignment
          if ([8, 10, 11, 16].includes(colNumber)) {
            cell.alignment = { horizontal: 'right' };
          } else {
            cell.alignment = { horizontal: 'left' };
          }
        });

        // Highlight Jawak columns slightly
        for (let i = 13; i <= 17; i++) {
          const cell = row.getCell(i);
          if (vr.jawak) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
          }
        }
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Prastav_Report_${new Date().getTime()}.xlsx`);
  }

  toggleExpand(node: any) {
    node.expanded = !node.expanded;
  }

  editVoucher(v: any) {
    // If the PrastavEntry component expects 'lines' but we grouped it as 'items'
    if (v && v.items && !v.lines) {
      v.lines = v.items;
    }
    this.openEntryModal(v);
  }

  openJawakEdit(v: any, lineIndex: number) {
    // Ensure lines exists for the entry component
    if (v && v.items && !v.lines) {
      v.lines = v.items;
    } else if (v && !v.lines) {
      v.lines = [v]; // Individual mode fix
    }
    this.allJawakMode = false;
    this.openEntryModal(v, true, lineIndex);
  }

  openAllJawakEdit(v: any) {
    // Open modal with all items jawak mode
    if (v && v.items && !v.lines) {
      v.lines = v.items;
    }
    this.allJawakMode = true;
    this.jawakFocusMode = false;
    this.focusedLineIndex = 0;
    this.isEdit = true;
    this.selectedPrastav = v;
    $('#prastavEntryModal').modal('show');
  }

  deleteVoucher(v: any) {
    if (!v.voucher_no) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete Voucher #${v.voucher_no} and ALL its internal items!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#e74c3c'
    }).then((result) => {
      if (result.isConfirmed) {
        // DELETE /api/prastav/voucher/:vno
        const url = `${this.api.getUrl('PRASTAV')}/voucher/${v.voucher_no}`;
        this.http.delete(url).subscribe((res: any) => {
          if (res.success) {
            this.toastr.success('Voucher & its content deleted successfully.');
            this.getPrastavs();
          } else {
            this.toastr.error('Delete failed!');
          }
        });
      }
    });
  }

  openEntryModal(row: any = null, jawakFocus: boolean = false, lineIndex: number = 0) {
    this.isEdit = !!row;
    this.selectedPrastav = row;
    this.jawakFocusMode = jawakFocus;
    this.focusedLineIndex = lineIndex;
    if (!jawakFocus) this.allJawakMode = false;
    $('#prastavEntryModal').modal('show');
  }

  closeModal() {
    $('#prastavEntryModal').modal('hide');
    this.isEdit = false;
    this.selectedPrastav = null;
  }

  onSaved(ev: any) {
    this.closeModal();

    if (this.isEdit && ev.result && ev.result.voucher_no) {
      const vno = ev.result.voucher_no;

      // Update the flat data list (this.prastavs)
      // Remove all items for this voucher and insert new ones
      const freshItems = Array.isArray(ev.result.lines) ? ev.result.lines : [];

      // Find where this voucher rows start (to preserve visual order)
      const firstIndex = this.prastavs.findIndex(p => p.voucher_no === vno);
      if (firstIndex !== -1) {
        // Count how many rows currently belong to this voucher
        const count = this.prastavs.filter(p => p.voucher_no === vno).length;
        // Replace in-place
        this.prastavs.splice(firstIndex, count, ...freshItems);
      } else {
        // Fallback: unshift to top
        this.prastavs.unshift(...freshItems);
      }

      // Rebuild groupedVouchers and individualRows from the updated flat list
      this.processData();
      this.toastr.success('Data Sync Complete.');

    } else {
      // Generic refresh for NEW records (easiest to get new IDs etc)
      this.getPrastavs();
    }
  }

  delete(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "This item will be removed from the voucher record.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('PRASTAV') + id)
          .subscribe((data: any) => {
            if (data.success) {
              this.toastr.success('Item deleted');
              this.getPrastavs();
            } else {
              this.toastr.error('Delete failed');
            }
          });
      }
    });
  }

  deleteMultiple() {
    let mode = this.settings.prastav.viewMode;
    let context = mode === 'voucher' ? 'prastav-voucher' : 'prastav-individual';
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
    }).then(async (result: any) => {
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

  async fnDeleteVoucher(voucherNo: any) {
    if (typeof voucherNo === 'string' && voucherNo.startsWith('temp_')) {
      const vGroup = this.groupedVouchers.find((v: any) => v._id === voucherNo);
      if (!vGroup) return false;
      let successCount = 0;
      for (let item of vGroup.items) {
        let res = await this.fnDeleteIndividual(item._id);
        if (res) successCount++;
      }
      return successCount > 0;
    }

    return new Promise((resolve) => {
      const url = `${this.api.getUrl('PRASTAV')}/voucher/${voucherNo}`;
      this.http.delete(url).subscribe((res: any) => {
        if (res.success) {
          // Remove all items for this voucher
          this.prastavs = this.prastavs.filter(p => p.voucher_no !== voucherNo);
          this.processData();
          resolve(true);
        } else {
          this.toastr.error('Delete failed!');
          resolve(false);
        }
      }, () => resolve(false));
    });
  }

  async fnDeleteIndividual(id: any) {
    return new Promise((resolve) => {
      this.http.delete(this.api.getUrl('PRASTAV') + id).subscribe((data: any) => {
        if (data.success) {
          const idx = this.prastavs.findIndex(p => p._id === id);
          if (idx !== -1) {
            this.prastavs.splice(idx, 1);
            this.processData();
          }
          resolve(true);
        } else {
          this.toastr.error('Delete failed');
          resolve(false);
        }
      }, () => resolve(false));
    });
  }

  onRejectVoucherToggle(v: any, event: any) {
    const isChecked = event.target.checked;
    
    if (isChecked) {
      Swal.fire({
        title: 'Reject Prastav',
        text: 'Please enter the reason for rejection:',
        input: 'text',
        inputPlaceholder: 'Reject reason...',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Reject',
        inputValidator: (value: any) => {
          if (!value) {
            return 'You need to provide a reason!';
          }
          return null;
        }
      }).then((result: any) => {
        if (result.isConfirmed) {
          v.is_rejected = 1;
          v.reject_reason = result.value;
          this.updateVoucherReject(v);
        } else {
          v.is_rejected = 0;
          event.target.checked = false;
        }
      });
    } else {
      v.is_rejected = 0;
      v.reject_reason = null;
      this.updateVoucherReject(v);
    }
  }

  updateVoucherReject(v: any) {
    const payload = {
      voucher_no: v.voucher_no,
      is_rejected: v.is_rejected,
      reject_reason: v.reject_reason
    };
    this.http.post(this.api.getUrl('PRASTAV') + 'reject-voucher', payload).subscribe((res: any) => {
      if (res.success) {
        this.toastr.success(`Prastav ${v.is_rejected ? 'Rejected' : 'Restored'}`);
      } else {
        this.toastr.error('Update failed');
        this.getPrastavs();
      }
    }, err => {
      this.toastr.error('Update failed');
      this.getPrastavs();
    });
  }

  // Cycle: PND(0) -> inTransit(2) -> RCV(1) -> PND(0)
  toggleStatus(jawak: any) {
    if (!jawak) return;

    // Determine next state
    let nextState: number;
    if (jawak.is_received === 0 || jawak.is_received === null || jawak.is_received === undefined) {
      nextState = 2; // PND -> inTransit
    } else if (jawak.is_received === 2) {
      nextState = 1; // inTransit -> RCV
    } else {
      nextState = 0; // RCV -> PND
    }

    if (nextState === 2) {
      // inTransit: MM select karna hai
      this.setInTransit(jawak);
    } else {
      const originalStatus = jawak.is_received;
      const originalPlace = jawak.current_place;
      const originalPlaceObj = jawak.place;
      jawak.is_received = nextState;
      if (nextState !== 2) {
        jawak.current_place = null;
        jawak.place = null;
      }

      const statusLabel = nextState === 1 ? 'RCV' : 'PND';
      this.http.post(this.api.getUrl('PRASTAV') + 'jawak', {
        _id: jawak._id,
        is_received: nextState,
        current_place: null
      }).subscribe((res: any) => {
        if (res.success) {
          this.toastr.success(`Status updated to ${statusLabel}`);
        } else {
          jawak.is_received = originalStatus;
          jawak.current_place = originalPlace;
          jawak.place = originalPlaceObj;
          this.toastr.error('Status update failed');
        }
      }, (err: any) => {
        jawak.is_received = originalStatus;
        jawak.current_place = originalPlace;
        jawak.place = originalPlaceObj;
        this.toastr.error('Status update failed');
      });
    }
  }

  setInTransit(jawak: any) {
    // Determine colors based on active theme
    const isDark = this.auth.webUser?.settings?.darkMode;
    const isAmoled = this.auth.webUser?.settings?.amoledMode;
    const bgColor = isAmoled ? '#000000' : (isDark ? '#2b3035' : '#ffffff');
    const textColor = isDark ? '#ffffff' : '#333333';
    const inputBgColor = isDark ? (isAmoled ? '#111111' : '#22272b') : '#ffffff';
    const borderColor = isDark ? '#495057' : '#ced4da';

    // MM options list
    const mmOptions = this.mms.map((m: any) => `<option value="${m._id}">${m.mm_hin}${m.mm_eng ? ' : ' + m.mm_eng : ''}</option>`).join('');
    Swal.fire({
      title: 'In Transit - MM Select करें',
      html: `<div class="text-start">
        <label class="form-label fw-semibold mb-1" style="color: ${textColor}">Current Place (MM)</label>
        <select id="swal-mm-select" class="form-select shadow-none" style="background-color: ${inputBgColor}; color: ${textColor}; border-color: ${borderColor}">
          <option value="">-- MM चुनें --</option>
          ${mmOptions}
        </select>
      </div>`,
      background: bgColor,
      color: textColor,
      showCancelButton: true,
      confirmButtonText: 'Set inTransit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0dcaf0',
      preConfirm: () => {
        const val = (document.getElementById('swal-mm-select') as HTMLSelectElement)?.value;
        if (!val) {
          Swal.showValidationMessage('MM select करना जरूरी है!');
          return false;
        }
        return val;
      }
    }).then((result: any) => {
      if (result.isConfirmed && result.value) {
        const mmId = Number(result.value);
        const selectedMm = this.mms.find((m: any) => m._id === mmId);
        const originalStatus = jawak.is_received;
        const originalPlace = jawak.current_place;
        const originalPlaceObj = jawak.place;

        jawak.is_received = 2;
        jawak.current_place = mmId;
        jawak.place = selectedMm ? { mm_hin: selectedMm.mm_hin, mm_eng: selectedMm.mm_eng } : null;

        this.http.post(this.api.getUrl('PRASTAV') + 'jawak', {
          _id: jawak._id,
          is_received: 2,
          current_place: mmId
        }).subscribe((res: any) => {
          if (res.success) {
            this.toastr.success(`inTransit set - ${selectedMm?.mm_hin || ''}`);
          } else {
            jawak.is_received = originalStatus;
            jawak.current_place = originalPlace;
            jawak.place = originalPlaceObj;
            this.toastr.error('Status update failed');
          }
        }, (err: any) => {
          jawak.is_received = originalStatus;
          jawak.current_place = originalPlace;
          jawak.place = originalPlaceObj;
          this.toastr.error('Status update failed');
        });
      }
    });
  }

  toggleAllJawakStatus(v: any) {
    const jawaks = v.vRows.map((vr: any) => vr.jawak).filter((j: any) => j !== null);
    if (jawaks.length === 0) return;

    // Check if all are currently received (is_received === 1)
    const allReceived = jawaks.every((j: any) => j.is_received === 1 || j.is_received === true);
    const targetStatus = allReceived ? 0 : 1;

    // Save original statuses in case of failure/rollback
    const originalStatuses = jawaks.map((j: any) => ({ jawak: j, status: j.is_received, place: j.current_place, placeObj: j.place }));

    // Optimistic UI update
    jawaks.forEach((j: any) => {
      j.is_received = targetStatus;
      // toggleAll only goes to 0 or 1, so always clear place
      j.current_place = null;
      j.place = null;
    });

    // Call update API for each jawak in parallel
    const requests = jawaks.map((j: any) => {
      return this.http.post(this.api.getUrl('PRASTAV') + 'jawak', {
        _id: j._id,
        is_received: targetStatus,
        current_place: null
      });
    });

    forkJoin(requests).subscribe(
      (responses: any) => {
        const allSuccess = responses.every((res: any) => res && res.success);
        if (allSuccess) {
          this.toastr.success(`Status of all items updated to ${targetStatus ? 'RCV' : 'PND'}`);
        } else {
          originalStatuses.forEach((item: any) => { item.jawak.is_received = item.status; item.jawak.current_place = item.place; item.jawak.place = item.placeObj; });
          this.toastr.error('Some status updates failed');
        }
      },
      (err: any) => {
        originalStatuses.forEach((item: any) => { item.jawak.is_received = item.status; item.jawak.current_place = item.place; item.jawak.place = item.placeObj; });
        this.toastr.error('Status update failed');
      }
    );
  }

  isAllJawakReceived(v: any): boolean {
    const jawaks = v.vRows.map((vr: any) => vr.jawak).filter((j: any) => j !== null);
    if (jawaks.length === 0) return false;
    return jawaks.every((j: any) => j.is_received === 1 || j.is_received === true);
  }

  hasJawaks(v: any): boolean {
    return v.vRows.some((vr: any) => vr.jawak !== null);
  }
}
