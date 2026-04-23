const router = require('express').Router();
const BaseTable = require('../database/base.table');
const Category = new BaseTable('category');
const { dbmodal, sutramDB } = require('../database/db.model');
const db = dbmodal.db;

// get category all
router.get('/', async (req, res, next) => {
    try {
        const result = Category.getAll({}, { full: false, orderBy: 'category.sort_order ASC, category.category_hin ASC' });
        res.json({
            success: true,
            result: result || [],
            total_count: result.length,
        });
    } catch (err) { next(err) };
});


// get category by dept_id
router.get('/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        let where = {};
        
        // Legacy filtering logic if dept_id is provided and not admin (1)
        if (dept_id && dept_id !== '1') {
            where = `category._id IN (SELECT json_each.value FROM department_config, json_each(config_value) WHERE dept_id = ${dept_id} AND config_key='category')`;
        }

        const result = Category.getAll(where, { full: false, orderBy: 'category.sort_order ASC, category.category_hin ASC' });
        res.json({
            success: true,
            result: result || [],
            total_count: result.length
        });
    } catch (err) { next(err) };
});




// post category 
router.post('/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        if (req.body && req.body.category_hin) {
            
            const data = { ...req.body };
            delete data._id; // Ensure we don't pass _id if it exists
            
            sutramDB.begin();
            try {
                let inserted = Category.insert(data, false);
                // BaseTable.insert returns ID if full=false in some versions
                if (typeof inserted !== 'object') {
                    const id = inserted;
                    inserted = Category.getById(id, { full: false });
                }
                
                const insertedId = inserted._id;
                
                // If dept_id is not admin, we might need to update department_config
                if (dept_id && dept_id !== '1') {
                    const configRow = db.prepare(`SELECT config_value FROM department_config WHERE dept_id = ? AND config_key = 'category'`).get(dept_id);
                    if (configRow) {
                        let ids = JSON.parse(configRow.config_value || '[]');
                        if (!ids.includes(insertedId)) {
                            ids.push(insertedId);
                            db.prepare(`UPDATE department_config SET config_value = ? WHERE dept_id = ? AND config_key = 'category'`)
                              .run(JSON.stringify(ids), dept_id);
                        }
                    }
                }
                
                sutramDB.commit();
                res.json({
                    success: true,
                    result: inserted || {}
                });
            } catch (err) {
                sutramDB.rollback();
                throw err;
            }
        }
        else {
            return next(new Error('Please fill required fields.'))
        }
    } catch (err) { next(err) };
});

// update category 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && (req.body.query?._id || req.body.set?._id)) {
            const id = req.body.query?._id || req.body.set?._id;
            const data = { ...req.body.set };
            delete data._id;

            let updated = Category.updateById(data, id, { full: false });
            if (typeof updated !== 'object') {
                updated = Category.getById(id, { full: false });
            }
            res.json({
                success: true,
                result: updated || {}
            });
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});



// delete category 
router.delete('/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (id) {
            sutramDB.begin();
            try {
                const changes = Category.deleteById(id);
                
                // Remove from all department_configs
                const configs = db.prepare(`SELECT _id, config_value FROM department_config WHERE config_key = 'category' AND config_value LIKE ?`).all(`%${id}%`);
                for (const config of configs) {
                    try {
                        let ids = JSON.parse(config.config_value || '[]');
                        if (Array.isArray(ids)) {
                            // Filter out the deleted ID
                            const filteredIds = ids.filter(cid => Number(cid) !== id);
                            if (filteredIds.length !== ids.length) {
                                db.prepare(`UPDATE department_config SET config_value = ? WHERE _id = ?`)
                                  .run(JSON.stringify(filteredIds), config._id);
                            }
                        }
                    } catch (e) {
                        console.log("Error updating department_config for category delete:", e.message);
                    }
                }

                sutramDB.commit();
                res.json({
                    success: true,
                    result: { changes }
                });
            } catch (err) {
                sutramDB.rollback();
                throw err;
            }
        }
        else {
            return next(new Error('Id not Found.'))
        }
    } catch (err) { next(err) };
});


// transfer all category references from one category to another
router.put('/transfer/:dept_id', async (req, res, next) => {
    try {
        const { dept_id } = req.params;
        const { from_id, to_id } = req.body;
        if (!from_id || !to_id) return next(new Error('from_id and to_id are required'));

        sutramDB.begin();
        try {
            // Category IDs are stored in JSON arrays in item and subitem tables
            const tables = ['item', 'subitem'];
            for (const table of tables) {
                const rows = db.prepare(`SELECT _id, categories FROM ${table} WHERE categories LIKE ?`).all(`%${from_id}%`);
                for (const row of rows) {
                    try {
                        let cats = JSON.parse(row.categories || '[]');
                        if (Array.isArray(cats)) {
                            let changed = false;
                            for (let i = 0; i < cats.length; i++) {
                                if (Number(cats[i]) === Number(from_id)) {
                                    cats[i] = Number(to_id);
                                    changed = true;
                                }
                            }
                            if (changed) {
                                cats = [...new Set(cats)];
                                db.prepare(`UPDATE ${table} SET categories = ? WHERE _id = ?`).run(JSON.stringify(cats), row._id);
                            }
                        }
                    } catch (e) {
                        console.log(`Category Transfer error in ${table} ID ${row._id}:`, e.message);
                    }
                }
            }

            sutramDB.commit();
            res.json({ success: true, message: `All references transferred from Category ${from_id} to Category ${to_id}` });
        } catch (err) {
            sutramDB.rollback();
            throw err;
        }
    } catch (err) {
        next(err);
    }
});


module.exports = router;