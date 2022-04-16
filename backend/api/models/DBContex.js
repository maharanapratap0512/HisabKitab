class DBContex {
    DBFolder;
    localDB;
    Sqlite;
    Migrations;
    fs;
    path;
    dept_config_list = [
        'item',
        'itemMix',
        'pbk',
        'mm',
        'subitem',
        'category',
        'department'
    ]
    entry_list = [
        'product',
        'aawak',
        'jawak',
        'bachat'
    ]

    constructor() {
        // this.DBCollection = require('../models/db.model');
        let dbModel = require('../models/db.model')
        this.Sqlite = require('sqlite3');
        this.localDB = dbModel.localDB;
        this.Migrations = dbModel.Migrations;
        this.fs = require('fs');
        this.path = require('path');
        this.DBFolder = this.path.resolve(__dirname, '../../../../Data');
    }

    //run any query here
    run = async (sql, params = null) => {
        return new Promise((resolve, reject) => {
            try {
                this.localDB.run(sql, params, function (err) {
                    if (err) {
                        return reject(err)
                    }
                    else {
                        return resolve(this);
                    }
                });
            }
            catch (ex) {
                return reject(ex);
            }
        });

    }

    //sqlParam is array of sql statement followed by parameter list,
    // [ { sql:"", params : [] } ]
    transaction = async (sqlParam = [{}], callback) => {
        try {
            if (sqlParam && sqlParam.length > 0) {
                let error = [];
                let result = [];
                await this.localDB.serialize(() => {
                    this.localDB.run('BEGIN TRANSACTION;');
                    for (let i = 0; i < sqlParam.length; i++) {
                        this.localDB.run(sqlParam[i].sql, sqlParam[i].params, err => {
                            if (err) {
                                error.push({
                                    sql: sqlParam[i].sql,
                                    params: sqlParam.params,
                                    error: err
                                });
                            }
                            result.push({
                                sql: sqlParam[i].sql,
                                result: this
                            });
                        });
                    }
                    if (error || error != []) {
                        return callback(error);
                    }
                    else {
                        this.localDB.run('COMMIT;');
                        return callback(null, result);
                    }
                });
            }
            else {
                return callback('no queries found.');
            }
        }
        catch (ex) {
            callback(ex);
        }
    }


    generateDB = async (dept_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let dept = await this.getFullById("department", dept_id);
                if (dept) {
                    let exPath = this.path.resolve(this.DBFolder, dept.dept_eng);
                    let exFilePath = this.path.resolve(exPath, 'Database.db')
                    if (!this.fs.existsSync(exPath)) {
                        this.fs.mkdirSync(exPath, { recursive: true });
                    }
                    if (this.fs.existsSync(exFilePath)) {
                        this.fs.unlinkSync(exFilePath)
                    }
                    const exportDB = new this.Sqlite.Database(exFilePath, (err) => {
                        if (err) {
                            console.log("DB path : ", this.path.resolve(this.DBFolder, dept.dept_eng, 'Database.db'));
                            console.log({ path: this.DBFolder, Error: err.message });
                        }
                        console.log("connected with New Database");
                    });

                    exportDB.serialize(() => {
                        exportDB.run(`PRAGMA foreign_keys = off`);
                        exportDB.run(`BEGIN TRANSACTION`);
                        let migrationCount = this.Migrations.length;
                        for (let i = 0; i < migrationCount; i++) {
                            if (i != 2) {
                                this.Migrations[i](exportDB);
                            }
                        }
                        exportDB.run(`attach '${this.path.resolve(this.DBFolder, 'Database.db')}' as mainDB;`, (err) => {
                            // exportDB.run('ROLLBACK TRANSACTION');
                            console.log("atach", err)
                            return reject(err);
                        });

                        for (let keys of Object.keys(this.genDeptDB)) {
                            console.log(keys);
                            let sql = this.genDeptDB[keys].replace('?', dept_id);
                            exportDB.run(sql, (err) => {
                                if (err) { console.log({ key: keys, sql: sql, error: err }); }
                            });
                        }


                        exportDB.run(`PRAGMA user_version = ${migrationCount}`, (err) => {
                            if (err) console.log("pragma error : ", err);
                        });
                        exportDB.run(`PRAGMA foreign_keys = on`);

                        exportDB.run(`COMMIT`);
                    });
                    resolve(this.path.resolve(this.DBFolder, dept.dept_eng, 'Database.db'));
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

    generateUpdateDB = async (dept_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let dept = await this.getFullById("department", dept_id);
                if (dept) {
                    let date = new Date();                        
                    let exPath = this.path.resolve(this.DBFolder, dept.dept_eng);
                    let exFilePath = this.path.resolve(exPath, dept.dept_eng + '_update_'+date.getMonth()+'_'+date.getFullYear()+ '.db');
                    if (!this.fs.existsSync(exPath)) {
                        this.fs.mkdirSync(exPath, { recursive: true });
                    }
                    if (this.fs.existsSync(exFilePath)) {
                        this.fs.unlinkSync(exFilePath)
                    }
                    const exportDB = new this.Sqlite.Database(exFilePath, (err) => {
                        if (err) {
                            console.log("DB path : ", exFilePath);
                            console.log({ path: exFilePath, Error: err.message });
                        }
                        console.log("connected with New Database");
                    });

                    exportDB.serialize(() => {
                        exportDB.run(`PRAGMA foreign_keys = off`);
                        exportDB.run(`BEGIN TRANSACTION`);
                        let migrationCount = this.Migrations.length;
                        for (let i = 0; i < migrationCount; i++) {
                            if (i != 2) {
                                this.Migrations[i](exportDB);
                            }
                        }
                        exportDB.run(`attach '${this.path.resolve(this.DBFolder, 'Database.db')}' as mainDB;`, (err) => {
                            // exportDB.run('ROLLBACK TRANSACTION');
                            console.log("atach", err)
                            return reject(err);
                        });

                        for (let keys of Object.keys(this.genUpdtDB)) {
                            console.log(keys);
                            let sql = this.genUpdtDB[keys].replace('?', dept_id);
                            exportDB.run(sql, (err) => {
                                if (err) { console.log({ key: keys, sql: sql, error: err }); }

                                console.log(sql);
                            });
                        }


                        exportDB.run(`PRAGMA user_version = ${migrationCount}`, (err) => {
                            if (err) console.log("pragma error : ", err);
                        });
                        exportDB.run(`PRAGMA foreign_keys = on`);

                        exportDB.run(`COMMIT`);
                    });
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

    // mm_type|gender|relation
    getList = async (list_name) => {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = "";
                let list_name_arr = [
                    'mm_type',
                    'gender',
                    'relation',
                    'status',
                    'condition',
                    'aawak_type',
                    'jawak_type'
                ]
                if (list_name_arr.includes(list_name)) {
                    sql = `select * from support_list where list_type = '${list_name}'`;
                }
                else {
                    sql = `select * from ${list_name}`;
                }
                await this.localDB.all(sql, (err, data) => {
                    if (err) {
                        console.log(sql, err);
                        reject(err)
                    }
                    else {
                        resolve(data)
                    }
                })
            }
            catch (ex) {
                reject(ex);
            }
        })
    }

    //get table data by department
    getListByDept = async (list_name, dept_id) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (list_name && dept_id) {
                    let sql = "";
                    let exclude_dept = ['1', '2'];
                    let list_name_arr = [
                        'mm_type',
                        'gender',
                        'relation',
                        'condition',
                        'status',
                        'aawak_type',
                        'jawak_type'
                    ]

                    
                    if(list_name == "pbk"){
                        sql = `select * from pbk where (status is null OR status <> "nimmit") `;
                        if (!exclude_dept.includes(dept_id)) {                            
                            sql += ` AND (select config_value from department_config where dept_id = ${dept_id} AND config_key = '${list_name}') LIKE '%,'||${list_name}._id||',%'`;
                        }                
                    }
                    else if (this.dept_config_list.includes(list_name)) {

                        if (!exclude_dept.includes(dept_id)) {
                            if (list_name_arr.includes(list_name)) {
                                sql = `select * from support_list where list_type = '${list_name}' AND `;
                            }
                            else {
                                sql = `select * from ${list_name} where `;
                            }
                            sql += `(select config_value from department_config where dept_id = ${dept_id} AND config_key = '${list_name}') LIKE '%,'||${list_name}._id||',%'`;
                        }
                        else {
                            if (list_name_arr.includes(list_name)) {
                                sql = `select * from support_list where list_type = '${list_name}'`;
                            }
                            else {
                                sql = `select * from ${list_name}`;
                            }
                        }

                    }
                    else if (list_name_arr.includes(list_name)) {
                        sql = `select * from support_list where list_type = '${list_name}'`;
                    }
                    else if(list_name == "nimmit"){
                        sql = `select pbk.*, st.state_hin from pbk
                                left join state st on st._id = pbk.state_id where status = "nimmit"`;
                    }
                    else {
                        sql = `select * from ${list_name}`;
                    }
                    await this.localDB.all(sql, (err, data) => {
                        if (err) {
                            console.log({ sql: sql, err: err });
                            reject(err)
                        }
                        else {
                            resolve(data)
                        }
                    })
                }
                else {
                    reject(new Error('please sent list_name and dept_id both.'))
                }
            }
            catch (ex) {
                reject(ex);
            }
        })
    }

    getAJtypeByDept = (dept_id) => {
        return new Promise(async (resolve, reject) => {
            try {

                let sql = `select * from support_list where list_type IN ('aawak_type', 'jawak_type')`;
                if (!['1', '2'].includes(dept_id)) {
                    sql += ` AND (select config_value from department_config where dept_id = ${dept_id} AND config_key = 'aj_type') LIKE '%,'||_id||',%'`;
                }
                this.localDB.all(sql, (err, data) => {
                    if (err) {
                        console.log("ajtype", sql, err);
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                })
            }
            catch (err) {
                reject(err);
            }

        });
    }
    getAJtypeForConfig = (dept_id) => {
        return new Promise(async (resolve, reject) => {
            try {

                let sql1 = `select *, ? as chk from support_list where list_type IN ('aawak_type', 'jawak_type')`;
                let sql2 = `select *, ? as chk from support_list where list_type IN ('aawak_type', 'jawak_type')`;
                sql1 += ` AND (select config_value from department_config where dept_id = ${dept_id} AND config_key = 'aj_type') LIKE '%,'||_id||',%'`;
                sql2 += ` AND NOT (select config_value from department_config where dept_id = ${dept_id} AND config_key = 'aj_type') LIKE '%,'||_id||',%'`;
                this.localDB.all(`${sql1} UNION ${sql2} order by chk`, [true, false], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                })
            }
            catch (err) {
                reject(err);
            }

        });
    }

    getDeptConfig = async (dept_id = null, configKey = null) => {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = this.fullListConfig['department_config'];
                if (dept_id && dept_id != '') {
                    sql += ` where dept_id = ${dept_id}`;
                }
                if (configKey && configKey != '') {
                    sql += (dept_id && dept_id != '' ? ` AND ` : ` where`) + ` config_key = '${configKey}'`;
                }
                this.localDB.all(sql, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                })
            }
            catch (err) {
                return reject(err);
            }
        });
    }

    getPendingAawak = async (conditionString = null) => {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = this.fullListConfig['aawak'];
                sql += conditionString ? ` ` + conditionString : ``;
                this.localDB.all(sql, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            }
            catch (err) {
                return reject(err);
            }
        });
    }

    //get full list by department ALL or specified Id.
    getFullListForDeptConfig = async (list_name, dept_id, conditionString = null) => {
        return new Promise(async (resolve, reject) => {
            try {
                let params = [];
                let sql = this.fullListForConfig[list_name];
                if (sql && sql != '') {
                    if (list_name == 'itemMix') {
                        let condition = ``;
                        if (conditionString && conditionString != '') {
                            condition += ` where ${conditionString}`;
                        }

                        var Lindex1 = sql.lastIndexOf("?");
                        sql = sql.substring(0, Lindex1) + condition + sql.substring(Lindex1 + 1);
                    } else {
                        let sql2 = this.fullListForConfig[list_name];
                        sql += ` where (select config_value from department_config where dept_id = ${dept_id} AND config_key = '${list_name}') LIKE '%,'||${list_name}._id||',%'`;
                        sql2 += ` where NOT ((select config_value from department_config where dept_id = ${dept_id} AND config_key = '${list_name}') LIKE '%,'||${list_name}._id||',%')`;
                        sql += ` UNION ${sql2} order by chk`;
                        params = [true, false];
                    }
                }

                await this.localDB.all(sql, params, (err, data) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(data)
                    }
                })
            }
            catch (ex) {
                reject(ex);
            }
        })
    }

    getFullListByDept = async (list_name, dept_id, conditionString = null, orderBy = null, limit = null, offset = null) => {
        return new Promise(async (resolve, reject) => {
            try {
                // let sql = this.fullListQuery[list_name];
                let condition = ``;
                if (list_name == 'itemMix') {
                    if (!['1', '2'].includes(dept_id)) {
                        condition += ` where ((select config_value from department_config where dept_id = ${dept_id} AND config_key = 'item') LIKE '%,'||item._id||',%' OR (select config_value from department_config where dept_id = ${dept_id} AND config_key = 'subitem') LIKE '%,'||si._id||',%')`;
                    }
                }
                else if (this.dept_config_list.includes(list_name)) {
                    if (!['1', '2'].includes(dept_id)) {
                        condition += ` where (select config_value from department_config where dept_id = ${dept_id} AND config_key = '${list_name}') LIKE '%,'||${list_name}._id||',%'`;
                    }
                }
                else if (this.entry_list.includes(list_name)) {
                    condition += ` where ${list_name}.dept_id = ${dept_id}`;
                }

                if (conditionString && conditionString != '') {
                    condition += (condition == `` ? ` where` : ` AND `) + conditionString;
                }


                let sort = orderBy ? orderBy : this.fullListQuery[list_name + 'sort'];
                let sql = `${this.fullListQuery[list_name]} ${sort ? 'ORDER BY ' + sort : ''} ${limit ? 'LIMIT ' + limit : ''} ${offset ? 'OFFSET ' + offset : ''}`;

                var lIndex = sql.lastIndexOf("?");
                sql = sql.substring(0, lIndex) + condition + sql.substring(lIndex + 1);
                // console.log(str);
                console.log(sql);
                await this.localDB.all(sql, (err, data) => {
                    if (err) {
                        console.log({ type: 'new', sql: sql, err: err, params: [condition] });
                        reject(err)
                    }
                    else {
                        resolve(data)
                    }
                })
            }
            catch (ex) {
                reject(ex);
            }
        })
    }

    //get full list All or specific condition.
    /* return result in form of:
        {
            data: resulting rows,
            total_count: Total number of rows count
        }
    */
    getFullList = async (list_name, conditionString = null, orderBy = null, limit = null, offset = null) => {
        return new Promise(async (resolve, reject) => {
            try {
                let sort = orderBy ? orderBy : this.fullListQuery[list_name + 'sort'];
                let sql = `${this.fullListQuery[list_name]} ${sort ? 'ORDER BY ' + sort : ''} ${limit ? 'LIMIT ' + limit : ''} ${offset ? 'OFFSET ' + offset : ''}`;
                let condition = conditionString ? `where ${conditionString}` : ``;
                
                var lIndex = sql.lastIndexOf("?");
                sql = sql.substring(0, lIndex) + condition + sql.substring(lIndex + 1);

                let total_count = 0;
                await this.getCount(list_name, conditionString).then((resolve)=>{
                    total_count = resolve.total_count;
                });
                this.localDB.all(sql, (err, data) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        let result = {
                            data:data,
                            total_count: total_count
                        }
                        resolve(result)
                    }
                })
            }
            catch (ex) {
                reject(ex);
            }
        })
    }

    getFullById = async (list_name, listId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = this.fullListConfig[list_name];
                sql += ` where ${list_name}._id = ${listId}`;

                await this.localDB.get(sql, (err, data) => {
                    if (err) {
                        console.log({ sql: sql, err: err });
                        reject(err)
                    }
                    else {
                        resolve(data)
                    }
                })
            }
            catch (ex) {
                reject(ex);
            }
        })
    }

    getCount = async (list_name, condition = null) => {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = `select count(*) as total_count from ${list_name}`;

                if (condition) {
                    sql += ` where ${condition}`;
                }

                await this.localDB.get(sql, (err, data) => {
                    if (err) {
                        console.log({ sql: sql, err: err });
                        reject(err)
                    }
                    else {
                        resolve(data)
                    }
                })
            }
            catch (ex) {
                reject(ex);
            }
        })
    }

    insertMany = async (table_name, dataArr) => {
        return new Promise(async (resolve, reject) => {
            let result = [];
            successCount = 0;
            this.localDB.parallelize(async () => {
                try {
                    this.localDB.run('BEGIN;')
                    for (let i = 0; i < dataArr.length; i++) {
                        if (dataArr[i]) {
                            let cols = "", val = "", params = [];
                            for (const [field, value] of Object.entries(dataArr[i])) {
                                cols += `${field},`;
                                val += `?,`
                                params.push(value);
                            }
                            cols = cols.slice(0, -1);
                            val = val.slice(0, -1);
                            let sql = `insert into ${table_name}(${cols}) values(${val})`;
                            await this.run(sql, params).then((resolve) => {
                                successCount++;
                                result[i] = { success: true, _id: resolve.lastID }
                            }, (err) => {
                                result[i] = { success: false, err: err }
                            });
                        }
                    }
                }
                catch (err) {
                    this.localDB.run('END;');
                    return reject(err);
                }
                finally {
                    this.localDB.run('END;');
                    return resolve({ count: successCount, result: result });
                }
            });
        });
    }

    // Insert data into table.
    //Parameters
    // table_name is name of table/Collection
    // dataObj is the Object of data.
    // callback is the return method which contains (err, result). result contains new generated id.
    insert = async (table_name, dataObj, callback) => {
        try {
            if (dataObj) {
                let cols = "", val = "", params = [];
                for (let [field, value] of Object.entries(dataObj)) {
                    cols += `${field},`;
                    val += `?,`
                    if (['document', 'relative_ref', 'alt_mo_no'].includes(field)) {
                        value = JSON.stringify(value);
                    }
                    params.push(value);
                }
                cols = cols.slice(0, -1);
                val = val.slice(0, -1);
                let sql = `insert into ${table_name}(${cols}) values(${val})`;
                this.run(sql, params).then((resolve) => {
                    let selectSql = this.fullListConfig[table_name];
                    selectSql += ` where ${table_name}._id = ${resolve.lastID}`;
                    this.localDB.get(selectSql, async (err, rows) => {
                        if (err) {
                            console.log({ sql: sql, params:params, err: err });
                            return callback(err);
                        }
                        return callback(null, rows);
                    });
                }, (err) => {
                    return callback(err);
                });
            }
            else return callback('body is Empty.');
        }
        catch (ex) {
            return callback(ex);
        }
    }

    insertFromDept = async (table_name, dataObj, dept_id) => {
        return new Promise((resolve, reject) => {
            try {
                if (dataObj) {
                    let cols = "", val = "", params = [];
                    if (dept_id == 1) {
                        dataObj.active = 1;
                    }
                    for (let [field, value] of Object.entries(dataObj)) {
                        cols += `${field},`;
                        val += `?,`
                        if (['document', 'relative_ref', 'alt_mo_no'].includes(field)) {
                            value = JSON.stringify(value);
                        }
                        params.push(value);
                    }
                    cols = cols.slice(0, -1);
                    val = val.slice(0, -1);
                    let sql = `insert into ${table_name}(${cols}) values(${val})`;
                    this.run(sql, params).then((res) => {
                        let selectSql = this.fullListConfig[table_name];
                        selectSql += ` where ${table_name}._id = ${res.lastID}`;
                        if (this.dept_config_list.includes(table_name)) {
                            this.addToDeptConfig(table_name, res.lastID, dept_id);
                        }
                        this.localDB.get(selectSql, async (err, rows) => {
                            if (err) {
                                console.log({ sql: sql, err: err });
                                return reject(err);
                            }
                            return resolve(rows);
                        });
                    }, (err) => {
                        return reject(err);
                    });
                }
                else return reject('body is Empty.');
            }
            catch (ex) {
                return reject(ex);
            }
        });
    }

    update = async (tableName, dataObj, conditionString, callback) => {
        try {
            let params = [];
            let sql = `UPDATE ${tableName} SET `;
            for (let [field, value] of Object.entries(dataObj)) {
                sql += `${field} = ?,`;
                if (['document', 'relative_ref', 'alt_mo_no'].includes(field)) {
                    value = JSON.stringify(value);
                }
                params.push(value);
            }
            // sql = sql.slice(0, -1);
            sql += `updated_at = datetime('now', 'localtime')`;
            sql += ` where ${conditionString}`;
            await this.localDB.run(sql, params, async (err) => {
                if (err) {
                    console.log({ sql: sql, params: params, err: err });
                    return callback(err)
                }
                else {
                    sql = this.fullListConfig[tableName];
                    sql += (conditionString ? ` where ${conditionString}` : ``);
                    await this.localDB.get(sql, async (err, rows) => {
                        if (err) {
                            console.log(sql, err);
                            return callback(err);
                        }
                        return callback(null, rows);
                    });
                }
            });
        }
        catch (ex) {
            return callback(ex)
        }

    }

    updateMany = async (tableName, dataObj, conditionString, callback) => {
        try {
            let params = [];
            let sql = `UPDATE ${tableName} SET `;
            for (let [field, value] of Object.entries(dataObj)) {
                sql += `${field} = ?,`;
                if (['document', 'relative_ref', 'alt_mo_no'].includes(field)) {
                    value = JSON.stringify(value);
                }
                params.push(value);
            }
            // sql = sql.slice(0, -1);
            sql += `updated_at = datetime('now', 'localtime')`;
            sql += ` where ${conditionString}`;
            await this.localDB.run(sql, params, async (err) => {
                if (err) {
                    console.log({ sql: sql, params: params, err: err });
                    return callback(err)
                }
                else {
                    sql = this.fullListConfig[tableName];
                    sql += (conditionString ? ` where ${conditionString}` : ``);
                    await this.localDB.all(sql, async (err, rows) => {
                        if (err) {
                            console.log(sql, err);
                            return callback(err);
                        }
                        return callback(null, rows);
                    });
                }
            });
        }
        catch (ex) {
            return callback(ex)
        }

    }

    delete = async (tableName, conditionString, callback) => {
        try {
            let sql = `DELETE from ${tableName} where ${conditionString}`;
            await this.localDB.run(sql, function (err) {
                if (err) {
                    return callback(err)
                }
                return callback(null, this.changes);
            });
        }
        catch (ex) {
            return callback(ex)
        }

    }

    addToDeptConfig = async (tableName, Newid, dept_id) => {
        return new Promise((resolve, reject) => {
            let query = `update department_config set config_value = CASE WHEN(config_value = '') THEN ',' ELSE config_value END  || ? || ','
                        where dept_id = '${dept_id}' AND config_key = '${tableName}'`;
            this.run(query, [Newid]).then((data) => {
                return resolve(data || {})
            }, (err) => {
                console.log(query, err);
                return reject(err);
            });
        });
    }

    listForJawak = {
        item: `select * from item where _id in (select distinct item_id from aawak where remaining_qty > 0 and dept_id = ?)`,
        subitem: `select * from subitem where _id in (select distinct subitem_id from aawak where remaining_qty > 0 and dept_id = ?)`,
        subitem: `select * from product where _id in (select distinct product_id from aawak where remaining_qty > 0 and dept_id = ?)`
    }

    getListForJawak(list_name, dept_id) {
        return new Promise(async (resolve, reject) => {
            try {
                let sql = this.listForJawak[list_name];

                await this.localDB.all(sql, [dept_id], (err, data) => {
                    if (err) {
                        console.log(sql, err);
                        reject(err)
                    }
                    else {
                        resolve(data)
                    }
                })
            }
            catch (ex) {
                reject(ex);
            }
        });


    }


    fullListConfig = {

        point:`select * from point`,

        country: `select * from country`,
        countrysort: `country_hin, country_eng`,

        category: `select * from category`,
        categorysort: `category_hin, category_eng`,

        unit: `select * from unit`,
        unitsort: `unit_sort, unit_full`,

        support_list: `select * from support_list`,
        support_listsort: `list_name_hin, list_name_eng`,

        aawak_type: `select * from support_list where list_type = 'aawak_type'`,
        aawak_typesort: `list_name_hin, list_name_eng`,

        jawak_type: `select * from support_list where list_type = 'jawak_type'`,
        jawak_typesort: `list_name_hin, list_name_eng`,

        mm_type: `select * from support_list where list_type = 'mm_type'`,
        mm_typesort: `list_name_hin, list_name_eng`,

        gender: `select * from support_list where list_type = 'gender'`,
        gendersort: `list_name_hin, list_name_eng`,

        condition: `select * from support_list where list_type = 'condition'`,
        conditionsort: `list_name_hin, list_name_eng`,

        relation: `select * from support_list where list_type = 'relation'`,
        relationsort: `list_name_hin, list_name_eng`,

        status: `select * from support_list where list_type = 'status'`,
        statussort: `list_name_hin, list_name_eng`,

        department: `select * from department`,
        departmentsort: `dept_hin, dept_eng`,

        state: `select state.*, 
        cnt.country_hin, cnt.country_eng 
        from state 
        left join country cnt on cnt._id = state.country_id`,
        statesort: `state_hin, state_eng`,

        city: `select city.*, 
        st.state_hin, st.state_eng 
        from city
        left join state st on st._id=city.state_id`,
        citysort: `city_hin, city_eng`,

        mm: `select mm.*, 
        st.state_hin, st.state_eng, 
        pm.mm_hin as parent_mm_hin, pm.mm_eng as parent_mm_eng, pm.mm_code as parent_mm_code, 
        dept.dept_hin, dept.dept_eng, dept.dept_code 
        from mm
        left join state st on st._id = mm.state_id
        left join mm pm on pm._id = mm.parent_mm_id
        left join department dept on dept._id = mm.dept_id`,
        mmsort: `mm_hin, mm_eng`,

        item: `select item.*, 
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short 
        from item
        left join category cat on cat._id = item.category_id
        left join unit on unit._id = item.unit_id`,
        itemsort: `item_hin, item_eng`,

        itemMix: `select item.*, 
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short ,
        json_group_array(JSON('{"_id": ' || si._id || ', "item_id": ' || si.item_id || ', "subitem_list_id": ' || si.subitem_list_id || ', "subitem_hin": "' ||sl.subitem_hin || '", "subitem_eng": "' ||sl.subitem_eng || '", "category_hin": "' || ct.category_hin || '", "category_eng": "' || ct.category_eng || '", "unit_full": "' || ut.unit_full || '", "unit_short": "' || ut.unit_short || '", "category_id": ' || si.category_id || ', "unit_id": ' || si.unit_id || ', "active": ' || si.active || '}')) as subitems, json_group_array(si.category_id) as categories
        from item
        left join category cat on cat._id = item.category_id
        left join unit on unit._id = item.unit_id
        left join subitem si on si.item_id = item._id
        left join category ct on ct._id = si.category_id
        left join unit ut on ut._id = si.unit_id
        left join subitem_list sl on  sl._id = si.subitem_list_id group by item._id`,
        itemMixsort: `item_hin, item_eng`,

        subitem: `select subitem.*, 
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short, 
        item.item_eng, item.item_hin, 
        subitem_list.subitem_eng, subitem_list.subitem_hin 
        from subitem
        left join category cat on cat._id = subitem.category_id
        left join unit on unit._id = subitem.unit_id
        left join item on  item._id = subitem.item_id
        left join subitem_list on  subitem_list._id = subitem.subitem_list_id`,
        subitemsort: `subitem_hin, subitem_eng`,

        subitem_list: `select * from subitem_list`,
        subitem_listsort: `subitem_hin, subitem_eng`,

        department_config: `select department_config.*, 
        dept.dept_hin, dept.dept_eng, dept.dept_code 
        from department_config 
        left join department dept on dept._id  = department_config.dept_id`,

        pbk: `select pbk.*, 
        state.state_hin,state.state_eng, 
        city.city_hin,city.city_eng, 
        mm.mm_hin, mm.mm_eng, mm.mm_code
        from pbk 
        left join state on state._id = pbk.state_id
        left join city on city._id = pbk.city_id
        left join mm on mm._id = pbk.class_mm_id`,
        pbksort: `roll_no`,

        product: `select product.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code, 
        item.item_hin,item.item_eng,item.item_code,
        subitem_list.subitem_hin,subitem_list.subitem_eng,
        support_list.list_name_hin as condition_hin,support_list.list_name_eng as condition_eng
        from product 
        left join mm on mm._id = product.mm_id
        left join item on item._id = product.item_id
        left join subitem on subitem._id = product.subitem_id
        left join subitem_list on subitem_list._id = subitem.subitem_list_id
        left join support_list on support_list._id = product.condition_id`,
        productsort: `purchase_date, mm_hin, mm_eng, item_hin, item_eng, subitem_hin, subitem_eng`,

        aawak: `select aawak.*, 
        mm.mm_hin,mm.mm_eng,mm.mm_code,
        amm.mm_hin as aawak_mm_hin, amm.mm_eng as aawak_mm_eng, amm.mm_code as aawak_mm_code, 
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name,
        item.item_hin, item.item_eng, item.item_code,
        sil.subitem_hin, sil.subitem_eng,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        unit.unit_short, unit.unit_full,
        slat.list_name_hin as aawak_type_hin, slat.list_name_eng as aawak_type_eng
        from aawak 
        left join mm on mm._id = aawak.mm_id
        left join pbk on pbk._id = aawak.pbk_id
        left join mm amm on amm._id = aawak.aawak_mm_id
        left join item on item._id = aawak.item_id
        left join subitem si on si._id = aawak.subitem_id
        left join subitem_list sil on sil._id = si.subitem_list_id
        left join product on product._id = aawak.product_id
        left join support_list sl on sl._id = aawak.condition_id
        left join unit on unit._id = aawak.unit_id
        left join department dept on dept._id = aawak.dept_id
        left join support_list slat on slat._id = aawak.aawak_type_id`,
        aawaksort: `date, aawak_mm_hin, aawak_mm_eng, pkt_num`,

        jawak: `select jawak.*,
        amm.mm_hin,amm.mm_eng,amm.mm_code,
        jmm.mm_hin as jawak_mm_hin, jmm.mm_eng as jawak_mm_eng, jmm.mm_code as jawak_mm_code,
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation,
        it.item_hin, it.item_eng, it.item_code,
        sil.subitem_hin, sil.subitem_eng,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        unit.unit_short, unit.unit_full,
        jsl.list_name_hin as jawak_type_hin, jsl.list_name_eng as jawak_type_eng 
        from jawak
        left join mm amm on amm._id = jawak.mm_id 
        left join pbk on pbk._id = jawak.pbk_id
        left join mm jmm on jmm._id = jawak.jawak_mm_id
        left join item it on it._id = jawak.item_id
        left join subitem si on si._id = jawak.subitem_id
        left join subitem_list sil on sil._id = si.subitem_list_id
        left join product pd on pd._id = jawak.product_id
        left join support_list sl on sl._id = jawak.condition_id 
        left join support_list jsl on jsl._id = jawak.jawak_type_id
        left join unit on unit._id = jawak.unit_id
        left join department dept on dept._id = jawak.dept_id`,
        jawaksort: `date, jawak_mm_hin, jawak_mm_eng, pkt_num`,

        bachat: `select bachat.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code,        
        it.item_hin, it.item_eng, it.item_code,
        sil.subitem_hin, sil.subitem_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        unit.unit_short, unit.unit_full
        from bachat
        left join mm on mm._id = bachat.mm_id
        left join item it on it._id = bachat.item_id
        left join subitem si on si._id = bachat.subitem_id
        left join subitem_list sil on sil._id = si.subitem_list_id
        left join unit on unit._id = bachat.unit_id
        left join department dept on dept._id = bachat.dept_id`,
        bachatsort: `mm_hin, mm_eng, item_hin, subitem_hin, item_eng, subitem_eng, unit.unit_short`,

        bachat_history: ``,

        sitem: `select * from sitem`

    };

    fullListQuery = {

        point: `select * from point ?`,

        country: `select * from country ?`,
        countrysort: `country_hin, country_eng`,

        category: `select * from category ?`,
        categorysort: `category_hin, category_eng`,

        unit: `select * from unit ?`,
        unitsort: `unit_sort, unit_full`,

        support_list: `select * from support_list ?`,
        support_listsort: `list_name_hin, list_name_eng`,

        aawak_type: `select * from support_list where list_type = 'aawak_type'`,
        aawak_typesort: `list_name_hin, list_name_eng`,

        jawak_type: `select * from support_list where list_type = 'jawak_type'`,
        jawak_typesort: `list_name_hin, list_name_eng`,

        mm_type: `select * from support_list where list_type = 'mm_type'`,
        mm_typesort: `list_name_hin, list_name_eng`,

        gender: `select * from support_list where list_type = 'gender'`,
        gendersort: `list_name_hin, list_name_eng`,

        condition: `select * from support_list where list_type = 'condition'`,
        conditionsort: `list_name_hin, list_name_eng`,

        relation: `select * from support_list where list_type = 'relation'`,
        relationsort: `list_name_hin, list_name_eng`,

        status: `select * from support_list where list_type = 'status'`,
        statussort: `list_name_hin, list_name_eng`,

        department: `select * from department ?`,
        departmentsort: `dept_hin, dept_eng`,

        state: `select state.*, 
        cnt.country_hin, cnt.country_eng 
        from state 
        left join country cnt on cnt._id = state.country_id ?`,
        statesort: `state_hin, state_eng`,

        city: `select city.*, 
        st.state_hin, st.state_eng 
        from city
        left join state st on st._id=city.state_id ?`,
        citysort: `city_hin, city_eng`,

        mm: `select mm.*, 
        st.state_hin, st.state_eng, 
        pm.mm_hin as parent_mm_hin, pm.mm_eng as parent_mm_eng, pm.mm_code as parent_mm_code, 
        dept.dept_hin, dept.dept_eng, dept.dept_code, 
        nmt.pbk_hin as nimmit_hin, nmt.pbk_eng as nimmit_eng, nmt.relative_name, nmt.state_id as nimmit_state_id, pst.state_hin as nimmit_state_hin, pst.state_eng as nimmit_state_eng
        from mm
        left join state st on st._id = mm.state_id
        left join mm pm on pm._id = mm.parent_mm_id
        left join department dept on dept._id = mm.dept_id
        left join pbk nmt on nmt._id = mm.nimmit_id
        left join state pst on pst._id = nmt.state_id ?`,
        mmsort: `mm_hin, mm_eng`,

        item: `select item.*, 
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short 
        from item
        left join category cat on cat._id = item.category_id
        left join unit on unit._id = item.unit_id ?`,
        itemsort: `item_hin, item_eng`,

        itemMix: `select item.*, 
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short ,
        json_group_array(JSON('{"_id": ' || si._id || ', "item_id": ' || si.item_id || ', "subitem_list_id": ' || si.subitem_list_id || ', "subitem_hin": "' ||sl.subitem_hin || '", "subitem_eng": "' ||sl.subitem_eng || '", "category_hin": "' || ct.category_hin || '", "category_eng": "' || ct.category_eng || '", "unit_full": "' || ut.unit_full || '", "unit_short": "' || ut.unit_short || '", "category_id": ' || si.category_id || ', "unit_id": ' || si.unit_id || ', "active": ' || si.active || '}')) as subitems, json_group_array(si.category_id) as categories
        from item
        left join category cat on cat._id = item.category_id
        left join unit on unit._id = item.unit_id
        left join subitem si on si.item_id = item._id
        left join category ct on ct._id = si.category_id
        left join unit ut on ut._id = si.unit_id
        left join subitem_list sl on  sl._id = si.subitem_list_id ? group by item._id`,
        itemMixsort: `item_hin, item_eng`,

        subitem: `select subitem.*, 
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short, 
        item.item_eng, item.item_hin, 
        subitem_list.subitem_eng, subitem_list.subitem_hin 
        from subitem
        left join category cat on cat._id = subitem.category_id
        left join unit on unit._id = subitem.unit_id
        left join item on  item._id = subitem.item_id
        left join subitem_list on  subitem_list._id = subitem.subitem_list_id ?`,
        subitemsort: `subitem_hin, subitem_eng`,

        subitem_list: `select * from subitem_list ?`,
        subitem_listsort: `subitem_hin, subitem_eng`,

        department_config: `select department_config.*, 
        dept.dept_hin, dept.dept_eng, dept.dept_code 
        from department_config 
        left join department dept on dept._id  = department_config.dept_id ?`,

        pbk: `select pbk.*, 
        state.state_hin,state.state_eng, 
        city.city_hin,city.city_eng, 
        mm.mm_hin, mm.mm_eng, mm.mm_code
        from pbk 
        left join state on state._id = pbk.state_id
        left join city on city._id = pbk.city_id
        left join mm on mm._id = pbk.class_mm_id ?`,
        pbksort: `roll_no`,

        product: `select product.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code, 
        item.item_hin,item.item_eng,item.item_code,
        subitem_list.subitem_hin,subitem_list.subitem_eng,
        support_list.list_name_hin as condition_hin,support_list.list_name_eng as condition_eng
        from product 
        left join mm on mm._id = product.mm_id
        left join item on item._id = product.item_id
        left join subitem on subitem._id = product.subitem_id
        left join subitem_list on subitem_list._id = subitem.subitem_list_id
        left join support_list on support_list._id = product.condition_id ?`,
        productsort: `purchase_date, mm_hin, mm_eng, item_hin, item_eng, subitem_hin, subitem_eng`,

        aawak: `select aawak.*, 
        mm.mm_hin,mm.mm_eng,mm.mm_code,
        amm.mm_hin as aawak_mm_hin, amm.mm_eng as aawak_mm_eng, amm.mm_code as aawak_mm_code, 
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation, pbk.relative_name,
        item.item_hin, item.item_eng, item.item_code,
        sil.subitem_hin, sil.subitem_eng,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        unit.unit_short, unit.unit_full,
        slat.list_name_hin as aawak_type_hin, slat.list_name_eng as aawak_type_eng,
        nmt.pbk_hin as nimmit_hin, nmt.pbk_eng as nimmit_eng, nmt.relative_name, nmt.state_id, pst.state_hin as nimmit_state_hin, pst.state_eng as nimmit_state_eng
        from aawak 
        left join mm on mm._id = aawak.mm_id
        left join pbk on pbk._id = aawak.pbk_id
        left join mm amm on amm._id = aawak.aawak_mm_id
        left join item on item._id = aawak.item_id
        left join subitem si on si._id = aawak.subitem_id
        left join subitem_list sil on sil._id = si.subitem_list_id
        left join product on product._id = aawak.product_id
        left join support_list sl on sl._id = aawak.condition_id
        left join unit on unit._id = aawak.unit_id
        left join department dept on dept._id = aawak.dept_id
        left join support_list slat on slat._id = aawak.aawak_type_id
        left join pbk nmt on nmt._id = mm.nimmit_id
        left join state pst on pst._id = nmt.state_id ?`,
        aawaksort: `date, aawak_mm_hin, aawak_mm_eng, pkt_num`,

        jawak: `select jawak.*,
        amm.mm_hin,amm.mm_eng,amm.mm_code,
        jmm.mm_hin as jawak_mm_hin, jmm.mm_eng as jawak_mm_eng, jmm.mm_code as jawak_mm_code,
        pbk.roll_no, pbk.pbk_hin, pbk.pbk_eng, pbk.relation,
        it.item_hin, it.item_eng, it.item_code,
        sil.subitem_hin, sil.subitem_eng,
        sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
        dept.dept_eng, dept.dept_hin, dept.dept_code,
        unit.unit_short, unit.unit_full,
        jsl.list_name_hin as jawak_type_hin, jsl.list_name_eng as jawak_type_eng 
        from jawak
        left join mm amm on amm._id = jawak.mm_id 
        left join pbk on pbk._id = jawak.pbk_id
        left join mm jmm on jmm._id = jawak.jawak_mm_id
        left join item it on it._id = jawak.item_id
        left join subitem si on si._id = jawak.subitem_id
        left join subitem_list sil on sil._id = si.subitem_list_id
        left join product pd on pd._id = jawak.product_id
        left join support_list sl on sl._id = jawak.condition_id 
        left join support_list jsl on jsl._id = jawak.jawak_type_id
        left join unit on unit._id = jawak.unit_id
        left join department dept on dept._id = jawak.dept_id ?`,
        jawaksort: `date, jawak_mm_hin, jawak_mm_eng, pkt_num`,
        // json_group_array(JSON('{ "bachat_type_id": ' || bachat.bachat_type_id || ', "bachat_type_hin": "' || sl.list_name_hin || '", "bachat_type_eng": "' || sl.list_name_eng || '", "qty": ' || bachat.qty || ', "unit": "' || unit.unit_short || '"}')) as bachat_qty,    
        bachat: `select bachat.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code, mm.state_id, st.state_hin, st.state_eng,      
        it.item_hin, it.item_eng, it.item_code, it.category_id as icat_id, cti.category_hin as icat_hin, cti.category_eng as icat_eng, 
        sil.subitem_hin, sil.subitem_eng, si.category_id as scat_id, cts.category_hin as scat_hin, cts.category_eng as scat_eng, 
        bachat.unit_id,unit.unit_short, unit.unit_full,             
        dept.dept_eng, dept.dept_hin, dept.dept_code
        from bachat
        left join mm on mm._id = bachat.mm_id
        left join item it on it._id = bachat.item_id
        left join subitem si on si._id = bachat.subitem_id
        left join subitem_list sil on sil._id = si.subitem_list_id
        left join unit on unit._id = bachat.unit_id
        left join category cti on cti._id = it.category_id
        left join category cts on cts._id = si.category_id
        left join state st on st._id = mm.state_id
        left join department dept on dept._id = bachat.dept_id ?`,
        bachatsort: `mm_hin, mm_eng, item_hin, subitem_hin, item_eng, subitem_eng, unit.unit_short`,

        bachatHome: `select bachat.*,
        mm.mm_hin,mm.mm_eng,mm.mm_code,        
        it.item_hin, it.item_eng, it.item_code,
        sil.subitem_hin, sil.subitem_eng,
        unit.unit_short, unit.unit_full,        
        dept.dept_eng, dept.dept_hin, dept.dept_code
        from bachat
        left join mm on mm._id = bachat.mm_id
        left join item it on it._id = bachat.item_id
        left join subitem si on si._id = bachat.subitem_id
        left join subitem_list sil on sil._id = si.subitem_list_id
        left join unit on unit._id = bachat.unit_id
        left join department dept on dept._id = bachat.dept_id ?`,
        bachatHomesort: `mm_hin, mm_eng, item_hin, subitem_hin, item_eng, subitem_eng, unit.unit_short`,

        bachat_history: ``,

        sitem: `select * from sitem`

    };

    fullListForConfig = {

        category: `select *, ? as chk from category`,

        unit: `select *, ? as chk from unit`,

        support_list: `select *, ? as chk from support_list`,

        aawak_type: `select *, ? as chk from support_list where list_type = 'aawak_type'`,

        jawak_type: `select *, ? as chk from support_list where list_type = 'jawak_type'`,

        mm_type: `select *, ? as chk from support_list where list_type = 'mm_type'`,

        gender: `select *, ? as chk from support_list where list_type = 'gender'`,

        condition: `select *, ? as chk from support_list where list_type = 'condition'`,

        relation: `select *, ? as chk from support_list where list_type = 'relation'`,

        status: `select *, ? as chk from support_list where list_type = 'status'`,

        department: `select *, ? as chk from department`,

        mm: `select mm.*, ? as chk, 
        st.state_hin, st.state_eng, 
        pm.mm_hin as parent_mm_hin, pm.mm_eng as parent_mm_eng, pm.mm_code as parent_mm_code, 
        dept.dept_hin, dept.dept_eng, dept.dept_code 
        from mm
        left join state st on st._id = mm.state_id
        left join mm pm on pm._id = mm.parent_mm_id
        left join department dept on dept._id = mm.dept_id`,

        itemMix: `select item.*,
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short ,
        json_group_array(JSON('{"_id": ' || si._id || ', "item_id": ' || si.item_id || ', "subitem_list_id": ' || si.subitem_list_id || ', "subitem_hin": "' ||sl.subitem_hin || '", "subitem_eng": "' ||sl.subitem_eng || '", "category_hin": "' || ct.category_hin || '", "category_eng": "' || ct.category_eng || '", "unit_full": "' || ut.unit_full || '", "unit_short": "' || ut.unit_short || '", "category_id": ' || si.category_id || ', "unit_id": ' || si.unit_id || ', "active": ' || si.active || '}')) as subitems, json_group_array(si.category_id) as categories
        from item
        left join category cat on cat._id = item.category_id
        left join unit on unit._id = item.unit_id
        left join subitem si on si.item_id = item._id
        left join category ct on ct._id = si.category_id
        left join unit ut on ut._id = si.unit_id
        left join subitem_list sl on  sl._id = si.subitem_list_id ? group by item._id`,

        item: `select item.*, ? as chk, 
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short 
        from item
        left join category cat on cat._id = item.category_id
        left join unit on unit._id = item.unit_id`,

        subitem: `select subitem.*, ? as chk, 
        cat.category_hin, cat.category_eng, 
        unit.unit_full, unit.unit_short, 
        item.item_eng, item.item_hin, 
        subitem_list.subitem_eng, subitem_list.subitem_hin 
        from subitem
        left join category cat on cat._id = subitem.category_id
        left join unit on unit._id = subitem.unit_id
        left join item on  item._id = subitem.item_id
        left join subitem_list on  subitem_list._id = subitem.subitem_list_id`,

        subitem_list: `select *, ? as chk from subitem_list`,


        pbk: `select pbk.*, ? as chk, 
        state.state_hin,state.state_eng, 
        city.city_hin,city.city_eng, 
        mm.mm_hin, mm.mm_eng, mm.mm_code
        from pbk 
        left join state on state._id = pbk.state_id
        left join city on city._id = pbk.city_id
        left join mm on mm._id = pbk.class_mm_id`,

    };

    genDeptDB = {

        point: `insert into point select * from mainDB.point`,
        insertDept: `insert into department select * from mainDB.department`,
        // insertDeptConfig: `insert into department_config select * from mainDB.department_config`,

        // insertDept: `insert into department select * from mainDB.department dept where (select dpc.config_value from mainDB.department_config dpc where dpc.dept_id = ? AND dpc.config_key = 'department') LIKE '%,'|| dept._id||',%'`,

        updateDeptConfig: `update department_config set config_value = (select config_value from mainDB.department_config dpc where dpc.dept_id = department_config.dept_id and dpc.config_key = department_config.config_key) where department_config.dept_id = ? OR (select depc.config_value from mainDB.department_config depc where depc.dept_id = ? AND depc.config_key = 'department') LIKE '%,'|| department_config.dept_id||',%'`,

        country: `insert into country select * from mainDB.country`,
        state: `insert into state select * from mainDB.state`,
        support_list: `insert into support_list select * from mainDB.support_list where list_type NOT IN ('aawak_type', 'jawak_type') OR (select config_value from department_config where dept_id = ? AND config_key = 'aj_type') LIKE '%,'||_id||',%'`,
        city: `insert into city select * from mainDB.city`,
        unit: `insert into unit select * from mainDB.unit`,

        category: `insert into category select * from mainDB.category where (select config_value from department_config where dept_id = ? AND config_key = 'category') LIKE '%,'||_id||',%'`,

        mm: `insert into mm select * from mainDB.mm where (select config_value from department_config where dept_id = ? AND config_key = 'mm') LIKE '%,'||_id||',%'`,

        item: `insert into item select * from mainDB.item where (select config_value from department_config where dept_id = ? AND config_key = 'item') LIKE '%,'||_id||',%'`,

        subitem_list: `insert into subitem_list select * from mainDB.subitem_list `,

        subitem: `insert into subitem select * from mainDB.subitem where (select config_value from department_config where dept_id = ? AND config_key = 'subitem') LIKE '%,'||_id||',%'`,

        pbk: `insert into pbk select * from mainDB.pbk where (select config_value from department_config where dept_id = ? AND config_key = 'pbk') LIKE '%,'|| pbk._id||',%'`,

        product: `insert into product select * from mainDB.product where dept_id = ?`,
        aawak: `insert into aawak select * from mainDB.aawak where dept_id = ?`,
        jawak: `insert into jawak select * from mainDB.jawak where dept_id = ?`,

        // bachat: `insert into bachat select * from mainDB.bachat where dept_id = ?`,
    }

    genUpdtDB = {

        point: `insert into point select * from mainDB.point where active = 0`,
        insertDept: `insert into department select * from mainDB.department where active = 0 OR _id = ?`,
        // insertDeptConfig: `insert into department_config select * from mainDB.department_config`,

        // insertDept: `insert into department select * from mainDB.department dept where (select dpc.config_value from mainDB.department_config dpc where dpc.dept_id = ? AND dpc.config_key = 'department') LIKE '%,'|| dept._id||',%'`,

        updateDeptConfig: `update department_config set config_value = (select config_value from mainDB.department_config dpc where dpc.dept_id = department_config.dept_id and dpc.config_key = department_config.config_key) where department_config.dept_id = ? OR (select depc.config_value from mainDB.department_config depc where depc.dept_id = ? AND depc.config_key = 'department') LIKE '%,'|| department_config.dept_id||',%'`,

        country: `insert into country select * from mainDB.country where active = 0`,
        state: `insert into state select * from mainDB.state where active = 0`,
        support_list: `insert into support_list select * from mainDB.support_list where active = 0 AND (list_type NOT IN ('aawak_type', 'jawak_type') OR (select config_value from department_config where dept_id = ? AND config_key = 'aj_type') LIKE '%,'||_id||',%')`,
        city: `insert into city select * from mainDB.city where active = 0`,
        unit: `insert into unit select * from mainDB.unit where active = 0`,

        category: `insert into category select * from mainDB.category where active = 0 AND (select config_value from department_config where dept_id = ? AND config_key = 'category') LIKE '%,'||_id||',%' `,

        mm: `insert into mm select * from mainDB.mm where active = 0 AND (select config_value from department_config where dept_id = ? AND config_key = 'mm') LIKE '%,'||_id||',%'`,

        item: `insert into item select * from mainDB.item where active = 0 AND (select config_value from department_config where dept_id = ? AND config_key = 'item') LIKE '%,'||_id||',%'`,

        subitem_list: `insert into subitem_list select * from mainDB.subitem_list `,

        subitem: `insert into subitem select * from mainDB.subitem where active = 0 AND (select config_value from department_config where dept_id = ? AND config_key = 'subitem') LIKE '%,'||_id||',%'`,

        pbk: `insert into pbk select * from mainDB.pbk where active = 0 AND (select config_value from department_config where dept_id = ? AND config_key = 'pbk') LIKE '%,'|| pbk._id||',%'`,

        product: `insert into product select * from mainDB.product where dept_id = ? AND active = 0`,
        aawak: `insert into aawak select * from mainDB.aawak where dept_id = ? AND active = 0`,
        jawak: `insert into jawak select * from mainDB.jawak where dept_id = ? AND active = 0`,

        newid_country: `alter table country add column new_id integer`,
        newid_state: `alter table state add column new_id integer`,
        newid_support_list: `alter table support_list add column new_id integer`,
        newid_city: `alter table city add column new_id integer`,
        newid_unit: `alter table unit add column new_id integer`,
        newid_category: `alter table category add column new_id integer`,
        newid_mm: `alter table mm add column new_id integer`,
        newid_item: `alter table item add column new_id integer`,
        newid_subitem_list: `alter table subitem_list add column new_id integer`,
        newid_subitem: `alter table subitem add column new_id integer`,
        newid_pbk: `alter table pbk add column new_id integer`,
        // bachat: `insert into bachat select * from mainDB.bachat where dept_id = ?`,
    }
}
module.exports = new DBContex(); 