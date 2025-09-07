const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { commonValidations, handleValidationErrors } = require('../middleware/security.middleware');

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', [
    commonValidations.username,
    commonValidations.email,
    commonValidations.password,
    handleValidationErrors
], authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', [
    commonValidations.username,
    handleValidationErrors
], authController.login);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * @route GET /api/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', verifyToken, authController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', verifyToken, authController.updateProfile);

/**
 * @route GET /api/auth/test
 * @desc Test authentication endpoint
 * @access Public
 */
router.get('/test', (req, res) => {
    res.json({
        status: 'success',
        message: 'Authentication service is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
