/**
 * sutram-clipboard.service.ts
 * ─────────────────────────────────────────────────────────────
 * Multi-cell copy & paste clipboard management service.
 * ─────────────────────────────────────────────────────────────
 */
import { Injectable } from '@angular/core';
import { parseTsvToMatrix, matrixToTsv } from '../utils/clipboard.utils';
import * as i0 from "@angular/core";
export class SutramClipboardService {
    /**
     * Copies a 2D range of rows to clipboard as TSV
     */
    async copyRowsToClipboard(rows, headers) {
        try {
            const matrix = rows.map(r => headers.map(h => r.cells[h.name]?.value ?? ''));
            const tsv = matrixToTsv(matrix);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(tsv);
                return true;
            }
            return false;
        }
        catch (e) {
            console.error('[SutramClipboardService] Copy failed:', e);
            return false;
        }
    }
    /**
     * Reads matrix from system clipboard and applies it starting at target row and column
     */
    async readClipboardMatrix() {
        try {
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                return parseTsvToMatrix(text);
            }
            return [];
        }
        catch (e) {
            console.error('[SutramClipboardService] Read clipboard failed:', e);
            return [];
        }
    }
    static ɵfac = function SutramClipboardService_Factory(t) { return new (t || SutramClipboardService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SutramClipboardService, factory: SutramClipboardService.ɵfac, providedIn: 'root' });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramClipboardService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], null, null); })();
