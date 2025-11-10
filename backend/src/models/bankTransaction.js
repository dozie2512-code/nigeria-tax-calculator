module.exports = (sequelize, DataTypes) => {
  const BankTransaction = sequelize.define('BankTransaction', {
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
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    reference: {
      type: DataTypes.STRING
    },
    isReconciled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'bank_transactions'
  });

  BankTransaction.associate = (models) => {
    BankTransaction.belongsTo(models.Business, {
      foreignKey: 'businessId',
      as: 'business'
    });
    BankTransaction.hasOne(models.Reconciliation, {
      foreignKey: 'bankTransactionId',
      as: 'reconciliation'
    });
  };

  return BankTransaction;
};
