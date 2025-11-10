const { ChartAccount } = require('../models');

exports.getChartAccounts = async (req, res) => {
  try {
    const { businessId } = req.query;
    const accounts = await ChartAccount.findAll({
      where: { businessId, isActive: true },
      order: [['code', 'ASC']],
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.createChartAccount = async (req, res) => {
  try {
    const account = await ChartAccount.create({
      ...req.body,
      businessId: req.body.businessId || req.query.businessId,
    });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getChartAccount = async (req, res) => {
  try {
    const account = await ChartAccount.findByPk(req.params.id);
    if (!account) {
      return res.status(404).json({ error: { message: 'Account not found' } });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.updateChartAccount = async (req, res) => {
  try {
    const account = await ChartAccount.findByPk(req.params.id);
    if (!account) {
      return res.status(404).json({ error: { message: 'Account not found' } });
    }
    await account.update(req.body);
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.deleteChartAccount = async (req, res) => {
  try {
    const account = await ChartAccount.findByPk(req.params.id);
    if (!account) {
      return res.status(404).json({ error: { message: 'Account not found' } });
    }
    await account.update({ isActive: false });
    res.json({ message: 'Account deactivated' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
