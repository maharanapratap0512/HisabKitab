const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get vehicle all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('vehicle', { full: true }).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get vehicle 
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('vehicle', { order: `vehicle._id desc`, full: true }).then(async (resolve) => {
            let time = DB.db.prepare('select UNIXEPOCH() * 1000 as time').get().time;
            if (time) {
                for (let i in resolve.data) {
                    resolve.data[i] = await verifyExpiryDate(resolve.data[i], time);
                    // console.log(resolve[i]);
                }
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});



// post vehicle 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.gadi_num) {
            await DB.insert('vehicle', req.body).then(async (data) => {
                let time = DB.db.prepare('select UNIXEPOCH() * 1000 as time').get().time;
                
                res.json({
                    success: true,
                    result: await verifyExpiryDate(data, time) || {}
                });
            });
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});

// post vehicle 
router.post('/import', async (req, res, next) => {
    try {
        if (req.body && req.body.length > 0) {
            let istmt = DB.db.prepare(DB.query.vehicle.import);
            let ustmt = DB.db.prepare(DB.query.vehicle.update);
            for (let i in req.body) {
                if (req.body[i].yes) {
                    if (req.body[i].status == 'insert') {
                        let ires = istmt.run(req.body[i]);
                        if (ires) {
                            req.body[i].new_id = ires.lastInsertRowid;
                        }
                    }
                    else if (req.body[i].status == 'update') {
                        let ures = ustmt.run(req.body[i]);
                        if (ures) {
                            req.body[i].new_id == ures.lastInsertRowid;
                        }
                    }
                }
            }
            res.json({
                success: true,
                result: req.body
            })
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update vehicle 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('vehicle', req.body.set, req.body.query._id).then(async (data) => {
                let time = DB.db.prepare('select UNIXEPOCH() * 1000 as time').get().time;
                res.json({
                    success: true,
                    result: await verifyExpiryDate(data, time) || {}
                });
            });
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});


// delete vehicle 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('vehicle', req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            })
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});


verifyExpiryDate = (data, ctime) => {
    if (data.rc_exp_date - ctime < 604800000) {
        data.rc_error = true;
    }
    else if (data.rc_exp_date - ctime < 2629743000) {
        data.rc_warning = true;
    }

    if (data.puc_exp_date - ctime < 604800000) {
        data.puc_error = true;
    }
    else if (data.puc_exp_date - ctime < 2629743000) {
        data.puc_warning = true;
    }

    if (data.insurance_exp_date - ctime < 604800000) {
        data.insurance_error = true;
    }
    else if (data.insurance_exp_date - ctime < 2629743000) {
        data.insurance_warning = true;
    }
    return data;
}

module.exports = router;