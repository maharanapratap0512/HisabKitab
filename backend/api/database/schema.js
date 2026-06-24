// database/schema.js
// Only simple tables (no business logic) live here.

const { defineTable, defineView, col } = require('sutramcore');

module.exports = {


    // ── Subitem ───────────────────────────────────────────────

    ...defineTable('subitem', {
        _id: col.id(),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] }),
        variant_id: col.ref('variant._id', { as: 'variant', select: ['sku', 'display_name'], join: true }),
        subitem_hin: col.string(),
        subitem_eng: col.string(),
        subitem_roman: col.string(),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        extra_note: col.string(),
        document: col.json(),
        restrict_month: col.number(),
        restrict_year: col.number(),
        min_rate: col.number(),
        max_rate: col.number(),
        add_by_dept_id: col.ref('department._id', { as: 'add_by_dept' }),
        update_by_dept_id: col.ref('department._id', { as: 'update_by_dept' }),
        verify: col.boolean().default(0),
        active: col.boolean().default(0),
        created_at: col.string(),
        updated_at: col.string(),
    }, {
        categories: { manyToMany: true, on: 'subitem_id', table: 'category', junction: 'rel_subitem_category', target: 'category_id', as: 'categories', select: ['_id', 'category_hin', 'category_eng'] },
    }),

    ...defineView('vsi', 'subitem'),

    // ── Item ──────────────────────────────────────────────────

    ...defineTable('item', {
        _id: col.id(),
        item_hin: col.string(),
        item_eng: col.string(),
        item_roman: col.string(),
        item_code: col.string(),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        extra_note: col.string(),
        document: col.json(),
        restrict_month: col.number(),
        restrict_year: col.number(),
        min_rate: col.number(),
        max_rate: col.number(),
        add_by_dept_id: col.ref('department._id', { as: 'add_by_dept' }),
        update_by_dept_id: col.ref('department._id', { as: 'update_by_dept' }),
        verify: col.boolean().default(0),
        active: col.boolean().default(1),
        created_at: col.string(),
        updated_at: col.string(),
    }, {
        subitems: { hasMany: true, on: 'item_id', table: 'subitem', target: '_id', as: 'subitems', select: '*' },
        categories: { manyToMany: true, on: 'item_id', table: 'category', junction: 'rel_item_category', target: 'category_id', as: 'categories', select: ['_id', 'category_hin', 'category_eng'] },
    }),

    ...defineView('vi', 'item'),



    // ── Prastav (Proposal) ─────────────────────────────────────

    ...defineTable('prastav', {
        _id: col.id(),
        voucher_no: col.number(),
        date: col.string(),
        mm_id: col.ref('mm._id', { as: 'mm', select: ['mm_hin', 'mm_eng', 'mm_roman', 'mm_code'] }),
        pbk_id: col.ref('pbk._id', { as: 'pbk', select: ['pbk_hin', 'pbk_eng', 'pbk_roman'] }),
        pbk_count: col.string(),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman', 'item_code'] }),
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: '*' }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        rate: col.number(),
        amount: col.number(),
        qty: col.number(),
        bachat: col.number(),
        monthly_uses: col.number(),
        qty_needs: col.number(),
        is_noted: col.boolean().default(0),
        note_details: col.string(),
        description: col.string(),
        active: col.boolean().default(1),
    }, {
        jawaks: { hasMany: true, on: 'prastav_id', table: 'prastav_jawak', target: '_id', as: 'jawaks', select: '*' }
    }),

    ...defineTable('prastav_jawak', {
        _id: col.id(),
        prastav_id: col.ref('prastav._id', { as: 'prastav', select: ['voucher_no', 'date', 'mm_id', 'item_id', 'unit_id'] }),
        date: col.string(),
        mm_id: col.ref('mm._id', { as: 'mm', select: ['mm_hin', 'mm_eng', 'mm_roman', 'mm_code'] }),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman', 'item_code'] }),
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: '*', join: true }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        qty: col.number(),
        rate: col.number(),
        amount: col.number(),
        bori_count: col.string(),
        kiske_dwara: col.string(),
        source_mm_id: col.ref('mm._id', { as: 'source_mm', select: ['mm_hin', 'mm_eng'] }),
        description: col.string(),
        is_received: col.boolean().default(0),
        active: col.boolean().default(1),
    }),

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
        outputs: { hasMany: true, on: 'recipe_id', table: 'hmp_recipe_output', target: '_id', as: 'outputs', select: '*', join: true },
    }),

    ...defineTable('hmp_recipe_input', {
        _id: col.id(),
        recipe_id: col.ref('hmp_recipe._id', { as: 'recipe', select: ['recipe_name', 'recipe_code'] }),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] }),
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: '*', join: true }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        qty: col.number(),
        active: col.boolean().default(1),
    }),

    ...defineTable('hmp_recipe_output', {
        _id: col.id(),
        recipe_id: col.ref('hmp_recipe._id', { as: 'recipe', select: ['recipe_name', 'recipe_code'] }),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] }),
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: '*', join: true }),
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
        batch_no: col.string().default(null),
        date: col.string(),
        notes: col.string(),
        active: col.boolean().default(1),
    }, {
        inputs: { hasMany: true, on: 'batch_id', table: 'hmp_batch_input', target: '_id', as: 'inputs', select: '*', join: true },
        outputs: { hasMany: true, on: 'batch_id', table: 'hmp_batch_output', target: '_id', as: 'outputs', select: '*', join: true },
    }),

    ...defineTable('hmp_batch_input', {
        _id: col.id(),
        batch_id: col.number(),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'], join: true }),
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: '*', join: true }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        aawak_source_id: col.ref('support_list._id', { as: 'aawak_source', select: ['list_name_hin', 'list_name_eng'] }),
        jawak_ref_id: col.ref('jawak._id', { as: 'jawak_ref', select: ['date', 'qty'] }),
        qty: col.number(),
        rate: col.number(),
        amount: col.number(),
        active: col.boolean().default(1),
        lot_no: col.string(),
        aawak_type_id: col.ref('support_list._id', { as: 'aawak_type', select: ['list_name_hin', 'list_name_eng'] }),
        is_auto_awk: col.boolean().default(0),
        is_auto_jwk: col.boolean().default(0),
    }),

    ...defineTable('hmp_batch_output', {
        _id: col.id(),
        batch_id: col.number(),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_roman'] }),
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: '*' }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        aawak_ref_id: col.ref('aawak._id', { as: 'aawak_ref', select: ['date', 'qty'] }),
        qty: col.number(),
        rate: col.number(),
        amount: col.number(),
        active: col.boolean().default(1),
        is_auto_awk: col.boolean().default(0),
    }),


    // ── Subitem List  ───────────────────────────────────────────────

    ...defineTable('subitem_list', {
        _id: col.id(),
        subitem_hin: col.string(),
        subitem_eng: col.string(),
        subitem_roman: col.string(),
        extra_note: col.string(),
        active: col.boolean().default(1),
    }),

    // ── Supporting tables ─────────────────────────────────────

    ...defineTable('aawak', {
        _id: col.id(),
        date: col.string(),
        mm_id: col.ref('mm._id', { as: 'mm', select: ['mm_hin', 'mm_eng', 'mm_code'] }),
        pkt_num: col.string(),
        pbk_id: col.ref('pbk._id', { as: 'pbk', select: ['roll_no', 'pbk_hin', 'pbk_eng', 'gender'] }),
        aawak_mm_id: col.ref('mm._id', { as: 'aawak_mm', select: ['mm_hin', 'mm_eng', 'mm_code'] }),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_code'], join: true }),
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: '*', join: true }),
        product_id: col.string(),
        item_detail: col.string(),
        company_name: col.string(),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        qty: col.number(),
        rate: col.number(),
        actual_amt: col.number(),
        aawak_type_id: col.ref('support_list._id', { as: 'aawak_type', select: ['list_name_hin', 'list_name_eng'] }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        description: col.string(),
        nimitt_id: col.ref('nimitt._id', { as: 'nimitt', select: ['nimitt_hin', 'nimitt_eng'] }),
        remaining_qty: col.number(),
        isbill: col.boolean(),
        document: col.json(),
        hl: col.boolean().default(0),
        active: col.boolean().default(1),
        dept_id: col.ref('department._id', { as: 'dept', select: ['dept_hin', 'dept_eng', 'dept_code'] }),
        voucher_no: col.number(),
        is_xl: col.boolean(),
        usage_list_id: col.ref('support_list._id', { as: 'usage_list', select: ['list_name_hin', 'list_name_eng'] }),
        is_auto_pd: col.boolean(),
        aawak_source_id: col.ref('support_list._id', { as: 'aawak_source', select: ['list_name_hin', 'list_name_eng'] }),
        lot_no: col.string(),
        is_auto: col.boolean(),
        is_variable_qty: col.boolean(),
        is_process: col.boolean(),
        reg_pg_no: col.string(),
    }, {
        jawak_detail: { hasMany: true, on: 'aawak_ref_id', table: 'jawak', target: '_id', as: 'jawak_detail' },
        enzymes: { hasMany: true, on: 'aawak_id', table: 'aawak_enzyme', target: '_id', as: 'enzymes' }
    }),

    ...defineTable('aawak_enzyme', {
        _id: col.id(),
        aawak_id: col.ref('aawak._id', { as: 'aawak' }),
        container_aawak_source_id: col.ref('support_list._id', { as: 'container_source', select: ['list_name_hin', 'list_name_eng'] }),
        container_enz_no: col.string(),
        container_capacity: col.ref('support_list._id', { as: 'capacity', select: ['list_name_hin', 'list_name_eng'] }),
        container_qty: col.number()
    }),

    ...defineTable('jawak', {
        _id: col.id(),
        date: col.string(),
        mm_id: col.ref('mm._id', { as: 'mm', select: ['mm_hin', 'mm_eng'] }),
        pkt_num: col.string(),
        pbk_id: col.ref('pbk._id', { as: 'pbk', select: ['pbk_hin', 'pbk_eng', 'roll_no'] }),
        jawak_mm_id: col.ref('mm._id', { as: 'jawak_mm', select: ['mm_hin', 'mm_eng'] }),
        item_id: col.ref('item._id', { as: 'item', select: ['item_hin', 'item_eng', 'item_code'], join: true }),
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: '*', join: true }),
        product_id: col.string(),
        item_detail: col.string(),
        company_name: col.string(),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        qty: col.number(),
        jawak_type_id: col.ref('support_list._id', { as: 'jawak_type', select: ['list_name_hin', 'list_name_eng'] }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        description: col.string(),
        nimitt_id: col.ref('nimitt._id', { as: 'nimitt', select: ['nimitt_hin', 'nimitt_eng'] }),
        aawak_ref_id: col.ref('aawak._id', { as: 'aawak_ref' }),
        hl: col.boolean().default(0),
        active: col.boolean().default(1),
        dept_id: col.ref('department._id', { as: 'dept', select: ['dept_hin', 'dept_eng', 'dept_code'] }),
        voucher_no: col.number(),
        is_xl: col.boolean(),
        usage_list_id: col.ref('support_list._id', { as: 'usage_list', select: ['list_name_hin', 'list_name_eng'] }),
        rate: col.number(),
        actual_amt: col.number(),
        sell_repair_place: col.string(),
        parchi_place: col.string(),
        aawak_source_id: col.ref('support_list._id', { as: 'aawak_source', select: ['list_name_hin', 'list_name_eng'] }),
        lot_no: col.string(),
        date_sent: col.string(),
        is_process: col.boolean(),
        reg_pg_no: col.string(),
        is_received: col.boolean(),
        container_qty: col.number()
    }, {
        enzymes: { hasMany: true, on: 'jawak_id', table: 'jawak_enzyme', target: '_id', as: 'enzymes' }
    }),

    ...defineTable('jawak_enzyme', {
        _id: col.id(),
        jawak_id: col.ref('jawak._id', { as: 'jawak' }),
        container_capacity: col.ref('support_list._id', { as: 'capacity', select: ['list_name_hin', 'list_name_eng'] }),
    }),

    ...defineTable('usage_report', {
        _id: col.id(),
        jawak_id: col.number(),
        usage_type_id: col.ref('support_list._id', { as: 'usage_type', select: ['list_name_hin', 'list_name_eng'] }),
        rating: col.number(),
        date: col.string(),
        reporter: col.string(),
        fayda: col.string(),
        nuksan: col.string(),
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
        config_value: col.json(),
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
        mm_hin: col.string().required(),
        mm_eng: col.string(),
        mm_roman: col.string(),
        mm_code: col.string(),
        dept_id: col.ref('department._id', { as: 'dept', select: ['dept_hin', 'dept_eng', 'dept_code'] }),
        state_id: col.ref('state._id', { as: 'state', select: ['state_hin', 'state_eng'] }),
        parent_mm_id: col.ref('mm._id', { as: 'parent_mm' }),
        opening_date: col.string(),
        nimitt_id: col.ref('nimitt._id', { as: 'nimitt', select: ['nimitt_hin', 'nimitt_eng'] }),
        active: col.boolean().default(0),
        created_at: col.string(),
        updated_at: col.string(),
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
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: '*' }),
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
        subitem_id: col.ref('subitem._id', { as: 'subitem', select: '*' }),
        unit_id: col.ref('unit._id', { as: 'unit', select: ['unit_short', 'unit_full'] }),
        condition_id: col.ref('support_list._id', { as: 'condition', select: ['list_name_hin', 'list_name_eng'] }),
        dept_id: col.ref('department._id', { as: 'dept', select: ['dept_hin', 'dept_eng'] }),
        qty: col.number().default(0),
        active: col.boolean().default(1),
    }),

    // ── Variant System (Version 30) ──────────────────────────

    ...defineTable('category', {
        _id: col.id(),
        category_hin: col.string().required(),
        category_eng: col.string(),
        category_roman: col.string(),
        parent_id: col.ref('category._id', { as: 'parent' }),
        alias: col.json(),
        sort_order: col.number().default(0),
        active: col.boolean().default(1),
        created_at: col.string(),
        updated_at: col.string(),
    }),

    ...defineTable('attributes', {
        _id: col.id(),
        attribute_hin: col.string().required(),
        attribute_eng: col.string(),
        attribute_roman: col.string(),
        active: col.boolean().default(1),
        created_at: col.string(),
    }),

    ...defineTable('attributes_value', {
        _id: col.id(),
        attribute_id: col.ref('attributes._id', { as: 'attribute' }),
        attribute_value_hin: col.string().required(),
        attribute_value_eng: col.string(),
        attribute_value_roman: col.string(),
        active: col.boolean().default(1),
        created_at: col.string(),
    }),

    ...defineTable('variant', {
        _id: col.id(),
        item_id: col.ref('item._id', { as: 'item' }),
        sku: col.string(),
        display_name: col.string(),
        active: col.boolean().default(1),
        fingerprint: col.string(),
        created_at: col.string(),
    }),

    ...defineTable('variant_attribute_map', {
        _id: col.id(),
        variant_id: col.ref('variant._id', { as: 'variant' }),
        attribute_id: col.ref('attributes._id', { as: 'attribute' }),
        attribute_value_id: col.ref('attributes_value._id', { as: 'attribute_value' }),
        active: col.boolean().default(1),
        created_at: col.string(),
    }),

    ...defineTable('variant_category_map', {
        _id: col.id(),
        variant_id: col.ref('variant._id', { as: 'variant' }),
        category_id: col.ref('category._id', { as: 'category' }),
        created_at: col.string(),
    }),

    ...defineTable('item_source_map', {
        _id: col.id(),
        item_id: col.ref('item._id', { as: 'item' }),
        source_item_id: col.ref('item._id', { as: 'source_item' }),
        created_at: col.string(),
    }),

    ...defineTable('item_aliases', {
        _id: col.id(),
        item_id: col.ref('item._id', { as: 'item' }),
        alias: col.string().required(),
        created_at: col.string(),
    }),

    ...defineTable('variant_aliases', {
        _id: col.id(),
        variant_id: col.ref('variant._id', { as: 'variant' }),
        alias: col.string().required(),
        created_at: col.string(),
    }),

    // ── System Lookups ────────────────────────────────────────

    ...defineTable('unit', {
        _id: col.id(),
        unit_short: col.string().required(),
        unit_full: col.string(),
        active: col.boolean().default(1),
        created_at: col.string(),
        updated_at: col.string(),
    }),

    ...defineTable('department_config', {
        dept_id: col.ref('department._id', { as: 'dept' }),
        config_key: col.string().required(),
        config_value: col.json(),
        active: col.boolean().default(1),
        created_at: col.string(),
        updated_at: col.string(),
    }),

    ...defineTable('support_list', {
        _id: col.id(),
        list_type: col.string().required(),
        list_name_hin: col.string(),
        list_name_eng: col.string().required(),
        list_name_roman: col.string(),
        active: col.boolean().default(1),
        created_at: col.string(),
        updated_at: col.string(),
    }),

    ...defineTable('nimitt', {
        _id: col.id(),
        old_id: col.number(),
        roll_no: col.number(),
        nimitt_hin: col.string().required(),
        nimitt_eng: col.string(),
        gender: col.string().required(),
        relative_name: col.string(),
        state_id: col.ref('state._id', { as: 'state' }),
        townarea: col.string(),
        document: col.json(),
        active: col.boolean().default(1),
        created_at: col.string(),
        updated_at: col.string(),
    }),

    ...defineTable('product', {
        _id: col.id(),
        mm_id: col.ref('mm._id', { as: 'mm' }),
        purchased_by: col.string(),
        purchase_date: col.string(),
        item_id: col.ref('item._id', { as: 'item' }),
        subitem_id: col.ref('subitem._id', { as: 'subitem' }),
        product_code: col.string(),
        company_name: col.string(),
        model_name: col.string(),
        sr_num: col.string(),
        condition_id: col.ref('support_list._id', { as: 'condition' }),
        price: col.number(),
        product_detail: col.string(),
        accessories: col.string(),
        purchase_from: col.string(),
        warranty_period: col.number(),
        dept_id: col.ref('department._id', { as: 'dept' }),
        warranty_from: col.string(),
        document: col.json(),
        nimmit: col.string(),
        active: col.boolean().default(1),
        created_at: col.string(),
        updated_at: col.string(),
    }),

    ...defineTable('bachat', {
        _id: col.id(),
        mm_id: col.ref('mm._id', { as: 'mm' }),
        item_id: col.ref('item._id', { as: 'item' }),
        subitem_id: col.ref('subitem._id', { as: 'subitem' }),
        Stock: col.number().default(0),
        Used: col.number().default(0),
        New: col.number().default(0),
        Old: col.number().default(0),
        Defective: col.number().default(0),
        Scrap: col.number().default(0),
        Repairing: col.number().default(0),
        unit_id: col.ref('unit._id', { as: 'unit' }),
        dept_id: col.ref('department._id', { as: 'dept' }),
        active: col.boolean().default(1),
        created_at: col.string(),
        updated_at: col.string(),
    }),

    ...defineTable('point', {
        _id: col.id(),
        type: col.string(),
        no: col.number(),
        mrl_date: col.string(),
        clrf_date: col.string(),
        time_from: col.string(),
        time_to: col.string(),
        point_hin: col.string().required(),
        point_eng: col.string(),
        active: col.boolean().default(1),
        created_at: col.string(),
        updated_at: col.string(),
    }),

    ...defineTable('rel_subitem_category', {
        _id: col.id(),
        subitem_id: col.number(),
        category_id: col.number(),
    }),

    ...defineTable('rel_item_category', {
        _id: col.id(),
        item_id: col.number(),
        category_id: col.number(),
    }),

};
