import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SelectionService } from '../services/selection.service';

declare var $: any;

@Component({
  selector: 'app-hmp',
  templateUrl: './hmp.component.html',
  styleUrls: ['./hmp.component.scss']
})
export class HmpComponent implements OnInit {

  page = 1;
  pageNo: any = 0;
  itemsPerPage = 100;
  currentPage: any;
  totalItems: any;
  batches: any = [];
  isEdit = false;
  selectedBatch: any = null;
  filterBody: any = {};
  term: any = '';
  total_count: any = 0;
  settings: any = {};

  showModal = '';
  selectedJawak: any = null;
  awkRefData: any = null;

  // Filter data
  recipes: any = [];
  mms: any = [];
  items: any = [];
  units: any = [];
  conditions: any = [];
  showFilter = false;

  // UI state
  expandAll = false;

  constructor(
    public api: ApiService,
    public http: HttpService,
    public gs: GlobalService,
    public auth: AuthService,
    private toastr: ToastrService,
    public selection: SelectionService
  ) {
    this.settings = auth.webUser.settings;
    if (!this.settings.hmp) {
      this.settings.hmp = { viewMode: 'voucher' };
    }
  }

  UISettingsChanged() {
    this.auth.webUser.settings = this.settings;
    this.auth.updateSettings()
  }

  ngOnInit(): void {
    this.selection.clear('hmp');
    this.getBatches();
    this.getRecipes();
    this.gs.observeList().subscribe((result: any) => {
      this.mms = result.mm || [];
      this.items = result.itemmix || [];
      this.units = result.unit || [];
      this.conditions = result.condition || [];
    });
  }

  getRecipes() {
    this.http.get(this.api.getUrl('HMP') + 'recipe/' + this.auth.webUser.dept_id)
      .subscribe((data: any) => {
        this.recipes = data.result || [];
      });
  }

  getBatches() {
    this.filterBody.pageNo = this.pageNo;
    this.http.put(this.api.getUrl('HMP') + 'batch/' + this.auth.webUser.dept_id, this.filterBody)
      .subscribe((data: any) => {
        this.batches = data.result || [];
        this.total_count = data.total_count || 0;
      });
  }

  getHmpPage(page: any = null) {
    if (page) {
      this.pageNo = page;
      this.getBatches();
    }
  }

  yearChanged(year: any) {
    this.filterBody.year = year;
    this.pageNo = 0;
    this.getBatches();
  }

  applyFilter() {
    this.pageNo = 0;
    this.getBatches();
  }

  clearFilter() {
    this.filterBody = {};
    this.pageNo = 0;
    this.getBatches();
  }

  toggleExpandAll() {
    this.expandAll = !this.expandAll;
    if (this.expandAll) {
      $('#batchAccordion .accordion-collapse').collapse('show');
    } else {
      $('#batchAccordion .accordion-collapse').collapse('hide');
    }
  }

  getJawakQty(output: any) {
    if (output && output.jawak_detail && output.jawak_detail.length > 0) {
      return output.jawak_detail.reduce((acc: any, curr: any) => acc + Number(curr.qty), 0);
    }
    return 0;
  }

