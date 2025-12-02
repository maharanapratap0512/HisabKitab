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

// Improved get filtered bachat_new with date range support
router.put('/filter/:dept_id', async (req, res, next) => {
    try {
        let bachat = [], bcht_new = [], months = [];
        let conditionQuery1 = `where bn.dept_id = ${req.params.dept_id}`;
        let conditionQuery2 = ``;

        if (req.body) {
            conditionQuery1 += `${req.body.mm_id ? ` AND bn.mm_id = ${req.body.mm_id}` : ``} ${req.body.item_id ? ` AND bn.item_id = ${req.body.item_id}` : ``} ${req.body.subitem_id ? ` AND bn.subitem_id = ${req.body.subitem_id}` : ``}`
            conditionQuery2 += `${req.body.state_id ? ` where mm.state_id = ${req.body.state_id}` : ``} `;
        }

        // Handle date range instead of single year and months array
        if (req.body.from_year && req.body.from_month && req.body.to_year && req.body.to_month) {
            months = generateMonthsBetween(parseInt(req.body.from_year), parseInt(req.body.from_month), parseInt(req.body.to_year), parseInt(req.body.to_month));

            // Create condition for date range
            const dateConditions = [];
            for (let i = 0; i < months.length; i++) {
                const year = req.body.from_year + Math.floor((req.body.from_month + i - 1) / 12);
                const month = ((req.body.from_month + i - 1) % 12) + 1;
                dateConditions.push(`(year = ${year} AND month = ${month})`);
            }
            conditionQuery1 += ` AND (${dateConditions.join(' OR ')})`;

            let conditionQuery3 = `where dept_id = ${req.params.dept_id} ${req.body.mm_id ? ` AND mm_id = ${req.body.mm_id}` : ``} ${req.body.item_id ? ` AND item_id = ${req.body.item_id}` : ``} ${req.body.subitem_id ? ` AND subitem_id = ${req.body.subitem_id}` : ``}`;
            conditionQuery3 += ` AND (year < ${req.body.from_year} OR (year = ${req.body.from_year} AND month < ${req.body.from_month}))`;

            let sql1 = `select bcht.*,
            JSON_GROUP_ARRAY(bcht.month) as arr_months,
            JSON_GROUP_ARRAY(bcht.t_a) as arr_sum_aawak,
            JSON_GROUP_ARRAY(bcht.t_j) as arr_sum_jawak,
            JSON_GROUP_ARRAY(bcht.t_u) as arr_sum_used,
            JSON_GROUP_ARRAY(bcht.t_b) as arr_sum_bachat,
            JSON_GROUP_ARRAY(bcht.past_bachat) as arr_past_bachat,
            mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng,
            it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
            sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
            slcn.list_name_hin as condition_hin, slcn.list_name_eng as condition_eng,
            unit.unit_short, unit.unit_full,
            dept.dept_code, dept.dept_hin, dept.dept_eng from (select round(sum(total_aawak), 2) as t_a, round(sum(jawak), 2) as t_j, round(sum(used_jawak), 2) as t_u, round(sum(bachat), 2) as t_b, * from
            (select MAX(printf('%04d-%02d', year, month)) as year_month, * from bachat_new ${conditionQuery3}
            group by mm_id, item_id, subitem_id, unit_id, dept_id, condition_id) bn
            group by bn.dept_id, bn.mm_id, bn.item_id, bn.subitem_id, bn.condition_id, bn.unit_id, bn.year, bn.month order by bn.year, bn.month) bcht
            left join mm on mm._id = bcht.mm_id
            left join state st on st._id = mm.state_id
            left join item it on it._id = bcht.item_id
            left join subitem sit on sit._id = bcht.subitem_id
            left join support_list slcn on slcn._id = bcht.condition_id
            left join subitem_list sitl on sitl._id = sit.subitem_list_id
            left join unit on unit._id = bcht.unit_id
            left join report_comment rc on rc.dept_id = bcht.dept_id AND rc.mm_id = bcht.mm_id AND rc.item_id = bcht.item_id AND ((rc.subitem_id IS NULL AND bcht.subitem_id IS NULL) OR rc.subitem_id = bcht.subitem_id) AND rc.unit_id = bcht.unit_id AND rc.month IS NULL AND rc.year = bcht.year AND rc.type_id IS NULL
            left join department dept on dept._id = bcht.dept_id ${conditionQuery2}
            group by bcht.dept_id, bcht.mm_id, bcht.item_id, bcht.subitem_id, bcht.condition_id, bcht.unit_id, bcht.year;`

            let stmtN = DB.db.prepare(sql1);

            for (let row of stmtN.iterate({ order: 'updated_at desc' })) {
                for (let key of Object.keys(row)) {
                    if (key.includes('arr')) {
                        row[key] = row[key] ? JSON.parse(row[key]) : []
                    }
                }

                let crow = Fn.db.prepare(`select *, JSON_GROUP_ARRAY(_id) as arr_comment_id, JSON_GROUP_ARRAY(comment) as arr_comment, JSON_GROUP_ARRAY(month) as arr_months from report_comment where month in (${months.join(',')}) AND year = ${row.year} AND dept_id = ${row.dept_id} AND mm_id = ${row.mm_id} AND item_id = ${row.item_id} AND unit_id = ${row.unit_id} AND report_type = 'full_saar' AND row_type = 'main_row' AND ((subitem_id IS NULL AND ${row.subitem_id} IS NULL) OR subitem_id = ${row.subitem_id}) group by item_id`).get({ ...row, months: months.join(',') })
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
                row.arr_comment = months.map(m => crow.arr_months.includes(m) ? crow.arr_comment[crow.arr_months.indexOf(m)] : null);
                row.arr_comment_id = months.map(m => crow.arr_months.includes(m) ? crow.arr_comment_id[crow.arr_months.indexOf(m)] : null);

                // Fill 0 to months that are in range but not in row
                row.arr_sum_aawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_aawak[row.arr_months.indexOf(m)] : 0);
                row.arr_sum_jawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_jawak[row.arr_months.indexOf(m)] : 0);
                row.arr_sum_used = months.map(m => row.arr_months.includes(m) ? row.arr_sum_used[row.arr_months.indexOf(m)] : 0);
                row.arr_sum_bachat = months.map(m => row.arr_months.includes(m) ? row.arr_sum_bachat[row.arr_months.indexOf(m)] : 0);
                row.arr_past_bachat = months.map(m => row.arr_months.includes(m) ? row.arr_past_bachat[row.arr_months.indexOf(m)] : null);

                row.arr_months = months;
                row.showTooltip = {};

                // Calculate cumulative bachat across the entire date range
                for (let i = 0; i < row.arr_sum_bachat.length; i++) {
                    if (i == 0) {
                        if (row.arr_past_bachat[0] == null) {
                            row.arr_past_bachat = row.past_bachat || 0;
                        }
                    } else {
                        row.arr_past_bachat[i] = row.arr_past_bachat[i] == null ? (row.arr_past_bachat[i - 1] + row.arr_sum_bachat[i - 1] || 0) : row.arr_past_bachat[i];
                    }
                    row.arr_sum_bachat[i] = Number((row.arr_sum_bachat[i] + row.arr_past_bachat[i]).toFixed(2));
                }

                // Filter row based on category
                if (!req.body.category_id || (req.body.category_id && ((row.arr_subitem_categories && row.arr_subitem_categories.includes(req.body.category_id)) || (!row.arr_subitem_categories && row.arr_item_categories.includes(req.body.category_id))))) {
                    bcht_new.push(row);
                }
            }

            let sql = `select bcht.*,
            JSON_GROUP_ARRAY(bcht.month) as arr_months,
            JSON_GROUP_ARRAY(bcht.t_a) as arr_sum_aawak,
            JSON_GROUP_ARRAY(bcht.t_j) as arr_sum_jawak,
            JSON_GROUP_ARRAY(bcht.t_u) as arr_sum_used,
            JSON_GROUP_ARRAY(bcht.t_b) as arr_sum_bachat,
            mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng,
            it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
            sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
            unit.unit_short, unit.unit_full,
            dept.dept_code, dept.dept_hin, dept.dept_eng from (select sum(total_aawak) as t_a, sum(jawak) as t_j, sum(used_jawak) as t_u, sum(bachat) as t_b, * from bachat_new bn
            ${conditionQuery1}
            group by bn.dept_id, bn.mm_id, bn.item_id, bn.subitem_id, bn.unit_id, bn.month, bn.year order by bn.year, bn.month) bcht
            left join mm on mm._id = bcht.mm_id
            left join state st on st._id = mm.state_id
            left join item it on it._id = bcht.item_id
            left join subitem sit on sit._id = bcht.subitem_id
            left join subitem_list sitl on sitl._id = sit.subitem_list_id
            left join unit on unit._id = bcht.unit_id
            left join report_comment rc on rc.dept_id = bcht.dept_id AND rc.mm_id = bcht.mm_id AND rc.item_id = bcht.item_id AND ((rc.subitem_id IS NULL AND bcht.subitem_id IS NULL) OR rc.subitem_id = bcht.subitem_id) AND rc.unit_id = bcht.unit_id AND rc.month IS NULL AND rc.year = bcht.year AND rc.type_id IS NULL
            left join department dept on dept._id = bcht.dept_id ${conditionQuery2}
            group by bcht.dept_id, bcht.mm_id, bcht.item_id, bcht.subitem_id, bcht.unit_id;`

            let stmt = DB.db.prepare(sql);

            for (let row of stmt.iterate({ order: 'updated_at desc' })) {
                for (let key of Object.keys(row)) {
                    if (key.includes('arr')) {
                        row[key] = row[key] ? JSON.parse(row[key]) : []
                    }
                }

                // Calculate past bachat for the entire range
                let past_bachat = DB.db.prepare(`select sum(bachat) as pb_qty from bachat_new where dept_id = @dept_id AND mm_id = @mm_id AND item_id = @item_id AND ((subitem_id IS NULL AND @subitem_id IS NULL) OR subitem_id = @subitem_id) AND unit_id = @unit_id AND (year < ${req.body.from_year} OR (year = ${req.body.from_year} AND month < ${req.body.from_month}))`).get(row);
                row.pb = past_bachat.pb_qty || 0;

                let crow = Fn.db.prepare(`select *, JSON_GROUP_ARRAY(_id) as arr_comment_id, JSON_GROUP_ARRAY(comment) as arr_comment, JSON_GROUP_ARRAY(month) as arr_months from report_comment where month in (${months.join(',')}) AND year = ${row.year} AND dept_id = ${row.dept_id} AND mm_id = ${row.mm_id} AND item_id = ${row.item_id} AND unit_id = ${row.unit_id} AND report_type = 'full_saar' AND row_type = 'main_row' AND ((subitem_id IS NULL AND ${row.subitem_id} IS NULL) OR subitem_id = ${row.subitem_id}) group by item_id`).get({ ...row, months: months.join(',') })
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
                row.arr_comment = months.map(m => crow.arr_months.includes(m) ? crow.arr_comment[crow.arr_months.indexOf(m)] : null);
                row.arr_comment_id = months.map(m => crow.arr_months.includes(m) ? crow.arr_comment_id[crow.arr_months.indexOf(m)] : null);

                // Fill 0 to months that are in range but not in row
                row.arr_sum_aawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_aawak[row.arr_months.indexOf(m)] : 0);
                row.arr_sum_jawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_jawak[row.arr_months.indexOf(m)] : 0);
                row.arr_sum_used = months.map(m => row.arr_months.includes(m) ? row.arr_sum_used[row.arr_months.indexOf(m)] : 0);
                row.arr_sum_bachat = months.map(m => row.arr_months.includes(m) ? row.arr_sum_bachat[row.arr_months.indexOf(m)] : 0);
                row.arr_months = months;
                row.showTooltip = {};

                // Calculate cumulative bachat across the entire date range
                for (let i = 0; i < row.arr_sum_bachat.length; i++) {
                    row.arr_sum_bachat[i] += i == 0 ? row.past_bachat || 0 : row.arr_sum_bachat[i - 1] || 0;
                }

                // Filter row based on category
                if (!req.body.category_id || (req.body.category_id && ((row.arr_subitem_categories && row.arr_subitem_categories.includes(req.body.category_id)) || (!row.arr_subitem_categories && row.arr_item_categories.includes(req.body.category_id))))) {
                    bachat.push(row);
                }
            }
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
