import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import { SelectionService } from 'src/app/services/selection.service';

@Component({
    selector: 'app-attribute-entry',
    templateUrl: './attribute-entry.component.html',
    styleUrls: ['./attribute-entry.component.scss'],
})
export class AttributeEntryComponent implements OnInit {

    @Input() mode: 'attributes' | 'attr_values' = 'attributes';
    @Input() allAttributes: any[] = [];
    @Input() initialAttrId: any = null;
    @Output() response = new EventEmitter<any>();

    // Attribute form
    attrForm = { attribute_hin: '', attribute_eng: '', attribute_roman: '' };
    editAttrId: any = null;

    // Attribute value form
    attrValForm = {
        attribute_id: null as any,
        attribute_value_hin: '', attribute_value_eng: '', attribute_value_roman: ''
    };
    editAttrValId: any = null;
    attrValFilter: any = null;   // filter table by attribute

    rows: any[] = [];
    isLoader = false;

    delID: any = null;
    delType: any = null;
    showDelete: boolean = false;

    showImportModal: boolean = false;
    importType: string = 'attribute';

    openImport(type: string) {
        this.importType = type;
        this.showImportModal = true;
    }

    closeImport() {
        this.showImportModal = false;
        this.loadRows();
    }

    onImportResponse(res: any) {
        this.loadRows();
        this.response.emit({ reload: true });
    }

    constructor(
        private http: HttpService,
        private api: ApiService,
        private toastr: ToastrService,
        public selectionService: SelectionService
    ) { }

    ngOnInit(): void {
        if (this.initialAttrId) {
            this.attrValForm.attribute_id = this.initialAttrId;
            this.attrValFilter = this.initialAttrId;
        }
        this.loadRows();
    }

    loadRows() {
        const url = this.mode === 'attributes'
            ? this.api.getUrl('VARIANT') + 'attributes'
            : (this.attrValFilter
                ? this.api.getUrl('VARIANT') + 'attributes/' + this.attrValFilter + '/values'
                : this.api.getUrl('VARIANT') + 'attribute-values');

        this.http.get(url).subscribe((d: any) => {
            this.rows = d.success ? d.result : [];
        });
    }

    editAttr(row: any) {
        this.attrForm = {
            attribute_hin: row.attribute_hin || '',
            attribute_eng: row.attribute_eng || '',
            attribute_roman: row.attribute_roman || ''
        };
        this.editAttrId = row._id;
    }

    cancelEditAttr() {
        this.attrForm = { attribute_hin: '', attribute_eng: '', attribute_roman: '' };
        this.editAttrId = null;
    }

    saveAttr() {
        if (!this.attrForm.attribute_hin.trim()) { this.toastr.warning('Hindi name required'); return; }
        this.isLoader = true;

        if (this.editAttrId) {
            const body = { _id: this.editAttrId, ...this.attrForm };
            this.http.put(this.api.getUrl('VARIANT') + 'attributes', body)
                .subscribe((d: any) => {
                    this.isLoader = false;
                    if (d.success) {
                        this.toastr.success('Attribute update ho gaya!');
                        this.cancelEditAttr();
                        this.loadRows();
                        this.response.emit({ reload: true });
                    }
                });
        } else {
            this.http.post(this.api.getUrl('VARIANT') + 'attributes', this.attrForm)
                .subscribe((d: any) => {
                    this.isLoader = false;
                    if (d.success) {
                        this.toastr.success('Attribute add ho gaya!');
                        this.attrForm = { attribute_hin: '', attribute_eng: '', attribute_roman: '', };
                        this.loadRows();
                        this.response.emit({ reload: true });
                    }
                });
        }
    }

    deleteAttr(row: any) {
        this.delID = row._id;
        this.delType = 'attribute';
        this.showDelete = true;
    }

    editAttrVal(row: any) {
        this.attrValForm = {
            attribute_id: row.attribute_id,
            attribute_value_hin: row.attribute_value_hin || '',
            attribute_value_eng: row.attribute_value_eng || '',
            attribute_value_roman: row.attribute_value_roman || ''
        };
        this.editAttrValId = row._id;
    }

    cancelEditAttrVal() {
        this.attrValForm = {
            attribute_id: this.attrValForm.attribute_id,
            attribute_value_hin: '',
            attribute_value_eng: '',
            attribute_value_roman: ''
        };
        this.editAttrValId = null;
    }

    saveAttrVal() {
        if (!this.attrValForm.attribute_id || !this.attrValForm.attribute_value_hin.trim()) {
            this.toastr.warning('Attribute aur Hindi value required hai');
            return;
        }
        this.isLoader = true;

        if (this.editAttrValId) {
            const body = { _id: this.editAttrValId, ...this.attrValForm };
            this.http.put(this.api.getUrl('VARIANT') + 'attribute-values', body)
                .subscribe((d: any) => {
                    this.isLoader = false;
                    if (d.success) {
                        this.toastr.success('Value update ho gayi!');
                        this.cancelEditAttrVal();
                        this.loadRows();
                        this.response.emit({ reload: true });
                    }
                });
        } else {
            this.http.post(this.api.getUrl('VARIANT') + 'attribute-values', this.attrValForm)
                .subscribe((d: any) => {
                    this.isLoader = false;
                    if (d.success) {
                        this.toastr.success('Value add ho gayi!');
                        this.attrValForm.attribute_value_eng = '';
                        this.attrValForm.attribute_value_hin = '';
                        this.attrValForm.attribute_value_roman = '';
                        this.loadRows();
                        this.response.emit({ reload: true });
                    }
                });
        }
    }

    deleteAttrVal(row: any) {
        this.delID = row._id;
        this.delType = 'attribute_value';
        this.showDelete = true;
    }

    deleteSelectedAttr() {
        const selectedIds = this.selectionService.getSelected('attribute');
        if (!selectedIds || selectedIds.length === 0) {
            this.toastr.warning('Please select at least one attribute to delete.');
            return;
        }
        this.delID = selectedIds;
        this.delType = 'attribute';
        this.showDelete = true;
    }

    deleteSelectedAttrVal() {
        const selectedIds = this.selectionService.getSelected('attribute_value');
        if (!selectedIds || selectedIds.length === 0) {
            this.toastr.warning('Please select at least one value to delete.');
            return;
        }
        this.delID = selectedIds;
        this.delType = 'attribute_value';
        this.showDelete = true;
    }

    onDeleteRes(res: any) {
        this.showDelete = false;
        if (res) {
            this.selectionService.clear('attribute');
            this.selectionService.clear('attribute_value');
            this.loadRows();
            this.response.emit({ reload: true });
        }
    }

    onAttrValFilter(id: any) {
        this.attrValFilter = id || null;
        this.loadRows();
    }
}
