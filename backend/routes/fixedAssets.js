const express = require('express');
const router = express.Router();
const fixedAssetController = require('../controllers/fixedAssetController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', fixedAssetController.getAssets);
router.post('/', requireRole(['admin', 'manager', 'accountant']), fixedAssetController.createAsset);
router.get('/:id', fixedAssetController.getAsset);
router.put('/:id', requireRole(['admin', 'manager', 'accountant']), fixedAssetController.updateAsset);
router.delete('/:id', requireRole(['admin', 'manager']), fixedAssetController.deleteAsset);
router.post('/:id/dispose', requireRole(['admin', 'manager', 'accountant']), fixedAssetController.disposeAsset);
router.post('/calculate-depreciation', requireRole(['admin', 'manager', 'accountant']), fixedAssetController.calculateDepreciation);

module.exports = router;
