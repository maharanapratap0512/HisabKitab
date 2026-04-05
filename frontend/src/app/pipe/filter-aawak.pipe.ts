import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterAawak',
    pure: false
})
export class FilterAawakPipe implements PipeTransform {

    transform(aawaks: any[], filter: any): any[] {
        if (!aawaks || !filter) return aawaks;

        if (!filter.item_id && !filter.subitem_id) return aawaks;

        return aawaks.filter(awk => {
            let itemMatch = !filter.item_id || awk.item_id == filter.item_id;
            let subitemMatch = !filter.subitem_id || awk.subitem_id == filter.subitem_id;
            return itemMatch && subitemMatch;
        });
    }

}
