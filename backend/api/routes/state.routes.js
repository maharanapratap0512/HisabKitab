const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();



// get state
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('state').then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// post state 
router.post('/', async (req, res, next) => {
    try {
        if (req.body && req.body.state_hin) {
            await DB.insert('state', req.body).then(async (data) => {
                res.json({
                    success: true,
                    result: data || []
                });
            })
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update state 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('state', req.body.set, req.body.query._id).then(async (data) => {
                res.json({
                    success: true,
                    result: data || []
                });
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


// delete state 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('state', req.params.id).then((data) => {
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