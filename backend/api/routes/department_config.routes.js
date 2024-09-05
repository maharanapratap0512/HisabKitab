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
                if (resolve.data[i].config_value) {
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
                    config_value: JSON.stringify(value.config_value)
                };
                if (value._id) {
                    await DB.update('department_config', newObj, value._id).then((data) => {
                        if (!data) {
                            req.body[key].success = false;
                        } else {
                            data.config_value = JSON.parse(data.config_value)
                            req.body[key] = data;
                            req.body[key].success = true;
                        }
                    });
                } else {
                    newObj.dept_id = value.dept_id;
                    newObj.config_key = newObj.config_key ? newObj.config_key : key;
                    await DB.insert('department_config', newObj).then((data) => {
                        if (!data) {
                            req.body[key].success = false;
                        } else {
                            data.config_value = JSON.parse(data.config_value)
                            req.body[key] = data;
                            req.body[key].success = true;
                            console.log(data);
                        }
                    })
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
    } catch (err) { next(err) };
});


// update dept_config 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.query && (req.body.query._id || (req.body.query.dept_id && req.body.query.config_key)) && req.body.set) {
            // if (req.body.query && req.body.query._id && req.body.set) {

            let condition = `1=1 ${req.body.query._id ? ` AND department_config._id = ${req.body.query._id}` : ``} ${req.body.query.dept_id ? ` AND department_config.dept_id = ${req.body.query.dept_id}` : ``} ${req.body.query.config_key ? ` AND department_config.config_key = '${req.body.query.config_key}'` : ``} `;
            if (req.body.query.config_key && req.body.set.config_value) {
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