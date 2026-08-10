const DBContex = require('./DBContex');
const { log } = require('node:console');
class Functions extends DBContex {

   constructor() {
      super();
      // const tbInterface = require('../models/table_interface');
      const begin = this.db.prepare('BEGIN');
      const commit = this.db.prepare('COMMIT');
      const rollback = this.db.prepare('ROLLBACK');

      this.begin = () => begin.run();
      this.commit = () => commit.run();
      this.rollback = () => rollback.run();
   }

   async insertAJ(obj, type) {
      return new Promise(async (resolve, reject) => {
         try {
            if (obj.enz && typeof obj.enz === 'string') {
               try { obj.enz = JSON.parse(obj.enz); } catch (e) { obj.enz = {}; }
            }
            if (obj.usage_report && typeof obj.usage_report === 'string') {
               try { obj.usage_report = JSON.parse(obj.usage_report); } catch (e) { obj.usage_report = {}; }
            }
            let queryStr = this.query[type].insert;
            if (obj._id) {
               const firstParen = queryStr.indexOf('(');
               if (firstParen !== -1) {
                  queryStr = queryStr.substring(0, firstParen) + '(_id, ' + queryStr.substring(firstParen + 1);
               }
               const valuesMatch = queryStr.match(/values\s*\(/i);
               if (valuesMatch) {
                  const valuesIndex = queryStr.indexOf(valuesMatch[0]) + valuesMatch[0].indexOf('(');
                  queryStr = queryStr.substring(0, valuesIndex) + '(@_id, ' + queryStr.substring(valuesIndex + 1);
               }
            }
            let stmtInsert = this.db.prepare(queryStr);
            obj = { ...this.tbInterface[type], ...obj };
            obj.document = JSON.stringify(obj.document ? obj.document : {});
            obj.isbill = obj.isbill ? 1 : 0;
            obj.active = 1;
            obj.hl = obj.hl ? 1 : 0;
            obj.is_auto_pd = obj.is_auto_pd ? 1 : 0;
            obj.is_auto = obj.is_auto ? 1 : 0;
            obj.is_variable_qty = obj.is_variable_qty ? 1 : 0;
            obj.is_proccess = obj.is_proccess ? 1 : 0;
            obj.is_xl = obj.is_xl ? 1 : 0;
            obj.is_recieved = obj.is_recieved ? 1 : 0;
            let insResult = stmtInsert.run(obj);
            if (insResult.changes == 1 && insResult.lastInsertRowid) {
               obj._id = insResult.lastInsertRowid;
               await this.updateBachatFromAJInsert(obj, type);
               if (type == 'jawak') {
                  obj.enz.jawak_id = insResult.lastInsertRowid;
                  obj.usage_report.jawak_id = insResult.lastInsertRowid;
                  await this.insertUsageReport(obj.usage_report);
                  await this.processRelAawakJawak(insResult.lastInsertRowid, obj.aawak_splits, obj.qty);
               } else if (type == 'aawak') {
                  obj.enz.aawak_id = insResult.lastInsertRowid;
               }
               await this.insertAJEnzyme(obj.enz, type);
               resolve(insResult.lastInsertRowid);
            } else {
               reject(new Error('no any records are inserted'));
            }

         } catch (err) {
            reject(err);
         }
      });
   }

   async insertAJEnzyme(obj, type) {
      return new Promise(async (resolve, reject) => {
         try {
            let doInsert = false;
            if (type == 'aawak' && (obj.container_aawak_source_id || obj.container_enz_no || obj.container_capacity || obj.container_qty)) {
               doInsert = true;
            } else if (type == 'jawak' && (obj.container_capacity)) {
               doInsert = true;
            }
            // console.log(obj, type, doInsert);
            if (doInsert) {
               let stmtInsert = this.db.prepare(this.query[type + '_enzyme'].insert);
               await stmtInsert.run(obj);
            }
            resolve(true);
         } catch (ex) {
            reject(0);
         }
      });
   }

   async deleteAJEnzyme(id, type) {
      return new Promise(async (resolve, reject) => {
         try {
            let stmtDelete = this.db.prepare(this.query[type + '_enzyme'].delete_by_ref);
            await stmtDelete.run(id);
            resolve(true);
         } catch (ex) {
            reject(ex)
         }
      });
   }

   async updateAJEnzyme(obj, type) {
      return new Promise(async (resolve, reject) => {
         try {
            let stmtUpdate = this.db.prepare(this.query[type + '_enzyme'].update);
            await stmtUpdate.run(obj);
            resolve(true);
         } catch (ex) {
            reject(ex)
         }
      });
   }

   async insertUsageReport(obj) {
      return new Promise(async (resolve, reject) => {
         try {
            if (obj && (obj.date || obj.reporter || obj.usage_type || obj.fayda || obj.nuksan || obj.rating)) {
               await this.db.prepare(this.query.usage_report.insert).run(obj);
            }
            resolve(true);
         } catch (ex) {
            reject(ex);
         }
      });
   }

   async updateUsageReport(obj) {
      return new Promise(async (resolve, reject) => {
         try {
            if (obj._id) {
               await this.db.prepare(this.query.usage_report.update).run(obj);
            }
            resolve(true);
         } catch (ex) {
            reject(ex)
         }
      });
   }

   async deleteUsageReportByRef(id) {
      return new Promise(async (resolve, reject) => {
         try {
            await this.db.prepare(this.query.usage_report.delete_by_ref).run(id);;
            resolve(true);
         } catch (ex) {
            reject(ex)
         }
      });
   }

   async updateAJ(obj, type, objOld = null) {
      return new Promise(async (resolve, reject) => {
         try {
            if (obj.enz && typeof obj.enz === 'string') {
               try { obj.enz = JSON.parse(obj.enz); } catch (e) { obj.enz = {}; }
            }
            if (obj.usage_report && typeof obj.usage_report === 'string') {
               try { obj.usage_report = JSON.parse(obj.usage_report); } catch (e) { obj.usage_report = {}; }
            }
            let stmtUpdate = this.db.prepare(this.query[type].update + ` where ${type}._id = ${obj._id}`);
            obj = { ...this.tbInterface[type], ...obj };
            obj.document = JSON.stringify(obj.document && typeof obj.document != 'string' ? obj.document : {});
            obj.isbill = obj.isbill ? 1 : 0;
            obj.hl = obj.hl ? 1 : 0;
            obj.is_auto_pd = obj.is_auto_pd ? 1 : 0;
            obj.is_auto = obj.is_auto ? 1 : 0;
            obj.is_xl = obj.is_xl ? 1 : 0;
            obj.is_variable_qty = obj.is_variable_qty ? 1 : 0;
            obj.is_proccess = obj.is_proccess ? 1 : 0;
            obj.is_recieved = obj.is_recieved ? 1 : 0;

            if (!objOld) {
               objOld = await this.getById(type, obj._id);
            }

            if (!objOld) {
               reject(new Error('no any records are updated (record not found).'));
               return;
            }

            // console.log(obj);
            const rawRefId = obj.aawak_ref_id;
            if (type == 'jawak') {
               obj.aawak_ref_id = null;
            }
            let updtResult = stmtUpdate.run(obj);
            if (updtResult.changes == 1 || updtResult.changes == 0) {
               if (updtResult.changes == 1) {
                  await this.updateBachatFromAJUpdate(obj, type, objOld);
               }
               if (obj.enz) {
                  obj.enz[type + '_id'] = obj._id
                  if (obj.enz._id)
                     await this.updateAJEnzyme(obj.enz, type);
                  else
                     await this.insertAJEnzyme(obj.enz, type);
               }
               if (type == 'jawak') {
                  if (obj.usage_report) {
                     obj.usage_report.jawak_id = obj._id;
                     if (obj.usage_report._id) {
                        await this.updateUsageReport(obj.usage_report)
                     } else {
                        await this.insertUsageReport(obj.usage_report);
                     }
                  }
                  await this.processRelAawakJawak(obj._id, obj.aawak_splits, obj.qty);
               }
               resolve(true);
            } else {
               reject(new Error('no any records are updated.'));
            }
         } catch (err) {
            // throw err;
            reject(err);
         }
      });
   }

   async deleteAJ(id, type) {
      return new Promise(async (resolve, reject) => {
         try {
            let stmtDelete = this.db.prepare(this.query[type].delete)
            let obj = await this.getById(type, id);
            if (obj) {
               await this.deleteAJEnzyme(id, type);
               if (type == 'jawak') {
                  await this.deleteUsageReportByRef(id);
                  await this.processRelAawakJawak(id);
               }
               let delResult = stmtDelete.run({ _id: id });
               if (delResult.changes == 1) {
                  await this.updateBachatFromAJDelete(id, type, obj);
                  resolve(delResult.changes);
               } else {
                  resolve(0);
               }
            } else {
               resolve(0)
            }
         } catch (err) {
            reject(err);
         }
      });
   }

   async insertProduct(obj, voucher_no = null, bunch_no = null) {
      return new Promise(async (resolve, reject) => {
         try {

            obj.document = obj.document && typeof obj.document != 'string' ? JSON.stringify(obj.document) : JSON.stringify({});
            obj.isbill = obj.isbill ? 1 : 0;
            obj.is_xl = obj.is_xl ? 1 : 0;
            obj.auto_awk = obj.auto_awk ? 1 : 0;

            obj.bunch_no = bunch_no ? bunch_no : await this.getLastBunchNo('product') + 1;
            obj.voucher_no = voucher_no ? voucher_no : await this.getLastVoucherNo('product') + 1;
            let result = await this.db.prepare(this.query.product.insert).run(obj);
            obj._id = result.lastInsertRowid;

            if (obj.auto_awk) {
               let awk = this.tbInterface.getAawakFromProduct(obj);
               awk.is_auto_pd = 1;
               obj.awk_id = await this.insertAJ(awk, 'aawak');
               let updtResult = await this.db.prepare(this.query.product.update_auto_pd).run({ _id: obj._id, awk_id: obj.awk_id });
               console.log("update pd", updtResult);
            }

            resolve(obj);
         } catch (err) {
            reject(err);
         }
      });
   }

   async updateProduct(obj) {
      return new Promise(async (resolve, reject) => {
         try {

            obj.document = obj.document && typeof obj.document != 'string' ? JSON.stringify(obj.document) : JSON.stringify({});
            obj.isbill = obj.isbill ? 1 : 0;
            obj.is_xl = obj.is_xl ? 1 : 0;
            obj.auto_awk = obj.auto_awk ? 1 : 0;
            if (!obj.voucher_no) {
               obj.voucher_no = await this.getLastVoucherNo('product') + 1;
            }
            if (!obj.bunch_no) {
               obj.bunch_no = await this.getLastBunchNo('product') + 1;
            }

            let sql = this.query.product.update + ` where product._id = ${obj._id} `
            let result = await this.db.prepare(sql).run(obj);

            if (obj.awk_id && result.changes > 0) {
               let awkOld = await this.getById('aawak', obj.awk_id);
               let awkNew = this.tbInterface.getAawakFromProduct(obj, awkOld);
               let awkResult = await this.updateAJ(awkNew, 'aawak', awkOld);
            }

            resolve(obj);
         } catch (err) {
            reject(err);
         }
      });
   }

   async deleteProduct(id) {
      return new Promise(async (resolve, reject) => {
         try {
            await this.getList('aawak', { conditionString: `aawak.product_id = ${id} AND aawak.is_auto_pd <> 1` }).then(async (result) => {
               if (result.total_count > 1) {
                  throw new Error('foriegn key violation');
               } else {
                  let product = await this.getById('product', id);
                  if (product.awk_id); {
                     await this.deleteAJ(product.awk_id, 'aawak');
                  }
                  await this.db.prepare(`delete from product where _id = ${id}`).run();
               }
            });

            resolve(true);
         } catch (err) {
            reject(err);
         }
      });
   }

   async deleteProductVoucher(voucher_no) {
      return new Promise(async (resolve, reject) => {
         try {
            await this.getList('product', { conditionString: `product.voucher_no = ${voucher_no}` }).then(async (pResult) => {
               for (let pd of pResult.data) {
                  await this.deleteProduct(pd._id);
               }
            });

            resolve(true);
         } catch (err) {
            reject(err);
         }
      });
   }

   async getLastVoucherNo(tblname) {
      try {
         let row = this.db.prepare(`select max(voucher_no) as v_no from ${tblname}`).get();
         return row.v_no || 0;
      }
      catch (err) {
         return 0;
      }
   }

   async getLastBunchNo(tblname) {
      // return new Promise(async(resolve, reject)=>{
      try {
         let row = this.db.prepare(`select max(bunch_no) as b_no from ${tblname}`).get();
         return row.b_no || 0;
      }
      catch (err) {
         return 0;
      }
      // });
   }

   convertToLower(data, fieldList = null) {
      if (fieldList && fieldList.length > 0) {
         for (let i in data) {
            for (let field of fieldList) {
               data[i][field] = data[i][field] ? data[i][field].trim().toLowerCase().normalize('NFC') : null;
            }
         }
      } else {
         for (let i in data) {
            for (let key of Object.keys(data[i])) {
               data[i][key] = data[i][key] ? data[i][key].trim().toLowerCase().normalize('NFC') : null;
            }
         }
      }
      return data;
   }

   sortAndFillMonths(arrMonth = [1, 12]) {

      // Step 1: Sort month in accending order.
      arrMonth.sort((a, b) => a - b);

      // Step 2: Find the minimum and maximum values
      const minMonth = arrMonth[0];
      const maxMonth = arrMonth[arrMonth.length - 1];

      // Step 3: Create a new array for the result
      const result = [];

      // Step 4: Iterate from the minimum value to the maximum value
      for (let month = minMonth; month <= maxMonth; month++) {
         result.push(month);
      }

      return result;
   }

   sortAndFillMonthsString(arrMonth = [1, 12]) {

      // Step 1: Sort month in accending order.
      arrMonth.sort((a, b) => a - b);

      // Step 2: Find the minimum and maximum values
      const minMonth = arrMonth[0];
      const maxMonth = arrMonth[arrMonth.length - 1];

      // Step 3: Create a new array for the result
      const result = [];

      // Step 4: Iterate from the minimum value to the maximum value
      for (let month = minMonth; month <= maxMonth; month++) {
         result.push(month.toString().padStart(2, '0'));
      }

      return result;
   }

   join(array) {
      let str = ``;
      for (let i of array) {
         str += `'${i}',`;
      }
      return str.slice(0, -1);
   }

   cleanString(str) {
      return (str || "")
         .trim()
         .normalize("NFC")          // normalize Unicode
         .replace(/\u200B/g, "")    // remove zero-width space
         .replace(/\u00A0/g, " ")   // remove non-breaking space
         .replace(/\s+/g, " ")      // collapse multiple spaces
         .toLowerCase();            // case-insensitive for English
   };

   async stringCompare(a, b) {
      return this.cleanString(a) === this.cleanString(b);
   }

   async getMMs(dept_id = null) {

      return await this.getList('mm', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['mm_hin', 'mm_eng', 'mm_code']);
      }, (err) => {
         return [];
      });
   }
   async getStates(dept_id = null) {

      return await this.getList('state').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['state_hin', 'state_eng']);
      }, (err) => {
         return [];
      });
   }
   async getDistricts(dept_id = null) {

      return await this.getList('district').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['district_hin', 'district_eng']);
      }, (err) => {
         return [];
      });
   }
   async getZones(dept_id = null) {

      return await this.getList('zone').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['zone_hin', 'zone_eng']);
      }, (err) => {
         return [];
      });
   }
   async getCategories(dept_id = null) {

      return await this.getList('category', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['category_hin', 'category_eng', 'category_roman']);
      }, (err) => {
         return [];
      });
   }
   async getUnits(dept_id = null) {

      return await this.getList('unit').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['unit_short', 'unit_full']);
      }, (err) => {
         return [];
      });
   }
   async getAttributes(dept_id = null) {
      return await this.getList('attribute', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['attribute_hin', 'attribute_eng', 'attribute_roman']);
      }, (err) => {
         return [];
      });
   }
   async getAttributeValues(dept_id = null) {
      return await this.getList('attributes_value', { dept_id: dept_id, full: true }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['attribute_value_hin', 'attribute_value_eng', 'attribute_value_roman']);
      }, (err) => {
         return [];
      });
   }
   async getitems(dept_id = null) {

      return await this.getList('item', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['item_hin', 'item_eng', 'item_roman', 'item_code']);
         // return resolve.data || [];
      }, (err) => {
         return [];
      });
   }
   async getSubitems(dept_id = null) {

      return await this.getList('subitem', { dept_id: dept_id, full: true }).then(async (resolve) => {
         // return resolve.data || [];
         // console.log(resolve.data);

         return this.convertToLower(resolve.data || [], ['subitem_hin', 'subitem_eng', 'subitem_roman']);
      }, (err) => {
         return [];
      });
   }
   async getSubiemList(dept_id = null) {

      return await this.getList('subitem_list', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['subitem_hin', 'subitem_eng', 'subitem_roman']);
      }, (err) => {
         return [];
      });
   }
   async getSupportList(dept_id = null) {
      return await this.getList('support_list', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['list_name_hin', 'list_name_eng', 'list_name_roman']);
      }, (err) => {
         return [];
      });
   }
   async getCountries(dept_id = null) {
      return await this.getList('country').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['country_hin', 'country_eng']);
      }, (err) => {
         return [];
      });
   }
   async getCities(dept_id = null) {
      return await this.getList('city').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['city_hin', 'city_eng']);
      }, (err) => {
         return [];
      });
   }
   async getNimitts(dept_id = null) {
      return await this.getList('nimitt', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['nimitt_hin', 'nimitt_eng', 'gender', 'relative_name']);
      }, (err) => {
         return [];
      });
   }
   async getPbks(dept_id = null) {
      return await this.getList('pbk', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['pbk_hin', 'pbk_eng', 'gender', 'relation', 'relative_name']);
      }, (err) => {
         return [];
      });
   }

   async getDictionary(dict_type) {
      return await this.getList('dictionary', { conditionString: `type = '${dict_type}'` }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['name', 'extra_note']);
      }, (err) => {
         return [];
      });
   }

   async checkDuplication(type, data) {
      return await this.selectWithCondition(type.name, 'duplicate', data).then(async (resolve) => {
         if (resolve.length) {
            return resolve;
         }
         return false;
      });
   }

   async checkFullDuplication(type, data) {
      return await this.selectWithCondition(type.name, 'duplicate_full', data).then(async (resolve) => {
         if (resolve.length) {
            return resolve;
         }
         return false;
      });
   }

   async insertExcelData(type, data, dept_id = null) {
      switch (type) {
         case 'product':
            data.dept_id = dept_id ? dept_id : data.dept_id;
            return await this.insertProduct(data).then((result) => {
               console.log('insert', result);
               return result;
            })
            break;
         default:
            return await this.insert(type.name, data, dept_id).then((result) => {
               console.log('insert', result);
               return result;
            })
      }
   }

   async updateExcelData(type, data, dept_id = null) {
      switch (type) {
         case 'product':
            return await this.updateProduct(type.name, data, this.query.conditions[type.name + '_duplicate'], false).then((result) => {
               // console.log('update', result);
               return result;
            }, (reject) => {
               return reject;
            });
            break;
         default:
            return await this.updateMany(type.name, data, this.query.conditions[type.name + '_duplicate'], false).then((result) => {
               // console.log('update', result);
               return result;
            }, (reject) => {
               return reject;
            });
      }
   }

   ExcelDateToJSDate = (intDate) => {
      return new Date((Math.floor(intDate - 25569) * 86400) * 1000);
   }

   ExcelDateToUnixSDate = (intDate) => {
      return Math.floor(intDate - 25569) * 86400;
   }

   StringToDate = (stringDate) => {
      let datearr = stringDate.split(/[./-]+/);
      if (datearr && datearr.length == 3) {

         if (datearr[0].length == 4) {
            return new Date(datearr[0] + '-' + datearr[1].padStart(2, "0") + '-' + datearr[2].padStart(2, "0"));
         }
         else {
            return new Date(datearr[2].padStart(4, "20") + '-' + datearr[1].padStart(2, "0") + '-' + datearr[0].padStart(2, "0"));
         }
      }
      // yyyy-mm-dd
      return;
   }

   StringToUnixSDate = (stringDate) => {
      let datearr = stringDate.split(/[./-]+/);
      if (datearr && datearr.length == 3) {

         if (datearr[0].length == 4) {
            return (new Date(datearr[0] + '-' + datearr[1].padStart(2, "0") + '-' + datearr[2].padStart(2, "0")) / 1000);
         }
         else {
            return (new Date(datearr[2].padStart(4, "20") + '-' + datearr[1].padStart(2, "0") + '-' + datearr[0].padStart(2, "0")) / 1000);
         }
      }
      // yyyy-mm-dd
      return;
   }

   JulianDateToJSDate = (julianDate) => {
      return new Date((julianDate - 2440587.5) * 86400000);
   }





   async processRelAawakJawak(jawakId, aawakSplits, qty) {
      return new Promise(async (resolve, reject) => {
         try {
            if (!jawakId) return resolve(false);

            if (typeof aawakSplits === 'string') {
               try { aawakSplits = JSON.parse(aawakSplits); } catch (e) { aawakSplits = []; }
            }

            const BaseTable = require('./base.table');
            const relAawakJawakModel = new BaseTable('rel_aawak_jawak');

            // Delete all existing rel_aawak_jawak rows for this jawak
            relAawakJawakModel.delete({ jawak_id: jawakId });

            // Insert new split or 1:1 relation rows
            if (Array.isArray(aawakSplits) && aawakSplits.length > 0) {
               const isSplit = aawakSplits.length > 1 ? 1 : 0;
               for (const s of aawakSplits) {
                  const awkId = s.aawak_id || s._id;
                  const itemSplitQty = Number(s.split_qty) || 0;
                  if (awkId && itemSplitQty > 0) {
                     relAawakJawakModel.insert({
                        aawak_id: awkId,
                        jawak_id: jawakId,
                        qty: qty || itemSplitQty,
                        split_qty: isSplit === 1 ? itemSplitQty : null,
                        is_split: isSplit
                     }, false);
                  }
               }
            }

            resolve(true);
         } catch (err) {
            reject(err);
         }
      });
   }
}

module.exports = new Functions();


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

