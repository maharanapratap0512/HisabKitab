const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
// const Sqlite = require('sqlite3');
// const path = require('path');

// const dbPath = path.resolve(__dirname, '../../../../Data/Sabji/Sabji_update_3_2022.db');
// const localDB = new Sqlite.Database(dbPath, (err) => {
//     if (err) {
//       console.log("DB path : ", dbPath);
//       return console.log("error : ", err.message);
//     }
//     console.log("connected with Database");
//   });
const DB = new DBContex();


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
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    await DB.getList('item', { full: true, dept_id: req.params.dept_id }).then((result) => {
        let subitem_count = 0;
        for (let i in result.data) {
            DB.getList('subitem', { full: true, dept_id: req.params.dept_id, conditionString: `item_id = ${result.data[i]._id}` }).then((sResult) => {
                result.data[i].subitems = sResult.data;
                result.data[i].categories = sResult.data.map(s => s.category_id);
                // result.total_count += sResult.total_count;
                result.subitem_count += sResult.total_count;
            });
        }
        res.json({
            success: true,
            result: result.data || [],
            total_count: result.total_count + subitem_count,
            subitem_count: subitem_count
        });
    }, (err) => { return next(err) });
    // await DB.getList('itemMix', { dept_id: req.params.dept_id, limit: 100 }).then((resolve) => {
    //     let subitem_count = 0;
    //     for (let i = 0; i < resolve.data.length; i++) {

    //         resolve.data[i].subitems = (resolve.data[i].subitems != "[null]" ? JSON.parse(resolve.data[i].subitems) : []);
    //         resolve.data[i].categories = (resolve.data[i].categories != "[null]" ? JSON.parse(resolve.data[i].categories) : []);
    //         subitem_count += resolve.data[i].subitems.length;
    //     }
    //     res.json({
    //         success: true,
    //         result: resolve.data || [],
    //         total_count: resolve.total_count,
    //         subitem_count: subitem_count
    //     });
    // }, (err) => { return next(err) });
});

//  item get by dept + filter + pageNo
router.put('/itemmix/:dept_id', async (req, res, next) => {
    let conditionString = ``;

    let orderBy = null, limit = 100, offset = null, page = 1;

    if (req.body._id) {
        conditionString += (conditionString != `` ? ` AND` : ``) + ` item._id = ${req.body._id}`;
    }
    if (req.body.category_id) {
        conditionString += (conditionString != `` ? ` AND` : ``) + ` (item.category_id = ${req.body.category_id} OR si.category_id = ${req.body.category_id})`;
    }
    if (req.body.subitem_list_id) {
        conditionString += (conditionString != `` ? ` AND` : ``) + ` (si.subitem_list_id = ${req.body.subitem_list_id})`;
    }
    if (conditionString.trim() == ``) {
        orderBy = "item._id desc";
    }
    if (req.body.pageNo && req.body.pageNo > 0) {
        offset = (req.body.pageNo - 1) * limit;
        page = req.body.pageNo;
    }
    await DB.getList('item', { full: true, dept_id: req.params.dept_id, conditonString: conditionString, orderBy: orderBy, limit: limit, offset: offset }).then(async (result) => {
        let subitem_count = 0;
        for (let i in result.data) {
            await DB.getList('subitem', { full: true, dept_id: req.params.dept_id, conditionString: `item_id = ${result.data[i]._id}` }).then((sResult) => {
                result.data[i].subitems = sResult.data;
                result.data[i].categories = sResult.data.map(s => s.category_id);
                // result.total_count += sResult.total_count;
                subitem_count += sResult.total_count;
            });
        }
        res.json({
            success: true,
            result: result.data || [],
            total_count: result.total_count + subitem_count,
            subitem_count: subitem_count
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
    if (req.body._id) {
        conditionString += (conditionString != `` ? ` AND` : ``) + ` item._id = ${req.body._id}`;
    }
    if (req.body.category_id) {
        conditionString += (conditionString != `` ? ` AND` : ``) + ` (item.category_id = ${req.body.category_id} OR si.category_id = ${req.body.category_id})`;
    }
    if (req.body.subitem_list_id) {
        conditionString += (conditionString != `` ? ` AND` : ``) + ` (si.subitem_list_id = ${req.body.subitem_list_id})`;
    }

    await DB.getFullListForDeptConfig('itemMix', req.params.dept_id, conditionString).then(async (resolve) => {
        let items = await DB.getDeptConfig(req.params.dept_id, 'item');
        let subitems = await DB.getDeptConfig(req.params.dept_id, 'subitem');
        if (items && items[0]) {
            items = items[0].config_value.split(',');
        }
        if (subitems && subitems[0]) {
            subitems = subitems[0].config_value.split(',');
        }
        let subitem_count = 0;
        for (let i = 0; i < resolve.length; i++) {

            resolve[i].subitems = (resolve[i].subitems != "[null]" ? JSON.parse(resolve[i].subitems) : []);
            resolve[i].categories = (resolve[i].categories != "[null]" ? JSON.parse(resolve[i].categories) : []);
            subitem_count += resolve[i].subitems.length;
            if (items.includes(resolve[i]._id.toString())) {
                resolve[i].chk = true;
            }
            for (let j in resolve[i].subitems) {
                if (subitems.includes(resolve[i].subitems[j]._id.toString())) {
                    resolve[i].subitems[j].chk = true;
                }
            }
        }
        res.json({
            success: true,
            result: resolve || [],
            subitem_count: subitem_count
        });
    }, (err) => { return next(err) });
});

//  item get
router.get('/', async (req, res, next) => {
    await DB.getList('item').then((resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
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