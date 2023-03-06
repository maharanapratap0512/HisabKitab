const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get department all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('department').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get department 
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('department', { dept_id: req.params.dept_id }).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });

    } catch (err) { next(err) };
});


// post department 
router.post('/', async (req, res, next) => {
    try {
        if (req.body && req.body.dept_eng && req.body.dept_hin) {
            if (req.body.settings) {
                req.body.settings = JSON.stringify(req.body.settings);
            }
            await DB.insert('department', req.body).then((data) => {
                data.settings = JSON.parse(data.settings)
                res.json({
                    success: true,
                    result: data || {}
                });
            });
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


//  department DB download
router.get('/dbfull/:dept_id', async (req, res, next) => {
    try {
        DB.generateDB(req.params.dept_id).then((result) => {
            res.json({
                success: true,
                result: { path: result }
            })
        });
    } catch (err) { next(err) };
});

// update department 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.query && req.body.query._id && req.body.set) {
            if (req.body.set.settings) {
                req.body.set.settings = JSON.stringify(req.body.set.settings);
            }
            await DB.update('department', req.body.set, req.body.query._id).then(async (data) => {
                data.settings = JSON.parse(data.settings)
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

// update settings 
router.put('/settings', async (req, res, next) => {
    try {
        if (req.body.query && req.body.query._id && req.body.set) {
            if (req.body.set.settings) {
                req.body.set.settings = JSON.stringify(req.body.set.settings);
            }
            await DB.update('department', req.body.set, req.body.query._id, 'update_settings').then(async (data) => {
                data.settings = JSON.parse(data.settings)
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


//login to department
router.put('/login', async (req, res, next) => {
    try {
        if (req.body.dept_id && req.body.dept_id != 4 && req.body.password) {
            let condition = ` _id = ${req.body.dept_id} AND password = '${req.body.password}' `;
            let result = {};
            await DB.getList('department', { conditionString: condition }).then(async (response) => {
                if (response.total_count == 1 && response.data.length > 0) {
                    // await DB.getList('department_config', { conditionString: `dept_id = ${req.body.dept_id} and config_key = 'settings'` }).then(setting => {
                    //     response.settings = JSON.parse(setting.data[0].config_value);
                    //     response.settings_id = setting.data[0]._id;
                    // });
                    result = response.data[0];
                    result.total_count = response.total_count;
                    result.settings = result.settings ? JSON.parse(result.settings) : {};
                }
                res.json(result || {});
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});

router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('department', req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            });
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


module.exports = router;