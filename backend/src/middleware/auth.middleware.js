const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access token required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const db = getDb();
        const user = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id, username, email, role, is_active FROM users WHERE id = ? AND is_active = 1',
                [decoded.userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token or user not found'
            });
        }

        // Add user info to request
        req.userId = user.id;
        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token expired'
            });
        }

        return res.status(500).json({
            status: 'error',
            message: 'Token verification failed'
        });
    }
};

// Verify admin role
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'error',
            message: 'Admin access required'
        });
    }
    next();
};

// Verify tourist role
const verifyTourist = (req, res, next) => {
    if (req.user.role !== 'tourist' && req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'error',
            message: 'Tourist access required'
        });
    }
    next();
};

// Optional token verification (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const db = getDb();
            
            const user = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id, username, email, role, is_active FROM users WHERE id = ? AND is_active = 1',
                    [decoded.userId],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });

            if (user) {
                req.userId = user.id;
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Generate JWT token
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return decoded;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    verifyToken,
    verifyAdmin,
    verifyTourist,
    optionalAuth,
    generateToken,
    generateRefreshToken,
    verifyRefreshToken
};
