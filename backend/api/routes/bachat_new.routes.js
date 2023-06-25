const router = require('express').Router();
const DBContex = require('../models/DBContex');
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

// get filtered bachat_new 
router.put('/filter/:dept_id', async (req, res, next) => {
    try {
        let bachat = [], months = [];
        let conditionQuery1 = `where dept_id = ${req.params.dept_id}`;
        let conditionQuery2 = ``;
        if (req.body) {
            conditionQuery1 += `${req.body.mm_id ? ` AND bachat_new.mm_id = ${req.body.mm_id}` : ``} ${req.body.item_id ? ` AND bachat_new.item_id = ${req.body.item_id}` : ``} ${req.body.subitem_id ? ` AND bachat_new.subitem_id = ${req.body.subitem_id}` : ``}`
            conditionQuery2 += `${req.body.state_id ? ` where mm.state_id = ${req.body.state_id}` : ``} `;

        }
        if (req.body.months && req.body.months.length > 0) {
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
            it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
            sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
            unit.unit_short, unit.unit_full,
            dept.dept_code, dept.dept_hin, dept.dept_eng from (select sum(total_aawak) as t_a, sum(jawak) as t_j, sum(used_jawak) as t_u, sum(bachat) as t_b, * from bachat_new ${conditionQuery1}        
            group by dept_id, mm_id, item_id, subitem_id, unit_id, month, year) bcht
            left join mm on mm._id = bcht.mm_id
            left join state st on st._id = mm.state_id
            left join item it on it._id = bcht.item_id
            left join subitem sit on sit._id = bcht.subitem_id
            left join subitem_list sitl on sitl._id = sit.subitem_list_id
            left join unit on unit._id = bcht.unit_id
            left join department dept on dept._id = bcht.dept_id ${conditionQuery2}
            group by bcht.dept_id, bcht.mm_id, bcht.item_id, bcht.subitem_id, bcht.unit_id;`

            // console.log(sql);
            let stmt = DB.db.prepare(sql);

            for (let row of stmt.iterate({ order: 'updated_at desc' })) {

                for (let key of Object.keys(row)) {
                    if (key.includes('arr')) {
                        row[key] = row[key] ? JSON.parse(row[key]) : []
                    }
                }

                // console.log(months, months[0], months[0].toString().padStart(2, "0"))
                // console.log(`Select sum(bachat) as past_bachat from bachat_new where dept_id = @dept_id AND mm_id = @mm_id AND item_id = @item_id AND ((subitem_id IS NULL AND @subitem_id IS NULL) OR subitem_id = @subitem_id) AND unit_id = @unit_id AND strftime('%Y-%m', year || '-' || month || '-01') < strftime('%Y-%m', '${req.body.year}' || '-' || '${months[0].toString().padStart(2, "0")}' || '-01')`);
                // finding pichla bachat
                let past_bachat = DB.db.prepare(`select sum(bachat) as pb_qty from bachat_new where dept_id = @dept_id AND mm_id = @mm_id AND item_id = @item_id AND ((subitem_id IS NULL AND @subitem_id IS NULL) OR subitem_id = @subitem_id) AND unit_id = @unit_id AND (year < ${req.body.year} OR (year = ${req.body.year} AND month < ${months[0]}))`).get(row);

                row.past_bachat = past_bachat.pb_qty || 0;

                // // console.log(row);
                // let aawak = [], jawak = [], used = [], bcht = []
                // // row.arr_months = row.arr_months.map(m => months.find(month => month.m === m)).filter(Boolean);
                // for (let i in months) {
                //     let mindex = null;
                //     for (let j in row.arr_months) {
                //         if (row.arr_months[j] == months[i].m) {
                //             mindex = j;
                //             break;
                //         }
                //     }

                //     if (mindex) {
                //         aawak.push(row.arr_sum_aawak[mindex]);
                //         jawak.push(row.arr_sum_jawak[mindex]);
                //         used.push(row.arr_sum_used[mindex]);
                //         bcht.push(row.arr_sum_bachat[mindex]);
                //     } else {
                //         aawak.push(0);
                //         jawak.push(0);
                //         used.push(0);
                //         bcht.push(0);
                //     }
                // }
                // row.arr_months = months.map(m=>m.m);
                // row.arr_sum_aawak = aawak;
                // row.arr_sum_jawak = jawak;
                // row.arr_sum_used = used;
                // row.arr_sum_bachat = bcht;
                

                // fill 0 to months that are in range but not in row
                row.arr_sum_aawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_aawak[row.arr_months.indexOf(m)] : 0);
                row.arr_sum_jawak = months.map(m => row.arr_months.includes(m) ? row.arr_sum_jawak[row.arr_months.indexOf(m)] : 0);
                row.arr_sum_used = months.map(m => row.arr_months.includes(m) ? row.arr_sum_used[row.arr_months.indexOf(m)] : 0);
                row.arr_sum_bachat = months.map(m => row.arr_months.includes(m) ? row.arr_sum_bachat[row.arr_months.indexOf(m)] : 0);
                row.arr_months = months;

                // add pichla bachat of previos month to all months bachat.
                for (let i = 0; i < row.arr_sum_bachat.length; i++) {
                    row.arr_sum_bachat[i] += i == 0 ? row.past_bachat || 0 : row.arr_sum_bachat[i - 1] || 0;
                }

                // filter row based on category
                if (!req.body.category_id || (req.body.category_id && ((row.arr_subitem_categories && row.arr_subitem_categories.includes(req.body.category_id)) || (!row.arr_subitem_categories && row.arr_item_categories.includes(req.body.category_id))))) {
                    bachat.push(row);
                }
            }
        } else {
            let sql = DB.query.bachat_new.select_all.replace('?', conditionQuery1).replace('#', conditionQuery2);
            let stmt = DB.db.prepare(sql);
            for (let row of stmt.iterate({ order: 'updated_at desc' })) {
                for (let key of Object.keys(row)) {
                    if (key.includes('arr')) {
                        row[key] = row[key] ? JSON.parse(row[key]) : []
                    }
                }
                if (!req.body.category_id || (req.body.category_id && ((row.arr_subitem_categories && row.arr_subitem_categories.includes(req.body.category_id)) || (!row.arr_subitem_categories && row.arr_item_categories.includes(req.body.category_id))))) {
                    bachat.push(row);
                }
            }
        }
        res.json({
            success: true,
            result: bachat,
            months: months
        })
    } catch (err) { console.log(err); next(err) };
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


module.exports = router;