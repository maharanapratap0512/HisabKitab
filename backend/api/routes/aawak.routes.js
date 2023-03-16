
const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const query = require('../models/query');
const DB = new DBContex();

//  aawak add
router.post('/', async (req, res, next) => {
    if (req.body) {
        let aawak = {};
        await DB.insert('aawak', req.body).then((data) => {
            aawak = data;
        }, (err) => {
            return next(err);
        });

        let bachat = [];
        await DB.getList('bachat').then((resolve) => {
            bachat = resolve;
        }, (err) => {
            return next(err);
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
            // delete req.body.jawak_detail;
        }
        req.body.document = JSON.stringify(req.body.document ? req.body.document : {});
        req.body.isbill = req.body.isbill ? 1 : 0;
        await DB.insert('aawak', req.body, req.params.dept_id).then(async (data) => {
            console.log("data", data);
            data.jawak_detail = [];
            for (let i = 0; i < jawaks.length; i++) {
                jawaks[i].aawak_ref_id = data._id;
                await DB.insert('jawak', jawaks[i], req.params.dept_id).then((jwkdata) => {
                    data.remaining_qty = data.remaining_qty - jwkdata.qty;
                    data.jawak_detail.push(jwkdata);
                }, (err) => {
                    console.log("jawak err", err, "jawak", jawaks[i]);
                });
            }

            data.document = (data.document ? JSON.parse(data.document) : {});
            data.isbill = data.isbill ? true : false;

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

//aawak post with dept
router.post('/new/:dept_id', async (req, res, next) => {
    if (req.body) {
        let insertAawak = DB.db.transaction(async (awkobj, dept_id) => {
            try {
                // convert required column data to string      
                awkobj.document = JSON.stringify(awkobj.document ? awkobj.document : {});
                awkobj.isbill = awkobj.isbill ? 1 : 0;
                awkobj.dept_id = dept_id;
                awkobj.active = 1;
                // run insert query written query.js
                let awkResult = DB.db.prepare(DB.query.aawak.insert).run(awkobj);
                // if inserted successfully
                if (awkResult.changes == 1 && awkResult.lastInsertRowid) {
                    // maintain bachat_new states
                    // checking for bachat row exists or not and Update bachat row
                    // let bachat = await DB.getBachatFromAJ(awkobj);
                    await DB.updateBachatFromAJInsert(awkobj, 'Aawak');

                    // loop through jawak to add using awk _id
                    for (let i in awkobj.jawak_detail || []) {
                        awkobj.jawak_detail[i].aawak_ref_id = awkResult.lastInsertRowid;
                        awkobj.jawak_detail[i].active = 1;
                        let jwkResult = DB.db.prepare(DB.query.jawak.insert).run(awkobj.jawak_detail[i]);
                        if (jwkResult.changes) {
                            // maintain bachat_new states
                            // checking for bachat row exists or not and Update bachat row
                            // let bachat = await DB.getBachatFromAJ(awkobj.jawak_detail[i]);
                            await DB.updateBachatFromAJInsert(awkobj.jawak_detail[i], 'Jawak');
                        }
                    }

                    await DB.getList('aawak', { full: true, dept_id: dept_id, conditionString: ` aawak._id = ${awkResult.lastInsertRowid}` }).then(async (data) => {
                        for (let i in data.data) {
                            data.data[i].document = (data.data[i].document ? JSON.parse(data.data[i].document) : {});
                            data.data[i].isbill = data.data[i].isbill ? true : false;

                            let jwkconditionString = ` jawak.aawak_ref_id = ${data.data[i]._id}`;

                            await DB.getList('jawak', { full: true, dept_id: dept_id, conditionString: jwkconditionString }).then(async (jwkdata) => {
                                data.data[i].jawak_detail = jwkdata.data;
                            });
                        }
                        res.json({
                            result: data.data,
                            success: true
                        });
                    });
                }

            }
            catch (ex) {
                DB.db.prepare('ROLLBACK').run();
                next(ex);
            }
        });

        await insertAawak(req.body, req.params.dept_id);
    }

    else {
        return next(new Error('Please fill required fields.'))
    }
});

//aawak get dept
router.get('/:dept_id', async (req, res, next) => {
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    await DB.getList('aawak', { full: true, dept_id: req.params.dept_id, conditionString: null, orderBy: `aawak._id desc`, limit: 100 }).then(async (resolve) => {
        for (let i = 0; i < resolve.data.length; i++) {
            resolve.data[i].document = (resolve.data[i].document ? JSON.parse(resolve.data[i].document) : {});
            resolve.data[i].isbill = resolve.data[i].isbill ? true : false;
            let jwkconditionString = ` jawak.aawak_ref_id = ${resolve.data[i]._id}`;

            await DB.getList('jawak', { full: true, dept_id: req.params.dept_id, conditionString: jwkconditionString }).then(async (jwkdata) => {
                resolve.data[i].jawak_detail = jwkdata.data;
            }, (err) => {
                resolve.data[i].jawak_detail = []
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
    let conditionString = `remaining_qty <> 0`;

    await DB.getList("aawak", { full: true, dept_id: req.params.dept_id, conditionString: conditionString }).then(async (resolve) => {
        for (let i in resolve.data) {
            resolve.data[i].document = (resolve.data[i].document ? JSON.parse(resolve.data[i].document) : {});
            resolve.data[i].isbill = resolve.data[i].isbill ? true : false;
            let jwkconditionString = ` aawak_ref_id = ${resolve.data[i]._id}`;

            await DB.getList('jawak', { full: true, dept_id: req.params.dept_id, conditionString: jwkconditionString }).then((jwkdata) => {
                resolve.data[i].jawak_detail = jwkdata.data;
            }, (err) => {
                resolve.data[i].jawak_detail = [];
                console.log('jawak', err);
            });
        }
        res.json({
            success: true,
            result: resolve.data || [],
        });
    }, (err) => { return next(err) });
});

router.put('/pending/:dept_id', async (req, res, next) => {
    let conditionString = `remaining_qty <> 0 ${req.body.mm_id ? ` AND aawak.mm_id = ${req.body.mm_id}` : ``} `;

    await DB.getList("aawak", { full: true, dept_id: req.params.dept_id, conditionString: conditionString }).then(async (resolve) => {
        for (let i in resolve.data) {
            resolve.data[i].document = (resolve.data[i].document ? JSON.parse(resolve.data[i].document) : {});
            resolve.data[i].isbill = resolve.data[i].isbill ? true : false;
            let jwkconditionString = ` aawak_ref_id = ${resolve.data[i]._id}`;

            await DB.getList('jawak', { full: true, dept_id: req.params.dept_id, conditionString: jwkconditionString, orderBy: `jawak._id` }).then((jwkdata) => {
                resolve.data[i].jawak_detail = jwkdata.data;
            }, (err) => {
                resolve.data[i].jawak_detail = [];
                console.log('jawak', err);
            });
        }
        res.json({
            success: true,
            result: resolve.data || [],
        });
    }, (err) => { return next(err) });
});

// aawak update
router.put('/new', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let updateAawak = DB.db.transaction(async (awkobj) => {
            try {
                awkobj.document = JSON.stringify(awkobj.document ? awkobj.document : {});
                awkobj.isbill = awkobj.isbill ? 1 : 0;

                await DB.updateBachatFromAJUpdate(awkobj, 'aawak');
                let awkResult = await DB.db.prepare(DB.query.aawak.update + ` where aawak._id = ${awkobj._id}`).run(awkobj);
                if (awkResult) {

                    for (let i = 0; i < awkobj.jawak_detail.length; i++) {
                        if (!awkobj.jawak_detail[i]._id) {
                            awkobj.jawak_detail[i].aawak_ref_id = awkobj._id;
                            awkobj.jawak_detail[i].active = 1;
                            let jwkResult = DB.db.prepare(DB.query.jawak.insert).run(awkobj.jawak_detail[i]);
                            if(jwkResult){
                                DB.updateBachatFromAJInsert(awkobj.jawak_detail[i], 'jawak');
                            }
                        }
                    }

                    await DB.getList('aawak', { full: true, conditionString: ` aawak._id = ${awkobj._id}` }).then(async (data) => {
                        for (let i in data.data) {
                            data.data[i].document = (data.data[i].document ? JSON.parse(data.data[i].document) : {});
                            data.data[i].isbill = data.data[i].isbill ? true : false;

                            let jwkconditionString = ` jawak.aawak_ref_id = ${data.data[i]._id}`;

                            await DB.getList('jawak', { full: true, conditionString: jwkconditionString }).then(async (jwkdata) => {
                                data.data[i].jawak_detail = jwkdata.data;
                            });
                        }
                        res.json({
                            result: data.data,
                            success: true
                        });
                    });
                }
            }
            catch (ex) {
                return next(ex)
            }
        });

        await updateAawak(req.body.set);

    }
    else {
        return next(new Error('Id not found.'))
    }
});

//aawak get by dept + filter + pageNo
router.put('/filter/:dept_id', async (req, res, next) => {
    let orderBy = null, limit = 100, offset = null, page = 1;
    let conditionString = `1=1 ${req.body._id ? ` AND aawak._id = ${req.body._id}` : ``} ${req.body.month ? ` AND strftime('%m', aawak.date) = '${req.body.month}'` : ``} ${req.body.year ? ` AND strftime('%Y', aawak.date) = '${req.body.year}'` : ``} ${(req.body.mm_id && req.body.mm_id.length > 0) ? ` AND aawak.mm_id in (${req.body.mm_id.join(',')})` : ``} ${(req.body.aawak_mm_id && req.body.aawak_mm_id.length > 0) ? ` AND aawak.aawak_mm_id in (${req.body.aawak_mm_id.join(',')})` : ``} ${(req.body.pbk_id && req.body.pbk_id.length > 0) ? ` AND aawak.pbk_id in (${req.body.pbk_id.join(',')})` : ``} ${(req.body.item_id && req.body.item_id.length > 0) ? ` AND aawak.item_id in (${req.body.item_id.join(',')})` : ``} ${(req.body.subitem_id && req.body.subitem_id.length > 0) ? ` AND aawak.subitem_id in (${req.body.subitem_id.join(',')})` : ``} ${(req.body.aawak_type_id && req.body.aawak_type_id.length > 0) ? ` AND aawak.aawak_type_id in (${req.body.aawak_type_id.join(',')})` : ``} ${(req.body.product_id && req.body.product_id.length > 0) ? ` AND aawak.product_id in (${req.body.product_id.join(',')})` : ``} ${(req.body.condition_id && req.body.condition_id.length > 0) ? ` AND aawak.condition_id in (${req.body.condition_id.join(',')})` : ``} ${req.body.pkt_num ? ` AND aawak.pkt_num = '${req.body.pkt_num}'` : ``} ${(req.body.nimitt_id && req.body.nimitt_id.length > 0) ? ` AND aawak.nimitt_id in (${req.body.nimitt_id.join(',')})` : ``} ${req.body.remaining_qty ? `AND remaining_qty <> 0` : ``}`;
    if (req.body.orderBy) {
        orderBy = req.body.orderBy;
    }
    else if (conditionString.trim() == `1=1`) {
        orderBy = "aawak._id desc";
    }
    if (req.body.pageNo && req.body.pageNo > 0) {
        offset = (req.body.pageNo - 1) * limit;
        page = req.body.pageNo;
    }
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    await DB.getList('aawak', { full: true, dept_id: req.params.dept_id, conditionString: conditionString, orderBy: orderBy, limit: limit, offset: offset }).then(async (resolve) => {
        for (let i in resolve.data) {
            resolve.data[i].document = (resolve.data[i].document ? JSON.parse(resolve.data[i].document) : {});
            resolve.data[i].isbill = resolve.data[i].isbill ? true : false;
            let jwkconditionString = ` aawak_ref_id = ${resolve.data[i]._id}`;

            await DB.getList('jawak', { full: true, dept_id: req.params.dept_id, conditionString: jwkconditionString, orderBy: `jawak._id` }).then((jwkdata) => {
                resolve.data[i].jawak_detail = jwkdata.data;
            }, (err) => {
                resolve.data[i].jawak_detail = []
                console.log('jawak', err);
                // return next(err)
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

// aawak update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let jawaks = [];
        if (req.body.set.jawak_detail) {
            jawaks = req.body.set.jawak_detail;
            // delete req.body.set.jawak_detail;
        }
        // if (req.body.set.remaining_qty) {
        //     delete req.body.set.remaining_qty;
        // }
        req.body.set.document = JSON.stringify(req.body.set.document ? req.body.set.document : {});
        req.body.set.isbill = req.body.set.isbill ? 1 : 0;
        await DB.update('aawak', req.body.set, req.body.query._id).then(async (data) => {
            data.jawak_detail = [];
            data.document = (data.document ? JSON.parse(data.document) : {});
            data.isbill = data.isbill ? true : false;
            for (let i = 0; i < jawaks.length; i++) {
                if (!jawaks[i]._id) {

                    let jwkconditionString = `jawak._id = ${jawaks[i]._id}`;
                    jawaks[i].aawak_ref_id = data._id;
                    await DB.insert('jawak', jawaks[i], data.dept_id).then((jwkdata) => {
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
        }, (err) => {
            return next(err);
        });
    }
    else {
        return next(new Error('Id not found.'))
    }
});

// aawak delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        // let condition = '_id = ' + req.params.id;
        let deleteAawak = DB.db.transaction(async (id)=>{
            try{
                await DB.getList('jawak', {conditionString: ` aawak_ref_id = ${id}` }).then(async (jwkdata) => {
                    if(jwkdata.data){
                        for(let i in jwkdata.data){
                            await DB.updateBachatFromAJDelete(jwkdata.data[i], 'jawak');
                        }
                    }
                });
                await DB.getById('aawak', id).then((awkObj)=>{
                    DB.updateBachatFromAJDelete(awkObj, 'aawak');                
                });
                await DB.delete('aawak', id).then((data)=>{
                    res.json({
                        success:true,
                        result: data
                    })
                })
            }
            catch(ex){
                console.log(ex);
                return next(ex);
            }
        });
        await deleteAawak(req.params.id);
        // await DB.delete('aawak', req.params.id).then((data) => {
        //     res.json({
        //         success: true,
        //         result: data
        //     });
        // })
    }
    else {
        return next(new Error('Id not found.'))
    }

});


module.exports = router;