  async exportToExcel() {
    Swal.fire({
      title: 'Preparing Export',
      html: `Fetching data... 0 / ${this.total_count}`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let allBatches: any[] = [];
    let currentPage = 1;
    let filter = { ...this.filterBody };
    let total = this.total_count || 0;

    while (true) {
      filter.pageNo = currentPage;
      try {
        const data: any = await new Promise((resolve, reject) => {
          this.http.put(this.api.getUrl('HMP') + 'batch/' + this.auth.webUser.dept_id, filter)
            .subscribe((res: any) => resolve(res), (err: any) => reject(err));
        });

        let result = data.result || [];
        if (total === 0) total = data.total_count || 0;

        if (result.length > 0) {
          allBatches = allBatches.concat(result);
        }

        Swal.update({
          html: `Fetching data... ${allBatches.length} / ${total}`
        });

        if (result.length === 0 || allBatches.length >= total || allBatches.length >= 100000) {
          break;
        }
        currentPage++;
      } catch (err) {
        Swal.close();
        this.toastr.error('Error fetching data for export');
        return;
      }
    }

    Swal.update({ html: 'Generating Excel File...', title: 'Processing' });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('HMP Batches');

    // Style helpers
    const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    const inputFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
    const outputFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
    const colHdrFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
    const colHdrFillG: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };

    const border: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };

    const boldWhite: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    const boldDark: Partial<ExcelJS.Font> = { bold: true, size: 9 };
    const smallFont: Partial<ExcelJS.Font> = { size: 9 };

    // Set column widths [#, Item (hin+eng), Qty, Unit, Rate, Condition]
    ws.columns = [
      { width: 4 },   // A  #
      { width: 28 },  // B  Item (hin)
      { width: 28 },  // C  Item (eng)
      { width: 8 },   // D  Qty
      { width: 8 },   // E  Unit
      { width: 8 },   // F  Rate
      { width: 16 },  // G  Condition     }  INPUT block (cols A-G)
      { width: 4 },   // H  #
      { width: 28 },  // I  Item (hin)
      { width: 28 },  // J  Item (eng)
      { width: 8 },   // K  Qty
      { width: 8 },   // L  Unit
      { width: 8 },   // M  Rate
      { width: 16 },  // N  Condition     }  OUTPUT block (cols H-N)
    ];

    let rowNum = 1;

    const addCell = (row: ExcelJS.Row, col: number, value: any, font?: Partial<ExcelJS.Font>, fill?: ExcelJS.Fill, align: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'left' }) => {
      const cell = row.getCell(col);
      cell.value = value ?? '';
      cell.border = border;
      if (font) cell.font = font;
      if (fill) cell.fill = fill;
      cell.alignment = { wrapText: true, ...align } as ExcelJS.Alignment;
    };

