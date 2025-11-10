const db = require('../models');
const {
  calculateAccountingProfit,
  calculateTaxableProfit,
  calculateCIT,
  calculatePIT,
  calculatePAYE
} = require('../utils/taxCalculations');

/**
 * Compute tax for a business for a given period
 */
async function computeTax(req, res) {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Get business and settings
    const business = await db.Business.findByPk(businessId);
    const settings = await db.BusinessSettings.findOne({
      where: { businessId }
    });
    
    if (!business || !settings) {
      return res.status(404).json({ error: 'Business or settings not found' });
    }
    
    // Get all transactions for the period
    const transactions = await db.Transaction.findAll({
      where: {
        businessId,
        date: {
          [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [{
        model: db.ChartAccount,
        as: 'account'
      }]
    });
    
    // Calculate totals
    let revenue = 0;
    let cogs = 0;
    let expenses = 0;
    let depreciation = 0;
    let disallowableExpenses = 0;
    let nonTaxableIncome = 0;
    let vatCollected = 0;
    let vatPaid = 0;
    let whtReceivable = 0;
    let whtPayable = 0;
    
    transactions.forEach(txn => {
      const amount = parseFloat(txn.amount);
      const account = txn.account;
      
      if (account.type === 'Revenue') {
        revenue += amount;
        if (account.isNonTaxable) {
          nonTaxableIncome += amount;
        }
        if (txn.vatAmount > 0) {
          vatCollected += parseFloat(txn.vatAmount);
        }
      } else if (account.type === 'COGS') {
        cogs += amount;
      } else if (account.type === 'Expense') {
        expenses += amount;
        if (account.isDisallowable) {
          disallowableExpenses += amount;
        }
        if (txn.type === 'depreciation') {
          depreciation += amount;
        }
        if (txn.vatAmount > 0) {
          vatPaid += parseFloat(txn.vatAmount);
        }
      }
      
      // WHT
      if (txn.whtAmount > 0) {
        if (['receipt', 'inventory_sale'].includes(txn.type)) {
          whtReceivable += parseFloat(txn.whtAmount);
        } else {
          whtPayable += parseFloat(txn.whtAmount);
        }
      }
    });
    
    // Get fixed asset disposal profit/loss
    const disposedAssets = await db.FixedAsset.findAll({
      where: {
        businessId,
        isDisposed: true,
        disposalDate: {
          [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
        }
      }
    });
    
    let fixedAssetProfitLoss = 0;
    let chargeableGains = 0;
    let chargeableLosses = 0;
    
    disposedAssets.forEach(asset => {
      if (asset.isChargeable === 'CHARGEABLE') {
        chargeableGains += parseFloat(asset.chargeableGain) || 0;
        chargeableLosses += parseFloat(asset.chargeableLoss) || 0;
      } else {
        fixedAssetProfitLoss += parseFloat(asset.disposalProfit) || 0;
      }
    });
    
    // Calculate accounting profit
    const accountingProfit = calculateAccountingProfit(
      revenue,
      cogs,
      depreciation,
      expenses,
      fixedAssetProfitLoss
    );
    
    // Calculate total capital allowance
    const activeAssets = await db.FixedAsset.findAll({
      where: {
        businessId,
        isActive: true,
        isDisposed: false
      }
    });
    
    let totalCapitalAllowance = parseFloat(settings.capitalAllowanceBf) || 0;
    activeAssets.forEach(asset => {
      const rate = parseFloat(asset.capitalAllowanceRate) / 100;
      totalCapitalAllowance += parseFloat(asset.cost) * rate;
    });
    
    // Calculate taxable profit
    const taxableResult = calculateTaxableProfit(
      accountingProfit,
      depreciation,
      disallowableExpenses,
      chargeableGains - chargeableLosses,
      nonTaxableIncome,
      parseFloat(settings.lossReliefBf) || 0,
      totalCapitalAllowance,
      revenue
    );
    
    // Calculate CIT or PIT
    let tax = {};
    if (business.businessType === 'Sole Proprietor' && settings.pitEnabled) {
      tax = calculatePIT(taxableResult.taxableProfit, {});
      tax.type = 'PIT';
    } else if (settings.citEnabled) {
      tax = calculateCIT(revenue, taxableResult.taxableProfit, whtReceivable);
      tax.type = 'CIT';
    }
    
    // VAT computation
    const vatNet = vatCollected - vatPaid;
    
    const result = {
      period: { startDate, endDate },
      revenue,
      cogs,
      expenses,
      depreciation,
      accountingProfit,
      adjustments: {
        depreciation,
        disallowableExpenses,
        chargeableGains: chargeableGains - chargeableLosses,
        nonTaxableIncome,
        lossReliefBf: parseFloat(settings.lossReliefBf) || 0,
        capitalAllowance: taxableResult.allowedCapitalAllowance,
        unrelievedCapitalAllowance: taxableResult.unrelievedCapitalAllowance
      },
      taxableProfit: taxableResult.taxableProfit,
      tax,
      vat: {
        collected: vatCollected,
        paid: vatPaid,
        net: vatNet
      },
      wht: {
        receivable: whtReceivable,
        payable: whtPayable,
        net: whtReceivable - whtPayable
      }
    };
    
    res.json(result);
  } catch (error) {
    console.error('Compute tax error:', error);
    res.status(500).json({ error: 'Failed to compute tax' });
  }
}

/**
 * Compute PAYE for a contact/employee
 */
async function computePAYE(req, res) {
  try {
    const { contactId } = req.params;
    const { businessId } = req.params;
    
    const contact = await db.Contact.findOne({
      where: {
        id: contactId,
        businessId,
        isEmployee: true
      }
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Calculate gross income
    const grossIncome = parseFloat(contact.basicSalary) +
                       parseFloat(contact.housingAllowance) +
                       parseFloat(contact.transportAllowance) +
                       parseFloat(contact.otherAllowances);
    
    // Annual gross income
    const annualGrossIncome = grossIncome * 12;
    
    // Calculate PAYE
    const paye = calculatePAYE(annualGrossIncome, {
      nhf: parseFloat(contact.nhfContribution) * 12,
      pension: parseFloat(contact.pensionContribution) * 12,
      lifeAssurance: parseFloat(contact.lifeAssurance) * 12,
      mortgageInterest: parseFloat(contact.mortgageInterest) * 12,
      rentPaid: parseFloat(contact.rentPaid) * 12
    });
    
    const monthlyPAYE = paye.payeAmount / 12;
    
    res.json({
      contact: {
        id: contact.id,
        name: contact.name
      },
      monthly: {
        grossIncome,
        paye: monthlyPAYE
      },
      annual: {
        grossIncome: annualGrossIncome,
        ...paye
      }
    });
  } catch (error) {
    console.error('Compute PAYE error:', error);
    res.status(500).json({ error: 'Failed to compute PAYE' });
  }
}

module.exports = {
  computeTax,
  computePAYE
};
