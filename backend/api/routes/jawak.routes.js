const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const Fn = require('../database/functions');


// get jawak
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('jawak').then((data) => {
            res.json({
                success: true,
                result: data || []
            });
        });
    } catch (err) { next(err) };
});


// get jawak from department
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('jawak', { full: true, dept_id: req.params.dept_id }).then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


//get jawak by dept + filter + pageNo
router.put('/filter/:dept_id', async (req, res, next) => {
    try {
        let orderBy = null, limit = 100, offset = null, page = 1, conditionString = '';
        if (req.body.or) {
            let conditions = [];
            if (req.body.mm_id && req.body.mm_id.length > 0)
                conditions.push(`jawak.mm_id in (${req.body.mm_id.join(',')})`)
            if (req.body.aj_mm_id && req.body.aj_mm_id.length > 0)
                conditions.push(`jawak.jawak_mm_id in (${req.body.aj_mm_id.join(',')})`)
            if (req.body.pbk_id && req.body.pbk_id.length > 0)
                conditions.push(`jawak.pbk_id in (${req.body.pbk_id.join(',')})`)
            if (req.body.item_id && req.body.item_id.length > 0) {
                if (req.body.itemOnly) {
                    conditions.push(`jawak.item_id in (${req.body.item_id.join(',')}) AND (jawak.subitem_id IS NULL OR jawak.subitem_id = 0)`)
                } else {
                    conditions.push(`jawak.item_id in (${req.body.item_id.join(',')})`)
                }
            }
            if (req.body.subitem_id && req.body.subitem_id.length > 0 && !req.body.itemOnly)
                conditions.push(`jawak.subitem_id in (${req.body.subitem_id.join(',')})`)
            if (req.body.jawak_type_id && req.body.jawak_type_id.length > 0)
                conditions.push(`jawak.jawak_type_id in (${req.body.jawak_type_id.join(',')})`)
            if (req.body.product_id && req.body.product_id.length > 0)
                conditions.push(`jawak.product_id in (${req.body.product_id.join(',')})`)
            if (req.body.condition_id && req.body.condition_id.length > 0)
                conditions.push(`jawak.condition_id in (${req.body.condition_id.join(',')})`)
            if (req.body.nimitt_id && req.body.nimitt_id.length > 0)
                conditions.push(`jawak.nimitt_id in (${req.body.nimitt_id.join(',')})`)

            conditionString = conditions.length > 0 ? `(${conditions.join(' OR ')})` : `1=1`;
        } else {
            conditionString = `1=1 ${req.body.date ? ` AND jawak.date = '${req.body.date}'` : ''} ${req.body.date_from ? ` AND jawak.date >= '${req.body.date_from}'` : ''} ${req.body.date_to ? ` AND jawak.date <= '${req.body.date_to}'` : ''} ${req.body.year ? ` AND strftime('%Y', jawak.date) = '${req.body.year}'` : ''} ${req.body.month ? ` AND strftime('%m', jawak.date) = '${req.body.month.toString().padStart(2, '0')}'` : ''} ${req.body.mm_id && req.body.mm_id.length > 0 ? ` AND jawak.mm_id in (${req.body.mm_id.join(',')})` : ''} ${req.body.zone_id && req.body.zone_id.length > 0 ? ` AND mm_zone_id in (${req.body.zone_id.join(',')})` : ''} ${req.body.condition_id && req.body.condition_id.length > 0 ? ` AND jawak.condition_id in (${req.body.condition_id.join(',')})` : ''} ${req.body.item_id && req.body.item_id.length > 0 ? ` AND jawak.item_id in (${req.body.item_id.join(',')}) ${req.body.itemOnly ? ' AND (jawak.subitem_id IS NULL OR jawak.subitem_id = 0)' : ''}` : ''} ${req.body.jawak_mm_id && req.body.jawak_mm_id.length > 0 ? ` AND jawak.jawak_mm_id in (${req.body.jawak_mm_id.join(',')})` : ''} ${req.body.jawak_type_id && req.body.jawak_type_id.length > 0 ? ` AND jawak.jawak_type_id in (${req.body.jawak_type_id.join(',')})` : ''} ${req.body.pbk_id && req.body.pbk_id.length > 0 ? ` AND jawak.pbk_id in (${req.body.pbk_id.join(',')})` : ''} ${req.body.subitem_id && req.body.subitem_id.length > 0 && !req.body.itemOnly ? ` AND jawak.subitem_id in (${req.body.subitem_id.join(',')})` : ''} ${req.body.product_id && req.body.product_id.length > 0 ? ` AND jawak.product_id in (${req.body.product_id.join(',')})` : ''} ${(req.body.nimitt_id && req.body.nimitt_id.length > 0) ? ` AND jawak.nimitt_id in ${req.body.nimitt_id.join(',')}` : ''} ${req.body.pkt_num ? ` AND jawak.pkt_num LIKE '%${req.body.pkt_num}%'` : ''} ${req.body.voucher_no ? ` AND jawak.voucher_no LIKE '%${req.body.voucher_no}%'` : ''} ${req.body.reg_pg_no ? ` AND jawak.reg_pg_no LIKE '%${req.body.reg_pg_no}%'` : ''} ${req.body.lot_no ? ` AND jawak.lot_no LIKE '%${req.body.lot_no}%'` : ''} ${req.body.usage_list_id && req.body.usage_list_id.length > 0 ? ` AND jawak.usage_list_id in (${req.body.usage_list_id.join(',')})` : ''} ${req.body.unlinkedOnly ? ` AND jawak.aawak_ref_id IS NULL` : ''} ${req.body.notReceivedOnly ? ` AND (jawak.is_recieved = 0 OR jawak.is_recieved IS NULL)` : ''} ${req.body.categories && req.body.categories.length > 0 ? ` AND (jawak.item_id IN (SELECT item_id FROM rel_item_category WHERE category_id IN (${req.body.categories.join(',')})) OR jawak.subitem_id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id IN (${req.body.categories.join(',')})))` : ''}`
        }

        if (conditionString.trim() == `1=1`) {
            orderBy = "jawak.updated_at desc";
        }
        if (req.body.pageNo && req.body.pageNo > 0) {
            offset = (req.body.pageNo - 1) * limit;
            page = req.body.pageNo
        }
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('jawak', { full: true, dept_id: req.params.dept_id, conditionString: conditionString, orderBy: orderBy, limit: limit, offset: offset }).then((resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].enz = (resolve.data[i].enz ? JSON.parse(resolve.data[i].enz) : {});
                resolve.data[i].usage_report = (resolve.data[i].usage_report ? JSON.parse(resolve.data[i].usage_report) : {});
                resolve.data[i].icategories = (resolve.data[i].icategories ? JSON.parse(resolve.data[i].icategories) : []);
                resolve.data[i].scategories = (resolve.data[i].scategories ? JSON.parse(resolve.data[i].scategories) : []);
            }
            res.json({
                success: true,
                pageNo: page,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
})

//VOUCHER WISE - jawak get by dept + filter + pageNo
router.put('/voucher/:dept_id', async (req, res, next) => {
    let orderBy = null, limit = 100, offset = null, page = 1, conditionString, conditions = [];

    if (req.body._id)
        conditions.push(`jawak._id = ${req.body._id}`)
    if (req.body.date)
        conditions.push(`jawak.date = ${req.body.date}`)
    if (req.body.date_from)
        conditions.push(`jawak.date >= '${req.body.date_from}'`)
    if (req.body.date_to)
        conditions.push(`jawak.date <= '${req.body.date_to}'`)
    if (req.body.lot_no)
        conditions.push(`jawak.lot_no LIKE '%${req.body.lot_no}%'`)
    if (req.body.month)
        conditions.push(`strftime('%m', jawak.date) = '${req.body.month}'`)
    if (req.body.year)
        conditions.push(`strftime('%Y', jawak.date) = '${req.body.year}'`)
    if (req.body.mm_id && req.body.mm_id.length > 0)
        conditions.push(`jawak.mm_id in (${req.body.mm_id.join(',')})`)
    if (req.body.jawak_mm_id && req.body.jawak_mm_id.length > 0)
        conditions.push(`jawak.jawak_mm_id in (${req.body.jawak_mm_id.join(',')})`)
    if (req.body.pbk_id && req.body.pbk_id.length > 0)
        conditions.push(`jawak.pbk_id in (${req.body.pbk_id.join(',')})`)
    if (req.body.nimitt_id && req.body.nimitt_id.length > 0)
        conditions.push(`jawak.nimitt_id in (${req.body.nimitt_id.join(',')})`)
    if (req.body.item_id && req.body.item_id.length > 0) {
        if (req.body.itemOnly) {
            conditions.push(`jawak.item_id in (${req.body.item_id.join(',')}) AND (jawak.subitem_id IS NULL OR jawak.subitem_id = 0)`)
        } else {
            conditions.push(`jawak.item_id in (${req.body.item_id.join(',')})`)
        }
    }
    if (req.body.subitem_id && req.body.subitem_id.length > 0 && !req.body.itemOnly)
        conditions.push(`jawak.subitem_id in (${req.body.subitem_id.join(',')})`)
    if (req.body.jawak_type_id && req.body.jawak_type_id.length > 0)
        conditions.push(`jawak.jawak_type_id in (${req.body.jawak_type_id.join(',')})`)
    if (req.body.product_id && req.body.product_id.length > 0)
        conditions.push(`jawak.product_id in (${req.body.product_id.join(',')})`)
    if (req.body.condition_id && req.body.condition_id.length > 0)
        conditions.push(`jawak.condition_id in (${req.body.condition_id.join(',')})`)
    if (req.body.usage_list_id && req.body.usage_list_id.length > 0)
        conditions.push(`jawak.usage_list_id in (${req.body.usage_list_id.join(',')})`)
    if (req.body.aj_mm_id && req.body.aj_mm_id.length > 0)
        conditions.push(`jawak.jawak_mm_id in (${req.body.aj_mm_id.join(',')})`)
    if (req.body.voucher_no)
        conditions.push(`jawak.voucher_no LIKE '%${req.body.voucher_no}%'`)
    if (req.body.pkt_num)
        conditions.push(`jawak.pkt_num LIKE '%${req.body.pkt_num}%'`)
    if (req.body.reg_pg_no)
        conditions.push(`jawak.reg_pg_no LIKE '%${req.body.reg_pg_no}%'`)
    if (req.body.unlinkedOnly)
        // Match vouchers that have at least one unlinked jawak item (or standalone unlinked jawaks)
        conditions.push(`(
            (jawak.voucher_no IS NOT NULL AND jawak.voucher_no IN (
                SELECT DISTINCT voucher_no FROM jawak WHERE aawak_ref_id IS NULL AND voucher_no IS NOT NULL
            ))
            OR (jawak.voucher_no IS NULL AND jawak.aawak_ref_id IS NULL)
        )`)
    if (req.body.notReceivedOnly)
        // Match vouchers that have at least one unreceived jawak item
        conditions.push(`(
            (jawak.voucher_no IS NOT NULL AND jawak.voucher_no IN (
                SELECT DISTINCT voucher_no FROM jawak WHERE (is_recieved = 0 OR is_recieved IS NULL) AND voucher_no IS NOT NULL
            ))
            OR (jawak.voucher_no IS NULL AND (jawak.is_recieved = 0 OR jawak.is_recieved IS NULL))
        )`)
    if (req.body.categories && req.body.categories.length > 0)
        conditions.push(`(
            (jawak.voucher_no IS NOT NULL AND jawak.voucher_no IN (
                SELECT DISTINCT voucher_no FROM jawak WHERE (item_id IN (SELECT item_id FROM rel_item_category WHERE category_id IN (${req.body.categories.join(',')})) OR subitem_id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id IN (${req.body.categories.join(',')}))) AND voucher_no IS NOT NULL
            ))
            OR (jawak.voucher_no IS NULL AND (jawak.item_id IN (SELECT item_id FROM rel_item_category WHERE category_id IN (${req.body.categories.join(',')})) OR jawak.subitem_id IN (SELECT subitem_id FROM rel_subitem_category WHERE category_id IN (${req.body.categories.join(',')}))))
        )`)

    conditionString = conditions.length > 0 ? conditions.join(' AND ') : "1=1"

    if (req.body.orderBy) {
        orderBy = req.body.orderBy;
    }
    else if (conditionString.trim() == `1=1`) {
        orderBy = "jawak._id desc";
    }

    if (req.body.pageNo && req.body.pageNo > 0) {
        offset = (req.body.pageNo - 1) * limit;
        page = req.body.pageNo;
    }
    await DB.getList('jawak_voucher', { full: true, dept_id: req.params.dept_id, conditionString: conditionString, limit: limit, offset: offset }).then(async (resolve) => {
        for (let i in resolve.data) {
            resolve.data[i].jawaks = (resolve.data[i].jawaks ? JSON.parse(resolve.data[i].jawaks) : {});

            for (let j in resolve.data[i].jawaks) {
                resolve.data[i].jawaks[j].document = (resolve.data[i].jawaks[j].document ? JSON.parse(resolve.data[i].jawaks[j].document) : {});
                resolve.data[i].jawaks[j].icategories = resolve.data[i].jawaks[j].icategories ? JSON.parse(resolve.data[i].jawaks[j].icategories) : [];
                resolve.data[i].jawaks[j].scategories = resolve.data[i].jawaks[j].scategories ? JSON.parse(resolve.data[i].jawaks[j].scategories) : [];
                resolve.data[i].jawaks[j].enz = {
                    '_id': resolve.data[i].jawaks[j].enz_id,
                    'jawak_id': resolve.data[i].jawaks[j]._id,
                    'container_capacity': resolve.data[i].jawaks[j].container_capacity,
                }
                resolve.data[i].jawaks[j].usage_report = {
                    '_id': resolve.data[i].jawaks[j].usage_report_id,
                    'jawak_id': resolve.data[i].jawaks[j]._id,
                    'date': resolve.data[i].jawaks[j].date,
                    'reporter': resolve.data[i].jawaks[j].reporter,
                    'usage_type': resolve.data[i].jawaks[j].usage_type,
                    'usage_report_hin': resolve.data[i].jawaks[j].list_name_hin,
                    'fayda': resolve.data[i].jawaks[j].fayda,
                    'nuksan': resolve.data[i].jawaks[j].nuksan,
                    'rating': resolve.data[i].jawaks[j].rating
                }
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


// get jawak by aawak id
router.get('/byaawak/:aawak_ref_id', async (req, res, next) => {
    try {
        let conditionString = ` aawak_ref_id = ${req.params.aawak_ref_id}`;
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('jawak', { full: true, conditionString: conditionString }).then((resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].enz = (resolve.data[i].enz ? JSON.parse(resolve.data[i].enz) : {});
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// post jawak
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            await DB.insert('jawak', req.body, req.params.dept_id).then((data) => {
                data.enz = (data.enz ? JSON.parse(data.enz) : {});
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


// update jawak 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('jawak', req.body.set, req.body.query._id).then((data) => {
                data.enz = (data.enz ? JSON.parse(data.enz) : {});
                res.json({
                    success: true,
                    result: data || []
                });
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});

// post jawak
router.post('/new/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            await Fn.begin();
            await Fn.insertAJ(req.body, 'jawak').then(async (resolve) => {
                if (resolve) {
                    if (req.body.auto_awk) {
                        let awk = DB.tbInterface.getAawakFromJawak(req.body);
                        awk.dept_id = req.body.aawak_dept_id;
                        awk.aawak_type_id = req.body.aawak_type_id;
                        awk.aawak_source_id = req.body.aawak_source_id;
                        awk.description = "Automatic Entry from Jawak."
                        await Fn.insertAJ(awk, 'aawak').then(async (rs) => {
                        });
                    }
                    if (req.body.auto_reawk) {
                        let awk = DB.tbInterface.getAawakFromJawak(req.body);
                        awk.date = req.body.aawak_date;
                        awk.aawak_type_id = req.body.re_aawak_type_id;
                        awk.mm_id = req.body.mm_id;
                        awk.aawak_mm_id = req.body.jawak_mm_id;
                        awk.aawak_source_id = req.body.aawak_source_id;
                        awk.description = "Automatic Entry from Jawak to Re-aawak."

                        await Fn.insertAJ(awk, 'aawak').then(async (rs) => {
                        });
                    }
                    await DB.getById('jawak', resolve, { full: true }).then(async (data) => {
                        data.enz = (data.enz ? JSON.parse(data.enz) : {});
                        await Fn.commit();
                        res.json({
                            result: data || {},
                            success: true
                        });
                    }, (reject) => {
                        return next(reject)
                    });

                }
                else {
                    return next(new Error('Please fill required fields.'))
                }
            });
        }
    } catch (err) {
        Fn.rollback();
        next(err)
    };
});

// update jawak 
router.put('/new', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await Fn.updateAJ(req.body.set, 'jawak').then(async (resolve) => {
                if (resolve) {
                    let jawak = await DB.getById('jawak', req.body.set._id, { full: true });
                    jawak.enz = (jawak.enz ? JSON.parse(jawak.enz) : {});
                    res.json({
                        success: true,
                        result: jawak || []
                    })
                } else {
                    throw new Error('something went wrong');
                }
            }, (reject) => {
                return next(reject);
            })
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


//aawak post with dept
router.post('/bunch/:dept_id', async (req, res, next) => {
    if (req.body) {
        req.body.dept_id = req.params.dept_id;
        try {
            await Fn.begin();
            let voucher_no = await Fn.getLastVoucherNo('jawak') + 1;
            for (let jwk of req.body.jawaks) {
                let jawak = {
                    ...jwk,
                    ...req.body,
                    voucher_no: voucher_no,
                }
                await Fn.insertAJ(jawak, 'jawak').then(async (resolve) => {
                    if (jawak.auto_awk) {
                        let awk = DB.tbInterface.getAawakFromJawak(jawak);
                        awk.dept_id = jawak.aawak_dept_id;
                        awk.aawak_type_id = jawak.aawak_type_id;
                        awk.aawak_source_id = jawak.aawak_source_id;
                        awk.description = "Automatic Entry from Jawak."
                        await Fn.insertAJ(awk, 'aawak').then(async (rs) => {
                        });
                    }
                    if (jawak.auto_reawk) {
                        let awk = DB.tbInterface.getAawakFromJawak(jawak);
                        awk.date = jawak.aawak_date;
                        awk.aawak_type_id = jawak.re_aawak_type_id;
                        awk.mm_id = jawak.mm_id;
                        awk.aawak_mm_id = jawak.jawak_mm_id;
                        awk.aawak_source_id = jawak.aawak_source_id;
                        awk.description = "Automatic Entry from Jawak to Re-aawak."
                        await Fn.insertAJ(awk, 'aawak').then(async (rs) => {
                        });
                    }
                }, (reject) => {
                    throw reject;
                });
            }
            await DB.allQuery('jawak', 'select_all_voucher', {
                conditionString: `jawak.voucher_no = ${voucher_no}`, obj: { limit: -1, offset: -1 }
            }).then(async (data) => {
                for (let i in data) {
                    await DB.allQuery('jawak', 'select_one_voucher', {
                        obj: { voucher_no: voucher_no }
                    }).then(async (jawaks) => {
                        for (let i in jawaks) {
                            jawaks[i].document = (jawaks[i].document ? JSON.parse(jawaks[i].document) : {});
                            jawaks[i].enz = (jawaks[i].enz ? JSON.parse(jawaks[i].enz) : {});
                            jawaks[i].usage_report = (jawaks[i].usage_report ? JSON.parse(jawaks[i].usage_report) : {});
                            jawaks[i].icategories = (jawaks[i].icategories ? JSON.parse(jawaks[i].icategories) : {});
                            jawaks[i].scategories = (jawaks[i].scategories ? JSON.parse(jawaks[i].scategories) : {});
                        }
                        data[i].jawaks = jawaks;
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
            if (!req.body.voucher_no) {
                req.body.voucher_no = await Fn.getLastVoucherNo('jawak') + 1;
            }
            for (let jwk of req.body.jawaks) {
                let jawak = {
                    ...jwk,
                    ...req.body,
                }

                if (jawak._id) {
                    await Fn.updateAJ(jawak, 'jawak').then((data) => {
                    }, (err) => {
                        throw err;
                    });
                } else {
                    await Fn.insertAJ(jawak, 'jawak').then(async (resolve) => {
                    }, (reject) => {
                        throw reject;
                    });
                }
            }

            let conditionString = `jawak.voucher_no = ${req.body.voucher_no}`;
            await DB.getList('jawak_voucher', { full: true, dept_id: req.params.dept_id, conditionString: conditionString }).then(async (resolve) => {
                for (let i in resolve.data) {
                    resolve.data[i].jawaks = (resolve.data[i].jawaks ? JSON.parse(resolve.data[i].jawaks) : {});

                    for (let j in resolve.data[i].jawaks) {
                        resolve.data[i].jawaks[j].document = (resolve.data[i].jawaks[j].document ? JSON.parse(resolve.data[i].jawaks[j].document) : {});
                        resolve.data[i].jawaks[j].icategories = resolve.data[i].jawaks[j].icategories ? JSON.parse(resolve.data[i].jawaks[j].icategories) : [];
                        resolve.data[i].jawaks[j].scategories = resolve.data[i].jawaks[j].scategories ? JSON.parse(resolve.data[i].jawaks[j].scategories) : [];
                        resolve.data[i].jawaks[j].enz = {
                            '_id': resolve.data[i].jawaks[j].enz_id,
                            'jawak_id': resolve.data[i]._id,
                            'container_capacity': resolve.data[i].jawaks[j].container_capacity,
                        }
                        resolve.data[i].jawaks[j].usage_report = {
                            '_id': resolve.data[i].jawaks[j].usage_report_id,
                            'jawak_id': resolve.data[i]._id,
                            'date': resolve.data[i].jawaks[j].date,
                            'reporter': resolve.data[i].jawaks[j].reporter,
                            'usage_type': resolve.data[i].jawaks[j].usage_type,
                            'usage_report_hin': resolve.data[i].jawaks[j].list_name_hin,
                            'fayda': resolve.data[i].jawaks[j].fayda,
                            'nuksan': resolve.data[i].jawaks[j].nuksan,
                            'rating': resolve.data[i].jawaks[j].rating
                        }

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

// jawak delete
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {

            await Fn.deleteAJ(req.params.id, 'jawak').then((resolve) => {
                res.json({
                    success: true,
                    result: resolve
                })
            })
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


// aawak voucher delete
router.delete('/voucher/:ids', async (req, res, next) => {
    if (req.params.ids) {
        try {
            await Fn.begin();
            let ids = JSON.parse(req.params.ids);
            for (let id of ids) {
                await Fn.deleteAJ(id, 'jawak');
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


// condition_id: (2)[36, 34]
// item_id: (3)[11, 8, 41]
// jawak_mm_id: (2)[6, 4]
// jawak_type_id: (2)[28, 32]
// mm_id: (2)[6, 4]
// nimitt_id: "gggg"
// pbk_id: (3)[2, 7, 10]
// pkt_num: "222"
// product_id: []
// subitem_id: []



// update jawak ref link only
router.put('/ref-link/:id', async (req, res, next) => {
    try {
        if (req.params.id && req.body.aawak_ref_id !== undefined) {
            const sql = `UPDATE jawak SET aawak_ref_id = @aawak_ref_id, updated_at = datetime('now','localtime') WHERE _id = @_id`;
            const result = DB.db.prepare(sql).run({
                aawak_ref_id: req.body.aawak_ref_id,
                _id: Number(req.params.id)
            });
            res.json({
                success: true,
                result: result
            });
        }
        else {
            return next(new Error('Id or aawak_ref_id not found.'))
        }
    } catch (err) { next(err) };
});

// update jawak received status only
router.put('/received/:id', async (req, res, next) => {
    try {
        if (req.params.id && req.body.is_recieved !== undefined) {
            const sql = `UPDATE jawak SET is_recieved = @is_recieved, updated_at = datetime('now','localtime') WHERE _id = @_id`;
            const result = DB.db.prepare(sql).run({
                is_recieved: req.body.is_recieved,
                _id: Number(req.params.id)
            });
            res.json({
                success: true,
                result: result
            });
        }
        else {
            return next(new Error('Id or is_recieved not found.'))
        }
    } catch (err) { next(err) };
});


// jawak update single row (specifically for document/images updates from preview)
router.put('/update-row', async (req, res, next) => {
    if (req.body._id && req.body.document) {
        try {
            await Fn.begin();
            let oldJwk = await DB.getById('jawak', req.body._id);
            if (oldJwk) {
                // Merge old data with new document/fields
                let updatedDoc = {
                    ...oldJwk,
                    ...req.body
                };
                
                // Fn.updateAJ handles parsing/stringifying and bachat sync if needed
                await Fn.updateAJ(updatedDoc, 'jawak', oldJwk).then(async (resolve) => {
                    await Fn.commit();
                    res.json({
                        success: true,
                        message: 'Jawak row updated successfully'
                    });
                }, (reject) => {
                    throw reject;
                });
            } else {
                res.status(404).json({ success: false, message: 'Jawak record not found' });
            }
        } catch (err) {
            await Fn.rollback();
            return next(err);
        }
    } else {
        res.status(400).json({ success: false, message: 'Required fields missing (_id, document)' });
    }
});

module.exports = router;