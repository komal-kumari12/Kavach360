const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth.middleware');

// Register new user
const register = async (req, res) => {
    try {
        console.log('Registration request body:', req.body);
        
        const {
            username,
            email,
            password,
            fullName,
            nationality,
            passportNumber,
            emergencyContact,
            emergencyPhone,
            bloodGroup,
            medicalConditions,
            allergies,
            tripStartDate,
            tripEndDate,
            deviceToken,
            appVersion,
            platform
        } = req.body;

        const db = getDb();

        // Check if user already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [username, email],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Username or email already exists'
            });
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const userResult = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (username, email, password, role) 
                 VALUES (?, ?, ?, 'tourist')`,
                [username, email, hashedPassword],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });

        // Create tourist profile
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO tourist_profiles (
                    user_id, full_name, nationality, passport_number,
                    emergency_contact, emergency_phone, blood_group,
                    medical_conditions, allergies, trip_start_date,
                    trip_end_date, device_token, app_version, platform
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userResult.id, fullName, nationality, passportNumber,
                    emergencyContact, emergencyPhone, bloodGroup,
                    medicalConditions, allergies, tripStartDate,
                    tripEndDate, deviceToken, appVersion, platform
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Generate tokens
        const token = generateToken(userResult.id);
        const refreshToken = generateRefreshToken(userResult.id);

        // Store session
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO user_sessions (user_id, token, refresh_token, device_info, ip_address, user_agent, expires_at)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+24 hours'))`,
                [
                    userResult.id, token, refreshToken,
                    JSON.stringify({ platform, appVersion }),
                    req.ip, req.get('User-Agent')
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    id: userResult.id,
                    username,
                    email,
                    role: 'tourist'
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { username, password, deviceToken, appVersion, platform } = req.body;

        const db = getDb();

        // Find user
        const user = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.id, u.username, u.email, u.password, u.role, u.is_active,
                        tp.full_name, tp.device_token
                 FROM users u
                 LEFT JOIN tourist_profiles tp ON u.id = tp.user_id
                 WHERE (u.username = ? OR u.email = ?) AND u.is_active = 1`,
                [username, username],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password'
            });
        }

        // Update last login
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET last_login = datetime("now") WHERE id = ?',
                [user.id],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Update device token if provided
        if (deviceToken) {
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE tourist_profiles SET device_token = ?, app_version = ?, platform = ? WHERE user_id = ?',
                    [deviceToken, appVersion, platform, user.id],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Store session
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO user_sessions (user_id, token, refresh_token, device_info, ip_address, user_agent, expires_at)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+24 hours'))`,
                [
                    user.id, token, refreshToken,
                    JSON.stringify({ platform, appVersion }),
                    req.ip, req.get('User-Agent')
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    fullName: user.full_name
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                status: 'error',
                message: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        const db = getDb();

        // Check if refresh token exists in database
        const session = await new Promise((resolve, reject) => {
            db.get(
                'SELECT user_id FROM user_sessions WHERE refresh_token = ? AND expires_at > datetime("now")',
                [refreshToken],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!session) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const newToken = generateToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);

        // Update session
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE user_sessions 
                 SET token = ?, refresh_token = ?, expires_at = datetime('now', '+24 hours')
                 WHERE refresh_token = ?`,
                [newToken, newRefreshToken, refreshToken],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            status: 'success',
            message: 'Token refreshed successfully',
            data: {
                token: newToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Token refresh failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const db = getDb();

        if (refreshToken) {
            // Remove specific session
            await new Promise((resolve, reject) => {
                db.run(
                    'DELETE FROM user_sessions WHERE refresh_token = ?',
                    [refreshToken],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        } else {
            // Remove all sessions for user
            await new Promise((resolve, reject) => {
                db.run(
                    'DELETE FROM user_sessions WHERE user_id = ?',
                    [req.userId],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        res.json({
            status: 'success',
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Logout failed'
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const db = getDb();

        const profile = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.id, u.username, u.email, u.role, u.created_at,
                        tp.full_name, tp.nationality, tp.passport_number,
                        tp.emergency_contact, tp.emergency_phone, tp.blood_group,
                        tp.medical_conditions, tp.allergies, tp.trip_start_date,
                        tp.trip_end_date, tp.current_location_lat, tp.current_location_lng,
                        tp.device_token, tp.app_version, tp.platform
                 FROM users u
                 LEFT JOIN tourist_profiles tp ON u.id = tp.user_id
                 WHERE u.id = ?`,
                [req.userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                user: {
                    id: profile.id,
                    username: profile.username,
                    email: profile.email,
                    role: profile.role,
                    createdAt: profile.created_at
                },
                profile: {
                    fullName: profile.full_name,
                    nationality: profile.nationality,
                    passportNumber: profile.passport_number,
                    emergencyContact: profile.emergency_contact,
                    emergencyPhone: profile.emergency_phone,
                    bloodGroup: profile.blood_group,
                    medicalConditions: profile.medical_conditions,
                    allergies: profile.allergies,
                    tripStartDate: profile.trip_start_date,
                    tripEndDate: profile.trip_end_date,
                    currentLocation: {
                        latitude: profile.current_location_lat,
                        longitude: profile.current_location_lng
                    },
                    deviceToken: profile.device_token,
                    appVersion: profile.app_version,
                    platform: profile.platform
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const {
            fullName,
            email,
            username,
            nationality,
            phone,
            passportNumber,
            emergencyContact,
            emergencyPhone,
            bloodGroup,
            medicalConditions,
            allergies,
            tripStartDate,
            tripEndDate
        } = req.body;

        const db = getDb();

        // Update user table if username or email provided
        if (username || email) {
            // Check if username or email already exists for other users
            if (username) {
                const existingUser = await new Promise((resolve, reject) => {
                    db.get(
                        'SELECT id FROM users WHERE username = ? AND id != ?',
                        [username, req.userId],
                        (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        }
                    );
                });

                if (existingUser) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Username already exists'
                    });
                }
            }

            if (email) {
                const existingEmail = await new Promise((resolve, reject) => {
                    db.get(
                        'SELECT id FROM users WHERE email = ? AND id != ?',
                        [email, req.userId],
                        (err, row) => {
                            if (err) reject(err);
                            else resolve(row);
                        }
                    );
                });

                if (existingEmail) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Email already exists'
                    });
                }
            }

            // Update user table
            await new Promise((resolve, reject) => {
                const updateFields = [];
                const updateValues = [];

                if (username) {
                    updateFields.push('username = ?');
                    updateValues.push(username);
                }
                if (email) {
                    updateFields.push('email = ?');
                    updateValues.push(email);
                }

                if (updateFields.length > 0) {
                    updateValues.push(req.userId);
                    db.run(
                        `UPDATE users SET ${updateFields.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
                        updateValues,
                        function(err) {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                } else {
                    resolve();
                }
            });
        }

        // Update tourist profile
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE tourist_profiles SET
                    full_name = COALESCE(?, full_name),
                    nationality = COALESCE(?, nationality),
                    emergency_phone = COALESCE(?, emergency_phone),
                    passport_number = COALESCE(?, passport_number),
                    emergency_contact = COALESCE(?, emergency_contact),
                    blood_group = COALESCE(?, blood_group),
                    medical_conditions = COALESCE(?, medical_conditions),
                    allergies = COALESCE(?, allergies),
                    trip_start_date = COALESCE(?, trip_start_date),
                    trip_end_date = COALESCE(?, trip_end_date),
                    updated_at = datetime('now')
                 WHERE user_id = ?`,
                [
                    fullName, nationality, phone, passportNumber, emergencyContact,
                    bloodGroup, medicalConditions, allergies,
                    tripStartDate, tripEndDate, req.userId
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            status: 'success',
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
    updateProfile
};
