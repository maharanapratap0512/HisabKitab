const router = require('express').Router();
const pbkService = require('../services/pbk.service');

// get pbk bachat for closing entry
router.put('/bypbk/:dept_id', async (req, res, next) => {
    try {
        const { pbk_id } = req.body;
        const { dept_id } = req.params;

        const result = pbkService.getBachatByPbk(pbk_id, dept_id);

        res.status(200).json({
            success: true,
            result: result || [],
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;