const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();


// get vehicle_document all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('vehicle_document').then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// get vehicle_document 
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('vehicle_document', { order: `vehicle_document._id desc` }).then(async (resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// delete vehicle_document 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('vehicle_document', req.params.id).then((data) => {
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


module.exports = router;