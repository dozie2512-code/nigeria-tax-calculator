const db = require('../models');
const { calculateWeightedAverageCost } = require('../utils/taxCalculations');

/**
 * Get all inventory items for a business
 */
async function getInventoryItems(req, res) {
  try {
    const items = await db.InventoryItem.findAll({
      where: {
        businessId: req.params.businessId,
        isActive: true
      },
      order: [['name', 'ASC']]
    });
    
    res.json({ items });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({ error: 'Failed to get inventory items' });
  }
}

/**
 * Create a new inventory item
 */
async function createInventoryItem(req, res) {
  try {
    const { name, sku, description, costingMethod, sellingPrice } = req.body;
    
    const item = await db.InventoryItem.create({
      businessId: req.params.businessId,
      name,
      sku,
      description,
      costingMethod: costingMethod || 'weighted-average',
      sellingPrice: sellingPrice || 0,
      currentQuantity: 0,
      currentCost: 0
    });
    
    res.status(201).json({
      message: 'Inventory item created successfully',
      item
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
}

/**
 * Purchase inventory (increase stock)
 */
async function purchaseInventory(req, res) {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { itemId } = req.params;
    const { quantity, unitCost, transactionId } = req.body;
    
    const item = await db.InventoryItem.findOne({
      where: {
        id: itemId,
        businessId: req.params.businessId
      },
      transaction
    });
    
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    // Calculate weighted average cost
    const newCost = calculateWeightedAverageCost(
      parseFloat(item.currentQuantity),
      parseFloat(item.currentCost),
      parseFloat(quantity),
      parseFloat(unitCost)
    );
    
    const newQuantity = parseFloat(item.currentQuantity) + parseFloat(quantity);
    
    // Update item
    await item.update({
      currentQuantity: newQuantity,
      currentCost: newCost
    }, { transaction });
    
    // Create inventory transaction
    await db.InventoryTransaction.create({
      inventoryItemId: itemId,
      transactionId,
      type: 'purchase',
      date: new Date(),
      quantity,
      unitCost,
      totalCost: quantity * unitCost,
      balanceQuantity: newQuantity,
      balanceCost: newCost
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      message: 'Inventory purchased successfully',
      item
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Purchase inventory error:', error);
    res.status(500).json({ error: 'Failed to purchase inventory' });
  }
}

/**
 * Sell inventory (decrease stock)
 */
async function sellInventory(req, res) {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { itemId } = req.params;
    const { quantity, transactionId } = req.body;
    
    const item = await db.InventoryItem.findOne({
      where: {
        id: itemId,
        businessId: req.params.businessId
      },
      transaction
    });
    
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    if (parseFloat(item.currentQuantity) < parseFloat(quantity)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Insufficient inventory' });
    }
    
    const newQuantity = parseFloat(item.currentQuantity) - parseFloat(quantity);
    
    // Update item
    await item.update({
      currentQuantity: newQuantity
    }, { transaction });
    
    // Create inventory transaction
    await db.InventoryTransaction.create({
      inventoryItemId: itemId,
      transactionId,
      type: 'sale',
      date: new Date(),
      quantity: -quantity,
      unitCost: item.currentCost,
      totalCost: -quantity * item.currentCost,
      balanceQuantity: newQuantity,
      balanceCost: item.currentCost
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      message: 'Inventory sold successfully',
      item,
      cogs: quantity * item.currentCost
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Sell inventory error:', error);
    res.status(500).json({ error: 'Failed to sell inventory' });
  }
}

/**
 * Get inventory transactions for an item
 */
async function getInventoryTransactions(req, res) {
  try {
    const transactions = await db.InventoryTransaction.findAll({
      where: {
        inventoryItemId: req.params.itemId
      },
      order: [['date', 'DESC']]
    });
    
    res.json({ transactions });
  } catch (error) {
    console.error('Get inventory transactions error:', error);
    res.status(500).json({ error: 'Failed to get inventory transactions' });
  }
}

module.exports = {
  getInventoryItems,
  createInventoryItem,
  purchaseInventory,
  sellInventory,
  getInventoryTransactions
};
