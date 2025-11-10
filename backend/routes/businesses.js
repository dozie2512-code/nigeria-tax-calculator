const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', businessController.getBusinesses);
router.post('/', businessController.createBusiness);
router.get('/:id', businessController.getBusiness);
router.put('/:id', requireRole(['admin']), businessController.updateBusiness);
router.delete('/:id', requireRole(['admin']), businessController.deleteBusiness);
router.post('/:id/users', requireRole(['admin']), businessController.addUser);
router.delete('/:id/users/:userId', requireRole(['admin']), businessController.removeUser);

module.exports = router;
