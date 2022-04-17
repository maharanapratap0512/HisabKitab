//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  mm add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.mm_hin) {
        await DB.insert('mm', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data || {}
            });
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

//mm post with dept
router.post('/:dept_id', async (req, res, next) => {
    if (req.body && req.body.mm_hin) {
        await DB.insertFromDept('mm', req.body, req.params.dept_id).then((data) => {
            res.json({
                success: true,
                result: data || {}
            });
        }, (err) => {
            return next(err);
        });
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


//mm get dept
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('mm', req.params.dept_id).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve || [],
        });
    }, (err) => { return next(err) });
});

//mm get dept
router.get('/forConfig/:dept_id', async (req, res, next) => {
    await DB.getFullListForDeptConfig('mm', req.params.dept_id).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve || [],
        });
    }, (err) => { return next(err) });
});

//  mm get
router.get('/', async (req, res, next) => {
    await DB.getFullList('mm').then(async (resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
        });
    }, (err) => { return next(err) });
});


// mm update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'mm._id = ' + req.body.query._id;
        await DB.update('mm', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data || {}
            });
        });
    }
    else {
        return next(new Error('Id not found.'))
    }
});


// mm delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('mm', condition, (err, data) => {
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