'use strict';

const BaseTable = require('../database/base.table');
const { sutramDB } = require('../database/db.model');

const department_config = new BaseTable('department_config');

const DB_GEN_CONFIG = {
    // --- MASTER TABLES (Fully Copied) ---
    country: { label: 'Country', compulsory: true, handle_type: 'all' },
    zone: { label: 'Zone', compulsory: true, handle_type: 'all' },
    state: { label: 'State', compulsory: true, handle_type: 'all' },
    district: { label: 'District', compulsory: true, handle_type: 'all' },
    city: { label: 'City', compulsory: true, handle_type: 'all' },
    category: { label: 'Category', compulsory: true, handle_type: 'all' },
    unit: { label: 'Unit', compulsory: false, handle_type: 'custom_selection' },
    point: { label: 'Point', compulsory: true, handle_type: 'all' },
    mm: { label: 'MM', compulsory: true, handle_type: 'all' },
    subitem_list: { label: 'Subitem List', compulsory: true, handle_type: 'custom_selection' },

    // --- CONFIG-DRIVEN TABLES (Filtered by User Selection in Settings) ---
    support_list: { label: 'Small Lists (Support)', compulsory: false, handle_type: 'department_config' },
    item: { label: 'Item', compulsory: false, handle_type: 'department_config' },
    subitem: { label: 'Subitem', compulsory: false, handle_type: 'department_config' },
    pbk: { label: 'PBK / Sewadhari', compulsory: false, handle_type: 'department_config' },
    nimitt: { label: 'Nimitt', compulsory: false, handle_type: 'department_config' },

    // --- VARIANT & ATTRIBUTE TABLES (Automated) ---
    attributes: { label: 'Attributes', compulsory: true, handle_type: 'all' },
    attributes_value: { label: 'Attribute Values', compulsory: true, handle_type: 'all' },
    variant: { label: 'Variants', handle_type: 'auto', depends_on: 'item', parent_col: 'item_id' },
    variant_attribute_map: { label: 'Variant Attribute Map', handle_type: 'auto', depends_on: 'variant', parent_col: 'variant_id' },
    variant_category_map: { label: 'Variant Category Map', handle_type: 'auto', depends_on: 'variant', parent_col: 'variant_id' },
    variant_aliases: { label: 'Variant Aliases', handle_type: 'auto', depends_on: 'variant', parent_col: 'variant_id' },
    item_aliases: { label: 'Item Aliases', handle_type: 'auto', depends_on: 'item', parent_col: 'item_id' },
    item_source_map: { label: 'Item Source Map', handle_type: 'auto', depends_on: 'item', parent_col: 'item_id' },
    rel_item_category: { label: 'Item Category Map', handle_type: 'auto', depends_on: 'item', parent_col: 'item_id' },
    rel_subitem_category: { label: 'Subitem Category Map', handle_type: 'auto', depends_on: 'subitem', parent_col: 'subitem_id' },

    // --- OPERATIONAL TABLES (Filtered by Department ID) ---
    vehicle: { label: 'Vehicle', compulsory: false, handle_type: 'custom_selection' },

    // --- MANUAL SELECTION TABLES ---
    vehicle_document: { label: 'Vehicle Document', compulsory: false, handle_type: 'custom_selection', ignore_conflict: true },
    dictionary: { label: 'Dictionary (Excel Aliases)', compulsory: false, handle_type: 'custom_selection' },

    // --- CUSTOM LOGIC TABLES ---
    department: {
        label: 'Department', compulsory: true, handle_type: 'custom',
        queries: [
            `insert or ignore into department(_id, dept_eng, dept_hin, dept_code, settings, password, active, created_at, updated_at) select _id, dept_eng, dept_hin, dept_code, '{}', password, active, created_at, updated_at from mainDB.department`,
            `update department set settings = (select settings from mainDB.department dp where dp._id = department._id) where department._id in (select json_each.value from mainDB.department_config, json_each(config_value) where dept_id = @dept_id AND config_key='department')`
        ]
    },
    department_config: {
        label: 'Department Config', compulsory: true, handle_type: 'custom',
        queries: [
            `insert or ignore into department_config select * from mainDB.department_config where dept_id = @dept_id OR dept_id in (select json_each.value from mainDB.department_config, json_each(config_value) where dept_id = @dept_id AND config_key='department')`,
            `update department_config set config_value = (select config_value from mainDB.department_config dpc where dpc.dept_id = department_config.dept_id and dpc.config_key = department_config.config_key) where department_config.dept_id = @dept_id OR department_config.dept_id in (select json_each.value from mainDB.department_config, json_each(config_value) where dept_id = @dept_id AND config_key='department')`
        ]
    }
};

