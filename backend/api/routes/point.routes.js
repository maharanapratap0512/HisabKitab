const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();



// get point 
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('point').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count,
            });
        });
    } catch (err) { next(err) };
});


// get point random 
router.get('/random/', async (req, res, next) => {
    try {
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('point', { full: true, orderBy: `random()`, limit: 1 }).then(async (resolve) => {
            // console.log(resolve);
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count,
            });
        });
    } catch (err) { next(err) };
});


// post point 
router.post('/', async (req, res, next) => {
    try {
        if (req.body && req.body.point_hin) {
            await DB.insert('point', req.body).then((data) => {
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


// update point 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('point', req.body.set, req.body.query._id).then(async (data) => {
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


// delete point 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('point', req.params.id).then((data) => {
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