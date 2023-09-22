const router = require('express').Router();
const e = require('express');
const DBContex = require('../models/DBContex');
const Fn = require('../models/functions');
const tbInterface = require('../models/table_interface');
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
            let product = null;
            req.body.active = req.params.dept_id == 1 ? 1 : 0;
            Fn.begin()
            if (req.body.products.length) {
                req.body.qty = 1;
                for (let i of req.body.products) {
                    req.body.product_code = i.product_code
                    req.body.sr_num = i.sr_num
                    req.body.qty = 1;
                    await Fn.insertProduct(req.body, req.body.voucher_no).then((data) => {
                        product = data;
                    }, (err) => {
                        throw err;
                    });
                }
            } else {
                req.body.product_code = null
                req.body.sr_num = null

                await Fn.insertProduct(req.body).then((data) => {
                    product = data;
                }, (err) => {
                    throw err;
                });

            }

            //get product
            await DB.getList('product', { full: true, dept_id: req.params.dept_id, conditionString: `product.voucher_no = ${product.voucher_no}`, orderBy: 'product._id desc', limit: 100 }).then(async (resolve) => {
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
            let product = null;
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
                prdct.active = req.params.dept_id == 1 ? 1 : 0;
                prdct.auto_awk = req.body.auto_awk;

                if (prdct.products.length) {
                    for (let i of prdct.products) {
                        prdct.product_code = i.product_code
                        prdct.sr_num = i.sr_num
                        prdct.qty = 1;
                        await Fn.insertProduct(prdct, prdct.voucher_no, bunch_no).then((data) => {
                            product = data;
                        }, (err) => {
                            throw err;
                        });
                    }
                } else {
                    prdct.product_code = null
                    prdct.sr_num = null

                    await Fn.insertProduct(prdct, null, bunch_no).then((data) => {
                        product = data;
                    }, (err) => {
                        throw err;
                    });
                }
            }

            //get product
            await DB.getList('product', { full: true, dept_id: req.params.dept_id, conditionString: `product.bunch_no = ${product.bunch_no}`, orderBy: 'product._id desc', limit: 100 }).then(async (resolve) => {
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
            Fn.begin();
            let product = req.body.set;
            product._id = req.body.query._id;
            if (product.products.length) {
                for (let i of product.products) {
                    product._id = i._id;
                    product.awk_id = i.awk_id;
                    product.product_code = i.product_code
                    product.sr_num = i.sr_num
                    product.qty = 1;

                    if (i._id) {
                        await Fn.updateProduct(product).then(async (data) => {
                        }, (err) => {
                            throw err;
                        });
                    }
                    else {
                        product.active = 1
                        // console.log(req.body);
                        await Fn.insertProduct(product, product.voucher_no, product.bunch_no).then((data) => {
                        }, (err) => {
                            throw err;
                        });
                    }
                }
            } else {
                product.product_code = null
                product.sr_num = null
                await Fn.updateProduct(product).then(async (data) => {
                }, (err) => {
                    throw err;
                });
            }
            //get product
            await DB.getList('product', { full: true, dept_id: req.params.dept_id, conditionString: `product.voucher_no = ${product.voucher_no}` }).then(async (resolve) => {
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
    if (req.params.id) {
        try {
            Fn.begin()
            await Fn.deleteProduct(req.params.id).then((data) => {
                Fn.commit();
                res.json({
                    success: true,
                    result: data
                });
            }, (err) => {
                throw err;
            })
        }
        catch (err) {
            Fn.rollback();
            return next(err)
        };
    } else {
        return next(new Error('Id not found.'))
    }
});



// delete product voucher
router.delete('/voucher/:voucher_no', async (req, res, next) => {
    if (req.params.voucher_no) {
        try {
            Fn.begin()
            await Fn.deleteProductVoucher(req.params.voucher_no).then((data) => {
                Fn.commit();
                res.json({
                    success: true,
                    result: data
                });
            }, (err) => {
                throw err;
            })
        }
        catch (err) {
            Fn.rollback();
            return next(err)
        };
    } else {
        return next(new Error('Id not found.'))
    }
});


module.exports = router;