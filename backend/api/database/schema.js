// database/schema.js
// Only simple tables (no business logic) live here.

const { defineTable, col } = require('sutramcore');

module.exports = {

    // ── Prastav (Proposal) ─────────────────────────────────────

    prastav: {
        columns: {
            _id: { type: 'number' },
            voucher_no: { type: 'number' },
            date: { type: 'string' },
            mm_id: { type: 'number', ref: 'mm._id', as: 'mm', select: ['mm_hin', 'mm_eng', 'mm_roman', 'mm_code'] },
            pbk_id: { type: 'number', ref: 'pbk._id', as: 'pbk', select: ['pbk_hin', 'pbk_eng', 'pbk_roman'] },
            pbk_count: { type: 'string' },
            item_id: { type: 'number', ref: 'item._id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman', 'item_code'] },
            subitem_id: { type: 'number', ref: 'subitem_list._id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] },
            rate: { type: 'number' },
            amount: { type: 'number' },
            qty: { type: 'number' },
            bachat: { type: 'number' },
            monthly_uses: { type: 'number' },
            qty_needs: { type: 'number' },
            is_noted: { type: 'boolean', default: 0 },
            note_details: { type: 'string' },
            description: { type: 'string' },
            active: { type: 'boolean', default: 1 },
        },
        joins: {


            // hasMany — linked jawak lines
            jawaks: {
                hasMany: true,
                on: 'prastav_id',
                table: 'prastav_jawak',
                target: '_id',
                as: 'jawaks',
                select: '*'
            }
        }
    },

    prastav_jawak: {
        columns: {
            _id: { type: 'number' },
            prastav_id: { type: 'number', ref: 'prastav._id', as: 'prastav', select: ['voucher_no', 'date', 'mm_id', 'item_id', 'unit_id'] },
            date: { type: 'string' },
            mm_id: { type: 'number', ref: 'mm._id', as: 'mm', select: ['mm_hin', 'mm_eng', 'mm_roman', 'mm_code'] },
            item_id: { type: 'number', ref: 'item._id', as: 'item', select: ['item_hin', 'item_eng', 'item_roman', 'item_code'] },
            subitem_id: { type: 'number', ref: 'subitem_list._id', as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] },
            unit_id: { type: 'number', ref: 'unit._id', as: 'unit', select: ['unit_short', 'unit_full'] },
            qty: { type: 'number' },
            rate: { type: 'number' },
            amount: { type: 'number' },
            bori_count: { type: 'string' },
            kiske_dwara: { type: 'string' },
            source_mm_id: { type: 'number' },
            description: { type: 'string' },
            is_received: { type: 'boolean', default: 0 },
            active: { type: 'boolean', default: 1 },
        }
    },

    // ── HMP ──────────────────────────────────────────────────

    ...defineTable('hmp_recipe', {
        _id: col.id(),
        dept_id: col.ref('department._id', { as: 'dept', select: ['dept_hin', 'dept_eng', 'dept_code'] }),
        recipe_name: col.string(),
        recipe_code: col.string(),
        description: col.string(),
        active: col.boolean().default(1),
    }, {
        inputs: { hasMany: true, on: 'recipe_id', table: 'hmp_recipe_input', target: '_id', as: 'inputs', select: '*', join: true },
        outputs: { hasMany: true, on: 'recipe_id', table: 'hmp_recipe_output', target: '_id', as: 'outputs', select: '*' },
    }),

    ...defineTable('hmp_recipe_input', {
        _id: col.id(),
        recipe_id: col.ref('hmp_recipe._id', { as: 'recipe', select: ['recipe_name', 'recipe_code'] }),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] }),
        subitem_id: col.ref('subitem_list._id', { as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        qty: col.number(),
        active: col.boolean().default(1),
    }),

    ...defineTable('hmp_recipe_output', {
        _id: col.id(),
        recipe_id: col.ref('hmp_recipe._id', { as: 'recipe', select: ['recipe_name', 'recipe_code'] }),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] }),
        subitem_id: col.ref('subitem_list._id', { as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        qty: col.number(),
        active: col.boolean().default(1),
    }),

    ...defineTable('hmp_batch', {
        _id: col.id(),
        recipe_id: col.ref('hmp_recipe._id', { as: 'recipe', select: ['recipe_name', 'recipe_code'] }),
        mm_id: col.ref('mm._id', { as: 'mm', select: ['mm_hin', 'mm_eng', 'mm_roman'] }),
        dept_id: col.ref('department._id', { as: 'dept', select: ['dept_hin', 'dept_eng', 'dept_code'] }),
        batch_no: col.string(),
        date: col.string(),
        notes: col.string(),
        active: col.boolean().default(1),
    }, {
        inputs: { hasMany: true, on: 'batch_id', table: 'hmp_batch_input', target: '_id', as: 'inputs', select: '*' },
        outputs: { hasMany: true, on: 'batch_id', table: 'hmp_batch_output', target: '_id', as: 'outputs', select: '*' },
    }),

    ...defineTable('hmp_batch_input', {
        _id: col.id(),
        batch_id: col.number(),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] }),
        subitem_id: col.ref('subitem_list._id', { as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        aawak_source_id: col.ref('support_list._id', { as: 'aawak_source', select: ['list_name_hin', 'list_name_eng'] }),
        jawak_ref_id: col.ref('jawak._id', { as: 'jawak_ref', select: ['date', 'qty'] }),
        qty: col.number(),
        rate: col.number(),
        amount: col.number(),
        active: col.boolean().default(1),
        lot_no: col.string(),
    }),

    ...defineTable('hmp_batch_output', {
        _id: col.id(),
        batch_id: col.number(),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] }),
        subitem_id: col.ref('subitem_list._id', { as: 'subitem', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        aawak_ref_id: col.ref('aawak._id', { as: 'aawak_ref', select: ['date', 'qty'] }),
        qty: col.number(),
        rate: col.number(),
        amount: col.number(),
        active: col.boolean().default(1),
    }),

    // ── Item ──────────────────────────────────────────────────

    ...defineTable('item', {
        _id: col.id(),
        item_hin: col.string(),
        item_eng: col.string(),
        item_roman: col.string(),
        item_code: col.string(),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        extra_note: col.string(),
        document: col.string(),
        restrict_month: col.number(),
        restrict_year: col.number(),
        min_rate: col.number(),
        max_rate: col.number(),
        active: col.boolean().default(1),
    }, {
        subitems: { hasMany: true, on: 'item_id', table: 'subitem', target: '_id', as: 'subitems', select: ['_id', 'subitem_list_id', 'unit_id', 'active'] },
        categories: { manyToMany: true, on: 'item_id', table: 'category', junction: 'rel_item_category', target: 'category_id', as: 'categories', select: ['_id', 'category_hin', 'category_eng'] },
    }),

    // ── Subitem ───────────────────────────────────────────────

    ...defineTable('subitem', {
        _id: col.id(),
        item_id: col.number(),
        subitem_list_id: col.ref('subitem_list._id', { as: 'subitem_list', select: ['subitem_hin', 'subitem_eng', 'subitem_roman'] }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        extra_note: col.string(),
        document: col.string(),
        restrict_month: col.number(),
        restrict_year: col.number(),
        min_rate: col.number(),
        max_rate: col.number(),
        active: col.boolean().default(1),
    }, {
        categories: { manyToMany: true, on: 'subitem_id', table: 'category', junction: 'rel_subitem_category', target: 'category_id', as: 'categories', select: ['_id', 'category_hin', 'category_eng'] },
    }),

    // ── Supporting tables ─────────────────────────────────────

    ...defineTable('usage_report', {
        _id: col.id(),
        jawak_id: col.number(),
        usage_type_id: col.number(),
        rating: col.number(),
        date: col.string(),
        reporter: col.string(),
        fayda: col.string(),
        nuksan: col.string(),
    }),

    ...defineTable('aawak_enzyme', {
        _id: col.id(),
        aawak_id: col.number(),
        container_aawak_source_id: col.number(),
        container_enz_no: col.string(),
        container_capacity: col.number(),
        container_qty: col.number(),
    }),

    ...defineTable('department', {
        _id: col.id(),
        dept_eng: col.string(),
        dept_hin: col.string(),
        dept_code: col.string(),
        active: col.boolean().default(1),
    }, {
        config: { hasOne: true, on: 'dept_id', table: 'department_config', target: '_id' }
    }),

    ...defineTable('department_config', {
        _id: col.id(),
        dept_id: col.number(),
        config_key: col.string(),
        config_value: col.string(), // json
    }),

    ...defineTable('zone', {
        _id: col.id(),
        zone_hin: col.string(),
        zone_eng: col.string(),
        country_id: col.ref('country._id', { as: 'country', select: ['country_hin', 'country_eng'] }),
        active: col.boolean().default(1),
    }),

    ...defineTable('state', {
        _id: col.id(),
        state_hin: col.string(),
        state_eng: col.string(),
        country_id: col.ref('country._id', { as: 'country', select: ['country_hin', 'country_eng'] }),
        zone_id: col.ref('zone._id', { as: 'zone', select: ['zone_hin', 'zone_eng'] }),
        active: col.boolean().default(1),
    }),

    ...defineTable('district', {
        _id: col.id(),
        district_hin: col.string(),
        district_eng: col.string(),
        state_id: col.ref('state._id', { as: 'state', select: ['state_hin', 'state_eng'] }),
        active: col.boolean().default(1),
    }),

    ...defineTable('city', {
        _id: col.id(),
        city_hin: col.string(),
        city_eng: col.string(),
        state_id: col.ref('state._id', { as: 'state', select: ['state_hin', 'state_eng'] }),
        active: col.boolean().default(1),
    }),

    ...defineTable('mm', {
        _id: col.id(),
        mm_hin: col.string(),
        mm_eng: col.string(),
        mm_roman: col.string(),
        mm_code: col.string(),
        dept_id: col.ref('department._id', { as: 'dept', select: ['dept_hin', 'dept_eng', 'dept_code'] }),
        state_id: col.ref('state._id', { as: 'state', select: ['state_hin', 'state_eng'] }),
        active: col.boolean().default(1),
    }),

    ...defineTable('pbk', {
        _id: col.id(),
        roll_no: col.number(),
        pbk_hin: col.string(),
        pbk_eng: col.string(),
        pbk_roman: col.string(),
        gender: col.string(),
        relation: col.string(),
        relative_name: col.string(),
        state_id: col.ref('state._id', { as: 'state', select: ['state_hin', 'state_eng'] }),
        district_id: col.ref('district._id', { as: 'district', select: ['district_hin', 'district_eng'] }),
        city_id: col.ref('city._id', { as: 'city', select: ['city_hin', 'city_eng'] }),
        active: col.boolean().default(1),
    }),

    ...defineTable('jawak_enzyme', {
        _id: col.id(),
        jawak_id: col.number(),
        container_capacity: col.number(),
    }),

    ...defineTable('country', {
        _id: col.id(),
        add_by_dept_id: col.number(),
        update_by_dept_id: col.number(),
        verify: col.boolean().default(0),
        active: col.boolean().default(1),
        country_hin: col.string(),
        country_eng: col.string(),
    }),

    ...defineTable('dictionary', {
        _id: col.id(),
        id: col.number(),
        id2: col.number(),
        type: col.string(),
        name: col.string(),
        extra_note: col.string(),
    }),

    ...defineTable('pbk_closing', {
        _id: col.id(),
        pbk_id: col.ref('pbk._id', { as: 'pbk', select: ['pbk_hin', 'pbk_eng', 'pbk_roman', 'roll_no'] }),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] }),
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: ['item_id', 'subitem_list_id'] }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        dept_id: col.ref('department._id', { as: 'dept', select: ['dept_hin', 'dept_eng'] }),
        qty: col.number(),
        sw_bachat: col.number(),
        difference: col.number(),
        hl: col.boolean().default(0),
        is_xl: col.boolean().default(0),
        active: col.boolean().default(1),
        voucher_no: col.string(),
        date: col.string(),
    }),

    ...defineTable('pbk_bachat', {
        _id: col.id(),
        pbk_id: col.ref('pbk._id', { as: 'pbk', select: ['pbk_hin', 'pbk_eng', 'pbk_roman', 'roll_no'] }),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] }),
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: ['item_id', 'subitem_list_id'] }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        dept_id: col.ref('department._id', { as: 'dept', select: ['dept_hin', 'dept_eng'] }),
        qty: col.number().default(0),
        active: col.boolean().default(1),
    }),

};
