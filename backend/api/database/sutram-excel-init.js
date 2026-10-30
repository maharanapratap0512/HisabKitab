// api/database/sutram-excel-init.js
// ─────────────────────────────────────────────────────────────
// SutramExcel Initialization & Table Whitelisting
// ─────────────────────────────────────────────────────────────

'use strict';

const { SutramExcel } = require('../../sutram/sutramExcel');
const { sutramEngine } = require('./db.model');

const sutramExcel = new SutramExcel(sutramEngine);

// ── 1. Basic Master Tables (100% Auto from Schema) ───────────
sutramExcel.register(sutramEngine.table('country'), {
    display_name: 'देश (Country)',
    duplicateOn: ['country_hin'],
    canUpdate: true
});
sutramExcel.register(sutramEngine.table('zone'), {
    display_name: 'जोन (Zone)',
    duplicateOn: ['zone_hin'],
    canUpdate: true
});
sutramExcel.register(sutramEngine.table('state'), {
    display_name: 'राज्य (State)',
    duplicateOn: ['state_hin', 'country_id'],
    canUpdate: true
});
sutramExcel.register(sutramEngine.table('district'), {
    display_name: 'जिला (District)',
    duplicateOn: ['district_hin', 'state_id'],
    canUpdate: true
});
sutramExcel.register(sutramEngine.table('city'), {
    display_name: 'शहर (City)',
    duplicateOn: ['city_hin', 'state_id'],
    canUpdate: true
});
sutramExcel.register(sutramEngine.table('category'), {
    display_name: 'श्रेणी (Category)',
    duplicateOn: ['category_hin'],
    canUpdate: true
});
sutramExcel.register(sutramEngine.table('unit'), {
    display_name: 'इकाई (Unit)',
    duplicateOn: ['unit_short'],
    canUpdate: true
});
sutramExcel.register(sutramEngine.table('department'), {
    display_name: 'विभाग (Department)',
    headers: {
        dept_hin:  { alt_names: ['dept', 'dept_hin', 'विभाग', 'विभाग नाम'] },
        dept_eng:  { alt_names: ['dept_eng', 'department', 'अंग्रेजी'] },
        dept_code: { alt_names: ['code', 'dept_code', 'कोड'] },
    },
    duplicateOn: ['dept_hin'],
    canUpdate: true
});
sutramExcel.register(sutramEngine.table('support_list'), {
    display_name: 'सपोर्ट लिस्ट (Support List)',
    headers: {
        list_type:       { alt_names: ['type', 'list_type', 'प्रकार', 'ग्रुप'] },
        list_name_hin:   { alt_names: ['name', 'list_name_hin', 'नाम', 'सूची नाम'] },
        list_name_eng:   { alt_names: ['english', 'list_name_eng'] },
        list_name_roman: { alt_names: ['roman', 'list_name_roman'] },
    },
    duplicateOn: ['list_type', 'list_name_hin'],
    canUpdate: true
});
sutramExcel.register(sutramEngine.table('subitem_list'), {
    display_name: 'सब-आइटम सूची (Subitem List)',
    headers: {
        subitem_hin:   { alt_names: ['subitem', 'subitem_hin', 'सबआइटम', 'नाम'] },
        subitem_eng:   { alt_names: ['subitem_eng', 'अंग्रेजी'] },
        subitem_roman: { alt_names: ['subitem_roman', 'रोमन'] },
    },
    duplicateOn: ['subitem_hin'],
    canUpdate: true
});

// ── 2. MM (Mini Madhuban) ────────────────────────────────────
sutramExcel.register(sutramEngine.table('mm'), {
    display_name: 'मिनी मधुबन (MM)',
    headers: {
        mm_hin:  { alt_names: ['mm', 'मि.म.', 'मिनी मधुबन'] },
        mm_code: { alt_names: ['code', 'कोड'] },
    },
    duplicateOn: ['mm_hin'],
    canUpdate: true
});

// ── 3. PBK (Sewadhari Directory) ─────────────────────────────
sutramExcel.register(sutramEngine.table('pbk'), {
    display_name: 'पीबीके (PBK Sewadhari)',
    headers: {
        roll_no:    { alt_names: ['roll no', 'रोल नं'] },
        pbk_hin:    { alt_names: ['name', 'नाम', 'pbk hin'] },
        gender:     { alt_names: ['लिंग', 'gender'] },
        state_id:   { alt_names: ['state', 'राज्य'] },
        district_id:{ alt_names: ['district', 'जिला'] },
        class_mm_id:{ alt_names: ['class mm', 'मि.म.'] },
    },
    duplicateOn: ['roll_no'],
    canUpdate: true
});

