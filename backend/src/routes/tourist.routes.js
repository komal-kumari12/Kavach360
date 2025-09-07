const express = require('express');
const router = express.Router();
const { getTouristLocations } = require('../controllers/tourist.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all tourist locations - requires authentication
router.get('/locations', verifyToken, getTouristLocations);

module.exports = router;