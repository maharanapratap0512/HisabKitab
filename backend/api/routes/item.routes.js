const router = require('express').Router();
const BaseTable = require('../database/base.table');
const HmpService = require('../services/hmp.service');
const PrastavService = require('../services/prastav.service');
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const hmp_batch = new BaseTable('hmp_batch');
const Fn = require('../database/functions');


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
                // console.log(resolve.data[i]._id);
                resolve.data[i].subitems = (resolve.data[i].subitems != "[null]" ? JSON.parse(resolve.data[i].subitems) : []);
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : []);
                resolve.data[i].categories = (resolve.data[i].categories != "[null]" ? JSON.parse(resolve.data[i].categories) : []);
                resolve.data[i].item_aliases = (resolve.data[i].item_aliases && resolve.data[i].item_aliases != "[null]" ? JSON.parse(resolve.data[i].item_aliases) : []);
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
            itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` (json_each.value = ${req.body.categories} OR item._id IN (SELECT item_id FROM subitem, json_each(subitem.categories) WHERE json_each.value = ${req.body.categories}))`;
            sitemCondition += (sitemCondition.trim() != `` ? ` AND` : ``) + ` json_each.value = ${req.body.categories}`;
        }
        if (req.body.subitem_list_id) {
            sitemCondition += (sitemCondition.trim() != `` ? ` AND` : ``) + ` subitem.subitem_list_id = ${req.body.subitem_list_id}`;
            itemCondition += (itemCondition.trim() != `` ? ` AND` : ``) + ` item._id IN (SELECT item_id FROM subitem WHERE subitem.subitem_list_id = ${req.body.subitem_list_id})`;
        }
        if (itemCondition.trim() == `` && sitemCondition.trim() == ``) {
            orderBy = "item._id";
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
                resolve.data[i].categories = JSON.parse(resolve.data[i].categories);
                resolve.data[i].item_aliases = ((resolve.data[i].item_aliases && resolve.data[i].item_aliases != "[null]") ? JSON.parse(resolve.data[i].item_aliases) : []);
                subitem_count += resolve.data[i].subitems.length;

                for (let j = 0; j < resolve.data[i].subitems.length; j++) {
                    resolve.data[i].subitems[j].categories = JSON.parse(resolve.data[i].subitems[j].categories)
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

// transfer all item references from one item to another
router.put('/transfer/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        const { from_id, to_id } = req.body;
        if (!from_id || !to_id) return next(new Error('from_id and to_id are required'));

        await Fn.begin();

        // 1. Update AAWAK records using Fn.updateAJ
        const aawaks = await DB.getList('aawak', { conditionString: `aawak.item_id = ${from_id} AND aawak.dept_id = ${dept_id}`, limit: -1 });
        if (aawaks.data) {
            for (let awk of aawaks.data) {
                let awkNew = { ...awk, item_id: parseInt(to_id) };
                await Fn.updateAJ(awkNew, 'aawak', awk);
            }
        }

        // 2. Update JAWAK records using Fn.updateAJ
        const jawaks = await DB.getList('jawak', { conditionString: `jawak.item_id = ${from_id} AND jawak.dept_id = ${dept_id}`, limit: -1 });
        if (jawaks.data) {
            for (let jwk of jawaks.data) {
                let jwkNew = { ...jwk, item_id: parseInt(to_id) };
                await Fn.updateAJ(jwkNew, 'jawak', jwk);
            }
        }

        // 3. Update prastav tables using PrastavService
        try {
            await PrastavService.transferReferences('item', from_id, to_id);
        } catch (e) {
            console.log(`Transfer (prastav service): error`, e.message);
        }

        // 4. Update HMP batches using HmpService
        try {
            await HmpService.transferReferences('item', from_id, to_id, dept_id);
        } catch (e) {
            console.log(`Transfer (hmp service): error`, e.message);
        }

        // 5. For other tables (keep dept_id check)
        const otherUpdates = [
            { table: 'product', cols: ['item_id'] },
            { table: 'subitem', cols: ['item_id'] },
        ];

        // Try hmp_batch if it exists
        try {
            otherUpdates.push({ table: 'hmp_batch', cols: ['item_id'] });
        } catch (e) { }

        for (let u of otherUpdates) {
            for (let col of u.cols) {
                try {
                    DB.db.prepare(
                        `UPDATE ${u.table} SET ${col} = ? WHERE ${col} = ? AND dept_id = ?`
                    ).run(parseInt(to_id), parseInt(from_id), parseInt(dept_id));
                } catch (e) {
                    console.log(`Transfer: skipping ${u.table}.${col}`, e.message);
                }
            }
        }

        // 5. Cleanup bachat for old ID (pre-delete)
        try {
            DB.db.prepare(`DELETE FROM bachat WHERE item_id = ? AND dept_id = ?`).run(parseInt(from_id), parseInt(dept_id));
            DB.db.prepare(`DELETE FROM bachat_new WHERE item_id = ? AND dept_id = ?`).run(parseInt(from_id), parseInt(dept_id));
        } catch (e) { }

        await Fn.commit();
        res.json({ success: true, message: `All references transferred from Item ${from_id} to Item ${to_id}` });
    } catch (err) {
        await Fn.rollback();
        next(err);
    }
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