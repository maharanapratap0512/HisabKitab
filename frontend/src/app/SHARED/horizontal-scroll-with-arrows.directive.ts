import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHorizontalScrollWithArrows]'
})
export class HorizontalScrollWithArrowsDirective {

  constructor(private el: ElementRef) { }

  @HostListener
    ('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const scrollAmount = 60;
    if (event.key === 'ArrowRight') {
      this.el.nativeElement.scrollLeft += scrollAmount;
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      this.el.nativeElement.scrollLeft -= scrollAmount;
      event.preventDefault();
    }
  }

}
