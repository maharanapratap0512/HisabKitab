const router = require('express').Router();
const fs = require('fs');
const DBContex = require('../models/DBContex');
const DB = new DBContex();



//  get tempimport data
router.get('/', async (req, res, next) => {
    DB.getList('temp_import', { conditionString: `type = 'awk'` }).then(async (result) => {
        for (let i in result.data) {
            result.data[i].pbk = result.data[i].pbk ? JSON.parse(result.data[i].pbk) : {};
            await DB.getList('temp_import', { conditionString: `ref_id=${result.data[i]._id}` }).then(async (jwk) => {
                result.data[i].jawak_detail = jwk.data;
            });
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

//  get full temp import data
router.get('/', async (req, res, next) => {
    DB.getList('temp_import', { full: true, conditionString: `type = 'awk'` }).then(async (result) => {
        for (let i in result.data) {
            result.data[i].pbk = result.data[i].pbk ? JSON.parse(result.data[i].pbk) : {};
            await DB.getList('temp_import', { full: true, conditionString: `ref_id=${result.data[i]._id}` }).then(async (jwk) => {
                result.data[i].jawak_detail = jwk.data;
            });
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

//get all updated list
router.get('/correction', async (req, res, next) => {
    try {
        let correctionList = [];
        correctionList.push(...DB.db.prepare(`select item, subitem, 'item' as type, null as item_id, null as subitem_id, false as dictionary from temp_import where (item IS NOT NULL AND item_id IS NULL) OR (subitem IS NOT NULL AND subitem_id IS NULL) group by item, subitem`).all());
        correctionList.push(...DB.db.prepare(`select DISTINCT mm as name, 'mm' as type, null as mm_id, false as dictionary from temp_import where mm IS NOT NULL AND mm_id IS NULL`).all());
        correctionList.push(...DB.db.prepare(`select DISTINCT pbk, 'pbk' as type, null as pbk_id, false as dictionary from temp_import where pbk IS NOT NULL AND pbk_id IS NULL`).all());
        correctionList.push(...DB.db.prepare(`select DISTINCT aj_mm as name, 'aj_mm' as type, null as aj_mm_id, false as dictionary from temp_import where aj_mm IS NOT NULL AND aj_mm_id IS NULL`).all());
        correctionList.push(...DB.db.prepare(`select DISTINCT aj_type as name, 'awk_type' as type, null as aj_type_id, false as dictionary from temp_import where aj_type IS NOT NULL AND aj_type_id IS NULL AND temp_import.type='awk'`).all());
        correctionList.push(...DB.db.prepare(`select DISTINCT aj_type as name, 'jwk_type' as type, null as aj_type_id, false as dictionary from temp_import where aj_type IS NOT NULL AND aj_type_id IS NULL AND temp_import.type='jwk'`).all());
        correctionList.push(...DB.db.prepare(`select DISTINCT condition as name, 'condition' as type, null as condition_id, false as dictionary from temp_import where condition IS NOT NULL AND condition_id IS NULL`).all());
        correctionList.push(...DB.db.prepare(`select DISTINCT product as name, 'product' as type, null as product_id, false as dictionary from temp_import where product IS NOT NULL AND product_id IS NULL`).all());
        correctionList.push(...DB.db.prepare(`select DISTINCT nimitt as name, 'nimitt' as type, null as nimitt_id, false as dictionary from temp_import where nimitt IS NOT NULL AND nimitt_id IS NULL`).all());

        res.json({
            success: true,
            result: correctionList
        });

    }
    catch (err) {
        console.log(err);
    }
});


//get all updated list
router.get('/updates/:dept_id', async (req, res, next) => {
    try {
        let lists = {}

        if (req.params.dept_id) {
            lists.country = await DB.getList('country', { dept_id: req.params.dept_id }) || []
            lists.state = await DB.getList('state', { dept_id: req.params.dept_id }) || []
            lists.city = await DB.getList('city', { dept_id: req.params.dept_id }) || []
            lists.unit = await DB.getList('unit', { dept_id: req.params.dept_id }) || []
            lists.support_list = await DB.getList('support_list', { dept_id: req.params.dept_id }) || []
            lists.category = await DB.getList('category', { dept_id: req.params.dept_id }) || []
            lists.mm = await DB.getList('mm', { dept_id: req.params.dept_id }) || []
            lists.item = await DB.getList('item', { dept_id: req.params.dept_id }) || []
            lists.subitem = await DB.getList('subitem', { dept_id: req.params.dept_id }) || []
            lists.subitem_list = await DB.getList('subitem_list', { dept_id: req.params.dept_id }) || []
            lists.pbk = await DB.getList('pbk', { dept_id: req.params.dept_id }) || []
            lists.product = await DB.getList('product', { dept_id: req.params.dept_id }) || []
            lists.aawak = await DB.getList('aawak', { dept_id: req.params.dept_id }) || []
            lists.jawak = await DB.getList('jawak', { dept_id: req.params.dept_id }) || []
            lists.point = await DB.getList('point', { dept_id: req.params.dept_id }) || []
            lists.department = await DB.getList('department', { conditionString: ` department._id = ${req.params.dept_id}` }) || []
            lists.department_config = await DB.getList('department_config', { conditionString: ` department_config.dept_id = ${req.params.dept_id}` }) || []
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

//  department DB download
// router.get('/updates/:dept_id', async (req, res, next) => {
//     DB.generateUpdateDB(req.params.dept_id).then(async (result) => {
//         res.json({
//             success: true,
//             result: result
//         });


//     }, (reject) => {
//         next(reject);
//     });
// });

//  department DB download
router.put('/correct', async (req, res, next) => {
    try {
        if (req.body && req.body.length > 0) {
            for (let i in req.body) {
                if(req.body[i].type )
                DB.runQuery('excel_correction', req.body[i].type, {obj:req.body[i]});
                // switch (req.body[i].type) {
                //     case "mm":
                //         break;
                //     case "aj_mm":
                //         break;
                //     case "item":
                //         break;
                //     case "pbk":
                //         break;
                //     case "awk_type":
                //         break;
                //     case "jwk_type":
                //         break;
                //     case "condition":
                //         break;
                //     case "product":
                //         break;
                //     case "nimitt":
                //         break;
                // }
                if(req.body[i].dictionary){

                }
            }
        }
        res.json({
            success: true,
            result: req.body
        });
        // DB.generateUpdateDB(req.params.dept_id).then(async (result) => {
        //     res.json({
        //         success: true,
        //         result: result
        //     });


        // }, (reject) => {
        //     next(reject);
        // });
    } catch (err) { next(err) };
});

router.post('/', async (req, res, next) => {
    if (req.body) {
        try {
            for (let i in req.body) {
                req.body[i].type = 'awk';
                req.body[i].pbk = ((req.body[i].pbk && (req.body[i].pbk.roll_no || req.body[i].pbk.pbk || req.body[i].pbk.relation || req.body[i].pbk.relative)) ? JSON.stringify(req.body[i].pbk) : null);
                let result = await DB.insert('temp_import', req.body[i], null, false);
                if (result && req.body[i].jawak_detail && req.body[i].jawak_detail.length > 0) {
                    for (let j in req.body[i].jawak_detail) {
                        req.body[i].jawak_detail[j].ref_id = result;
                        req.body[i].jawak_detail[j].type = 'jwk';
                        req.body[i].jawak_detail[j].pbk = ((req.body[i].jawak_detail[j].pbk && (req.body[i].jawak_detail[j].pbk.roll_no || req.body[i].jawak_detail[j].pbk.pbk || req.body[i].jawak_detail[j].pbk.relation || req.body[i].jawak_detail[j].pbk.relative)) ? JSON.stringify(req.body[i].jawak_detail[j].pbk) : null);
                        await DB.insert('temp_import', req.body[i].jawak_detail[j], null, false);
                    }
                }
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