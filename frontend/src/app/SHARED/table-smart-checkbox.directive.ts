import { Directive, ElementRef, Input, OnDestroy, AfterViewInit, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { SelectionService } from '../services/selection.service';

@Directive({
    selector: '[appTableSmartCheckbox]'
})
export class TableSmartCheckboxDirective implements AfterViewInit, OnDestroy, OnChanges {
    @Input('appTableSmartCheckbox') selectionContext: string = 'default';
    @Input() idField: string = '_id';
    @Input() selectionData: any[] = []; // The data array being displayed
    @Input() showCheckboxes: boolean = true;
    @Input() autoReset: boolean = true;

    private observer: MutationObserver | null = null;
    private headerCheckbox: HTMLInputElement | null = null;
    private initialized: boolean = false;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        private selectionService: SelectionService
    ) { }

    ngAfterViewInit() {
        if (this.autoReset) {
            this.selectionService.clear(this.selectionContext);
        }

        // Wait a bit for the table to be rendered if it's dynamic
        setTimeout(() => {
            this.refreshUI();
            this.setupMutationObserver();
            this.initialized = true;
        }, 500);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.initialized && (changes['showCheckboxes'] || changes['selectionData'])) {
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
        if (this.el.nativeElement.tagName.toLowerCase() === 'table') {
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
                    this.toggleAll(event.target.checked);
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

        const rows = table.querySelectorAll('tbody tr');
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
                    this.selectionService.toggle(this.selectionContext, id);
                    this.updateHeaderCheckboxState();
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
        const table = this.getTableElement();
        if (!table) return;

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        this.observer = new MutationObserver(() => {
            if (this.showCheckboxes) {
                this.processRows();
                this.updateHeaderCheckboxState();
            }
        });

        this.observer.observe(tbody, { childList: true, subtree: true });
    }
}
