//@ts-check
const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  pbk add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.pbk_hin) {
        await DB.insert('pbk', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            data.document = (data.document != "[null]" ? JSON.parse(data.document) : {});
            res.json({
                success: true,
                result: data || []
            });
        })
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


//  pbk add by dept
router.post('/:dept_id', async (req, res, next) => {
    if (req.body && req.body.pbk_hin) {
        await DB.insertFromDept('pbk', req.body, req.params.dept_id).then((data) => {
            data.document = (data.document != "[null]" ? JSON.parse(data.document) : {});
            res.json({
                success: true,
                result: data || []
            });
        }, (err) => {
            return next(err);
        });
    }
    else {
        return next(new Error('Please fill required fields.'))
    }
});


//  pbk get
router.get('/', async (req, res, next) => {
    await DB.getList('pbk').then((resolve) => {
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});


//pbk get by dept
router.get('/:dept_id', async (req, res, next) => {
    await DB.getFullListByDept('pbk', req.params.dept_id, ` (pbk.status is null OR pbk.status NOT LIKE "%nimmit%") `, ` order by pbk._id desc`, 100).then((resolve) => {
        console.log(resolve.data);
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
    }, (err) => { return next(err) });
});

//get all nimmit list
router.get('/nimmit/', async (req, res, next) => {
    await DB.getFullList('pbk',` pbk.status = "nimmit"`,` order by pbk._id desc`, 100).then((resolve) => {
        // for (let i in resolve) {
        //     resolve[i].document = (resolve[i].document != "[null]" ? JSON.parse(resolve[i].document) : {});
        //     resolve[i].relative_ref = (resolve[i].relative_ref != "[null]" ? JSON.parse(resolve[i].relative_ref) : []);
        //     resolve[i].alt_mo_no = (resolve[i].alt_mo_no != "[null]" ? JSON.parse(resolve[i].alt_mo_no) : []);
        // }
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count || 0
        });
    }, (err) => { return next(err) });
});

//pbk get by dept and filter
router.put('/:dept_id', async (req, res, next) => {
    let orderBy = null, limit = 100, offset = null, page = 1;
    let pbkCondition = ` 1=1 ${req.body.status ? ` AND pbk.status = ${req.body.status}` : ` AND ( pbk.status is null OR pbk.status NOT LIKE "%nimmit%")`}`;
    let conditionString = ` ${req.body.roll_no ? ` AND pbk.roll_no = ${req.body.roll_no}` : ``} ${req.body.gender.length > 0 ? ` AND pbk.gender in (${req.body.gender.join(',')})` : ``} ${req.body.state_id.length > 0 ? ` AND pbk.state_id in (${req.body.state_id.join(',')})` : ``} ${req.body.city_id.length > 0 ? ` AND pbk.city_id in (${req.body.city_id.join(',')})` : ``} ${req.body.class_mm_id.length > 0 ? ` AND pbk.class_mm_id in (${req.body.class_mm_id.join(',')})` : ``} ${req.body.bhatti_year ? ` AND strftime('%Y',pbk.bhatti_date) = '${req.body.bhatti_year}'` : ``}`;
    if(conditionString.trim() == ``){
        limit = 100;
        orderBy = "pbk._id desc";
    }
    if(req.body.pageNo && req.body.pageNo > 0){
        offset = (req.body.pageNo - 1) * 100;
        limit = 100;
        page = req.body.pageNo;
    }
    await DB.getFullListByDept('pbk', req.params.dept_id, pbkCondition + conditionString, orderBy, limit, offset).then((resolve) => {
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
    }, (err) => { return next(err) });
});


//pbk get by dept
router.get('/forConfig/:dept_id', async (req, res, next) => {
    await DB.getFullListForDeptConfig('pbk', req.params.dept_id).then((resolve) => {
        for (let i in resolve) {
            resolve[i].document = (resolve[i].document != "[null]" ? JSON.parse(resolve[i].document) : {});
            resolve[i].relative_ref = (resolve[i].relative_ref != "[null]" ? JSON.parse(resolve[i].relative_ref) : []);
            resolve[i].alt_mo_no = (resolve[i].alt_mo_no != "[null]" ? JSON.parse(resolve[i].alt_mo_no) : []);
        }
        res.json({
            success: true,
            result: resolve || []
        });
    }, (err) => { return next(err) });
});


// pbk update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'pbk._id = ' + req.body.query._id;
        await DB.update('pbk', req.body.set, condition, async (err, data) => {
            if (err) {
                return next(err);
            }
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
});


// pbk delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('pbk', condition, (err, data) => {
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