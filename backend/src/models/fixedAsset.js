module.exports = (sequelize, DataTypes) => {
  const FixedAsset = sequelize.define('FixedAsset', {
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
    description: {
      type: DataTypes.TEXT
    },
    assetTag: {
      type: DataTypes.STRING
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    depreciationRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 10
    },
    capitalAllowanceRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 25
    },
    isChargeable: {
      type: DataTypes.ENUM('FIXED', 'CHARGEABLE'),
      allowNull: false,
      defaultValue: 'FIXED'
    },
    openingBalance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    accumulatedDepreciation: {
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
    disposalDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    disposalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    disposalProfit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    chargeableGain: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    chargeableLoss: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    isDisposed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    tableName: 'fixed_assets'
  });

  FixedAsset.associate = (models) => {
    FixedAsset.belongsTo(models.Business, {
      foreignKey: 'businessId',
      as: 'business'
    });
  };

  return FixedAsset;
};
