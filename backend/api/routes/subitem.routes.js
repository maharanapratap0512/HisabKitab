//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  subitem add
router.post('/', async (req, res, next) => {
    if (req.body) {
        await DB.insert('subitem', req.body, async (err, data) => {
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

//  subitem add
router.post('/:dept_id', async (req, res, next) => {
    if (req.body) {
        await DB.insertFromDept('subitem', req.body, req.params.dept_id).then((data) => {
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

//  subitem get
router.get('/', async (req, res, next) => {
    await DB.getFullList('subitem').then((resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
        });
    }, (err) => { return next(err) });
});

//subitem get by dept
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('subitem', req.params.dept_id).then((resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count
        });
    }, (err) => { return next(err) });
});
//subitem get by dept
router.get('/forConfig/:dept_id', async (req, res, next) => {
    await DB.getFullListForDeptConfig('subitem', req.params.dept_id).then((resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});

// subitem update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'subitem._id = ' + req.body.query._id;
        await DB.update('subitem', req.body.set, condition, async (err, data) => {
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


// subitem delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('subitem', condition, (err, data) => {
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