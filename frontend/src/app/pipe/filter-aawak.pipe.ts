import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterAawak',
    pure: true
})
export class FilterAawakPipe implements PipeTransform {

    transform(aawaks: any[], filter: any): any[] {
        if (!aawaks || !filter) return aawaks;

        if (!filter.item_id && !filter.subitem_id && !filter.condition_id && !filter.aawak_source_id) return aawaks;

        return aawaks.filter(awk => {
            let itemMatch = !filter.item_id || awk.item_id == filter.item_id;
            let subitemMatch = !filter.subitem_id || awk.subitem_id == filter.subitem_id;
            let conditionMatch = !filter.condition_id || awk.condition_id == filter.condition_id;
            let aawakSourceMatch = !filter.aawak_source_id || awk.aawak_source_id == filter.aawak_source_id;
            return itemMatch && subitemMatch && conditionMatch && aawakSourceMatch;
        });
    }

}
