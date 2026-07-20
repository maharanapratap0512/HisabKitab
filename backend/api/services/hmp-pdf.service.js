// services/hmp-pdf.service.js
'use strict';

const puppeteer = require('puppeteer-core');
const os = require('os');
const path = require('path');
const pdfEngine = require('./pdf-engine.service');
const BaseTable = require('../database/base.table');

const departmentTable = new BaseTable('department');

/**
 * Format date from YYYY-MM-DD to DD-MM-YYYY
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (e) {
        return dateStr;
    }
}

/**
 * Format item name (including subitem and item parts)
 */
function formatItemName(row) {
    if (!row) return '';
    let hin = '';
    let eng = '';

    // Handle subitem
    if (row.subitem && row.subitem.subitem_list) {
        if (row.subitem.subitem_list.subitem_hin) {
            hin += row.subitem.subitem_list.subitem_hin + ' ';
        }
        if (row.subitem.subitem_list.subitem_eng) {
            eng += row.subitem.subitem_list.subitem_eng + ' ';
        }
    }

    // Handle item
    if (row.item) {
        hin += row.item.item_hin || '';
        eng += row.item.item_eng || '';
    }

    hin = hin.trim();
    eng = eng.trim();

    if (hin && eng) {
        return `${hin} <span class="sep-colon">:</span> <span class="eng-text">${eng}</span>`;
    } else if (hin) {
        return hin;
    } else if (eng) {
        return `<span class="eng-text">${eng}</span>`;
    }
    return '';
}

/**
 * Format metadata for input items
 */
function formatInputMetadata(row, settings = {}) {
    if (!row) return '';
    let parts = [];
    if (row.condition && settings.condition_id !== false) {
        const hin = row.condition.list_name_hin || '';
        const eng = row.condition.list_name_eng || '';
        if (hin && eng) parts.push(`Cond: ${hin} (${eng})`);
        else if (hin) parts.push(`Cond: ${hin}`);
        else if (eng) parts.push(`Cond: ${eng}`);
    }
    if (row.aawak_source && settings.aawak_source_id !== false) {
        const hin = row.aawak_source.list_name_hin || '';
        const eng = row.aawak_source.list_name_eng || '';
        if (hin && eng) parts.push(`Src: ${hin} (${eng})`);
        else if (hin) parts.push(`Src: ${hin}`);
        else if (eng) parts.push(`Src: ${eng}`);
    }
    if (row.lot_no) {
        parts.push(`Lot: ${row.lot_no}`);
    }
    if (row.auto_jawak && settings.auto_awk_jwk !== false) {
        if (row.auto_aawak) {
            const typeHin = row.aawak_type?.list_name_hin || '';
            const typeEng = row.aawak_type?.list_name_eng || '';
            const typeStr = typeHin || typeEng ? ` (${typeHin || typeEng})` : '';
            parts.push(`<span class="badge badge-success" style="font-size:7.5px;">Auto Awk${typeStr}</span>`);
        } else {
            parts.push(`<span class="badge badge-warning" style="font-size:7.5px;">Auto Jawk</span>`);
        }
    }
    if (parts.length === 0) return '';
    return `<div style="font-size: 8px; color: #7f8c8d; margin-top: 2px;">${parts.join(' | ')}</div>`;
}

/**
 * Format metadata for output items
 */
function formatOutputMetadata(row, settings = {}) {
    if (!row) return '';
    let parts = [];
    if (row.condition && settings.condition_id !== false) {
        const hin = row.condition.list_name_hin || '';
        const eng = row.condition.list_name_eng || '';
        if (hin && eng) parts.push(`Cond: ${hin} (${eng})`);
        else if (hin) parts.push(`Cond: ${hin}`);
        else if (eng) parts.push(`Cond: ${eng}`);
    }
    if (row.auto_aawak && settings.auto_awk_jwk !== false) {
        parts.push(`<span class="badge badge-success" style="font-size:7.5px;">Auto Awk</span>`);
    }
    if (parts.length === 0) return '';
    return `<div style="font-size: 8px; color: #7f8c8d; margin-top: 2px;">${parts.join(' | ')}</div>`;
}