function getQueriesForTable(tableName, customSelectionIds = null) {
    const config = DB_GEN_CONFIG[tableName];
    if (!config) return [];

    let queries = [];
    if (config.custom_setup) {
        queries.push(...config.custom_setup);
    }

    const ignore = ' or ignore';

    if (config.handle_type === 'all') {
        queries.push(`insert${ignore} into ${tableName} select * from mainDB.${tableName}`);
    }
    else if (config.handle_type === 'department_config') {
        queries.push(`insert${ignore} into ${tableName} select * from mainDB.${tableName} where ${tableName}._id in (select json_each.value from mainDB.department_config, json_each(config_value) where dept_id = @dept_id AND config_key='${tableName}')`);
    }
    else if (config.handle_type === 'custom_selection') {
        if (customSelectionIds && customSelectionIds.length > 0) {
            queries.push(`insert${ignore} into ${tableName} select * from mainDB.${tableName} where ${tableName}._id in (${customSelectionIds.join(',')})`);
        }
    }
    else if (config.handle_type === 'dept_id') {
        queries.push(`insert${ignore} into ${tableName} select * from mainDB.${tableName} where dept_id = @dept_id`);
    }
    else if (config.handle_type === 'auto') {
        // Automatically copy rows based on parent table's presence in target DB
        if (config.depends_on && config.parent_col) {
            const parentTable = config.depends_on;
            const parentConfig = DB_GEN_CONFIG[parentTable];

            if (parentConfig && parentConfig.handle_type === 'department_config') {
                // Nested subquery to match the department_config selection
                queries.push(`insert${ignore} into ${tableName} select * from mainDB.${tableName} where ${config.parent_col} in (select json_each.value from mainDB.department_config, json_each(config_value) where dept_id = @dept_id AND config_key='${parentTable}')`);
            } else {
                // Simple subquery based on whatever made it into the parent table in target DB
                queries.push(`insert${ignore} into ${tableName} select * from mainDB.${tableName} where ${config.parent_col} in (select _id from ${parentTable})`);
            }
        }
    }
    else if (config.handle_type === 'custom') {
        if (config.queries) queries.push(...config.queries);
    }
    return queries;
}

/**
 * Pushes a new ID into the department_config for a specific table/key.
 * Uses SQLite JSON functions to safely append to the array.
 */
function pushToConfig(dept_id, table_name, new_id) {
    if (!dept_id || !table_name || !new_id) return;

    // Check if config exists for this dept and key
    const existing = department_config.getOne({ dept_id, config_key: table_name });

    if (existing) {
        // We let Sutram magic handle the array serialization
        const arr = existing.config_value || [];
        if (Array.isArray(arr) && !arr.includes(Number(new_id))) {
            arr.push(Number(new_id));
            department_config.updateById({
                config_value: arr,
                updated_at: new Date().toISOString()
            }, existing._id);
        }
    } else {
        // Create new config with single-item array
        department_config.insert({
            dept_id,
            config_key: table_name,
            config_value: [Number(new_id)],
            active: 1,
            created_at: new Date().toISOString()
        });
    }
}

/**
 * Removes an ID from the department_config for a specific table/key.
 * Fetches, filters, and updates the array.
 */
function removeFromConfig(dept_id, table_name, id_to_remove) {
    if (!dept_id || !table_name || !id_to_remove) return;

    const existing = department_config.getOne({ dept_id, config_key: table_name });
    if (!existing) return;

    try {
        let arr = existing.config_value || [];
        if (Array.isArray(arr)) {
            arr = arr.filter(id => Number(id) !== Number(id_to_remove));
            department_config.updateById({
                config_value: arr,
                updated_at: new Date().toISOString()
            }, existing._id);
        }
    } catch (e) {
        console.error("Error updating department_config array:", e.message);
    }
}

module.exports = {
    pushToConfig,
    removeFromConfig,
    DB_GEN_CONFIG,
    getQueriesForTable
};
