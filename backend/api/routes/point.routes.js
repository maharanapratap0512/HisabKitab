const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  point add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.point_hin) {
        await DB.insert('point', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('point', data, (err, data) => { })
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

//  point get
router.get('/', async (req, res, next) => {
    await DB.getList('point').then(async (resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
        });
    }, (err) => { return next(err) });
});


//  point get
router.get('/random/', async (req, res, next) => {
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    await DB.getList('point', null, ` random()`, 1).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
        });
    }, (err) => { return next(err) });
});

// point update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = '_id = ' + req.body.query._id;
        await DB.update('point', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.updateToCache('point', req.body.set, condition, (err) => { })
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


// point delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('point', condition, (err, data) => {
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