const { getDb } = require('../config/database');

// Create alert
const createAlert = async (req, res) => {
    try {
        const { alertType, latitude, longitude, description, severity, geofenceZoneId, metadata } = req.body;
        const userId = req.userId;
        const db = getDb();

        const result = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO alerts (user_id, geofence_zone_id, alert_type, latitude, longitude, description, severity, metadata)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId, geofenceZoneId, alertType, latitude, longitude, 
                    description, severity || 'medium', JSON.stringify(metadata || {})
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });

        res.status(201).json({
            status: 'success',
            message: 'Alert created successfully',
            data: {
                id: result.id,
                alertType,
                description,
                severity: severity || 'medium',
                createdAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Create alert error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create alert',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all alerts for user
const getAlerts = async (req, res) => {
    try {
        const userId = req.userId;
        const { status, limit = 50, offset = 0 } = req.query;
        const db = getDb();

        let query = `
            SELECT a.id, a.alert_type, a.latitude, a.longitude, a.description, 
                   a.severity, a.status, a.read_at, a.resolved_at, a.created_at,
                   gz.name as zone_name, gz.type as zone_type
            FROM alerts a
            LEFT JOIN geofence_zones gz ON a.geofence_zone_id = gz.id
            WHERE a.user_id = ?
        `;
        
        const params = [userId];
        
        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const alerts = await new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
                });
        });

        res.json({
            status: 'success',
            data: alerts.map(alert => ({
                id: alert.id,
                alertType: alert.alert_type,
                coordinates: {
                    latitude: alert.latitude,
                    longitude: alert.longitude
                },
                description: alert.description,
                severity: alert.severity,
                status: alert.status,
                readAt: alert.read_at,
                resolvedAt: alert.resolved_at,
                createdAt: alert.created_at,
                zone: alert.zone_name ? {
                    name: alert.zone_name,
                    type: alert.zone_type
                } : null
            }))
        });
    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get alerts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get specific alert
const getAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const db = getDb();

        const alert = await new Promise((resolve, reject) => {
            db.get(
                `SELECT a.id, a.alert_type, a.latitude, a.longitude, a.description, 
                        a.severity, a.status, a.read_at, a.resolved_at, a.created_at, a.metadata,
                        gz.name as zone_name, gz.type as zone_type
                 FROM alerts a
                 LEFT JOIN geofence_zones gz ON a.geofence_zone_id = gz.id
                 WHERE a.id = ? AND a.user_id = ?`,
                [id, userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!alert) {
            return res.status(404).json({
                status: 'error',
                message: 'Alert not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                id: alert.id,
                alertType: alert.alert_type,
                coordinates: {
                    latitude: alert.latitude,
                    longitude: alert.longitude
                },
                description: alert.description,
                severity: alert.severity,
                status: alert.status,
                readAt: alert.read_at,
                resolvedAt: alert.resolved_at,
                createdAt: alert.created_at,
                metadata: alert.metadata ? JSON.parse(alert.metadata) : {},
                zone: alert.zone_name ? {
                    name: alert.zone_name,
                    type: alert.zone_type
                } : null
            }
        });
    } catch (error) {
        console.error('Get alert error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get alert',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update alert status
const updateAlertStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.userId;
        const db = getDb();

        const validStatuses = ['pending', 'acknowledged', 'resolved', 'dismissed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status'
            });
        }

        const result = await new Promise((resolve, reject) => {
            let query = 'UPDATE alerts SET status = ?';
            const params = [status];
            
            if (status === 'resolved') {
                query += ', resolved_at = datetime("now")';
            }
            
            query += ' WHERE id = ? AND user_id = ?';
            params.push(id, userId);
            
            db.run(query, params, function(err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });

        if (result.changes === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Alert not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Alert status updated successfully'
        });
    } catch (error) {
        console.error('Update alert status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update alert status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Mark alert as read
const markAlertRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const db = getDb();

        const result = await new Promise((resolve, reject) => {
            db.run(
                'UPDATE alerts SET read_at = datetime("now") WHERE id = ? AND user_id = ?',
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
                message: 'Alert not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Alert marked as read'
        });
    } catch (error) {
        console.error('Mark alert read error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to mark alert as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Mark all alerts as read
const markAllAlertsRead = async (req, res) => {
    try {
        const userId = req.userId;
        const db = getDb();

        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE alerts SET read_at = datetime("now") WHERE user_id = ? AND read_at IS NULL',
                [userId],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            status: 'success',
            message: 'All alerts marked as read'
        });
    } catch (error) {
        console.error('Mark all alerts read error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to mark all alerts as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete alert
const deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const db = getDb();

        const result = await new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM alerts WHERE id = ? AND user_id = ?',
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
                message: 'Alert not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        console.error('Delete alert error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete alert',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create SOS alert
const createSosAlert = async (req, res) => {
    try {
        const { latitude, longitude, message } = req.body;
        const userId = req.userId;
        const db = getDb();

        const result = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO sos_alerts (user_id, latitude, longitude, message, status, priority)
                 VALUES (?, ?, ?, ?, 'active', 'critical')`,
                [userId, latitude, longitude, message],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });

        // Also create a regular alert
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO alerts (user_id, alert_type, latitude, longitude, description, severity, status)
                 VALUES (?, 'sos', ?, ?, ?, 'critical', 'pending')`,
                [userId, latitude, longitude, message || 'SOS Alert'],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.status(201).json({
            status: 'success',
            message: 'SOS alert created successfully',
            data: {
                id: result.id,
                message: message || 'SOS Alert',
                coordinates: {
                    latitude,
                    longitude
                },
                createdAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Create SOS alert error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create SOS alert',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get SOS alerts
const getSosAlerts = async (req, res) => {
    try {
        const userId = req.userId;
        const db = getDb();

        const sosAlerts = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id, latitude, longitude, message, status, priority, 
                        response_time, created_at, resolved_at
                 FROM sos_alerts 
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
            data: sosAlerts.map(alert => ({
                id: alert.id,
                coordinates: {
                    latitude: alert.latitude,
                    longitude: alert.longitude
                },
                message: alert.message,
                status: alert.status,
                priority: alert.priority,
                responseTime: alert.response_time,
                createdAt: alert.created_at,
                resolvedAt: alert.resolved_at
            }))
        });
    } catch (error) {
        console.error('Get SOS alerts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get SOS alerts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createAlert,
    getAlerts,
    getAlert,
    updateAlertStatus,
    markAlertRead,
    markAllAlertsRead,
    deleteAlert,
    createSosAlert,
    getSosAlerts
};
