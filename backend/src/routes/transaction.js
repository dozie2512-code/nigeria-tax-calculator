const express = require('express');
const router = express.Router({ mergeParams: true });
const transactionController = require('../controllers/transactionController');
const { authenticate, checkBusinessAccess, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(checkBusinessAccess);

router.get('/', transactionController.getTransactions);
router.post('/', requireRole('Admin', 'Manager', 'Accountant'), transactionController.createTransaction);
router.get('/:transactionId', transactionController.getTransactionById);

module.exports = router;
