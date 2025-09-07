const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const geofenceController = require('../controllers/geofence.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { commonValidations, handleValidationErrors } = require('../middleware/security.middleware');

/**
 * @route POST /api/geofence
 * @desc Create geofence zone
 * @access Private
 */
router.post('/', [
    verifyToken,
    commonValidations.latitude,
    commonValidations.longitude,
    commonValidations.radius,
    handleValidationErrors
], geofenceController.createGeofenceZone);

/**
 * @route GET /api/geofence
 * @desc Get all geofence zones
 * @access Private
 */
router.get('/', verifyToken, geofenceController.getGeofenceZones);

/**
 * @route GET /api/geofence/:id
 * @desc Get specific geofence zone
 * @access Private
 */
router.get('/:id', verifyToken, geofenceController.getGeofenceZone);

/**
 * @route PUT /api/geofence/:id
 * @desc Update geofence zone
 * @access Private
 */
router.put('/:id', [
    verifyToken,
    // Make validations optional for updates
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    body('radius').optional().isFloat({ min: 10, max: 10000 }).withMessage('Radius must be between 10 and 10000 meters'),
    handleValidationErrors
], geofenceController.updateGeofenceZone);

/**
 * @route DELETE /api/geofence/:id
 * @desc Delete geofence zone
 * @access Private
 */
router.delete('/:id', verifyToken, geofenceController.deleteGeofenceZone);

/**
 * @route POST /api/geofence/check-location
 * @desc Check location against geofence zones
 * @access Private
 */
router.post('/check-location', [
    verifyToken,
    commonValidations.latitude,
    commonValidations.longitude,
    handleValidationErrors
], geofenceController.checkLocation);

/**
 * @route GET /api/geofence/dashboard/stats
 * @desc Get dashboard statistics
 * @access Private
 */
router.get('/dashboard/stats', verifyToken, geofenceController.getDashboardStats);

module.exports = router;
