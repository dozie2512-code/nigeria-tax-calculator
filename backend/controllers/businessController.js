const { Business, BusinessUser, User } = require('../models');

exports.getBusinesses = async (req, res) => {
  try {
    const businesses = await BusinessUser.findAll({
      where: { userId: req.userId },
      include: [{ model: Business, as: 'business' }],
    });

    res.json(businesses.map(bu => ({
      ...bu.business.toJSON(),
      role: bu.role,
    })));
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.createBusiness = async (req, res) => {
  try {
    const { name, type, email, phone, address } = req.body;

    const business = await Business.create({
      name,
      type: type || 'company',
      email,
      phone,
      address,
    });

    await BusinessUser.create({
      userId: req.userId,
      businessId: business.id,
      role: 'admin',
    });

    res.status(201).json(business);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.getBusiness = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) {
      return res.status(404).json({ error: { message: 'Business not found' } });
    }
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) {
      return res.status(404).json({ error: { message: 'Business not found' } });
    }
    await business.update(req.body);
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) {
      return res.status(404).json({ error: { message: 'Business not found' } });
    }
    await business.update({ isActive: false });
    res.json({ message: 'Business deactivated' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { userId, role } = req.body;
    await BusinessUser.create({
      userId,
      businessId: req.params.id,
      role: role || 'viewer',
    });
    res.status(201).json({ message: 'User added to business' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.removeUser = async (req, res) => {
  try {
    await BusinessUser.destroy({
      where: {
        userId: req.params.userId,
        businessId: req.params.id,
      },
    });
    res.json({ message: 'User removed from business' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
