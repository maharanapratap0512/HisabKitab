
const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const Fn = require('../models/functions');
const query = require('../models/query');
const DB = new DBContex();


//aawak post with dept
router.post('/new/:dept_id', async (req, res, next) => {
    if (req.body) {

        req.body.dept_id = req.params.dept_id;
        try {
            await Fn.begin();
            await Fn.insertAJ(req.body, 'aawak').then(async (resolve) => {
                if (resolve) {
                    for (let i in req.body.jawak_detail) {
                        req.body.jawak_detail[i].aawak_ref_id = resolve;
                        await Fn.insertAJ(req.body.jawak_detail[i], 'jawak').then(async (jwkResult) => {
                        }, (err) => {
                            throw err;
                        })
                    }

                    await DB.getList('aawak', { full: true, conditionString: ` aawak._id = ${resolve}` }).then(async (data) => {
                        for (let i in data.data) {
                            data.data[i].document = (data.data[i].document ? JSON.parse(data.data[i].document) : {});
                            data.data[i].isbill = data.data[i].isbill ? true : false;

                            let jwkconditionString = ` jawak.aawak_ref_id = ${data.data[i]._id}`;

                            await DB.getList('jawak', { full: true, conditionString: jwkconditionString }).then(async (jwkdata) => {
                                data.data[i].jawak_detail = jwkdata.data;
                            });
                        }
                        Fn.commit();
                        res.json({
                            result: data.data,
                            success: true
                        });
                    }, (err) => {
                        throw err;
                    });
                }
            }, (reject) => {
                throw reject;
            });
        }
        catch (err) {
            Fn.rollback();;
            return next(err);
        }
    }

    else {
        return next(new Error('Please fill required fields.'))
    }
});

//aawak post with dept
router.post('/bunch/:dept_id', async (req, res, next) => {
    if (req.body) {
        req.body.dept_id = req.params.dept_id;
        try {
            await Fn.begin();
            let voucher_no = await Fn.getLastVoucherNo('aawak') + 1;
            for (let awk of req.body.aawaks) {
                let aawak = {
                    ...awk,
                    ...req.body,
                    voucher_no: voucher_no,
                }
                await Fn.insertAJ(aawak, 'aawak').then(async (resolve) => {
                    console.log(resolve);
                    if (resolve && aawak.jawak_detail && aawak.jawak_detail.length > 0) {
                        let jwk_voucher_no = await Fn.getLastVoucherNo('jawak') + 1;
                        for (let i in aawak.jawak_detail) {
                            aawak.jawak_detail[i].aawak_ref_id = resolve;
                            aawak.jawak_detail[i].voucher_no = jwk_voucher_no;
                            await Fn.insertAJ(aawak.jawak_detail[i], 'jawak').then(async (jwkResult) => {
                            }, (err) => {
                                throw err;
                            })
                        }
                    }
                }, (reject) => {
                    throw reject;
                });
            }
            await DB.allQuery('aawak', 'select_all_voucher', {
                conditionString: `aawak.voucher_no = ${voucher_no}`, obj: { limit: -1, offset: -1 }
            }).then(async (data) => {
                for (let i in data) {
                    await DB.allQuery('aawak', 'select_one_voucher', {
                        obj: { voucher_no: voucher_no }
                    }).then(async (aawaks) => {
                        for (let i in aawaks) {
                            aawaks[i].document = (aawaks[i].document ? JSON.parse(aawaks[i].document) : {});
                            aawaks[i].item_categories = (aawaks[i].item_categories ? JSON.parse(aawaks[i].item_categories) : {});
                            aawaks[i].subitem_categories = (aawaks[i].subitem_categories ? JSON.parse(aawaks[i].subitem_categories) : {});
                            let jwkconditionString = ` jawak.aawak_ref_id = ${aawaks[i]._id}`;
                            await DB.getList('jawak', { full: true, dept_id: req.params.dept_id, conditionString: jwkconditionString }).then(async (jwkdata) => {
                                aawaks[i].jawak_detail = jwkdata.data;
                            }, (err) => {
                                aawaks[i].jawak_detail = []
                                throw err;
                            });
                        }
                        data[i].aawaks = aawaks;

                    }, (err) => {
                        throw err;
                    });
                }
                await Fn.commit();
                res.json({
                    result: data,
                    success: true,
                });
            }, (err) => {
                throw err;
            });

        }
        catch (err) {
            console.log(err);
            Fn.rollback();;
            return next(err);
        }
    }

    else {
        return next(new Error('Please fill required fields.'))
    }
});

