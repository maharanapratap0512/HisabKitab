const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const Fn = require('../database/functions');
const { PbkBachat, Item, Subitem, Unit, SupportList } = require('../models/hmp.model');

// get closing all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('pbk_closing').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get closing by dept
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('pbk_closing', { dept_id: req.params.dept_id }).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});

// get pbk bachat for closing entry
router.get('/bachat/:pbk_id', async (req, res, next) => {
    try {
        // Fetch pbk_bachat for the specific PBK in the department
        // We use the 'pbk_bachat' table name and filter by pbk_id and dept_id
        const bachat = await PbkBachat.findAll({
            where: {
                pbk_id: req.params.pbk_id,
                dept_id: req.query.dept_id,
                active: 1
            },
            include: [
                { model: Item, as: 'item' },
                { model: Subitem, as: 'subitem' },
                { model: Unit, as: 'unit' },
                { model: SupportList, as: 'condition' }
            ]
        });

        res.json({
            success: true,
            result: bachat || [],
            total_count: bachat.length
        });
    } catch (err) { next(err) };
});


// post closing bunch
router.post('/bunch/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.pbk_closings && req.body.pbk_closings.length > 0) {
            let voucher_no = await Fn.getLastVoucherNo('pbk_closing') + 1;
            let successResult = [];

            // Transaction-like loop approach as per existing pattern
            for (let item of req.body.pbk_closings) {
                // Prepare object
                let closingObj = {
                    ...item,
                    date: req.body.date,
                    pbk_id: req.body.pbk_id,
                    dept_id: req.params.dept_id,
                    active: 1
                };

                // Use function for insert
                await Fn.insertPBKClosing(closingObj, voucher_no).then((data) => {
                    successResult.push(data);
                }).catch((err) => {
                    throw err; // Stop processing on error
                });
            }

            res.json({
                success: true,
                result: successResult,
                voucher_no: voucher_no
            });

        } else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});

// put closing bunch (update)
router.put('/bunch/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.pbk_closings && req.body.pbk_closings.length > 0) {
            let successResult = [];

            for (let item of req.body.pbk_closings) {
                // Prepare object
                let closingObj = {
                    ...item,
                    date: req.body.date, // update date if changed
                    pbk_id: req.body.pbk_id, // update pbk if changed
                    dept_id: req.params.dept_id
                };

                // Checks for update
                if (closingObj._id) {
                    await Fn.updatePBKClosing(closingObj).then((data) => {
                        successResult.push(data);
                    });
                } else {
                    // New item added during update
                    await Fn.insertPBKClosing(closingObj, req.body.voucher_no).then((data) => {
                        successResult.push(data);
                    });
                }
            }

            res.json({
                success: true,
                result: successResult
            });

        } else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});

// delete closing 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await Fn.deletePBKClosing(req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            })
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});


// filter closing data
router.post('/filter/:dept_id', async (req, res, next) => {
    try {
        let filter = { full: true, dept_id: req.params.dept_id, ...req.body };
        // Clean up empty filters
        Object.keys(filter).forEach(key => (filter[key] === null || filter[key] === '' || (Array.isArray(filter[key]) && filter[key].length === 0)) && delete filter[key]);

        await DB.getList('pbk_closing', filter).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});

// filter pbk bachat data
router.post('/bachat/filter/:dept_id', async (req, res, next) => {
    try {
        let filter = { full: true, dept_id: req.params.dept_id, ...req.body };
        // Clean up empty filters
        Object.keys(filter).forEach(key => (filter[key] === null || filter[key] === '' || (Array.isArray(filter[key]) && filter[key].length === 0)) && delete filter[key]);

        await DB.getList('pbk_bachat', filter).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});

module.exports = router;