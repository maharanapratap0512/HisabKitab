class Functions {
   constructor() {

   }


   ExcelDateToJSDate = (intDate) => {
      return new Date((Math.floor(intDate - 25569) * 86400) * 1000);
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

