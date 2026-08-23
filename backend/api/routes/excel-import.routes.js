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
        // aawak_source
        correctionList.push(...DB.db.prepare(`select DISTINCT aawak_source as name, 'aawak_source' as type, null as id, false as dictionary from temp_import where aawak_source IS NOT NULL AND aawak_source_id IS NULL AND temp_import.type='awk'`).all());
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
                        case 'subitem':
                            if (req.body.excelData[i].item_id) {
                                // Extract the item string based on what was provided in excelData (e.g. item_hin or item)
                                let itemStr = req.body.excelData[i].item_hin || req.body.excelData[i].item || '';
                                id = await fn.matchSubitem(name, req.body.excelData[i].item_id, itemStr);
                            }
                            break;
                        case 'condition': id = await fn.matchSupportList(name, 'condition');
                            break;
                        case 'aawak_type': id = await fn.matchSupportList(name, 'aawak_type');
                            break;
                        case 'gender': id = await fn.matchSupportList(name, 'gender', "list_name_eng");
                            break;
                        case 'relation': id = await fn.matchSupportList(name, 'relation', "list_name_eng");
                            break;
                        case 'jawak_type': id = await fn.matchSupportList(name, 'jawak_type');
                            break;
                        case 'usage_list': id = await fn.matchSupportList(name, 'usage_list');
                            break;
                        case 'aawak_source': id = await fn.matchSupportList(name, 'aawak_source');
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

async function processAttributeRow(service, fn, form, row) {
    let fdata = await fn.setFormData(form, row);
    if (!fdata.attribute_hin) {
        fdata.attribute_hin = row.attribute_hin || row.attribute || null;
    }
    const conflict = service.getAttributeConflict(fdata);
    if (conflict) {
        return { status: 'duplicate', data: row };
    } else {
        let insResult = service.insertAttribute(fdata);
        row.newData = insResult;
        return { status: 'inserted', data: row };
    }
}

async function processAttributeValueRow(service, fn, form, row) {
    let fdata = await fn.setFormData(form, row);
    const conflict = service.getAttributeValueConflict(fdata);
    if (conflict) {
        return { status: 'duplicate', data: row };
    } else {
        let insResult = service.insertAttributeValue(fdata);
        row.newData = insResult;
        return { status: 'inserted', data: row };
    }
}

router.post('/final_insert/:dept_id', async (req, res, next) => {
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
            result = await is.createItem(fdata, req.params.dept_id);
            result = { status: 'inserted', data: req.body.excelData, newData: result };
        } else if (req.body.importType.name == 'attribute') {
            const vs = require('../services/variant.service');
            const dataArr = Array.isArray(req.body.excelData) ? req.body.excelData : [req.body.excelData];
            let results = [];
            for (let row of dataArr) {
                results.push(await processAttributeRow(vs, fn, fn.attribute_form, row));
            }
            result = Array.isArray(req.body.excelData) ? results : results[0];
        } else if (req.body.importType.name == 'attributes_value') {
            const vs = require('../services/variant.service');
            const dataArr = Array.isArray(req.body.excelData) ? req.body.excelData : [req.body.excelData];
            let results = [];
            for (let row of dataArr) {
                results.push(await processAttributeValueRow(vs, fn, fn.attributes_value_form, row));
            }
            result = Array.isArray(req.body.excelData) ? results : results[0];
        } else {
            result = await fn.verifyAndInsert(req.body.importType, req.body.excelData, req.body.headerList);
        }
        res.json({
            success: true,
            result: result
        })
    } catch (err) { next(err) };
});


