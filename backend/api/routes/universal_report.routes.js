const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const universalReportPdf = require('../services/universal-report-pdf.service');

/**
 * Universal Matrix Report API
 * Supports pivoting by dynamic dimension (aawak_source, aawak_type, jawak_type, usage_list, condition)
 * across single month (Monthly) or multi-month (Yearly) range.
 */
router.put('/filter/:dept_id', async (req, res, next) => {
    let tempTableCreated = false;
    try {
        const dept_id = parseInt(req.params.dept_id);
        const {
            pivot_dimension = 'aawak_source',
            dimension_ids = [],
            from_year,
            from_month,
            to_year,
            to_month,
            mm_id,
            category_id,
            item_id,
            subitem_id,
            item_subitem_ids,
            unit_id
        } = req.body;

        if (!from_year || !from_month) {
            return res.status(400).json({ success: false, message: 'From year and month are required' });
        }

        const filterDimSet = (dimension_ids && Array.isArray(dimension_ids) && dimension_ids.length > 0)
            ? new Set(dimension_ids.map(id => parseInt(id)))
            : null;

        const getMappedDimId = (rawDimId) => {
            if (!filterDimSet || filterDimSet.size === 0) {
                return rawDimId;
            }
            const idNum = parseInt(rawDimId);
            if (filterDimSet.has(idNum)) {
                return idNum;
            }
            return 'other';
        };

        const startYear = parseInt(from_year);
        const startMonth = parseInt(from_month);
        const endYear = parseInt(to_year || from_year);
        const endMonth = parseInt(to_month || from_month);

        const fromStr = `${startYear}-${startMonth.toString().padStart(2, '0')}`;
        const toStr = `${endYear}-${endMonth.toString().padStart(2, '0')}`;

        // 1. Build Time Axis (Months Array)
        const monthsList = [];
        let currY = startYear;
        let currM = startMonth;

        const monthNamesHin = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
        const monthNamesEng = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        while (currY < endYear || (currY === endYear && currM <= endMonth)) {
            const mKey = `${currY}-${currM.toString().padStart(2, '0')}`;
            monthsList.push({
                year: currY,
                month: currM,
                key: mKey,
                name_hin: `${monthNamesHin[currM - 1]} ${currY}`,
                name_eng: `${monthNamesEng[currM - 1]} ${currY}`
            });
            currM++;
            if (currM > 12) {
                currM = 1;
                currY++;
            }
        }

        // 2. Map pivot dimension to database column expressions & support_list list_type
        let awkDimExpr = 'IFNULL(a.aawak_source_id, 0)';
        let jwkDimExpr = 'IFNULL(j.aawak_source_id, 0)';
        let listType = 'aawak_source';

        if (pivot_dimension === 'aawak_type') {
            awkDimExpr = 'IFNULL(a.aawak_type_id, 0)';
            jwkDimExpr = '0';
            listType = 'aawak_type';
        } else if (pivot_dimension === 'jawak_type') {
            awkDimExpr = '0';
            jwkDimExpr = 'IFNULL(j.jawak_type_id, 0)';
            listType = 'jawak_type';
        } else if (pivot_dimension === 'usage_list') {
            awkDimExpr = 'IFNULL(a.usage_list_id, 0)';
            jwkDimExpr = 'IFNULL(j.usage_list_id, 0)';
            listType = 'usage_list';
        } else if (pivot_dimension === 'condition') {
            awkDimExpr = 'IFNULL(a.condition_id, 0)';
            jwkDimExpr = 'IFNULL(j.condition_id, 0)';
            listType = 'condition';
        } else {
            awkDimExpr = 'IFNULL(a.aawak_source_id, 0)';
            jwkDimExpr = 'IFNULL(j.aawak_source_id, 0)';
            listType = 'aawak_source';
        }

        // 3. Fetch Support List Dimensions (including custom defined ones)
        const dimStmt = DB.db.prepare(`
            SELECT _id, list_name_hin, list_name_eng, list_name_roman 
            FROM support_list 
            WHERE list_type = ?
            ORDER BY _id ASC
        `);
        const dimList = dimStmt.all(listType);

        // Map dimension IDs to objects for fast lookup
        const dimMap = new Map();
        dimList.forEach(d => {
            dimMap.set(d._id, {
                _id: d._id,
                hin: d.list_name_hin || 'अन्य',
                eng: d.list_name_eng || 'Other',
                roman: d.list_name_roman || ''
            });
        });
        dimMap.set(0, { _id: 0, hin: 'अननिर्दिष्ट', eng: 'Unassigned', roman: 'Unassigned' });

        // 4. Build Dynamic SQL Filter Clauses
        let filterSql = '';

        if (mm_id && Array.isArray(mm_id) && mm_id.length > 0) {
            filterSql += ` AND mm_id IN (${mm_id.map(id => parseInt(id)).join(',')})`;
        } else if (mm_id && typeof mm_id === 'number') {
            filterSql += ` AND mm_id = ${parseInt(mm_id)}`;
        }

        // Precise Category filter handling (Item & Subitem category match)
        if (category_id) {
            let catIds = [];
            if (Array.isArray(category_id)) {
                catIds = category_id.map(id => parseInt(id)).filter(id => !isNaN(id));
            } else if (category_id) {
                const parsed = parseInt(category_id);
                if (!isNaN(parsed)) catIds = [parsed];
            }

            if (catIds.length > 0) {
                const catListStr = catIds.join(',');
                filterSql += ` AND (
                    (IFNULL(subitem_id, 0) > 0 AND (
                        subitem_id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id IN (${catListStr}))
                        OR (
                            NOT EXISTS (SELECT 1 FROM rel_subitem_category rsc WHERE rsc.subitem_id = subitem_id)
                            AND item_id IN (SELECT item_id FROM rel_item_category WHERE category_id IN (${catListStr}))
                        )
                    ))
                    OR
                    (IFNULL(subitem_id, 0) = 0 AND item_id IN (SELECT item_id FROM rel_item_category WHERE category_id IN (${catListStr})))
                )`;
            }
        }

        // Item / Subitem filter handling (uses SQLite TEMP TABLE to prevent Expression Tree depth limits)
        if (item_subitem_ids && Array.isArray(item_subitem_ids) && item_subitem_ids.length > 0) {
            DB.db.exec(`CREATE TEMP TABLE IF NOT EXISTS temp_filter_item (item_id INTEGER, subitem_id INTEGER)`);
            DB.db.exec(`DELETE FROM temp_filter_item`);

            const insertStmt = DB.db.prepare(`INSERT INTO temp_filter_item (item_id, subitem_id) VALUES (?, ?)`);
            const insertBatch = DB.db.transaction((items) => {
                for (const idStr of items) {
                    const parts = String(idStr).split(':');
                    const itmId = parseInt(parts[0]);
                    const subId = parts[1] ? parseInt(parts[1]) : 0;
                    if (!isNaN(itmId)) {
                        insertStmt.run(itmId, subId);
                    }
                }
            });
            insertBatch(item_subitem_ids);
            tempTableCreated = true;
            filterSql += ` AND EXISTS (SELECT 1 FROM temp_filter_item tfi WHERE tfi.item_id = item_id AND tfi.subitem_id = IFNULL(subitem_id, 0))`;
        } else {
            if (item_id && Array.isArray(item_id) && item_id.length > 0) {
                filterSql += ` AND item_id IN (${item_id.map(id => parseInt(id)).join(',')})`;
            } else if (item_id && typeof item_id === 'number') {
                filterSql += ` AND item_id = ${parseInt(item_id)}`;
            }

            if (subitem_id && Array.isArray(subitem_id) && subitem_id.length > 0) {
                filterSql += ` AND subitem_id IN (${subitem_id.map(id => parseInt(id)).join(',')})`;
            } else if (subitem_id && typeof subitem_id === 'number') {
                filterSql += ` AND subitem_id = ${parseInt(subitem_id)}`;
            }
        }

        if (unit_id && Array.isArray(unit_id) && unit_id.length > 0) {
            filterSql += ` AND unit_id IN (${unit_id.map(id => parseInt(id)).join(',')})`;
        }

        const params = { dept_id, fromStr, toStr };

        // 5. Unified SQLite CTE Query for 100% Pure Transactional Truth (No bachat_new)
        const cteSql = `
            WITH tx_all AS (
                -- 1. Prior Aawak (date < fromStr)
                SELECT 
                    a.mm_id, a.item_id, IFNULL(a.subitem_id, 0) as subitem_id, a.unit_id,
                    'PRIOR' as month_key,
                    ${awkDimExpr} as dim_id,
                    IFNULL(a.qty, 0) as awk_qty,
                    0 as jwk_qty
                FROM aawak a
                WHERE a.dept_id = @dept_id
                  AND strftime('%Y-%m', a.date) < @fromStr
                  ${filterSql}

                UNION ALL

                -- 2. Prior Jawak (date < fromStr)
                SELECT 
                    j.mm_id, j.item_id, IFNULL(j.subitem_id, 0) as subitem_id, j.unit_id,
                    'PRIOR' as month_key,
                    ${jwkDimExpr} as dim_id,
                    0 as awk_qty,
                    IFNULL(j.qty, 0) as jwk_qty
                FROM jawak j
                WHERE j.dept_id = @dept_id
                  AND strftime('%Y-%m', j.date) < @fromStr
                  ${filterSql}

                UNION ALL

                -- 3. Period Aawak (fromStr <= date <= toStr)
                SELECT 
                    a.mm_id, a.item_id, IFNULL(a.subitem_id, 0) as subitem_id, a.unit_id,
                    strftime('%Y-%m', a.date) as month_key,
                    ${awkDimExpr} as dim_id,
                    IFNULL(a.qty, 0) as awk_qty,
                    0 as jwk_qty
                FROM aawak a
                WHERE a.dept_id = @dept_id
                  AND strftime('%Y-%m', a.date) >= @fromStr
                  AND strftime('%Y-%m', a.date) <= @toStr
                  ${filterSql}

                UNION ALL

                -- 4. Period Jawak (fromStr <= date <= toStr)
                SELECT 
                    j.mm_id, j.item_id, IFNULL(j.subitem_id, 0) as subitem_id, j.unit_id,
                    strftime('%Y-%m', j.date) as month_key,
                    ${jwkDimExpr} as dim_id,
                    0 as awk_qty,
                    IFNULL(j.qty, 0) as jwk_qty
                FROM jawak j
                WHERE j.dept_id = @dept_id
                  AND strftime('%Y-%m', j.date) >= @fromStr
                  AND strftime('%Y-%m', j.date) <= @toStr
                  ${filterSql}
            )
            SELECT 
                t.mm_id, t.item_id, t.subitem_id, t.unit_id, t.month_key, t.dim_id,
                SUM(t.awk_qty) as total_awk,
                SUM(t.jwk_qty) as total_jwk,
                mm.mm_hin, mm.mm_eng, mm.mm_roman, mm.state_id, state.state_hin,
                dept.dept_hin, item.item_hin, item.item_eng, item.item_roman, 
                subitem.subitem_hin, subitem.subitem_eng, subitem.subitem_roman, unit.unit_short,
                (
                    SELECT GROUP_CONCAT(c.category_hin, ', ')
                    FROM category c
                    JOIN rel_subitem_category rsc ON rsc.category_id = c._id
                    WHERE rsc.subitem_id = t.subitem_id AND t.subitem_id > 0
                ) as sub_cat_hin,
                (
                    SELECT GROUP_CONCAT(c.category_eng, ', ')
                    FROM category c
                    JOIN rel_subitem_category rsc ON rsc.category_id = c._id
                    WHERE rsc.subitem_id = t.subitem_id AND t.subitem_id > 0
                ) as sub_cat_eng,
                (
                    SELECT GROUP_CONCAT(c.category_hin, ', ')
                    FROM category c
                    JOIN rel_item_category ric ON ric.category_id = c._id
                    WHERE ric.item_id = t.item_id
                ) as item_cat_hin,
                (
                    SELECT GROUP_CONCAT(c.category_eng, ', ')
                    FROM category c
                    JOIN rel_item_category ric ON ric.category_id = c._id
                    WHERE ric.item_id = t.item_id
                ) as item_cat_eng
            FROM tx_all t
            LEFT JOIN mm ON mm._id = t.mm_id
            LEFT JOIN state ON state._id = mm.state_id
            LEFT JOIN department dept ON dept._id = @dept_id
            LEFT JOIN item ON item._id = t.item_id
            LEFT JOIN subitem ON subitem._id = t.subitem_id
            LEFT JOIN unit ON unit._id = t.unit_id
            GROUP BY t.mm_id, t.item_id, t.subitem_id, t.unit_id, t.month_key, t.dim_id
        `;

        const cteStmt = DB.db.prepare(cteSql);
        const txData = cteStmt.all(params);

        // Cleanup TEMP TABLE
        if (tempTableCreated) {
            try { DB.db.exec(`DROP TABLE IF EXISTS temp_filter_item`); } catch (e) { }
            tempTableCreated = false;
        }

        // 6. Assemble Master Row Universe
        const rowMap = new Map();
        const usedDimIdsSet = new Set();

        const getRowKey = (r) => `${r.mm_id}_${r.item_id}_${r.subitem_id || 0}_${r.unit_id || 0}`;

        const getOrCreateRow = (r) => {
            const key = getRowKey(r);
            if (!rowMap.has(key)) {
                rowMap.set(key, {
                    key,
                    mm_id: r.mm_id,
                    mm_hin: r.mm_hin || '-',
                    mm_eng: r.mm_eng || '-',
                    mm_roman: r.mm_roman || '',
                    state_id: r.state_id,
                    state_hin: r.state_hin || '-',
                    dept_hin: r.dept_hin || '-',
                    category_hin: r.sub_cat_hin || r.item_cat_hin || '-',
                    category_eng: r.sub_cat_eng || r.item_cat_eng || '-',
                    item_id: r.item_id,
                    item_hin: r.item_hin || '-',
                    item_eng: r.item_eng || '-',
                    item_roman: r.item_roman || '',
                    subitem_id: r.subitem_id || null,
                    subitem_hin: r.subitem_id ? (r.subitem_hin || '-') : '-',
                    subitem_eng: r.subitem_id ? (r.subitem_eng || '-') : '-',
                    subitem_roman: r.subitem_id ? (r.subitem_roman || '') : '',
                    unit_id: r.unit_id,
                    unit_short: r.unit_short || '-',
                    past_bachat: {
                        total: 0,
                        dims: {}
                    },
                    months: {},
                    grand_total: {
                        total_aawak: 0,
                        total_jawak: 0,
                        final_bachat: 0,
                        dims: {}
                    }
                });
            }
            return rowMap.get(key);
        };

        // Populate CTE rows into master row universe
        txData.forEach(r => {
            const row = getOrCreateRow(r);
            const dimId = getMappedDimId(r.dim_id);
            usedDimIdsSet.add(dimId);

            if (r.month_key === 'PRIOR') {
                const netQty = r.total_awk - r.total_jwk;
                if (row.past_bachat.dims[dimId] === undefined) row.past_bachat.dims[dimId] = 0;
                row.past_bachat.dims[dimId] += netQty;
                row.past_bachat.total += netQty;
            } else {
                const mKey = r.month_key;
                if (!row.months[mKey]) row.months[mKey] = { dims: {}, total_aawak: 0, total_jawak: 0, net_bachat: 0 };
                if (!row.months[mKey].dims[dimId]) row.months[mKey].dims[dimId] = { aawak: 0, jawak: 0, bachat: 0 };

                row.months[mKey].dims[dimId].aawak += r.total_awk;
                row.months[mKey].dims[dimId].jawak += r.total_jwk;
                row.months[mKey].total_aawak += r.total_awk;
                row.months[mKey].total_jawak += r.total_jwk;

                if (!row.grand_total.dims[dimId]) row.grand_total.dims[dimId] = { aawak: 0, jawak: 0, bachat: 0 };
                row.grand_total.dims[dimId].aawak += r.total_awk;
                row.grand_total.dims[dimId].jawak += r.total_jwk;
                row.grand_total.total_aawak += r.total_awk;
                row.grand_total.total_jawak += r.total_jwk;
            }
        });

        // Determine final dimensions list to include in table headers
        let activeDimensions = [];

        if (filterDimSet && filterDimSet.size > 0) {
            dimList.forEach(d => {
                if (filterDimSet.has(d._id)) {
                    activeDimensions.push({
                        _id: d._id,
                        list_name_hin: d.list_name_hin,
                        list_name_eng: d.list_name_eng,
                        list_name_roman: d.list_name_roman
                    });
                }
            });

            if (usedDimIdsSet.has('other')) {
                activeDimensions.push({
                    _id: 'other',
                    list_name_hin: 'अन्य / अननिर्दिष्ट',
                    list_name_eng: 'Other / Unassigned',
                    list_name_roman: 'Other / Unassigned'
                });
            }
        } else {
            activeDimensions = dimList.filter(d => usedDimIdsSet.has(d._id));
            if (usedDimIdsSet.has(0)) {
                activeDimensions.push({ _id: 0, list_name_hin: 'अननिर्दिष्ट', list_name_eng: 'Unassigned', list_name_roman: 'Unassigned' });
            }
        }

        if (activeDimensions.length === 0) {
            activeDimensions = dimList.length > 0 ? dimList : [{ _id: 0, list_name_hin: 'सामान्य', list_name_eng: 'General', list_name_roman: 'General' }];
        }

        // 7. Real Cumulative Stock Calculation per month and dimension (Past Bachat + Monthly Movements)
        const rowsArray = Array.from(rowMap.values());

        rowsArray.forEach(row => {
            activeDimensions.forEach(dim => {
                const dimId = dim._id;
                if (row.past_bachat.dims[dimId] === undefined) {
                    row.past_bachat.dims[dimId] = 0;
                }
            });

            const runningDimBachat = {};
            activeDimensions.forEach(dim => {
                runningDimBachat[dim._id] = row.past_bachat.dims[dim._id] || 0;
            });
            let runningTotalBachat = row.past_bachat.total || 0;

            monthsList.forEach(m => {
                const mKey = m.key;
                if (!row.months[mKey]) {
                    row.months[mKey] = { dims: {}, total_aawak: 0, total_jawak: 0, net_bachat: runningTotalBachat };
                }

                // Calculate real cumulative bachat per dimension at end of this month
                activeDimensions.forEach(dim => {
                    const dimId = dim._id;
                    if (!row.months[mKey].dims[dimId]) {
                        row.months[mKey].dims[dimId] = { aawak: 0, jawak: 0, bachat: 0 };
                    }
                    const d = row.months[mKey].dims[dimId];
                    runningDimBachat[dimId] += (d.aawak - d.jawak);
                    d.bachat = runningDimBachat[dimId];
                });

                const monthNetChange = (row.months[mKey].total_aawak || 0) - (row.months[mKey].total_jawak || 0);
                runningTotalBachat += monthNetChange;
                row.months[mKey].net_bachat = runningTotalBachat;
            });

            // Calculate final cumulative stock per dimension
            activeDimensions.forEach(dim => {
                const dimId = dim._id;
                if (!row.grand_total.dims[dimId]) {
                    row.grand_total.dims[dimId] = { aawak: 0, jawak: 0, bachat: 0 };
                }
                row.grand_total.dims[dimId].bachat = runningDimBachat[dimId];
            });

            row.grand_total.final_bachat = runningTotalBachat;
        });

        res.json({
            success: true,
            pivot_dimension,
            view_mode: monthsList.length === 1 ? 'monthly' : 'yearly',
            months: monthsList,
            dimensions: activeDimensions,
            rows: rowsArray
        });

    } catch (err) {
        if (tempTableCreated) {
            try { DB.db.exec(`DROP TABLE IF EXISTS temp_filter_item`); } catch (e) { }
        }
        console.error('Error in universal_report filter:', err);
        next(err);
    }
});

