const { getDb } = require('../config/database');

// Get all tourist locations
const getTouristLocations = async (req, res) => {
    try {
        const db = getDb();
        
        // Get all active tourists with their latest location
        const tourists = await new Promise((resolve, reject) => {
            db.all(`
                SELECT u.id, u.name, u.email, tp.current_latitude, tp.current_longitude, 
                       tp.last_location_update, tp.safety_score, tp.status
                FROM users u
                JOIN tourist_profiles tp ON u.id = tp.user_id
                WHERE u.role = "tourist" AND u.is_active = 1
                AND tp.current_latitude IS NOT NULL AND tp.current_longitude IS NOT NULL
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({
            status: 'success',
            data: tourists.map(tourist => ({
                id: tourist.id,
                name: tourist.name,
                email: tourist.email,
                location: {
                    latitude: tourist.current_latitude,
                    longitude: tourist.current_longitude,
                    lastUpdate: tourist.last_location_update
                },
                safetyScore: tourist.safety_score,
                status: tourist.status
            }))
        });
    } catch (error) {
        console.error('Get tourist locations error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tourist locations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getTouristLocations
};