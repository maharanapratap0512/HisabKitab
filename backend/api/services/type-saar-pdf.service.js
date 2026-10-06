// backend/api/services/type-saar-pdf.service.js
'use strict';

const pdfEngine = require('./pdf-engine.service');

function formatQtyWithUnit(val, unit, decimals = 3) {
    if (val === undefined || val === null || val === '') return '<span style="color:#95a5a6;">-</span>';
    const num = Number(val);
    if (isNaN(num) || num === 0) return '<span style="color:#95a5a6;">-</span>';
    const formatted = num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
    return unit ? `${formatted} <small style="color:#7f8c8d;">${unit}</small>` : formatted;
}

async function generatePdf(data) {
    const {
        reportData = [],
        groupedReportData = [],
        monthsSel = [],
        grandMonthTotals = [],
        grandTotalQty = 0,
        filterBody = {},
        reportMode = 'aawak',
        viewType = 'grouped',
        pdfType = 'summary',
        itemDetailsMap = {},
        deptName = 'HisabKitab Department',
        taskId = null
    } = data;

    if (taskId) global.pdfProgress[taskId] = { status: 'Constructing HTML report...' };

    const modeName = reportMode === 'jawak' ? 'Jawak' : 'Aawak';
    const modeHin = reportMode === 'jawak' ? 'जावक' : 'आवक';
    const titleText = `${modeName} Type Wise Saar Report / ${modeHin} प्रकार-वार सार रिपोर्ट (${filterBody.year || ''})`;

    const parts = [];

    const isDetailedMode = pdfType === 'detailed' && itemDetailsMap && Object.keys(itemDetailsMap).length > 0;

    parts.push(`<!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="utf-8">
        <title>${titleText}</title>
        <style>
            @page {
                size: A4 landscape;
                margin: 8mm 8mm 10mm 8mm;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 8.5pt;
                color: #222;
                margin: 0;
                padding: 0;
                background: #fff;
            }
            .header-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 8px;
                border-bottom: 2px solid #2980b9;
            }
            .header-title {
                font-size: 13pt;
                font-weight: bold;
                color: #2c3e50;
            }
            .header-subtitle {
                font-size: 8.5pt;
                color: #7f8c8d;
            }
            .data-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 8pt;
            }
            .data-table th {
                background-color: #34495e;
                color: #ffffff;
                font-weight: bold;
                padding: 4px 6px;
                border: 1px solid #2c3e50;
                text-align: center;
                font-size: 8pt;
            }
            .data-table td {
                padding: 4px 5px;
                border: 1px solid #bdc3c7;
                vertical-align: middle;
            }
            .text-center { text-align: center; }
            .text-end { text-align: right; }
            .font-bold { font-weight: bold; }
            .subtotal-row {
                background-color: #ebf5fb;
                font-weight: bold;
                font-size: 7.5pt;
            }
            .subtotal-row td {
                padding: 2px 4px !important;
                border-top: 1px solid #a9cce3;
                border-bottom: 2px solid #2980b9 !important;
            }
            .grand-footer {
                background-color: #2c3e50;
                color: #fff;
                font-weight: bold;
                font-size: 8.5pt;
            }
            .grand-footer td {
                border-top: 2px solid #1a252f !important;
                padding: 5px;
            }
            .item-last-cell {
                border-bottom: 2px solid #7f8c8d !important;
            }
            .type-badge {
                display: inline-block;
                padding: 1px 4px;
                background-color: #e8f8f5;
                color: #117a65;
                border: 1px solid #a3e4d7;
                border-radius: 3px;
                font-size: 7.5pt;
            }
            .item-anchor-link {
                color: #1a5276;
                text-decoration: underline;
                font-weight: bold;
            }
            .back-top-link {
                color: #2980b9;
                text-decoration: none;
                font-size: 8pt;
                font-weight: bold;
            }
            .detail-section-card {
                margin-top: 15px;
                border: 1px solid #d6dbdf;
                border-radius: 4px;
                padding: 8px;
                background-color: #fafafa;
                page-break-inside: avoid;
            }
        </style>
    </head>
    <body>
        <div id="top-saar"></div>
        <table class="header-table">
            <tr>
                <td>
                    <div class="header-title">${titleText} ${isDetailedMode ? ' (With Interactive Item Drilldown)' : ''}</div>
                    <div class="header-subtitle">${deptName} | Year: ${filterBody.year || ''} | Mode: ${modeName} (${modeHin}) ${isDetailedMode ? '| Click item name to jump to transactions below' : ''}</div>
                </td>
                <td class="text-end" style="font-size: 8pt; color: #7f8c8d;">
                    Printed: ${new Date().toLocaleDateString('en-GB')}
                </td>
            </tr>
        </table>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No.</th>
                    <th style="width: 80px;">Department</th>
                    <th style="width: 90px;">Category</th>
                    <th style="width: 120px;">Item / Subitem</th>
                    <th style="width: 90px;">${modeName} Type</th>
                    ${monthsSel.map(m => `<th>${m.name}-${filterBody.year}</th>`).join('')}
                    <th style="width: 70px;">Total Qty</th>
                </tr>
            </thead>
            <tbody>`);

    if (viewType === 'grouped' && groupedReportData.length > 0) {
        groupedReportData.forEach((group, gIdx) => {
            const rowCount = group.rows.length;
            const rowspanAttr = rowCount > 1 ? rowCount + 1 : 1;
            const itemKey = `${group.item_id}_${group.subitem_id || 0}`;
            const itemDisplayName = `${group.item_hin || ''}${group.subitem_hin ? ' : ' + group.subitem_hin : ''}`;

            group.rows.forEach((row, rIdx) => {
                const isLastDataRow = (rIdx === rowCount - 1 && rowCount === 1);
                const borderClass = isLastDataRow ? 'item-last-cell' : '';

                parts.push(`<tr>`);
                if (rIdx === 0) {
                    const itemCellHtml = isDetailedMode
                        ? `<a href="#item_detail_${itemKey}" class="item-anchor-link" title="Click to jump to item transactions below">${itemDisplayName}</a>`
                        : itemDisplayName;

                    parts.push(`
                        <td rowspan="${rowspanAttr}" class="text-center font-bold ${rowCount > 1 ? 'item-last-cell' : ''}">${gIdx + 1}</td>
                        <td rowspan="${rowspanAttr}" class="${rowCount > 1 ? 'item-last-cell' : ''}">${group.dept_hin || group.dept_code || '-'}<br><small style="color:#7f8c8d;">${group.dept_code || ''}</small></td>
                        <td rowspan="${rowspanAttr}" class="${rowCount > 1 ? 'item-last-cell' : ''}">${group.categories_hin || group.categories_eng || '-'}</td>
                        <td rowspan="${rowspanAttr}" class="font-bold ${rowCount > 1 ? 'item-last-cell' : ''}">${itemCellHtml}</td>
                    `);
                }

                parts.push(`
                    <td class="${borderClass}"><span class="type-badge">${row.type_hin || 'सामान्य'}</span></td>
                    ${row.arr_sum_qty.map(qty => `<td class="text-end ${borderClass}">${formatQtyWithUnit(qty, group.unit_short)}</td>`).join('')}
                    <td class="text-end font-bold ${borderClass}">${formatQtyWithUnit(row.row_total_qty, group.unit_short)}</td>
                </tr>`);
            });

            if (rowCount > 1) {
                parts.push(`
                <tr class="subtotal-row">
                    <td class="text-end font-bold" style="color: #1b4f72;">${group.item_hin} कुल:</td>
                    ${group.item_sum_qty.map(qty => `<td class="text-end font-bold" style="color: #1b4f72;">${formatQtyWithUnit(qty, group.unit_short)}</td>`).join('')}
                    <td class="text-end font-bold" style="color: #1b4f72; background-color: #d4e6f1;">${formatQtyWithUnit(group.item_total_qty, group.unit_short)}</td>
                </tr>`);
            }
        });
    } else {
        reportData.forEach((dataRow, i) => {
            parts.push(`<tr>
                <td class="text-center">${i + 1}</td>
                <td>${dataRow.dept_hin || ''} : ${dataRow.dept_code || ''}</td>
                <td>${dataRow.categories_hin || dataRow.categories_eng || '-'}</td>
                <td class="font-bold">${dataRow.item_hin || ''} ${dataRow.subitem_hin ? ' : ' + dataRow.subitem_hin : ''}</td>
                <td><span class="type-badge">${dataRow.type_hin || 'सामान्य'}</span></td>
                ${dataRow.arr_sum_qty.map(qty => `<td class="text-end">${formatQtyWithUnit(qty, dataRow.unit_short)}</td>`).join('')}
                <td class="text-end font-bold">${formatQtyWithUnit(dataRow.row_total_qty, dataRow.unit_short)}</td>
            </tr>`);
        });
    }

    parts.push(`</tbody>
        <tfoot>
            <tr class="grand-footer">
                <td colspan="5" class="text-end font-bold">महायोग (Grand Total):</td>
                ${grandMonthTotals.map(sum => `<td class="text-end font-bold">${formatQtyWithUnit(sum)}</td>`).join('')}
                <td class="text-end font-bold" style="background-color: #27ae60; color: #fff;">${formatQtyWithUnit(grandTotalQty)}</td>
            </tr>
        </tfoot>
    </table>`);

    // ── SECTION 2: Item-wise Detailed Transactions (when pdfType === 'detailed') ──
    if (isDetailedMode && groupedReportData.length > 0) {
        parts.push(`
        <div style="page-break-before: always; margin-top: 15px;">
            <div style="font-size: 13pt; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #2980b9; padding-bottom: 4px; margin-bottom: 10px;">
                📋 Item-Wise Detailed Transactions / वस्तु-वार विस्तृत प्रविष्टियाँ (${filterBody.year || ''})
            </div>
        </div>`);

        groupedReportData.forEach((group) => {
            const itemKey = `${group.item_id}_${group.subitem_id || 0}`;
            const records = itemDetailsMap[itemKey] || [];
            const itemDisplayName = `${group.item_hin || ''}${group.subitem_hin ? ' : ' + group.subitem_hin : ''}`;

            parts.push(`
            <div id="item_detail_${itemKey}" class="detail-section-card">
                <table style="width: 100%; margin-bottom: 6px; border-bottom: 1px solid #a9cce3;">
                    <tr>
                        <td style="font-size: 10pt; font-weight: bold; color: #1b4f72;">
                            📦 ${itemDisplayName} <small style="color: #5d6d7e;">(${group.dept_hin || group.dept_code || ''})</small>
                        </td>
                        <td class="text-end">
                            <a href="#top-saar" class="back-top-link">↑ Back to Saar Summary (ऊपर सार पर जाएं)</a>
                        </td>
                    </tr>
                </table>`);

            if (records.length === 0) {
                parts.push(`<div style="font-size: 8pt; color: #7f8c8d; padding: 4px;">No transaction records found for this period.</div></div>`);
            } else {
                parts.push(`
                <table class="data-table">
                    <thead>
                        <tr style="background-color: #2c3e50; color: #fff;">
                            <th style="width: 30px;">#</th>
                            <th style="width: 65px;">Date</th>
                            <th style="width: 80px;">Voucher/Lot</th>
                            <th style="width: 50px;">Pkt Num</th>
                            <th style="width: 80px;">MM</th>
                            <th style="width: 80px;">PBK</th>
                            <th style="width: 75px;">Type</th>
                            <th style="width: 55px;" class="text-end">Qty</th>
                            <th style="width: 40px;">Unit</th>
                            <th>Description / Remarks</th>
                        </tr>
                    </thead>
                    <tbody>`);

                records.forEach((rec, rIdx) => {
                    const dStr = rec.date ? new Date(rec.date).toLocaleDateString('en-GB') : '-';
                    parts.push(`
                        <tr>
                            <td class="text-center">${rIdx + 1}</td>
                            <td>${dStr}</td>
                            <td class="font-bold">${rec.voucher_no || rec.lot_no || '-'}</td>
                            <td>${rec.pkt_num || '-'}</td>
                            <td>${rec.mm_hin || rec.mm_eng || '-'}<small style="color:#7f8c8d;"> (${rec.mm_code || ''})</small></td>
                            <td>${rec.pbk_hin || rec.pbk_eng || '-'}</td>
                            <td><span class="type-badge">${rec.type_hin || rec.type_eng || 'सामान्य'}</span></td>
                            <td class="text-end font-bold" style="color: #27ae60;">${formatQtyWithUnit(rec.qty)}</td>
                            <td>${rec.unit_short || '-'}</td>
                            <td style="color: #555;">${rec.description || rec.remarks || '-'}</td>
                        </tr>`);
                });

                parts.push(`</tbody>
                </table>
            </div>`);
            }
        });
    }

    parts.push(`</body></html>`);

    const finalHtml = parts.join('');

    if (taskId) global.pdfProgress[taskId] = { status: 'Launching Puppeteer PDF engine...' };

    const browser = await pdfEngine.getBrowser();
    const page = await browser.newPage();

    try {
        await page.setContent(finalHtml, { waitUntil: 'networkidle0', timeout: 30000 });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '8mm', right: '8mm', bottom: '10mm', left: '8mm' }
        });

        await page.close();
        return pdfBuffer;
    } catch (err) {
        await page.close().catch(() => {});
        throw err;
    }
}

module.exports = {
    generatePdf
};
