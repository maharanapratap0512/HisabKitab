const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();




// get product all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('product').then((data) => {
            for (let i in data) {
                data[i].document = (data[i].document != "[null]" ? JSON.parse(data[i].document) : {});
            }
            res.json({
                success: true,
                result: data || []
            });
        });
    } catch (err) { next(err) };
});


// get product
router.get('/:dept_id', async (req, res, next) => {
    try {
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('product', { full: true, dept_id: req.params.dept_id, limit: 100 }).then((resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : {});
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// get Filter product by dept_id
router.put('/:dept_id', async (req, res, next) => {
    try {
        let conditionString = ` 1=1 ${typeof req.body.item_id == "string" || typeof req.body.item_id == "number" ? ` AND product.item_id = (${req.body.item_id})` : ``} ${req.body.item_id.length > 0 ? ` AND product.item_id IN (${req.body.item_id})` : ``}`;
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('product', { dept_id: req.params.dept_id, conditionString: conditionString, limit: 100 }).then((resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : {});
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// post product
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            await DB.insert('product', req.body, req.params.dept_id).then((data) => {
                data.document = (data.document != "[null]" ? JSON.parse(data.document) : {});
                res.json({
                    success: true,
                    result: data || {}
                });
            })
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update product
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('product', req.body.set, req.body.query._id).then(async (data) => {
                data.document = (data.document != "[null]" ? JSON.parse(data.document) : {});
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


// delete product
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('product', req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            })
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


module.exports = router;