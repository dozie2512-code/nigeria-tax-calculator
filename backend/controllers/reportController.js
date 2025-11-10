const { Transaction, ChartAccount, FixedAsset, Contact, BusinessSettings, Business } = require('../models');
const { Op } = require('sequelize');

// Helper to calculate PAYE based on bands
const calculatePAYE = (income, deductions) => {
  const taxableIncome = Math.max(0, income - deductions);
  let tax = 0;
  
  // PAYE bands
  if (taxableIncome > 50000000) {
    tax += (taxableIncome - 50000000) * 0.25;
    tax += 25000000 * 0.23;
    tax += 13000000 * 0.21;
    tax += 9000000 * 0.18;
    tax += 2200000 * 0.15;
  } else if (taxableIncome > 25000000) {
    tax += (taxableIncome - 25000000) * 0.23;
    tax += 13000000 * 0.21;
    tax += 9000000 * 0.18;
    tax += 2200000 * 0.15;
  } else if (taxableIncome > 12000000) {
    tax += (taxableIncome - 12000000) * 0.21;
    tax += 9000000 * 0.18;
    tax += 2200000 * 0.15;
  } else if (taxableIncome > 3000000) {
    tax += (taxableIncome - 3000000) * 0.18;
    tax += 2200000 * 0.15;
  } else if (taxableIncome > 800000) {
    tax += (taxableIncome - 800000) * 0.15;
  }
  
  return tax;
};

