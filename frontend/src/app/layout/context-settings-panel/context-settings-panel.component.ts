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
        return this.auth.webUser?.settings?.[key]?.[colName] || false;
    }

    toggleSetting(key: string, colName: string) {
        this.ensureKey(key);
        this.auth.webUser.settings[key][colName] = !this.auth.webUser.settings[key][colName];
        this.auth.updateSettings();
    }

    // --- Permissions ---
    togglePermission(key: string, perm: 'add' | 'edit' | 'delete') {
        this.ensureKey(key);
        this.auth.webUser.settings[key][perm] = !this.auth.webUser.settings[key][perm];
        this.auth.updateSettings();
    }

    getPermission(key: string, perm: 'add' | 'edit' | 'delete'): boolean {
        return this.auth.webUser?.settings?.[key]?.[perm] || false;
    }

    // --- Page Visibility ---
    togglePageVisible(key: string) {
        this.ensureKey(key);
        this.auth.webUser.settings[key].visible = !this.auth.webUser.settings[key].visible;
        this.auth.updateSettings();
    }

    getPageVisible(key: string): boolean {
        return this.auth.webUser?.settings?.[key]?.visible || false;
    }

    // --- UI Modes (Radio style) ---
    setUIMode(key: string, settingKey: string, value: string) {
        this.ensureKey(key);
        this.auth.webUser.settings[key][settingKey] = value;
        this.auth.updateSettings();
    }

    getUIMode(key: string, settingKey: string): string {
        return this.auth.webUser?.settings?.[key]?.[settingKey] || '';
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
