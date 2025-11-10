'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BusinessUser extends Model {
    static associate(models) {
      BusinessUser.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      BusinessUser.belongsTo(models.Business, {
        foreignKey: 'businessId',
        as: 'business'
      });
    }
  }

  BusinessUser.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('Admin', 'Manager', 'Accountant', 'Viewer'),
      allowNull: false,
      defaultValue: 'Viewer'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'BusinessUser',
    tableName: 'business_users',
    timestamps: true,
    underscored: true
  });

  return BusinessUser;
};
