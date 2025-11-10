module.exports = (sequelize, DataTypes) => {
  const InventoryItem = sequelize.define('InventoryItem', {
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
    sku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    costingMethod: {
      type: DataTypes.ENUM('weighted-average', 'FIFO', 'LIFO'),
      defaultValue: 'weighted-average'
    },
    currentQuantity: {
      type: DataTypes.DECIMAL(15, 4),
      defaultValue: 0
    },
    currentCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    tableName: 'inventory_items',
    indexes: [
      {
        unique: true,
        fields: ['businessId', 'sku']
      }
    ]
  });

  InventoryItem.associate = (models) => {
    InventoryItem.belongsTo(models.Business, {
      foreignKey: 'businessId',
      as: 'business'
    });
    InventoryItem.hasMany(models.InventoryTransaction, {
      foreignKey: 'inventoryItemId',
      as: 'transactions'
    });
  };

  return InventoryItem;
};
