'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// variant.routes.js  — additions to existing file
// NEW endpoint: GET/PUT /api/variants/items/:dept_id
// Returns full item list with variants + subitems + aliases embedded.
// No accordion API call needed — everything in one payload.
// Frontend filters/searches entirely client-side.
// ─────────────────────────────────────────────────────────────────────────────
// ADD THIS BLOCK inside variant.routes.js (before existing routes, after checkAuth)
const router = require('express').Router();
const vs = require('../services/variant.service');
const BaseTable = require('../database/base.table');
const db = require('../database/db.model').dbmodal.db;

const itemTable = new BaseTable('item');
const variantTable = new BaseTable('variant');
const variantAttrMap = new BaseTable('variant_attribute_map');
const variantAliasTable = new BaseTable('variant_aliases');
const variantCatMap = new BaseTable('variant_category_map');
const subitemTable = new BaseTable('subitem');
const itemAliasTable = new BaseTable('item_aliases');

// ─── GET /api/variants/items/:dept_id  (initial full load) ──────────────────
// Returns: all items with variants, item_aliases embedded.
router.get('/items/:dept_id', async (req, res, next) => {
    try {
        const rows = db.prepare(`
            SELECT
                i._id, i.item_hin, i.item_eng, i.item_roman, i.item_code,
                i.unit_id, u.unit_short, u.unit_full, i.active,
                i.min_rate, i.max_rate, i.extra_note,
                -- counts
                (SELECT COUNT(*) FROM variant v WHERE v.item_id = i._id AND v.active = 1) as variant_count,
                (SELECT COUNT(*) FROM subitem s WHERE s.item_id = i._id AND s.active = 1 AND s.variant_id IS NULL) as subitem_count,
                -- variants + subitems + variant aliases
                (SELECT json_group_array(json_object(
                    '_id', v._id,
                    'display_name', v.display_name,
                    'sku', v.sku,
                    'subitem', (SELECT json_object(
                        '_id', s._id,
                        'subitem_hin', s.subitem_hin,
                        'subitem_eng', s.subitem_eng,
                        'subitem_roman', s.subitem_roman,
                        'unit_short', su.unit_short,
                        'min_rate', s.min_rate,
                        'max_rate', s.max_rate
                    ) FROM subitem s LEFT JOIN unit su ON su._id = s.unit_id WHERE s.variant_id = v._id LIMIT 1),
                    'attributes', (SELECT json_group_array(json_object(
                        'attribute_id', a._id,
                        'attribute_hin', a.attribute_hin,
                        'attribute_value_id', av._id,
                        'value_hin', av.attribute_value_hin
                    )) FROM variant_attribute_map vam 
                       JOIN attributes a ON a._id = vam.attribute_id
                       JOIN attributes_value av ON av._id = vam.attribute_value_id
                       WHERE vam.variant_id = v._id),
                    'aliases', (SELECT json_group_array(json_object('alias', va.alias)) FROM variant_aliases va WHERE va.variant_id = v._id)
                )) FROM variant v WHERE v.item_id = i._id AND v.active = 1) as variants_json,
                -- unlinked subitems
                (SELECT json_group_array(json_object(
                    '_id', s._id,
                    'subitem_hin', s.subitem_hin,
                    'subitem_eng', s.subitem_eng,
                    'subitem_roman', s.subitem_roman,
                    'min_rate', s.min_rate,
                    'max_rate', s.max_rate
                )) FROM subitem s WHERE s.item_id = i._id AND s.variant_id IS NULL AND s.active = 1) as unlinked_subitems_json,
                -- item aliases
                (SELECT json_group_array(json_object('_id', ia._id, 'alias', ia.alias))
                 FROM item_aliases ia WHERE ia.item_id = i._id) as item_aliases_json,
                -- categories
                (SELECT json_group_array(json_object('_id', c._id, 'category_hin', c.category_hin, 'category_eng', c.category_eng))
                 FROM rel_item_category ric
                 JOIN category c ON c._id = ric.category_id
                 WHERE ric.item_id = i._id) as categories_json
            FROM item i
            LEFT JOIN unit u ON u._id = i.unit_id
            WHERE i.active = 1 AND i._id IN (
                SELECT json_each.value FROM department_config, json_each(config_value) 
                WHERE dept_id = ? AND config_key = 'item'
            )
            ORDER BY i.item_hin ASC
        `).all(req.params.dept_id);

        const result = rows.map((r) => ({
            ...r,
            variants: _safeJson(r.variants_json, []).filter(v => v._id),
            unlinked_subitems: _safeJson(r.unlinked_subitems_json, []).filter(s => s._id),
            item_aliases: _safeJson(r.item_aliases_json, []).filter(a => a._id),
            categories: _safeJson(r.categories_json, []).filter(c => c._id),
            variants_json: undefined,
            unlinked_subitems_json: undefined,
            item_aliases_json: undefined,
            categories_json: undefined
        }));

        res.json({ success: true, result, total_count: result.length });
    } catch (e) { next(e); }
});

