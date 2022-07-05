const router = require('express').Router();
const fs = require('fs');
const DBContex = require('../models/DBContex');
const DB = new DBContex();



//  department DB download
// router.get('/full/:dept_id', async (req, res, next) => {
//     DB.generateDB(req.params.dept_id).then(async (result) => {
//         res.json({
//             success: true,
//             result: result
//         });
//     }, (reject) => {
//         next(reject);
//     });
// });


//get all updated list
router.get('/updates/:dept_id', async (req, res, next) => {
    try {
        let lists = {}

        if (req.params.dept_id) {
            lists.country = await DB.getList('country', { dept_id: req.params.dept_id }) || []
            lists.state = await DB.getList('state', { dept_id: req.params.dept_id }) || []
            lists.city = await DB.getList('city', { dept_id: req.params.dept_id }) || []
            lists.unit = await DB.getList('unit', { dept_id: req.params.dept_id }) || []
            lists.support_list = await DB.getList('support_list', { dept_id: req.params.dept_id }) || []
            lists.category = await DB.getList('category', { dept_id: req.params.dept_id }) || []
            lists.mm = await DB.getList('mm', { dept_id: req.params.dept_id }) || []
            lists.item = await DB.getList('item', { dept_id: req.params.dept_id }) || []
            lists.subitem = await DB.getList('subitem', { dept_id: req.params.dept_id }) || []
            lists.subitem_list = await DB.getList('subitem_list', { dept_id: req.params.dept_id }) || []
            lists.pbk = await DB.getList('pbk', { dept_id: req.params.dept_id }) || []
            lists.product = await DB.getList('product', { dept_id: req.params.dept_id }) || []
            lists.aawak = await DB.getList('aawak', { dept_id: req.params.dept_id }) || []
            lists.jawak = await DB.getList('jawak', { dept_id: req.params.dept_id }) || []
            lists.point = await DB.getList('point', { dept_id: req.params.dept_id }) || []
            lists.department = await DB.getList('department', { conditionString: ` department._id = ${req.params.dept_id}` }) || []
            lists.department_config = await DB.getList('department_config', { conditionString: ` department_config.dept_id = ${req.params.dept_id}` }) || []
            res.json({
                success: true,
                result: lists
            })
        }
        else {
            res.json({
                success: true,
                result: lists
            })
        }
    } catch (err) { next(err) };
});

//  department DB download
// router.get('/updates/:dept_id', async (req, res, next) => {
//     DB.generateUpdateDB(req.params.dept_id).then(async (result) => {
//         res.json({
//             success: true,
//             result: result
//         });


//     }, (reject) => {
//         next(reject);
//     });
// });

//  department DB download
router.put('/import/:dept_id', async (req, res, next) => {
    try {
        console.log("request", req.body);
        res.json({
            success: true,
            result: req.body
        });
        // DB.generateUpdateDB(req.params.dept_id).then(async (result) => {
        //     res.json({
        //         success: true,
        //         result: result
        //     });


        // }, (reject) => {
        //     next(reject);
        // });
    } catch (err) { next(err) };
});





module.exports = router;