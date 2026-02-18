const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');
const State = require('./state.model');
const Mm = require('./mm.model');

const Pbk = sequelize.define('Pbk', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    roll_no: {
        type: DataTypes.DECIMAL,
        unique: true
    },
    pbk_hin: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    pbk_eng: {
        type: DataTypes.STRING(150)
    },
    pbk_roman: {
        type: DataTypes.STRING(150)
    },
    gender: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    relation: {
        type: DataTypes.STRING(50)
    },
    relative_name: {
        type: DataTypes.STRING(150)
    },
    relative_ref: {
        type: DataTypes.JSON
    },
    birth_date: {
        type: DataTypes.DATEONLY
    },
    age: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.STRING(50)
    },
    address: {
        type: DataTypes.TEXT
    },
    townarea: {
        type: DataTypes.STRING(200)
    },
    state_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    city_id: {
        type: DataTypes.INTEGER
    },
    mo_no: {
        type: DataTypes.NUMBER
    },
    alt_mo_no: {
        type: DataTypes.JSON
    },
    class_mm_id: {
        type: DataTypes.INTEGER
    },
    bhatti_date: {
        type: DataTypes.DATEONLY
    },
    document: {
        type: DataTypes.JSON
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    }
}, {
    tableName: 'pbk',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Pbk.belongsTo(State, { foreignKey: 'state_id', as: 'state' });
Pbk.belongsTo(Mm, { foreignKey: 'class_mm_id', as: 'class_mm' });

module.exports = Pbk;
