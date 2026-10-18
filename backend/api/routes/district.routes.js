const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();


// get district by dept
router.get('/:dept_id?', async (req, res, next) => {
    try {
        await DB.getList('district', { full: true }).then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// district filter
router.put('/filter/:dept_id?', async (req, res, next) => {
    try {
        const conditions = [];
        if (req.body.state_id && req.body.state_id.length > 0) {
            conditions.push(`district.state_id IN (${req.body.state_id.join(',')})`);
        }
        if (req.body.district_id && req.body.district_id.length > 0) {
            conditions.push(`district._id IN (${req.body.district_id.join(',')})`);
        }

        const conditionString = conditions.length > 0 ? conditions.join(' AND ') : null;

        await DB.getList('district', { full: true, conditionString, limit: -1 }).then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});

// post district 
router.post('/', async (req, res, next) => {
    try {
        if (req.body && req.body.district_hin) {
            await DB.insert('district', req.body).then(async (data) => {
                res.json({
                    success: true,
                    result: data || []
                });
            })
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update district 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('district', req.body.set, req.body.query._id).then(async (data) => {
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


// delete district 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('district', req.params.id).then((data) => {
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