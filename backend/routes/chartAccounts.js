const express = require('express');
const router = express.Router();
const chartAccountController = require('../controllers/chartAccountController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', chartAccountController.getChartAccounts);
router.post('/', requireRole(['admin', 'manager', 'accountant']), chartAccountController.createChartAccount);
router.get('/:id', chartAccountController.getChartAccount);
router.put('/:id', requireRole(['admin', 'manager']), chartAccountController.updateChartAccount);
router.delete('/:id', requireRole(['admin']), chartAccountController.deleteChartAccount);

module.exports = router;
