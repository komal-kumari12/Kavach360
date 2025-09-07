const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

// Import security middleware
const securityMiddleware = require('./middleware/security.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const geofenceRoutes = require('./routes/geofence.routes');
const alertRoutes = require('./routes/alert.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const digitalIdRoutes = require('./routes/digitalid.routes');
const touristRoutes = require('./routes/tourist.routes');
const anomalyRoutes = require('./routes/anomaly.routes');
const efirRoutes = require('./routes/efir.routes');

// Import middleware
const { verifyToken } = require('./middleware/auth.middleware');

// Initialize database
const { initDb } = require('./config/database');

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.WS_CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
});

// Security middleware
app.use(securityMiddleware.securityHeaders);
app.use(securityMiddleware.requestLogger);

// Rate limiting
app.use(securityMiddleware.generalLimiter);

// Logging middleware
app.use(morgan('combined'));

// Compression middleware
app.use(compression());

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security middleware
app.use(securityMiddleware.sanitizeInput);
app.use(securityMiddleware.preventSQLInjection);

// CORS configuration
app.use(cors(securityMiddleware.corsOptions));

// Handle OPTIONS requests explicitly
app.options('*', cors());

// Add a test endpoint to verify server is responding
app.get('/api/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ 
        message: 'Server is running correctly', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes with rate limiting
app.use('/api/auth', securityMiddleware.authLimiter, authRoutes);
app.use('/api/geofence', securityMiddleware.apiLimiter, geofenceRoutes);
app.use('/api/alerts', securityMiddleware.apiLimiter, alertRoutes);
app.use('/api/dashboard', securityMiddleware.apiLimiter, dashboardRoutes);
app.use('/api/digital-id', securityMiddleware.apiLimiter, digitalIdRoutes);
app.use('/api/tourists', securityMiddleware.apiLimiter, touristRoutes);
app.use('/api/anomaly', securityMiddleware.apiLimiter, anomalyRoutes);
app.use('/api/efir', securityMiddleware.apiLimiter, efirRoutes);

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../../')));

// Serve the frontend for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room: user-${userId}`);
    });

    // Handle location updates
    socket.on('location-update', (data) => {
        // Broadcast to user's room
        socket.to(`user-${data.userId}`).emit('location-update', data);
    });

    // Handle alert notifications
    socket.on('alert-notification', (data) => {
        // Broadcast to user's room
        socket.to(`user-${data.userId}`).emit('alert-notification', data);
    });

    // Handle SOS alerts
    socket.on('sos-alert', (data) => {
        // Broadcast to all admin users
        socket.broadcast.emit('sos-alert', data);
    });

    // Handle tourist location updates
    socket.on('tourist-location', (data) => {
        // Broadcast to all admin users
        socket.broadcast.emit('tourist-location', data);
        console.log('Tourist location update:', data);
    });

    // Handle zone selection
    socket.on('zone_selected', (data) => {
        console.log('Zone selected:', data);
        // Broadcast to all connected users
        socket.broadcast.emit('zone_selected', data);
    });

    // Handle zone selection cleared
    socket.on('zone_cleared', (data) => {
        console.log('Zone selection cleared:', data);
        // Broadcast to all connected users
        socket.broadcast.emit('zone_cleared', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Handle CORS errors
    if (err.message.includes('CORS')) {
        return res.status(403).json({
            status: 'error',
            message: err.message
        });
    }
    
    // Handle other errors
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

// Initialize database and start server
initDb()
    .then(() => {
        const PORT = process.env.PORT || 3000;
        const WS_PORT = process.env.WS_PORT || 3001;
        
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`WebSocket server running on port ${WS_PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error('Unhandled Promise Rejection:', err);
            server.close(() => process.exit(1));
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            server.close(() => process.exit(1));
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received, shutting down gracefully');
            server.close(() => {
                console.log('Process terminated');
                process.exit(0);
            });
        });
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });

// Export app and io for testing
module.exports = { app, io };
