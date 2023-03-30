const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get item all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('item').then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});

// get item
router.get('/:dept_id', async (req, res, next) => {
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    try {
        await DB.getList('itemmix', { full: true, dept_id: req.params.dept_id }).then((resolve) => {
            let subitem_count = 0;
            for (let i = 0; i < resolve.data.length; i++) {
                resolve.data[i].subitems = (resolve.data[i].subitems != "[null]" ? JSON.parse(resolve.data[i].subitems) : []);
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : []);
                resolve.data[i].categories = (resolve.data[i].categories != "[null]" ? JSON.parse(resolve.data[i].categories) : []);
                subitem_count += resolve.data[i].subitems.length;
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count,
                subitem_count: subitem_count
            });
        });
    } catch (err) { next(err) };
});


// get item by dept + filter + pageNo
router.put('/itemmix/:dept_id', async (req, res, next) => {
    try {
        let itemCondition = ``;
        let sitemCondition = ``;
        // let subitemCondition = ``;

        let orderBy = null, limit = null, offset = null, page = 1;

        if (req.body._id) {
            itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` item._id = ${req.body._id}`;
        }
        if (req.body.active) {
            itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` item.active = ${req.body.active}`;
        }
        if (req.body.categories) {
            itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` (json_each.value = ${req.body.categories} OR subitems <> '[]')`;
            sitemCondition += (sitemCondition.trim() != `` ? ` AND` : ``) + ` json_each.value = ${req.body.categories}`;
        }
        if (req.body.subitem_list_id) {
            sitemCondition += (sitemCondition.trim() != `` ? ` AND` : ``) + ` subitem.subitem_list_id = ${req.body.subitem_list_id}`;
            itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` subitems <> '[]'`;
        }
        if (itemCondition.trim() == `` && sitemCondition.trim() == ``) {
            orderBy = "item._id desc";
        }
        if (req.body.pageNo && req.body.pageNo > 0) {
            offset = (req.body.pageNo - 1) * limit;
            page = req.body.pageNo;
        }
        await DB.getList('itemmix', { full: true, dept_id: req.params.dept_id, conditionString: itemCondition, sconditionString: sitemCondition, limit: limit, offset: offset, orderBy: orderBy }).then((resolve) => {
            let subitem_count = 0;
            for (let i = 0; i < resolve.data.length; i++) {
                resolve.data[i].subitems = ((resolve.data[i].subitems && resolve.data[i].subitems != "[null]") ? JSON.parse(resolve.data[i].subitems) : []);
                resolve.data[i].document = ((resolve.data[i].document && resolve.data[i].document != "[null]") ? JSON.parse(resolve.data[i].document) : []);
                resolve.data[i].categories = JSON.parse(resolve.data[i].categories)
                resolve.data[i].categories_hin = JSON.parse(resolve.data[i].categories_hin)
                // resolve.data[i].categories_eng = JSON.parse(resolve.data[i].categories_eng)
                subitem_count += resolve.data[i].subitems.length;
                
                for (let j = 0; j < resolve.data[i].subitems.length; j++) {
                    resolve.data[i].subitems[j].categories_hin = ((resolve.data[i].subitems[j].categories_hin && typeof resolve.data[i].subitems[j].categories_hin == "string"  && resolve.data[i].subitems[j].categories_hin != "[null]") ? JSON.parse(resolve.data[i].subitems[j].categories_hin) : []);
                }
            }

            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.data.length,
                subitem_count: subitem_count
            });
        });
    } catch (err) { console.log(err); next(err) };
});

// post item
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.item_hin) {
            req.body.document = JSON.stringify(req.body.document ? req.body.document : []);
            req.body.categories = JSON.stringify(req.body.categories ? req.body.categories : []);
            await DB.insert('item', req.body, req.params.dept_id).then((data) => {
                data.document = data.document ? JSON.parse(data.document) : [];
                data.categories = data.categories ? JSON.parse(data.categories) : [];
                data.categories_hin = data.categories_hin ? JSON.parse(data.categories_hin) : [];
                data.subitems = data.subitems ? JSON.parse(data.subitems) : [];
                res.json({
                    success: true,
                    result: data || {}
                });
            })
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update item 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            req.body.set.document = JSON.stringify(req.body.set.document ? req.body.set.document : []);
            req.body.set.categories = JSON.stringify(req.body.set.categories ? req.body.set.categories : []);
            await DB.update('item', req.body.set, req.body.query._id).then(async (data) => {
                data.document = data.document ? JSON.parse(data.document) : [];
                data.categories = data.categories ? JSON.parse(data.categories) : [];
                data.categories_hin = data.categories_hin ? JSON.parse(data.categories_hin) : [];
                data.subitems = data.subitems ? JSON.parse(data.subitems) : [];
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
            await DB.update('item', req.body, req.body._id, 'update_lock').then(async (data) => {
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

// item delete
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('item', req.params.id).then((data) => {
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