// Tax computation utilities

/**
 * Calculate VAT amount based on amount, rate, and whether VAT is inclusive
 */
function calculateVAT(amount, vatRate, vatInclusive = false) {
  const rate = parseFloat(vatRate) / 100;
  
  if (vatInclusive) {
    // Amount includes VAT, extract it
    const vatAmount = (amount * rate) / (1 + rate);
    const netAmount = amount - vatAmount;
    return {
      netAmount: parseFloat(netAmount.toFixed(2)),
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      grossAmount: parseFloat(amount.toFixed(2))
    };
  } else {
    // Amount excludes VAT, add it
    const vatAmount = amount * rate;
    const grossAmount = amount + vatAmount;
    return {
      netAmount: parseFloat(amount.toFixed(2)),
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      grossAmount: parseFloat(grossAmount.toFixed(2))
    };
  }
}

/**
 * Calculate WHT amount based on amount, rate, and mode (gross or net)
 */
function calculateWHT(amount, whtRate, whtMode = 'gross') {
  const rate = parseFloat(whtRate) / 100;
  
  if (whtMode === 'net') {
    // Net mode: WHT = (net_amount / (1 - tax_rate)) * tax_rate
    const whtAmount = (amount / (1 - rate)) * rate;
    return {
      netAmount: parseFloat(amount.toFixed(2)),
      whtAmount: parseFloat(whtAmount.toFixed(2)),
      grossAmount: parseFloat((amount + whtAmount).toFixed(2))
    };
  } else {
    // Gross mode: WHT = gross_amount * tax_rate
    const whtAmount = amount * rate;
    return {
      grossAmount: parseFloat(amount.toFixed(2)),
      whtAmount: parseFloat(whtAmount.toFixed(2)),
      netAmount: parseFloat((amount - whtAmount).toFixed(2))
    };
  }
}

/**
 * Calculate PAYE based on Nigerian tax bands
 */
function calculatePAYE(grossIncome, statutoryDeductions = {}) {
  const {
    nhf = 0,
    pension = 0,
    lifeAssurance = 0,
    mortgageInterest = 0,
    rentPaid = 0
  } = statutoryDeductions;

  // Apply rent relief (20% of rent paid)
  const rentRelief = rentPaid * 0.20;
  
  // Calculate total relief
  const totalRelief = nhf + pension + lifeAssurance + mortgageInterest + rentRelief;
  
  // Taxable income
  const taxableIncome = Math.max(0, grossIncome - totalRelief);
  
  // Nigerian PAYE bands (2024)
  const bands = [
    { min: 0, max: 300000, rate: 7 },
    { min: 300000, max: 600000, rate: 11 },
    { min: 600000, max: 1100000, rate: 15 },
    { min: 1100000, max: 1600000, rate: 19 },
    { min: 1600000, max: 3200000, rate: 21 },
    { min: 3200000, max: Infinity, rate: 24 }
  ];
  
  let tax = 0;
  let remainingIncome = taxableIncome;
  
  for (const band of bands) {
    if (remainingIncome <= 0) break;
    
    const bandWidth = band.max - band.min;
    const taxableInBand = Math.min(remainingIncome, bandWidth);
    tax += (taxableInBand * band.rate) / 100;
    remainingIncome -= taxableInBand;
  }
  
  return {
    grossIncome: parseFloat(grossIncome.toFixed(2)),
    totalRelief: parseFloat(totalRelief.toFixed(2)),
    taxableIncome: parseFloat(taxableIncome.toFixed(2)),
    payeAmount: parseFloat(tax.toFixed(2)),
    breakdown: {
      nhf: parseFloat(nhf.toFixed(2)),
      pension: parseFloat(pension.toFixed(2)),
      lifeAssurance: parseFloat(lifeAssurance.toFixed(2)),
      mortgageInterest: parseFloat(mortgageInterest.toFixed(2)),
      rentRelief: parseFloat(rentRelief.toFixed(2))
    }
  };
}

/**
 * Calculate monthly depreciation for a fixed asset
 */
function calculateMonthlyDepreciation(cost, depreciationRate, accumulatedDepreciation = 0) {
  const annualRate = parseFloat(depreciationRate) / 100;
  const monthlyRate = annualRate / 12;
  const bookValue = cost - accumulatedDepreciation;
  const monthlyDepreciation = bookValue * monthlyRate;
  
  return {
    monthlyDepreciation: parseFloat(monthlyDepreciation.toFixed(2)),
    annualDepreciation: parseFloat((monthlyDepreciation * 12).toFixed(2)),
    bookValue: parseFloat(bookValue.toFixed(2))
  };
}

/**
 * Calculate capital allowance for the year
 */
function calculateCapitalAllowance(cost, capitalAllowanceRate, capitalAllowanceBf = 0) {
  const rate = parseFloat(capitalAllowanceRate) / 100;
  const capitalForYear = cost * rate;
  const totalCapitalAllowance = capitalAllowanceBf + capitalForYear;
  
  return {
    capitalForYear: parseFloat(capitalForYear.toFixed(2)),
    capitalAllowanceBf: parseFloat(capitalAllowanceBf.toFixed(2)),
    totalCapitalAllowance: parseFloat(totalCapitalAllowance.toFixed(2))
  };
}

