const { getDb } = require('../config/database');
const crypto = require('crypto');
const QRCode = require('qrcode');

// Generate blockchain-like hash for digital ID
const generateBlockchainHash = (data) => {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return '0x' + hash.digest('hex');
};

// Generate unique digital ID
const generateDigitalId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `KV-${timestamp.toString().slice(-6)}-${random.toUpperCase()}`;
};

// Create digital ID
const createDigitalId = async (req, res) => {
    try {
        const {
            fullName,
            nationality,
            passportNumber,
            passportPhoto,
            facialScan
        } = req.body;
        
        const userId = req.userId;
        const db = getDb();

        // Check if user already has a digital ID
        const existingId = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM digital_ids WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (existingId) {
            return res.status(400).json({
                status: 'error',
                message: 'Digital ID already exists for this user'
            });
        }

        // Generate unique ID and hash
        const digitalIdNumber = generateDigitalId();
        const idData = {
            id: digitalIdNumber,
            userId: userId,
            fullName,
            nationality,
            passportNumber,
            timestamp: Date.now()
        };
        const blockchainHash = generateBlockchainHash(idData);

        // Set expiry date (1 year from now)
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(issueDate.getFullYear() + 1);

        // Create digital ID record
        const result = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO digital_ids (
                    user_id, blockchain_address, id_hash, passport_photo, 
                    facial_scan, kyc_verified, verification_status, 
                    issue_date, expiry_date, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId, 
                    blockchainHash, 
                    digitalIdNumber,
                    passportPhoto || null,
                    facialScan || null,
                    false, // KYC not verified initially
                    'pending', // Verification status
                    issueDate.toISOString(),
                    expiryDate.toISOString(),
                    'active'
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });

        // Generate QR code data
        const qrData = {
            id: digitalIdNumber,
            hash: blockchainHash,
            fullName,
            nationality,
            passportNumber,
            issueDate: issueDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
            status: 'active'
        };

        // Generate QR code as base64
        let qrCodeBase64 = '';
        try {
            qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(qrData), {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
        } catch (qrError) {
            console.error('QR Code generation error:', qrError);
        }

        // Update record with QR code
        if (qrCodeBase64) {
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE digital_ids SET qr_code = ? WHERE id = ?',
                    [qrCodeBase64, result.id],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Digital ID created successfully',
            data: {
                id: result.id,
                digitalId: digitalIdNumber,
                blockchainHash,
                qrCode: qrCodeBase64,
                issueDate: issueDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                verificationStatus: 'pending'
            }
        });
    } catch (error) {
        console.error('Create digital ID error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create digital ID',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get digital ID for user
const getDigitalId = async (req, res) => {
    try {
        const userId = req.userId;
        const db = getDb();

        const digitalId = await new Promise((resolve, reject) => {
            db.get(
                `SELECT id, blockchain_address, id_hash, qr_code, passport_photo, 
                        facial_scan, kyc_verified, verification_status, 
                        issue_date, expiry_date, status, created_at, updated_at
                 FROM digital_ids 
                 WHERE user_id = ?`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!digitalId) {
            return res.status(404).json({
                status: 'error',
                message: 'Digital ID not found'
            });
        }

        // Get user profile data
        const userProfile = await new Promise((resolve, reject) => {
            db.get(
                `SELECT u.username, u.email, tp.full_name, tp.nationality, tp.passport_number
                 FROM users u
                 LEFT JOIN tourist_profiles tp ON u.id = tp.user_id
                 WHERE u.id = ?`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        res.json({
            status: 'success',
            data: {
                id: digitalId.id,
                digitalId: digitalId.id_hash,
                blockchainHash: digitalId.blockchain_address,
                qrCode: digitalId.qr_code,
                fullName: userProfile?.full_name || '',
                nationality: userProfile?.nationality || '',
                passportNumber: userProfile?.passport_number || '',
                kycVerified: Boolean(digitalId.kyc_verified),
                verificationStatus: digitalId.verification_status,
                issueDate: digitalId.issue_date,
                expiryDate: digitalId.expiry_date,
                status: digitalId.status,
                createdAt: digitalId.created_at,
                updatedAt: digitalId.updated_at
            }
        });
    } catch (error) {
        console.error('Get digital ID error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get digital ID',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Verify digital ID
const verifyDigitalId = async (req, res) => {
    try {
        const { qrData } = req.body;
        const db = getDb();

        if (!qrData) {
            return res.status(400).json({
                status: 'error',
                message: 'QR code data is required'
            });
        }

        let parsedData;
        try {
            parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
        } catch (parseError) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid QR code data format'
            });
        }

        // Find digital ID by hash
        const digitalId = await new Promise((resolve, reject) => {
            db.get(
                `SELECT di.*, u.username, u.email, tp.full_name, tp.nationality, tp.passport_number
                 FROM digital_ids di
                 JOIN users u ON di.user_id = u.id
                 LEFT JOIN tourist_profiles tp ON u.id = tp.user_id
                 WHERE di.blockchain_address = ? OR di.id_hash = ?`,
                [parsedData.hash, parsedData.id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!digitalId) {
            return res.status(404).json({
                status: 'error',
                message: 'Digital ID not found or invalid'
            });
        }

        // Check if ID is expired
        const now = new Date();
        const expiryDate = new Date(digitalId.expiry_date);
        const isExpired = now > expiryDate;

        // Verify blockchain hash
        const expectedData = {
            id: digitalId.id_hash,
            hash: digitalId.blockchain_address,
            fullName: digitalId.full_name || '',
            nationality: digitalId.nationality || '',
            passportNumber: digitalId.passport_number || '',
            issueDate: digitalId.issue_date,
            expiryDate: digitalId.expiry_date,
            status: digitalId.status
        };
        const expectedHash = generateBlockchainHash(expectedData);
        const isHashValid = digitalId.blockchain_address === expectedHash;

        res.json({
            status: 'success',
            data: {
                valid: isHashValid && !isExpired && digitalId.status === 'active',
                digitalId: digitalId.id_hash,
                fullName: digitalId.full_name,
                nationality: digitalId.nationality,
                passportNumber: digitalId.passport_number,
                verificationStatus: digitalId.verification_status,
                kycVerified: Boolean(digitalId.kyc_verified),
                issueDate: digitalId.issue_date,
                expiryDate: digitalId.expiry_date,
                isExpired,
                isHashValid,
                status: digitalId.status
            }
        });
    } catch (error) {
        console.error('Verify digital ID error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to verify digital ID',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update digital ID verification status
const updateVerificationStatus = async (req, res) => {
    try {
        const { status, kycVerified } = req.body;
        const userId = req.userId;
        const db = getDb();

        // Check if digital ID exists
        const existingId = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id FROM digital_ids WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!existingId) {
            return res.status(404).json({
                status: 'error',
                message: 'Digital ID not found'
            });
        }

        // Update verification status
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE digital_ids SET 
                    verification_status = COALESCE(?, verification_status),
                    kyc_verified = COALESCE(?, kyc_verified),
                    updated_at = datetime('now')
                 WHERE user_id = ?`,
                [status, kycVerified, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            status: 'success',
            message: 'Verification status updated successfully'
        });
    } catch (error) {
        console.error('Update verification status error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update verification status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Regenerate QR code
const regenerateQRCode = async (req, res) => {
    try {
        const userId = req.userId;
        const db = getDb();

        // Get digital ID data
        const digitalId = await new Promise((resolve, reject) => {
            db.get(
                `SELECT di.*, u.username, u.email, tp.full_name, tp.nationality, tp.passport_number
                 FROM digital_ids di
                 JOIN users u ON di.user_id = u.id
                 LEFT JOIN tourist_profiles tp ON u.id = tp.user_id
                 WHERE di.user_id = ?`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!digitalId) {
            return res.status(404).json({
                status: 'error',
                message: 'Digital ID not found'
            });
        }

        // Generate new QR code data
        const qrData = {
            id: digitalId.id_hash,
            hash: digitalId.blockchain_address,
            fullName: digitalId.full_name || '',
            nationality: digitalId.nationality || '',
            passportNumber: digitalId.passport_number || '',
            issueDate: digitalId.issue_date,
            expiryDate: digitalId.expiry_date,
            status: digitalId.status
        };

        // Generate new QR code
        const qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Update QR code in database
        await new Promise((resolve, reject) => {
            db.run(
                'UPDATE digital_ids SET qr_code = ?, updated_at = datetime("now") WHERE user_id = ?',
                [qrCodeBase64, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.json({
            status: 'success',
            message: 'QR code regenerated successfully',
            data: {
                qrCode: qrCodeBase64
            }
        });
    } catch (error) {
        console.error('Regenerate QR code error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to regenerate QR code',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createDigitalId,
    getDigitalId,
    verifyDigitalId,
    updateVerificationStatus,
    regenerateQRCode
};
