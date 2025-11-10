const { verifyToken } = require('../utils/jwt');
const db = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await db.User.findByPk(decoded.userId, {
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
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const businessId = req.params.businessId || req.body.businessId || req.query.businessId;
      
      if (!businessId) {
        return res.status(400).json({ error: 'Business ID required' });
      }

      const businessUser = await db.BusinessUser.findOne({
        where: {
          userId: req.userId,
          businessId: businessId,
          isActive: true
        }
      });

      if (!businessUser) {
        return res.status(403).json({ error: 'Access denied to this business' });
      }

      if (!roles.includes(businessUser.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.businessUser = businessUser;
      req.businessId = businessId;
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

module.exports = {
  authenticate,
  requireRole,
};
