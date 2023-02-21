class ExcelFunctions {
   mm = null;
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
         switch (list[i]) {
            case 'mm':
               this.mm = this.Fn.getMMs();
               this.dict.mm = this.Fn.getDictionary('mm');
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

   async verifyAndInsert(type, data, headerList) {
      let status;
      let duplicate = await this.Fn.checkDuplication(type, data);
      if (duplicate && type.autoUpdate) {
         let fullDuplicate = await this.checkFullDuplication(duplicate, data, headerList);
         console.log(fullDuplicate);
         if (fullDuplicate.found) {
            status = 'duplicate'
         } else {
            status = 'update'
            data.duplicate = duplicate.list
         }
      }
      else {
         let insResult = this.Fn.insertExcelData(type, { ...this[type.name + '_form'], ...data }, this.dept_id);
         status = 'inserted',
         data.newData = insResult;
      }
      return { status: status, data: data };
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

