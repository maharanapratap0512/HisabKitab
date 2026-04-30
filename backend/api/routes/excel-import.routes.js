const router = require('express').Router();
const fs = require('fs');
const DBContex = require('../database/DBContex');
const ExcelFunctions = require('../database/excelFunctions');
const { product, subitem } = require('../database/query');
const Fn = require('../database/functions');
const DB = new DBContex();


//get all unmatched or correction list
router.get('/correction', async (req, res, next) => {
    try {
        let correctionList = [];
        // item
        correctionList.push(...DB.db.prepare(`select item as name, subitem as extra_note, 'item' as type, null as id, null as id2, false as dictionary from temp_import where (item IS NOT NULL AND item_id IS NULL) OR (subitem IS NOT NULL AND subitem_id IS NULL) group by item, subitem`).all());
        // mm
        correctionList.push(...DB.db.prepare(`select DISTINCT mm as name, 'mm' as type, null as id, false as dictionary from temp_import where mm IS NOT NULL AND mm_id IS NULL`).all());
        // pbk
        correctionList.push(...DB.db.prepare(`select DISTINCT pbk, 'pbk' as type, null as id, false as dictionary from temp_import where pbk IS NOT NULL AND pbk_id IS NULL`).all());
        // awk_type
        correctionList.push(...DB.db.prepare(`select DISTINCT aj_type as name, 'awk_type' as type, null as id, false as dictionary from temp_import where aj_type IS NOT NULL AND aj_type_id IS NULL AND temp_import.type='awk'`).all());
        // condition
        correctionList.push(...DB.db.prepare(`select DISTINCT condition as name, 'condition' as type, null as id, false as dictionary from temp_import where condition IS NOT NULL AND condition_id IS NULL`).all());
        // product
        correctionList.push(...DB.db.prepare(`select DISTINCT product as name, 'product' as type, null as id, false as dictionary from temp_import where product IS NOT NULL AND product_id IS NULL`).all());
        // awk_nimitt
        correctionList.push(...DB.db.prepare(`select DISTINCT nimitt as name, 'nimitt' as type, null as id, false as dictionary from temp_import where nimitt IS NOT NULL AND nimitt_id IS NULL`).all());
        // unit
        correctionList.push(...DB.db.prepare(`select DISTINCT unit as name, 'unit' as type, null as id, false as dictionary from temp_import where unit IS NOT NULL AND unit_id IS NULL`).all());
        //awk_mm
        correctionList.push(...DB.db.prepare(`select DISTINCT aj_mm as name, 'aj_mm' as type, null as id, false as dictionary from temp_import where aj_mm IS NOT NULL AND aj_mm_id IS NULL`).all());

        //jwk_mm        
        correctionList.push(...DB.db.prepare(`select distinct json_extract(json_each.value, '$.aj_mm') as name, 'aj_mm' as type, null as id, false as dictionary from temp_import, json_each(jawak_detail) where json_extract(json_each.value, '$.aj_mm_id') IS NULL AND json_extract(json_each.value, '$.aj_mm') IS NOT NULL`).all());
        // jwk_type
        correctionList.push(...DB.db.prepare(`select distinct json_extract(json_each.value, '$.aj_type') as name, 'jwk_type' as type, null as id, false as dictionary from temp_import, json_each(jawak_detail) where json_extract(json_each.value, '$.aj_type_id') IS NULL AND json_extract(json_each.value, '$.aj_type') IS NOT NULL`).all());
        // jwk_nimitt
        correctionList.push(...DB.db.prepare(`select distinct json_extract(json_each.value, '$.nimitt') as name, 'nimitt' as type, null as id, false as dictionary from temp_import, json_each(jawak_detail) where json_extract(json_each.value, '$.nimitt_id') IS NULL AND json_extract(json_each.value, '$.nimitt') IS NOT NULL`).all());
        // jwk_usage_list
        correctionList.push(...DB.db.prepare(`select distinct json_extract(json_each.value, '$.usage_list') as name, 'category' as type, null as id, false as dictionary from temp_import, json_each(jawak_detail) where json_extract(json_each.value, '$.usage_list_id') IS NULL AND json_extract(json_each.value, '$.usage_list') IS NOT NULL`).all());

        res.json({
            success: true,
            result: correctionList
        });

    }
    catch (err) {
        console.log(err);
    }
});

