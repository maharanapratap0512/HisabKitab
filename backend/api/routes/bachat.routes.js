const router = require('express').Router();
const DBContex = require('../database/DBContex');
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
        for (let i in resolve.data) {
            resolve.data[i].icategories = resolve.data[i].icategories ? JSON.parse(resolve.data[i].icategories) : []
            resolve.data[i].scategories = resolve.data[i].scategories ? JSON.parse(resolve.data[i].scategories) : null
            resolve.data[i].idocument = resolve.data[i].idocument ? JSON.parse(resolve.data[i].idocument) : []
            resolve.data[i].sdocument = resolve.data[i].sdocument ? JSON.parse(resolve.data[i].sdocument) : []
        }
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

// delete multiple bachat 
router.delete('/many/:dept_id', async (req, res, next) => {
    try {
        if (req.body) {
            let conditions = [];
            // conditions.push(`dept_id = ${req.params.dept_id}`)
            if (req.body.mm_id && req.body.mm_id.length > 0)
                conditions.push(`mm_id in (${req.body.mm_id.join(',')})`)
            if (req.body.item_id && req.body.item_id.length > 0)
                conditions.push(`item_id in (${req.body.item_id.join(',')})`)
            if (req.body.subitem_id && req.body.subitem_id.length > 0)
                conditions.push(`subitem_id in (${req.body.subitem_id.join(',')})`)
            if (req.body.unit_id && req.body.unit_id.length > 0)
                conditions.push(`unit_id in (${req.body.unit_id.join(',')})`)
            if (req.body.dept_id && req.body.dept_id.length > 0)
                conditions.push(`dept_id in (${req.body.dept_id.join(',')})`)
            let conditionString = conditions.length > 0 ? conditions.join(' AND ') : ``;
            await DB.deleteMany('bachat', conditionString).then((data) => {
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

// filter bachat 
router.put('/filter/:dept_id', async (req, res, next) => {
    try {
        if (req.params.dept_id) {
            let conditions = [];
            conditions.push(`bachat.dept_id = ${req.params.dept_id}`)
            if (req.body.mm_id && req.body.mm_id.length > 0)
                conditions.push(`bachat.mm_id in (${req.body.mm_id.join(',')})`)
            if (req.body.item_id && req.body.item_id.length > 0)
                conditions.push(`bachat.item_id in (${req.body.item_id.join(',')})`)
            if (req.body.subitem_id && req.body.subitem_id.length > 0)
                conditions.push(`bachat.subitem_id in (${req.body.subitem_id.join(',')})`)
            if (req.body.unit_id && req.body.unit_id.length > 0)
                conditions.push(`bachat.unit_id in (${req.body.unit_id.join(',')})`)

            let conditionString = conditions.length > 0 ? conditions.join(' AND ') : ``;
            await DB.getList('bachat', { full: true, conditionString: conditionString }).then((resolve) => {
                for (let i in resolve.data) {
                    resolve.data[i].icategories = resolve.data[i].icategories ? JSON.parse(resolve.data[i].icategories) : []
                    resolve.data[i].scategories = resolve.data[i].scategories ? JSON.parse(resolve.data[i].scategories) : null
                    resolve.data[i].idocument = resolve.data[i].idocument ? JSON.parse(resolve.data[i].idocument) : []
                    resolve.data[i].sdocument = resolve.data[i].sdocument ? JSON.parse(resolve.data[i].sdocument) : []
                }
                res.json({
                    success: true,
                    result: resolve.data || [],
                    total_count: resolve.total_count
                });
            });
        }
        else {
            return next(new Error('Dept Id not Found.'))
        }
    } catch (err) { next(err) };
});

// bachat delete
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