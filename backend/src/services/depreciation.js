const db = require('../models');

/**
 * Calculate depreciation for a single month using straight-line method
 */
const calculateMonthlyDepreciation = (cost, accumulatedDepreciation, depreciationRate) => {
  const annualDepreciation = (parseFloat(cost) * parseFloat(depreciationRate)) / 100;
  const monthlyDepreciation = annualDepreciation / 12;
  const newAccumulated = parseFloat(accumulatedDepreciation) + monthlyDepreciation;
  
  // Cannot depreciate more than the cost
  if (newAccumulated > parseFloat(cost)) {
    const finalDepreciation = parseFloat(cost) - parseFloat(accumulatedDepreciation);
    return {
      monthlyDepreciation: parseFloat(finalDepreciation.toFixed(2)),
      accumulatedDepreciation: parseFloat(cost)
    };
  }

  return {
    monthlyDepreciation: parseFloat(monthlyDepreciation.toFixed(2)),
    accumulatedDepreciation: parseFloat(newAccumulated.toFixed(2))
  };
};

/**
 * Calculate capital allowance for a fixed asset
 */
const calculateCapitalAllowance = (cost, capitalAllowanceRate) => {
  const allowance = (parseFloat(cost) * parseFloat(capitalAllowanceRate)) / 100;
  return parseFloat(allowance.toFixed(2));
};

/**
 * Calculate months elapsed since purchase
 */
const getMonthsElapsed = (purchaseDate, currentDate = new Date()) => {
  const purchase = new Date(purchaseDate);
  const current = new Date(currentDate);
  
  const yearDiff = current.getFullYear() - purchase.getFullYear();
  const monthDiff = current.getMonth() - purchase.getMonth();
  
  return yearDiff * 12 + monthDiff;
};

/**
 * Run depreciation for all active fixed assets
 */
const runMonthlyDepreciation = async (businessId = null) => {
  const whereClause = {
    isActive: true,
    isDisposed: false
  };

  if (businessId) {
    whereClause.businessId = businessId;
  }

  const assets = await db.FixedAsset.findAll({ where: whereClause });
  const results = [];

  for (const asset of assets) {
    try {
      const depreciation = calculateMonthlyDepreciation(
        asset.cost,
        asset.accumulatedDepreciation,
        asset.depreciationRate
      );

      await asset.update({
        accumulatedDepreciation: depreciation.accumulatedDepreciation
      });

      results.push({
        assetId: asset.id,
        assetName: asset.name,
        monthlyDepreciation: depreciation.monthlyDepreciation,
        accumulatedDepreciation: depreciation.accumulatedDepreciation
      });
    } catch (error) {
      console.error(`Error depreciating asset ${asset.id}:`, error);
      results.push({
        assetId: asset.id,
        error: error.message
      });
    }
  }

  return results;
};

/**
 * Calculate chargeable gain/loss on disposal
 */
const calculateChargeableGainLoss = (cost, accumulatedDepreciation, disposalProceeds) => {
  const netBookValue = parseFloat(cost) - parseFloat(accumulatedDepreciation);
  const gainLoss = parseFloat(disposalProceeds) - netBookValue;
  
  return {
    netBookValue: parseFloat(netBookValue.toFixed(2)),
    disposalProceeds: parseFloat(disposalProceeds),
    chargeableGainLoss: parseFloat(gainLoss.toFixed(2)),
    isGain: gainLoss > 0
  };
};

/**
 * Process fixed asset disposal
 */
const processFixedAssetDisposal = async (assetId, disposalDate, disposalProceeds) => {
  const asset = await db.FixedAsset.findByPk(assetId);
  
  if (!asset) {
    throw new Error('Fixed asset not found');
  }

  if (asset.isDisposed) {
    throw new Error('Asset already disposed');
  }

  const result = calculateChargeableGainLoss(
    asset.cost,
    asset.accumulatedDepreciation,
    disposalProceeds
  );

  await asset.update({
    disposalDate,
    disposalProceeds: parseFloat(disposalProceeds),
    isDisposed: true
  });

  return {
    asset,
    ...result
  };
};

module.exports = {
  calculateMonthlyDepreciation,
  calculateCapitalAllowance,
  getMonthsElapsed,
  runMonthlyDepreciation,
  calculateChargeableGainLoss,
  processFixedAssetDisposal
};
