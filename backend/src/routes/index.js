const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/auth');
const { authenticate, requireRole } = require('../middleware/auth');

// Auth routes (public)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/invite', authenticate, authController.invite);

// Health check
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Placeholder routes for other endpoints
// These will be implemented in separate route files

// Business routes
router.get('/businesses', authenticate, async (req, res) => {
  try {
    const businesses = await req.user.getBusinesses({
      through: { where: { isActive: true } }
    });
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chart of Accounts routes
const chartAccountRoutes = require('./chartaccounts');
router.use('/businesses/:businessId/chart-accounts', authenticate, chartAccountRoutes);

// Transactions routes
const transactionRoutes = require('./transactions');
router.use('/businesses/:businessId/transactions', authenticate, transactionRoutes);

// Inventory routes
const inventoryRoutes = require('./inventory');
router.use('/businesses/:businessId/inventory', authenticate, inventoryRoutes);

// Fixed Assets routes
const fixedAssetRoutes = require('./fixedassets');
router.use('/businesses/:businessId/fixed-assets', authenticate, fixedAssetRoutes);

// Contacts routes
const contactRoutes = require('./contacts');
router.use('/businesses/:businessId/contacts', authenticate, contactRoutes);

// Reports routes
const reportRoutes = require('./reports');
router.use('/businesses/:businessId/reports', authenticate, reportRoutes);

// Settings routes
const settingsRoutes = require('./settings');
router.use('/businesses/:businessId/settings', authenticate, settingsRoutes);

// File upload routes
const fileRoutes = require('./files');
router.use('/files', authenticate, fileRoutes);

// Bank reconciliation routes
const reconciliationRoutes = require('./reconciliation');
router.use('/businesses/:businessId/reconciliation', authenticate, reconciliationRoutes);

module.exports = router;
