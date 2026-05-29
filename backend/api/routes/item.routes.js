const router = require('express').Router();
const BaseTable = require('../database/base.table');
const HmpService = require('../services/hmp.service');
const PrastavService = require('../services/prastav.service');
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const hmp_batch = new BaseTable('hmp_batch');
const Fn = require('../database/functions');


const itemService = require('../services/item.service');
const item = new BaseTable('item');
const { sutramDB } = require('../database/db.model');

// get item all
router.get('/', async (req, res, next) => {
    try {
        const resolve = await itemService.getItems();
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count || 0,
        });
    } catch (err) { next(err) };
});

// get item
router.get('/:dept_id', async (req, res, next) => {
    try {
        const resolve = await itemService.getItems(req.params.dept_id);
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count,
            subitem_count: resolve.subitem_count
        });
    } catch (err) { next(err) };
});


// get item by dept + filter + pageNo
router.put('/itemmix/:dept_id', async (req, res, next) => {
    try {
        const resolve = await itemService.filterItems(req.params.dept_id, req.body);
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count,
            subitem_count: resolve.subitem_count
        });
    } catch (err) { console.log(err); next(err) };
});

// post item
router.post('/:dept_id', async (req, res, next) => {
    if (req.body && req.body.item_hin) {
        try {
            sutramDB.begin();
            const data = await itemService.createItem(req.body, req.params.dept_id);
            sutramDB.commit();
            res.json({
                success: true,
                result: data || {}
            });

        } catch (err) {
            sutramDB.rollback();
            next(err);
        }
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


// update item 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            const data = await itemService.updateItem(req.body.query._id, req.body.set);
            res.json({
                success: true,
                result: data || {}
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
            const data = await itemService.toggleLock(req.body._id, req.body);
            res.json({
                success: true,
                result: data || {}
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

        await itemService.transferItemReferences(from_id, to_id, dept_id);
        res.json({ success: true, message: `All references transferred from Item ${from_id} to Item ${to_id}` });
    } catch (err) {
        next(err);
    }
});

// item delete
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            sutramDB.begin();
            const data = await itemService.deleteItem(req.params.id, req.userData || req);
            sutramDB.commit();
            res.json({
                success: true,
                result: data
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) {
        console.log(err);
        sutramDB.rollback();
        next(err);
    }
});


module.exports = router;