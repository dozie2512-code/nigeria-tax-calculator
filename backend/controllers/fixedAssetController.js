const { FixedAsset, Transaction, ChartAccount } = require('../models');

exports.getAssets = async (req, res) => {
  try {
    const { businessId } = req.query;
    const assets = await FixedAsset.findAll({ where: { businessId } });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const asset = await FixedAsset.create({
      ...req.body,
      businessId: req.body.businessId || req.query.businessId,
    });
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getAsset = async (req, res) => {
  try {
    const asset = await FixedAsset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: { message: 'Asset not found' } });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const asset = await FixedAsset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: { message: 'Asset not found' } });
    await asset.update(req.body);
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await FixedAsset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: { message: 'Asset not found' } });
    await asset.destroy();
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.disposeAsset = async (req, res) => {
  try {
    const { disposalDate, disposalAmount } = req.body;
    const asset = await FixedAsset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: { message: 'Asset not found' } });
    
    const bookValue = parseFloat(asset.cost) - parseFloat(asset.accumulatedDepreciation);
    const profit = parseFloat(disposalAmount) - bookValue;
    
    await asset.update({
      disposalDate,
      disposalAmount,
      disposalProfit: profit > 0 ? profit : 0,
      disposalLoss: profit < 0 ? Math.abs(profit) : 0,
      isDisposed: true,
    });
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.calculateDepreciation = async (req, res) => {
  try {
    const { businessId } = req.body;
    const assets = await FixedAsset.findAll({
      where: { businessId, isDisposed: false },
    });
    
    const results = [];
    for (const asset of assets) {
      const monthlyRate = parseFloat(asset.depreciationRate) / 12 / 100;
      const monthlyDepreciation = parseFloat(asset.cost) * monthlyRate;
      const newAccumulated = parseFloat(asset.accumulatedDepreciation) + monthlyDepreciation;
      
      await asset.update({ accumulatedDepreciation: newAccumulated });
      results.push({ id: asset.id, monthlyDepreciation, accumulatedDepreciation: newAccumulated });
    }
    
    res.json({ message: 'Depreciation calculated', results });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
