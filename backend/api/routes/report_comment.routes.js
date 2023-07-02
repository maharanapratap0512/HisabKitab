const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get report_comment all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('report_comment').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get report_comment 
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('report_comment', { dept_id: req.params.dept_id }).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// post report_comment 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            await DB.insert('report_comment', req.body, req.params.dept_id).then((data) => {
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


// update report_comment 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('report_comment', req.body.set, req.body.query._id).then(async (data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});

// delete report_comment 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('report_comment', req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            })
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});


module.exports = router;