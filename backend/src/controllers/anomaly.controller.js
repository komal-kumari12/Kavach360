/**
 * Anomaly Detection Controller
 * Handles AI-based anomaly detection for tourist tracking
 */

const Tourist = require('../models/tourist.model');
const Geofence = require('../models/geofence.model');
const Alert = require('../models/alert.model');
const { getDistance } = require('../utils/geo.utils');

/**
 * Get anomaly detection data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAnomalyData = async (req, res) => {
    try {
        // Get query parameters
        const { timeRange = '24h', confidence = 0.5 } = req.query;
        
        // Calculate time threshold based on timeRange
        const timeThreshold = new Date();
        switch(timeRange) {
            case '1h':
                timeThreshold.setHours(timeThreshold.getHours() - 1);
                break;
            case '6h':
                timeThreshold.setHours(timeThreshold.getHours() - 6);
                break;
            case '12h':
                timeThreshold.setHours(timeThreshold.getHours() - 12);
                break;
            case '7d':
                timeThreshold.setDate(timeThreshold.getDate() - 7);
                break;
            case '30d':
                timeThreshold.setDate(timeThreshold.getDate() - 30);
                break;
            default: // 24h
                timeThreshold.setHours(timeThreshold.getHours() - 24);
        }
        
        // Get active tourists
        const activeTourists = await Tourist.find({
            lastActive: { $gte: timeThreshold },
            status: 'active'
        }).select('name email location lastActive safetyScore');
        
        // Get geofence zones
        const geofenceZones = await Geofence.find({});
        
        // Get recent alerts
        const recentAlerts = await Alert.find({
            createdAt: { $gte: timeThreshold }
        }).populate('tourist', 'name email');
        
        // Perform anomaly detection
        const anomalies = detectAnomalies(activeTourists, geofenceZones, recentAlerts, parseFloat(confidence));
        
        // Calculate statistics
        const totalAnomalies = anomalies.length;
        const criticalAnomalies = anomalies.filter(a => a.confidence > 0.8).length;
        const affectedTourists = new Set(anomalies.map(a => a.touristId)).size;
        
        // Prepare heatmap data
        const heatmapData = anomalies.map(a => ({
            lat: a.location.coordinates[1],
            lng: a.location.coordinates[0],
            intensity: a.confidence
        }));
        
        // Prepare chart data
        const anomalyTypes = {
            'movement': 0,
            'clustering': 0,
            'geofence': 0,
            'behavior': 0,
            'pattern': 0
        };
        
        anomalies.forEach(a => {
            if (anomalyTypes.hasOwnProperty(a.type)) {
                anomalyTypes[a.type]++;
            }
        });
        
        const chartData = {
            labels: Object.keys(anomalyTypes),
            datasets: [{
                data: Object.values(anomalyTypes),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        };
        
        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalAnomalies,
                    criticalAnomalies,
                    affectedTourists
                },
                anomalies,
                heatmapData,
                chartData
            }
        });
    } catch (error) {
        console.error('Error in getAnomalyData:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve anomaly data',
            error: error.message
        });
    }
};

/**
 * Detect anomalies in tourist data
 * @param {Array} tourists - List of active tourists
 * @param {Array} geofences - List of geofence zones
 * @param {Array} alerts - List of recent alerts
 * @param {Number} confidenceThreshold - Minimum confidence threshold
 * @returns {Array} - List of detected anomalies
 */
