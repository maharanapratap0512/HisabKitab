'use strict';
const router = require('express').Router();
const categoryService = require('../services/category.service');
const { sutramDB } = require('../database/db.model');

// GET methods usually don't need transactions
router.get('/', async (req, res, next) => {
    try {
        const result = await categoryService.getCategories();
        res.json({ success: true, result, total_count: result.length });
    } catch (err) { next(err) };
});

router.get('/:dept_id', async (req, res, next) => {
    try {
        const result = await categoryService.getCategories(req.params.dept_id);
        res.json({ success: true, result, total_count: result.length });
    } catch (err) { next(err) };
});

router.post('/:dept_id', async (req, res, next) => {
    try {
        sutramDB.begin();
        try {
            const result = await categoryService.createCategory(req.body, req.params.dept_id);
            sutramDB.commit();
            res.json({ success: true, result });
        } catch (err) {
            sutramDB.rollback();
            throw err;
        }
    } catch (err) { next(err) };
});

router.put('/', async (req, res, next) => {
    try {
        sutramDB.begin();
        try {
            const id = req.body.query?._id || req.body.set?._id;
            const result = await categoryService.updateCategory(id, req.body.set);
            sutramDB.commit();
            res.json({ success: true, result });
        } catch (err) {
            sutramDB.rollback();
            throw err;
        }
    } catch (err) { next(err) };
});

router.put('/aliases/:id', async (req, res, next) => {
    try {
        sutramDB.begin();
        try {
            const result = await categoryService.updateAliases(req.params.id, req.body.aliases);
            sutramDB.commit();
            res.json({ success: true, result });
        } catch (err) {
            sutramDB.rollback();
            throw err;
        }
    } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
    try {
        sutramDB.begin();
        try {
            const result = await categoryService.deleteCategory(req.params.id);
            sutramDB.commit();
            res.json({ success: true, result });
        } catch (err) {
            sutramDB.rollback();
            throw err;
        }
    } catch (err) { next(err) };
});

router.put('/transfer/:dept_id', async (req, res, next) => {
    try {
        sutramDB.begin();
        try {
            await categoryService.transferCategory(req.body.from_id, req.body.to_id);
            sutramDB.commit();
            res.json({ success: true, message: `References transferred successfully.` });
        } catch (err) {
            sutramDB.rollback();
            throw err;
        }
    } catch (err) { next(err); }
});

module.exports = router;