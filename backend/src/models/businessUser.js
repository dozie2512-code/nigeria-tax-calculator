module.exports = (sequelize, DataTypes) => {
  const BusinessUser = sequelize.define('BusinessUser', {
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
    timestamps: true,
    tableName: 'business_users',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'businessId']
      }
    ]
  });

  BusinessUser.associate = (models) => {
    BusinessUser.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    BusinessUser.belongsTo(models.Business, {
      foreignKey: 'businessId',
      as: 'business'
    });
  };

  return BusinessUser;
};
