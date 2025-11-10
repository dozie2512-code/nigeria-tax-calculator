const db = require('../models');
const { Op } = require('sequelize');
const { calculatePAYE, PAYE_BANDS } = require('./paye');

/**
 * Calculate accounting profit
 * Excludes chargeable gains/losses from profit
 */
const calculateAccountingProfit = async (businessId, startDate, endDate) => {
  // Get all transactions in the period
  const transactions = await db.Transaction.findAll({
    where: {
      businessId,
      date: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: db.ChartAccount,
        as: 'account'
      },
      {
        model: db.FixedAsset,
        as: 'fixedAsset'
      }
    ]
  });

  let totalRevenue = 0;
  let totalExpenses = 0;
  let nonTaxableIncome = 0;
  let disallowableExpenses = 0;
  let chargeableGains = 0;
  let chargeableLosses = 0;

  for (const txn of transactions) {
    const amount = parseFloat(txn.amount);
    const account = txn.account;

    // Handle fixed asset disposals separately
    if (txn.type === 'fixed_disposal' && txn.fixedAsset) {
      if (txn.fixedAsset.isChargeable === 'CHARGEABLE') {
        // Chargeable assets: exclude from accounting profit
        const netBookValue = parseFloat(txn.fixedAsset.cost) - parseFloat(txn.fixedAsset.accumulatedDepreciation);
        const gainLoss = amount - netBookValue;
        
        if (gainLoss > 0) {
          chargeableGains += gainLoss;
        } else {
          chargeableLosses += Math.abs(gainLoss);
        }
      } else {
        // Fixed assets: include in accounting profit
        if (account.type === 'Revenue') {
          totalRevenue += amount;
        }
      }
      continue;
    }

    // Regular transactions
    if (account.type === 'Revenue') {
      totalRevenue += amount;
      if (account.isNonTaxable) {
        nonTaxableIncome += amount;
      }
    } else if (account.type === 'Expense') {
      totalExpenses += amount;
      if (account.isDisallowable) {
        disallowableExpenses += amount;
      }
    }
  }

  // Get depreciation for the period
  const fixedAssets = await db.FixedAsset.findAll({
    where: {
      businessId,
      isActive: true
    }
  });

  let totalDepreciation = 0;
  for (const asset of fixedAssets) {
    totalDepreciation += parseFloat(asset.accumulatedDepreciation) || 0;
  }

  const accountingProfit = totalRevenue - totalExpenses;

  return {
    totalRevenue,
    totalExpenses,
    accountingProfit,
    nonTaxableIncome,
    disallowableExpenses,
    totalDepreciation,
    chargeableGains,
    chargeableLosses
  };
};

/**
 * Calculate capital allowance with 2/3 rule
 */
const calculateTotalCapitalAllowance = (capitalForYear, capitalBf, nonTaxableIncome, totalRevenue) => {
  const totalCapitalAllowance = parseFloat(capitalForYear) + parseFloat(capitalBf);
  
  // Check if non-taxable income < 10% of total revenue
  const nonTaxableRatio = totalRevenue > 0 ? (nonTaxableIncome / totalRevenue) : 0;
  
  let allowedCapitalAllowance;
  let unrelievedCapitalAllowance;
  
  if (nonTaxableRatio < 0.10) {
    // Allow 100% of capital allowance
    allowedCapitalAllowance = totalCapitalAllowance;
    unrelievedCapitalAllowance = 0;
  } else {
    // Allow 2/3 of capital allowance
    allowedCapitalAllowance = (totalCapitalAllowance * 2) / 3;
    unrelievedCapitalAllowance = totalCapitalAllowance / 3;
  }

  return {
    totalCapitalAllowance: parseFloat(totalCapitalAllowance.toFixed(2)),
    allowedCapitalAllowance: parseFloat(allowedCapitalAllowance.toFixed(2)),
    unrelievedCapitalAllowance: parseFloat(unrelievedCapitalAllowance.toFixed(2)),
    nonTaxableRatio: parseFloat((nonTaxableRatio * 100).toFixed(2))
  };
};

/**
 * Calculate CIT (Company Income Tax)
 * Rate: 0% if turnover <= 50,000,000, else 25%
 */
