const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  dictionary add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.type && req.body.name && req.body.real_id) {
        await DB.insert('dictionary', req.body).then(async (data) => {
            res.json({
                success: true,
                result: data || {}
            });
        }, (err) => {
            return next(err)
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

//  dictionary get
router.get('/', async (req, res, next) => {
    await DB.getList('dictionary').then(async (data) => {
        res.json({
            success: true,
            result: data.data || [],
            total_count: (data.total_count ? data.total_count : 0),
        });
    }, (err) => { return next(err) });
});

// dictionary update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        await DB.update('dictionary', req.body.set, req.body.query._id).then(async (data) => {
            res.json({
                success: true,
                result: data || {}
            });
        }, (err) => { return next(err) });
    }
    else {
        return next(new Error('Id or Data not found.'))
    }
});


// dictionary delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        await DB.delete('dictionary', req.params.id).then((data) => {
            res.json({
                success: true,
                result: data
            });
        }, (err) => { return next(err) });
    }
    else {
        return next(new Error('Id not found.'))
    }

});


module.exports = router;