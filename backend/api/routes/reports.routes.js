const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const Fn = require('../database/functions');

global.pdfProgress = global.pdfProgress || {};

router.get('/pdf-progress/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const status = global.pdfProgress[taskId] || { status: 'Preparing request...' };
    res.json(status);
});

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
router.put('/item_ledger/:dept_id', async (req, res, next) => {
    try {
        let from_month = parseInt(req.body.from.m);
        let from_year = req.body.from.y;
        let to_month = parseInt(req.body.to.m);
        let to_year = req.body.to.y;
        let bachatMonth = to_month - 1;

        let from_str = `${from_year}-${from_month.toString().padStart(2, '0')}`;
        let to_str = `${to_year}-${to_month.toString().padStart(2, '0')}`;

        let dept_id = req.params.dept_id;
        let mm_id = req.body.mm_id;
        let item_subitem_ids = req.body.item_subitem_ids || [];

        let reportData = [];

        let awkstmt = DB.db.prepare(`select aawak.*, mm.mm_hin as aawak_mm_hin, sl.list_name_hin as aawak_type_hin,
        sl2.list_name_hin as condition_hin, sl3.list_name_hin as aawak_source_hin, sl4.list_name_hin as usage_list_hin,
        unit.unit_short, pbk.pbk_hin, pbk.roll_no
        from aawak 
        left join mm on mm._id = aawak.aawak_mm_id
        left join support_list sl on sl._id = aawak.aawak_type_id
        left join support_list sl2 on sl2._id = aawak.condition_id
        left join support_list sl3 on sl3._id = aawak.aawak_source_id
        left join support_list sl4 on sl4._id = aawak.usage_list_id
        left join unit on unit._id = aawak.unit_id
        left join pbk on pbk._id = aawak.pbk_id
        where aawak.dept_id = @dept_id 
        ${mm_id ? `AND aawak.mm_id = ${mm_id}` : ''} 
        AND aawak.item_id = @item_id AND ((aawak.subitem_id IS NULL AND @subitem_id IS NULL) OR aawak.subitem_id = @subitem_id) 
        AND strftime('%Y-%m', aawak.date) >= '${from_str}' AND strftime('%Y-%m', aawak.date) <= '${to_str}'
        order by aawak.date asc`);

        let jwkstmt = DB.db.prepare(`select jawak.*, mm.mm_hin as jawak_mm_hin, sl.list_name_hin as jawak_type_hin,
        sl2.list_name_hin as condition_hin, sl3.list_name_hin as aawak_source_hin, sl4.list_name_hin as usage_list_hin,
        unit.unit_short, pbk.pbk_hin, pbk.roll_no
        from jawak 
        left join mm on mm._id = jawak.jawak_mm_id
        left join support_list sl on sl._id = jawak.jawak_type_id
        left join support_list sl2 on sl2._id = jawak.condition_id
        left join support_list sl3 on sl3._id = jawak.aawak_source_id
        left join support_list sl4 on sl4._id = jawak.usage_list_id
        left join unit on unit._id = jawak.unit_id
        left join pbk on pbk._id = jawak.pbk_id
        where jawak.dept_id = @dept_id 
        ${mm_id ? `AND jawak.mm_id = ${mm_id}` : ''} 
        AND jawak.item_id = @item_id AND ((jawak.subitem_id IS NULL AND @subitem_id IS NULL) OR jawak.subitem_id = @subitem_id) 
        AND strftime('%Y-%m', jawak.date) >= '${from_str}' AND strftime('%Y-%m', jawak.date) <= '${to_str}'
        order by jawak.date asc`);

        let pastBachatStmt = DB.db.prepare(`select sum(IFNULL(bcht.past_bachat, 0)) as past_bachat from bachat_new bcht 
        where bcht.dept_id = @dept_id 
        ${mm_id ? `AND bcht.mm_id = ${mm_id}` : ''} 
        AND bcht.item_id = @item_id AND ((bcht.subitem_id IS NULL AND @subitem_id IS NULL) OR bcht.subitem_id = @subitem_id) 
        AND CAST(bcht.year AS INTEGER) = ${from_year} AND CAST(bcht.month AS INTEGER) = ${from_month}`);

        for (let item of item_subitem_ids) {
            let rowParams = {
                dept_id: dept_id,
                item_id: item.item_id,
                subitem_id: item.subitem_id || null
            };

            let aawaks = awkstmt.all(rowParams);
            let jawaks = jwkstmt.all(rowParams);
            
            let pastBachatRow = pastBachatStmt.get(rowParams);
            let past_bachat = (pastBachatRow && pastBachatRow.past_bachat !== null) ? pastBachatRow.past_bachat : null;
            if (past_bachat === null) {
                let fallbackPastBachat = DB.db.prepare(`select sum(latest_val) as past_bachat from (
                    select (IFNULL(bn.past_bachat, 0) + IFNULL(bn.bachat, 0)) as latest_val
                    from bachat_new bn
                    inner join (
                        select IFNULL(condition_id, 0) as cond_id, IFNULL(unit_id, 0) as u_id, MAX(CAST(year AS INTEGER) * 12 + CAST(month AS INTEGER)) as max_period
                        from bachat_new
                        where dept_id = @dept_id
                        ${mm_id ? `AND mm_id = ${mm_id}` : ''}
                        AND item_id = @item_id
                        AND ((subitem_id IS NULL AND @subitem_id IS NULL) OR subitem_id = @subitem_id)
                        AND (CAST(year AS INTEGER) * 12 + CAST(month AS INTEGER)) < (${from_year} * 12 + ${from_month})
                        group by IFNULL(condition_id, 0), IFNULL(unit_id, 0)
                    ) latest on IFNULL(bn.condition_id, 0) = latest.cond_id 
                            and IFNULL(bn.unit_id, 0) = latest.u_id 
                            and (CAST(bn.year AS INTEGER) * 12 + CAST(bn.month AS INTEGER)) = latest.max_period
                    where bn.dept_id = @dept_id
                    ${mm_id ? `AND bn.mm_id = ${mm_id}` : ''}
                    AND bn.item_id = @item_id
                    AND ((bn.subitem_id IS NULL AND @subitem_id IS NULL) OR bn.subitem_id = @subitem_id)
                )`).get(rowParams);
                past_bachat = (fallbackPastBachat && fallbackPastBachat.past_bachat !== null) ? fallbackPastBachat.past_bachat : 0;
            }

            let total_aawak = aawaks.reduce((sum, a) => sum + (a.qty || 0), 0);
            let total_jawak = jawaks.reduce((sum, j) => sum + (j.qty || 0), 0);
            let current_bachat = past_bachat + total_aawak - total_jawak;
            let unit_short = aawaks.length > 0 ? aawaks[0].unit_short : (jawaks.length > 0 ? jawaks[0].unit_short : '');
            
            if (!unit_short) {
                let unitRow = DB.db.prepare(`select unit.unit_short from item left join unit on unit._id = item.unit_id where item._id = @item_id`).get(rowParams);
                unit_short = unitRow ? unitRow.unit_short : '';
            }


            // Prepend past bachat / opening balance as first row in aawak
            let past_bachat_obj = {
                date: `${from_year}-${from_month.toString().padStart(2, '0')}-01`,
                lot_no: '-',
                aawak_mm_hin: 'पिछली बचत (Opening Balance)',
                condition_hin: '-',
                qty: past_bachat,
                unit_short: unit_short,
                aawak_type_hin: 'शुरुआती स्टॉक',
                rate: 0,
                actual_amt: 0,
                description: 'Past Bachat / Opening Balance'
            };
            aawaks.unshift(past_bachat_obj);

            reportData.push({
                item_id: item.item_id,
                subitem_id: item.subitem_id,
                item_hin: item.item_hin,
                item_eng: item.item_eng,
                subitem_hin: item.subitem_hin,
                subitem_eng: item.subitem_eng,
                unit_short: unit_short,
                overview: {
                    past_bachat: past_bachat,
                    total_aawak: total_aawak,
                    total_jawak: total_jawak,
                    current_bachat: current_bachat
                },
                aawaks: aawaks,
                jawaks: jawaks
            });
        }

        res.json({
            success: true,
            data: reportData
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
});

const itemLedgerPdf = require('../services/item-ledger-pdf.service');
const mmTable = new (require('../database/base.table'))('mm');

router.post('/item_ledger_pdf/:dept_id', async (req, res, next) => {
    try {
        let from_month = parseInt(req.body.from.m);
        let from_year = req.body.from.y;
        let to_month = parseInt(req.body.to.m);
        let to_year = req.body.to.y;

        let from_str = `${from_year}-${from_month.toString().padStart(2, '0')}`;
        let to_str = `${to_year}-${to_month.toString().padStart(2, '0')}`;

        let dept_id = req.params.dept_id;
        let mm_id = req.body.mm_id;
        let item_subitem_ids = req.body.item_subitem_ids || [];
        let taskId = req.body.taskId;

        if (taskId) global.pdfProgress[taskId] = { status: 'Fetching database records...' };

        let reportData = [];

        let awkstmt = DB.db.prepare(`select aawak.*, mm.mm_hin as aawak_mm_hin, sl.list_name_hin as aawak_type_hin,
        sl2.list_name_hin as condition_hin, sl3.list_name_hin as aawak_source_hin, sl4.list_name_hin as usage_list_hin,
        unit.unit_short, pbk.pbk_hin, pbk.roll_no
        from aawak 
        left join mm on mm._id = aawak.aawak_mm_id
        left join support_list sl on sl._id = aawak.aawak_type_id
        left join support_list sl2 on sl2._id = aawak.condition_id
        left join support_list sl3 on sl3._id = aawak.aawak_source_id
        left join support_list sl4 on sl4._id = aawak.usage_list_id
        left join unit on unit._id = aawak.unit_id
        left join pbk on pbk._id = aawak.pbk_id
        where aawak.dept_id = @dept_id 
        ${mm_id ? `AND aawak.mm_id = ${mm_id}` : ''} 
        AND aawak.item_id = @item_id AND ((aawak.subitem_id IS NULL AND @subitem_id IS NULL) OR aawak.subitem_id = @subitem_id) 
        AND strftime('%Y-%m', aawak.date) >= '${from_str}' AND strftime('%Y-%m', aawak.date) <= '${to_str}'
        order by aawak.date asc`);

        let jwkstmt = DB.db.prepare(`select jawak.*, mm.mm_hin as jawak_mm_hin, sl.list_name_hin as jawak_type_hin,
        sl2.list_name_hin as condition_hin, sl3.list_name_hin as aawak_source_hin, sl4.list_name_hin as usage_list_hin,
        unit.unit_short, pbk.pbk_hin, pbk.roll_no
        from jawak 
        left join mm on mm._id = jawak.jawak_mm_id
        left join support_list sl on sl._id = jawak.jawak_type_id
        left join support_list sl2 on sl2._id = jawak.condition_id
        left join support_list sl3 on sl3._id = jawak.aawak_source_id
        left join support_list sl4 on sl4._id = jawak.usage_list_id
        left join unit on unit._id = jawak.unit_id
        left join pbk on pbk._id = jawak.pbk_id
        where jawak.dept_id = @dept_id 
        ${mm_id ? `AND jawak.mm_id = ${mm_id}` : ''} 
        AND jawak.item_id = @item_id AND ((jawak.subitem_id IS NULL AND @subitem_id IS NULL) OR jawak.subitem_id = @subitem_id) 
        AND strftime('%Y-%m', jawak.date) >= '${from_str}' AND strftime('%Y-%m', jawak.date) <= '${to_str}'
        order by jawak.date asc`);

        let pastBachatStmt = DB.db.prepare(`select sum(IFNULL(bcht.past_bachat, 0)) as past_bachat from bachat_new bcht 
        where bcht.dept_id = @dept_id 
        ${mm_id ? `AND bcht.mm_id = ${mm_id}` : ''} 
        AND bcht.item_id = @item_id AND ((bcht.subitem_id IS NULL AND @subitem_id IS NULL) OR bcht.subitem_id = @subitem_id) 
        AND CAST(bcht.year AS INTEGER) = ${from_year} AND CAST(bcht.month AS INTEGER) = ${from_month}`);

        for (let item of item_subitem_ids) {
            let rowParams = {
                dept_id: dept_id,
                item_id: item.item_id,
                subitem_id: item.subitem_id || null
            };

            let aawaks = awkstmt.all(rowParams);
            let jawaks = jwkstmt.all(rowParams);
            
            let pastBachatRow = pastBachatStmt.get(rowParams);
            let past_bachat = (pastBachatRow && pastBachatRow.past_bachat !== null) ? pastBachatRow.past_bachat : null;
            if (past_bachat === null) {
                let fallbackPastBachat = DB.db.prepare(`select sum(latest_val) as past_bachat from (
                    select (IFNULL(bn.past_bachat, 0) + IFNULL(bn.bachat, 0)) as latest_val
                    from bachat_new bn
                    inner join (
                        select IFNULL(condition_id, 0) as cond_id, IFNULL(unit_id, 0) as u_id, MAX(CAST(year AS INTEGER) * 12 + CAST(month AS INTEGER)) as max_period
                        from bachat_new
                        where dept_id = @dept_id
                        ${mm_id ? `AND mm_id = ${mm_id}` : ''}
                        AND item_id = @item_id
                        AND ((subitem_id IS NULL AND @subitem_id IS NULL) OR subitem_id = @subitem_id)
                        AND (CAST(year AS INTEGER) * 12 + CAST(month AS INTEGER)) < (${from_year} * 12 + ${from_month})
                        group by IFNULL(condition_id, 0), IFNULL(unit_id, 0)
                    ) latest on IFNULL(bn.condition_id, 0) = latest.cond_id 
                            and IFNULL(bn.unit_id, 0) = latest.u_id 
                            and (CAST(bn.year AS INTEGER) * 12 + CAST(bn.month AS INTEGER)) = latest.max_period
                    where bn.dept_id = @dept_id
                    ${mm_id ? `AND bn.mm_id = ${mm_id}` : ''}
                    AND bn.item_id = @item_id
                    AND ((bn.subitem_id IS NULL AND @subitem_id IS NULL) OR bn.subitem_id = @subitem_id)
                )`).get(rowParams);
                past_bachat = (fallbackPastBachat && fallbackPastBachat.past_bachat !== null) ? fallbackPastBachat.past_bachat : 0;
            }

            let total_aawak = aawaks.reduce((sum, a) => sum + (a.qty || 0), 0);
            let total_jawak = jawaks.reduce((sum, j) => sum + (j.qty || 0), 0);
            let current_bachat = past_bachat + total_aawak - total_jawak;
            let unit_short = aawaks.length > 0 ? aawaks[0].unit_short : (jawaks.length > 0 ? jawaks[0].unit_short : '');
            
            if (!unit_short) {
                let unitRow = DB.db.prepare(`select unit.unit_short from item left join unit on unit._id = item.unit_id where item._id = @item_id`).get(rowParams);
                unit_short = unitRow ? unitRow.unit_short : '';
            }


            // Prepend past bachat / opening balance as first row in aawak
            let past_bachat_obj = {
                date: `${from_year}-${from_month.toString().padStart(2, '0')}-01`,
                lot_no: '-',
                aawak_mm_hin: 'पिछली बचत (Opening Balance)',
                condition_hin: '-',
                qty: past_bachat,
                unit_short: unit_short,
                aawak_type_hin: 'शुरुआती स्टॉक',
                rate: 0,
                actual_amt: 0,
                description: 'Past Bachat / Opening Balance'
            };
            aawaks.unshift(past_bachat_obj);

            if (total_aawak !== 0 || total_jawak !== 0 || current_bachat !== 0) {
                reportData.push({
                    item_id: item.item_id,
                    subitem_id: item.subitem_id,
                    item_hin: item.item_hin,
                    item_eng: item.item_eng,
                    subitem_hin: item.subitem_hin,
                    subitem_eng: item.subitem_eng,
                    unit_short: unit_short,
                    overview: {
                        past_bachat: past_bachat,
                        total_aawak: total_aawak,
                        total_jawak: total_jawak,
                        current_bachat: current_bachat
                    },
                    aawaks: aawaks,
                    jawaks: jawaks
                });
            }
        }

        let mmName = 'All MMs';
        if (mm_id) {
            let mmRow = mmTable.getById(mm_id);
            if (mmRow) mmName = mmRow.mm_hin;
        }

        let category_name = req.body.category_name || '';

        if (taskId) global.pdfProgress[taskId] = { status: 'Preparing PDF engine...' };

        const pdfBuffer = await itemLedgerPdf.generateItemLedgerPdf(
            reportData, 
            req.body.from.name_hin, 
            req.body.to.name_hin, 
            mmName,
            taskId,
            category_name
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=item_ledger.pdf');
        res.end(pdfBuffer, 'binary');

        if (taskId) delete global.pdfProgress[taskId];

    } catch (err) {
        if (req.body && req.body.taskId) delete global.pdfProgress[req.body.taskId];
        console.log(err);
        next(err);
    }
});

// by condition + aj_types 
router.put('/aj/:dept_id', async (req, res, next) => {
    try {
        req.body.month -= 1;
        let conditionString = `bcht.month = '${req.body.month}' AND bcht.year = '${req.body.year}' AND bcht.dept_id = ${req.params.dept_id} ${req.body.mm_id ? ` AND bcht.mm_id = ${req.body.mm_id}` : ``}`;
        let data = []
        let stmt = DB.db.prepare(`select bcht.*, json_group_array(condition_id) as condition_ids, json_group_array(bachat) as bachats,
        json_group_array(sl.list_name_hin) as condition_hin, json_group_array(sl.list_name_eng) as condition_eng, 
        mm.mm_hin, mm.mm_eng, mm.mm_code, mm.state_id, st.state_hin, st.state_eng,
        it.item_hin, it.item_eng, it.item_code, it.icategories as arr_item_categories,
        sit.subitem_hin, sit.subitem_eng, sit.categories as arr_subitem_categories,
        unit.unit_short, unit.unit_full,
        dept.dept_code, dept.dept_hin, dept.dept_eng from bachat_new bcht 
        left join mm on mm._id = bcht.mm_id
        left join state st on st._id = mm.state_id
        left join v_item it on it._id = bcht.item_id
        left join v_subitem sit on sit._id = bcht.subitem_id
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


// by aawak jawak check 
router.put('/awk_jwk_check/', async (req, res, next) => {
    try {
        let orderBy = req.body.orderBy ? req.body.orderBy : `_id`;
        let aawaks = [], jawaks = []

        let awkConditionString = `1=1`;
        let jwkConditionString = `1=1`;

        if (req.body.date_from) {
            awkConditionString += ` AND aawak.date >= '${req.body.date_from}'`;
            jwkConditionString += ` AND jawak.date >= '${req.body.date_from}'`;
        }
        if (req.body.date_to) {
            awkConditionString += ` AND aawak.date <= '${req.body.date_to}'`;
            jwkConditionString += ` AND jawak.date <= '${req.body.date_to}'`;
        }
        if (req.body.mm_id) {
            awkConditionString += ` AND aawak.mm_id = ${req.body.mm_id}`;
            jwkConditionString += ` AND jawak.mm_id = ${req.body.mm_id}`;
        }
        if (req.body.aj_mm_id) {
            awkConditionString += ` AND aawak_mm_id = '${req.body.aj_mm_id}'`;
            jwkConditionString += ` AND jawak_mm_id = '${req.body.aj_mm_id}'`;
        }

        // Category filter
        if (req.body.category_id) {
            awkConditionString += ` AND (aawak.item_id IN (SELECT item_id FROM rel_item_category WHERE category_id = ${req.body.category_id}) OR aawak.subitem_id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id = ${req.body.category_id}))`;
            jwkConditionString += ` AND (jawak.item_id IN (SELECT item_id FROM rel_item_category WHERE category_id = ${req.body.category_id}) OR jawak.subitem_id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id = ${req.body.category_id}))`;
        }

        // Item & Subitem Filter (Multiple support via app-item-dropdown)
        if (req.body.item_subitem_ids && req.body.item_subitem_ids.length > 0) {
            let awkParts = req.body.item_subitem_ids.map(idStr => {
                let parts = idStr.split(':');
                let i_id = parts[0];
                let s_id = parts[1] || null;
                if (s_id) {
                    return `(aawak.item_id = ${i_id} AND aawak.subitem_id = ${s_id})`;
                } else {
                    return `(aawak.item_id = ${i_id} AND aawak.subitem_id IS NULL)`;
                }
            });
            awkConditionString += ` AND (${awkParts.join(' OR ')})`;

            let jwkParts = req.body.item_subitem_ids.map(idStr => {
                let parts = idStr.split(':');
                let i_id = parts[0];
                let s_id = parts[1] || null;
                if (s_id) {
                    return `(jawak.item_id = ${i_id} AND jawak.subitem_id = ${s_id})`;
                } else {
                    return `(jawak.item_id = ${i_id} AND jawak.subitem_id IS NULL)`;
                }
            });
            jwkConditionString += ` AND (${jwkParts.join(' OR ')})`;
        } else {
            // Backward compatibility for single dropdown
            if (req.body.item_id) {
                awkConditionString += ` AND aawak.item_id = ${req.body.item_id}`;
                jwkConditionString += ` AND jawak.item_id = ${req.body.item_id}`;
            }
            if (req.body.subitem_id) {
                awkConditionString += ` AND aawak.subitem_id = ${req.body.subitem_id}`;
                jwkConditionString += ` AND jawak.subitem_id = ${req.body.subitem_id}`;
            }
        }


        await DB.getList('aawak', { full: true, dept_id: req.params.dept_id, conditionString: awkConditionString, orderBy: orderBy }).then(async (resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].document = (resolve.data[i].document ? JSON.parse(resolve.data[i].document) : {});
                resolve.data[i].isbill = resolve.data[i].isbill ? true : false;
            }
            aawaks = resolve.data;
        });

        await DB.getList('jawak', { full: true, dept_id: req.params.dept_id, conditionString: jwkConditionString, orderBy: orderBy }).then(async (resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].document = (resolve.data[i].document ? JSON.parse(resolve.data[i].document) : {});
                resolve.data[i].isbill = resolve.data[i].isbill ? true : false;
            }
            jawaks = resolve.data;
        });

        res.json({
            aawaks: aawaks,
            jawaks: jawaks,
            success: true
        })
    } catch (err) {
        console.log(err);
        next(err)
    };
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
        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as arr_item_categories,
        sit.subitem_hin, sit.subitem_eng, sit.categories as arr_subitem_categories,
        sl.list_name_hin as aawak_type_hin, sl.list_name_eng as aawak_type_eng,
        unit.unit_short, unit.unit_full,
        department.dept_hin, department.dept_eng, department.dept_code
        from (select sum(qty) as sum_qty, strftime('%Y', date) as year, strftime('%m', date) as month, * from aawak 
        where ${conditionString} group by dept_id, item_id, subitem_id, unit_id, aawak_type_id, month ) awk
        left join v_item it on it._id = awk.item_id 
        left join v_subitem sit on sit._id = awk.subitem_id
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
        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as arr_item_categories,
        sit.subitem_hin, sit.subitem_eng, sit.categories as arr_subitem_categories,
        sl.list_name_hin as jawak_type_hin, sl.list_name_eng as jawak_type_eng,
        unit.unit_short, unit.unit_full,
        department.dept_hin, department.dept_eng, department.dept_code
        from (select sum(qty) as sum_qty, strftime('%Y', date) as year, strftime('%m', date) as month, * from jawak 
        where ${conditionString} group by dept_id, item_id, subitem_id, unit_id, jawak_type_id, month ) jwk
        left join v_item it on it._id = jwk.item_id 
        left join v_subitem sit on sit._id = jwk.subitem_id
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

        let conditionString = `bachat.dept_id = ${req.params.dept_id} ${req.body.mm_id && req.body.mm_id.length > 0 ? ` AND bachat.mm_id in (${req.body.mm_id.join(",")})` : ``}`;
        if (req.body.item_subitem_ids && req.body.item_subitem_ids.length > 0) {
            let itemSubConditions = req.body.item_subitem_ids.map(id => {
                let parts = id.split(':');
                if (parts[1]) {
                    return `(bachat.item_id = ${parts[0]} AND bachat.subitem_id = ${parts[1]})`;
                } else {
                    return `(bachat.item_id = ${parts[0]})`;
                }
            });
            conditionString += ` AND (${itemSubConditions.join(' OR ')})`;
        }
        if (req.body.category_id && req.body.category_id.length > 0) {
            conditionString += ` AND (bachat.item_id IN (SELECT item_id FROM rel_item_category WHERE category_id IN (${req.body.category_id.join(',')})) OR bachat.subitem_id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id IN (${req.body.category_id.join(',')})))`;
        }
        let sql = `select bachat.dept_id, bachat.item_id, bachat.subitem_id, bachat.unit_id, sum(bachat.Stock) as Stock, 
        JSON_GROUP_ARRAY(bachat.mm_id) as arr_mm_id, JSON_GROUP_ARRAY(bachat.Stock) as arr_mm_stock,
        it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as arr_item_categories,
        sit.subitem_hin, sit.subitem_eng, sit.categories as arr_subitem_categories,
        unit.unit_short, unit.unit_full,
        department.dept_hin, department.dept_eng, department.dept_code
        from bachat
        left join v_item it on it._id = bachat.item_id 
        left join v_subitem sit on sit._id = bachat.subitem_id
        left join unit on unit._id = bachat.unit_id
        left join department on department._id = bachat.dept_id where ${conditionString} 
        group by bachat.dept_id, bachat.item_id, bachat.subitem_id, bachat.unit_id 
        having sum(bachat.Stock) <> 0`;
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


// by Khet Saar 
router.put('/report_khet_saar/:dept_id', async (req, res, next) => {
    try {

        let conditionStringCommon = ` aawak.dept_id = ${req.params.dept_id} ${req.body.year ? ` AND strftime('%Y', aawak.date) = '${req.body.year}'` : ``} ${req.body.month ? ` AND strftime('%m', aawak.date) = '${req.body.month.toString().padStart(2, '0')}'` : ``}`;
        let conditionString = `${conditionStringCommon} AND aawak_mm_id in (${req.body.mm_id.join(',')})`;
        let sql = `select s_awk.*, JSON_GROUP_ARRAY(sum_qty) as arr_sum_qty, JSON_GROUP_ARRAY(s_awk.unit_id) as arr_unit_id,
        JSON_GROUP_ARRAY(unit_short) as arr_unit_short, sum(sum_amt) as total_amt,
        dept.dept_hin, dept.dept_eng, dept.dept_code,
        mm.mm_hin, mm.mm_eng, mm.state_id as mm_state_id
        from (select dept_id, aawak_mm_id, item_id, subitem_id, unit_id, avg(rate) as avg_rate, sum(actual_amt) as sum_amt, sum(qty) as sum_qty from aawak 
        where ${conditionString} 
        group by aawak.dept_id, aawak.aawak_mm_id, aawak.unit_id) s_awk
        left join mm on mm._id = s_awk.aawak_mm_id 
        left join unit on unit._id = s_awk.unit_id
        left join department dept on dept._id = s_awk.dept_id 
        group by s_awk.dept_id, s_awk.aawak_mm_id`;
        console.log(sql);
        let kh_saar = DB.db.prepare(sql).all();


        for (let i in kh_saar) {
            for (let key of Object.keys(kh_saar[i])) {
                if (key.includes('arr')) {
                    kh_saar[i][key] = kh_saar[i][key] ? JSON.parse(kh_saar[i][key]) : []
                }
            }

            let conditionString = `${conditionStringCommon} AND aawak.aawak_mm_id = ${kh_saar[i].aawak_mm_id}`;
            sql = `select aawak.*, round(avg(rate), 2) as avg_rate, round(sum(actual_amt), 2) as sum_amt, round(sum(qty), 2) as sum_qty,
            dept.dept_hin, dept.dept_eng, dept.dept_code,
            mm.mm_hin, mm.mm_eng, mm.state_id as mm_state_id,
            it.item_hin, it.item_eng, it.item_code, it.item_roman, it.icategories as arr_item_categories,
            sit.subitem_hin, sit.subitem_eng, sit.categories as arr_subitem_categories,
            unit.unit_short, unit.unit_full
            from aawak 
            left join mm on mm._id = aawak.aawak_mm_id 
            left join v_item it on it._id = aawak.item_id 
            left join v_subitem sit on sit._id = aawak.subitem_id
            left join unit on unit._id = aawak.unit_id
            left join department dept on dept._id = aawak.dept_id where ${conditionString}
            group by aawak.dept_id, aawak.item_id, aawak.subitem_id, aawak.unit_id`;

            let itemData = await DB.db.prepare(sql).all();

            for (let j in itemData) {
                for (let key of Object.keys(itemData[j])) {
                    if (key.includes('arr')) {
                        itemData[j][key] = itemData[j][key] ? JSON.parse(itemData[j][key]) : []
                    }
                }
            }
            kh_saar[i].itemData = itemData;
        }

        res.json({
            result: kh_saar,
            success: true
        })
    } catch (err) {
        console.log(err);
        next(err)
    };
});

// by Khet item wise 
router.put('/report_khet_itemwise/:dept_id', async (req, res, next) => {
    try {
        let khets = DB.db.prepare('select _id from mm where dept_id = 4').all();
        let khetIDs = khets.map(m => m._id);
        console.log(khetIDs);

        let conditionStringCommon = `aawak.aawak_mm_id in (${khetIDs.join(',')}) AND aawak.dept_id = ${req.params.dept_id} ${req.body.year ? ` AND strftime('%Y', aawak.date) = '${req.body.year}'` : ``} ${req.body.month ? ` AND strftime('%m', aawak.date) = '${req.body.month.toString().padStart(2, '0')}'` : ``}`;
        let conditionString = `${conditionStringCommon} ${req.body.item_id && req.body.item_id.length > 0 ? ` AND item_id in (${req.body.item_id.join(',')})` : ''}  ${req.body.subitem_id && subitem_id.length > 0 ? ` AND subitem_id in (${req.body.subitem_id.join(',')})` : ''}`;
        let sql = `select s_awk.*, JSON_GROUP_ARRAY(sum_qty) as arr_sum_qty, JSON_GROUP_ARRAY(s_awk.unit_id) as arr_unit_id,
        JSON_GROUP_ARRAY(unit_short) as arr_unit_short, sum(sum_amt) as total_amt,
        dept.dept_hin, dept.dept_eng, dept.dept_code,
        item.item_hin, item.item_eng, item.icategories as arr_item_categories,
        si.subitem_hin, si.subitem_eng, si.categories as arr_subitem_categories
        from (select dept_id, aawak_mm_id, item_id, subitem_id, unit_id, avg(rate) as avg_rate, sum(actual_amt) as sum_amt, sum(qty) as sum_qty from aawak 
        where ${conditionString} 
        group by aawak.dept_id, aawak.item_id, aawak.subitem_id, aawak.unit_id) s_awk
        left join v_item item on item._id = s_awk.item_id 
        left join v_subitem si on si._id = s_awk.subitem_id 
        left join unit on unit._id = s_awk.unit_id
        left join department dept on dept._id = s_awk.dept_id 
        group by s_awk.dept_id, s_awk.item_id, s_awk.subitem_id`;
        console.log(sql);
        let kh_saar = DB.db.prepare(sql).all();


        for (let i in kh_saar) {
            for (let key of Object.keys(kh_saar[i])) {
                if (key.includes('arr')) {
                    kh_saar[i][key] = kh_saar[i][key] ? JSON.parse(kh_saar[i][key]) : []
                }
            }

            let conditionString = `${conditionStringCommon} AND aawak.item_id = ${kh_saar[i].item_id} AND IFNULL(aawak.subitem_id, 0) = IFNULL(${kh_saar[i].subitem_id}, 0)`;
            sql = `select aawak.*, round(avg(rate), 2) as avg_rate, round(sum(actual_amt), 2) as sum_amt, round(sum(qty), 2) as sum_qty,
            dept.dept_hin, dept.dept_eng, dept.dept_code,
            mm.mm_hin, mm.mm_eng, mm.state_id,
            state.state_hin, state.state_eng,
            unit.unit_short, unit.unit_full
            from aawak 
            left join mm on mm._id = aawak.aawak_mm_id 
            left join state on state._id = mm.state_id
            left join unit on unit._id = aawak.unit_id
            left join department dept on dept._id = aawak.dept_id where ${conditionString}
            group by aawak.dept_id, aawak.item_id, aawak.subitem_id, aawak.aawak_mm_id, aawak.unit_id`;

            let khetData = await DB.db.prepare(sql).all();

            for (let j in khetData) {
                for (let key of Object.keys(khetData[j])) {
                    if (key.includes('arr')) {
                        khetData[j][key] = khetData[j][key] ? JSON.parse(khetData[j][key]) : []
                    }
                }
            }
            kh_saar[i].khetData = khetData;
        }

        res.json({
            result: kh_saar,
            success: true
        })
    } catch (err) {
        console.log(err);
        next(err)
    };
});

// by Khet aawak jawak saar
router.put('/report_khet_ajsaar/:dept_id', async (req, res, next) => {
    try {

        let conditionStringCommon = `aawak.aawak_mm_id = ${req.body.mm_id} AND aawak.dept_id = ${req.params.dept_id} ${req.body.year ? ` AND strftime('%Y', aawak.date) = '${req.body.year}'` : ``} ${req.body.month ? ` AND strftime('%m', aawak.date) = '${req.body.month.toString().padStart(2, '0')}'` : ``}`;
        let conditionString = `${conditionStringCommon} ${req.body.item_id && req.body.item_id.length > 0 ? ` AND item_id = ${req.body.item_id}` : ''} ${req.body.subitem_id && subitem_id.length > 0 ? ` AND subitem_id in ${req.body.subitem_id.join(',')}` : ''}`;
        let sql = `select s_awk.*, JSON_GROUP_ARRAY(sum_qty) as arr_sum_qty, JSON_GROUP_ARRAY(s_awk.unit_id) as arr_unit_id,
        JSON_GROUP_ARRAY(unit_short) as arr_unit_short, sum(sum_amt) as total_amt, JSON_GROUP_ARRAY(s_awk._ids) as arr_awk_ids,
        dept.dept_hin, dept.dept_eng, dept.dept_code,
        item.item_hin, item.item_eng, item.icategories as arr_item_categories,
        subitem.subitem_hin, subitem.subitem_eng, subitem.categories as arr_subitem_categories
        from (select dept_id, aawak_mm_id, item_id, subitem_id, unit_id, avg(rate) as avg_rate, sum(actual_amt) as sum_amt, sum(qty) as sum_qty, GROUP_CONCAT(_id) as _ids from aawak 
        where ${conditionString} 
        group by aawak.dept_id, aawak.item_id, aawak.subitem_id, aawak.unit_id) s_awk
        left join v_item item on item._id = s_awk.item_id 
        left join v_subitem subitem on subitem._id = s_awk.subitem_id
        left join unit on unit._id = s_awk.unit_id
        left join department dept on dept._id = s_awk.dept_id 
        group by s_awk.dept_id, s_awk.item_id, s_awk.subitem_id`;
        let kh_saar = DB.db.prepare(sql).all();

        for (let i in kh_saar) {
            for (let key of Object.keys(kh_saar[i])) {
                if (key.includes('arr')) {
                    kh_saar[i][key] = kh_saar[i][key] ? JSON.parse(kh_saar[i][key]) : []
                }
            }

            sql = `select round(sum(qty), 2) as sum_qty,
            mm.mm_hin, mm.mm_eng, mm.state_id,
            state.state_hin, state.state_eng,
            unit.unit_short, unit.unit_full
            from jawak 
            left join mm on mm._id = jawak.jawak_mm_id 
            left join state on state._id = mm.state_id
            left join unit on unit._id = jawak.unit_id
            left join department dept on dept._id = jawak.dept_id where aawak_ref_id in (${kh_saar[i].arr_awk_ids.join(',')})
            group by jawak.jawak_mm_id, jawak.unit_id`;
            let jawakData = await DB.db.prepare(sql).all();

            // for (let j in khetData) {
            //     for (let key of Object.keys(khetData[j])) {
            //         if (key.includes('arr')) {
            //             khetData[j][key] = khetData[j][key] ? JSON.parse(khetData[j][key]) : []
            //         }
            //     }
            // }
            kh_saar[i].jawakData = jawakData;
        }

        res.json({
            result: kh_saar,
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