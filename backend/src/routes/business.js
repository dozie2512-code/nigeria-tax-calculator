const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { authenticate, checkBusinessAccess, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Business CRUD
router.post('/', businessController.createBusiness);
router.get('/', businessController.getBusinesses);
router.get('/:businessId', checkBusinessAccess, businessController.getBusinessById);
router.put('/:businessId', checkBusinessAccess, requireRole('Admin', 'Manager'), businessController.updateBusiness);

// Business settings
router.get('/:businessId/settings', checkBusinessAccess, businessController.getSettings);
router.put('/:businessId/settings', checkBusinessAccess, requireRole('Admin'), businessController.updateSettings);

module.exports = router;
