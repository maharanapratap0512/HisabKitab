import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.scss']
})
export class VehicleComponent implements OnInit {

  page: number = 1;
  itemsPerPage: number = 25;
  isLoader: boolean = false;
  term: string = '';
  showModal: string = '';
  editData: any = {};
  mode: string = '';

  // Master and filtered vehicle data
  vehData: any[] = [];
  vehDataAll: any[] = [];
  mms: any[] = [];
  total_count: number = 0;
  settings: any = {};

  // Status Filter Pill & Selectors
  activeStatusFilter: string = 'all'; // 'all' | 'expired' | 'critical' | 'upcoming' | 'valid' | 'rc_due' | 'ins_due' | 'puc_due'
  selectedMM: any = null;
  selectedFuel: string = '';
  selectedType: string = '';

  // Dashboard KPI Metrics
  expiredCount: number = 0;
  criticalCount: number = 0;
  upcomingCount: number = 0;
  compliantCount: number = 0;
  projectedExpense: number = 0;
  isAlertDismissed: boolean = false;

  // Filter Dropdowns
  vehicleTypes: string[] = [];
  fuelTypes: string[] = ['PETROL', 'DIESEL', 'CNG', 'PETROL+CNG', 'ELECTRIC'];

  // Quick Renew Modal State (Multi-card: 'all' | 'rc' | 'insurance' | 'puc')
  quickRenewVehicle: any = null;
  activeRenewCard: 'all' | 'rc' | 'insurance' | 'puc' = 'all';
  renewForm: any = {
    rc_date: '',
    rc_exp_date: '',
    rc_amount: null,
    insurance_date: '',
    insurance_exp_date: '',
    insurance_amount: null,
    insurance_type: '',
    insurance_company: '',
    puc_date: '',
    puc_exp_date: '',
    puc_amount: null
  };
  renewSaving: boolean = false;

