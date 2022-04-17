//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  city add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.city_hin) {
        await DB.insert('city', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('city', data, (err, data) => { })
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

//post city with dept_id
router.post('/:dept_id', async (req, res, next) => {
    if (req.body && req.body.city_hin) {
        await DB.insertFromDept('city', req.body, req.params.dept_id).then((data) => {
            res.json({
                success: true,
                result: data || {}
            })
        }, (err) => { return next(err) })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
})

// get city with dept_id
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('city', req.params.dept_id, null, ` city._id desc`, 100).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve || []
        })
    }, (err) => { return next(err) })
})

//  city get
router.get('/', async (req, res, next) => {
    await DB.getFullList('city').then(async (resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
        });
    }, (err) => { return next(err) });
});

// city update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'city._id = ' + req.body.query._id;
        await DB.update('city', req.body.set, condition, async (err, data) => {
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


// city delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('city', condition, (err, data) => {
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