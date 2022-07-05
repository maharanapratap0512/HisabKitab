const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  nimitt add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.nimitt_hin) {
        await DB.insert('nimitt', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('nimitt', data, (err, data) => { })
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

//  nimitt add
router.post('/:dept_id', async (req, res, next) => {
    if (req.body && req.body.nimitt_hin) {
        await DB.insert('nimitt', req.body, req.params.dept_id).then((data) => {
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

//  nimitt get
router.get('/:dept_id', async (req, res, next) => {
    let options = {full:true, dept_id: req.params.dept_id, conditionString: null }
    await DB.getList('nimitt', options).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count
        });
    }, (err) => { return next(err) });
});

//  nimitt get
router.get('/forConfig/:dept_id', async (req, res, next) => {
    await DB.getFullListForDeptConfig('nimitt', req.params.dept_id).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve || [],
        });
    }, (err) => { return next(err) });
});

//  nimitt get
router.get('/', async (req, res, next) => {
    await DB.getList('nimitt').then(async (resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
        });
    }, (err) => { return next(err) });
});

// nimitt update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = '_id = ' + req.body.query._id;
        await DB.update('nimitt', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.updateToCache('nimitt', req.body.set, condition, (err) => { })
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


// nimitt delete
router.delete('/:id', async (req, res, next) => {
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

});


module.exports = router;