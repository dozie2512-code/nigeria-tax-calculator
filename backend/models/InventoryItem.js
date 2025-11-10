module.exports = (sequelize, DataTypes) => {
  const InventoryItem = sequelize.define('InventoryItem', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    currentQuantity: {
      type: DataTypes.DECIMAL(15, 4),
      defaultValue: 0,
      field: 'current_quantity',
    },
    averageCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'average_cost',
    },
    totalValue: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'total_value',
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'unit',
    },
  }, {
    tableName: 'inventory_items',
    indexes: [
      { fields: ['business_id'] },
      { unique: true, fields: ['business_id', 'sku'] },
    ],
  });

  InventoryItem.associate = (models) => {
    InventoryItem.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business',
    });
    InventoryItem.hasMany(models.InventoryTransaction, {
      foreignKey: 'inventory_item_id',
      as: 'transactions',
    });
  };

  return InventoryItem;
};
