class Functions {
   DB;
   DBContex;
   constructor() {
      this.DBContex = require('./DBContex');
      this.DB = new this.DBContex();
   }

   mmConvertLower(data) {
      for (let i in data) {
         data[i].mm_hin = data[i].mm_hin.toLowerCase();
         data[i].mm_eng = data[i].mm_eng ? data[i].mm_eng.toLowerCase() : null;
         data[i].mm_code = data[i].mm_code ? data[i].mm_code.toLowerCase() : null;
      }
      return data;
   }

   async getMMs(dept_id = null) {

      return await this.DB.getList('mm', { dept_id: dept_id }).then(async (resolve) => {
         // console.log(resolve);
         return this.mmConvertLower(resolve.data || []);
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
         console.log('insert', result);
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

