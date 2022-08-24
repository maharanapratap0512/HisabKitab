const router = require('express').Router();
const DBContex = require('../models/DBContex');
const DB = new DBContex();


//  category add
router.post('/', async (req, res, next) => {
    if (req.body) {
        await DB.insert('bachat', req.body, async (err, data) => {
            if (err) {
                return next(err);
            }
            // await DB.insertToCache('bachat', data, (err, data) => { })
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

//  category get
router.get('/', async (req, res, next) => {
    await DB.getList('bachat').then((res) => {
        res.json({
            success: true,
            result: res || []
        });
    }, (err) => { return next(err) });
});

//  category get
router.get('/home/:dept_id', async (req, res, next) => {
    try {

        let result = [];
        // let conditionString = ` bachat.Stock <> 0 OR bachat.Used <> 0`;
        let sql = DB.query.bachat.with_pending_aawak.replace('?', `where bachat.dept_id = ${req.params.dept_id} AND bachat.Stock <> 0`);
        sql = sql.replace('#', '');
        console.log(sql);
        let stmt = DB.db.prepare(sql);
        for (let row of stmt.iterate({ limit: -1, offset: -1 })) {
            row.aawaks = JSON.parse(row.aawaks);
            row.icategories = JSON.parse(row.icategories);
            row.scategories = JSON.parse(row.scategories);
            result.push(row);
        }
        res.json({
            success: true,
            result: result,
            total_count: result.length
        });
    }
    catch (err) { return next(err) };
});


router.get('/:dept_id', async (req, res, next) => {
    // let conditionString = ``;
    let conditionString = ` bachat.Stock <> 0 OR bachat.Used <> 0`;
    // options = { dept_id = null, conditionString = null, orderBy = null, limit = -1, offset = -1 }
    await DB.getList('bachat', { full: true, dept_id: req.params.dept_id, conditionString: conditionString }).then((resolve) => {
        // for(let i in data){
        //     data[i].bachat_qty = JSON.parse(data[i].bachat_qty);
        //     for(let bcht of data[i].bachat_qty){
        //         data[i][bcht.bachat_type_eng] = bcht.qty;
        //     }
        // }
        res.json({
            success: true,
            result: resolve.data || [],
            total_count: resolve.total_count
        });
    }, (err) => { return next(err) });
});

// category update
// router.put('/', async (req, res, next) => {
//     if (req.body.set && req.body.query) {
//         let condition = '_id = ' + req.body.query._id;
//         await DB.update('bachat', req.body.set, condition, async (err, data) => {
//             if (err) {
//                 return next(err);
//             }
//             // await DB.updateToCache('bachat', req.body.set, condition, (err) => { })
//             await DB.select('bachat', ['*'], condition).then((resolve) => {
//                 res.json({
//                     success: true,
//                     result: resolve || []
//                 });
//             }, (err)=>{
//                 return next(err);
//             });
//         });
//     }
//     else {
//         return next(new Error('Id not found.'))
//     }
// });


// category delete
router.delete('/:id', async (req, res, next) => {
    if (req.params.id) {
        // let condition = '_id = ' + req.params.id;
        await DB.delete('bachat', req.params.id,).then((data) => {
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