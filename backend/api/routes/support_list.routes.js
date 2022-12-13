const router = require('express').Router();
const DBContex = require('../models/DBContex');
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


// get support_list ajtypes
router.get('/ajtypes/:dept_id', async (req, res, next) => {
    try {
        let aj = [];
        await DB.getList('aawak_type', { dept_id: req.params.dept_id }).then((response) => {
            aj.push(...response.data);
        });

        await DB.getList('jawak_type', { dept_id: req.params.dept_id }).then((response) => {
            aj.push(...response.data);
        });

        res.json({
            success: true,
            result: aj
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
            },(err)=>{
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