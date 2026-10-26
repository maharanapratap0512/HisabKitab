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
  // Subitems indexed by parent item identifiers (Hindi, English, Code, ID, Aliases)
  private itemKeyToSubitems: Map<string, AutocompleteOption[]> = new Map();
  private itemKeyToValidSubitems: Map<string, Set<string>> = new Map();

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

    // 2. Items & Subitems Index (item / subitem / itemmix)
    const itemsSource = Array.isArray(lists.itemmix) ? lists.itemmix : (lists.itemmix?.data || lists.item || []);
    if (Array.isArray(itemsSource)) {
      const itemSet = new Set<string>();
      const globalSubitemSet = new Set<string>();
      const itemOpts: AutocompleteOption[] = [];
      const globalSubitemOpts: AutocompleteOption[] = [];

      this.itemKeyToSubitems.clear();
      this.itemKeyToValidSubitems.clear();

      for (const it of itemsSource) {
        if (!it) continue;
        const itemId = it._id || it.item_id;
        const itemHin = (it.item_hin || '').trim();
        const itemEng = (it.item_eng || '').trim();
        const itemCode = (it.item_code || '').trim();
        const itemRoman = (it.item_roman || '').trim();

        // Collect all aliases
        const aliases: string[] = [];
        if (Array.isArray(it.aliases)) {
          for (const al of it.aliases) {
            if (typeof al === 'string' && al.trim()) aliases.push(al.trim());
            else if (al && al.alias && typeof al.alias === 'string' && al.alias.trim()) aliases.push(al.alias.trim());
          }
        }
        if (Array.isArray(it.item_aliases)) {
          for (const al of it.item_aliases) {
            if (typeof al === 'string' && al.trim()) aliases.push(al.trim());
            else if (al && al.alias && typeof al.alias === 'string' && al.alias.trim()) aliases.push(al.alias.trim());
          }
        }

        // Add parent item identifiers to itemSet
        if (itemHin) itemSet.add(this.normalize(itemHin));
        if (itemEng) itemSet.add(this.normalize(itemEng));
        if (itemCode) itemSet.add(this.normalize(itemCode));
        if (itemRoman) itemSet.add(this.normalize(itemRoman));
        if (itemId) itemSet.add(this.normalize(String(itemId)));
        if (itemHin && itemCode) {
          itemSet.add(this.normalize(`${itemHin} : ${itemCode}`));
          itemSet.add(this.normalize(`${itemHin} (${itemCode})`));
        }
        for (const al of aliases) {
          itemSet.add(this.normalize(al));
        }

        const itemLabel = itemHin || itemEng || itemCode;
        if (itemLabel) {
          itemOpts.push({
            id: itemId,
            label: itemLabel,
            secondary: itemEng || '',
            code: itemCode || '',
            raw: it
          });
        }

        // Subitems linked to this item
        const subitemsList: any[] = Array.isArray(it.subitems) ? it.subitems : [];
        const thisItemSubitemOpts: AutocompleteOption[] = [];
        const thisItemSubitemValidSet = new Set<string>();

        for (const sub of subitemsList) {
          if (!sub) continue;
          const subId = sub._id || sub.subitem_id;
          const subHin = (sub.subitem_hin || sub.display_name_hin || '').trim();
          const subEng = (sub.subitem_eng || sub.display_name_eng || '').trim();
          const subCode = (sub.subitem_code || sub.sku || '').trim();
          const subRoman = (sub.subitem_roman || sub.display_name_roman || '').trim();

          const subLabel = subHin || subEng || subCode;
          if (!subLabel) continue;

          // Validity strings for this subitem
          if (subHin) thisItemSubitemValidSet.add(this.normalize(subHin));
          if (subEng) thisItemSubitemValidSet.add(this.normalize(subEng));
          if (subCode) thisItemSubitemValidSet.add(this.normalize(subCode));
          if (subRoman) thisItemSubitemValidSet.add(this.normalize(subRoman));
          if (subId) thisItemSubitemValidSet.add(this.normalize(String(subId)));
          if (subHin && subCode) {
            thisItemSubitemValidSet.add(this.normalize(`${subHin} : ${subCode}`));
            thisItemSubitemValidSet.add(this.normalize(`${subHin} (${subCode})`));
          }

          // Also add to global subitem set
          if (subHin) globalSubitemSet.add(this.normalize(subHin));
          if (subEng) globalSubitemSet.add(this.normalize(subEng));
          if (subCode) globalSubitemSet.add(this.normalize(subCode));
          if (subRoman) globalSubitemSet.add(this.normalize(subRoman));
          if (subId) globalSubitemSet.add(this.normalize(String(subId)));

          const subOpt: AutocompleteOption = {
            id: subId,
            label: subLabel,
            secondary: subEng ? `${subEng} (${itemLabel})` : itemLabel,
            code: subCode,
            raw: { ...sub, parent_item: it }
          };

          thisItemSubitemOpts.push(subOpt);

          // Add to global subitem options list (with clear parent item tag)
          globalSubitemOpts.push({
            id: subId,
            label: subLabel,
            secondary: (subEng ? subEng + ' • ' : '') + `आइटम: ${itemLabel}`,
            code: subCode,
            raw: { ...sub, parent_item: it }
          });
        }

        // Map every identifier of parent item to its subitems list & valid set
        const parentKeys: string[] = [];
        if (itemHin) parentKeys.push(this.normalize(itemHin));
        if (itemEng) parentKeys.push(this.normalize(itemEng));
        if (itemCode) parentKeys.push(this.normalize(itemCode));
        if (itemRoman) parentKeys.push(this.normalize(itemRoman));
        if (itemId) parentKeys.push(this.normalize(String(itemId)));
        if (itemHin && itemCode) {
          parentKeys.push(this.normalize(`${itemHin} : ${itemCode}`));
          parentKeys.push(this.normalize(`${itemHin} (${itemCode})`));
        }
        for (const al of aliases) {
          parentKeys.push(this.normalize(al));
        }

        for (const pKey of parentKeys) {
          this.itemKeyToSubitems.set(pKey, thisItemSubitemOpts);
          this.itemKeyToValidSubitems.set(pKey, thisItemSubitemValidSet);
        }
      }

      this.validLookups.set('item', itemSet);
      this.optionsMap.set('item', itemOpts);

      this.validLookups.set('subitem', globalSubitemSet);
      this.optionsMap.set('subitem', globalSubitemOpts);
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

    // 7. Category Index (Item / Subitem Categories)
    const catList = Array.isArray(lists.category) ? lists.category : (lists.category?.data || []);
    if (Array.isArray(catList) && catList.length > 0) {
      const catSet = new Set<string>();
      const catOpts: AutocompleteOption[] = [];
      for (const c of catList) {
        if (c.category_hin) catSet.add(this.normalize(c.category_hin));
        if (c.category_eng) catSet.add(this.normalize(c.category_eng));
        if (c.category_roman) catSet.add(this.normalize(c.category_roman));
        if (c._id) catSet.add(this.normalize(String(c._id)));

        // Aliases
        if (Array.isArray(c.alias)) {
          for (const al of c.alias) {
            if (typeof al === 'string') catSet.add(this.normalize(al));
            else if (al && al.alias) catSet.add(this.normalize(al.alias));
          }
        }

        catOpts.push({
          id: c._id || c.category_id,
          label: c.category_hin || c.category_eng,
          secondary: c.category_eng || '',
          raw: c
        });
      }
      this.validLookups.set('category', catSet);
      this.optionsMap.set('category', catOpts);
    }

    // 8. Standard Subitem List Directory (subitem_list)
    const sitList = Array.isArray(lists.subitem_list) ? lists.subitem_list : (lists.subitem_list?.data || []);
    if (Array.isArray(sitList) && sitList.length > 0) {
      this.indexGeoList('subitem_list', sitList, 'subitem_hin', 'subitem_eng');
    }

    // 9. Attributes & Attribute Values
    const attrList = Array.isArray(lists.attribute) ? lists.attribute : (lists.attribute?.data || []);
    if (Array.isArray(attrList) && attrList.length > 0) {
      this.indexGeoList('attribute', attrList, 'attribute_hin', 'attribute_eng');
    }
    const attrValList = Array.isArray(lists.attributes_value) ? lists.attributes_value : (lists.attributes_value?.data || []);
    if (Array.isArray(attrValList) && attrValList.length > 0) {
      this.indexGeoList('attributes_value', attrValList, 'attribute_value_hin', 'attribute_value_eng');
    }
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

  /**
   * Helper to find subitem options array for a parent item key
   */
  public getItemSubitemOptions(normParent: string): AutocompleteOption[] | undefined {
    if (!normParent) return undefined;
    if (this.itemKeyToSubitems.has(normParent)) {
      return this.itemKeyToSubitems.get(normParent);
    }
    if (normParent.includes(':')) {
      const parts = normParent.split(':').map(p => p.trim());
      if (this.itemKeyToSubitems.has(parts[0])) return this.itemKeyToSubitems.get(parts[0]);
      if (this.itemKeyToSubitems.has(parts[1])) return this.itemKeyToSubitems.get(parts[1]);
    }
    return undefined;
  }

  /**
   * Helper to find subitem valid set for a parent item key
   */
  public getItemSubitemSet(normParent: string): Set<string> | undefined {
    if (!normParent) return undefined;
    if (this.itemKeyToValidSubitems.has(normParent)) {
      return this.itemKeyToValidSubitems.get(normParent);
    }
    if (normParent.includes(':')) {
      const parts = normParent.split(':').map(p => p.trim());
      if (this.itemKeyToValidSubitems.has(parts[0])) return this.itemKeyToValidSubitems.get(parts[0]);
      if (this.itemKeyToValidSubitems.has(parts[1])) return this.itemKeyToValidSubitems.get(parts[1]);
    }
    return undefined;
  }

  /**
   * Suggestions for subitem column.
   * If parentItem is specified, returns only subitems for that item.
   * If parentItem is empty, returns all subitems with parent indicator.
   */
  public getSubitemSuggestions(parentItem: string | null | undefined, query: string, limit: number = 20): AutocompleteOption[] {
    const normParent = this.normalize(parentItem);
    let optionsPool: AutocompleteOption[] = [];

    if (normParent) {
      const parentOpts = this.getItemSubitemOptions(normParent);
      if (parentOpts) {
        optionsPool = parentOpts;
      }
    }

    // If parent item not found or not given, fall back to global subitem options
    if (optionsPool.length === 0 && !normParent) {
      optionsPool = this.optionsMap.get('subitem') || [];
    }

    if (!query || !query.trim()) {
      return optionsPool.slice(0, limit);
    }

    const q = this.normalize(query);
    const results: AutocompleteOption[] = [];

    // 1st pass: startsWith
    for (const opt of optionsPool) {
      if (this.normalize(opt.label).startsWith(q) || (opt.code && this.normalize(opt.code).startsWith(q))) {
        results.push(opt);
        if (results.length >= limit) return results;
      }
    }

    // 2nd pass: includes
    for (const opt of optionsPool) {
      if (results.includes(opt)) continue;
      if (this.normalize(opt.label).includes(q) || (opt.secondary && this.normalize(opt.secondary).includes(q))) {
        results.push(opt);
        if (results.length >= limit) return results;
      }
    }

    return results;
  }

  /**
   * Validates if a subitem belongs to the given parent item.
   */
  public isSubitemValidForParent(parentItem: string | null | undefined, subitemValue: any): { valid: boolean; message?: string } {
    if (subitemValue === null || subitemValue === undefined || String(subitemValue).trim() === '') {
      return { valid: true };
    }
    const normSub = this.normalize(subitemValue);

    const normParent = this.normalize(parentItem);
    if (normParent) {
      const validSubSet = this.getItemSubitemSet(normParent);
      if (validSubSet) {
        // Parent item was identified in master
        if (validSubSet.size > 0) {
          // Parent item has subitems registered
          if (validSubSet.has(normSub)) {
            return { valid: true };
          }
          if (normSub.includes(':')) {
            const parts = normSub.split(':').map(p => p.trim());
            if (validSubSet.has(parts[0]) || validSubSet.has(parts[1])) return { valid: true };
          }
          return {
            valid: false,
            message: `'${subitemValue}' '${parentItem}' का मान्य सबआइटम नहीं है`
          };
        } else {
          // Parent item exists in master, but has 0 subitems registered in master
          return { valid: true };
        }
      }
    }

    // Fallback: Check in global subitems set
    const globalSet = this.validLookups.get('subitem');
    if (!globalSet || globalSet.size === 0) {
      return { valid: true }; // Master list not loaded yet
    }
    if (globalSet.has(normSub)) {
      return { valid: true };
    }
    if (normSub.includes(':')) {
      const parts = normSub.split(':').map(p => p.trim());
      if (globalSet.has(parts[0]) || globalSet.has(parts[1])) return { valid: true };
    }

    return {
      valid: false,
      message: `'${subitemValue}' मास्टर लिस्ट में नहीं मिला`
    };
  }
}
