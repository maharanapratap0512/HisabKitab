//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const fs = require('fs');
const DBContex = require('../models/DBContex');
const DB = new DBContex();



//  department DB download
router.get('/full/:dept_id', async (req, res, next) => {
    DB.generateDB(req.params.dept_id).then(async (result) => {
        res.json({
            success: true,
            result: result
        });
    }, (reject) => {
        next(reject);
    });
});


//get all updated list
router.get('/updates/:dept_id', async (req, res, next) => {
    let lists = {
    }

    if(req.params.dept_id){        
        lists.country= await DB.getListByDept('country', req.params.dept_id) || []
        lists.state= await DB.getListByDept('state', req.params.dept_id) || []
        lists.city= await DB.getListByDept('city', req.params.dept_id) || []
        lists.unit= await DB.getListByDept('unit', req.params.dept_id) || []
        lists.support_list= await DB.getListByDept('support_list', req.params.dept_id) || []
        lists.category= await DB.getListByDept('category', req.params.dept_id) || []
        lists.mm= await DB.getListByDept('mm', req.params.dept_id) || []
        lists.item= await DB.getListByDept('item', req.params.dept_id) || []
        lists.subitem= await DB.getListByDept('subitem', req.params.dept_id) || []
        lists.subitem_list= await DB.getListByDept('subitem_list', req.params.dept_id) || []
        lists.pbk= await DB.getListByDept('pbk', req.params.dept_id) || []
        lists.product= await DB.getListByDept('product', req.params.dept_id) || []
        lists.aawak= await DB.getListByDept('aawak', req.params.dept_id) || []
        lists.jawak= await DB.getListByDept('jawak', req.params.dept_id) || []
        lists.point= await DB.getListByDept('point', req.params.dept_id) || []
        lists.department= await DB.getList('department', ` department._id = ${req.params.dept_id}`) || []
        lists.department_config= await DB.getList('department_config', ` department_config.dept_id = ${req.params.dept_id}`) || []
        res.json({
            success: true,
            result: lists
        })
    }
    else{
        res.json({
            success: true,
            result: lists
        })
    }
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
});





module.exports = router;