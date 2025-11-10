'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      Contact.belongsTo(models.Business, {
        foreignKey: 'businessId',
        as: 'business'
      });
      Contact.hasMany(models.Transaction, {
        foreignKey: 'contactId',
        as: 'transactions'
      });
    }
  }

  Contact.init({
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
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('Customer', 'Supplier', 'Employee', 'Other'),
      defaultValue: 'Other'
    },
    // PAYE statutory deductions toggles
    rentRelief: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    mortgageInterest: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    lifeAssurance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    nhf: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    pension: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Contact',
    tableName: 'contacts',
    timestamps: true,
    underscored: true
  });

  return Contact;
};
