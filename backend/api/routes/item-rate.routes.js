'use strict';
const router = require('express').Router();
const itemRateService = require('../services/item-rate.service');

// GET all item rates for a department
router.get('/:dept_id', async (req, res, next) => {
    try {
        const list = await itemRateService.getItemRates(req.params.dept_id);
        res.json({
            success: true,
            result: list || []
        });
    } catch (err) {
        next(err);
    }
});

// Save or update an item rate record
router.post('/:dept_id', async (req, res, next) => {
    try {
        const result = await itemRateService.saveItemRate(req.params.dept_id, req.body);
        res.json({
            success: true,
            message: 'Rate saved successfully.',
            result: result
        });
    } catch (err) {
        next(err);
    }
});

// Delete an item rate record
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await itemRateService.deleteItemRate(req.params.id);
        res.json({
            success: true,
            result: result
        });
    } catch (err) {
        next(err);
    }
});

// Apply rate to Aawak and Jawak entries of a department for that item, subitem, and year
router.post('/apply/bulk', async (req, res, next) => {
    try {
        const result = await itemRateService.applyItemRate(req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// Lookup rate for a specific item, subitem, year, and department
router.get('/lookup/:dept_id', async (req, res, next) => {
    try {
        const { item_id, subitem_id, year } = req.query;
        const rate = await itemRateService.lookupItemRate(req.params.dept_id, item_id, subitem_id, year);
        res.json({
            success: true,
            rate: rate
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
