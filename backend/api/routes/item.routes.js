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
        let itemCondition = req.params.dept_id == 1 ? `` : `((select config_value from department_config where dept_id = ${req.params.dept_id} AND config_key = 'item') LIKE '%,'||item._id||',%' OR (select config_value from department_config where dept_id = ${req.params.dept_id} AND config_key = 'subitem') LIKE '%,'||si._id||',%')`;
        // let subitemCondition = ``;

        let orderBy = null, limit = null, offset = null, page = 1;

        if (req.body._id) {
            itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` item._id = ${req.body._id}`;
        }
        if (req.body.category_id) {
            itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` ${req.body.category_id} in (item.category_id, si.category_id)`;
        }
        if (req.body.subitem_list_id) {
            itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` si.subitem_list_id = ${req.body.subitem_list_id}`;
        }
        if (itemCondition.trim() == ``) {
            orderBy = "item._id desc";
        }
        if (req.body.pageNo && req.body.pageNo > 0) {
            offset = (req.body.pageNo - 1) * limit;
            page = req.body.pageNo;
        }
        await DB.getList('itemmix', { full: true, dept_id: req.params.dept_id, conditionString: itemCondition, limit: limit, offset: offset }).then((resolve) => {
            let subitem_count = 0;
            console.log("resolve",resolve);
            console.log("resolve.length",resolve.length);
            for (let i = 0; i < resolve.data.length; i++) {

                resolve.data[i].subitems = (resolve.data[i].subitems != "[null]" ? JSON.parse(resolve.data[i].subitems) : []);
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

// post item
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.item_hin) {
            await DB.insert('item', req.body, req.params.dept_id).then((data) => {
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
            await DB.update('item', req.body.set, req.body.query._id).then(async (data) => {
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