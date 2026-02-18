const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

const Category = sequelize.define('Category', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_hin: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    category_eng: {
        type: DataTypes.STRING(50)
    },
    category_roman: {
        type: DataTypes.STRING(50)
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'category',
    timestamps: false
});

module.exports = Category;
