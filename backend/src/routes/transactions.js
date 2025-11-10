const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../models');
const { requireRole } = require('../middleware/auth');
const { calculateVAT, calculateWHT } = require('../services/tax');
const { calculateMonthlyPAYE } = require('../services/paye');

// Get all transactions
router.get('/', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate, type } = req.query;
    
    const where = { businessId };
    if (startDate && endDate) {
      where.date = { [db.Sequelize.Op.between]: [startDate, endDate] };
    }
    if (type) {
      where.type = type;
    }
    
    const transactions = await db.Transaction.findAll({
      where,
      include: [
        { model: db.ChartAccount, as: 'account' },
        { model: db.Contact, as: 'contact' },
        { model: db.InventoryItem, as: 'inventoryItem' },
        { model: db.FixedAsset, as: 'fixedAsset' }
      ],
      order: [['date', 'DESC']]
    });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post('/', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await db.Business.findByPk(businessId);
    
    let txnData = { ...req.body, businessId };
    
    // Calculate VAT if applicable
    if (business.vatEnabled && req.body.amount) {
      const vatCalc = calculateVAT(
        req.body.amount,
        req.body.vatRate || business.vatRate,
        req.body.vatInclusive || false
      );
      txnData.vatAmount = vatCalc.vatAmount;
    }
    
    // Calculate WHT if applicable
    if (business.whtEnabled && req.body.whtRate) {
      const whtCalc = calculateWHT(
        req.body.amount,
        req.body.whtRate,
        req.body.whtCalculationMode || 'gross'
      );
      txnData.whtAmount = whtCalc.whtAmount;
    }
    
    // Calculate PAYE for salary transactions
    if (req.body.isSalary && req.body.contactId) {
      const contact = await db.Contact.findByPk(req.body.contactId);
      if (contact) {
        const payeCalc = calculateMonthlyPAYE(req.body.amount, contact);
        txnData.payeAmount = payeCalc.paye;
      }
    }
    
    const transaction = await db.Transaction.create(txnData);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single transaction
router.get('/:id', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { id, businessId } = req.params;
    
    const transaction = await db.Transaction.findOne({
      where: { id, businessId },
      include: [
        { model: db.ChartAccount, as: 'account' },
        { model: db.Contact, as: 'contact' },
        { model: db.InventoryItem, as: 'inventoryItem' },
        { model: db.FixedAsset, as: 'fixedAsset' }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update transaction
router.put('/:id', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { id, businessId } = req.params;
    
    const transaction = await db.Transaction.findOne({
      where: { id, businessId }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await transaction.update(req.body);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete transaction
router.delete('/:id', requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const { id, businessId } = req.params;
    
    const transaction = await db.Transaction.findOne({
      where: { id, businessId }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await transaction.destroy();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
