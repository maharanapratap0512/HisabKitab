const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

const Subitem = sequelize.define('Subitem', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subitem_list_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit_id: {
        type: DataTypes.INTEGER
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'subitem',
    timestamps: false
});

// Associations
const Item = require('./item.model');
const SubitemList = require('./subitem_list.model');
const Unit = require('./unit.model');

Subitem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
Item.hasMany(Subitem, { foreignKey: 'item_id', as: 'subitems' });

Subitem.belongsTo(SubitemList, { foreignKey: 'subitem_list_id', as: 'subitem_list' });
SubitemList.hasMany(Subitem, { foreignKey: 'subitem_list_id', as: 'subitems' });

Subitem.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
Unit.hasMany(Subitem, { foreignKey: 'unit_id' });

module.exports = Subitem;
