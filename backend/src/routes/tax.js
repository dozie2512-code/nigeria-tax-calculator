const express = require('express');
const router = express.Router({ mergeParams: true });
const taxController = require('../controllers/taxController');
const { authenticate, checkBusinessAccess } = require('../middleware/auth');

router.use(authenticate);
router.use(checkBusinessAccess);

router.get('/compute', taxController.computeTax);
router.get('/paye/:contactId', taxController.computePAYE);

module.exports = router;
