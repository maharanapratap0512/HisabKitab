const router = require('express').Router();
const BaseTable = require('../database/base.table');
const HmpService = require('../services/hmp.service');
const PrastavService = require('../services/prastav.service');
const Subitem = new BaseTable('subitem');
const hmp_batch = new BaseTable('hmp_batch');
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const Fn = require('../database/functions');



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


// transfer all subitem references from one subitem to another
router.put('/transfer/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        const { from_id, to_id } = req.body;
        if (!from_id || !to_id) return next(new Error('from_id and to_id are required'));

        await Fn.begin();

        // 1. Update AAWAK records using Fn.updateAJ
        const aawaks = await DB.getList('aawak', { conditionString: `aawak.subitem_id = ${from_id} AND aawak.dept_id = ${dept_id}`, limit: -1 });
        if (aawaks.data) {
            for (let awk of aawaks.data) {
                let awkNew = { ...awk, subitem_id: parseInt(to_id) };
                await Fn.updateAJ(awkNew, 'aawak', awk);
            }
        }

        // 2. Update JAWAK records using Fn.updateAJ
        const jawaks = await DB.getList('jawak', { conditionString: `jawak.subitem_id = ${from_id} AND jawak.dept_id = ${dept_id}`, limit: -1 });
        if (jawaks.data) {
            for (let jwk of jawaks.data) {
                let jwkNew = { ...jwk, subitem_id: parseInt(to_id) };
                await Fn.updateAJ(jwkNew, 'jawak', jwk);
            }
        }

        // 3. Update prastav tables using PrastavService
        try {
            await PrastavService.transferReferences('subitem', from_id, to_id);
        } catch (e) {
            console.log(`Transfer (prastav service): error`, e.message);
        }

        // 4. Update HMP batches using HmpService
        try {
            await HmpService.transferReferences('subitem', from_id, to_id, dept_id);
        } catch (e) {
            console.log(`Transfer (hmp service): error`, e.message);
        }

        // 5. For other simple tables (keep dept_id check)
        const otherUpdates = [
            { table: 'product', cols: ['subitem_id'] },
        ];

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
            DB.db.prepare(`DELETE FROM bachat WHERE subitem_id = ? AND dept_id = ?`).run(parseInt(from_id), parseInt(dept_id));
            DB.db.prepare(`DELETE FROM bachat_new WHERE subitem_id = ? AND dept_id = ?`).run(parseInt(from_id), parseInt(dept_id));
        } catch (e) { }

        await Fn.commit();
        res.json({ success: true, message: `All references transferred from Subitem ${from_id} to Subitem ${to_id}` });
    } catch (err) {
        await Fn.rollback();
        next(err);
    }
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