const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();



// get unit all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('unit').then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// post unit 
router.post('/', async (req, res, next) => {
    try {
        if (req.body && req.body.unit_short) {
            await DB.insert('unit', req.body).then(async (data) => {
                res.json({
                    success: true,
                    result: data || []
                });
            }, (err)=>{
                return next(err);
            });
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update unit 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('unit', req.body.set, req.body.query._id).then(async (data) => {
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



// delete unit 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('unit', req.params.id).then((data) => {
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