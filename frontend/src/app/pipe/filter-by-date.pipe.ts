import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByDate',
  // pure: false,
})
export class FilterByDatePipe implements PipeTransform {

  transform(value: any[], date: string | Date): any[] {
    //return all data if data or date not recieved.
    if (!date || !value)
      return value;

    // converting date string to date object.
    date = new Date(date)
    let filterValue = [];
    for (let i in value) {
      // comparing date with lock date.
      if (!value[i].restrict_year || date < new Date(value[i].restrict_year, value[i].restrict_month-1)) {
        filterValue.push(value[i]);
      }
    }
    return filterValue;
  }

}
