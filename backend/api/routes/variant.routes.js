// routes/variant.routes.js
const express = require('express');
const router = express.Router();
const variant = require('../services/variant.service');

// ── Variant Page ───────────────────────────────────────────────
// GET /variant/:dept_id  — get all active variants
router.get('/variant/:dept_id', (req, res, next) => {
try {
    const result = variant.getVariantsByDept(req.params.dept_id);
    res.json({ success: true, result });
} catch (e) { next(e); }
});


// POST /variant  — insert or update variant + its attributes
router.post('/variant', (req, res, next) => {
try {
    const variantId = variant.insertVariant(req.body);
    res.json({ success: true, result: { _id: variantId } });
} catch (e) { next(e); }
});



// DELETE /variant/:id  — delete variant + all its attributes
router.delete('/variant/:id', (req, res, next) => {
try {
    const result = variant.deleteVariant(req.params.id);
    res.json({ success: true, result });
} catch (e) { next(e); }
});

module.exports = router;