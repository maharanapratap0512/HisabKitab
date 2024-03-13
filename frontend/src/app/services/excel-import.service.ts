import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExcelImportService {

  importList: any = [
    { name: 'destribution' },
    { name: 'pbk' },
    { name: 'vehicle', secondHeader: false, autoUpdate: true },
    { name: 'nimitt' },
    { name: 'product', autoUpdate: true },
  ];
  config: any = {
    vehicle: [
      { col_name: 'mm', name: 'mm', alt_names: ["mm_name", "mm name", "मि.म.", "मि म", "मिनी मधुबन"], not_null: true, ref_table: 'mm', ref_field: 'mm_id', ref_data: 'mm_hin' },
      { col_name: 'vehicle_type', name: 'vehicle_type', alt_names: ["vehicle type", "gadi type", "gadi_type"], not_null: false },
      { col_name: 'gadi_name', name: 'gadi_name', alt_names: ["gadi name", "vehicle name", "vehicle_name"], not_null: false },
      { col_name: 'gadi_num', name: 'gadi_num', alt_names: ["gadi num", "vehicle num", "vehicle_num", "gadi_no", "gadi no", "vehicle no", "vehicle_no"], not_null: true },
      { col_name: 'fuel_type', name: 'fuel_type', alt_names: ["fuel type", "fuel"], not_null: false },
      { col_name: 'seating_capacity', name: 'seating_capacity', alt_names: ["seating capacity"], not_null: false },
      { col_name: 'owner_name', name: 'owner_name', alt_names: ["owner", "owner name"], not_null: false },
      { col_name: 'nominee', name: 'nominee', alt_names: ["nomini"], not_null: false },
      { col_name: 'aawak_type', name: 'aawak_type', alt_names: ["aawak type", "awk type", "awk_type"], not_null: true },
      { col_name: 'rc_date', name: 'rc_date', type: 'unix_date', alt_names: ['rc'], not_null: false },
      { col_name: 'rc_exp_date', name: 'rc_exp_date', type: 'unix_date', alt_names: ["rc expiry", "rc_expiry", "rc exp"], not_null: false },
      { col_name: 'rc_amount', name: 'rc_amount', alt_names: ["rc amount", "rc_amt", "rc amt"], not_null: false },
      { col_name: 'insurance_date', name: 'insurance_date', type: 'unix_date', alt_names: ["ins", "insurance"], not_null: false },
      { col_name: 'insurance_exp_date', name: 'insurance_exp_date', type: 'unix_date', alt_names: ["insurance_expiry", "insurance expiry", "insurance_exp", "insurance exp", "ins expiry", "ins_expiry", "ins exp", "ins_exp"], not_null: false },
      { col_name: 'insurance_type', name: 'insurance_type', alt_names: ["insurance type", "insurance_party", "insurance party", "ins party", "ins_party"], not_null: false },
      { col_name: 'insurance_amount', name: 'insurance_amount', alt_names: ["insurance amount", "insurance_amt", "insurance amt", "ins amount", "ins_amount", "ins_amt", "ins amt"], not_null: false },
      { col_name: 'puc_date', name: 'puc_date', type: 'unix_date', alt_names: ['puc'], not_null: false },
      { col_name: 'puc_exp_date', name: 'puc_exp_date', type: 'unix_date', alt_names: ["puc_expiry", "puc expiry", "puc_exp", "puc exp"], not_null: false },
      { col_name: 'puc_amount', name: 'puc_amount', alt_names: ["puc amount", "puc_amt", "puc amt"], not_null: false },

    ],
    product: [
      { col_name: 'sr_num', name: 'sr_no', alt_names: ["sr no", "sr number", "sr num", "sr_num", "serial no"], not_null: false },
      { col_name: 'product_code', name: 'product_code', alt_names: ["product code", "pr_code", "pr code"], not_null: false },
      { col_name: 'purchase_date', name: 'purchase_date', alt_names: ["date", "तारीख"], not_null: false },
      { col_name: 'mm', name: 'mm', alt_names: ["mm_name", "mm name", "मि.म.", "मि म", "मिनी मधुबन"], not_null: true, ref_table: 'mm', ref_field: 'mm_id', ref_data: 'mm_hin' },
      { col_name: 'item', name: 'item', alt_names: ["item_name", "item name", "आइटम", "आइटम का नाम"], not_null: true, ref_table: 'item', ref_field: 'item_id', ref_data: 'item_hin' },
      { col_name: 'subitem', name: 'subitem', alt_names: ["subitem_name", "subitem name", "सबआइटम", "सबआइटम का नाम"], not_null: false, ref_table: 'subitem', ref_field: 'subitem_id', ref_data: 'subitem_hin' },
      { col_name: 'qty', name: 'qty', alt_names: ["quantity", "संख्या"], not_null: true },
      { col_name: 'unit', name: 'unit', alt_names: ["यूनिट"], not_null: true, ref_table: 'unit', ref_field: 'unit_id', ref_data: 'unit_short' },
      { col_name: 'aawak_type', name: 'aawak_type', alt_names: ["आवक टाइप"], not_null: true, ref_table: 'aawak_type', ref_field: 'aawak_type_id', ref_data: 'list_name_hin' },
      { col_name: 'company_name', name: 'company', alt_names: ["company_name", "कंपनी", "company", "company name"], not_null: false },
      { col_name: 'modal_name', name: 'modal', alt_names: ["modal_name", "modal name", "मोडेल"], not_null: false },
      { col_name: 'condition', name: 'condition', alt_names: ["कन्डिशन"], not_null: true, ref_table: 'condition', ref_field: 'condition_id', ref_data: 'list_name_hin' },
      { col_name: 'warranty_period', name: 'warranty_period', alt_names: ["वॉरन्टी समय", "वॉरन्टी", "warranty", "warranty period"], not_null: false },
      { col_name: 'warranty_from', name: 'warranty_from', alt_names: ["warranty from", "वॉरन्टी कहाँ से ?", "वॉरन्टी कहाँ से"], not_null: false },
      { col_name: 'purchase_from', name: 'purchase_from', alt_names: ["purchase from", "कहाँ से खरीदा"], not_null: false },
      { col_name: 'purchased_by', name: 'purchased_by', alt_names: ["purchased by", "purchase by", "किसके थ्रू"], not_null: false },
      { col_name: 'product_detail', name: 'product_detail', alt_names: ["product detail", "डेटाइल माहिती"], not_null: false },
      { col_name: 'accessories', name: 'accessories', alt_names: ["साथ मे क्या2 आया"], not_null: false },
      { col_name: 'nimmit', name: 'nimmit', alt_names: ["निमित्त"], not_null: false, ref_table: 'nimitt', ref_field: 'nimitt_id', ref_data: 'nimitt_hin' },

    ],
    pbk: [
      { col_name: 'roll_no', name: 'roll_no', alt_names: ["roll no", "ro no", "रोल नंबर", "रोल नं", "roll number"], not_null: false,  },
      { col_name: 'pbk_hin', name: 'pbk_hin', alt_names: ["pbk hin"], not_null: true,  },
      { col_name: 'pbk_eng', name: 'pbk_eng', alt_names: ["pbk eng"], not_null: false,  },
      { col_name: 'gender', name: 'gender', alt_names: [], not_null: true, ref_table: 'gender', ref_field: 'gender', ref_data: 'list_name_eng  ' },
      { col_name: 'state', name: 'state', alt_names: ["स्टेट", "राज्य"], not_null: true, ref_table: 'state', ref_field: 'state_id', ref_data: 'state_hin' },
      { col_name: 'relation', name: 'relation', alt_names: [], not_null: false, ref_table: 'relation', ref_field: 'relation', ref_data: 'list_name_eng' },
      { col_name: 'relative_name', name: 'relative_name', alt_names: ["relative name"], not_null: false,  },
      { col_name: 'birth_date', name: 'birth_date', alt_names: ["date of birth", "dob", "birth date", "जन्म तारीख"], type:'date', not_null: false },
      { col_name: 'age', name: 'age', alt_names: ["उम्र"], not_null: false },
      { col_name: 'address', name: 'address', alt_names: ["पता"], not_null: false },
      { col_name: 'town_area', name: 'town_area', alt_names: ["town area", "townarea", "गाव", "village"], not_null: false },
      { col_name: 'city', name: 'city', alt_names: ["city_hin", "city_eng", "शहर"], not_null: false, ref_table: 'city', ref_field: 'city_id', ref_data: 'city_hin' },
      { col_name: 'mo_no', name: 'mo_no', alt_names: ["mobile no", "mobile number", "mo no"], not_null: false },
      { col_name: 'alt_mo_no', name: 'alt_mo_no', alt_names: ["alternative mobile no", "alternative mobile number", "alt mo no", "alt mobile no"], not_null: false },
      { col_name: 'class_mm', name: 'class_mm', alt_names: ["mm_name", "mm name", "मि.म.", "क्लास मि म", "क्लास मिनी मधुबन", "daily class mm", "class mm name", "क्लास मि.म.", "मि म", "मिनी मधुबन"], not_null: false, ref_table: 'mm', ref_field: 'class_mm_id', ref_data: 'mm_hin' },
      { col_name: 'bhatti_date', name: 'bhatti_date', alt_names: ["bhatti date", "भट्ठी तारीख", "भट्ठी कब किया", "भट्ठी कब किया?"], type:'date', not_null: false },

    ],
  }
  constructor() { }

  generateSequencialArray(count: number) {
    return Array(count).keys();
  }
}
