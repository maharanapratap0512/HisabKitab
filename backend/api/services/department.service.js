'use strict';

const BaseTable = require('../database/base.table');
const { sutramDB } = require('../database/db.model');

const department_config = new BaseTable('department_config');

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
    removeFromConfig
};
