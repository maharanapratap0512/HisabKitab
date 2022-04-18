//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  category add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.category_hin) {
        await DB.insert('category', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('category', data, (err, data) => { })
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

//  category add
router.post('/:dept_id', async (req, res, next) => {
    if (req.body && req.body.category_hin) {
        await DB.insertFromDept('category', req.body, req.params.dept_id).then((data) => {
            res.json({
                success: true,
                result: data || {}
            });
        }, (err) => {
            return next(err);
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

//  category get
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('category',req.params.dept_id).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count
        });
    }, (err) => { return next(err) });
});

//  category get
router.get('/forConfig/:dept_id', async (req, res, next) => {
    await DB.getFullListForDeptConfig('category',req.params.dept_id).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve || [],
        });
    }, (err) => { return next(err) });
});

//  category get
router.get('/', async (req, res, next) => {
    await DB.getFullList('category').then(async (resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
        });
    }, (err) => { return next(err) });
});

// category update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = '_id = ' + req.body.query._id;
        await DB.update('category', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.updateToCache('category', req.body.set, condition, (err) => { })
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


// category delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('category', condition, (err, data) => {
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