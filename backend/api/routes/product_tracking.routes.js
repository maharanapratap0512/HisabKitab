const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();




// get product_tracking all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('product_tracking').then((data) => {
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


// get product_tracking
router.get('/:dept_id', async (req, res, next) => {
    try {
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('product_tracking', { full: true, dept_id: req.params.dept_id, limit: 100 }).then((resolve) => {
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


// get Filter product_tracking by dept_id
router.put('/:dept_id', async (req, res, next) => {
    try {
        let conditionString = ` 1=1 ${typeof req.body.item_id == "string" || typeof req.body.item_id == "number" ? ` AND product_tracking.item_id = (${req.body.item_id})` : ``} ${req.body.item_id.length > 0 ? ` AND product_tracking.item_id IN (${req.body.item_id})` : ``}`;
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('product_tracking', { dept_id: req.params.dept_id, conditionString: conditionString, limit: 100 }).then((resolve) => {
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


// post product_tracking
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            await DB.insert('product_tracking', req.body, req.params.dept_id).then((data) => {
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


// update product_tracking
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {            
            req.body.set.hl = req.body.set.hl ? 1 : 0;
            await DB.update('product_tracking', req.body.set, req.body.query._id).then(async (data) => {
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


// delete product_tracking
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('product_tracking', req.params.id).then((data) => {
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