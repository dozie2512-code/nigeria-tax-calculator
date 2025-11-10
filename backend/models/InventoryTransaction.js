module.exports = (sequelize, DataTypes) => {
  const InventoryTransaction = sequelize.define('InventoryTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'inventory_item_id',
      references: {
        model: 'inventory_items',
        key: 'id',
      },
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'transaction_id',
      references: {
        model: 'transactions',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('purchase', 'sale', 'adjustment', 'opening_balance'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
    },
    unitCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'unit_cost',
    },
    totalCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'total_cost',
    },
    reference: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'inventory_transactions',
    indexes: [
      { fields: ['inventory_item_id'] },
      { fields: ['date'] },
    ],
  });

  InventoryTransaction.associate = (models) => {
    InventoryTransaction.belongsTo(models.InventoryItem, {
      foreignKey: 'inventory_item_id',
      as: 'inventoryItem',
    });
    InventoryTransaction.belongsTo(models.Transaction, {
      foreignKey: 'transaction_id',
      as: 'transaction',
    });
  };

  return InventoryTransaction;
};
