module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
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
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chart_accounts',
        key: 'id'
      }
    },
    contactId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'contacts',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'receipt',
        'payment',
        'inventory_purchase',
        'inventory_sale',
        'fixed_purchase',
        'fixed_disposal',
        'depreciation',
        'salary'
      ),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    // VAT fields
    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    vatInclusive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    vatAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    // WHT fields
    whtRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    whtMode: {
      type: DataTypes.ENUM('gross', 'net'),
      defaultValue: 'gross'
    },
    whtAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    // File attachments
    files: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    // Reference fields
    referenceNumber: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    },
    isReconciled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'transactions'
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Business, {
      foreignKey: 'businessId',
      as: 'business'
    });
    Transaction.belongsTo(models.ChartAccount, {
      foreignKey: 'accountId',
      as: 'account'
    });
    Transaction.belongsTo(models.Contact, {
      foreignKey: 'contactId',
      as: 'contact'
    });
  };

  return Transaction;
};
