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
        let conditionString = `1=1`;
        conditionString += `${req.body.pbk_id ? ` AND pbk_id = ${req.body.pbk_id}` : ``}`
        let query = DB.query.reports.pbk.replace('?', (conditionString.trim() != `1=1` ? `where ` + conditionString : ``));
        console.log(query);
        let stmt = DB.db.prepare(query);
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