import { Injectable } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';
import { AutocompleteOption } from '../models/excel-studio.model';

@Injectable({
  providedIn: 'root'
})
export class MasterIndexerService {
  // Hash sets for O(1) instant validity checks
  private validLookups: Map<string, Set<string>> = new Map();
  // Options for fast autocomplete dropdowns
  private optionsMap: Map<string, AutocompleteOption[]> = new Map();

  constructor(private gs: GlobalService) {
    this.gs.observeList().subscribe((lists: any) => {
      if (lists) {
        this.indexAll(lists);
      }
    });
  }

  private normalize(str: any): string {
    if (str === null || str === undefined) return '';
    return String(str).trim().toLowerCase().replace(/\s+/g, ' ');
  }

  public indexAll(lists: any): void {
    // 1. MM Index
    if (lists.mm && Array.isArray(lists.mm)) {
      const set = new Set<string>();
      const opts: AutocompleteOption[] = [];
      for (const m of lists.mm) {
        if (m.mm_hin) set.add(this.normalize(m.mm_hin));
        if (m.mm_eng) set.add(this.normalize(m.mm_eng));
        if (m.mm_code) {
          set.add(this.normalize(m.mm_code));
          if (m.mm_hin) set.add(this.normalize(`${m.mm_hin} : ${m.mm_code}`));
          if (m.mm_hin) set.add(this.normalize(`${m.mm_hin} (${m.mm_code})`));
        }

        const label = m.mm_hin + (m.mm_code ? ` : ${m.mm_code}` : '');
        opts.push({
          id: m._id || m.mm_id,
          label: label,
          secondary: m.mm_eng || '',
          code: m.mm_code || '',
          raw: m
        });
      }
      this.validLookups.set('mm', set);
      this.optionsMap.set('mm', opts);
    }

    // 2. Items Index (item / subitem / itemmix)
    const itemsSource = lists.itemmix || lists.item || [];
    if (Array.isArray(itemsSource)) {
      const itemSet = new Set<string>();
      const subitemSet = new Set<string>();
      const itemOpts: AutocompleteOption[] = [];
      const subitemOpts: AutocompleteOption[] = [];

      for (const it of itemsSource) {
        // Item level
        if (it.item_hin) itemSet.add(this.normalize(it.item_hin));
        if (it.item_eng) itemSet.add(this.normalize(it.item_eng));
        if (it.item_code) itemSet.add(this.normalize(it.item_code));
        if (it.item_roman) itemSet.add(this.normalize(it.item_roman));

        // Aliases
        if (Array.isArray(it.aliases)) {
          for (const al of it.aliases) {
            if (al) itemSet.add(this.normalize(al));
          }
        }

        // Subitem level
        if (it.subitem_hin) subitemSet.add(this.normalize(it.subitem_hin));
        if (it.subitem_eng) subitemSet.add(this.normalize(it.subitem_eng));
        if (it.subitem_code) subitemSet.add(this.normalize(it.subitem_code));

        const itemLabel = it.item_hin || it.item_eng || '';
        if (itemLabel) {
          itemOpts.push({
            id: it.item_id || it._id,
            label: itemLabel,
            secondary: it.item_eng || '',
            code: it.item_code || '',
            raw: it
          });
        }

        if (it.subitem_hin) {
          subitemOpts.push({
            id: it.subitem_id || it._id,
            label: it.subitem_hin,
            secondary: it.subitem_eng || '',
            raw: it
          });
        }
      }

      this.validLookups.set('item', itemSet);
      this.optionsMap.set('item', itemOpts);

      this.validLookups.set('subitem', subitemSet);
      this.optionsMap.set('subitem', subitemOpts);
    }

    // 3. Units Index
    if (lists.unit && Array.isArray(lists.unit)) {
      const unitSet = new Set<string>();
      const unitOpts: AutocompleteOption[] = [];
      for (const u of lists.unit) {
        if (u.unit_short) unitSet.add(this.normalize(u.unit_short));
        if (u.unit_hin) unitSet.add(this.normalize(u.unit_hin));
        if (u.unit_eng) unitSet.add(this.normalize(u.unit_eng));

        unitOpts.push({
          id: u.unit_id || u._id,
          label: u.unit_short || u.unit_hin,
          secondary: u.unit_eng || '',
          raw: u
        });
      }
      this.validLookups.set('unit', unitSet);
      this.optionsMap.set('unit', unitOpts);
    }

    // 4. Condition / Support Lists
    this.indexSupportList('condition', lists.condition || []);
    this.indexSupportList('aawak_type', lists.aawak_type || []);
    this.indexSupportList('jawak_type', lists.jawak_type || []);
    this.indexSupportList('usage_list', lists.usage_list || []);
    this.indexSupportList('gender', lists.gender || []);
    this.indexSupportList('relation', lists.relation || []);

    // 5. Geographic (State, District, City)
    this.indexGeoList('state', lists.state || [], 'state_hin', 'state_eng');
    this.indexGeoList('district', lists.district || [], 'district_hin', 'district_eng');
    this.indexGeoList('city', lists.city || [], 'city_hin', 'city_eng');

    // 6. PBK & Nimitt
    this.indexPersonList('pbk', lists.pbk || [], 'pbk_hin', 'pbk_eng', 'roll_no');
    this.indexPersonList('nimitt', lists.nimitt || [], 'nimitt_hin', 'nimitt_eng', 'roll_no');
  }

