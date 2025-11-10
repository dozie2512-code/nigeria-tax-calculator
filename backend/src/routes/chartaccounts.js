const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../models');
const { requireRole } = require('../middleware/auth');

// Get all chart accounts for a business
router.get('/', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const accounts = await db.ChartAccount.findAll({
      where: { businessId, isActive: true },
      order: [['code', 'ASC']]
    });
    
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create chart account
router.post('/', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const accountData = { ...req.body, businessId };
    
    const account = await db.ChartAccount.create(accountData);
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update chart account
router.put('/:id', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { id, businessId } = req.params;
    
    const account = await db.ChartAccount.findOne({
      where: { id, businessId }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    await account.update(req.body);
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete chart account (soft delete)
router.delete('/:id', requireRole(['Admin']), async (req, res) => {
  try {
    const { id, businessId } = req.params;
    
    const account = await db.ChartAccount.findOne({
      where: { id, businessId }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    await account.update({ isActive: false });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
