//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  aawak add
router.post('/', async (req, res, next) => {
    if (req.body) {
        let aawak = {};
        await DB.insert('aawak', req.body, async (err, data) => {
            if (err) {
                console.log("aawwk entry", err);
                return next(err);
            }
            aawak = data;
        });

        let bachat = [];
        await DB.getList('bachat').then((resolve) => {
            bachat = resolve;
        });

        res.json({
            success: true,
            aawak: aawak || {},
            bachat: bachat || {}
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

//aawak post with dept
router.post('/:dept_id', async (req, res, next) => {
    if (req.body) {
        let jawaks = [];
        if (req.body.jawak_detail) {
            jawaks = req.body.jawak_detail;
            delete req.body.jawak_detail;
        }
        await DB.insertFromDept('aawak', req.body, req.params.dept_id).then(async (data) => {
            // console.log("data", data);
            data.jawak_detail = [];
            for (let i = 0; i < jawaks.length; i++) {
                jawaks[i].aawak_ref_id = data._id;
                await DB.insertFromDept('jawak', jawaks[i], req.params.dept_id).then((jwkdata) => {
                    data.remaining_qty = data.remaining_qty - jwkdata.qty;
                    data.jawak_detail.push(jwkdata);
                }, (err) => {
                    console.log("jawak err", err, "jawak", jawaks[i]);
                });
            }
            res.json({
                success: true,
                result: data || {}
            });
        }, (err) => {
            return next(err);
        });
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


//aawak get dept
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('aawak', req.params.dept_id, null, `aawak._id desc`, 100).then(async (resolve) => {
        for (let i = 0; i < resolve.data.length; i++) {
            let jwkconditionString = ` jawak.aawak_ref_id = ${resolve.data[i]._id}`;
            await DB.getFullListByDept('jawak', req.params.dept_id, jwkconditionString).then(async (jwkdata) => {
                resolve.data[i].jawak_detail = jwkdata.data;
            }, (err) => {
                console.log("jawak", err);
            });
        }
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count
        });
    }, (err) => { return next(err) });
});

//pending aawak get dept
router.get('/pending/:dept_id', async (req, res, next) => {
    let conditionString = ` where aawak.dept_id = ${req.params.dept_id} AND remaining_qty <> 0`;
    await DB.getPendingAawak(conditionString).then(async (resolve) => {
        for (let i in resolve) {
            let jwkconditionString = ` aawak_ref_id = ${resolve[i]._id}`;
            await DB.getFullListByDept('jawak', req.params.dept_id, jwkconditionString).then((jwkdata) => {
                resolve[i].jawak_detail = jwkdata.data;
            }, (err) => {
                console.log('jawak', err);
            });
        }
        res.json({
            success: true,
            result: resolve || [],
        });
    }, (err) => { return next(err) });
});

//pending aawak get dept
router.put('/pending', async (req, res, next) => {
    if (req.body) {
        let conditionString = ` where remaining_qty <> 0`;
        if (req.body.dept_id) {
            conditionString += (conditionString ? ` AND ` : ` where `) + `aawak.dept_id = ${req.body.dept_id}`;
        }
        if (req.body.mm_id) {
            conditionString += (conditionString ? ` AND ` : ` where `) + `aawak.mm_id = ${req.body.mm_id}`;
        }
        await DB.getPendingAawak(conditionString).then(async (resolve) => {
            for (let i in resolve) {
                let jwkconditionString = ` aawak_ref_id = ${resolve[i]._id}`;
                await DB.getFullListByDept('jawak', req.body.dept_id, jwkconditionString).then((jwkdata) => {
                    resolve[i].jawak_detail = jwkdata.data;
                }, (err) => {
                    console.log('jawak', err);
                });
            }
            res.json({
                success: true,
                result: resolve || [],
            });
        }, (err) => { return next(err) });
    }
});

//aawak get by dept + filter + pageNo
router.put('/:dept_id', async (req, res, next) => {

    let orderBy = null, limit = 10, offset = null, page = 1;
    let conditionString = `1=1 ${req.body._id ? ` AND aawak._id = ${req.body._id}` : ``} ${req.body.mm_id.length > 0 ? ` AND aawak.mm_id in (${req.body.mm_id.join(',')})` : ``} ${req.body.aawak_mm_id.length > 0 ? ` AND aawak.aawak_mm_id in (${req.body.aawak_mm_id.join(',')})` : ``} ${req.body.pbk_id.length > 0 ? ` AND aawak.pbk_id in (${req.body.pbk_id.join(',')})` : ``} ${req.body.item_id.length > 0 ? ` AND aawak.item_id in (${req.body.item_id.join(',')})` : ``} ${req.body.subitem_id.length > 0 ? ` AND aawak.subitem_id in (${req.body.subitem_id.join(',')})` : ``} ${req.body.aawak_type_id.length > 0 ? ` AND aawak.aawak_type_id in (${req.body.aawak_type_id.join(',')})` : ``} ${req.body.product_id.length > 0 ? ` AND aawak.product_id in (${req.body.product_id.join(',')})` : ``} ${req.body.condition_id.length > 0 ? ` AND aawak.condition_id in (${req.body.condition_id.join(',')})` : ``} ${req.body.pkt_num ? ` AND aawak.pkt_num = ${req.body.pkt_num}` : ``} ${req.body.nimmit ? ` AND aawak.nimmit = ${req.body.nimmit}` : ``}`;
    if (conditionString.trim() == `1=1`) {
        orderBy = "aawak._id desc";
    }
    if (req.body.pageNo && req.body.pageNo > 0) {
        offset = (req.body.pageNo - 1) * limit;
        page = req.body.pageNo;
    }
    await DB.getFullListByDept('aawak', req.params.dept_id, conditionString, orderBy, limit, offset).then(async (resolve) => {
        for (let i in resolve.data) {
            let jwkconditionString = ` aawak_ref_id = ${resolve.data[i]._id}`;
            await DB.getFullListByDept('jawak', req.params.dept_id, jwkconditionString).then((jwkdata) => {
                resolve.data[i].jawak_detail = jwkdata.data;
            }, (err) => {
                console.log('jawak', err);
            });
        }
        res.json({
            success: true,
            result: resolve.data || [],
            pageNo: page,
            total_count: resolve.total_count
        });
    }, (err) => { return next(err) });
});

//  aawak get
// router.get('/', async (req, res, next) => {
//     let aawak = [];
//     await DB.getList('aawak').then((resolve) => {
//         aawak = resolve || [];
//     }, (err) => { return next(err) });

//     res.json({
//         success: true,
//         result: res || []
//     });
// });

// aawak update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'aawak._id = ' + req.body.query._id;
        let jawaks = [];
        if (req.body.set.jawak_detail) {
            jawaks = req.body.set.jawak_detail;
            delete req.body.set.jawak_detail;
        }
        if (req.body.set.remaining_qty) {
            delete req.body.set.remaining_qty;
        }
        await DB.update('aawak', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            data.jawak_detail = [];
            for (let i = 0; i < jawaks.length; i++) {
                if (!jawaks[i]._id) {
                    let jwkconditionString = `jawak._id = ${jawaks[i]._id}`;
                    jawaks[i].aawak_ref_id = data._id;
                    await DB.insertFromDept('jawak', jawaks[i], data.dept_id).then((jwkdata) => {
                        data.remaining_qty = data.remaining_qty - jwkdata.qty;
                        data.jawak_detail.push(jwkdata);
                    }, (err) => {
                        console.log("jawak err", err, "jawak", jawaks[i]);
                    });
                }
                else {
                    data.jawak_detail.push(jawaks[i]);
                }
            }
            res.json({
                success: true,
                result: data || {}
            });
        });
    }
    else {
        return next(new Error('Id not found.'))
    }
});


// aawak delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('aawak', condition, (err, data) => {
            if (err) {
                return next(err);
            }
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