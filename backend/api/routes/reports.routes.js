const router = require('express').Router();
const { json } = require('body-parser');
const DBContex = require('../models/DBContex');
const DB = new DBContex();


// get country all
// router.get('/', async (req, res, next) => {
//     await DB.getList('country').then(async (data) => {
//         res.json({
//             success: true,
//             result: data.data || [],
//             total_count: (data.total_count ? data.total_count : 0),
//         });
//     });
// });

// by pbk 
router.put('/pbk/', async (req, res, next) => {
    try {
        let stmt = DB.db.prepare(DB.query.reports.pbk.replace('?', `where pbk_id is not null`));
        res.json({
            result:stmt.all()
        })
    } catch (err) { next(err) };
});


// delete country 
// router.delete('/:id', async (req, res, next) => {
//     if (req.params.id) {
//         await DB.delete('country', req.params.id).then((data) => {
//             res.json({
//                 success: true,
//                 result: data
//             });
//         });
//     }
//     else {
//         return next(new Error('Id not found.'))
//     }
// });


module.exports = router;