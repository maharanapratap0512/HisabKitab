const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();

// get entry_type 
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('entry_type').then((resolve) => {
            res.json({
                success: true,
                result: resolve || []
            });
        });
    } catch (err) { next(err) };
});


// post entry_type 
router.post('/', async (req, res, next) => {
    try {
        if (req.body && req.body.entry_type_hin) {
            await DB.insert('entry_type', req.body).then(async (data) => {
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


// update entry_type 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('entry_type', req.body.set, req.body.query._id).then(async (data) => {
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


// delete entry_type 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('entry_type', req.params.id).then((data) => {
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