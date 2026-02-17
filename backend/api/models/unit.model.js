const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

const Unit = sequelize.define('Unit', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    unit_short: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    unit_full: {
        type: DataTypes.STRING(100)
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'unit',
    timestamps: false
});

module.exports = Unit;