//  apply correction on unmatched or correction list
router.put('/correction', async (req, res, next) => {
    try {
        if (req.body && req.body.length > 0) {
            for (let i in req.body) {
                let type = null;
                let stmt = null;
                switch (req.body[i].type) {
                    case 'pbk': req.body[i].pbk = req.body[i].pbk ? JSON.stringify(req.body[i].pbk) : null;
                        break;
                    case 'aj_mm': stmt = DB.db.prepare(`select distinct _id, jawak_detail from temp_import, json_each(jawak_detail) where  json_extract(json_each.value, '$.aj_mm_id') IS NULL AND json_extract(json_each.value, '$.aj_mm') IS NOT NULL ;`);
                        type = 'aj_mm';
                        break;
                    case 'jwk_type': stmt = DB.db.prepare(`select distinct _id, jawak_detail from temp_import, json_each(jawak_detail) where  json_extract(json_each.value, '$.aj_type_id') IS NULL AND json_extract(json_each.value, '$.aj_type') IS NOT NULL ;`);
                        type = 'aj_type';
                        break;
                    case 'nimitt': stmt = DB.db.prepare(`select distinct _id, jawak_detail from temp_import, json_each(jawak_detail) where  json_extract(json_each.value, '$.nimitt_id') IS NULL AND json_extract(json_each.value, '$.nimitt') IS NOT NULL ;`);
                        type = 'nimitt';
                        break;
                    case 'usage_list': stmt = DB.db.prepare(`select distinct _id, jawak_detail from temp_import, json_each(jawak_detail) where  json_extract(json_each.value, '$.usage_list_id') IS NULL AND json_extract(json_each.value, '$.usage_list') IS NOT NULL ;`);
                        type = 'usage_list';
                        break;
                }

                if (type && stmt) {
                    for (const row of stmt.all()) {
                        let obj = { _id: row._id, jawak_detail: [] }
                        obj.jawak_detail = JSON.parse(row.jawak_detail);
                        for (let j in obj.jawak_detail) {
                            if (obj.jawak_detail[j][type] == req.body[i].name) {
                                obj.jawak_detail[j][type + '_id'] = req.body[i].id;
                            }
                        }
                        obj.jawak_detail = JSON.stringify(obj.jawak_detail);
                        await DB.runQuery('excel_correction', 'update_jawak', { obj: obj });
                    }
                }
                if (req.body[i].type == 'item' && req.body[i].extra_note) {
                    let qname = 'update_subitem';
                    if (req.body[i].id && !req.body[i].id2) {
                        qname = 'update_ignore_subitem';
                    }
                    await DB.runQuery('excel_correction', qname, { obj: req.body[i] });
                } else {
                    console.log("req.body[i].type", req.body[i].type);
                    await DB.runQuery('excel_correction', 'update_' + req.body[i].type, { obj: req.body[i] });
                }
                if (req.body[i].dictionary) {
                    let obj = req.body[i];
                    if (obj.type != 'product') {
                        if (obj.type == 'pbk') {
                            obj.name = obj.pbk ? JSON.stringify(obj.pbk) : null;
                        }
                        if (obj.type != 'item') {
                            obj.extra_note = null;
                            obj.id2 = null;
                        }
                        await DB.insert('dictionary', req.body[i], null, false);
                    }
                }
            }
        }
        res.json({
            success: true,
            // result: req.body
        });
    } catch (err) {
        console.log(err); next(err)
    };
});

//  apply correction on unmatched or correction list
router.put('/ignore', async (req, res, next) => {
    try {
        let result = { success: false }
        if (req.body && req.body.name && ['nimitt', 'product'].includes(req.body.type)) {
            let rslt = DB.db.prepare(DB.query.excel_correction['ignore_' + req.body.type]).run(req.body);
            if (rslt.changes > 0) {
                result.success = true;
            }
        }
        else {
            result.success = false
            result.err = "requested data not matched to criteria."
        }
        res.json(result);
    } catch (err) {
        console.log(err); next(err)
    };
});

