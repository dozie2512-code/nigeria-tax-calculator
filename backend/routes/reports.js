const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/accounting-profit', reportController.getAccountingProfit);
router.get('/vat', reportController.getVATReport);
router.get('/wht', reportController.getWHTReport);
router.get('/paye', reportController.getPAYEReport);
router.get('/cit', reportController.getCITReport);
router.get('/pit', reportController.getPITReport);

router.get('/accounting-profit/export', reportController.exportAccountingProfit);
router.get('/vat/export', reportController.exportVAT);
router.get('/wht/export', reportController.exportWHT);
router.get('/paye/export', reportController.exportPAYE);
router.get('/cit/export', reportController.exportCIT);
router.get('/pit/export', reportController.exportPIT);

module.exports = router;