    const sortedBatches = [...allBatches].sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    for (const batch of sortedBatches) {
      // --- Batch header row (full width merge) ---
      const hdrRow = ws.getRow(rowNum++);
      hdrRow.height = 20;
      ws.mergeCells(`A${hdrRow.number}:N${hdrRow.number}`);
      const hdrCell = hdrRow.getCell(1);
      const date = batch.date ? new Date(batch.date).toLocaleDateString('en-IN') : '';
      hdrCell.value = `📅 ${date}   |   🍃 ${batch.recipe?.recipe_name || ''}  (${batch.recipe?.description || ''})   |   🏠 ${batch.mm?.mm_hin || ''}  ${batch.mm?.mm_eng || ''}   |   Batch: ${batch.batch_no || ''}`;
      hdrCell.fill = headerFill;
      hdrCell.font = boldWhite;
      hdrCell.alignment = { vertical: 'middle', horizontal: 'left' };
      hdrCell.border = border;

      // --- Sub-header: "INPUT MATERIALS" | "OUTPUT PRODUCTS" ---
      const subRow = ws.getRow(rowNum++);
      subRow.height = 16;
      ws.mergeCells(`A${subRow.number}:G${subRow.number}`);
      ws.mergeCells(`H${subRow.number}:N${subRow.number}`);
      const inputHdr = subRow.getCell(1);
      inputHdr.value = '⬇ Input Materials (Consumed)';
      inputHdr.fill = inputFill; inputHdr.font = boldDark; inputHdr.border = border;
      inputHdr.alignment = { vertical: 'middle', horizontal: 'center' };
      const outputHdr = subRow.getCell(8);
      outputHdr.value = '⬆ Output Products (Produced)';
      outputHdr.fill = outputFill; outputHdr.font = boldDark; outputHdr.border = border;
      outputHdr.alignment = { vertical: 'middle', horizontal: 'center' };

      // --- Column headers ---
      const colRow = ws.getRow(rowNum++);
      const inputCols = ['#', 'Item (HIN)', 'Item (ENG)', 'Qty', 'Unit', 'Rate', 'Condition'];
      const outputCols = ['#', 'Item (HIN)', 'Item (ENG)', 'Qty', 'Unit', 'Rate', 'Condition'];
      inputCols.forEach((h, i) => addCell(colRow, i + 1, h, boldDark, colHdrFill, { vertical: 'middle', horizontal: 'center' }));
      outputCols.forEach((h, i) => addCell(colRow, i + 8, h, boldDark, colHdrFillG, { vertical: 'middle', horizontal: 'center' }));

      // --- Data rows (zip inputs + outputs) ---
      const inputs = batch.inputs || [];
      const outputs = batch.outputs || [];
      const maxRows = Math.max(inputs.length, outputs.length);

      for (let i = 0; i < maxRows; i++) {
        const dataRow = ws.getRow(rowNum++);

        // Input side
        if (inputs[i]) {
          const inp = inputs[i];
          const iHin = [(inp.subitem?.subitem_hin || ''), inp.item?.item_hin || ''].filter(Boolean).join(' ');
          const iEng = [(inp.subitem?.subitem_eng || ''), inp.item?.item_eng || ''].filter(Boolean).join(' ');
          addCell(dataRow, 1, i + 1, smallFont);
          addCell(dataRow, 2, iHin, smallFont);
          addCell(dataRow, 3, iEng, smallFont);
          addCell(dataRow, 4, inp.qty, smallFont, undefined, { vertical: 'middle', horizontal: 'right' });
          addCell(dataRow, 5, inp.unit_short || inp.unit?.unit_short, smallFont);
          addCell(dataRow, 6, inp.rate || '', smallFont, undefined, { vertical: 'middle', horizontal: 'right' });
          addCell(dataRow, 7, inp.condition?.list_name_hin || '', smallFont);
        } else {
          [1, 2, 3, 4, 5, 6, 7].forEach(c => addCell(dataRow, c, ''));
        }

        // Output side
        if (outputs[i]) {
          const out = outputs[i];
          const oHin = [(out.subitem?.subitem_hin || ''), out.item?.item_hin || ''].filter(Boolean).join(' ');
          const oEng = [(out.subitem?.subitem_eng || ''), out.item?.item_eng || ''].filter(Boolean).join(' ');
          addCell(dataRow, 8, i + 1, smallFont);
          addCell(dataRow, 9, oHin, smallFont);
          addCell(dataRow, 10, oEng, smallFont);
          addCell(dataRow, 11, out.qty, smallFont, undefined, { vertical: 'middle', horizontal: 'right' });
          addCell(dataRow, 12, out.unit_short || out.unit?.unit_short, smallFont);
          addCell(dataRow, 13, out.rate || '', smallFont, undefined, { vertical: 'middle', horizontal: 'right' });
          addCell(dataRow, 14, out.condition?.list_name_hin || '', smallFont);
        } else {
          [8, 9, 10, 11, 12, 13, 14].forEach(c => addCell(dataRow, c, ''));
        }
      }

      rowNum++; // blank spacer row between batches
    }

