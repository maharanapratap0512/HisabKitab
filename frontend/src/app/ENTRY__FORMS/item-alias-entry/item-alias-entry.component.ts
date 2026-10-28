import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
    selector: 'app-item-alias-entry',
    templateUrl: './item-alias-entry.component.html',
    styleUrls: ['./item-alias-entry.component.scss'],
})
export class ItemAliasEntryComponent implements OnInit, OnChanges {

    @Input()  getData: any = null;   // the item or subitem object
    @Input()  type: 'item' | 'subitem' = 'item';
    @Output() response = new EventEmitter<any>();

    aliasForm = { alias: '' };
    rows:     any[] = [];

    constructor(
        private http:   HttpService,
        private api:    ApiService,
        private toastr: ToastrService,
    ) {}

    ngOnInit(): void { this.loadAliases(); }

    ngOnChanges(): void { this.loadAliases(); }

    loadAliases() {
        if (!this.getData?._id) return;
        const url = this.type === 'subitem'
            ? this.api.getUrl('VARIANT') + 'subitem-aliases/' + this.getData._id
            : this.api.getUrl('VARIANT') + 'item-aliases/' + this.getData._id;
        this.http.get(url)
            .subscribe((d: any) => { 
                if (d.success) {
                    this.rows = d.result || [];
                } else {
                    this.toastr.error(d.message || 'Aliases load nahi ho sake');
                }
            }, (err) => {
                this.toastr.error(err.error?.message || err.message || 'Aliases load karte samay error aaya');
            });
    }

    save() {
        if (!this.aliasForm.alias.trim()) { this.toastr.warning('Alias required hai'); return; }
        const isSub = this.type === 'subitem';
        const url = isSub
            ? this.api.getUrl('VARIANT') + 'subitem-aliases'
            : this.api.getUrl('VARIANT') + 'item-aliases';
        const payload = isSub
            ? { subitem_id: this.getData._id, alias: this.aliasForm.alias.trim() }
            : { item_id: this.getData._id, alias: this.aliasForm.alias.trim() };

        this.http.post(url, payload)
            .subscribe((d: any) => {
                if (d.success) {
                    this.toastr.success('Alias add ho gaya!');
                    this.aliasForm.alias = '';
                    this.loadAliases();
                    this.response.emit({ reload: true });
                } else {
                    this.toastr.error(d.message || 'Kuch error aa gaya');
                }
            }, (err) => {
                const msg = err.error?.message || err.message || 'Unique constraint ya server error';
                this.toastr.error(msg);
            });
    }

    delete(row: any) {
        const url = this.type === 'subitem'
            ? this.api.getUrl('VARIANT') + 'subitem-aliases/' + row._id
            : this.api.getUrl('VARIANT') + 'item-aliases/' + row._id;
        this.http.delete(url)
            .subscribe((d: any) => {
                if (d.success) { 
                    this.toastr.success('Alias delete ho gaya');
                    this.loadAliases(); 
                    this.response.emit({ reload: true }); 
                } else {
                    this.toastr.error(d.message || 'Delete fail ho gaya');
                }
            }, (err) => {
                this.toastr.error(err.error?.message || err.message || 'Delete fail ho gaya');
            });
    }
}
