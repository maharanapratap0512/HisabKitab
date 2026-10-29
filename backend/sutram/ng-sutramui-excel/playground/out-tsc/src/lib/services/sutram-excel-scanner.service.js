/**
 * sutram-excel-scanner.service.ts
 * ─────────────────────────────────────────────────────────────
 * Smart Header Scanner & Sheet Mapper service.
 * Automatically aligns arbitrary Excel headers with Sutram schema columns.
 * ─────────────────────────────────────────────────────────────
 */
import { Injectable } from '@angular/core';
import { cleanString, stringSimilarity } from '../utils/normalization.utils';
import * as i0 from "@angular/core";
export class SutramExcelScannerService {
    /**
     * Scans sheet headers against derived table schema.
     */
    scan(sheetHeaders, config, sampleRows = []) {
        const matches = [];
        const usedTargetKeys = new Set();
        for (let i = 0; i < sheetHeaders.length; i++) {
            const headerText = sheetHeaders[i] || '';
            const cleanHeader = cleanString(headerText);
            let bestMatch = null;
            let highestScore = 0;
            for (const targetCol of config.headers) {
                // Collect candidate names: col_name, name, and all alt_names
                const candidates = [
                    targetCol.name,
                    targetCol.col_name,
                    ...(targetCol.alt_names || [])
                ];
                for (const candidate of candidates) {
                    const score = stringSimilarity(cleanHeader, cleanString(candidate));
                    if (score > highestScore) {
                        highestScore = score;
                        bestMatch = targetCol;
                    }
                }
            }
            // Threshold: 0.70 or higher considered a valid auto-match
            if (bestMatch && highestScore >= 0.70 && !usedTargetKeys.has(bestMatch.name)) {
                usedTargetKeys.add(bestMatch.name);
                matches.push({
                    sheetColIndex: i,
                    sheetHeader: headerText,
                    targetColKey: bestMatch.name,
                    targetHeader: bestMatch,
                    status: 'matched',
                    confidence: highestScore
                });
            }
            else {
                matches.push({
                    sheetColIndex: i,
                    sheetHeader: headerText,
                    targetColKey: null,
                    status: 'unmatched',
                    confidence: highestScore
                });
            }
        }
        // Check for missing mandatory columns (not_null: true)
        const missingMandatory = [];
        for (const h of config.headers) {
            if (h.not_null && !usedTargetKeys.has(h.name)) {
                missingMandatory.push(h);
            }
        }
        return {
            headerRowIndex: 0,
            totalSheetCols: sheetHeaders.length,
            matches,
            missingMandatory,
            sampleRows: sampleRows.slice(0, 3)
        };
    }
    /**
     * Transforms raw 2D array or object rows into SutramRow objects based on column mappings
     */
    buildSutramRows(rawRows, matches, headers) {
        const validMatches = matches.filter(m => m.targetColKey);
        return rawRows.map((rawRow, rowIdx) => {
            const cells = {};
            for (const h of headers) {
                let value = '';
                // Match from raw row
                const match = validMatches.find(m => m.targetColKey === h.name);
                if (match) {
                    if (Array.isArray(rawRow)) {
                        value = rawRow[match.sheetColIndex] ?? '';
                    }
                    else if (typeof rawRow === 'object' && rawRow !== null) {
                        value = rawRow[match.sheetHeader] ?? rawRow[h.name] ?? '';
                    }
                }
                cells[h.name] = {
                    value: value !== null && value !== undefined ? value : '',
                    isValid: true,
                    isModified: false
                };
            }
            return {
                rowNum: rowIdx + 1,
                cells,
                hasError: false,
                errorCount: 0,
                _rawOriginal: rawRow
            };
        });
    }
    static ɵfac = function SutramExcelScannerService_Factory(t) { return new (t || SutramExcelScannerService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SutramExcelScannerService, factory: SutramExcelScannerService.ɵfac, providedIn: 'root' });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramExcelScannerService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], null, null); })();
