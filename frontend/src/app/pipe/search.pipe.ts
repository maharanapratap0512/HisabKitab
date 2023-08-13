import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  /**
   * Transforms an array by filtering it based on the search term.
   * Searches through object properties recursively.
   * @param items The array to be filtered.
   * @param searchTerm The search term to filter the array.
   * @returns The filtered array.
   */
  transform(items: any[], searchTerm: string): any[] {
    if (!items || !searchTerm) {
      return items || [];
    }

    const toCompare = searchTerm.toLowerCase();

    /**
     * Checks if the given item or any of its properties contain the search term.
     * Performs a case-insensitive search.
     * @param item The item to check.
     * @param term The search term to match against.
     * @returns True if the item or any of its properties contain the search term, false otherwise.
     */
    function checkInside(item: any, term: string): boolean {
      for (const property in item) {
        if (item[property] === null || item[property] == undefined) {
          continue;
        }
        if (typeof item[property] === 'object') {
          if (checkInside(item[property], term)) {
            return true;
          }
        }
        if (item[property].toString().toLowerCase().includes(term)) {
          return true;
        }
      }
      return false;
    }

    // Filter the items array by checking if the search term is present inside the item or any of its properties.
    return items.filter((item) => checkInside(item, toCompare));

  }

}
