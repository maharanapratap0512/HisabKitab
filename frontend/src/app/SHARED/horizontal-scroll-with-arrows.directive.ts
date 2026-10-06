import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appKeyScroll], [appHorizontalScrollWithArrows]'
})
export class KeyScrollDirective {
  @Input() scrollStep: number = 100;
  @Input() enableVerticalScroll: boolean = true;

  constructor(private el: ElementRef) { }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Never intercept arrow keys when typing inside text inputs, textareas, or dropdowns
    const target = event.target as HTMLElement;
    if (target) {
      const tagName = target.tagName ? target.tagName.toUpperCase() : '';
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target.closest('.ng-select')) {
        return;
      }
    }

    const container = this.el.nativeElement;
    if (!container) return;

    if (event.key === 'ArrowRight') {
      container.scrollBy({ left: this.scrollStep, behavior: 'smooth' });
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      container.scrollBy({ left: -this.scrollStep, behavior: 'smooth' });
      event.preventDefault();
    } else if (this.enableVerticalScroll && event.key === 'ArrowDown') {
      container.scrollBy({ top: 40, behavior: 'smooth' });
      event.preventDefault();
    } else if (this.enableVerticalScroll && event.key === 'ArrowUp') {
      container.scrollBy({ top: -40, behavior: 'smooth' });
      event.preventDefault();
    }
  }
}

// Backward compatibility alias export
export { KeyScrollDirective as HorizontalScrollWithArrowsDirective };

