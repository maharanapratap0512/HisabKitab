const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();


//  category add
router.post('/', async (req, res, next) => {
    if (req.body) {
        await DB.insert('bachat', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('bachat', data, (err, data) => { })
            res.json({
                success: true,
                result: data || []
            });
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

//  category get
router.get('/', async (req, res, next) => {
    await DB.getList('bachat').then((res) => {
        res.json({
            success: true,
            result: res || []
        });
    }, (err) => { return next(err) });
});

//  category get
router.get('/home/:dept_id', async (req, res, next) => {
    try {
        let result = [];
        const deptId = parseInt(req.params.dept_id);

        // Auto-heal: If bachat summary table has 0 rows for this department but aawak has entries, rebuild bachat
        const bachatCount = DB.db.prepare('SELECT count(*) as c FROM bachat WHERE dept_id = ?').get(deptId);
        if (!bachatCount || bachatCount.c === 0) {
            const aawakCount = DB.db.prepare('SELECT count(*) as c FROM aawak WHERE dept_id = ?').get(deptId);
            if (aawakCount && aawakCount.c > 0) {
                const integrity = require('../services/integrity-checkup.service');
                await integrity.resolveBachatMismatches([{ dept_id: deptId }]);
            }
        }

        let sql = DB.query.bachat.with_pending_aawak.replace('?', `where bachat.dept_id = ${deptId} AND (bachat.Stock <> 0 OR aawak.remaining_qty <> 0 OR aawak.is_variable_qty = 1)`);
        sql = sql.replace('#', '');
        let stmt = DB.db.prepare(sql);
        for (let row of stmt.iterate({ limit: -1, offset: -1 })) {
            row.aawaks = JSON.parse(row.aawaks);
            row.icategories = JSON.parse(row.icategories);
            row.scategories = JSON.parse(row.scategories);
            result.push(row);
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentYearMonth = `${currentYear}-${currentMonth}`;

        const awkMonth = DB.db.prepare(`
            SELECT count(*) as c 
            FROM aawak 
            WHERE dept_id = ? 
              AND (date LIKE ? OR strftime('%Y-%m', date) = ?)
        `).get(deptId, `${currentYearMonth}%`, currentYearMonth);

        const jwkMonth = DB.db.prepare(`
            SELECT count(*) as c 
            FROM jawak 
            WHERE dept_id = ? 
              AND (date LIKE ? OR strftime('%Y-%m', date) = ?)
        `).get(deptId, `${currentYearMonth}%`, currentYearMonth);

        let activePrastavCount = 0;
        let prastavTransitCount = 0;
        let prastavPendingCount = 0;
        let prastavReceivedCount = 0;
        try {
            const pActive = DB.db.prepare(`
                SELECT count(DISTINCT voucher_no) as vouchers, count(*) as items 
                FROM prastav 
                WHERE active = 1 AND (is_rejected = 0 OR is_rejected IS NULL)
            `).get();
            activePrastavCount = pActive?.vouchers || pActive?.items || 0;

            const pTransit = DB.db.prepare(`
                SELECT count(*) as c 
                FROM prastav_jawak 
                WHERE is_received = 2 AND active = 1
            `).get();
            prastavTransitCount = pTransit?.c || 0;

            const pPending = DB.db.prepare(`
                SELECT count(*) as c 
                FROM prastav_jawak 
                WHERE (is_received = 0 OR is_received IS NULL) AND active = 1
            `).get();
            prastavPendingCount = pPending?.c || 0;

            const pReceived = DB.db.prepare(`
                SELECT count(*) as c 
                FROM prastav_jawak 
                WHERE is_received = 1 AND active = 1
            `).get();
            prastavReceivedCount = pReceived?.c || 0;
        } catch (pErr) {
            console.error('Error fetching prastav dashboard counts:', pErr.message);
        }

        // Dead Stock: >= 6 months old and 0% distributed (remaining_qty = qty)
        let deadStockLots = [];
        let deadStockCount = 0;
        try {
            deadStockLots = DB.db.prepare(`
                SELECT a._id, a.date, a.item_id, vi.item_hin, vi.item_eng, a.qty, a.remaining_qty, a.pkt_num, mm.mm_hin, unit.unit_short,
                       CAST((julianday('now') - julianday(a.date)) AS INTEGER) as days_old
                FROM aawak a
                LEFT JOIN v_item vi ON vi._id = a.item_id
                LEFT JOIN mm ON mm._id = a.mm_id
                LEFT JOIN unit ON unit._id = a.unit_id
                WHERE a.dept_id = ? 
                  AND a.remaining_qty = a.qty 
                  AND a.qty > 0
                  AND a.date >= '2000-01-01'
                  AND a.date <= date('now', '-6 months')
                ORDER BY a.date ASC
                LIMIT 6
            `).all(deptId);
            deadStockCount = DB.db.prepare(`
                SELECT count(*) as c 
                FROM aawak 
                WHERE dept_id = ? 
                  AND remaining_qty = qty 
                  AND qty > 0
                  AND date >= '2000-01-01'
                  AND date <= date('now', '-6 months')
            `).get(deptId)?.c || 0;
        } catch (dsErr) {
            console.error('Error fetching dead stock lots:', dsErr.message);
        }

        // Delayed In-Transit: is_received = 2 and sent > 5 days ago
        let inTransitLots = [];
        let inTransitCount = 0;
        try {
            inTransitLots = DB.db.prepare(`
                SELECT pj._id, pj.date, pj.item_id, vi.item_hin, vi.item_eng, pj.qty, 
                       fmm.mm_hin as from_mm, tmm.mm_hin as to_mm,
                       CAST((julianday('now') - julianday(pj.date)) AS INTEGER) as days_elapsed
                FROM prastav_jawak pj
                LEFT JOIN v_item vi ON vi._id = pj.item_id
                LEFT JOIN mm fmm ON fmm._id = pj.source_mm_id
                LEFT JOIN mm tmm ON tmm._id = pj.mm_id
                WHERE pj.is_received = 2 
                  AND pj.active = 1
                  AND pj.date <= date('now', '-5 days')
                ORDER BY pj.date ASC
                LIMIT 6
            `).all();
            inTransitCount = DB.db.prepare(`
                SELECT count(*) as c 
                FROM prastav_jawak 
                WHERE is_received = 2 
                  AND active = 1
                  AND date <= date('now', '-5 days')
            `).get()?.c || 0;
        } catch (itErr) {
            console.error('Error fetching in transit lots:', itErr.message);
        }

        res.json({
            success: true,
            result: result,
            total_count: result.length,
            this_month_aawak_count: awkMonth?.c || 0,
            this_month_jawak_count: jwkMonth?.c || 0,
            active_prastav_count: activePrastavCount,
            prastav_transit_count: prastavTransitCount,
            prastav_pending_count: prastavPendingCount,
            prastav_received_count: prastavReceivedCount,
            dead_stock_count: deadStockCount,
            dead_stock_lots: deadStockLots,
            in_transit_count: inTransitCount,
            in_transit_lots: inTransitLots
        });
    }
    catch (err) { return next(err) };
});

// Statistics & Analytics Endpoint (for Charts tab)
router.post('/statistics/:dept_id', async (req, res, next) => {
    try {
        const deptId = parseInt(req.params.dept_id);
        const selectedYear = String(req.body.year || new Date().getFullYear());
        const selectedMM = req.body.mm_id ? parseInt(req.body.mm_id) : null;

        // 1. Available Years
        const yearsRows = DB.db.prepare(`
            SELECT DISTINCT strftime('%Y', date) as y 
            FROM aawak 
            WHERE dept_id = ? AND date IS NOT NULL AND length(date) >= 4 AND strftime('%Y', date) >= '2020'
            ORDER BY y DESC
        `).all(deptId);
        let years = yearsRows.map(r => r.y).filter(Boolean);
        if (!years.includes(selectedYear)) years.unshift(selectedYear);
        if (years.length === 0) years = ['2026', '2025', '2024'];

        // 2. 12-Month Trend (Aawak & Jawak for selected year)
        const monthNames = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
        const monthlyTrend = [];

        for (let m = 1; m <= 12; m++) {
            const mStr = String(m).padStart(2, '0');
            const ym = `${selectedYear}-${mStr}`;

            let awkSql = `SELECT count(*) as c, sum(qty) as q FROM aawak WHERE dept_id = ? AND (date LIKE ? OR strftime('%Y-%m', date) = ?)`;
            let jwkSql = `SELECT count(*) as c, sum(qty) as q FROM jawak WHERE dept_id = ? AND (date LIKE ? OR strftime('%Y-%m', date) = ?)`;
            const paramsAwk = [deptId, `${ym}%`, ym];
            const paramsJwk = [deptId, `${ym}%`, ym];

            if (selectedMM) {
                awkSql += ` AND mm_id = ?`;
                jwkSql += ` AND (mm_id = ? OR jawak_mm_id = ?)`;
                paramsAwk.push(selectedMM);
                paramsJwk.push(selectedMM, selectedMM);
            }

            const awk = DB.db.prepare(awkSql).get(...paramsAwk);
            const jwk = DB.db.prepare(jwkSql).get(...paramsJwk);

            monthlyTrend.push({
                month: m,
                monthName: monthNames[m - 1],
                aawakCount: awk?.c || 0,
                aawakQty: Math.round((awk?.q || 0) * 100) / 100,
                jawakCount: jwk?.c || 0,
                jawakQty: Math.round((jwk?.q || 0) * 100) / 100
            });
        }

        // 3. Yearly Comparison
        const yearlyComparison = [];
        const recentYears = years.slice(0, 4);
        for (const y of recentYears) {
            let awkSql = `SELECT count(*) as c, sum(qty) as q FROM aawak WHERE dept_id = ? AND (date LIKE ? OR strftime('%Y', date) = ?)`;
            let jwkSql = `SELECT count(*) as c, sum(qty) as q FROM jawak WHERE dept_id = ? AND (date LIKE ? OR strftime('%Y', date) = ?)`;
            const paramsAwk = [deptId, `${y}%`, y];
            const paramsJwk = [deptId, `${y}%`, y];
            if (selectedMM) {
                awkSql += ` AND mm_id = ?`;
                jwkSql += ` AND (mm_id = ? OR jawak_mm_id = ?)`;
                paramsAwk.push(selectedMM);
                paramsJwk.push(selectedMM, selectedMM);
            }
            const awk = DB.db.prepare(awkSql).get(...paramsAwk);
            const jwk = DB.db.prepare(jwkSql).get(...paramsJwk);
            yearlyComparison.push({
                year: y,
                aawakCount: awk?.c || 0,
                aawakQty: Math.round((awk?.q || 0) * 100) / 100,
                jawakCount: jwk?.c || 0,
                jawakQty: Math.round((jwk?.q || 0) * 100) / 100
            });
        }

        // 4. Center-wise breakdown (if no MM selected) OR item breakdown (if MM selected)
        let mmComparison = [];
        let topStockItems = [];
        let topDistributedItems = [];

        if (!selectedMM) {
            mmComparison = DB.db.prepare(`
                SELECT mm._id as mm_id, mm.mm_hin, mm.mm_eng, 
                       count(b._id) as item_count, 
                       sum(b.Stock) as total_stock, 
                       sum(b.Used) as total_used
                FROM bachat b
                JOIN mm ON mm._id = b.mm_id
                WHERE b.dept_id = ?
                GROUP BY b.mm_id
                ORDER BY total_stock DESC
                LIMIT 8
            `).all(deptId);

            topStockItems = DB.db.prepare(`
                SELECT vi.item_hin, vi.item_eng, unit.unit_short, sum(b.Stock) as stock
                FROM bachat b
                JOIN v_item vi ON vi._id = b.item_id
                LEFT JOIN unit ON unit._id = b.unit_id
                WHERE b.dept_id = ? AND b.Stock > 0
                GROUP BY b.item_id
                ORDER BY stock DESC
                LIMIT 8
            `).all(deptId);

            topDistributedItems = DB.db.prepare(`
                SELECT vi.item_hin, vi.item_eng, unit.unit_short, sum(j.qty) as used
                FROM jawak j
                JOIN v_item vi ON vi._id = j.item_id
                LEFT JOIN unit ON unit._id = j.unit_id
                WHERE j.dept_id = ?
                GROUP BY j.item_id
                ORDER BY used DESC
                LIMIT 8
            `).all(deptId);
        } else {
            topStockItems = DB.db.prepare(`
                SELECT vi.item_hin, vi.item_eng, unit.unit_short, b.Stock as stock
                FROM bachat b
                JOIN v_item vi ON vi._id = b.item_id
                LEFT JOIN unit ON unit._id = b.unit_id
                WHERE b.dept_id = ? AND b.mm_id = ? AND b.Stock > 0
                ORDER BY stock DESC
                LIMIT 8
            `).all(deptId, selectedMM);

            topDistributedItems = DB.db.prepare(`
                SELECT vi.item_hin, vi.item_eng, unit.unit_short, sum(j.qty) as used
                FROM jawak j
                JOIN v_item vi ON vi._id = j.item_id
                LEFT JOIN unit ON unit._id = j.unit_id
                WHERE j.dept_id = ? AND (j.mm_id = ? OR j.jawak_mm_id = ?)
                GROUP BY j.item_id
                ORDER BY used DESC
                LIMIT 8
            `).all(deptId, selectedMM, selectedMM);
        }

        res.json({
            success: true,
            years,
            selectedYear,
            selectedMM,
            monthlyTrend,
            yearlyComparison,
            mmComparison,
            topStockItems,
            topDistributedItems
        });
    } catch (err) {
        return next(err);
    }
});


router.get('/:dept_id', async (req, res, next) => {
    // let conditionString = ``;
    let conditionString = ` bachat.Stock <> 0 OR bachat.Used <> 0`;
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    await DB.getList('bachat', { full: true, dept_id: req.params.dept_id, conditionString: conditionString }).then((resolve) => {
        for (let i in resolve.data) {
            resolve.data[i].icategories = resolve.data[i].icategories ? JSON.parse(resolve.data[i].icategories) : []
            resolve.data[i].scategories = resolve.data[i].scategories ? JSON.parse(resolve.data[i].scategories) : null
            resolve.data[i].idocument = resolve.data[i].idocument ? JSON.parse(resolve.data[i].idocument) : []
            resolve.data[i].sdocument = resolve.data[i].sdocument ? JSON.parse(resolve.data[i].sdocument) : []
        }
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count
        });
    }, (err) => { return next(err) });
});

// category update
// router.put('/', async (req, res, next) => {
//     if (req.body.set && req.body.query) {
//         let condition = '_id = ' + req.body.query._id;
//         await DB.update('bachat', req.body.set, condition, async (err, data) => {
//             if (err) {
//                 return next(err);
//             }
//             // await DB.updateToCache('bachat', req.body.set, condition, (err) => { })
//             await DB.select('bachat', ['*'], condition).then((resolve) => {
//                 res.json({
//                     success: true,
//                     result: resolve || []
//                 });
//             }, (err)=>{
//                 return next(err);
//             });
//         });
//     }
//     else {
//         return next(new Error('Id not found.'))
//     }
// });

// delete multiple bachat 
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
            let conditionString = conditions.length > 0 ? conditions.join(' AND ') : ``;
            await DB.deleteMany('bachat', conditionString).then((data) => {
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

// filter bachat 
router.put('/filter/:dept_id', async (req, res, next) => {
    try {
        if (req.params.dept_id) {
            let conditions = [];
            conditions.push(`bachat.dept_id = ${req.params.dept_id}`)
            if (req.body.mm_id && req.body.mm_id.length > 0)
                conditions.push(`bachat.mm_id in (${req.body.mm_id.join(',')})`)
            if (req.body.item_id && req.body.item_id.length > 0)
                conditions.push(`bachat.item_id in (${req.body.item_id.join(',')})`)
            if (req.body.subitem_id && req.body.subitem_id.length > 0)
                conditions.push(`bachat.subitem_id in (${req.body.subitem_id.join(',')})`)
            if (req.body.unit_id && req.body.unit_id.length > 0)
                conditions.push(`bachat.unit_id in (${req.body.unit_id.join(',')})`)

            let conditionString = conditions.length > 0 ? conditions.join(' AND ') : ``;
            await DB.getList('bachat', { full: true, conditionString: conditionString }).then((resolve) => {
                for (let i in resolve.data) {
                    resolve.data[i].icategories = resolve.data[i].icategories ? JSON.parse(resolve.data[i].icategories) : []
                    resolve.data[i].scategories = resolve.data[i].scategories ? JSON.parse(resolve.data[i].scategories) : null
                    resolve.data[i].idocument = resolve.data[i].idocument ? JSON.parse(resolve.data[i].idocument) : []
                    resolve.data[i].sdocument = resolve.data[i].sdocument ? JSON.parse(resolve.data[i].sdocument) : []
                }
                res.json({
                    success: true,
                    result: resolve.data || [],
                    total_count: resolve.total_count
                });
            });
        }
        else {
            return next(new Error('Dept Id not Found.'))
        }
    } catch (err) { next(err) };
});

// bachat delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        // let condition = '_id = ' + req.params.id;
        await DB.delete('bachat', req.params.id,).then((data) => {
            res.json({
                success: true,
                result: data
            });
        })
    }
    else {
        return next(new Error('Id not found.'))
    }

});




module.exports = router;