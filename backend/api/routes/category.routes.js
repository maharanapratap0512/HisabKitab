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

            try { checkCategoryConflict(data); } catch (e) { return next(e); }

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

// Helper for cross-validation
function checkCategoryConflict(data, currentId = null) {
    const names = [data.category_hin, data.category_eng, data.category_roman].filter(Boolean);
    if (names.length === 0) return;

    for (const name of names) {
        // 1. Check if name exists as another category's main name
        const conflictName = Category.getOne(
            `_id != ${currentId || 0} AND (category_hin = '${name.replace(/'/g, "''")}' OR category_eng = '${name.replace(/'/g, "''")}' OR category_roman = '${name.replace(/'/g, "''")}')`,
            { full: false }
        );
        if (conflictName) throw new Error(`Yeh name '${name}' pehle se hi category '${conflictName.category_hin}' ka primary name hai.`);

        // 2. Check if name exists as an alias for another category
        const conflictAlias = db.prepare(`
            SELECT _id, category_hin FROM category, json_each(category.alias) 
            WHERE _id != ? AND json_each.value = ? LIMIT 1
        `).get(currentId || 0, name);
        if (conflictAlias) throw new Error(`Yeh name '${name}' pehle se hi category '${conflictAlias.category_hin}' ke aliases mein exist karta hai.`);
    }
}

// update category 
router.put('/', async (req, res, next) => {
    try {
        if (req.body.set && (req.body.query?._id || req.body.set?._id)) {
            const id = req.body.query?._id || req.body.set?._id;
            const data = { ...req.body.set };
            delete data._id;

            try { checkCategoryConflict(data, id); } catch (e) { return next(e); }

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

// Update Category Aliases (array of strings in 'alias' column)
router.put('/aliases/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { aliases } = req.body; // Expecting array of strings

        if (!Array.isArray(aliases)) return next(new Error('Aliases must be an array of strings'));

        // Validation logic: check if any alias exists in category names
        for (const alias of aliases) {
            const trimmed = alias.trim();
            if (!trimmed) continue;
            
            const conflict = Category.getOne(
                `_id != ${id} AND (category_hin = '${trimmed.replace(/'/g, "''")}' OR category_eng = '${trimmed.replace(/'/g, "''")}' OR category_roman = '${trimmed.replace(/'/g, "''")}')`,
                { full: false }
            );

            if (conflict) {
                return next(new Error(`Yeh alias '${trimmed}' pehle se hi category '${conflict.category_hin}' ka PRIMARY name hai.`));
            }

            // NEW LOGIC: Check if this alias exists in OTHER categories' aliases
            const aliasConflict = db.prepare(`
                SELECT _id, category_hin FROM category, json_each(category.alias) 
                WHERE _id != ? AND json_each.value = ? LIMIT 1
            `).get(id, trimmed);

            if (aliasConflict) {
                return next(new Error(`Yeh alias '${trimmed}' pehle se hi category '${aliasConflict.category_hin}' ke aliases mein exist karta hai.`));
            }
        }

        Category.updateById({ alias: JSON.stringify(aliases) }, id);
        res.json({ success: true, result: aliases });
    } catch (err) { next(err); }
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
            // Relational approach for transfer (Junction Tables)
            // 1. Rel_item_category
            db.prepare(`UPDATE OR IGNORE rel_item_category SET category_id = ? WHERE category_id = ?`).run(to_id, from_id);
            db.prepare(`DELETE FROM rel_item_category WHERE category_id = ?`).run(from_id); // Cleanup leftovers if IGNORE triggered

            // 2. Rel_subitem_category
            db.prepare(`UPDATE OR IGNORE rel_subitem_category SET category_id = ? WHERE category_id = ?`).run(to_id, from_id);
            db.prepare(`DELETE FROM rel_subitem_category WHERE category_id = ?`).run(from_id);

            // 3. Variant category map
            db.prepare(`UPDATE OR IGNORE variant_category_map SET category_id = ? WHERE category_id = ?`).run(to_id, from_id);
            db.prepare(`DELETE FROM variant_category_map WHERE category_id = ?`).run(from_id);

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