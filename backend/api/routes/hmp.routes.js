// routes/hmp.routes.js
const express = require('express');
const router = express.Router();
const hmp = require('../services/hmp.service');
const { sutramDB } = require('../database/db.model');

// ─────────────────────────────────────────────────────────────
// IMPORTANT — Route order matters in Express.
// Specific paths (/recipe/:id, /input/:id, /output/:id)
// MUST be registered before the generic (/:id) catch-all.
// ─────────────────────────────────────────────────────────────


// ── Recipes ───────────────────────────────────────────────────

// GET  /recipe/:dept_id  — all active recipes with inputs/outputs
router.get('/recipe/:dept_id', (req, res, next) => {
    try {
        const result = hmp.getRecipesByDept(req.params.dept_id);
        res.json({ success: true, result });
    } catch (e) { next(e); }
});

// POST /recipe  — insert or update recipe + its inputs/outputs
router.post('/recipe', (req, res, next) => {
    try {
        sutramDB.begin();
        const recipeId = hmp.insertUpdateRecipe(req.body);
        sutramDB.commit();
        res.json({ success: true, result: { _id: recipeId } });
    } catch (e) { 
        sutramDB.rollback();
        next(e); 
    }
});

// DELETE /recipe/:id  — delete recipe + all its inputs/outputs
router.delete('/recipe/:id', (req, res, next) => {
    try {
        sutramDB.begin();
        const result = hmp.deleteRecipe(req.params.id);
        sutramDB.commit();
        res.json({ success: true, result });
    } catch (e) { 
        sutramDB.rollback();
        next(e); 
    }
});


const hmpPdf = require('../services/hmp-pdf.service');

// ── Batch List ────────────────────────────────────────────────

// PUT /batch/:dept_id  — paginated + filtered batch list
// (PUT used for filter body — matches old API contract)
router.put('/batch/:dept_id', (req, res, next) => {
    try {
        const { result, pageNo, total_count } = hmp.getBatches({
            dept_id: req.params.dept_id,
            ...req.body,
        });
        res.json({ success: true, result, pageNo, total_count });
    } catch (e) { next(e); }
});

const BaseTable = require('../database/base.table');

// POST /batch/export-pdf/:dept_id — export filtered batches to PDF
router.post('/batch/export-pdf/:dept_id', async (req, res, next) => {
    try {
        const { result } = hmp.getBatches({
            dept_id: req.params.dept_id,
            ...req.body,
            all: true
        });

        // Load jawak distributions if advance design
        if (req.body.exportType === 'advance') {
            const jawakTable = new BaseTable('jawak');
            for (const batch of result) {
                if (batch.outputs && batch.outputs.length > 0) {
                    for (const out of batch.outputs) {
                        if (out.aawak_ref_id) {
                            out.jawaks = jawakTable.getAll(`(jawak._id IN (SELECT jawak_id FROM rel_aawak_jawak WHERE aawak_id = ${out.aawak_ref_id}) OR jawak.aawak_ref_id = ${out.aawak_ref_id}) AND jawak.active = 1`);
                        } else {
                            out.jawaks = [];
                        }
                    }
                }
            }
        }

        const pdfBuffer = await hmpPdf.generateHmpPdf(result, req.params.dept_id, req.body);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=hmp_batches.pdf');
        res.end(pdfBuffer, 'binary');
    } catch (e) { next(e); }
});

// POST /batch/:dept_id  — create new batch
router.post('/batch/:dept_id', async (req, res, next) => {
    try {
        req.body.dept_id = req.params.dept_id;

        sutramDB.begin();
        // upsert recipe first if needed
        if (!req.body.recipe_id || req.body.update_recipe) {
            req.body.recipe_id = hmp.insertUpdateRecipe({ ...req.body });
        }

        const batch = await hmp.insertUpdateBatch(req.body);
        sutramDB.commit();
        res.json({ success: true, result: batch });
    } catch (e) { 
        sutramDB.rollback();
        next(e); 
    }
});


// ── Batch Input / Output — MUST be before /:id ────────────────

// DELETE /input/:id  — delete single batch input (+ linked jawak if auto_jawak)
router.delete('/input/:id', async (req, res, next) => {
    try {
        sutramDB.begin();
        const result = await hmp.deleteBatchInput(req.params.id);
        sutramDB.commit();
        res.json({ success: true, result });
    } catch (e) { 
        sutramDB.rollback();
        next(e); 
    }
});

// DELETE /output/:id  — delete single batch output (+ linked aawak if auto_aawak)
router.delete('/output/:id', async (req, res, next) => {
    try {
        sutramDB.begin();
        const result = await hmp.deleteBatchOutput(req.params.id);
        sutramDB.commit();
        res.json({ success: true, result });
    } catch (e) { 
        sutramDB.rollback();
        next(e); 
    }
});


// ── Single Batch — generic /:id LAST ─────────────────────────

// PUT /:id  — update existing batch
router.put('/:id', async (req, res, next) => {
    try {
        req.body._id = req.params.id;

        sutramDB.begin();
        if (!req.body.recipe_id || req.body.update_recipe) {
            req.body.recipe_id = hmp.insertUpdateRecipe({ ...req.body });
        }

        const batch = await hmp.insertUpdateBatch(req.body);
        sutramDB.commit();
        res.json({ success: true, result: batch });
    } catch (e) { 
        sutramDB.rollback();
        next(e); 
    }
});

// DELETE /:id  — delete batch + all its inputs/outputs
router.delete('/:id', async (req, res, next) => {
    try {
        sutramDB.begin();
        const result = await hmp.deleteBatch(req.params.id);
        sutramDB.commit();
        res.json({ success: true, result });
    } catch (e) { 
        sutramDB.rollback();
        next(e); 
    }
});


module.exports = router;