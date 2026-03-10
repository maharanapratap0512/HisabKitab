const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');
const Pbk = require('./pbk.model');
const Item = require('./item.model');
const Subitem = require('./subitem.model');
const Unit = require('./unit.model');
const SupportList = require('./support_list.model');

const PBKClosing = sequelize.define('PBKClosing', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pbk_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    voucher_no: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subitem_id: {
        type: DataTypes.INTEGER
    },
    unit_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    condition_id: {
        type: DataTypes.INTEGER
    },
    qty: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    sw_bachat: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    difference: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    hl: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    is_xl: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    }
}, {
    tableName: 'pbk_closing',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

PBKClosing.belongsTo(Pbk, { foreignKey: 'pbk_id', as: 'pbk' });
Pbk.hasMany(PBKClosing, { foreignKey: 'pbk_id', as: 'closings' });
PBKClosing.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
PBKClosing.belongsTo(Subitem, { foreignKey: 'subitem_id', as: 'subitem' });
PBKClosing.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
PBKClosing.belongsTo(SupportList, { foreignKey: 'condition_id', as: 'condition' });


module.exports = PBKClosing;