// ── 4. Nimitt ────────────────────────────────────────────────
sutramExcel.register(sutramEngine.table('nimitt'), {
    display_name: 'निमित्त (Nimitt)',
    headers: {
        roll_no:   { alt_names: ['roll no', 'रोल नं'] },
        nimitt_hin:{ alt_names: ['name', 'नाम'] },
        gender:    { alt_names: ['लिंग', 'gender'] },
        state_id:  { alt_names: ['state', 'राज्य'] },
    },
    duplicateOn: ['roll_no'],
    canUpdate: true
});

// ── 5. Item Master ───────────────────────────────────────────
sutramExcel.register(sutramEngine.table('item'), {
    display_name: 'आइटम (Item)',
    headers: {
        item_hin:   { alt_names: ['item', 'item_hin', 'नाम', 'सामग्री', 'आइटम', 'item name'] },
        item_eng:   { alt_names: ['item_eng', 'english', 'आइटम अंग्रेजी', 'Item Name Eng'] },
        item_roman: { alt_names: ['item_roman', 'roman', 'रोमन'] },
        item_code:  { alt_names: ['item_code', 'code', 'कोड'] },
        unit_id:    { alt_names: ['unit', 'यूनिट', 'इकाई'] },
        extra_note: { alt_names: ['note', 'extra_note', 'विवरण'] },
        min_rate:   { type: 'number', alt_names: ['min_rate', 'न्यूनतम दर'] },
        max_rate:   { type: 'number', alt_names: ['max_rate', 'अधिकतम दर'] },
    },
    duplicateOn: ['item_hin'],
    canUpdate: true
});

// ── 6. Subitem Master ────────────────────────────────────────
sutramExcel.register(sutramEngine.table('subitem'), {
    display_name: 'सब-आइटम (Subitem)',
    headers: {
        item_id:       { alt_names: ['item', 'item_id', 'आइटम', 'मुख्य आइटम'] },
        subitem_hin:   { alt_names: ['subitem', 'subitem_hin', 'सबआइटम', 'उप-सामग्री'] },
        subitem_eng:   { alt_names: ['subitem_eng', 'सबआइटम अंग्रेजी'] },
        subitem_roman: { alt_names: ['subitem_roman', 'सबआइटम रोमन'] },
        unit_id:       { alt_names: ['unit', 'यूनिट', 'इकाई'] },
        extra_note:    { alt_names: ['note', 'विवरण'] },
    },
    duplicateOn: ['item_id', 'subitem_hin'],
    canUpdate: true
});

// ── 7. Aawak (Incoming Inventory) ────────────────────────────
sutramExcel.register(sutramEngine.table('aawak'), {
    display_name: 'आवक (Aawak)',
    headers: {
        date:            { type: 'date', alt_names: ['date', 'तारीख', 'दिनांक'] },
        mm_id:           { alt_names: ['mm', 'मि.म.', 'मिनी मधुबन'] },
        pkt_num:         { alt_names: ['pkt', 'pkt_num', 'पैकेट नं'] },
        pbk_id:          { alt_names: ['pbk', 'भाई/बहन', 'व्यक्ति', 'दाता'] },
        aawak_mm_id:     { alt_names: ['aawak_mm', 'आवक मि.म.', 'स्रोत मि.म.'] },
        item_id:         { type: 'mix', alt_names: ['item', 'आइटम', 'सामग्री'] },
        subitem_id:      { alt_names: ['subitem', 'सबआइटम', 'उप-सामग्री'] },
        company_name:    { alt_names: ['company', 'कंपनी', 'ब्रांड'] },
        condition_id:    { alt_names: ['condition', 'हालत', 'स्थिति'] },
        qty:             { type: 'number', alt_names: ['qty', 'मात्रा', 'संख्या'] },
        rate:            { type: 'number', alt_names: ['rate', 'दर', 'भाव'] },
        actual_amt:      { type: 'number', alt_names: ['amount', 'रकम', 'मूल्य'] },
        aawak_type_id:   { alt_names: ['type', 'aawak_type', 'प्रकार', 'आवक प्रकार'] },
        unit_id:         { alt_names: ['unit', 'यूनिट', 'इकाई'] },
        description:     { alt_names: ['description', 'desc', 'विवरण', 'नोट'] },
        nimitt_id:       { alt_names: ['nimitt', 'निमित्त'] },
        voucher_no:      { type: 'number', alt_names: ['voucher', 'voucher_no', 'वाउचर नं'] },
        lot_no:          { alt_names: ['lot', 'lot_no', 'लॉट नं'] },
        isbill:          { type: 'boolean', alt_names: ['bill', 'isbill', 'बिल'] },
    },
    duplicateOn: ['voucher_no'],
    canUpdate: true,
    autoSet: { is_xl: 1, active: 1 }
});

