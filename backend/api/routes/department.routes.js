const router = require('express').Router();
const DBContex = require('../database/DBContex');
const path = require('path');
const fs = require('fs');
const DB = new DBContex();


// get department all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('department').then(async (resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].settings = JSON.parse(resolve.data[i].settings ? resolve.data[i].settings : {})
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// download file
router.get('/download', (req, res, next) => {
    try {
        const filePath = req.query.path;
        if (!filePath) {
            return res.status(400).json({ success: false, message: 'Path is required' });
        }
        res.download(filePath, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
            }
        });
    } catch (err) {
        next(err);
    }
});

// get department 
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('department', { dept_id: req.params.dept_id }).then(async (resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].settings = JSON.parse(resolve.data[i].settings ? resolve.data[i].settings : {})
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });

    } catch (err) { next(err) };
});

// get department by Id
router.get('/by_id/:dept_id', async (req, res, next) => {
    try {
        await DB.getById('department', req.params.dept_id).then(async (resolve) => {
            resolve.settings = JSON.parse(resolve.settings ? resolve.settings : {})
            res.json({
                success: true,
                result: resolve,
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


// get department config
router.get('/dbgenerate/config', async (req, res, next) => {
    try {
        const departmentService = require('../services/department.service');
        res.json({
            success: true,
            result: departmentService.DB_GEN_CONFIG
        });
    } catch (err) { next(err) };
});

// get generic table data for DB generate modal
router.get('/dbgenerate/data/:table_name', async (req, res, next) => {
    try {
        const tableName = req.params.table_name;
        // Get all rows for the modal. We don't filter by dept_id here because 
        // the modal is used to select rows for the department.
        await DB.getList(tableName, { full: false }).then(resolve => {
            res.json({
                success: true,
                result: resolve.data
            });
        });
    } catch (err) { next(err) };
});

// Bulk update department configs
router.put('/dbgenerate/config/bulk', async (req, res, next) => {
    try {
        const dept_id = req.body.dept_id;
        const configs = req.body.configs; // format: { table_name: [id1, id2, ...] }

        for (let config_key of Object.keys(configs)) {
            let existing = await DB.getList('department_config', { conditionString: `dept_id = ${dept_id} and config_key = '${config_key}'` });
            if (existing.data && existing.data.length > 0) {
                await DB.update('department_config', { config_key: config_key, config_value: JSON.stringify(configs[config_key]) }, existing.data[0]._id);
            } else {
                await DB.insert('department_config', { dept_id, config_key, config_value: JSON.stringify(configs[config_key]) });
            }
        }
        res.json({ success: true });
    } catch (err) { next(err) };
});

//  department DB download
router.post('/dbfull/:dept_id', async (req, res, next) => {
    try {
        let skipped_tables = req.body.skipped_tables || [];
        let custom_selections = req.body.custom_selections || {};
        const departmentService = require('../services/department.service');

        let queriesObj = {};
        for (let tableName of Object.keys(departmentService.DB_GEN_CONFIG)) {
            if (skipped_tables.includes(tableName)) continue;
            queriesObj[tableName] = departmentService.getQueriesForTable(tableName, custom_selections[tableName]);
        }

        DB.generateDB(req.params.dept_id, queriesObj).then((result) => {
            res.json({
                success: true,
                result: { path: result }
            })
        }).catch(err => next(err));
    } catch (err) { next(err) };
});

// old GET for backward compatibility
router.get('/dbfull/:dept_id', async (req, res, next) => {
    try {
        const departmentService = require('../services/department.service');

        let queriesObj = {};
        for (let tableName of Object.keys(departmentService.DB_GEN_CONFIG)) {
            queriesObj[tableName] = departmentService.getQueriesForTable(tableName);
        }

        DB.generateDB(req.params.dept_id, queriesObj).then((result) => {
            res.json({
                success: true,
                result: { path: result }
            })
        }).catch(err => next(err));
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
        if (req.body.dept_id && req.body.password) {
            let condition = ` _id = ${req.body.dept_id} AND password = '${req.body.password}' `;
            let result = {};
            await DB.getList('department', { conditionString: condition }).then(async (response) => {
                if (response.total_count == 1 && response.data.length > 0) {
                    result = response.data[0];
                    // await DB.getList('department_config', { conditionString: `dept_id = ${req.body.dept_id} and config_key = 'settings'` }).then((setting) => {
                    // });
                    result.total_count = response.total_count;
                    result.settings = result.settings ? JSON.parse(result.settings) : {};
                    let exFilePath = path.resolve(__dirname + '/../../../../Documents/')
                    if (!fs.existsSync(exFilePath)) {
                        fs.mkdirSync(exFilePath, { recursive: true });
                    }
                    // result.path = exFilePath
                    res.json(result || {});
                } else {
                    res.json({})
                }
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