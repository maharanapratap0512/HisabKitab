//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


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
        await DB.insertFromDept('aawak', req.body, req.params.dept_id).then(async (data) => {
            // console.log("data", data);
            if(req.body.jawakArr){
                data.jawakArr = [];
                for(let i = 0; i < req.body.jawakArr.length; i++){
                    await DB.insertFromDept('jawak', req.body.jawakArr[i], req.params.dept_id).then((jwkdata) => {
                        data.jawakArr.push(jwkdata);
                    },(err)=>{
                        console.log("jawak err", err, "jawak",req.body.jawakArr[i]);
                    });
                }
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
    await DB.getFullListByDept('aawak', req.params.dept_id).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve || [],
        });
    }, (err) => { return next(err) });
});

//pending aawak get dept
router.get('/pending/:dept_id', async (req, res, next) => {
    let conditionString = ` where aawak.dept_id = ${req.params.dept_id} AND remaining_qty <> 0`;
    await DB.getPendingAawak(conditionString).then(async (resolve) => {
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
            res.json({
                success: true,
                result: resolve || [],
            });
        }, (err) => { return next(err) });
    }
});

//aawak get dept and filter
router.put('/:dept_id', async (req, res, next) => {
    let conditionString = `1=1 ${req.body._id ? ` AND aawak._id = ${req.body._id}` : ``} ${req.body.mm_id.length > 0 ? ` AND aawak.mm_id in (${req.body.mm_id.join(',')})` : ``} ${req.body.aawak_mm_id.length > 0 ? ` AND aawak.aawak_mm_id in (${req.body.aawak_mm_id.join(',')})` : ``} ${req.body.pbk_id.length > 0 ? ` AND aawak.pbk_id in (${req.body.pbk_id.join(',')})` : ``} ${req.body.item_id.length > 0 ? ` AND aawak.item_id in (${req.body.item_id.join(',')})` : ``} ${req.body.subitem_id.length > 0 ? ` AND aawak.subitem_id in (${req.body.subitem_id.join(',')})` : ``} ${req.body.aawak_type_id.length > 0 ? ` AND aawak.aawak_type_id in (${req.body.aawak_type_id.join(',')})` : ``} ${req.body.product_id.length > 0 ? ` AND aawak.product_id in (${req.body.product_id.join(',')})` : ``} ${req.body.condition_id.length > 0 ? ` AND aawak.condition_id in (${req.body.condition_id.join(',')})` : ``} ${req.body.pkt_num ? ` AND aawak.pkt_num = ${req.body.pkt_num}` : ``} ${req.body.nimmit ? ` AND aawak.nimmit = ${req.body.nimmit}` : ``}`;

    await DB.getFullListByDept('aawak', req.params.dept_id, conditionString).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve || [],
        });
    }, (err) => { return next(err) });
});

//  aawak get 
router.get('/', async (req, res, next) => {
    let bachat = [];
    let aawak = [];
    await DB.getList('aawak').then((res) => {
        aawak = res || [];
    }, (err) => { return next(err) });
    await DB.getList('bachat').then((res) => {
        bachat = res || [];
    }, (err) => { return next(err) });
    res.json({
        success: true,
        result: { aawakEntry: aawak || [], bachatEntry: bachat || [] }
    });
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
        await DB.update('aawak', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
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