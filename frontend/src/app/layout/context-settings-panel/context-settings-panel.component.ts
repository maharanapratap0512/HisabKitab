import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-context-settings-panel',
    templateUrl: './context-settings-panel.component.html',
    styleUrls: ['./context-settings-panel.component.scss']
})
export class ContextSettingsPanelComponent implements OnInit, OnChanges {

    @Input() isVisible: boolean = false;
    @Input() contextKey: string | null = null; // The auto-detected key from route
    @Output() onClose = new EventEmitter<void>();

    activeKey: string | null = null; // The key selected in the sidebar (defaults to contextKey)
    activeTitle: string = '';
    activeColumns: any[] = [];
    activeUISettings: any[] = [];

    constructor(public auth: AuthService) { }

    ngOnInit(): void { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isVisible'] && this.isVisible) {
            this.activeKey = this.contextKey;
            this.resolveActive();
        }
    }

    selectPage(key: string) {
        this.activeKey = key;
        this.resolveActive();
    }

    resolveActive() {
        const key = this.activeKey || 'aawak';
        this.activeColumns = (this.auth.settingsUI as any)[key] || [];
        this.activeUISettings = (this.auth.settingsUI as any).ui_settings?.[key] || [];
        const page = this.auth.settingsUI.pageList.find((p: any) => p.key === key);
        this.activeTitle = page ? page.title : key;
    }

    // --- Core Settings ---
    getSetting(key: string, colName: string): boolean {
        const val = this.auth.webUser?.settings?.[key]?.[colName];
        return val !== undefined ? !!val : true;
    }

    toggleSetting(key: string, colName: string) {
        this.ensureKey(key);
        const current = this.getSetting(key, colName);
        this.auth.webUser.settings[key][colName] = !current;
        this.auth.updateSettings();
    }

    // --- Permissions ---
    togglePermission(key: string, perm: 'add' | 'edit' | 'delete') {
        this.ensureKey(key);
        const current = this.getPermission(key, perm);
        this.auth.webUser.settings[key][perm] = !current;
        this.auth.updateSettings();
    }

    getPermission(key: string, perm: 'add' | 'edit' | 'delete'): boolean {
        const val = this.auth.webUser?.settings?.[key]?.[perm];
        return val !== undefined ? !!val : true;
    }

    // --- Page Visibility ---
    togglePageVisible(key: string) {
        this.ensureKey(key);
        const current = this.getPageVisible(key);
        this.auth.webUser.settings[key].visible = !current;
        this.auth.updateSettings();
    }

    getPageVisible(key: string): boolean {
        const val = this.auth.webUser?.settings?.[key]?.visible;
        return val !== undefined ? !!val : true;
    }

    // --- UI Modes (Radio style) ---
    setUIMode(key: string, settingKey: string, value: string) {
        this.ensureKey(key);
        if (value === 'true') {
            this.auth.webUser.settings[key][settingKey] = true;
        } else if (value === 'false') {
            this.auth.webUser.settings[key][settingKey] = false;
        } else {
            this.auth.webUser.settings[key][settingKey] = value;
        }
        this.auth.updateSettings();
    }

    getUIMode(key: string, settingKey: string): string {
        const val = this.auth.webUser?.settings?.[key]?.[settingKey];
        if (val !== undefined && val !== null) {
            return String(val);
        }
        if (settingKey === 'item_mode') return 'subitem';
        if (settingKey === 'viewMode') return 'voucher';
        if (settingKey === 'samePageEntryForm') return 'false';
        return '';
    }

    private ensureKey(key: string) {
        if (!this.auth.webUser) {
            this.auth.webUser = {};
        }
        if (!this.auth.webUser.settings) {
            this.auth.webUser.settings = {};
        }
        if (!this.auth.webUser.settings[key]) {
            this.auth.webUser.settings[key] = {};
        }
    }

    close() {
        this.onClose.emit();
    }
}
