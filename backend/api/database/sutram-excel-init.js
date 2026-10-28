// api/database/sutram-excel-init.js
// ─────────────────────────────────────────────────────────────
// SutramExcel Initialization & Table Whitelisting
// ─────────────────────────────────────────────────────────────

'use strict';

const { SutramExcel } = require('../../sutram/sutramExcel');
const { sutramEngine } = require('./db.model');

const sutramExcel = new SutramExcel(sutramEngine);

// 1. Basic Master Tables (100% Auto from Schema)
sutramExcel.register(sutramEngine.table('country'));
sutramExcel.register(sutramEngine.table('zone'));
sutramExcel.register(sutramEngine.table('state'));
sutramExcel.register(sutramEngine.table('district'));
sutramExcel.register(sutramEngine.table('city'));
sutramExcel.register(sutramEngine.table('category'));
sutramExcel.register(sutramEngine.table('unit'));

// 2. MM (Mini Madhuban)
sutramExcel.register(sutramEngine.table('mm'), {
    headers: {
        mm_hin:  { alt_names: ['mm', 'मि.म.', 'मिनी मधुबन'] },
        mm_code: { alt_names: ['code', 'कोड'] },
    },
    duplicateOn: ['mm_hin'],
    canUpdate: true
});

// 3. PBK (Sewadhari Directory)
sutramExcel.register(sutramEngine.table('pbk'), {
    headers: {
        roll_no:   { alt_names: ['roll no', 'रोल नं'] },
        pbk_hin:   { alt_names: ['name', 'नाम', 'pbk hin'] },
        gender:    { alt_names: ['लिंग', 'gender'] },
        state_id:  { alt_names: ['state', 'राज्य'] },
        district_id:{ alt_names: ['district', 'जिला'] },
        class_mm_id:{ alt_names: ['class mm', 'मि.म.'] },
    },
    duplicateOn: ['roll_no'],
    canUpdate: true
});

// 4. Nimitt
sutramExcel.register(sutramEngine.table('nimitt'), {
    headers: {
        roll_no:   { alt_names: ['roll no', 'रोल नं'] },
        nimitt_hin:{ alt_names: ['name', 'नाम'] },
        gender:    { alt_names: ['लिंग', 'gender'] },
        state_id:  { alt_names: ['state', 'राज्य'] },
    },
    duplicateOn: ['roll_no'],
    canUpdate: true
});

// 5. Product
sutramExcel.register(sutramEngine.table('product'), {
    headers: {
        purchase_date: { type: 'date', alt_names: ['date', 'तारीख'] },
        category_id:   { alt_names: ['cat', 'श्रेणी', 'category'] },
        unit_id:       { alt_names: ['unit', 'यूनिट', 'इकाई'] },
        mm_id:         { alt_names: ['mm', 'मि.म.'] },
    },
    duplicateOn: ['voucher_no'],
    canUpdate: true
});

module.exports = { sutramExcel };
