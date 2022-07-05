const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();

// get nimitt all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('nimitt').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get nimitt
router.get('/:dept_id', async (req, res, next) => {
    try {
        let options = { full: true, dept_id: req.params.dept_id, conditionString: null }
        await DB.getList('nimitt', options).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// post nimitt
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.nimitt_hin) {
            await DB.insert('nimitt', req.body, req.params.dept_id).then((data) => {
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

// update nimitt
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('nimitt', req.body.set, req.body.query._id).then(async (data) => {
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


// delete nimitt
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            let condition = '_id = ' + req.params.id;
            await DB.delete('nimitt', condition).then((data) => {
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