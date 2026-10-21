import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableFieldsService {

  constructor() { }

  getFieldsForTable(tableName: string, settings: any = null): any[] {
     switch (tableName.toLowerCase()) {
         case 'mm': return this.setMMFields(settings);
         case 'country': return this.setCountryFields(settings);
         case 'zone': return this.setZoneFields(settings);
         case 'state': return this.setStateFields(settings);
         case 'district': return this.setDistrictFields(settings);
         case 'city': return this.setCityFields(settings);
         case 'category': return this.setCategoryFields(settings);
         case 'unit': return this.setUnitFields(settings);
         case 'subitem_list': 
         case 'subitem': return this.setSubitemListFields(settings);
         case 'item': return this.setItemFields(settings);
         case 'department': return this.setDepartmentFields();
         case 'gender':
         case 'mm_type':
         case 'relation':
         case 'status':
         case 'aawak_type':
         case 'aawak_source':
         case 'usage_list':
         case 'jawak_type':
         case 'condition':
         case 'prastav_type':
         case 'support_list': return this.setSupportListFields(settings);
         case 'jawak': return this.setJawakFields();
         case 'aawak': return this.setAawakFields();
         case 'bachat': return this.setBachatFields();
         case 'bachat_new': return this.setBachatNewFields();
         case 'lot_no': return this.setLotNoFields();
         case 'dictionary':
         case 'dict': return this.setDictFields();
         case 'pbk': return this.setPbkFields(settings);
         case 'nimitt': return this.setNimittFields(settings);
         case 'vehicle': return this.setVehicleFields(settings);
         case 'vehicle_document': return this.setVehicleDocumentFields();
         case 'point': return this.setPointFields();
         default: return [{ title: "Details", columns: [`${tableName}_hin`, `${tableName}_eng`] }];
     }
  }

  setSupportListFields(settings: any) {
    let fields = [
      { title: "Name(Hin)", columns: ["list_name_hin", "name_hin"] }, 
      { title: "Name(Eng)", columns: ["list_name_eng", "name_eng"] }
    ];
    if (settings && settings.list_name_roman) {
      fields.push({ title: "Name(Roman)", columns: ["list_name_roman"] });
    }
    return fields;
  }

  setDictFields() {
    return [
      { title: "Type", columns: ["type"] }, 
      { title: "name", columns: ["name"] }, 
      { title: "Extra Note", columns: ["extra_note"] }, 
      { title: "Original Name", columns: ["original_name"] }, 
      { title: "Sub Name", columns: ["sub_name"] }
    ];
  }

  setDepartmentFields() {
    return [
      { title: "Name(Hin)", columns: ["dept_hin"] }, 
      { title: "Name(Eng)", columns: ["dept_eng"] }, 
      { title: "Code", columns: ["dept_code"] }
    ];
  }

  setCategoryFields(settings: any) {
    let fields: any = [
      { title: "Category(Hin)", columns: ["category_hin"] }
    ];
    if (settings && settings.category_eng) {
      fields.push({ title: "Category(Eng)", columns: ["category_eng"] });
    }
    if (settings && settings.category_roman) {
      fields.push({ title: "Category(Roman)", columns: ["category_roman"] });
    }
    return fields;
  }

  setCountryFields(settings: any = null) {
    let fields: any = [
      { title: "Country(Hin)", columns: ["country_hin"] }
    ];
    if (!settings || settings.country_eng !== false) fields.push({ title: "Country(Eng)", columns: ["country_eng"] });
    if (settings && settings.country_roman) fields.push({ title: "Country(Roman)", columns: ["country_roman"] });
    if (settings && settings.country_code) fields.push({ title: "Country Code", columns: ["country_code"] });
    if (settings && settings.dial_code) fields.push({ title: "Dial Code", columns: ["dial_code"] });
    return fields;
  }

  setUnitFields(settings: any = null) {
    let fields: any[] = [];
    if (!settings || settings.unit_full !== false) fields.push({ title: "Unit(Full)", columns: ["unit_full"] });
    if (!settings || settings.unit_short !== false) fields.push({ title: "Unit(Short)", columns: ["unit_short"] });
    if (settings && settings.unit_roman) fields.push({ title: "Unit(Roman)", columns: ["unit_roman"] });
    return fields.length ? fields : [{ title: "Unit(Short)", columns: ["unit_short"] }];
  }

  setMMFields(settings: any) {
    let fields: any = [
      { title: "MM(Hin)", columns: ["mm_hin"] }
    ];
    if (!settings || settings.mm_eng !== false) fields.push({ title: "MM(Eng)", columns: ["mm_eng"] });
    if (settings && settings.mm_roman) fields.push({ title: "MM(Roman)", columns: ["mm_roman"] });
    if (settings && settings.mm_code) fields.push({ title: "MM Code", columns: ["mm_code"] });
    
    fields.push(...[
      { title: "MM Type", columns: ["mm_type"] }, 
      { title: "Parent MM", columns: ["parent_mm_hin", "parent_mm_eng", "parent_mm_code"] }, 
      { title: "State", columns: ["state_hin", "state_eng"] }, 
      { title: "Opening Date", columns: ["opening_date"] }
    ]);
    return fields;
  }

  setZoneFields(settings: any = null) {
    let fields: any = [
      { title: "Zone(Hin)", columns: ["zone_hin"] }
    ];
    if (!settings || settings.zone_eng !== false) fields.push({ title: "Zone(Eng)", columns: ["zone_eng"] });
    if (settings && settings.zone_roman) fields.push({ title: "Zone(Roman)", columns: ["zone_roman"] });
    if (settings && settings.zone_code) fields.push({ title: "Zone Code", columns: ["zone_code"] });
    fields.push({ title: "Country", columns: ["country_hin", "country_eng"] });
    return fields;
  }

  setDistrictFields(settings: any = null) {
    let fields: any = [
      { title: "District(Hin)", columns: ["district_hin"] }
    ];
    if (!settings || settings.district_eng !== false) fields.push({ title: "District(Eng)", columns: ["district_eng"] });
    if (settings && settings.district_roman) fields.push({ title: "District(Roman)", columns: ["district_roman"] });
    if (settings && settings.district_code) fields.push({ title: "District Code", columns: ["district_code"] });
    if (!settings || settings.state_id !== false) fields.push({ title: "State", columns: ["state_hin", "state_eng"] });
    fields.push({ title: "Country", columns: ["country_hin", "country_eng"] });
    return fields;
  }

  setStateFields(settings: any = null) {
    let fields: any = [
      { title: "State(Hin)", columns: ["state_hin"] }
    ];
    if (!settings || settings.state_eng !== false) fields.push({ title: "State(Eng)", columns: ["state_eng"] });
    if (settings && settings.state_roman) fields.push({ title: "State(Roman)", columns: ["state_roman"] });
    if (settings && settings.state_code) fields.push({ title: "State Code", columns: ["state_code"] });
    if (!settings || settings.zone_id !== false) fields.push({ title: "Zone", columns: ["zone_hin", "zone_eng"] });
    if (!settings || settings.country_id !== false) fields.push({ title: "Country", columns: ["country_hin", "country_eng"] });
    return fields;
  }

  setCityFields(settings: any = null) {
    let fields: any = [
      { title: "City(Hin)", columns: ["city_hin"] }
    ];
    if (!settings || settings.city_eng !== false) fields.push({ title: "City(Eng)", columns: ["city_eng"] });
    if (settings && settings.city_roman) fields.push({ title: "City(Roman)", columns: ["city_roman"] });
    if (settings && settings.city_code) fields.push({ title: "City Code", columns: ["city_code"] });
    if (!settings || settings.district_id !== false) fields.push({ title: "District", columns: ["district_hin", "district_eng"] });
    if (!settings || settings.state_id !== false) fields.push({ title: "State", columns: ["state_hin", "state_eng"] });
    if (settings && settings.zone_id) fields.push({ title: "Zone", columns: ["zone_hin", "zone_eng"] });
    return fields;
  }

  setSubitemListFields(settings: any = null) {
    let fields: any = [
      { title: "Subitem(Hin)", columns: ["subitem_hin"] }
    ];
    if (!settings || (settings.subitem_list_eng !== false && settings.subitem_eng !== false)) {
      fields.push({ title: "Subitem(Eng)", columns: ["subitem_eng"] });
    }
    if (settings && (settings.subitem_list_roman || settings.subitem_roman)) {
      fields.push({ title: "Subitem(Roman)", columns: ["subitem_roman"] });
    }
    if (settings && (settings.subitem_code || settings.subitem_list_code)) {
      fields.push({ title: "Code", columns: ["subitem_code"] });
    }
    return fields;
  }

  setItemFields(settings: any) {
    let fields: any = [
      { title: "Item(Hin)", columns: ["item_hin"] }
    ];
    if (!settings || settings.item_eng !== false) fields.push({ title: "Item(Eng)", columns: ["item_eng"] });
    if (settings && settings.item_roman) fields.push({ title: "Item(Roman)", columns: ["item_roman"] });
    if (settings && settings.item_code) fields.push({ title: "Item Code", columns: ["item_code"] });
    return fields;
  }

  setPbkFields(settings: any) {
      return [
          { title: "Roll No", columns: ["roll_no"] },
          { title: "Name(Hin)", columns: ["pbk_hin"] },
          { title: "Name(Eng)", columns: ["pbk_eng"] }
      ];
  }

  setNimittFields(settings: any) {
      return [
          { title: "Name(Hin)", columns: ["nimitt_hin"] },
          { title: "Name(Eng)", columns: ["nimitt_eng"] }
      ];
  }

  setVehicleFields(settings: any = null) {
      let fields: any = [
          { title: "Vehicle No", columns: ["gadi_num", "vehicle_no"] }
      ];
      if (!settings || settings.gadi_name !== false) fields.push({ title: "Vehicle Name", columns: ["gadi_name"] });
      if (!settings || settings.vehicle_type !== false) fields.push({ title: "Type", columns: ["vehicle_type"] });
      if (!settings || settings.fuel_type !== false) fields.push({ title: "Fuel", columns: ["fuel_type"] });
      if (!settings || settings.owner_name !== false) fields.push({ title: "Owner", columns: ["owner_name"] });
      return fields;
  }
  
  setVehicleDocumentFields() {
      return [
          { title: "Doc Name", columns: ["doc_name"] }
      ];
  }
  
  setPointFields() {
      return [
          { title: "Point Name", columns: ["point_name"] }
      ];
  }

  setJawakFields() {
    return [
      { title: "Date", columns: ["date"] }, 
      { title: "Pkt No.", columns: ["pkt_num"] }, 
      { title: "Jawak MM", columns: ["jawak_mm_hin", "jawak_mm_eng"] }, 
      { title: "Item", columns: ["item_hin", "subitem_hin", "item_eng", "subitem_eng"] }, 
      { title: "Qty", columns: ["qty", "unit_short"] }, 
      { title: "Item Detail", columns: ["item_detail"] }, 
      { title: "Jawak Type", columns: ["jawak_type_hin", "jawak_type_eng"] }, 
      { title: "Description", columns: ["description"] }, 
      { title: "Nimitt", columns: ["nimitt_hin"] }
    ];
  }

  setLotNoFields() {
    return [
      { title: "Date", columns: ["date"] }, 
      { title: "Lot No.", columns: ["lot_no"] }, 
      { title: "MM", columns: ["mm_hin"] }, 
      { title: "Aawak MM", columns: ["aawak_mm_hin"] }, 
      { title: "Item - Subitem", columns: ["item_hin", "subitem_hin"] }, 
      { title: "Qty", columns: ["qty", "unit_short"] }, 
      { title: "Rate", columns: ["rate"] }, 
      { title: "Aawak Source", columns: ["aawak_source_hin"] }, 
      { title: "Aawak Type", columns: ["aawak_type_hin"] }
    ];
  }
  setAawakFields() {
    return [
      { title: "Date", columns: ["date"] },
      { title: "Lot No.", columns: ["lot_no"] },
      { title: "MM", columns: ["mm_hin", "mm_eng"] },
      { title: "Item", columns: ["item_hin", "subitem_hin"] },
      { title: "Qty", columns: ["qty", "unit_short"] },
      { title: "Rate", columns: ["rate"] },
      { title: "Aawak Type", columns: ["aawak_type_hin"] }
    ];
  }

  setBachatFields() {
    return [
      { title: "MM", columns: ["mm_hin", "mm_eng"] },
      { title: "Item", columns: ["item_hin", "subitem_hin"] },
      { title: "Stock", columns: ["Stock"] },
      { title: "Used", columns: ["Used"] },
      { title: "New", columns: ["New"] },
      { title: "unit", columns: ["unit_short"] }
    ];
  }

  setBachatNewFields() {
    return [
      { title: "Month/Year", columns: ["month", "year"] },
      { title: "MM", columns: ["mm_hin", "mm_eng"] },
      { title: "Item", columns: ["item_hin", "subitem_hin"] },
      { title: "Aawak", columns: ["total_aawak"] },
      { title: "Jawak", columns: ["jawak"] },
      { title: "Bachat", columns: ["bachat"] },
      { title: "unit", columns: ["unit_short"] }
    ];
  }
}
