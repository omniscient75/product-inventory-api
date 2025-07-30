const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

// Rate limiting configuration
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests from this IP') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limiters for different endpoints
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many requests from this IP');
const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts');
const strictLimiter = createRateLimiter(15 * 60 * 1000, 10, 'Too many requests from this IP');

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ValidationError(errorMessages.join(', '));
  }
  next();
};

// Common validation rules
const commonValidations = {
  // User validation
  userRegister: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    handleValidationErrors
  ],

  userLogin: [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],

  // Product validation
  productCreate: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Product name must be between 2 and 100 characters')
      .escape(),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
    handleValidationErrors
  ],

  productUpdate: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Product name must be between 2 and 100 characters')
      .escape(),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
    handleValidationErrors
  ],

  // Quantity update validation
  quantityUpdate: [
    body('quantity')
      .isFloat({ min: 0 })
      .withMessage('Quantity must be a non-negative number'),
    body('operation')
      .optional()
      .isIn(['add', 'subtract', 'set'])
      .withMessage('Operation must be one of: add, subtract, set'),
    handleValidationErrors
  ]
};

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    // Log based on status code
    if (res.statusCode >= 400) {
      console.error('❌ Request Error:', logData);
    } else {
      console.log('✅ Request Success:', logData);
    }
  });

  next();
};

// Security middleware stack
const securityMiddleware = [
  securityHeaders,
  sanitizeInput,
  requestLogger
];

module.exports = {
  createRateLimiter,
  generalLimiter,
  authLimiter,
  strictLimiter,
  sanitizeInput,
  handleValidationErrors,
  commonValidations,
  corsOptions,
  requestLogger,
  securityMiddleware
}; 