const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get
router.get('/:list_name', async (req, res, next) => {
    try {
        res.json({
            success: true,
            result: await DB.getList(req.params.list_name) || []
        });
    } catch (err) { next(err) };
});


//get as per department Done.
router.get('/all/:dept_id', async (req, res, next) => {
    try {
        let lists = {
        }

        if (req.params.dept_id) {
            lists.country = await DB.getList('country', { dept_id: req.params.dept_id }) || []
            lists.category = await DB.getList('category', { dept_id: req.params.dept_id }) || []
            lists.city = await DB.getList('city', { dept_id: req.params.dept_id }) || []
            await DB.getList('item', { full: true, dept_id: req.params.dept_id }).then((resolve) => {

                let subitem_count = 0;
                for (let i = 0; i < resolve.data.length; i++) {
                    resolve.data[i].categories = JSON.parse(resolve.data[i].categories);
                    resolve.data[i].categories_hin = JSON.parse(resolve.data[i].categories_hin);
                    DB.getList('subitem', { full: true, dept_id: req.params.dept_id, conditionString: ` subitem.item_id = ${resolve.data[i]._id}` }).then((subres) => {

                        for (let i = 0; i < subres.data.length; i++) {
                            subres.data[i].categories = JSON.parse(subres.data[i].categories);
                            subres.data[i].categories_hin = JSON.parse(subres.data[i].categories_hin);

                        }
                        subitem_count += subres.total_count;
                        resolve.data[i].subitems = subres.data;
                    });
                }
                lists.itemmix = { data: resolve.data, total_count: resolve.total_count }
            });

            lists.department = await DB.getList('department') || []
            lists.departmen_config = await DB.getList('department_config', { dept_id: req.params.dept_id }) || []
            lists.mm = await DB.getList('mm', { full: true, dept_id: req.params.dept_id }) || []
            lists.pbk = await DB.getList('pbk', { dept_id: req.params.dept_id }) || []
            lists.nimitt = await DB.getList('nimitt', { full: true, dept_id: req.params.dept_id }) || []
            lists.state = await DB.getList('state', { dept_id: req.params.dept_id }) || []
            lists.zone = await DB.getList('zone', { dept_id: req.params.dept_id }) || []
            lists.subitem_list = await DB.getList('subitem_list', { dept_id: req.params.dept_id }) || []
            lists.unit = await DB.getList('unit', { dept_id: req.params.dept_id }) || []
            lists.gender = await DB.getList('gender', { dept_id: req.params.dept_id }) || []
            lists.relation = await DB.getList('relation', { dept_id: req.params.dept_id }) || []
            lists.aawak_type = await DB.getList('aawak_type', { dept_id: req.params.dept_id }) || []
            lists.mm_type = await DB.getList('mm_type', { dept_id: req.params.dept_id }) || []
            lists.jawak_type = await DB.getList('jawak_type', { dept_id: req.params.dept_id }) || []
            lists.condition = await DB.getList('condition', { dept_id: req.params.dept_id }) || []
            lists.usage_list = await DB.getList('usage_list', { dept_id: req.params.dept_id }) || []
            lists.aawak_source = await DB.getList('aawak_source', { dept_id: req.params.dept_id }) || []
            res.json({
                success: true,
                result: lists
            })
        }
        else {
            res.json({
                success: true,
                result: lists
            })
        }
    } catch (err) { next(err) };
});

//get as per department Done.
router.get('/lot_no/:dept_id', async (req, res, next) => {
    try {
        let conditionString = `where aawak.dept_id = ${req.params.dept_id} AND lot_no IS NOT NULL order by _id`
        let lot_nos = await DB.db.prepare(DB.query.aawak.select_lot_no.replace('?', conditionString)).all();
        res.json({
            success: true,
            result: lot_nos
        })
    } catch (err) { next(err) };
});

module.exports = router;