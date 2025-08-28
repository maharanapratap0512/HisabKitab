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
    filterValue = value.filter(v => {
      if(v.scategories){
        return v.scategories.includes(catId)
      } else if(v.icategories){
        return v.icategories.includes(catId)
      }
    });
    return filterValue;
  }

}