//  verify all reference columns
router.put('/verify/:dept_id', async (req, res, next) => {
    try {
        let refTableList = []
        for (let i in req.body.config) {
            if (req.body.config[i].ref_table && req.body.config[i].ref_field) {
                refTableList.push(req.body.config[i].ref_table);
            }
        }
        if (req.body.importType == "subitem") {

        }
        let fn = new ExcelFunctions(refTableList, req.params.dept_id);
        for (let i in req.body.excelData) {
            for (let j in req.body.config) {
                let data = req.body.excelData[i][req.body.config[j].name];
                if (req.body.config[j].type == 'date' && req.body.config[j].col_name == 'bhatti_date') {
                    if (typeof data == "number" && (data > 1970 && data < 2036)) {
                        data = data + '-01-01';
                    }
                    data = fn.setDateFormat(data);

                } else if (req.body.config[j].type == 'date') {
                    data = fn.setDateFormat(data);
                }
                if (req.body.config[j].type == 'unix_date') {
                    data = fn.setDateFormat(data);
                }
                req.body.excelData[i][req.body.config[j].name] = data;
                if (req.body.config[j].ref_table && (req.body.config[j].not_null || data)) {
                    let id = null, subitem_id = null, name;
                    if (data && req.body.config[j].type == "array" && typeof data == "string") {
                        name = data.split(',').map(v => v.trim()).filter(Boolean);
                    } else if (data && req.body.config[j].type != "array" && typeof data != "number") {
                        name = data.trim().toLowerCase().normalize('NFC');
                    } else {
                        name = data;
                    }
                    req.body.excelData[i][req.body.config[j].name] = name;

                    switch (req.body.config[j].ref_table) {
                        case 'mm': id = await fn.matchMMs(name);
                            break;
                        case 'country': id = await fn.matchCountry(name);
                            break;
                        case 'state': id = await fn.matchState(name);
                            break;
                        case 'district': id = await fn.matchDistrict(name);
                            break;
                        case 'city': id = await fn.matchCity(name);
                            break;
                        case 'category':
                            // console.log(name);
                            if (req.body.config[j].type == "array") {
                                id = await fn.matchCategories(name);
                            } else {
                                id = await fn.matchCategory(name);
                            }
                            break;
                        case 'unit': id = await fn.matchUnit(name);
                            break;
                        case 'subitem_list': id = await fn.matchSubitemList(name);
                            break;
                        case 'nimitt': id = await fn.matchNimitt(name);
                            break;
                        case 'pbk': id = await fn.matchPbk(name);
                            break;
                        case 'attribute': id = await fn.matchAttribute(name);
                            break;
                        case 'attributes_value': 
                            if (req.body.config[j].type == "array") {
                                id = await fn.matchAttributeValues(name);
                            } else {
                                id = await fn.matchAttributeValue(name);
                            }
                            break;
                        case 'item':
                            if (i == 6) {
                                req.body.excelData[i].log = true;
                            }
                            if (req.body.config[j].type == 'mix')
                                req.body.excelData[i] = await fn.matchItemMix(req.body.excelData[i]);
                            else
                                id = await fn.matchItem(name);
                            // let subitem = req.body.excelData[i].subitem;
                            // if (await req.body.config.some(c => c.col_name === 'subitem') && subitem) {
                            //     console.log("req.body.excelData[i].subitem", req.body.excelData[i].subitem);
                            //     if (typeof subitem == "string")
                            //         subitem = req.body.excelData[i].subitem.trim().toLowerCase();
                            //     subitem_id = await fn.matchSubitem(subitem, id);
                            // }
                            break;
                        // case 'subitem': let sl_id = await fn.matchSubitemList(name);
                        //     console.log("-------", sl_id, name);
                        //     if (sl_id && req.body.excelData[i].item_id) {
                        //         let data = {
                        //             item: req.body.excelData[i].item,
                        //             item_id: req.body.excelData[i].item_id,
                        //             subitem: req.body.excelData[i].subitem,
                        //             subitem_list_id: sl_id
                        //         }
                        //         id = await fn.matchSubitem(data);
                        //         console.log("-------", id, data);
                        //     }
                        //     break;
                        case 'condition': id = await fn.matchSupportList(name, 'condition');
                            break;
                        case 'aawak_type': id = await fn.matchSupportList(name, 'aawak_type');
                            break;
                        case 'gender': id = await fn.matchSupportList(name, 'gender', "list_name_eng");
                            break;
                        case 'relation': id = await fn.matchSupportList(name, 'relation', "list_name_eng");
                            break;
                        default:

                    }
                    req.body.excelData[i][req.body.config[j].ref_field] = req.body.excelData[i][req.body.config[j].ref_field] ? req.body.excelData[i][req.body.config[j].ref_field] : id;
                }
            }
        }
        res.json({
            success: true,
            excelData: req.body.excelData,
            correctionList: fn.correctionList
        });

    } catch (err) { console.log(err); next(err) };
});

