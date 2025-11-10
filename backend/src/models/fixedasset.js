'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FixedAsset extends Model {
    static associate(models) {
      FixedAsset.belongsTo(models.Business, {
        foreignKey: 'businessId',
        as: 'business'
      });
      FixedAsset.hasMany(models.Transaction, {
        foreignKey: 'fixedAssetId',
        as: 'transactions'
      });
    }
  }

  FixedAsset.init({
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    depreciationRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    capitalAllowanceRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    isChargeable: {
      type: DataTypes.ENUM('FIXED', 'CHARGEABLE'),
      allowNull: false,
      defaultValue: 'FIXED'
    },
    openingBalance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    accumulatedDepreciation: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    capitalAllowanceBf: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    chargeableLossBf: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    disposalDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    disposalProceeds: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    isDisposed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'FixedAsset',
    tableName: 'fixed_assets',
    timestamps: true,
    underscored: true
  });

  return FixedAsset;
};
