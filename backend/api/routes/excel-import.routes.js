const router = require('express').Router();
const fs = require('fs');
const DBContex = require('../models/DBContex');
const ExcelFunctions = require('../models/excelFunctions');
const { product } = require('../models/query');
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
        // jwk_usage_category
        correctionList.push(...DB.db.prepare(`select distinct json_extract(json_each.value, '$.usage_category') as name, 'category' as type, null as id, false as dictionary from temp_import, json_each(jawak_detail) where json_extract(json_each.value, '$.usage_category_id') IS NULL AND json_extract(json_each.value, '$.usage_category') IS NOT NULL`).all());

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
                    case 'category': stmt = DB.db.prepare(`select distinct _id, jawak_detail from temp_import, json_each(jawak_detail) where  json_extract(json_each.value, '$.usage_category_id') IS NULL AND json_extract(json_each.value, '$.usage_category') IS NOT NULL ;`);
                        type = 'usage_category';
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
                        data = data+'-01-01';
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
                    let id = null, name;
                    if (req.body.config[j].type != "array") {
                        name = data.trim().toLowerCase();
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
                        case 'item': id = await fn.matchItem(name);
                            break;
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
                    req.body.excelData[i][req.body.config[j].ref_field] = id;
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
        let result = await fn.verifyAndInsert(req.body.importType, req.body.excelData, req.body.headerList);
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



module.exports = router;