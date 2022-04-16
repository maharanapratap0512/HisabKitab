//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const fs = require('fs');
const DB = require('../models/DBContex');



//  department DB download
router.get('/full/:dept_id', async (req, res, next) => {
    DB.generateDB(req.params.dept_id).then(async (result) => {
        res.json({
            success: true,
            result: result
        });


    }, (reject) => {
        next(reject);
    });
});


//  department DB download
router.get('/updates/:dept_id', async (req, res, next) => {
    DB.generateUpdateDB(req.params.dept_id).then(async (result) => {
        res.json({
            success: true,
            result: result
        });


    }, (reject) => {
        next(reject);
    });
});


module.exports = router;