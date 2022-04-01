//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DB = require('../models/DBContex');


//  dept_config add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.dept_id && req.body.config_key && req.body.config_value) {
        await DB.insert('dept_config', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data || {}
            });
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});

//  dept_config get
router.get('/', async (req, res, next) => {
    await DB.getFullList('department_config').then(async (resolve) => {
        let count = await DB.getCount('department_config');
        res.json({
            success: true,
            result: resolve || [],
            total_count: (count ? count.total_count : 0),
        });
    }, (err) => { return next(err) });
});

//  dept_config get
router.get('/:dept_id', async (req, res, next) => {
    await DB.getDeptConfig(req.params.dept_id).then(async (resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});

// dept_config update
router.put('/save', async (req, res, next) => {    
    if (req.body) {
        for (let [key, value] of Object.entries(req.body)) {
            let newObj = {
                config_value:value.config_value
            };
            let condition = '';
            if (value._id) {
                condition = ` department_config._id = ${value._id}`;
            }
            else if (value.dept_id && value.config_key) {
                condition = ` dept_id = ${value.dept_id} AND config_key = ${value.config_key}`;
            }
            else {
                req.body[key] = { success: false, err: 'required fields are missing' };
            }
            if (condition != '') {                
                await DB.update('department_config',newObj, condition, (err, data) => {
                    if(err){
                        req.body[key].success = false;
                    }
                    req.body[key].success = true;
                    req.body[key] = data;
                });
            }
        }
        res.json({
            success: true,
            result: req.body || {}
        });
    }
    else {
        return next(new Error('Id not found.'))
    }
});


// dept_config update
router.put('/', async (req, res, next) => {
    if (req.body.query && (req.body.query._id || (req.body.query.dept_id && req.body.query.config_key)) && req.body.set) {
        let condition = (req.body.query._id) ? '_id = ' + req.body.query._id + ' AND ' : ' ';
        condition += ((req.body.query.dept_id && req.body.query.config_key) ? ' dept_id = ' + req.body.query.dept_id + ' AND config_key = ' + req.body.query.config_key + ' AND ' : ' ');
        condition = condition.slice(0, -5);
        await DB.update('dept_config', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data || {}
            });
        });
    }
    else {
        return next(new Error('Id not found.'))
    }
});


//add new list in depatment
router.put('/add', async (req, res, next) => {
    if (req.body.dept_id && req.body.config_key && req.body.new) {


        let condition = `dept_id = '${req.body.dept_id}' AND config_key = '${req.body.config_key}'`;
        // let set = `list = json_remove(list, json_find(list,'$[?]'))`;
        let set = `config_value = json_set(config_value, '$[#]', json(?))`;
        let query = `update dept_config set ${set} where ${condition}`;
        await DB.localDB.run(query, [req.body.new_id], async (err, data) => {
            if (err) {
                return next(err);
            }
            res.json({
                success: true,
                result: data || {}
            });
        });
    }
    else {
        return next(new Error('Id not found.'))
    }
});

// dept_config delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('dept_config', condition, (err, data) => {
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