const calculateCIT = async (businessId, startDate, endDate) => {
  const business = await db.Business.findByPk(businessId);
  
  if (!business) {
    throw new Error('Business not found');
  }

  if (business.businessType === 'Sole Proprietor') {
    return null; // Sole proprietors use PIT, not CIT
  }

  const accountingData = await calculateAccountingProfit(businessId, startDate, endDate);

  // Calculate capital allowance for the year
  const fixedAssets = await db.FixedAsset.findAll({
    where: {
      businessId,
      isActive: true,
      isChargeable: 'FIXED'
    }
  });

  let capitalForYear = 0;
  for (const asset of fixedAssets) {
    const allowance = (parseFloat(asset.cost) * parseFloat(asset.capitalAllowanceRate)) / 100;
    capitalForYear += allowance;
  }

  const capitalAllowanceData = calculateTotalCapitalAllowance(
    capitalForYear,
    business.capitalAllowanceBf,
    accountingData.nonTaxableIncome,
    accountingData.totalRevenue
  );

  // Taxable profit calculation:
  // = Accounting Profit
  // + Depreciation
  // + Disallowable Expenses
  // + Chargeable Gains
  // - Non-taxable Income
  // - Loss Relief B/F
  // - Allowed Capital Allowance
  const taxableProfit = 
    accountingData.accountingProfit +
    accountingData.totalDepreciation +
    accountingData.disallowableExpenses +
    accountingData.chargeableGains -
    accountingData.nonTaxableIncome -
    parseFloat(business.lossReliefBf) -
    capitalAllowanceData.allowedCapitalAllowance;

  // CIT rate based on turnover
  const citRate = accountingData.totalRevenue <= 50000000 ? 0 : parseFloat(business.citRate);
  const citAmount = Math.max(0, taxableProfit) * (citRate / 100);

  // Get WHT receivable
  const whtReceivable = await getWHTReceivable(businessId, startDate, endDate);

  // Deduct WHT only when CIT is computed (turnover > 50M)
  const citAfterWHT = citRate > 0 ? Math.max(0, citAmount - whtReceivable) : 0;
  const whtCarriedForward = citRate > 0 ? Math.max(0, whtReceivable - citAmount) : whtReceivable;

  return {
    ...accountingData,
    capitalForYear,
    capitalBf: parseFloat(business.capitalAllowanceBf),
    ...capitalAllowanceData,
    lossReliefBf: parseFloat(business.lossReliefBf),
    taxableProfit: parseFloat(taxableProfit.toFixed(2)),
    citRate,
    citAmount: parseFloat(citAmount.toFixed(2)),
    whtReceivable: parseFloat(whtReceivable.toFixed(2)),
    citAfterWHT: parseFloat(citAfterWHT.toFixed(2)),
    whtCarriedForward: parseFloat(whtCarriedForward.toFixed(2))
  };
};

/**
 * Calculate PIT (Personal Income Tax) for sole proprietors
 * Uses PAYE bands
 */
const calculatePIT = async (businessId, startDate, endDate) => {
  const business = await db.Business.findByPk(businessId);
  
  if (!business) {
    throw new Error('Business not found');
  }

  if (business.businessType !== 'Sole Proprietor') {
    return null; // Companies use CIT, not PIT
  }

  const accountingData = await calculateAccountingProfit(businessId, startDate, endDate);

  // Calculate capital allowance
  const fixedAssets = await db.FixedAsset.findAll({
    where: {
      businessId,
      isActive: true,
      isChargeable: 'FIXED'
    }
  });

  let capitalForYear = 0;
  for (const asset of fixedAssets) {
    const allowance = (parseFloat(asset.cost) * parseFloat(asset.capitalAllowanceRate)) / 100;
    capitalForYear += allowance;
  }

  const capitalAllowanceData = calculateTotalCapitalAllowance(
    capitalForYear,
    business.capitalAllowanceBf,
    accountingData.nonTaxableIncome,
    accountingData.totalRevenue
  );

  // Taxable profit (same calculation as CIT)
  const taxableProfit = 
    accountingData.accountingProfit +
    accountingData.totalDepreciation +
    accountingData.disallowableExpenses +
    accountingData.chargeableGains -
    accountingData.nonTaxableIncome -
    parseFloat(business.lossReliefBf) -
    capitalAllowanceData.allowedCapitalAllowance;

  // Apply PAYE bands to taxable profit
  const payeData = calculatePAYE(Math.max(0, taxableProfit), {});

  return {
    ...accountingData,
    capitalForYear,
    capitalBf: parseFloat(business.capitalAllowanceBf),
    ...capitalAllowanceData,
    lossReliefBf: parseFloat(business.lossReliefBf),
    taxableProfit: parseFloat(taxableProfit.toFixed(2)),
    pit: payeData.paye,
    breakdown: payeData.breakdown
  };
};

/**
 * Get total WHT receivable
 */
const getWHTReceivable = async (businessId, startDate, endDate) => {
  const transactions = await db.Transaction.findAll({
    where: {
      businessId,
      date: {
        [Op.between]: [startDate, endDate]
      },
      type: {
        [Op.in]: ['receipt', 'inventory_sale']
      }
    }
  });

  let total = 0;
  for (const txn of transactions) {
    total += parseFloat(txn.whtAmount) || 0;
  }

  return parseFloat(total.toFixed(2));
};

/**
 * Get total WHT payable
 */
const getWHTPayable = async (businessId, startDate, endDate) => {
  const transactions = await db.Transaction.findAll({
    where: {
      businessId,
      date: {
        [Op.between]: [startDate, endDate]
      },
      type: {
        [Op.in]: ['payment', 'inventory_purchase', 'fixed_purchase']
      }
    }
  });

  let total = 0;
  for (const txn of transactions) {
    total += parseFloat(txn.whtAmount) || 0;
  }

  return parseFloat(total.toFixed(2));
};

module.exports = {
  calculateAccountingProfit,
  calculateTotalCapitalAllowance,
  calculateCIT,
  calculatePIT,
  getWHTReceivable,
  getWHTPayable
};
