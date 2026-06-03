import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

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

    constructor(
        private http: HttpService,
        private api: ApiService,
        private toastr: ToastrService,
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
        Swal.fire({
            title: 'Delete Attribute?',
            text: 'Iske sab values bhi delete honge. Kya aap sure hain?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Haan, Delete Karo',
            cancelButtonText: 'Nahi'
        }).then(r => {
            if (r.isConfirmed) {
                this.http.delete(this.api.getUrl('VARIANT') + 'attributes/' + row._id)
                    .subscribe((d: any) => {
                        if (d.success) {
                            this.toastr.success('Attribute delete ho gaya');
                            if (this.editAttrId === row._id) {
                                this.cancelEditAttr();
                            }
                            this.loadRows();
                            this.response.emit({ reload: true });
                        } else {
                            this.toastr.error(d.message || 'Delete nahi ho saka');
                        }
                    }, (err: any) => {
                        this.toastr.error(err.error?.message || 'Server error while deleting');
                    });
            }
        });
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
        Swal.fire({
            title: 'Delete Value?',
            text: 'Kya aap is value ko delete karna chahte hain?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Haan, Delete Karo',
            cancelButtonText: 'Nahi'
        }).then(r => {
            if (r.isConfirmed) {
                this.http.delete(this.api.getUrl('VARIANT') + 'attribute-values/' + row._id)
                    .subscribe((d: any) => {
                        if (d.success) {
                            this.toastr.success('Value delete ho gayi');
                            if (this.editAttrValId === row._id) {
                                this.cancelEditAttrVal();
                            }
                            this.loadRows();
                            this.response.emit({ reload: true });
                        } else {
                            this.toastr.error(d.message || 'Delete nahi ho saka');
                        }
                    }, (err: any) => {
                        this.toastr.error(err.error?.message || 'Server error while deleting');
                    });
            }
        });
    }

    onAttrValFilter(id: any) {
        this.attrValFilter = id || null;
        this.loadRows();
    }
}
