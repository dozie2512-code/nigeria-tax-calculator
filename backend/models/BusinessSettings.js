module.exports = (sequelize, DataTypes) => {
  const BusinessSettings = sequelize.define('BusinessSettings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'business_id',
      references: {
        model: 'businesses',
        key: 'id',
      },
    },
    // Tax rates
    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 7.5,
      field: 'vat_rate',
    },
    whtRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5,
      field: 'wht_rate',
    },
    citRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 25,
      field: 'cit_rate',
    },
    depreciationRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10,
      field: 'depreciation_rate',
    },
    capitalAllowanceRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 20,
      field: 'capital_allowance_rate',
    },
    // Carry forwards
    chargeableLossBF: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'chargeable_loss_bf',
    },
    capitalAllowanceBF: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'capital_allowance_bf',
    },
    lossReliefBF: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'loss_relief_bf',
    },
    unrelievedCapitalAllowance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'unrelieved_capital_allowance',
    },
    // Tax toggles
    vatEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'vat_enabled',
    },
    whtEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'wht_enabled',
    },
    payeEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'paye_enabled',
    },
    pitEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'pit_enabled',
    },
    citEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'cit_enabled',
    },
  }, {
    tableName: 'business_settings',
    indexes: [
      { unique: true, fields: ['business_id'] },
    ],
  });

  BusinessSettings.associate = (models) => {
    BusinessSettings.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });
  };

  return BusinessSettings;
};
