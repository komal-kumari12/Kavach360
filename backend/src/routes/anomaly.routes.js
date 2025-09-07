/**
 * Anomaly Detection Routes
 */

const express = require('express');
const router = express.Router();
const anomalyController = require('../controllers/anomaly.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Get anomaly detection data
router.get('/', verifyToken, anomalyController.getAnomalyData);

// Mark anomaly as reviewed
router.post('/:anomalyId/review', verifyToken, anomalyController.markAnomalyReviewed);

module.exports = router;