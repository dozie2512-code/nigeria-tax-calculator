'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReconciliationEntry extends Model {
    static associate(models) {
      ReconciliationEntry.belongsTo(models.BankTransaction, {
        foreignKey: 'bankTransactionId',
        as: 'bankTransaction'
      });
      ReconciliationEntry.belongsTo(models.Transaction, {
        foreignKey: 'transactionId',
        as: 'transaction'
      });
    }
  }

  ReconciliationEntry.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bankTransactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bank_transactions',
        key: 'id'
      }
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'transactions',
        key: 'id'
      }
    },
    matchType: {
      type: DataTypes.ENUM('auto', 'manual'),
      defaultValue: 'manual'
    }
  }, {
    sequelize,
    modelName: 'ReconciliationEntry',
    tableName: 'reconciliation_entries',
    timestamps: true,
    underscored: true
  });

  return ReconciliationEntry;
};