  private indexSupportList(key: string, list: any[]): void {
    if (!Array.isArray(list)) return;
    const set = new Set<string>();
    const opts: AutocompleteOption[] = [];
    for (const item of list) {
      if (item.list_name_hin) set.add(this.normalize(item.list_name_hin));
      if (item.list_name_eng) set.add(this.normalize(item.list_name_eng));
      if (item.list_name_roman) set.add(this.normalize(item.list_name_roman));

      const label = item.list_name_hin || item.list_name_eng;
      opts.push({
        id: item._id || item[`${key}_id`],
        label: label,
        secondary: item.list_name_eng || '',
        raw: item
      });
    }
    this.validLookups.set(key, set);
    this.optionsMap.set(key, opts);
  }

  private indexGeoList(key: string, list: any[], hinKey: string, engKey: string): void {
    if (!Array.isArray(list)) return;
    const set = new Set<string>();
    const opts: AutocompleteOption[] = [];
    for (const item of list) {
      if (item[hinKey]) set.add(this.normalize(item[hinKey]));
      if (item[engKey]) set.add(this.normalize(item[engKey]));

      opts.push({
        id: item._id || item[`${key}_id`],
        label: item[hinKey] || item[engKey],
        secondary: item[engKey] || '',
        raw: item
      });
    }
    this.validLookups.set(key, set);
    this.optionsMap.set(key, opts);
  }

  private indexPersonList(key: string, list: any[], hinKey: string, engKey: string, rollKey: string): void {
    if (!Array.isArray(list)) return;
    const set = new Set<string>();
    const opts: AutocompleteOption[] = [];
    for (const item of list) {
      if (item[hinKey]) set.add(this.normalize(item[hinKey]));
      if (item[engKey]) set.add(this.normalize(item[engKey]));
      if (item[rollKey]) set.add(this.normalize(item[rollKey]));

      opts.push({
        id: item._id || item[`${key}_id`],
        label: item[hinKey] || item[engKey],
        secondary: item[rollKey] ? `Roll: ${item[rollKey]}` : '',
        code: item[rollKey] || '',
        raw: item
      });
    }
    this.validLookups.set(key, set);
    this.optionsMap.set(key, opts);
  }

  /**
   * O(1) Instant validity check (executed in < 0.001 milliseconds)
   */
  public isValid(refTable: string | undefined, value: any): boolean {
    if (!refTable) return true; // not linked to master table
    if (value === null || value === undefined || String(value).trim() === '') return true; // handled by not_null

    const lookupSet = this.validLookups.get(refTable);
    if (!lookupSet || lookupSet.size === 0) {
      return true; // if master list not loaded yet, do not falsely flag
    }

    const norm = this.normalize(value);
    // Direct match
    if (lookupSet.has(norm)) return true;

    // Check if user entered "Name : Code" or "Name (Code)" and either portion is valid
    if (norm.includes(':')) {
      const parts = norm.split(':').map(p => p.trim());
      if (lookupSet.has(parts[0]) || lookupSet.has(parts[1])) return true;
    }

    return false;
  }

  /**
   * Fast autocomplete suggestions (Top 20 matches)
   */
  public getSuggestions(refTable: string | undefined, query: string, limit: number = 20): AutocompleteOption[] {
    if (!refTable) return [];
    const all = this.optionsMap.get(refTable) || [];
    if (!query || !query.trim()) {
      return all.slice(0, limit);
    }

    const q = this.normalize(query);
    const results: AutocompleteOption[] = [];

    // 1st pass: startsWith
    for (const opt of all) {
      if (this.normalize(opt.label).startsWith(q) || (opt.code && this.normalize(opt.code).startsWith(q))) {
        results.push(opt);
        if (results.length >= limit) return results;
      }
    }

    // 2nd pass: includes
    for (const opt of all) {
      if (results.includes(opt)) continue;
      if (this.normalize(opt.label).includes(q) || (opt.secondary && this.normalize(opt.secondary).includes(q))) {
        results.push(opt);
        if (results.length >= limit) return results;
      }
    }

    return results;
  }

  public hasMaster(refTable: string | undefined): boolean {
    if (!refTable) return false;
    const s = this.validLookups.get(refTable);
    return !!(s && s.size > 0);
  }
}
