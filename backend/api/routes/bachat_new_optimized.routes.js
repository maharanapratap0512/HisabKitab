const express = require('express');
const router = express.Router();
const Fn = require('../database/functions');
const dbContex = require('../database/DBContex');
const dbCntx = new dbContex();

// Optimized Filter Route - Sparse Grid Strategy
router.put('/filter/:dept_id', async (req, res, next) => {
    try {
        const dept_id = req.params.dept_id;
        let conditions = [];
        let { from_year, from_month, to_year, to_month, mm_id, category_id, item_id, subitem_id, unit_id } = req.body;
        mm_id && mm_id.length > 0 ? conditions.push(`mm_id in (${mm_id.join(",")})`) : ``
        item_id && item_id.length > 0 ? conditions.push(`item_id in (${item_id.join(",")})`) : ``
        subitem_id && subitem_id.length > 0 ? conditions.push(`subitem_id in (${subitem_id.join(",")})`) : ``
        unit_id && unit_id.length > 0 ? conditions.push(`unit_id in (${unit_id.join(",")})`) : ``

        if (!from_year || !from_month) {
            from_year = to_year;
            from_month = to_month;
        }

        if (!to_year || !to_month) {
            to_year = from_year;
            to_month = from_month;
        }

        if (!from_year || !from_month || !to_year || !to_month) {
            return res.status(200).json({ result: [], headers: [], success: true });
        }

        const startIdx = parseInt(from_year) * 12 + parseInt(from_month);
        const endIdx = parseInt(to_year) * 12 + parseInt(to_month);

        // 1. Time Axis
        const timeAxisCTE = `
            WITH RECURSIVE month_series AS (
                SELECT ${from_year} as year, ${from_month} as month
                UNION ALL
                SELECT 
                    CASE WHEN month = 12 THEN year + 1 ELSE year END,
                    CASE WHEN month = 12 THEN 1 ELSE month + 1 END
                FROM month_series
                WHERE (year < ${to_year}) OR (year = ${to_year} AND month < ${to_month})
            )
        `;

        // 2. Universe of Relevant Items
        // We find items that have activity in range OR a non-zero balance before the range.
        // 3. Universe CTE - Filters applied to both sides of the UNION
        const universeCTE = `
            , universe AS (
                -- A. Items with activity in selected range + FILTERS
                SELECT DISTINCT mm_id, item_id, subitem_id, unit_id, condition_id
                FROM bachat_new
                WHERE dept_id = ${dept_id} 
                ${conditions.length > 0 ? ` AND ${conditions.join(" AND ")}` : ``}
                AND (year * 12 + month) BETWEEN ${startIdx} AND ${endIdx}
                AND (
                    IFNULL(total_aawak, 0) != 0 OR 
                    IFNULL(jawak, 0) != 0 OR 
                    IFNULL(used_jawak, 0) != 0 OR 
                    IFNULL(bachat, 0) != 0 OR 
                    IFNULL(difference, 0) != 0
                )
                
                UNION
                
                -- B. Items with non-zero balance before range + FILTERS
                SELECT bn.mm_id, bn.item_id, bn.subitem_id, bn.unit_id, bn.condition_id
                FROM bachat_new bn
                JOIN (
                    SELECT mm_id, item_id, subitem_id, unit_id, condition_id, MAX(year * 12 + month) as latest_idx
                    FROM bachat_new
                    WHERE dept_id = ${dept_id} 
                    ${conditions.length > 0 ? ` AND ${conditions.join(" AND ")}` : ``}
                    AND (year * 12 + month) < ${startIdx}
                    GROUP BY mm_id, item_id, subitem_id, unit_id, condition_id
                ) latest ON bn.mm_id = latest.mm_id 
                        AND bn.item_id = latest.item_id 
                        AND bn.subitem_id IS latest.subitem_id
                        AND bn.condition_id IS latest.condition_id
                        AND bn.unit_id = latest.unit_id
                        AND (bn.year * 12 + bn.month) = latest.latest_idx
                WHERE ABS(IFNULL(bn.past_bachat, 0) + IFNULL(bn.bachat, 0)) > 0.0001
            )
        `;

        // 3. Starting Balances for the Universe
        const startBalanceCTE = `
            , start_balances AS (
                SELECT u.*, (IFNULL(bn.past_bachat, 0) + IFNULL(bn.bachat, 0)) as start_val
                FROM universe u
                LEFT JOIN (
                    SELECT mm_id, item_id, subitem_id, unit_id, condition_id, MAX(year * 12 + month) as latest_idx
                    FROM bachat_new
                    WHERE dept_id = ${dept_id} AND (year * 12 + month) < ${startIdx}
                    GROUP BY mm_id, item_id, subitem_id, unit_id, condition_id
                ) latest ON u.mm_id = latest.mm_id 
                        AND u.item_id = latest.item_id 
                        AND u.subitem_id IS latest.subitem_id
                        AND u.condition_id IS latest.condition_id
                        AND u.unit_id = latest.unit_id
                LEFT JOIN bachat_new bn ON u.mm_id = bn.mm_id 
                        AND u.item_id = bn.item_id 
                        AND u.subitem_id IS bn.subitem_id
                        AND u.condition_id IS bn.condition_id
                        AND u.unit_id = bn.unit_id
                        AND (bn.year * 12 + bn.month) = latest.latest_idx
            )
        `;

        const fullGridCTE = `
            , full_grid AS (
                SELECT 
                    ms.year, ms.month, 
                    sb.*
                FROM month_series ms
                CROSS JOIN start_balances sb
            )
        `;

        const mainQuery = `
            ${timeAxisCTE} 
            ${universeCTE} 
            ${startBalanceCTE}
            ${fullGridCTE}
            SELECT 
                fg.*,
                -- Data Columns
                IFNULL(bn.total_aawak, 0) as total_aawak,
                IFNULL(bn.jawak, 0) as jawak,
                IFNULL(bn.used_jawak, 0) as used_jawak,
                IFNULL(bn.bachat, 0) as bachat, 
                IFNULL(bn.difference, 0) as difference,
                bn.past_bachat as bn_past_bachat, -- For safety, though we use start_val for the very first month

                -- Metadata
                it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
                sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
                unit.unit_short, unit.unit_full,
                sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
                mm.mm_hin, mm.mm_eng, mm.mm_code

            FROM full_grid fg
            LEFT JOIN bachat_new bn ON fg.year = bn.year 
                                   AND fg.month = bn.month 
                                   AND fg.item_id = bn.item_id 
                                   AND fg.subitem_id IS bn.subitem_id
                                   AND fg.unit_id = bn.unit_id
                                   AND fg.condition_id IS bn.condition_id
                                   AND fg.mm_id = bn.mm_id
                                   AND bn.dept_id = ${dept_id}
            
            LEFT JOIN item it ON it._id = fg.item_id
            LEFT JOIN subitem sit ON sit._id = fg.subitem_id
            LEFT JOIN subitem_list sitl ON sitl._id = sit.subitem_list_id
            LEFT JOIN unit ON unit._id = fg.unit_id
            LEFT JOIN support_list sl ON sl._id = fg.condition_id
            LEFT JOIN mm ON mm._id = fg.mm_id

            WHERE 1=1
            ${category_id ? ` AND (
                (sit.categories IS NOT NULL AND sit.categories LIKE '%${category_id}%') OR 
                (sit.categories IS NULL AND it.categories LIKE '%${category_id}%')
            )` : ''}

            ORDER BY fg.mm_id, fg.item_id, fg.subitem_id, fg.unit_id, fg.condition_id, fg.year, fg.month
        `;

        const rawData = await Fn.db.prepare(mainQuery).all();

        const commentsQuery = `
            SELECT 
                rc.year, rc.month, rc.item_id, rc.subitem_id, rc.mm_id, rc.unit_id, rc.dept_id,
                rc.comment, rc._id as comment_id
            FROM report_comment rc
            WHERE rc.dept_id = ${dept_id}
              AND rc.report_type = 'full_saar' 
              AND rc.row_type = 'main_row'
              AND (rc.year * 12 + rc.month) BETWEEN ${startIdx} AND ${endIdx}
        `;
        const comments = await Fn.db.prepare(commentsQuery).all();

        const resultMap = new Map();
        const getKey = (row) => `${row.mm_id}-${row.item_id}-${row.subitem_id || 0}-${row.unit_id}-${row.condition_id || 0}`;

        rawData.forEach(row => {
            const key = getKey(row);
            if (!resultMap.has(key)) {
                resultMap.set(key, {
                    mm_id: row.mm_id,
                    item_id: row.item_id,
                    subitem_id: row.subitem_id,
                    unit_id: row.unit_id,
                    condition_id: row.condition_id,
                    item_hin: row.item_hin,
                    item_eng: row.item_eng,
                    subitem_hin: row.subitem_hin,
                    subitem_eng: row.subitem_eng,
                    condition_hin: row.condition_hin,
                    unit_short: row.unit_short,
                    mm_hin: row.mm_hin,
                    past_bachat: row.start_val || 0, // FIXED: Now correctly initialized from SQL
                    arr_item_categories: row.arr_item_categories ? JSON.parse(row.arr_item_categories) : [],
                    arr_subitem_categories: row.arr_subitem_categories ? JSON.parse(row.arr_subitem_categories) : [],
                    arr_months: [],
                    arr_sum_aawak: [],
                    arr_sum_jawak: [],
                    arr_sum_used: [],
                    arr_sum_bachat: [],
                    arr_difference_bachat: [],
                    arr_past_bachat: [],
                    arr_comment: [],
                    arr_comment_id: [],
                    last_closing_balance: row.start_val || 0
                });
            }

            const group = resultMap.get(key);
            const currentOpeningBalance = group.arr_months.length === 0 ? (row.start_val || 0) : group.last_closing_balance;

            const monthBachatDelta = row.bachat || 0;
            const closingBalance = currentOpeningBalance + monthBachatDelta;

            group.last_closing_balance = closingBalance;

            group.arr_months.push(row.month);
            group.arr_sum_aawak.push(row.total_aawak);
            group.arr_sum_jawak.push(row.jawak);
            group.arr_sum_used.push(row.used_jawak);
            group.arr_sum_bachat.push(Number(closingBalance.toFixed(2)));
            group.arr_difference_bachat.push(row.difference || 0);
            group.arr_past_bachat.push(Number(currentOpeningBalance.toFixed(2)));

            const commentObj = comments.find(c =>
                c.year === row.year && c.month === row.month &&
                c.item_id === row.item_id && (c.subitem_id || 0) === (row.subitem_id || 0) &&
                c.unit_id === row.unit_id && c.mm_id === row.mm_id
            );
            group.arr_comment.push(commentObj ? commentObj.comment : null);
            group.arr_comment_id.push(commentObj ? commentObj.comment_id : null);
        });

        const headers = [];
        let curY = parseInt(from_year);
        let curM = parseInt(from_month);
        while (curY < parseInt(to_year) || (curY === parseInt(to_year) && curM <= parseInt(to_month))) {
            headers.push({ year: curY, month: curM });
            curM++;
            if (curM > 12) { curM = 1; curY++; }
        }

        res.status(200).json({
            result: Array.from(resultMap.values()),
            headers: headers,
            success: true
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Optimized Filter Route - Sparse Grid Strategy
router.put('/filter_last_success/:dept_id', async (req, res, next) => {
    try {
        const dept_id = req.params.dept_id;
        let { from_year, from_month, to_year, to_month, category_id, item_id, subitem_id, unit_id } = req.body;

        if (!from_year || !from_month) {
            from_year = to_year;
            from_month = to_month;
        }

        if (!to_year || !to_month) {
            to_year = from_year;
            to_month = from_month;
        }

        if (!from_year || !from_month || !to_year || !to_month) {
            return res.status(200).json({ result: [], headers: [], success: true });
        }

        const startIdx = parseInt(from_year) * 12 + parseInt(from_month);
        const endIdx = parseInt(to_year) * 12 + parseInt(to_month);

        // 1. Time Axis
        const timeAxisCTE = `
            WITH RECURSIVE month_series AS (
                SELECT ${from_year} as year, ${from_month} as month
                UNION ALL
                SELECT 
                    CASE WHEN month = 12 THEN year + 1 ELSE year END,
                    CASE WHEN month = 12 THEN 1 ELSE month + 1 END
                FROM month_series
                WHERE (year < ${to_year}) OR (year = ${to_year} AND month < ${to_month})
            )
        `;

        // 2. Universe of Relevant Items
        // We find items that have activity in range OR a non-zero balance before the range.
        const universeCTE = `
            , universe AS (
                -- A. Items with activity in selected range (Strict non-zero check)
                SELECT DISTINCT mm_id, item_id, subitem_id, unit_id, condition_id
                FROM bachat_new
                WHERE dept_id = ${dept_id} 
                  AND (year * 12 + month) BETWEEN ${startIdx} AND ${endIdx}
                  AND (
                    IFNULL(total_aawak, 0) != 0 OR 
                    IFNULL(jawak, 0) != 0 OR 
                    IFNULL(used_jawak, 0) != 0 OR 
                    IFNULL(bachat, 0) != 0 OR 
                    IFNULL(difference, 0) != 0
                  )
                
                UNION
                
                -- B. Items with non-zero closing balance immediately before the range
                SELECT bn.mm_id, bn.item_id, bn.subitem_id, bn.unit_id, bn.condition_id
                FROM bachat_new bn
                JOIN (
                    SELECT mm_id, item_id, subitem_id, unit_id, condition_id, MAX(year * 12 + month) as latest_idx
                    FROM bachat_new
                    WHERE dept_id = ${dept_id} AND (year * 12 + month) < ${startIdx}
                    GROUP BY mm_id, item_id, subitem_id, unit_id, condition_id
                ) latest ON bn.mm_id = latest.mm_id 
                        AND bn.item_id = latest.item_id 
                        AND IFNULL(bn.subitem_id, 0) = IFNULL(latest.subitem_id, 0)
                        AND IFNULL(bn.condition_id, 0) = IFNULL(latest.condition_id, 0)
                        AND bn.unit_id = latest.unit_id
                        AND (bn.year * 12 + bn.month) = latest.latest_idx
                WHERE ABS(IFNULL(bn.past_bachat, 0) + IFNULL(bn.bachat, 0)) > 0.0001
            )
        `;

        // 3. Starting Balances for the Universe
        const startBalanceCTE = `
            , start_balances AS (
                SELECT u.*, (IFNULL(bn.past_bachat, 0) + IFNULL(bn.bachat, 0)) as start_val
                FROM universe u
                LEFT JOIN (
                    SELECT mm_id, item_id, subitem_id, unit_id, condition_id, MAX(year * 12 + month) as latest_idx
                    FROM bachat_new
                    WHERE dept_id = ${dept_id} AND (year * 12 + month) < ${startIdx}
                    GROUP BY mm_id, item_id, subitem_id, unit_id, condition_id
                ) latest ON u.mm_id = latest.mm_id 
                        AND u.item_id = latest.item_id 
                        AND IFNULL(u.subitem_id, 0) = IFNULL(latest.subitem_id, 0)
                        AND IFNULL(u.condition_id, 0) = IFNULL(latest.condition_id, 0)
                        AND u.unit_id = latest.unit_id
                LEFT JOIN bachat_new bn ON u.mm_id = bn.mm_id 
                        AND u.item_id = bn.item_id 
                        AND IFNULL(u.subitem_id, 0) = IFNULL(bn.subitem_id, 0)
                        AND IFNULL(u.condition_id, 0) = IFNULL(bn.condition_id, 0)
                        AND u.unit_id = bn.unit_id
                        AND (bn.year * 12 + bn.month) = latest.latest_idx
            )
        `;

        const fullGridCTE = `
            , full_grid AS (
                SELECT 
                    ms.year, ms.month, 
                    sb.*
                FROM month_series ms
                CROSS JOIN start_balances sb
            )
        `;

        const mainQuery = `
            ${timeAxisCTE} 
            ${universeCTE} 
            ${startBalanceCTE}
            ${fullGridCTE}
            SELECT 
                fg.*,
                -- Data Columns
                IFNULL(bn.total_aawak, 0) as total_aawak,
                IFNULL(bn.jawak, 0) as jawak,
                IFNULL(bn.used_jawak, 0) as used_jawak,
                IFNULL(bn.bachat, 0) as bachat, 
                IFNULL(bn.difference, 0) as difference,
                bn.past_bachat as bn_past_bachat, -- For safety, though we use start_val for the very first month

                -- Metadata
                it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
                sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
                unit.unit_short, unit.unit_full,
                sl.list_name_hin as condition_hin, sl.list_name_eng as condition_eng,
                mm.mm_hin, mm.mm_eng, mm.mm_code

            FROM full_grid fg
            LEFT JOIN bachat_new bn ON fg.year = bn.year 
                                   AND fg.month = bn.month 
                                   AND fg.item_id = bn.item_id 
                                   AND IFNULL(fg.subitem_id, 0) = IFNULL(bn.subitem_id, 0)
                                   AND fg.unit_id = bn.unit_id
                                   AND IFNULL(fg.condition_id, 0) = IFNULL(bn.condition_id, 0)
                                   AND fg.mm_id = bn.mm_id
                                   AND bn.dept_id = ${dept_id}
            
            LEFT JOIN item it ON it._id = fg.item_id
            LEFT JOIN subitem sit ON sit._id = fg.subitem_id
            LEFT JOIN subitem_list sitl ON sitl._id = sit.subitem_list_id
            LEFT JOIN unit ON unit._id = fg.unit_id
            LEFT JOIN support_list sl ON sl._id = fg.condition_id
            LEFT JOIN mm ON mm._id = fg.mm_id

            WHERE 1=1
            ${category_id ? ` AND (
                (sit.categories IS NOT NULL AND sit.categories LIKE '%${category_id}%') OR 
                (sit.categories IS NULL AND it.categories LIKE '%${category_id}%')
            )` : ''}
            ${item_id ? ` AND fg.item_id = ${item_id}` : ''}
            ${subitem_id ? ` AND fg.subitem_id = ${subitem_id}` : ''}
            ${unit_id ? ` AND fg.unit_id = ${unit_id}` : ''}

            ORDER BY fg.mm_id, fg.item_id, fg.subitem_id, fg.unit_id, fg.condition_id, fg.year, fg.month
        `;

        const rawData = await Fn.db.prepare(mainQuery).all();

        const commentsQuery = `
            SELECT 
                rc.year, rc.month, rc.item_id, rc.subitem_id, rc.mm_id, rc.unit_id, rc.dept_id,
                rc.comment, rc._id as comment_id
            FROM report_comment rc
            WHERE rc.dept_id = ${dept_id}
              AND rc.report_type = 'full_saar' 
              AND rc.row_type = 'main_row'
              AND (rc.year * 12 + rc.month) BETWEEN ${startIdx} AND ${endIdx}
        `;
        const comments = await Fn.db.prepare(commentsQuery).all();

        const resultMap = new Map();
        const getKey = (row) => `${row.mm_id}-${row.item_id}-${row.subitem_id || 0}-${row.unit_id}-${row.condition_id || 0}`;

        rawData.forEach(row => {
            const key = getKey(row);
            if (!resultMap.has(key)) {
                resultMap.set(key, {
                    mm_id: row.mm_id,
                    item_id: row.item_id,
                    subitem_id: row.subitem_id,
                    unit_id: row.unit_id,
                    condition_id: row.condition_id,
                    item_hin: row.item_hin,
                    item_eng: row.item_eng,
                    subitem_hin: row.subitem_hin,
                    subitem_eng: row.subitem_eng,
                    condition_hin: row.condition_hin,
                    unit_short: row.unit_short,
                    mm_hin: row.mm_hin,
                    past_bachat: row.start_val || 0, // FIXED: Now correctly initialized from SQL
                    arr_item_categories: row.arr_item_categories ? JSON.parse(row.arr_item_categories) : [],
                    arr_subitem_categories: row.arr_subitem_categories ? JSON.parse(row.arr_subitem_categories) : [],
                    arr_months: [],
                    arr_sum_aawak: [],
                    arr_sum_jawak: [],
                    arr_sum_used: [],
                    arr_sum_bachat: [],
                    arr_difference_bachat: [],
                    arr_past_bachat: [],
                    arr_comment: [],
                    arr_comment_id: [],
                    last_closing_balance: row.start_val || 0
                });
            }

            const group = resultMap.get(key);
            const currentOpeningBalance = group.arr_months.length === 0 ? (row.start_val || 0) : group.last_closing_balance;

            const monthBachatDelta = row.bachat || 0;
            const closingBalance = currentOpeningBalance + monthBachatDelta;

            group.last_closing_balance = closingBalance;

            group.arr_months.push(row.month);
            group.arr_sum_aawak.push(row.total_aawak);
            group.arr_sum_jawak.push(row.jawak);
            group.arr_sum_used.push(row.used_jawak);
            group.arr_sum_bachat.push(Number(closingBalance.toFixed(2)));
            group.arr_difference_bachat.push(row.difference || 0);
            group.arr_past_bachat.push(Number(currentOpeningBalance.toFixed(2)));

            const commentObj = comments.find(c =>
                c.year === row.year && c.month === row.month &&
                c.item_id === row.item_id && (c.subitem_id || 0) === (row.subitem_id || 0) &&
                c.unit_id === row.unit_id && c.mm_id === row.mm_id
            );
            group.arr_comment.push(commentObj ? commentObj.comment : null);
            group.arr_comment_id.push(commentObj ? commentObj.comment_id : null);
        });

        const headers = [];
        let curY = parseInt(from_year);
        let curM = parseInt(from_month);
        while (curY < parseInt(to_year) || (curY === parseInt(to_year) && curM <= parseInt(to_month))) {
            headers.push({ year: curY, month: curM });
            curM++;
            if (curM > 12) { curM = 1; curY++; }
        }

        res.status(200).json({
            result: Array.from(resultMap.values()),
            headers: headers,
            success: true
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
