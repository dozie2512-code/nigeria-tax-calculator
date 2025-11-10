const { Transaction, ChartAccount, Contact } = require('../models');

exports.getTransactions = async (req, res) => {
  try {
    const { businessId, type, startDate, endDate, limit = 100, offset = 0 } = req.query;
    const where = { businessId };
    
    if (type) where.type = type;
    if (startDate && endDate) {
      where.date = { [require('sequelize').Op.between]: [startDate, endDate] };
    }
    
    const transactions = await Transaction.findAll({
      where,
      include: [
        { model: ChartAccount, as: 'account' },
        { model: ChartAccount, as: 'contraAccount' },
        { model: Contact, as: 'contact' },
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      businessId: req.body.businessId || req.query.businessId,
    });
    
    const result = await Transaction.findByPk(transaction.id, {
      include: [
        { model: ChartAccount, as: 'account' },
        { model: ChartAccount, as: 'contraAccount' },
        { model: Contact, as: 'contact' },
      ],
    });
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: ChartAccount, as: 'account' },
        { model: ChartAccount, as: 'contraAccount' },
        { model: Contact, as: 'contact' },
      ],
    });
    
    if (!transaction) {
      return res.status(404).json({ error: { message: 'Transaction not found' } });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: { message: 'Transaction not found' } });
    }
    
    await transaction.update(req.body);
    
    const result = await Transaction.findByPk(transaction.id, {
      include: [
        { model: ChartAccount, as: 'account' },
        { model: ChartAccount, as: 'contraAccount' },
        { model: Contact, as: 'contact' },
      ],
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: { message: 'Transaction not found' } });
    }
    
    await transaction.destroy();
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
