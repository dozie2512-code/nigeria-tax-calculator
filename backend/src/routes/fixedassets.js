const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../models');
const { requireRole } = require('../middleware/auth');
const {
  runMonthlyDepreciation,
  processFixedAssetDisposal,
  calculateCapitalAllowance
} = require('../services/depreciation');

// Get all fixed assets
router.get('/', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const assets = await db.FixedAsset.findAll({
      where: { businessId, isActive: true },
      order: [['purchaseDate', 'DESC']]
    });
    
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create fixed asset
router.post('/', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await db.Business.findByPk(businessId);
    
    const assetData = {
      ...req.body,
      businessId,
      depreciationRate: req.body.depreciationRate || business.depreciationRate,
      capitalAllowanceRate: req.body.capitalAllowanceRate || business.capitalAllowanceRate
    };
    
    const asset = await db.FixedAsset.create(assetData);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single fixed asset
router.get('/:id', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { id, businessId } = req.params;
    
    const asset = await db.FixedAsset.findOne({
      where: { id, businessId }
    });
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Calculate capital allowance
    const capitalAllowance = calculateCapitalAllowance(
      asset.cost,
      asset.capitalAllowanceRate
    );
    
    res.json({
      ...asset.toJSON(),
      capitalAllowance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update fixed asset
router.put('/:id', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { id, businessId } = req.params;
    
    const asset = await db.FixedAsset.findOne({
      where: { id, businessId }
    });
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    await asset.update(req.body);
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dispose fixed asset
router.post('/:id/dispose', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { id } = req.params;
    const { disposalDate, disposalProceeds } = req.body;
    
    const result = await processFixedAssetDisposal(id, disposalDate, disposalProceeds);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger depreciation for business
router.post('/depreciation/run', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const results = await runMonthlyDepreciation(businessId);
    res.json({
      message: 'Depreciation completed',
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
