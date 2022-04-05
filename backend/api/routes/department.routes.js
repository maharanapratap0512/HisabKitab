//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  department add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.dept_eng && req.body.dept_hin) {
        await DB.insert('department', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('department', data, (err, data) => { })
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

//  department get
router.get('/', async (req, res, next) => {
    await DB.getFullList('department').then(async (resolve) => {
        let count = await DB.getCount('department');
        res.json({
            success: true,
            result: resolve || [],
            total_count: (count ? count.total_count : 0),
        });
    }, (err) => { return next(err) });
});

//  department get
router.get('/:dept_id', async (req, res, next) => {
    if (['1', '2'].includes(req.params.dept_id)) {
        await DB.getFullList('department').then(async (resolve) => {
            let count = await DB.getCount('department');
            res.json({
                success: true,
                result: resolve || [],
                total_count: (count ? count.total_count : 0),
            });
        }, (err) => { return next(err) });
    }
    else {
        res.json({
            success: true,
            result: []
        })
    }
});

//  department get
router.get('/DB/:dept_id', async (req, res, next) => {
    await DB.getFullList('department').then(async (resolve) => {
        let count = await DB.getCount('department');
        res.json({
            success: true,
            result: resolve || [],
            total_count: (count ? count.total_count : 0),
        });
    }, (err) => { return next(err) });
});

// department update
router.put('/', async (req, res, next) => {
    if (req.body.query && req.body.query._id && req.body.set) {
        let condition = '_id = ' + req.body.query._id;
        await DB.update('department', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.updateToCache('department', req.body.set, condition, (err) => { })
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


//login to department
router.put('/login', async (req, res, next) => {
    if (req.body.dept_id && req.body.dept_id != 4 && req.body.password) {
        let condition = `_id = ${req.body.dept_id} AND password = '${req.body.password}' `;
        await DB.getCount('department', condition).then((response) => {
            res.json(response || {});
        },
            (err) => {
                next(err);
            });
    }
    else {
        return next(new Error('Id not found.'))
    }
});

router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('department', condition, (err, data) => {
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