const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();



// get state
router.get('/', async (req, res, next) => {
    try {
        await DB.getList('state').then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});

// get state by dept
router.get('/:dept_id', async (req, res, next) => {
    try {
        await DB.getList('state', { full: true }).then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// post state 
router.post('/', async (req, res, next) => {
    try {
        if (req.body && req.body.state_hin) {
            await DB.insert('state', req.body).then(async (data) => {
                res.json({
                    success: true,
                    result: data || []
                });
            })
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});


// update state 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('state', req.body.set, req.body.query._id).then(async (data) => {
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


// transfer all state references from one state to another
router.put('/transfer/:dept_id?', async (req, res, next) => {
    try {
        const { from_id, to_id } = req.body;
        if (!from_id || !to_id) return next(new Error('from_id and to_id are required'));

        const tables = [
            { table: 'mm', col: 'state_id' },
            { table: 'pbk', col: 'state_id' },
            { table: 'nimitt', col: 'state_id' },
            { table: 'district', col: 'state_id' },
            { table: 'city', col: 'state_id' }
        ];

        for (const t of tables) {
            try {
                DB.db.prepare(`UPDATE ${t.table} SET ${t.col} = ? WHERE ${t.col} = ?`).run(parseInt(to_id), parseInt(from_id));
            } catch (e) {
                console.log(`State transfer error for ${t.table}:`, e.message);
            }
        }

        res.json({ success: true, message: `All references transferred from State ${from_id} to State ${to_id}` });
    } catch (err) { next(err); }
});

// delete state 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('state', req.params.id).then((data) => {
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