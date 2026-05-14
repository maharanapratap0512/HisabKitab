const router = require('express').Router();
const DBContex = require('../database/DBContex');
const Fn = require('../database/functions');
const DB = new DBContex();


// get bachat_new all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('bachat_new').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get bachat_new 
router.get('/:dept_id', async (req, res, next) => {
    try {
        let sql = DB.query.bachat_new.select_all.replace('?', ` where dept_id = ${req.params.dept_id}`).replace('#', '');
        let bachat = [];
        let stmt = DB.db.prepare(sql);
        for (let row of stmt.iterate({ order: 'updated_at desc' })) {
            for (let key of Object.keys(row)) {
                if (key.includes('arr')) {
                    row[key] = row[key] ? JSON.parse(row[key]) : []
                }
            }
            bachat.push(row);
        }
        res.json({
            success: true,
            result: bachat
        })
    } catch (err) { console.log(err); next(err) };
});


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

        // Handle date range using optimized SQL approach
        if (from_year && from_month && to_year && to_month) {

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
                        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as arr_icategories,
                        sit.subitem_hin, sit.subitem_eng, sit.categories as arr_scategories,
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
                    
                    LEFT JOIN v_item it ON it._id = fg.item_id
                    LEFT JOIN v_subitem sit ON sit._id = fg.subitem_id
                    LEFT JOIN unit ON unit._id = fg.unit_id
                    LEFT JOIN support_list sl ON sl._id = fg.condition_id
                    LEFT JOIN mm ON mm._id = fg.mm_id
        
                    WHERE 1=1
                    ${category_id ? ` AND (
                        EXISTS (SELECT 1 FROM json_each(vs.categories) WHERE json_extract(value, '$._id') = ${category_id}) OR
                        (vs.categories = '[]' AND EXISTS (SELECT 1 FROM json_each(vi.categories) WHERE json_extract(value, '$._id') = ${category_id}))
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
                        mm_eng: row.mm_eng,
                        mm_code: row.mm_code,
                        past_bachat: row.start_val || 0, // FIXED: Now correctly initialized from SQL
                        arr_icategories: row.arr_icategories ? JSON.parse(row.arr_icategories) : [],
                        arr_scategories: row.arr_scategories ? JSON.parse(row.arr_scategories) : [],
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
                if (!req.body.category_id || (req.body.category_id && ((row.arr_scategories && row.arr_scategories.includes(req.body.category_id)) || (!row.arr_scategories && row.arr_icategories.includes(req.body.category_id))))) {
                    bcht_new.push(row);
                }
            }

            res.json({
                success: true,
                last: bachat,
                result: bcht_new,
                months: months
            })
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

            res.json({
                success: true,
                last: bachat,
                result: bcht_new,
                months: months
            })
        }

    } catch (err) { console.log(err); next(err) };
});

router.put('/condition/:dept_id', async (req, res, next) => {
    try {
        let bachat = [], months = [];
        let conditionQuery1 = `where dept_id = ${req.params.dept_id}`, awkCondition = `where awk.dept_id = ${req.params.dept_id}`;
        if (req.body) {
            conditionQuery1 += `${req.body.mm_id ? ` AND bachat_new.mm_id = ${req.body.mm_id}` : ``} ${req.body.item_id ? ` AND bachat_new.item_id = ${req.body.item_id}` : ``} ${req.body.item_id ? ` AND ((bachat_new.subitem_id IS NULL AND ${req.body.subitem_id} IS NULL) OR bachat_new.subitem_id = ${req.body.subitem_id})` : ``} ${req.body.unit_id ? ` AND bachat_new.unit_id = ${req.body.unit_id}` : ``}`
            awkCondition += `${req.body.mm_id ? ` AND awk.mm_id = ${req.body.mm_id}` : ``} ${req.body.item_id ? ` AND awk.item_id = ${req.body.item_id}` : ``} ${req.body.item_id ? ` AND ((awk.subitem_id IS NULL AND ${req.body.subitem_id} IS NULL) OR awk.subitem_id = ${req.body.subitem_id})` : ``} ${req.body.unit_id ? ` AND awk.unit_id = ${req.body.unit_id}` : ``}`
            // conditionQuery2 += `${req.body.state_id ? ` where mm.state_id = ${req.body.state_id}` : ``} `;

        }
        months = Fn.sortAndFillMonths(req.body.months || req.body.arr_months);
        conditionQuery1 += ` AND month in (${months.join(',')}) AND year = '${req.body.year}'`
        awkCondition += ` AND awk.month in (${months.join(',')}) AND awk.year = '${req.body.year}'`

        // let sql = DB.query.bachat_new.select_all.replace('?', conditionQuery1).replace('#', conditionQuery2);
        let sql = `
            select bcht.*,
            JSON_GROUP_ARRAY(bcht.month) as arr_months, 
            JSON_GROUP_ARRAY(bcht.t_a) as arr_sum_aawak, 
            JSON_GROUP_ARRAY(bcht.t_j) as arr_sum_jawak, 
            JSON_GROUP_ARRAY(bcht.t_u) as arr_sum_used,
            JSON_GROUP_ARRAY(bcht.t_b) as arr_sum_bachat,
            mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng,
            it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as arr_icategories,
            sit.subitem_hin, sit.subitem_eng, sit.subitem_roman, sit.categories as arr_scategories,
            sl.list_name_hin, sl.list_name_eng,
            unit.unit_short, unit.unit_full,
            dept.dept_code, dept.dept_hin, dept.dept_eng from (select sum(total_aawak) as t_a, sum(jawak) as t_j, sum(used_jawak) as t_u, sum(bachat) as t_b, * from bachat_new ${conditionQuery1}        
            group by dept_id, mm_id, item_id, subitem_id, condition_id, unit_id, month, year) bcht
            left join mm on mm._id = bcht.mm_id
            left join state st on st._id = mm.state_id
            left join v_item it on it._id = bcht.item_id
            left join v_subitem sit on sit._id = bcht.subitem_id
            left join support_list sl on sl._id = bcht.condition_id
            left join unit on unit._id = bcht.unit_id
            left join department dept on dept._id = bcht.dept_id
            group by bcht.dept_id, bcht.mm_id, bcht.item_id, bcht.subitem_id, bcht.condition_id, bcht.unit_id;`

        console.log(sql);
        let stmt = DB.db.prepare(sql);

        for (let row of stmt.iterate({ order: 'updated_at desc' })) {

            for (let key of Object.keys(row)) {
                if (key.includes('arr')) {
                    row[key] = row[key] ? JSON.parse(row[key]) : []
                }
            }

            let past_bachat = DB.db.prepare(`select sum(bachat) as pb_qty from bachat_new where dept_id = @dept_id AND mm_id = @mm_id AND item_id = @item_id AND ((subitem_id IS NULL AND @subitem_id IS NULL) OR subitem_id = @subitem_id) AND condition_id = @condition_id AND unit_id = @unit_id AND (year < ${req.body.year} OR (year = ${req.body.year} AND month < ${months[0]}))`).get(row);

            row.past_bachat = past_bachat.pb_qty || 0;

            let crow = Fn.db.prepare(`select *, JSON_GROUP_ARRAY(_id) as arr_comment_id, JSON_GROUP_ARRAY(comment) as arr_comment, JSON_GROUP_ARRAY(month) as arr_months from report_comment where month in (${months.join(',')}) AND year = ${row.year} AND dept_id = ${row.dept_id} AND mm_id = ${row.mm_id} AND item_id = ${row.item_id} AND unit_id = ${row.unit_id} AND report_type = 'full_saar' AND row_type = 'condition_wise' AND ((type_id IS NULL AND ${row.condition_id} IS NULL) OR type_id = ${row.condition_id}) AND ((subitem_id IS NULL AND ${row.subitem_id} IS NULL) OR subitem_id = ${row.subitem_id}) group by item_id`).get({ ...row, months: months.join(',') })
            if (crow) {
                console.log(crow);
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
            row.arr_comment = months.map(m => crow.arr_months.includes(m) ? crow.arr_comment[crow.arr_months.indexOf(m)] : null);
            row.arr_comment_id = months.map(m => crow.arr_months.includes(m) ? crow.arr_comment_id[crow.arr_months.indexOf(m)] : null);
            console.log("row", row);

            // fill 0 to months that are in range but not in row
            row.arr_sum_aawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_aawak[row.arr_months.indexOf(m)] : 0);
            row.arr_sum_jawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_jawak[row.arr_months.indexOf(m)] : 0);
            row.arr_sum_used = months.map(m => row.arr_months.includes(m) ? row.arr_sum_used[row.arr_months.indexOf(m)] : 0);
            row.arr_sum_bachat = months.map(m => row.arr_months.includes(m) ? row.arr_sum_bachat[row.arr_months.indexOf(m)] : 0);
            row.arr_months = months;
            row.showTooltip = {}
            // add pichla bachat of previos month to all months bachat.
            for (let i = 0; i < row.arr_sum_bachat.length; i++) {
                row.arr_sum_bachat[i] += i == 0 ? row.past_bachat || 0 : row.arr_sum_bachat[i - 1] || 0;
            }

            bachat.push(row);
        }


        let awksql = `select awk.dept_id, awk.mm_id, awk.item_id, awk.subitem_id, awk.unit_id, awk.aawak_type_id, awk.year,json_group_array(awk.month) as arr_months, json_group_array(awk.t_qty) as arr_sum_aawak, json_group_array(jwk.used) as arr_sum_used, json_group_array(jwk.other) as arr_sum_jawak, 
        sl.list_name_hin, sl.list_name_eng,
        unit.unit_short, unit.unit_full from mn_awk_type_wise awk
        left join mn_jwk_aj_type jwk on awk.month = jwk.month AND awk.year = jwk.year AND awk.dept_id = jwk.dept_id AND awk.mm_id = jwk.mm_id AND awk.item_id = jwk.item_id AND ((awk.subitem_id IS NULL AND jwk.subitem_id IS NULL) OR awk.subitem_id = jwk.subitem_id) AND awk.unit_id = jwk.unit_id AND awk.aawak_type_id = jwk.aawak_type_id 
        left join support_list sl on sl._id = awk.aawak_type_id
        left join unit on unit._id = awk.unit_id ${awkCondition}        
        group by awk.year, awk.dept_id, awk.mm_id, awk.item_id, awk.subitem_id, awk.unit_id, awk.aawak_type_id`;
        // console.log(awksql);
        let awk = await DB.db.prepare(awksql).all();

        for (let i in awk) {

            let row = awk[i];

            for (let key of Object.keys(row)) {
                if (key.includes('arr')) {
                    row[key] = row[key] ? JSON.parse(row[key]) : []
                }
            }

            let crow = Fn.db.prepare(`select *, JSON_GROUP_ARRAY(_id) as arr_comment_id, JSON_GROUP_ARRAY(comment) as arr_comment, JSON_GROUP_ARRAY(month) as arr_months from report_comment where month in (${months.join(',')}) AND year = ${row.year} AND dept_id = ${row.dept_id} AND mm_id = ${row.mm_id} AND item_id = ${row.item_id} AND unit_id = ${row.unit_id} AND report_type = 'full_saar' AND row_type = 'awk_type_wise' AND ((type_id IS NULL AND ${row.aawak_type_id} IS NULL) OR type_id = ${row.aawak_type_id}) AND ((subitem_id IS NULL AND ${row.subitem_id} IS NULL) OR subitem_id = ${row.subitem_id}) group by item_id`).get({ ...row, months: months.join(',') })
            if (crow) {
                console.log(crow);
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
            row.arr_comment = months.map(m => crow.arr_months.includes(m) ? crow.arr_comment[crow.arr_months.indexOf(m)] : null);
            row.arr_comment_id = months.map(m => crow.arr_months.includes(m) ? crow.arr_comment_id[crow.arr_months.indexOf(m)] : null);
            console.log("row", row);
            // fill 0 to months that are in range but not in row
            row.arr_sum_aawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_aawak[row.arr_months.indexOf(m)] : 0);
            row.arr_sum_jawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_jawak[row.arr_months.indexOf(m)] : 0);
            row.arr_sum_used = months.map(m => row.arr_months.includes(m) ? row.arr_sum_used[row.arr_months.indexOf(m)] : 0);
            // row.arr_sum_bachat = months.map(m => row.arr_months.includes(m) ? row.arr_sum_bachat[row.arr_months.indexOf(m)] : 0);
            row.arr_months = months;
            row.showTooltip = {};
            row.arr_sum_bachat = [];
            // add pichla bachat of previos month to all months bachat.
            for (let i = 0; i < row.arr_months.length; i++) {
                row.arr_sum_bachat[i] = (row.arr_sum_aawak[i] - row.arr_sum_jawak[i] - row.arr_sum_used[i]) + (i == 0 ? row.past_bachat || 0 : row.arr_sum_bachat[i - 1] || 0);
            }

            awk[i] = row;
        }

        res.json({
            success: true,
            result: bachat,
            awk: awk,
            months: months
        })
    } catch (err) {
        next(err);
    }
});

router.put('/aj_type/:dept_id', async (req, res, next) => {
    try {
        let bachat = [], months = [];
        let conditionQuery1 = `where dept_id = ${req.params.dept_id}`;
        if (req.body) {
            conditionQuery1 += `${req.body.mm_id ? ` AND aawak.mm_id = ${req.body.mm_id}` : ``} ${req.body.item_id ? ` AND aawak.item_id = ${req.body.item_id}` : ``} ${req.body.subitem_id ? ` AND aawak.subitem_id = ${req.body.subitem_id}` : ``} ${req.body.unit_id ? ` AND aawak.unit_id = ${req.body.unit_id}` : ``}`
            // conditionQuery2 += `${req.body.state_id ? ` where mm.state_id = ${req.body.state_id}` : ``} `;

        }
        months = req.body.months.sort((a, b) => a - b);
        conditionQuery1 += ` AND month in (${months.join(',')}) AND year = '${req.body.year}'`

        // let sql = DB.query.bachat_new.select_all.replace('?', conditionQuery1).replace('#', conditionQuery2);
        let sql = `select bcht.*,
            JSON_GROUP_ARRAY(bcht.month) as arr_months, 
            JSON_GROUP_ARRAY(bcht.t_a) as arr_sum_aawak, 
            JSON_GROUP_ARRAY(bcht.t_j) as arr_sum_jawak, 
            JSON_GROUP_ARRAY(bcht.t_u) as arr_sum_used,
            JSON_GROUP_ARRAY(bcht.t_b) as arr_sum_bachat,
            mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng,
            it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_icategories,
            sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_scategories,
            sl.list_name_hin, sl.list_name_eng,
            unit.unit_short, unit.unit_full,
            dept.dept_code, dept.dept_hin, dept.dept_eng from (select sum(total_aawak) as t_a, sum(jawak) as t_j, sum(used_jawak) as t_u, sum(bachat) as t_b, * from bachat_new ${conditionQuery1}        
            group by dept_id, mm_id, item_id, subitem_id, condition_id, unit_id, month, year) bcht
            left join mm on mm._id = bcht.mm_id
            left join state st on st._id = mm.state_id
            left join item it on it._id = bcht.item_id
            left join subitem sit on sit._id = bcht.subitem_id
            left join subitem_list sitl on sitl._id = sit.subitem_list_id
            left join support_list sl on sl._id = bcht.condition_id
            left join unit on unit._id = bcht.unit_id
            left join department dept on dept._id = bcht.dept_id
            group by bcht.dept_id, bcht.mm_id, bcht.item_id, bcht.subitem_id, bcht.condition_id, bcht.unit_id;`

        // console.log(sql);
        let stmt = DB.db.prepare(sql);

        for (let row of stmt.iterate({ order: 'updated_at desc' })) {

            for (let key of Object.keys(row)) {
                if (key.includes('arr')) {
                    row[key] = row[key] ? JSON.parse(row[key]) : []
                }
            }

            let past_bachat = DB.db.prepare(`select sum(bachat) as pb_qty from bachat_new where dept_id = @dept_id AND mm_id = @mm_id AND item_id = @item_id AND ((subitem_id IS NULL AND @subitem_id IS NULL) OR subitem_id = @subitem_id) AND condition_id = @condition_id AND unit_id = @unit_id AND (year < ${req.body.year} OR (year = ${req.body.year} AND month < ${months[0]}))`).get(row);

            row.past_bachat = past_bachat.pb_qty || 0;

            let crow = Fn.db.prepare(`select *, JSON_GROUP_ARRAY(_id) as arr_comment_id, JSON_GROUP_ARRAY(comment) as arr_comment, JSON_GROUP_ARRAY(month) as arr_months from report_comment where month in (${months.join(',')}) AND year = ${row.year} AND dept_id = ${row.dept_id} AND mm_id = ${row.mm_id} AND item_id = ${row.item_id} AND unit_id = ${row.unit_id} AND report_type = 'full_saar' AND row_type = 'awk_type_wise' AND ((subitem_id IS NULL AND ${row.subitem_id} IS NULL) OR subitem_id = ${row.subitem_id}) group by item_id`).get({ ...row, months: months.join(',') })
            if (crow) {
                console.log(crow);
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
            row.arr_comment = months.map(m => crow.arr_months.includes(m) ? crow.arr_comment[crow.arr_months.indexOf(m)] : null);
            row.arr_comment_id = months.map(m => crow.arr_months.includes(m) ? crow.arr_comment_id[crow.arr_months.indexOf(m)] : null);

            // fill 0 to months that are in range but not in row
            row.arr_sum_aawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_aawak[row.arr_months.indexOf(m)] : 0);
            row.arr_sum_jawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_jawak[row.arr_months.indexOf(m)] : 0);
            row.arr_sum_used = months.map(m => row.arr_months.includes(m) ? row.arr_sum_used[row.arr_months.indexOf(m)] : 0);
            row.arr_sum_bachat = months.map(m => row.arr_months.includes(m) ? row.arr_sum_bachat[row.arr_months.indexOf(m)] : 0);
            row.arr_months = months;
            row.showTooltip = {};
            // add pichla bachat of previos month to all months bachat.
            for (let i = 0; i < row.arr_sum_bachat.length; i++) {
                row.arr_sum_bachat[i] += i == 0 ? row.past_bachat || 0 : row.arr_sum_bachat[i - 1] || 0;
            }

            bachat.push(row);
        }
        res.json({
            success: true,
            result: bachat,
            months: months
        })
    } catch (err) {
        next(err);
    }
});


// post bachat_new 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            await DB.insert('bachat_new', req.body, req.params.dept_id).then((data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});

// post bachat_new 
// router.post('/import/:dept_id', async (req, res, next) => {
//     try {
//         if (req.body && req.body.length > 0) {
//             let istmt = DB.db.prepare(DB.query.bachat_new.import);
//             let ustmt = DB.db.prepare(DB.query.bachat_new.update);
//             for (let i in req.body) {
//                 if (req.body[i].yes) {
//                     if (req.body[i].status == 'insert') {
//                         let ires = istmt.run(req.body[i]);
//                         if (ires) {
//                             req.body[i].new_id = ires.lastInsertRowid;
//                         }
//                     }
//                     else if (req.body[i].status == 'update') {
//                         let ures = ustmt.run(req.body[i]);
//                         if (ures) {
//                             req.body[i].new_id == ures.lastInsertRowid;
//                         }
//                     }
//                 }
//             }
//             res.json({
//                 success: true,
//                 result: req.body
//             })
//         }
//         else {
//             return next(new Error('Please fill required fields.'))
//         }
//     } catch (err) { next(err) };
// });


// update bachat_new 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('bachat_new', req.body.set, req.body.query._id).then(async (data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});


// delete bachat_new 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('bachat_new', req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            })
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});

// delete multiple bachat_new 
router.delete('/many/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            let conditions = [];
            // conditions.push(`dept_id = ${req.params.dept_id}`)
            if (req.body.mm_id && req.body.mm_id.length > 0)
                conditions.push(`mm_id in (${req.body.mm_id.join(',')})`)
            if (req.body.item_id && req.body.item_id.length > 0)
                conditions.push(`item_id in (${req.body.item_id.join(',')})`)
            if (req.body.subitem_id && req.body.subitem_id.length > 0)
                conditions.push(`subitem_id in (${req.body.subitem_id.join(',')})`)
            if (req.body.unit_id && req.body.unit_id.length > 0)
                conditions.push(`unit_id in (${req.body.unit_id.join(',')})`)
            if (req.body.dept_id && req.body.dept_id.length > 0)
                conditions.push(`dept_id in (${req.body.dept_id.join(',')})`)
            if (req.body.condition_id && req.body.condition_id.length > 0)
                conditions.push(`condition_id in (${req.body.condition_id.join(',')})`)
            let conditionString = conditions.length > 0 ? conditions.join(' AND ') : ``;
            await DB.deleteMany('bachat_new', conditionString).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            })
        }
        else {
            return next(new Error('Body not Found.'))
        }
    } catch (err) { next(err) };
});


module.exports = router;