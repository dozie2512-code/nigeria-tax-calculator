const jwt = require('jsonwebtoken');
const { User, BusinessUser } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: { message: 'Authentication required' } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: { message: 'Invalid token' } });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
};

const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const businessId = req.query.businessId || req.body.businessId || req.params.businessId;
      
      if (!businessId) {
        return res.status(400).json({ error: { message: 'Business ID required' } });
      }

      const businessUser = await BusinessUser.findOne({
        where: {
          userId: req.userId,
          businessId: businessId,
        },
      });

      if (!businessUser) {
        return res.status(403).json({ error: { message: 'Access denied to this business' } });
      }

      if (!allowedRoles.includes(businessUser.role)) {
        return res.status(403).json({ error: { message: 'Insufficient permissions' } });
      }

      req.businessId = businessId;
      req.userRole = businessUser.role;
      next();
    } catch (error) {
      res.status(500).json({ error: { message: 'Authorization error' } });
    }
  };
};

module.exports = {
  authenticate,
  requireRole,
};
