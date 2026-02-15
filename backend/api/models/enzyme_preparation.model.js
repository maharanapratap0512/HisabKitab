const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

const EnzymePreparation = sequelize.define('EnzymePreparation', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY
    },
    mm_id: {
        type: DataTypes.INTEGER
    },
    enz_no: {
        type: DataTypes.STRING(25)
    },
    container_capacity: {
        type: DataTypes.INTEGER
    },
    container_aawak_source: {
        type: DataTypes.INTEGER
    },
    all_materials: {
        type: DataTypes.TEXT
    },
    total_qty: {
        type: DataTypes.DECIMAL(7, 2)
    },
    material_rate: {
        type: DataTypes.DECIMAL(7, 2)
    },
    material_amount: {
        type: DataTypes.DECIMAL(7, 2)
    },
    gud_qty: {
        type: DataTypes.DECIMAL(7, 2)
    },
    gud_rate: {
        type: DataTypes.DECIMAL(7, 2)
    },
    gud_amount: {
        type: DataTypes.DECIMAL(7, 2)
    },
    water_qty: {
        type: DataTypes.DECIMAL(7, 2)
    },
    water_rate: {
        type: DataTypes.DECIMAL(7, 2)
    },
    water_amount: {
        type: DataTypes.DECIMAL(7, 2)
    },
    total_amount: {
        type: DataTypes.DECIMAL(7, 2)
    },
    enz_status: {
        type: DataTypes.INTEGER
    },
    opening_date: {
        type: DataTypes.DATEONLY
    },
    total_produced: {
        type: DataTypes.DECIMAL(7, 2)
    },
    packaging_container_detail: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'enzyme_preparation',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = EnzymePreparation;