// ── 8. Jawak (Outgoing Inventory) ────────────────────────────
sutramExcel.register(sutramEngine.table('jawak'), {
    display_name: 'जावक (Jawak)',
    headers: {
        date:              { type: 'date', alt_names: ['date', 'तारीख', 'दिनांक'] },
        mm_id:             { alt_names: ['mm', 'मि.म.', 'मिनी मधुबन'] },
        pkt_num:           { alt_names: ['pkt', 'pkt_num', 'पैकेट नं'] },
        pbk_id:            { alt_names: ['pbk', 'भाई/बहन', 'प्राप्तकर्ता'] },
        jawak_mm_id:       { alt_names: ['jawak_mm', 'जावक मि.म.', 'गंतव्य मि.म.'] },
        item_id:           { type: 'mix', alt_names: ['item', 'आइटम', 'सामग्री'] },
        subitem_id:        { alt_names: ['subitem', 'सबआइटम', 'उप-सामग्री'] },
        company_name:      { alt_names: ['company', 'कंपनी', 'ब्रांड'] },
        condition_id:      { alt_names: ['condition', 'हालत', 'स्थिति'] },
        qty:               { type: 'number', alt_names: ['qty', 'मात्रा', 'संख्या'] },
        rate:              { type: 'number', alt_names: ['rate', 'दर', 'भाव'] },
        actual_amt:        { type: 'number', alt_names: ['amount', 'रकम', 'मूल्य'] },
        jawak_type_id:     { alt_names: ['type', 'jawak_type', 'प्रकार', 'जावक प्रकार'] },
        unit_id:           { alt_names: ['unit', 'यूनिट', 'इकाई'] },
        description:       { alt_names: ['description', 'desc', 'विवरण', 'नोट'] },
        nimitt_id:         { alt_names: ['nimitt', 'निमित्त'] },
        voucher_no:        { type: 'number', alt_names: ['voucher', 'voucher_no', 'वाउचर नं'] },
        lot_no:            { alt_names: ['lot', 'lot_no', 'लॉट नं'] },
        sell_repair_place: { alt_names: ['place', 'स्थान', 'दुकान/जगह'] },
    },
    duplicateOn: ['voucher_no'],
    canUpdate: true,
    autoSet: { is_xl: 1, active: 1 }
});

// ── 9. Bachat (Stock Balances) ───────────────────────────────
sutramExcel.register(sutramEngine.table('bachat'), {
    display_name: 'बचत (Bachat / Stock)',
    headers: {
        mm_id:        { alt_names: ['mm', 'मि.म.', 'मिनी मधुबन'] },
        item_id:      { type: 'mix', alt_names: ['item', 'आइटम', 'सामग्री'] },
        subitem_id:   { alt_names: ['subitem', 'सबआइटम', 'उप-सामग्री'] },
        unit_id:      { alt_names: ['unit', 'यूनिट', 'इकाई'] },
        dept_id:      { alt_names: ['dept', 'विभाग'] },
        Stock:        { type: 'number', alt_names: ['stock', 'कुल स्टॉक', 'बचत', 'शेष', 'balance'] },
        Used:         { type: 'number', alt_names: ['used', 'उपयोग में', 'चालू'] },
        New:          { type: 'number', alt_names: ['new', 'नया'] },
        Old:          { type: 'number', alt_names: ['old', 'पुराना'] },
        Defective:    { type: 'number', alt_names: ['defective', 'खराब'] },
        Scrap:        { type: 'number', alt_names: ['scrap', 'कबाड़'] },
        Repairing:    { type: 'number', alt_names: ['repairing', 'मरम्मत'] },
    },
    duplicateOn: ['mm_id', 'item_id', 'subitem_id', 'unit_id', 'dept_id'],
    canUpdate: true,
    autoSet: { active: 1 }
});

