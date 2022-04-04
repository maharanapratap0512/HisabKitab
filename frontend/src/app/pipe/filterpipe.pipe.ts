import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterpipe'
})
export class FilterpipePipe implements PipeTransform {

  transform(data: any[], condition: any = {}): any[] {
    if (data.length > 0) {
      if (condition == {}) {
        return data;
      }
      else {
        let filteredData = data;
        console.log("pipe",filteredData);
        console.log("pipe_condition",condition);
        
        for (let [key, value] of Object.entries(condition)) {
          if (value)
            filteredData = filteredData.filter((b: any) => b[key] == value);
        }
        return filteredData;
      }
    } else {
      return [];
    }
  }

}
