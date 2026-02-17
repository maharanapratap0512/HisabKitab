const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

const Item = sequelize.define('Item', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    item_hin: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    item_eng: {
        type: DataTypes.STRING(150)
    },
    item_roman: {
        type: DataTypes.STRING(150)
    },
    item_code: {
        type: DataTypes.STRING(50)
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
    tableName: 'item',
    timestamps: false
});

// Associations
const Unit = require('./unit.model');
Item.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
Unit.hasMany(Item, { foreignKey: 'unit_id' });

module.exports = Item;
