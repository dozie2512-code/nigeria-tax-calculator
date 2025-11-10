module.exports = (sequelize, DataTypes) => {
  const ChartAccount = sequelize.define('ChartAccount', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('asset', 'liability', 'equity', 'revenue', 'expense'),
      allowNull: false,
    },
    isDisallowable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_disallowable',
    },
    isNonTaxable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_non_taxable',
    },
    isRevenue: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_revenue',
    },
    isRent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_rent',
    },
    rentFrequency: {
      type: DataTypes.ENUM('yearly', 'monthly', null),
      allowNull: true,
      field: 'rent_frequency',
    },
    isDisposalProfit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_disposal_profit',
    },
    isDisposalLoss: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_disposal_loss',
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_id',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'chart_accounts',
    indexes: [
      { fields: ['business_id'] },
      { unique: true, fields: ['business_id', 'code'] },
    ],
  });

  ChartAccount.associate = (models) => {
    ChartAccount.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });
  };

  return ChartAccount;
};
