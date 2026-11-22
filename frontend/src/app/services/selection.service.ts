import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SelectionService {
    // Map of context (table name) to a Set of selected IDs
    private selectionCache: Map<string, Set<any>> = new Map();

    // Observable maps to allow components to react to selection changes
    private selectionSubjects: Map<string, BehaviorSubject<any[]>> = new Map();

    constructor() { }

    /**
     * Get selected IDs for a specific context as an Observable
     */
    getSelected$(context: string): Observable<any[]> {
        return this.getOrCreateSubject(context).asObservable();
    }

    /**
     * Get current selected IDs for a context
     */
    getSelected(context: string): any[] {
        return Array.from(this.getOrCreateSet(context));
    }

    /**
     * Toggle selection of an ID in a context
     */
    toggle(context: string, id: any) {
        const set = this.getOrCreateSet(context);
        const existing = this.findKey(set, id);
        if (existing !== undefined) {
            set.delete(existing);
        } else {
            set.add(id);
        }
        this.notify(context);
    }

    /**
     * Select an ID in a context
     */
    select(context: string, id: any) {
        const set = this.getOrCreateSet(context);
        const existing = this.findKey(set, id);
        if (existing === undefined) {
            set.add(id);
        }
        this.notify(context);
    }

    /**
     * Deselect an ID in a context
     */
    deselect(context: string, id: any) {
        const set = this.getOrCreateSet(context);
        const existing = this.findKey(set, id);
        if (existing !== undefined) {
            set.delete(existing);
        }
        this.notify(context);
    }

    /**
     * Select many IDs
     */
    selectMany(context: string, ids: any[]) {
        const set = this.getOrCreateSet(context);
        ids.forEach(id => {
            const existing = this.findKey(set, id);
            if (existing === undefined) set.add(id);
        });
        this.notify(context);
    }

    /**
     * Deselect many IDs
     */
    deselectMany(context: string, ids: any[]) {
        const set = this.getOrCreateSet(context);
        ids.forEach(id => {
            const existing = this.findKey(set, id);
            if (existing !== undefined) set.delete(existing);
        });
        this.notify(context);
    }

    /**
     * Clear all selections for a context
     */
    clear(context: string) {
        this.selectionCache.delete(context);
        this.notify(context);
    }

    /**
     * Check if an ID is selected in a context
     */
    isSelected(context: string, id: any): boolean {
        return this.findKey(this.getOrCreateSet(context), id) !== undefined;
    }

    private findKey(set: Set<any>, id: any): any {
        if (id === null || id === undefined) return undefined;
        if (set.has(id)) return id;
        if (typeof id === 'string' && id.trim() !== '' && !isNaN(Number(id)) && set.has(Number(id))) return Number(id);
        if (typeof id === 'number' && set.has(String(id))) return String(id);
        return undefined;
    }

    /**
     * Check if a context has any selected IDs
     */
    hasSelection(context: string): boolean {
        return this.getOrCreateSet(context).size > 0;
    }

    private getOrCreateSet(context: string): Set<any> {
        if (!this.selectionCache.has(context)) {
            this.selectionCache.set(context, new Set());
        }
        return this.selectionCache.get(context)!;
    }

    private getOrCreateSubject(context: string): BehaviorSubject<any[]> {
        if (!this.selectionSubjects.has(context)) {
            this.selectionSubjects.set(context, new BehaviorSubject<any[]>([]));
        }
        return this.selectionSubjects.get(context)!;
    }

    private notify(context: string) {
        const subject = this.getOrCreateSubject(context);
        subject.next(this.getSelected(context));
    }
}
