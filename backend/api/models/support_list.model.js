const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

const SupportList = sequelize.define('SupportList', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    list_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    list_name_hin: {
        type: DataTypes.STRING(50)
    },
    list_name_eng: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    list_name_roman: {
        type: DataTypes.STRING(50)
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'support_list',
    timestamps: false
});

module.exports = SupportList;
