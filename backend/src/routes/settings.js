const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../models');
const { requireRole } = require('../middleware/auth');

// Get business settings
router.get('/', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await db.Business.findByPk(businessId);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update business settings
router.put('/', requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await db.Business.findByPk(businessId);
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    await business.update(req.body);
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
