const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  jawak add
router.post('/', async (req, res, next) => {
    if (req.body) {
        await DB.insert('jawak', req.body).then((data) => {
            res.json({
                success: true,
                result: data || {}
            });
        },(err)=>{
            return next(err);
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


//  jawak add by dept_id
router.post('/:dept_id', async (req, res, next) => {
    if (req.body) {
        await DB.insert('jawak', req.body, req.params.dept_id).then((data) => {
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
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    await DB.getList('jawak', {full:true, conditionString: conditionString }).then((resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
        });
    }, (err) => { return next(err) });
});


//  jawak get from department
router.get('/:dept_id', async (req, res, next) => {
    await DB.getList('jawak', {full:true, dept_id: req.params.dept_id }).then((resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count
        });
    }, (err) => { return next(err) });
});


// jawak update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'jawak._id = ' + req.body.query._id;
        await DB.update('jawak', req.body.set, condition).then((data) => {

            res.json({
                success: true,
                result: data || []
            });
        },(err)=>{
            return next(err);
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
        await DB.delete('jawak', condition).then((data)=>{
            res.json({
                success: true,
                result: data
            });
        },(err)=>{
            return next(err);
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
// nimitt_id: "gggg"
// pbk_id: (3)[2, 7, 10]
// pkt_num: "222"
// product_id: []
// subitem_id: []

//jawak get by dept + filter + pageNo
router.put('/:dept_id', async (req, res, next) => {
    let orderBy = null, limit = 100, offset = null, page = 1;
    let conditionString = `1=1 ${req.body.mm_id.length > 0 ? ` AND jawak.mm_id in (${req.body.mm_id.join(',')})` : ''} ${req.body.condition_id.length > 0 ? ` AND jawak.condition_id in (${req.body.condition_id.join(',')})` : ''} ${req.body.item_id.length > 0 ? ` AND jawak.item_id in (${req.body.item_id.join(',')})` : ''} ${req.body.jawak_mm_id.length > 0 ? ` AND jawak.jawak_mm_id in (${req.body.jawak_mm_id.join(',')})` : ''} ${req.body.jawak_type_id.length > 0 ? ` AND jawak.jawak_type_id in (${req.body.jawak_type_id.join(',')})` : ''} ${req.body.pbk_id.length > 0 ? ` AND jawak.pbk_id in (${req.body.pbk_id.join(',')})` : ''} ${req.body.subitem_id.length > 0 ? ` AND jawak.subitem_id in (${req.body.subitem_id.join(',')})` : ''} ${req.body.product_id.length > 0 ? ` AND jawak.product_id in (${req.body.product_id.join(',')})` : ''} ${(req.body.nimitt_id && req.body.nimitt_id.length > 0) ? ` AND jawak.nimitt_id in ${req.body.nimitt_id.join(',')}` : ''} ${req.body.pkt_num ? ` AND jawak.pkt_num = ${req.body.pkt_num}` : ''}`

    if (conditionString.trim() == `1=1`) {
        orderBy = "pbk._id desc";
    }
    if (req.body.pageNo && req.body.pageNo > 0) {
        offset = (req.body.pageNo - 1) * limit;
        page = req.body.pageNo
    }
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    await DB.getList('jawak', {full:true, dept_id: req.params.dept_id, conditionString: conditionString, orderBy: orderBy, limit: limit, offset: offset }).then((resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count
        });
    }, (err) => { return next(err) });
})


module.exports = router;