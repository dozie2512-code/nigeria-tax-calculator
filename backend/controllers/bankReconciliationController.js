const { BankStatement, BankReconciliation, Transaction } = require('../models');
const csv = require('csv-parser');
const { Readable } = require('stream');

exports.uploadBankStatement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file provided' } });
    }
    
    const { businessId } = req.body;
    const results = [];
    
    const stream = Readable.from(req.file.buffer.toString());
    stream
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', async () => {
        for (const row of results) {
          await BankStatement.create({
            businessId,
            date: row.date || row.Date,
            description: row.description || row.Description,
            amount: parseFloat(row.amount || row.Amount),
            balance: row.balance ? parseFloat(row.balance) : null,
            reference: row.reference || row.Reference,
          });
        }
        
        res.json({ message: 'Bank statement uploaded', count: results.length });
      });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getStatements = async (req, res) => {
  try {
    const { businessId } = req.query;
    const statements = await BankStatement.findAll({
      where: { businessId },
      include: [{ model: BankReconciliation, as: 'reconciliation' }],
      order: [['date', 'DESC']],
    });
    res.json(statements);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.matchTransaction = async (req, res) => {
  try {
    const { bankStatementId, transactionId, matchType } = req.body;
    
    const reconciliation = await BankReconciliation.create({
      bankStatementId,
      transactionId,
      matchType: matchType || 'manual',
    });
    
    res.status(201).json(reconciliation);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.unmatchTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    await BankReconciliation.destroy({ where: { id } });
    
    res.json({ message: 'Unmatched successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getReconciliationReport = async (req, res) => {
  try {
    const { businessId } = req.query;
    
    const statements = await BankStatement.findAll({
      where: { businessId },
      include: [{ 
        model: BankReconciliation, 
        as: 'reconciliation',
        include: [{ model: Transaction, as: 'transaction' }],
      }],
    });
    
    const matched = statements.filter(s => s.reconciliation);
    const unmatched = statements.filter(s => !s.reconciliation);
    
    res.json({
      total: statements.length,
      matched: matched.length,
      unmatched: unmatched.length,
      statements,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.exportReconciliationReport = async (req, res) => {
  try {
    res.status(501).json({ error: { message: 'Export not implemented yet' } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
