import { Directive, ElementRef, AfterViewChecked, Input, OnDestroy, HostListener } from '@angular/core';

@Directive({
  selector: '[appTableFreeze]'
})
export class TableFreezeDirective implements AfterViewChecked, OnDestroy {
  @Input() autoCalculate: boolean = true;
  private resizeObserver?: ResizeObserver;
  private isScrolled = false;

  constructor(private el: ElementRef) {
    this.setupResizeObserver();
  }

  ngAfterViewChecked(): void {
    if (this.autoCalculate) {
      this.calculateOffsets();
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    const container = this.el.nativeElement;
    const scrollTop = container.scrollTop;
    const table = container.querySelector('table');

    if (table) {
      if (scrollTop > 4 && !this.isScrolled) {
        this.isScrolled = true;
        table.classList.add('table-scrolled');
      } else if (scrollTop <= 4 && this.isScrolled) {
        this.isScrolled = false;
        table.classList.remove('table-scrolled');
      }
    }
  }

  calculateOffsets(): void {
    const container = this.el.nativeElement;
    const table = container.querySelector('table');
    if (!table) return;

    // Calculate Left Column Offsets (freezeCol="0", "1", "2"...)
    const frozenCols = table.querySelectorAll('[freezeCol]');
    if (frozenCols.length > 0) {
      const colMap = new Map<number, HTMLElement[]>();
      frozenCols.forEach((cell: any) => {
        const idx = parseInt(cell.getAttribute('freezeCol') || '0', 10);
        if (!colMap.has(idx)) colMap.set(idx, []);
        colMap.get(idx)!.push(cell);
      });

      let accumLeft = 0;
      const sortedKeys = Array.from(colMap.keys()).sort((a, b) => a - b);
      sortedKeys.forEach((key) => {
        const cells = colMap.get(key)!;
        cells.forEach(c => c.style.left = `${accumLeft}px`);
        const headerCell = cells.find(c => c.tagName === 'TH') || cells[0];
        if (headerCell) {
          accumLeft += headerCell.offsetWidth;
        }
      });
    }

    // Calculate Right Column Offsets (freezeColRight="0"...)
    const frozenRightCols = table.querySelectorAll('[freezeColRight]');
    if (frozenRightCols.length > 0) {
      const colMapRight = new Map<number, HTMLElement[]>();
      frozenRightCols.forEach((cell: any) => {
        const idx = parseInt(cell.getAttribute('freezeColRight') || '0', 10);
        if (!colMapRight.has(idx)) colMapRight.set(idx, []);
        colMapRight.get(idx)!.push(cell);
      });

      let accumRight = 0;
      const sortedKeys = Array.from(colMapRight.keys()).sort((a, b) => a - b);
      sortedKeys.forEach((key) => {
        const cells = colMapRight.get(key)!;
        cells.forEach(c => c.style.right = `${accumRight}px`);
        const headerCell = cells.find(c => c.tagName === 'TH') || cells[0];
        if (headerCell) {
          accumRight += headerCell.offsetWidth;
        }
      });
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.calculateOffsets();
      });
      this.resizeObserver.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
