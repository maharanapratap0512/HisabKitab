// database/schema.js
// Only simple tables (no business logic) live here.

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
        }
    },

};

module.exports = { tableMeta };