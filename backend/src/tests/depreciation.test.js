const {
  calculateMonthlyDepreciation,
  calculateCapitalAllowance,
  calculateChargeableGainLoss
} = require('../services/depreciation');

describe('Depreciation Calculations', () => {
  test('should calculate monthly depreciation correctly', () => {
    const result = calculateMonthlyDepreciation(1200000, 0, 20);
    
    const expectedAnnual = 1200000 * 0.20;
    const expectedMonthly = expectedAnnual / 12;
    
    expect(result.monthlyDepreciation).toBe(20000);
    expect(result.accumulatedDepreciation).toBe(20000);
  });

  test('should not depreciate beyond asset cost', () => {
    const result = calculateMonthlyDepreciation(1000000, 990000, 20);
    
    expect(result.monthlyDepreciation).toBe(10000);
    expect(result.accumulatedDepreciation).toBe(1000000);
  });

  test('should calculate capital allowance correctly', () => {
    const result = calculateCapitalAllowance(1000000, 20);
    
    expect(result).toBe(200000);
  });
});

describe('Chargeable Gain/Loss Calculations', () => {
  test('should calculate chargeable gain correctly', () => {
    const result = calculateChargeableGainLoss(1000000, 400000, 800000);
    
    expect(result.netBookValue).toBe(600000);
    expect(result.chargeableGainLoss).toBe(200000);
    expect(result.isGain).toBe(true);
  });

  test('should calculate chargeable loss correctly', () => {
    const result = calculateChargeableGainLoss(1000000, 400000, 400000);
    
    expect(result.netBookValue).toBe(600000);
    expect(result.chargeableGainLoss).toBe(-200000);
    expect(result.isGain).toBe(false);
  });
});
