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
        //category        
        correctionList.push(...DB.db.prepare(`select distinct json_extract(json_each.value, '$.usage_category') as name, 'category' as type, null as id, false as dictionary from temp_import, json_each(jawak_detail) where json_extract(json_each.value, '$.usage_category_id') IS NULL AND json_extract(json_each.value, '$.usage_category') IS NOT NULL`).all());
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
                    case 'usage_category': stmt = DB.db.prepare(`select distinct _id, jawak_detail from temp_import, json_each(jawak_detail) where  json_extract(json_each.value, '$.usage_category_id') IS NULL AND json_extract(json_each.value, '$.usage_category') IS NOT NULL ;`);
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
        if (req.body && req.body.name && req.body.type == "product") {
            let rslt = DB.db.prepare(DB.query.excel_correction['ignore_product']).run(req.body);
            if (rslt.changes > 0) {
                result.success = true;
            }
        } else if (req.body && req.body.name && req.body.type == "nimitt") {
            let rslt = await DB.db.prepare(DB.query.excel_correction.ignore_nimitt).run(req.body);
            let jwkrslt = await DB.db.prepare(DB.query.excel_correction.ignore_jwk_nimitt).run(req.body);
            if (rslt.changes > 0 || jwkrslt.changes > 0) {
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

//  process import Records
router.put('/process', async (req, res, next) => {
    if (req.body.data) {
        try {
            let awkData = req.body.data;
            if (req.body.data.awk_id) {
                req.body.data.ignored = true;
                awkData.ignored = true;
            } else {
                await Fn.begin();
                let awkObj = {
                    date: awkData.date, mm_id: awkData.mm_id, pkt_num: awkData.pkt_num, pbk_id: awkData.pbk_id, aawak_mm_id: awkData.aj_mm_id, item_id: awkData.item_id, subitem_id: awkData.subitem_id, product_id: awkData.product_id, item_detail: awkData.item_detail, condition_id: awkData.condition_id, qty: awkData.qty, rate: awkData.rate, actual_amt: awkData.actual_amt, aawak_type_id: awkData.aj_type_id, unit_id: awkData.unit_id, description: awkData.description, nimitt_id: awkData.nimitt_id, dept_id: awkData.dept_id, company_name: awkData.company_name, isbill: awkData.isbill, document: null, usage_category_id: awkData.usage_category_id, usage_category: awkData.usage_category, is_xl: 1, is_auto_pd: 0
                };
                await Fn.insertAJ(awkObj, 'aawak').then(async (resolve) => {
                    awkData.awk_id = resolve;
                    await Fn.commit();
                }, (err) => {
                    throw err;
                });
            }

            for (let i in awkData.jawak_detail) {
                await Fn.begin();
                let jwkObj = {
                    date: awkData.jawak_detail[i].date ? awkData.jawak_detail[i].date : awkData.date,
                    mm_id: awkData.mm_id,
                    pkt_num: awkData.jawak_detail[i].pkt_num,
                    pbk_id: awkData.jawak_detail[i].pbk_id ? awkData.jawak_detail[i].pbk_id : null,
                    jawak_mm_id: awkData.jawak_detail[i].aj_mm_id,
                    item_id: awkData.item_id,
                    subitem_id: awkData.subitem_id,
                    product_id: awkData.product_id,
                    item_detail: null,
                    condition_id: awkData.condition_id,
                    qty: awkData.jawak_detail[i].qty,
                    rate: awkData.jawak_detail[i].rate,
                    actual_amt: awkData.jawak_detail[i].actual_amt,
                    jawak_type_id: awkData.jawak_detail[i].aj_type_id,
                    unit_id: awkData.unit_id,
                    description: awkData.jawak_detail[i].description,
                    parchi_place: awkData.jawak_detail[i].parchi_place ? awkData.jawak_detail[i].parchi_place : null,
                    sell_repair_place: awkData.jawak_detail[i].sell_repair_place ? awkData.jawak_detail[i].sell_repair_place : null,
                    nimitt_id: awkData.jawak_detail[i].nimitt_id,
                    company_name: awkData.company_name,
                    aawak_ref_id: awkData.awk_id,
                    dept_id: awkData.dept_id,
                    usage_category_id: awkData.jawak_detail[i].usage_category_id,
                    is_xl: 1,
                }
                await Fn.insertAJ(jwkObj, 'jawak').then(async (jwkResult) => {
                    awkData.jawak_detail[i]._id = jwkResult;
                    await Fn.commit();
                }, async (err) => {
                    console.log(err);
                    await Fn.rollback();
                    awkData.jawak_detail[i].error = err.message;
                });
            }

            res.json({
                success: true,
                data: awkData
            });


        } catch (err) {
            await Fn.rollback();
            req.body.data.error = err.message;
            res.json({
                success: false,
                data: req.body.data
            })
        };
    }
    else {
        return next(new Error('there is no require data'));
    }
});

router.put('/finish', async (req, res, next) => {
    if (req.body.history) {
        try {
            await Fn.begin();
            for (let data of req.body.history) {
                await DB.runQuery('import_history', 'update_add_count', { obj: data }).then(async (result) => {
                    if (!result.changes) {
                        await DB.insert('import_history', data, null, false);
                    }
                });
            }
            await DB.runQuery('temp_import', 'delete');
            await Fn.commit();
            res.json({
                success: true
            })
        } catch (err) {
            await Fn.rollback();
            return next(err);
        }
    } else {
        return next(new Error('please provide import history data.'))
    }
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
            let total_count = 0, i = 0;
            let new_entries = [];
            let update_entries = [];
            let delete_entries = [];
            let insert = DB.db.transaction(async (tblname, data) => {
                try {
                    const insert_stmt = DB.db.prepare(DB.query[tblname].insert_ignore);
                    const update_stmt = DB.db.prepare(DB.query[tblname].import_update);
                    for (i = 0; i < data.length; i++) {
                        if (!data[i]._id) {
                            data[i]._id = null;
                        }
                        if (tblname == "item" || tblname == "subitem") {
                            data[i].categories = JSON.parse(data[i].categories ? data[i].categories : "[]");
                            data[i].categories = data[i].categories.filter(c => c);
                            data[i].categories = JSON.stringify(data[i].categories);
                            data[i].active = 1;
                        }

                        if (data[i].status == 3) {
                            if (tblname != 'department_config') {
                                DB.delete(tblname, data[i]._id).then((del_res) => {
                                    if (del_res) {
                                        delete_entries.push(data[i]);
                                    }
                                }, (err) => {
                                    console.log(err);
                                });
                            }

                        }
                        else if (data[i].status == 2) {
                            let updt_res = update_stmt.run(data[i]);
                            if (updt_res) {
                                if (updt_res.changes > 0) {
                                    update_entries.push(data[i]);
                                }
                            }
                        } else if (data[i].status == 1) {
                            let res = insert_stmt.run(data[i]);
                            if (res) {
                                total_count++;
                                if (res.changes > 0) {
                                    new_entries.push(data[i]);
                                }
                            }
                        }

                    }
                    res.json({
                        type: tblname,
                        total_count: total_count,
                        new_entries: new_entries,
                        update_entries: update_entries,
                        delete_entries: delete_entries,
                        columns: data.length > 0 ? Object.keys(data[0]) : []
                    })
                }
                catch (ex) {
                    console.log(ex, data[i]);
                    return next(ex);
                }
            });

            DB.db.pragma('foreign_keys=OFF');
            insert(req.body.type, req.body.data);
            DB.db.pragma('foreign_keys=ON');

        }
    }
    catch (err) {
        return next(err);
    }
});

