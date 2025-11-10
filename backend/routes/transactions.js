const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', transactionController.getTransactions);
router.post('/', requireRole(['admin', 'manager', 'accountant']), transactionController.createTransaction);
router.get('/:id', transactionController.getTransaction);
router.put('/:id', requireRole(['admin', 'manager', 'accountant']), transactionController.updateTransaction);
router.delete('/:id', requireRole(['admin', 'manager']), transactionController.deleteTransaction);

module.exports = router;
