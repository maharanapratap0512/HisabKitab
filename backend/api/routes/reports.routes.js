const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();
const Fn = require('../models/functions');


// get country all
// router.get('/', async (req, res, next) => {
//     await DB.getList('country').then(async (data) => {
//         res.json({
//             success: true,
//             result: data.data || [],
//             total_count: (data.total_count ? data.total_count : 0),
//         });
//     });
// });



// by condition + aj_types 
router.put('/aj/:dept_id', async (req, res, next) => {
    try {
        req.body.month -= 1;
        let conditionString = `bcht.month = '${req.body.month}' AND bcht.year = '${req.body.year}' AND bcht.dept_id = ${req.params.dept_id} ${req.body.mm_id ? ` AND bcht.mm_id = ${req.body.mm_id}` : ``}`;
        let data = []
        let stmt = DB.db.prepare(`select bcht.*, json_group_array(condition_id) as condition_ids, json_group_array(bachat) as bachats,
        json_group_array(sl.list_name_hin) as condition_hin, json_group_array(sl.list_name_eng) as condition_eng, 
        mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng,
        it.item_hin, it.item_eng, it.item_code, it.categories as arr_item_categories,
        sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
        unit.unit_short, unit.unit_full,
        dept.dept_code, dept.dept_hin, dept.dept_eng from bachat_new bcht 
        left join mm on mm._id = bcht.mm_id
        left join state st on st._id = mm.state_id
        left join item it on it._id = bcht.item_id
        left join subitem sit on sit._id = bcht.subitem_id
        left join subitem_list sitl on sitl._id = sit.subitem_list_id
        left join unit on unit._id = bcht.unit_id
        left join support_list sl on sl._id = bcht.condition_id
        left join department dept on dept._id = bcht.dept_id where ${conditionString}
        group by bcht.dept_id, bcht.mm_id, bcht.item_id, bcht.subitem_id, bcht.unit_id`);
        let pbcht = DB.db.prepare(`select sum(bcht.bachat) as bachat from bachat_new bcht where dept_id = @dept_id AND mm_id = @mm_id AND item_id = @item_id AND ((subitem_id IS NULL AND @subitem_id IS NULL) OR subitem_id = @subitem_id) AND unit_id = @unit_id AND strftime('%Y-%m', bcht.year || '-' || bcht.month || '-01') < strftime('%Y-%m', ${req.body.year} || '-' || ${req.body.month} || '-01');`);
        let awkstmt = DB.db.prepare(`select aawak_type_id, sum(qty) as awk_qty,
        sl.list_name_hin as aawak_type_hin, sl.list_name_eng as aawak_type_eng from aawak
        left join support_list sl on sl._id = aawak.aawak_type_id
        where dept_id = @dept_id AND mm_id = @mm_id AND item_id = @item_id AND ((subitem_id IS NULL AND @subitem_id IS NULL) OR subitem_id = @subitem_id) AND unit_id = @unit_id AND strftime('%Y', aawak.date) = '${req.body.year}'
        AND strftime('%m', aawak.date) = '${req.body.month}' group by aawak_type_id;`);
        let jwkstmt = DB.db.prepare(`select jawak_type_id, sum(qty) as jwk_qty,
        sl.list_name_hin as jawak_type_hin, sl.list_name_eng as jawak_type_eng from jawak
        left join support_list sl on sl._id = jawak.jawak_type_id
        where dept_id = @dept_id AND mm_id = @mm_id AND item_id = @item_id AND ((subitem_id IS NULL AND @subitem_id IS NULL) OR subitem_id = @subitem_id) AND unit_id = @unit_id AND strftime('%Y', jawak.date) = '@year'
        AND strftime('%m', jawak.date) = '@month' group by jawak_type_id `);

        let condition_ids, condition_hin, condition_eng, bachats;
        for (let row of stmt.iterate()) {
            condition_ids = row.condition_ids ? JSON.parse(row.condition_ids) : []
            condition_hin = row.condition_hin ? JSON.parse(row.condition_hin) : []
            condition_eng = row.condition_eng ? JSON.parse(row.condition_eng) : []
            bachats = row.bachats ? JSON.parse(row.bachats) : []
            // arr_item_categories = row.arr_item_categories ? JSON.parse(row.arr_item_categories) : []
            arr_subitem_categories = row.arr_subitem_categories ? JSON.parse(row.arr_subitem_categories) : []
            row.condition_ids = condition_ids;
            row.condition_hin = condition_hin;
            row.condition_eng = condition_eng;
            row.bachats = bachats;

            let aawak = awkstmt.all(row);
            let jawak = jwkstmt.all(row);
            let past_bachat = pbcht.get(row);
            let awklength = aawak.length;
            let jwklength = jawak.length;

            row.p_bachat = past_bachat && past_bachat.bachat ? past_bachat.bachat : 0;

            row.total_awk_qty = 0;
            row.total_jwk_qty = 0;
            for (let i = 0; i < awklength; i++) {
                row.total_awk_qty += aawak[i].awk_qty;
            }
            for (let i = 0; i < jwklength; i++) {
                row.total_jwk_qty += jawak[i].jwk_qty;
            }
            // for (let i = 0; i < maxLength; i++) {
            //     let obj = {
            //         _id: row._id,
            //         aawak_type_id: null,
            //         aawak_type_hin: null,
            //         aawak_type_eng: null,
            //         awk_qty: null,
            //         jawak_type_id: null,
            //         jawak_type_hin: null,
            //         jawak_type_eng: null,
            //         jwk_qty: null,
            //     }


            //     for (const key in (i < awklength ? aawak[i] : {})) {
            //         obj[key] = aawak[i][key];
            //     }

            //     for (const key in (i < jwklength ? jawak[i] : {})) {
            //         obj[key] = jawak[i][key];
            //     }

            //     aj.push(obj);

            // }
            data.push({ ...row, awk: aawak, jwk: jawak });
        }

        res.json({
            success: true,
            data: data
        })
    } catch (err) { next(err) };
});


