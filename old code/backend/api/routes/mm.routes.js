const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get mm
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('mm').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});

// get mm dept
router.get('/:dept_id', async (req, res, next) => {
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    try {
        await DB.getList('mm', { full: true, dept_id: req.params.dept_id }).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});



// post mm 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.mm_hin) {
            await DB.insert('mm', req.body, req.params.dept_id).then((data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update mm 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('mm', req.body.set, req.body.query._id).then(async (data) => {
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

// toggle lock 
router.put('/lock/', async (req, res, next) => {
    try {
        if (req.body._id) {
            await DB.update('mm', req.body, req.body._id, 'update_lock').then(async (data) => {
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


// mm delete
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('mm', req.params.id).then((data) => {
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