'use strict';
// ──────────────────────────────────────────────────────────────────────────────
// variant.routes.js  –  Item-Variant System API
// Tables touched: attributes, attributes_value, variant, variant_attribute_map,
//                 variant_category_map, variant_aliases, item_aliases, subitem
// ──────────────────────────────────────────────────────────────────────────────
const router = require('express').Router();
const vs = require('../services/variant.service');


// ════════════════════════════════════════════════════════════════════════════
//  ATTRIBUTES
// ════════════════════════════════════════════════════════════════════════════

// GET  /api/variants/attributes          → all attributes (for data-view modal)
router.get('/attributes', async (req, res, next) => {
    try {
        const result = vs.getAllAttributes();
        res.json({ success: true, result, total_count: result.length });
    } catch (e) { next(e); }
});

// POST /api/variants/attributes          → add attribute
router.post('/attributes', async (req, res, next) => {
    try {
        const { attribute_hin, attribute_eng, attribute_roman } = req.body;
        if (!attribute_hin) return next(new Error('attribute_hin required'));
        const result = vs.insertAttribute({ attribute_hin, attribute_eng, attribute_roman });
        res.json({ success: true, result });
    } catch (e) { next(e); }
});

// PUT  /api/variants/attributes          → update attribute
router.put('/attributes', async (req, res, next) => {
    try {
        const { _id, attribute_hin, attribute_eng, attribute_roman } = req.body;
        if (!_id) return next(new Error('_id required'));
        const result = vs.updateAttribute({ _id, attribute_hin, attribute_eng, attribute_roman });
        res.json({ success: true, result });
    } catch (e) { next(e); }
});

// DELETE /api/variants/attributes/:id
router.delete('/attributes/:id', async (req, res, next) => {
    try {
        vs.deleteAttribute(req.params.id);
        res.json({ success: true });
    } catch (e) { next(e); }
});

// ════════════════════════════════════════════════════════════════════════════
//  ATTRIBUTE VALUES
// ════════════════════════════════════════════════════════════════════════════

// GET  /api/variants/attributes/:attr_id/values
router.get('/attributes/:attr_id/values', async (req, res, next) => {
    try {
        const result = vs.getAttributeValues(req.params.attr_id);
        res.json({ success: true, result, total_count: result.length });
    } catch (e) { next(e); }
});

// GET  /api/variants/attribute-values           → all values (for data-view)
router.get('/attribute-values', async (req, res, next) => {
    try {
        const result = vs.getAllAttributeValues();
        res.json({ success: true, result, total_count: result.length });
    } catch (e) { next(e); }
});

// POST /api/variants/attribute-values
router.post('/attribute-values', async (req, res, next) => {
    try {
        const { attribute_id, attribute_value_hin, attribute_value_eng, attribute_value_roman } = req.body;
        if (!attribute_id || !attribute_value_hin) return next(new Error('attribute_id and attribute_value_hin required'));
        const result = vs.insertAttributeValue({ attribute_id, attribute_value_hin, attribute_value_eng, attribute_value_roman });
        res.json({ success: true, result });
    } catch (e) { next(e); }
});

// PUT  /api/variants/attribute-values
router.put('/attribute-values', async (req, res, next) => {
    try {
        const { _id, attribute_id, attribute_value_hin, attribute_value_eng, attribute_value_roman } = req.body;
        if (!_id) return next(new Error('_id required'));
        const result = vs.updateAttributeValue({ _id, attribute_id, attribute_value_hin, attribute_value_eng, attribute_value_roman });
        res.json({ success: true, result });
    } catch (e) { next(e); }
});

// DELETE /api/variants/attribute-values/:id
router.delete('/attribute-values/:id', async (req, res, next) => {
    try {
        vs.deleteAttributeValue(req.params.id);
        res.json({ success: true });
    } catch (e) { next(e); }
});

// ════════════════════════════════════════════════════════════════════════════
//  ITEM-LEVEL DATA  (attributes assigned to item, aliases)
// ════════════════════════════════════════════════════════════════════════════

// GET  /api/variants/item/:item_id       → full item variant data
//      returns: item info + its attributes (with values) + existing variants
router.get('/item/:item_id', async (req, res, next) => {
    try {
        const result = vs.getItemVariantData(req.params.item_id);
        res.json({ success: true, result });
    } catch (e) { next(e); }
});

