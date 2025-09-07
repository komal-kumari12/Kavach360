const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'data', 'kavach360.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

async function createDemoUser() {
    try {
        console.log('Creating demo user...');
        
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash('password123', saltRounds);
        
        // Insert demo user
        db.run(
            `INSERT OR REPLACE INTO users (username, email, password, role, is_active) 
             VALUES (?, ?, ?, ?, ?)`,
            ['demo', 'demo@kavach360.com', hashedPassword, 'tourist', 1],
            function(err) {
                if (err) {
                    console.error('Error creating user:', err);
                    return;
                }
                
                const userId = this.lastID;
                console.log(`Demo user created with ID: ${userId}`);
                
                // Create tourist profile
                db.run(
                    `INSERT OR REPLACE INTO tourist_profiles (
                        user_id, full_name, nationality, passport_number,
                        emergency_contact, emergency_phone, blood_group,
                        medical_conditions, allergies, trip_start_date,
                        trip_end_date, device_token, app_version, platform
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        userId, 'Demo User', 'Indian', 'DEMO123456',
                        'Emergency Contact', '+91-9876543210', 'O+',
                        'None', 'None', '2024-01-01', '2024-12-31',
                        'demo-device-token', '1.0.0', 'web'
                    ],
                    function(err) {
                        if (err) {
                            console.error('Error creating tourist profile:', err);
                            return;
                        }
                        
                        console.log('Demo user profile created successfully!');
                        console.log('Login credentials:');
                        console.log('Username: demo');
                        console.log('Password: password123');
                        console.log('Email: demo@kavach360.com');
                        
                        db.close();
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error:', error);
        db.close();
    }
}

createDemoUser();