/**
 * Format jawak party and destination information
 */
function formatJawakParty(jw) {
    if (!jw) return '';
    let parts = [];
    if (jw.jawak_mm) {
        const hin = jw.jawak_mm.mm_hin || '';
        const eng = jw.jawak_mm.mm_eng || '';
        if (hin && eng) parts.push(`${hin} (${eng})`);
        else if (hin) parts.push(hin);
        else if (eng) parts.push(eng);
    } else if (jw.mm) {
        const hin = jw.mm.mm_hin || '';
        const eng = jw.mm.mm_eng || '';
        if (hin && eng) parts.push(`${hin} (${eng})`);
        else if (hin) parts.push(hin);
        else if (eng) parts.push(eng);
    }
    if (jw.pbk) {
        const hin = jw.pbk.pbk_hin || '';
        const roll = jw.pbk.roll_no ? `Roll: ${jw.pbk.roll_no}` : '';
        if (hin && roll) parts.push(`${hin} [${roll}]`);
        else if (hin) parts.push(hin);
    }
    if (jw.nimitt) {
        const hin = jw.nimitt.nimitt_hin || '';
        if (hin) parts.push(`Nimitt: ${hin}`);
    }

    // Add destinations
    if (jw.sell_repair_place) {
        parts.push(`Place: ${jw.sell_repair_place}`);
    }
    if (jw.parchi_place) {
        parts.push(`Parchi: ${jw.parchi_place}`);
    }

    return parts.join(' · ') || jw.description || '-';
}

/**
 * Format jawak type details
 */
function formatJawakType(jw) {
    if (!jw) return '';
    if (jw.jawak_type) {
        return jw.jawak_type.list_name_hin || jw.jawak_type.list_name_eng || '';
    }
    return '';
}

/**
 * Generate PDF buffer for HMP Batches
 */
