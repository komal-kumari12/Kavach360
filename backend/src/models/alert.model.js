const mongoose = require('mongoose');

const alertSchema = mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['geofence_exit', 'geofence_entry', 'anomaly', 'missing_person', 'system'],
            required: true
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            required: true
        },
        status: {
            type: String,
            enum: ['new', 'acknowledged', 'resolved', 'false_alarm'],
            default: 'new'
        },
        message: {
            type: String,
            required: true
        },
        details: {
            type: Object
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        touristId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tourist'
        },
        geofenceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Geofence'
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 1
        },
        acknowledgedBy: {
            type: String
        },
        acknowledgedAt: {
            type: Date
        },
        resolvedBy: {
            type: String
        },
        resolvedAt: {
            type: Date
        },
        actions: [
            {
                type: String,
                action: String,
                timestamp: {
                    type: Date,
                    default: Date.now
                },
                by: String
            }
        ]
    },
    {
        timestamps: true
    }
);

// Create index for geospatial queries
alertSchema.index({ 'location': '2dsphere' });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;