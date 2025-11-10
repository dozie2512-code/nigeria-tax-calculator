const express = require('express');
const router = express.Router({ mergeParams: true });
const contactController = require('../controllers/contactController');
const { authenticate, checkBusinessAccess, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(checkBusinessAccess);

router.get('/', contactController.getContacts);
router.post('/', requireRole('Admin', 'Manager', 'Accountant'), contactController.createContact);
router.get('/:contactId', contactController.getContactById);
router.put('/:contactId', requireRole('Admin', 'Manager', 'Accountant'), contactController.updateContact);

module.exports = router;
