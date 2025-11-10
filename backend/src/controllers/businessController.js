const db = require('../models');

/**
 * Create a new business
 */
async function createBusiness(req, res) {
  try {
    const { name, businessType, registrationNumber, address, phone, email } = req.body;
    
    const business = await db.Business.create({
      name,
      businessType,
      registrationNumber,
      address,
      phone,
      email
    });
    
    // Associate user as Admin
    await db.BusinessUser.create({
      userId: req.user.id,
      businessId: business.id,
      role: 'Admin',
      isActive: true
    });
    
    // Create default business settings
    await db.BusinessSettings.create({
      businessId: business.id
    });
    
    res.status(201).json({
      message: 'Business created successfully',
      business
    });
  } catch (error) {
    console.error('Create business error:', error);
    res.status(500).json({ error: 'Failed to create business' });
  }
}

/**
 * Get all businesses for current user
 */
async function getBusinesses(req, res) {
  try {
    const businessUsers = await db.BusinessUser.findAll({
      where: {
        userId: req.user.id,
        isActive: true
      },
      include: [{
        model: db.Business,
        as: 'business',
        where: { isActive: true }
      }]
    });
    
    const businesses = businessUsers.map(bu => ({
      ...bu.business.toJSON(),
      userRole: bu.role
    }));
    
    res.json({ businesses });
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({ error: 'Failed to get businesses' });
  }
}

/**
 * Get business by ID
 */
async function getBusinessById(req, res) {
  try {
    res.json({ business: req.business });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({ error: 'Failed to get business' });
  }
}

/**
 * Update business
 */
async function updateBusiness(req, res) {
  try {
    const { name, businessType, address, phone, email } = req.body;
    
    await req.business.update({
      name,
      businessType,
      address,
      phone,
      email
    });
    
    res.json({
      message: 'Business updated successfully',
      business: req.business
    });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
}

/**
 * Get business settings
 */
async function getSettings(req, res) {
  try {
    let settings = await db.BusinessSettings.findOne({
      where: { businessId: req.params.businessId }
    });
    
    if (!settings) {
      // Create default settings if not exists
      settings = await db.BusinessSettings.create({
        businessId: req.params.businessId
      });
    }
    
    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
}

/**
 * Update business settings
 */
async function updateSettings(req, res) {
  try {
    const [settings] = await db.BusinessSettings.upsert({
      businessId: req.params.businessId,
      ...req.body
    }, {
      returning: true
    });
    
    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

module.exports = {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  getSettings,
  updateSettings
};
