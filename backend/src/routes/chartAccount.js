const express = require('express');
const router = express.Router({ mergeParams: true });
const chartAccountController = require('../controllers/chartAccountController');
const { authenticate, checkBusinessAccess, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(checkBusinessAccess);

router.get('/', chartAccountController.getChartAccounts);
router.post('/', requireRole('Admin', 'Manager', 'Accountant'), chartAccountController.createChartAccount);
router.put('/:accountId', requireRole('Admin', 'Manager'), chartAccountController.updateChartAccount);
router.delete('/:accountId', requireRole('Admin'), chartAccountController.deleteChartAccount);

module.exports = router;