/**
 * Calculate accounting profit
 */
function calculateAccountingProfit(revenue, cogs, depreciation, expenses, fixedAssetProfitLoss = 0) {
  const profit = revenue - cogs - depreciation - expenses + fixedAssetProfitLoss;
  return parseFloat(profit.toFixed(2));
}

/**
 * Calculate taxable profit with adjustments
 */
function calculateTaxableProfit(
  accountingProfit,
  depreciation,
  disallowableExpenses,
  chargeableGains,
  nonTaxableIncome,
  lossReliefBf,
  capitalAllowance,
  totalRevenue
) {
  // Apply 10% rule for capital allowance
  const nonTaxablePercentage = totalRevenue > 0 ? (nonTaxableIncome / totalRevenue) * 100 : 0;
  const allowedCapitalAllowance = nonTaxablePercentage < 10 ? capitalAllowance : (capitalAllowance * 2) / 3;
  const unrelievedCapitalAllowance = capitalAllowance - allowedCapitalAllowance;
  
  const taxableProfit = accountingProfit 
    + depreciation 
    + disallowableExpenses 
    + chargeableGains 
    - nonTaxableIncome 
    - lossReliefBf 
    - allowedCapitalAllowance;
  
  return {
    taxableProfit: parseFloat(Math.max(0, taxableProfit).toFixed(2)),
    allowedCapitalAllowance: parseFloat(allowedCapitalAllowance.toFixed(2)),
    unrelievedCapitalAllowance: parseFloat(unrelievedCapitalAllowance.toFixed(2)),
    nonTaxablePercentage: parseFloat(nonTaxablePercentage.toFixed(2))
  };
}

/**
 * Calculate CIT (Company Income Tax)
 */
function calculateCIT(turnover, taxableProfit, whtReceivable = 0) {
  let citRate = 0;
  
  if (turnover <= 50000000) {
    citRate = 0; // 0% for turnover <= 50M
  } else {
    citRate = 25; // 25% for turnover > 50M
  }
  
  const cit = (taxableProfit * citRate) / 100;
  
  // WHT receivable deducted only when CIT computed
  const whtDeductible = citRate > 0 ? whtReceivable : 0;
  const whtCarriedForward = whtReceivable - whtDeductible;
  const netCIT = Math.max(0, cit - whtDeductible);
  
  return {
    citRate: parseFloat(citRate.toFixed(2)),
    cit: parseFloat(cit.toFixed(2)),
    whtDeductible: parseFloat(whtDeductible.toFixed(2)),
    whtCarriedForward: parseFloat(whtCarriedForward.toFixed(2)),
    netCIT: parseFloat(netCIT.toFixed(2))
  };
}

/**
 * Calculate PIT (Personal Income Tax) for sole proprietors
 */
function calculatePIT(taxableProfit, statutoryDeductions = {}) {
  // Use PAYE bands for PIT calculation
  const result = calculatePAYE(taxableProfit, statutoryDeductions);
  return {
    taxableProfit: result.taxableIncome,
    pit: result.payeAmount,
    totalRelief: result.totalRelief
  };
}

/**
 * Calculate chargeable gain/loss on disposal of fixed asset
 */
function calculateChargeableGainLoss(cost, accumulatedDepreciation, disposalAmount) {
  const bookValue = cost - accumulatedDepreciation;
  const gainLoss = disposalAmount - bookValue;
  
  return {
    cost: parseFloat(cost.toFixed(2)),
    accumulatedDepreciation: parseFloat(accumulatedDepreciation.toFixed(2)),
    bookValue: parseFloat(bookValue.toFixed(2)),
    disposalAmount: parseFloat(disposalAmount.toFixed(2)),
    chargeableGain: parseFloat(Math.max(0, gainLoss).toFixed(2)),
    chargeableLoss: parseFloat(Math.abs(Math.min(0, gainLoss)).toFixed(2))
  };
}

/**
 * Calculate weighted average inventory cost
 */
function calculateWeightedAverageCost(currentQuantity, currentCost, newQuantity, newCost) {
  const totalQuantity = currentQuantity + newQuantity;
  if (totalQuantity === 0) return 0;
  
  const totalCost = (currentQuantity * currentCost) + (newQuantity * newCost);
  const avgCost = totalCost / totalQuantity;
  
  return parseFloat(avgCost.toFixed(2));
}

module.exports = {
  calculateVAT,
  calculateWHT,
  calculatePAYE,
  calculateMonthlyDepreciation,
  calculateCapitalAllowance,
  calculateAccountingProfit,
  calculateTaxableProfit,
  calculateCIT,
  calculatePIT,
  calculateChargeableGainLoss,
  calculateWeightedAverageCost
};
