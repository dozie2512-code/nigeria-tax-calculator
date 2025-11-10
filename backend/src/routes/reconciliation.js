const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../models');
const { requireRole } = require('../middleware/auth');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

const upload = multer({ storage: multer.memoryStorage() });

// Upload bank statement CSV
router.post('/upload', requireRole(['Admin', 'Manager', 'Accountant']), upload.single('file'), async (req, res) => {
  try {
    const { businessId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const imported = [];
        
        for (const row of results) {
          try {
            // Expected CSV format: date, description, debit, credit, reference
            const amount = parseFloat(row.debit || row.credit || 0);
            const type = row.debit ? 'debit' : 'credit';
            
            const bankTxn = await db.BankTransaction.create({
              businessId,
              date: row.date,
              description: row.description,
              amount,
              type,
              reference: row.reference
            });
            
            imported.push(bankTxn);
          } catch (error) {
            console.error('Error importing row:', error);
          }
        }
        
        res.json({
          message: 'Bank statement imported',
          count: imported.length,
          transactions: imported
        });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bank transactions
router.get('/bank-transactions', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const bankTransactions = await db.BankTransaction.findAll({
      where: { businessId },
      include: [
        {
          model: db.ReconciliationEntry,
          as: 'reconciliation',
          include: [
            {
              model: db.Transaction,
              as: 'transaction'
            }
          ]
        }
      ],
      order: [['date', 'DESC']]
    });
    
    res.json(bankTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-match transactions
router.post('/auto-match', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const bankTransactions = await db.BankTransaction.findAll({
      where: { businessId, isMatched: false }
    });
    
    const transactions = await db.Transaction.findAll({
      where: { businessId }
    });
    
    const matched = [];
    
    for (const bankTxn of bankTransactions) {
      for (const txn of transactions) {
        // Simple matching: same date and amount
        const dateDiff = Math.abs(new Date(bankTxn.date) - new Date(txn.date));
        const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
        const amountMatch = Math.abs(parseFloat(bankTxn.amount) - parseFloat(txn.amount)) < 0.01;
        
        if (daysDiff <= 3 && amountMatch) {
          const reconciliation = await db.ReconciliationEntry.create({
            bankTransactionId: bankTxn.id,
            transactionId: txn.id,
            matchType: 'auto'
          });
          
          await bankTxn.update({ isMatched: true });
          
          matched.push({
            bankTransaction: bankTxn,
            transaction: txn,
            reconciliation
          });
          
          break;
        }
      }
    }
    
    res.json({
      message: 'Auto-matching completed',
      matchedCount: matched.length,
      matches: matched
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual match
router.post('/manual-match', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { bankTransactionId, transactionId } = req.body;
    
    const reconciliation = await db.ReconciliationEntry.create({
      bankTransactionId,
      transactionId,
      matchType: 'manual'
    });
    
    await db.BankTransaction.update(
      { isMatched: true },
      { where: { id: bankTransactionId } }
    );
    
    res.json({
      message: 'Transactions matched',
      reconciliation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unmatch
router.delete('/unmatch/:reconciliationId', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { reconciliationId } = req.params;
    
    const reconciliation = await db.ReconciliationEntry.findByPk(reconciliationId);
    
    if (!reconciliation) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }
    
    await db.BankTransaction.update(
      { isMatched: false },
      { where: { id: reconciliation.bankTransactionId } }
    );
    
    await reconciliation.destroy();
    
    res.json({ message: 'Transactions unmatched' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
