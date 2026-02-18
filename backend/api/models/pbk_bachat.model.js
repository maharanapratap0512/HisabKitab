const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');
const Pbk = require('./pbk.model');
const Item = require('./item.model');
const Subitem = require('./subitem.model');
const Unit = require('./unit.model');
const SupportList = require('./support_list.model');

const PbkBachat = sequelize.define('PbkBachat', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pbk_id: {
        type: DataTypes.INTEGER,
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
        defaultValue: 0
    },
    dept_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'pbk_bachat',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});


PbkBachat.belongsTo(Pbk, { foreignKey: 'pbk_id', as: 'pbk' });
Pbk.hasMany(PbkBachat, { foreignKey: 'pbk_id', as: 'bachats' });
PbkBachat.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
PbkBachat.belongsTo(Subitem, { foreignKey: 'subitem_id', as: 'subitem' });
PbkBachat.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
PbkBachat.belongsTo(SupportList, { foreignKey: 'condition_id', as: 'condition' });

module.exports = PbkBachat;
