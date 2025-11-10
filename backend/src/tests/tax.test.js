const { calculateVAT, calculateWHT } = require('../services/tax');

describe('VAT Calculations', () => {
  test('should calculate VAT exclusive correctly', () => {
    const result = calculateVAT(10000, 7.5, false);
    
    expect(result.baseAmount).toBe(10000);
    expect(result.vatAmount).toBe(750);
    expect(result.totalAmount).toBe(10750);
  });

  test('should calculate VAT inclusive correctly', () => {
    const result = calculateVAT(10750, 7.5, true);
    
    expect(result.baseAmount).toBe(10000);
    expect(result.vatAmount).toBe(750);
    expect(result.totalAmount).toBe(10750);
  });
});

describe('WHT Calculations', () => {
  test('should calculate WHT from gross amount correctly', () => {
    const result = calculateWHT(100000, 5.0, 'gross');
    
    expect(result.grossAmount).toBe(100000);
    expect(result.whtAmount).toBe(5000);
    expect(result.netAmount).toBe(95000);
  });

  test('should calculate WHT from net amount correctly', () => {
    const result = calculateWHT(95000, 5.0, 'net');
    
    expect(result.netAmount).toBe(95000);
    expect(result.whtAmount).toBeCloseTo(5000, 0);
    expect(result.grossAmount).toBeCloseTo(100000, 0);
  });

  test('should handle 10% WHT rate', () => {
    const result = calculateWHT(100000, 10.0, 'gross');
    
    expect(result.whtAmount).toBe(10000);
    expect(result.netAmount).toBe(90000);
  });
});