// ── 10. Product Master ───────────────────────────────────────
sutramExcel.register(sutramEngine.table('product'), {
    display_name: 'उत्पाद (Product)',
    headers: {
        purchase_date: { type: 'date', alt_names: ['date', 'तारीख'] },
        category_id:   { alt_names: ['cat', 'श्रेणी', 'category'] },
        unit_id:       { alt_names: ['unit', 'यूनिट', 'इकाई'] },
        mm_id:         { alt_names: ['mm', 'मि.म.'] },
    },
    duplicateOn: ['voucher_no'],
    canUpdate: true
});

// ── 11. Vehicle Fleet ────────────────────────────────────────
sutramExcel.register(sutramEngine.table('vehicle'), {
    display_name: 'वाहन (Vehicle Fleet)',
    headers: {
        mm_id:             { alt_names: ['mm', 'मि.म.', 'मिनी मधुबन'] },
        vehicle_type:      { alt_names: ['type', 'vehicle_type', 'वाहन प्रकार', 'गाड़ी प्रकार'] },
        gadi_name:         { alt_names: ['name', 'gadi_name', 'गाड़ी नाम', 'मॉडल'] },
        gadi_num:          { alt_names: ['num', 'gadi_num', 'गाड़ी नंबर', 'वाहन नंबर', 'number'] },
        fuel_type:         { alt_names: ['fuel', 'fuel_type', 'ईंधन'] },
        seating_capacity:  { type: 'number', alt_names: ['seating', 'सीट', 'क्षमता'] },
        owner_name:        { alt_names: ['owner', 'मालिक का नाम'] },
        nominee:           { alt_names: ['nominee', 'नॉमिनी'] },
        aawak_type:        { alt_names: ['aawak_type', 'आवक प्रकार'] },
        rc_date:           { type: 'date', alt_names: ['rc_date', 'आरसी तारीख'] },
        rc_exp_date:       { type: 'date', alt_names: ['rc_exp_date', 'आरसी वैधता', 'RC Exp'] },
        rc_amount:         { type: 'number', alt_names: ['rc_amount', 'आरसी राशि'] },
        insurance_date:    { type: 'date', alt_names: ['insurance_date', 'बीमा तारीख'] },
        insurance_exp_date:{ type: 'date', alt_names: ['insurance_exp_date', 'बीमा वैधता', 'Insurance Exp'] },
        insurance_type:    { alt_names: ['insurance_type', 'बीमा प्रकार'] },
        insurance_company: { alt_names: ['insurance_company', 'बीमा कंपनी'] },
        insurance_amount:  { type: 'number', alt_names: ['insurance_amount', 'बीमा राशि'] },
        puc_date:          { type: 'date', alt_names: ['puc_date', 'प्रदूषण तारीख'] },
        puc_exp_date:      { type: 'date', alt_names: ['puc_exp_date', 'प्रदूषण वैधता', 'PUC Exp'] },
        puc_amount:        { type: 'number', alt_names: ['puc_amount', 'प्रदूषण राशि'] },
    },
    duplicateOn: ['gadi_num'],
    canUpdate: true
});

// ── 12. Prastav (Proposal) ───────────────────────────────────
sutramExcel.register(sutramEngine.table('prastav'), {
    display_name: 'प्रस्ताव (Prastav)',
    headers: {
        voucher_no: { type: 'number', alt_names: ['voucher', 'voucher_no', 'वाउचर नं'] },
        date:       { type: 'date', alt_names: ['date', 'तारीख', 'दिनांक'] },
        mm_id:      { alt_names: ['mm', 'मि.म.'] },
        pbk_id:     { alt_names: ['pbk', 'भाई/बहन'] },
        item_id:    { type: 'mix', alt_names: ['item', 'आइटम'] },
        subitem_id: { alt_names: ['subitem', 'सबआइटम'] },
        qty:        { type: 'number', alt_names: ['qty', 'मात्रा'] },
        unit_id:    { alt_names: ['unit', 'यूनिट'] },
    },
    duplicateOn: ['voucher_no'],
    canUpdate: true
});

module.exports = { sutramExcel };
