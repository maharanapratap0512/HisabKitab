import { Directive, ElementRef, Input, OnChanges, SimpleChanges, Optional } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Directive({
    selector: '[smartFocus]'
})
export class SmartFocusDirective implements OnChanges {

    @Input() smartFocus: any;

    constructor(
        private el: ElementRef,
        @Optional() private ngSelect: NgSelectComponent
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        // We focus if the value is truthy and it just changed, or if it remains truthy 
        // (though truthy check is usually enough for index-based triggers)
        if (this.smartFocus) {
            setTimeout(() => {
                if (this.ngSelect) {
                    this.ngSelect.focus();
                } else {
                    this.el.nativeElement.focus();
                    // If it's an input, select the text for faster editing
                    if (this.el.nativeElement.select) {
                        this.el.nativeElement.select();
                    }
                }
            }, 500); // Increased to 500ms to allow modal animations to finish
        }
    }
}
