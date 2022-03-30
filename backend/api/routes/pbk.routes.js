//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  pbk add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.pbk_hin) {
        await DB.insert('pbk', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data || []
            });
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


//  pbk add
router.post('/:dept_id', async (req, res, next) => {
    if (req.body && req.body.pbk_hin) {
        await DB.insertFromDept('pbk', req.body, req.params.dept_id).then((data) => {
            res.json({
                success: true,
                result: data || []
            });
        }, (err) => {
            return next(err);
        });
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


//  pbk get
router.get('/', async (req, res, next) => {
    await DB.getList('pbk').then((resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});


//pbk get by dept
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('pbk', req.params.dept_id).then((resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});

//pbk get by dept
router.get('/forConfig/:dept_id', async (req, res, next) => {
    await DB.getFullListForDeptConfig('pbk', req.params.dept_id).then((resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});


// pbk update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'pbk._id = ' + req.body.query._id;
        await DB.update('pbk', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data || []
            });
        });
    }
    else {
        return next(new Error('Id not found.'))
    }
});


// pbk delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('pbk', condition, (err, data) => {
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