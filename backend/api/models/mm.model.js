const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

const Mm = sequelize.define('Mm', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mm_hin: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    mm_eng: {
        type: DataTypes.STRING(100)
    },
    mm_roman: {
        type: DataTypes.STRING(100)
    },
    mm_code: {
        type: DataTypes.STRING(50)
    },
    dept_id: {
        type: DataTypes.INTEGER
    },
    state_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'mm',
    timestamps: false
});

// Associations
const State = require('./state.model');
Mm.belongsTo(State, { foreignKey: 'state_id', as: 'state' });
State.hasMany(Mm, { foreignKey: 'state_id' });

module.exports = Mm;
