//@ts-checkZ
const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  department add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.dept_eng && req.body.dept_hin) {
        await DB.insert('department', req.body).then((data) => {    
            // await DB.insertToCache('department', data, (err, data) => { })
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

//  department get
router.get('/', async (req, res, next) => {
    await DB.getList('department').then(async (resolve) => {
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: (resolve.total_count ? resolve.total_count : 0),
        });
    }, (err) => { return next(err) });
});

//  department get
router.get('/:dept_id', async (req, res, next) => {
    if (['1', '2'].includes(req.params.dept_id)) {
        await DB.getList('department').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        }, (err) => { return next(err) });
    }
    else {
        res.json({
            success: true,
            result: []
        })
    }
});

//  dept get by dept
router.get('/forConfig/:dept_id', async (req, res, next) => {
    await DB.getFullListForDeptConfig('department', req.params.dept_id).then((resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});


//  department DB download
router.get('/dbfull/:dept_id', async (req, res, next) => {
    DB.generateDB(req.params.dept_id).then((result) => {

        res.json({
            success: true,
            result: { path: result }
        })

    }, (reject) => {
        next(reject);
    });
});

// department update
router.put('/', async (req, res, next) => {
    if (req.body.query && req.body.query._id && req.body.set) {
        let condition = '_id = ' + req.body.query._id;
        await DB.update('department', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.updateToCache('department', req.body.set, condition, (err) => { })
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


//login to department
router.put('/login', async (req, res, next) => {
    if (req.body.dept_id && req.body.dept_id != 4 && req.body.password) {
        let condition = ` _id = ${req.body.dept_id} AND password = '${req.body.password}' `;
        await DB.getCount('department', condition).then(async (response) => {
            if (response.total_count == 1) {
                await DB.getList('department_config', { conditionString: `dept_id = ${req.body.dept_id} and config_key = 'settings'` }).then(setting => {
                    response.settings = JSON.parse(setting.data[0].config_value);
                    response.settings_id = setting.data[0]._id;
                });
            }
            res.json(response || {});
        },
            (err) => {
                next(err);
            });
    }
    else {
        return next(new Error('Id not found.'))
    }
});

router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('department', condition, (err, data) => {
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