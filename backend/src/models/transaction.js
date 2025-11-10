'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.Business, {
        foreignKey: 'businessId',
        as: 'business'
      });
      Transaction.belongsTo(models.ChartAccount, {
        foreignKey: 'accountId',
        as: 'account'
      });
      Transaction.belongsTo(models.Contact, {
        foreignKey: 'contactId',
        as: 'contact'
      });
      Transaction.belongsTo(models.InventoryItem, {
        foreignKey: 'inventoryItemId',
        as: 'inventoryItem'
      });
      Transaction.belongsTo(models.FixedAsset, {
        foreignKey: 'fixedAssetId',
        as: 'fixedAsset'
      });
    }
  }

  Transaction.init({
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
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chart_accounts',
        key: 'id'
      }
    },
    contactId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'contacts',
        key: 'id'
      }
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'inventory_items',
        key: 'id'
      }
    },
    fixedAssetId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'fixed_assets',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('receipt', 'payment', 'inventory_purchase', 'inventory_sale', 'fixed_purchase', 'fixed_disposal'),
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    // VAT fields
    vatAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    vatInclusive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // WHT fields
    whtAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    whtRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    whtCalculationMode: {
      type: DataTypes.ENUM('gross', 'net'),
      defaultValue: 'gross'
    },
    // PAYE fields (for salary transactions)
    isSalary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    payeAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    // File attachment
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
    underscored: true
  });

  return Transaction;
};
