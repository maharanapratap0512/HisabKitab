const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get country all
router.get('/:id?', async (req, res, next) => {
    await DB.getList('country').then(async (data) => {
        res.json({
            success: true,
            result: data.data || [],
            total_count: (data.total_count ? data.total_count : 0),
        });
    });
});


// post country 
router.post('/', async (req, res, next) => {
    try {
        if (req.body && req.body.country_hin) {
            await DB.insert('country', req.body).then(async (data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});

// update country 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('country', req.body.set, req.body.query._id).then(async (data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Id or Data not found.'))
        }
    } catch (err) { next(err) };
});


// delete country 
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        await DB.delete('country', req.params.id).then((data) => {
            res.json({
                success: true,
                result: data
            });
        });
    }
    else {
        return next(new Error('Id not found.'))
    }
});


module.exports = router;