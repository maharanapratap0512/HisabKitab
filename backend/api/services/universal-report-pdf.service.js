// services/universal-report-pdf.service.js
'use strict';

const pdfEngine = require('./pdf-engine.service');

function formatNumber(val, decimals = 2) {
    if (val === undefined || val === null || val === '') return '-';
    const num = Number(val);
    if (isNaN(num) || num === 0) return '-';
    return num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

async function generatePdf(data) {
    const {
        reportRows = [],
        monthsList = [],
        activeDimensions = [],
        filterBody = {},
        columnTotals = {},
        viewMode = 'monthly',
        deptName = 'HisabKitab Department',
        selectedMmStr = 'All MMs (सभी संस्थान)',
        selectedCatStr = 'All Categories (सभी श्रेणियां)',
        dimLabel = 'Breakdown',
        hideZeroRows = false,
        taskId = null
    } = data;

    if (taskId) global.pdfProgress[taskId] = { status: 'Constructing InDesign HTML matrix...' };

    const isSingleMonth = monthsList.length <= 1;
    const totalMatrixCols = 6 + (activeDimensions.length + 1) + (monthsList.length * (activeDimensions.length + (isSingleMonth ? 1 : 0))) + (!isSingleMonth ? (activeDimensions.length + 1) : 0);
    
    // Choose landscape format size
    const paperFormat = totalMatrixCols > 16 ? 'A3' : 'A4';

    const fromMonthStr = filterBody.from_month || '';
    const fromYearStr = filterBody.from_year || '';
    const toMonthStr = filterBody.to_month || '';
    const toYearStr = filterBody.to_year || '';
    const periodStr = `${fromMonthStr}/${fromYearStr} to ${toMonthStr}/${toYearStr}`;

    const parts = [];

    parts.push(`<!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="utf-8">
        <title>Universal Matrix Report</title>
        <style>
            @page {
                size: ${paperFormat.toLowerCase()} landscape;
                margin: 10mm 10mm 15mm 10mm;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans Devanagari", "Mangal", sans-serif;
                color: #1e293b;
                font-size: 10px;
                line-height: 1.3;
                margin: 0;
                padding: 0;
                background-color: #ffffff;
            }
            .masthead {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: #ffffff;
                padding: 12px 18px;
                border-radius: 6px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 4px solid #3b82f6;
                margin-bottom: 12px;
            }
            .dept-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #f8fafc; }
            .sys-sub { font-size: 8px; color: #94a3b8; margin-top: 2px; }
            .report-title { font-size: 15px; font-weight: 800; color: #ffffff; }
            .report-sub { font-size: 9px; color: #cbd5e1; margin-top: 2px; }
            .badge-pill { background-color: #3b82f6; color: #ffffff; padding: 4px 10px; border-radius: 12px; font-size: 9px; font-weight: 700; }

            .kpi-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }
            .kpi-card { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; }
            .kpi-label { font-size: 8px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
            .kpi-value { font-size: 10px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

            table.matrix-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9px; }
            table.matrix-table th, table.matrix-table td { border: 1px solid #cbd5e1; padding: 4px 5px; vertical-align: middle; }
            table.matrix-table thead { display: table-header-group; }
            table.matrix-table tr { page-break-inside: avoid; }
            
            .th-sticky { background-color: #1e293b; color: #ffffff; font-weight: 700; text-align: center; }
            .th-past-group { background-color: #334155; color: #60a5fa; font-weight: 700; text-align: center; }
            .th-month-group { background-color: #1e293b; color: #93c5fd; font-weight: 700; text-align: center; }
            .th-month-alt { background-color: #0f172a !important; color: #60a5fa !important; }
            .th-grand-group { background-color: #0f172a; color: #f43f5e; font-weight: 700; text-align: center; }
            .th-sub { background-color: #475569; color: #f8fafc; font-size: 8px; font-weight: 600; text-align: center; }
            .th-sub-alt { background-color: #334155 !important; }
            .th-sub-tot { background-color: #334155; color: #ffffff; font-size: 8px; font-weight: 700; text-align: center; }

            table.matrix-table tbody tr:nth-child(even) { background-color: #f8fafc; }
            .cell-center { text-align: center; }
            .cell-left { text-align: left; }
            .cell-right { text-align: right; font-family: monospace, sans-serif; font-size: 9px; }

            .hindi-text { font-weight: 600; color: #0f172a; }
            .eng-subtext { display: block; font-size: 7.5px; color: #64748b; }

            .val-negative { color: #dc2626 !important; font-weight: 700 !important; background-color: #fef2f2; border-radius: 2px; padding: 1px 2px; }
            .cell-final-highlight { background-color: #f1f5f9; font-weight: 700; }
            .cell-month-alt { background-color: #f1f5f9 !important; }
            .month-border-end { border-right: 2px solid #94a3b8 !important; }

            tfoot tr { background-color: #e2e8f0; font-weight: 700; border-top: 2px solid #475569; border-bottom: 2px solid #475569; }
        </style>
    </head>
    <body>
        <div class="masthead">
            <div class="masthead-brand">
                <span class="dept-title">${deptName}</span>
                <span class="sys-sub">HISABKITAB ENTERPRISE • UNIVERSAL STOCK MATRIX ENGINE</span>
            </div>
            <div style="text-align: center;">
                <div class="report-title">UNIVERSAL STOCK MATRIX REPORT</div>
                <div class="report-sub">Breakdown: ${dimLabel} | Mode: ${viewMode === 'monthly' ? 'Monthly Matrix' : 'Multi-Month Matrix'}</div>
            </div>
            <div style="text-align: right;">
                <span class="badge-pill">Total Items: ${reportRows.length}</span>
            </div>
        </div>

        <div class="kpi-container">
            <div class="kpi-card">
                <div class="kpi-label">Period Range</div>
                <div class="kpi-value">${periodStr}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Store / MM</div>
                <div class="kpi-value">${selectedMmStr}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Category Filter</div>
                <div class="kpi-value">${selectedCatStr}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Pivot Dimension</div>
                <div class="kpi-value">${dimLabel} ${hideZeroRows ? '(0 Stock Hidden)' : ''}</div>
            </div>
        </div>

        <table class="matrix-table">
            <thead>
                <tr>
                    <th rowspan="2" class="th-sticky" width="30">क्र.</th>
                    <th rowspan="2" class="th-sticky">MM / स्थान</th>
                    <th rowspan="2" class="th-sticky">कैटेगरी</th>
                    <th rowspan="2" class="th-sticky">वस्तु (Item Name)</th>
                    <th rowspan="2" class="th-sticky">उप-वस्तु</th>
                    <th rowspan="2" class="th-sticky" width="35">यूनिट</th>
                    <th colspan="${activeDimensions.length + 1}" class="th-past-group month-border-end">Opening Bachat (पिछली बचत)</th>
                    ${monthsList.map((m, mIdx) => `
                        <th colspan="${activeDimensions.length + (isSingleMonth ? 1 : 0)}" class="th-month-group ${mIdx % 2 === 1 ? 'th-month-alt' : ''} month-border-end">${m.name_hin} (${m.name_eng})</th>
                    `).join('')}
                    ${!isSingleMonth ? `
                        <th colspan="${activeDimensions.length + 1}" class="th-grand-group">Final Period Set Total (कुल योग)</th>
                    ` : ''}
                </tr>
                <tr>
                    ${activeDimensions.map(d => `<th class="th-sub">${d.list_name_hin}</th>`).join('')}
                    <th class="th-sub-tot month-border-end">कुल पिछला</th>

                    ${monthsList.map((m, mIdx) => `
                        ${activeDimensions.map((d, dIdx) => `<th class="th-sub ${mIdx % 2 === 1 ? 'th-sub-alt' : ''} ${dIdx === activeDimensions.length - 1 ? 'month-border-end' : ''}">${d.list_name_hin}</th>`).join('')}
                        ${isSingleMonth ? `<th class="th-sub-tot month-border-end">अंतिम बचत</th>` : ''}
                    `).join('')}

                    ${!isSingleMonth ? `
                        ${activeDimensions.map(d => `<th class="th-sub">${d.list_name_hin}</th>`).join('')}
                        <th class="th-sub-tot">अंतिम कुल</th>
                    ` : ''}
                </tr>
            </thead>
            <tbody>
    `);

    // Stream Table Rows efficiently
    for (let idx = 0; idx < reportRows.length; idx++) {
        const r = reportRows[idx];
        const pastTot = r.past_bachat ? (r.past_bachat.total || 0) : 0;

        let rowHtml = `
            <tr>
                <td class="cell-center">${idx + 1}</td>
                <td class="cell-left"><span class="hindi-text">${r.mm_hin || ''}</span>${r.mm_eng ? `<span class="eng-subtext">${r.mm_eng}</span>` : ''}</td>
                <td class="cell-left"><span class="hindi-text">${r.category_hin || ''}</span>${r.category_eng ? `<span class="eng-subtext">${r.category_eng}</span>` : ''}</td>
                <td class="cell-left"><span class="hindi-text">${r.item_hin || ''}</span>${r.item_eng ? `<span class="eng-subtext">${r.item_eng}</span>` : ''}</td>
                <td class="cell-left">${r.subitem_id ? `<span class="hindi-text">${r.subitem_hin || ''}</span>${r.subitem_eng ? `<span class="eng-subtext">${r.subitem_eng}</span>` : ''}` : '-'}</td>
                <td class="cell-center">${r.unit_short || '-'}</td>
        `;

        // Past Bachat
        for (let j = 0; j < activeDimensions.length; j++) {
            const d = activeDimensions[j];
            const val = r.past_bachat && r.past_bachat.dims ? (r.past_bachat.dims[d._id] || 0) : 0;
            rowHtml += `<td class="cell-right ${val < 0 ? 'val-negative' : ''}">${formatNumber(val)}</td>`;
        }
        rowHtml += `<td class="cell-right ${pastTot < 0 ? 'val-negative' : ''} cell-final-highlight month-border-end">${formatNumber(pastTot)}</td>`;

        // Months Dims
        for (let mIdx = 0; mIdx < monthsList.length; mIdx++) {
            const m = monthsList[mIdx];
            const mData = r.months ? r.months[m.key] : null;

            for (let j = 0; j < activeDimensions.length; j++) {
                const d = activeDimensions[j];
                const dimData = (mData && mData.dims) ? mData.dims[d._id] : null;
                const val = dimData ? dimData.bachat : 0;
                const isAlt = mIdx % 2 === 1;
                const isEndBorder = j === activeDimensions.length - 1;
                rowHtml += `<td class="cell-right ${isAlt ? 'cell-month-alt' : ''} ${isEndBorder ? 'month-border-end' : ''} ${val < 0 ? 'val-negative' : ''}">${formatNumber(val)}</td>`;
            }

            if (isSingleMonth) {
                const fbch = r.grand_total ? r.grand_total.final_bachat : 0;
                const isAlt = mIdx % 2 === 1;
                rowHtml += `<td class="cell-right ${isAlt ? 'cell-month-alt' : ''} month-border-end ${fbch < 0 ? 'val-negative' : ''} cell-final-highlight">${formatNumber(fbch)}</td>`;
            }
        }

        // Multi-month Grand Total
        if (!isSingleMonth) {
            for (let j = 0; j < activeDimensions.length; j++) {
                const d = activeDimensions[j];
                const gdData = (r.grand_total && r.grand_total.dims) ? r.grand_total.dims[d._id] : null;
                const val = gdData ? gdData.bachat : 0;
                rowHtml += `<td class="cell-right ${val < 0 ? 'val-negative' : ''}">${formatNumber(val)}</td>`;
            }
            const fbch = r.grand_total ? r.grand_total.final_bachat : 0;
            rowHtml += `<td class="cell-right ${fbch < 0 ? 'val-negative' : ''} cell-final-highlight">${formatNumber(fbch)}</td>`;
        }

        rowHtml += `</tr>`;
        parts.push(rowHtml);
    }

    // Table Footer Summary
    parts.push(`
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="6" style="text-align: right; font-weight: bold;">TOTAL SUMMARY:</td>
    `);

    for (let j = 0; j < activeDimensions.length; j++) {
        const d = activeDimensions[j];
        const val = columnTotals.past_bachat && columnTotals.past_bachat.dims ? (columnTotals.past_bachat.dims[d._id] || 0) : 0;
        parts.push(`<td class="cell-right">${formatNumber(val)}</td>`);
    }
    parts.push(`<td class="cell-right month-border-end">${formatNumber(columnTotals.past_bachat ? columnTotals.past_bachat.total : 0)}</td>`);

    for (let mIdx = 0; mIdx < monthsList.length; mIdx++) {
        const m = monthsList[mIdx];
        const mTotals = columnTotals.months ? columnTotals.months[m.key] : null;

        for (let j = 0; j < activeDimensions.length; j++) {
            const d = activeDimensions[j];
            const dimTot = (mTotals && mTotals.dims) ? mTotals.dims[d._id] : null;
            const val = dimTot ? dimTot.bachat : 0;
            const isAlt = mIdx % 2 === 1;
            const isEndBorder = j === activeDimensions.length - 1;
            parts.push(`<td class="cell-right ${isAlt ? 'cell-month-alt' : ''} ${isEndBorder ? 'month-border-end' : ''}">${formatNumber(val)}</td>`);
        }

        if (isSingleMonth) {
            const isAlt = mIdx % 2 === 1;
            parts.push(`<td class="cell-right ${isAlt ? 'cell-month-alt' : ''} month-border-end">${formatNumber(columnTotals.grand_total ? columnTotals.grand_total.final_bachat : 0)}</td>`);
        }
    }

    if (!isSingleMonth) {
        for (let j = 0; j < activeDimensions.length; j++) {
            const d = activeDimensions[j];
            const gdTot = (columnTotals.grand_total && columnTotals.grand_total.dims) ? columnTotals.grand_total.dims[d._id] : null;
            const val = gdTot ? gdTot.bachat : 0;
            parts.push(`<td class="cell-right">${formatNumber(val)}</td>`);
        }
        parts.push(`<td class="cell-right">${formatNumber(columnTotals.grand_total ? columnTotals.grand_total.final_bachat : 0)}</td>`);
    }

    parts.push(`
                </tr>
            </tfoot>
        </table>
    </body>
    </html>
    `);

    const htmlContent = parts.join('');

    if (taskId) global.pdfProgress[taskId] = { status: 'Waiting for Chrome PDF engine...' };
    const browser = await pdfEngine.getBrowser();
    
    if (taskId) global.pdfProgress[taskId] = { status: 'Rendering HTML to PDF with Puppeteer...' };
    const page = await browser.newPage();
    try {
        await page.setContent(htmlContent, { waitUntil: ['domcontentloaded', 'networkidle0'], timeout: 0 });

        const pdfBuffer = await page.pdf({
            format: paperFormat,
            landscape: true,
            timeout: 0,
            printBackground: true,
            margin: {
                top: '12mm',
                right: '10mm',
                bottom: '15mm',
                left: '10mm'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
                <div style="width: 100%; font-size: 8px; color: #64748b; font-family: sans-serif; padding: 0 10mm; display: flex; justify-content: space-between; box-sizing: border-box;">
                    <span>${deptName} • HisabKitab Universal Stock Matrix Report</span>
                    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                </div>
            `
        });

        await page.close();
        return Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    } catch (err) {
        if (page) await page.close().catch(() => { });
        throw err;
    }
}

module.exports = {
    generatePdf
};
