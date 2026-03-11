// database/schema.js
// Only simple tables (no business logic) live here.

/* join types:
 *
 * hasOne (default) — fk is ON THIS table
 *   { on: 'unit_id', table: 'unit', target: '_id', as: 'unit', select: [...] }
 *
 * hasMany — fk is ON THE OTHER table pointing back here
 *   { hasMany: true, on: 'item_id', table: 'subitem', target: '_id', as: 'subitems', select: [...] }
 *
 * manyToMany — through a junction table
 *   { manyToMany: true, table: 'category', junction: 'rel_item_category', on: 'item_id', target: 'category_id', as: 'categories', select: [...] }
 */

/* allowed column types:
 * number | string | boolean | json
 */

const tableMeta = {

    prastav: {
        columns: {
            _id: { type: 'number' },
            date: { type: 'string' },
            mm_id: { type: 'number' },
            pbk_count: { type: 'string' },
            item_id: { type: 'number' },
            subitem_id: { type: 'number' },
            unit_id: { type: 'number' },
            qty: { type: 'number' },
            rate: { type: 'number' },
            amount: { type: 'number' },
            active: { type: 'boolean', default: 1 },
        }
    },
    prastav_jawak: {
        columns: {
            _id: { type: 'number' },
            prastav_id: { type: 'number' },
            date: { type: 'string' },
            mm_id: { type: 'number' },
            item_id: { type: 'number' },
            subitem_id: { type: 'number' },
            unit_id: { type: 'number' },
            qty: { type: 'number' },
            rate: { type: 'number' },
            amount: { type: 'number' },
            bori_count: { type: 'string' },
            kiske_dwara: { type: 'string' },
            source_mm_id: { type: 'number' },
            is_received: { type: 'boolean', default: 0 },
            active: { type: 'boolean', default: 1 },
        }
    },

    // ── HMP ──────────────────────────────────────────────────

    hmp_recipe: {
        columns: {
            _id: { type: 'number' },
            dept_id: { type: 'number' },
            recipe_name: { type: 'string' },
            recipe_code: { type: 'string' },
            description: { type: 'string' },
            active: { type: 'boolean', default: 1 },
        }
    },

    hmp_recipe_input: {
        columns: {
            _id: { type: 'number' },
            recipe_id: { type: 'number' },
            item_id: { type: 'number' },
            subitem_id: { type: 'number' },
            unit_id: { type: 'number' },
            condition_id: { type: 'number' },
            qty: { type: 'number' },
            active: { type: 'boolean', default: 1 },
        },
        joins: {
            // ── hasOne — fk on this table ──
            recipe: { on: 'recipe_id', table: 'hmp_recipe', target: '_id', as: 'recipe', select: ['recipe_name', 'recipe_code'] },
            item: { on: 'item_id', table: 'item', target: '_id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem: { on: 'subitem_id', table: 'subitem_list', target: '_id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit: { on: 'unit_id', table: 'unit', target: '_id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition: { on: 'condition_id', table: 'support_list', target: '_id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
        }
    },

    hmp_recipe_output: {
        columns: {
            _id: { type: 'number' },
            recipe_id: { type: 'number' },
            item_id: { type: 'number' },
            subitem_id: { type: 'number' },
            unit_id: { type: 'number' },
            condition_id: { type: 'number' },
            qty: { type: 'number' },
            active: { type: 'boolean', default: 1 },
        },
        joins: {
            recipe: { on: 'recipe_id', table: 'hmp_recipe', target: '_id', as: 'recipe', select: ['recipe_name', 'recipe_code'] },
            item: { on: 'item_id', table: 'item', target: '_id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem: { on: 'subitem_id', table: 'subitem_list', target: '_id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit: { on: 'unit_id', table: 'unit', target: '_id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition: { on: 'condition_id', table: 'support_list', target: '_id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
        }
    },

    hmp_batch: {
        columns: {
            _id: { type: 'number' },
            recipe_id: { type: 'number' },
            mm_id: { type: 'number' },
            dept_id: { type: 'number' },
            batch_no: { type: 'string' },
            date: { type: 'string' },
            notes: { type: 'string' },
            active: { type: 'boolean', default: 1 },
        },
        joins: {
            recipe: { on: 'recipe_id', table: 'hmp_recipe', target: '_id', as: 'recipe', select: ['recipe_name', 'recipe_code'] },
            mm: { on: 'mm_id', table: 'mm', target: '_id', as: 'mm', select: ['mm_hin', 'mm_eng', 'mm_roman'] },
            dept: { on: 'dept_id', table: 'department', target: '_id', as: 'dept', select: ['dept_hin', 'dept_eng', 'dept_code'] },
        }
    },

    hmp_batch_input: {
        columns: {
            _id: { type: 'number' },
            batch_id: { type: 'number' },
            item_id: { type: 'number' },
            subitem_id: { type: 'number' },
            unit_id: { type: 'number' },
            condition_id: { type: 'number' },
            qty: { type: 'number' },
            rate: { type: 'number' },
            amount: { type: 'number' },
            jawak_ref_id: { type: 'number' },
            auto_jawak: { type: 'boolean', default: 0 },
            active: { type: 'boolean', default: 1 },
            lot_no: { type: 'string' },
        },
        joins: {
            item: { on: 'item_id', table: 'item', target: '_id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem: { on: 'subitem_id', table: 'subitem_list', target: '_id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit: { on: 'unit_id', table: 'unit', target: '_id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition: { on: 'condition_id', table: 'support_list', target: '_id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
            jawak_ref: { on: 'jawak_ref_id', table: 'jawak', target: '_id', as: 'jawak_ref', select: ['date', 'qty'] },
        }
    },

    hmp_batch_output: {
        columns: {
            _id: { type: 'number' },
            batch_id: { type: 'number' },
            item_id: { type: 'number' },
            subitem_id: { type: 'number' },
            unit_id: { type: 'number' },
            condition_id: { type: 'number' },
            qty: { type: 'number' },
            rate: { type: 'number' },
            amount: { type: 'number' },
            aawak_ref_id: { type: 'number' },
            auto_aawak: { type: 'boolean', default: 0 },
            active: { type: 'boolean', default: 1 },
        },
        joins: {
            item: { on: 'item_id', table: 'item', target: '_id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem: { on: 'subitem_id', table: 'subitem_list', target: '_id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit: { on: 'unit_id', table: 'unit', target: '_id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition: { on: 'condition_id', table: 'support_list', target: '_id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
            aawak_ref: { on: 'aawak_ref_id', table: 'aawak', target: '_id', as: 'aawak_ref', select: ['date', 'qty'] },
        }
    },

    // ── Item — uses all three join types ──────────────────────

    item: {
        columns: {
            _id: { type: 'number' },
            item_hin: { type: 'string' },
            item_eng: { type: 'string' },
            item_roman: { type: 'string' },
            item_code: { type: 'string' },
            unit_id: { type: 'number' },
            extra_note: { type: 'string' },
            document: { type: 'string' },
            restrict_month: { type: 'number' },
            restrict_year: { type: 'number' },
            min_rate: { type: 'number' },
            max_rate: { type: 'number' },
            active: { type: 'boolean', default: 1 },
        },
        joins: {
            // hasOne — fk on this table
            unit: { on: 'unit_id', table: 'unit', target: '_id', as: 'unit', select: ['unit_short', 'unit_full'] },

            // hasMany — fk on subitem table pointing back to item._id
            subitems: { hasMany: true, on: 'item_id', table: 'subitem', target: '_id', as: 'subitems', select: ['_id', 'subitem_list_id', 'unit_id', 'active'] },

            // manyToMany — item → rel_item_category → category
            categories: { manyToMany: true, table: 'category', junction: 'rel_item_category', on: 'item_id', target: 'category_id', as: 'categories', select: ['_id', 'category_hin', 'category_eng'] },
        }
    },

    // ── Subitem — manyToMany for categories ───────────────────

    subitem: {
        columns: {
            _id: { type: 'number' },
            item_id: { type: 'number' },
            subitem_list_id: { type: 'number' },
            unit_id: { type: 'number' },
            extra_note: { type: 'string' },
            document: { type: 'string' },
            restrict_month: { type: 'number' },
            restrict_year: { type: 'number' },
            min_rate: { type: 'number' },
            max_rate: { type: 'number' },
            active: { type: 'boolean', default: 1 },
        },
        joins: {
            // hasOne
            unit: { on: 'unit_id', table: 'unit', target: '_id', as: 'unit', select: ['unit_short', 'unit_full'] },
            subitem_list: { on: 'subitem_list_id', table: 'subitem_list', target: '_id', as: 'subitem_list', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },

            // manyToMany — subitem → rel_subitem_category → category
            categories: { manyToMany: true, table: 'category', junction: 'rel_subitem_category', on: 'subitem_id', target: 'category_id', as: 'categories', select: ['_id', 'category_hin', 'category_eng'] },
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
            item_id: { type: 'number' },
            subitem_id: { type: 'number' },
            unit_id: { type: 'number' },
            condition_id: { type: 'number' },
            dept_id: { type: 'number' },
            qty: { type: 'number' },
            sw_bachat: { type: 'number' },
            difference: { type: 'number' },
            hl: { type: 'boolean', default: 0 },
            is_xl: { type: 'boolean', default: 0 },
            active: { type: 'boolean', default: 1 },
            voucher_no: { type: 'string' },
            date: { type: 'string' },
        },
        joins: {
            item: { on: 'item_id', table: 'item', target: '_id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem: { on: 'subitem_id', table: 'subitem_list', target: '_id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit: { on: 'unit_id', table: 'unit', target: '_id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition: { on: 'condition_id', table: 'support_list', target: '_id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
            dept: { on: 'dept_id', table: 'department', target: '_id', as: 'dept', select: ['dept_hin', 'dept_eng'] },
        }
    },

    pbk_bachat: {
        columns: {
            _id: { type: 'number' },
            pbk_id: { type: 'number' },
            item_id: { type: 'number' },
            subitem_id: { type: 'number' },
            unit_id: { type: 'number' },
            condition_id: { type: 'number' },
            dept_id: { type: 'number' },
            qty: { type: 'number', default: 0 },
            active: { type: 'boolean', default: 1 },
        },
        joins: {
            item: { on: 'item_id', table: 'item', target: '_id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] },
            subitem: { on: 'subitem_id', table: 'subitem_list', target: '_id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit: { on: 'unit_id', table: 'unit', target: '_id', as: 'unit', select: ['unit_short', 'unit_full'] },
            condition: { on: 'condition_id', table: 'support_list', target: '_id', as: 'condition', select: ['list_name_hin', 'list_name_eng'] },
            dept: { on: 'dept_id', table: 'department', target: '_id', as: 'dept', select: ['dept_hin', 'dept_eng'] },
        }
    },

};

module.exports = { tableMeta };