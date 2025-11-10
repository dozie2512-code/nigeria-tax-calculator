module.exports = (sequelize, DataTypes) => {
  const BusinessSettings = sequelize.define('BusinessSettings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'businesses',
        key: 'id'
      }
    },
    // Tax rates
    defaultVatRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 7.5
    },
    defaultWhtRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5
    },
    citRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 25
    },
    // Asset defaults
    defaultDepreciationRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10
    },
    defaultCapitalAllowanceRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 25
    },
    // Carry forward balances
    lossReliefBf: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    capitalAllowanceBf: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    chargeableLossBf: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    // Tax toggles
    vatEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    whtEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    citEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    pitEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    payeEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Financial year
    financialYearStart: {
      type: DataTypes.DATE
    },
    financialYearEnd: {
      type: DataTypes.DATE
    }
  }, {
    timestamps: true,
    tableName: 'business_settings'
  });

  BusinessSettings.associate = (models) => {
    BusinessSettings.belongsTo(models.Business, {
      foreignKey: 'businessId',
      as: 'business'
    });
  };

  return BusinessSettings;
};
