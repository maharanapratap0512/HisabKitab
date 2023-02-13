import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExcelImportService {

  import_list: any = [
    { name: 'destribution' },
    { name: 'pbk' },
    { name: 'vehicle' },
    { name: 'nimitt' },
  ];
  config: any = {
    vehicle: [
      { name: 'mm', alt_names: ["mm_name", "mm name"], not_null: true },
      { name: 'vehicle_type', alt_names: ["vehicle type", "gadi type", "gadi_type"], not_null: false },
      { name: 'gadi_name', alt_names: ["gadi name", "vehicle name", "vehicle_name"], not_null: false },
      { name: 'gadi_num', alt_names: ["gadi num", "vehicle num", "vehicle_num", "gadi_no", "gadi no", "vehicle no", "vehicle_no"], not_null: true },
      { name: 'fuel', alt_names: ["fuel type", "fuel_type"], not_null: false },
      { name: 'seating_capacity', alt_names: ["seating capacity"], not_null: false },
      { name: 'aawak_type', alt_names: ["aawak type", "awk type", "awk_type"], not_null: true },
    ]
  }
  constructor() { }

  generateSequencialArray(count: number) {
    return Array(count).keys();
  }
}
