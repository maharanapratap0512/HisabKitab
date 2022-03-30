//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  jawak add
router.post('/', async (req, res, next) => {
    if (req.body) {
        await DB.insert('jawak', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('jawak', data, (err, data) => { })
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

//  jawak add by dept_id
router.post('/:dept_id', async (req, res, next) => {
    if (req.body) {
        await DB.insertFromDept('jawak', req.body, req.params.dept_id).then((data) => {
            // console.log("data", data);
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

//  jawak get
router.get('/', async (req, res, next) => {
    await DB.getList('jawak').then((data) => {
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
});

//  jawak get by aawak id
router.get('/byaawak/:aawak_ref_id', async (req, res, next) => {
    let conditionString = ` aawak_ref_id = ${req.params.aawak_ref_id}`;
    await DB.getFullList('jawak', conditionString).then((data) => {
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
});

//  jawak get from department
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('jawak', req.params.dept_id).then((data) => {
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
});

// jawak update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'jawak._id = ' + req.body.query._id;
        await DB.update('jawak', req.body.set, condition, async (err, data) => {
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


// jawak delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('jawak', condition, (err, data) => {
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