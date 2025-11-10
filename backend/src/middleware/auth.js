const { verifyToken } = require('../utils/auth');
const db = require('../models');

/**
 * Authentication middleware
 */
async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const user = await db.User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Business access middleware - ensures user has access to the business
 */
async function checkBusinessAccess(req, res, next) {
  try {
    const businessId = req.params.businessId || req.body.businessId;
    
    if (!businessId) {
      return res.status(400).json({ error: 'Business ID required' });
    }
    
    const businessUser = await db.BusinessUser.findOne({
      where: {
        userId: req.user.id,
        businessId: businessId,
        isActive: true
      },
      include: [{
        model: db.Business,
        as: 'business'
      }]
    });
    
    if (!businessUser) {
      return res.status(403).json({ error: 'Access denied to this business' });
    }
    
    req.businessUser = businessUser;
    req.business = businessUser.business;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to check business access' });
  }
}

/**
 * Role-based access control middleware
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.businessUser) {
      return res.status(403).json({ error: 'Business access required' });
    }
    
    if (!roles.includes(req.businessUser.role)) {
      return res.status(403).json({ error: `Role ${req.businessUser.role} does not have permission` });
    }
    
    next();
  };
}

module.exports = {
  authenticate,
  checkBusinessAccess,
  requireRole
};
