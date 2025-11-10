module.exports = (sequelize, DataTypes) => {
  const FixedAsset = sequelize.define('FixedAsset', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'purchase_date',
    },
    cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    depreciationRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'depreciation_rate',
    },
    capitalAllowanceRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'capital_allowance_rate',
    },
    isChargeable: {
      type: DataTypes.ENUM('fixed', 'chargeable'),
      defaultValue: 'fixed',
      field: 'is_chargeable',
    },
    isOpeningBalance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_opening_balance',
    },
    accumulatedDepreciation: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'accumulated_depreciation',
    },
    capitalAllowanceBF: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'capital_allowance_bf',
    },
    chargeableLossBF: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'chargeable_loss_bf',
    },
    disposalDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'disposal_date',
    },
    disposalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'disposal_amount',
    },
    disposalProfit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'disposal_profit',
    },
    disposalLoss: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'disposal_loss',
    },
    isDisposed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_disposed',
    },
  }, {
    tableName: 'fixed_assets',
    indexes: [
      { fields: ['business_id'] },
      { fields: ['is_disposed'] },
    ],
  });

  FixedAsset.associate = (models) => {
    FixedAsset.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });
  };

  return FixedAsset;
};
