class DBContex {
    query;
    dbModal;
    DBFolder;
    dbmodal;
    tbInterface;
    db;
    fs;
    path;
    exclude_depts = ['1'];
    tbl_need_dept_config = [
        'item',
        'pbk',
        'mm',
        'subitem',
        'category',
        'department',
        'support_list'
    ];
    tbl_with_dept_id = [
        'aawak',
        'jawak',
        'bachat',
        'bachat_new',
        'product',
        'department_config',
        'merge_history'
    ];
    tbl_from_supp_list = [
        'jawak_type',
        'aawak_type',
        'condition',
        'usage_list',
        'usage_type',
        'aawak_source',
        'mm_type'
    ]
    supp_list = [
        'mm_type',
        'gender',
        'relation',
        'condition',
        'aawak_type',
        'jawak_type',
        'usage_list',
        'usage_type',
        'aawak_source'
    ];

    constructor() {
        this.query = require('./query');
        this.dbModal = require('./db.model');
        this.tbInterface = require('./table_interface');
        this.path = require('path');
        this.fs = require('fs');
        this.DBFolder = this.path.resolve(__dirname, '../../../../Data');
        const dbPath = this.path.resolve(__dirname, '../../../../Data/Database.db');
        // this.dbmodal = new this.dbModal(dbPath);
        this.db = this.dbModal.dbmodal.db;
    }


