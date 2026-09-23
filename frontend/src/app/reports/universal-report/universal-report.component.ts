import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { VirtualSlice } from '../../SHARED/virtual-infinite-scroll.directive';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-universal-report',
  templateUrl: './universal-report.component.html',
  styleUrls: ['./universal-report.component.scss']
})
export class UniversalReportComponent implements OnInit {

  isLoader: boolean = false;
  loadingStatus: string = 'Loading Report...';
  term: string = '';

  allSupportLists: any[] = [];
  dimensionListOptions: any[] = [];

  filterBody: any = {
    pivot_dimension: 'aawak_source',
    dimension_ids: [],
    from_year: new Date().getFullYear(),
    from_month: new Date().getMonth() + 1,
    to_year: new Date().getFullYear(),
    to_month: new Date().getMonth() + 1,
    mm_id: null,
    category_id: null,
    item_id: null,
    subitem_id: null
  };

  pivotDimensions: any[] = [
    { key: 'aawak_source', name_hin: 'आवक स्त्रोत Wise (Source)', name_eng: 'Aawak Source Wise' },
    { key: 'aawak_type', name_hin: 'आवक प्रकार Wise (Type)', name_eng: 'Aawak Type Wise' },
    { key: 'jawak_type', name_hin: 'जावक प्रकार Wise (Type)', name_eng: 'Jawak Type Wise' },
    { key: 'usage_list', name_hin: 'उपयोग सूची Wise (Usage List)', name_eng: 'Usage List Wise' },
    { key: 'condition', name_hin: 'कंडीशन Wise (Condition)', name_eng: 'Condition Wise' }
  ];

  years: number[] = [];
  monthsFrom: any[] = [];
  monthsTo: any[] = [];

  mms: any[] = [];
  categories: any[] = [];
  items: any[] = [];
  subitems: any[] = [];

  // Report Response Data
  monthsList: any[] = [];
  activeDimensions: any[] = [];
  reportRows: any[] = [];
  filteredRows: any[] = [];
  viewMode: 'monthly' | 'yearly' = 'monthly';

  // Virtual Infinite Scroll Window
  virtualSlice: VirtualSlice = { startIndex: 0, endIndex: 50, paddingTop: 0, paddingBottom: 0 };

  onVirtualSliceChange(slice: VirtualSlice) {
    this.virtualSlice = slice;
  }

  get virtualReportRows(): any[] {
    if (!this.filteredRows) return [];
    return this.filteredRows.slice(this.virtualSlice.startIndex, this.virtualSlice.endIndex);
  }

  // Computed Footers
  columnTotals: any = {};

  // Pagination
  page: number = 1;
  itemsPerPage: number = 100;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.years = this.gs.years || [2023, 2024, 2025, 2026];

