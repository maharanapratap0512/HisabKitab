//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  support_list add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.list_type && req.body.list_name_eng) {
        await DB.insert('support_list', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('support_list', data, (err, data) => { })
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

//  support_list get
router.get('/', async (req, res, next) => {
    await DB.getList('support_list').then((response) => {
        res.json({
            success: true,
            result: response || []
        });
    }, (err) => { return next(err) });
});

//  support_list get
router.get('/ajtypes/:dept_id', async (req, res, next) => {
    await DB.getAJtypeByDept(req.params.dept_id).then((response) => {
        res.json({
            success: true,
            result: response || []
        });
    }, (err) => { return next(err) });
});

//  support_list get
router.get('/ajtypes/forConfig/:dept_id', async (req, res, next) => {
    await DB.getAJtypeForConfig(req.params.dept_id).then((response) => {
        res.json({
            success: true,
            result: response || []
        });
    }, (err) => { return next(err) });
});

// support_list update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'support_list._id = ' + req.body.query._id;
        await DB.update('support_list', req.body.set, condition, async (err, data) => {
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


// support_list delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('support_list', condition, (err, data) => {
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