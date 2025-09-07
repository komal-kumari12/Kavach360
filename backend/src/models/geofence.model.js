const mongoose = require('mongoose');

const geofenceSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        type: {
            type: String,
            enum: ['polygon', 'circle', 'rectangle'],
            required: true
        },
        coordinates: {
            type: [
                {
                    type: [Number],
                    required: true
                }
            ],
            required: true
        },
        radius: {
            type: Number,
            // Required only for circle type
        },
        center: {
            type: [Number],
            // Required only for circle type
        },
        bounds: {
            // For rectangle type
            northEast: {
                type: [Number]
            },
            southWest: {
                type: [Number]
            }
        },
        color: {
            type: String,
            default: '#3388ff'
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        restrictions: {
            type: [String],
            default: []
        },
        touristsInside: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Tourist'
            }
        ],
        createdBy: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Create index for geospatial queries if using GeoJSON format
geofenceSchema.index({ coordinates: '2dsphere' });

const Geofence = mongoose.model('Geofence', geofenceSchema);

module.exports = Geofence;