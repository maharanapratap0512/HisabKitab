const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();



// get support_list all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('support_list').then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get support_list 'jawak_type', 'aawak_type', 'condition', 'usage_list', 'aawak_source' by dept_id.
router.get('/splists/:dept_id', async (req, res, next) => {
    try {
        let conditionString = `list_type in ('jawak_type', 'aawak_type', 'condition', 'usage_list', 'aawak_source', 'mm_type')`;
        await DB.getList('support_list', { dept_id: req.params.dept_id, conditionString: conditionString, order: 'list_type' }).then((response) => {
            res.json({
                success: true,
                result: response.data
            });
        });

    } catch (err) { next(err) };
});


// post support_lis
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.list_type && req.body.list_name_eng) {
            await DB.insert('support_list', req.body, req.params.dept_id).then((data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            }, (err) => {
                next(err);
            })
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update support_list
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('support_list', req.body.set, req.body.query._id).then((data) => {
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


// delete support_list
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('support_list', req.params.id).then((data) => {
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