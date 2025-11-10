module.exports = (sequelize, DataTypes) => {
  const BankReconciliation = sequelize.define('BankReconciliation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bankStatementId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'bank_statement_id',
      references: {
        model: 'bank_statements',
        key: 'id',
      },
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'transaction_id',
      references: {
        model: 'transactions',
        key: 'id',
      },
    },
    matchType: {
      type: DataTypes.ENUM('automatic', 'manual'),
      defaultValue: 'automatic',
      field: 'match_type',
    },
  }, {
    tableName: 'bank_reconciliations',
    indexes: [
      { unique: true, fields: ['bank_statement_id'] },
      { fields: ['transaction_id'] },
    ],
  });

  BankReconciliation.associate = (models) => {
    BankReconciliation.belongsTo(models.BankStatement, {
      foreignKey: 'bank_statement_id',
      as: 'bankStatement',
    });
    BankReconciliation.belongsTo(models.Transaction, {
      foreignKey: 'transaction_id',
      as: 'transaction',
    });
  };

  return BankReconciliation;
};