exports.getAccountingProfit = async (req, res) => {
  try {
    const { businessId, startDate, endDate } = req.query;
    
    const where = { businessId };
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const transactions = await Transaction.findAll({
      where,
      include: [{ model: ChartAccount, as: 'account' }],
    });
    
    let revenue = 0;
    let cogs = 0;
    let expenses = 0;
    let disposalProfitLoss = 0;
    
    for (const txn of transactions) {
      const amount = parseFloat(txn.amount);
      if (txn.account.isRevenue) {
        revenue += amount;
      } else if (txn.account.type === 'expense') {
        expenses += amount;
      }
      if (txn.account.isDisposalProfit) {
        disposalProfitLoss += amount;
      } else if (txn.account.isDisposalLoss) {
        disposalProfitLoss -= amount;
      }
    }
    
    // Get depreciation
    const assets = await FixedAsset.findAll({
      where: { businessId, isChargeable: 'fixed' },
    });
    
    let depreciation = 0;
    for (const asset of assets) {
      depreciation += parseFloat(asset.accumulatedDepreciation || 0);
    }
    
    const accountingProfit = revenue - cogs - depreciation - expenses + disposalProfitLoss;
    
    res.json({
      revenue,
      cogs,
      depreciation,
      expenses,
      disposalProfitLoss,
      accountingProfit,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getVATReport = async (req, res) => {
  try {
    const { businessId, startDate, endDate } = req.query;
    
    const where = { businessId };
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const transactions = await Transaction.findAll({ where });
    
    let vatCollected = 0;
    let vatPaid = 0;
    
    for (const txn of transactions) {
      if (txn.type === 'receipt' || txn.type === 'inventory_sale') {
        vatCollected += parseFloat(txn.vatAmount || 0);
      } else if (txn.type === 'payment' || txn.type === 'inventory_purchase') {
        vatPaid += parseFloat(txn.vatAmount || 0);
      }
    }
    
    res.json({
      vatCollected,
      vatPaid,
      vatNet: vatCollected - vatPaid,
      transactions: transactions.filter(t => t.vatAmount > 0),
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getWHTReport = async (req, res) => {
  try {
    const { businessId, startDate, endDate } = req.query;
    
    const where = { businessId };
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const transactions = await Transaction.findAll({ where });
    
    let whtPayable = 0;
    let whtReceivable = 0;
    
    for (const txn of transactions) {
      if (txn.whtType === 'payable') {
        whtPayable += parseFloat(txn.whtAmount || 0);
      } else if (txn.whtType === 'receivable') {
        whtReceivable += parseFloat(txn.whtAmount || 0);
      }
    }
    
    res.json({
      whtPayable,
      whtReceivable,
      whtNet: whtReceivable - whtPayable,
      transactions: transactions.filter(t => t.whtAmount > 0),
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getPAYEReport = async (req, res) => {
  try {
    const { businessId, startDate, endDate } = req.query;
    
    const where = { businessId, isSalary: true };
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const transactions = await Transaction.findAll({
      where,
      include: [{ model: Contact, as: 'contact' }],
    });
    
    const payeByContact = {};
    
    for (const txn of transactions) {
      if (!txn.contact) continue;
      
      const contactId = txn.contactId;
      if (!payeByContact[contactId]) {
        payeByContact[contactId] = {
          contact: txn.contact,
          grossSalary: 0,
          deductions: 0,
          paye: 0,
        };
      }
      
      const gross = parseFloat(txn.amount);
      const contact = txn.contact;
      
      // Calculate statutory deductions
      const rentRelief = parseFloat(contact.rentPaid || 0) * 0.2;
      const totalDeductions = rentRelief +
        parseFloat(contact.mortgageInterest || 0) +
        parseFloat(contact.lifeAssurance || 0) +
        parseFloat(contact.nhfContribution || 0) +
        parseFloat(contact.pensionContribution || 0);
      
      const paye = calculatePAYE(gross, totalDeductions);
      
      payeByContact[contactId].grossSalary += gross;
      payeByContact[contactId].deductions += totalDeductions;
      payeByContact[contactId].paye += paye;
    }
    
    res.json({
      breakdown: Object.values(payeByContact),
      totalPAYE: Object.values(payeByContact).reduce((sum, c) => sum + c.paye, 0),
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getCITReport = async (req, res) => {
  try {
    const { businessId, startDate, endDate } = req.query;
    
    const business = await Business.findByPk(businessId);
    const settings = await BusinessSettings.findOne({ where: { businessId } });
    
    // Get accounting profit
    const profitData = await exports.getAccountingProfit(req, { json: (data) => data });
    const accountingProfit = profitData.accountingProfit || 0;
    
    // Get transactions for disallowable and non-taxable
    const where = { businessId };
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }
    
    const transactions = await Transaction.findAll({
      where,
      include: [{ model: ChartAccount, as: 'account' }],
    });
    
    let disallowableExpenses = 0;
    let nonTaxableIncome = 0;
    
    for (const txn of transactions) {
      if (txn.account.isDisallowable) {
        disallowableExpenses += parseFloat(txn.amount);
      }
      if (txn.account.isNonTaxable) {
        nonTaxableIncome += parseFloat(txn.amount);
      }
    }
    
    // Get chargeable gains
    const chargeableAssets = await FixedAsset.findAll({
      where: { businessId, isChargeable: 'chargeable', isDisposed: true },
    });
    
    let chargeableGains = 0;
    for (const asset of chargeableAssets) {
      chargeableGains += parseFloat(asset.disposalProfit || 0);
    }
    
    // Capital allowance
    const allAssets = await FixedAsset.findAll({ where: { businessId } });
    let capitalAllowanceForYear = 0;
    for (const asset of allAssets) {
      const rate = parseFloat(asset.capitalAllowanceRate) / 100;
      capitalAllowanceForYear += parseFloat(asset.cost) * rate;
    }
    
    const capitalAllowanceBF = parseFloat(settings?.capitalAllowanceBF || 0);
    const totalCapitalAllowance = capitalAllowanceBF + capitalAllowanceForYear;
    
    // Determine if non-taxable income < 10% of revenue
    const revenue = profitData.revenue || 0;
    const useFullCA = (nonTaxableIncome / revenue) < 0.1;
    const capitalAllowanceDeduction = useFullCA ? totalCapitalAllowance : (totalCapitalAllowance * 2 / 3);
    
    // Calculate taxable profit
    let taxableProfit = accountingProfit;
    taxableProfit += profitData.depreciation; // Add back depreciation
    taxableProfit += disallowableExpenses;
    taxableProfit += chargeableGains;
    taxableProfit -= nonTaxableIncome;
    taxableProfit -= parseFloat(settings?.lossReliefBF || 0);
    taxableProfit -= capitalAllowanceDeduction;
    
    taxableProfit = Math.max(0, taxableProfit);
    
    // CIT calculation
    let cit = 0;
    if (revenue > 50000000) {
      const citRate = parseFloat(settings?.citRate || 25) / 100;
      cit = taxableProfit * citRate;
      
      // Deduct WHT receivable
      const whtData = await exports.getWHTReport(req, { json: (data) => data });
      cit = Math.max(0, cit - (whtData?.whtReceivable || 0));
    }
    
    res.json({
      accountingProfit,
      depreciation: profitData.depreciation,
      disallowableExpenses,
      chargeableGains,
      nonTaxableIncome,
      lossReliefBF: settings?.lossReliefBF || 0,
      capitalAllowanceForYear,
      capitalAllowanceBF,
      totalCapitalAllowance,
      capitalAllowanceDeduction,
      unrelievedCA: useFullCA ? 0 : (capitalAllowanceForYear / 3),
      taxableProfit,
      turnover: revenue,
      cit,
      citRate: settings?.citRate || 25,
    });
  } catch (error) {
    console.error('CIT error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getPITReport = async (req, res) => {
  try {
    const { businessId } = req.query;
    
    const settings = await BusinessSettings.findOne({ where: { businessId } });
    const citData = await exports.getCITReport(req, { json: (data) => data });
    
    // For sole proprietors, PIT uses same bands as PAYE on business taxable profit
    const taxableProfit = citData.taxableProfit || 0;
    
    // Use statutory deductions from business owner (would need to be stored)
    const pit = calculatePAYE(taxableProfit, 0);
    
    res.json({
      taxableProfit,
      pit,
      breakdown: citData,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// Export functions (simplified for MVP)
exports.exportAccountingProfit = async (req, res) => {
  try {
    res.status(501).json({ error: { message: 'Export not implemented yet' } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.exportVAT = async (req, res) => {
  try {
    res.status(501).json({ error: { message: 'Export not implemented yet' } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.exportWHT = async (req, res) => {
  try {
    res.status(501).json({ error: { message: 'Export not implemented yet' } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.exportPAYE = async (req, res) => {
  try {
    res.status(501).json({ error: { message: 'Export not implemented yet' } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.exportCIT = async (req, res) => {
  try {
    res.status(501).json({ error: { message: 'Export not implemented yet' } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.exportPIT = async (req, res) => {
  try {
    res.status(501).json({ error: { message: 'Export not implemented yet' } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
