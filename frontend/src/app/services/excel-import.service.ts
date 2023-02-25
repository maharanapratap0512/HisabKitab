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
  ];
  config: any = {
    vehicle: [
      { col_name: 'mm', name: 'mm', alt_names: ["mm_name", "mm name"], not_null: true, ref_table: 'mm', ref_field: 'mm_id', ref_data: 'mm_hin' },
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

    ]
  }
  constructor() { }

  generateSequencialArray(count: number) {
    return Array(count).keys();
  }
}
