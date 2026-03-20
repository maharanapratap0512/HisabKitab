// services/pbk_bachat.service.js
'use strict';

const BaseTable = require('../database/base.table');

// ── Table instances ───────────────────────────────────────────
const pbkBachatTable = new BaseTable('pbk_bachat');

/**
 * Get bachat for a specific PBK, filtered by dept and positive qty.
 * Includes nested joins for item, subitem, unit, condition, and pbk.
 */
function getBachatByPbk(pbk_id, dept_id) {
    // sutramcore's BaseTable.getAll() automatically handles the joins 
    // defined in schema.js (item, subitem, unit, condition, pbk).
    // And item.categories (manyToMany) is also auto-joined if in schema.
    return pbkBachatTable.getAll({
        pbk_id: Number(pbk_id),
        dept_id: Number(dept_id),
        qty: { '>': 0 }
    }, {
        orderBy: 'pbk_bachat._id ASC'
    });
}

module.exports = {
    getBachatByPbk,
};
