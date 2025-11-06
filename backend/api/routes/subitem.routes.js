const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();



// get subitem all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('subitem').then((resolve) => {
            for (let i = 0; i < resolve.data.length; i++) {
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : []);
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get subitem 
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('subitem', { full: true, dept_id: req.params.dept_id, orderBy: "updated_at desc" }).then((resolve) => {
            for (let i = 0; i < resolve.data.length; i++) {
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : []);
                resolve.data[i].categories = resolve.data[i].categories ? JSON.parse(resolve.data[i].categories) : [];
                resolve.data[i].categories_hin = resolve.data[i].categories_hin ? JSON.parse(resolve.data[i].categories_hin) : [];
                resolve.data[i].categories_eng = resolve.data[i].categories_eng ? JSON.parse(resolve.data[i].categories_eng) : [];
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});

// filter subitem 
router.put('/:dept_id', async (req, res, next) => {
    try {

        let conditionString = '', conditions = [];
        if (req.body.item_id && req.body.item_id.length > 0)
            conditions.push(`subitem.item_id in (${req.body.item_id.join(',')})`)
        if (req.body.subitem_list_id && req.body.subitem_list_id.length > 0)
            conditions.push(`subitem.subitem_list_id in (${req.body.subitem_list_id.join(',')})`)

        conditionString = conditions.length > 0 ? `(${conditions.join(' OR ')})` : `1=1`;

        await DB.getList('subitem', { full: true, conditionString: conditionString, dept_id: req.params.dept_id, orderBy: "updated_at desc" }).then((resolve) => {
            for (let i = 0; i < resolve.data.length; i++) {
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : []);
                resolve.data[i].categories = resolve.data[i].categories ? JSON.parse(resolve.data[i].categories) : [];
                resolve.data[i].categories_hin = resolve.data[i].categories_hin ? JSON.parse(resolve.data[i].categories_hin) : [];
                resolve.data[i].categories_eng = resolve.data[i].categories_eng ? JSON.parse(resolve.data[i].categories_eng) : [];
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});



// post subitem 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            req.body.document = JSON.stringify(req.body.document ? req.body.document : []);
            req.body.categories = JSON.stringify(req.body.categories ? req.body.categories : []);
            await DB.insert('subitem', req.body, req.params.dept_id).then((data) => {
                data.document = data.document ? JSON.parse(data.document) : [];
                data.categories = data.categories ? JSON.parse(data.categories) : [];
                data.categories_hin = data.categories_hin ? JSON.parse(data.categories_hin) : [];
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


// update subitem 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            req.body.set.document = JSON.stringify(req.body.set.document ? req.body.set.document : []);
            req.body.set.categories = JSON.stringify(req.body.set.categories ? req.body.set.categories : []);
            await DB.update('subitem', req.body.set, req.body.query._id).then(async (data) => {
                data.document = data.document ? JSON.parse(data.document) : [];
                data.categories = data.categories ? JSON.parse(data.categories) : [];
                data.categories_hin = data.categories_hin ? JSON.parse(data.categories_hin) : [];
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});

// toggle lock
router.put('/lock/', async (req, res, next) => {
    try {
        if (req.body._id) {
            await DB.update('subitem', req.body, req.body._id, 'update_lock').then(async (data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


// delete subitem 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('subitem', req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            })
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


module.exports = router;