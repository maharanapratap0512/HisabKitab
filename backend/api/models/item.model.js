const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');
const Unit = require('./unit.model');
const Category = require('./category.model');

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
Item.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
Unit.hasMany(Item, { foreignKey: 'unit_id' });

// Category Association
Item.belongsToMany(Category, {
    through: 'rel_item_category',
    foreignKey: 'item_id',
    otherKey: 'category_id',
    as: 'categories'
});
Category.belongsToMany(Item, {
    through: 'rel_item_category',
    foreignKey: 'category_id',
    otherKey: 'item_id',
    as: 'items'
});

module.exports = Item;
