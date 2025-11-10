const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Business, BusinessUser, BusinessSettings } = require('../models');

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, businessName, businessType } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: { message: 'User already exists' } });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Create default business
    const business = await Business.create({
      name: businessName || `${firstName}'s Business`,
      type: businessType || 'company',
    });

    // Link user to business as admin
    await BusinessUser.create({
      userId: user.id,
      businessId: business.id,
      role: 'admin',
    });

    // Create default settings
    await BusinessSettings.create({
      businessId: business.id,
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      business: {
        id: business.id,
        name: business.name,
        type: business.type,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: { message: 'Registration failed' } });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    // Get user's businesses
    const businesses = await BusinessUser.findAll({
      where: { userId: user.id },
      include: [{ model: Business, as: 'business' }],
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      businesses: businesses.map(bu => ({
        id: bu.business.id,
        name: bu.business.name,
        type: bu.business.type,
        role: bu.role,
      })),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed' } });
  }
};

exports.invite = async (req, res) => {
  try {
    const { email, businessId, role } = req.body;

    // Check if business exists
    const business = await Business.findByPk(businessId);
    if (!business) {
      return res.status(404).json({ error: { message: 'Business not found' } });
    }

    // Check if inviter is admin
    const inviter = await BusinessUser.findOne({
      where: { userId: req.userId, businessId },
    });

    if (!inviter || inviter.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Only admins can invite users' } });
    }

    // Find or create user
    let user = await User.findOne({ where: { email } });
    let isNewUser = false;

    if (!user) {
      // Create user with temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      user = await User.create({
        email,
        password: hashedPassword,
        firstName: email.split('@')[0],
        lastName: 'User',
      });
      isNewUser = true;
    }

    // Check if user already in business
    const existing = await BusinessUser.findOne({
      where: { userId: user.id, businessId },
    });

    if (existing) {
      return res.status(400).json({ error: { message: 'User already in business' } });
    }

    // Add user to business
    await BusinessUser.create({
      userId: user.id,
      businessId,
      role: role || 'viewer',
    });

    res.status(201).json({
      message: 'User invited successfully',
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: { message: 'Invitation failed' } });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'email', 'firstName', 'lastName'],
    });

    const businesses = await BusinessUser.findAll({
      where: { userId: req.userId },
      include: [{ model: Business, as: 'business' }],
    });

    res.json({
      user,
      businesses: businesses.map(bu => ({
        id: bu.business.id,
        name: bu.business.name,
        type: bu.business.type,
        role: bu.role,
      })),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: { message: 'Failed to get user' } });
  }
};
