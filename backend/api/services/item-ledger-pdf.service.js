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
async function generateItemLedgerPdf(reportData, fromName, toName, mmName, taskId, categoryName) {
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
                font-size: 16px;
                font-weight: bold;
                color: #ffffff;
                background-color: #4e73df;
                padding: 10px;
                margin-bottom: 20px;
                border-radius: 4px;
            }
            /* Table of Contents Table styling */
            .toc-container {
                padding: 20px;
            }
            .toc-title {
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 10px;
                color: #4e73df;
                border-bottom: 2px solid #4e73df;
                padding-bottom: 10px;
            }
            .toc-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            .toc-table th, .toc-table td {
                border: 1px solid #dee2e6;
                padding: 8px 10px;
                font-size: 11px;
                text-align: left;
            }
            .toc-table th {
                background-color: #f4f6f9;
                color: #333;
                font-weight: bold;
            }
            .toc-table tr:hover {
                background-color: #f1f3f7;
            }
            
            /* Item Section */
            .item-section {
                padding: 10px 0;
            }
            .item-title {
                font-size: 14px;
                font-weight: bold;
                color: #2c3e50;
                border-bottom: 2px solid #2c3e50;
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
        <!-- 1st Page: Clickable Index Page Table -->
        <div class="toc-container page-break">
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

        htmlContent += `
        <div class="item-section ${i < reportData.length - 1 ? 'page-break' : ''}" id="item-sec-${i}">
            <div class="header-title">
                ${fromName} से ${toName} तक, ${mmName} के ${itemName} का सार
            </div>
            <div class="item-title">
                ${itemName} | ${itemEngName}
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
            htmlContent += `
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
                htmlContent += `
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
            htmlContent += `
                </tbody>
            </table>
            `;
        } else {
            htmlContent += `<div class="no-records">No Aawak entries found.</div>`;
        }

        htmlContent += `
            <!-- Jawak Entries -->
            <h4 class="text-danger-h">Jawak Entries (जावक)</h4>
        `;

        if (report.jawaks && report.jawaks.length > 0) {
            htmlContent += `
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
                htmlContent += `
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
            htmlContent += `
                </tbody>
            </table>
            `;
        } else {
            htmlContent += `<div class="no-records">No Jawak entries found.</div>`;
        }

        htmlContent += `
        </div>
        `;
    });

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
