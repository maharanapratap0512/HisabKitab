const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get import_history all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('import_history').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get import_history 
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('import_history', {full:true, dept_id: req.params.dept_id }).then(async (resolve) => {
            for(let i in resolve.data){
                resolve.data[i].monthly_detail = resolve.data[i].monthly_detail ? JSON.parse(resolve.data[i].monthly_detail) : [];
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// post import_history 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.category_hin) {
            await DB.insert('import_history', req.body, req.params.dept_id).then((data) => {
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

// post import_history 
router.post('/import/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.length > 0) {
            let istmt = DB.db.prepare(DB.query.category.import);
            let ustmt = DB.db.prepare(DB.query.category.update);
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


// update import_history 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('import_history', req.body.set, req.body.query._id).then(async (data) => {
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

// update import_history 
router.put('/import/', async (req, res, next) => {
    try {
        if (req.body) {
            let stmt = DB.db.prepare(DB.query.subitem_list.import);
            for (let i in req.body) {
                if (req.body[i].subitem_eng == undefined) {
                    req.body[i].subitem_eng = null;
                }
                else if (req.body[i].subitem_eng.trim() == 'NULL' || req.body[i].subitem_eng.trim() == '') {
                    req.body[i].subitem_eng = null;
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


// delete import_history 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('import_history', req.params.id).then((data) => {
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