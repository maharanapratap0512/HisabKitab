import { Directive, ElementRef, Input, OnDestroy, AfterViewInit, Renderer2, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import { SelectionService } from '../services/selection.service';

/**
 * ============================================================================
 * TableSmartCheckboxDirective
 * ============================================================================
 * 
 * Automatically injects a "Select All" checkbox into the table header and 
 * individual checkboxes into each data row. It syncs the selection state 
 * with the central `SelectionService`.
 * 
 * 💡 FEATURES:
 * - No need to manually write `<input type="checkbox">` in your table HTML.
 * - Automatically handles "Select All" / "Deselect All" logic.
 * - Auto-syncs with `SelectionService` via a unique context string.
 * 
 * 🛠️ HOW TO USE:
 * 
 * <div class="table-container" 
 *      [appTableSmartCheckbox]="'my-unique-context'" 
 *      [selectionData]="myFlatArray" 
 *      [idField]="'_id'" 
 *      [rowSelector]="'tbody tr.selectable-row'">
 *   <table class="table">
 *     <thead>
 *       <tr>
 *         <!-- Directive injects <th> checkbox here -->
 *         <th>Name</th>
 *       </tr>
 *     </thead>
 *     <tbody>
 *       <tr *ngFor="let item of myFlatArray" class="selectable-row" [attr.data-id]="item._id">
 *         <!-- Directive injects <td> checkbox here -->
 *         <td>{{item.name}}</td>
 *       </tr>
 *     </tbody>
 *   </table>
 * </div>
 * 
 * * ⚠️ COMMON PITFALLS & STRICT RULES:
 * 1. [selectionData] MUST BE ACCURATE: The directive relies heavily on 
 *    `selectionData`. If you change views (e.g., Voucher to Individual), 
 *    ensure `selectionData` is repopulated. If `selectionData` is empty, 
 *    the "Select All" button will do nothing (like a dummy button).
 * 2. ROOT LEVEL ID: The objects inside `selectionData` MUST contain the 
 *    property defined by `idField` (defaults to `_id`) at their ROOT level.
 *    If your data has `{ item: { _id: 123 } }`, you MUST flatten it or add 
 *    `_id` to the root (`{ _id: 123, item: {...} }`). Otherwise, 
 *    "Select All" will fail to extract IDs and pass nothing to the service.
 * 3. DOM data-id ATTRIBUTE: Your table rows matched by `rowSelector` MUST 
 *    have `[attr.data-id]="item._id"`. This is how individual clicks know 
 *    which ID to toggle. If omitted, it falls back to index mapping, which 
 *    can easily break when pagination or DOM-filtering is applied.
 * 4. DYNAMIC COLSPANS: Since this directive dynamically prepends a `<td>` and 
 *    `<th>`, hardcoded colspans (e.g., `colspan="6"`) on full-width rows might 
 *    break visually. Use larger colspans like `colspan="100"` for dynamic rows.
 * 
 * ============================================================================
 */
@Directive({
    selector: '[appTableSmartCheckbox]'
})
export class TableSmartCheckboxDirective implements AfterViewInit, OnDestroy, OnChanges {
    @Input('appTableSmartCheckbox') selectionContext: string = 'default';
    @Input() idField: string = '_id';
    @Input() selectionData: any[] = []; // The data array being displayed
    @Input() showCheckboxes: boolean = true;
    @Input() autoReset: boolean = true;
    @Input() rowSelector: string = 'tbody tr';

    private observer: MutationObserver | null = null;
    private headerCheckbox: HTMLInputElement | null = null;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        private selectionService: SelectionService,
        private ngZone: NgZone
    ) { }

    ngAfterViewInit() {
        if (this.autoReset) {
            this.selectionService.clear(this.selectionContext);
        }

        // Setup container-level observer immediately
        this.setupMutationObserver();
        this.refreshUI();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['showCheckboxes'] || changes['selectionData']) {
            this.refreshUI();
        }
    }

    ngOnDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private refreshUI() {
        if (!this.showCheckboxes) {
            this.removeCheckboxes();
            return;
        }
        this.initializeSelection();
    }

    private getTableElement(): HTMLTableElement | null {
        if (this.el.nativeElement.tagName && this.el.nativeElement.tagName.toLowerCase() === 'table') {
            return this.el.nativeElement;
        }
        return this.el.nativeElement.querySelector('table');
    }

    private removeCheckboxes() {
        const table = this.getTableElement();
        if (!table) return;

        // Remove header checkbox
        const th = table.querySelector('.smart-selection-header');
        if (th) th.remove();

        // Remove row checkboxes
        const tds = table.querySelectorAll('.smart-selection-row');
        tds.forEach((td: any) => td.remove());
    }

    private initializeSelection() {
        const table = this.getTableElement();
        if (!table) return;

        // 1. Setup Header Checkbox
        const thead = table.querySelector('thead');
        if (thead) {
            const headerRow = thead.querySelector('tr');
            if (headerRow && !headerRow.querySelector('.smart-selection-header')) {
                const th = this.renderer.createElement('th');
                this.renderer.addClass(th, 'smart-selection-header');
                this.renderer.setStyle(th, 'width', '40px');

                const checkbox = this.renderer.createElement('input');
                this.renderer.setAttribute(checkbox, 'type', 'checkbox');
                this.renderer.addClass(checkbox, 'form-check-input');

                this.headerCheckbox = checkbox;
                this.renderer.listen(checkbox, 'change', (event) => {
                    this.ngZone.run(() => {
                        this.toggleAll(event.target.checked);
                    });
                });

                this.renderer.appendChild(th, checkbox);
                this.renderer.insertBefore(headerRow, th, headerRow.firstChild);
            }
        }

        // 2. Setup existing rows
        this.processRows();
    }

    private processRows() {
        const table = this.getTableElement();
        if (!table || !this.showCheckboxes) return;

        const rows = table.querySelectorAll(this.rowSelector);
        rows.forEach((row: any, index: number) => {
            if (row.querySelector('.smart-selection-row')) return;

            const td = this.renderer.createElement('td');
            this.renderer.addClass(td, 'smart-selection-row');

            const checkbox = this.renderer.createElement('input');
            this.renderer.setAttribute(checkbox, 'type', 'checkbox');
            this.renderer.addClass(checkbox, 'form-check-input');

            // Get ID from data-id attribute on the row if available (for client-side pagination/search)
            // Fallback to index-based lookup if data-id is not provided
            let id = row.getAttribute('data-id');
            if (!id) {
                const rowData = this.selectionData[index];
                id = rowData ? rowData[this.idField] : null;
            }

            if (id) {
                checkbox.checked = this.selectionService.isSelected(this.selectionContext, id);
                this.renderer.listen(checkbox, 'change', () => {
                    this.ngZone.run(() => {
                        this.selectionService.toggle(this.selectionContext, id);
                        this.updateHeaderCheckboxState();
                    });
                });
            }

            this.renderer.appendChild(td, checkbox);
            this.renderer.insertBefore(row, td, row.firstChild);
        });
    }

    private toggleAll(checked: boolean) {
        if (!this.selectionData || this.selectionData.length === 0) return;

        const ids = this.selectionData.map(item => item[this.idField]).filter(id => !!id);

        if (checked) {
            this.selectionService.selectMany(this.selectionContext, ids);
        } else {
            this.selectionService.deselectMany(this.selectionContext, ids);
        }

        // Update UI checkboxes manually for immediacy
        const table = this.getTableElement();
        if (table) {
            const rowCheckboxes = table.querySelectorAll('tbody .smart-selection-row input[type="checkbox"]');
            rowCheckboxes.forEach((cb: any) => cb.checked = checked);
        }
    }

    private updateHeaderCheckboxState() {
        if (!this.headerCheckbox || !this.selectionData || !this.selectionData.length) return;

        const selectedLen = this.selectionService.getSelected(this.selectionContext).length;
        const totalLen = this.selectionData.length;

        this.headerCheckbox.checked = selectedLen === totalLen;
        this.headerCheckbox.indeterminate = selectedLen > 0 && selectedLen < totalLen;
    }

    private setupMutationObserver() {
        // Observe the root directive container so table insertion (*ngIf) is caught immediately
        if (this.observer) {
            this.observer.disconnect();
        }

        this.observer = new MutationObserver(() => {
            if (this.showCheckboxes) {
                this.refreshUI();
                this.updateHeaderCheckboxState();
            }
        });

        this.observer.observe(this.el.nativeElement, { childList: true, subtree: true });
    }
}
