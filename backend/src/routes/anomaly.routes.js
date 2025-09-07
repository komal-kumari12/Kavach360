/**
 * Anomaly Detection Routes
 */

const express = require('express');
const router = express.Router();
const anomalyController = require('../controllers/anomaly.controller');
const { protect } = require('../middleware/auth.middleware');

// Get anomaly detection data
router.get('/', protect, anomalyController.getAnomalyData);

// Mark anomaly as reviewed
router.post('/:anomalyId/review', protect, anomalyController.markAnomalyReviewed);

module.exports = router;