router.put('/aff_data/', async (req, res, next) => {
    try {
        let conditionString = `1=1 ${(req.body.mm && req.body.mm.length > 0) ? ` OR aawak.mm_id in (${req.body.mm.join(',')}) OR aawak.aawak_mm_id in (${req.body.mm.join(',')})` : ``} ${(req.body.item && req.body.item.length > 0) ? ` OR aawak.item_id in (${req.body.item.join(',')})` : ``} ${(req.body.subitem && req.body.subitem.length > 0) ? ` OR aawak.subitem_id in (${req.body.subitem.join(',')})` : ``} ${(req.body.pbk && req.body.pbk.length > 0) ? ` OR aawak.pbk_id in (${req.body.pbk.join(',')})` : ``} ${(req.body.support_list && req.body.support_list.length > 0) ? ` OR aawak.condition_id in (${req.body.support_list.join(',')})` : ``} ${(req.body.support_list && req.body.support_list.length > 0) ? ` OR aawak.aawak_type_id in (${req.body.support_list.join(',')})` : ``} ${(req.body.unit && req.body.unit.length > 0) ? ` OR aawak.unit_id in (${req.body.unit.join(',')})` : ``} ${(req.body.department && req.body.department.length > 0) ? ` OR aawak.dept_id in (${req.body.department.join(',')})` : ``}`;
    }
    catch (ex) {

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

                let obj = { ...DB.tbInterface.temp_import, ...req.body[i] }

                let result = await DB.insert('temp_import', obj, null, false);
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