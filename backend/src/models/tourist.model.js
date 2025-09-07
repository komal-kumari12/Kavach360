const mongoose = require('mongoose');

const touristSchema = mongoose.Schema(
    {
        digitalId: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        nationality: {
            type: String,
            required: true
        },
        passportNumber: {
            type: String,
            required: true
        },
        age: {
            type: Number
        },
        gender: {
            type: String
        },
        phone: {
            type: String
        },
        email: {
            type: String
        },
        checkInDate: {
            type: Date,
            default: Date.now
        },
        checkOutDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'missing', 'found'],
            default: 'active'
        },
        lastKnownLocation: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        },
        locationHistory: [
            {
                coordinates: {
                    type: [Number],
                    required: true
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        currentGeofence: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Geofence'
        },
        alerts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Alert'
            }
        ]
    },
    {
        timestamps: true
    }
);

// Create index for geospatial queries
touristSchema.index({ 'lastKnownLocation': '2dsphere' });

const Tourist = mongoose.model('Tourist', touristSchema);

module.exports = Tourist;