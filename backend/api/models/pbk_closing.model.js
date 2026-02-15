const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

const PBKClosing = sequelize.define('PBKClosing', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pbk_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    voucher_no: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
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
        allowNull: false
    },
    sw_bachat: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    difference: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    },
    hl: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    is_xl: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    }
}, {
    tableName: 'pbk_closing',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = PBKClosing;