// by pbk 
router.put('/pbk/', async (req, res, next) => {
    try {
        let conditionString = `1=1`;
        conditionString += `${req.body.pbk_id ? ` AND pbk_id = ${req.body.pbk_id}` : ``}`
        let query = DB.query.reports.pbk.replace('?', (conditionString.trim() != `1=1` ? `where ` + conditionString : ``));
        console.log(query);
        let stmt = DB.db.prepare(query);
        res.json({
            result: stmt.all()
        })
    } catch (err) { next(err) };
});


// by aawak type wise saar 
router.put('/awk_type_saar/', async (req, res, next) => {
    try {
        let reportData = [], months = [], monthsString = [];
        let conditionString = `1=1 ${req.body.year ? ` AND strftime('%Y', date) = '${req.body.year}'` : ``}`;
        if (req.body.months && req.body.months.length > 0) {
            monthsString = Fn.sortAndFillMonthsString(req.body.months);
            months = Fn.sortAndFillMonths(req.body.months);
            conditionString += ` AND strftime('%m', date) in (${Fn.join(monthsString)})`
        }
        let sql = `select JSON_GROUP_ARRAY(awk.month) as arr_months, 
        JSON_GROUP_ARRAY(awk.sum_qty) as arr_sum_qty, 
        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
        sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
        sl.list_name_hin as aawak_type_hin, sl.list_name_eng as aawak_type_eng,
        unit.unit_short, unit.unit_full,
        department.dept_hin, department.dept_eng, department.dept_code
        from (select sum(qty) as sum_qty, strftime('%Y', date) as year, strftime('%m', date) as month, * from aawak 
        where ${conditionString} group by dept_id, item_id, subitem_id, unit_id, aawak_type_id, month ) awk
        left join item it on it._id = awk.item_id 
        left join subitem sit on sit._id = awk.subitem_id
        left join subitem_list sitl on sitl._id = sit.subitem_list_id
        left join unit on unit._id = awk.unit_id
        left join department on department._id = awk.dept_id
        left join support_list sl on sl._id = awk.aawak_type_id
        group by awk.dept_id, awk.item_id, awk.subitem_id, awk.unit_id, awk.aawak_type_id`;
        console.log(sql);
        let stmt = DB.db.prepare(sql);
        for (let row of stmt.iterate()) {
            for (let key of Object.keys(row)) {
                if (key.includes('arr')) {
                    row[key] = row[key] ? JSON.parse(row[key]) : []
                }
            }
            row.arr_sum_qty = monthsString.map(m => row.arr_months.includes(m) ? row.arr_sum_qty[row.arr_months.indexOf(m)] : 0);
            row.arr_months = monthsString
            reportData.push(row)
        }
        res.json({
            result: reportData,
            months: months,
            success: true
        })
    } catch (err) {
        console.log(err);
        next(err)
    };
});

