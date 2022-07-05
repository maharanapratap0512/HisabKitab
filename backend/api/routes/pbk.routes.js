const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();



//get pbk all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('pbk').then((resolve) => {
            res.json({
                success: true,
                result: resolve || []
            });
        });
    } catch (err) { next(err) };
});


//get pbk by dept
router.get('/:dept_id', async (req, res, next) => {
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    try {
        await DB.getList('pbk', { full: true, dept_id: req.params.dept_id, orderBy: `pbk._id desc`, limit: 100 }).then((resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : {});
                resolve.data[i].relative_ref = (resolve.data[i].relative_ref != "[null]" ? JSON.parse(resolve.data[i].relative_ref) : []);
                resolve.data[i].alt_mo_no = (resolve.data[i].alt_mo_no != "[null]" ? JSON.parse(resolve.data[i].alt_mo_no) : []);
            }
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


//get pbk by dept + filter + pageNo
router.put('/:dept_id', async (req, res, next) => {
    try {
        let orderBy = null, limit = 100, offset = null, page = 1;

        let conditionString = `1=1 ${req.body.roll_no ? ` AND pbk.roll_no = ${req.body.roll_no}` : ``} ${(req.body.gender && req.body.gender.length) > 0 ? ` AND pbk.gender in (${req.body.gender.join(',')})` : ``} ${(req.body.state_id && req.body.state_id.length) > 0 ? ` AND pbk.state_id in (${req.body.state_id.join(',')})` : ``} ${(req.body.city_id && req.body.city_id.length) > 0 ? ` AND pbk.city_id in (${req.body.city_id.join(',')})` : ``} ${(req.body.class_mm_id && req.body.class_mm_id.length) > 0 ? ` AND pbk.class_mm_id in (${req.body.class_mm_id.join(',')})` : ``} ${req.body.bhatti_year ? ` AND strftime('%Y',pbk.bhatti_date) = '${req.body.bhatti_year}'` : ``}`;

        if (conditionString.trim() == ``) {
            orderBy = "pbk._id desc";
        }
        if (req.body.pageNo && req.body.pageNo > 0) {
            offset = (req.body.pageNo - 1) * limit;
            page = req.body.pageNo;
        }
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        await DB.getList('pbk', { full: true, dept_id: req.params.dept_id, conditionString: conditionString, orderBy: orderBy, limit: limit, offset: offset }).then((resolve) => {
            for (let i in resolve.data) {
                resolve.data[i].document = (resolve.data[i].document != "[null]" ? JSON.parse(resolve.data[i].document) : {});
                resolve.data[i].relative_ref = (resolve.data[i].relative_ref != "[null]" ? JSON.parse(resolve.data[i].relative_ref) : []);
                resolve.data[i].alt_mo_no = (resolve.data[i].alt_mo_no != "[null]" ? JSON.parse(resolve.data[i].alt_mo_no) : []);
            }
            res.json({
                success: true,
                result: resolve.data || [],
                pageNo: page,
                total_count: resolve.total_count
            });
        });
    } catch (err) { next(err) };
});


// post pbk 
router.post('/:dept_id', async (req, res, next) => {
    try {
        if (req.body && req.body.pbk_hin) {
            req.body.document = req.body.document ? JSON.stringify(req.body.document) : null;
            req.body.alt_mo_no = req.body.alt_mo_no ? JSON.stringify(req.body.alt_mo_no) : null;
            req.body.relative_ref = req.body.relative_ref ? JSON.stringify(req.body.relative_ref) : null;

            await DB.insert('pbk', req.body, req.params.dept_id).then((data) => {
                data.document = (data.document != "[null]" ? JSON.parse(data.document) : {});
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


// update pbk 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('pbk', req.body.set, req.body.query._id).then(async (data) => {
                data.document = (data.document != "[null]" ? JSON.parse(data.document) : {});
                data.relative_ref = (data.relative_ref != "[null]" ? JSON.parse(data.relative_ref) : []);
                data.alt_mo_no = (data.alt_mo_no != "[null]" ? JSON.parse(data.alt_mo_no) : []);
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


// delete pbk
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('pbk', req.params.id).then((data) => {
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