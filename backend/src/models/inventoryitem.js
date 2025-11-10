'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InventoryItem extends Model {
    static associate(models) {
      InventoryItem.belongsTo(models.Business, {
        foreignKey: 'businessId',
        as: 'business'
      });
      InventoryItem.hasMany(models.InventoryTransaction, {
        foreignKey: 'inventoryItemId',
        as: 'inventoryTransactions'
      });
      InventoryItem.hasMany(models.Transaction, {
        foreignKey: 'inventoryItemId',
        as: 'transactions'
      });
    }
  }

  InventoryItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    currentQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    currentCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    // Opening balance support
    openingQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    openingCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'InventoryItem',
    tableName: 'inventory_items',
    timestamps: true,
    underscored: true
  });

  return InventoryItem;
};
