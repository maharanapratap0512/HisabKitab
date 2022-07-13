
const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();

//  get city all 
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('city').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});

// get city 
router.get('/:dept_id', async (req, res, next) => {
    try {
        let options = { full: true, dept_id: req.params.dept_id, conditionString: null, orderBy: ` city._id desc` }
        await DB.getList('city', options).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        })
    } catch (err) { next(err) };
})

// post city 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.city_hin) {
            await DB.insert('city', req.body, req.params.dept_id).then((data) => {
                res.json({
                    success: true,
                    result: data || {}
                })
            })
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
})

// update city 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            console.log("req.body.set", req.body.set);
            await DB.update('city', req.body.set, req.body.query._id).then((data) => {
                res.json({
                    success: true,
                    result: data || {}
                });
            }, (err) => {
                next(err)
            });
        }
        else {
            return next(new Error('Id not found.'));
        }
    } catch (err) { next(err) };
});


// delete city 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('city', req.params.id).then((data) => {
                res.json({
                    success: true,
                    result: data
                });
            })
        }
        else {
            return next(new Error('Id not found.'))
        }
    } catch (err) { next(err) };
});


module.exports = router;