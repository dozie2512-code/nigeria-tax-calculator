const { Contact } = require('../models');

exports.getContacts = async (req, res) => {
  try {
    const { businessId } = req.query;
    const contacts = await Contact.findAll({ where: { businessId } });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.createContact = async (req, res) => {
  try {
    const contact = await Contact.create({
      ...req.body,
      businessId: req.body.businessId || req.query.businessId,
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: { message: 'Contact not found' } });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: { message: 'Contact not found' } });
    }
    await contact.update(req.body);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: { message: 'Contact not found' } });
    }
    await contact.destroy();
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
