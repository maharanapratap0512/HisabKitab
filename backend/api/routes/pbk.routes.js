const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();



//get pbk all
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('pbk').then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: resolve.total_count
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


// pbk filter
router.put('/filter/:dept_id', async (req, res, next) => {
    try {
        const conditions = [];

        if (req.body.roll_no) {
            conditions.push(`pbk.roll_no = ${req.body.roll_no}`);
        }
        if (req.body.gender && req.body.gender.length > 0) {
            conditions.push(`pbk.gender IN (${req.body.gender.join(',')})`);
        }
        if (req.body.state_id && req.body.state_id.length > 0) {
            conditions.push(`pbk.state_id IN (${req.body.state_id.join(',')})`);
        }
        if (req.body.city_id && req.body.city_id.length > 0) {
            conditions.push(`pbk.city_id IN (${req.body.city_id.join(',')})`);
        }
        if (req.body.class_mm_id && req.body.class_mm_id.length > 0) {
            conditions.push(`pbk.class_mm_id IN (${req.body.class_mm_id.join(',')})`);
        }
        if (req.body.bhatti_year) {
            conditions.push(`strftime('%Y', pbk.bhatti_date) = '${req.body.bhatti_year}'`);
        }

        const conditionString = conditions.length > 0 ? conditions.join(' AND ') : null;

        const options = { full: true, conditionString, limit: req.body.limit || -1 };
        if (!req.body.state_id) {
            options.dept_id = req.params.dept_id;
        }

        await DB.getList('pbk', options).then((resolve) => {
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

        const conditions = [];

        if (req.body.roll_no) {
            conditions.push(`pbk.roll_no = ${req.body.roll_no}`);
        }
        if (req.body.gender && req.body.gender.length > 0) {
            conditions.push(`pbk.gender IN (${req.body.gender.join(',')})`);
        }
        if (req.body.state_id && req.body.state_id.length > 0) {
            conditions.push(`pbk.state_id IN (${req.body.state_id.join(',')})`);
        }
        if (req.body.city_id && req.body.city_id.length > 0) {
            conditions.push(`pbk.city_id IN (${req.body.city_id.join(',')})`);
        }
        if (req.body.class_mm_id && req.body.class_mm_id.length > 0) {
            conditions.push(`pbk.class_mm_id IN (${req.body.class_mm_id.join(',')})`);
        }
        if (req.body.bhatti_year) {
            conditions.push(`strftime('%Y', pbk.bhatti_date) = '${req.body.bhatti_year}'`);
        }

        if (conditions.length === 0) {
            orderBy = "pbk._id desc";
        }
        if (req.body.pageNo && req.body.pageNo > 0) {
            offset = (req.body.pageNo - 1) * limit;
            page = req.body.pageNo;
        }
        const conditionString = conditions.length > 0 ? conditions.join(' AND ') : null;
        // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
        const options = { full: true, conditionString: conditionString, orderBy: orderBy, limit: limit, offset: offset };
        if (!req.body.state_id) {
            options.dept_id = req.params.dept_id;
        }
        await DB.getList('pbk', options).then((resolve) => {
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
            req.body.set.document = (req.body.set.document ? JSON.stringify(req.body.set.document) : null);
            req.body.set.relative_ref = (req.body.set.relative_ref ? JSON.stringify(req.body.set.relative_ref) : null);
            req.body.set.alt_mo_no = (req.body.set.alt_mo_no ? JSON.stringify(req.body.set.alt_mo_no) : null);

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