const bcrypt = require('bcryptjs');
const db = require('../models');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, businessName } = req.body;

    // Check if user exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    // Create default business
    const business = await db.Business.create({
      name: businessName || `${firstName}'s Business`
    });

    // Create business-user relationship with Admin role
    await db.BusinessUser.create({
      userId: user.id,
      businessId: business.id,
      role: 'Admin'
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
      },
      business: {
        id: business.id,
        name: business.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db.User.findOne({
      where: { email },
      include: [
        {
          model: db.BusinessUser,
          as: 'businessUsers',
          include: [
            {
              model: db.Business,
              as: 'business'
            }
          ]
        }
      ]
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
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
        lastName: user.lastName
      },
      businesses: user.businessUsers.map(bu => ({
        id: bu.business.id,
        name: bu.business.name,
        role: bu.role
      }))
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const invite = async (req, res) => {
  try {
    const { email, businessId, role } = req.body;
    const inviterId = req.userId;

    // Check if inviter is admin of the business
    const inviterBU = await db.BusinessUser.findOne({
      where: {
        userId: inviterId,
        businessId,
        role: 'Admin',
        isActive: true
      }
    });

    if (!inviterBU) {
      return res.status(403).json({ error: 'Only admins can invite users' });
    }

    // Check if user exists
    let user = await db.User.findOne({ where: { email } });
    
    if (!user) {
      // Create a new user with temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      user = await db.User.create({
        email,
        password: hashedPassword,
        firstName: email.split('@')[0],
        lastName: 'User'
      });
      
      // TODO: Send email with temporary password
    }

    // Check if user already has access to business
    const existingBU = await db.BusinessUser.findOne({
      where: {
        userId: user.id,
        businessId
      }
    });

    if (existingBU) {
      return res.status(400).json({ error: 'User already has access to this business' });
    }

    // Create business-user relationship
    await db.BusinessUser.create({
      userId: user.id,
      businessId,
      role: role || 'Viewer'
    });

    res.status(201).json({
      message: 'User invited successfully',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Invitation failed' });
  }
};

module.exports = {
  register,
  login,
  invite
};
