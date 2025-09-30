const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();



/// get dictionary 
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('dictionary').then(async (data) => {
            res.json({
                success: true,
                result: data.data || [],
                total_count: (data.total_count ? data.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// post dictionary 
router.post('/', async (req, res, next) => {
    try {

        if (req.body && req.body.type && req.body.name && req.body.id) {
            let obj = {
                ...DB.tbInterface.dictionary,
                ...req.body,
            }
            if (obj.type == 'pbk') {
                obj.name = obj.pbk ? JSON.stringify(obj.pbk) : null;
            }
            await DB.insert('dictionary', obj).then(async (data) => {
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


// update dictionary 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('dictionary', req.body.set, req.body.query._id).then(async (data) => {
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


// delete dictionary 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('dictionary', req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});



module.exports = router;