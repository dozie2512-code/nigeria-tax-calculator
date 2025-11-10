const express = require('express');
const router = express.Router();
const bankReconciliationController = require('../controllers/bankReconciliationController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.post('/upload', requireRole(['admin', 'manager', 'accountant']), bankReconciliationController.uploadBankStatement);
router.get('/statements', bankReconciliationController.getStatements);
router.post('/match', requireRole(['admin', 'manager', 'accountant']), bankReconciliationController.matchTransaction);
router.post('/unmatch/:id', requireRole(['admin', 'manager', 'accountant']), bankReconciliationController.unmatchTransaction);
router.get('/report', bankReconciliationController.getReconciliationReport);
router.get('/report/export', bankReconciliationController.exportReconciliationReport);

module.exports = router;
