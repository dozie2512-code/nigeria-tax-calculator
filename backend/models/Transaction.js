module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
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
    type: {
      type: DataTypes.ENUM('receipt', 'payment', 'inventory_purchase', 'inventory_sale', 'fixed_purchase', 'fixed_disposal'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'account_id',
      references: {
        model: 'chart_accounts',
        key: 'id',
      },
    },
    contraAccountId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'contra_account_id',
      references: {
        model: 'chart_accounts',
        key: 'id',
      },
    },
    contactId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'contact_id',
      references: {
        model: 'contacts',
        key: 'id',
      },
    },
    reference: {
      type: DataTypes.STRING,
    },
    vatAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'vat_amount',
    },
    vatInclusive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'vat_inclusive',
    },
    whtAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'wht_amount',
    },
    whtType: {
      type: DataTypes.ENUM('payable', 'receivable', null),
      allowNull: true,
      field: 'wht_type',
    },
    whtMode: {
      type: DataTypes.ENUM('gross', 'net', null),
      allowNull: true,
      field: 'wht_mode',
    },
    isSalary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_salary',
    },
    fileUrls: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      field: 'file_urls',
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'inventory_item_id',
    },
    fixedAssetId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'fixed_asset_id',
    },
  }, {
    tableName: 'transactions',
    indexes: [
      { fields: ['business_id'] },
      { fields: ['date'] },
      { fields: ['type'] },
      { fields: ['account_id'] },
      { fields: ['contact_id'] },
    ],
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });
    Transaction.belongsTo(models.ChartAccount, {
      foreignKey: 'account_id',
      as: 'account',
    });
    Transaction.belongsTo(models.ChartAccount, {
      foreignKey: 'contra_account_id',
      as: 'contraAccount',
    });
    Transaction.belongsTo(models.Contact, {
      foreignKey: 'contact_id',
      as: 'contact',
    });
  };

  return Transaction;
};
