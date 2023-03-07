const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get bachat_history all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('bachat_history').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get bachat_history 
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('bachat_history', { dept_id: req.params.dept_id }).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// post bachat_history 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            await DB.insert('bachat_history', req.body, req.params.dept_id).then((data) => {
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

// post bachat_history 
// router.post('/import/:dept_id', async (req, res, next) => {
//     try {
//         if (req.body && req.body.length > 0) {
//             let istmt = DB.db.prepare(DB.query.bachat_history.import);
//             let ustmt = DB.db.prepare(DB.query.bachat_history.update);
//             for (let i in req.body) {
//                 if (req.body[i].yes) {
//                     if (req.body[i].status == 'insert') {
//                         let ires = istmt.run(req.body[i]);
//                         if (ires) {
//                             req.body[i].new_id = ires.lastInsertRowid;
//                         }
//                     }
//                     else if (req.body[i].status == 'update') {
//                         let ures = ustmt.run(req.body[i]);
//                         if (ures) {
//                             req.body[i].new_id == ures.lastInsertRowid;
//                         }
//                     }
//                 }
//             }
//             res.json({
//                 success: true,
//                 result: req.body
//             })
//         }
//         else {
//             return next(new Error('Please fill required fields.'))
//         }
//     } catch (err) { next(err) };
// });


// update bachat_history 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('bachat_history', req.body.set, req.body.query._id).then(async (data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});


// delete bachat_history 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('bachat_history', req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            })
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});


module.exports = router;