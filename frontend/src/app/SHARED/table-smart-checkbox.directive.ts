import { Directive, ElementRef, Input, OnDestroy, AfterViewInit, Renderer2, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
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
    private selectionSubscription: Subscription | null = null;

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

        // Subscribe to selection updates to keep UI in sync
        this.selectionSubscription = this.selectionService.getSelected$(this.selectionContext).subscribe(() => {
            this.syncRowCheckboxes();
            this.updateHeaderCheckboxState();
        });

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
        if (this.selectionSubscription) {
            this.selectionSubscription.unsubscribe();
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
            if (headerRow) {
                let th = headerRow.querySelector('.smart-selection-header') as HTMLElement;
                if (!th) {
                    th = this.renderer.createElement('th');
                    this.renderer.addClass(th, 'smart-selection-header');
                    this.renderer.setStyle(th, 'width', '40px');
                    this.renderer.setStyle(th, 'cursor', 'pointer');
                    this.renderer.setStyle(th, 'text-align', 'center');
                    this.renderer.setStyle(th, 'vertical-align', 'middle');
                    this.renderer.setAttribute(th, 'freezeCol', '0');

                    const checkbox = this.renderer.createElement('input');
                    this.renderer.setAttribute(checkbox, 'type', 'checkbox');
                    this.renderer.addClass(checkbox, 'form-check-input');

                    this.headerCheckbox = checkbox;

                    // Stop click propagation on the checkbox itself so the th click listener doesn't double-toggle
                    this.renderer.listen(checkbox, 'click', (event: MouseEvent) => {
                        event.stopPropagation();
                    });

                    this.renderer.listen(checkbox, 'change', (event) => {
                        this.ngZone.run(() => {
                            this.toggleAll(event.target.checked);
                        });
                    });

                    // Clicking anywhere in the th cell toggles the checkbox safely without double-trigger
                    this.renderer.listen(th, 'click', (event: MouseEvent) => {
                        event.stopPropagation();
                        if ((event.target as HTMLElement) === checkbox) {
                            return;
                        }
                        checkbox.click();
                    });

                    this.renderer.appendChild(th, checkbox);
                    this.renderer.insertBefore(headerRow, th, headerRow.firstChild);
                } else {
                    this.headerCheckbox = th.querySelector('input[type="checkbox"]');
                }
            }
        }

        // 2. Setup existing rows
        this.processRows();
        this.updateHeaderCheckboxState();
    }

    private processRows() {
        const table = this.getTableElement();
        if (!table || !this.showCheckboxes) return;

        const rows = table.querySelectorAll(this.rowSelector);
        rows.forEach((row: any, index: number) => {
            let id = row.getAttribute('data-id');
            if (id === null || id === undefined || id === '') {
                const rowData = this.selectionData[index];
                id = rowData ? rowData[this.idField] : null;
            }

            let td = row.querySelector('.smart-selection-row');
            let checkbox: HTMLInputElement | null = null;

            if (!td) {
                td = this.renderer.createElement('td');
                this.renderer.addClass(td, 'smart-selection-row');
                this.renderer.setStyle(td, 'cursor', 'pointer');
                this.renderer.setStyle(td, 'text-align', 'center');
                this.renderer.setStyle(td, 'vertical-align', 'middle');
                this.renderer.setAttribute(td, 'freezeCol', '0');

                checkbox = this.renderer.createElement('input');
                this.renderer.setAttribute(checkbox, 'type', 'checkbox');
                this.renderer.addClass(checkbox, 'form-check-input');

                // Stop click propagation on the checkbox itself so td click listener doesn't double-toggle
                this.renderer.listen(checkbox, 'click', (event: MouseEvent) => {
                    event.stopPropagation();
                });

                if (id !== null && id !== undefined) {
                    this.renderer.listen(checkbox, 'change', () => {
                        this.ngZone.run(() => {
                            this.selectionService.toggle(this.selectionContext, id);
                            this.updateHeaderCheckboxState();
                        });
                    });
                }

                // Clicking anywhere in the td cell toggles the checkbox safely without double-trigger or row expansion
                this.renderer.listen(td, 'click', (event: MouseEvent) => {
                    event.stopPropagation();
                    if ((event.target as HTMLElement) === checkbox) {
                        return;
                    }
                    if (checkbox) {
                        checkbox.click();
                    }
                });

                this.renderer.appendChild(td, checkbox);
                this.renderer.insertBefore(row, td, row.firstChild);
            } else {
                checkbox = td.querySelector('input[type="checkbox"]');
            }

            if (checkbox && id !== null && id !== undefined) {
                checkbox.checked = this.selectionService.isSelected(this.selectionContext, id);
            }
        });
    }

    private syncRowCheckboxes() {
        const table = this.getTableElement();
        if (!table) return;

        const rows = table.querySelectorAll(this.rowSelector);
        rows.forEach((row: any, index: number) => {
            const cb = row.querySelector('.smart-selection-row input[type="checkbox"]');
            if (cb) {
                let id = row.getAttribute('data-id');
                if (id === null || id === undefined || id === '') {
                    const rowData = this.selectionData[index];
                    id = rowData ? rowData[this.idField] : null;
                }
                if (id !== null && id !== undefined) {
                    cb.checked = this.selectionService.isSelected(this.selectionContext, id);
                }
            }
        });
    }

    private getCurrentPageIds(): any[] {
        const table = this.getTableElement();
        if (!table) return [];

        const rows = table.querySelectorAll(this.rowSelector);
        const ids: any[] = [];
        const seen = new Set<any>();

        rows.forEach((row: any, index: number) => {
            let id = row.getAttribute('data-id');
            if (id === null || id === undefined || id === '') {
                const rowData = this.selectionData[index];
                id = rowData ? rowData[this.idField] : null;
            }
            if (id !== null && id !== undefined && id !== '') {
                if (!seen.has(id)) {
                    seen.add(id);
                    ids.push(id);
                }
            }
        });
        return ids;
    }

    private toggleAll(checked: boolean) {
        const pageIds = this.getCurrentPageIds();
        if (pageIds.length === 0) return;

        if (checked) {
            this.selectionService.selectMany(this.selectionContext, pageIds);
        } else {
            this.selectionService.deselectMany(this.selectionContext, pageIds);
        }

        this.syncRowCheckboxes();
        this.updateHeaderCheckboxState();
    }

    private updateHeaderCheckboxState() {
        if (!this.headerCheckbox) return;

        const pageIds = this.getCurrentPageIds();
        if (pageIds.length === 0) {
            this.headerCheckbox.checked = false;
            this.headerCheckbox.indeterminate = false;
            return;
        }

        const allSelected = pageIds.length > 0 && pageIds.every(id => this.selectionService.isSelected(this.selectionContext, id));
        const someSelected = pageIds.some(id => this.selectionService.isSelected(this.selectionContext, id));

        this.headerCheckbox.checked = allSelected;
        this.headerCheckbox.indeterminate = !allSelected && someSelected;
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
