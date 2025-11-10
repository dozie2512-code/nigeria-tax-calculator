module.exports = (sequelize, DataTypes) => {
  const Reconciliation = sequelize.define('Reconciliation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bankTransactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bank_transactions',
        key: 'id'
      }
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'transactions',
        key: 'id'
      }
    },
    matchType: {
      type: DataTypes.ENUM('auto', 'manual'),
      allowNull: false,
      defaultValue: 'manual'
    },
    matchScore: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    reconciledBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reconciledAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    tableName: 'reconciliations'
  });

  Reconciliation.associate = (models) => {
    Reconciliation.belongsTo(models.BankTransaction, {
      foreignKey: 'bankTransactionId',
      as: 'bankTransaction'
    });
    Reconciliation.belongsTo(models.Transaction, {
      foreignKey: 'transactionId',
      as: 'transaction'
    });
    Reconciliation.belongsTo(models.User, {
      foreignKey: 'reconciledBy',
      as: 'reconciler'
    });
  };

  return Reconciliation;
};
