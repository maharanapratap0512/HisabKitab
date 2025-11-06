import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popover-filter',
  templateUrl: './popover-filter.component.html',
  styleUrls: ['./popover-filter.component.scss']
})
export class PopoverFilterComponent {

  @Input() isActive: boolean = false;
  @Input() showClearButton: boolean = true;
  @Output() clear = new EventEmitter<void>();

  isOpen: boolean = false;

  togglePopover(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  closePopover() {
    this.isOpen = false;
  }

  onClear() {
    this.clear.emit();
    this.closePopover();
  }
}