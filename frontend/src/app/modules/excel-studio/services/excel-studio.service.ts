import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { StudioColumn, StudioFormat, StudioRow, StudioCell, ScanReport, ScanMatchItem } from '../models/excel-studio.model';
import { MasterIndexerService } from './master-indexer.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelStudioService {

  public readonly formats: StudioFormat[] = [
    {
      id: 'bachat',
      name: 'bachat',
      title: 'Bachat (Closing)',
      title_hin: 'Bachat (Closing)',
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
        { key: 'unit', name: 'यूनिट (Unit)*', col_name: 'unit', not_null: true, ref_table: 'unit', alt_names: ['unit', 'यूनिट', 'इकाई'] },
        { key: 'condition', name: 'कंडीशन (Condition)', col_name: 'condition', not_null: false, ref_table: 'condition', alt_names: ['condition', 'कन्डिशन', 'हालत'] },
        { key: 'sw_qty', name: 'सॉफ्टवेयर स्टॉक (SW Qty)', col_name: 'sw_qty', not_null: false, type: 'number', alt_names: ['sw_qty', 'sw qty', 'software qty', 'सॉफ्टवेयर स्टॉक', 'स्टॉक', 'software stock', 'sw stock', 'सॉफ्टवेयर मात्रा'] },
        { key: 'qty', name: 'भौतिक मात्रा (Physical Qty)*', col_name: 'qty', not_null: true, type: 'number', alt_names: ['qty', 'quantity', 'संख्या', 'मात्रा', 'भौतिक मात्रा', 'physical qty', 'भौतिक मात्रा (physical qty)*', 'भौतिक मात्रा (physical qty)'] },
        { key: 'company_name', name: 'कंपनी (Company)', col_name: 'company', not_null: false, alt_names: ['company', 'company_name', 'कंपनी'] },
        { key: 'actual_amt', name: 'राशि (Amount)', col_name: 'amount', not_null: false, type: 'number', alt_names: ['amount', 'actual_amt', 'अमाउन्ट', 'राशि'] },
        { key: 'item_detail', name: 'विवरण (Detail)', col_name: 'item_detail', not_null: false, alt_names: ['item_detail', 'detail', 'डेटाइल'] },
        { key: 'description', name: 'नोट (Note)', col_name: 'description', not_null: false, alt_names: ['description', 'note', 'नोट', 'टिप्पणी'] },
        { key: 'nimmit', name: 'निमित्त (Nimitt)', col_name: 'nimmit', not_null: false, ref_table: 'nimitt', alt_names: ['nimitt', 'nimmit', 'निमित्त'] },
      ],
      sampleRows: [
        { date: '25-10-2026', mm: 'मुम्बई', item: 'गेंहू', subitem: 'शरबती', unit: 'किग्रा', condition: 'अच्छा', sw_qty: 50, qty: '', actual_amt: 2500 },
        { date: '25-10-2026', mm: 'दिल्ली', item: 'चावल', subitem: 'बासमती', unit: 'किग्रा', condition: 'अच्छा', sw_qty: 100, qty: '', actual_amt: 6000 }
      ]
    },
    {
      id: 'vehicle',
      name: 'vehicle',
      title: 'Vehicle',
      title_hin: 'Vehicle',
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
      title: 'Item',
      title_hin: 'Item',
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
      title: 'Subitem',
      title_hin: 'Subitem',
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
      title: 'Jawak',
      title_hin: 'Jawak',
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
      title: 'PBK',
      title_hin: 'PBK',
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
    },
    {
      id: 'product',
      name: 'product',
      title: 'Product',
      title_hin: 'Product',
      icon: 'uil-desktop',
      badgeColor: 'primary',
      desc: 'Asset, machinery, and equipment register with warranty and purchase details.',
      desc_hin: 'उत्पाद कोड, मि.म., आइटम, कंपनी, मॉडल, स्थिति, वारंटी व खरीद विवरण।',
      columns: [
        { key: 'sr_num', name: 'क्र.सं. (Sr No)', col_name: 'sr_num', not_null: false, alt_names: ['sr no', 'sr number', 'sr num', 'serial no'] },
        { key: 'product_code', name: 'उत्पाद कोड (Product Code)', col_name: 'product_code', not_null: false, alt_names: ['product code', 'pr_code', 'pr code'] },
        { key: 'purchase_date', name: 'खरीद तारीख (Purchase Date)', col_name: 'purchase_date', not_null: false, type: 'date', alt_names: ['date', 'तारीख', 'purchase date'] },
        { key: 'mm', name: 'मि.म. (MM)*', col_name: 'mm', not_null: true, ref_table: 'mm', alt_names: ['mm', 'mm_name', 'मि.म.', 'मि म', 'मिनी मधुबन'] },
        { key: 'item', name: 'आइटम (Item)*', col_name: 'item', not_null: true, ref_table: 'item', alt_names: ['item', 'item_name', 'आइटम'] },
        { key: 'subitem', name: 'सबआइटम (Subitem)', col_name: 'subitem', not_null: false, ref_table: 'subitem', alt_names: ['subitem', 'subitem_name', 'सबआइटम'] },
        { key: 'qty', name: 'संख्या (Qty)*', col_name: 'qty', not_null: true, type: 'number', alt_names: ['qty', 'quantity', 'संख्या'] },
        { key: 'unit', name: 'यूनिट (Unit)*', col_name: 'unit', not_null: true, ref_table: 'unit', alt_names: ['unit', 'यूनिट'] },
        { key: 'aawak_type', name: 'आवक प्रकार*', col_name: 'aawak_type', not_null: true, ref_table: 'aawak_type', alt_names: ['aawak type', 'awk type', 'आवक टाइप'] },
        { key: 'company_name', name: 'कंपनी (Company)', col_name: 'company', not_null: false, alt_names: ['company', 'company_name', 'कंपनी'] },
        { key: 'modal_name', name: 'मॉडल (Model)', col_name: 'modal', not_null: false, alt_names: ['modal', 'modal_name', 'मॉडल'] },
        { key: 'condition', name: 'स्थिति (Condition)*', col_name: 'condition', not_null: true, ref_table: 'condition', alt_names: ['condition', 'कन्डिशन'] },
        { key: 'warranty_period', name: 'वारंटी समय (Warranty)', col_name: 'warranty_period', not_null: false, alt_names: ['warranty', 'warranty period', 'वारंटी'] },
        { key: 'warranty_from', name: 'वारंटी कहाँ से', col_name: 'warranty_from', not_null: false, alt_names: ['warranty from'] },
        { key: 'purchase_from', name: 'कहाँ से खरीदा', col_name: 'purchase_from', not_null: false, alt_names: ['purchase from'] },
        { key: 'purchased_by', name: 'किसके द्वारा खरीदा', col_name: 'purchased_by', not_null: false, alt_names: ['purchased by', 'purchase by'] },
        { key: 'product_detail', name: 'विवरण (Details)', col_name: 'product_detail', not_null: false, alt_names: ['product detail', 'details'] },
        { key: 'accessories', name: 'सहायक सामग्री (Accessories)', col_name: 'accessories', not_null: false, alt_names: ['accessories'] },
        { key: 'nimmit', name: 'निमित्त (Nimitt)', col_name: 'nimmit', not_null: false, ref_table: 'nimitt', alt_names: ['nimitt', 'nimmit', 'निमित्त'] },
      ],
      sampleRows: [
        { product_code: 'EQ-001', purchase_date: '15-10-2026', mm: 'मुम्बई', item: 'कंप्यूटर', subitem: 'डेस्कटॉप', qty: 1, unit: 'नग', aawak_type: 'खरीद', company_name: 'Dell', modal_name: 'OptiPlex', condition: 'नया' }
      ]
    },
    {
      id: 'nimitt',
      name: 'nimitt',
      title: 'Nimitt',
      title_hin: 'Nimitt',
      icon: 'uil-user-check',
      badgeColor: 'success',
      desc: 'Nimitt sewadhari directory with gender, state, and contact details.',
      desc_hin: 'निमित्त भाई-बहनों का रोल नं, नाम, जेंडर, राज्य व निवास क्षेत्र।',
      columns: [
        { key: 'roll_no', name: 'रोल नं (Roll No)', col_name: 'roll_no', not_null: false, alt_names: ['roll no', 'ro no', 'रोल नं'] },
        { key: 'nimitt_hin', name: 'नाम (हिंदी)*', col_name: 'nimitt_hin', not_null: true, alt_names: ['nimitt hin', 'namehin', 'नाम'] },
        { key: 'nimitt_eng', name: 'नाम (English)', col_name: 'nimitt_eng', not_null: false, alt_names: ['nimitt eng', 'nameeng'] },
        { key: 'gender', name: 'जेंडर (Gender)*', col_name: 'gender', not_null: true, ref_table: 'gender', alt_names: ['gender', 'लिंग'] },
        { key: 'state', name: 'राज्य (State)*', col_name: 'state', not_null: true, ref_table: 'state', alt_names: ['state', 'राज्य'] },
        { key: 'relative_name', name: 'पिता / सम्बन्धी नाम', col_name: 'father_name', not_null: false, alt_names: ['father name', 'relative name'] },
        { key: 'townarea', name: 'गाँव / क्षेत्र (Town/Area)', col_name: 'townarea', not_null: false, alt_names: ['town area', 'town_area', 'गाव', 'village'] }
      ],
      sampleRows: [
        { roll_no: '201', nimitt_hin: 'सुरेश भाई', nimitt_eng: 'Suresh Bhai', gender: 'Male', state: 'राजस्थान', townarea: 'आबू रोड' }
      ]
    },
    {
      id: 'category',
      name: 'category',
      title: 'Category',
      title_hin: 'Category',
      icon: 'uil-folder-open',
      badgeColor: 'warning',
      desc: 'Category hierarchy with Hindi, English, and Roman titles.',
      desc_hin: 'वस्तुओं के वर्गीकरण हेतु मुख्य श्रेणी एवं उप-श्रेणी की सूची।',
      columns: [
        { key: 'category_hin', name: 'श्रेणी नाम (हिंदी)*', col_name: 'category_hin', not_null: true, alt_names: ['category hin', 'category', 'श्रेणी'] },
        { key: 'category_eng', name: 'श्रेणी नाम (English)', col_name: 'category_eng', not_null: false, alt_names: ['category eng', 'category_eng'] },
        { key: 'category_roman', name: 'श्रेणी नाम (Roman)', col_name: 'category_roman', not_null: false, alt_names: ['category roman', 'category_roman'] },
        { key: 'parent_category', name: 'मुख्य श्रेणी (Parent)', col_name: 'parent_category', not_null: false, ref_table: 'category', alt_names: ['parent category', 'parent', 'मुख्य श्रेणी'] }
      ],
      sampleRows: [
        { category_hin: 'अनाज एवं दालें', category_eng: 'Grains & Pulses', category_roman: 'Anaaj evam Daale' },
        { category_hin: 'दालें', category_eng: 'Pulses', parent_category: 'अनाज एवं दालें' }
      ]
    },
    {
      id: 'unit',
      name: 'unit',
      title: 'Unit',
      title_hin: 'Unit (इकाई)',
      icon: 'uil-balance-scale',
      badgeColor: 'success',
      desc: 'Measurement units with short and full names.',
      desc_hin: 'माप की इकाइयों के संक्षिप्त एवं पूर्ण नामों की सूची।',
      columns: [
        { key: 'unit_short', name: 'संक्षिप्त नाम (Unit)*', col_name: 'unit_short', not_null: true, alt_names: ['unit_short', 'unit', 'इकाई', 'शॉर्ट'] },
        { key: 'unit_full', name: 'पूर्ण नाम (Full Name)', col_name: 'unit_full', not_null: false, alt_names: ['unit_full', 'full name', 'पूरा नाम'] }
      ],
      sampleRows: [
        { unit_short: 'किग्रा', unit_full: 'किलोग्राम' },
        { unit_short: 'लीटर', unit_full: 'लीटर' },
        { unit_short: 'मीटर', unit_full: 'मीटर' }
      ]
    },
    {
      id: 'state',
      name: 'state',
      title: 'State',
      title_hin: 'State (राज्य)',
      icon: 'uil-map',
      badgeColor: 'info',
      desc: 'State directory with Hindi and English names.',
      desc_hin: 'राज्यों के हिंदी और अंग्रेजी नामों की सूची।',
      columns: [
        { key: 'state_hin', name: 'राज्य नाम (हिंदी)*', col_name: 'state_hin', not_null: true, alt_names: ['state_hin', 'state', 'राज्य'] },
        { key: 'state_eng', name: 'राज्य नाम (English)*', col_name: 'state_eng', not_null: true, alt_names: ['state_eng', 'nameeng'] }
      ],
      sampleRows: [
        { state_hin: 'राजस्थान', state_eng: 'Rajasthan' },
        { state_hin: 'गुजरात', state_eng: 'Gujarat' },
        { state_hin: 'महाराष्ट्र', state_eng: 'Maharashtra' }
      ]
    },
    {
      id: 'city',
      name: 'city',
      title: 'City',
      title_hin: 'City (शहर)',
      icon: 'uil-building',
      badgeColor: 'primary',
      desc: 'City directory linked to corresponding state.',
      desc_hin: 'शहरों के हिंदी, अंग्रेजी नामों एवं सम्बद्ध राज्य की सूची।',
      columns: [
        { key: 'city_hin', name: 'शहर (हिंदी)*', col_name: 'city_hin', not_null: true, alt_names: ['city_hin', 'city', 'शहर'] },
        { key: 'city_eng', name: 'शहर (English)*', col_name: 'city_eng', not_null: true, alt_names: ['city_eng', 'nameeng'] },
        { key: 'state', name: 'राज्य (State)*', col_name: 'state', not_null: true, ref_table: 'state', alt_names: ['state', 'राज्य'] }
      ],
      sampleRows: [
        { city_hin: 'आबू रोड', city_eng: 'Abu Road', state: 'राजस्थान' },
        { city_hin: 'अहमदाबाद', city_eng: 'Ahmedabad', state: 'गुजरात' }
      ]
    },
    {
      id: 'district',
      name: 'district',
      title: 'District',
      title_hin: 'District',
      icon: 'uil-map-marker',
      badgeColor: 'info',
      desc: 'District directory linked to corresponding state.',
      desc_hin: 'राज्य अनुसार जिलों के हिंदी, English व Roman नामों की सूची।',
      columns: [
        { key: 'district_hin', name: 'ज़िला नाम (हिंदी)*', col_name: 'district_hin', not_null: true, alt_names: ['district hin', 'namehin', 'जिला', 'ज़िला'] },
        { key: 'district_eng', name: 'ज़िला नाम (English)*', col_name: 'district_eng', not_null: true, alt_names: ['district eng', 'nameeng'] },
        { key: 'state', name: 'राज्य (State)*', col_name: 'state', not_null: true, ref_table: 'state', alt_names: ['state', 'राज्य'] }
      ],
      sampleRows: [
        { district_hin: 'सिरोही', district_eng: 'Sirohi', state: 'राजस्थान' },
        { district_hin: 'मुम्बई', district_eng: 'Mumbai', state: 'महाराष्ट्र' }
      ]
    },
    {
      id: 'support_list',
      name: 'support_list',
      title: 'Support List',
      title_hin: 'Support List',
      icon: 'uil-list-ul',
      badgeColor: 'secondary',
      desc: 'System lookup values: aawak_type, jawak_type, gender, relation, condition.',
      desc_hin: 'सिस्टम ड्रॉपडाउन के सहायक विकल्प (जैसे aawak_type, jawak_type, gender आदि)।',
      note: 'list_type में aawak_type, jawak_type, gender, relation, condition आदि लोअरकेस में लिखें।',
      columns: [
        { key: 'list_type', name: 'लिस्ट प्रकार (Type)*', col_name: 'list_type', not_null: true, alt_names: ['list type', 'list_type', 'प्रकार'] },
        { key: 'list_name_hin', name: 'नाम (हिंदी)', col_name: 'list_name_hin', not_null: false, alt_names: ['list name hin', 'नाम हिंदी'] },
        { key: 'list_name_eng', name: 'नाम (English)*', col_name: 'list_name_eng', not_null: true, alt_names: ['list name eng', 'नाम english'] },
        { key: 'list_name_roman', name: 'नाम (Roman)', col_name: 'list_name_roman', not_null: false, alt_names: ['list name roman'] }
      ],
      sampleRows: [
        { list_type: 'aawak_type', list_name_hin: 'भेंट / दान', list_name_eng: 'Donation', list_name_roman: 'Bhent' }
      ]
    },
    {
      id: 'attribute',
      name: 'attribute',
      title: 'Attribute',
      title_hin: 'Attribute',
      icon: 'uil-tag-alt',
      badgeColor: 'primary',
      desc: 'Product attribute definitions such as Color, Size, Weight, Brand.',
      desc_hin: 'वेरिएंट निर्माण हेतु विशेषता श्रेणियां (जैसे रंग, साइज़, माप, ब्रांड)।',
      columns: [
        { key: 'attribute_hin', name: 'विशेषता नाम (हिंदी)*', col_name: 'attribute_hin', not_null: true, alt_names: ['attribute hin', 'attr hin', 'attribute_name', 'विशेषता'] },
        { key: 'attribute_eng', name: 'विशेषता नाम (English)', col_name: 'attribute_eng', not_null: false, alt_names: ['attribute eng', 'attr eng'] },
        { key: 'attribute_roman', name: 'विशेषता नाम (Roman)', col_name: 'attribute_roman', not_null: false, alt_names: ['attribute roman', 'attr roman'] }
      ],
      sampleRows: [
        { attribute_hin: 'रंग', attribute_eng: 'Color', attribute_roman: 'Rang' },
        { attribute_hin: 'साइज़', attribute_eng: 'Size', attribute_roman: 'Size' }
      ]
    },
    {
      id: 'attributes_value',
      name: 'attributes_value',
      title: 'Attribute Value',
      title_hin: 'Attribute Value',
      icon: 'uil-brackets-curly',
      badgeColor: 'info',
      desc: 'Values assigned to attributes, e.g., Red, Blue for Color, 500gm for Weight.',
      desc_hin: 'किसी विशेषता के अंतर्गत आने वाले विकल्प (जैसे रंग के लिए लाल, सफेद)।',
      columns: [
        { key: 'attribute', name: 'मूल विशेषता (Attribute)*', col_name: 'attribute', not_null: true, ref_table: 'attribute', alt_names: ['attribute', 'attribute_hin', 'एट्रीब्यूट'] },
        { key: 'attribute_value_hin', name: 'मान (हिंदी)*', col_name: 'attribute_value_hin', not_null: true, alt_names: ['attribute value hin', 'value hin', 'मान'] },
        { key: 'attribute_value_eng', name: 'मान (English)', col_name: 'attribute_value_eng', not_null: false, alt_names: ['attribute value eng', 'value eng'] },
        { key: 'attribute_value_roman', name: 'मान (Roman)', col_name: 'attribute_value_roman', not_null: false, alt_names: ['attribute value roman', 'value roman'] }
      ],
      sampleRows: [
        { attribute: 'रंग', attribute_value_hin: 'सफेद', attribute_value_eng: 'White' },
        { attribute: 'रंग', attribute_value_hin: 'नीला', attribute_value_eng: 'Blue' }
      ]
    },
    {
      id: 'variant',
      name: 'variant',
      title: 'Variant',
      title_hin: 'Variant',
      icon: 'uil-apps',
      badgeColor: 'warning',
      desc: 'Product variants with comma-separated attributes, SKU, and price ranges.',
      desc_hin: 'मूल आइटम के अंतर्गत विभिन्न विशेषताओं के संयोजन से बने वेरिएंट्स।',
      columns: [
        { key: 'item', name: 'मूल आइटम (Item)*', col_name: 'item', not_null: true, ref_table: 'item', alt_names: ['item', 'item_hin', 'आइटम'] },
        { key: 'display_name_hin', name: 'वेरिएंट नाम (हिंदी)*', col_name: 'display_name_hin', not_null: true, alt_names: ['variant_hin', 'display name hin', 'वेरिएंट'] },
        { key: 'display_name_eng', name: 'वेरिएंट नाम (English)', col_name: 'display_name_eng', not_null: false, alt_names: ['variant_eng', 'display name eng'] },
        { key: 'display_name_roman', name: 'वेरिएंट नाम (Roman)', col_name: 'display_name_roman', not_null: false, alt_names: ['variant_roman'] },
        { key: 'attributes_hin', name: 'विशेषताएं (Attributes)*', col_name: 'attributes_hin', not_null: true, type: 'array', alt_names: ['attributes hin', 'attrs hin', 'विशेषताएं'] },
        { key: 'sku', name: 'एसकेयू (SKU)', col_name: 'sku', not_null: false, alt_names: ['sku', 'variant sku'] },
        { key: 'unit', name: 'यूनिट (Unit)', col_name: 'unit', not_null: false, ref_table: 'unit', alt_names: ['unit', 'यूनिट'] },
        { key: 'min_rate', name: 'न्यूनतम दर (Min Rate)', col_name: 'min_rate', not_null: false, type: 'number', alt_names: ['min rate', 'min_rate'] },
        { key: 'max_rate', name: 'अधिकतम दर (Max Rate)', col_name: 'max_rate', not_null: false, type: 'number', alt_names: ['max rate', 'max_rate'] }
      ],
      sampleRows: [
        { item: 'दाल', display_name_hin: 'तुअर दाल (प्रीमियम 1kg)', attributes_hin: '1kg, प्रीमियम', sku: 'DAL-TUR-1K', unit: 'पैकेट', min_rate: 150, max_rate: 180 }
      ]
    },
    {
      id: 'rel_item_category',
      name: 'rel_item_category',
      title: 'Item Category',
      title_hin: 'Item Category',
      icon: 'uil-link',
      badgeColor: 'info',
      desc: 'Map existing items to multiple categories.',
      desc_hin: 'आइटम को उचित श्रेणी अथवा बहु-श्रेणी से जोड़ने की सूची।',
      columns: [
        { key: 'item', name: 'आइटम (Item)*', col_name: 'item', not_null: true, ref_table: 'item', alt_names: ['item', 'itemhin', 'item hin', 'आइटम'] },
        { key: 'category', name: 'श्रेणी (Category)*', col_name: 'category', not_null: true, ref_table: 'category', alt_names: ['category', 'categories', 'श्रेणी'] }
      ],
      sampleRows: [
        { item: 'चीनी', category: 'किराना' }
      ]
    },
    {
      id: 'rel_subitem_category',
      name: 'rel_subitem_category',
      title: 'Subitem Category',
      title_hin: 'Subitem Category',
      icon: 'uil-link-alt',
      badgeColor: 'secondary',
      desc: 'Map specific subitems under items to categories.',
      desc_hin: 'मूल आइटम के सबआइटम को विशिष्ट श्रेणी से सम्बद्ध करने की सूची।',
      columns: [
        { key: 'item', name: 'मूल आइटम (Item)*', col_name: 'item', not_null: true, ref_table: 'item', alt_names: ['item', 'itemhin', 'item hin', 'आइटम'] },
        { key: 'subitem', name: 'सबआइटम (Subitem)*', col_name: 'subitem', not_null: true, ref_table: 'subitem', alt_names: ['subitem', 'subitemhin', 'सबआइटम'] },
        { key: 'category', name: 'श्रेणी (Category)*', col_name: 'category', not_null: true, ref_table: 'category', alt_names: ['category', 'categories', 'श्रेणी'] }
      ],
      sampleRows: [
        { item: 'दाल', subitem: 'अरहर (तुअर)', category: 'किराना' }
      ]
    },
    {
      id: 'subitem_list',
      name: 'subitem_list',
      title: 'Subitem List',
      title_hin: 'Subitem List',
      icon: 'uil-list-ol',
      badgeColor: 'success',
      desc: 'Standard global dictionary of subitem names in Hindi, English, and Roman.',
      desc_hin: 'सामान्य सबआइटम नामों का केंद्रीय शब्दकोश (हिंदी, English व Roman)।',
      columns: [
        { key: 'subitem_hin', name: 'सबआइटम (हिंदी)*', col_name: 'subitem_hin', not_null: true, alt_names: ['subitem hin', 'subitemhin', 'namehin', 'सबआइटम'] },
        { key: 'subitem_eng', name: 'सबआइटम (English)', col_name: 'subitem_eng', not_null: false, alt_names: ['subitem eng', 'subitemeng', 'nameeng'] },
        { key: 'subitem_roman', name: 'सबआइटम (Roman)', col_name: 'subitem_roman', not_null: false, alt_names: ['subitem roman', 'subitemroman'] },
        { key: 'extra_note', name: 'अतिरिक्त नोट (Note)', col_name: 'extra_note', not_null: false, alt_names: ['extra note', 'note', 'नोट'] }
      ],
      sampleRows: [
        { subitem_hin: 'बासमती', subitem_eng: 'Basmati', subitem_roman: 'Basmati' }
      ]
    },
    {
      id: 'mm',
      name: 'mm',
      title: 'MM',
      title_hin: 'MM',
      icon: 'uil-building',
      badgeColor: 'secondary',
      desc: 'Mini Madhuban master list with state, code, and opening details.',
      desc_hin: 'मिनी मधुबन (मि.म.) मास्टर सूची - राज्य, कोड एवं विवरण।',
      columns: [
        { key: 'mm_hin', name: 'मि.म. नाम (हिन्दी)*', col_name: 'mm_hin', not_null: true, alt_names: ['mm_hin', 'mm hin', 'मि.म.', 'मिनी मधुबन', 'नाम'] },
        { key: 'mm_eng', name: 'मि.म. नाम (अंग्रेजी)', col_name: 'mm_eng', not_null: false, alt_names: ['mm_eng', 'mm eng', 'name eng'] },
        { key: 'mm_roman', name: 'रोमन नाम (Roman)', col_name: 'mm_roman', not_null: false, alt_names: ['mm_roman', 'mm roman', 'roman'] },
        { key: 'mm_code', name: 'कोड (Code)', col_name: 'mm_code', not_null: false, alt_names: ['mm_code', 'mm code', 'code', 'कोड'] },
        { key: 'state', name: 'राज्य (State)*', col_name: 'state', not_null: true, ref_table: 'state', alt_names: ['state', 'राज्य', 'स्टेट'] },
        { key: 'opening_date', name: 'खुलने की तारीख (Opening Date)', col_name: 'opening_date', not_null: false, type: 'date', alt_names: ['opening_date', 'opening date', 'तारीख'] },
        { key: 'nimitt', name: 'निमित्त (Nimitt)', col_name: 'nimitt', not_null: false, ref_table: 'nimitt', alt_names: ['nimitt', 'निमित्त'] },
      ],
      sampleRows: [
        { mm_hin: 'मुम्बई', mm_eng: 'Mumbai', mm_roman: 'Mumbai', mm_code: 'BOM', state: 'महाराष्ट्र', opening_date: '01-01-2010' }
      ]
    }
  ];

  constructor(
    private masterIndexer: MasterIndexerService,
    private excelExportService: ExcelExportService
  ) {}

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
        if (col.ref_table === 'subitem') {
          const parentItemVal = this.getParentItemValueFromRow(row, columns);
          const check = this.masterIndexer.isSubitemValidForParent(parentItemVal, strVal);
          if (!check.valid) {
            cell.isValid = false;
            cell.isWarning = false;
            cell.errorMessage = check.message || `'${strVal}' मास्टर लिस्ट में नहीं मिला`;
            errorCount++;
            continue;
          }
        } else {
          const ok = this.masterIndexer.isValid(col.ref_table, strVal);
          if (!ok) {
            cell.isValid = false;
            cell.isWarning = false;
            cell.errorMessage = `'${strVal}' मास्टर लिस्ट में नहीं मिला`;
            errorCount++;
            continue;
          }
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
   * Helper to retrieve the parent item value from a row for subitem contextual filtering & validation
   */
  public getParentItemValueFromRow(row: StudioRow, columns: StudioColumn[]): string {
    if (!row || !row.cells) return '';
    for (const k of ['item', 'item_hin', 'item_name']) {
      const val = row.cells[k]?.value;
      if (val !== null && val !== undefined && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
    const itemCol = columns.find(c => c.ref_table === 'item');
    if (itemCol) {
      const val = row.cells[itemCol.key]?.value;
      if (val !== null && val !== undefined && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
    return '';
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
   * Export Studio rows to styled Excel (Following universal project rule #6)
   */
  public exportExcel(columns: StudioColumn[], rows: StudioRow[], fileName: string = 'HK_Excel_Data'): void {
    const dataRows = rows.filter(r => this.rowHasData(r, columns));
    const targetRows = dataRows.length > 0 ? dataRows : rows;

    const dataForSheet: any[] = [];
    for (const r of targetRows) {
      const rowObj: any = {};
      for (const col of columns) {
        rowObj[col.name] = r.cells[col.key] ? r.cells[col.key].value : '';
      }
      dataForSheet.push(rowObj);
    }

    if (dataForSheet.length > 0) {
      this.excelExportService.exportStyledExcel(dataForSheet, fileName, '');
    }
  }

  /**
   * Builds StudioRow[] from an array of raw database / model objects
   */
  public buildRowsFromRawObjects(format: StudioFormat, rawObjects: any[]): StudioRow[] {
    const resultRows: StudioRow[] = [];
    if (!rawObjects || !Array.isArray(rawObjects)) return resultRows;

    for (let i = 0; i < rawObjects.length; i++) {
      const raw = rawObjects[i];
      const row: StudioRow = {
        rowNum: resultRows.length + 1,
        cells: {},
        hasError: false,
        errorCount: 0
      };

      for (const col of format.columns) {
        let val: any = '';
        if (col.key === 'sn') {
          val = i + 1;
        } else if (raw[col.key] !== undefined && raw[col.key] !== null) {
          val = raw[col.key];
        } else if (col.col_name && raw[col.col_name] !== undefined && raw[col.col_name] !== null) {
          val = raw[col.col_name];
        }

        // For bachat format: ensure sw_qty is preserved and qty is blank for physical counting
        if (format.id === 'bachat') {
          if (col.key === 'qty' && (val === undefined || val === null || val === '')) {
            val = '';
          }
        }

        row.cells[col.key] = {
          value: val !== null && val !== undefined ? String(val) : '',
          isValid: true
        };
      }

      this.validateRow(row, format.columns);
      resultRows.push(row);
    }

    // Append 5 empty padding rows so user can enter more data easily
    for (let p = 0; p < 5; p++) {
      const emptyCells: { [k: string]: StudioCell } = {};
      for (const col of format.columns) {
        emptyCells[col.key] = { value: '', isValid: true };
      }
      resultRows.push({
        rowNum: resultRows.length + 1,
        cells: emptyCells,
        hasError: false,
        errorCount: 0
      });
    }

    return resultRows;
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