// by jawak type wise saar 
router.put('/jwk_type_saar/', async (req, res, next) => {
    try {
        let reportData = [], months = [], monthsString = [];
        let conditionString = `1=1 ${req.body.year ? ` AND strftime('%Y', date) = '${req.body.year}'` : ``}`;
        if (req.body.months && req.body.months.length > 0) {
            monthsString = Fn.sortAndFillMonthsString(req.body.months);
            months = Fn.sortAndFillMonths(req.body.months);
            conditionString += ` AND strftime('%m', date) in (${Fn.join(monthsString)})`
        }
        let sql = `select JSON_GROUP_ARRAY(jwk.month) as arr_months, 
        JSON_GROUP_ARRAY(jwk.sum_qty) as arr_sum_qty, 
        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
        sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
        sl.list_name_hin as jawak_type_hin, sl.list_name_eng as jawak_type_eng,
        unit.unit_short, unit.unit_full,
        department.dept_hin, department.dept_eng, department.dept_code
        from (select sum(qty) as sum_qty, strftime('%Y', date) as year, strftime('%m', date) as month, * from jawak 
        where ${conditionString} group by dept_id, item_id, subitem_id, unit_id, jawak_type_id, month ) jwk
        left join item it on it._id = jwk.item_id 
        left join subitem sit on sit._id = jwk.subitem_id
        left join subitem_list sitl on sitl._id = sit.subitem_list_id
        left join unit on unit._id = jwk.unit_id
        left join department on department._id = jwk.dept_id
        left join support_list sl on sl._id = jwk.jawak_type_id
        group by jwk.dept_id, jwk.item_id, jwk.subitem_id, jwk.unit_id, jwk.jawak_type_id`;
        console.log(sql);
        let stmt = DB.db.prepare(sql);
        for (let row of stmt.iterate()) {
            for (let key of Object.keys(row)) {
                if (key.includes('arr')) {
                    row[key] = row[key] ? JSON.parse(row[key]) : []
                }
            }
            row.arr_sum_qty = monthsString.map(m => row.arr_months.includes(m) ? row.arr_sum_qty[row.arr_months.indexOf(m)] : 0);
            row.arr_months = monthsString
            reportData.push(row)
        }
        res.json({
            result: reportData,
            months: months,
            success: true
        })
    } catch (err) {
        console.log(err);
        next(err)
    };
});

// by Store Stock 
router.put('/report_store_stock/:dept_id', async (req, res, next) => {
    try {

        let conditionString = `bachat.dept_id = ${req.params.dept_id} ${req.body.mm_id ? ` AND bachat.mm_id in (${req.body.mm_id.join(",")})` : ``}`;
        let havingString = ``;
        for (let cn of req.body.condition) {
            havingString += havingString == `` ? `${cn} <> 0` : ` OR ${cn} <> 0`;
        }
        let sql = `select bachat.*, sum(New) as New, sum(Old) as Old, 
        sum(Defective) as Defective, sum(Repairing) as Repairing, sum(Scrap) as Scrap,
        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.categories as arr_item_categories,
        sitl.subitem_hin, sitl.subitem_eng, sit.categories as arr_subitem_categories,
        unit.unit_short, unit.unit_full,
        department.dept_hin, department.dept_eng, department.dept_code
        from bachat
        left join item it on it._id = bachat.item_id 
        left join subitem sit on sit._id = bachat.subitem_id
        left join subitem_list sitl on sitl._id = sit.subitem_list_id
        left join unit on unit._id = bachat.unit_id
        left join department on department._id = bachat.dept_id where ${conditionString} 
        group by bachat.dept_id, bachat.item_id, bachat.subitem_id, bachat.unit_id 
        ${havingString.trim() != ``? `having ${havingString}` : ``}`;
        console.log(sql);
        let stmt = DB.db.prepare(sql);

        res.json({
            result: stmt.all(),
            success: true
        })
    } catch (err) {
        console.log(err);
        next(err)
    };
});



// delete country 
// router.delete('/:id', async (req, res, next) => {
//     if (req.params.id) {
//         await DB.delete('country', req.params.id).then((data) => {
//             res.json({
//                 success: true,
//                 result: data
//             });
//         });
//     }
//     else {
//         return next(new Error('Id not found.'))
//     }
// });


module.exports = router;