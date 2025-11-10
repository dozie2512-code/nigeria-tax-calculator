const { calculatePAYE, PAYE_BANDS } = require('../services/paye');

describe('PAYE Calculations', () => {
  test('should calculate PAYE correctly for income within first band', () => {
    const result = calculatePAYE(200000, {});
    
    expect(result.grossIncome).toBe(200000);
    expect(result.taxableIncome).toBe(200000);
    expect(result.paye).toBe(14000); // 200,000 * 0.07
  });

  test('should calculate PAYE correctly for income across multiple bands', () => {
    const result = calculatePAYE(1000000, {});
    
    const expectedPAYE = 
      (300000 * 0.07) +  // First band
      (300000 * 0.11) +  // Second band
      (400000 * 0.15);   // Third band (partial)
    
    expect(result.paye).toBe(expectedPAYE);
  });

  test('should apply statutory deductions correctly', () => {
    const result = calculatePAYE(500000, {
      rentRelief: 50000,
      pension: 25000
    });
    
    expect(result.statutoryDeductions).toBe(75000);
    expect(result.taxableIncome).toBe(425000);
  });

  test('should not allow negative taxable income', () => {
    const result = calculatePAYE(100000, {
      pension: 150000
    });
    
    expect(result.taxableIncome).toBe(0);
    expect(result.paye).toBe(0);
  });
});
