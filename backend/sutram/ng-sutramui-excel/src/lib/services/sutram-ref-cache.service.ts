/**
 * sutram-ref-cache.service.ts
 * ─────────────────────────────────────────────────────────────
 * Dedicated in-memory caching, formatting, and matching service
 * for Foreign Key reference tables across the Sutram Excel Studio.
 * Adheres to AGENTS.md Rule 8 (Bilingual {{ hin }} : {{ eng }} formatting).
 * ─────────────────────────────────────────────────────────────
 */

import { Injectable } from '@angular/core';
import { Observable, of, tap, catchError } from 'rxjs';
import { SutramExcelApiService } from './sutram-excel-api.service';
import { cleanString, stringSimilarity } from '../utils/normalization.utils';

export interface SutramRefOption {
  id: any;
  display: string;
  hin?: string;
  eng?: string;
  code?: string;
  raw: any;
  parentId?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SutramRefCacheService {
  private cache = new Map<string, any[]>();
  private formattedCache = new Map<string, SutramRefOption[]>();
  private inFlight = new Map<string, Observable<any[]>>();

  constructor(private api: SutramExcelApiService) {}

  /**
   * Loads reference data for a given table, utilizing cache if already loaded.
   */
  public loadRefData(table: string): Observable<any[]> {
    if (!table) return of([]);

    const cleanTable = table.toLowerCase().trim();
    if (this.cache.has(cleanTable)) {
      return of(this.cache.get(cleanTable)!);
    }

    if (this.inFlight.has(cleanTable)) {
      return this.inFlight.get(cleanTable)!;
    }

    const obs = this.api.getRefData(cleanTable).pipe(
      tap((records: any[]) => {
        this.cache.set(cleanTable, records || []);
        this.buildFormattedCache(cleanTable, records || []);
        this.inFlight.delete(cleanTable);
      }),
      catchError((err: any) => {
        console.error(`[SutramRefCache] Failed to load ref data for ${cleanTable}:`, err);
        this.inFlight.delete(cleanTable);
        return of([]);
      })
    );

    this.inFlight.set(cleanTable, obs);
    return obs;
  }

  /**
   * Preloads reference data for an array of tables in parallel
   */
  public preloadTables(tables: string[]): void {
    if (!tables || tables.length === 0) return;
    const unique = Array.from(new Set(tables.map(t => t.toLowerCase().trim())));
    for (const tbl of unique) {
      if (tbl && !this.cache.has(tbl)) {
        this.loadRefData(tbl).subscribe();
      }
    }
  }

  /**
   * Formats a record following AGENTS.md Rule 8:
   * {{ item.hin }} : {{ item.eng }}{{ item.code ? ' : ' + item.code : '' }}
   */
  public formatOption(table: string, item: any): SutramRefOption {
    if (!item) {
      return { id: null, display: '', raw: null };
    }

    const tbl = (table || '').toLowerCase().trim();
    let hin = '';
    let eng = '';
    let code = '';
    let id = item[`${tbl}_id`] ?? item.id ?? item._id ?? item.item_id ?? item.code;

    // Detect field names based on schema conventions
    switch (tbl) {
      case 'mm':
        hin = item.mm_hin || '';
        eng = item.mm_eng || '';
        code = item.mm_code || '';
        id = item._id ?? item.mm_id ?? item.id;
        break;
      case 'category':
        hin = item.category_hin || '';
        eng = item.category_eng || '';
        id = item._id ?? item.category_id ?? item.id;
        break;
      case 'item':
        hin = item.item_hin || '';
        eng = item.item_eng || '';
        code = item.item_code || '';
        id = item._id ?? item.item_id ?? item.id;
        break;
      case 'subitem':
        hin = item.subitem_hin || '';
        eng = item.subitem_eng || '';
        code = item.subitem_code || '';
        id = item._id ?? item.subitem_id ?? item.id;
        break;
      case 'unit':
        hin = item.unit_full || item.unit_short || '';
        eng = item.unit_short || '';
        id = item._id ?? item.unit_id ?? item.id;
        break;
      case 'support_list':
        hin = item.list_name_hin || '';
        eng = item.list_name_eng || '';
        id = item._id ?? item.support_list_id ?? item.id;
        break;
      case 'pbk':
        hin = item.pbk_hin || '';
        eng = item.pbk_eng || '';
        code = item.roll_no ? String(item.roll_no) : '';
        id = item._id ?? item.pbk_id ?? item.id;
        break;
      case 'nimitt':
        hin = item.nimitt_hin || '';
        eng = item.nimitt_eng || '';
        code = item.roll_no ? String(item.roll_no) : '';
        id = item._id ?? item.nimitt_id ?? item.id;
        break;
      case 'state':
        hin = item.state_hin || '';
        eng = item.state_eng || '';
        code = item.state_code || '';
        id = item._id ?? item.state_id ?? item.id;
        break;
      case 'district':
        hin = item.district_hin || '';
        eng = item.district_eng || '';
        id = item._id ?? item.district_id ?? item.id;
        break;
      case 'city':
        hin = item.city_hin || '';
        eng = item.city_eng || '';
        id = item._id ?? item.city_id ?? item.id;
        break;
      case 'zone':
        hin = item.zone_hin || '';
        eng = item.zone_eng || '';
        id = item._id ?? item.zone_id ?? item.id;
        break;
      case 'country':
        hin = item.country_hin || '';
        eng = item.country_eng || '';
        id = item._id ?? item.country_id ?? item.id;
        break;
      case 'department':
        hin = item.dept_hin || item.department_hin || '';
        eng = item.dept_eng || item.department_eng || '';
        code = item.dept_code || '';
        id = item._id ?? item.dept_id ?? item.department_id ?? item.id;
        break;
      case 'product':
        hin = item.product_hin || item.product_detail || '';
        eng = item.product_eng || item.company_name || '';
        code = item.product_code || item.sr_num || '';
        id = item._id ?? item.product_id ?? item.id;
        break;
      case 'vehicle':
        hin = item.gadi_name || item.vehicle_type || '';
        eng = item.gadi_num || '';
        id = item._id ?? item.vehicle_id ?? item.id;
        break;
      default:
        hin = item[`${tbl}_hin`] || item.name_hin || item.title_hin || item.label_hin || '';
        eng = item[`${tbl}_eng`] || item.name_eng || item.title_eng || item.name || item.title || '';
        code = item[`${tbl}_code`] || item.code || '';
        id = item._id ?? item[`${tbl}_id`] ?? item.id;
        break;
    }

    // Build Rule 8 display string
    let display = '';
    if (hin && eng) {
      display = `${hin} : ${eng}`;
    } else {
      display = hin || eng || code || String(id || '');
    }

    if (code && !display.includes(code)) {
      display = `${display} : ${code}`;
    }

    return {
      id: id,
      display: display.trim(),
      hin: hin.trim(),
      eng: eng.trim(),
      code: code ? code.trim() : undefined,
      raw: item,
      parentId: item.parent_id ?? item.item_id ?? item.parent_item_id
    };
  }

  private buildFormattedCache(table: string, records: any[]): void {
    const formatted = (records || []).map(r => this.formatOption(table, r));
    this.formattedCache.set(table, formatted);
  }

  /**
   * Returns all formatted options for a given table, optionally filtered by parentId.
   */
  public getOptions(table: string, parentId?: any): SutramRefOption[] {
    const cleanTable = (table || '').toLowerCase().trim();
    const options = this.formattedCache.get(cleanTable) || [];

    if (parentId !== undefined && parentId !== null && parentId !== '') {
      return options.filter(opt => {
        const p = opt.parentId;
        return p !== undefined && p !== null && String(p) === String(parentId);
      });
    }

    return options;
  }

  /**
   * Bilingual autocomplete search matching English, Hindi, Roman, or Code.
   */
  public searchOptions(table: string, query: string, parentId?: any, limit: number = 25): SutramRefOption[] {
    const options = this.getOptions(table, parentId);
    const cleanQ = cleanString(query || '');

    if (!cleanQ) {
      return options.slice(0, limit);
    }

    const results: SutramRefOption[] = [];
    for (const opt of options) {
      const matchDisplay = cleanString(opt.display).includes(cleanQ);
      const matchHin = opt.hin ? cleanString(opt.hin).includes(cleanQ) : false;
      const matchEng = opt.eng ? cleanString(opt.eng).includes(cleanQ) : false;
      const matchCode = opt.code ? cleanString(opt.code).includes(cleanQ) : false;
      const matchId = opt.id !== undefined && opt.id !== null ? String(opt.id) === String(query).trim() : false;

      if (matchDisplay || matchHin || matchEng || matchCode || matchId) {
        results.push(opt);
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  /**
   * Finds a reference match for a given raw input string or numeric ID.
   */
  public findRefMatch(
    table: string,
    query: any,
    parentId?: any
  ): { found: boolean; item?: any; id?: any; display?: string } {
    if (query === null || query === undefined || query === '') {
      return { found: false };
    }

    const cleanTable = (table || '').toLowerCase().trim();
    const options = this.getOptions(cleanTable, parentId);
    if (options.length === 0) {
      return { found: false };
    }

    const queryStr = String(query).trim();
    const cleanQ = cleanString(queryStr);

    // 1. Exact numeric ID match
    const byId = options.find(o => String(o.id) === queryStr);
    if (byId) {
      return { found: true, item: byId.raw, id: byId.id, display: byId.display };
    }

    // 2. Exact code match
    const byCode = options.find(o => o.code && cleanString(o.code) === cleanQ);
    if (byCode) {
      return { found: true, item: byCode.raw, id: byCode.id, display: byCode.display };
    }

    // 3. Exact Hindi or English match
    const byExactName = options.find(o => {
      const h = o.hin ? cleanString(o.hin) : '';
      const e = o.eng ? cleanString(o.eng) : '';
      const d = cleanString(o.display);
      return h === cleanQ || e === cleanQ || d === cleanQ;
    });
    if (byExactName) {
      return { found: true, item: byExactName.raw, id: byExactName.id, display: byExactName.display };
    }

    // 4. Fuzzy similarity match (>= 0.85 confidence)
    let bestMatch: SutramRefOption | null = null;
    let bestScore = 0;

    for (const opt of options) {
      const candidates = [opt.hin, opt.eng, opt.display, opt.code].filter(Boolean) as string[];
      for (const cand of candidates) {
        const score = stringSimilarity(cleanQ, cleanString(cand));
        if (score > bestScore && score >= 0.85) {
          bestScore = score;
          bestMatch = opt;
        }
      }
    }

    if (bestMatch) {
      return { found: true, item: bestMatch.raw, id: bestMatch.id, display: bestMatch.display };
    }

    return { found: false };
  }

  /**
   * Clears in-memory caches
   */
  public clearCache(): void {
    this.cache.clear();
    this.formattedCache.clear();
    this.inFlight.clear();
  }
}
