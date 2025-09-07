const mongoose = require('mongoose');

const efirSchema = mongoose.Schema(
    {
        efirNumber: {
            type: String,
            required: true,
            unique: true
        },
        touristId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tourist',
            required: true
        },
        touristDetails: {
            name: {
                type: String,
                required: true
            },
            digitalId: {
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
            }
        },
        incidentDetails: {
            date: {
                type: Date,
                required: true
            },
            time: {
                type: String
            },
            location: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
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
                type: Date
            }
        },
        reportedBy: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            role: {
                type: String,
                required: true
            }
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'closed'],
            default: 'pending'
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    required: true
                },
                remarks: {
                    type: String
                },
                updatedBy: {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                        required: true
                    },
                    name: {
                        type: String,
                        required: true
                    },
                    role: {
                        type: String,
                        required: true
                    }
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        verificationId: {
            type: String,
            required: true,
            unique: true
        },
        attachments: [
            {
                type: {
                    type: String,
                    enum: ['image', 'document', 'audio', 'video'],
                    required: true
                },
                url: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        actions: [
            {
                type: {
                    type: String,
                    enum: ['search', 'notification', 'alert', 'update'],
                    required: true
                },
                description: {
                    type: String,
                    required: true
                },
                performedBy: {
                    userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User',
                        required: true
                    },
                    name: {
                        type: String,
                        required: true
                    },
                    role: {
                        type: String,
                        required: true
                    }
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Create index for geospatial queries
efirSchema.index({ 'lastKnownLocation': '2dsphere' });

// Create indexes for common queries
efirSchema.index({ efirNumber: 1 });
efirSchema.index({ status: 1 });
efirSchema.index({ touristId: 1 });
efirSchema.index({ 'touristDetails.digitalId': 1 });
efirSchema.index({ 'touristDetails.passportNumber': 1 });
efirSchema.index({ verificationId: 1 });

module.exports = mongoose.model('EFIR', efirSchema);