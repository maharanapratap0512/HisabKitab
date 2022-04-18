//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  state add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.state_hin) {
        await DB.insert('state', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('state', data, (err, data) => { })
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

//  state get
router.get('/', async (req, res, next) => {
    await DB.getFullList('state').then((resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
        });
    }, (err) => { return next(err) });
});

// state update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'state._id = ' + req.body.query._id;
        await DB.update('state', req.body.set, condition, async (err, data) => {
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


// state delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('state', condition, (err, data) => {
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