  // Document Renewal History Modal State
  historyVehicle: any = null;
  documentHistory: any[] = [];
  historyLoader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getvehData();
    this.gs.observeList().subscribe({
      next: (result: any) => {
        this.mms = result && result.mm ? result.mm : [];
      },
      error: (err: any) => {
        this.toastr.error('Failed to load MM support list');
      }
    });
    this.settings = this.auth.webUser ? this.auth.webUser.settings : {};
    this.auth.settingsUpdated$.subscribe((s: any) => {
      this.settings = s || {};
    });
  }

  openModal(type: string, mode: string = '') {
    this.showModal = type;
    this.mode = mode;
    $('#showModal').modal('show');
  }

  getvehData() {
    this.isLoader = true;
    const deptId = this.auth.webUser ? this.auth.webUser.dept_id : 1;
    this.http.get(this.api.getUrl('VEHICLE') + deptId).subscribe({
      next: (data: any) => {
        this.isLoader = false;
        this.spinner.hide();
        if (data && data.success && data.result) {
          this.vehDataAll = data.result;
          this.total_count = data.total_count || this.vehDataAll.length;
          this.calculateMetrics();
          this.applyFilters();
        } else {
          this.toastr.error(data?.message || 'Failed to retrieve vehicle fleet data.');
        }
      },
      error: (err: any) => {
        this.isLoader = false;
        this.spinner.hide();
        this.toastr.error(err?.error?.message || err?.message || 'Network error fetching vehicles.');
      }
    });
  }

  calculateMetrics() {
    let expCount = 0;
    let critCount = 0;
    let upCount = 0;
    let compCount = 0;
    let expense = 0;
    const typeSet = new Set<string>();

    for (const v of this.vehDataAll) {
      if (v.vehicle_type) {
        typeSet.add(v.vehicle_type.trim());
      }

      const rc = this.getDocBadge('rc', v);
      const ins = this.getDocBadge('insurance', v);
      const puc = this.getDocBadge('puc', v);

      const hasExpired = rc.state === 'expired' || ins.state === 'expired' || puc.state === 'expired';
      const hasCritical = rc.state === 'critical' || ins.state === 'critical' || puc.state === 'critical';
      const hasUpcoming = rc.state === 'upcoming' || ins.state === 'upcoming' || puc.state === 'upcoming';

      if (hasExpired) {
        expCount++;
      } else if (hasCritical) {
        critCount++;
      } else if (hasUpcoming) {
        upCount++;
      } else {
        compCount++;
      }

      if (rc.state === 'expired' || rc.state === 'critical' || rc.state === 'upcoming') {
        expense += Number(v.rc_amount) || 0;
      }
      if (ins.state === 'expired' || ins.state === 'critical' || ins.state === 'upcoming') {
        expense += Number(v.insurance_amount) || 0;
      }
      if (puc.state === 'expired' || puc.state === 'critical' || puc.state === 'upcoming') {
        expense += Number(v.puc_amount) || 0;
      }
    }

    this.expiredCount = expCount;
    this.criticalCount = critCount;
    this.upcomingCount = upCount;
    this.compliantCount = compCount;
    this.projectedExpense = expense;
    this.vehicleTypes = Array.from(typeSet).sort();
  }

  applyFilters() {
    let list = [...this.vehDataAll];

    if (this.activeStatusFilter === 'expired') {
      list = list.filter(v =>
        this.getDocBadge('rc', v).state === 'expired' ||
        this.getDocBadge('insurance', v).state === 'expired' ||
        this.getDocBadge('puc', v).state === 'expired'
      );
    } else if (this.activeStatusFilter === 'critical') {
      list = list.filter(v => {
        const rc = this.getDocBadge('rc', v).state;
        const ins = this.getDocBadge('insurance', v).state;
        const puc = this.getDocBadge('puc', v).state;
        const hasExp = rc === 'expired' || ins === 'expired' || puc === 'expired';
        return !hasExp && (rc === 'critical' || ins === 'critical' || puc === 'critical');
      });
    } else if (this.activeStatusFilter === 'upcoming') {
      list = list.filter(v => {
        const rc = this.getDocBadge('rc', v).state;
        const ins = this.getDocBadge('insurance', v).state;
        const puc = this.getDocBadge('puc', v).state;
        return rc === 'upcoming' || ins === 'upcoming' || puc === 'upcoming';
      });
    } else if (this.activeStatusFilter === 'valid') {
      list = list.filter(v => {
        const rc = this.getDocBadge('rc', v).state;
        const ins = this.getDocBadge('insurance', v).state;
        const puc = this.getDocBadge('puc', v).state;
        return rc === 'valid' && ins === 'valid' && puc === 'valid';
      });
    } else if (this.activeStatusFilter === 'rc_due') {
      list = list.filter(v => {
        const s = this.getDocBadge('rc', v).state;
        return s === 'expired' || s === 'critical' || s === 'upcoming';
      });
    } else if (this.activeStatusFilter === 'ins_due') {
      list = list.filter(v => {
        const s = this.getDocBadge('insurance', v).state;
        return s === 'expired' || s === 'critical' || s === 'upcoming';
      });
    } else if (this.activeStatusFilter === 'puc_due') {
      list = list.filter(v => {
        const s = this.getDocBadge('puc', v).state;
        return s === 'expired' || s === 'critical' || s === 'upcoming';
      });
    }

    if (this.selectedMM) {
      list = list.filter(v => v.mm_id == this.selectedMM);
    }

    if (this.selectedFuel) {
      list = list.filter(v => (v.fuel_type || '').toUpperCase() === this.selectedFuel.toUpperCase());
    }

    if (this.selectedType) {
      list = list.filter(v => (v.vehicle_type || '').toUpperCase() === this.selectedType.toUpperCase());
    }

    if (this.term && this.term.trim()) {
      const q = this.term.toLowerCase().trim();
      list = list.filter(v =>
        (v.gadi_num && v.gadi_num.toLowerCase().includes(q)) ||
        (v.gadi_name && v.gadi_name.toLowerCase().includes(q)) ||
        (v.owner_name && v.owner_name.toLowerCase().includes(q)) ||
        (v.nominee && v.nominee.toLowerCase().includes(q)) ||
        (v.vehicle_type && v.vehicle_type.toLowerCase().includes(q)) ||
        (v.insurance_company && v.insurance_company.toLowerCase().includes(q)) ||
        (v.mm_hin && v.mm_hin.toLowerCase().includes(q)) ||
        (v.mm_eng && v.mm_eng.toLowerCase().includes(q)) ||
        (v.mm_code && v.mm_code.toString().toLowerCase().includes(q))
      );
    }

    this.vehData = list;
    this.page = 1;
  }

  setStatusFilter(status: string) {
    this.activeStatusFilter = status;
    this.applyFilters();
    this.gs.smoothScrollTo('#vehicleTableSection', 80);
  }

  resetFilters() {
    this.activeStatusFilter = 'all';
    this.selectedMM = null;
    this.selectedFuel = '';
    this.selectedType = '';
    this.term = '';
    this.applyFilters();
  }

  mmSelected(ev: any) {
    this.selectedMM = ev;
    this.applyFilters();
  }

  getDocBadge(type: 'rc' | 'insurance' | 'puc', v: any): { text: string; class: string; icon: string; days: number | null; state: string } {
    const expDate = v[type + '_exp_date'];
    if (!expDate) {
      return { text: 'Not Recorded', class: 'badge bg-soft-secondary text-muted', icon: 'uil-minus-circle', days: null, state: 'none' };
    }

    const now = Date.now();
    const diffMs = expDate - now;
    const days = Math.ceil(diffMs / 86400000);

    if (diffMs < 0) {
      return {
        text: `Expired (${Math.abs(days)}d ago)`,
        class: 'badge bg-soft-danger text-danger fw-bold',
        icon: 'uil-exclamation-triangle',
        days,
        state: 'expired'
      };
    } else if (diffMs <= 7 * 86400000) {
      return {
        text: days === 0 ? 'Expires Today' : `${days}d left`,
        class: 'badge bg-soft-warning text-warning fw-bold',
        icon: 'uil-clock-eight',
        days,
        state: 'critical'
      };
    } else if (diffMs <= 30 * 86400000) {
      return {
        text: `${days}d left`,
        class: 'badge bg-soft-info text-info fw-semibold',
        icon: 'uil-calendar-alt',
        days,
        state: 'upcoming'
      };
    } else {
      return {
        text: 'Valid',
        class: 'badge bg-soft-success text-success fw-normal',
        icon: 'uil-check-circle',
        days,
        state: 'valid'
      };
    }
  }

  formatInputDate(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Opens the Full-Screen (98% Width) Renewal Modal.
   * If clicked from Manage cell -> cardView = 'all' (All 3 Cards shown)
   * If clicked from RC cell -> cardView = 'rc' (RC Card shown, others hidden)
   * If clicked from Insurance cell -> cardView = 'insurance' (Insurance Card shown, others hidden)
   * If clicked from PUC cell -> cardView = 'puc' (PUC Card shown, others hidden)
   */
  openQuickRenew(vehicle: any, cardView: 'all' | 'rc' | 'insurance' | 'puc' = 'all') {
    this.quickRenewVehicle = vehicle;
    this.activeRenewCard = cardView;

    const todayStr = this.formatInputDate(new Date());

    this.renewForm = {
      // RC
      rc_date: vehicle.rc_date ? this.formatInputDate(vehicle.rc_date) : todayStr,
      rc_exp_date: vehicle.rc_exp_date ? this.formatInputDate(vehicle.rc_exp_date) : '',
      rc_amount: vehicle.rc_amount !== undefined ? vehicle.rc_amount : null,

      // Insurance
      insurance_date: vehicle.insurance_date ? this.formatInputDate(vehicle.insurance_date) : todayStr,
      insurance_exp_date: vehicle.insurance_exp_date ? this.formatInputDate(vehicle.insurance_exp_date) : '',
      insurance_amount: vehicle.insurance_amount !== undefined ? vehicle.insurance_amount : null,
      insurance_company: vehicle.insurance_company || '',
      insurance_type: vehicle.insurance_type || '',

      // PUC
      puc_date: vehicle.puc_date ? this.formatInputDate(vehicle.puc_date) : todayStr,
      puc_exp_date: vehicle.puc_exp_date ? this.formatInputDate(vehicle.puc_exp_date) : '',
      puc_amount: vehicle.puc_amount !== undefined ? vehicle.puc_amount : null
    };

    $('#quickRenewModal').modal('show');
  }

  setRenewCardView(view: 'all' | 'rc' | 'insurance' | 'puc') {
    this.activeRenewCard = view;
  }

  saveQuickRenew(targetCard: string = this.activeRenewCard) {
    if (!this.quickRenewVehicle) return;

    const body: any = {
      query: { _id: this.quickRenewVehicle._id },
      set: {
        ...this.quickRenewVehicle
      }
    };

    const updateRC = targetCard === 'all' || targetCard === 'rc';
    const updateIns = targetCard === 'all' || targetCard === 'insurance';
    const updatePUC = targetCard === 'all' || targetCard === 'puc';

    let anyDateProvided = false;

    if (updateRC && this.renewForm.rc_exp_date) {
      body.set.rc_date = this.renewForm.rc_date;
      body.set.rc_exp_date = this.renewForm.rc_exp_date;
      body.set.rc_amount = this.renewForm.rc_amount;
      anyDateProvided = true;
    }

    if (updateIns && this.renewForm.insurance_exp_date) {
      body.set.insurance_date = this.renewForm.insurance_date;
      body.set.insurance_exp_date = this.renewForm.insurance_exp_date;
      body.set.insurance_amount = this.renewForm.insurance_amount;
      body.set.insurance_company = this.renewForm.insurance_company;
      body.set.insurance_type = this.renewForm.insurance_type;
      anyDateProvided = true;
    }

    if (updatePUC && this.renewForm.puc_exp_date) {
      body.set.puc_date = this.renewForm.puc_date;
      body.set.puc_exp_date = this.renewForm.puc_exp_date;
      body.set.puc_amount = this.renewForm.puc_amount;
      anyDateProvided = true;
    }

    if (!anyDateProvided) {
      this.toastr.warning('Please specify at least one valid expiry date to record renewal.');
      return;
    }

    this.renewSaving = true;
    this.http.put(this.api.getUrl('VEHICLE'), body).subscribe({
      next: (res: any) => {
        this.renewSaving = false;
        if (res && res.success && res.result) {
          const idx = this.vehDataAll.findIndex(v => v._id === this.quickRenewVehicle._id);
          if (idx !== -1) {
            this.vehDataAll[idx] = res.result;
          }
          this.calculateMetrics();
          this.applyFilters();
          $('#quickRenewModal').modal('hide');
          this.toastr.success(`Document renewal recorded successfully for ${this.quickRenewVehicle.gadi_num}!`);
        } else {
          this.toastr.error(res?.message || 'Failed to record document renewal.');
        }
      },
      error: (err: any) => {
        this.renewSaving = false;
        this.toastr.error(err?.error?.message || err?.message || 'Error saving renewal.');
      }
    });
  }

  openDocHistory(vehicle: any) {
    this.historyVehicle = vehicle;
    this.documentHistory = [];
    this.historyLoader = true;
    $('#docHistoryModal').modal('show');

    this.http.get(this.api.getUrl('VEHICLE_DOCUMENT') + 'by_vehicle/' + vehicle._id).subscribe({
      next: (res: any) => {
        this.historyLoader = false;
        if (res && res.success) {
          this.documentHistory = res.result || [];
        } else {
          this.toastr.error(res?.message || 'Could not load renewal history.');
        }
      },
      error: (err: any) => {
        this.historyLoader = false;
        this.toastr.error(err?.error?.message || err?.message || 'Error fetching renewal history.');
      }
    });
  }

  exportToExcel() {
    this.isLoader = true;
    const exportData = this.vehData.map((v: any, index: number) => {
      const rcBadge = this.getDocBadge('rc', v);
      const insBadge = this.getDocBadge('insurance', v);
      const pucBadge = this.getDocBadge('puc', v);

      return {
        'Sr No': index + 1,
        'MM': v.mm_hin ? `${v.mm_hin} : ${v.mm_eng || ''} (${v.mm_code || ''})` : '',
        'Vehicle No': v.gadi_num,
        'Vehicle Name': v.gadi_name || '',
        'Vehicle Type': v.vehicle_type || '',
        'Fuel Type': v.fuel_type || '',
        'Seating Capacity': v.seating_capacity || '',
        'Owner Name': v.owner_name || '',
        'Nominee': v.nominee || '',
        'Aawak Type': v.aawak_type || '',
        'RC Status': rcBadge.text,
        'RC Expiry': this.gs.formatDisplayDate(v.rc_exp_date),
        'RC Amount': v.rc_amount || 0,
        'Insurance Status': insBadge.text,
        'Insurance Expiry': this.gs.formatDisplayDate(v.insurance_exp_date),
        'Insurance Company': v.insurance_company || '',
        'Insurance Type': v.insurance_type || '',
        'Insurance Amount': v.insurance_amount || 0,
        'PUC Status': pucBadge.text,
        'PUC Expiry': this.gs.formatDisplayDate(v.puc_exp_date),
        'PUC Amount': v.puc_amount || 0
      };
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const dept = (this.auth.webUser && this.auth.webUser.dept_eng) ? this.auth.webUser.dept_eng : 'Department';
    const fileName = `Vehicle_Fleet_Compliance_${dept}_${dateStr}.xlsx`;

    this.excelExportService.exportStyledExcel(exportData, fileName, 'Vehicle Fleet & Document Compliance Report');
    this.isLoader = false;
    this.toastr.success('Vehicle report exported successfully.');
  }

  addVehicleResponse(ev: any) {
    if (ev && ev._id) {
      $('#showModal').modal('hide');
      this.showModal = '';
      this.vehDataAll.unshift(ev);
      this.total_count += 1;
      this.calculateMetrics();
      this.applyFilters();
      this.toastr.success('New vehicle added to fleet.');
    } else {
      this.toastr.error('Failed to add vehicle.');
    }
  }

  editVehicleResponse(ev: any) {
    if (ev && ev._id) {
      $('#showModal').modal('hide');
      this.showModal = '';
      const idx = this.vehDataAll.findIndex(v => v._id === ev._id);
      if (idx !== -1) {
        this.vehDataAll[idx] = ev;
      }
      this.calculateMetrics();
      this.applyFilters();
      this.toastr.success('Vehicle details updated successfully.');
    } else {
      this.toastr.error('Failed to update vehicle.');
    }
  }

  edit(data: any, mode: string) {
    this.editData = data;
    this.mode = mode;
    this.showModal = 'Edit Vehicle';
    $('#showModal').modal('show');
  }

  delete(data: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete vehicle ${data.gadi_num}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoader = true;
        this.http.delete(this.api.getUrl('VEHICLE') + '/' + data._id).subscribe({
          next: (res: any) => {
            this.isLoader = false;
            if (res && res.success) {
              this.vehDataAll = this.vehDataAll.filter(v => v._id !== data._id);
              this.total_count = Math.max(0, this.total_count - 1);
              this.calculateMetrics();
              this.applyFilters();
              this.toastr.success('Vehicle deleted successfully.');
            } else {
              this.toastr.error(res?.message || 'Failed to delete vehicle.');
            }
          },
          error: (err: any) => {
            this.isLoader = false;
            this.toastr.error(err?.error?.message || err?.message || 'Network error deleting vehicle.');
          }
        });
      }
    });
  }

  onImportResponse(res: any) {
    this.getvehData();
    $('#showModal').modal('hide');
    this.showModal = '';
  }
}