    runQuery(object, key, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = this.query[object][key];
                // console.log(sql, options);
                const result = this.db.prepare(sql).run(options.obj ? options.obj : {});
                resolve(result);
            }
            catch (err) {
                reject(err);
            }
        });
    }

    allQuery(object, key, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = this.query[object][key];
                sql = sql.replace('?', (options.conditionString ? ` where ${options.conditionString}` : ''));
                console.log(sql);
                const result = this.db.prepare(sql).all(options.obj ? options.obj : {});
                resolve(result);
            }
            catch (err) {
                reject(err);
            }
        });
    }

    selectWithCondition(tblname, key, data, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let conditionString = this.query.conditions[tblname + '_' + key];
                let sql = this.query[tblname].select;
                if (options.full) {
                    sql = this.query[tblname].select_full;
                    data.limit = options.limit ? options.limit : -1;
                    data.offset = options.offset ? options.offset : -1
                }
                sql = sql.replace('?', (conditionString ? ` where ${conditionString}` : ''));
                const result = await this.db.prepare(sql).all(data);
                resolve(result);
            }
            catch (err) {
                reject(err);
            }
        })
    }

    // options = { full:boolean, dept_id : int, conditionString : string, orderBy : string, limit : int, offset : int }
    async getList(tblname, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = options.full ? (this.query[tblname] ? this.query[tblname].select_full : '') : (this.query[tblname] ? this.query[tblname].select : '');
                // console.log("dept_id == (1 || null) ====", dept_id == ('1' || null));
                // console.log("[1, null].includes(dept_id) ====", ['1', null].includes(dept_id));
                let conditionQuery = null
                let sconditionQuery = null


                if (this.tbl_need_dept_config.includes(tblname)) {
                    conditionQuery = (!options.dept_id || this.exclude_depts.includes(options.dept_id)) ? null : ` ${tblname}._id in (select json_each.value from department_config, json_each(config_value) where dept_id = ${options.dept_id} AND config_key='${tblname}')`;
                }
                else if (this.tbl_with_dept_id.includes(tblname)) {
                    conditionQuery = (options.dept_id ? `(${tblname}.dept_id = ${options.dept_id})` : null)
                }
                else if (this.supp_list.includes(tblname)) {
                    sql = `select * from support_list ?`;
                    conditionQuery = `list_type = '${tblname}'`
                    if (this.tbl_from_supp_list.includes(tblname)) {
                        conditionQuery += (!options.dept_id || this.exclude_depts.includes(options.dept_id)) ? '' : ` AND support_list._id in (select json_each.value from department_config, json_each(config_value) where dept_id = ${options.dept_id} AND config_key='support_list')`;
                    }
                }
                else if (tblname == "itemmix") {
                    conditionQuery = (!options.dept_id || this.exclude_depts.includes(options.dept_id)) ? null : ` item._id in (select json_each.value from department_config, json_each(config_value) where dept_id = ${options.dept_id} AND config_key='item')`;
                    sconditionQuery = (!options.dept_id || this.exclude_depts.includes(options.dept_id)) ? null : ` subitem._id in (select json_each.value from department_config, json_each(config_value) where dept_id = ${options.dept_id} AND config_key='subitem')`;
                    sconditionQuery = options.sconditionString ? (sconditionQuery ? `${sconditionQuery} AND ` : '') + options.sconditionString : sconditionQuery
                }
                else if (tblname == 'aawak_voucher') {
                    conditionQuery = (options.dept_id ? `(aawak.dept_id = ${options.dept_id})` : null);
                }

                conditionQuery = options.conditionString ? (conditionQuery ? `${conditionQuery} AND ` : '') + options.conditionString : conditionQuery

                let order = options.orderBy ? options.orderBy : ((options.full && this.query[tblname]) ? this.query[tblname].order : null);

                if (tblname == "itemmix") {
                    sql = sql.replace('?', (conditionQuery ? ` where ${conditionQuery}` : ''));
                    sql = sql.replace('&', (sconditionQuery ? ` AND ${sconditionQuery}` : ''));
                    sql = sql.replace('#', (order ? ` order by ${order}` : ``));
                    // console.log(sql);
                }
                else if (["itemmix", "item", "subitem", "product", "aawak_voucher"].includes(tblname)) {
                    sql = sql.replace('?', (conditionQuery ? ` where ${conditionQuery}` : ''));
                    sql = sql.replace('#', (order ? ` order by ${order}` : ``));

                }
                else {
                    sql = sql.replace('?', (conditionQuery ? ` where ${conditionQuery}` : '') + (order ? ` order by ${order}` : ``));
                }

                // if (tblname == "aawak")
                //     console.log(sql);

                const result = await this.db.prepare(sql).all({ limit: options.limit ? options.limit : -1, offset: options.offset ? options.offset : -1 });
                this.getCount(tblname, conditionQuery).then((res) => {
                    resolve({ data: result, total_count: res ? res.total_count : 0 });
                });
            }
            catch (err) {
                // console.log(err);
                reject(err)
            }
        })
    }

    async insert(tblname, obj, dept_id = null, get = true) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = ``;
                obj.active = 1;
                // if (this.tbInterface[tblname]) {
                //     obj = { ...this.tbInterface[tblname], ...obj };
                //     obj.add_by_dept_id = dept_id;
                //     sql = await this.query.queryBuilder.insert(tblname, obj);
                // } else {
                sql = this.query[tblname].insert;
                // }
                let lastID = await this.getLastID(tblname, dept_id);
                obj._id = lastID ? lastID + 1 : ((dept_id * 100000) + 1);
                // console.log("insert obj_______", obj);
                // console.log("sql", this.query[tblname].insert);
                const result = this.db.prepare(sql).run(obj);

                let getres = [];
                // if inserted success
                if (result.changes == 1 && result.lastInsertRowid) {
                    if (tblname == "support_list") {
                        if (obj.list_type && this.tbl_from_supp_list.includes(obj.list_type)) {
                            let q = this.query.department_config.update_config_value;
                            let p = { tblname: tblname, dept_id: dept_id, new_id: result.lastInsertRowid }
                            let t = this.db.prepare(q).run(p);
                        }
                    } else if (this.tbl_need_dept_config.includes(tblname)) {
                        let q = this.query.department_config.update_config_value;
                        let p = { tblname: tblname, dept_id: dept_id, new_id: result.lastInsertRowid }
                        let t = this.db.prepare(q).run(p);
                    }
                    if (get) {
                        let sql = this.query[tblname].select_full.replace('?', ` where ${tblname}._id = ${result.lastInsertRowid} `).replace('#', ``);

                        getres = await this.db.prepare(sql).get({ order: `${tblname}._id`, limit: 1, offset: -1 });
                    }
                    else {
                        getres = result.lastInsertRowid;
                    }
                }


                resolve(getres);
            }
            catch (err) {
                // console.log("insert errr", err);
                reject(err)
            }
        })
    }


    //under construction
    // insertMany = this.db.transaction((data) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let fid, lid;
    //             obj.active = dept_id == 1 ? 1 : 0;
    //             const stmt = this.db.prepare(this.query[tblname].insert);
    //             for(let row of data){
    //                 let result = stmt.run(row);                    
    //             }
    //         }
    //         catch (ex) {
    //             reject(ex);
    //         }
    //     })
    // });

    async update(tblname, obj, id, key = null) {
        return new Promise(async (resolve, reject) => {
            try {
                let keys = Object.keys(obj);
                let sql = key ? this.query[tblname][key] : (keys[0] == 'active' ? this.query[tblname].update_active : this.query[tblname].update);
                sql += ` where ${tblname}._id = ${id} `
                obj.active = obj.active ? 1 : 0;

                // console.log("updt obj_____", obj);
                // console.log("updt obj_____", sql);
                const result = this.db.prepare(sql).run(obj);
                // console.log("updt result_____", result);

                let getres = {};
                if (result.changes) {
                    getres = await this.db.prepare(this.query[tblname].select_full.replace('?', ` where ${tblname}._id = ${id} `).replace('#', ``)).get({ limit: 1, offset: -1, order: `${tblname}._id` });
                }
                // console.log("updt getres_____", getres);
                resolve(getres)
            }
            catch (err) {
                // console.log("err", err);
                reject(err)
            }
        })
    }

    async updateMany(tblname, obj, conditionString = null, get = true) {
        return new Promise(async (resolve, reject) => {
            try {
                // console.log("db", obj);
                let key = Object.keys(obj);
                let sql = key[0] == 'active' ? this.query[tblname].update_active : this.query[tblname].update;
                sql += (conditionString ? ` where ${conditionString}` : '');
                obj.active = obj.active ? 1 : 0;
                // console.log(sql);
                const result = await this.db.prepare(sql).run(obj);
                // console.log("updt result_____", result);

                let getres = {};
                if (result.changes && get) {
                    getres = await this.db.prepare(this.query[tblname].select_full.replace('?', conditionString ? ` where ${conditionString}` : '')).all({ limit: 1, offset: -1, order: `${tblname}._id` });
                }
                else {
                    getres = result;
                }
                // console.log("updt getres_____", getres);
                resolve(getres)
            }
            catch (err) {
                // console.log("err", err);
                reject(err)
            }
        });
    }



    async delete(tblname, id) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`delete from ${tblname} where _id = ${id}`);
                const result = this.db.prepare(`delete from ${tblname} where _id = ${id} `).run();
                return resolve(result);
            }
            catch (err) { console.log(err); reject(err) }
        })
    }

    async deleteMany(tblname, conditionString = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = this.db.prepare(`delete from ${tblname} ${conditionString ? `where ${conditionString}` : ``} `).run();
                console.log(result);
                return resolve(result);
            }
            catch (err) { console.log(err); reject(err) }
        })
    }



    async getCount(tblname, conditionString = null) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = '';
                if (this.supp_list.includes(tblname)) {
                    tblname = `support_list`;
                }
                if (["itemmix", "aawak_voucher", "jawak_voucher"].includes(tblname)) {
                    sql = this.query[tblname].count.replace('?', (conditionString && conditionString.trim() != '' ? ` where ${conditionString} ` : ``));
                    sql = sql.replace('#', '');
                }
                else {
                    sql =
                        `select count(*) as total_count from ${tblname} ` + (conditionString && conditionString.trim() != '' ? ` where ${conditionString} ` : ``)
                }
                const stmt = await this.db.prepare(sql).get();
                resolve(stmt);
            }
            catch (err) { reject(err) }
        })
    }

    async getLastID(tblname, dept_id = null) {
        return new Promise(async (resolve, reject) => {
            try {
                let conditionString = dept_id ? `(_id > ${dept_id * 100000} AND _id < ${(dept_id + 1) * 100000})` : null;
                let sql = `select max(_id) as last_id from ${tblname}` + (conditionString && conditionString.trim() != '' ? ` where ${conditionString} ` : ``);
                const stmt = await this.db.prepare(sql).get();
                resolve(stmt.last_id ? stmt.last_id : null);
            }
            catch (err) { reject(err) }
        })
    }

    async deleteExists(filepath) {
        return new Promise((resolve, reject) => {
            try {
                this.fs.unlink(filepath, (err) => {
                    if (err) {
                        // console.log(err);
                    }
                    resolve();
                });
            }
            catch (ex) {
                reject(ex);
            }
        })
    }

    async generateDB(dept_id, queriesObj = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let dept = await this.getList("department", { conditionString: `_id = ${dept_id}` });
                if (dept && dept.data && dept.data.length > 0) {
                    let exPath = this.path.resolve(this.DBFolder, dept.data[0].dept_eng ? dept.data[0].dept_eng : dept.data[0].dept_hin);

                    let exFilePath = this.path.resolve(exPath, 'Database.db')
                    if (!this.fs.existsSync(exPath)) {
                        this.fs.mkdirSync(exPath, { recursive: true });
                    }
                    if (this.fs.existsSync(exFilePath)) {
                        this.fs.unlinkSync(exFilePath);
                    }
                    const exDBModal = new this.dbModal.dbModal(exFilePath);
                    let exportDB = exDBModal.db;

                    // 
                    let exporting = exportDB.transaction(() => {
                        exportDB.prepare(`attach '${this.path.resolve(this.DBFolder, 'Database.db')}' as mainDB;`).run();
                        
                        // Fallback to original behavior if queriesObj is not passed (or empty)
                        if (Object.keys(queriesObj).length > 0) {
                            for (let tableName of Object.keys(queriesObj)) {
                                const queries = queriesObj[tableName];
                                for (let query of queries) {
                                    try {
                                        exportDB.prepare(query).run({ dept_id: dept_id });
                                    } catch (qErr) {
                                        console.error(`Error generating table ${tableName}:`, qErr.message);
                                        console.error(`Query:`, query);
                                        throw new Error(`Failed to generate table ${tableName}: ${qErr.message}`);
                                    }
                                }
                            }
                        } else {
                            // old backward compatible behavior
                            for (let key of Object.keys(this.query.genDeptDB || {})) {
                                exportDB.prepare(this.query.genDeptDB[key]).run({ dept_id: dept_id });
                            }
                        }
                    });

                    exportDB.pragma(`foreign_keys = off`);
                    exporting();
                    exportDB.pragma(`foreign_keys = on`);
                    exportDB.close();

                    resolve(exFilePath);
                }
                else {

                    reject(new Error('cannot found department.'))
                }
            }
            catch (ex) {
                reject(ex);
            }
        });
    }

    // type - 'bachat', 'bachat_new'
    async getBachatFromAJ(AJobj, type) {
        let ajDate = new Date(AJobj.date);
        let bachatObj = {
            ...this.tbInterface[type],
            month: ajDate.getMonth() + 1,
            year: ajDate.getFullYear(),
            mm_id: AJobj.mm_id,
            item_id: AJobj.item_id,
            subitem_id: AJobj.subitem_id,
            unit_id: AJobj.unit_id,
            dept_id: AJobj.dept_id,
            condition_id: AJobj.condition_id,
        };

        let bachat = await this.db.prepare(this.query[type].select_exists).get(bachatObj);
        return bachat || bachatObj;
    }

    // AJtype = 'aawawk', 'jawak'
    async updateBachatFromAJInsert(obj, AJtype) {
        let objDate = new Date(obj.date);
        obj.month = objDate.getMonth() + 1;
        obj.year = objDate.getFullYear();
        obj.difference = 0;
        let bachat = await this.getBachatFromAJ(obj, 'bachat');
        console.log(bachat);

        bachat.difference = Number(bachat.difference);
        obj.qty = Number(obj.qty);
        if (AJtype == 'aawak' && obj.aawak_type_id == 42) {
            obj.difference = bachat.difference + obj.qty;
        }
        if (AJtype == 'jawak' && obj.jawak_type_id == 43) {
            obj.difference = bachat.difference - obj.qty;
        }
        if (bachat._id) {
            let bcht = this.db.prepare(this.query.bachat['update_' + AJtype + '_ins']).run(obj);
        }
        else {
            let bcht = this.db.prepare(this.query.bachat['insert_' + AJtype + '_ins']).run(obj);
        }
        let bachatNew = await this.getBachatFromAJ(obj, 'bachat_new');
        bachatNew.difference = Number(bachatNew.difference)
        if (AJtype == 'aawak' && obj.aawak_type_id == 42) {
            obj.difference = bachatNew.difference + obj.qty;
        }
        if (AJtype == 'jawak' && obj.jawak_type_id == 43) {
            obj.difference = bachatNew.difference - obj.qty;
        }
        if (bachatNew._id) {
            let bchtN = this.db.prepare(this.query.bachat_new['update_' + AJtype + '_ins']).run(obj);
        }
        else {
            let bchtN = this.db.prepare(this.query.bachat_new['insert_' + AJtype + '_ins']).run(obj);
        }
        this.db.prepare(this.query.bachat_new.update_past_bachat).run({ ...obj, qty: (AJtype == 'jawak' ? -obj.qty : obj.qty) });
        this.db.prepare(this.query.product['update_' + AJtype + '_ins']).run(obj);
        return;
    }

    // AJtype = 'aawak', 'jawak'
    async updateBachatFromAJDelete(id, AJtype, obj = null) {
        if (!obj) {
            obj = await this.getById(AJtype, id);
        }
        if (obj) {
            let objDate = new Date(obj.date);
            obj.month = objDate.getMonth() + 1;
            obj.year = objDate.getFullYear();
            obj.difference = 0;
            let bachat = await this.getBachatFromAJ(obj, 'bachat');
            bachat.difference = Number(bachat.difference)
            obj.qty = Number(obj.qty)
            if (AJtype == 'aawak' && obj.aawak_type_id == 42) {
                obj.difference = bachat.difference - obj.qty;
            }
            if (AJtype == 'jawak' && obj.jawak_type_id == 43) {
                obj.difference = bachat.difference + obj.qty;
            }
            this.db.prepare(this.query.bachat['update_' + AJtype + '_del']).run(obj)
            let bachatNew = await this.getBachatFromAJ(obj, 'bachat_new');
            bachatNew.difference = Number(bachatNew.difference)
            if (AJtype == 'aawak' && obj.aawak_type_id == 42) {
                obj.difference = bachatNew.difference - obj.qty;
            }
            if (AJtype == 'jawak' && obj.jawak_type_id == 43) {
                obj.difference = bachatNew.difference + obj.qty;
            }
            this.db.prepare(this.query.bachat_new['update_' + AJtype + '_del']).run(obj);
            this.db.prepare(this.query.product['update_' + AJtype + '_del']).run(obj);
            this.db.prepare(this.query.bachat_new.update_past_bachat).run({ ...obj, qty: (AJtype == 'aawak' ? -obj.qty : obj.qty) });
            return;
        }
    }

    async updateBachatFromAJUpdate(AJobj, AJtype, AJobjOld = null) {
        await this.updateBachatFromAJDelete(AJobj._id, AJtype.toLowerCase(), AJobjOld);
        await this.updateBachatFromAJInsert(AJobj, AJtype.toLowerCase());

    }

    async getById(tblname, id, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = options.full ? (this.query[tblname] ? this.query[tblname].select_full : this.query[tblname].select) : (this.query[tblname] ? this.query[tblname].select : '');
                sql = sql.replace('?', ` where ${tblname}._id = ${id}`);
                if (tblname == "itemmix") {
                    sql = sql.replace('&', '');
                    sql = sql.replace('#', ``);
                }
                else if (["itemmix", "item", "subitem", "product"].includes(tblname)) {
                    sql = sql.replace('#', ``);
                }
                const result = await this.db.prepare(sql).get({ order: `${tblname}._id`, limit: 1, offset: -1 });
                resolve(result)
            }
            catch (ex) {
                reject(ex);
            }

        });
    }

}

module.exports = DBContex; 