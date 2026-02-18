const express = require('express');
const router = express.Router();
const { Op, col } = require('sequelize');
const { sequelize } = require('../database/db.model');
const Fn = require('../database/functions');
const { HmpRecipe, HmpRecipeInput, HmpRecipeOutput, HmpBatch, HmpBatchInput, HmpBatchOutput, Mm, Item, Subitem, SubitemList, Unit, SupportList } = require('../models/hmp.model');

// Get All Recipes
router.get('/recipe/:dept_id', async (req, res, next) => {
    try {
        const recipes = await HmpRecipe.findAll({
            where: {
                dept_id: req.params.dept_id,
                active: 1
            },
            include: [
                { model: HmpRecipeInput, as: 'inputs', required: false },
                { model: HmpRecipeOutput, as: 'outputs', required: false }
            ],
            order: [['recipe_name', 'ASC']]
        });

        res.status(200).json({ success: true, result: recipes });
    } catch (e) { next(e); }
});

// Put Batches (get Filtered List)
router.put('/batch/:dept_id', async (req, res, next) => {
    try {
        const { mm_id, item_id, date_from, date_to } = req.body;
        const where = { dept_id: req.params.dept_id, active: 1 };

        if (mm_id) where.mm_id = mm_id;
        if (date_from && date_to) {
            where.date = { [Op.between]: [date_from, date_to] };
        } else if (date_from) {
            where.date = { [Op.gte]: date_from };
        } else if (date_to) {
            where.date = { [Op.lte]: date_to };
        }

        // Filter batches that contain a specific item in inputs OR outputs
        if (item_id) {
            where._id = {
                [Op.in]: sequelize.literal(`(
                    SELECT batch_id FROM hmp_batch_input WHERE item_id = ${item_id} AND active = 1
                    UNION
                    SELECT batch_id FROM hmp_batch_output WHERE item_id = ${item_id} AND active = 1
                )`)
            };
        }

        const batches = await HmpBatch.findAll({
            where: where,
            include: [
                { model: HmpRecipe, as: 'recipe' },
                { model: Mm, as: 'mm' },
                {
                    model: HmpBatchInput,
                    as: 'inputs',
                    where: { active: 1 },
                    include: [
                        { model: Item, as: 'item' },
                        {
                            model: Subitem,
                            as: "subitem",
                            include: [{ model: SubitemList, as: 'subitem_list' }]
                        },
                        { model: Unit, as: "unit" },
                        { model: SupportList, as: "condition" },
                    ],
                    required: false
                },
                {
                    model: HmpBatchOutput,
                    as: 'outputs',
                    where: { active: 1 },
                    include: [
                        { model: Item, as: 'item' },
                        {
                            model: Subitem,
                            as: "subitem",
                            include: [{ model: SubitemList, as: 'subitem_list' }]
                        },
                        { model: Unit, as: "unit" },
                        { model: SupportList, as: "condition" },
                    ],
                    required: false
                }
            ],
            order: [['date', 'DESC'], ['_id', 'DESC']]
        });

        res.status(200).json({ success: true, result: batches });
    } catch (e) { next(e); }
});

