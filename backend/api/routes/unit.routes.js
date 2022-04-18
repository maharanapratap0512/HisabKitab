//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  unit add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.unit_short) {
        await DB.insert('unit', req.body, async (err, data) => {
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
        return next(new Error('Please fill required fields.'))
    }
});

//  unit get
router.get('/', async (req, res, next) => {
    await DB.getList('unit').then((resolve) => {
        res.json({
            success: true,
            result: resolve|| []
        });
    },(err)=>{ return next(err)});
});

// unit update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'unit._id = ' + req.body.query._id;
        await DB.update('unit', req.body.set, condition, async (err, data) => {
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


// unit delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('unit', condition, (err, data) => {
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