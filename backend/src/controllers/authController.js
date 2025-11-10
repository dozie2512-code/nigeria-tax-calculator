const db = require('../models');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

/**
 * Register a new user
 */
async function register(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await db.User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });
    
    // Generate token
    const token = generateToken({ userId: user.id });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * Login user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await db.User.findOne({ 
      where: { email, isActive: true },
      include: [{
        model: db.Business,
        as: 'businesses',
        through: {
          where: { isActive: true },
          attributes: ['role']
        }
      }]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken({ userId: user.id });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businesses: user.businesses
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * Invite user to a business
 */
async function invite(req, res) {
  try {
    const { email, businessId, role } = req.body;
    
    // Check if requester is Admin
    const requesterAccess = await db.BusinessUser.findOne({
      where: {
        userId: req.user.id,
        businessId,
        role: 'Admin',
        isActive: true
      }
    });
    
    if (!requesterAccess) {
      return res.status(403).json({ error: 'Only admins can invite users' });
    }
    
    // Find or create user
    let user = await db.User.findOne({ where: { email } });
    
    if (!user) {
      // Create invited user with temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await hashPassword(tempPassword);
      
      user = await db.User.create({
        email,
        password: hashedPassword,
        firstName: email.split('@')[0],
        lastName: 'User',
        isActive: true
      });
      
      // In production, send email with temp password
      console.log(`Temporary password for ${email}: ${tempPassword}`);
    }
    
    // Check if already associated
    const existing = await db.BusinessUser.findOne({
      where: { userId: user.id, businessId }
    });
    
    if (existing) {
      // Update role
      await existing.update({ role, isActive: true });
    } else {
      // Create association
      await db.BusinessUser.create({
        userId: user.id,
        businessId,
        role,
        isActive: true
      });
    }
    
    res.json({
      message: 'User invited successfully',
      user: {
        id: user.id,
        email: user.email,
        role
      }
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
}

/**
 * Get current user profile
 */
async function getProfile(req, res) {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'firstName', 'lastName'],
      include: [{
        model: db.Business,
        as: 'businesses',
        through: {
          where: { isActive: true },
          attributes: ['role', 'id']
        }
      }]
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
}

module.exports = {
  register,
  login,
  invite,
  getProfile
};
