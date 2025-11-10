const db = require('../models');
const { calculateVAT, calculateWHT } = require('../utils/taxCalculations');

/**
 * Get all transactions for a business
 */
async function getTransactions(req, res) {
  try {
    const { startDate, endDate, type } = req.query;
    const where = { businessId: req.params.businessId };
    
    if (startDate && endDate) {
      where.date = {
        [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (type) {
      where.type = type;
    }
    
    const transactions = await db.Transaction.findAll({
      where,
      include: [
        {
          model: db.ChartAccount,
          as: 'account',
          attributes: ['code', 'name', 'type']
        },
        {
          model: db.Contact,
          as: 'contact',
          attributes: ['name', 'type']
        }
      ],
      order: [['date', 'DESC']]
    });
    
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
}

/**
 * Create a new transaction
 */
async function createTransaction(req, res) {
  const transaction = await db.sequelize.transaction();
  
  try {
    const {
      accountId,
      contactId,
      type,
      date,
      description,
      amount,
      vatRate,
      vatInclusive,
      whtRate,
      whtMode,
      files,
      referenceNumber,
      notes
    } = req.body;
    
    // Calculate VAT and WHT
    let vatAmount = 0;
    let whtAmount = 0;
    
    if (vatRate > 0) {
      const vatCalc = calculateVAT(amount, vatRate, vatInclusive);
      vatAmount = vatCalc.vatAmount;
    }
    
    if (whtRate > 0) {
      const whtCalc = calculateWHT(amount, whtRate, whtMode);
      whtAmount = whtCalc.whtAmount;
    }
    
    const newTransaction = await db.Transaction.create({
      businessId: req.params.businessId,
      accountId,
      contactId,
      type,
      date: date || new Date(),
      description,
      amount,
      vatRate: vatRate || 0,
      vatInclusive: vatInclusive || false,
      vatAmount,
      whtRate: whtRate || 0,
      whtMode: whtMode || 'gross',
      whtAmount,
      files: files || [],
      referenceNumber,
      notes
    }, { transaction });
    
    // Update account balance
    const account = await db.ChartAccount.findByPk(accountId, { transaction });
    if (account) {
      const balanceChange = ['receipt', 'inventory_sale'].includes(type) ? amount : -amount;
      await account.update({
        balance: parseFloat(account.balance) + balanceChange
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTransaction
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
}

/**
 * Get transaction by ID
 */
async function getTransactionById(req, res) {
  try {
    const transaction = await db.Transaction.findOne({
      where: {
        id: req.params.transactionId,
        businessId: req.params.businessId
      },
      include: [
        {
          model: db.ChartAccount,
          as: 'account'
        },
        {
          model: db.Contact,
          as: 'contact'
        }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  getTransactionById
};