    this.gs.observeList().subscribe({
      next: (result) => {
        this.mms = result.mm ? result.mm : [];
        this.categories = result.category ? result.category : [];
        this.items = result.itemmix ? result.itemmix : [];

        this.filterBody.mm_id = this.auth.webUser?.settings?.defaultMM ? [this.auth.webUser.settings.defaultMM] : null;

        this.updateMonthsFrom(this.filterBody.from_year);
        this.updateMonthsTo(this.filterBody.to_year);

        this.loadSupportLists();

        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error('Failed to load initial master lists');
      }
    });
  }

  loadSupportLists(): void {
    const deptId = this.auth.webUser?.dept_id;
    if (!deptId) return;
    this.http.get(this.api.getUrl('SPLIST') + deptId).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.allSupportLists = res.result || [];
          this.onPivotDimensionChange();
        }
      },
      error: (err: any) => {
        console.error('Failed to load support lists:', err);
      }
    });
  }

  onPivotDimensionChange(): void {
    const key = this.filterBody.pivot_dimension;
    this.dimensionListOptions = this.allSupportLists.filter((item: any) => item.list_type === key);
    this.filterBody.dimension_ids = [];
  }

  updateMonthsFrom(year: number) {
    if (!year) return;
    this.monthsFrom = this.gs.yearChangedGetMonth(year);
  }

  updateMonthsTo(year: number) {
    if (!year) return;
    this.monthsTo = this.gs.yearChangedGetMonth(year);
  }

  onFromYearChange(ev: any) {
    this.updateMonthsFrom(ev);
    if (!this.filterBody.to_year || this.filterBody.to_year < ev) {
      this.filterBody.to_year = ev;
      this.updateMonthsTo(ev);
    }
  }

  catSelected(catId: any) {
    if (catId) {
      this.items = this.gs.Lists.itemmix.filter((i: any) => i.categories && i.categories.some((c: any) => c._id == catId));
    } else {
      this.items = this.gs.Lists.itemmix;
    }
    this.filterBody.item_id = null;
    this.filterBody.subitem_id = null;
    this.subitems = [];
  }

  itemSelected(itemId: any) {
    if (itemId) {
      const selectedItem = this.items.find((i: any) => i._id == itemId);
      this.subitems = selectedItem && selectedItem.subitems ? selectedItem.subitems : [];
    } else {
      this.subitems = [];
    }
    this.filterBody.subitem_id = null;
  }

  generateReport(): void {
    if (!this.filterBody.from_year || !this.filterBody.from_month) {
      this.toastr.error('Please select From Year and Month');
      return;
    }

    if (!this.filterBody.to_year || !this.filterBody.to_month) {
      this.filterBody.to_year = this.filterBody.from_year;
      this.filterBody.to_month = this.filterBody.from_month;
    }

    this.isLoader = true;
    this.spinner.show();
    this.loadingStatus = 'Fetching Universal Matrix Report...';

    const deptId = this.auth.webUser?.dept_id;

    const payload = {
      pivot_dimension: this.filterBody.pivot_dimension,
      dimension_ids: this.filterBody.dimension_ids || [],
      from_year: parseInt(this.filterBody.from_year),
      from_month: parseInt(this.filterBody.from_month),
      to_year: parseInt(this.filterBody.to_year),
      to_month: parseInt(this.filterBody.to_month),
      mm_id: this.filterBody.mm_id,
      category_id: this.filterBody.category_id,
      item_id: this.filterBody.item_id ? [this.filterBody.item_id] : null,
      subitem_id: this.filterBody.subitem_id ? [this.filterBody.subitem_id] : null,
      item_subitem_ids: this.filterBody.item_subitem_ids || []
    };

    this.http.put(this.api.getUrl('UNIVERSAL_REPORT') + 'filter/' + deptId, payload).subscribe({
      next: (res: any) => {
        this.isLoader = false;
        this.spinner.hide();

        if (res && res.success) {
          this.monthsList = res.months || [];
          this.activeDimensions = res.dimensions || [];
          this.reportRows = res.rows || [];
          this.viewMode = res.view_mode || (this.monthsList.length === 1 ? 'monthly' : 'yearly');

          this.applySearchFilter();
          this.gs.smoothScrollTo('#universalReportResultsSection');
        } else {
          this.toastr.error(res?.message || 'Failed to fetch universal report data');
        }
      },
      error: (err: any) => {
        this.isLoader = false;
        this.spinner.hide();
        console.error('API Error in Universal Report:', err);
        this.toastr.error('Error connecting to server. Please try again.');
      }
    });
  }

  // Back to Top button state
  showBackToTop: boolean = false;
  hideZeroRows: boolean = false;

  onTableScroll(event: any): void {
    const scrollTop = event?.target?.scrollTop || 0;
    this.showBackToTop = scrollTop > 250;
  }

  scrollToTop(): void {
    const container = document.querySelector('.universal-matrix-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  applySearchFilter(): void {
    this.page = 1;
    let rows = [...this.reportRows];

    if (this.hideZeroRows) {
      rows = rows.filter((r: any) => {
        const pastTotal = Math.abs(r.past_bachat?.total || 0);
        const finalTotal = Math.abs(r.grand_total?.final_bachat || 0);

        if (pastTotal > 0.0001 || finalTotal > 0.0001) return true;

        if (r.past_bachat?.dims && Object.values(r.past_bachat.dims).some((v: any) => Math.abs(Number(v) || 0) > 0.0001)) {
          return true;
        }

        if (r.months) {
          for (const mKey of Object.keys(r.months)) {
            const m = r.months[mKey];
            if (Math.abs(m.total_aawak || 0) > 0.0001 || Math.abs(m.total_jawak || 0) > 0.0001 || Math.abs(m.net_bachat || 0) > 0.0001) {
              return true;
            }
            if (m.dims && Object.values(m.dims).some((d: any) => Math.abs((d as any).aawak || 0) > 0.0001 || Math.abs((d as any).jawak || 0) > 0.0001 || Math.abs((d as any).bachat || 0) > 0.0001)) {
              return true;
            }
          }
        }

        return false;
      });
    }

    if (!this.term || this.term.trim() === '') {
      this.filteredRows = rows;
    } else {
      const q = this.term.toLowerCase().trim();
      this.filteredRows = rows.filter((r: any) =>
        (r.category_hin && r.category_hin.toLowerCase().includes(q)) ||
        (r.category_eng && r.category_eng.toLowerCase().includes(q)) ||
        (r.item_hin && r.item_hin.toLowerCase().includes(q)) ||
        (r.item_eng && r.item_eng.toLowerCase().includes(q)) ||
        (r.item_roman && r.item_roman.toLowerCase().includes(q)) ||
        (r.subitem_hin && r.subitem_hin.toLowerCase().includes(q)) ||
        (r.subitem_eng && r.subitem_eng.toLowerCase().includes(q)) ||
        (r.subitem_roman && r.subitem_roman.toLowerCase().includes(q)) ||
        (r.mm_hin && r.mm_hin.toLowerCase().includes(q)) ||
        (r.mm_eng && r.mm_eng.toLowerCase().includes(q)) ||
        (r.state_hin && r.state_hin.toLowerCase().includes(q)) ||
        (r.unit_short && r.unit_short.toLowerCase().includes(q))
      );
    }
    this.calculateTotals();
  }

  calculateTotals(): void {
    const totals: any = {
      past_bachat: {
        total: 0,
        dims: {}
      },
      months: {},
      grand_total: {
        total_aawak: 0,
        total_jawak: 0,
        final_bachat: 0,
        dims: {}
      }
    };

    // Initialize past_bachat dims
    this.activeDimensions.forEach((d: any) => {
      totals.past_bachat.dims[d._id] = 0;
    });

    // Initialize months total structures
    this.monthsList.forEach((m: any) => {
      totals.months[m.key] = {
        total_aawak: 0,
        total_jawak: 0,
        net_bachat: 0,
        dims: {}
      };
      this.activeDimensions.forEach((d: any) => {
        totals.months[m.key].dims[d._id] = { aawak: 0, jawak: 0, bachat: 0 };
      });
    });

    // Initialize grand total dims
    this.activeDimensions.forEach((d: any) => {
      totals.grand_total.dims[d._id] = { aawak: 0, jawak: 0, bachat: 0 };
    });

    // Fast summation loop over ALL report rows (totals remain unaffected by hide 0 display filter)
    const r2 = (v: number) => Math.round((v || 0) * 100) / 100;

    this.reportRows.forEach((row: any) => {
      if (row.past_bachat) {
        totals.past_bachat.total = r2(totals.past_bachat.total + (row.past_bachat.total || 0));
        this.activeDimensions.forEach((d: any) => {
          const dimId = d._id;
          totals.past_bachat.dims[dimId] = r2(totals.past_bachat.dims[dimId] + (row.past_bachat.dims ? (row.past_bachat.dims[dimId] || 0) : 0));
        });
      }

      this.monthsList.forEach((m: any) => {
        const mKey = m.key;
        const mData = row.months ? row.months[mKey] : null;

        if (mData) {
          totals.months[mKey].total_aawak = r2(totals.months[mKey].total_aawak + (mData.total_aawak || 0));
          totals.months[mKey].total_jawak = r2(totals.months[mKey].total_jawak + (mData.total_jawak || 0));
          totals.months[mKey].net_bachat = r2(totals.months[mKey].net_bachat + (mData.net_bachat || 0));

          this.activeDimensions.forEach((d: any) => {
            const dimId = d._id;
            const dimData = mData.dims ? mData.dims[dimId] : null;
            if (dimData) {
              totals.months[mKey].dims[dimId].aawak = r2(totals.months[mKey].dims[dimId].aawak + (dimData.aawak || 0));
              totals.months[mKey].dims[dimId].jawak = r2(totals.months[mKey].dims[dimId].jawak + (dimData.jawak || 0));
              totals.months[mKey].dims[dimId].bachat = r2(totals.months[mKey].dims[dimId].bachat + (dimData.bachat || 0));
            }
          });
        }
      });

      if (row.grand_total) {
        totals.grand_total.total_aawak = r2(totals.grand_total.total_aawak + (row.grand_total.total_aawak || 0));
        totals.grand_total.total_jawak = r2(totals.grand_total.total_jawak + (row.grand_total.total_jawak || 0));
        totals.grand_total.final_bachat = r2(totals.grand_total.final_bachat + (row.grand_total.final_bachat || 0));

        this.activeDimensions.forEach((d: any) => {
          const dimId = d._id;
          const gdData = row.grand_total.dims ? row.grand_total.dims[dimId] : null;
          if (gdData) {
            totals.grand_total.dims[dimId].aawak = r2(totals.grand_total.dims[dimId].aawak + (gdData.aawak || 0));
            totals.grand_total.dims[dimId].jawak = r2(totals.grand_total.dims[dimId].jawak + (gdData.jawak || 0));
            totals.grand_total.dims[dimId].bachat = r2(totals.grand_total.dims[dimId].bachat + (gdData.bachat || 0));
          }
        });
      }
    });

    this.columnTotals = totals;
  }

  getPivotDimensionLabel(): string {
    const dim = this.pivotDimensions.find(p => p.key === this.filterBody.pivot_dimension);
    return dim ? dim.name_hin : 'Breakdown';
  }

  // --- EXCEL EXPORT (Multi-Level Matrix ExcelJS) ---
  async exportToExcel(): Promise<void> {
    if (this.filteredRows.length === 0) {
      this.toastr.warning('No data to export');
      return;
    }

    this.spinner.show();
    this.loadingStatus = 'Generating Styled Excel File...';

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Universal Report');

    const dimLabel = this.getPivotDimensionLabel();
    const modeLabel = this.viewMode === 'monthly' ? 'Monthly Report' : 'Yearly Report';

    // Map column metadata array to accurately track column types & alternate month shading
    const colMetas: Array<{
      type: 'fixed' | 'past' | 'month' | 'grand';
      mIdx?: number;
      isAltMonth?: boolean;
      isMonthEnd?: boolean;
      isHighlight?: boolean;
    }> = [];

    // 1-6: Fixed Info Columns (No., MM, Category, Item Name, Subitem, Unit)
    for (let i = 0; i < 6; i++) {
      colMetas.push({ type: 'fixed' });
    }

    // Past Bachat Columns
    for (let j = 0; j < this.activeDimensions.length; j++) {
      colMetas.push({ type: 'past' });
    }
    colMetas.push({ type: 'past', isMonthEnd: true, isHighlight: true }); // Total Past Bachat

    // Month Columns
    this.monthsList.forEach((m: any, mIdx: number) => {
      const isAlt = mIdx % 2 === 1;
      this.activeDimensions.forEach((d: any, dIdx: number) => {
        colMetas.push({
          type: 'month',
          mIdx,
          isAltMonth: isAlt,
          isMonthEnd: dIdx === this.activeDimensions.length - 1
        });
      });

      if (this.monthsList.length <= 1) {
        colMetas.push({
          type: 'month',
          mIdx,
          isAltMonth: isAlt,
          isMonthEnd: true,
          isHighlight: true
        });
      }
    });

    // Multi-month Grand Total Columns
    if (this.monthsList.length > 1) {
      this.activeDimensions.forEach((d: any) => {
        colMetas.push({ type: 'grand' });
      });
      colMetas.push({ type: 'grand', isHighlight: true });
    }

    const totalCols = colMetas.length;

    // Title Row (Row 1)
    const titleRow = worksheet.addRow([`HisabKitab Universal Report (${dimLabel} - ${modeLabel})`]);
    titleRow.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1F4E79' } };
    worksheet.mergeCells(1, 1, 1, totalCols);

    // Subtitle Row (Row 2)
    const subTitleRow = worksheet.addRow([`Dept: ${this.auth.webUser?.dept_hin || '-'} | Period: ${this.filterBody.from_month}/${this.filterBody.from_year} to ${this.filterBody.to_month}/${this.filterBody.to_year}`]);
    subTitleRow.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF555555' } };
    worksheet.mergeCells(2, 1, 2, totalCols);

    worksheet.addRow([]); // Blank row 3

    // Build Header Rows (Rows 4 & 5)
    const headerRow1 = ['No.', 'MM / Location', 'Category', 'Item Name', 'Subitem', 'Unit'];
    const headerRow2 = ['', '', '', '', '', ''];

    // Past Bachat Headers
    this.activeDimensions.forEach((d: any) => {
      headerRow1.push('Past Bachat');
      headerRow2.push(d.list_name_hin);
    });
    headerRow1.push('Past Bachat');
    headerRow2.push('Total Past Bachat');

    // Month Headers
    this.monthsList.forEach((m: any) => {
      this.activeDimensions.forEach((d: any) => {
        headerRow1.push(`${m.name_hin} (${m.name_eng})`);
        headerRow2.push(d.list_name_hin);
      });

      if (this.monthsList.length <= 1) {
        headerRow1.push(`${m.name_hin} (${m.name_eng})`);
        headerRow2.push('अंतिम कुल बचत');
      }
    });

    // Grand Total Headers
    if (this.monthsList.length > 1) {
      this.activeDimensions.forEach((d: any) => {
        headerRow1.push('Final Period Total');
        headerRow2.push(`${d.list_name_hin} (Final)`);
      });

      headerRow1.push('Period Grand Total');
      headerRow2.push('अंतिम कुल बचत');
    }

    const h1 = worksheet.addRow(headerRow1);
    const h2 = worksheet.addRow(headerRow2);

    // Style Header Rows (h1 & h2) cell by cell based on column metadata
    [h1, h2].forEach((row, rIdx) => {
      row.font = { name: 'Arial', size: 10, bold: true };
      row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      row.eachCell((cell, colIdx) => {
        const cMeta = colMetas[colIdx - 1];
        if (!cMeta) return;

        let bgHex = 'FF1E293B'; // Dark Slate default
        let fontHex = 'FFFFFFFF';

        if (cMeta.type === 'fixed') {
          bgHex = 'FF1E293B';
          fontHex = 'FFFFFFFF';
        } else if (cMeta.type === 'past') {
          bgHex = 'FF334155';
          fontHex = 'FF60A5FA';
        } else if (cMeta.type === 'month') {
          if (cMeta.isAltMonth) {
            bgHex = rIdx === 0 ? 'FF0F172A' : 'FF1E293B';
            fontHex = 'FF93C5FD';
          } else {
            bgHex = rIdx === 0 ? 'FF1E293B' : 'FF334155';
            fontHex = 'FFFFFFFF';
          }
        } else if (cMeta.type === 'grand') {
          bgHex = 'FF0F172A';
          fontHex = 'FFF43F5E';
        }

        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } };
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: fontHex } };

        // Month boundary border on header cells
        const rightStyle = cMeta.isMonthEnd ? 'medium' : 'thin';
        const rightColor = cMeta.isMonthEnd ? 'FF94A3B8' : 'FF475569';
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF475569' } },
          left: { style: 'thin', color: { argb: 'FF475569' } },
          bottom: { style: 'thin', color: { argb: 'FF475569' } },
          right: { style: rightStyle, color: { argb: rightColor } }
        };
      });
    });

    // Populate Data Rows
    let rowNum = 1;
    this.filteredRows.forEach((r: any, rIdx: number) => {
      const rowVals = [
        rowNum++,
        r.mm_hin || '-',
        r.category_hin || '-',
        r.item_hin || '-',
        r.subitem_id ? r.subitem_hin : '-',
        r.unit_short || '-'
      ];

      // Past Bachat dimension values
      this.activeDimensions.forEach((d: any) => {
        const dimId = d._id;
        rowVals.push(r.past_bachat && r.past_bachat.dims ? (r.past_bachat.dims[dimId] || 0) : 0);
      });
      rowVals.push(r.past_bachat ? (r.past_bachat.total || 0) : 0);

      // Monthly values
      this.monthsList.forEach((m: any) => {
        const mKey = m.key;
        const mData = r.months ? r.months[mKey] : null;

        this.activeDimensions.forEach((d: any) => {
          const dimId = d._id;
          const dimData = (mData && mData.dims) ? mData.dims[dimId] : null;
          rowVals.push(dimData ? dimData.bachat : 0);
        });

        if (this.monthsList.length <= 1) {
          rowVals.push(r.grand_total ? r.grand_total.final_bachat : 0);
        }
      });

      // Multi-month grand total
      if (this.monthsList.length > 1) {
        this.activeDimensions.forEach((d: any) => {
          const dimId = d._id;
          const gdData = (r.grand_total && r.grand_total.dims) ? r.grand_total.dims[dimId] : null;
          rowVals.push(gdData ? gdData.bachat : 0);
        });

        rowVals.push(r.grand_total ? r.grand_total.final_bachat : 0);
      }

      const dRow = worksheet.addRow(rowVals);
      dRow.font = { name: 'Arial', size: 9 };

      dRow.eachCell((cell, colIdx) => {
        const cMeta = colMetas[colIdx - 1];
        if (!cMeta) return;

        const val = cell.value;
        const isNum = typeof val === 'number';

        if (isNum) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '#,##0.00;[Red]-#,##0.00;"-"';
        } else {
          cell.alignment = { vertical: 'middle', horizontal: colIdx === 1 || colIdx === 6 ? 'center' : 'left' };
        }

        // Determine Cell Fill & Text Styling
        let cellBgHex = (rIdx % 2 === 1) ? 'FFF8FAFC' : 'FFFFFFFF'; // Alternating row default
        let isNegative = isNum && (val as number) < 0;

        if (cMeta.isAltMonth) {
          cellBgHex = 'FFEBF3FE'; // Crisp Light Blue Tint for Alternate Months
        } else if (cMeta.isHighlight) {
          cellBgHex = 'FFF1F5F9'; // Soft slate highlight for summary cols
        }

        if (isNegative) {
          cellBgHex = 'FFFEE2E2'; // Soft Red Tint for Negative Balances
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFDC2626' } };
        } else if (cMeta.isHighlight) {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
        }

        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellBgHex } };

        // Borders
        const rightStyle = cMeta.isMonthEnd ? 'medium' : 'thin';
        const rightColor = cMeta.isMonthEnd ? 'FF94A3B8' : 'FFE2E8F0';
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: rightStyle, color: { argb: rightColor } }
        };
      });
    });

    // Footer Total Summary Row
    const footerVals = ['*', 'Total Summary', '', '', '', ''];

    // Past Bachat footer totals
    this.activeDimensions.forEach((d: any) => {
      const dimId = d._id;
      footerVals.push(this.columnTotals.past_bachat && this.columnTotals.past_bachat.dims ? (this.columnTotals.past_bachat.dims[dimId] || 0) : 0);
    });
    footerVals.push(this.columnTotals.past_bachat ? (this.columnTotals.past_bachat.total || 0) : 0);

    // Monthly footer totals
    this.monthsList.forEach((m: any) => {
      const mKey = m.key;
      const mTotals = this.columnTotals.months ? this.columnTotals.months[mKey] : null;

      this.activeDimensions.forEach((d: any) => {
        const dimId = d._id;
        const dimTot = (mTotals && mTotals.dims) ? mTotals.dims[dimId] : null;
        footerVals.push(dimTot ? dimTot.bachat : 0);
      });

      if (this.monthsList.length <= 1) {
        footerVals.push(this.columnTotals.grand_total ? this.columnTotals.grand_total.final_bachat : 0);
      }
    });

    // Grand total footer
    if (this.monthsList.length > 1) {
      this.activeDimensions.forEach((d: any) => {
        const dimId = d._id;
        const gdTot = (this.columnTotals.grand_total && this.columnTotals.grand_total.dims) ? this.columnTotals.grand_total.dims[dimId] : null;
        footerVals.push(gdTot ? gdTot.bachat : 0);
      });

      footerVals.push(this.columnTotals.grand_total ? this.columnTotals.grand_total.final_bachat : 0);
    }

    const footRow = worksheet.addRow(footerVals);
    footRow.font = { name: 'Arial', size: 10, bold: true };

    footRow.eachCell((cell, colIdx) => {
      const cMeta = colMetas[colIdx - 1];
      if (!cMeta) return;

      const val = cell.value;
      const isNum = typeof val === 'number';

      if (isNum) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '#,##0.00;[Red]-#,##0.00;"-"';
      } else {
        cell.alignment = { vertical: 'middle', horizontal: colIdx === 1 ? 'center' : 'left' };
      }

      let footBgHex = 'FFE2E8F0'; // Footer default background
      if (cMeta.isAltMonth) {
        footBgHex = 'FFDCEBFD'; // Accent shading for alternate month totals in footer
      }

      let isNegative = isNum && (val as number) < 0;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: footBgHex } };

      if (isNegative) {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFDC2626' } };
      } else {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      }

      const rightStyle = cMeta.isMonthEnd ? 'medium' : 'thin';
      const rightColor = cMeta.isMonthEnd ? 'FF475569' : 'FFCBD5E1';
      cell.border = {
        top: { style: 'double', color: { argb: 'FF475569' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'double', color: { argb: 'FF475569' } },
        right: { style: rightStyle, color: { argb: rightColor } }
      };
    });

    // Set Compact & Proportional Column Widths (Exclude merged title row 1 & 2 from widening)
    colMetas.forEach((cMeta, idx) => {
      const col = worksheet.getColumn(idx + 1);
      if (idx === 0) {
        col.width = 8;  // No. (क्र.)
      } else if (idx === 1) {
        col.width = 18; // MM / Location
      } else if (idx === 2) {
        col.width = 18; // Category (कैटेगरी)
      } else if (idx === 3) {
        col.width = 24; // Item Name (वस्तु)
      } else if (idx === 4) {
        col.width = 16; // Subitem (उप-वस्तु)
      } else if (idx === 5) {
        col.width = 8;  // Unit (यूनिट)
      } else {
        col.width = 13; // Metric columns (Past Bachat, Months, Totals)
      }
    });

    // Save File
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `Universal_Report_${this.filterBody.pivot_dimension}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    FileSaver.saveAs(new Blob([buffer]), fileName);

    this.spinner.hide();
    this.toastr.success('Excel file generated successfully');
  }

  // --- ADVANCED INDESIGN PUBLICATION PDF EXPORT (PUPPETEER ENGINE) ---
  exportToPdf(): void {
    if (!this.filteredRows || this.filteredRows.length === 0) {
      this.toastr.warning('No data to export');
      return;
    }

    this.spinner.show();
    this.loadingStatus = 'Rendering InDesign PDF...';

    const deptId = this.auth.webUser?.dept_id;
    const deptName = this.auth.webUser?.dept_hin || this.auth.webUser?.dept_eng || 'HisabKitab Department';
    const dimLabel = this.getPivotDimensionLabel();

    let selectedMmStr = 'All MMs (सभी संस्थान)';
    if (this.filterBody.mm_id && Array.isArray(this.filterBody.mm_id) && this.filterBody.mm_id.length > 0) {
      const selMmObjs = this.mms.filter((m: any) => this.filterBody.mm_id.includes(m._id));
      if (selMmObjs.length > 0) {
        selectedMmStr = selMmObjs.map((m: any) => m.mm_hin || m.mm_eng).join(', ');
      }
    }

    let selectedCatStr = 'All Categories (सभी श्रेणियां)';
    if (this.filterBody.category_id) {
      const selCatObj = this.categories.find((c: any) => c._id == this.filterBody.category_id);
      if (selCatObj) selectedCatStr = selCatObj.category_hin || selCatObj.category_eng;
    }

    const sanitizedRows = this.filteredRows.map((r: any) => ({
      mm_hin: r.mm_hin,
      mm_eng: r.mm_eng,
      category_hin: r.category_hin,
      category_eng: r.category_eng,
      item_hin: r.item_hin,
      item_eng: r.item_eng,
      subitem_id: r.subitem_id,
      subitem_hin: r.subitem_hin,
      subitem_eng: r.subitem_eng,
      unit_short: r.unit_short,
      past_bachat: r.past_bachat,
      months: r.months,
      grand_total: r.grand_total
    }));

    const taskId = 'pdf_univ_' + Date.now();

    const payload = {
      reportRows: sanitizedRows,
      monthsList: this.monthsList,
      activeDimensions: this.activeDimensions,
      filterBody: this.filterBody,
      columnTotals: this.columnTotals,
      viewMode: this.viewMode,
      deptName,
      selectedMmStr,
      selectedCatStr,
      dimLabel,
      hideZeroRows: this.hideZeroRows,
      taskId
    };

    const progressInterval = setInterval(() => {
      this.http.get(this.api.getUrl('UNIVERSAL_REPORT') + 'pdf-progress/' + taskId).subscribe({
        next: (res: any) => {
          if (res && res.status) {
            this.loadingStatus = res.status;
          }
        },
        error: () => {}
      });
    }, 800);

    this.http.downloadPostData(this.api.getUrl('UNIVERSAL_REPORT') + 'export-pdf/' + deptId, payload).subscribe({
      next: async (blob: any) => {
        clearInterval(progressInterval);
        this.spinner.hide();
        this.loadingStatus = 'Loading Report...';

        // Inspect blob to ensure it is not a JSON error response
        if (blob && (blob.type === 'application/json' || (blob.type && blob.type.includes('json')))) {
          try {
            const errorText = await blob.text();
            const errObj = JSON.parse(errorText);
            this.toastr.error(errObj.message || 'PDF Generation failed on server');
            return;
          } catch (e) {
            this.toastr.error('PDF Generation failed on server');
            return;
          }
        }

        if (blob && blob.size < 150) {
          try {
            const errorText = await blob.text();
            if (errorText.includes('success":false') || errorText.includes('message')) {
              const errObj = JSON.parse(errorText);
              this.toastr.error(errObj.message || 'PDF Generation failed on server');
              return;
            }
          } catch (e) {}
        }

        const dateStr = new Date().toISOString().slice(0, 10);
        const fileName = `Universal_Matrix_Report_${this.filterBody.pivot_dimension}_${dateStr}.pdf`;
        FileSaver.saveAs(blob, fileName);
        this.toastr.success('InDesign PDF exported successfully!');
      },
      error: async (err: any) => {
        clearInterval(progressInterval);
        this.spinner.hide();
        this.loadingStatus = 'Loading Report...';
        console.error('PDF Export Error:', err);

        let errMsg = 'Failed to generate PDF. Please try again.';
        if (err?.error instanceof Blob) {
          try {
            const errorText = await err.error.text();
            const errObj = JSON.parse(errorText);
            errMsg = errObj.message || errMsg;
          } catch (e) {}
        } else if (err?.error?.message) {
          errMsg = err.error.message;
        } else if (err?.message) {
          errMsg = err.message;
        }

        this.toastr.error(errMsg);
      }
    });
  }
}

