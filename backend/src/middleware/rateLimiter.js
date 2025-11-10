const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware
 * 
 * NOTE: This is currently commented out in the MVP for development ease.
 * Uncomment and apply to routes in production.
 */

// API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter - stricter for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter
};

/*
USAGE EXAMPLE:

In src/index.js:
  const { apiLimiter } = require('./middleware/rateLimiter');
  app.use('/api', apiLimiter);

In src/routes/auth.js:
  const { authLimiter } = require('../middleware/rateLimiter');
  router.post('/login', authLimiter, authController.login);
  router.post('/register', authLimiter, authController.register);

In src/routes/upload.js:
  const { uploadLimiter } = require('../middleware/rateLimiter');
  router.post('/', authenticate, uploadLimiter, upload.single('file'), uploadFileHandler);
*/
