class DBContex {
    query;
    dbModal;
    DBFolder;
    dbmodal;
    db;
    fs;
    path;
    tbl_need_dept_config = [
        'item',
        'pbk',
        'mm',
        'subitem',
        'category',
    ];
    tbl_with_dept_id = [
        'aawak',
        'jawak',
        'bachat',
        'product',
        'department_config'
    ];
    tbl_from_supp_list = [
        'jawak_type',
        'aawak_type'
    ]
    supp_list = [
        // 'mm_type',
        'gender',
        'relation',
        'condition',
        // 'status',
        'aawak_type',
        'jawak_type'
    ];

    constructor() {
        this.query = require('../models/query');
        this.dbModal = require('../models/db.model');
        this.path = require('path');
        this.fs = require('fs');
        this.DBFolder = this.path.resolve(__dirname, '../../../../Data');
        const dbPath = this.path.resolve(__dirname, '../../../../Data/Database.db');
        // this.dbmodal = new this.dbModal(dbPath);
        this.db = this.dbModal.dbmodal.db;
    }




    // options = { full:boolean, dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    async getList(tblname, options = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = options.full ? (this.query[tblname] ? this.query[tblname].select_full : '') : (this.query[tblname] ? this.query[tblname].select : '');
                // console.log("dept_id == (1 || null) ====", dept_id == ('1' || null));
                // console.log("[1, null].includes(dept_id) ====", ['1', null].includes(dept_id));
                let conditionQuery = null


                if (this.tbl_need_dept_config.includes(tblname)) {
                    conditionQuery = (!options.dept_id || options.dept_id == 1) ? null : `(select config_value from department_config where dept_id = ${options.dept_id} AND config_key = '${tblname}') LIKE '%,'||${tblname}._id||',%'`;
                }
                else if (this.tbl_with_dept_id.includes(tblname)) {
                    conditionQuery = (options.dept_id ? `(${tblname}.dept_id = ${options.dept_id})` : null)
                }
                else if (this.supp_list.includes(tblname)) {
                    sql = `select * from support_list ?`;
                    conditionQuery = `list_type = '${tblname}'`
                    if (this.tbl_from_supp_list.includes(tblname)) {
                        conditionQuery += (!options.dept_id || options.dept_id == 1) ? '' : ` AND (select config_value from department_config where dept_id = ${options.dept_id} AND config_key = 'aj_type') LIKE '%,'||support_list._id||',%'`;
                    }
                }

                conditionQuery = options.conditionString ? (conditionQuery ? `${conditionQuery} AND ` : '') + options.conditionString : conditionQuery

                let order = options.orderBy ? options.orderBy : ((options.full && this.query[tblname]) ? this.query[tblname].order : null);


                if (tblname == "itemmix") {
                    sql = sql.replace('?', (conditionQuery ? ` where ${conditionQuery}` : ''));
                    sql = sql.replace('#', (order ? ` order by ${order}` : ``));
                }
                else {
                    sql = sql.replace('?', (conditionQuery ? ` where ${conditionQuery}` : '') + (order ? ` order by ${order}` : ``));
                }


                if (tblname == "itemmix") {
                    console.log("get sql_______", sql);
                    console.log("get options______", options);
                    console.log("get order______", order);
                    console.log("get conditionQuery______", conditionQuery);
                }