    // Save
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const dateStr = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
    saveAs(blob, `HMP_Batches_${dateStr}.xlsx`);
    Swal.close();
  }

  isSelected(batchId: number): boolean {
    return this.selection.isSelected('hmp', batchId);
  }

  toggleSelection(batchId: number) {
    this.selection.toggle('hmp', batchId);
  }

  isAllSelected(): boolean {
    if (!this.batches || this.batches.length === 0) return false;
    const selected = this.selection.getSelected('hmp');
    return this.batches.every((b: any) => selected.includes(b._id));
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    const ids = this.batches.map((b: any) => b._id).filter((id: any) => !!id);
    if (checked) {
      this.selection.selectMany('hmp', ids);
    } else {
      this.selection.deselectMany('hmp', ids);
    }
  }

  getSelectedCount(): number {
    return this.selection.getSelected('hmp').length;
  }

  exportToPdf(exportType: 'normal' | 'advance' = 'normal') {
    const selectedIds = this.selection.getSelected('hmp');
    
    if (exportType === 'advance' && selectedIds.length === 0) {
      this.toastr.warning('Please select at least one batch to perform Advance PDF export');
      return;
    }

    Swal.fire({
      title: 'Preparing PDF',
      html: exportType === 'advance' ? 'Generating Advance Report...' : 'Generating report...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const payload = {
      ...this.filterBody,
      viewMode: this.settings.hmp.viewMode,
      exportType: exportType,
      batchIds: selectedIds
    };

    this.http.downloadPostData(this.api.getUrl('HMP') + 'batch/export-pdf/' + this.auth.webUser.dept_id, payload)
      .subscribe((blob: any) => {
        Swal.close();
        const dateStr = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
        const filename = exportType === 'advance' ? `HMP_Batches_Advance_${dateStr}.pdf` : `HMP_Batches_${dateStr}.pdf`;
        saveAs(blob, filename);
      }, (error: any) => {
        Swal.close();
        this.toastr.error('Failed to generate PDF');
        console.error(error);
      });
  }

  openEntryModal(batch: any = null) {
    this.isEdit = !!batch;
    this.selectedBatch = batch;
    this.openModal(this.isEdit ? "Edit HMP" : "Add HMP");
  }

  openModal(type: string) {
    this.showModal = type;
    $('#hmpEntryModal').modal('show');
  }

  closeModal() {
    $('#hmpEntryModal').modal('hide');
    this.showModal = ""
    this.isEdit = false;
    this.selectedBatch = null;
  }

  showJawak(output: any) {
    this.selectedJawak = output?.aawak_detail?.jawak_detail || [];

    console.log(this.selectedJawak);

    for (let i in this.selectedJawak) {
      const item = this.items.find((i: any) => i._id === this.selectedJawak[i]?.item_id);
      const mm = this.mms.find((m: any) => m._id === this.selectedJawak[i].mm_id);
      const unit = this.units.find((u: any) => u._id === this.selectedJawak[i].unit_id);
      // const condition = this.conditions.find((c: any) => c._id === this.selectedJawak[i].condition_id);
      this.selectedJawak[i].mm_hin = mm ? (mm.mm_hin || mm.mm_eng) : '';
      this.selectedJawak[i].item_hin = item ? (item.item_hin || item.item_eng) : '';
      this.selectedJawak[i].unit_short = unit ? unit.unit_short : '';
      // Lookup subitem name if present
      if (output.subitem_id) {
        const subitem = this.items.find((i: any) => i._id === output.subitem_id);
        this.selectedJawak[i].subitem_hin = subitem ? (subitem.subitem_hin || subitem.subitem_eng) : '';
      }
    }
    this.openModal('show jawak');
  }


  addJawak(output: any) {
    this.awkRefData = output.aawak_detail;
    this.openModal('Add Jawak');
  }



  addJawakResponse(ev: any) {
    if (ev) {
      this.closeModal();
      this.awkRefData = null;
      this.getBatches();
    }
  }

  onBatchSaved(event: any) {
    // Refresh list
    this.closeModal();
    this.getBatches();
  }


  deleteInput(id: any, index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('HMP') + 'input/' + id)
          .subscribe((data: any) => {
            if (data.success) {
              this.toastr.success('Input deleted successfully');
              this.getBatches();
            }
            else {
              this.toastr.error('Failed to delete input');
            }

          });
      }
    });

  }

  deleteOutput(id: any, index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('HMP') + 'output/' + id)
          .subscribe((data: any) => {
            if (data.success) {
              this.toastr.success('Output deleted successfully');
              this.getBatches();
            }
            else {
              this.toastr.error('Failed to delete output');
            }
          });
      }
    });

  }

  delete(id: any, index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('HMP') + id)
          .subscribe((data: any) => {
            if (data.success) {
              this.toastr.success('Batch deleted successfully');
              this.batches.splice(index, 1);
            }
            else {
              this.toastr.error('Failed to delete batch');
            }
          });
      }
    });

  }

}
