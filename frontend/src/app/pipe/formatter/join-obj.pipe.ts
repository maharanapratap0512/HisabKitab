import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'joinObj'
})
export class JoinObjPipe implements PipeTransform {

  /**
   * @param value The array of objects
   * @param key The property name to extract (e.g., 'category_hin')
   * @param separator Default is ', '
   */
  transform(value: any[], key: string, separator: string = ', '): string {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return '';
    }

    return value
      .map((item: any) => item[key])
      .filter((val: any) => val !== null && val !== undefined && val !== '')
      .join(separator);
  }

}
