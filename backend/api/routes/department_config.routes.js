const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get dept_config all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('department_config').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});

//  dept_config get
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList("department_config", { dept_id: req.params.dept_id }).then(async (resolve) => {
            for (let i in resolve.data) {
                if (resolve.data[i].config_key == "settings") {
                    resolve.data[i].config_value = JSON.parse(resolve.data[i].config_value);
                }
            }
            res.json({
                success: true,
                result: resolve.data || []
            });
        });
    } catch (err) { next(err) };
});

// update dept_config 
router.put('/save', async (req, res, next) => {
    try {
        if (req.body) {
            for (let [key, value] of Object.entries(req.body)) {
                let newObj = {
                    config_key: value.config_key,
                    config_value: (key == "settings" ? JSON.stringify(value.config_value) : value.config_value)
                };
                await DB.update('department_config', newObj, value._id).then((data) => {
                    if (!data) {
                        req.body[key].success = false;
                    }
                    req.body[key].success = true;
                    req.body[key] = data;
                });
            }
            res.json({
                success: true,
                result: req.body || {}
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


// update dept_config 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.query && (req.body.query._id || (req.body.query.dept_id && req.body.query.config_key)) && req.body.set) {
            // if (req.body.query && req.body.query._id && req.body.set) {

            let condition = `1=1 ${req.body.query._id ? ` AND department_config._id = ${req.body.query._id}` : ``} ${req.body.query.dept_id ? ` AND department_config.dept_id = ${req.body.query.dept_id}` : ``} ${req.body.query.config_key ? ` AND department_config.config_key = '${req.body.query.config_key}'` : ``} `;
            if (req.body.query.config_key && req.body.query.config_key == "settings" && req.body.set.config_value) {
                req.body.set.config_value = JSON.stringify(req.body.set.config_value);
            }

            await DB.updateMany('department_config', req.body.set, condition).then(async (data) => {
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


//post new list in depatment
router.put('/add', async (req, res, next) => {
    try {
        if (req.body.dept_id && req.body.config_key && req.body.new) {

            let condition = `dept_id = '${req.body.dept_id}' AND config_key = '${req.body.config_key}'`;
            // let set = `list = json_remove(list, json_find(list,'$[?]'))`;
            let set = `config_value = json_set(config_value, '$[#]', json(?))`;
            let query = `update dept_config set ${set} where ${condition}`;
            await DB.localDB.run(query, [req.body.new_id], async (data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});

// delete dept_config 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('dept_config', req.params.id), then((data) => {
                res.json({
                    success: true,
                    result: data
                }, (err) => { return next(err) });
            })
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


module.exports = router;