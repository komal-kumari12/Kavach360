const { getDb } = require('../config/database');
const { commonValidations } = require('../middleware/security.middleware');

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
};

// Create geofence zone
const createGeofenceZone = async (req, res) => {
    try {
        const { name, description, latitude, longitude, radius, type, alertType } = req.body;
        const userId = req.userId;
        const db = getDb();

        // Validate radius
        const minRadius = parseInt(process.env.GEOFENCE_MIN_RADIUS) || 50;
        const maxRadius = parseInt(process.env.GEOFENCE_MAX_RADIUS) || 10000;
        
        if (radius < minRadius || radius > maxRadius) {
            return res.status(400).json({
                status: 'error',
                message: `Radius must be between ${minRadius} and ${maxRadius} meters`
            });
        }

        // Check zone limit
        const maxZones = parseInt(process.env.MAX_GEOFENCE_ZONES) || 10;
        const existingZones = await new Promise((resolve, reject) => {
            db.get(
                'SELECT COUNT(*) as count FROM geofence_zones WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                }
            );
        });

        if (existingZones >= maxZones) {
            return res.status(400).json({
                status: 'error',
                message: `Maximum ${maxZones} geofence zones allowed`
            });
        }

        // Create geofence zone
        const result = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO geofence_zones (user_id, name, description, latitude, longitude, radius, type, alert_type)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, name, description, latitude, longitude, radius, type || 'safe', alertType || 'notification'],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });

        res.status(201).json({
            status: 'success',
            message: 'Geofence zone created successfully',
            data: {
                id: result.id,
                name,
                description,
                latitude,
                longitude,
                radius,
                type: type || 'safe',
                alertType: alertType || 'notification'
            }
        });
    } catch (error) {
        console.error('Create geofence zone error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create geofence zone',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all geofence zones for user
const getGeofenceZones = async (req, res) => {
    try {
        const userId = req.userId;
        const db = getDb();

        const zones = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id, name, description, latitude, longitude, radius, type, 
                        alert_type, is_active, created_at, updated_at
                 FROM geofence_zones 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC`,
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.json({
            status: 'success',
            data: zones.map(zone => ({
                id: zone.id,
                name: zone.name,
                description: zone.description,
                coordinates: {
                    latitude: zone.latitude,
                    longitude: zone.longitude
                },
                radius: zone.radius,
                type: zone.type,
                alertType: zone.alert_type,
                isActive: Boolean(zone.is_active),
                createdAt: zone.created_at,
                updatedAt: zone.updated_at
            }))
        });
    } catch (error) {
        console.error('Get geofence zones error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get geofence zones',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get specific geofence zone
const getGeofenceZone = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const db = getDb();

        const zone = await new Promise((resolve, reject) => {
            db.get(
                `SELECT id, name, description, latitude, longitude, radius, type, 
                        alert_type, is_active, created_at, updated_at
                 FROM geofence_zones 
                 WHERE id = ? AND user_id = ?`,
                [id, userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!zone) {
            return res.status(404).json({
                status: 'error',
                message: 'Geofence zone not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                id: zone.id,
                name: zone.name,
                description: zone.description,
                coordinates: {
                    latitude: zone.latitude,
                    longitude: zone.longitude
                },
                radius: zone.radius,
                type: zone.type,
                alertType: zone.alert_type,
                isActive: Boolean(zone.is_active),
                createdAt: zone.created_at,
                updatedAt: zone.updated_at
            }
        });
    } catch (error) {
        console.error('Get geofence zone error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get geofence zone',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update geofence zone
const updateGeofenceZone = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, latitude, longitude, radius, type, alertType, isActive } = req.body;
        const userId = req.userId;
        const db = getDb();

        // Check if zone exists and belongs to user
        const existingZone = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM geofence_zones WHERE id = ? AND user_id = ?',
                [id, userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!existingZone) {
            return res.status(404).json({
                status: 'error',
                message: 'Geofence zone not found'
            });
        }

        // Update zone
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE geofence_zones SET
                    name = COALESCE(?, name),
                    description = COALESCE(?, description),
                    latitude = COALESCE(?, latitude),
                    longitude = COALESCE(?, longitude),
                    radius = COALESCE(?, radius),
                    type = COALESCE(?, type),
                    alert_type = COALESCE(?, alert_type),
                    is_active = COALESCE(?, is_active),
                    updated_at = datetime('now')
                 WHERE id = ? AND user_id = ?`,
                [name, description, latitude, longitude, radius, type, alertType, isActive, id, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            status: 'success',
            message: 'Geofence zone updated successfully'
        });
    } catch (error) {
        console.error('Update geofence zone error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update geofence zone',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete geofence zone
const deleteGeofenceZone = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const db = getDb();

        const result = await new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM geofence_zones WHERE id = ? AND user_id = ?',
                [id, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });

        if (result.changes === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Geofence zone not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Geofence zone deleted successfully'
        });
    } catch (error) {
        console.error('Delete geofence zone error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete geofence zone',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Check location against geofence zones
const checkLocation = async (req, res) => {
    try {
        const { latitude, longitude, accuracy } = req.body;
        const userId = req.userId;
        const db = getDb();

        // Get all active geofence zones for user
        const zones = await new Promise((resolve, reject) => {
            db.all(
                'SELECT id, name, latitude, longitude, radius, type, alert_type FROM geofence_zones WHERE user_id = ? AND is_active = 1',
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        const alerts = [];

        for (const zone of zones) {
            const distance = calculateDistance(latitude, longitude, zone.latitude, zone.longitude);
            
            if (distance <= zone.radius) {
                // Inside zone
                alerts.push({
                    zoneId: zone.id,
                    zoneName: zone.name,
                    alertType: 'geofence_entry',
                    type: zone.type,
                    distance: Math.round(distance),
                    message: `Entered ${zone.name} zone`
                });
            }
        }

        // Update user's current location
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE tourist_profiles SET current_location_lat = ?, current_location_lng = ?, current_location_updated = datetime("now") WHERE user_id = ?',
                [latitude, longitude, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Log location
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO location_logs (user_id, latitude, longitude, accuracy, timestamp) VALUES (?, ?, ?, ?, datetime("now"))',
                [userId, latitude, longitude, accuracy],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            status: 'success',
            data: {
                alerts,
                location: {
                    latitude,
                    longitude,
                    accuracy
                }
            }
        });
    } catch (error) {
        console.error('Check location error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to check location',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;
        const db = getDb();

        // Get geofence zones count
        const zonesCount = await new Promise((resolve, reject) => {
            db.get(
                'SELECT COUNT(*) as count FROM geofence_zones WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                }
            );
        });

        // Get active alerts count
        const alertsCount = await new Promise((resolve, reject) => {
            db.get(
                'SELECT COUNT(*) as count FROM alerts WHERE user_id = ? AND status = "pending"',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                }
            );
        });

        // Get recent alerts
        const recentAlerts = await new Promise((resolve, reject) => {
            db.all(
                `SELECT a.id, a.alert_type, a.description, a.status, a.created_at,
                        gz.name as zone_name
                 FROM alerts a
                 LEFT JOIN geofence_zones gz ON a.geofence_zone_id = gz.id
                 WHERE a.user_id = ?
                 ORDER BY a.created_at DESC
                 LIMIT 5`,
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        // Get activity data for chart (last 7 days)
        const activityData = await new Promise((resolve, reject) => {
            db.all(
                `SELECT DATE(created_at) as date, COUNT(*) as count
                 FROM location_logs
                 WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
                 GROUP BY DATE(created_at)
                 ORDER BY date`,
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });

        res.json({
            status: 'success',
            data: {
                stats: {
                    geofenceZones: zonesCount,
                    activeAlerts: alertsCount
                },
                recentAlerts: recentAlerts.map(alert => ({
                    id: alert.id,
                    alertType: alert.alert_type,
                    description: alert.description,
                    status: alert.status,
                    zoneName: alert.zone_name,
                    createdAt: alert.created_at
                })),
                activityData: {
                    labels: activityData.map(item => item.date),
                    data: activityData.map(item => item.count)
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createGeofenceZone,
    getGeofenceZones,
    getGeofenceZone,
    updateGeofenceZone,
    deleteGeofenceZone,
    checkLocation,
    getDashboardStats
};
