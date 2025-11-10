module.exports = (sequelize, DataTypes) => {
  const BankStatement = sequelize.define('BankStatement', {
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
    },
    reference: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'bank_statements',
    indexes: [
      { fields: ['business_id'] },
      { fields: ['date'] },
    ],
  });

  BankStatement.associate = (models) => {
    BankStatement.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });
    BankStatement.hasOne(models.BankReconciliation, {
      foreignKey: 'bank_statement_id',
      as: 'reconciliation',
    });
  };

  return BankStatement;
};
