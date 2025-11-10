const {
  calculateWeightedAverage,
  processInventoryPurchase,
  processInventorySale
} = require('../services/inventory');

describe('Inventory Weighted Average Calculations', () => {
  test('should calculate weighted average correctly', () => {
    const result = calculateWeightedAverage(100, 500, 50, 600);
    
    expect(result.quantity).toBe(150);
    expect(result.totalCost).toBe(80000); // (100 * 500) + (50 * 600)
    expect(result.weightedAvgCost).toBeCloseTo(533.33, 2);
  });

  test('should handle zero current quantity', () => {
    const result = calculateWeightedAverage(0, 0, 100, 500);
    
    expect(result.quantity).toBe(100);
    expect(result.totalCost).toBe(50000);
    expect(result.weightedAvgCost).toBe(500);
  });

  test('should handle multiple purchases', () => {
    let result = calculateWeightedAverage(0, 0, 100, 500);
    expect(result.weightedAvgCost).toBe(500);
    
    result = calculateWeightedAverage(result.quantity, result.weightedAvgCost, 50, 600);
    expect(result.quantity).toBe(150);
    expect(result.weightedAvgCost).toBeCloseTo(533.33, 2);
  });

  test('should handle zero total quantity', () => {
    const result = calculateWeightedAverage(0, 0, 0, 0);
    
    expect(result.quantity).toBe(0);
    expect(result.totalCost).toBe(0);
    expect(result.weightedAvgCost).toBe(0);
  });
});
