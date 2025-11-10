'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Business extends Model {
    static associate(models) {
      Business.belongsToMany(models.User, {
        through: models.BusinessUser,
        foreignKey: 'businessId',
        as: 'users'
      });
      Business.hasMany(models.BusinessUser, {
        foreignKey: 'businessId',
        as: 'businessUsers'
      });
      Business.hasMany(models.ChartAccount, {
        foreignKey: 'businessId',
        as: 'chartAccounts'
      });
      Business.hasMany(models.Transaction, {
        foreignKey: 'businessId',
        as: 'transactions'
      });
      Business.hasMany(models.InventoryItem, {
        foreignKey: 'businessId',
        as: 'inventoryItems'
      });
      Business.hasMany(models.FixedAsset, {
        foreignKey: 'businessId',
        as: 'fixedAssets'
      });
      Business.hasMany(models.Contact, {
        foreignKey: 'businessId',
        as: 'contacts'
      });
    }
  }

  Business.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    businessType: {
      type: DataTypes.ENUM('Sole Proprietor', 'Company'),
      allowNull: false,
      defaultValue: 'Company'
    },
    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 7.5
    },
    whtRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5.0
    },
    citRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 25.0
    },
    capitalAllowanceRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 20.0
    },
    depreciationRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10.0
    },
    chargeableLossBf: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    capitalAllowanceBf: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    lossReliefBf: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    vatEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    whtEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    payeEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Business',
    tableName: 'businesses',
    timestamps: true,
    underscored: true
  });

  return Business;
};