function detectAnomalies(tourists, geofences, alerts, confidenceThreshold) {
    const anomalies = [];
    
    // Sample anomaly detection logic
    // In a real implementation, this would use more sophisticated algorithms
    
    // 1. Detect unusual movement patterns
    tourists.forEach(tourist => {
        // Simulate anomaly detection with random confidence for demo purposes
        // In a real implementation, this would use actual ML models
        const movementConfidence = Math.random();
        if (movementConfidence > confidenceThreshold) {
            anomalies.push({
                touristId: tourist._id,
                touristName: tourist.name,
                touristEmail: tourist.email,
                type: 'movement',
                confidence: movementConfidence,
                location: tourist.location,
                timestamp: new Date(),
                description: 'Unusual movement pattern detected'
            });
        }
        
        // 2. Detect geofence anomalies
        if (tourist.location && tourist.location.coordinates) {
            geofences.forEach(geofence => {
                const distance = getDistance(
                    tourist.location.coordinates[1],
                    tourist.location.coordinates[0],
                    geofence.location.coordinates[1],
                    geofence.location.coordinates[0]
                );
                
                // Check if tourist is near geofence boundary (entering or exiting)
                const boundaryDistance = Math.abs(distance - geofence.radius);
                if (boundaryDistance < 50) { // Within 50 meters of boundary
                    const geofenceConfidence = 0.7 + (Math.random() * 0.3); // 0.7-1.0
                    if (geofenceConfidence > confidenceThreshold) {
                        anomalies.push({
                            touristId: tourist._id,
                            touristName: tourist.name,
                            touristEmail: tourist.email,
                            type: 'geofence',
                            confidence: geofenceConfidence,
                            location: tourist.location,
                            timestamp: new Date(),
                            description: `Unusual geofence boundary activity near ${geofence.name}`
                        });
                    }
                }
            });
        }
    });
    
    // 3. Detect tourist clustering
    for (let i = 0; i < tourists.length; i++) {
        const touristA = tourists[i];
        let clusterCount = 0;
        
        for (let j = 0; j < tourists.length; j++) {
            if (i === j) continue;
            
            const touristB = tourists[j];
            if (touristA.location && touristB.location) {
                const distance = getDistance(
                    touristA.location.coordinates[1],
                    touristA.location.coordinates[0],
                    touristB.location.coordinates[1],
                    touristB.location.coordinates[0]
                );
                
                if (distance < 20) { // Within 20 meters
                    clusterCount++;
                }
            }
        }
        
        // If tourist is clustered with many others
        if (clusterCount > 5) {
            const clusterConfidence = 0.6 + (Math.random() * 0.4); // 0.6-1.0
            if (clusterConfidence > confidenceThreshold) {
                anomalies.push({
                    touristId: touristA._id,
                    touristName: touristA.name,
                    touristEmail: touristA.email,
                    type: 'clustering',
                    confidence: clusterConfidence,
                    location: touristA.location,
                    timestamp: new Date(),
                    description: `Unusual clustering detected with ${clusterCount} other tourists`
                });
            }
        }
    }
    
    // 4. Detect behavioral anomalies based on safety score
    tourists.forEach(tourist => {
        if (tourist.safetyScore < 50) {
            const behaviorConfidence = 0.5 + ((50 - tourist.safetyScore) / 100); // 0.5-1.0
            if (behaviorConfidence > confidenceThreshold) {
                anomalies.push({
                    touristId: tourist._id,
                    touristName: tourist.name,
                    touristEmail: tourist.email,
                    type: 'behavior',
                    confidence: behaviorConfidence,
                    location: tourist.location,
                    timestamp: new Date(),
                    description: `Low safety score (${tourist.safetyScore}) indicates potential risk`
                });
            }
        }
    });
    
    // 5. Detect pattern anomalies from alerts
    const alertsByTourist = {};
    alerts.forEach(alert => {
        if (alert.tourist) {
            const touristId = alert.tourist._id.toString();
            if (!alertsByTourist[touristId]) {
                alertsByTourist[touristId] = [];
            }
            alertsByTourist[touristId].push(alert);
        }
    });
    
    Object.entries(alertsByTourist).forEach(([touristId, touristAlerts]) => {
        if (touristAlerts.length >= 3) {
            const tourist = tourists.find(t => t._id.toString() === touristId);
            if (tourist) {
                const patternConfidence = 0.6 + (touristAlerts.length / 20); // Increases with more alerts
                if (patternConfidence > confidenceThreshold) {
                    anomalies.push({
                        touristId: tourist._id,
                        touristName: tourist.name,
                        touristEmail: tourist.email,
                        type: 'pattern',
                        confidence: Math.min(patternConfidence, 1.0), // Cap at 1.0
                        location: tourist.location,
                        timestamp: new Date(),
                        description: `Unusual pattern of ${touristAlerts.length} alerts detected`
                    });
                }
            }
        }
    });
    
    return anomalies;
}

/**
 * Mark anomaly as reviewed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.markAnomalyReviewed = async (req, res) => {
    try {
        const { anomalyId } = req.params;
        const { action, notes } = req.body;
        
        // In a real implementation, this would update a database record
        // For this demo, we'll just return success
        
        return res.status(200).json({
            success: true,
            message: `Anomaly ${anomalyId} marked as reviewed with action: ${action}`,
            data: {
                anomalyId,
                action,
                notes,
                reviewedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error in markAnomalyReviewed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to mark anomaly as reviewed',
            error: error.message
        });
    }
};