const DBContex = require('./DBContex');
const { HmpRecipe, HmpRecipeInput, HmpRecipeOutput, HmpBatch, HmpBatchInput, HmpBatchOutput, PbkClosing, PbkBachat } = require('../models/hmp.model');
const { sequelize } = require('./db.model');
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
            let stmtInsert = this.db.prepare(this.query[type].insert);
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
            let insResult = stmtInsert.run(obj);
            if (insResult.changes == 1 && insResult.lastInsertRowid) {
               obj._id = insResult.lastInsertRowid;
               await this.updateBachatFromAJInsert(obj, type);
               if (type == 'jawak') {
                  obj.enz.jawak_id = insResult.lastInsertRowid;
                  obj.usage_report.jawak_id = insResult.lastInsertRowid;
                  await this.insertUsageReport(obj.usage_report);
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

            if (!objOld) {
               objOld = await this.getById(type, obj._id);
            }

            // console.log(obj);
            let updtResult = stmtUpdate.run(obj);
            if (updtResult.changes == 1) {
               await this.updateBachatFromAJUpdate(obj, type, objOld);
               if (obj.enz) {
                  obj.enz[type + '_id'] = obj._id
                  if (obj.enz._id)
                     await this.updateAJEnzyme(obj.enz, type);
                  else
                     await this.insertAJEnzyme(obj.enz, type);
               }
               if (type == 'jawak' && obj.usage_report) {
                  obj.usage_report.jawak_id = obj._id;
                  if (obj.usage_report._id) {
                     await this.updateUsageReport(obj.usage_report)
                  } else {
                     await this.insertUsageReport(obj.usage_report);
                  }

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
         case 'product': data.dept_id = dept_id ? dept_id : data.dept_id;
            return await this.insertProduct(data).then((result) => {
               console.log('insert', result);
               return result;
            })
            break;
         default: return await this.insert(type.name, data, dept_id).then((result) => {
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





   // -------------------------------------------------------------------------
   // PBK Closing Functions
   // -------------------------------------------------------------------------


   async syncPBKBachatFromPBKClosing(obj) {
      // Build the lookup key from closing fields
      let where = {};
      where = {
         pbk_id: obj.pbk_id,
         item_id: obj.item_id,
         dept_id: obj.dept_id,
         unit_id: obj.unit_id,
         // Always match exactly — null → IS NULL, value → = value
         subitem_id: obj.subitem_id || null,
         condition_id: obj.condition_id || null,
      };

      if (obj.pbk_bachat_id) {
         // Direct update by ID
         await PbkBachat.update(
            { qty: obj.qty, active: 1 },
            { where: { _id: obj.pbk_bachat_id } }
         );
      } else {
         // Find existing bachat by fields
         let bachat = await PbkBachat.findOne({ where });
         if (bachat) {
            obj.pbk_bachat_id = bachat._id;
            await PbkBachat.update(
               { qty: obj.qty, active: 1 },
               { where: { _id: bachat._id } }
            );
         } else {
            // Insert new pbk_bachat record
            await PbkBachat.create({
               pbk_id: obj.pbk_id,
               item_id: obj.item_id,
               subitem_id: obj.subitem_id || null,
               unit_id: obj.unit_id,
               condition_id: obj.condition_id || null,
               qty: obj.qty,
               dept_id: obj.dept_id,
               active: 1,
            });
         }
      }
   }

   // -------------------------------------------------------------------------
   // HMP Functions
   // -------------------------------------------------------------------------

   async insertUpdateHMPBatch(data) {
      try {

         // 1. Main Batch Upsert
         const [batch, created] = await HmpBatch.upsert(data);

         const batchId = batch?._id || data._id;

         // 2. Process Inputs (Consumption -> Jawak)
         if (data.inputs && Array.isArray(data.inputs)) {
            let jawakVoucherNo = await this.getLastVoucherNo('jawak') + 1;
            for (let input of data.inputs) {
               if (input.item_id && input.qty) {
                  const jawakObj = this.tbInterface.getJawakFromHmpInput(batch, input);
                  jawakObj.voucher_no = jawakVoucherNo;

                  let jawakId;
                  if (input.jawak_ref_id) {
                     jawakObj._id = input.jawak_ref_id;
                     // await this.updateAJ(jawakObj, 'jawak');
                     jawakId = input.jawak_ref_id;
                  } else {
                     // jawakId = await this.insertAJ(jawakObj, 'jawak');
                  }

                  input.batch_id = batchId;
                  input.jawak_ref_id = jawakId;
                  input.active = 1;
                  await HmpBatchInput.upsert(input);
               }
            }
         }

         // 3. Process Outputs (Production -> Aawak)
         if (data.outputs && Array.isArray(data.outputs)) {
            let aawakVoucherNo = await this.getLastVoucherNo('aawak') + 1;
            for (let output of data.outputs) {
               if (output.item_id && output.qty) {
                  const aawakObj = this.tbInterface.getAawakFromHmpOutput(batch, output);
                  aawakObj.voucher_no = aawakVoucherNo;

                  let aawakId;
                  if (output.aawak_ref_id) {
                     aawakObj._id = output.aawak_ref_id;
                     // await this.updateAJ(aawakObj, 'aawak');
                     aawakId = output.aawak_ref_id;
                  } else {
                     // aawakId = await this.insertAJ(aawakObj, 'aawak');
                  }

                  output.batch_id = batchId;
                  output.aawak_ref_id = aawakId;
                  output.active = 1;
                  await HmpBatchOutput.upsert(output);
               }
            }
         }

         return batchId;
      } catch (ex) {
         console.log("Fn HMP batch IU", ex);

         throw ex;
      }
   }

   // if reciepe_id is present then update else insert
   async insertUpdateHMPRecipe(data) {
      try {
         // Synchronize _id for upsert if frontend sends recipe_id
         if (data.recipe_id) {
            data._id = data.recipe_id;
         }

         // 1. Upsert Recipe
         const [recipe, created] = await HmpRecipe.upsert(data);
         const recipeId = recipe?._id || data._id;

         // delete old inputs and outputs
         await HmpRecipeInput.destroy({ where: { recipe_id: recipeId } });
         await HmpRecipeOutput.destroy({ where: { recipe_id: recipeId } });
         // 2. Upsert Inputs
         if (data.inputs && Array.isArray(data.inputs)) {
            for (let input of data.inputs) {
               input.recipe_id = recipeId;
               await HmpRecipeInput.create(input);
            }
         }

         // 3. Upsert Outputs
         if (data.outputs && Array.isArray(data.outputs)) {
            for (let output of data.outputs) {
               output.recipe_id = recipeId;
               await HmpRecipeOutput.create(output);
            }
         }

         return recipeId;
      } catch (ex) {
         console.log("recipe IU", ex);

         throw ex;
      }
   }

   async deleteHMPRecipe(id) {
      try {
         await HmpRecipeInput.destroy({ where: { recipe_id: id } });
         await HmpRecipeOutput.destroy({ where: { recipe_id: id } });
         return await HmpRecipe.destroy({ where: { _id: id } });
      } catch (ex) {
         console.log("Fn delete recipe", ex);
         throw ex;
      }
   }

   async deleteHMPBatchInput(id) {
      try {
         const input = await HmpBatchInput.findByPk(id);
         if (input) {
            if (input.jawak_ref_id) {
               // await this.deleteAJ(input.jawak_ref_id, 'jawak');
            }
            return await HmpBatchInput.destroy({ where: { _id: id } });
         }
         return 0;
      } catch (ex) {
         console.log("Fn delete batch input", ex);
         throw ex;
      }
   }

   async deleteHMPBatchOutput(id) {
      try {
         const output = await HmpBatchOutput.findByPk(id);
         if (output) {
            if (output.aawak_ref_id) {
               // await this.deleteAJ(output.aawak_ref_id, 'aawak');
            }
            return await HmpBatchOutput.destroy({ where: { _id: id } });
         }
         return 0;
      } catch (ex) {
         console.log("Fn delete batch output", ex);
         throw ex;
      }
   }

   async deleteHMPBatch(id) {
      try {
         const inputs = await HmpBatchInput.findAll({ where: { batch_id: id } });
         for (const input of inputs) {
            await this.deleteHMPBatchInput(input._id);
         }

         const outputs = await HmpBatchOutput.findAll({ where: { batch_id: id } });
         for (const output of outputs) {
            await this.deleteHMPBatchOutput(output._id);
         }

         return await HmpBatch.destroy({ where: { _id: id } });
      } catch (ex) {
         console.log("Fn delete batch", ex);
         throw ex;
      }
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

