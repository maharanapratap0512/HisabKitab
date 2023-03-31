class Functions {
   DB;
   DBContex;
   constructor() {
      this.DBContex = require('./DBContex');
      this.DB = new this.DBContex();
      const begin = this.DB.db.prepare('BEGIN');
      const commit = this.DB.db.prepare('COMMIT');
      const rollback = this.DB.db.prepare('ROLLBACK');

      this.begin = () => begin.run();
      this.commit = () => commit.run();
      this.rollback = () => rollback.run();
   }

   async insertAJ(obj, type) {
      return new Promise(async (resolve, reject) => {
         try {
            let stmtInsert = this.DB.db.prepare(this.DB.query[type].insert);
            let stmtInsertBachat = this.DB.db.prepare(this.DB.query.bachat_new['insert_' + type + '_ins']);
            let stmtUpdateBachat = this.DB.db.prepare(this.DB.query.bachat_new['update_' + type + '_ins']);
            let objDate = new Date(obj.date);
            obj.month = objDate.getMonth();
            obj.year = objDate.getFullYear();
            obj.document = JSON.stringify(obj.document ? obj.document : {});
            obj.isbill = obj.isbill ? 1 : 0;
            obj.active = 1;
            let insResult = stmtInsert.run(obj);
            if (insResult.changes == 1 && insResult.lastInsertRowid) {
               let bachat = await this.DB.getBachatFromAJ(obj);
               let bachatResult;
               if (bachat._id) {
                  bachatResult = stmtUpdateBachat.run(obj);
               }
               else {
                  bachatResult = stmtInsertBachat.run(obj);
               }
               resolve(insResult.lastInsertRowid);
            } else {
               reject(new Error('no any records are inserted'));
            }

         } catch (err) {
            reject(err);
         }
      });
   }

   async updateAJ(obj, type, objOld = null) {
      return new Promise(async (resolve, reject) => {
         try {
            let stmtUpdate = this.DB.db.prepare(this.DB.query[type].update + ` where ${type}._id = ${obj._id}`);
            let stmtInsertBachat = this.DB.db.prepare(this.DB.query.bachat_new['insert_' + type + '_ins']);
            let stmtUpdateBachat = this.DB.db.prepare(this.DB.query.bachat_new['update_' + type + '_ins']);
            let stmtDeleteBachat = this.DB.db.prepare(this.DB.query.bachat_new['update_' + type + '_del']);
            if (!objOld) {
               objOld = await this.DB.getById(type, obj._id);
            }
            let objDate = new Date(obj.date);
            obj.month = objDate.getMonth();
            obj.year = objDate.getFullYear();

            let objOldDate = new Date(objOld.date);
            objOld.month = objOldDate.getMonth();
            objOld.year = objOldDate.getFullYear();

            obj.document = JSON.stringify(obj.document ? obj.document : {});
            obj.isbill = obj.isbill ? 1 : 0;

            let updtResult = stmtUpdate.run(obj);
            if (updtResult.changes == 1) {
               stmtDeleteBachat.run(objOld);
               // let bachatUpdate = await this.DB.getBachatFromAJ(obj);
               let bachatUpdate = stmtUpdateBachat.run(obj);
               console.log(bachatUpdate);
               if (!bachatUpdate.changes) {
                  bachatUpdate = stmtInsertBachat.run(obj);
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
            let stmtUpdateBachat = this.DB.db.prepare(this.DB.query.bachat_new['update_' + type + '_del']);
            let stmtDelete = this.DB.db.prepare(this.DB.query[type].delete)
            let obj = await this.DB.getById(type, id);
            let objDate = new Date(obj.date);
            obj.month = objDate.getMonth();
            obj.year = objDate.getFullYear();
            console.log(obj);
            let delResult = stmtDelete.run({ _id: id });
            if (delResult.changes == 1) {
               stmtUpdateBachat.run(obj);
               resolve(true);
            } else {
               reject(new Error('no any entry deleted.'));
            }

         } catch (err) {
            reject(err);
         }
      });
   }

   convertToLower(data, fieldList = null) {
      if (fieldList && fieldList.length > 0) {
         for (let i in data) {
            for (let field of fieldList) {
               data[i][field] = data[i][field] ? data[i][field].toLowerCase() : null;
            }
         }
      } else {
         for (let i in data) {
            for (let key of Object.keys(data[i])) {
               data[i][key] = data[i][key] ? data[i][key].toLowerCase() : null;
            }
         }
      }
      return data;
   }

   async getMMs(dept_id = null) {

      return await this.DB.getList('mm', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['mm_hin', 'mm_eng', 'mm_code']);
      }, (err) => {
         return [];
      });
   }
   async getStates(dept_id = null) {

      return await this.DB.getList('state').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['state_hin', 'state_eng']);
      }, (err) => {
         return [];
      });
   }
   async getCategories(dept_id = null) {

      return await this.DB.getList('category', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['category_hin', 'category_eng']);
      }, (err) => {
         return [];
      });
   }
   async getUnits(dept_id = null) {

      return await this.DB.getList('unit').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['unit_short', 'unit_full']);
      }, (err) => {
         return [];
      });
   }
   async getitems(dept_id = null) {

      return await this.DB.getList('item', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['item_hin', 'item_eng', 'item_code']);
      }, (err) => {
         return [];
      });
   }
   async getSubitems(dept_id = null) {

      return await this.DB.getList('subitem', { dept_id: dept_id }).then(async (resolve) => {
         return resolve.data || [];
         // return this.convertToLower(resolve.data || []);
      }, (err) => {
         return [];
      });
   }
   async getSubiemList(dept_id = null) {

      return await this.DB.getList('subitem_list', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['subitem_hin', 'subitem_eng']);
      }, (err) => {
         return [];
      });
   }
   async getSupportList(dept_id = null) {
      return await this.DB.getList('support_list', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['list_name_hin', 'list_name_eng']);
      }, (err) => {
         return [];
      });
   }
   async getCountries(dept_id = null) {
      return await this.DB.getList('country').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['country_hin', 'country_eng']);
      }, (err) => {
         return [];
      });
   }
   async getCities(dept_id = null) {
      return await this.DB.getList('city').then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['city_hin', 'city_eng']);
      }, (err) => {
         return [];
      });
   }
   async getNimitts(dept_id = null) {
      return await this.DB.getList('nimitt', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['nimitt_hin', 'nimitt_eng', 'gender', 'relative_name']);
      }, (err) => {
         return [];
      });
   }
   async getPbks(dept_id = null) {
      return await this.DB.getList('pbk', { dept_id: dept_id }).then(async (resolve) => {
         return this.convertToLower(resolve.data || [], ['nimitt_hin', 'nimitt_eng', 'gender', 'relation', 'relative_name']);
      }, (err) => {
         return [];
      });
   }

   async getDictionary(dict_type) {
      return await this.DB.getList('dictionary', { conditionString: `type = '${dict_type}'` }).then(async (resolve) => {
         return resolve.data || [];
      }, (err) => {
         return [];
      });
   }

   async checkDuplication(type, data) {
      return await this.DB.selectWithCondition(type.name, 'duplicate', data).then(async (resolve) => {
         if (resolve.length) {
            return resolve;
         }
         return false;
      });
   }

   async checkFullDuplication(type, data) {
      return await this.DB.selectWithCondition(type.name, 'duplicate_full', data).then(async (resolve) => {
         if (resolve.length) {
            return resolve;
         }
         return false;
      });
   }

   async insertExcelData(type, data, dept_id = null) {
      return await this.DB.insert(type.name, data, dept_id).then((result) => {
         // console.log('insert', result);
         return result;
      })
   }

   async updateExcelData(type, data, dept_id = null) {
      return await this.DB.updateMany(type.name, data, this.DB.query.conditions[type.name + '_duplicate'], false).then((result) => {
         // console.log('update', result);
         return result;
      })
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

