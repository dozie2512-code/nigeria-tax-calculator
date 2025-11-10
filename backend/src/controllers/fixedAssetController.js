const db = require('../models');
const { calculateChargeableGainLoss } = require('../utils/taxCalculations');

/**
 * Get all fixed assets for a business
 */
async function getFixedAssets(req, res) {
  try {
    const assets = await db.FixedAsset.findAll({
      where: {
        businessId: req.params.businessId,
        isActive: true
      },
      order: [['purchaseDate', 'DESC']]
    });
    
    res.json({ assets });
  } catch (error) {
    console.error('Get fixed assets error:', error);
    res.status(500).json({ error: 'Failed to get fixed assets' });
  }
}

/**
 * Create a new fixed asset (purchase)
 */
async function createFixedAsset(req, res) {
  try {
    const {
      name,
      description,
      assetTag,
      purchaseDate,
      cost,
      depreciationRate,
      capitalAllowanceRate,
      isChargeable,
      openingBalance
    } = req.body;
    
    // Get default rates from settings if not provided
    const settings = await db.BusinessSettings.findOne({
      where: { businessId: req.params.businessId }
    });
    
    const asset = await db.FixedAsset.create({
      businessId: req.params.businessId,
      name,
      description,
      assetTag,
      purchaseDate: purchaseDate || new Date(),
      cost,
      depreciationRate: depreciationRate || settings?.defaultDepreciationRate || 10,
      capitalAllowanceRate: capitalAllowanceRate || settings?.defaultCapitalAllowanceRate || 25,
      isChargeable: isChargeable || 'FIXED',
      openingBalance: openingBalance || false,
      accumulatedDepreciation: 0
    });
    
    res.status(201).json({
      message: 'Fixed asset created successfully',
      asset
    });
  } catch (error) {
    console.error('Create fixed asset error:', error);
    res.status(500).json({ error: 'Failed to create fixed asset' });
  }
}

/**
 * Dispose of a fixed asset
 */
async function disposeFixedAsset(req, res) {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { assetId } = req.params;
    const { disposalDate, disposalAmount } = req.body;
    
    const asset = await db.FixedAsset.findOne({
      where: {
        id: assetId,
        businessId: req.params.businessId,
        isDisposed: false
      },
      transaction
    });
    
    if (!asset) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Asset not found or already disposed' });
    }
    
    // Calculate gain/loss
    const gainLoss = calculateChargeableGainLoss(
      parseFloat(asset.cost),
      parseFloat(asset.accumulatedDepreciation),
      parseFloat(disposalAmount)
    );
    
    // Update asset
    await asset.update({
      disposalDate: disposalDate || new Date(),
      disposalAmount,
      disposalProfit: gainLoss.chargeableGain - gainLoss.chargeableLoss,
      chargeableGain: asset.isChargeable === 'CHARGEABLE' ? gainLoss.chargeableGain : 0,
      chargeableLoss: asset.isChargeable === 'CHARGEABLE' ? gainLoss.chargeableLoss : 0,
      isDisposed: true,
      isActive: false
    }, { transaction });
    
    // If chargeable loss, update business settings
    if (asset.isChargeable === 'CHARGEABLE' && gainLoss.chargeableLoss > 0) {
      const settings = await db.BusinessSettings.findOne({
        where: { businessId: req.params.businessId },
        transaction
      });
      
      if (settings) {
        await settings.update({
          chargeableLossBf: parseFloat(settings.chargeableLossBf) + gainLoss.chargeableLoss
        }, { transaction });
      }
    }
    
    await transaction.commit();
    
    res.json({
      message: 'Fixed asset disposed successfully',
      asset,
      gainLoss
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Dispose fixed asset error:', error);
    res.status(500).json({ error: 'Failed to dispose fixed asset' });
  }
}

/**
 * Get fixed asset by ID
 */
async function getFixedAssetById(req, res) {
  try {
    const asset = await db.FixedAsset.findOne({
      where: {
        id: req.params.assetId,
        businessId: req.params.businessId
      }
    });
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({ asset });
  } catch (error) {
    console.error('Get fixed asset error:', error);
    res.status(500).json({ error: 'Failed to get fixed asset' });
  }
}

module.exports = {
  getFixedAssets,
  createFixedAsset,
  disposeFixedAsset,
  getFixedAssetById
};
