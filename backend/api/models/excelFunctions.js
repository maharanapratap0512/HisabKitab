class ExcelFunctions {
   mm = null;
   category = null;
   city = null;
   country = null;
   state = null;
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
   constructor(list, dept_id = null) {
      // this.DBContex = require('./DBContex');
      // this.DB = new this.DBContex(); 
      // console.log("constructor", list);
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
               break;
            case 'subitem':
               this.subitem = this.Fn.getSubitems(dept_id);
               break;
            case 'subitem_list':
               this.subitem_list = this.Fn.getSubiemList(dept_id);
               break;
            case 'support_list':
               this.support_list = this.Fn.getSupportList(dept_id);
               break;
            case 'state':
               this.state = this.Fn.getStates(dept_id);
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
            default:
         }
      }
   }

   checkedButNotFound(data, listType) {
      let found = false;
      for (let i in this.correctionList) {
         if (this.correctionList[i].type == listType && this.correctionList[i].value == data) {
            found = true;
            break;
         }
      }
      return found;
   }

   async matchMMs(data) {
      if (!this.mm.length) {
         this.mm = await this.mm.then((data) => { return data })
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
         this.correctionList.push({ type: 'mm', value: data });
      }
      return null;
   }

   async matchCategory(data) {
      if (!this.category.length) {
         this.category = await this.category.then((data) => { return data })
         this.dict.category = await this.dict.category.then((data) => { return data });
      }
      // console.log("start matching", this.category);
      if (!this.checkedButNotFound(data, 'category')) {
         for (let i in this.category) {
            if ([this.category[i].category_hin, this.category[i].category_eng].includes(data)) {
               return this.category[i]._id;
            }
         }
         for (let i in this.dict.category) {
            if (this.dict.category[i].name == data) {
               return this.dict.category[i].id;
            }
         }
         this.correctionList.push({ type: 'category', value: data });
      }
      return null;
   }

   async matchCountry(data) {
      if (!this.country.length) {
         this.country = await this.country.then((data) => { return data })
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
         this.correctionList.push({ type: 'country', value: data });
      }
      return null;
   }

   async matchState(data) {
      if (!this.state.length) {
         this.state = await this.state.then((data) => { return data })
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
         this.correctionList.push({ type: 'state', value: data });
      }
      return null;
   }

   async matchCity(data) {
      if (!this.city.length) {
         this.city = await this.city.then((data) => { return data })
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
         this.correctionList.push({ type: 'city', value: data });
      }
      return null;
   }

   async matchUnit(data) {
      if (!this.unit.length) {
         this.unit = await this.unit.then((data) => { return data })
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
         this.correctionList.push({ type: 'unit', value: data });
      }
      return null;
   }

   async matchNimitt(data) {
      if (!this.nimitt.length) {
         this.nimitt = await this.nimitt.then((data) => { return data })
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
         this.correctionList.push({ type: 'nimitt', value: data });
      }
      return null;
   }
   async matchPbk(data) {
      if (!this.pbk.length) {
         this.pbk = await this.pbk.then((data) => { return data })
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
         this.correctionList.push({ type: 'pbk', value: data });
      }
      return null;
   }
   async matchSubitemList(data) {
      if (!this.subitem_list.length) {
         this.subitem_list = await this.subitem_list.then((data) => { return data })
         this.dict.subitem_list = await this.dict.subitem_list.then((data) => { return data });
      }
      // console.log("start matching", this.subitem_list);
      if (!this.checkedButNotFound(data, 'subitem_list')) {
         for (let i in this.subitem_list) {
            if ([this.subitem[i].subitem_hin, this.subitem[i].subitem_eng].includes(data)) {
               return this.subitem_list[i]._id;
            }
         }
         for (let i in this.dict.subitem_list) {
            if (this.dict.subitem_list[i].name == data) {
               return this.dict.subitem_list[i].id;
            }
         }
         this.correctionList.push({ type: 'subitem_list', value: data });
      }
      return null;
   }



   async verifyAndInsert(type, data, headerList) {
      let status;
      let duplicate = await this.Fn.checkDuplication(type, data);
      if (duplicate && type.autoUpdate) {
         let fullDuplicate = await this.checkFullDuplication(duplicate, data, headerList);
         if (fullDuplicate.found) {
            status = 'duplicate'
         } else {
            status = 'update'
            data.duplicate = fullDuplicate.list
         }
      }
      else {
         let insResult = this.Fn.insertExcelData(type, { ...this[type.name + '_form'], ...data }, this.dept_id);
         status = 'inserted',
            data.newData = insResult;
      }
      return { status: status, data: data };
   }

   async updateExcelData(type, data) {
      return await this.Fn.updateExcelData(type, { ...this[type.name + '_form'], ...data }, this.dept_id);

   }


   async checkFullDuplication(list, data, headerList) {
      let found = false;
      for (let i in list) {
         let changes = false;
         for (let j in headerList) {
            // console.log(headerList[j].name, list[i][headerList[j].name], data[headerList[j].name]);
            let listData = (list[i][headerList[j].name] && typeof list[i][headerList[j].name] == 'string') ? list[i][headerList[j].name].trim().toLowerCase() : list[i][headerList[j].name];
            let exData = (data[headerList[j].name] && typeof data[headerList[j].name] == 'string') ? data[headerList[j].name].trim().toLowerCase() : data[headerList[j].name];
            if (typeof listData != 'undefined' && listData != exData) {
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