// GET  /api/variants/item-aliases/:item_id
router.get('/item-aliases/:item_id', async (req, res, next) => {
    try {
        const result = vs.getItemAliases(req.params.item_id);
        res.json({ success: true, result, total_count: result.length });
    } catch (e) { next(e); }
});

// POST /api/variants/item-aliases
router.post('/item-aliases', async (req, res, next) => {
    try {
        const { item_id, alias, language } = req.body;
        if (!item_id || !alias || !language) return next(new Error('item_id, alias, language required'));
        const result = vs.insertItemAlias({ item_id, alias, language });
        res.json({ success: true, result });
    } catch (e) { next(e); }
});

// DELETE /api/variants/item-aliases/:id
router.delete('/item-aliases/:id', async (req, res, next) => {
    try {
        vs.deleteItemAlias(req.params.id);
        res.json({ success: true });
    } catch (e) { next(e); }
});

// ════════════════════════════════════════════════════════════════════════════
//  VARIANT CORE CRUD
// ════════════════════════════════════════════════════════════════════════════

// GET  /api/variants/:item_id            → all variants for an item
router.get('/:item_id', async (req, res, next) => {
    try {
        const result = vs.getVariantsByItem(req.params.item_id);
        res.json({ success: true, result, total_count: result.length });
    } catch (e) { next(e); }
});

// POST /api/variants/bulk                → bulk create variants (main action)
// Body: {
//   item_id, separator,
//   variants: [
//     {
//       attribute_ids: [...],    // which attributes
//       attribute_value_ids: [...], // selected value per attribute
//       display_name_hin, display_name_eng, display_name_roman,
//       sku, category_ids: [...],
//       unit_id, extra_note, min_rate, max_rate,
//       aliases: [{ alias, language }]
//     }
//   ]
// }
router.post('/bulk', async (req, res, next) => {
    try {
        const { item_id, variants } = req.body;
        if (!item_id || !Array.isArray(variants) || variants.length === 0) {
            return next(new Error('item_id and variants[] required'));
        }
        const result = vs.bulkCreateVariants(item_id, variants, req.userData);
        res.json({ success: true, result, created: result.length });
    } catch (e) { next(e); }
});

// PUT  /api/variants/:variant_id         → update single variant
router.put('/:variant_id', async (req, res, next) => {
    try {
        const result = vs.updateVariant(req.params.variant_id, req.body, req.userData);
        res.json({ success: true, result });
    } catch (e) { next(e); }
});

// DELETE /api/variants/:variant_id       → soft delete variant + linked subitem
router.delete('/:variant_id', async (req, res, next) => {
    try {
        vs.deleteVariant(req.params.variant_id);
        res.json({ success: true });
    } catch (e) { next(e); }
});

// ════════════════════════════════════════════════════════════════════════════
//  VARIANT ALIASES
// ════════════════════════════════════════════════════════════════════════════

// GET  /api/variants/:variant_id/aliases
router.get('/:variant_id/aliases', async (req, res, next) => {
    try {
        const result = vs.getVariantAliases(req.params.variant_id);
        res.json({ success: true, result, total_count: result.length });
    } catch (e) { next(e); }
});

// POST /api/variants/aliases
router.post('/aliases', async (req, res, next) => {
    try {
        const { variant_id, alias } = req.body;
        if (!variant_id || !alias) return next(new Error('variant_id and alias required'));
        const result = vs.insertVariantAlias({ variant_id, alias });
        res.json({ success: true, result });
    } catch (e) { next(e); }
});

// DELETE /api/variants/aliases/:id
router.delete('/aliases/:id', async (req, res, next) => {
    try {
        vs.deleteVariantAlias(req.params.id);
        res.json({ success: true });
    } catch (e) { next(e); }
});

// ════════════════════════════════════════════════════════════════════════════
//  COMBINATION PREVIEW (no DB write)
// ════════════════════════════════════════════════════════════════════════════

// POST /api/variants/preview-combinations
// Body: { attribute_groups: [{ attribute_id, attribute_hin, values: [{_id, value_hin, value_eng, value_roman}] }], separator }
// Returns: all cartesian product combinations with auto-generated names
router.post('/preview-combinations', async (req, res, next) => {
    try {
        const { attribute_groups, separator } = req.body;
        if (!attribute_groups || !Array.isArray(attribute_groups)) {
            return next(new Error('attribute_groups required'));
        }
        const result = vs.generateCombinationPreview(attribute_groups, separator || ' ');
        res.json({ success: true, result, total: result.length });
    } catch (e) { next(e); }
});

module.exports = router;