module.exports = (sequelize, DataTypes) => {
  const ChartAccount = sequelize.define('ChartAccount', {
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
      type: DataTypes.ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'COGS'),
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
      type: DataTypes.ENUM('Monthly', 'Quarterly', 'Annually', null),
      allowNull: true
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    tableName: 'chart_accounts',
    indexes: [
      {
        unique: true,
        fields: ['businessId', 'code']
      }
    ]
  });

  ChartAccount.associate = (models) => {
    ChartAccount.belongsTo(models.Business, {
      foreignKey: 'businessId',
      as: 'business'
    });
    ChartAccount.hasMany(models.Transaction, {
      foreignKey: 'accountId',
      as: 'transactions'
    });
  };

  return ChartAccount;
};
