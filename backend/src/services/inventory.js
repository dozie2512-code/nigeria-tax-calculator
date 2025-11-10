const db = require('../models');

/**
 * Calculate weighted average cost for inventory
 */
const calculateWeightedAverage = (currentQuantity, currentCost, newQuantity, newCost) => {
  const totalQuantity = parseFloat(currentQuantity) + parseFloat(newQuantity);
  
  if (totalQuantity === 0) {
    return {
      quantity: 0,
      totalCost: 0,
      weightedAvgCost: 0
    };
  }

  const totalCost = (parseFloat(currentQuantity) * parseFloat(currentCost)) + 
                    (parseFloat(newQuantity) * parseFloat(newCost));
  const weightedAvgCost = totalCost / totalQuantity;

  return {
    quantity: totalQuantity,
    totalCost: parseFloat(totalCost.toFixed(2)),
    weightedAvgCost: parseFloat(weightedAvgCost.toFixed(2))
  };
};

/**
 * Process inventory purchase
 */
const processInventoryPurchase = async (inventoryItemId, quantity, unitCost, date, transactionId = null) => {
  const item = await db.InventoryItem.findByPk(inventoryItemId);
  
  if (!item) {
    throw new Error('Inventory item not found');
  }

  const totalCost = parseFloat(quantity) * parseFloat(unitCost);
  const result = calculateWeightedAverage(
    item.currentQuantity,
    item.currentCost,
    quantity,
    unitCost
  );

  // Create inventory transaction record
  const inventoryTransaction = await db.InventoryTransaction.create({
    inventoryItemId,
    transactionId,
    type: 'purchase',
    date,
    quantity: parseFloat(quantity),
    unitCost: parseFloat(unitCost),
    totalCost: parseFloat(totalCost.toFixed(2)),
    runningQuantity: result.quantity,
    runningCost: result.totalCost,
    weightedAvgCost: result.weightedAvgCost
  });

  // Update inventory item
  await item.update({
    currentQuantity: result.quantity,
    currentCost: result.weightedAvgCost
  });

  return {
    item,
    inventoryTransaction,
    weightedAvgCost: result.weightedAvgCost
  };
};

/**
 * Process inventory sale
 */
const processInventorySale = async (inventoryItemId, quantity, date, transactionId = null) => {
  const item = await db.InventoryItem.findByPk(inventoryItemId);
  
  if (!item) {
    throw new Error('Inventory item not found');
  }

  if (parseFloat(item.currentQuantity) < parseFloat(quantity)) {
    throw new Error('Insufficient inventory quantity');
  }

  const unitCost = item.currentCost;
  const totalCost = parseFloat(quantity) * parseFloat(unitCost);
  const newQuantity = parseFloat(item.currentQuantity) - parseFloat(quantity);
  const newTotalCost = newQuantity * parseFloat(unitCost);

  // Create inventory transaction record
  const inventoryTransaction = await db.InventoryTransaction.create({
    inventoryItemId,
    transactionId,
    type: 'sale',
    date,
    quantity: -parseFloat(quantity),
    unitCost: parseFloat(unitCost),
    totalCost: -parseFloat(totalCost.toFixed(2)),
    runningQuantity: newQuantity,
    runningCost: parseFloat(newTotalCost.toFixed(2)),
    weightedAvgCost: parseFloat(unitCost)
  });

  // Update inventory item
  await item.update({
    currentQuantity: newQuantity
  });

  return {
    item,
    inventoryTransaction,
    costOfGoodsSold: parseFloat(totalCost.toFixed(2)),
    weightedAvgCost: parseFloat(unitCost)
  };
};

/**
 * Set opening balance for inventory
 */
const setInventoryOpeningBalance = async (inventoryItemId, quantity, cost, date) => {
  const item = await db.InventoryItem.findByPk(inventoryItemId);
  
  if (!item) {
    throw new Error('Inventory item not found');
  }

  const totalCost = parseFloat(quantity) * parseFloat(cost);

  // Create opening balance transaction
  const inventoryTransaction = await db.InventoryTransaction.create({
    inventoryItemId,
    transactionId: null,
    type: 'opening_balance',
    date,
    quantity: parseFloat(quantity),
    unitCost: parseFloat(cost),
    totalCost: parseFloat(totalCost.toFixed(2)),
    runningQuantity: parseFloat(quantity),
    runningCost: parseFloat(totalCost.toFixed(2)),
    weightedAvgCost: parseFloat(cost)
  });

  // Update inventory item
  await item.update({
    openingQuantity: parseFloat(quantity),
    openingCost: parseFloat(cost),
    currentQuantity: parseFloat(quantity),
    currentCost: parseFloat(cost)
  });

  return {
    item,
    inventoryTransaction
  };
};

module.exports = {
  calculateWeightedAverage,
  processInventoryPurchase,
  processInventorySale,
  setInventoryOpeningBalance
};
