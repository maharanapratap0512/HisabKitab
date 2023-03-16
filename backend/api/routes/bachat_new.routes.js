const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get bachat_new all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('bachat_new').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get bachat_new 
router.get('/:dept_id', async (req, res, next) => {
    try {
        let sql = DB.query.bachat_new.select_all.replace('?', ` where dept_id = ${req.params.dept_id}`);
        let bachat = [];
        let stmt = DB.db.prepare(sql);
        for(let row of stmt.iterate()){
            for(let key of Object.keys(row)){
                if(key.includes('arr')){
                    row[key] = row[key] ? JSON.parse(row[key]) : []
                }
            }
            bachat.push(row);
        }
        res.json({
            success:true,
            result: bachat
        })
    } catch (err) { console.log(err); next(err) };
});


// post bachat_new 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            await DB.insert('bachat_new', req.body, req.params.dept_id).then((data) => {
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

// post bachat_new 
// router.post('/import/:dept_id', async (req, res, next) => {
//     try {
//         if (req.body && req.body.length > 0) {
//             let istmt = DB.db.prepare(DB.query.bachat_new.import);
//             let ustmt = DB.db.prepare(DB.query.bachat_new.update);
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


// update bachat_new 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('bachat_new', req.body.set, req.body.query._id).then(async (data) => {
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


// delete bachat_new 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('bachat_new', req.params.id).then((data) => {
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