async function generateHmpPdf(batches, dept_id, filters = {}) {
    // Fetch department details
    let deptName = '';
    try {
        const dept = departmentTable.getById(dept_id);
        if (dept) {
            deptName = dept.dept_hin || dept.dept_eng || '';
        }
    } catch (e) {
        console.error('Error fetching department:', e);
    }

    const viewMode = filters.viewMode || 'voucher';
    const settings = filters.settings || {};

    // Calculate summaries
    const totalCount = batches.length;
    const completedCount = batches.filter(b => b.status === 'completed').length;
    const pendingCount = batches.filter(b => b.status === 'pending').length;

    // Build filter text
    const filterParts = [];
    if (filters.date_from && filters.date_to) {
        filterParts.push(`Date: ${formatDate(filters.date_from)} to ${formatDate(filters.date_to)}`);
    } else if (filters.date_from) {
        filterParts.push(`Date: From ${formatDate(filters.date_from)}`);
    } else if (filters.date_to) {
        filterParts.push(`Date: Up to ${formatDate(filters.date_to)}`);
    } else if (filters.year) {
        filterParts.push(`Year: ${filters.year}`);
    }

    const filterText = filterParts.join(' | ') || 'All Batches';

    // HTML template
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>HMP Batches Report</title>
        <style>
            @page {
                size: A4;
                margin: 12mm 12mm 15mm 12mm;
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                background: #ffffff;
                color: #2c3e50;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                font-size: 11px;
                line-height: 1.4;
                padding: 0;
            }
            
            /* --- HEADER SECTION --- */
            .header-container {
                border-bottom: 2px solid #4a38c2;
                padding-bottom: 10px;
                margin-bottom: 15px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }
            .header-left h1 {
                font-size: 18px;
                color: #1a1d2e;
                font-weight: 700;
                margin-bottom: 4px;
            }
            .header-left .dept-name {
                font-size: 12px;
                color: #5a6b82;
                font-weight: 600;
            }
            .header-right {
                text-align: right;
                font-size: 10px;
                color: #7f8c8d;
            }
            .header-right .date {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 2px;
            }

            /* --- METADATA & SUMMARY --- */
            .summary-bar {
                display: flex;
                justify-content: space-between;
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 10px 15px;
                margin-bottom: 20px;
            }
            .summary-item {
                display: flex;
                flex-direction: column;
            }
            .summary-item .label {
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #7f8c8d;
                margin-bottom: 2px;
            }
            .summary-item .value {
                font-size: 13px;
                font-weight: 700;
                color: #1a1d2e;
            }
            .summary-item .value.success {
                color: #2ecc71;
            }
            .summary-item .value.warning {
                color: #f39c12;
            }

            /* --- BADGES --- */
            .badge {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: 700;
                text-transform: uppercase;
                white-space: nowrap;
            }
            .badge-success {
                background-color: #d4edda;
                color: #155724;
            }
            .badge-warning {
                background-color: #fff3cd;
                color: #856404;
            }
            .badge-in {
                background-color: #e8f4fd;
                color: #0066cc;
                border-radius: 20px;
                padding: 1px 6px;
            }
            .badge-out {
                background-color: #edf7ed;
                color: #1e4620;
                border-radius: 20px;
                padding: 1px 6px;
            }

            /* --- VOUCHER MODE LAYOUT --- */
            .voucher-card {
                border: 1px solid #e1e4e8;
                border-radius: 8px;
                margin-bottom: 15px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                page-break-inside: avoid;
                overflow: hidden;
            }
            .voucher-header {
                background-color: #f5f6fa;
                border-bottom: 1px solid #e1e4e8;
                padding: 8px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .voucher-header .meta-left {
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
            }
            .voucher-header .meta-left strong {
                font-size: 12px;
                color: #1a1d2e;
            }
            .voucher-header .sep {
                color: #ccc;
            }
            .voucher-header .recipe-desc {
                color: #7f8c8d;
                font-size: 10px;
            }
            .voucher-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
            }
            .voucher-col {
                padding: 0;
            }
            .voucher-col:first-child {
                border-right: 1px solid #e1e4e8;
            }
            .col-title {
                padding: 4px 10px;
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            .col-title-in {
                background-color: #f0f6ff;
                color: #0066cc;
                border-bottom: 1px solid #d0e3ff;
            }
            .col-title-out {
                background-color: #f0fcf0;
                color: #1e4620;
                border-bottom: 1px solid #d0ffd0;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th {
                text-align: left;
                padding: 5px 8px;
                font-size: 9px;
                text-transform: uppercase;
                color: #7f8c8d;
                border-bottom: 1px solid #e1e4e8;
                background-color: #fafbfc;
            }
            td {
                padding: 5px 8px;
                border-bottom: 1px solid #f1f2f6;
                color: #2c3e50;
                vertical-align: middle;
            }
            tr:last-child td {
                border-bottom: none;
            }
            .eng-text {
                color: #7f8c8d;
                font-size: 10px;
            }
            .sep-colon {
                color: #bdc3c7;
                padding: 0 2px;
            }
            .text-center {
                text-align: center;
            }
            .text-muted {
                color: #95a5a6;
                font-style: italic;
            }

            /* --- INDIVIDUAL FLAT TABLE MODE --- */
            .flat-table {
                width: 100%;
                border: 1px solid #e1e4e8;
                border-radius: 6px;
                overflow: hidden;
            }
            .flat-table th {
                background-color: #f5f6fa;
                color: #1a1d2e;
                font-weight: 600;
                border-bottom: 2px solid #e1e4e8;
            }
            .flat-table td {
                border-bottom: 1px solid #e1e4e8;
            }
            .flat-table tr.batch-start td {
                border-top: 2px solid #b2bec3;
            }
            .flat-table tr.grp-sep td {
                border-top: 1px dashed #dfe6e9;
            }
            .flat-table td.date-cell {
                border-left: 3px solid #4a38c2;
                font-weight: 600;
            }

            /* --- ADVANCE LAYOUT --- */
            .advance-page {
                page-break-after: always;
                padding-bottom: 10px;
            }
            .advance-page:last-child {
                page-break-after: avoid;
            }
            .batch-title-sec {
                background: #f8f9fa;
                border-left: 4px solid #4a38c2;
                padding: 10px 15px;
                margin-bottom: 15px;
                border-radius: 0 6px 6px 0;
            }
            .batch-title-sec h2 {
                font-size: 14px;
                color: #1a1d2e;
                font-weight: 700;
                margin-bottom: 5px;
            }
            .batch-meta-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                font-size: 10px;
            }
            .meta-box {
                display: flex;
                flex-direction: column;
            }
            .meta-box .label {
                color: #7f8c8d;
                text-transform: uppercase;
                font-size: 8px;
                letter-spacing: 0.5px;
                margin-bottom: 2px;
            }
            .meta-box .val {
                font-weight: 600;
                color: #2c3e50;
            }
            .dist-section-title {
                font-size: 11px;
                font-weight: 700;
                color: #2c3e50;
                margin: 15px 0 6px 0;
                padding-bottom: 4px;
                border-bottom: 1px dashed #d1d5db;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .dist-item-header {
                font-size: 10px;
                font-weight: 600;
                color: #4a38c2;
                background: #f0effc;
                padding: 4px 8px;
                border-radius: 4px;
                margin-top: 8px;
                margin-bottom: 4px;
            }
            .dist-table {
                width: 100%;
                margin-bottom: 15px;
                border: 1px solid #e1e4e8;
                border-radius: 6px;
                overflow: hidden;
            }
            .dist-table th {
                background-color: #f8f9fa;
                font-size: 8px;
                color: #5a6b82;
                padding: 4px 6px;
                border-bottom: 1px solid #e1e4e8;
            }
            .dist-table td {
                padding: 4px 6px;
                font-size: 9.5px;
                border-bottom: 1px solid #f1f2f6;
            }
            
            /* --- ADVANCE PAGE BREAK FIX --- */
            /* Prevent a blank trailing page by NOT forcing break on last batch */
            .advance-page:last-child {
                break-after: avoid !important;
                page-break-after: avoid !important;
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <div class="header-container">
            <div class="header-left">
                <h1>HMP Batches Report</h1>
                <div class="dept-name">Department: ${deptName || 'N/A'}</div>
            </div>
            <div class="header-right">
                <div class="date">Generated: ${new Date().toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                <div>Filter: ${filterText}</div>
            </div>
        </div>

        <!-- Summary Bar -->
        <div class="summary-bar">
            <div class="summary-item">
                <span class="label">Total Batches</span>
                <span class="value">${totalCount}</span>
            </div>
            <div class="summary-item">
                <span class="label">Completed</span>
                <span class="value success">${completedCount}</span>
            </div>
            <div class="summary-item">
                <span class="label">Pending</span>
                <span class="value warning">${pendingCount}</span>
            </div>
            <div class="summary-item">
                <span class="label">Report Layout</span>
                <span class="value" style="text-transform: capitalize;">${viewMode} Wise</span>
            </div>
        </div>
    `;

    const hiddenNotes = [];
    if (settings.condition_id === false) hiddenNotes.push('Condition');
    if (settings.aawak_source_id === false) hiddenNotes.push('Aawak Source');
    if (settings.auto_awk_jwk === false) hiddenNotes.push('Auto Jawk/Awk');
    if (settings.aawak_ref_id === false) hiddenNotes.push('Ref. Aawak');

    if (hiddenNotes.length > 0) {
        htmlContent += `
            <div style="margin-bottom: 15px; padding: 6px 12px; background-color: #fff9db; border: 1px solid #ffe3e3; border-radius: 4px; color: #c92a2a; font-size: 9px; font-weight: 600;">
                ⚠️ Note: The following columns/data are hidden per UI settings: ${hiddenNotes.join(', ')}
            </div>
        `;
    }

    const exportType = filters.exportType || 'normal';

    if (exportType === 'advance') {
        // Render Advance layout
        if (batches.length === 0) {
            htmlContent += `
                <div style="text-align: center; padding: 40px; border: 1px dashed #ccc; border-radius: 8px; color: #7f8c8d;">
                    No batches selected.
                </div>
            `;
        } else {
            for (const batch of batches) {
                const statusBadge = batch.status === 'completed'
                    ? '<span class="badge badge-success">completed</span>'
                    : '<span class="badge badge-warning">pending</span>';

                htmlContent += `
                    <div class="advance-page">
                        <!-- Batch Title Section -->
                        <div class="batch-title-sec">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <h2>Batch: ${batch.recipe?.recipe_name || 'N/A'}</h2>
                                ${statusBadge}
                            </div>
                            <div class="batch-meta-grid">
                                <div class="meta-box">
                                    <span class="label">Date</span>
                                    <span class="val">${formatDate(batch.date)}</span>
                                </div>
                                <div class="meta-box">
                                    <span class="label">MM (Party)</span>
                                    <span class="val">${batch.mm?.mm_hin || ''} · ${batch.mm?.mm_eng || ''}</span>
                                </div>
                                <div class="meta-box">
                                    <span class="label">Description</span>
                                    <span class="val">${batch.recipe?.description || '-'}</span>
                                </div>
                                <div class="meta-box">
                                    <span class="label">Batch No</span>
                                    <span class="val">${batch.batch_no || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Left Side Input, Right Side Output Grid -->
                        <div class="voucher-body" style="margin-bottom: 15px; border: 1px solid #e1e4e8; border-radius: 6px; overflow: hidden;">
                            <!-- Inputs -->
                            <div class="voucher-col">
                                <div class="col-title col-title-in">⬇ &nbsp; INPUT MATERIALS</div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="8%">#</th>
                                            <th width="62%">Item</th>
                                            <th width="20%">Qty</th>
                                            <th width="10%">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                `;

                if (!batch.inputs || batch.inputs.length === 0) {
                    htmlContent += `
                        <tr>
                            <td colspan="4" class="text-center text-muted">No inputs</td>
                        </tr>
                    `;
                } else {
                    batch.inputs.forEach((inp, idx) => {
                        htmlContent += `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${formatItemName(inp)}${formatInputMetadata(inp, settings)}</td>
                                <td><strong>${inp.qty}</strong> <small class="eng-text">${inp.unit.unit_short || ''}</small></td>
                                <td>${inp.rate || '-'}</td>
                            </tr>
                        `;
                    });
                }

                htmlContent += `
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Outputs -->
                            <div class="voucher-col">
                                <div class="col-title col-title-out">⬆ &nbsp; OUTPUT PRODUCTS</div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="8%">#</th>
                                            <th width="62%">Item</th>
                                            <th width="20%">Qty</th>
                                            <th width="10%">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                `;

                if (!batch.outputs || batch.outputs.length === 0) {
                    htmlContent += `
                        <tr>
                            <td colspan="4" class="text-center text-muted">No outputs</td>
                        </tr>
                    `;
                } else {
                    batch.outputs.forEach((out, idx) => {
                        htmlContent += `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${formatItemName(out)}${formatOutputMetadata(out, settings)}</td>
                                <td><strong>${out.qty}</strong> <small class="eng-text">${out.unit.unit_short || ''}</small></td>
                                <td>${out.rate || '-'}</td>
                            </tr>
                        `;
                    });
                }

                htmlContent += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                `;

                // Render Distributions (Jawak) if any outputs have jawaks
                let hasDistributions = false;
                if (batch.outputs && batch.outputs.length > 0) {
                    hasDistributions = batch.outputs.some(out => out.jawaks && out.jawaks.length > 0);
                }

                if (hasDistributions) {
                    htmlContent += `
                        <div class="dist-section-title">Output Distributions</div>
                    `;

                    batch.outputs.forEach((out) => {
                        if (out.jawaks && out.jawaks.length > 0) {
                            // Calculate distributed total and remaining
                            const totalDistributed = out.jawaks.reduce((sum, jw) => sum + (parseFloat(jw.qty) || 0), 0);
                            const outQty = parseFloat(out.qty) || 0;
                            const remaining = outQty - totalDistributed;
                            const remainingClass = remaining < 0 ? 'color:#e74c3c;font-weight:700;' : remaining === 0 ? 'color:#27ae60;font-weight:700;' : 'color:#f39c12;font-weight:700;';

                            htmlContent += `
                                <div class="dist-item-header" style="display:flex; justify-content:space-between; align-items:center;">
                                    <span>Distribution for: ${formatItemName(out)}</span>
                                    <span style="font-size:9px; font-weight:normal; letter-spacing:0;">
                                        <span style="background:#e8f4fd; color:#0066cc; padding:2px 6px; border-radius:4px; margin-right:6px;">Qty: <strong>${out.qty} ${out.unit.unit_short || ''}</strong></span>
                                        <span style="background:#f0fcf0; color:#1e4620; padding:2px 6px; border-radius:4px; margin-right:6px;">Distributed: <strong>${totalDistributed.toFixed(3).replace(/\.?0+$/, '')}</strong></span>
                                        <span style="background:#fff8e1; padding:2px 6px; border-radius:4px; ${remainingClass}">Remaining: ${remaining.toFixed(3).replace(/\.?0+$/, '')}</span>
                                    </span>
                                </div>
                                <table class="dist-table">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="12%">Date</th>
                                            <th width="45%">Destination / Party</th>
                                            <th width="18%">Jawak Type</th>
                                            <th width="10%">Qty</th>
                                            <th width="10%">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                            `;

                            out.jawaks.forEach((jw, jwIdx) => {
                                htmlContent += `
                                    <tr>
                                        <td>${jwIdx + 1}</td>
                                        <td>${formatDate(jw.date)}</td>
                                        <td>${formatJawakParty(jw)}</td>
                                        <td>${formatJawakType(jw)}</td>
                                        <td><strong>${jw.qty}</strong> <small class="eng-text">${jw.unit.unit_short || ''}</small></td>
                                        <td>${jw.rate || '-'}</td>
                                    </tr>
                                `;
                            });

                            // Total row at the bottom of the dist table
                            htmlContent += `
                                        <tr style="background:#f8f9fa; font-weight:600; border-top:2px solid #dee2e6;">
                                            <td colspan="4" style="text-align:right; color:#5a6b82; font-size:9px; text-transform:uppercase; letter-spacing:0.5px;">Total Distributed</td>
                                            <td><strong>${totalDistributed.toFixed(3).replace(/\.?0+$/, '')}</strong></td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            `;
                        }
                    });
                }

                htmlContent += `
                    </div>
                `;
            }
        }
    } else if (viewMode === 'voucher') {
        // Render Voucher Wise layout
        if (batches.length === 0) {
            htmlContent += `
                <div style="text-align: center; padding: 40px; border: 1px dashed #ccc; border-radius: 8px; color: #7f8c8d;">
                    No batches found matching the filter criteria.
                </div>
            `;
        } else {
            for (const batch of batches) {
                const statusBadge = batch.status === 'completed'
                    ? '<span class="badge badge-success">completed</span>'
                    : '<span class="badge badge-warning">pending</span>';

                htmlContent += `
                    <div class="voucher-card">
                        <div class="voucher-header">
                            <div class="meta-left">
                                <strong>${formatDate(batch.date)}</strong>
                                <span class="sep">|</span>
                                <strong>${batch.recipe?.recipe_name || 'N/A'}</strong>
                                <span class="sep">|</span>
                                <span class="recipe-desc">${batch.recipe?.description || ''}</span>
                                <span class="sep">|</span>
                                <span>${batch.mm?.mm_hin || ''} · ${batch.mm?.mm_eng || ''}</span>
                            </div>
                            <div>
                                ${statusBadge}
                            </div>
                        </div>
                        <div class="voucher-body">
                            <!-- Inputs -->
                            <div class="voucher-col">
                                <div class="col-title col-title-in">⬇ &nbsp; INPUT MATERIALS</div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="8%">#</th>
                                            <th width="62%">Item</th>
                                            <th width="20%">Qty</th>
                                            <th width="10%">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                `;

                if (!batch.inputs || batch.inputs.length === 0) {
                    htmlContent += `
                        <tr>
                            <td colspan="4" class="text-center text-muted">No inputs</td>
                        </tr>
                    `;
                } else {
                    batch.inputs.forEach((inp, idx) => {
                        htmlContent += `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${formatItemName(inp)}${formatInputMetadata(inp, settings)}</td>
                                <td><strong>${inp.qty}</strong> <small class="eng-text">${inp.unit.unit_short || ''}</small></td>
                                <td>${inp.rate || '-'}</td>
                            </tr>
                        `;
                    });
                }

                htmlContent += `
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Outputs -->
                            <div class="voucher-col">
                                <div class="col-title col-title-out">⬆ &nbsp; OUTPUT PRODUCTS</div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th width="8%">#</th>
                                            <th width="62%">Item</th>
                                            <th width="20%">Qty</th>
                                            <th width="10%">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                `;

                if (!batch.outputs || batch.outputs.length === 0) {
                    htmlContent += `
                        <tr>
                            <td colspan="4" class="text-center text-muted">No outputs</td>
                        </tr>
                    `;
                } else {
                    batch.outputs.forEach((out, idx) => {
                        htmlContent += `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${formatItemName(out)}${formatOutputMetadata(out, settings)}</td>
                                <td><strong>${out.qty}</strong> <small class="eng-text">${out.unit.unit_short || ''}</small></td>
                                <td>${out.rate || '-'}</td>
                            </tr>
                        `;
                    });
                }

                htmlContent += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    } else {
        // Render Individual flat table layout
        if (batches.length === 0) {
            htmlContent += `
                <div style="text-align: center; padding: 40px; border: 1px dashed #ccc; border-radius: 8px; color: #7f8c8d;">
                    No batches found matching the filter criteria.
                </div>
            `;
        } else {
            htmlContent += `
                <table class="flat-table">
                    <thead>
                        <tr>
                            <th style="width: 10%;">Date</th>
                            <th style="width: 18%;">Recipe</th>
                            <th style="width: 15%;">MM</th>
                            <th style="width: 10%; text-align: center;">Status</th>
                            <th style="width: 8%;">Type</th>
                            <th style="width: 25%;">Item</th>
                            <th style="width: 8%;">Qty</th>
                            <th style="width: 6%;">Rate</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            batches.forEach((batch, batchIdx) => {
                const inputs = batch.inputs || [];
                const outputs = batch.outputs || [];
                const totalRows = (inputs.length || 1) + (outputs.length || 1);

                const statusBadge = batch.status === 'completed'
                    ? '<span class="badge badge-success">completed</span>'
                    : '<span class="badge badge-warning">pending</span>';

                // First Row
                htmlContent += `<tr class="batch-start">`;
                htmlContent += `
                    <td class="date-cell" rowspan="${totalRows}"><strong>${formatDate(batch.date)}</strong></td>
                    <td rowspan="${totalRows}">
                        <strong>${batch.recipe?.recipe_name || 'N/A'}</strong><br>
                        <small class="recipe-desc">${batch.recipe?.description || ''}</small>
                    </td>
                    <td rowspan="${totalRows}">
                        ${batch.mm?.mm_hin || ''}<br><small class="eng-text">${batch.mm?.mm_eng || ''}</small>
                    </td>
                    <td rowspan="${totalRows}" class="text-center">
                        ${statusBadge}
                    </td>
                `;

                // Handle first input or placeholder
                if (inputs.length > 0) {
                    const firstIn = inputs[0];
                    htmlContent += `
                        <td><span class="badge badge-in">↓ IN</span></td>
                        <td>${formatItemName(firstIn)}${formatInputMetadata(firstIn, settings)}</td>
                        <td><strong>${firstIn.qty}</strong> <small class="eng-text">${firstIn.unit.unit_short || ''}</small></td>
                        <td>${firstIn.rate || '-'}</td>
                    `;
                } else {
                    htmlContent += `
                        <td colspan="4" class="text-center text-muted">No inputs</td>
                    `;
                }
                htmlContent += `</tr>`;

                // Remaining inputs
                for (let i = 1; i < inputs.length; i++) {
                    const inp = inputs[i];
                    htmlContent += `
                        <tr>
                            <td><span class="badge badge-in">↓ IN</span></td>
                            <td>${formatItemName(inp)}${formatInputMetadata(inp, settings)}</td>
                            <td><strong>${inp.qty}</strong> <small class="eng-text">${inp.unit.unit_short || ''}</small></td>
                            <td>${inp.rate || '-'}</td>
                        </tr>
                    `;
                }

                // Outputs separator & outputs
                if (outputs.length > 0) {
                    const firstOut = outputs[0];
                    const isSep = inputs.length > 0;
                    htmlContent += `<tr class="${isSep ? 'grp-sep' : ''}">`;
                    htmlContent += `
                        <td><span class="badge badge-out">↑ OUT</span></td>
                        <td>${formatItemName(firstOut)}${formatOutputMetadata(firstOut, settings)}</td>
                        <td><strong>${firstOut.qty}</strong> <small class="eng-text">${firstOut.unit.unit_short || ''}</small></td>
                        <td>${firstOut.rate || '-'}</td>
                    `;
                    htmlContent += `</tr>`;

                    for (let i = 1; i < outputs.length; i++) {
                        const out = outputs[i];
                        htmlContent += `
                            <tr>
                                <td><span class="badge badge-out">↑ OUT</span></td>
                                <td>${formatItemName(out)}${formatOutputMetadata(out, settings)}</td>
                                <td><strong>${out.qty}</strong> <small class="eng-text">${out.unit.unit_short || ''}</small></td>
                                <td>${out.rate || '-'}</td>
                            </tr>
                        `;
                    }
                } else {
                    htmlContent += `
                        <tr class="${inputs.length > 0 ? 'grp-sep' : ''}">
                            <td colspan="4" class="text-center text-muted">No outputs</td>
                        </tr>
                    `;
                }
            });

            htmlContent += `
                    </tbody>
                </table>
            `;
        }
    }

    // Close body/html (page numbers handled by Puppeteer footerTemplate)
    htmlContent += `
    </body>
    </html>
    `;

    // Launch puppeteer-core using local chrome
    // Get the shared Puppeteer browser
    const browser = await pdfEngine.getBrowser();

    let page = null;
    try {
        page = await browser.newPage();

        // Load the HTML content directly for maximum speed (minimal loading)
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

        // Generate PDF buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '12mm',
                right: '12mm',
                bottom: '18mm',
                left: '12mm'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>', // Hide default header
            footerTemplate: `
                <div style="width: 100%; font-size: 8px; color: #7f8c8d; font-family: sans-serif; padding: 0 12mm; display: flex; justify-content: space-between; box-sizing: border-box;">
                    <span>HisabKitab HMP Batches Report</span>
                    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                </div>
            `
        });

        await page.close();
        return pdfBuffer;
    } catch (err) {
        if (page) await page.close().catch(() => {});
        throw err;
    }
}

module.exports = {
    generateHmpPdf
};
