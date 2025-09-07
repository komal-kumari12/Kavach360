const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const digitalIdController = require('../controllers/digitalid.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/security.middleware');

/**
 * @route POST /api/digital-id
 * @desc Create digital ID
 * @access Private
 */
router.post('/', [
    verifyToken,
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('nationality').notEmpty().withMessage('Nationality is required'),
    body('passportNumber').notEmpty().withMessage('Passport number is required'),
    handleValidationErrors
], digitalIdController.createDigitalId);

/**
 * @route GET /api/digital-id
 * @desc Get user's digital ID
 * @access Private
 */
router.get('/', verifyToken, digitalIdController.getDigitalId);

/**
 * @route POST /api/digital-id/verify
 * @desc Verify digital ID from QR code
 * @access Public
 */
router.post('/verify', [
    body('qrData').notEmpty().withMessage('QR code data is required'),
    handleValidationErrors
], digitalIdController.verifyDigitalId);

/**
 * @route PUT /api/digital-id/verification-status
 * @desc Update verification status
 * @access Private
 */
router.put('/verification-status', [
    verifyToken,
    body('status').optional().isIn(['pending', 'verified', 'rejected']).withMessage('Invalid status'),
    body('kycVerified').optional().isBoolean().withMessage('KYC verified must be boolean'),
    handleValidationErrors
], digitalIdController.updateVerificationStatus);

/**
 * @route POST /api/digital-id/regenerate-qr
 * @desc Regenerate QR code
 * @access Private
 */
router.post('/regenerate-qr', verifyToken, digitalIdController.regenerateQRCode);

module.exports = router;
