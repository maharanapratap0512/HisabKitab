const router = require('express').Router();
const BaseTable = require('../database/base.table');
const HmpService = require('../services/hmp.service');
const PrastavService = require('../services/prastav.service');
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const hmp_batch = new BaseTable('hmp_batch');
const Fn = require('../database/functions');
// ── Simple table instances ──
const MM = new BaseTable('mm');

// get mm
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('mm').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});

// get mm dept
router.get('/:dept_id', async (req, res, next) => {
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    try {
        await DB.getList('mm', { full: true, dept_id: req.params.dept_id }).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});



// post mm 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.mm_hin) {
            await DB.insert('mm', req.body, req.params.dept_id).then((data) => {
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


// update mm 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('mm', req.body.set, req.body.query._id).then(async (data) => {
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
            await DB.update('mm', req.body, req.body._id, 'update_lock').then(async (data) => {
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


// transfer all mm references from one mm to another
router.put('/transfer/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        const { from_id, to_id } = req.body;
        if (!from_id || !to_id) return next(new Error('from_id and to_id are required'));

        await Fn.begin();

        // 1. Update AAWAK records using Fn.updateAJ
        const aawaks = await DB.getList('aawak', { conditionString: `aawak.mm_id = ${from_id} AND aawak.dept_id = ${dept_id}`, limit: -1 });
        if (aawaks.data) {
            for (let awk of aawaks.data) {
                let awkNew = { ...awk, mm_id: parseInt(to_id) };
                await Fn.updateAJ(awkNew, 'aawak', awk);
            }
        }

        const aawaks2 = await DB.getList('aawak', { conditionString: `aawak.aawak_mm_id = ${from_id} AND aawak.dept_id = ${dept_id}`, limit: -1 });
        if (aawaks2.data) {
            for (let awk of aawaks2.data) {
                let awkNew = { ...awk, aawak_mm_id: parseInt(to_id) };
                await Fn.updateAJ(awkNew, 'aawak', awk);
            }
        }

        // 2. Update JAWAK records using Fn.updateAJ
        const jawaks = await DB.getList('jawak', { conditionString: `jawak.mm_id = ${from_id} AND jawak.dept_id = ${dept_id}`, limit: -1 });
        if (jawaks.data) {
            for (let jwk of jawaks.data) {
                let jwkNew = { ...jwk, mm_id: parseInt(to_id) };
                await Fn.updateAJ(jwkNew, 'jawak', jwk);
            }
        }

        const jawaks2 = await DB.getList('jawak', { conditionString: `jawak.jawak_mm_id = ${from_id} AND jawak.dept_id = ${dept_id}`, limit: -1 });
        if (jawaks2.data) {
            for (let jwk of jawaks2.data) {
                let jwkNew = { ...jwk, jawak_mm_id: parseInt(to_id) };
                await Fn.updateAJ(jwkNew, 'jawak', jwk);
            }
        }

        // 3. Update prastav tables using PrastavService
        try {
            await PrastavService.transferReferences('mm', from_id, to_id);
        } catch (e) {
            console.log(`Transfer (prastav service): error`, e.message);
        }

        // 4. Update HMP batches using HmpService
        try {
            await HmpService.transferReferences('mm', from_id, to_id, dept_id);
        } catch (e) {
            console.log(`Transfer (hmp service): error`, e.message);
        }

        // 5. For other simple tables (keep dept_id check)
        const otherUpdates = [
            { table: 'product', cols: ['mm_id'] },
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
            DB.db.prepare(`DELETE FROM bachat WHERE mm_id = ? AND dept_id = ?`).run(parseInt(from_id), parseInt(dept_id));
            DB.db.prepare(`DELETE FROM bachat_new WHERE mm_id = ? AND dept_id = ?`).run(parseInt(from_id), parseInt(dept_id));
        } catch (e) { }

        await Fn.commit();
        res.json({ success: true, message: `All references transferred from MM ${from_id} to MM ${to_id}` });
    } catch (err) {
        console.log(err);

        await Fn.rollback();
        next(err);
    }
});

// mm filter
router.put('/filter/:dept_id', async (req, res, next) => {
    try {
        let conditionString = `1=1`;
        if (req.body.mm_type && req.body.mm_type.length > 0) {
            const types = req.body.mm_type.map(t => `'${t}'`).join(',');
            conditionString += ` AND mm_type IN (${types})`;
        }
        if (req.body.mm_id && req.body.mm_id.length > 0) {
            conditionString += ` AND mm._id IN (${req.body.mm_id.join(',')})`;
        }

        await DB.getList('mm', { conditionString, dept_id: req.params.dept_id, limit: -1 }).then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// mm delete
router.delete('/:id', (req, res, next) => {
    try {
        const ids = req.params.id.split(',').map(Number);
        const result = MM.delete({ _id: ids });
        res.status(200).json({ success: true, result });
    } catch (e) {
        next(e);
    }
});



module.exports = router;