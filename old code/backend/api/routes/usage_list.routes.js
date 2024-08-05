const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get usage_list all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('usage_list').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get usage_list 
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('usage_list', { dept_id: req.params.dept_id, order: `usage_eng desc` }).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// post usage_list 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.usage_hin) {
            await DB.insert('usage_list', req.body, req.params.dept_id).then((data) => {
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

// post usage_list 
router.post('/import/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.length > 0) {
            let istmt = DB.db.prepare(DB.query.usage_list.import);
            let ustmt = DB.db.prepare(DB.query.usage_list.update);
            for (let i in req.body) {
                if (req.body[i].yes) {
                    if (req.body[i].status == 'insert') {
                        let ires = istmt.run(req.body[i]);
                        if (ires) {
                            req.body[i].new_id = ires.lastInsertRowid;
                        }
                    }
                    else if (req.body[i].status == 'update') {
                        let ures = ustmt.run(req.body[i]);
                        if (ures) {
                            req.body[i].new_id == ures.lastInsertRowid;
                        }
                    }
                }
            }
            res.json({
                success: true,
                result: req.body
            })
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update usage_list 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('usage_list', req.body.set, req.body.query._id).then(async (data) => {
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

// update usage_list 
router.put('/import/', async (req, res, next) => {
    try {
        if (req.body) {
            let stmt = DB.db.prepare(DB.query.usage_list.import);
            for (let i in req.body) {
                if (req.body[i].usage_eng == undefined) {
                    req.body[i].usage_eng = null;
                }
                else if (req.body[i].usage_eng.trim() == 'NULL' || req.body[i].usage_eng.trim() == '') {
                    req.body[i].usage_eng = null;
                }
                console.log(req.body[i]);
                let res = stmt.run(req.body[i])
            }
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});


// delete usage_list 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('usage_list', req.params.id).then((data) => {
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