const router = require('express').Router();
const { Op } = require('sequelize');
const DBContex = require('../database/DBContex');
const DB = new DBContex();
const Fn = require('../database/functions');
const Item = require('../models/item.model');
const PbkBachat = require('../models/pbk_bachat.model');
const Subitem = require('../models/subitem.model');
const SubitemList = require('../models/subitem_list.model');
const SupportList = require('../models/support_list.model');
const Unit = require('../models/unit.model');

// get pbk bachat for closing entry
router.put('/bypbk/:dept_id', async (req, res, next) => {
    try {
        const { pbk_id } = req.body;
        const bachat = await PbkBachat.findAll({
            where: {
                pbk_id: pbk_id,
                qty: {
                    [Op.gt]: 0
                }
            },
            include: [
                { model: Item, as: 'item' },
                {
                    model: Subitem, as: 'subitem',
                    include: [{ model: SubitemList, as: 'subitem_list' }]

                },
                { model: Unit, as: 'unit' },
                { model: SupportList, as: 'condition' }
            ]
        });

        res.status(200).json({
            success: true,
            result: bachat || [],
        });
    } catch (err) { next(err) };
});

module.exports = router;