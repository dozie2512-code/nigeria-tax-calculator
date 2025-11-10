const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../models');
const { requireRole } = require('../middleware/auth');
const {
  processInventoryPurchase,
  processInventorySale,
  setInventoryOpeningBalance
} = require('../services/inventory');

// Get all inventory items
router.get('/', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const items = await db.InventoryItem.findAll({
      where: { businessId, isActive: true },
      include: [
        {
          model: db.InventoryTransaction,
          as: 'inventoryTransactions',
          limit: 10,
          order: [['date', 'DESC']]
        }
      ]
    });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create inventory item
router.post('/', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const itemData = { ...req.body, businessId };
    
    const item = await db.InventoryItem.create(itemData);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process inventory purchase
router.post('/:id/purchase', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, unitCost, date, transactionId } = req.body;
    
    const result = await processInventoryPurchase(id, quantity, unitCost, date, transactionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process inventory sale
router.post('/:id/sale', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, date, transactionId } = req.body;
    
    const result = await processInventorySale(id, quantity, date, transactionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set opening balance
router.post('/:id/opening-balance', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, cost, date } = req.body;
    
    const result = await setInventoryOpeningBalance(id, quantity, cost, date);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory transactions
router.get('/:id/transactions', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const transactions = await db.InventoryTransaction.findAll({
      where: { inventoryItemId: id },
      order: [['date', 'DESC']]
    });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