global.pdfProgress = global.pdfProgress || {};

router.get('/pdf-progress/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const status = global.pdfProgress[taskId] || { status: 'Preparing request...' };
    res.json(status);
});

/**
 * Advanced InDesign Puppeteer PDF Export Endpoint
 */
router.post('/export-pdf/:dept_id', async (req, res, next) => {
    const taskId = req.body ? req.body.taskId : null;
    try {
        const {
            reportRows,
            monthsList,
            activeDimensions,
            filterBody,
            columnTotals,
            viewMode,
            deptName,
            selectedMmStr,
            selectedCatStr,
            dimLabel,
            hideZeroRows
        } = req.body;

        if (taskId) {
            global.pdfProgress[taskId] = { status: 'Preparing Universal Matrix PDF payload...' };
        }

        const pdfBuffer = await universalReportPdf.generatePdf({
            reportRows,
            monthsList,
            activeDimensions,
            filterBody,
            columnTotals,
            viewMode,
            deptName,
            selectedMmStr,
            selectedCatStr,
            dimLabel,
            hideZeroRows,
            taskId
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Universal_Report_${Date.now()}.pdf"`);
        res.end(pdfBuffer, 'binary');

        if (taskId) delete global.pdfProgress[taskId];
    } catch (err) {
        if (taskId) delete global.pdfProgress[taskId];
        console.error('Error generating Universal Report PDF:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to generate PDF' });
    }
});

module.exports = router;
