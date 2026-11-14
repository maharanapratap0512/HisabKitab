class ExcelFunctions {
   mm = null;
   category = null;
   city = null;
   country = null;
   state = null;
   zone = null;
   item = null;
   subitem = null;
   support_list = null;
   unit = null;
   nimitt = null;
   pbk = null;
   dict = {};
   correctionList = [];
   // DB;
   // DBContex;
   Fn;
   dept_id;
   jsonKey = ['document', 'categories']
   booleanKey = ['is_xl', 'isbill', 'is_auto_pd']
   voucherTables = ['product']
   bunchTables = ['product']
   vehicle_form = {
      mm_id: null,
      vehicle_type: null,
      gadi_name: null,
      gadi_num: null,
      fuel_type: null,
      seating_capacity: null,
      owner_name: null,
      nominee: null,
      aawak_type: null,
      rc_date: null,
      rc_exp_date: null,
      rc_amount: null,
      insurance_date: null,
      insurance_exp_date: null,
      insurance_amount: null,
      insurance_type: null,
      insurance_company: null,
      puc_date: null,
      puc_exp_date: null,
      puc_amount: null
   }
   product_form = {
      model_name: null,
      company_name: null,
      price: null,
      condition_id: null,
      warranty_period: null,
      warranty_from: null,
      purchase_date: null,
      purchase_from: null,
      purchased_by: null,
      product_code: null,
      sr_num: null,
      product_detail: null,
      item_id: null,
      subitem_id: null,
      unit_id: null,
      mm_id: null,
      document: [],
      dept_id: null,
      accessories: null,
      nimitt_id: null,
      isbill: false,
      qty: null,
      is_xl: false,
      bunch_no: null,
      voucher_no: null,
      aawak_type_id: null,
      awk_id: null,
   }
   pbk_form = {
      roll_no: null,
      pbk_eng: null,
      pbk_hin: null,
      relation: null,
      relative_name: null,
      relative_ref: null,
      gender: null,
      age: null,
      birth_date: null,
      status: null,
      townarea: null,
      address: null,
      city_id: null,
      state_id: null,
      district_id: null,
      mo_no: null,
      alt_mo_no: null,
      class_mm_id: null,
      bhatti_date: null,
      document: null
   }
   nimitt_form = {
      roll_no: null,
      nimitt_eng: null,
      nimitt_hin: null,
      relative_name: null,
      gender: null,
      townarea: null,
      state_id: null,
      document: null,
      active: 1
   }
   item_form = {
      item_hin: null,
      item_eng: null,
      item_roman: null,
      item_code: null,
      unit_id: null,
      categories: [],
      aliases: [],
      extra_note: null,
      restrict_month: null,
      restrict_year: null,
      min_rate: 0,
      max_rate: 0,
      document: []
   }
   subitem_form = {
      subitem_hin: null,
      subitem_eng: null,
      subitem_roman: null,
      unit_id: null,
      item_id: null,
      aliases: [],
      extra_note: null,
      document: null,
      restrict_month: null,
      restrict_year: null,
      min_rate: 0,
      max_rate: 0,
   }
   rel_item_category_form = {
      item_id: null,
      category_id: null
   }
   rel_subitem_category_form = {
      subitem_id: null,
      category_id: null
   }
   attribute_form = {
      attribute_hin: null,
      attribute_eng: null,
      attribute_roman: null,
      active: 1
   }
   attributes_value_form = {
      attribute_id: null,
      attribute_value_hin: null,
      attribute_value_eng: null,
      attribute_value_roman: null,
      active: 1
   }
   variant_form = {
      item_id: null,
      display_name_hin: null,
      display_name_eng: null,
      display_name_roman: null,
      attribute_values: [],
      sku: null,
      unit_id: null,
      min_rate: 0,
      max_rate: 0,
      active: 1
   }
   support_list_form = {
      list_type: null,
      list_name_eng: null,
      list_name_hin: null,
      list_name_roman: null,
      active: 1
   }
   category_form = {
      parent_id: null,
      category_eng: null,
      category_hin: null,
      category_roman: null,
      alias: null,
      sort_order: null,
   }
   jawak_form = {
      date: null,
      date_sent: null,
      pkt_num: null,
      reg_pg_no: null,
      voucher_no: null,
      mm_id: null,
      lot_no: null,
      jawak_mm_id: null,
      pbk_id: null,
      item_id: null,
      subitem_id: null,
      usage_list_id: null,
      item_detail: null,
      product_id: null,
      condition_id: null,
      company_name: null,
      qty: null,
      rate: null,
      actual_amt: null,
      aawak_source_id: null,
      jawak_type_id: null,
      unit_id: null,
      description: null,
      parchi_place: null,
      sell_repair_place: null,
      aawak_ref_id: null,
      nimitt_id: null,
      is_xl: 1,
      is_process: 0,
      dept_id: null,
      container_qty: null,
      enz: {},
      usage_report: {}
   }
   jawak_enzyme_form = {
      container_capacity: null,
   }
   usage_report_form = {
      date: null,
      reporter: null,
      usage_type: null,
      usage_type_id: null,
      fayda: null,
      nuksan: null,
      rating: null,
   }
   district_form = {
      district_eng: null,
      district_hin: null,
      state_id: null
   }
   constructor(list, dept_id = null) {
      // this.DBContex = require('./DBContex');
      // this.DB = new this.DBContex(); 
      this.dept_id = dept_id;
      this.Fn = require('./functions');
      for (let i in list) {
         this.dict[list[i]] = this.Fn.getDictionary(list[i]);
         switch (list[i]) {
            case 'mm':
               this.mm = this.Fn.getMMs(dept_id);
               break;
            case 'category':
               this.category = this.Fn.getCategories(dept_id);
               break;
            case 'item':
               this.item = this.Fn.getitems(dept_id);
               this.subitem = this.Fn.getSubitems(dept_id);
               break;
            case 'subitem':
               this.subitem = this.Fn.getSubitems(dept_id);
               break;
            case 'state':
               this.state = this.Fn.getStates(dept_id);
               break;
            case 'district':
               this.district = this.Fn.getDistricts(dept_id);
               break;
            case 'zone':
               this.zone = this.Fn.getZones(dept_id);
               break;
            case 'country':
               this.country = this.Fn.getCountries(dept_id);
               break;
            case 'city':
               this.city = this.Fn.getCities(dept_id);
               break;
            case 'nimitt':
               this.nimitt = this.Fn.getNimitts(dept_id);
               break;
            case 'pbk':
               this.pbk = this.Fn.getPbks(dept_id);
               break;
            case 'unit':
               this.unit = this.Fn.getUnits(dept_id);
               break;
            case 'attribute':
               this.attribute = this.Fn.getAttributes(dept_id);
               break;
            case 'attributes_value':
               this.attributes_value = this.Fn.getAttributeValues(dept_id);
               break;
            case 'support_list':
            case 'condition':
            case 'gender':
            case 'relation':
            case 'jawak_type':
            case 'aawak_type':
            case 'usage_list':
            case 'aawak_source':
            case 'usage_type':
               this.support_list = this.Fn.getSupportList(dept_id);
               break;
            default:
         }
      }
   }

   _norm(str) {
      if (str === null || str === undefined) return '';
      return String(str).trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');
   }

   _getCorrectionKey(type, name) {
      const t = this._norm(type);
      if (name === null || name === undefined || name === '') {
         return `${t}:__EMPTY__`;
      }
      if (Array.isArray(name)) {
         const sorted = name.map(x => this._norm(x)).sort().join(',');
         return `${t}:[${sorted}]`;
      }
      if (typeof name === 'object') {
         const it = this._norm(name.item || name.name);
         const sub = this._norm(name.subitem || name.extra_note);
         return `${t}:${it}|${sub}`;
      }
      const str = this._norm(name);
      if (t === 'item') {
         return `${t}:${str}|`;
      }
      return `${t}:${str}`;
   }

   pushCorrection(item) {
      if (!item || !item.type) return;
      const key = this._getCorrectionKey(item.type, item.name);
      const exists = this.correctionList.some(c => this._getCorrectionKey(c.type, c.name) === key);
      if (!exists) {
         this.correctionList.push(item);
      }
   }

   checkedButNotFound(data, listType) {
      const targetKey = this._getCorrectionKey(listType, data);
      for (let i in this.correctionList) {
         if (this._getCorrectionKey(this.correctionList[i].type, this.correctionList[i].name) === targetKey) {
            return true;
         }
      }
      return false;
   }

   async matchMMs(data) {
      if (this.mm instanceof Promise) {
         this.mm = await this.mm.then((data) => { return data })
      }
      if (this.dict.mm instanceof Promise) {
         this.dict.mm = await this.dict.mm.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.mm) {
         for (let i in this.mm) {
            const vals = [this.mm[i].mm_hin, this.mm[i].mm_eng, this.mm[i].mm_code].filter(Boolean).map(v => this._norm(v));
            if (vals.includes(cleanData)) {
               return this.mm[i]._id;
            }
         }
      }
      if (this.dict.mm) {
         for (let i in this.dict.mm) {
            if (this._norm(this.dict.mm[i].name) == cleanData) {
               return this.dict.mm[i].id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'mm')) {
         this.pushCorrection({ type: 'mm', name: data });
      }
      return null;
   }

   async matchCategory(data) {
      if (this.category instanceof Promise) {
         this.category = await this.category.then((data) => { return data })
      }
      if (this.dict.category instanceof Promise) {
         this.dict.category = await this.dict.category.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.category) {
         for (let i in this.category) {
            const vals = [this.category[i].category_hin, this.category[i].category_eng, this.category[i].category_roman].filter(Boolean).map(v => this._norm(v));
            if (vals.includes(cleanData)) {
               return this.category[i]._id;
            }
         }
      }
      if (this.dict.category) {
         for (let i in this.dict.category) {
            if (this._norm(this.dict.category[i].name) == cleanData) {
               return this.dict.category[i].id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'category')) {
         this.pushCorrection({ type: 'category', name: data });
      }
      return null;
   }

   async matchCategories(data) {
      let arr = [];
      let hasNull = false;
      if (data && Array.isArray(data)) {
         for (let cat of data) {
            let id = await this.matchCategory(this._norm(cat));
            arr.push(id);
            if (id === null) hasNull = true;
         }
      }
      if (hasNull && data && Array.isArray(data)) {
         const nameArr = data.map(c => this._norm(c));
         // Remove individually-added correction entries for these elements
         this.correctionList = this.correctionList.filter(
            c => !(c.type === 'category' && !c.isArray && nameArr.includes(this._norm(c.name)))
         );
         const key = nameArr.sort().join(',');
         this.pushCorrection({
            type: 'category',
            name: nameArr,   // array of strings for display
            key: key,        // dedup key
            isArray: true,
            ids: arr          // partial ids (some may be null)
         });
      }
      return arr;
   }

   async matchCountry(data) {
      if (this.country instanceof Promise) {
         this.country = await this.country.then((data) => { return data })
      }
      if (this.dict.country instanceof Promise) {
         this.dict.country = await this.dict.country.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.country) {
         for (let i in this.country) {
            const vals = [this.country[i].country_hin, this.country[i].country_eng].filter(Boolean).map(v => this._norm(v));
            if (vals.includes(cleanData)) {
               return this.country[i]._id;
            }
         }
      }
      if (this.dict.country) {
         for (let i in this.dict.country) {
            if (this._norm(this.dict.country[i].name) == cleanData) {
               return this.dict.country[i].id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'country')) {
         this.pushCorrection({ type: 'country', name: data });
      }
      return null;
   }

   async matchState(data) {
      if (this.state instanceof Promise) {
         this.state = await this.state.then((data) => { return data })
      }
      if (this.dict.state instanceof Promise) {
         this.dict.state = await this.dict.state.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.state) {
         for (let i in this.state) {
            const vals = [this.state[i].state_hin, this.state[i].state_eng].filter(Boolean).map(v => this._norm(v));
            if (vals.includes(cleanData)) {
               return this.state[i]._id;
            }
         }
      }
      if (this.dict.state) {
         for (let i in this.dict.state) {
            if (this._norm(this.dict.state[i].name) == cleanData) {
               return this.dict.state[i].id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'state')) {
         this.pushCorrection({ type: 'state', name: data });
      }
      return null;
   }

   async matchDistrict(data) {
      if (this.district instanceof Promise) {
         this.district = await this.district.then((data) => { return data })
      }
      if (this.dict.district instanceof Promise) {
         this.dict.district = await this.dict.district.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.district) {
         for (let i in this.district) {
            const vals = [this.district[i].district_hin, this.district[i].district_eng].filter(Boolean).map(v => this._norm(v));
            if (vals.includes(cleanData)) {
               return this.district[i]._id;
            }
         }
      }
      if (this.dict.district) {
         for (let i in this.dict.district) {
            if (this._norm(this.dict.district[i].name) == cleanData) {
               return this.dict.district[i].id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'district')) {
         this.pushCorrection({ type: 'district', name: data });
      }
      return null;
   }

   async matchZone(data) {
      if (this.zone instanceof Promise) {
         this.zone = await this.zone.then((data) => { return data })
      }
      if (this.dict.zone instanceof Promise) {
         this.dict.zone = await this.dict.zone.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.zone) {
         for (let i in this.zone) {
            const vals = [this.zone[i].zone_hin, this.zone[i].zone_eng].filter(Boolean).map(v => this._norm(v));
            if (vals.includes(cleanData)) {
               return this.zone[i]._id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'zone')) {
         this.pushCorrection({ type: 'zone', name: data });
      }
      return null;
   }

   async matchCity(data) {
      if (this.city instanceof Promise) {
         this.city = await this.city.then((data) => { return data })
      }
      if (this.dict.city instanceof Promise) {
         this.dict.city = await this.dict.city.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.city) {
         for (let i in this.city) {
            const vals = [this.city[i].city_hin, this.city[i].city_eng].filter(Boolean).map(v => this._norm(v));
            if (vals.includes(cleanData)) {
               return this.city[i]._id;
            }
         }
      }
      if (this.dict.city) {
         for (let i in this.dict.city) {
            if (this._norm(this.dict.city[i].name) == cleanData) {
               return this.dict.city[i].id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'city')) {
         this.pushCorrection({ type: 'city', name: data });
      }
      return null;
   }

   async matchUnit(data) {
      if (this.unit instanceof Promise) {
         this.unit = await this.unit.then((data) => { return data })
      }
      if (this.dict.unit instanceof Promise) {
         this.dict.unit = await this.dict.unit.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.unit) {
         for (let i in this.unit) {
            const vals = [this.unit[i].unit_short, this.unit[i].unit_full].filter(Boolean).map(v => this._norm(v));
            if (vals.includes(cleanData)) {
               return this.unit[i]._id;
            }
         }
      }
      if (this.dict.unit) {
         for (let i in this.dict.unit) {
            if (this._norm(this.dict.unit[i].name) == cleanData) {
               return this.dict.unit[i].id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'unit')) {
         this.pushCorrection({ type: 'unit', name: data });
      }
      return null;
   }

   async matchAttribute(data) {
      if (this.attribute instanceof Promise) {
         this.attribute = await this.attribute.then((data) => { return data })
      }
      if (this.dict.attribute instanceof Promise) {
         this.dict.attribute = await this.dict.attribute.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.attribute) {
         for (let i in this.attribute) {
            const vals = [this.attribute[i].attribute_hin, this.attribute[i].attribute_eng, this.attribute[i].attribute_roman].filter(Boolean).map(v => this._norm(v));
            if (vals.includes(cleanData)) {
               return this.attribute[i]._id;
            }
         }
      }
      if (this.dict.attribute) {
         for (let i in this.dict.attribute) {
            if (this._norm(this.dict.attribute[i].name) == cleanData) {
               return this.dict.attribute[i].id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'attribute')) {
         this.pushCorrection({ type: 'attribute', name: data });
      }
      return null;
   }

   async matchAttributeValue(data) {
      if (this.attributes_value instanceof Promise) {
         this.attributes_value = await this.attributes_value.then((data) => { return data })
      }
      if (this.dict.attributes_value instanceof Promise) {
         this.dict.attributes_value = await this.dict.attributes_value.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.attributes_value) {
         for (let i in this.attributes_value) {
            const vals = [this.attributes_value[i].attribute_value_hin, this.attributes_value[i].attribute_value_eng, this.attributes_value[i].attribute_value_roman].filter(Boolean).map(v => this._norm(v));
            if (vals.includes(cleanData)) {
               return { attribute_id: this.attributes_value[i].attribute_id, attribute_value_id: this.attributes_value[i]._id };
            }
         }
      }
      if (this.dict.attributes_value) {
         for (let i in this.dict.attributes_value) {
            if (this._norm(this.dict.attributes_value[i].name) == cleanData) {
               return { attribute_id: this.dict.attributes_value[i].id, attribute_value_id: this.dict.attributes_value[i].id2 };
            }
         }
      }
      if (!this.checkedButNotFound(data, 'attributes_value')) {
         this.pushCorrection({ type: 'attributes_value', name: data });
      }
      return null;
   }

   async matchAttributeValues(data) {
      let arr = [];
      if (data && Array.isArray(data)) {
         for (let val of data) {
            let match = await this.matchAttributeValue(this._norm(val));
            if (match) arr.push(match);
         }
      }
      return arr;
   }

   async matchNimitt(data) {
      if (this.nimitt instanceof Promise) {
         this.nimitt = await this.nimitt.then((data) => { return data })
      }
      if (this.dict.nimitt instanceof Promise) {
         this.dict.nimitt = await this.dict.nimitt.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.nimitt) {
         for (let i in this.nimitt) {
            if (this._norm(this.nimitt[i].roll_no) == cleanData) {
               return this.nimitt[i]._id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'nimitt')) {
         this.pushCorrection({ type: 'nimitt', name: data });
      }
      return null;
   }
   async matchPbk(data) {
      if (this.pbk instanceof Promise) {
         this.pbk = await this.pbk.then((data) => { return data })
      }
      if (this.dict.pbk instanceof Promise) {
         this.dict.pbk = await this.dict.pbk.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.pbk) {
         for (let i in this.pbk) {
            if (this._norm(this.pbk[i].roll_no) == cleanData) {
               return this.pbk[i]._id;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'pbk')) {
         this.pushCorrection({ type: 'pbk', name: data });
      }
      return null;
   }
   async matchSubitem(subitemStr, item_id, itemStr) {
      if (this.subitem instanceof Promise) {
         this.subitem = await this.subitem.then((data) => { return data })
      }
      if (this.dict.item instanceof Promise) {
         this.dict.item = await this.dict.item.then((data) => { return data });
      }
      let data = {
         subitem: subitemStr && typeof subitemStr == 'string' ? subitemStr.trim().toLowerCase().normalize('NFC') : (subitemStr || ''),
         item: itemStr && typeof itemStr == 'string' ? itemStr.trim().toLowerCase().normalize('NFC') : (itemStr || ''),
      }

      if (item_id && this.subitem) {
         for (let i in this.subitem) {
            if (this.subitem[i].item_id == item_id) {
               const primaryNames = [this.subitem[i].subitem_hin, this.subitem[i].subitem_eng, this.subitem[i].subitem_roman].filter(Boolean).map(n => this._norm(n));
               let aliasList = [];
               if (Array.isArray(this.subitem[i].aliases)) {
                  aliasList = this.subitem[i].aliases.map(a => typeof a === 'object' && a !== null ? this._norm(a.alias) : this._norm(a)).filter(Boolean);
               }
               if ([...primaryNames, ...aliasList].includes(this._norm(data.subitem))) {
                  return this.subitem[i]._id;
               }
            }
         }
      }
      if (this.dict.item) {
         for (let i in this.dict.item) {
            if (this._norm(this.dict.item[i].name) == this._norm(data.item) && this._norm(this.dict.item[i].extra_note) == this._norm(data.subitem)) {
               return this.dict.item[i].id2;
            }
         }
      }
      if (!this.checkedButNotFound(data, 'item')) {
         this.pushCorrection({ type: 'item', name: data, id: item_id, id2: null });
      }
      return null;
   }

   async matchItemMix(row) {
      if (this.item instanceof Promise) {
         this.item = await this.item.then((data) => { return data })
      }
      if (this.subitem instanceof Promise) {
         this.subitem = await this.subitem.then((data) => { return data })
      }
      if (this.dict.item instanceof Promise) {
         this.dict.item = await this.dict.item.then((data) => { return data });
      }
      let data = {
         item: row.item && typeof row.item == 'string' ? row.item.trim().toLowerCase().normalize('NFC') : (row.item || ''),
         subitem: row.subitem && typeof row.subitem == 'string' ? row.subitem.trim().toLowerCase().normalize('NFC') : (row.subitem || ''),
      }

      if (this.item) {
         for (let i in this.item) {
            const names = [this.item[i].item_hin, this.item[i].item_eng, this.item[i].item_roman, this.item[i].item_code].filter(Boolean).map(n => this._norm(n));
            if (names.includes(this._norm(data.item))) {
               row.item_id = this.item[i]._id;
               break;
            }
         }
      }
      if (!row.item_id && this.dict.item) {
         for (let i in this.dict.item) {
            if (this._norm(this.dict.item[i].name) == this._norm(data.item) && (!data.subitem || this._norm(this.dict.item[i].extra_note) == this._norm(data.subitem))) {
               row.item_id = this.dict.item[i].id;
               row.subitem_id = this.dict.item[i].id2;
               break;
            }
         }
      }
      if (row.item_id && data.subitem && !row.subitem_id && this.subitem) {
         for (let i in this.subitem) {
            if (this.subitem[i].item_id == row.item_id) {
               const primaryNames = [this.subitem[i].subitem_hin, this.subitem[i].subitem_eng, this.subitem[i].subitem_roman].filter(Boolean).map(n => this._norm(n));
               let aliasList = [];
               if (Array.isArray(this.subitem[i].aliases)) {
                  aliasList = this.subitem[i].aliases.map(a => typeof a === 'object' && a !== null ? this._norm(a.alias) : this._norm(a)).filter(Boolean);
               }
               if ([...primaryNames, ...aliasList].includes(this._norm(data.subitem))) {
                  row.subitem_id = this.subitem[i]._id;
                  break;
               }
            }
         }
      }
      if (!row.item_id || (row.item_id && data.subitem && !row.subitem_id)) {
         if (!this.checkedButNotFound(data, 'item')) {
            this.pushCorrection({ type: 'item', name: data, id: row.item_id, id2: row.subitem_id });
         }
      }
      return row;
   }

   async matchItem(data, subitemVal = null) {
      if (this.item instanceof Promise) {
         this.item = await this.item.then((data) => { return data })
      }
      if (this.dict.item instanceof Promise) {
         this.dict.item = await this.dict.item.then((data) => { return data });
      }
      const cleanData = this._norm(data);
      if (this.item) {
         for (let i in this.item) {
            const vals = [this.item[i].item_hin, this.item[i].item_eng, this.item[i].item_roman, this.item[i].item_code].filter(Boolean).map(n => this._norm(n));
            if (vals.includes(cleanData)) {
               return this.item[i]._id;
            }
         }
      }
      if (this.dict.item) {
         for (let i in this.dict.item) {
            const dName = this._norm(this.dict.item[i].name);
            if (dName && dName === cleanData) {
               return this.dict.item[i].id;
            }
         }
      }
      // If item is not found, and subitem is present in this row, let matchSubitem push
      // the combined { item, subitem } correction row to avoid duplicate/orphaned rows!
      const cleanSub = this._norm(subitemVal);
      if (!cleanSub) {
         if (!this.checkedButNotFound(data, 'item')) {
            this.pushCorrection({ type: 'item', name: data });
         }
      }
      return null;
   }

   async matchSupportList(data, listType, returnFieldName = '_id') {
      if (this.support_list instanceof Promise) {
         this.support_list = await this.support_list.then((data) => { return data })
      }
      if (this.dict[listType] instanceof Promise) {
         this.dict[listType] = await this.dict[listType].then((data) => { return data });
      }
      let slist = Array.isArray(this.support_list) ? this.support_list.filter(s => s.list_type == listType) : [];
      let slistDict = Array.isArray(this.dict[listType]) ? this.dict[listType].filter(d => d.type == listType) : [];
      const cleanData = this._norm(data);
      for (let i in slist) {
         const vals = [slist[i].list_name_hin, slist[i].list_name_eng, slist[i].list_name_roman].filter(Boolean).map(v => this._norm(v));
         if (vals.includes(cleanData)) {
            return slist[i][returnFieldName];
         }
      }
      for (let i in slistDict) {
         if (this._norm(slistDict[i].name) == cleanData) {
            return slistDict[i].id;
         }
      }
      if (!this.checkedButNotFound(data, listType)) {
         this.pushCorrection({ type: listType, name: data });
      }
      return null;
   }



   async verifyAndInsert(type, data, headerList) {
      let status;
      let fdata = await this.setFormData(this[type.name + '_form'], data);
      // console.log(fdata);

      let duplicate = await this.Fn.checkDuplication(type, fdata);
      if (duplicate) {
         let fullDuplicate = await this.checkFullDuplication(duplicate, data, headerList);
         if (fullDuplicate.found) {
            status = 'duplicate'
         } else {
            status = 'update'
            data.duplicate = fullDuplicate.list
         }
      }
      else {
         if (this.voucherTables.includes(type.name)) {
            fdata.voucher_no = await this.Fn.getLastVoucherNo(type.name) + 1;
         }
         if (this.bunchTables.includes(type.name)) {
            fdata.bunch_no = await this.Fn.getLastBunchNo(type.name) + 1;
         }
         let insResult = await this.Fn.insertExcelData(type, fdata, this.dept_id);
         status = 'inserted';
         data.newData = insResult;
      }
      return { status: status, data: data };
   }

   async updateExcelData(type, data) {
      return await this.Fn.updateExcelData(type, await this.setFormData(this[type.name + '_form'], data), this.dept_id);
   }

   async setFormData(formObj, data) {
      let newFormObj = { ...formObj };
      for (const key of Object.keys(newFormObj)) {
         if (data[key] == undefined || data[key] == `` || data[key] == '-')
            data[key] = null;

         if (this.jsonKey.includes(key)) {
            newFormObj[key] = JSON.stringify(data[key] ? data[key] : newFormObj[key])
         } else if (this.booleanKey.includes(key)) {
            newFormObj[key] = data[key] ? 1 : 0;
         } else {
            newFormObj[key] = data[key]
         }
      }
      newFormObj.is_xl = 1;
      newFormObj.dept_id = this.dept_id;
      return newFormObj;
   }

   async isObject(value) {
      return typeof value === "object" && value != null && value != undefined;
   }


   async checkFullDuplication(list, data, headerList, dept_id = null) {
      const activeDeptId = dept_id || this.dept_id;
      let found = false;
      for (let i in list) {
         let changes = false;
         for (let j in headerList) {
            let listData;
            let exData;
            const hName = headerList[j].name || headerList[j].col_name;
            const isYearlyRate = headerList[j].type === 'yearly_rate' || /^rate[_\s-]?(\d{4})$/i.test(hName);

            if (isYearlyRate) {
               const rawVal = data[hName] !== undefined ? data[hName] : (headerList[j].col_name ? data[headerList[j].col_name] : undefined);
               // If excel cell has a valid non-empty rate value
               if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
                  const yrMatch = hName.match(/\d{4}/);
                  const yr = headerList[j].year || (yrMatch ? Number(yrMatch[0]) : null);
                  if (yr && activeDeptId) {
                     const itemId = list[i].item_id || list[i]._id;
                     const subitemId = list[i].subitem_id || null;
                     const itemRateService = require('../services/item-rate.service');
                     const dbRate = await itemRateService.lookupItemRate(activeDeptId, itemId, subitemId, yr);
                     const excelRate = Number(rawVal);
                     // If DB rate doesn't exist (null) or differs from excelRate
                     if (dbRate === null || Number(dbRate) !== excelRate) {
                        changes = true;
                        break;
                     }
                  }
               }
               // If excel cell is empty/blank, skip (do not consider as change)
               continue;
            }

            if (headerList[j].type === 'array' || hName === 'aliases') {
               const rawIncoming = data[hName] !== undefined ? data[hName] : (headerList[j].col_name ? data[headerList[j].col_name] : undefined);
               if (rawIncoming !== undefined) {
                  const existingList = (list[i].aliases || list[i].item_aliases || list[i][hName] || []);
                  const existingArr = (Array.isArray(existingList) ? existingList : []).map(a => typeof a === 'object' && a !== null ? a.alias : a).filter(Boolean).map(a => String(a).trim().toLowerCase()).sort();
                  const incomingArr = (Array.isArray(rawIncoming) ? rawIncoming : String(rawIncoming).split(',')).map(a => typeof a === 'object' && a !== null ? a.alias : a).filter(Boolean).map(a => String(a).trim().toLowerCase()).sort();
                  if (existingArr.join(',') !== incomingArr.join(',')) {
                     changes = true;
                     break;
                  }
               }
               continue;
            }

            if (headerList[j].ref_table) {
               listData = list[i][headerList[j].ref_field]
               exData = data[headerList[j].ref_field]
            } else {
               listData = (list[i][headerList[j].name] && typeof list[i][headerList[j].name] == 'string') ? list[i][headerList[j].name].trim().toLowerCase() : list[i][headerList[j].name];
               exData = (data[headerList[j].name] && typeof data[headerList[j].name] == 'string') ? data[headerList[j].name].trim().toLowerCase() : data[headerList[j].name];
               if (headerList[j].type == 'date') {
                  listData = new Date(listData).getTime();
                  exData = new Date(exData).getTime();
               }
               else if (headerList[j].type == 'unix_date') {
                  listData = listData ? new Date(new Date(listData).toDateString()).getTime() : 0;
                  exData = exData ? new Date(new Date(exData).toDateString()).getTime() : 0;
               }
            }

            if (typeof exData != 'undefined' && listData != exData) {
               changes = true;
               break;
            }
         }
         if (changes) {
            list[i].status = 'update';
         }
         else {
            found = true;
            list[i].status = 'duplicate';
         }
      }
      return { found: found, list: list };
   }

   setDateFormat(data) {
      if (typeof data == "string") {
         return this.Fn.StringToDate(data).toISOString().split('T')[0];
      }
      else if (typeof data == "number") {
         return this.Fn.ExcelDateToJSDate(data).toISOString().split('T')[0];
      }
   }

   setDateUnixSecond(data) {
      if (typeof data == "string") {
         return this.Fn.StringToUnixSDate(data);
      }
      else if (typeof data == "number") {
         return this.Fn.ExcelDateToUnixSDate(data);
      }
   }

}



module.exports = ExcelFunctions;


/*
Code References.....

   ExcelDateToJSDate = (intDate) => {
      return new Date((Math.floor(intDate - 25569) * 86400) * 1000);

      var utc_days = Math.floor(serial - 25569);
      var utc_value = utc_days * 86400;
      var date_info = new Date(utc_value * 1000);

      var fractional_day = serial - Math.floor(serial) + 0.0000001;

      var total_seconds = Math.floor(86400 * fractional_day);

      var seconds = total_seconds % 60;

      total_seconds -= seconds;

      var hours = Math.floor(total_seconds / (60 * 60));
      var minutes = Math.floor(total_seconds / 60) % 60;

      return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
   }


*/

