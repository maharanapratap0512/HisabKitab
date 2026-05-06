import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableFieldsService {

  constructor() { }

  getFieldsForTable(tableName: string, settings: any = null): any[] {
     switch (tableName.toLowerCase()) {
         case 'mm': return this.setMMFields(settings);
         case 'country': return this.setCountryFields();
         case 'zone': return this.setZoneFields();
         case 'state': return this.setStateFields();
         case 'district': return this.setDistrictFields();
         case 'category': return this.setCategoryFields(settings);
         case 'unit': return this.setUnitFields();
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
         case 'vehicle': return this.setVehicleFields();
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

  setCountryFields() {
    return [
      { title: "Country(Hin)", columns: ["country_hin"] }, 
      { title: "Country(Eng)", columns: ["country_eng"] }
    ];
  }

  setUnitFields() {
    return [
      { title: "Unit(Full)", columns: ["unit_full"] }, 
      { title: "Unit(Short)", columns: ["unit_short"] }
    ];
  }

  setMMFields(settings: any) {
    let fields: any = [
      { title: "MM(Hin)", columns: ["mm_hin"] }
    ];
    if (settings && settings.mm_eng) fields.push({ title: "MM(Eng)", columns: ["mm_eng"] });
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

  setZoneFields() {
    return [
      { title: "Zone(Hin)", columns: ["zone_hin"] }, 
      { title: "Zone(Eng)", columns: ["zone_eng"] }, 
      { title: "Country", columns: ["country_hin", "country_eng"] }
    ];
  }

  setDistrictFields() {
    return [
      { title: "District(Hin)", columns: ["district_hin"] }, 
      { title: "District(Eng)", columns: ["district_eng"] }, 
      { title: "State", columns: ["state_hin", "state_eng"] }, 
      { title: "Country", columns: ["country_hin", "country_eng"] }
    ];
  }

  setStateFields() {
    return [
      { title: "State(Hin)", columns: ["state_hin"] }, 
      { title: "State(Eng)", columns: ["state_eng"] }, 
      { title: "Zone", columns: ["zone_hin", "zone_eng"] }, 
      { title: "Country", columns: ["country_hin", "country_eng"] }
    ];
  }

  setSubitemListFields(settings: any) {
    return [
      { title: "Subitem(Hin)", columns: ["subitem_hin"] },
      { title: "Subitem(Eng)", columns: ["subitem_eng"] },
      { title: "Subitem(Roman)", columns: ["subitem_roman"] }
    ];
  }

  setItemFields(settings: any) {
    return [
      { title: "Item(Hin)", columns: ["item_hin"] },
      { title: "Item(Eng)", columns: ["item_eng"] },
      { title: "Item(Roman)", columns: ["item_roman"] }
    ];
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

  setVehicleFields() {
      return [
          { title: "Vehicle No", columns: ["vehicle_no"] },
          { title: "Type", columns: ["vehicle_type"] }
      ];
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
