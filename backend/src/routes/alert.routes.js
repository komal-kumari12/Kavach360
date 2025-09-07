const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { commonValidations, handleValidationErrors } = require('../middleware/security.middleware');

/**
 * @route POST /api/alerts
 * @desc Create alert
 * @access Private
 */
router.post('/', [
    verifyToken,
    commonValidations.latitude,
    commonValidations.longitude,
    handleValidationErrors
], alertController.createAlert);

/**
 * @route GET /api/alerts
 * @desc Get all alerts for user
 * @access Private
 */
router.get('/', verifyToken, alertController.getAlerts);

/**
 * @route GET /api/alerts/:id
 * @desc Get specific alert
 * @access Private
 */
router.get('/:id', verifyToken, alertController.getAlert);

/**
 * @route PUT /api/alerts/:id/status
 * @desc Update alert status
 * @access Private
 */
router.put('/:id/status', verifyToken, alertController.updateAlertStatus);

/**
 * @route PUT /api/alerts/:id/read
 * @desc Mark alert as read
 * @access Private
 */
router.put('/:id/read', verifyToken, alertController.markAlertRead);

/**
 * @route PUT /api/alerts/read/all
 * @desc Mark all alerts as read
 * @access Private
 */
router.put('/read/all', verifyToken, alertController.markAllAlertsRead);

/**
 * @route DELETE /api/alerts/:id
 * @desc Delete alert
 * @access Private
 */
router.delete('/:id', verifyToken, alertController.deleteAlert);

/**
 * @route POST /api/alerts/sos
 * @desc Create SOS alert
 * @access Private
 */
router.post('/sos', [
    verifyToken,
    commonValidations.latitude,
    commonValidations.longitude,
    handleValidationErrors
], alertController.createSosAlert);

/**
 * @route GET /api/alerts/sos
 * @desc Get SOS alerts
 * @access Private
 */
router.get('/sos', verifyToken, alertController.getSosAlerts);

module.exports = router;
