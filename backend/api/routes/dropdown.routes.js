//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  get all list pennding
router.get('/all', async (req, res, next) => {
    let lists = {
        country: await DB.getList('country') || [],
        category: await DB.getList('category') || [],
        city: await DB.getList('city') || [],
        entry_type: await DB.getList('entry_type') || [],
        item: await DB.getList('item') || [],
        mm: await DB.getList('mm') || [],
        pbk: await DB.getList('pbk') || [],
        state: await DB.getList('state') || [],
        subitem: await DB.getList('subitem') || [],
        subitem_list: await DB.getList('subitem_list') || [],
        product: await DB.getList('product') || [],
        department: await DB.getList('department') || [],
        departmen_config: await DB.getList('department_config') || [],
        unit: await DB.getList('unit') || [],
        support_list: await DB.getList('support_list') || [],
        mm_type: await DB.getList('mm_type') || [],
        relation: await DB.getList('relation') || [],
        gender: await DB.getList('gender') || [],
    }
    console.log("lists",lists);
    res.json({
        sucess: true,
        result: lists
    })
});

// get
router.get('/:list_name', async (req, res, next) => {
    res.json({
        success: true,
        result: await DB.getList(req.params.list_name) || []
    });
});


//get as per department Done.
router.get('/all/:dept_id', async (req, res, next) => {
    let lists = {
    }

    if(req.params.dept_id){
        lists.country= await DB.getListByDept('country', req.params.dept_id) || [],
        lists.category= await DB.getListByDept('category', req.params.dept_id) || [],
        lists.city= await DB.getListByDept('city', req.params.dept_id) || [],
        lists.item= await DB.getListByDept('item', req.params.dept_id) || [],
        lists.mm= await DB.getListByDept('mm', req.params.dept_id) || [],
        lists.pbk= await DB.getListByDept('pbk', req.params.dept_id) || [],
        lists.state= await DB.getListByDept('state', req.params.dept_id) || [],
        lists.subitem= await DB.getFullListByDept('subitem', req.params.dept_id) || [],
        lists.subitem_list= await DB.getListByDept('subitem_list', req.params.dept_id) || [],
        lists.departmen_config= await DB.getListByDept('department_config', req.params.dept_id) || [],
        lists.department= await DB.getFullList('department') || [],
        lists.unit= await DB.getListByDept('unit', req.params.dept_id) || [],
        lists.mm_type= await DB.getListByDept('mm_type', req.params.dept_id) || [],
        lists.relation= await DB.getListByDept('relation', req.params.dept_id) || [],
        lists.gender= await DB.getListByDept('gender', req.params.dept_id) || []
        lists.status= await DB.getListByDept('status', req.params.dept_id) || []
        lists.aawak_type= await DB.getListByDept('aawak_type', req.params.dept_id) || []
        lists.jawak_type= await DB.getListByDept('jawak_type', req.params.dept_id) || []
        lists.condition= await DB.getListByDept('condition', req.params.dept_id) || []
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


router.get('/places/:dept_id', async (req, res, next) => {
    let lists = {
    }

    if(req.params.dept_id){
        lists.country= await DB.getListByDept('country', req.params.dept_id) || [],
        lists.city= await DB.getListByDept('city', req.params.dept_id) || [],
        lists.mm= await DB.getListByDept('mm', req.params.dept_id) || [],
        lists.state= await DB.getListByDept('state', req.params.dept_id) || [],
        lists.mm_type= await DB.getListByDept('mm_type', req.params.dept_id) || [],
        res.json({
            sucess: true,
            result: lists
        })
    }
    else{
        res.json({
            sucess: true,
            result: lists
        })
    }
});


router.get('/pbks/:dept_id', async (req, res, next) => {
    let lists = {
    }

    if(req.params.dept_id){
        lists.pbk= await DB.getListByDept('pbk', req.params.dept_id) || [],
        lists.relation= await DB.getListByDept('relation', req.params.dept_id) || [],
        lists.gender= await DB.getListByDept('gender', req.params.dept_id) || []
        res.json({
            sucess: true,
            result: lists
        })
    }
    else{
        res.json({
            sucess: true,
            result: lists
        })
    }
});


router.get('/items/:dept_id', async (req, res, next) => {
    let lists = {
    }

    if(req.params.dept_id){
        lists.category= await DB.getListByDept('category', req.params.dept_id) || [],
        lists.item= await DB.getListByDept('item', req.params.dept_id) || [],
        lists.subitem= await DB.getListByDept('subitem', req.params.dept_id) || [],
        lists.subitem_list= await DB.getListByDept('subitem_list', req.params.dept_id) || [],
        lists.unit= await DB.getListByDept('unit', req.params.dept_id) || [],
        lists.aawak_type= await DB.getListByDept('aawak_type', req.params.dept_id) || [],
        lists.jawak_type= await DB.getListByDept('jawak_type', req.params.dept_id) || [],
        res.json({
            sucess: true,
            result: lists
        })
    }
    else{
        res.json({
            sucess: true,
            result: lists
        })
    }
});



router.get('/forjawak/:dept_name', async (req, res, next)=>{
    let lists = {
        item:await DB.getListForJawak('item',req.params.dept_name).then((resolve)=>{return resolve}, (err)=>{return []}) || [],
        subitem:await DB.getListForJawak('subitem',req.params.dept_name).then((resolve)=>{return resolve}, (err)=>{return []}) || [],
        product:await DB.getListForJawak('product',req.params.dept_name).then((resolve)=>{return resolve}, (err)=>{return []}) || [],
    }
    res.json({
        sucess: true,
        result: lists
    })
});

module.exports = router;