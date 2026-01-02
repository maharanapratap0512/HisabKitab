import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';

@Component({
  selector: 'app-popover-filter',
  templateUrl: './popover-filter.component.html',
  styleUrls: ['./popover-filter.component.scss']
})
export class PopoverFilterComponent {

  @Input() iconClass: string = '';
  @Input() btnOutline: boolean = true;
  @Input() showClearButton: boolean = true;
  @Input() clearButtonLabel: string = 'Clear Filter';
  @Input() label: string = '';
  @Input() direction: 'left' | 'right' | 'auto' = 'auto';
  @Input() isOpen: boolean = false;
  @Output() clear = new EventEmitter<void>();


  popoverPosition: { left?: string; right?: string } = {};

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
    if (this.direction === 'auto') {
      this.calculateAutoPosition();
    } else if (this.direction === 'left') {
      this.popoverPosition = { right: '0' };
    } else if (this.direction === 'right') {
      this.popoverPosition = { left: '0' };
    }
  }

  togglePopover(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;

    if (this.isOpen && this.direction == 'left') {
      this.popoverPosition = { right: '0' };
    } else if (this.isOpen && this.direction === 'right') {
      this.popoverPosition = { left: '0' };
    }
  }

  closePopover() {
    this.isOpen = false;
  }

  onClear() {
    this.clear.emit();
    this.closePopover();
  }

  calculateAutoPosition() {
    const hostElement = this.elementRef.nativeElement;
    const popoverElement = hostElement.querySelector('.filter-popover') as HTMLElement;
    if (!popoverElement) return;

    const rect = hostElement.getBoundingClientRect();
    const popoverWidth = 300; // Match min-width from SCSS
    const viewportWidth = window.innerWidth;

    // Check if there's enough space on the right
    if (rect.right + popoverWidth <= viewportWidth) {
      this.popoverPosition = { right: '0' };
    } else {
      this.popoverPosition = { left: '0' };
    }
  }
}