const db = require('../models');

/**
 * Get all chart accounts for a business
 */
async function getChartAccounts(req, res) {
  try {
    const accounts = await db.ChartAccount.findAll({
      where: {
        businessId: req.params.businessId,
        isActive: true
      },
      order: [['code', 'ASC']]
    });
    
    res.json({ accounts });
  } catch (error) {
    console.error('Get chart accounts error:', error);
    res.status(500).json({ error: 'Failed to get chart accounts' });
  }
}

/**
 * Create a new chart account
 */
async function createChartAccount(req, res) {
  try {
    const { code, name, type, isDisallowable, isNonTaxable, isRevenue, isRent, rentFrequency } = req.body;
    
    const account = await db.ChartAccount.create({
      businessId: req.params.businessId,
      code,
      name,
      type,
      isDisallowable: isDisallowable || false,
      isNonTaxable: isNonTaxable || false,
      isRevenue: isRevenue || false,
      isRent: isRent || false,
      rentFrequency: isRent ? rentFrequency : null
    });
    
    res.status(201).json({
      message: 'Chart account created successfully',
      account
    });
  } catch (error) {
    console.error('Create chart account error:', error);
    res.status(500).json({ error: 'Failed to create chart account' });
  }
}

/**
 * Update a chart account
 */
async function updateChartAccount(req, res) {
  try {
    const { name, isDisallowable, isNonTaxable, isRevenue, isRent, rentFrequency, isActive } = req.body;
    
    const account = await db.ChartAccount.findOne({
      where: {
        id: req.params.accountId,
        businessId: req.params.businessId
      }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    await account.update({
      name,
      isDisallowable,
      isNonTaxable,
      isRevenue,
      isRent,
      rentFrequency: isRent ? rentFrequency : null,
      isActive
    });
    
    res.json({
      message: 'Chart account updated successfully',
      account
    });
  } catch (error) {
    console.error('Update chart account error:', error);
    res.status(500).json({ error: 'Failed to update chart account' });
  }
}

/**
 * Delete a chart account (soft delete)
 */
async function deleteChartAccount(req, res) {
  try {
    const account = await db.ChartAccount.findOne({
      where: {
        id: req.params.accountId,
        businessId: req.params.businessId
      }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    await account.update({ isActive: false });
    
    res.json({ message: 'Chart account deleted successfully' });
  } catch (error) {
    console.error('Delete chart account error:', error);
    res.status(500).json({ error: 'Failed to delete chart account' });
  }
}

module.exports = {
  getChartAccounts,
  createChartAccount,
  updateChartAccount,
  deleteChartAccount
};
