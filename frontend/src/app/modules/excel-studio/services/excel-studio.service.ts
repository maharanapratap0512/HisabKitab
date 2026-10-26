import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { StudioColumn, StudioFormat, StudioRow, StudioCell, ScanReport, ScanMatchItem } from '../models/excel-studio.model';
import { MasterIndexerService } from './master-indexer.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelStudioService {

  public readonly formats: StudioFormat[] = [
    {
      id: 'bachat',
      name: 'bachat',
      title: 'Bachat (बचत / Actual Counting)',
      title_hin: 'बचत (स्टॉक भौतिक गणना)',
      icon: 'uil-shopping-bag',
      badgeColor: 'primary',
      desc: 'Physical stock counting sheet with items, subitems, units, condition, and quantities.',
      desc_hin: 'आइटम, सबआइटम, यूनिट, कंडीशन और भौतिक मात्रा दर्ज करने के लिए बचत फॉर्मेट।',
      note: '0 मात्रा वाले रिकॉर्ड्स को सॉफ्टवेयर आवश्यकतानुसार प्रोसेस करता है।',
      columns: [
        { key: 'sn', name: 'क्र.सं. (Sr No)', col_name: 'sn', not_null: false, type: 'number', alt_names: ['sr no', 'sr_no', 'sn', 'sr num', 'क्रमांक'] },
        { key: 'date', name: 'तारीख (Date)*', col_name: 'date', not_null: true, type: 'date', alt_names: ['date', 'तारीख', 'दिनांक'] },
        { key: 'mm', name: 'मि.म. (MM)*', col_name: 'mm', not_null: true, ref_table: 'mm', alt_names: ['mm', 'mm_name', 'मि.म.', 'मि म', 'मिनी मधुबन'] },
        { key: 'item', name: 'आइटम (Item)*', col_name: 'item', not_null: true, ref_table: 'item', alt_names: ['item', 'item_name', 'आइटम', 'आइटम का नाम'] },
        { key: 'subitem', name: 'सबआइटम (Subitem)', col_name: 'subitem', not_null: false, ref_table: 'subitem', alt_names: ['subitem', 'subitem_name', 'सबआइटम', 'सब आइटम'] },
        { key: 'qty', name: 'संख्या (Qty)*', col_name: 'qty', not_null: true, type: 'number', alt_names: ['qty', 'quantity', 'संख्या', 'मात्रा'] },
        { key: 'unit', name: 'यूनिट (Unit)*', col_name: 'unit', not_null: true, ref_table: 'unit', alt_names: ['unit', 'यूनिट', 'इकाई'] },
        { key: 'condition', name: 'कंडीशन (Condition)', col_name: 'condition', not_null: false, ref_table: 'condition', alt_names: ['condition', 'कन्डिशन', 'हालत'] },
        { key: 'company_name', name: 'कंपनी (Company)', col_name: 'company', not_null: false, alt_names: ['company', 'company_name', 'कंपनी'] },
        { key: 'actual_amt', name: 'राशि (Amount)', col_name: 'amount', not_null: false, type: 'number', alt_names: ['amount', 'actual_amt', 'अमाउन्ट', 'राशि'] },
        { key: 'item_detail', name: 'विवरण (Detail)', col_name: 'item_detail', not_null: false, alt_names: ['item_detail', 'detail', 'डेटाइल'] },
        { key: 'description', name: 'नोट (Note)', col_name: 'description', not_null: false, alt_names: ['description', 'note', 'नोट', 'टिप्पणी'] },
        { key: 'nimmit', name: 'निमित्त (Nimitt)', col_name: 'nimmit', not_null: false, ref_table: 'nimitt', alt_names: ['nimitt', 'nimmit', 'निमित्त'] },
      ],
      sampleRows: [
        { date: '25-10-2026', mm: 'मुम्बई', item: 'गेंहू', subitem: 'शरबती', qty: 50, unit: 'किग्रा', condition: 'अच्छा', actual_amt: 2500 },
        { date: '25-10-2026', mm: 'दिल्ली', item: 'चावल', subitem: 'बासमती', qty: 100, unit: 'किग्रा', condition: 'अच्छा', actual_amt: 6000 }
      ]
    },
    {
      id: 'vehicle',
      name: 'vehicle',
      title: 'Vehicle Fleet & Documents',
      title_hin: 'वाहन एवं दस्तावेज़ (RC, Insurance, PUC)',
      icon: 'uil-car-sideview',
      badgeColor: 'info',
      desc: 'Vehicle register with standard RC, Insurance, and PUC expiry dates & amounts.',
      desc_hin: 'वाहन संख्या, मि.म., एवं RC, बीमा और प्रदूषण नवीनीकरण की सम्पूर्ण जानकारी।',
      columns: [
        { key: 'mm', name: 'मि.म. (MM)*', col_name: 'mm', not_null: true, ref_table: 'mm', alt_names: ['mm', 'mm_name', 'मि.म.', 'मि म', 'मिनी मधुबन'] },
        { key: 'gadi_num', name: 'गाड़ी नं (Vehicle No)*', col_name: 'gadi_num', not_null: true, alt_names: ['gadi_num', 'vehicle no', 'gadi no', 'गाड़ी नं', 'वाहन क्र'] },
        { key: 'gadi_name', name: 'गाड़ी नाम (Name)', col_name: 'gadi_name', not_null: false, alt_names: ['gadi name', 'vehicle name', 'gadi_name'] },
        { key: 'vehicle_type', name: 'प्रकार (Type)', col_name: 'vehicle_type', not_null: false, alt_names: ['vehicle type', 'gadi type', 'प्रकार'] },
        { key: 'fuel_type', name: 'ईंधन (Fuel)', col_name: 'fuel_type', not_null: false, alt_names: ['fuel type', 'fuel', 'ईंधन'] },
        { key: 'owner_name', name: 'मालिक (Owner)', col_name: 'owner_name', not_null: false, alt_names: ['owner', 'owner name', 'मालिक'] },
        { key: 'aawak_type', name: 'आवक प्रकार*', col_name: 'aawak_type', not_null: true, ref_table: 'aawak_type', alt_names: ['aawak type', 'awk type', 'आवक टाइप'] },
        // RC (Indigo)
        { key: 'rc_date', name: 'RC तारीख', col_name: 'rc_date', not_null: false, type: 'date', alt_names: ['rc date', 'rc_date', 'rc'] },
        { key: 'rc_exp_date', name: 'RC समाप्ति तारीख', col_name: 'rc_exp_date', not_null: false, type: 'date', alt_names: ['rc expiry', 'rc_exp_date', 'rc exp'] },
        { key: 'rc_amount', name: 'RC राशि', col_name: 'rc_amount', not_null: false, type: 'number', alt_names: ['rc amount', 'rc_amount', 'rc amt'] },
        // Insurance (Emerald)
        { key: 'insurance_date', name: 'बीमा तारीख', col_name: 'insurance_date', not_null: false, type: 'date', alt_names: ['ins date', 'insurance', 'बीमा तारीख'] },
        { key: 'insurance_exp_date', name: 'बीमा समाप्ति तारीख', col_name: 'insurance_exp_date', not_null: false, type: 'date', alt_names: ['insurance expiry', 'insurance_exp_date', 'ins exp'] },
        { key: 'insurance_amount', name: 'बीमा राशि', col_name: 'insurance_amount', not_null: false, type: 'number', alt_names: ['insurance amount', 'insurance_amount', 'ins amt'] },
        // PUC (Amber)
        { key: 'puc_date', name: 'PUC तारीख', col_name: 'puc_date', not_null: false, type: 'date', alt_names: ['puc date', 'puc_date', 'puc'] },
        { key: 'puc_exp_date', name: 'PUC समाप्ति तारीख', col_name: 'puc_exp_date', not_null: false, type: 'date', alt_names: ['puc expiry', 'puc_exp_date', 'puc exp'] },
        { key: 'puc_amount', name: 'PUC राशि', col_name: 'puc_amount', not_null: false, type: 'number', alt_names: ['puc amount', 'puc_amount', 'puc amt'] },
      ],
      sampleRows: [
        { mm: 'मुम्बई', gadi_num: 'MH01AB1234', gadi_name: 'Bolero', vehicle_type: 'Four Wheeler', aawak_type: 'भेंट', rc_exp_date: '15-08-2027', insurance_exp_date: '10-12-2026', puc_exp_date: '05-11-2026' }
      ]
    },
    {
      id: 'item',
      name: 'item',
      title: 'Item Master (आइटम मास्टर)',
      title_hin: 'आइटम मास्टर (नाम, कोड, यूनिट, रेट)',
      icon: 'uil-box',
      badgeColor: 'success',
      desc: 'Master items with Hindi, English, Roman names, unit, aliases, and yearly rates.',
      desc_hin: 'आइटम का नाम, कोड, डिफ़ॉल्ट यूनिट, एलियास और वर्षवार दरों की सूची।',
      columns: [
        { key: 'item_hin', name: 'आइटम नाम (हिंदी)*', col_name: 'item_hin', not_null: true, alt_names: ['itemhin', 'item hin', 'item_hin', 'आइटम'] },
        { key: 'item_eng', name: 'आइटम नाम (English)', col_name: 'item_eng', not_null: false, alt_names: ['itemeng', 'item eng', 'item_eng'] },
        { key: 'item_roman', name: 'आइटम नाम (Roman)', col_name: 'item_roman', not_null: false, alt_names: ['itemroman', 'item roman', 'item_roman'] },
        { key: 'item_code', name: 'कोड (Item Code)', col_name: 'item_code', not_null: false, alt_names: ['itemcode', 'item code', 'code'] },
        { key: 'unit', name: 'यूनिट (Unit)', col_name: 'unit', not_null: false, ref_table: 'unit', alt_names: ['unit', 'default_unit', 'यूनिट'] },
        { key: 'aliases', name: 'उपनाम (Aliases)', col_name: 'aliases', not_null: false, type: 'array', alt_names: ['aliases', 'alias', 'alternative names'] },
        { key: 'min_rate', name: 'न्यूनतम दर (Min Rate)', col_name: 'min_rate', not_null: false, type: 'number', alt_names: ['min rate', 'min_rate'] },
        { key: 'max_rate', name: 'अधिकतम दर (Max Rate)', col_name: 'max_rate', not_null: false, type: 'number', alt_names: ['max rate', 'max_rate'] },
        { key: 'rate_2025', name: 'दर 2025 (Rate 2025)', col_name: 'rate_2025', not_null: false, type: 'yearly_rate', alt_names: ['rate 2025', 'rate_2025'] },
        { key: 'rate_2026', name: 'दर 2026 (Rate 2026)', col_name: 'rate_2026', not_null: false, type: 'yearly_rate', alt_names: ['rate 2026', 'rate_2026'] },
      ],
      sampleRows: [
        { item_hin: 'चीनी', item_eng: 'Sugar', item_code: 'SUG01', unit: 'किग्रा', min_rate: 35, max_rate: 45, rate_2026: 42 },
        { item_hin: 'तेल (सोयाबीन)', item_eng: 'Soybean Oil', item_code: 'OIL02', unit: 'लीटर', min_rate: 110, max_rate: 140, rate_2026: 125 }
      ]
    },
    {
      id: 'subitem',
      name: 'subitem',
      title: 'Subitem Master (सबआइटम)',
      title_hin: 'सबआइटम मास्टर (आइटम अनुसार)',
      icon: 'uil-layer-group',
      badgeColor: 'warning',
      desc: 'Subitems linked to parent items with unit and custom rates.',
      desc_hin: 'मूल आइटम के अंतर्गत सबआइटम, यूनिट और दरें दर्ज करने हेतु।',
      columns: [
        { key: 'item_hin', name: 'मूल आइटम (Parent Item)*', col_name: 'item_hin', not_null: true, ref_table: 'item', alt_names: ['item', 'item_hin', 'itemhin', 'आइटम'] },
        { key: 'subitem_hin', name: 'सबआइटम (हिंदी)*', col_name: 'subitem_hin', not_null: true, alt_names: ['subitem', 'subitem_hin', 'subitemhin', 'सबआइटम'] },
        { key: 'subitem_eng', name: 'सबआइटम (English)', col_name: 'subitem_eng', not_null: false, alt_names: ['subitem_eng', 'subitemeng'] },
        { key: 'unit', name: 'यूनिट (Unit)', col_name: 'unit', not_null: false, ref_table: 'unit', alt_names: ['unit', 'यूनिट'] },
        { key: 'rate_2026', name: 'दर 2026', col_name: 'rate_2026', not_null: false, type: 'yearly_rate', alt_names: ['rate 2026', 'rate_2026'] },
      ],
      sampleRows: [
        { item_hin: 'दाल', subitem_hin: 'अरहर (तुअर)', subitem_eng: 'Toor Dal', unit: 'किग्रा', rate_2026: 160 },
        { item_hin: 'दाल', subitem_hin: 'मूंग मोगर', subitem_eng: 'Moong Mogar', unit: 'किग्रा', rate_2026: 120 }
      ]
    },
    {
      id: 'jawak',
      name: 'jawak',
      title: 'Jawak Entries (जावक प्रविष्टियां)',
      title_hin: 'जावक (सेवाधारी या अन्य मि.म. को निकासी)',
      icon: 'uil-arrow-circle-right',
      badgeColor: 'secondary',
      desc: 'Outward distribution records for PBKs or destination MMs.',
      desc_hin: 'सेवाधारी या अन्य मिनी मधुबन को सामग्री निकासी की जावक सूची।',
      columns: [
        { key: 'date', name: 'तारीख (Date)*', col_name: 'date', not_null: true, type: 'date', alt_names: ['date', 'तारीख', 'दिनांक'] },
        { key: 'mm', name: 'मि.म. (Source MM)*', col_name: 'mm', not_null: true, ref_table: 'mm', alt_names: ['mm', 'source mm', 'मि.म.'] },
        { key: 'jawak_mm', name: 'कहाँ भेजा (Dest MM)', col_name: 'jawak_mm', not_null: false, ref_table: 'mm', alt_names: ['jawak mm', 'destination mm', 'कहाँ भेजा'] },
        { key: 'pbk', name: 'सेवाधारी (PBK)', col_name: 'pbk', not_null: false, ref_table: 'pbk', alt_names: ['pbk', 'sewadhari', 'सेवाधारी'] },
        { key: 'item', name: 'आइटम (Item)*', col_name: 'item', not_null: true, ref_table: 'item', alt_names: ['item', 'आइटम'] },
        { key: 'subitem', name: 'सबआइटम', col_name: 'subitem', not_null: false, ref_table: 'subitem', alt_names: ['subitem', 'सबआइटम'] },
        { key: 'qty', name: 'संख्या (Qty)*', col_name: 'qty', not_null: true, type: 'number', alt_names: ['qty', 'quantity', 'संख्या'] },
        { key: 'unit', name: 'यूनिट (Unit)*', col_name: 'unit', not_null: true, ref_table: 'unit', alt_names: ['unit', 'यूनिट'] },
        { key: 'jawak_type', name: 'जावक प्रकार*', col_name: 'jawak_type', not_null: true, ref_table: 'jawak_type', alt_names: ['jawak type', 'जावक टाइप'] },
        { key: 'voucher_no', name: 'वाउचर नं', col_name: 'voucher_no', not_null: false, alt_names: ['voucher no', 'vch no', 'वाउचर नं'] }
      ],
      sampleRows: [
        { date: '25-10-2026', mm: 'मुम्बई', jawak_mm: 'पुणे', item: 'चावल', subitem: 'बासमती', qty: 25, unit: 'किग्रा', jawak_type: 'सप्लाई' }
      ]
    },
    {
      id: 'pbk',
      name: 'pbk',
      title: 'PBK (सेवाधारी सूची)',
      title_hin: 'सेवाधारी विवरण (रोल नं, नाम, राज्य, जिला)',
      icon: 'uil-users-alt',
      badgeColor: 'danger',
      desc: 'PBK sewadhari directory with contact details and class MM.',
      desc_hin: 'सेवाधारी का रोल नं, नाम, जेंडर, राज्य, जिला, मोबाइल नंबर आदि।',
      columns: [
        { key: 'roll_no', name: 'रोल नं (Roll No)', col_name: 'roll_no', not_null: false, alt_names: ['roll no', 'ro no', 'रोल नं'] },
        { key: 'pbk_hin', name: 'नाम (हिंदी)*', col_name: 'pbk_hin', not_null: true, alt_names: ['pbk hin', 'namehin', 'नाम'] },
        { key: 'pbk_eng', name: 'नाम (English)', col_name: 'pbk_eng', not_null: false, alt_names: ['pbk eng', 'nameeng'] },
        { key: '_gender', name: 'जेंडर (Gender)*', col_name: '_gender', not_null: true, ref_table: 'gender', alt_names: ['gender', 'लिंग'] },
        { key: 'state', name: 'राज्य (State)*', col_name: 'state', not_null: true, ref_table: 'state', alt_names: ['state', 'राज्य'] },
        { key: 'district', name: 'जिला (District)', col_name: 'district', not_null: false, ref_table: 'district', alt_names: ['district', 'जिला'] },
        { key: 'mo_no', name: 'मोबाइल नं (Mobile)', col_name: 'mo_no', not_null: false, alt_names: ['mo no', 'mobile', 'मोबाइल नं'] },
        { key: 'class_mm', name: 'क्लास मि.म.', col_name: 'class_mm', not_null: false, ref_table: 'mm', alt_names: ['class mm', 'मि.म.'] },
      ],
      sampleRows: [
        { roll_no: '101', pbk_hin: 'रमेश भाई', _gender: 'Male', state: 'महाराष्ट्र', district: 'मुम्बई', mo_no: '9876543210' }
      ]
    }
  ];

  constructor(private masterIndexer: MasterIndexerService) {}

  public getFormat(id: string): StudioFormat | undefined {
    return this.formats.find(f => f.id === id);
  }

  /**
   * Generates blank default rows for a format (sample rows optional)
   */
  public generateBlankRows(format: StudioFormat, count: number = 35, includeSample: boolean = false): StudioRow[] {
    const rows: StudioRow[] = [];
    // Only load sample rows if explicitly requested
    if (includeSample && format.sampleRows && format.sampleRows.length > 0) {
      for (let i = 0; i < format.sampleRows.length; i++) {
        const sample = format.sampleRows[i];
        const cells: { [k: string]: StudioCell } = {};
        for (const col of format.columns) {
          cells[col.key] = {
            value: sample[col.key] !== undefined ? sample[col.key] : '',
            isValid: true
          };
        }
        rows.push({
          rowNum: rows.length + 1,
          cells: cells,
          hasError: false,
          errorCount: 0
        });
      }
    }

    // Fill remaining with blanks
    const remaining = Math.max(0, count - rows.length);
    for (let r = 0; r < remaining; r++) {
      const cells: { [k: string]: StudioCell } = {};
      for (const col of format.columns) {
        cells[col.key] = { value: '', isValid: true };
      }
      rows.push({
        rowNum: rows.length + 1,
        cells: cells,
        hasError: false,
        errorCount: 0
      });
    }

    return rows;
  }

  /**
   * Generate generic columns (A, B, C...) for Normal mode with blank names
   */
  public generateNormalColumns(count: number = 10): StudioColumn[] {
    const cols: StudioColumn[] = [];
    for (let i = 0; i < count; i++) {
      const letter = this.getColumnLetter(i);
      cols.push({
        key: `col_${i}`,
        name: '', // Blank by default so user can define their own headers
        type: 'text'
      });
    }
    return cols;
  }

  public getColumnLetter(colIndex: number): string {
    let temp: number;
    let letter = '';
    let col = colIndex + 1;
    while (col > 0) {
      temp = (col - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      col = Math.floor((col - temp - 1) / 26);
    }
    return letter;
  }

  /**
   * Checks if a row has any non-empty cell
   */
  public rowHasData(row: StudioRow, columns: StudioColumn[]): boolean {
    for (const col of columns) {
      const cell = row.cells[col.key];
      if (cell && cell.value !== null && cell.value !== undefined && String(cell.value).trim() !== '') {
        return true;
      }
    }
    return false;
  }

  /**
   * High-speed validation of a row against format columns
   */
  public validateRow(row: StudioRow, columns: StudioColumn[]): void {
    // If full empty row: auto-ignore completely!
    if (!this.rowHasData(row, columns)) {
      for (const col of columns) {
        const cell = row.cells[col.key];
        if (cell) {
          cell.isValid = true;
          cell.isWarning = false;
          cell.errorMessage = undefined;
        }
      }
      row.hasError = false;
      row.errorCount = 0;
      return;
    }

    let errorCount = 0;
    for (const col of columns) {
      const cell = row.cells[col.key];
      if (!cell) continue;

      const val = cell.value;
      const strVal = (val === null || val === undefined) ? '' : String(val).trim();

      // 1. Mandatory check
      if (col.not_null && strVal === '') {
        cell.isValid = false;
        cell.isWarning = true;
        cell.errorMessage = `${col.name} अनिवार्य है (Required)`;
        errorCount++;
        continue;
      }

      // If empty and not required, it's valid
      if (strVal === '') {
        cell.isValid = true;
        cell.isWarning = false;
        cell.errorMessage = undefined;
        continue;
      }

      // 2. Ref Table Master validity check (O(1))
      if (col.ref_table) {
        const ok = this.masterIndexer.isValid(col.ref_table, strVal);
        if (!ok) {
          cell.isValid = false;
          cell.isWarning = false;
          cell.errorMessage = `'${strVal}' मास्टर लिस्ट में नहीं मिला`;
          errorCount++;
          continue;
        }
      }

      // 3. Numeric check
      if (col.type === 'number' || col.type === 'yearly_rate') {
        const num = Number(strVal);
        if (isNaN(num)) {
          cell.isValid = false;
          cell.isWarning = false;
          cell.errorMessage = 'संख्या होना आवश्यक है (Must be a number)';
          errorCount++;
          continue;
        }
      }

      // Valid
      cell.isValid = true;
      cell.isWarning = false;
      cell.errorMessage = undefined;
    }

    row.hasError = errorCount > 0;
    row.errorCount = errorCount;
  }

  /**
   * Batch validate all rows (Executes in < 5ms for 1000 rows)
   */
  public validateAllRows(rows: StudioRow[], columns: StudioColumn[]): { total: number; valid: number; errors: number; badCells: number } {
    let badCells = 0;
    let errorRows = 0;
    let dataRowsCount = 0;

    for (const r of rows) {
      this.validateRow(r, columns);
      if (this.rowHasData(r, columns)) {
        dataRowsCount++;
        if (r.hasError) {
          errorRows++;
          badCells += r.errorCount;
        }
      }
    }

    return {
      total: dataRowsCount,
      valid: Math.max(0, dataRowsCount - errorRows),
      errors: errorRows,
      badCells: badCells
    };
  }

  /**
   * Scan & Match Headers for Normal Sheets
   */
  public scanAndMatch(headers: string[], targetFormat: StudioFormat, headerRowIndex: number = 0): ScanReport {
    const matches: ScanMatchItem[] = [];
    const usedTargetKeys = new Set<string>();

    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i] || '').trim().toLowerCase();
      let matchedCol: StudioColumn | null = null;

      if (h) {
        for (const col of targetFormat.columns) {
          if (usedTargetKeys.has(col.key)) continue;

          // Check direct name match
          if (col.name.toLowerCase() === h || (col.col_name && col.col_name.toLowerCase() === h)) {
            matchedCol = col;
            break;
          }
          // Check alt_names
          if (col.alt_names) {
            for (const alt of col.alt_names) {
              if (alt.toLowerCase() === h) {
                matchedCol = col;
                break;
              }
            }
            if (matchedCol) break;
          }
        }
      }

      if (matchedCol) {
        usedTargetKeys.add(matchedCol.key);
        matches.push({
          sheetColIndex: i,
          sheetHeader: headers[i],
          targetColKey: matchedCol.key,
          targetColName: matchedCol.name,
          isMandatory: matchedCol.not_null,
          status: 'matched'
        });
      } else {
        matches.push({
          sheetColIndex: i,
          sheetHeader: headers[i],
          targetColKey: null,
          status: 'unmatched'
        });
      }
    }

    // Find missing mandatory
    const missing: StudioColumn[] = [];
    for (const col of targetFormat.columns) {
      if (col.not_null && !usedTargetKeys.has(col.key)) {
        missing.push(col);
      }
    }

    return {
      headerRowIndex: headerRowIndex,
      targetFormat: targetFormat,
      matches: matches,
      missingMandatory: missing,
      totalSheetCols: headers.length
    };
  }

  /**
   * Export Studio rows to styled Excel
   */
  public exportExcel(columns: StudioColumn[], rows: StudioRow[], fileName: string = 'HK_Excel_Data'): void {
    const dataForSheet: any[] = [];
    for (const r of rows) {
      const rowObj: any = {};
      for (const col of columns) {
        rowObj[col.name] = r.cells[col.key] ? r.cells[col.key].value : '';
      }
      dataForSheet.push(rowObj);
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForSheet);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /**
   * Convert rows to standard software import format (array of objects with col_name keys)
   */
  public prepareForImport(columns: StudioColumn[], rows: StudioRow[]): any[] {
    const importData: any[] = [];
    for (const r of rows) {
      // Ignore completely empty rows
      let hasData = false;
      const rowObj: any = {};
      for (const col of columns) {
        const val = r.cells[col.key] ? r.cells[col.key].value : '';
        const primaryKey = col.col_name || col.key;
        rowObj[primaryKey] = val;
        if (col.key && col.key !== primaryKey) {
          rowObj[col.key] = val;
        }
        if (col.name && col.name !== primaryKey) {
          rowObj[col.name] = val;
        }
        if (val !== null && val !== undefined && String(val).trim() !== '') {
          hasData = true;
        }
      }
      if (hasData) {
        importData.push(rowObj);
      }
    }
    return importData;
  }
}
