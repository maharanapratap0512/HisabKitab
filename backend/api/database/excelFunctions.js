class ExcelFunctions {
   mm = null;
   category = null;
   city = null;
   country = null;
   state = null;
   zone = null;
   item = null;
   subitem = null;
   subitem_list = null;
   support_list = null;
   unit = null;
   nimitt = null;
   pbk = null;
   dict = {};
   correctionList = [];
   // DB;
   // DBContex;
   Fn;
   dept_id;
   jsonKey = ['document', 'categories']
   booleanKey = ['is_xl', 'isbill', 'is_auto_pd']
   voucherTables = ['product']
   bunchTables = ['product']
   vehicle_form = {
      mm_id: null,
      vehicle_type: null,
      gadi_name: null,
      gadi_num: null,
      fuel_type: null,
      seating_capacity: null,
      owner_name: null,
      nominee: null,
      aawak_type: null,
      rc_date: null,
      rc_exp_date: null,
      rc_amount: null,
      insurance_date: null,
      insurance_exp_date: null,
      insurance_amount: null,
      insurance_type: null,
      insurance_company: null,
      puc_date: null,
      puc_exp_date: null,
      puc_amount: null
   }
   product_form = {
      model_name: null,
      company_name: null,
      price: null,
      condition_id: null,
      warranty_period: null,
      warranty_from: null,
      purchase_date: null,
      purchase_from: null,
      purchased_by: null,
      product_code: null,
      sr_num: null,
      product_detail: null,
      item_id: null,
      subitem_id: null,
      unit_id: null,
      mm_id: null,
      document: [],
      dept_id: null,
      accessories: null,
      nimitt_id: null,
      isbill: false,
      qty: null,
      is_xl: false,
      bunch_no: null,
      voucher_no: null,
      aawak_type_id: null,
      awk_id: null,
   }
   pbk_form = {
      roll_no: null,
      pbk_eng: null,
      pbk_hin: null,
      relation: null,
      relative_name: null,
      relative_ref: null,
      gender: null,
      age: null,
      birth_date: null,
      status: null,
      townarea: null,
      address: null,
      city_id: null,
      state_id: null,
      district_id: null,
      mo_no: null,
      alt_mo_no: null,
      class_mm_id: null,
      bhatti_date: null,
      document: null
   }
   nimitt_form = {
      roll_no: null,
      nimitt_eng: null,
      nimitt_hin: null,
      relative_name: null,
      gender: null,
      townarea: null,
      state_id: null,
      document: null,
      active: 1
   }
   subitem_list_form = {
      subitem_eng: null,
      subitem_hin: null,
      subitem_roman: null,
      active: 1
   }
   item_form = {
      item_hin: null,
      item_eng: null,
      item_roman: null,
      item_code: null,
      unit_id: null,
      categories: [],
      extra_note: null,
      restrict_month: null,
      restrict_year: null,
      min_rate: 0,
      max_rate: 0,
      document: []
   }
   subitem_form = {
      subitem_hin: null,
      subitem_eng: null,
      subitem_roman: null,
      unit_id: null,
      item_id: null,
      categories: [],
      extra_note: null,
      document: null,
      restrict_month: null,
      restrict_year: null,
      min_rate: 0,
      max_rate: 0,
   }
   support_list_form = {
      list_type: null,
      list_name_eng: null,
      list_name_hin: null,
      list_name_roman: null,
      active: 1
   }
   category_form = {
      category_eng: null,
      category_hin: null,
      category_roman: null
   }
   district_form = {
      district_eng: null,
      district_hin: null,
      state_id: null
   }
   constructor(list, dept_id = null) {
      // this.DBContex = require('./DBContex');
      // this.DB = new this.DBContex(); 
      this.dept_id = dept_id;
      this.Fn = require('./functions');
      for (let i in list) {
         this.dict[list[i]] = this.Fn.getDictionary(list[i]);
         switch (list[i]) {
            case 'mm':
               this.mm = this.Fn.getMMs(dept_id);
               break;
            case 'category':
               this.category = this.Fn.getCategories(dept_id);
               break;
            case 'item':
               this.item = this.Fn.getitems(dept_id);
               this.subitem = this.Fn.getSubitems(dept_id);
               break;
            case 'subitem':
               this.subitem = this.Fn.getSubitems(dept_id);
               this.subitem_list = this.Fn.getSubiemList(dept_id);
               break;
            case 'subitem_list':
               this.subitem_list = this.Fn.getSubiemList(dept_id);
               break;
            case 'state':
               this.state = this.Fn.getStates(dept_id);
               break;
            case 'district':
               this.district = this.Fn.getDistricts(dept_id);
               break;
            case 'zone':
               this.zone = this.Fn.getZones(dept_id);
               break;
            case 'country':
               this.country = this.Fn.getCountries(dept_id);
               break;
            case 'city':
               this.city = this.Fn.getCities(dept_id);
               break;
            case 'nimitt':
               this.nimitt = this.Fn.getNimitts(dept_id);
               break;
            case 'pbk':
               this.pbk = this.Fn.getPbks(dept_id);
               break;
            case 'unit':
               this.unit = this.Fn.getUnits(dept_id);
               break;
            case 'support_list':
            case 'condition':
            case 'gender':
               this.support_list = this.Fn.getSupportList(dept_id);
               break;
            default:
         }
      }
   }

   checkedButNotFound(data, listType) {
      let found = false;
      for (let i in this.correctionList) {
         if (this.correctionList[i].type == listType && this.correctionList[i].name == data) {
            found = true;
            break;
         }
      }
      return found;
   }

   async matchMMs(data) {
      if (this.mm instanceof Promise) {
         this.mm = await this.mm.then((data) => { return data })
      }
      if (this.dict.mm instanceof Promise) {
         this.dict.mm = await this.dict.mm.then((data) => { return data });
      }
      // console.log("start matching", this.mm);
      if (!this.checkedButNotFound(data, 'mm')) {
         for (let i in this.mm) {
            if ([this.mm[i].mm_hin, this.mm[i].mm_eng, this.mm[i].mm_code].includes(data)) {
               return this.mm[i]._id;
            }
         }
         for (let i in this.dict.mm) {
            if (this.dict.mm[i].name == data) {
               return this.dict.mm[i].id;
            }
         }
         this.correctionList.push({ type: 'mm', name: data });
      }
      return null;
   }

   async matchCategory(data) {
      if (this.category instanceof Promise) {
         this.category = await this.category.then((data) => { return data })
      }
      if (this.dict.category instanceof Promise) {
         this.dict.category = await this.dict.category.then((data) => { return data });
      }
      // console.log("start matching", this.category);
      if (!this.checkedButNotFound(data, 'category')) {
         for (let i in this.category) {
            if ([this.category[i].category_hin, this.category[i].category_eng, this.category[i].category_roman].includes(data)) {
               return this.category[i]._id;
            }
         }
         for (let i in this.dict.category) {
            if (this.dict.category[i].name == data) {
               return this.dict.category[i].id;
            }
         }
         this.correctionList.push({ type: 'category', name: data });
      }
      return null;
   }

   async matchCategories(data) {
      let arr = [];
      if (data) {
         for (let cat of data) {
            arr.push(await this.matchCategory(cat.trim().toLowerCase()));
         }
      }
      return arr;
   }

   async matchCountry(data) {
      if (this.country instanceof Promise) {
         this.country = await this.country.then((data) => { return data })
      }
      if (this.dict.country instanceof Promise) {
         this.dict.country = await this.dict.country.then((data) => { return data });
      }
      // console.log("start matching", this.country);
      if (!this.checkedButNotFound(data, 'country')) {
         for (let i in this.country) {
            if ([this.country[i].country_hin, this.country[i].country_eng].includes(data)) {
               return this.country[i]._id;
            }
         }
         for (let i in this.dict.country) {
            if (this.dict.country[i].name == data) {
               return this.dict.country[i].id;
            }
         }
         this.correctionList.push({ type: 'country', name: data });
      }
      return null;
   }

   async matchState(data) {
      if (this.state instanceof Promise) {
         this.state = await this.state.then((data) => { return data })
      }
      if (this.dict.state instanceof Promise) {
         this.dict.state = await this.dict.state.then((data) => { return data });
      }
      // console.log("start matching", this.state);
      if (!this.checkedButNotFound(data, 'state')) {
         for (let i in this.state) {
            if ([this.state[i].state_hin, this.state[i].state_eng].includes(data)) {
               return this.state[i]._id;
            }
         }
         for (let i in this.dict.state) {
            if (this.dict.state[i].name == data) {
               return this.dict.state[i].id;
            }
         }
         this.correctionList.push({ type: 'state', name: data });
      }
      return null;
   }

   async matchDistrict(data) {
      if (this.district instanceof Promise) {
         this.district = await this.district.then((data) => { return data })
      }
      if (this.dict.district instanceof Promise) {
         this.dict.district = await this.dict.district.then((data) => { return data });
      }
      // console.log("start matching", this.state);
      if (!this.checkedButNotFound(data, 'district')) {
         for (let i in this.district) {
            if ([this.district[i].district_hin, this.district[i].district_eng].includes(data)) {
               return this.district[i]._id;
            }
         }
         for (let i in this.dict.district) {
            if (this.dict.district[i].name == data) {
               return this.dict.district[i].id;
            }
         }
         this.correctionList.push({ type: 'district', name: data });
      }
      return null;
   }

   async matchZone(data) {
      if (this.zone instanceof Promise) {
         this.zone = await this.zone.then((data) => { return data })
      }
      if (this.dict.zone instanceof Promise) {
         this.dict.zone = await this.dict.zone.then((data) => { return data });
      }
      if (!this.checkedButNotFound(data, 'zone')) {
         for (let i in this.zone) {
            if ([this.zone[i].zone_hin, this.zone[i].zone_eng].includes(data)) {
               return this.zone[i]._id;
            }
         }
         // for (let i in this.dict.zone) {
         //    if (this.dict.zone[i].name == data) {
         //       return this.dict.zone[i].id;
         //    }
         // }
         this.correctionList.push({ type: 'zone', name: data });
      }
      return null;
   }

   async matchCity(data) {
      if (this.city instanceof Promise) {
         this.city = await this.city.then((data) => { return data })
      }
      if (this.dict.city instanceof Promise) {
         this.dict.city = await this.dict.city.then((data) => { return data });
      }
      // console.log("start matching", this.city);
      if (!this.checkedButNotFound(data, 'city')) {
         for (let i in this.city) {
            if ([this.city[i].city_hin, this.city[i].city_eng].includes(data)) {
               return this.city[i]._id;
            }
         }
         for (let i in this.dict.city) {
            if (this.dict.city[i].name == data) {
               return this.dict.city[i].id;
            }
         }
         this.correctionList.push({ type: 'city', name: data });
      }
      return null;
   }

   async matchUnit(data) {
      if (this.unit instanceof Promise) {
         this.unit = await this.unit.then((data) => { return data })
      }
      if (this.dict.unit instanceof Promise) {
         this.dict.unit = await this.dict.unit.then((data) => { return data });
      }
      // console.log("start matching", this.unit);
      if (!this.checkedButNotFound(data, 'unit')) {
         for (let i in this.unit) {
            if ([this.unit[i].unit_short, this.unit[i].unit_full].includes(data)) {
               return this.unit[i]._id;
            }
         }
         for (let i in this.dict.unit) {
            if (this.dict.unit[i].name == data) {
               return this.dict.unit[i].id;
            }
         }
         this.correctionList.push({ type: 'unit', name: data });
      }
      return null;
   }

   async matchNimitt(data) {
      if (this.nimitt instanceof Promise) {
         this.nimitt = await this.nimitt.then((data) => { return data })
      }
      if (this.dict.nimitt instanceof Promise) {
         this.dict.nimitt = await this.dict.nimitt.then((data) => { return data });
      }
      // console.log("start matching", this.nimitt);
      if (!this.checkedButNotFound(data, 'nimitt')) {
         for (let i in this.nimitt) {
            if (this.nimitt[i].roll_no == data) {
               return this.nimitt[i]._id;
            }
         }
         // for (let i in this.dict.nimitt) {
         //    if (this.dict.nimitt[i].name == data) {
         //       return this.dict.nimitt[i].id;
         //    }
         // }
         this.correctionList.push({ type: 'nimitt', name: data });
      }
      return null;
   }
   async matchPbk(data) {
      if (this.pbk instanceof Promise) {
         this.pbk = await this.pbk.then((data) => { return data })
      }
      if (this.dict.pbk instanceof Promise) {
         this.dict.pbk = await this.dict.pbk.then((data) => { return data });
      }
      // console.log("start matching", this.pbk);
      if (!this.checkedButNotFound(data, 'pbk')) {
         for (let i in this.pbk) {
            if (this.pbk[i].roll_no == data) {
               return this.pbk[i]._id;
            }
         }
         // for (let i in this.dict.pbk) {
         //    if (this.dict.pbk[i].name == data) {
         //       return this.dict.pbk[i].id;
         //    }
         // }
         this.correctionList.push({ type: 'pbk', name: data });
      }
      return null;
   }
   async matchSubitemList(data) {
      if (this.subitem_list instanceof Promise) {
         this.subitem_list = await this.subitem_list.then((data) => { return data })
      }
      if (this.dict.subitem_list instanceof Promise) {
         this.dict.subitem_list = await this.dict.subitem_list.then((data) => { return data });
      }
      // console.log("start matching", this.subitem_list);
      if (!this.checkedButNotFound(data, 'subitem_list')) {
         for (let i in this.subitem_list) {
            if ([this.subitem_list[i].subitem_hin, this.subitem_list[i].subitem_eng, this.subitem_list[i].subitem_roman].includes(data)) {
               return this.subitem_list[i]._id;
            }
         }
         for (let i in this.dict.subitem_list) {
            if (this.dict.subitem_list[i].name == data) {
               return this.dict.subitem_list[i].id;
            }
         }
         this.correctionList.push({ type: 'subitem_list', name: data });
      }
      return null;
   }

   async matchItemMix(row) {
      if (this.item instanceof Promise) {
         this.item = await this.item.then((data) => { return data })
      }
      if (this.subitem instanceof Promise) {
         this.subitem = await this.subitem.then((data) => { return data })
      }
      if (this.dict.item instanceof Promise) {
         this.dict.item = await this.dict.item.then((data) => { return data });
      }
      let data = {
         item: row.item && typeof row.item == 'string' ? row.item.trim().toLowerCase().normalize('NFC') : row.item,
         subitem: row.subitem && typeof row.subitem == 'string' ? row.subitem.trim().toLowerCase().normalize('NFC') : row.subitem,
      }

      if (!this.checkedButNotFound(data, 'item')) {
         for (let i in this.item) {
            if ([this.item[i].item_hin, this.item[i].item_eng, this.item[i].item_roman, this.item[i].item_code].includes(data.item)) {
               row.item_id = this.item[i]._id;
               if (row.log) {
                  console.log("item found")
               }
               break;
            }
         }
         if (!row.item_id) {
            for (let i in this.dict.item) {
               if (this.dict.item[i].name == data.item && this.dict.item[i].extra_note == data.subitem) {
                  row.item_id = this.dict.item[i].id;
                  row.subitem_id = this.dict.item[i].id2;
                  break;
               }
            }
         }
         if (row.log) {
            console.log('start subitem search', row.item_id)
         }
         if (row.item_id && row.subitem && !row.subitem_id) {
            for (let i in this.subitem) {
               if (this.subitem[i].item_id == row.item_id && [this.subitem[i].subitem_hin, this.subitem[i].subitem_eng, this.subitem[i].subitem_roman].includes(data.subitem)) {
                  row.subitem_id = this.subitem[i]._id;
                  if (row.log) {
                     console.log("subitem found");
                  }
                  break;
               }
            }
         }
         if (!row.item_id || (row.item_id && row.subitem && !row.subitem_id)) {
            if (row.log) {
               console.log("pushing in correction list")
            }
            this.correctionList.push({ type: 'item', name: data, id: row.item_id, id2: row.subitem_id });
         }
      }
      return row;
   }

   async matchItem(data) {
      if (this.item instanceof Promise) {
         this.item = await this.item.then((data) => { return data })
      }
      if (this.dict.item instanceof Promise) {
         this.dict.item = await this.dict.item.then((data) => { return data });
      }
      // console.log("start matching", this.item);
      if (!this.checkedButNotFound(data, 'item')) {
         for (let i in this.item) {
            if ([this.item[i].item_hin, this.item[i].item_eng, this.item[i].item_roman, this.item[i].item_code].includes(data)) {
               return this.item[i]._id;
            }
         }
         for (let i in this.dict.item) {
            if (this.dict.item[i].name == data) {
               return this.dict.item[i].id;
            }
         }
         this.correctionList.push({ type: 'item', name: data });
      }
      return null;
   }

   async matchSupportList(data, listType, returnFieldName = '_id') {
      if (this.support_list instanceof Promise) {
         this.support_list = await this.support_list.then((data) => { return data })
      }
      if (this.dict[listType] instanceof Promise) {
         this.dict[listType] = await this.dict[listType].then((data) => { return data });
      }
      let slist = this.support_list.filter(s => s.list_type == listType);
      let slistDict = this.dict[listType].filter(d => d.type == listType);
      if (!this.checkedButNotFound(data, listType)) {
         for (let i in slist) {
            if ([slist[i].list_name_hin, slist[i].list_name_eng, slist[i].list_name_roman].includes(data)) {
               return slist[i][returnFieldName];
            }
         }
         for (let i in slistDict) {
            if (slistDict[i].name == data) {
               return slistDict[i].id;
            }
         }
         this.correctionList.push({ type: listType, name: data });
      }
      return null;
   }



   async verifyAndInsert(type, data, headerList) {
      let status;
      let fdata = await this.setFormData(this[type.name + '_form'], data);
      let duplicate = await this.Fn.checkDuplication(type, fdata);
      if (duplicate) {
         let fullDuplicate = await this.checkFullDuplication(duplicate, data, headerList);
         if (fullDuplicate.found) {
            status = 'duplicate'
         } else {
            status = 'update'
            data.duplicate = fullDuplicate.list
         }
      }
      else {
         if (this.voucherTables.includes(type.name)) {
            fdata.voucher_no = await this.Fn.getLastVoucherNo(type.name) + 1;
         }
         if (this.bunchTables.includes(type.name)) {
            fdata.bunch_no = await this.Fn.getLastBunchNo(type.name) + 1;
         }
         let insResult = await this.Fn.insertExcelData(type, fdata, this.dept_id);
         status = 'inserted';
         data.newData = insResult;
      }
      return { status: status, data: data };
   }

   async updateExcelData(type, data) {
      return await this.Fn.updateExcelData(type, await this.setFormData(this[type.name + '_form'], data), this.dept_id);
   }

   async setFormData(formObj, data) {
      for (const key of Object.keys(formObj)) {
         if (data[key] == undefined || data[key] == `` || data[key] == '-')
            data[key] = null;

         if (this.jsonKey.includes(key)) {
            formObj[key] = JSON.stringify(data[key] ? data[key] : formObj[key])
         } else if (this.booleanKey.includes(key)) {
            formObj[key] = data[key] ? 1 : 0;
         } else {
            formObj[key] = data[key]
         }
      }
      formObj.is_xl = 1;
      formObj.dept_id = this.dept_id;
      return formObj;
   }

   async isObject(value) {
      return typeof value === "object" && value != null && value != undefined;
   }


   async checkFullDuplication(list, data, headerList) {
      let found = false;
      for (let i in list) {
         let changes = false;
         for (let j in headerList) {
            let listData;
            let exData;
            if (headerList[j].ref_table) {
               listData = list[i][headerList[j].ref_field]
               exData = data[headerList[j].ref_field]
            } else {
               listData = (list[i][headerList[j].name] && typeof list[i][headerList[j].name] == 'string') ? list[i][headerList[j].name].trim().toLowerCase() : list[i][headerList[j].name];
               exData = (data[headerList[j].name] && typeof data[headerList[j].name] == 'string') ? data[headerList[j].name].trim().toLowerCase() : data[headerList[j].name];
               if (headerList[j].type == 'date') {
                  listData = new Date(listData).getTime();
                  exData = new Date(exData).getTime();
               }
               else if (headerList[j].type == 'unix_date') {
                  listData = new Date(new Date(listData).toDateString()).getTime()
                  exData = new Date(listData).getTime()
               }
            }

            if (typeof exData != 'undefined' && listData != exData) {
               changes = true;
               break;
            }
         }
         if (changes) {
            list[i].status = 'update';
         }
         else {
            found = true;
            list[i].status = 'duplicate';
         }
      }
      return { found: found, list: list };
   }

   setDateFormat(data) {
      if (typeof data == "string") {
         return this.Fn.StringToDate(data).toISOString().split('T')[0];
      }
      else if (typeof data == "number") {
         return this.Fn.ExcelDateToJSDate(data).toISOString().split('T')[0];
      }
   }

   setDateUnixSecond(data) {
      if (typeof data == "string") {
         return this.Fn.StringToUnixSDate(data);
      }
      else if (typeof data == "number") {
         return this.Fn.ExcelDateToUnixSDate(data);
      }
   }

}



module.exports = ExcelFunctions;


/*
Code References.....

   ExcelDateToJSDate = (intDate) => {
      return new Date((Math.floor(intDate - 25569) * 86400) * 1000);

      var utc_days = Math.floor(serial - 25569);
      var utc_value = utc_days * 86400;
      var date_info = new Date(utc_value * 1000);

      var fractional_day = serial - Math.floor(serial) + 0.0000001;

      var total_seconds = Math.floor(86400 * fractional_day);

      var seconds = total_seconds % 60;

      total_seconds -= seconds;

      var hours = Math.floor(total_seconds / (60 * 60));
      var minutes = Math.floor(total_seconds / 60) % 60;

      return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
   }


*/

