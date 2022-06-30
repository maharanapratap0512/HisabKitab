class DBContex {
    query;
    db;
    tbl_need_dept_config = [
        'item',
        'itemMix',
        'pbk',
        'mm',
        'subitem',
        'category',
    ];
    tbl_with_dept_id = [
        'aawak',
        'jawak',
        'bachat',
        'product'
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
        this.db = require('../models/db.model').db;
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
                    conditionQuery = (!options.dept_id || options.dept_id == 1) ? null : `(select config_value from department_config where dept_id = ${options.dept_id} AND config_key = 'aj_type') LIKE '%,'||support_list._id||',%'`;
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

                let order = options.orderBy ? options.orderBy : (this.query[tblname] && options.full ? this.query[tblname].order : null);
                
                sql =
                sql.replace('?', (conditionQuery ? ` where ${conditionQuery}` : '') + (order ? ` order by ${order} ` : ''));
               
                // if(tblname == "item"){
                //     console.log("sql", sql);
                //     console.log("options", options);
                //     console.log("order", order);
                //     console.log("conditionQuery", conditionQuery);
                // }

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

                    getres = await this.db.prepare(sql).get();
                }

                resolve(getres);
            }
            catch (err) { reject(err) }
        })
    }

    async update(tblname, obj, id) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = this.query[tblname].update + ` where _id=${id} `;
                const result = await this.db.prepare(sql).run(obj);

                let getres = {};
                if (result.changes) {
                    getres = await this.db.prepare(this.query[tblname].select_full.replace('?', ` where _id = ${id} `)).get();
                }
                resolve(getres)
            }
            catch (err) { reject(err) }
        })
    }

    async delete(tblname, conditionString) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("condition", conditionString);
                const result = await this.db.prepare(`delete from ${tblname} where ${conditionString} `).run();
                return resolve(result);
            }
            catch (err) { reject(err) }
        })
    }

    async getCount(tblname, conditionString = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.supp_list.includes(tblname)) {
                    tblname = `support_list`;
                }                
                const sql =
                    `select count(*) as total_count from ${tblname} ` + (conditionString && conditionString?.trim() != '' ? ` where ${conditionString} ` : ``)
                const stmt = this.db.prepare(sql).get();
                // if(tblname == 'item'){
                //     console.log("sql", sql);
                //     console.log("stmt", stmt);
                // }
                resolve(stmt);
            }
            catch (err) { reject(err) }
        })
    }
}

module.exports = DBContex; 