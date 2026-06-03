import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { PopoverFilterComponent } from '../popover-filter/popover-filter.component';

@Component({
  selector: 'app-popover-year',
  templateUrl: './popover-year.component.html',
  styleUrls: ['./popover-year.component.scss']
})
export class PopoverYearComponent {
  @Input() selectedYear: any = null;
  @Output() yearChanged = new EventEmitter<any>();
  @ViewChild('popover') popover!: PopoverFilterComponent;

  constructor(public gs: GlobalService) {}

  onYearChange(year: any) {
    this.selectedYear = year;
    this.yearChanged.emit(year);
    if(this.popover) {
      this.popover.closePopover();
    }
  }
}