//  verify all and insert
router.put('/final/:dept_id', async (req, res, next) => {
    try {
        let fn = new ExcelFunctions([], req.params.dept_id);
        let result;
        if (req.body.importType.name == 'variant') {
            const vs = require('../services/variant.service');
            let fdata = await fn.setFormData(fn.variant_form, req.body.excelData);
            result = await vs.bulkCreateVariants(fdata.item_id, [fdata], req.userData);
            result = { status: 'inserted', data: req.body.excelData, newData: result };
        } else if (req.body.importType.name == 'item') {
            const is = require('../services/item.service');
            let fdata = await fn.setFormData(fn.item_form, req.body.excelData);
            result = await is.bulkCreateItems([fdata], req.userData);
            result = { status: 'inserted', data: req.body.excelData, newData: result };
        } else {
            result = await fn.verifyAndInsert(req.body.importType, req.body.excelData, req.body.headerList);
        }
        res.json({
            success: true,
            result: result
        })
    } catch (err) { next(err) };
});

// update data
router.put('/update/:dept_id', async (req, res, next) => {
    try {
        let fn = new ExcelFunctions([], req.params.dept_id);
        let result = await fn.updateExcelData(req.body.importType, req.body.excelData);
        if (result.changes) {
            res.json({
                success: true,
                result: result
            })
        } else {
            res.json({
                success: false,
                result: result
            })
        }
    } catch (err) { next(err) };
});

router.post('/', async (req, res, next) => {
    if (req.body) {
        try {
            for (let i in req.body) {
                if (typeof req.body[i].date == "string") {
                    req.body[i].date = Fn.StringToDate(req.body[i].date).toISOString().split('T')[0];
                }
                else if (typeof req.body[i].date == "number") {
                    req.body[i].date = Fn.ExcelDateToJSDate(req.body[i].date).toISOString().split('T')[0];
                }
                req.body[i].type = 'awk';
                req.body[i].pbk = ((req.body[i].pbk && (req.body[i].pbk.roll_no || req.body[i].pbk.pbk || req.body[i].pbk.relation || req.body[i].pbk.relative)) ? JSON.stringify(req.body[i].pbk) : null);
                for (let j in req.body[i].jawak_detail) {
                    if (typeof req.body[i].jawak_detail[j].date == "string") {
                        req.body[i].jawak_detail[j].date = Fn.StringToDate(req.body[i].jawak_detail[j].date).toISOString().split('T')[0];
                    }
                    else if (typeof req.body[i].jawak_detail[j].date == "number") {
                        req.body[i].jawak_detail[j].date = Fn.ExcelDateToJSDate(req.body[i].jawak_detail[j].date).toISOString().split('T')[0];
                        // console.log("Exceldate", date);
                    }
                }
                req.body[i].jawak_detail = (req.body[i].jawak_detail ? JSON.stringify(req.body[i].jawak_detail) : JSON.stringify([]))

                console.log(req.body[i]);
                let result = await DB.insert('temp_import', req.body[i], null, false);
            }
            await DB.getCount('temp_import').then(async (resolve) => {
                res.json({
                    success: true,
                    total_count: resolve.total_count
                });
            });

        }
        catch (err) {
            return next(err);
        }
    }
});


