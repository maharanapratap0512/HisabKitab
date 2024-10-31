const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();
const Fn = require('../models/functions');


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
        let orderBy = null, limit = 100, offset = null, page = 1;
        let conditionString = `1=1 ${req.body.date ? ` AND jawak.date = '${req.body.date}'` : ''} ${req.body.year ? ` AND strftime('%Y', jawak.date) = '${req.body.year}'` : ''} ${req.body.month ? ` AND strftime('%m', jawak.date) = '${req.body.month.toString().padStart(2, '0')}'` : ''} ${req.body.mm_id.length > 0 ? ` AND jawak.mm_id in (${req.body.mm_id.join(',')})` : ''} ${req.body.condition_id.length > 0 ? ` AND jawak.condition_id in (${req.body.condition_id.join(',')})` : ''} ${req.body.item_id.length > 0 ? ` AND jawak.item_id in (${req.body.item_id.join(',')})` : ''} ${req.body.jawak_mm_id.length > 0 ? ` AND jawak.jawak_mm_id in (${req.body.jawak_mm_id.join(',')})` : ''} ${req.body.jawak_type_id.length > 0 ? ` AND jawak.jawak_type_id in (${req.body.jawak_type_id.join(',')})` : ''} ${req.body.pbk_id.length > 0 ? ` AND jawak.pbk_id in (${req.body.pbk_id.join(',')})` : ''} ${req.body.subitem_id.length > 0 ? ` AND jawak.subitem_id in (${req.body.subitem_id.join(',')})` : ''} ${req.body.product_id.length > 0 ? ` AND jawak.product_id in (${req.body.product_id.join(',')})` : ''} ${(req.body.nimitt_id && req.body.nimitt_id.length > 0) ? ` AND jawak.nimitt_id in ${req.body.nimitt_id.join(',')}` : ''} ${req.body.pkt_num ? ` AND jawak.pkt_num = ${req.body.pkt_num}` : ''} ${req.body.usage_list_id && req.body.usage_list_id.length > 0 ? ` AND jawak.usage_list_id in (${req.body.usage_list_id.join(',')})` : ''}`

        if (conditionString.trim() == `1=1`) {
            orderBy = "jawak.updated_at desc";
        }
        if (req.body.pageNo && req.body.pageNo > 0) {
            offset = (req.body.pageNo - 1) * limit;
            page = req.body.pageNo
        }
        console.log(conditionString);
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('jawak', { full: true, dept_id: req.params.dept_id, conditionString: conditionString, orderBy: orderBy, limit: limit, offset: offset }).then((resolve) => {
            res.json({
                success: true,
                pageNo: page,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
})


// get jawak by aawak id
router.get('/byaawak/:aawak_ref_id', async (req, res, next) => {
    try {
        let conditionString = ` aawak_ref_id = ${req.params.aawak_ref_id}`;
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('jawak', { full: true, conditionString: conditionString }).then((resolve) => {
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

            await Fn.insertAJ(req.body, 'jawak').then(async (resolve) => {
                if (resolve) {

                    await DB.getById('jawak', resolve, { full: true }).then(async (data) => {
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
    } catch (err) { next(err) };
});

// update jawak 
router.put('/new', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {

            await Fn.updateAJ(req.body.set, 'jawak').then(async (resolve) => {
                if (resolve) {
                    let jawak = await DB.getById('jawak', req.body.set._id, { full: true });
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


// jawak delete
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            
            await Fn.deleteAJ(req.params.id,'jawak').then((resolve)=>{
                res.json({
                    success:true,
                    result:resolve
                })
            })
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
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



module.exports = router;