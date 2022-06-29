const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  entry_type add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.entry_type_hin) {
        await DB.insert('entry_type', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('entry_type', data, (err, data) => { })
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

//  entry_type get
router.get('/', async (req, res, next) => {
    await DB.getList('entry_type').then((resolve) => {
        res.json({
            success: true,
            result: resolve|| []
        });
    },(err)=>{ return next(err)});
});

// entry_type update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = '_id = ' + req.body.query._id;
        await DB.update('entry_type', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.updateToCache('entry_type', req.body.set, condition, (err) => { })
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


// entry_type delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('entry_type', condition, (err, data) => {
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