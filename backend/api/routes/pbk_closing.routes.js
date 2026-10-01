const router = require('express').Router();
const pbkService = require('../services/pbk.service');
const { sutramDB } = require('../database/db.model');

// get closing all / by dept
router.get('/:dept_id?', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        const filters = { ...req.query, dept_id };

        const { result, total_count, pageNo } = pbkService.getClosings(filters);

        res.json({
            success: true,
            result: result || [],
            total_count,
            pageNo
        });
    } catch (err) { next(err) };
});

// get pbk bachat for closing entry
router.get('/bachat/:pbk_id', async (req, res, next) => {
    try {
        const { pbk_id } = req.params;
        const { dept_id } = req.query;

        const result = pbkService.getBachatByPbk(pbk_id, dept_id);

        res.json({
            success: true,
            result: result || [],
            total_count: result.length
        });
    } catch (err) { next(err) };
});

router.post('/bunch/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        if (req.body && req.body.date && req.body.pbk_id && req.body.pbk_closings && req.body.pbk_closings.length > 0) {
            sutramDB.begin();
            try {
                const { result, voucher_no } = pbkService.insertUpdateClosingBunch({
                    ...req.body,
                    dept_id
                });
                sutramDB.commit();

                res.json({
                    success: true,
                    result,
                    voucher_no
                });
            } catch (err) {
                sutramDB.rollback();
                throw err;
            }
        } else {
            throw new Error('Please fill required fields.')
        }
    } catch (err) {
        next(err)
    };
});

router.put('/bunch/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        if (req.body && req.body.pbk_closings && req.body.pbk_closings.length > 0) {
            sutramDB.begin();
            try {
                const { result, voucher_no } = pbkService.insertUpdateClosingBunch({
                    ...req.body,
                    dept_id
                });
                sutramDB.commit();

                res.json({
                    success: true,
                    result,
                    voucher_no
                });
            } catch (err) {
                sutramDB.rollback();
                throw err;
            }
        } else {
            throw new Error('Please fill required fields.')
        }
    } catch (err) {
        next(err)
    };
});

// delete closing 
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id) {
            const result = pbkService.deleteClosing(id);
            res.json({
                success: true,
                result
            });
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});

// filter closing data
router.post('/filter/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        const filters = { ...req.body, dept_id };

        const { result, total_count, pageNo } = pbkService.getClosings(filters);

        res.json({
            success: true,
            result: result || [],
            total_count,
            pageNo
        });
    } catch (err) { next(err) };
});

// filter pbk bachat data
router.post('/bachat/filter/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        const filters = { ...req.body, dept_id };

        const { result, total_count, pageNo } = pbkService.getBachatList(filters);

        res.json({
            success: true,
            result: result || [],
            total_count,
            pageNo
        });
    } catch (err) { next(err) };
});

module.exports = router;