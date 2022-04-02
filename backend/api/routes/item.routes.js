//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  item add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.item_hin) {
        await DB.insert('item', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('item', data, (err, data) => { })
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

router.post('/:dept_id', async (req, res, next) => {
    if (req.body && req.body.item_hin) {
        await DB.insertFromDept('item', req.body, req.params.dept_id).then((data) => {

            res.json({
                success: true,
                result: data || []
            });
        }, (err) => {
            return next(err);
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

//  item get by dept
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('itemMix', req.params.dept_id).then((resolve) => {
        for(let i = 0; i < resolve.length; i++){
            
            resolve[i].subitems = (resolve[i].subitems != "[null]" ? JSON.parse(resolve[i].subitems) : []);
            resolve[i].categories = (resolve[i].categories != "[null]" ? JSON.parse(resolve[i].categories) : []);
        }
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});
//  item get by dept
router.get('/forConfig/:dept_id', async (req, res, next) => {
    await DB.getFullListForDeptConfig('item', req.params.dept_id).then((resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});

//  item get
router.get('/', async (req, res, next) => {
    await DB.getFullList('item').then((resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});

// item update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'item._id = ' + req.body.query._id;
        await DB.update('item', req.body.set, condition, async (err, data) => {
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


// item delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('item', condition, (err, data) => {
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