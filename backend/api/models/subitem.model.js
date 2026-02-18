const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');
const Item = require('./item.model');
const SubitemList = require('./subitem_list.model');
const Unit = require('./unit.model');
const Category = require('./category.model');

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

Subitem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
Item.hasMany(Subitem, { foreignKey: 'item_id', as: 'subitems' });

Subitem.belongsTo(SubitemList, { foreignKey: 'subitem_list_id', as: 'subitem_list' });
SubitemList.hasMany(Subitem, { foreignKey: 'subitem_list_id', as: 'subitems' });

Subitem.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
Unit.hasMany(Subitem, { foreignKey: 'unit_id' });

// Category Association
Subitem.belongsToMany(Category, {
    through: 'rel_subitem_category',
    foreignKey: 'subitem_id',
    otherKey: 'category_id',
    as: 'categories'
});
Category.belongsToMany(Subitem, {
    through: 'rel_subitem_category',
    foreignKey: 'category_id',
    otherKey: 'subitem_id',
    as: 'subitems'
});

// Flatten subitem_list fields into Subitem object
Subitem.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());

    if (values.subitem_list) {
        values.subitem_hin = values.subitem_list.subitem_hin;
        values.subitem_eng = values.subitem_list.subitem_eng;
        values.subitem_roman = values.subitem_list.subitem_roman;
        delete values.subitem_list;
    }

    return values;
};

module.exports = Subitem;
