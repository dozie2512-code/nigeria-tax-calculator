module.exports = (sequelize, DataTypes) => {
  const Business = sequelize.define('Business', {
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
      type: DataTypes.ENUM('Company', 'Sole Proprietor'),
      allowNull: false,
      defaultValue: 'Company'
    },
    registrationNumber: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
    phone: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    tableName: 'businesses'
  });

  Business.associate = (models) => {
    Business.belongsToMany(models.User, {
      through: models.BusinessUser,
      foreignKey: 'businessId',
      as: 'users'
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
    Business.hasOne(models.BusinessSettings, {
      foreignKey: 'businessId',
      as: 'settings'
    });
    Business.hasMany(models.Contact, {
      foreignKey: 'businessId',
      as: 'contacts'
    });
  };

  return Business;
};
