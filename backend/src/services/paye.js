/**
 * PAYE Tax Bands for Nigeria (2023)
 * First ₦300,000 - 7%
 * Next ₦300,000 - 11%
 * Next ₦500,000 - 15%
 * Next ₦500,000 - 19%
 * Next ₦1,600,000 - 21%
 * Above ₦3,200,000 - 24%
 */

const PAYE_BANDS = [
  { limit: 300000, rate: 0.07 },
  { limit: 300000, rate: 0.11 },
  { limit: 500000, rate: 0.15 },
  { limit: 500000, rate: 0.19 },
  { limit: 1600000, rate: 0.21 },
  { limit: Infinity, rate: 0.24 }
];

const calculatePAYE = (grossIncome, statutoryDeductions = {}) => {
  const {
    rentRelief = 0,
    mortgageInterest = 0,
    lifeAssurance = 0,
    nhf = 0,
    pension = 0
  } = statutoryDeductions;

  // Calculate total statutory deductions
  const totalDeductions = rentRelief + mortgageInterest + lifeAssurance + nhf + pension;
  
  // Taxable income after deductions
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  
  let paye = 0;
  let remainingIncome = taxableIncome;
  const breakdown = [];

  for (const band of PAYE_BANDS) {
    if (remainingIncome <= 0) break;

    const taxableAmount = Math.min(remainingIncome, band.limit);
    const tax = taxableAmount * band.rate;
    
    paye += tax;
    remainingIncome -= taxableAmount;

    breakdown.push({
      amount: taxableAmount,
      rate: band.rate,
      tax: tax
    });
  }

  return {
    grossIncome,
    statutoryDeductions: totalDeductions,
    taxableIncome,
    paye,
    breakdown
  };
};

const calculateMonthlyPAYE = (monthlyGross, contact) => {
  const statutoryDeductions = {};

  // Calculate rent relief (20% of rent paid)
  if (contact.rentRelief) {
    statutoryDeductions.rentRelief = contact.mortgageInterest * 0.20;
  }

  statutoryDeductions.mortgageInterest = contact.mortgageInterest || 0;
  statutoryDeductions.lifeAssurance = contact.lifeAssurance || 0;
  statutoryDeductions.nhf = contact.nhf || 0;
  statutoryDeductions.pension = contact.pension || 0;

  return calculatePAYE(monthlyGross, statutoryDeductions);
};

const calculateAnnualPAYE = (annualGross, contact) => {
  const annualDeductions = {};

  if (contact.rentRelief) {
    annualDeductions.rentRelief = (contact.mortgageInterest || 0) * 12 * 0.20;
  }

  annualDeductions.mortgageInterest = (contact.mortgageInterest || 0) * 12;
  annualDeductions.lifeAssurance = (contact.lifeAssurance || 0) * 12;
  annualDeductions.nhf = (contact.nhf || 0) * 12;
  annualDeductions.pension = (contact.pension || 0) * 12;

  return calculatePAYE(annualGross, annualDeductions);
};

module.exports = {
  calculatePAYE,
  calculateMonthlyPAYE,
  calculateAnnualPAYE,
  PAYE_BANDS
};
