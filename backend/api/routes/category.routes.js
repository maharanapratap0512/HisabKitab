const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();


// get category all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('category').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get category 
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('category', { dept_id: req.params.dept_id, order: `_id asc` }).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// post category 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.category_hin) {
            await DB.insert('category', req.body, req.params.dept_id).then((data) => {
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

// post category 
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


// update category 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('category', req.body.set, req.body.query._id).then(async (data) => {
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

// update category 
router.put('/import/', async (req, res, next) => {
    try {
        if (req.body) {
            let stmt = DB.db.prepare(DB.query.category.import);
            for (let i in req.body) {
                if (req.body[i].category_eng == undefined) {
                    req.body[i].category_eng = null;
                }
                else if (req.body[i].category_eng.trim() == 'NULL' || req.body[i].category_eng.trim() == '') {
                    req.body[i].category_eng = null;
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


// delete category 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('category', req.params.id).then((data) => {
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

// transfer all category references from one category to another
router.put('/transfer/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        const { from_id, to_id } = req.body;
        if (!from_id || !to_id) return next(new Error('from_id and to_id are required'));

        const Fn = require('../database/functions');
        await Fn.begin();

        // Category IDs are stored in JSON arrays in item and subitem tables
        // We find all items/subitems that contain the old category ID and update them
        const tables = ['item', 'subitem'];
        for (const table of tables) {
            const rows = DB.db.prepare(`SELECT _id, categories FROM ${table} WHERE categories LIKE ?`).all(`%${from_id}%`);
            for (const row of rows) {
                try {
                    let cats = JSON.parse(row.categories || '[]');
                    if (Array.isArray(cats)) {
                        let changed = false;
                        for (let i = 0; i < cats.length; i++) {
                            if (Number(cats[i]) === Number(from_id)) {
                                cats[i] = Number(to_id);
                                changed = true;
                            }
                        }
                        if (changed) {
                            // Deduplicate
                            cats = [...new Set(cats)];
                            DB.db.prepare(`UPDATE ${table} SET categories = ? WHERE _id = ?`).run(JSON.stringify(cats), row._id);
                        }
                    }
                } catch (e) {
                    console.log(`Category Transfer error in ${table} ID ${row._id}:`, e.message);
                }
            }
        }

        await Fn.commit();
        res.json({ success: true, message: `All references transferred from Category ${from_id} to Category ${to_id}` });
    } catch (err) {
        await Fn.rollback();
        next(err);
    }
});


module.exports = router;