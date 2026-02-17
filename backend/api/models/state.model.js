const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

const State = sequelize.define('State', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    state_hin: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    state_eng: {
        type: DataTypes.STRING(100)
    },
    country_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'state',
    timestamps: false
});

module.exports = State;
