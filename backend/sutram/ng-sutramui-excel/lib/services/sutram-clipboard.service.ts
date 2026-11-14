/**
 * sutram-clipboard.service.ts
 * ─────────────────────────────────────────────────────────────
 * Multi-cell copy & paste clipboard management service.
 * ─────────────────────────────────────────────────────────────
 */

import { Injectable } from '@angular/core';
import { parseTsvToMatrix, matrixToTsv } from '../utils/clipboard.utils';
import { SutramRow, SutramHeaderConfig } from '../models/sutram-excel.model';

@Injectable({
  providedIn: 'root'
})
export class SutramClipboardService {

  /**
   * Copies a 2D range of rows to clipboard as TSV
   */
  public async copyRowsToClipboard(
    rows: SutramRow[],
    headers: SutramHeaderConfig[]
  ): Promise<boolean> {
    try {
      const matrix = rows.map(r => headers.map(h => r.cells[h.name]?.value ?? ''));
      const tsv = matrixToTsv(matrix);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tsv);
        return true;
      }
      return false;
    } catch (e) {
      console.error('[SutramClipboardService] Copy failed:', e);
      return false;
    }
  }

  /**
   * Reads matrix from system clipboard and applies it starting at target row and column
   */
  public async readClipboardMatrix(): Promise<string[][]> {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        return parseTsvToMatrix(text);
      }
      return [];
    } catch (e) {
      console.error('[SutramClipboardService] Read clipboard failed:', e);
      return [];
    }
  }
}
