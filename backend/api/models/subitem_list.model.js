const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

const SubitemList = sequelize.define('SubitemList', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subitem_hin: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    subitem_eng: {
        type: DataTypes.STRING(150)
    },
    subitem_roman: {
        type: DataTypes.STRING(150)
    },
    extra_note: {
        type: DataTypes.TEXT
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'subitem_list',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = SubitemList;
