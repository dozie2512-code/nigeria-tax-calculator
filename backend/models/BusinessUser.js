module.exports = (sequelize, DataTypes) => {
  const BusinessUser = sequelize.define('BusinessUser', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'business_id',
      references: {
        model: 'businesses',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'accountant', 'viewer'),
      allowNull: false,
      defaultValue: 'viewer',
    },
  }, {
    tableName: 'business_users',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['business_id'] },
      { unique: true, fields: ['user_id', 'business_id'] },
    ],
  });

  BusinessUser.associate = (models) => {
    BusinessUser.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    BusinessUser.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });
  };

  return BusinessUser;
};
