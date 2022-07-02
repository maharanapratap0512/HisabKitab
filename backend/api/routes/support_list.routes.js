const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  support_list add
router.post('/', async (req, res, next) => {
    if (req.body && req.body.list_type && req.body.list_name_eng) {
        await DB.insert('support_list', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('support_list', data, (err, data) => { })
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

//  support_list get
router.get('/', async (req, res, next) => {
    await DB.getList('support_list').then((response) => {
        res.json({
            success: true,
            result: response || []
        });
    }, (err) => { return next(err) });
});

//  support_list get
router.get('/ajtypes/:dept_id', async (req, res, next) => {
    let aj = [];
    await DB.getList('aawak_type', { dept_id: req.params.dept_id }).then((response) => {
        aj.push(...response.data);
    }, (err) => {
        console.log(err)    
    });
    await DB.getList('jawak_type', { dept_id: req.params.dept_id }).then((response) => {
        aj.push(...response.data);
    }, (err) => {
        console.log(err)    
    });
    
    res.json({
        success: true,
        result: aj 
    });
});

//  support_list get
// router.get('/ajtypes/forConfig/:dept_id', async (req, res, next) => {
//     await DB.getAJtypeForConfig(req.params.dept_id).then((response) => {
//         res.json({
//             success: true,
//             result: response || []
//         });
//     }, (err) => { return next(err) });
// });

// support_list update
router.put('/', async (req, res, next) => {
    if (req.body.set && req.body.query) {
        let condition = 'support_list._id = ' + req.body.query._id;
        await DB.update('support_list', req.body.set, condition).then((data) => {
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


// support_list delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        let condition = '_id = ' + req.params.id;
        await DB.delete('support_list', condition).then((data) => {
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