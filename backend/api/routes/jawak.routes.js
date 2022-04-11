//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  jawak add
router.post('/', async (req, res, next) => {
    if (req.body) {
        await DB.insert('jawak', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('jawak', data, (err, data) => { })
            res.json({
                success: true,
                result: data || []
            });
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


//  jawak add by dept_id
router.post('/:dept_id', async (req, res, next) => {
    if (req.body) {
        await DB.insertFromDept('jawak', req.body, req.params.dept_id).then((data) => {
            // console.log("data", data);
            res.json({
                success: true,
                result: data || {}
            });
        }, (err) => {
            return next(err);
        });
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


//  jawak get
router.get('/', async (req, res, next) => {
    await DB.getList('jawak').then((data) => {
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
});


//  jawak get by aawak id
router.get('/byaawak/:aawak_ref_id', async (req, res, next) => {
    let conditionString = ` aawak_ref_id = ${req.params.aawak_ref_id}`;
    await DB.getFullList('jawak', conditionString).then((data) => {
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
});


//  jawak get from department
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('jawak', req.params.dept_id).then((data) => {
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
});


// jawak update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'jawak._id = ' + req.body.query._id;
        await DB.update('jawak', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data || []
            });
        });
    }
    else {
        return next(new Error('Id not found.'))
    }
});


// jawak delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('jawak', condition, (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data
            });
        })
    }
    else {
        return next(new Error('Id not found.'))
    }
});
// condition_id: (2)[36, 34]
// item_id: (3)[11, 8, 41]
// jawak_mm_id: (2)[6, 4]
// jawak_type_id: (2)[28, 32]
// mm_id: (2)[6, 4]
// nimmit: "gggg"
// pbk_id: (3)[2, 7, 10]
// pkt_num: "222"
// product_id: []
// subitem_id: []

//jawak get by filter
router.put('/:dept_id', async (req, res, next) => {
    let conditionString = `1=1 ${req.body.mm_id.length > 0 ? ` AND jawak.mm_id in (${req.body.mm_id.join(',')})` : ''} ${req.body.condition_id.length > 0 ? ` AND jawak.condition_id in (${req.body.condition_id.join(',')})` : ''} ${req.body.item_id.length > 0 ? ` AND jawak.item_id in (${req.body.item_id.join(',')})` : ''} ${req.body.jawak_mm_id.length > 0 ? ` AND jawak.jawak_mm_id in (${req.body.jawak_mm_id.join(',')})` : ''} ${req.body.jawak_type_id.length > 0 ? ` AND jawak.jawak_type_id in (${req.body.jawak_type_id.join(',')})` : ''} ${req.body.pbk_id.length > 0 ? ` AND jawak.pbk_id in (${req.body.pbk_id.join(',')})` : ''} ${req.body.subitem_id.length > 0 ? ` AND jawak.subitem_id in (${req.body.subitem_id.join(',')})` : ''} ${req.body.product_id.length > 0 ? ` AND jawak.product_id in (${req.body.product_id.join(',')})` : ''} ${req.body.nimmit ? ` AND jawak.nimmit = ${req.body.nimmit}` : ''} ${req.body.pkt_num ? ` AND jawak.pkt_num = ${req.body.pkt_num}` : ''}`


    await DB.getFullListByDept('jawak', req.params.dept_id, conditionString).then((data) => {
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
})

//  item get by full filter
router.put('/:dept_id', async (req, res, next) => {
    let conditionString = ``;
    if (req.body._id) {
        conditionString += (conditionString != `` ? ` AND` : ``) + ` item._id = ${req.body._id}`;
    }
    if (req.body.category_id) {
        conditionString += (conditionString != `` ? ` AND` : ``) + ` (item.category_id = ${req.body.category_id} OR si.category_id = ${req.body.category_id})`;
    }
    if (req.body.subitem_list_id) {
        conditionString += (conditionString != `` ? ` AND` : ``) + ` (si.subitem_list_id = ${req.body.subitem_list_id})`;
    }
    await DB.getFullListByDept('itemMix', req.params.dept_id, conditionString).then((resolve) => {
        let subitem_count = 0;
        for (let i = 0; i < resolve.length; i++) {

            resolve[i].subitems = (resolve[i].subitems != "[null]" ? JSON.parse(resolve[i].subitems) : []);
            resolve[i].categories = (resolve[i].categories != "[null]" ? JSON.parse(resolve[i].categories) : []);
            subitem_count += resolve[i].subitems.length;
        }
        res.json({
            success: true,
            result: resolve || [],
            subitem_count: subitem_count
        });
    }, (err) => { return next(err) });
});


module.exports = router;