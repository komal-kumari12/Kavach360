const { getDb } = require('../config/database');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const db = getDb();
        
        // Get total tourists
        const totalTourists = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM users WHERE role = "tourist" AND is_active = 1', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        // Get active tourists (logged in within last 24 hours)
        const activeTourists = await new Promise((resolve, reject) => {
            db.get(`
                SELECT COUNT(*) as count FROM users 
                WHERE role = "tourist" AND is_active = 1 
                AND last_login > datetime('now', '-1 day')
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        // Get geofence zones count
        const geofenceZones = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM geofence_zones WHERE is_active = 1', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        // Get active alerts
        const activeAlerts = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM alerts WHERE read_at IS NULL', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        // Get pending alerts
        const pendingAlerts = await new Promise((resolve, reject) => {
            db.get(`
                SELECT COUNT(*) as count FROM alerts 
                WHERE read_at IS NULL AND created_at > datetime('now', '-1 hour')
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        // Get resolved alerts today
        const resolvedAlerts = await new Promise((resolve, reject) => {
            db.get(`
                SELECT COUNT(*) as count FROM alerts 
                WHERE read_at IS NOT NULL 
                AND date(read_at) = date('now')
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        // Get check-in overdue count
        const checkinOverdue = await new Promise((resolve, reject) => {
            db.get(`
                SELECT COUNT(*) as count FROM users u
                JOIN tourist_profiles tp ON u.id = tp.user_id
                WHERE u.role = "tourist" AND u.is_active = 1
                AND (u.last_login IS NULL OR u.last_login < datetime('now', '-2 hours'))
            `, (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        res.json({
            status: 'success',
            data: {
                stats: {
                    totalTourists,
                    activeTourists,
                    geofenceZones,
                    activeAlerts,
                    pendingAlerts,
                    resolvedAlerts,
                    checkinOverdue
                }
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get recent alerts
const getRecentAlerts = async (req, res) => {
    try {
        const db = getDb();
        const limit = parseInt(req.query.limit) || 10;
        
        const alerts = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    a.*,
                    u.username as user_name,
                    tp.full_name
                FROM alerts a
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN tourist_profiles tp ON u.id = tp.user_id
                ORDER BY a.created_at DESC
                LIMIT ?
            `, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            status: 'success',
            data: alerts
        });
    } catch (error) {
        console.error('Recent alerts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch recent alerts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get tourist activity data for charts
const getTouristActivity = async (req, res) => {
    try {
        const db = getDb();
        const days = parseInt(req.query.days) || 7;
        
        // Get check-ins per day for the last N days
        const activityData = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    date(created_at) as date,
                    COUNT(*) as checkins
                FROM check_ins 
                WHERE created_at >= date('now', '-${days} days')
                GROUP BY date(created_at)
                ORDER BY date(created_at)
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Generate labels for the last N days
        const labels = [];
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            const dayData = activityData.find(d => d.date === dateStr);
            data.push(dayData ? dayData.checkins : 0);
        }

        res.json({
            status: 'success',
            data: {
                labels,
                data
            }
        });
    } catch (error) {
        console.error('Tourist activity error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tourist activity',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get alert types distribution
const getAlertTypesDistribution = async (req, res) => {
    try {
        const db = getDb();
        
        const alertTypes = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    type,
                    COUNT(*) as count
                FROM alerts 
                WHERE created_at >= date('now', '-30 days')
                GROUP BY type
                ORDER BY count DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            status: 'success',
            data: alertTypes
        });
    } catch (error) {
        console.error('Alert types distribution error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch alert types distribution',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get geofence activity
const getGeofenceActivity = async (req, res) => {
    try {
        const db = getDb();
        
        const geofenceActivity = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    gz.name,
                    COUNT(a.id) as violations
                FROM geofence_zones gz
                LEFT JOIN alerts a ON gz.id = a.geofence_zone_id 
                    AND a.type IN ('geofence_exit', 'geofence_entry')
                    AND a.created_at >= date('now', '-7 days')
                GROUP BY gz.id, gz.name
                ORDER BY violations DESC
                LIMIT 10
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            status: 'success',
            data: geofenceActivity
        });
    } catch (error) {
        console.error('Geofence activity error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch geofence activity',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get response time trends
const getResponseTimeTrends = async (req, res) => {
    try {
        const db = getDb();
        
        const responseTimes = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    date(created_at) as date,
                    AVG(
                        CASE 
                            WHEN read_at IS NOT NULL 
                            THEN (julianday(read_at) - julianday(created_at)) * 24 * 60 
                            ELSE NULL 
                        END
                    ) as avg_response_minutes
                FROM alerts 
                WHERE created_at >= date('now', '-7 days')
                GROUP BY date(created_at)
                ORDER BY date(created_at)
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            status: 'success',
            data: responseTimes
        });
    } catch (error) {
        console.error('Response time trends error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch response time trends',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getDashboardStats,
    getRecentAlerts,
    getTouristActivity,
    getAlertTypesDistribution,
    getGeofenceActivity,
    getResponseTimeTrends
};
