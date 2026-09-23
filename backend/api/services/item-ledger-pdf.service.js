// services/item-ledger-pdf.service.js
'use strict';

const puppeteer = require('puppeteer-core');
const os = require('os');
const path = require('path');
const pdfEngine = require('./pdf-engine.service');

/**
 * Format date from YYYY-MM-DD to DD-MM-YYYY
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    } catch (e) {
        return dateStr;
    }
}

/**
 * Format numeric values
 */
function formatNumber(val, decimals = 2) {
    if (val === undefined || val === null || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? '-' : num.toFixed(decimals);
}

/**
 * Generate Item Ledger PDF
 */
async function generateItemLedgerPdf(reportData, fromName, toName, mmName, taskId, categoryName, categoriesPayload = null) {
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #333;
                font-size: 10px;
                line-height: 1.4;
                margin: 0;
                padding: 0;
            }
            .page-break {
                page-break-after: always;
            }
            .header-title {
                text-align: center;
                font-size: 15px;
                font-weight: bold;
                color: #ffffff;
                background-color: #1e293b;
                padding: 10px;
                margin-bottom: 15px;
                border-radius: 4px;
            }
            /* Table of Contents Table styling */
            .toc-container {
                padding: 15px;
            }
            .toc-title {
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 10px;
                color: #1e293b;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 10px;
            }
            .toc-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            .toc-table th, .toc-table td {
                border: 1px solid #cbd5e1;
                padding: 7px 9px;
                font-size: 11px;
                text-align: left;
            }
            .toc-table th {
                background-color: #334155;
                color: #ffffff;
                font-weight: bold;
            }
            
            /* Item Section */
            .item-section {
                padding: 10px 0;
            }
            .item-title {
                font-size: 14px;
                font-weight: bold;
                color: #1e293b;
                border-bottom: 2px solid #334155;
                padding-bottom: 5px;
                margin-bottom: 15px;
            }
            /* Overview Cards */
            .overview-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                gap: 10px;
            }
            .overview-card {
                flex: 1;
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid rgba(0,0,0,0.1);
                text-align: center;
            }
            .card-title {
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
                margin-bottom: 4px;
            }
            .card-value {
                font-size: 16px;
                font-weight: bold;
            }
            .card-secondary { background-color: #f8f9fa; color: #41464b; }
            .card-success { background-color: #d4edda; color: #0f5132; }
            .card-danger { background-color: #f8d7da; color: #842029; }
            .card-info { background-color: #d1ecf1; color: #055160; }
            
            /* Table Styling */
            h4 {
                font-size: 11px;
                margin: 15px 0 5px 0;
                padding-bottom: 3px;
            }
            .text-success-h { color: #0f5132; border-bottom: 1px solid #d4edda; }
            .text-danger-h { color: #842029; border-bottom: 1px solid #f8d7da; }
            
            table.data-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
            }
            table.data-table th, table.data-table td {
                border: 1px solid #dee2e6;
                padding: 5px 6px;
                text-align: left;
            }
            table.data-table th {
                font-weight: bold;
                font-size: 9px;
            }
            .table-success th { background-color: #d4edda; color: #0f5132; }
            .table-danger th { background-color: #f8d7da; color: #842029; }
            table.data-table tr:nth-child(even) { background-color: #f8f9fa; }
            .no-records {
                padding: 10px;
                text-align: center;
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                color: #6c757d;
                border-radius: 4px;
                margin-bottom: 15px;
            }

            .page-break {
                page-break-after: always;
            }
            .item-section {
                page-break-before: always;
            }
        </style>
    </head>
    <body>
    `;

    // Helper for rendering Item Ledger section
    function renderItemLedgerSection(report, fName, tName, storeName, cName, iName, iEngName, secId, hasNextPage, chapterNo = null) {
        let html = `
        <div class="item-section ${hasNextPage ? 'page-break' : ''}" id="${secId}">
            <div class="header-title" style="background-color: #1e293b;">
                ${fName} से ${tName} तक, ${storeName} के ${iName} का सार
            </div>
            <div class="item-title" style="display: flex; justify-content: space-between; align-items: center;">
                <span>${iName} | ${iEngName}</span>
                ${chapterNo ? `<span style="font-size: 10px; font-weight: normal; background-color: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">Category: ${cName}</span>` : ''}
            </div>
            
            <div class="overview-row">
                <div class="overview-card card-secondary">
                    <div class="card-title">Past Bachat (पिछली बचत)</div>
                    <div class="card-value">${formatNumber(report.overview.past_bachat || 0)} <small style="font-size: 9px; font-weight: normal;">${report.unit_short}</small></div>
                </div>
                <div class="overview-card card-success">
                    <div class="card-title">Total Aawak (कुल आवक)</div>
                    <div class="card-value">${formatNumber(report.overview.total_aawak)} <small style="font-size: 9px; font-weight: normal;">${report.unit_short}</small></div>
                </div>
                <div class="overview-card card-danger">
                    <div class="card-title">Total Jawak (कुल जावक)</div>
                    <div class="card-value">${formatNumber(report.overview.total_jawak)} <small style="font-size: 9px; font-weight: normal;">${report.unit_short}</small></div>
                </div>
                <div class="overview-card card-info">
                    <div class="card-title">Current Bachat (वर्तमान बचत)</div>
                    <div class="card-value">${formatNumber(report.overview.current_bachat)} <small style="font-size: 9px; font-weight: normal;">${report.unit_short}</small></div>
                </div>
            </div>

            <!-- Aawak Entries -->
            <h4 class="text-success-h">Aawak Entries (आवक)</h4>
        `;

        if (report.aawaks && report.aawaks.length > 0) {
            html += `
            <table class="data-table table-success">
                <thead>
                    <tr>
                        <th width="12%">Date</th>
                        <th width="8%">Lot No.</th>
                        <th>From (कहाँ से आया)</th>
                        <th width="10%">Condition</th>
                        <th width="8%">Qty</th>
                        <th width="10%">Rate</th>
                        <th width="10%">Amount</th>
                        <th width="15%">Type</th>
                    </tr>
                </thead>
                <tbody>
            `;
            report.aawaks.forEach(a => {
                html += `
                    <tr>
                        <td>${formatDate(a.date)}</td>
                        <td>${a.lot_no || '-'}</td>
                        <td>
                            ${a.aawak_mm_hin || ''}
                            ${a.pbk_hin || a.roll_no ? `<br><small style="color: #666;">${a.roll_no ? a.roll_no + ' ' : ''}${a.pbk_hin || ''}</small>` : ''}
                        </td>
                        <td>${a.condition_hin || '-'}</td>
                        <td><strong>${a.qty}</strong> ${a.unit_short}</td>
                        <td>${formatNumber(a.rate)}</td>
                        <td>${formatNumber(a.actual_amt)}</td>
                        <td>${a.aawak_type_hin || '-'}</td>
                    </tr>
                `;
            });
            html += `
                </tbody>
            </table>
            `;
        } else {
            html += `<div class="no-records">No Aawak entries found.</div>`;
        }

        html += `
            <!-- Jawak Entries -->
            <h4 class="text-danger-h">Jawak Entries (जावक)</h4>
        `;

        if (report.jawaks && report.jawaks.length > 0) {
            html += `
            <table class="data-table table-danger">
                <thead>
                    <tr>
                        <th width="12%">Date</th>
                        <th width="8%">Lot No.</th>
                        <th>To (कहाँ भेजा)</th>
                        <th width="10%">Condition</th>
                        <th width="8%">Qty</th>
                        <th width="10%">Rate</th>
                        <th width="10%">Amount</th>
                        <th width="15%">Type</th>
                    </tr>
                </thead>
                <tbody>
            `;
            report.jawaks.forEach(j => {
                html += `
                    <tr>
                        <td>${formatDate(j.date)}</td>
                        <td>${j.lot_no || '-'}</td>
                        <td>
                            ${j.jawak_mm_hin || ''}
                            ${j.pbk_hin || j.roll_no ? `<br><small style="color: #666;">${j.roll_no ? j.roll_no + ' ' : ''}${j.pbk_hin || ''}</small>` : ''}
                        </td>
                        <td>${j.condition_hin || '-'}</td>
                        <td><strong>${j.qty}</strong> ${j.unit_short}</td>
                        <td>${formatNumber(j.rate)}</td>
                        <td>${formatNumber(j.actual_amt)}</td>
                        <td>${j.jawak_type_hin || '-'}</td>
                    </tr>
                `;
            });
            html += `
                </tbody>
            </table>
            `;
        } else {
            html += `<div class="no-records">No Jawak entries found.</div>`;
        }

        html += `
            <div style="margin-top: 25px; text-align: right; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                <a href="#index-page" style="text-decoration: none; color: #2563eb; font-weight: bold; font-size: 11px; background-color: #f8fafc; padding: 5px 12px; border: 1px solid #cbd5e1; border-radius: 4px; display: inline-block;">
                    ⬆️ मुख्य अनुक्रमणिका (Main Index) पर जाएं
                </a>
            </div>
        </div>
        `;

        return html;
    }

    if (categoriesPayload && Array.isArray(categoriesPayload) && categoriesPayload.length > 0) {
        // --- MASTER SINGLE HEAVY PDF GENERATION ---
        if (taskId) global.pdfProgress[taskId] = { status: 'Constructing Master Single Index & Category Table of Contents...' };

        htmlContent += `
        <div class="toc-container page-break" id="index-page">
            <div class="toc-title">${mmName} - सम्पूर्ण आइटम लेजर अनुक्रमणिका (Master Index)</div>
            <div style="text-align: center; margin-bottom: 5px; font-size: 12px; color: #555;">
                अवधि: ${fromName} से ${toName} | Store: ${mmName} | कुल श्रेणियां: ${categoriesPayload.length}
            </div>
            <div style="text-align: center; margin-bottom: 15px; font-size: 10px; color: #e74c3c; font-weight: bold; font-style: italic;">
                * विवरण देखने के लिए विषय (वस्तु) पर क्लिक करें / Click on item for details
            </div>

            <table class="toc-table">
                <thead>
                    <tr style="background-color: #334155; color: #ffffff;">
                        <th width="10%" style="text-align: center;">क्र.</th>
                        <th>श्रेणी (Category) एवं वस्तु का नाम (Item)</th>
                        <th width="22%" style="text-align: right;">वर्तमान बचत मात्रा</th>
                        <th width="10%" style="text-align: center;">पेज क्र.</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let totalItemsCount = 0;
        let masterSummaryRows = [];
        let grandTotals = { items: 0, past: 0, aawak: 0, jawak: 0, bachat: 0 };

        categoriesPayload.forEach((g, gIdx) => {
            let catNameHin = g.category_hin || g.category_eng || 'Category';
            let catNameEng = g.category_eng && g.category_hin !== g.category_eng ? g.category_eng : '';
            let reports = g.reports || [];

            let catPast = reports.reduce((s, r) => s + Number(r.overview.past_bachat || 0), 0);
            let catAwk = reports.reduce((s, r) => s + Number(r.overview.total_aawak || 0), 0);
            let catJwk = reports.reduce((s, r) => s + Number(r.overview.total_jawak || 0), 0);
            let catBcht = reports.reduce((s, r) => s + Number(r.overview.current_bachat || 0), 0);

            grandTotals.items += reports.length;
            grandTotals.past += catPast;
            grandTotals.aawak += catAwk;
            grandTotals.jawak += catJwk;
            grandTotals.bachat += catBcht;

            masterSummaryRows.push({
                no: gIdx + 1,
                name: catNameHin + (catNameEng ? ` (${catNameEng})` : ''),
                count: reports.length,
                past: catPast,
                aawak: catAwk,
                jawak: catJwk,
                bachat: catBcht
            });

            // Chapter Header Row in TOC
            htmlContent += `
                <tr style="background-color: #1e293b; color: #ffffff; font-weight: bold;">
                    <td style="text-align: center; background-color: #0f172a; color: #38bdf8; font-size: 11px;">
                        श्रेणी ${gIdx + 1}
                    </td>
                    <td colspan="3" style="padding: 8px 10px; background-color: #1e293b; color: #f8fafc; font-size: 12px;">
                        📂 <strong>${catNameHin}</strong> ${catNameEng ? `<span style="color: #94a3b8; font-size: 10px;">(${catNameEng})</span>` : ''}
                        <span style="font-size: 10px; font-weight: normal; margin-left: 15px; color: #cbd5e1;">
                            — कुल ${reports.length} वस्तुएं | बचत: <strong>${formatNumber(catBcht)}</strong>
                        </span>
                    </td>
                </tr>
            `;

            // Topic Rows for items in this category
            reports.forEach((r, rIdx) => {
                totalItemsCount++;
                const itemName = r.item_hin + (r.subitem_hin ? ` (${r.subitem_hin})` : '');
                const itemEngName = r.item_eng + (r.subitem_eng ? ` (${r.subitem_eng})` : '');
                htmlContent += `
                    <tr style="background-color: ${rIdx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                        <td style="text-align: center; color: #64748b; font-weight: 600;">${gIdx + 1}.${rIdx + 1}</td>
                        <td style="padding-left: 20px;">
                            <a href="#item-sec-${gIdx}-${rIdx}" style="text-decoration: none; color: #2563eb; font-weight: 600;">
                                🔹 ${itemName} ${itemEngName ? `<span style="color: #64748b; font-weight: normal;">| ${itemEngName}</span>` : ''}
                            </a>
                        </td>
                        <td style="text-align: right; font-weight: bold;">
                            ${formatNumber(r.overview.current_bachat)} ${r.unit_short}
                        </td>
                        <td style="text-align: center; font-size: 11px; color: #94a3b8;">
                            &nbsp;
                        </td>
                    </tr>
                `;
            });
        });

        htmlContent += `
                </tbody>
            </table>

            <!-- Master Category Saar Summary Table -->
            <div style="margin-top: 30px; margin-bottom: 10px; font-size: 14px; font-weight: bold; color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
                📊 संपूर्ण श्रेणीवार सार (Master Category Summary Table)
            </div>
            <table class="toc-table">
                <thead>
                    <tr style="background-color: #f1f5f9;">
                        <th width="8%" style="text-align: center;">क्र.</th>
                        <th>श्रेणी का नाम (Category)</th>
                        <th width="12%" style="text-align: center;">कुल वस्तुएं</th>
                        <th width="15%" style="text-align: right;">पिछली बचत</th>
                        <th width="15%" style="text-align: right;">कुल आवक</th>
                        <th width="15%" style="text-align: right;">कुल जावक</th>
                        <th width="15%" style="text-align: right;">वर्तमान बचत</th>
                    </tr>
                </thead>
                <tbody>
        `;

        masterSummaryRows.forEach(sr => {
            htmlContent += `
                <tr>
                    <td style="text-align: center;">${sr.no}</td>
                    <td><strong>${sr.name}</strong></td>
                    <td style="text-align: center;">${sr.count}</td>
                    <td style="text-align: right;">${formatNumber(sr.past)}</td>
                    <td style="text-align: right;">${formatNumber(sr.aawak)}</td>
                    <td style="text-align: right;">${formatNumber(sr.jawak)}</td>
                    <td style="text-align: right; font-weight: bold; color: #0f5132;">${formatNumber(sr.bachat)}</td>
                </tr>
            `;
        });

        htmlContent += `
                <tr style="background-color: #e2e8f0; font-weight: bold;">
                    <td style="text-align: center;">*</td>
                    <td>Grand Summary Total (कुल योग)</td>
                    <td style="text-align: center;">${grandTotals.items}</td>
                    <td style="text-align: right;">${formatNumber(grandTotals.past)}</td>
                    <td style="text-align: right;">${formatNumber(grandTotals.aawak)}</td>
                    <td style="text-align: right;">${formatNumber(grandTotals.jawak)}</td>
                    <td style="text-align: right; font-weight: bold; color: #0f5132;">${formatNumber(grandTotals.bachat)}</td>
                </tr>
                </tbody>
            </table>
        </div>
        `;

        // Sequential Item Ledger Pages across all Categories
        let currentItemCounter = 0;
        categoriesPayload.forEach((g, gIdx) => {
            let catNameHin = g.category_hin || g.category_eng || 'Category';
            let reports = g.reports || [];

            reports.forEach((report, rIdx) => {
                currentItemCounter++;
                if (taskId && currentItemCounter % 5 === 0) {
                    global.pdfProgress[taskId] = { status: `Building Item Ledger HTML (${currentItemCounter}/${totalItemsCount})...` };
                }
                const itemName = report.item_hin + (report.subitem_hin ? ` (${report.subitem_hin})` : '');
                const itemEngName = report.item_eng + (report.subitem_eng ? ` (${report.subitem_eng})` : '');

                htmlContent += renderItemLedgerSection(
                    report,
                    fromName,
                    toName,
                    mmName,
                    catNameHin,
                    itemName,
                    itemEngName,
                    `item-sec-${gIdx}-${rIdx}`,
                    currentItemCounter < totalItemsCount,
                    gIdx + 1
                );
            });
        });
    } else {
        // --- SINGLE CATEGORY / SINGLE VIEW PDF GENERATION ---
        htmlContent += `
        <!-- 1st Page: Clickable Index Page Table -->
        <div class="toc-container page-break" id="index-page">
            <div class="toc-title">${categoryName ? categoryName + ' का सार (Item Ledger Report)' : 'Item Ledger Report Index / अनुक्रमणिका'}</div>
            <div style="text-align: center; margin-bottom: 5px; font-size: 12px; color: #555;">
                अवधि: ${fromName} से ${toName} | MM / Store: ${mmName}${categoryName ? ` | Category: ${categoryName}` : ''}
            </div>
            <div style="text-align: center; margin-bottom: 15px; font-size: 10px; color: #e74c3c; font-weight: bold; font-style: italic;">
                * विवरण देखने के लिए आइटम पर क्लिक करें / Click on item for details
            </div>
            
            <table class="toc-table">
                <thead>
                    <tr>
                        <th width="8%" style="text-align: center;">S.No.</th>
                        <th>Item Name / आइटम का नाम</th>
                        <th width="22%" style="text-align: right;">Bachat Qty / बचत मात्रा</th>
                        <th width="12%" style="text-align: center;">Page No.</th>
                    </tr>
                </thead>
                <tbody>
        `;

        reportData.forEach((report, i) => {
            const itemName = report.item_hin + (report.subitem_hin ? ` (${report.subitem_hin})` : '');
            const itemEngName = report.item_eng + (report.subitem_eng ? ` (${report.subitem_eng})` : '');
            htmlContent += `
                <tr>
                    <td style="text-align: center;">${i + 1}</td>
                    <td>
                        <a href="#item-sec-${i}" style="text-decoration: none; color: #4e73df; font-weight: bold;">
                            ${itemName} | ${itemEngName}
                        </a>
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                        ${formatNumber(report.overview.current_bachat)} ${report.unit_short}
                    </td>
                    <td style="text-align: center; font-size: 14px; color: #bbb;">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </td>
                </tr>
            `;
        });

        htmlContent += `
                </tbody>
            </table>
        </div>
        `;

        // Ledger Pages for every item
        reportData.forEach((report, i) => {
            const itemName = report.item_hin + (report.subitem_hin ? ` (${report.subitem_hin})` : '');
            const itemEngName = report.item_eng + (report.subitem_eng ? ` (${report.subitem_eng})` : '');

            htmlContent += renderItemLedgerSection(
                report,
                fromName,
                toName,
                mmName,
                categoryName,
                itemName,
                itemEngName,
                `item-sec-${i}`,
                i < reportData.length - 1
            );
        });
    }

    htmlContent += `
    </body>
    </html>
    `;

    // Get the shared Puppeteer browser
    if (taskId) global.pdfProgress[taskId] = { status: 'Waiting for PDF engine...' };
    const browser = await pdfEngine.getBrowser();

    let page = null;
    try {
        page = await browser.newPage();
        if (taskId) global.pdfProgress[taskId] = { status: 'Rendering HTML to PDF...' };
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 0 });

        // Generate the PDF buffer (no dynamic page number updates needed, leaving blank fields)
        const pdfBuffer = await page.pdf({
            format: 'A4',
            timeout: 0,
            printBackground: true,
            margin: {
                top: '15mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>', // Empty header
            footerTemplate: `
                <div style="width: 100%; font-size: 8px; color: #7f8c8d; font-family: sans-serif; padding: 0 15mm; display: flex; justify-content: space-between; box-sizing: border-box;">
                    <span>HisabKitab Item Ledger Report</span>
                    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                </div>
            `
        });

        await page.close();
        return pdfBuffer;
    } catch (err) {
        if (page) await page.close().catch(() => { });
        throw err;
    }
}

module.exports = {
    generateItemLedgerPdf
};
