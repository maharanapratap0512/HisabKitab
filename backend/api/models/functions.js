class Functions {
   DB;
   DBContex;
   constructor() {
      this.DBContex = require('./DBContex');
      this.DB = new this.DBContex();
   }

   convertToLower(data, fieldList = null) {
      if (fieldList && fieldList.length > 0) {
         for (let i in data) {
            for (let field of fieldList) {
               data[i][field] = data[i][field] ? data[i][field].toLowerCase() : null;
            }
         }
      } else {
         for (let i in data) {
            for (let key of Object.keys(data[i])) {
               data[i][key] = data[i][key] ? data[i][key].toLowerCase() : null;
            }
         }
      }
      return data;
   }

   async getMMs(dept_id = null) {

      return await this.DB.getList('mm', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['mm_hin', 'mm_eng', 'mm_code']);
      }, (err) => {
         return [];
      });
   }
   async getStates(dept_id = null) {

      return await this.DB.getList('state').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['state_hin', 'state_eng']);
      }, (err) => {
         return [];
      });
   }
   async getCategories(dept_id = null) {

      return await this.DB.getList('category', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['category_hin', 'category_eng']);
      }, (err) => {
         return [];
      });
   }
   async getUnits(dept_id = null) {

      return await this.DB.getList('unit').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['unit_short', 'unit_full']);
      }, (err) => {
         return [];
      });
   }
   async getitems(dept_id = null) {

      return await this.DB.getList('item', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['item_hin', 'item_eng', 'item_code']);
      }, (err) => {
         return [];
      });
   }
   async getSubitems(dept_id = null) {

      return await this.DB.getList('subitem', { dept_id: dept_id }).then(async (resolve) => {
         return resolve.data || [];
         // return this.convertToLower(resolve.data || []);
      }, (err) => {
         return [];
      });
   }
   async getSubiemList(dept_id = null) {

      return await this.DB.getList('subitem_list', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['subitem_hin', 'subitem_eng']);
      }, (err) => {
         return [];
      });
   }
   async getSupportList(dept_id = null) {
      return await this.DB.getList('support_list', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['list_name_hin', 'list_name_eng']);
      }, (err) => {
         return [];
      });
   }
   async getCountries(dept_id = null) {
      return await this.DB.getList('country').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['country_hin', 'country_eng']);
      }, (err) => {
         return [];
      });
   }
   async getCities(dept_id = null) {
      return await this.DB.getList('city').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['city_hin', 'city_eng']);
      }, (err) => {
         return [];
      });
   }
   async getNimitts(dept_id = null) {
      return await this.DB.getList('nimitt', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['nimitt_hin', 'nimitt_eng', 'gender', 'relative_name']);
      }, (err) => {
         return [];
      });
   }
   async getPbks(dept_id = null) {
      return await this.DB.getList('pbk', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['nimitt_hin', 'nimitt_eng', 'gender', 'relation', 'relative_name']);
      }, (err) => {
         return [];
      });
   }

   async getDictionary(dict_type) {
      return await this.DB.getList('dictionary', { conditionString: `type = '${dict_type}'` }).then(async (resolve) => {
         return resolve.data || [];
      }, (err) => {
         return [];
      });
   }

   async checkDuplication(type, data) {
      return await this.DB.selectWithCondition(type.name, 'duplicate', data).then(async (resolve) => {
         if (resolve.length) {
            return resolve;
         }
         return false;
      });
   }

   async checkFullDuplication(type, data) {
      return await this.DB.selectWithCondition(type.name, 'duplicate_full', data).then(async (resolve) => {
         if (resolve.length) {
            return resolve;
         }
         return false;
      });
   }

   async insertExcelData(type, data, dept_id = null) {
      return await this.DB.insert(type.name, data, dept_id).then((result) => {
         // console.log('insert', result);
         return result;
      })
   }

   async updateExcelData(type, data, dept_id = null) {
      return await this.DB.updateMany(type.name, data, this.DB.query.conditions[type.name + '_duplicate'], false).then((result) => {
         // console.log('update', result);
         return result;
      })
   }


   ExcelDateToJSDate = (intDate) => {
      return new Date((Math.floor(intDate - 25569) * 86400) * 1000);
   }

   ExcelDateToUnixSDate = (intDate) => {
      return Math.floor(intDate - 25569) * 86400;
   }

   StringToDate = (stringDate) => {
      console.log(stringDate);
      let datearr = stringDate.split(/[./-]+/);
      if (datearr && datearr.length == 3) {

         if (datearr[0].length == 4) {
            return new Date(datearr[0] + '-' + datearr[1].padStart(2, "0") + '-' + datearr[2].padStart(2, "0"));
         }
         else {
            return new Date(datearr[2].padStart(4, "20") + '-' + datearr[1].padStart(2, "0") + '-' + datearr[0].padStart(2, "0"));
         }
      }
      // yyyy-mm-dd
      return;
   }

   StringToUnixSDate = (stringDate) => {
      let datearr = stringDate.split(/[./-]+/);
      if (datearr && datearr.length == 3) {

         if (datearr[0].length == 4) {
            return (new Date(datearr[0] + '-' + datearr[1].padStart(2, "0") + '-' + datearr[2].padStart(2, "0")) / 1000);
         }
         else {
            return (new Date(datearr[2].padStart(4, "20") + '-' + datearr[1].padStart(2, "0") + '-' + datearr[0].padStart(2, "0")) / 1000);
         }
      }
      // yyyy-mm-dd
      return;
   }

   JulianDateToJSDate = (julianDate) => {
      return new Date((julianDate - 2440587.5) * 86400000);
   }

}



module.exports = new Functions();


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

