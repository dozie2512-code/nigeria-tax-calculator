module.exports = (sequelize, DataTypes) => {
  const InventoryTransaction = sequelize.define('InventoryTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'inventory_items',
        key: 'id'
      }
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'transactions',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('purchase', 'sale', 'adjustment'),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false
    },
    unitCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    totalCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    balanceQuantity: {
      type: DataTypes.DECIMAL(15, 4),
      defaultValue: 0
    },
    balanceCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true,
    tableName: 'inventory_transactions'
  });

  InventoryTransaction.associate = (models) => {
    InventoryTransaction.belongsTo(models.InventoryItem, {
      foreignKey: 'inventoryItemId',
      as: 'inventoryItem'
    });
    InventoryTransaction.belongsTo(models.Transaction, {
      foreignKey: 'transactionId',
      as: 'transaction'
    });
  };

  return InventoryTransaction;
};
