import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';

@Component({
  selector: 'app-popover-filter',
  templateUrl: './popover-filter.component.html',
  styleUrls: ['./popover-filter.component.scss']
})
export class PopoverFilterComponent {

  @Input() iconClass: string = '';
  @Input() btnOutline: boolean = true;
  @Input() btnClass: string = 'btn';
  @Input() showClearButton: boolean = true;
  @Input() clearButtonLabel: string = 'Clear Filter';
  @Input() label: string = '';
  @Input() direction: 'left' | 'right' | 'auto' = 'auto';
  @Input() triggerOn: 'click' | 'hover' = 'click';
  @Output() clear = new EventEmitter<void>();

  // Active filter state
  isActive: boolean = false;

  @Input() set isOpen(val: any) {
    this.isActive = !!val;
  }

  // Panel visibility state
  showPanel: boolean = false;

  private _hoverTimeout: any = null;

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
    this.showPanel = !this.showPanel;

    if (this.showPanel && this.direction == 'left') {
      this.popoverPosition = { right: '0' };
    } else if (this.showPanel && this.direction === 'right') {
      this.popoverPosition = { left: '0' };
    }

    if (this.showPanel) this.focusFirst();
  }

  openPopover() {
    if (this._hoverTimeout) { clearTimeout(this._hoverTimeout); this._hoverTimeout = null; }
    this.showPanel = true;
    this.focusFirst();
  }

  hoverClose() {
    this._hoverTimeout = setTimeout(() => { this.showPanel = false; }, 120);
  }

  closePopover() {
    this.showPanel = false;
  }

  onClear() {
    this.clear.emit();
    this.closePopover();
  }

  focusFirst() {
    // Wait one tick for *ngIf to render the popover panel
    setTimeout(() => {
      const panel = this.elementRef.nativeElement.querySelector('.filter-popover');
      if (!panel) return;
      const focusable = panel.querySelector(
        'input:not([type=hidden]), select, textarea, ng-select .ng-input input, button:not(.btn-outline-secondary)'
      ) as HTMLElement | null;
      focusable?.focus();
    }, 0);
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