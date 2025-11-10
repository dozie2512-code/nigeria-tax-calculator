const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/', contactController.getContacts);
router.post('/', requireRole(['admin', 'manager', 'accountant']), contactController.createContact);
router.get('/:id', contactController.getContact);
router.put('/:id', requireRole(['admin', 'manager', 'accountant']), contactController.updateContact);
router.delete('/:id', requireRole(['admin', 'manager']), contactController.deleteContact);

module.exports = router;
