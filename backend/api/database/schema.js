// database/schema.js
// Only simple tables (no business logic) live here.

/* ── Column types ────────────────────────────────────────────
 *   number | string | boolean | json
 *
 * ── Join types ────────────────────────────────────────────────
 *
 *  hasOne — declare ref directly on the FK column (like SQL REFERENCES)
 *    unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] }
 *
 *  hasMany — declare in joins{} — fk is on the OTHER table
 *    subitems: { hasMany: true, on: 'item_id', table: 'subitem', target: '_id', as: 'subitems', select: [...] }
 *
 *  manyToMany — declare in joins{} — through a junction table
 *    categories: { manyToMany: true, table: 'category', junction: 'rel_item_category', on: 'item_id', target: 'category_id', as: 'categories', select: [...] }
 */

const tableMeta = {

    // ── HMP ──────────────────────────────────────────────────

    hmp_recipe: {
        columns: {
            _id: { type: 'number' },
            dept_id: { type: 'number', ref: 'department._id', as: 'dept', select: ['dept_hin', 'dept_eng', 'dept_code'] },
            recipe_name: { type: 'string' },
            recipe_code: { type: 'string' },
            description: { type: 'string' },
            active: { type: 'boolean', default: 1 },
        }
    },

    hmp_recipe_input: {
        columns: {
            _id: { type: 'number' },
            recipe_id: { type: 'number', ref: 'hmp_recipe._id', as: 'recipe', select: ['recipe_name', 'recipe_code'] },
            item_id: { type: 'number', ref: 'item._id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem_id: { type: 'number', ref: 'subitem_list._id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition_id: { type: 'number', ref: 'support_list._id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
            qty: { type: 'number' },
            active: { type: 'boolean', default: 1 },
        }
    },

    hmp_recipe_output: {
        columns: {
            _id: { type: 'number' },
            recipe_id: { type: 'number', ref: 'hmp_recipe._id', as: 'recipe', select: ['recipe_name', 'recipe_code'] },
            item_id: { type: 'number', ref: 'item._id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem_id: { type: 'number', ref: 'subitem_list._id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition_id: { type: 'number', ref: 'support_list._id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
            qty: { type: 'number' },
            active: { type: 'boolean', default: 1 },
        }
    },

    hmp_batch: {
        columns: {
            _id: { type: 'number' },
            recipe_id: { type: 'number', ref: 'hmp_recipe._id', as: 'recipe', select: ['recipe_name', 'recipe_code'] },
            mm_id: { type: 'number', ref: 'mm._id', as: 'mm', select: ['mm_hin', 'mm_eng', 'mm_roman'] },
            dept_id: { type: 'number', ref: 'department._id', as: 'dept', select: ['dept_hin', 'dept_eng', 'dept_code'] },
            batch_no: { type: 'string' },
            date: { type: 'string' },
            notes: { type: 'string' },
            active: { type: 'boolean', default: 1 },
        }
    },

    hmp_batch_input: {
        columns: {
            _id: { type: 'number' },
            batch_id: { type: 'number' },
            item_id: { type: 'number', ref: 'item._id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem_id: { type: 'number', ref: 'subitem_list._id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition_id: { type: 'number', ref: 'support_list._id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
            jawak_ref_id: { type: 'number', ref: 'jawak._id', as: 'jawak_ref', select: ['date', 'qty'] },
            qty: { type: 'number' },
            rate: { type: 'number' },
            amount: { type: 'number' },
            auto_jawak: { type: 'boolean', default: 0 },
            active: { type: 'boolean', default: 1 },
            lot_no: { type: 'string' },
        }
    },

    hmp_batch_output: {
        columns: {
            _id: { type: 'number' },
            batch_id: { type: 'number' },
            item_id: { type: 'number', ref: 'item._id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem_id: { type: 'number', ref: 'subitem_list._id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition_id: { type: 'number', ref: 'support_list._id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
            aawak_ref_id: { type: 'number', ref: 'aawak._id', as: 'aawak_ref', select: ['date', 'qty'] },
            qty: { type: 'number' },
            rate: { type: 'number' },
            amount: { type: 'number' },
            auto_aawak: { type: 'boolean', default: 0 },
            active: { type: 'boolean', default: 1 },
        }
    },

    // ── Item ──────────────────────────────────────────────────

    item: {
        columns: {
            _id: { type: 'number' },
            item_hin: { type: 'string' },
            item_eng: { type: 'string' },
            item_roman: { type: 'string' },
            item_code: { type: 'string' },
            unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] },
            extra_note: { type: 'string' },
            document: { type: 'string' },
            restrict_month: { type: 'number' },
            restrict_year: { type: 'number' },
            min_rate: { type: 'number' },
            max_rate: { type: 'number' },
            active: { type: 'boolean', default: 1 },
        },
        joins: {
            // hasMany  — subitem.item_id → item._id
            subitems: { hasMany: true, on: 'item_id', table: 'subitem', target: '_id', as: 'subitems', select: ['_id', 'subitem_list_id', 'unit_id', 'active'] },
            // manyToMany — item → rel_item_category → category
            categories: { manyToMany: true, on: 'item_id', table: 'category', junction: 'rel_item_category', target: 'category_id', as: 'categories', select: ['_id', 'category_hin', 'category_eng'] },
        }
    },

    // ── Subitem ───────────────────────────────────────────────

    subitem: {
        columns: {
            _id: { type: 'number' },
            item_id: { type: 'number' },
            subitem_list_id: { type: 'number', ref: 'subitem_list._id', as: 'subitem_list', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] },
            extra_note: { type: 'string' },
            document: { type: 'string' },
            restrict_month: { type: 'number' },
            restrict_year: { type: 'number' },
            min_rate: { type: 'number' },
            max_rate: { type: 'number' },
            active: { type: 'boolean', default: 1 },
        },
        joins: {
            // manyToMany — subitem → rel_subitem_category → category
            categories: { manyToMany: true, on: 'subitem_id', table: 'category', junction: 'rel_subitem_category', target: 'category_id', as: 'categories', select: ['_id', 'category_hin', 'category_eng'] },
        }
    },

    // ── Supporting tables ─────────────────────────────────────

    usage_report: {
        columns: {
            _id: { type: 'number' },
            jawak_id: { type: 'number' },
            usage_type_id: { type: 'number' },
            rating: { type: 'number' },
            date: { type: 'string' },
            reporter: { type: 'string' },
            fayda: { type: 'string' },
            nuksan: { type: 'string' },
        }
    },

    aawak_enzyme: {
        columns: {
            _id: { type: 'number' },
            aawak_id: { type: 'number' },
            container_aawak_source_id: { type: 'number' },
            container_enz_no: { type: 'number' },
            container_capacity: { type: 'number' },
            container_qty: { type: 'number' },
        }
    },

    jawak_enzyme: {
        columns: {
            _id: { type: 'number' },
            jawak_id: { type: 'number' },
            container_capacity: { type: 'number' },
        }
    },

    country: {
        columns: {
            _id: { type: 'number' },
            add_by_dept_id: { type: 'number' },
            update_by_dept_id: { type: 'number' },
            verify: { type: 'boolean', default: 0 },
            active: { type: 'boolean', default: 1 },
            country_hin: { type: 'string' },
            country_eng: { type: 'string' },
        }
    },

    dictionary: {
        columns: {
            _id: { type: 'number' },
            id: { type: 'number' },
            id2: { type: 'number' },
            type: { type: 'string' },
            name: { type: 'string' },
            extra_note: { type: 'string' },
        }
    },

    pbk_closing: {
        columns: {
            _id: { type: 'number' },
            pbk_id: { type: 'number' },
            item_id: { type: 'number', ref: 'item._id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem_id: { type: 'number', ref: 'subitem_list._id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition_id: { type: 'number', ref: 'support_list._id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
            dept_id: { type: 'number', ref: 'department._id', as: 'dept', select: ['dept_hin', 'dept_eng'] },
            qty: { type: 'number' },
            sw_bachat: { type: 'number' },
            difference: { type: 'number' },
            hl: { type: 'boolean', default: 0 },
            is_xl: { type: 'boolean', default: 0 },
            active: { type: 'boolean', default: 1 },
            voucher_no: { type: 'string' },
            date: { type: 'string' },
        }
    },

    pbk_bachat: {
        columns: {
            _id: { type: 'number' },
            pbk_id: { type: 'number' },
            item_id: { type: 'number', ref: 'item._id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem_id: { type: 'number', ref: 'subitem_list._id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition_id: { type: 'number', ref: 'support_list._id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
            dept_id: { type: 'number', ref: 'department._id', as: 'dept', select: ['dept_hin', 'dept_eng'] },
            qty: { type: 'number', default: 0 },
            active: { type: 'boolean', default: 1 },
        }
    },

};

module.exports = { tableMeta };