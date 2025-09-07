const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/security.middleware');

/**
 * @route GET /api/dashboard/stats
 * @desc Get dashboard statistics
 * @access Private
 */
router.get('/stats', verifyToken, apiLimiter, dashboardController.getDashboardStats);

/**
 * @route GET /api/dashboard/alerts/recent
 * @desc Get recent alerts
 * @access Private
 */
router.get('/alerts/recent', verifyToken, apiLimiter, dashboardController.getRecentAlerts);

/**
 * @route GET /api/dashboard/activity/tourists
 * @desc Get tourist activity data
 * @access Private
 */
router.get('/activity/tourists', verifyToken, apiLimiter, dashboardController.getTouristActivity);

/**
 * @route GET /api/dashboard/analytics/alert-types
 * @desc Get alert types distribution
 * @access Private
 */
router.get('/analytics/alert-types', verifyToken, apiLimiter, dashboardController.getAlertTypesDistribution);

/**
 * @route GET /api/dashboard/analytics/geofence-activity
 * @desc Get geofence activity
 * @access Private
 */
router.get('/analytics/geofence-activity', verifyToken, apiLimiter, dashboardController.getGeofenceActivity);

/**
 * @route GET /api/dashboard/analytics/response-times
 * @desc Get response time trends
 * @access Private
 */
router.get('/analytics/response-times', verifyToken, apiLimiter, dashboardController.getResponseTimeTrends);

module.exports = router;
