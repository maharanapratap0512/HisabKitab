import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-changelog-panel',
    templateUrl: './changelog-panel.component.html',
    styleUrls: ['./changelog-panel.component.scss']
})
export class ChangelogPanelComponent implements OnInit, OnChanges {

    @Input() isVisible: boolean = false;
    @Input() updates: any[] = [];
    @Input() lastSeenVersion: string | null = null;
    @Output() onClose = new EventEmitter<void>();

    expandedStates: { [key: string]: boolean } = {};

    constructor() { }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Only recalculate expansion when updates or lastSeenVersion changes AND the panel becomes visible
        if (this.isVisible && (changes['isVisible'] || changes['updates'] || changes['lastSeenVersion'])) {
            if (this.updates && this.updates.length > 0) {
                this.updates.forEach((v, index) => {
                    // If it's the latest version (index 0) OR a new version (newer than lastSeenVersion), expand it
                    if (index === 0 || !this.lastSeenVersion || this.compareVersions(v.version, this.lastSeenVersion) > 0) {
                        this.expandedStates[v.version] = true;
                    } else {
                        // Otherwise keep its current state or collapse if it's the first time
                        this.expandedStates[v.version] = this.expandedStates[v.version] || false;
                    }
                });
            }
        }
    }

    toggleVersion(version: string) {
        this.expandedStates[version] = !this.expandedStates[version];
    }

    close() {
        this.isVisible = false;
        this.onClose.emit();
    }

    getTypeIcon(type: string): string {
        switch (type.toLowerCase()) {
            case 'feature': return 'uil-rocket';
            case 'fix': return 'uil-wrench';
            case 'improvement': return 'uil-chart-growth';
            case 'coming_soon': return 'uil-clock';
            case 'warning': return 'uil-exclamation-triangle';
            default: return 'uil-info-circle';
        }
    }

    getTypeBadgeClass(type: string): string {
        switch (type.toLowerCase()) {
            case 'feature': return 'badge-feature';
            case 'fix': return 'badge-fix';
            case 'improvement': return 'badge-improvement';
            case 'coming_soon': return 'badge-coming_soon';
            case 'warning': return 'badge-outline-warning';
            default: return 'bg-secondary';
        }
    }

    compareVersions(v1: string, v2: string): number {
        if (!v1 || !v2) return 0;
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 > p2) return 1;
            if (p1 < p2) return -1;
        }
        return 0;
    }

}
