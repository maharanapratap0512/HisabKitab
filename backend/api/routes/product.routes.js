const router = require('express').Router();
const e = require('express');
const DBContex = require('../models/DBContex');
const Fn = require('../models/functions');
const DB = new DBContex();




// get product all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('product', { full: true }).then((data) => {
            for (let i in data) {
                data[i].document = (data[i].document != "[null]" ? JSON.parse(data[i].document) : {});
                // data[i].tracking = (data[i].tracking != "[null]" ? JSON.parse(data[i].tracking) : {});
            }
            res.json({
                success: true,
                result: data || []
            });
        });
    } catch (err) { next(err) };
});


// get product
router.get('/:dept_id', async (req, res, next) => {
    try {
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('product', { full: true, dept_id: req.params.dept_id, orderBy: 'product._id desc', limit: 100 }).then(async (resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : {});
                resolve.data[i].products = (resolve.data[i].products ? JSON.parse(resolve.data[i].products) : []);
            }

            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });

        });
    } catch (err) { next(err) };
});


// get Filter product by dept_id
router.put('/:dept_id', async (req, res, next) => {
    try {
        let conditionString = ` 1=1 ${req.body._id ? ` AND product._id = ${req.body._id}` : ``} ${req.body.item_id ? ` AND product.item_id = ${req.body.item_id}` : ``}`;
        // let conditionString = ` 1=1 ${req.body._id ? `product._id = ${req.body._id}` : ``} ${typeof req.body.item_id == "string" || typeof req.body.item_id == "number" ? ` AND product.item_id = (${req.body.item_id})` : ``} ${req.body.item_id.length > 0 ? ` AND product.item_id IN (${req.body.item_id})` : ``}`;
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('product', { full: req.body.full ? true : false, dept_id: req.params.dept_id, conditionString: conditionString }).then((resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : {});
                // resolve.data[i].tracking = (resolve.data[i].tracking != "[null]" ? JSON.parse(resolve.data[i].tracking) : {});
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});

// get only unique products
router.put('/unique/:dept_id', async (req, res, next) => {
    try {
        let conditionString = ` 1=1 AND (product.product_code IS NOT NULL OR product.sr_num IS NOT NULL) ${req.body._id ? ` AND product._id = ${req.body._id}` : ``} ${req.body.item_id ? ` AND product.item_id = ${req.body.item_id}` : ``}`;
        // let conditionString = ` 1=1 ${req.body._id ? `product._id = ${req.body._id}` : ``} ${typeof req.body.item_id == "string" || typeof requnique.body.item_id == "number" ? ` AND product.item_id = (${req.body.item_id})` : ``} ${req.body.item_id.length > 0 ? ` AND product.item_id IN (${req.body.item_id})` : ``}`;
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('product', { full: req.body.full ? true : false, dept_id: req.params.dept_id, conditionString: conditionString }).then((resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : {});
                // resolve.data[i].tracking = (resolve.data[i].tracking != "[null]" ? JSON.parse(resolve.data[i].tracking) : {});
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// post product
router.post('/:dept_id', async (req, res, next) => {
    if (req.body) {
        try {
            req.body.document = req.body.document ? JSON.stringify(req.body.document) : null;
            req.body.isbill = req.body.isbill ? 1 : 0;
            req.body.is_xl = req.body.is_xl ? 1 : 0;
            let dataArr = [];
            let bunch_no = await Fn.getLastBunchNo('product') + 1;
            req.body.bunch_no = bunch_no;
            let voucher_no = await Fn.getLastVoucherNo('product') + 1;
            req.body.voucher_no = voucher_no;

            Fn.begin()
            if (req.body.products.length) {
                for (let i of req.body.products) {
                    req.body.product_code = i.product_code
                    req.body.sr_num = i.sr_num
                    await DB.insert('product', req.body, req.params.dept_id, false).then((data) => {
                    }, (err) => {
                        throw err;
                    });
                }
            } else {
                req.body.product_code = null
                req.body.sr_num = null
                await DB.insert('product', req.body, req.params.dept_id, false).then((data) => {
                }, (err) => {
                    throw err;
                });
            }

            //get product
            await DB.getList('product', { full: true, dept_id: req.params.dept_id, conditionString: `product.voucher_no = ${voucher_no}`, orderBy: 'product._id desc', limit: 100 }).then(async (resolve) => {
                for (let i in resolve.data) {
                    resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : {});
                    resolve.data[i].products = (resolve.data[i].products ? JSON.parse(resolve.data[i].products) : []);
                }
                Fn.commit()
                res.json({
                    success: true,
                    result: resolve.data || [],
                    total_count: resolve.total_count
                });
            }, (err) => {
                throw err;
            });

        }
        catch (err) {
            // console.log(err);
            Fn.rollback();
            next(err)
        };
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

// post product bunch
router.post('/bunch/:dept_id', async (req, res, next) => {
    if (req.body) {
        try {
            Fn.begin();
            let bunch_no = await Fn.getLastBunchNo('product') + 1;
            for (let prdct of req.body.items) {
                prdct.dept_id = req.body.dept_id;
                prdct.mm_id = req.body.mm_id;
                prdct.nimitt_id = req.body.nimitt_id;
                prdct.purchase_date = req.body.purchase_date;
                prdct.purchased_by = req.body.purchased_by;
                prdct.document = JSON.stringify(prdct.document ? prdct.document : []);
                prdct.isbill = prdct.isbill ? 1 : 0;
                prdct.is_xl = prdct.is_xl ? 1 : 0;
                prdct.bunch_no = bunch_no;
                let voucher_no = await Fn.getLastVoucherNo('product') + 1;
                prdct.voucher_no = voucher_no;

                if (prdct.products.length) {
                    for (let i of prdct.products) {
                        prdct.product_code = i.product_code
                        prdct.sr_num = i.sr_num
                        await DB.insert('product', prdct, req.params.dept_id, false).then((data) => {
                        }, (err) => {
                            throw err;
                        });
                    }
                } else {
                    prdct.product_code = null
                    prdct.sr_num = null
                    await DB.insert('product', prdct, req.params.dept_id, false).then((data) => {
                    }, (err) => {
                        throw err;
                    });
                }
            }

            //get product
            await DB.getList('product', { full: true, dept_id: req.params.dept_id, conditionString: `product.bunch_no = ${bunch_no}`, orderBy: 'product._id desc', limit: 100 }).then(async (resolve) => {
                for (let i in resolve.data) {
                    resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : {});
                    resolve.data[i].products = (resolve.data[i].products ? JSON.parse(resolve.data[i].products) : []);
                }
                Fn.commit()
                res.json({
                    success: true,
                    result: resolve.data || [],
                    total_count: resolve.total_count
                });
            }, (err) => {
                throw err;
            });

        }
        catch (err) {
            // console.log(err);
            Fn.rollback();
            next(err)
        };
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


// update product
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        try {
            req.body.set.document = req.body.set.document ? JSON.stringify(req.body.set.document) : null;
            req.body.set.isbill = req.body.set.isbill ? 1 : 0;
            // req.body.set.isbill = req.body.set.isbill ? 1 : 0;
            let updtArr = [];
            Fn.begin();
            if (req.body.set.products.length) {
                for (let i of req.body.set.products) {
                    req.body.set.product_code = i.product_code
                    req.body.set.sr_num = i.sr_num

                    if (i._id) {
                        await DB.update('product', req.body.set, i._id).then(async (data) => {
                        }, (err) => {
                            throw err;
                        });
                    }
                    else {
                        // console.log(req.body);
                        await DB.insert('product', req.body.set, req.body.set.dept_id, false).then((data) => {
                        }, (err) => {
                            throw err;
                        });
                    }
                }
            } else {
                req.body.set.product_code = null
                req.body.set.sr_num = null
                await DB.update('product', req.body.set, req.body.query._id).then(async (data) => {
                }, (err) => {
                    throw err;
                });
            }
            //get product
            await DB.getList('product', { full: true, dept_id: req.params.dept_id, conditionString: `product.voucher_no = ${req.body.set.voucher_no}` }).then(async (resolve) => {
                for (let i in resolve.data) {
                    resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : {});
                    resolve.data[i].products = (resolve.data[i].products ? JSON.parse(resolve.data[i].products) : []);
                }
                Fn.commit()
                res.json({
                    success: true,
                    result: resolve.data || [],
                    total_count: resolve.total_count
                });
            }, (err) => {
                throw err;
            });
        }
        catch (err) {
            Fn.rollback();
            next(err)
        };
    }
    else {
        return next(new Error('Id not found.'))
    }
});


// delete product
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('product', req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            })
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


module.exports = router;