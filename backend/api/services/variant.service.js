// services/variant.service.js
'use strict';
const { dbmodal } = require('../database/db.model');
const db = dbmodal.db;
const BaseTable = require('../database/base.table');
const Fn = require('../database/functions');

// ── Table instances ───────────────────────────────────────────
const variant = new BaseTable('variant');
const attributesValue = new BaseTable('attributes_value');
const variantAttributeMap = new BaseTable('variant_attribute_map');
const variantCategoryMap = new BaseTable('variant_category_map');
const subitem = new BaseTable('subitem');

// ─────────────────────────────────────────────────────────────
// ── VARIANTS ────────────────────────────────────────────────────
function insertVariant(data) {
    return BaseTable.transaction(() => {
        const variantId = variant.insert(data, false);
        for (const attrValueId of data.attribute_value_ids || []) {
            variantAttributeMap.insert({ variant_id: variantId, attribute_value_id: attrValueId }, false);
        }
        if (data.categories) {
            for (const categoryId of data.categories || []) {
                variantCategoryMap.insert({ variant_id: variantId, category_id: categoryId }, false);
            }
        }
        return variantId;
    });
}

function updateVariant(id, data) {
    return BaseTable.transaction(() => {
        if (data.attribute_value_ids) {
            variantAttributeMap.delete({ variant_id: id });
            for (const attrValueId of data.attribute_value_ids || []) {
                variantAttributeMap.insert({ variant_id: id, attribute_value_id: attrValueId }, false);
            }
        }
        if (data.categories) {
            variantCategoryMap.delete({ variant_id: id });
            for (const categoryId of data.categories || []) {
                variantCategoryMap.insert({ variant_id: id, category_id: categoryId }, false);
            }
        }
        return variant.updateById(data, id);
    });
}

function deleteVariant(id) {
    return BaseTable.transaction(() => {
        variantAttributeMap.delete({ variant_id: id });
        variantCategoryMap.delete({ variant_id: id });
        return variant.deleteById(id);
    });
}

// ─────────────────────────────────────────────────────────────
module.exports = {
insertVariant,
updateVariant,
deleteVariant,
};