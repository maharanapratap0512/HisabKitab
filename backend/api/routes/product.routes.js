//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  product add
router.post('/', async (req, res, next) => {
    if (req.body) {
        await DB.insert('product', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('product', data, (err, data) => { })
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

//  Product add by dept
router.post('/:dept_id', async (req, res, next) => {
    if (req.body) {
        await DB.insertFromDept('product', req.body, req.params.dept_id).then((data) => {
            // await DB.insertToCache('product', data, (err, data) => { })
            data.document = (data.document != "[null]" ? JSON.parse(data.document) : {});
            res.json({
                success: true,
                result: data || []
            });
        }, (err) => {
            return next(err);
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

//  product get by dept_id
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('product', req.params.dept_id, null,null, 100).then((data) => {
        for (let i in data) {
            data[i].document = (data[i].document != "[null]" ? JSON.parse(data[i].document) : {});
        }
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
});

// Filter product get by dept_id
router.put('/:dept_id', async (req, res, next) => {
    let conditionString = ` 1=1 ${typeof req.body.item_id == "string" || typeof req.body.item_id == "number" ? ` AND product.item_id = (${req.body.item_id})` : ``} ${req.body.item_id.length > 0 ? ` AND product.item_id IN (${req.body.item_id})` : ``}`;
    await DB.getFullListByDept('product', req.params.dept_id, conditionString,null, 100).then((data) => {
        for (let i in data) {
            data[i].document = (data[i].document != "[null]" ? JSON.parse(data[i].document) : {});
        }
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
});

//  product get
router.get('/', async (req, res, next) => {
    await DB.getList('product').then((data) => {
        for (let i in data) {
            data[i].document = (data[i].document != "[null]" ? JSON.parse(data[i].document) : {});
        }
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
});

// product update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'product._id = ' + req.body.query._id;
        await DB.update('product', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            data.document = (data.document != "[null]" ? JSON.parse(data.document) : {});
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


// product delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('product', condition, (err, data) => {
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


module.exports = router;