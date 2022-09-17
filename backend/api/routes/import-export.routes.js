const router = require('express').Router();
const fs = require('fs');
const DBContex = require('../models/DBContex');
const Fn = require('../models/functions');
const { product } = require('../models/query');
const DB = new DBContex();



//  get tempimport data
// router.get('/', async (req, res, next) => {
//     DB.getList('temp_import', { conditionString: `type = 'awk'` }).then(async (result) => {
//         for (let i in result.data) {
//             result.data[i].pbk = result.data[i].pbk ? JSON.parse(result.data[i].pbk) : {};
//             await DB.getList('temp_import', { conditionString: `ref_id=${result.data[i]._id}` }).then(async (jwk) => {
//                 result.data[i].jawak_detail = jwk.data;
//             });
//         }
//         res.json({
//             success: true,
//             result: result.data,
//             total_count: result.total_count
//         });
//     }, (reject) => {
//         next(reject);
//     });
// });

//  get full temp import data
router.get('/', async (req, res, next) => {
    DB.getList('temp_import', { full: true, conditionString: `type = 'awk'` }).then(async (result) => {
        for (let i in result.data) {
            result.data[i].pbk = result.data[i].pbk ? JSON.parse(result.data[i].pbk) : {};
            result.data[i].jawak_detail = JSON.parse(result.data[i].jawak_detail);
            // await DB.getList('temp_import', { full: true, conditionString: `ref_id=${result.data[i]._id}` }).then(async (jwk) => {
            //     result.data[i].jawak_detail = jwk.data;
            // });
        }
        res.json({
            success: true,
            result: result.data,
            total_count: result.total_count
        });
    }, (reject) => {
        next(reject);
    });
});

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
                if (req.body[i].type == 'item' && req.body[i].subitem) {
                    await DB.runQuery('excel_correction', 'update_subitem', { obj: req.body[i] });
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

//  final import
router.put('/final', async (req, res, next) => {
    try {
        for (let row of req.body) {
            // if (typeof row.date == "string") {
            //     row.date = Fn.StringToDate(row.date);
            // }
            // else if (typeof row.date == "number") {
            //     row.date = Fn.ExcelDateToJSDate(row.date)
            //     console.log("Exceldate", date);
            // }
            DB.insert('aawak', {
                date: row.date, mm_id: row.mm_id, pkt_num: row.pkt_num, pbk_id: row.pbk_id, aawak_mm_id: row.aj_mm_id,
                item_id: row.item_id, subitem_id: row.subitem_id, product_id: row.product_id, item_detail: null,
                condition_id: row.condition_id, qty: row.qty, rate: row.rate, actual_amt: row.actual_amt,
                aawak_type_id: row.aj_type_id, unit_id: row.unit_id, description: null, nimitt_id: row.nimitt_id,
                dept_id: row.dept_id, company_name: row.company_name, isbill: row.isbill, document: null
            }, null, false).then((data) => {
                if (data) {
                    for (let jwk of row.jawak_detail) {
                        DB.insert('jawak', {
                            date: jwk.date ? jwk.date : row.date, mm_id: row.mm_id, pkt_num: jwk.pkt_num,
                            pbk_id: jwk.pbk_id ? jwk.pbk_id : null, jawak_mm_id: jwk.aj_mm_id, item_id: row.item_id,
                            subitem_id: row.subitem_id, product_id: row.product_id, item_detail: null,
                            condition_id: jwk.condition_id, qty: jwk.qty, jawak_type_id: jwk.aj_type_id,
                            unit_id: row.unit_id, description: null, nimitt_id: jwk.nimitt_id, company_name: row.company_name, aawak_ref_id: data, dept_id: row.dept_id
                        }, null, false);
                    }
                }
            });
        }
        await DB.runQuery('temp_import', 'delete');
        res.json({
            success: true
        });

    } catch (err) { next(err) };
});

//get all updated list
router.put('/updates/:dept_id', async (req, res, next) => {
    try {
        let lists = {}

        if (req.params.dept_id) {
            lists.country = await DB.getList('country', { dept_id: req.params.dept_id, conditionString: `country.active = 0` }) || []
            lists.state = await DB.getList('state', { dept_id: req.params.dept_id, conditionString: `state.active = 0` }) || []
            lists.city = await DB.getList('city', { dept_id: req.params.dept_id, conditionString: `city.active = 0` }) || []
            lists.unit = await DB.getList('unit', { dept_id: req.params.dept_id, conditionString: `unit.active = 0` }) || []
            lists.support_list = await DB.getList('support_list', { dept_id: req.params.dept_id, conditionString: `support_list.active = 0` }) || []
            lists.category = await DB.getList('category', { dept_id: req.params.dept_id, conditionString: `category.active = 0` }) || []
            lists.mm = await DB.getList('mm', { dept_id: req.params.dept_id, conditionString: `mm.active = 0` }) || []
            lists.item = await DB.getList('item', { dept_id: req.params.dept_id, conditionString: `item.active = 0` }) || []
            lists.subitem = await DB.getList('subitem', { dept_id: req.params.dept_id, conditionString: `subitem.active = 0` }) || []
            lists.subitem_list = await DB.getList('subitem_list', { dept_id: req.params.dept_id, conditionString: `subitem_list.active = 0` }) || []
            lists.pbk = await DB.getList('pbk', { dept_id: req.params.dept_id, conditionString: `pbk.active = 0` }) || []
            lists.pbk = await DB.getList('nimitt', { dept_id: req.params.dept_id, conditionString: `nimitt.active = 0` }) || []
            lists.product = await DB.getList('product', { dept_id: req.params.dept_id, conditionString: `product.active = 0` }) || []
            lists.aawak = await DB.getList('aawak', { dept_id: req.params.dept_id, conditionString: `aawak.active = 0` }) || []
            lists.jawak = await DB.getList('jawak', { dept_id: req.params.dept_id, conditionString: `jawak.active = 0` }) || []
            lists.point = await DB.getList('point', { dept_id: req.params.dept_id, conditionString: `point.active = 0` }) || []
            lists.department = await DB.getList('department', { conditionString: ` department._id = ${req.params.dept_id}` }) || []
            lists.department_config = await DB.getList('department_config', { conditionString: ` department_config.dept_id = ${req.params.dept_id}` }) || []
            lists.dictionary = await DB.getList('dictionary', { dept_id: req.params.dept_id, conditionString: `dictionary.active = 0` }) || []
            lists.merge_history = await DB.getList('merge_history', { dept_id: req.params.dept_id, conditionString: `merge_history.active = 0` }) || []
            res.json({
                success: true,
                result: lists
            })
        }
        else {
            res.json({
                success: true,
                result: lists
            })
        }
    } catch (err) { next(err) };
});

//get all updated list
router.get('/update_lists/:dept_id', async (req, res, next) => {
    try {
        let lists = {}

        if (req.params.dept_id) {
            lists.country = await DB.getList('country') || []
            lists.state = await DB.getList('state') || []
            lists.city = await DB.getList('city') || []
            lists.unit = await DB.getList('unit') || []
            lists.support_list = await DB.getList('support_list') || []
            lists.category = await DB.getList('category') || []
            lists.mm = await DB.getList('mm') || []
            lists.item = await DB.getList('item') || []
            lists.subitem = await DB.getList('subitem') || []
            lists.subitem_list = await DB.getList('subitem_list') || []
            lists.pbk = await DB.getList('pbk', { dept_id: req.params.dept_id }) || []
            lists.nimitt = await DB.getList('nimitt', { dept_id: req.params.dept_id }) || []
            // lists.product = await DB.getList('product', { dept_id: req.params.dept_id }) || []
            // lists.aawak = await DB.getList('aawak', { dept_id: req.params.dept_id }) || []
            // lists.jawak = await DB.getList('jawak', { dept_id: req.params.dept_id }) || []
            lists.point = await DB.getList('point') || []
            lists.department = await DB.getList('department') || []
            lists.department_config = await DB.getList('department_config', { conditionString: ` department_config.dept_id = ${req.params.dept_id}` }) || []
            lists.dictionary = await DB.getList('dictionary') || []
            lists.merge_history = await DB.getList('merge_history', { dept_id: req.params.dept_id }) || []
            res.json({
                success: true,
                result: lists
            })
        }
        else {
            res.json({
                success: true,
                result: lists
            })
        }
    } catch (err) { next(err) };
});

router.put('/update_apply/:dept_id', async (req, res, next) => {
    try {

        if (req.body.type && req.body.data) {
            let total_count = 0;
            let new_entries = [];
            let update_entries = [];
            let insert = DB.db.transaction(async (tblname, data) => {
                try {                    
                    const insert_stmt = DB.db.prepare(DB.query[tblname].insert_ignore);
                    const update_stmt = DB.db.prepare(DB.query[tblname].import_update);
                    for (let i in data) {
                        if(!data[i]._id){
                            data[i]._id = null;
                        }
                        if(tblname=="item" || tblname=="subitem" ){
                            data[i].categories = JSON.parse(data[i].categories ? data[i].categories : "[]");
                            data[i].categories = data[i].categories.filter(c=>c);
                            data[i].categories = JSON.stringify(data[i].categories);
                            data[i].active = 1;


                        }
                        // let updt_res = update_stmt.run(data[i]);
                        // // console.log("updt_res", updt_res);
                        // if (updt_res) {
                        //     if (updt_res.changes > 0) {
                        //         update_entries.push(data[i]);
                        //     }
                        // }

                        let res = insert_stmt.run(data[i]);
                        // console.log("res", res);
                        if (res) {
                            total_count++;
                            if (res.changes > 0) {
                                new_entries.push(data[i]);
                            }
                        }                        
                    }
                    res.json({
                        type: tblname,
                        total_count: total_count,
                        new_entries: new_entries,
                        update_entries: update_entries,
                        columns: data.length > 0 ? Object.keys(data[0]) : []
                    })
                }
                catch (ex) {
                    console.log(ex);
                    return next(ex);
                }
            });

            insert(req.body.type, req.body.data);

        }
    }
    catch (err) {
        return next(err);
    }
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
                    // console.log("Exceldate", date);
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

// tempimport delete
router.delete('/all', async (req, res, next) => {
    try {
        await DB.deleteMany('temp_import').then((data) => {
            res.json({
                success: true,
                result: data
            });
        })

    } catch (err) { next(err) };
});


module.exports = router;