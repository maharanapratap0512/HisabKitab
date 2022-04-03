//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  category add
router.post('/', async (req, res, next) => {
    if (req.body) {
        await DB.insert('bachat', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('bachat', data, (err, data) => { })
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

//  category get
router.get('/', async (req, res, next) => {
    await DB.getList('bachat').then((res) => {
        res.json({
            success: true,
            result: res || []
        });
    }, (err) => { return next(err) });
});

//  category get
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('bachatHome', req.params.dept_id).then((data) => {
        for(let i in data){
            data[i].bachat_qty = JSON.parse(data[i].bachat_qty);
            for(let bcht of data[i].bachat_qty){
                data[i][bcht.bachat_type_eng] = bcht.qty;
            }
        }
        res.json({
            success: true,
            result: data || []
        });
    }, (err) => { return next(err) });
});


// category update
// router.put('/', async (req, res, next) => {
//     if (req.body.set && req.body.query) {
//         let condition = '_id = ' + req.body.query._id;
//         await DB.update('bachat', req.body.set, condition, async (err, data) => {
//             if (err) {
//                 return next(err);
//             }
//             // await DB.updateToCache('bachat', req.body.set, condition, (err) => { })
//             await DB.select('bachat', ['*'], condition).then((resolve) => {
//                 res.json({
//                     success: true,
//                     result: resolve || []
//                 });
//             }, (err)=>{
//                 return next(err);
//             });
//         });
//     }
//     else {
//         return next(new Error('Id not found.'))
//     }
// });


// category delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('bachat', condition, (err, data) => {
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