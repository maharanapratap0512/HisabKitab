import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterItemCat'
})
export class FilterItemCatPipe implements PipeTransform {

  transform(value: any[], catId: any): any[] {
    //return all data if data or date not recieved.
    if (!catId || !value)
      return value;

    let filterValue = value.filter(v =>
      v.categories && v.categories.some((cat: { _id: any; }) => cat._id === catId)
    );

    return filterValue;
  }

}
