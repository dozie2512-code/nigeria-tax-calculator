const { InventoryItem, InventoryTransaction, Transaction } = require('../models');

exports.getItems = async (req, res) => {
  try {
    const { businessId } = req.query;
    const items = await InventoryItem.findAll({ where: { businessId } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.createItem = async (req, res) => {
  try {
    const item = await InventoryItem.create({
      ...req.body,
      businessId: req.body.businessId || req.query.businessId,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id, {
      include: [{ model: InventoryTransaction, as: 'transactions' }],
    });
    if (!item) return res.status(404).json({ error: { message: 'Item not found' } });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: { message: 'Item not found' } });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: { message: 'Item not found' } });
    await item.destroy();
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.purchase = async (req, res) => {
  try {
    const { inventoryItemId, quantity, unitCost, date, reference, description } = req.body;
    const item = await InventoryItem.findByPk(inventoryItemId);
    if (!item) return res.status(404).json({ error: { message: 'Item not found' } });
    
    const totalCost = parseFloat(quantity) * parseFloat(unitCost);
    
    // Create inventory transaction
    const invTxn = await InventoryTransaction.create({
      inventoryItemId,
      type: 'purchase',
      date,
      quantity,
      unitCost,
      totalCost,
      reference,
      description,
    });
    
    // Update weighted average cost
    const newQty = parseFloat(item.currentQuantity) + parseFloat(quantity);
    const newValue = parseFloat(item.totalValue) + totalCost;
    const newAvgCost = newQty > 0 ? newValue / newQty : 0;
    
    await item.update({
      currentQuantity: newQty,
      totalValue: newValue,
      averageCost: newAvgCost,
    });
    
    res.status(201).json({ inventoryTransaction: invTxn, item });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.sale = async (req, res) => {
  try {
    const { inventoryItemId, quantity, date, reference, description } = req.body;
    const item = await InventoryItem.findByPk(inventoryItemId);
    if (!item) return res.status(404).json({ error: { message: 'Item not found' } });
    
    if (parseFloat(item.currentQuantity) < parseFloat(quantity)) {
      return res.status(400).json({ error: { message: 'Insufficient inventory' } });
    }
    
    const unitCost = parseFloat(item.averageCost);
    const totalCost = parseFloat(quantity) * unitCost;
    
    const invTxn = await InventoryTransaction.create({
      inventoryItemId,
      type: 'sale',
      date,
      quantity: -parseFloat(quantity),
      unitCost,
      totalCost: -totalCost,
      reference,
      description,
    });
    
    await item.update({
      currentQuantity: parseFloat(item.currentQuantity) - parseFloat(quantity),
      totalValue: parseFloat(item.totalValue) - totalCost,
    });
    
    res.status(201).json({ inventoryTransaction: invTxn, item, cogs: totalCost });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { businessId } = req.query;
    const items = await InventoryItem.findAll({
      where: { businessId },
      attributes: ['id'],
    });
    const itemIds = items.map(i => i.id);
    
    const transactions = await InventoryTransaction.findAll({
      where: { inventoryItemId: itemIds },
      include: [{ model: InventoryItem, as: 'inventoryItem' }],
      order: [['date', 'DESC']],
    });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
