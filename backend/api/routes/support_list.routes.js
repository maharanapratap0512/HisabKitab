const router = require('express').Router();
const BaseTable = require('../database/base.table');
const HmpService = require('../services/hmp.service');
const PrastavService = require('../services/prastav.service');
const hmp_batch = new BaseTable('hmp_batch');
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const Fn = require('../database/functions');



// get support_list all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('support_list').then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get support_list 'jawak_type', 'aawak_type', 'condition', 'usage_list', 'aawak_source' by dept_id.
router.get('/splists/:dept_id', async (req, res, next) => {
    try {
        let conditionString = `list_type in ('jawak_type', 'aawak_type', 'condition', 'usage_list', 'aawak_source', 'mm_type')`;
        await DB.getList('support_list', { dept_id: req.params.dept_id, conditionString: conditionString, order: 'list_type' }).then((response) => {
            res.json({
                success: true,
                result: response.data
            });
        });

    } catch (err) { next(err) };
});


// post support_lis
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.list_type && req.body.list_name_eng) {
            await DB.insert('support_list', req.body, req.params.dept_id).then((data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            }, (err) => {
                next(err);
            })
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update support_list
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('support_list', req.body.set, req.body.query._id).then((data) => {
                res.json({
                    success: true,
                    result: data || []
                });
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


// transfer all support_list references from one to another
router.put('/transfer/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        const { from_id, to_id, list_type } = req.body;
        if (!from_id || !to_id || !list_type) return next(new Error('from_id, to_id and list_type are required'));

        await Fn.begin();

        const colMap = {
            'unit': 'unit_id',
            'aawak_type': 'aawak_type_id',
            'jawak_type': 'jawak_type_id',
            'condition': 'condition_id',
            'usage_list': 'usage_list_id',
            'aawak_source': 'aawak_source_id',
            'mm_type': 'mm_type'
        };

        const col = colMap[list_type];
        if (!col) return next(new Error(`Transfer not supported for list_type: ${list_type}`));

        // 1. Update AAWAK records using Fn.updateAJ
        const fromVal = list_type === 'mm_type' ? from_id : parseInt(from_id);
        const toVal = list_type === 'mm_type' ? to_id : parseInt(to_id);

        const aawaks = await DB.getList('aawak', { conditionString: `aawak.${col} = ${list_type === 'mm_type' ? `'${fromVal}'` : fromVal} AND aawak.dept_id = ${dept_id}`, limit: -1 });
        if (aawaks.data) {
            for (let awk of aawaks.data) {
                let awkNew = { ...awk, [col]: toVal };
                await Fn.updateAJ(awkNew, 'aawak', awk);
            }
        }

        // 2. Update JAWAK records using Fn.updateAJ
        const jawaks = await DB.getList('jawak', { conditionString: `jawak.${col} = ${list_type === 'mm_type' ? `'${fromVal}'` : fromVal} AND jawak.dept_id = ${dept_id}`, limit: -1 });
        if (jawaks.data) {
            for (let jwk of jawaks.data) {
                let jwkNew = { ...jwk, [col]: toVal };
                await Fn.updateAJ(jwkNew, 'jawak', jwk);
            }
        }

        // 3. Update prastav tables using PrastavService (for unit)
        if (list_type === 'unit') {
            try {
                await PrastavService.transferReferences('unit', from_id, to_id);
            } catch (e) {
                console.log(`Transfer (prastav unit service): error`, e.message);
            }

            // 4. Update HMP batches using HmpService (for unit)
            try {
                await HmpService.transferReferences('unit', from_id, to_id, dept_id);
            } catch (e) {
                console.log(`Transfer (hmp unit service): error`, e.message);
            }
        }

        // 5. For other tables (keep dept_id check)
        let otherUpdates = [];
        switch (list_type) {
            case 'unit':
                otherUpdates = [
                    { table: 'product', cols: ['unit_id'] },
                    { table: 'item', cols: ['unit_id'] },
                    { table: 'subitem', cols: ['unit_id'] },
                ];
                break;
            case 'condition':
                otherUpdates = []; // bachat auto-calculated, so skip
                break;
            case 'mm_type':
                otherUpdates = [{ table: 'mm', cols: ['mm_type'] }];
                break;
        }

        for (let u of otherUpdates) {
            for (let col of u.cols) {
                try {
                    DB.db.prepare(
                        `UPDATE ${u.table} SET ${col} = ? WHERE ${col} = ? AND dept_id = ?`
                    ).run(toVal, fromVal, parseInt(dept_id));
                } catch (e) {
                    console.log(`Transfer (${list_type}): skipping ${u.table}.${col}`, e.message);
                }
            }
        }


        // 5. Cleanup bachat for old ID (pre-delete)
        if (['unit', 'condition'].includes(list_type)) {
            try {
                DB.db.prepare(`DELETE FROM bachat WHERE ${col} = ? AND dept_id = ?`).run(parseInt(from_id), parseInt(dept_id));
                DB.db.prepare(`DELETE FROM bachat_new WHERE ${col} = ? AND dept_id = ?`).run(parseInt(from_id), parseInt(dept_id));
            } catch (e) { }
        }

        await Fn.commit();
        res.json({ success: true, message: `All references transferred from ${list_type} ${from_id} to ${to_id}` });
    } catch (err) {
        await Fn.rollback();
        next(err);
    }
});

// delete support_list
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('support_list', req.params.id).then((data) => {
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