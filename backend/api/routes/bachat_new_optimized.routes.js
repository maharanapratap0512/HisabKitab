const router = require('express').Router();
const DBContex = require('../models/DBContex');
const Fn = require('../models/functions');
const DB = new DBContex();

// Helper function to generate months between from and to dates
function generateMonthsBetween(fromYear, fromMonth, toYear, toMonth) {
    const months = [];
    let currentYear = fromYear;
    let currentMonth = fromMonth;

    while (currentYear < toYear || (currentYear === toYear && currentMonth <= toMonth)) {
        months.push(currentMonth);
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
    }
    return months;
}

// Optimized get filtered bachat_new with date range support using pure SQL approach
router.put('/filter/:dept_id', async (req, res, next) => {
    try {
        let bachat = [], bcht_new = [], months = [];
        let conditionQuery1 = `where bn.dept_id = ${req.params.dept_id}`;
        let conditionQuery2 = ``;

        if (req.body) {
            conditionQuery1 += `${req.body.mm_id ? ` AND bn.mm_id = ${req.body.mm_id}` : ``} ${req.body.item_id ? ` AND bn.item_id = ${req.body.item_id}` : ``} ${req.body.subitem_id ? ` AND bn.subitem_id = ${req.body.subitem_id}` : ``}`
            conditionQuery2 += `${req.body.state_id ? ` where mm.state_id = ${req.body.state_id}` : ``} `;
        }

        // Handle date range using optimized SQL approach
        if (req.body.from_year && req.body.from_month && req.body.to_year && req.body.to_month) {
            months = generateMonthsBetween(parseInt(req.body.from_year), parseInt(req.body.from_month), parseInt(req.body.to_year), parseInt(req.body.to_month));

            // Build date values CTE dynamically
            const dateValues = months.map((month, index) => {
                const year = req.body.from_year + Math.floor((req.body.from_month + index - 1) / 12);
                const actualMonth = ((req.body.from_month + index - 1) % 12) + 1;
                return `SELECT ${actualMonth} as month, ${year} as year`;
            }).join(' UNION ');

            // Build the optimized SQL query using the new pure SQL approach
            let sql = `
                WITH date_values AS (${dateValues}),
                combinations AS (
                    SELECT DISTINCT mm_id, item_id, subitem_id, unit_id
                    FROM bachat_new
                    WHERE dept_id = ${req.params.dept_id}
                    ${req.body.mm_id ? ` AND mm_id = ${req.body.mm_id}` : ``}
                    ${req.body.item_id ? ` AND item_id = ${req.body.item_id}` : ``}
                    ${req.body.subitem_id ? ` AND subitem_id = ${req.body.subitem_id}` : ``}
                ),
                all_combinations AS (
                    SELECT c.mm_id, c.item_id, c.subitem_id, c.unit_id, d.month, d.year
                    FROM combinations c
                    CROSS JOIN date_values d
                    ORDER BY c.mm_id, c.item_id, d.year, d.month
                ),
                bachat_data AS (
                    SELECT month, year, mm_id, item_id, subitem_id, unit_id,
                           ROUND(SUM(total_aawak), 2) as total_aawak,
                           ROUND(SUM(jawak), 2) as jawak,
                           ROUND(SUM(used_jawak), 2) as used_jawak,
                           ROUND(SUM(bachat), 2) as bachat,
                           ROUND(SUM(past_bachat), 2) as past_bachat,
                           ROUND(SUM(difference), 2) as difference
                    FROM bachat_new
                    WHERE dept_id = ${req.params.dept_id}
                    ${req.body.mm_id ? ` AND mm_id = ${req.body.mm_id}` : ``}
                    ${req.body.item_id ? ` AND item_id = ${req.body.item_id}` : ``}
                    ${req.body.subitem_id ? ` AND subitem_id = ${req.body.subitem_id}` : ``}
                    GROUP BY month, year, mm_id, item_id, subitem_id, unit_id
                ),
                aggregated_data AS (
                    SELECT ac.mm_id, ac.item_id, ac.subitem_id, ac.unit_id,
                           JSON_GROUP_ARRAY(ac.year) as years,
                           JSON_GROUP_ARRAY(ac.month) as months,
                           JSON_GROUP_ARRAY(bd.total_aawak) as total_aawak,
                           JSON_GROUP_ARRAY(bd.jawak) as jawak,
                           JSON_GROUP_ARRAY(bd.bachat) as bachat,
                           JSON_GROUP_ARRAY(bd.past_bachat) as past_bachat,
                           JSON_GROUP_ARRAY(bd.difference) as difference
                    FROM all_combinations ac
                    LEFT JOIN bachat_data bd ON ac.month = bd.month AND ac.year = bd.year AND ac.mm_id = bd.mm_id AND ac.item_id = bd.item_id AND ((ac.subitem_id IS NULL AND bd.subitem_id IS NULL) OR ac.subitem_id = bd.subitem_id) AND ac.unit_id = bd.unit_id
                    GROUP BY ac.mm_id, ac.item_id, ac.subitem_id, ac.unit_id
                    ORDER BY ac.mm_id, ac.item_id
                )
                SELECT ad.*,
                       mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng,
                       it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
                       sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
                       unit.unit_short, unit.unit_full,
                       dept.dept_code, dept.dept_hin, dept.dept_eng
                FROM aggregated_data ad
                LEFT JOIN mm on mm._id = ad.mm_id
                LEFT JOIN state st on st._id = mm.state_id
                LEFT JOIN item it on it._id = ad.item_id
                LEFT JOIN subitem sit on sit._id = ad.subitem_id
                LEFT JOIN subitem_list sitl on sitl._id = sit.subitem_list_id
                LEFT JOIN unit on unit._id = ad.unit_id
                LEFT JOIN department dept on dept._id = ${req.params.dept_id}
                ${conditionQuery2}
                ORDER BY ad.mm_id, ad.item_id`;

            let stmt = DB.db.prepare(sql);

            for (let row of stmt.iterate({ order: 'updated_at desc' })) {
                // Parse JSON arrays
                row.years = row.years ? JSON.parse(row.years) : [];
                row.months = row.months ? JSON.parse(row.months) : [];
                row.total_aawak = row.total_aawak ? JSON.parse(row.total_aawak) : [];
                row.jawak = row.jawak ? JSON.parse(row.jawak) : [];
                row.bachat = row.bachat ? JSON.parse(row.bachat) : [];
                row.past_bachat = row.past_bachat ? JSON.parse(row.past_bachat) : [];
                row.difference = row.difference ? JSON.parse(row.difference) : [];

                // Rename arrays to match frontend expectations
                row.arr_months = row.months;
                row.arr_sum_aawak = row.total_aawak;
                row.arr_sum_jawak = row.jawak;
                row.arr_sum_bachat = row.bachat;
                row.arr_past_bachat = row.past_bachat;

                // Propagate past_bachat forward only when null (missing data), preserve 0s
                row.arr_past_bachat = row.arr_past_bachat.map((pastBachat, index) => {
                    if (pastBachat !== null) return pastBachat; // Use actual value if exists (including 0)
                    
                    // Find the last non-null past_bachat before this index
                    for (let i = index - 1; i >= 0; i--) {
                        if (row.arr_past_bachat[i] !== null) {
                            return row.arr_past_bachat[i];
                        }
                    }
                    return null; // No previous data found
                });

                // Handle comments for each year in the range
                const uniqueYears = [...new Set(row.years)];
                let allComments = [];
                let allCommentIds = [];

                for (let year of uniqueYears) {
                    let crow = Fn.db.prepare(`select *, JSON_GROUP_ARRAY(_id) as arr_comment_id, JSON_GROUP_ARRAY(comment) as arr_comment, JSON_GROUP_ARRAY(month) as arr_months from report_comment where month in (${months.join(',')}) AND year = ${year} AND dept_id = ${req.params.dept_id} AND mm_id = ${row.mm_id} AND item_id = ${row.item_id} AND unit_id = ${row.unit_id} AND report_type = 'full_saar' AND row_type = 'main_row' AND ((subitem_id IS NULL AND ${row.subitem_id} IS NULL) OR subitem_id = ${row.subitem_id}) group by item_id`).get({ ...row, months: months.join(',') })
                    if (crow) {
                        crow.arr_months = crow.arr_months ? JSON.parse(crow.arr_months) : []
                        crow.arr_comment = crow.arr_comment ? JSON.parse(crow.arr_comment) : []
                        crow.arr_comment_id = crow.arr_comment_id ? JSON.parse(crow.arr_comment_id) : []
                    } else {
                        crow = {
                            arr_comment: [],
                            arr_comment_id: [],
                            arr_months: []
                        }
                    }
                    allComments.push(...crow.arr_comment);
                    allCommentIds.push(...crow.arr_comment_id);
                }

                // Map comments to months
                row.arr_comment = months.map(m => {
                    const commentIndex = allComments.findIndex((comment, index) => allCommentIds[index] && index < allComments.length);
                    return commentIndex !== -1 ? allComments[commentIndex] : null;
                });
                row.arr_comment_id = months.map(m => {
                    const commentIndex = allCommentIds.findIndex((id, index) => id && index < allCommentIds.length);
                    return commentIndex !== -1 ? allCommentIds[commentIndex] : null;
                });

                row.showTooltip = {};

                // Filter row based on category
                if (!req.body.category_id || (req.body.category_id && ((row.arr_subitem_categories && row.arr_subitem_categories.includes(req.body.category_id)) || (!row.arr_subitem_categories && row.arr_item_categories.includes(req.body.category_id))))) {
                    bcht_new.push(row);
                }
            }

            // For the "last" array (cumulative view), we can reuse the same data but with different processing
            bachat = bcht_new.map(row => ({ ...row }));

        } else if (req.body.year) {
            // Fallback for old single year logic
            conditionQuery1 += `${req.body.year ? ` AND bn.year = '${req.body.year}'` : ``}`
            let sql = DB.query.bachat_new.select_all.replace('?', conditionQuery1).replace('#', conditionQuery2);
            let stmt = DB.db.prepare(sql);
            for (let row of stmt.iterate({ order: 'updated_at desc' })) {
                for (let key of Object.keys(row)) {
                    if (key.includes('arr')) {
                        row[key] = row[key] ? JSON.parse(row[key]) : []
                    }
                }
                if (!req.body.category_id || (req.body.category_id && ((row.arr_subitem_categories && row.arr_subitem_categories.includes(req.body.category_id)) || (!row.arr_subitem_categories && row.arr_item_categories.includes(req.body.category_id))))) {
                    bcht_new.push(row);
                }
            }
        } else {
            let sql = DB.query.bachat_new.select_all.replace('?', conditionQuery1).replace('#', '');
            let stmt = DB.db.prepare(sql);
            for (let row of stmt.iterate({ order: 'updated_at desc' })) {
                for (let key of Object.keys(row)) {
                    if (key.includes('arr')) {
                        row[key] = row[key] ? JSON.parse(row[key]) : []
                    }
                }
                bcht_new.push(row);
            }
        }

        res.json({
            success: true,
            last: bachat,
            result: bcht_new,
            months: months
        })
    } catch (err) { console.log(err); next(err) };
});

module.exports = router;