router.post('/match_bachat/:dept_id', async (req, res, next) => {
    if (req.body && req.body.length > 0) {
        try {
            let placeholders = [], paramsdata = [];
            req.body.forEach((data, index) => {
                placeholders.push(`(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                paramsdata.push(data.date, data.sn, req.params.dept_id, data.mm_id, data.item_id, data.subitem_id ? data.subitem_id : 0, data.condition_id ? data.condition_id : 0, data.unit_id, data.qty, data.company_name, data.actual_amt, data.item_detail, data.description, data.nimitt_id);
            });

            // DB.db.prepare('delete from bachat_import').run();
            DB.db.prepare('drop table if exists bachat_import; ').run();

            let sql1 = `create table if not exists bachat_import
                (
                    _id integer primary key,
                    date date, 
                    sn varchar(50), 
                    dept_id integer,
                    mm_id integer, 
                    item_id integer, 
                    subitem_id integer default 0, 
                    condition_id integer default 0, 
                    unit_id integer, 
                    qty decimal(10, 2), 
                    company_name varchar(100), 
                    actual_amt decimal(10,2), 
                    item_detail text, 
                    description text, 
                    nimitt_id integer,
                    usage_list_id integer,
                    UNIQUE(dept_id, mm_id, item_id, unit_id, subitem_id, condition_id)
                )`;
            await DB.db.prepare(sql1).run();
            sql1 = `insert into bachat_import(date, sn, dept_id, mm_id, item_id, subitem_id, condition_id, unit_id, qty, company_name, actual_amt, item_detail, description, nimitt_id) 
                VALUES ${placeholders.join(', ')} ON CONFLICT(dept_id, mm_id, item_id, subitem_id, condition_id, unit_id) 
                DO UPDATE SET qty = qty + excluded.qty;`
            await DB.db.prepare(sql1).run(paramsdata);


            let sql = `WITH
                bcht(_id, dept_id, mm_id, item_id, subitem_id, condition_id, unit_id, bachat) AS (
                    select _id, dept_id, mm_id, item_id, subitem_id, condition_id, unit_id, SUM(bachat) as t_bachat from bachat_new bn
                    where bn.dept_id = ? group by mm_id, item_id, subitem_id, condition_id, unit_id
                ) 
                select bcht._id, bi.date, bi.sn, bi.dept_id, bi.mm_id, bi.item_id, bi.subitem_id, bi.condition_id, bi.unit_id, IFNULL(bi.qty, 0) as qty, IFNULL(bcht.bachat, 0) as bachat, CASE WHEN bcht._id IS NOT NULL THEN 'MATCH' ELSE 'EXCEL' END AS status, IFNULL(bi.qty, 0) - IFNULL(bcht.bachat, 0) as difference,
                bi.company_name, bi.actual_amt, bi.item_detail, bi.description, bi.nimitt_id,
                mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng,
                it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
                sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
                slc.list_name_hin as condition_hin, slc.list_name_eng as condition_eng,
                dept.dept_hin, dept.dept_eng, dept.dept_code,
                unit.unit_short, unit.unit_full from bachat_import bi
                LEFT JOIN bcht on bcht.mm_id = bi.mm_id AND bcht.item_id = bi.item_id AND IFNULL(bcht.subitem_id, 0) = IFNULL(bi.subitem_id, 0) AND IFNULL(bcht.condition_id, 0) = IFNULL(bi.condition_id, 0) AND bcht.unit_id = bi.unit_id
                LEFT JOIN mm on mm._id = bi.mm_id
                LEFT JOIN state st on st._id = mm.state_id
                LEFT JOIN item it on it._id = bi.item_id
                LEFT JOIN subitem sit on sit._id = bi.subitem_id
                LEFT JOIN subitem_list sitl on sitl._id = sit.subitem_list_id
                LEFT JOIN support_list slc on slc._id = bi.condition_id
                LEFT JOIN department dept on dept._id = bi.dept_id
                LEFT JOIN unit on unit._id = bi.unit_id order by status DESC`;

            let stmt = DB.db.prepare(sql).all(req.params.dept_id);


            let sqlDB = `WITH
                bcht(_id, dept_id, mm_id, item_id, subitem_id, condition_id, unit_id, bachat) AS (
                    select _id, dept_id, mm_id, item_id, subitem_id, condition_id, unit_id, SUM(bachat) as t_bachat from bachat_new bn
                    where bn.dept_id = ? group by mm_id, item_id, subitem_id, condition_id, unit_id HAVING t_bachat <> 0
                ) 
                select bcht._id, bcht.dept_id, bcht.mm_id, bcht.item_id, bcht.subitem_id, bcht.condition_id, bcht.unit_id, 0 AS qty, IFNULL(bcht.bachat, 0) as bachat, 'DB' AS status, 0 - IFNULL(bcht.bachat, 0) as difference, 
                mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng,
                it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
                sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
                slc.list_name_hin as condition_hin, slc.list_name_eng as condition_eng,
                dept.dept_hin, dept.dept_eng, dept.dept_code,
                unit.unit_short, unit.unit_full from bcht 
                LEFT JOIN mm on mm._id = bcht.mm_id
                LEFT JOIN state st on st._id = mm.state_id
                LEFT JOIN item it on it._id = bcht.item_id
                LEFT JOIN subitem sit on sit._id = bcht.subitem_id
                LEFT JOIN subitem_list sitl on sitl._id = sit.subitem_list_id
                LEFT JOIN support_list slc on slc._id = bcht.condition_id
                LEFT JOIN department dept on dept._id = bcht.dept_id
                LEFT JOIN unit on unit._id = bcht.unit_id
                WHERE NOT EXISTS ( SELECT 1 FROM bachat_import bi 
                        WHERE bi.mm_id = bcht.mm_id AND bi.item_id = bcht.item_id AND IFNULL(bi.subitem_id, 0) = IFNULL(bcht.subitem_id, 0) AND IFNULL(bi.condition_id, 0) = IFNULL(bcht.condition_id, 0) AND bi.unit_id = bcht.unit_id)`;
            let stmtDB = DB.db.prepare(sqlDB).all(req.params.dept_id);

            res.json({
                success: true,
                resultED: stmt,
                resultDB: stmtDB,
            })
        }
        catch (err) {
            return next(err);
        }
    } else {
        return next(new Error("no data found, please solve all corrections first."))
    }
});


router.put('/final_bachat/:dept_id', async (req, res, next) => {
    if (req.body) {
        try {
            await Fn.begin();
            let obj, op, result;
            if (req.body.difference > 0) {
                // do aawak entry
                op = 'aawak';
                obj = DB.tbInterface.getAawakFromBachatImport(req.body);
                await Fn.insertAJ(obj, 'aawak').then(async (rs) => {
                    await DB.getList('aawak', { full: true, conditionString: ` aawak._id = ${rs}` }).then(async (data) => {
                        for (let i in data.data) {
                            data.data[i].document = (data.data[i].document ? JSON.parse(data.data[i].document) : {});
                            data.data[i].isbill = data.data[i].isbill ? true : false;
                        }
                        result = data.data
                    });
                });

            } else if (req.body.difference < 0) {
                // do jawak entry
                op = 'jawak'
                obj = DB.tbInterface.getJawakFromBachatImport(req.body);
                let jwkQty = obj.qty;
                let newIds = [], conditionString = `remaining_qty <> 0 AND mm_id = ${obj.mm_id} AND item_id = ${obj.item_id} AND IFNULL(subitem_id, 0) = IFNULL(${obj.subitem_id}, 0) AND IFNULL(condition_id, 0) = IFNULL(${obj.condition_id}, 0) AND unit_id = ${obj.unit_id}`
                await DB.getList('aawak', { conditionString: conditionString, order: ` date desc` }).then(async (data) => {
                    for (let i in data.data) {
                        obj.aawak_ref_id = data.data[i]._id;
                        if (jwkQty > data.data[i].remaining_qty) {
                            obj.qty = data.data[i].remaining_qty;
                            jwkQty = jwkQty - obj.qty;
                        }
                        await Fn.insertAJ(obj, 'jawak').then(async (rs) => {
                            newIds.push(rs);
                        });
                        obj.qty = jwkQty;
                    }
                    await DB.getList('aawak', { full: true, conditionString: ` aawak._id in (${newIds.join(',')})` }).then(async (data) => {
                        for (let i in data.data) {
                            data.data[i].document = (data.data[i].document ? JSON.parse(data.data[i].document) : {});
                            data.data[i].isbill = data.data[i].isbill ? true : false;
                        }
                        result = data.data
                    });
                    result = data.data
                });
            } else {

            }
            await Fn.commit();
            res.json({
                success: true,
                status: op,
                result: result
            });
        }
        catch (err) {
            // console.log(err.message);
            await Fn.rollback();
            res.json({
                success: false,
                error: err.message,
            })
        }

    } else {
        return next(new Error("no data found, please solve all corrections first."))
    }
});





module.exports = router;