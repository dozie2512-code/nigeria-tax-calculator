const express = require('express');
const router = express.Router({ mergeParams: true });
const inventoryController = require('../controllers/inventoryController');
const { authenticate, checkBusinessAccess, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(checkBusinessAccess);

router.get('/', inventoryController.getInventoryItems);
router.post('/', requireRole('Admin', 'Manager', 'Accountant'), inventoryController.createInventoryItem);
router.post('/:itemId/purchase', requireRole('Admin', 'Manager', 'Accountant'), inventoryController.purchaseInventory);
router.post('/:itemId/sell', requireRole('Admin', 'Manager', 'Accountant'), inventoryController.sellInventory);
router.get('/:itemId/transactions', inventoryController.getInventoryTransactions);

module.exports = router;