// ─── PUT /api/variants/items/:dept_id  (filtered load) ──────────────────────
// Body: { search?, categories?: number[], pageNo? }
router.put('/items/:dept_id', async (req, res, next) => {
    try {
        const { search, categories, item_ids, pageNo = 1, limit = 100 } = req.body;
        const offset = req.body.offset !== undefined ? req.body.offset : (pageNo - 1) * limit;

        const conditions = [
            'i.active = 1',
            `i._id IN (SELECT json_each.value FROM department_config, json_each(config_value) WHERE dept_id = @dept_id AND config_key = 'item')`
        ];
        const params = { dept_id: req.params.dept_id };

        if (item_ids && Array.isArray(item_ids) && item_ids.length > 0) {
            conditions.push(`i._id IN (${item_ids.join(',')})`);
        }

        if (search && search.trim()) {
            conditions.push(`(
                i.item_hin LIKE @term OR i.item_eng LIKE @term OR i.item_roman LIKE @term OR i.item_code LIKE @term
                OR EXISTS (SELECT 1 FROM item_aliases ia WHERE ia.item_id = i._id AND ia.alias LIKE @term)
                OR EXISTS (SELECT 1 FROM variant v
                           JOIN subitem s ON s.variant_id = v._id
                           WHERE v.item_id = i._id AND (
                               v.display_name LIKE @term OR s.subitem_eng LIKE @term OR s.subitem_roman LIKE @term
                           ))
            )`);
            params.term = `%${search.trim()}%`;
        }

        if (req.body.aliasSearch && req.body.aliasSearch.trim()) {
            conditions.push(`EXISTS (SELECT 1 FROM item_aliases ia WHERE ia.item_id = i._id AND ia.alias LIKE @aliasTerm)`);
            params.aliasTerm = `%${req.body.aliasSearch.trim()}%`;
        }

        if (categories && Array.isArray(categories) && categories.length > 0) {
            const catConditions = [];
            categories.forEach((catId, idx) => {
                const key = `cat${idx}`;
                catConditions.push(`@${key}`);
                params[key] = catId;
            });
            conditions.push(`EXISTS (
                SELECT 1 FROM rel_item_category ric
                WHERE ric.item_id = i._id AND ric.category_id IN (${catConditions.join(',')})
            )`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const countRow = db.prepare(`SELECT COUNT(*) as cnt FROM item i ${where}`).get(params);
        const total_count = countRow.cnt || 0;

        const rows = db.prepare(`
            SELECT
                i._id, i.item_hin, i.item_eng, i.item_roman, i.item_code,
                i.unit_id, u.unit_short, u.unit_full, i.active,
                i.min_rate, i.max_rate, i.extra_note,
                -- counts
                (SELECT COUNT(*) FROM variant v WHERE v.item_id = i._id AND v.active = 1) as variant_count,
                (SELECT COUNT(*) FROM subitem s WHERE s.item_id = i._id AND s.active = 1 AND s.variant_id IS NULL) as subitem_count,
                -- variants + subitems + variant aliases as nested JSON
                (SELECT json_group_array(json_object(
                    '_id', v._id,
                    'display_name', v.display_name,
                    'sku', v.sku,
                    'subitem', (SELECT json_object(
                        '_id', s._id,
                        'subitem_hin', s.subitem_hin,
                        'subitem_eng', s.subitem_eng,
                        'subitem_roman', s.subitem_roman,
                        'unit_short', su.unit_short,
                        'min_rate', s.min_rate,
                        'max_rate', s.max_rate
                    ) FROM subitem s LEFT JOIN unit su ON su._id = s.unit_id WHERE s.variant_id = v._id LIMIT 1),
                    'attributes', (SELECT json_group_array(json_object(
                        'attribute_id', a._id,
                        'attribute_hin', a.attribute_hin,
                        'attribute_value_id', av._id,
                        'value_hin', av.attribute_value_hin
                    )) FROM variant_attribute_map vam 
                       JOIN attributes a ON a._id = vam.attribute_id
                       JOIN attributes_value av ON av._id = vam.attribute_value_id
                       WHERE vam.variant_id = v._id),
                    'aliases', (SELECT json_group_array(json_object('alias', va.alias)) FROM variant_aliases va WHERE va.variant_id = v._id)
                )) FROM variant v WHERE v.item_id = i._id AND v.active = 1) as variants_json,
                -- unlinked subitems (subitems for this item with no variant_id)
                (SELECT json_group_array(json_object(
                    '_id', s._id,
                    'subitem_hin', s.subitem_hin,
                    'subitem_eng', s.subitem_eng,
                    'subitem_roman', s.subitem_roman,
                    'min_rate', s.min_rate,
                    'max_rate', s.max_rate
                )) FROM subitem s WHERE s.item_id = i._id AND s.variant_id IS NULL AND s.active = 1) as unlinked_subitems_json,
                -- item aliases
                (SELECT json_group_array(json_object('_id', ia._id, 'alias', ia.alias))
                 FROM item_aliases ia WHERE ia.item_id = i._id) as item_aliases_json,
                -- categories
                (SELECT json_group_array(json_object('_id', c._id, 'category_hin', c.category_hin, 'category_eng', c.category_eng))
                 FROM rel_item_category ric
                 JOIN category c ON c._id = ric.category_id
                 WHERE ric.item_id = i._id) as categories_json
            FROM item i
            LEFT JOIN unit u ON u._id = i.unit_id
            ${where}
            ORDER BY i.item_hin ASC
            LIMIT @limit OFFSET @offset
        `).all({ ...params, limit, offset });

        const result = rows.map((r) => ({
            ...r,
            variants: _safeJson(r.variants_json, []).filter(v => v._id),
            unlinked_subitems: _safeJson(r.unlinked_subitems_json, []).filter(s => s._id),
            item_aliases: _safeJson(r.item_aliases_json, []).filter(a => a._id),
            categories: _safeJson(r.categories_json, []).filter(c => c._id),
            variants_json: undefined,
            unlinked_subitems_json: undefined,
            item_aliases_json: undefined,
            categories_json: undefined
        }));

        res.json({ success: true, result, total_count, page: pageNo });
    } catch (e) { next(e); }
});

function _safeJson(val, fallback) {
    try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

// ─── Note: existing GET /api/variants/item/:item_id stays as-is ──────────────
// It loads variants+subitems for the expanded accordion row (still used).

// ════════════════════════════════════════════════════════════════════════════
//  FILTER VARIANTS
// ════════════════════════════════════════════════════════════════════════════

// PUT  /api/variants/filter/:dept_id      → get variants by attribute_id or attribute_value_id
router.put('/filter/:dept_id', async (req, res, next) => {
    try {
        const { attribute_id, attribute_value_id } = req.body;
        let variants = [];
        
        if (attribute_id && attribute_id.length > 0) {
            const idsStr = attribute_id.join(',');
            variants = db.prepare(`
                SELECT v.*, i.item_hin, i.item_eng
                FROM variant v
                JOIN item i ON i._id = v.item_id
                JOIN variant_attribute_map vam ON vam.variant_id = v._id
                WHERE vam.attribute_id IN (${idsStr}) AND v.active = 1
                GROUP BY v._id
            `).all();
        } else if (attribute_value_id && attribute_value_id.length > 0) {
            const idsStr = attribute_value_id.join(',');
            variants = db.prepare(`
                SELECT v.*, i.item_hin, i.item_eng
                FROM variant v
                JOIN item i ON i._id = v.item_id
                JOIN variant_attribute_map vam ON vam.variant_id = v._id
                WHERE vam.attribute_value_id IN (${idsStr}) AND v.active = 1
                GROUP BY v._id
            `).all();
        }
        
        res.json({ success: true, result: variants, total_count: variants.length });
    } catch (e) { next(e); }
});

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

        const { sutramDB } = require('../database/db.model');
        let result;
        try {
            sutramDB.begin();
            result = vs.updateAttributeValue({ _id, attribute_id, attribute_value_hin, attribute_value_eng, attribute_value_roman });
            sutramDB.commit();
        } catch (err) {
            sutramDB.rollback();
            throw err;
        }

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
        const { item_id, alias } = req.body;
        if (!item_id || !alias) return next(new Error('item_id and alias required'));
        const result = vs.insertItemAlias({ item_id, alias });
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
        res.json({ success: true, ...result });
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