router.post('/final_stream/:dept_id', async (req, res, next) => {
    // 1. Headers: Using setHeader preserves CORS and other middleware headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    res.write(':ok\n\n');

    let isFinished = false;
    const { importType, headerList, excelData } = req.body;
    const total = excelData.length;
    const fn = new ExcelFunctions([], req.params.dept_id);
    console.log(`[Excel Import] Starting ${importType.name} import. Total rows: ${total}`);

    // Helper: Data ko stream format mein bhejne ke liye
    const sendUpdate = (payload) => {
        if (!isFinished) {
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
        }
    };

    try {
        if (importType.name === 'jawak') {
            // --- JAWAK LOGIC (Grouping) ---
            const groups = {};
            for (let row of excelData) {
                const groupKey = `${row.date}_${row.mm_id}_${row.pbk_id || ''}_${row.jawak_mm_id || ''}_${row.pkt_num || ''}_${row.reg_pg_no || ''}_${row.nimitt_id || ''}`;
                if (!groups[groupKey]) groups[groupKey] = [];
                groups[groupKey].push(row);
            }

            let lastVoucherNo = await Fn.getLastVoucherNo('jawak');
            let processed = 0;

            for (const key in groups) {
                if (isFinished) break;
                const groupRows = groups[key];
                const voucher_no = ++lastVoucherNo;

                for (let row of groupRows) {
                    if (isFinished) break;
                    let status = 'rejected', newData = null;
                    try {
                        await Fn.begin();
                        let fdata = await fn.setFormData(fn.jawak_form, row);
                        fdata.voucher_no = voucher_no;
                        fdata.is_xl = 1;
                        fdata.dept_id = req.params.dept_id;
                        fdata.enz = { container_capacity: row.container_capacity || null };
                        fdata.usage_report = {
                            date: row.date || null,
                            reporter: row.reporter || null,
                            usage_type: row.usage_type || row.usage_type_id || null,
                            usage_type_id: row.usage_type_id || row.usage_type || null,
                            fayda: row.fayda || null,
                            nuksan: row.nuksan || null,
                            rating: row.rating || null
                        };

                        const insId = await Fn.insertAJ(fdata, 'jawak');
                        newData = await DB.getById('jawak', insId, { full: true });
                        status = 'inserted';
                        await Fn.commit();
                    } catch (err) {
                        await Fn.rollback();
                        console.error(`[Excel Import] Jawak Error at row ${processed + 1}:`, err.message);
                        row.error = err.message;
                    }
                    processed++;
                    console.log(`[Excel Import] Jawak row ${processed}/${total} processed. Status: ${status}`);
                    sendUpdate({ index: processed, total, status, result: { status, data: { ...row, newData } } });

                    if (processed % 5 === 0) await new Promise(r => setImmediate(r));
                }
            }
        } else {
            // --- OTHER IMPORTS (Item, Variant, Category) ---
            const type = importType.name;
            let service, form;
            if (type === 'variant' || type === 'attribute' || type === 'attributes_value') {
                service = require('../services/variant.service');
                if (type === 'variant') form = fn.variant_form;
                else if (type === 'attribute') form = fn.attribute_form;
                else if (type === 'attributes_value') form = fn.attributes_value_form;
            } else if (type === 'item') {
                service = require('../services/item.service');
                form = fn.item_form;
            } else if (type === 'category') {
                service = require('../services/category.service');
            } else if (type === 'rel_item_category' || type === 'rel_subitem_category' || type === 'subitem') {
                service = require('../services/item.service');
                if (type === 'subitem') {
                    form = fn.subitem_form;
                }
            }

            for (let i = 0; i < total; i++) {
                if (isFinished) break;
                let row = excelData[i];
                let result;
                try {
                    await Fn.begin();
                    if (type === 'variant') {
                        let fdata = await fn.setFormData(form, row);
                        let insResult = await service.bulkCreateVariants(fdata.item_id, [fdata], req.userData);
                        row.newData = insResult;
                        result = { status: 'inserted', data: row };
                    } else if (type === 'attribute') {
                        result = await processAttributeRow(service, fn, form, row);
                    } else if (type === 'attributes_value') {
                        result = await processAttributeValueRow(service, fn, form, row);
                    } else if (type === 'item') {
                        const conflict = service.getItemConflict(row);
                        if (conflict) {
                            result = { status: 'duplicate', data: row };
                        } else {
                            let insResult = await service.createItem(row, req.params.dept_id);
                            row.newData = insResult;
                            result = { status: 'inserted', data: row };
                        }
                    } else if (type === 'category') {
                        const conflict = service.getCategoryConflict(row);
                        if (conflict) {
                            result = { status: 'duplicate', data: row };
                        } else {
                            let insResult = await service.createCategory(row, req.params.dept_id);
                            row.newData = insResult;
                            result = { status: 'inserted', data: row };
                        }
                    } else if (type === 'rel_item_category') {
                        const conflict = service.getRelItemCategoryConflict(row);
                        if (conflict) {
                            result = { status: 'duplicate', data: row };
                        } else {
                            let insResult = await service.createRelItemCategory(row);
                            row.newData = insResult;
                            result = { status: 'inserted', data: row };
                        }
                    } else if (type === 'rel_subitem_category') {
                        const conflict = service.getRelSubitemCategoryConflict(row);
                        if (conflict) {
                            result = { status: 'duplicate', data: row };
                        } else {
                            let insResult = await service.createRelSubitemCategory(row);
                            row.newData = insResult;
                            result = { status: 'inserted', data: row };
                        }
                    } else if (type === 'subitem') {
                        let fdata = await fn.setFormData(form, row);
                        const conflict = service.getSubitemConflict(fdata);
                        if (conflict) {
                            let fullDuplicate = await fn.checkFullDuplication([conflict.conflict], row, headerList);
                            if (fullDuplicate.found) {
                                result = { status: 'duplicate', data: row };
                            } else {
                                row.duplicate = fullDuplicate.list;
                                row._id = conflict.conflict._id;
                                result = { status: 'update', data: row };
                            }
                        } else {
                            let insResult = await service.createSubitem(fdata, req.params.dept_id);
                            row.newData = insResult;
                            result = { status: 'inserted', data: row };
                        }
                    } else {
                        result = await fn.verifyAndInsert(importType, row, headerList);
                    }
                    await Fn.commit();
                } catch (err) {
                    await Fn.rollback();
                    console.error(`[Excel Import] ${type} Error at row ${i + 1}:`, err);
                    result = { status: 'rejected', data: row, error: err.message };
                }
                sendUpdate({ index: i + 1, total, status: result.status, result });

                if ((i + 1) % 5 === 0) await new Promise(r => setImmediate(r));
            }
        }

        console.log(`[Excel Import] Finished ${importType.name} import.`);
        sendUpdate({ done: true });

    } catch (err) {
        console.error('[Excel Import] Global Stream Error:', err);
        sendUpdate({ error: err.message });
    } finally {
        if (!res.writableEnded) {
            console.log(`[Excel Import] response closed.`);
            res.end(); // Yeh hamesha pipeline band karega
        }
    }
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
                it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as arr_item_categories,
                sit.subitem_hin, sit.subitem_eng, sit.categories as arr_subitem_categories,
                slc.list_name_hin as condition_hin, slc.list_name_eng as condition_eng,
                dept.dept_hin, dept.dept_eng, dept.dept_code,
                unit.unit_short, unit.unit_full from bachat_import bi
                LEFT JOIN bcht on bcht.mm_id = bi.mm_id AND bcht.item_id = bi.item_id AND IFNULL(bcht.subitem_id, 0) = IFNULL(bi.subitem_id, 0) AND IFNULL(bcht.condition_id, 0) = IFNULL(bi.condition_id, 0) AND bcht.unit_id = bi.unit_id
                LEFT JOIN mm on mm._id = bi.mm_id
                LEFT JOIN state st on st._id = mm.state_id
                LEFT JOIN v_item it on it._id = bi.item_id
                LEFT JOIN v_subitem sit on sit._id = bi.subitem_id
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
                it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as arr_item_categories,
                sit.subitem_hin, sit.subitem_eng, sit.categories as arr_subitem_categories,
                slc.list_name_hin as condition_hin, slc.list_name_eng as condition_eng,
                dept.dept_hin, dept.dept_eng, dept.dept_code,
                unit.unit_short, unit.unit_full from bcht 
                LEFT JOIN mm on mm._id = bcht.mm_id
                LEFT JOIN state st on st._id = mm.state_id
                LEFT JOIN v_item it on it._id = bcht.item_id
                LEFT JOIN v_subitem sit on sit._id = bcht.subitem_id
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