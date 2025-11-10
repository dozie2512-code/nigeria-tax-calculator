const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/items', inventoryController.getItems);
router.post('/items', requireRole(['admin', 'manager', 'accountant']), inventoryController.createItem);
router.get('/items/:id', inventoryController.getItem);
router.put('/items/:id', requireRole(['admin', 'manager', 'accountant']), inventoryController.updateItem);
router.delete('/items/:id', requireRole(['admin', 'manager']), inventoryController.deleteItem);

router.post('/purchase', requireRole(['admin', 'manager', 'accountant']), inventoryController.purchase);
router.post('/sale', requireRole(['admin', 'manager', 'accountant']), inventoryController.sale);
router.get('/transactions', inventoryController.getTransactions);

module.exports = router;
