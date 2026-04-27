import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fltByCat'
})
export class FltByCatPipe implements PipeTransform {

  transform(value: any[], catId: any): any[] {
    //return all data if data or date not recieved.
    if (!catId || !value)
      return value;

    let filterValue: any = [];
    filterValue = value.filter(v =>
      ((v.scategories?.length ? v.scategories : v.icategories) || [])
        .some((cat: { _id: any; }) => cat._id == catId)
    );
    return filterValue;
  }

}
