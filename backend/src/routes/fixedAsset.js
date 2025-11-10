const express = require('express');
const router = express.Router({ mergeParams: true });
const fixedAssetController = require('../controllers/fixedAssetController');
const { authenticate, checkBusinessAccess, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(checkBusinessAccess);

router.get('/', fixedAssetController.getFixedAssets);
router.post('/', requireRole('Admin', 'Manager', 'Accountant'), fixedAssetController.createFixedAsset);
router.get('/:assetId', fixedAssetController.getFixedAssetById);
router.post('/:assetId/dispose', requireRole('Admin', 'Manager', 'Accountant'), fixedAssetController.disposeFixedAsset);

module.exports = router;
