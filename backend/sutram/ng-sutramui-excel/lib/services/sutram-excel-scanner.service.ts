/**
 * sutram-excel-scanner.service.ts
 * ─────────────────────────────────────────────────────────────
 * Smart Header Scanner & Sheet Mapper service.
 * Automatically aligns arbitrary Excel headers with Sutram schema columns.
 * ─────────────────────────────────────────────────────────────
 */

import { Injectable } from '@angular/core';
import {
  SutramTableConfig,
  SutramHeaderConfig,
  SutramScanMatch,
  SutramScanReport,
  SutramRow,
  SutramCell
} from '../models/sutram-excel.model';
import { cleanString, stringSimilarity } from '../utils/normalization.utils';

@Injectable({
  providedIn: 'root'
})
export class SutramExcelScannerService {

  /**
   * Intelligently detects the actual header row in a raw spreadsheet.
   * Handles files where Row 0 is a merge & center title, blank row, or metadata.
   */
  public detectBestHeaderRow(
    rawJson: any[][],
    config?: SutramTableConfig | null
  ): { headerRowIndex: number; headers: string[]; dataRows: any[][] } {
    if (!rawJson || rawJson.length === 0) {
      return { headerRowIndex: 0, headers: [], dataRows: [] };
    }

    let bestRowIdx = 0;
    let bestScore = -1;
    const maxLook = Math.min(10, rawJson.length);

    for (let r = 0; r < maxLook; r++) {
      const row = rawJson[r] || [];
      const nonEmpties = row.filter((c: any) => c !== null && c !== undefined && String(c).trim() !== '');
      if (nonEmpties.length === 0) continue;

      let matchScore = 0;
      if (config && config.headers && config.headers.length > 0) {
        for (const cell of row) {
          const str = cleanString(String(cell || ''));
          if (!str) continue;
          for (const h of config.headers) {
            const candidates = [h.name, h.col_name, ...(h.alt_names || [])];
            for (const cand of candidates) {
              const sim = stringSimilarity(str, cleanString(cand));
              if (sim >= 0.70) {
                matchScore += 10 + sim;
                break;
              }
            }
          }
        }
      }

      // Density score: merged headers or metadata typically have 1-2 cells,
      // while real header rows have many distinct labels across columns.
      const densityScore = nonEmpties.length;
      const totalScore = matchScore > 0 ? (matchScore * 5 + densityScore) : densityScore;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestRowIdx = r;
      }
    }

    const detectedHeaders = (rawJson[bestRowIdx] || []).map((h: any) => String(h || '').trim());
    const dataRows = rawJson.slice(bestRowIdx + 1);

    return {
      headerRowIndex: bestRowIdx,
      headers: detectedHeaders,
      dataRows
    };
  }

  /**
   * Scans sheet headers against derived table schema.
   */
  public scan(sheetHeaders: string[], config: SutramTableConfig, sampleRows: any[] = []): SutramScanReport {
    const matches: SutramScanMatch[] = [];
    const usedTargetKeys = new Set<string>();

    for (let i = 0; i < sheetHeaders.length; i++) {
      const headerText = sheetHeaders[i] || '';
      const cleanHeader = cleanString(headerText);

      let bestMatch: SutramHeaderConfig | null = null;
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
      } else {
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
    const missingMandatory: SutramHeaderConfig[] = [];
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
  public buildSutramRows(
    rawRows: any[],
    matches: SutramScanMatch[],
    headers: SutramHeaderConfig[]
  ): SutramRow[] {
    const validMatches = matches.filter(m => m.targetColKey);

    return rawRows.map((rawRow, rowIdx) => {
      const cells: Record<string, SutramCell> = {};

      for (const h of headers) {
        let value: any = '';

        // Match from raw row
        const match = validMatches.find(m => m.targetColKey === h.name);
        if (match) {
          if (Array.isArray(rawRow)) {
            value = rawRow[match.sheetColIndex] ?? '';
          } else if (typeof rawRow === 'object' && rawRow !== null) {
            value = rawRow[match.sheetHeader] ?? rawRow[h.name] ?? '';
          }
        }

        const valStr = value !== null && value !== undefined ? String(value) : '';
        cells[h.name] = {
          value: valStr,
          originalValue: valStr,
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
}