                const result = await this.db.prepare(sql).all({ limit: options.limit ? options.limit : -1, offset: options.offset ? options.offset : -1 });
                this.getCount(tblname, conditionQuery).then((res) => {
                    resolve({ data: result, total_count: res.total_count });
                });
            }
            catch (err) {
                console.log(err);
                reject(err)
            }
        })
    }



    async insert(tblname, obj, dept_id = null) {
        return new Promise(async (resolve, reject) => {
            try {
                obj.active = dept_id == 1 ? 1 : 0;

                // console.log("insert",result);
                console.log("insert obj_______", obj);
                console.log("sql", this.query[tblname].insert);
                const result = await this.db.prepare(this.query[tblname].insert).run(obj);

                let getres = [];
                // if inserted success
                if (result.changes == 1 && result.lastInsertRowid) {
                    if (this.tbl_need_dept_config.includes(tblname)) {
                        await this.db.prepare(this.query.department_config.update_config_value).run(
                            { tblname: tblname, dept_id: dept_id, new_id: result.lastInsertRowid })
                    }
                    let sql =
                        this.query[tblname].select_full.replace('?', ` where ${tblname}._id = ${result.lastInsertRowid} `);

                    if (tblname == "mm") {
                        console.log("get sql_______", sql);
                    }
                    getres = await this.db.prepare(sql).get({ order: `${tblname}._id`, limit: 1, offset: -1 });
                    console.log("getres_______", getres);
                }


                resolve(getres);
            }
            catch (err) {
                console.log("insert errr", err);
                reject(err)
            }
        })
    }



    async update(tblname, obj, id) {
        return new Promise(async (resolve, reject) => {
            try {
                let key = Object.keys(obj);
                let sql = key[0] == 'active' ? this.query[tblname].update_active : this.query[tblname].update + ` where ${tblname}._id = ${id} `;
                obj.active = obj.active ? 1 : 0;

                console.log("updt obj_____", obj);
                console.log("updt sql_____", sql);
                const result = await this.db.prepare(sql).run(obj);
                console.log("updt result_____", result);

                let getres = {};
                if (result.changes) {
                    getres = await this.db.prepare(this.query[tblname].select_full.replace('?', ` where ${tblname}._id = ${id} `)).get({ limit: 1, offset: -1, order: `${tblname}._id` });
                }
                console.log("updt getres_____", getres);
                resolve(getres)
            }
            catch (err) {
                console.log("err", err);
                reject(err)
            }
        })
    }



    async delete(tblname, id) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.db.prepare(`delete from ${tblname} where _id = ${id} `).run();
                return resolve(result);
            }
            catch (err) { reject(err) }
        })
    }



    async getCount(tblname, conditionString = null) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = '';
                if (this.supp_list.includes(tblname)) {
                    tblname = `support_list`;
                }
                if (tblname == "itemmix") {
                    sql = this.query[tblname].count.replace('?', (conditionString && conditionString?.trim() != '' ? ` where ${conditionString} ` : ``));
                    sql = sql.replace('#', '');
                }
                else {
                    sql =
                        `select count(*) as total_count from ${tblname} ` + (conditionString && conditionString.trim() != '' ? ` where ${conditionString} ` : ``)
                }
                // console.log("sql count", sql);
                if (tblname == 'itemmix') {
                    console.log("sql", sql);
                    // console.log("stmt", stmt);
                }
                const stmt = await this.db.prepare(sql).get();
                if (tblname == 'itemmix') {

                    console.log("stmt", stmt);
                }
                resolve(stmt);
            }
            catch (err) { reject(err) }
        })
    }

    deleteExists(filepath) {
        return new Promise((resolve, reject) => {
            try {
                console.log("delete out", filepath);
                this.fs.unlink(filepath, (err) => {
                    if (err) {
                        console.log(err);
                    }
                    console.log("delete in", filepath);
                    resolve();
                });

            }
            catch (ex) {
                console.log(ex);
            }
        })
    }

    async generateDB(dept_id) {
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
                        
                        for (let key of Object.keys(this.query.genDeptDB)) {
                            console.log(key);
                            if (key == "point") {
                                console.log("point", exportDB.prepare(`select * from point`).all());
                                console.log("this.query.genDeptDB[key]", this.query.genDeptDB[key]);
                            }
                            
                            let result = exportDB.prepare(this.query.genDeptDB[key]).run({ dept_id: dept_id });
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
}

module.exports = DBContex; 