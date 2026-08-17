'use strict';
// ──────────────────────────────────────────────────────────────────────────────
// variant.service.js
// Pattern: exact same as hmp.service.js
//   - BaseTable instances per table (schema-driven joins auto-handled)
//   - sutramDB.begin/commit/rollback for atomic operations
//   - Fn.begin/commit/rollback for async AJ operations (if needed)
//   - NO raw db.prepare() queries anywhere
// ──────────────────────────────────────────────────────────────────────────────

const BaseTable = require('../database/base.table');
const Fn = require('../database/functions');
const { sutramDB } = require('../database/db.model');

// ── Table instances  (schema in schema.js drives all joins automatically) ──────
const attributes = new BaseTable('attributes');
const attributes_value = new BaseTable('attributes_value');
const variant = new BaseTable('variant');
const variant_attr_map = new BaseTable('variant_attribute_map');
const variant_cat_map = new BaseTable('variant_category_map');
const variant_aliases = new BaseTable('variant_aliases');
const item_aliases = new BaseTable('item_aliases');
const subitem = new BaseTable('subitem');
const rel_subitem_cat = new BaseTable('rel_subitem_category');
const item = new BaseTable('item');


// ═════════════════════════════════════════════════════════════════════════════
//  ATTRIBUTES
// ═════════════════════════════════════════════════════════════════════════════

function getAllAttributes() {
    // schema on attributes_value has hasMany from attributes in schema → value_count
    // but since schema may not have count aggregation, we fetch all and let
    // BaseTable join handle attribute_value children if defined, else plain getAll
    return attributes.getAll({ active: 1 }, { orderBy: 'attribute_hin ASC' });
}

function insertAttribute(data) {
    return attributes.insert({
        attribute_hin: data.attribute_hin,
        attribute_eng: data.attribute_eng || null,
        attribute_roman: data.attribute_roman || null,
        active: 1,
        created_at: new Date().toISOString(),
    });
}

function updateAttribute(data) {
    return attributes.updateById({
        attribute_hin: data.attribute_hin,
        attribute_eng: data.attribute_eng || null,
        attribute_roman: data.attribute_roman || null,
    }, data._id);
}