// Create batch / update recipe
router.post('/batch/:dept_id', async (req, res, next) => {
    try {
        req.body.dept_id = req.params.dept_id;
        req.body.batch_no = 'batch_no';
        await Fn.begin();
        if (!req.body.recipe_id || req.body.update_recipe) {
            console.log("inserting recipe");
            req.body.recipe_id = await Fn.insertUpdateHMPRecipe(req.body);
        }
        console.log("inserting batch");
        let batchId = await Fn.insertUpdateHMPBatch(req.body);

        let batch;
        if (batchId) {
            batch = await HmpBatch.findByPk(batchId, {
                include: [
                    {
                        model: HmpRecipe,
                        as: 'recipe'
                    },
                    {
                        model: HmpBatchInput,
                        as: 'inputs',
                        where: { active: 1 },
                        include: [
                            { model: Item, as: "item" },
                            {
                                model: Subitem,
                                as: "subitem",
                                include: [{ model: SubitemList, as: 'subitem_list' }]
                            },
                            { model: Unit, as: "unit" },
                            { model: SupportList, as: "condition" },
                        ],
                        required: false
                    },
                    {
                        model: HmpBatchOutput,
                        as: 'outputs',
                        where: { active: 1 },
                        include: [
                            { model: Item, as: "item" },
                            {
                                model: Subitem,
                                as: "subitem",
                                include: [{ model: SubitemList, as: 'subitem_list' }]
                            },
                            { model: Unit, as: "unit" },
                            { model: SupportList, as: "condition" },
                        ],
                        required: false
                    }
                ]
            });
        }

        await Fn.commit();
        res.status(200).json({ success: true, result: batch });
    } catch (e) {
        console.log(e);

        await Fn.rollback();
        next(e);
    }
});


// Update batch
router.put('/:id', async (req, res, next) => {
    try {
        req.body._id = req.params.id;
        await Fn.begin();
        if (!req.body.recipe_id || req.body.update_recipe) {
            console.log("inserting recipe");
            req.body.recipe_id = await Fn.insertUpdateHMPRecipe(req.body);
        }
        console.log("inserting batch");
        let batchId = await Fn.insertUpdateHMPBatch(req.body);

        let batch;
        if (batchId) {
            batch = await HmpBatch.findByPk(batchId, {
                include: [
                    {
                        model: HmpRecipe,
                        as: 'recipe'
                    },
                    {
                        model: HmpBatchInput,
                        as: 'inputs',
                        where: { active: 1 },
                        include: [
                            { model: Item, as: "item" },
                            {
                                model: Subitem,
                                as: "subitem",
                                include: [{ model: SubitemList, as: 'subitem_list' }]
                            },
                            { model: Unit, as: "unit" },
                            { model: SupportList, as: "condition" },
                        ],
                        required: false
                    },
                    {
                        model: HmpBatchOutput,
                        as: 'outputs',
                        where: { active: 1 },
                        include: [
                            { model: Item, as: "item" },
                            {
                                model: Subitem,
                                as: "subitem",
                                include: [{ model: SubitemList, as: 'subitem_list' }]
                            },
                            { model: Unit, as: "unit" },
                            { model: SupportList, as: "condition" },
                        ],
                        required: false
                    }
                ]
            });
        }

        await Fn.commit();
        res.status(200).json({ success: true, result: batch });
    } catch (e) {
        console.log(e);

        await Fn.rollback();
        next(e);
    }
});

// delete batch


// Delete Batch
router.delete('/:id', async (req, res, next) => {
    try {
        await Fn.begin();
        const result = await Fn.deleteHMPBatch(req.params.id);
        await Fn.commit();
        res.status(200).json({ success: true, result });
    } catch (e) {
        await Fn.rollback();
        next(e);
    }
});

// Delete Batch Input
router.delete('/input/:id', async (req, res, next) => {
    try {
        await Fn.begin();
        const result = await Fn.deleteHMPBatchInput(req.params.id);
        await Fn.commit();
        res.status(200).json({ success: true, result });
    } catch (e) {
        await Fn.rollback();
        next(e);
    }
});

// Delete Batch Output
router.delete('/output/:id', async (req, res, next) => {
    try {
        await Fn.begin();
        const result = await Fn.deleteHMPBatchOutput(req.params.id);
        await Fn.commit();
        res.status(200).json({ success: true, result });
    } catch (e) {
        await Fn.rollback();
        next(e);
    }
});

// Delete Recipe
router.delete('/recipe/:id', async (req, res, next) => {
    try {
        await Fn.begin();
        const result = await Fn.deleteHMPRecipe(req.params.id);
        await Fn.commit();
        res.status(200).json({ success: true, result });
    } catch (e) {
        await Fn.rollback();
        next(e);
    }
});

module.exports = router;