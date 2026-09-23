import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  NgZone
} from '@angular/core';

export interface VirtualSlice {
  startIndex: number;
  endIndex: number;
  paddingTop: number;
  paddingBottom: number;
}

/**
 * ============================================================================
 * VirtualInfiniteScrollDirective (`[appVirtualInfiniteScroll]`)
 * ============================================================================
 * 
 * Provides DOM Virtualization (Windowed Rendering) and Infinite Lazy Load Scroll.
 * 
 * 💡 FEATURES:
 * - Keeps low DOM node footprint (~40-60 rows max) regardless of dataset size (100 to 50,000+).
 * - Auto-triggers lazy load (`nearBottom` output) when user scrolls near the end.
 * - Dynamically calculates top/bottom spacer heights to preserve native scrollbar size.
 */
@Directive({
  selector: '[appVirtualInfiniteScroll]'
})
export class VirtualInfiniteScrollDirective implements OnInit, OnChanges, OnDestroy {
  @Input() totalItems: number = 0;
  @Input() itemHeight: number = 48; // Default estimated row height in px
  @Input() bufferSize: number = 15; // Buffer items before/after visible window
  @Input() nearBottomThreshold: number = 0.85; // 85% scroll depth triggers lazy load
  @Input() isLoader: boolean = false; // Prevents duplicate nearBottom triggers while loading

  @Output() nearBottom = new EventEmitter<void>();
  @Output() sliceChange = new EventEmitter<VirtualSlice>();

  private scrollUnlisten: (() => void) | null = null;
  private lastEmitKey: string = '';
  private nearBottomTriggered: boolean = false;

  constructor(
    private el: ElementRef<HTMLElement>,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Run scroll listener outside Angular zone for high 60fps scroll performance
    this.ngZone.runOutsideAngular(() => {
      const element = this.el.nativeElement;
      const onScroll = () => this.handleScroll();
      element.addEventListener('scroll', onScroll, { passive: true });
      this.scrollUnlisten = () => element.removeEventListener('scroll', onScroll);
    });

    setTimeout(() => this.recalculateSlice(), 50);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalItems'] || changes['itemHeight'] || changes['bufferSize']) {
      this.recalculateSlice();
    }
    if (changes['isLoader'] && !this.isLoader) {
      this.nearBottomTriggered = false;
    }
  }

  ngOnDestroy(): void {
    if (this.scrollUnlisten) {
      this.scrollUnlisten();
    }
  }

  public recalculateSlice(): void {
    const container = this.el.nativeElement;
    const scrollTop = container.scrollTop || 0;
    const containerHeight = container.clientHeight || 400;
    const total = this.totalItems || 0;

    if (total === 0) {
      this.emitSlice({ startIndex: 0, endIndex: 0, paddingTop: 0, paddingBottom: 0 });
      return;
    }

    const firstVisibleIndex = Math.floor(scrollTop / this.itemHeight);
    const visibleCount = Math.ceil(containerHeight / this.itemHeight);

    const startIndex = Math.max(0, firstVisibleIndex - this.bufferSize);
    const endIndex = Math.min(total, firstVisibleIndex + visibleCount + this.bufferSize);

    const paddingTop = startIndex * this.itemHeight;
    const paddingBottom = Math.max(0, (total - endIndex) * this.itemHeight);

    this.emitSlice({ startIndex, endIndex, paddingTop, paddingBottom });
  }

  private handleScroll(): void {
    const container = this.el.nativeElement;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;

    // 1. Recalculate slice
    this.recalculateSlice();

    // 2. Check near bottom lazy load trigger
    if (scrollHeight > 0 && !this.nearBottomTriggered && !this.isLoader) {
      const scrollRatio = (scrollTop + containerHeight) / scrollHeight;
      if (scrollRatio >= this.nearBottomThreshold) {
        this.nearBottomTriggered = true;
        this.ngZone.run(() => {
          this.nearBottom.emit();
        });
      }
    }
  }

  private emitSlice(slice: VirtualSlice): void {
    const key = `${slice.startIndex}_${slice.endIndex}_${slice.paddingTop}_${slice.paddingBottom}`;
    if (key !== this.lastEmitKey) {
      this.lastEmitKey = key;
      this.ngZone.run(() => {
        this.sliceChange.emit(slice);
      });
    }
  }
}
