//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  item add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.item_hin) {
        await DB.insert('item', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('item', data, (err, data) => { })
            res.json({
                success: true,
                result: data || []
            });
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

router.post('/:dept_id', async (req, res, next) => {
    if (req.body && req.body.item_hin) {
        await DB.insertFromDept('item', req.body, req.params.dept_id).then((data) => {

            res.json({
                success: true,
                result: data || []
            });
        }, (err) => {
            return next(err);
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

//  item get by dept
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('itemMix', req.params.dept_id).then((resolve) => {
        let subitem_count = 0;
        for(let i = 0; i < resolve.length; i++){
            
            resolve[i].subitems = (resolve[i].subitems != "[null]" ? JSON.parse(resolve[i].subitems) : []);
            resolve[i].categories = (resolve[i].categories != "[null]" ? JSON.parse(resolve[i].categories) : []);
            subitem_count += resolve[i].subitems.length;
        }
        res.json({
            success: true,
            result: resolve || [],
            subitem_count:subitem_count
        });
    }, (err) => { return next(err) });
});

//  item get by full filter
router.put('/itemmix/:dept_id', async (req, res, next) => {
    let conditionString = ``;
    if(req.body._id){
        conditionString += (conditionString != `` ? ` AND` : ``) + ` item._id = ${req.body._id}`;
    }
    if(req.body.category_id){
        conditionString += (conditionString != `` ? ` AND` : ``) + ` (item.category_id = ${req.body.category_id} OR si.category_id = ${req.body.category_id})`;
    }
    if(req.body.subitem_list_id){
        conditionString += (conditionString != `` ? ` AND` : ``) + ` (si.subitem_list_id = ${req.body.subitem_list_id})`;
    }
    await DB.getFullListByDept('itemMix', req.params.dept_id, conditionString).then((resolve) => {
        let subitem_count = 0;
        for(let i = 0; i < resolve.length; i++){
            
            resolve[i].subitems = (resolve[i].subitems != "[null]" ? JSON.parse(resolve[i].subitems) : []);
            resolve[i].categories = (resolve[i].categories != "[null]" ? JSON.parse(resolve[i].categories) : []);
            subitem_count += resolve[i].subitems.length;
        }
        res.json({
            success: true,
            result: resolve || [],
            subitem_count:subitem_count
        });
    }, (err) => { return next(err) });
});


//  item get by dept
router.get('/forConfig/:dept_id', async (req, res, next) => {
    await DB.getFullListForDeptConfig('item', req.params.dept_id).then((resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});

//  item get by dept
router.put('/forConfig/:dept_id', async (req, res, next) => {
    let conditionString = ``;
    if(req.body._id){
        conditionString += (conditionString != `` ? ` AND` : ``) + ` item._id = ${req.body._id}`;
    }
    if(req.body.category_id){
        conditionString += (conditionString != `` ? ` AND` : ``) + ` (item.category_id = ${req.body.category_id} OR si.category_id = ${req.body.category_id})`;
    }
    if(req.body.subitem_list_id){
        conditionString += (conditionString != `` ? ` AND` : ``) + ` (si.subitem_list_id = ${req.body.subitem_list_id})`;
    }

    await DB.getFullListForDeptConfig('itemMix', req.params.dept_id, conditionString).then(async (resolve) => {
        let items = await DB.getDeptConfig(req.params.dept_id, 'item');
        let subitems = await DB.getDeptConfig(req.params.dept_id, 'subitem');
        if(items && items[0]){
            items = items[0].config_value.split(',');            
        }
        if(subitems && subitems[0]){
            subitems = subitems[0].config_value.split(',');
        }
        let subitem_count = 0;
        for(let i = 0; i < resolve.length; i++){
            
            resolve[i].subitems = (resolve[i].subitems != "[null]" ? JSON.parse(resolve[i].subitems) : []);
            resolve[i].categories = (resolve[i].categories != "[null]" ? JSON.parse(resolve[i].categories) : []);
            subitem_count += resolve[i].subitems.length;
            if(items.includes(resolve[i]._id.toString())){
                resolve[i].chk = true;
            }
            for(let j in resolve[i].subitems){
                if(subitems.includes(resolve[i].subitems[j]._id.toString())){
                    resolve[i].subitems[j].chk = true;
                }
            }
        }
        res.json({
            success: true,
            result: resolve || [],
            subitem_count:subitem_count
        });
    }, (err) => { return next(err) });
});

//  item get
router.get('/', async (req, res, next) => {
    await DB.getFullList('item').then((resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});

// item update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'item._id = ' + req.body.query._id;
        await DB.update('item', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data || []
            });
        });
    }
    else {
    return next(new Error('Id not found.'))
}
});


// item delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('item', condition, (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data
            });
        })
    }
    else {
        return next(new Error('Id not found.'))
    }

});


module.exports = router;