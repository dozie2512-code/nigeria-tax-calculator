'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChartAccount extends Model {
    static associate(models) {
      ChartAccount.belongsTo(models.Business, {
        foreignKey: 'businessId',
        as: 'business'
      });
      ChartAccount.hasMany(models.Transaction, {
        foreignKey: 'accountId',
        as: 'transactions'
      });
    }
  }

  ChartAccount.init({
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
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense'),
      allowNull: false
    },
    isDisallowable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isNonTaxable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isRevenue: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isRent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    rentFrequency: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ChartAccount',
    tableName: 'chart_accounts',
    timestamps: true,
    underscored: true
  });

  return ChartAccount;
};
