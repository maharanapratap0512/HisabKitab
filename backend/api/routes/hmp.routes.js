const express = require('express');
const router = express.Router();
const Fn = require('../models/functions');
const DBContex = require('../models/DBContex');
const dbContext = new DBContex();

// Get All Recipes
router.get('/recipe/:dept_id', async (req, res, next) => {
    try {
        let sql = `SELECT * FROM hmp_recipe WHERE dept_id = ? AND active = 1 ORDER BY recipe_name`;
        // In a real scenario, we might want to also fetch inputs/outputs for each recipe here
        // or fetch them on demand. For now, let's fetch basic info.
        // A better query would JSON object inputs/outputs

        let recipes = await dbContext.db.prepare(sql).all([req.params.dept_id]);

        // Populate inputs/outputs for each recipe (N+1 problem but simple for now, or use JSON_GROUP_ARRAY if SQLite supports it comfortably or a join)
        for (let r of recipes) {
            r.inputs = await dbContext.db.prepare(`SELECT * FROM hmp_recipe_input WHERE recipe_id = ? AND active = 1`).all([r._id]);
            r.outputs = await dbContext.db.prepare(`SELECT * FROM hmp_recipe_output WHERE recipe_id = ? AND active = 1`).all([r._id]);
        }

        res.status(200).json({ success: true, result: recipes });
    } catch (e) { next(e); }
});

// Get Batches
router.get('/batch/:dept_id', async (req, res, next) => {
    try {
        let sql = `
            SELECT b.*, r.recipe_name, r.recipe_code, m.mm_hin 
            FROM hmp_batch b 
            LEFT JOIN hmp_recipe r ON b.recipe_id = r._id
            LEFT JOIN mm m ON b.mm_id = m._id
            WHERE b.dept_id = ? AND b.active = 1 
            ORDER BY b.date DESC, b._id DESC
        `;
        let batches = await dbContext.db.prepare(sql).all([req.params.dept_id]);
        // Populate inputs/outputs for detailing or editing
        for (let b of batches) {
            // We need to join with item/unit names for display if needed, but for editing ID is enough usually
            // But for the form we need IDs.
            b.inputs = await dbContext.db.prepare(`SELECT * FROM hmp_batch_input WHERE batch_id = ? AND active = 1`).all([b._id]);
            b.outputs = await dbContext.db.prepare(`SELECT * FROM hmp_batch_output WHERE batch_id = ? AND active = 1`).all([b._id]);
        }

        res.status(200).json({ success: true, result: batches });
    } catch (e) { next(e); }
});

// Create/Update Bunch Bundle
router.post('/bunch/:dept_id', async (req, res, next) => {
    try {
        req.body.dept_id = req.params.dept_id;
        let result = await Fn.insertHMPBatch(req.body, req.user); // Need to implement this
        res.status(200).json({ success: true, result: result });
    } catch (e) { next(e); }
});

module.exports = router;