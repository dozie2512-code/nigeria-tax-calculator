const db = require('../models');

/**
 * Get all contacts for a business
 */
async function getContacts(req, res) {
  try {
    const { type } = req.query;
    const where = {
      businessId: req.params.businessId,
      isActive: true
    };
    
    if (type) {
      where.type = type;
    }
    
    const contacts = await db.Contact.findAll({
      where,
      order: [['name', 'ASC']]
    });
    
    res.json({ contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to get contacts' });
  }
}

/**
 * Create a new contact
 */
async function createContact(req, res) {
  try {
    const {
      name,
      type,
      email,
      phone,
      address,
      taxId,
      isEmployee,
      basicSalary,
      housingAllowance,
      transportAllowance,
      otherAllowances,
      nhfContribution,
      pensionContribution,
      lifeAssurance,
      mortgageInterest,
      rentPaid
    } = req.body;
    
    const contact = await db.Contact.create({
      businessId: req.params.businessId,
      name,
      type,
      email,
      phone,
      address,
      taxId,
      isEmployee: isEmployee || false,
      basicSalary: basicSalary || 0,
      housingAllowance: housingAllowance || 0,
      transportAllowance: transportAllowance || 0,
      otherAllowances: otherAllowances || 0,
      nhfContribution: nhfContribution || 0,
      pensionContribution: pensionContribution || 0,
      lifeAssurance: lifeAssurance || 0,
      mortgageInterest: mortgageInterest || 0,
      rentPaid: rentPaid || 0
    });
    
    res.status(201).json({
      message: 'Contact created successfully',
      contact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
}

/**
 * Update a contact
 */
async function updateContact(req, res) {
  try {
    const contact = await db.Contact.findOne({
      where: {
        id: req.params.contactId,
        businessId: req.params.businessId
      }
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    await contact.update(req.body);
    
    res.json({
      message: 'Contact updated successfully',
      contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
}

/**
 * Get contact by ID
 */
async function getContactById(req, res) {
  try {
    const contact = await db.Contact.findOne({
      where: {
        id: req.params.contactId,
        businessId: req.params.businessId
      }
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ contact });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to get contact' });
  }
}

module.exports = {
  getContacts,
  createContact,
  updateContact,
  getContactById
};
