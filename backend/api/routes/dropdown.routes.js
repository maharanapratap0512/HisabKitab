const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const BaseTable = require('../database/base.table');

const Item = new BaseTable('item');

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
        let lists = {};

        if (req.params.dept_id) {
            // Parallel fetch all independent lists
            const [
                country, category, city, department, departmen_config, mm, pbk,
                nimitt, state, zone, district, subitem_list, unit, gender, relation,
                aawak_type, mm_type, jawak_type, condition, usage_list, usage_type, aawak_source
            ] = await Promise.all([
                DB.getList('country', { dept_id: req.params.dept_id }),
                DB.getList('category', { dept_id: req.params.dept_id }),
                DB.getList('city', { dept_id: req.params.dept_id }),
                // DB.getList('item', { full: true, dept_id: req.params.dept_id }),
                DB.getList('department'),
                DB.getList('department_config', { dept_id: req.params.dept_id }),
                DB.getList('mm', { full: true, dept_id: req.params.dept_id }),
                DB.getList('pbk', { dept_id: req.params.dept_id }),
                DB.getList('nimitt', { full: true, dept_id: req.params.dept_id }),
                DB.getList('state', { dept_id: req.params.dept_id }),
                DB.getList('zone', { dept_id: req.params.dept_id }),
                DB.getList('district', { full: true, dept_id: req.params.dept_id }),
                DB.getList('subitem_list', { dept_id: req.params.dept_id }),
                DB.getList('unit', { dept_id: req.params.dept_id }),
                DB.getList('gender', { dept_id: req.params.dept_id }),
                DB.getList('relation', { dept_id: req.params.dept_id }),
                DB.getList('aawak_type', { dept_id: req.params.dept_id }),
                DB.getList('mm_type', { dept_id: req.params.dept_id }),
                DB.getList('jawak_type', { dept_id: req.params.dept_id }),
                DB.getList('condition', { dept_id: req.params.dept_id }),
                DB.getList('usage_list', { dept_id: req.params.dept_id }),
                DB.getList('usage_type', { dept_id: req.params.dept_id }),
                DB.getList('aawak_source', { dept_id: req.params.dept_id })
            ]);

            // Assign with fallbacks
            lists.country = country || [];
            lists.category = category || [];
            lists.city = city || [];
            lists.department = department || [];
            lists.departmen_config = departmen_config || [];
            lists.mm = mm || [];
            lists.pbk = pbk || [];
            lists.nimitt = nimitt || [];
            lists.state = state || [];
            lists.zone = zone || [];
            lists.district = district || [];
            lists.subitem_list = subitem_list || [];
            lists.unit = unit || [];
            lists.gender = gender || [];
            lists.relation = relation || [];
            lists.aawak_type = aawak_type || [];
            lists.mm_type = mm_type || [];
            lists.jawak_type = jawak_type || [];
            lists.condition = condition || [];
            lists.usage_list = usage_list || [];
            lists.usage_type = usage_type || [];
            lists.aawak_source = aawak_source || [];

            // Process items and subitems in parallel
            await DB.getList('itemmix', { full: true, dept_id: req.params.dept_id }).then((resolve) => {
                let subitem_count = 0;
                for (let i = 0; i < resolve.data.length; i++) {
                    resolve.data[i].subitems = (resolve.data[i].subitems != "[null]" ? JSON.parse(resolve.data[i].subitems) : []);
                    resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : []);
                    resolve.data[i].categories = (resolve.data[i].categories != "[null]" ? JSON.parse(resolve.data[i].categories) : []);
                    // resolve.data[i].categories_hin = (resolve.data[i].categories_hin != "[null]" ? JSON.parse(resolve.data[i].categories_hin) : []);
                    for (let j in resolve.data[i].subitems) {
                        // resolve.data[i].subitems[j].categories = (resolve.data[i].subitems[j].categories != "[null]" ? JSON.parse(resolve.data[i].subitems[j].categories) : []);
                        resolve.data[i].subitems[j].categories = ((resolve.data[i].subitems[j].categories_hin && typeof resolve.data[i].subitems[j].categories_hin == "string" && resolve.data[i].subitems[j].categories_hin != "[null]") ? JSON.parse(resolve.data[i].subitems[j].categories_hin) : []);
                    }
                    subitem_count += resolve.data[i].subitems.length;
                }
                lists.itemmix = {
                    data: resolve.data || [],
                    total_count: resolve.total_count,
                    subitem_count: subitem_count
                };
            });
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
        for (let i in lot_nos) {
            lot_nos[i].icategories = (lot_nos[i].icategories ? JSON.parse(lot_nos[i].icategories) : []);
            lot_nos[i].scategories = (lot_nos[i].scategories ? JSON.parse(lot_nos[i].scategories) : []);
        }
        res.json({
            success: true,
            result: lot_nos
        })
    } catch (err) { next(err) };
});

module.exports = router;