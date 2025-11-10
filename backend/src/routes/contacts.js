const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../models');
const { requireRole } = require('../middleware/auth');

// Get all contacts
router.get('/', requireRole(['Admin', 'Manager', 'Accountant', 'Viewer']), async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const contacts = await db.Contact.findAll({
      where: { businessId, isActive: true },
      order: [['name', 'ASC']]
    });
    
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create contact
router.post('/', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { businessId } = req.params;
    const contactData = { ...req.body, businessId };
    
    const contact = await db.Contact.create(contactData);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact
router.put('/:id', requireRole(['Admin', 'Manager', 'Accountant']), async (req, res) => {
  try {
    const { id, businessId } = req.params;
    
    const contact = await db.Contact.findOne({
      where: { id, businessId }
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    await contact.update(req.body);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contact
router.delete('/:id', requireRole(['Admin']), async (req, res) => {
  try {
    const { id, businessId } = req.params;
    
    const contact = await db.Contact.findOne({
      where: { id, businessId }
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    await contact.update({ isActive: false });
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
