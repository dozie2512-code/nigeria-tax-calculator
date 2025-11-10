const {
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
} = require('../utils/taxCalculations');

describe('Tax Calculations', () => {
  describe('calculateVAT', () => {
    test('should calculate VAT exclusive correctly', () => {
      const result = calculateVAT(10000, 7.5, false);
      expect(result.netAmount).toBe(10000);
      expect(result.vatAmount).toBe(750);
      expect(result.grossAmount).toBe(10750);
    });

    test('should calculate VAT inclusive correctly', () => {
      const result = calculateVAT(10750, 7.5, true);
      expect(result.netAmount).toBe(10000);
      expect(result.vatAmount).toBe(750);
      expect(result.grossAmount).toBe(10750);
    });
  });

  describe('calculateWHT', () => {
    test('should calculate WHT in gross mode', () => {
      const result = calculateWHT(10000, 5, 'gross');
      expect(result.grossAmount).toBe(10000);
      expect(result.whtAmount).toBe(500);
      expect(result.netAmount).toBe(9500);
    });

    test('should calculate WHT in net mode', () => {
      const result = calculateWHT(9500, 5, 'net');
      expect(result.netAmount).toBe(9500);
      expect(result.whtAmount).toBe(500);
      expect(result.grossAmount).toBe(10000);
    });
  });

  describe('calculatePAYE', () => {
    test('should calculate PAYE with statutory deductions', () => {
      const result = calculatePAYE(1000000, {
        nhf: 12500,
        pension: 40000,
        lifeAssurance: 10000,
        mortgageInterest: 5000,
        rentPaid: 100000
      });
      
      expect(result.grossIncome).toBe(1000000);
      expect(result.totalRelief).toBe(87500); // 12500 + 40000 + 10000 + 5000 + (100000 * 0.20)
      expect(result.taxableIncome).toBe(912500);
      expect(result.payeAmount).toBeGreaterThan(0);
    });

    test('should apply PAYE bands correctly', () => {
      const result = calculatePAYE(500000, {});
      expect(result.taxableIncome).toBe(500000);
      // First 300,000 at 7% = 21,000
      // Next 200,000 at 11% = 22,000
      // Total = 43,000
      expect(result.payeAmount).toBe(43000);
    });
  });

  describe('calculateMonthlyDepreciation', () => {
    test('should calculate straight-line monthly depreciation', () => {
      const result = calculateMonthlyDepreciation(1200000, 10, 0);
      expect(result.bookValue).toBe(1200000);
      expect(result.monthlyDepreciation).toBe(10000); // (1,200,000 * 10%) / 12
      expect(result.annualDepreciation).toBe(120000);
    });

    test('should account for accumulated depreciation', () => {
      const result = calculateMonthlyDepreciation(1200000, 10, 600000);
      expect(result.bookValue).toBe(600000);
      expect(result.monthlyDepreciation).toBe(5000); // (600,000 * 10%) / 12
    });
  });

  describe('calculateCapitalAllowance', () => {
    test('should calculate capital allowance correctly', () => {
      const result = calculateCapitalAllowance(1000000, 25, 50000);
      expect(result.capitalForYear).toBe(250000); // 1,000,000 * 25%
      expect(result.capitalAllowanceBf).toBe(50000);
      expect(result.totalCapitalAllowance).toBe(300000);
    });
  });

  describe('calculateAccountingProfit', () => {
    test('should calculate accounting profit correctly', () => {
      const profit = calculateAccountingProfit(10000000, 6000000, 500000, 2000000, 100000);
      // Revenue - COGS - Depreciation - Expenses + Fixed Asset Profit/Loss
      // 10,000,000 - 6,000,000 - 500,000 - 2,000,000 + 100,000 = 1,600,000
      expect(profit).toBe(1600000);
    });
  });

  describe('calculateTaxableProfit', () => {
    test('should apply 100% capital allowance when non-taxable < 10%', () => {
      const result = calculateTaxableProfit(
        1000000, // accounting profit
        500000,  // depreciation
        100000,  // disallowable expenses
        0,       // chargeable gains
        50000,   // non-taxable income (5% of 1M revenue)
        0,       // loss relief b/f
        300000,  // capital allowance
        1000000  // total revenue
      );
      
      expect(result.nonTaxablePercentage).toBe(5);
      expect(result.allowedCapitalAllowance).toBe(300000);
      expect(result.unrelievedCapitalAllowance).toBe(0);
      expect(result.taxableProfit).toBe(1250000); // 1M + 500K + 100K - 50K - 300K
    });

    test('should apply 2/3 capital allowance when non-taxable >= 10%', () => {
      const result = calculateTaxableProfit(
        1000000, // accounting profit
        500000,  // depreciation
        100000,  // disallowable expenses
        0,       // chargeable gains
        150000,  // non-taxable income (15% of 1M revenue)
        0,       // loss relief b/f
        300000,  // capital allowance
        1000000  // total revenue
      );
      
      expect(result.nonTaxablePercentage).toBe(15);
      expect(result.allowedCapitalAllowance).toBe(200000); // 2/3 of 300K
      expect(result.unrelievedCapitalAllowance).toBe(100000); // 1/3 of 300K
      expect(result.taxableProfit).toBe(1250000); // 1M + 500K + 100K - 150K - 200K
    });
  });

  describe('calculateCIT', () => {
    test('should apply 0% CIT for turnover <= 50M', () => {
      const result = calculateCIT(30000000, 5000000, 100000);
      expect(result.citRate).toBe(0);
      expect(result.cit).toBe(0);
      expect(result.whtDeductible).toBe(0);
      expect(result.whtCarriedForward).toBe(100000);
      expect(result.netCIT).toBe(0);
    });

    test('should apply 25% CIT for turnover > 50M', () => {
      const result = calculateCIT(60000000, 10000000, 500000);
      expect(result.citRate).toBe(25);
      expect(result.cit).toBe(2500000); // 10M * 25%
      expect(result.whtDeductible).toBe(500000);
      expect(result.whtCarriedForward).toBe(0);
      expect(result.netCIT).toBe(2000000); // 2.5M - 500K
    });
  });

  describe('calculatePIT', () => {
    test('should calculate PIT using PAYE bands', () => {
      const result = calculatePIT(1000000, {
        pension: 50000,
        nhf: 12500
      });
      
      expect(result.totalRelief).toBe(62500);
      expect(result.taxableProfit).toBe(937500);
      expect(result.pit).toBeGreaterThan(0);
    });
  });

  describe('calculateChargeableGainLoss', () => {
    test('should calculate chargeable gain', () => {
      const result = calculateChargeableGainLoss(5000000, 2000000, 4000000);
      expect(result.cost).toBe(5000000);
      expect(result.accumulatedDepreciation).toBe(2000000);
      expect(result.bookValue).toBe(3000000);
      expect(result.disposalAmount).toBe(4000000);
      expect(result.chargeableGain).toBe(1000000);
      expect(result.chargeableLoss).toBe(0);
    });

    test('should calculate chargeable loss', () => {
      const result = calculateChargeableGainLoss(5000000, 2000000, 2500000);
      expect(result.bookValue).toBe(3000000);
      expect(result.disposalAmount).toBe(2500000);
      expect(result.chargeableGain).toBe(0);
      expect(result.chargeableLoss).toBe(500000);
    });
  });

  describe('calculateWeightedAverageCost', () => {
    test('should calculate weighted average cost correctly', () => {
      const avgCost = calculateWeightedAverageCost(100, 1000, 50, 1200);
      // Total cost = (100 * 1000) + (50 * 1200) = 160,000
      // Total quantity = 150
      // Avg cost = 160,000 / 150 = 1066.67
      expect(avgCost).toBe(1066.67);
    });

    test('should return 0 for zero quantity', () => {
      const avgCost = calculateWeightedAverageCost(0, 0, 0, 0);
      expect(avgCost).toBe(0);
    });
  });
});
