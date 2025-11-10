module.exports = (sequelize, DataTypes) => {
  const Business = sequelize.define('Business', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('company', 'sole_proprietor'),
      allowNull: false,
      defaultValue: 'company',
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'businesses',
  });

  Business.associate = (models) => {
    Business.belongsToMany(models.User, {
      through: models.BusinessUser,
      foreignKey: 'business_id',
      as: 'users',
    });
    Business.hasMany(models.ChartAccount, {
      foreignKey: 'business_id',
      as: 'chartAccounts',
    });
    Business.hasMany(models.Transaction, {
      foreignKey: 'business_id',
      as: 'transactions',
    });
    Business.hasMany(models.InventoryItem, {
      foreignKey: 'business_id',
      as: 'inventoryItems',
    });
    Business.hasMany(models.FixedAsset, {
      foreignKey: 'business_id',
      as: 'fixedAssets',
    });
    Business.hasMany(models.Contact, {
      foreignKey: 'business_id',
      as: 'contacts',
    });
    Business.hasOne(models.BusinessSettings, {
      foreignKey: 'business_id',
      as: 'settings',
    });
  };

  return Business;
};
