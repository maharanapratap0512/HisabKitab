const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();



// get unit all
router.get('/:dept_id?', async (req, res, next) => {
    try {
        await DB.getList('unit').then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// post unit 
router.post('/', async (req, res, next) => {
    try {
        if (req.body && req.body.unit_short) {
            await DB.insert('unit', req.body).then(async (data) => {
                res.json({
                    success: true,
                    result: data || []
                });
            }, (err) => {
                return next(err);
            });
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update unit 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('unit', req.body.set, req.body.query._id).then(async (data) => {
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



// delete unit 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('unit', req.params.id).then((data) => {
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

// transfer all unit references from one unit to another
router.put('/transfer/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        const { from_id, to_id } = req.body;
        if (!from_id || !to_id) return next(new Error('from_id and to_id are required'));

        const Fn = require('../database/functions');
        const HmpService = require('../services/hmp.service');
        const PrastavService = require('../services/prastav.service');

        await Fn.begin();

        // 1. Update AAWAK records using Fn.updateAJ
        const aawaks = await DB.getList('aawak', { conditionString: `aawak.unit_id = ${from_id} AND aawak.dept_id = ${dept_id}`, limit: -1 });
        if (aawaks.data) {
            for (let awk of aawaks.data) {
                let awkNew = { ...awk, unit_id: parseInt(to_id) };
                await Fn.updateAJ(awkNew, 'aawak', awk);
            }
        }

        // 2. Update JAWAK records using Fn.updateAJ
        const jawaks = await DB.getList('jawak', { conditionString: `jawak.unit_id = ${from_id} AND jawak.dept_id = ${dept_id}`, limit: -1 });
        if (jawaks.data) {
            for (let jwk of jawaks.data) {
                let jwkNew = { ...jwk, unit_id: parseInt(to_id) };
                await Fn.updateAJ(jwkNew, 'jawak', jwk);
            }
        }

        // 3. Update prastav tables using PrastavService
        try {
            await PrastavService.transferReferences('unit', from_id, to_id);
        } catch (e) {
            console.log(`Transfer (prastav service): error`, e.message);
        }

        // 4. Update HMP batches using HmpService
        try {
            await HmpService.transferReferences('unit', from_id, to_id, dept_id);
        } catch (e) {
            console.log(`Transfer (hmp service): error`, e.message);
        }

        // 5. Update other simple tables
        const updates = [
            { table: 'item', col: 'unit_id' },
            { table: 'subitem', col: 'unit_id' },
            { table: 'product', col: 'unit_id' }
        ];

        for (let u of updates) {
            try {
                DB.db.prepare(`UPDATE ${u.table} SET ${u.col} = ? WHERE ${u.col} = ?`).run(parseInt(to_id), parseInt(from_id));
            } catch (e) {
                console.log(`Unit Transfer: skipping ${u.table}.${u.col}`, e.message);
            }
        }

        await Fn.commit();
        res.json({ success: true, message: `All references transferred from Unit ${from_id} to Unit ${to_id}` });
    } catch (err) {
        await Fn.rollback();
        next(err);
    }
});


module.exports = router;