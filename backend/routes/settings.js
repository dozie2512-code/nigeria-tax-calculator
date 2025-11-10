const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.put('/', requireRole(['admin', 'manager']), settingsController.updateSettings);

module.exports = router;