function deleteAttribute(idOrIds) {
    // soft delete cascade — active=0 on attribute + all its values + all variant maps that use any of its values
    try {
        const ids = typeof idOrIds === 'string' && idOrIds.includes(',') ? idOrIds.split(',').map(Number) : (Array.isArray(idOrIds) ? idOrIds : [Number(idOrIds)]);

        sutramDB.begin();

        // 1. Check if ANY value of these attributes is used in active variants
        const vals = attributes_value.getAll({ attribute_id: ids }, { full: false });
        for (const v of vals) {
            const count = variant_attr_map.count({ attribute_value_id: v._id, active: 1 });
            if (count > 0) {
                throw new Error(`Is attribute ka value '${v.attribute_value_hin || v._id}' variants mein use ho raha hai. Delete nahi kar sakte.`);
            }
        }

        // 2. Hard delete attribute + values
        attributes.delete({ _id: ids });
        attributes_value.delete({ attribute_id: ids });

        sutramDB.commit();
        return 1;
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}


// ═════════════════════════════════════════════════════════════════════════════
//  ATTRIBUTE VALUES
// ═════════════════════════════════════════════════════════════════════════════

function getAttributeValues(attribute_id) {
    // schema col.ref on attributes_value.attribute_id → auto-joins attribute name
    return attributes_value.getAll(
        { attribute_id: Number(attribute_id), active: 1 },
        { orderBy: 'attribute_value_hin ASC' }
    );
}

function getAllAttributeValues() {
    return attributes_value.getAll({ active: 1 }, { orderBy: 'attribute_value_hin ASC' });
}

function insertAttributeValue(data) {
    return attributes_value.insert({
        attribute_id: Number(data.attribute_id),
        attribute_value_hin: data.attribute_value_hin,
        attribute_value_eng: data.attribute_value_eng || null,
        attribute_value_roman: data.attribute_value_roman || null,
        active: 1,
        created_at: new Date().toISOString(),
    });
}

function updateAttributeValue(data) {
    const updated = attributes_value.updateById({
        attribute_id: Number(data.attribute_id),
        attribute_value_hin: data.attribute_value_hin,
        attribute_value_eng: data.attribute_value_eng || null,
        attribute_value_roman: data.attribute_value_roman || null,
    }, data._id);

    // Propagate name changes to affected variants and subitems
    const affectedMaps = variant_attr_map.getAll({ attribute_value_id: data._id, active: 1 });
    const variantIds = [...new Set(affectedMaps.map(m => m.variant_id))];

    for (const vId of variantIds) {
        // Load all attribute values for this variant to reconstruct display name in original order
        const maps = variant_attr_map.getAll({ variant_id: vId, active: 1 }, { orderBy: '_id ASC' });
        const display_name_hin = maps.map(m => m.attribute_value?.attribute_value_hin).filter(Boolean).join(' ');
        const display_name_eng = maps.map(m => m.attribute_value?.attribute_value_eng).filter(Boolean).join(' ');
        const display_name_roman = maps.map(m => m.attribute_value?.attribute_value_roman).filter(Boolean).join(' ');

        variant.updateById({
            display_name: display_name_hin || null,
        }, vId);

        subitem.update({
            subitem_hin: display_name_hin || null,
            subitem_eng: display_name_eng || null,
            subitem_roman: display_name_roman || null,
            updated_at: new Date().toISOString(),
        }, { variant_id: vId, active: 1 });
    }

    return updated;
}

function deleteAttributeValue(idOrIds) {
    try {
        const ids = typeof idOrIds === 'string' && idOrIds.includes(',') ? idOrIds.split(',').map(Number) : (Array.isArray(idOrIds) ? idOrIds : [Number(idOrIds)]);
        sutramDB.begin();

        // Check if used in active variants
        const count = variant_attr_map.count({ attribute_value_id: ids, active: 1 });
        if (count > 0) {
            throw new Error('In values mein se kuch ko variants mein use kiya gaya hai. Delete nahi ho sakta.');
        }

        attributes_value.delete({ _id: ids });
        sutramDB.commit();
        return 1;
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}


// ═════════════════════════════════════════════════════════════════════════════
//  ITEM-LEVEL ALIASES
// ═════════════════════════════════════════════════════════════════════════════

function getItemAliases(item_id) {
    return item_aliases.getAll({ item_id: Number(item_id) }, { orderBy: 'alias ASC' });
}

function insertItemAlias(data) {
    const alias = data.alias.trim();
    if (!alias) throw new Error('Alias required');

    // NEW LOGIC: Check if alias exists in item names first using BaseTable.getOne
    const conflict = item.getOne(
        `item_hin = '${alias.replace(/'/g, "''")}' OR item_eng = '${alias.replace(/'/g, "''")}' OR item_roman = '${alias.replace(/'/g, "''")}'`,
        { full: false }
    );

    if (conflict) {
        throw new Error(`Yeh alias '${alias}' pehle se hi item '${conflict.item_hin}' ke name mein exist karta hai. Duplicate add nahi kar sakte.`);
    }

    // NEW LOGIC: Also check if alias exists in other items' aliases
    const aliasConflict = item_aliases.getOne({ alias: alias }, { full: true });

    if (aliasConflict && Number(aliasConflict.item_id) !== Number(data.item_id)) {
        throw new Error(`Yeh alias '${alias}' pehle se hi item '${aliasConflict.item?.item_hin}' ke aliases mein exist karta hai.`);
    }

    return item_aliases.insert({
        item_id: Number(data.item_id),
        alias: alias,
        created_at: new Date().toISOString(),
    });
}

function deleteItemAlias(id) {
    return item_aliases.deleteById(id);
}


// ═════════════════════════════════════════════════════════════════════════════
//  ITEM VARIANT DATA  (full aggregated payload for frontend on item select)
// ═════════════════════════════════════════════════════════════════════════════

function getItemVariantData(item_id) {
    const id = Number(item_id);

    // variants for this item — schema col.ref on variant.item_id → auto-joins item
    const variants = variant.getAll({ item_id: id, active: 1 }, { orderBy: '_id ASC' });

    // enrich each variant with its attribute maps, aliases, categories, and subitem mirror
    for (const v of variants) {
        // variant_attribute_map: schema joins → attribute + attribute_value auto-included
        v.attributes = variant_attr_map.getAll(
            { variant_id: v._id, active: 1 },
            { orderBy: '_id ASC' }
        );

        v.aliases = variant_aliases.getAll(
            { variant_id: v._id },
            { orderBy: '_id ASC' }
        );

        // variant_category_map: schema joins → category auto-included
        v.categories = variant_cat_map.getAll(
            { variant_id: v._id },
            { orderBy: '_id ASC' }
        );

        // the mirrored subitem row
        const si = subitem.getOne({ variant_id: v._id, active: 1 }, { full: true });
        v.subitem = si || null;
    }

    // all global attributes for the generator dropdowns
    const all_attributes = getAllAttributes();
    const all_attr_values = getAllAttributeValues();

    // build attr_id → values[] map  (for combination generator in frontend)
    const attr_value_map = {};
    for (const av of all_attr_values) {
        if (!attr_value_map[av.attribute_id]) attr_value_map[av.attribute_id] = [];
        attr_value_map[av.attribute_id].push(av);
    }

    // item aliases
    const aliases = getItemAliases(id);

    // unlinked subitems (existing subitems without a variant_id — legacy data)
    const unlinked_subitems = subitem.getAll(
        `subitem.item_id = ${id} AND (subitem.variant_id IS NULL) AND subitem.active = 1`,
        { orderBy: 'subitem_hin ASC' }
    );

    return { variants, all_attributes, attr_value_map, item_aliases: aliases, unlinked_subitems };
}


// ═════════════════════════════════════════════════════════════════════════════
//  COMBINATION PREVIEW  — pure logic, zero DB write
// ═════════════════════════════════════════════════════════════════════════════

function generateCombinationPreview(attribute_groups, separator = ' ') {
    if (!attribute_groups || attribute_groups.length === 0) return [];

    // cartesian product
    const cartesian = (groups) => groups.reduce((acc, group) => {
        if (!group.values || group.values.length === 0) return acc;
        const result = [];
        for (const existing of acc) {
            for (const val of group.values) {
                result.push([...existing, { attribute_id: group.attribute_id, attribute_hin: group.attribute_hin, value: val }]);
            }
        }
        return result;
    }, [[]]);

    return cartesian(attribute_groups).map((combo, idx) => ({
        combo_index: idx,
        selected: true,
        attribute_values: combo.map(c => ({
            attribute_id: c.attribute_id,
            attribute_hin: c.attribute_hin,
            attribute_value_id: c.value._id,
            value_hin: c.value.value_hin,
            value_eng: c.value.value_eng,
            value_roman: c.value.value_roman,
        })),
        display_name_hin: combo.map(c => c.value.value_hin).filter(Boolean).join(separator),
        display_name_eng: combo.map(c => c.value.value_eng).filter(Boolean).join(separator),
        display_name_roman: combo.map(c => c.value.value_roman).filter(Boolean).join(separator),
        sku: '',
    }));
}


// ═════════════════════════════════════════════════════════════════════════════
//  VARIANT CRUD
// ═════════════════════════════════════════════════════════════════════════════

// ─── Internal: create one variant inside a transaction ────────────────────────
function _createOneVariant(item_id, data, dept_id) {
    const {
        display_name_hin, display_name_eng, display_name_roman,
        sku, attribute_values, category_ids,
        unit_id, extra_note, min_rate, max_rate,
    } = data;

    // 0. Fingerprint (unique combination of attribute values)
    const fingerprint = (attribute_values ?? [])
        .map(av => Number(av.attribute_value_id))
        .filter(id => !isNaN(id))
        .sort((a, b) => a - b)
        .join('-');

    // Check if variant with same fingerprint already exists for this item
    const existing = variant.getOne({ item_id: Number(item_id), fingerprint, active: 1 });

    if (existing) {
        const vId = existing._id;
        // UPDATE: update variant core table
        variant.update({ _id: vId }, {
            sku: sku || existing.sku,
            display_name: display_name_hin || existing.display_name,
            fingerprint: fingerprint || null,
        });

        // Update categories for existing variant
        if (Array.isArray(category_ids)) {
            variant_cat_map.delete({ variant_id: vId });
            for (const catId of category_ids) {
                variant_cat_map.insert({ variant_id: vId, category_id: Number(catId) }, false);
            }
        }

        // Also sync subitem mirror
        const existingSub = subitem.getOne({ variant_id: vId });
        if (existingSub) {
            subitem.update({ _id: existingSub._id }, {
                subitem_hin: display_name_hin || existingSub.subitem_hin,
                subitem_eng: display_name_eng || existingSub.subitem_eng,
                subitem_roman: display_name_roman || existingSub.subitem_roman,
                unit_id: unit_id || existingSub.unit_id,
                min_rate: min_rate || existingSub.min_rate,
                max_rate: max_rate || existingSub.max_rate,
                updated_at: new Date().toISOString(),
            });

            // categories mirror
            if (Array.isArray(category_ids)) {
                rel_subitem_cat.delete({ subitem_id: existingSub._id });
                for (const catId of category_ids) {
                    rel_subitem_cat.insert({ subitem_id: existingSub._id, category_id: Number(catId) }, false);
                }
            }
        }

        return { variant_id: vId, subitem_id: existingSub?._id };
    }

    // 1. variant core (NEW)
    const variant_id = variant.insert({
        item_id: Number(item_id),
        sku: sku || null,
        display_name: display_name_hin || null,
        fingerprint: fingerprint || null,
        active: 1,
        created_at: new Date().toISOString(),
    }, false);  // full:false → returns id only (faster in bulk)

    // 2. attribute-value map
    for (const av of (attribute_values ?? [])) {
        if (!av.attribute_id || !av.attribute_value_id) continue;
        variant_attr_map.insert({
            variant_id,
            attribute_id: Number(av.attribute_id),
            attribute_value_id: Number(av.attribute_value_id),
            active: 1,
            created_at: new Date().toISOString(),
        }, false);
    }

    // 3. category map
    for (const cat_id of (category_ids ?? [])) {
        variant_cat_map.insert({
            variant_id,
            category_id: Number(cat_id),
            created_at: new Date().toISOString(),
        }, false);
    }

    // 4. ── MIRROR TO SUBITEM TABLE ─────────────────────────────────────────
    //    Keeps backward compat — all existing aawak/jawak/bachat code works via subitem_id
    const subitem_id = subitem.insert({
        item_id: Number(item_id),
        variant_id,
        subitem_hin: display_name_hin || null,
        subitem_eng: display_name_eng || null,
        subitem_roman: display_name_roman || null,
        unit_id: unit_id || null,
        extra_note: extra_note || null,
        min_rate: min_rate || 0,
        max_rate: max_rate || 0,
        add_by_dept_id: dept_id || null,
        active: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }, false);

    // 5. rel_subitem_category mirror (for old category join queries)
    for (const cat_id of (category_ids ?? [])) {
        rel_subitem_cat.insert({
            subitem_id,
            category_id: Number(cat_id),
        }, false);
    }

    return { variant_id, subitem_id };
}


// ─── Bulk create — main action from frontend, single DB transaction ───────────
function bulkCreateVariants(item_id, variants_data, userData) {
    try {
        sutramDB.begin();
        const dept_id = userData ? userData.dept_id : null;

        const created = [];
        const skipped = [];

        for (const vData of variants_data) {
            try {
                created.push(_createOneVariant(item_id, vData, dept_id));
            } catch (err) {
                // If it's a unique constraint violation (on fingerprint or display_name), we skip it
                if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && (err.message.includes('UNIQUE') || err.message.includes('unique')))) {
                    skipped.push({ display_name: vData.display_name_hin, reason: 'Duplicate' });
                } else {
                    throw err; // Re-throw other errors
                }
            }
        }

        sutramDB.commit();
        return { created, skipped, createdCount: created.length, skippedCount: skipped.length };
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}

// ─── Update single variant ────────────────────────────────────────────────────
function updateVariant(variant_id, data, userData) {
    const id = Number(variant_id);
    const dept_id = userData ? userData.dept_id : null;

    try {
        sutramDB.begin();
        // variant core
        variant.updateById({
            sku: data.sku || null,
            display_name: data.display_name_hin || null,
        }, id);

        // sync subitem mirror
        subitem.update({
            subitem_hin: data.display_name_hin || null,
            subitem_eng: data.display_name_eng || null,
            subitem_roman: data.display_name_roman || null,
            unit_id: data.unit_id || null,
            extra_note: data.extra_note || null,
            min_rate: data.min_rate || 0,
            max_rate: data.max_rate || 0,
            update_by_dept_id: dept_id,
            updated_at: new Date().toISOString(),
        }, { variant_id: id, active: 1 });

        // re-sync categories (delete + re-insert)
        if (Array.isArray(data.category_ids)) {
            variant_cat_map.delete({ variant_id: id });
            const si = subitem.getOne({ variant_id: id, active: 1 }, { full: false });
            if (si) rel_subitem_cat.delete({ subitem_id: si._id });

            for (const cat_id of data.category_ids) {
                variant_cat_map.insert({ variant_id: id, category_id: Number(cat_id), created_at: new Date().toISOString() }, false);
                if (si) rel_subitem_cat.insert({ subitem_id: si._id, category_id: Number(cat_id) }, false);
            }
        }

        // re-sync aliases (delete + re-insert)
        if (Array.isArray(data.aliases)) {
            variant_aliases.delete({ variant_id: id });
            for (const a of data.aliases) {
                if (a.alias) variant_aliases.insert({ variant_id: id, alias: a.alias, created_at: new Date().toISOString() }, false);
            }
        }

        const updated = variant.getById(id);
        sutramDB.commit();
        return updated;
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}

// ─── Delete variant (hard) ────────────────────────────────────────────────────
function deleteVariant(variant_id) {
    const id = Number(variant_id);
    try {
        sutramDB.begin();
        variant.deleteById(id);
        subitem.delete({ variant_id: id });
        variant_attr_map.delete({ variant_id: id });
        variant_aliases.delete({ variant_id: id });
        variant_cat_map.delete({ variant_id: id });
        sutramDB.commit();
        return 1;
    } catch (err) {
        sutramDB.rollback();
        throw err;
    }
}

// ─── Get variants by item (for simple list) ───────────────────────────────────
function getVariantsByItem(item_id) {
    const variants_list = variant.getAll(
        { item_id: Number(item_id), active: 1 },
        { orderBy: '_id ASC' }
    );
    for (const v of variants_list) {
        v.attributes = variant_attr_map.getAll({ variant_id: v._id, active: 1 });
    }
    return variants_list;
}


// ═════════════════════════════════════════════════════════════════════════════
//  VARIANT ALIASES
// ═════════════════════════════════════════════════════════════════════════════

function getVariantAliases(variant_id) {
    return variant_aliases.getAll({ variant_id: Number(variant_id) }, { orderBy: '_id ASC' });
}

function insertVariantAlias(data) {
    return variant_aliases.insert({
        variant_id: Number(data.variant_id),
        alias: data.alias,
        created_at: new Date().toISOString(),
    });
}

function deleteVariantAlias(id) {
    return variant_aliases.deleteById(id);
}


function getAttributeConflict(data, currentId = null) {
    const names = [data.attribute_hin, data.attribute_eng, data.attribute_roman].filter(Boolean);
    if (names.length === 0) return null;
    for (const name of names) {
        const sanitized = String(name).replace(/'/g, "''");
        const conflict = attributes.getOne(
            `_id != ${currentId || 0} AND (attribute_hin = '${sanitized}' OR attribute_eng = '${sanitized}' OR attribute_roman = '${sanitized}') AND active = 1`,
            { full: false }
        );
        if (conflict) return { type: 'primary', name, conflict };
    }
    return null;
}

function getAttributeValueConflict(data, currentId = null) {
    const names = [data.attribute_value_hin, data.attribute_value_eng, data.attribute_value_roman].filter(Boolean);
    if (names.length === 0 || !data.attribute_id) return null;
    for (const name of names) {
        const sanitized = String(name).replace(/'/g, "''");
        const conflict = attributes_value.getOne(
            `_id != ${currentId || 0} AND attribute_id = ${Number(data.attribute_id)} AND (attribute_value_hin = '${sanitized}' OR attribute_value_eng = '${sanitized}' OR attribute_value_roman = '${sanitized}') AND active = 1`,
            { full: false }
        );
        if (conflict) return { type: 'primary', name, conflict };
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
    // attributes
    getAllAttributes,
    insertAttribute,
    updateAttribute,
    deleteAttribute,
    getAttributeConflict,
    // attribute values
    getAttributeValues,
    getAllAttributeValues,
    insertAttributeValue,
    updateAttributeValue,
    deleteAttributeValue,
    getAttributeValueConflict,
    // item aliases
    getItemAliases,
    insertItemAlias,
    deleteItemAlias,
    // item variant data (aggregated)
    getItemVariantData,
    // combination preview
    generateCombinationPreview,
    // variant CRUD
    bulkCreateVariants,
    updateVariant,
    deleteVariant,
    getVariantsByItem,
    // variant aliases
    getVariantAliases,
    insertVariantAlias,
    deleteVariantAlias,
};