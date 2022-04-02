//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  aawak add
router.post('/', async (req, res, next) => {
    if (req.body) {
        let aawak = {};
        await DB.insert('aawak', req.body, async (err, data) => {
            if (err) {
                console.log("aawwk entry", err);
                return next(err);
            }
            aawak = data;
        });

        let bachat = [];
        await DB.getList('bachat').then((resolve)=>{
            bachat = resolve;
        });

        res.json({
            success:true,
            aawak: aawak || {},
            bachat: bachat || {}
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

//aawak post with dept
router.post('/:dept_id', async (req, res, next) => {
    if (req.body) {
        await DB.insertFromDept('aawak', req.body, req.params.dept_id).then((data) => {
            // console.log("data", data);
            res.json({
                success: true,
                result: data || {}
            });
        }, (err) => {
            return next(err);
        });
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


//aawak get dept
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('aawak', req.params.dept_id).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve || [],
        });
    }, (err) => { return next(err) });
});

//pending aawak get dept
router.get('/pending/:dept_id', async (req, res, next) => {
    await DB.getPendingAawak(req.params.dept_id).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve || [],
        });
    }, (err) => { return next(err) });
});



//  aawak get 
router.get('/', async (req, res, next) => {
    let bachat = [];
    let aawak = [];
    await DB.getList('aawak').then((res) => {
        aawak = res || [];
    }, (err) => { return next(err) });
    await DB.getList('bachat').then((res) => {
        bachat = res || [];
    }, (err) => { return next(err) });
    res.json({
        success: true,
        result: { aawakEntry: aawak || [], bachatEntry: bachat || [] }
    });
});

//  aawak get
// router.get('/', async (req, res, next) => {
//     let aawak = [];
//     await DB.getList('aawak').then((resolve) => {
//         aawak = resolve || [];
//     }, (err) => { return next(err) });

//     res.json({
//         success: true,
//         result: res || []
//     });
// });

// aawak update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'aawak._id = ' + req.body.query._id;
        await DB.update('aawak', req.body.set, condition, async (err, data) => {
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


// aawak delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('aawak', condition, (err, data) => {
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