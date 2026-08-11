const router = require('express').Router();
const DBContex = require('../database/DBContex');
const DB = new DBContex();


// get zone by dept
router.get('/:dept_id?', async (req, res, next) => {
    try {
        await DB.getList('zone', { full: true }).then((resolve) => {
            res.json({
                success: true,
                result: resolve.data || [],
                total_count: (resolve.total_count ? resolve.total_count : 0),
            });
        });
    } catch (err) { next(err) };
});


// post zone 
router.post('/', async (req, res, next) => {
    try {
        if (req.body && req.body.zone_hin) {
            await DB.insert('zone', req.body).then(async (data) => {
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


// update zone 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && req.body.query) {
            await DB.update('zone', req.body.set, req.body.query._id).then(async (data) => {
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


// delete zone 
router.delete('/:id', async (req, res, next) => {
    try {
        if (req.params.id) {
            await DB.delete('zone', req.params.id).then((data) => {
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


// auto create & assign Indian zones
router.post('/auto-assign', async (req, res, next) => {
    try {
        const db = DB.db;

        // 1. Reset all state zone_id to null
        db.prepare('UPDATE state SET zone_id = NULL').run();

        // 2. Remove all existing zones
        db.prepare('DELETE FROM zone').run();

        // 3. Insert 6 standard Indian Zones
        const zones = [
            { _id: 1, zone_hin: 'उत्तर जोन', zone_eng: 'North Zone', country_id: 1, active: 1 },
            { _id: 2, zone_hin: 'दक्षिण जोन', zone_eng: 'South Zone', country_id: 1, active: 1 },
            { _id: 3, zone_hin: 'पूर्व जोन', zone_eng: 'East Zone', country_id: 1, active: 1 },
            { _id: 4, zone_hin: 'पश्चिम जोन', zone_eng: 'West Zone', country_id: 1, active: 1 },
            { _id: 5, zone_hin: 'मध्य जोन', zone_eng: 'Central Zone', country_id: 1, active: 1 },
            { _id: 6, zone_hin: 'उत्तर-पूर्व जोन', zone_eng: 'North-East Zone', country_id: 1, active: 1 }
        ];

        const insertZone = db.prepare('INSERT INTO zone (_id, zone_hin, zone_eng, country_id, active) VALUES (@_id, @zone_hin, @zone_eng, @country_id, @active)');
        const insertManyZones = db.transaction((zoneList) => {
            for (const z of zoneList) insertZone.run(z);
        });
        insertManyZones(zones);

        // 4. Assign states to zones
        const stateZoneMap = {
            1: [6, 10, 13, 14, 15, 28, 29, 35], // North Zone
            2: [1, 2, 11, 17, 18, 19, 27, 31, 32], // South Zone
            3: [5, 16, 26, 36], // East Zone
            4: [8, 9, 12, 21], // West Zone
            5: [7, 20, 34], // Central Zone
            6: [3, 4, 22, 23, 24, 25, 30, 33] // North-East Zone
        };

        const updateState = db.prepare('UPDATE state SET zone_id = ? WHERE _id = ?');
        const updateAllStates = db.transaction(() => {
            for (const [zoneId, stateIds] of Object.entries(stateZoneMap)) {
                for (const stId of stateIds) {
                    updateState.run(Number(zoneId), stId);
                }
            }
        });
        updateAllStates();

        const updatedZones = db.prepare('SELECT * FROM zone').all();

        res.json({
            success: true,
            message: 'All zones reset, auto-created, and Indian states assigned successfully.',
            result: updatedZones
        });
    } catch (err) { next(err); }
});


module.exports = router;