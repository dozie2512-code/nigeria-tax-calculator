'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InventoryTransaction extends Model {
    static associate(models) {
      InventoryTransaction.belongsTo(models.InventoryItem, {
        foreignKey: 'inventoryItemId',
        as: 'inventoryItem'
      });
      InventoryTransaction.belongsTo(models.Transaction, {
        foreignKey: 'transactionId',
        as: 'transaction'
      });
    }
  }

  InventoryTransaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'inventory_items',
        key: 'id'
      }
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'transactions',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('purchase', 'sale', 'adjustment', 'opening_balance'),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unitCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    totalCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    runningQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    runningCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    weightedAvgCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'InventoryTransaction',
    tableName: 'inventory_transactions',
    timestamps: true,
    underscored: true
  });

  return InventoryTransaction;
};
