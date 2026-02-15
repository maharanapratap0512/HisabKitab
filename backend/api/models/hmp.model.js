const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/db.model');

// 1. HmpRecipe
const HmpRecipe = sequelize.define('HmpRecipe', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    recipe_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    recipe_code: {
        type: DataTypes.STRING(50)
    },
    description: {
        type: DataTypes.TEXT
    },
    dept_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'hmp_recipe',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// 2. HmpRecipeInput
const HmpRecipeInput = sequelize.define('HmpRecipeInput', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    recipe_id: {
        type: DataTypes.INTEGER,
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
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'hmp_recipe_input',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// 3. HmpRecipeOutput
const HmpRecipeOutput = sequelize.define('HmpRecipeOutput', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    recipe_id: {
        type: DataTypes.INTEGER,
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
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'hmp_recipe_output',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// 4. HmpBatch
const HmpBatch = sequelize.define('HmpBatch', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    recipe_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    mm_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT
    },
    dept_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'hmp_batch',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// 5. HmpBatchInput
const HmpBatchInput = sequelize.define('HmpBatchInput', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    batch_id: {
        type: DataTypes.INTEGER,
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
    rate: {
        type: DataTypes.DECIMAL(10, 2)
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    lot_no: {
        type: DataTypes.STRING(50)
    },
    jawak_ref_id: {
        type: DataTypes.INTEGER
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'hmp_batch_input',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// 6. HmpBatchOutput
const HmpBatchOutput = sequelize.define('HmpBatchOutput', {
    _id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    batch_id: {
        type: DataTypes.INTEGER,
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
    rate: {
        type: DataTypes.DECIMAL(10, 2)
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    aawak_ref_id: {
        type: DataTypes.INTEGER
    },
    active: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
}, {
    tableName: 'hmp_batch_output',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Associations
HmpRecipe.hasMany(HmpRecipeInput, { foreignKey: 'recipe_id', as: 'inputs' });
HmpRecipeInput.belongsTo(HmpRecipe, { foreignKey: 'recipe_id' });

HmpRecipe.hasMany(HmpRecipeOutput, { foreignKey: 'recipe_id', as: 'outputs' });
HmpRecipeOutput.belongsTo(HmpRecipe, { foreignKey: 'recipe_id' });

HmpRecipe.hasMany(HmpBatch, { foreignKey: 'recipe_id' });
HmpBatch.belongsTo(HmpRecipe, { foreignKey: 'recipe_id' });

HmpBatch.hasMany(HmpBatchInput, { foreignKey: 'batch_id', as: 'inputs' });
HmpBatchInput.belongsTo(HmpBatch, { foreignKey: 'batch_id' });

HmpBatch.hasMany(HmpBatchOutput, { foreignKey: 'batch_id', as: 'outputs' });
HmpBatchOutput.belongsTo(HmpBatch, { foreignKey: 'batch_id' });

// Add Base Models for joins
const Mm = sequelize.define('Mm', {
    _id: { type: DataTypes.INTEGER, primaryKey: true },
    mm_hin: { type: DataTypes.STRING },
    mm_eng: { type: DataTypes.STRING }
}, { tableName: 'mm', timestamps: false });

const Item = sequelize.define('Item', {
    _id: { type: DataTypes.INTEGER, primaryKey: true },
    item_hin: { type: DataTypes.STRING },
    item_eng: { type: DataTypes.STRING }
}, { tableName: 'item', timestamps: false });

HmpBatch.belongsTo(Mm, { foreignKey: 'mm_id', as: 'mm' });
HmpBatchInput.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
HmpBatchOutput.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

module.exports = {
    HmpRecipe,
    HmpRecipeInput,
    HmpRecipeOutput,
    HmpBatch,
    HmpBatchInput,
    HmpBatchOutput,
    Mm,
    Item
};