// aawak update
router.put('/bunch/:dept_id', async (req, res, next) => {
    if (req.body) {
        req.body.dept_id = req.params.dept_id;
        try {
            await Fn.begin();
            for (let awk of req.body.aawaks) {
                let aawak = {
                    ...req.body,
                    ...awk,
                }
                if (aawak._id) {
                    let oldAwk = await DB.getById('aawak', aawak._id);
                    await Fn.updateAJ(aawak, 'aawak', oldAwk).then(async (resolve) => {
                        await DB.getList('jawak', { conditionString: ` aawak_ref_id = ${oldAwk._id}` }).then(async (jwkdata) => {
                            if (jwkdata.data) {
                                for (let jwk of jwkdata.data) {
                                    let jwkNew = {
                                        ...jwk,
                                        condition_id: aawak.condition_id,
                                        mm_id: aawak.mm_id,
                                        item_id: aawak.item_id,
                                        subitem_id: aawak.subitem_id,
                                        product_id: aawak.product_id,
                                        condition_id: aawak.condition_id,
                                        unit_id: aawak.unit_id,
                                        dept_id: aawak.dept_id,
                                    }
                                    await Fn.updateAJ(jwkNew, 'jawak', jwk).then((data) => {
                                    }, (err) => {
                                        console.log('jwk', err);
                                        throw err;
                                    });
                                }
                            }
                        }, (err) => {
                            throw err;
                        });

                        if (aawak.jawak_detail) {
                            for (let i = 0; i < aawak.jawak_detail.length; i++) {
                                if (!aawak.jawak_detail[i]._id) {
                                    aawak.jawak_detail[i].aawak_ref_id = oldAwk._id;
                                    await Fn.insertAJ(aawak.jawak_detail[i], 'jawak').then(async (jwkResult) => {
                                    }, (err) => {
                                        throw err;
                                    })
                                }
                            }
                        }
                    }, (err) => {
                        throw err;
                    });

                } else {
                    await Fn.insertAJ(aawak, 'aawak').then(async (resolve) => {
                        if (resolve && aawak.jawak_detail && aawak.jawak_detail.length > 0) {
                            let jwk_voucher_no = await Fn.getLastVoucherNo('jawak') + 1;
                            for (let i in aawak.jawak_detail) {
                                aawak.jawak_detail[i].aawak_ref_id = resolve;
                                aawak.jawak_detail[i].voucher_no = jwk_voucher_no;
                                await Fn.insertAJ(aawak.jawak_detail[i], 'jawak').then(async (jwkResult) => {
                                }, (err) => {
                                    throw err;
                                })
                            }
                        }
                    }, (reject) => {
                        throw reject;
                    });
                }
            }

            let conditionString = `aawak.voucher_no = ${req.body.voucher_no}`;
            await DB.getList('aawak_voucher', { full: true, dept_id: req.params.dept_id, conditionString: conditionString }).then(async (resolve) => {
                for (let i in resolve.data) {
                    resolve.data[i].aawaks = (resolve.data[i].aawaks ? JSON.parse(resolve.data[i].aawaks) : {});

                    for (let j in resolve.data[i].aawaks) {
                        resolve.data[i].aawaks[j].document = (resolve.data[i].aawaks[j].document ? JSON.parse(resolve.data[i].aawaks[j].document) : {});
                        resolve.data[i].aawaks[j].item_categories = resolve.data[i].aawaks[j].item_categories ? JSON.parse(resolve.data[i].aawaks[j].item_categories) : [];
                        resolve.data[i].aawaks[j].subitem_categories = resolve.data[i].aawaks[j].subitem_categories ? JSON.parse(resolve.data[i].aawaks[j].subitem_categories) : [];
                        resolve.data[i].aawaks[j].isbill = resolve.data[i].aawaks[j].isbill ? true : false;
                        let jwkconditionString = `aawak_ref_id = ${resolve.data[i].aawaks[j]._id}`;

                        await DB.getList('jawak', { full: true, dept_id: req.params.dept_id, conditionString: jwkconditionString, orderBy: `jawak._id` }).then((jwkdata) => {
                            resolve.data[i].aawaks[j].jawak_detail = jwkdata.data;
                        }, (err) => {
                            resolve.data[i].aawaks[j].jawak_detail = []
                            console.log('jawak', err);
                        });
                    }
                }
                await Fn.commit();
                res.json({
                    success: true,
                    result: resolve.data || [],
                    total_count: resolve.total_count
                });
            }, (err) => {
                console.log(err); return next(err)
            });

        } catch (err) {
            await Fn.rollback();
            return next(err);
        }

    }
    else {
        throw new Error('Id not found.')
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
    try {
        if (req.body.set && req.body.query) {
            await Fn.begin();
            // await updateAawak(req.body.set);
            let oldAwk = await DB.getById('aawak', req.body.set._id);
            await Fn.updateAJ(req.body.set, 'aawak', oldAwk).then(async (resolve) => {
                await DB.getList('jawak', { conditionString: ` aawak_ref_id = ${oldAwk._id}` }).then(async (jwkdata) => {
                    if (jwkdata.data) {
                        for (let jwk of jwkdata.data) {
                            let jwkNew = {
                                ...jwk,
                                condition_id: req.body.set.condition_id,
                                mm_id: req.body.set.mm_id,
                                item_id: req.body.set.item_id,
                                subitem_id: req.body.set.subitem_id,
                                product_id: req.body.set.product_id,
                                condition_id: req.body.set.condition_id,
                                unit_id: req.body.set.unit_id,
                                dept_id: req.body.set.dept_id,
                            }
                            await Fn.updateAJ(jwkNew, 'jawak', jwk).then((data) => {
                            }, (err) => {
                                console.log('jwk', err);
                                throw err;
                            });
                        }
                    }
                }, (err) => {
                    throw err;
                });

                for (let i = 0; i < req.body.set.jawak_detail.length; i++) {
                    if (!req.body.set.jawak_detail[i]._id) {
                        req.body.set.jawak_detail[i].aawak_ref_id = oldAwk._id;
                        await Fn.insertAJ(req.body.set.jawak_detail[i], 'jawak').then(async (jwkResult) => {
                        }, (err) => {
                            throw err;
                        })
                    }
                }

                await DB.getList('aawak', { full: true, conditionString: ` aawak._id = ${req.body.set._id}` }).then(async (data) => {
                    for (let i in data.data) {
                        data.data[i].document = (data.data[i].document ? JSON.parse(data.data[i].document) : {});
                        data.data[i].isbill = data.data[i].isbill ? true : false;

                        let jwkconditionString = ` jawak.aawak_ref_id = ${data.data[i]._id}`;

                        await DB.getList('jawak', { full: true, conditionString: jwkconditionString }).then(async (jwkdata) => {
                            data.data[i].jawak_detail = jwkdata.data;
                        });
                    }
                    await Fn.commit();
                    res.json({
                        result: data.data,
                        success: true
                    });
                }, (err) => {
                    throw err;
                });

            }, (reject) => {
                throw reject;
            })

        }
        else {
            throw new Error('Id not found.')
        }
    }
    catch (err) {
        await Fn.rollback();
        return next(err);
    }
});

//aawak & jawak distribution get by dept + filter + pageNo
router.put('/filter/:dept_id', async (req, res, next) => {
    let orderBy = null, limit = 100, offset = null, page = 1, conditionString, jwkIds;
    if (req.body.type == 'jawak') {
        let jwkConditionString = `1=1 ${req.body.date ? ` AND date = '${req.body.date}'` : ''} ${req.body.year ? ` AND strftime('%Y', jawak.date) = '${req.body.year}'` : ''} ${req.body.month ? ` AND strftime('%m', jawak.date) = '${req.body.month.toString().padStart(2, '0')}'` : ''} ${req.body.mm_id && req.body.mm_id.length > 0 ? ` AND jawak.mm_id in (${req.body.mm_id.join(',')})` : ''} ${req.body.condition_id && req.body.condition_id.length > 0 ? ` AND jawak.condition_id in (${req.body.condition_id.join(',')})` : ''} ${req.body.item_id && req.body.item_id.length > 0 ? ` AND jawak.item_id in (${req.body.item_id.join(',')})` : ''} ${req.body.aj_mm_id && req.body.aj_mm_id.length > 0 ? ` AND jawak.jawak_mm_id in (${req.body.aj_mm_id.join(',')})` : ''} ${req.body.jawak_type_id && req.body.jawak_type_id.length > 0 ? ` AND jawak.jawak_type_id in (${req.body.jawak_type_id.join(',')})` : ''} ${req.body.pbk_id && req.body.pbk_id.length > 0 ? ` AND jawak.pbk_id in (${req.body.pbk_id.join(',')})` : ''} ${req.body.subitem_id && req.body.subitem_id.length > 0 ? ` AND jawak.subitem_id in (${req.body.subitem_id.join(',')})` : ''} ${req.body.product_id && req.body.product_id.length > 0 ? ` AND jawak.product_id in (${req.body.product_id.join(',')})` : ''} ${(req.body.nimitt_id && req.body.nimitt_id && req.body.nimitt_id.length > 0) ? ` AND jawak.nimitt_id in ${req.body.nimitt_id.join(',')}` : ''} ${req.body.pkt_num ? ` AND jawak.pkt_num = ${req.body.pkt_num}` : ''} ${req.body.usage_list_id && req.body.usage_list_id.length > 0 ? ` AND jawak.usage_list_id in (${req.body.usage_list_id.join(',')})` : ''}`

        jwkIds = await DB.db.prepare(`select _id from jawak where ${jwkConditionString}`).all();
        if (jwkIds && jwkIds.length > 0) {
            jwkIds = jwkIds.map(j => j._id).join(',');
        }

        conditionString = ` aawak._id in (select aawak_ref_id from jawak where jawak._id in (${jwkIds}))`;

    } else {
        conditionString = `1=1 ${req.body._id ? ` AND aawak._id = ${req.body._id}` : ``} ${req.body.date ? ` AND date = '${req.body.date}'` : ''} ${req.body.month ? ` AND strftime('%m', aawak.date) = '${req.body.month}'` : ``} ${req.body.year ? ` AND strftime('%Y', aawak.date) = '${req.body.year}'` : ``} ${(req.body.mm_id && req.body.mm_id.length > 0) ? ` AND aawak.mm_id in (${req.body.mm_id.join(',')})` : ``} ${(req.body.aj_mm_id && req.body.aj_mm_id.length > 0) ? ` AND aawak.aawak_mm_id in (${req.body.aj_mm_id.join(',')})` : ``} ${(req.body.pbk_id && req.body.pbk_id.length > 0) ? ` AND aawak.pbk_id in (${req.body.pbk_id.join(',')})` : ``} ${(req.body.item_id && req.body.item_id.length > 0) ? ` AND aawak.item_id in (${req.body.item_id.join(',')})` : ``} ${(req.body.subitem_id && req.body.subitem_id.length > 0) ? ` AND aawak.subitem_id in (${req.body.subitem_id.join(',')})` : ``} ${(req.body.aawak_type_id && req.body.aawak_type_id.length > 0) ? ` AND aawak.aawak_type_id in (${req.body.aawak_type_id.join(',')})` : ``} ${(req.body.product_id && req.body.product_id.length > 0) ? ` AND aawak.product_id in (${req.body.product_id.join(',')})` : ``} ${(req.body.condition_id && req.body.condition_id.length > 0) ? ` AND aawak.condition_id in (${req.body.condition_id.join(',')})` : ``} ${req.body.pkt_num ? ` AND aawak.pkt_num = '${req.body.pkt_num}'` : ``} ${(req.body.nimitt_id && req.body.nimitt_id.length > 0) ? ` AND aawak.nimitt_id in (${req.body.nimitt_id.join(',')})` : ``} ${req.body.remaining_qty ? `AND remaining_qty <> 0` : ``}`;

    }

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

    await DB.getList('aawak', { full: true, dept_id: req.params.dept_id, conditionString: conditionString, orderBy: orderBy, limit: limit, offset: offset }).then(async (resolve) => {
        for (let i in resolve.data) {
            resolve.data[i].document = (resolve.data[i].document ? JSON.parse(resolve.data[i].document) : {});
            resolve.data[i].isbill = resolve.data[i].isbill ? true : false;
            let jwkconditionString = `${jwkIds && jwkIds.length > 0 ? ` jawak._id in (${jwkIds}) AND ` : ``} aawak_ref_id = ${resolve.data[i]._id}`;

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


//VOUCHER WISE - aawak & jawak distribution get by dept + filter + pageNo
router.put('/voucher/:dept_id', async (req, res, next) => {
    let orderBy = null, limit = 100, offset = null, page = 1, conditionString, jwkIds;
    if (req.body.type == 'jawak') {
        let jwkConditionString = `1=1 ${req.body.date ? ` AND date = '${req.body.date}'` : ''} ${req.body.year ? ` AND strftime('%Y', jawak.date) = '${req.body.year}'` : ''} ${req.body.month ? ` AND strftime('%m', jawak.date) = '${req.body.month.toString().padStart(2, '0')}'` : ''} ${req.body.mm_id && req.body.mm_id.length > 0 ? ` AND jawak.mm_id in (${req.body.mm_id.join(',')})` : ''} ${req.body.condition_id && req.body.condition_id.length > 0 ? ` AND jawak.condition_id in (${req.body.condition_id.join(',')})` : ''} ${req.body.item_id && req.body.item_id.length > 0 ? ` AND jawak.item_id in (${req.body.item_id.join(',')})` : ''} ${req.body.aj_mm_id && req.body.aj_mm_id.length > 0 ? ` AND jawak.jawak_mm_id in (${req.body.aj_mm_id.join(',')})` : ''} ${req.body.jawak_type_id && req.body.jawak_type_id.length > 0 ? ` AND jawak.jawak_type_id in (${req.body.jawak_type_id.join(',')})` : ''} ${req.body.pbk_id && req.body.pbk_id.length > 0 ? ` AND jawak.pbk_id in (${req.body.pbk_id.join(',')})` : ''} ${req.body.subitem_id && req.body.subitem_id.length > 0 ? ` AND jawak.subitem_id in (${req.body.subitem_id.join(',')})` : ''} ${req.body.product_id && req.body.product_id.length > 0 ? ` AND jawak.product_id in (${req.body.product_id.join(',')})` : ''} ${(req.body.nimitt_id && req.body.nimitt_id && req.body.nimitt_id.length > 0) ? ` AND jawak.nimitt_id in ${req.body.nimitt_id.join(',')}` : ''} ${req.body.pkt_num ? ` AND jawak.pkt_num = ${req.body.pkt_num}` : ''} ${req.body.usage_list_id && req.body.usage_list_id.length > 0 ? ` AND jawak.usage_list_id in (${req.body.usage_list_id.join(',')})` : ''}`

        jwkIds = await DB.db.prepare(`select _id from jawak where ${jwkConditionString}`).all();
        if (jwkIds && jwkIds.length > 0) {
            jwkIds = jwkIds.map(j => j._id).join(',');
        }

        conditionString = ` aawak._id in (select aawak_ref_id from jawak where jawak._id in (${jwkIds}))`;

    } else {
        conditionString = `1=1 ${req.body._id ? ` AND aawak._id = ${req.body._id}` : ``} ${req.body.date ? ` AND date = '${req.body.date}'` : ''} ${req.body.month ? ` AND strftime('%m', aawak.date) = '${req.body.month}'` : ``} ${req.body.year ? ` AND strftime('%Y', aawak.date) = '${req.body.year}'` : ``} ${(req.body.mm_id && req.body.mm_id.length > 0) ? ` AND aawak.mm_id in (${req.body.mm_id.join(',')})` : ``} ${(req.body.aj_mm_id && req.body.aj_mm_id.length > 0) ? ` AND aawak.aawak_mm_id in (${req.body.aj_mm_id.join(',')})` : ``} ${(req.body.pbk_id && req.body.pbk_id.length > 0) ? ` AND aawak.pbk_id in (${req.body.pbk_id.join(',')})` : ``} ${(req.body.item_id && req.body.item_id.length > 0) ? ` AND aawak.item_id in (${req.body.item_id.join(',')})` : ``} ${(req.body.subitem_id && req.body.subitem_id.length > 0) ? ` AND aawak.subitem_id in (${req.body.subitem_id.join(',')})` : ``} ${(req.body.aawak_type_id && req.body.aawak_type_id.length > 0) ? ` AND aawak.aawak_type_id in (${req.body.aawak_type_id.join(',')})` : ``} ${(req.body.product_id && req.body.product_id.length > 0) ? ` AND aawak.product_id in (${req.body.product_id.join(',')})` : ``} ${(req.body.condition_id && req.body.condition_id.length > 0) ? ` AND aawak.condition_id in (${req.body.condition_id.join(',')})` : ``} ${req.body.pkt_num ? ` AND aawak.pkt_num = '${req.body.pkt_num}'` : ``} ${(req.body.nimitt_id && req.body.nimitt_id.length > 0) ? ` AND aawak.nimitt_id in (${req.body.nimitt_id.join(',')})` : ``} ${req.body.remaining_qty ? `AND remaining_qty <> 0` : ``}`;

    }

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
    await DB.getList('aawak_voucher', { full: true, dept_id: req.params.dept_id, conditionString: conditionString, limit: limit, offset: offset }).then(async (resolve) => {
        for (let i in resolve.data) {
            resolve.data[i].aawaks = (resolve.data[i].aawaks ? JSON.parse(resolve.data[i].aawaks) : {});

            for (let j in resolve.data[i].aawaks) {
                resolve.data[i].aawaks[j].document = (resolve.data[i].aawaks[j].document ? JSON.parse(resolve.data[i].aawaks[j].document) : {});
                resolve.data[i].aawaks[j].item_categories = resolve.data[i].aawaks[j].item_categories ? JSON.parse(resolve.data[i].aawaks[j].item_categories) : [];
                resolve.data[i].aawaks[j].subitem_categories = resolve.data[i].aawaks[j].subitem_categories ? JSON.parse(resolve.data[i].aawaks[j].subitem_categories) : [];
                resolve.data[i].aawaks[j].isbill = resolve.data[i].aawaks[j].isbill ? true : false;
                let jwkconditionString = `${jwkIds && jwkIds.length > 0 ? ` jawak._id in (${jwkIds}) AND ` : ``} aawak_ref_id = ${resolve.data[i].aawaks[j]._id}`;

                await DB.getList('jawak', { full: true, dept_id: req.params.dept_id, conditionString: jwkconditionString, orderBy: `jawak._id` }).then((jwkdata) => {
                    resolve.data[i].aawaks[j].jawak_detail = jwkdata.data;
                }, (err) => {
                    resolve.data[i].aawaks[j].jawak_detail = []
                    console.log('jawak', err);
                    // return next(err)
                });
            }
        }
        res.json({
            success: true,
            result: resolve.data || [],
            pageNo: page,
            total_count: resolve.total_count
        });
    }, (err) => {
        console.log(err); return next(err)
    });
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
        try {
            await Fn.begin();
            await DB.getList('jawak', { conditionString: ` aawak_ref_id = ${req.params.id}` }).then(async (jwkdata) => {
                if (jwkdata.data) {
                    for (let i in jwkdata.data) {
                        await Fn.deleteAJ(jwkdata.data[i]._id, 'jawak', jwkdata.data[i]);
                    }
                }
            });
            await Fn.deleteAJ(req.params.id, 'aawak').then((data) => {
                if (data) {
                    Fn.commit();
                    res.json({
                        success: true,
                        result: data
                    })
                }
            });
        }
        catch (ex) {
            await Fn.rollback();
            return next(ex);
        }
    }
    else {
        return next(new Error('Id not found.'))
    }

});

// aawak voucher delete
router.delete('/voucher/:ids', async (req, res, next) => {
    if (req.params.ids) {
        try {
            await Fn.begin();
            let ids = JSON.parse(req.params.ids);
            for (let id of ids) {
                await DB.getList('jawak', { conditionString: ` aawak_ref_id = ${id}` }).then(async (jwkdata) => {
                    if (jwkdata.data) {
                        for (let i in jwkdata.data) {
                            await Fn.deleteAJ(jwkdata.data[i]._id, 'jawak', jwkdata.data[i]);
                        }
                    }
                });
                await Fn.deleteAJ(id, 'aawak');
            }
            Fn.commit();
            res.json({
                success: true,
            })

        } catch (ex) {
            await Fn.rollback();
            return next(ex);
        }
    }
    else {
        return next(new Error('Id not found.'))
    }

});


module.exports = router;