const { BusinessSettings } = require('../models');

exports.getSettings = async (req, res) => {
  try {
    const { businessId } = req.query;
    let settings = await BusinessSettings.findOne({ where: { businessId } });
    
    if (!settings) {
      settings = await BusinessSettings.create({ businessId });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { businessId } = req.query;
    let settings = await BusinessSettings.findOne({ where: { businessId } });
    
    if (!settings) {
      settings = await BusinessSettings.create({ businessId, ...req.body });
    } else {
      await settings.update(req.body);
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
