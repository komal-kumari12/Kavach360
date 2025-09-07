const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// Security headers middleware
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"]
        }
    },
    crossOriginEmbedderPolicy: false
});

// Request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
};

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Auth rate limiter (more restrictive)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 50, // Increased for testing
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: {
        status: 'error',
        message: 'Too many API requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Recursively sanitize string inputs
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj.trim().replace(/[<>]/g, '');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }

    next();
};

// SQL injection prevention middleware
const preventSQLInjection = (req, res, next) => {
    const sqlInjectionPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
        /(--|\/\*|\*\/|xp_|sp_)/i,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
        /(\b(OR|AND)\s+['"]\s*=\s*['"])/i
    ];

    const checkForSQLInjection = (obj) => {
        if (typeof obj === 'string') {
            return sqlInjectionPatterns.some(pattern => pattern.test(obj));
        }
        if (Array.isArray(obj)) {
            return obj.some(checkForSQLInjection);
        }
        if (obj && typeof obj === 'object') {
            return Object.values(obj).some(checkForSQLInjection);
        }
        return false;
    };

    const hasSQLInjection = 
        checkForSQLInjection(req.body) ||
        checkForSQLInjection(req.query) ||
        checkForSQLInjection(req.params);

    if (hasSQLInjection) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid input detected'
        });
    }

    next();
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Common validation rules
const commonValidations = {
    username: body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_.-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, dots, and hyphens'),
    
    email: body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    password: body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    
    latitude: body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    
    longitude: body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    
    radius: body('radius')
        .isFloat({ min: 10, max: 10000 })
        .withMessage('Radius must be between 10 and 10000 meters')
};

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.CORS_ORIGINS ? 
            process.env.CORS_ORIGINS.split(',') : 
            ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://127.0.0.1:8080'];
        
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // In development, allow all origins
            if (process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = {
    securityHeaders,
    requestLogger,
    generalLimiter,
    authLimiter,
    apiLimiter,
    sanitizeInput,
    preventSQLInjection,
    handleValidationErrors,
    commonValidations,
    corsOptions
};
