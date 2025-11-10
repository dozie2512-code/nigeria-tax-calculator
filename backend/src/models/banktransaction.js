'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BankTransaction extends Model {
    static associate(models) {
      BankTransaction.belongsTo(models.Business, {
        foreignKey: 'businessId',
        as: 'business'
      });
      BankTransaction.hasOne(models.ReconciliationEntry, {
        foreignKey: 'bankTransactionId',
        as: 'reconciliation'
      });
    }
  }

  BankTransaction.init({
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('debit', 'credit'),
      allowNull: false
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isMatched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'BankTransaction',
    tableName: 'bank_transactions',
    timestamps: true,
    underscored: true
  });

  return BankTransaction;
};
