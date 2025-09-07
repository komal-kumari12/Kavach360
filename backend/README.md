# Kavach360 Backend API

A robust Node.js backend API for the Kavach360 Tourist Safety Platform, designed to work seamlessly with both web frontend and Android applications.

## 🚀 Features

- **RESTful API** with comprehensive endpoints
- **Real-time WebSocket** support for live updates
- **JWT Authentication** with refresh tokens
- **SQLite Database** with optimized schema
- **Geofencing** capabilities with location tracking
- **Alert System** with SOS functionality
- **Security Middleware** with rate limiting and CORS
- **Mobile-First** design for Android app integration
- **Scalable Architecture** with proper error handling

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Geofencing
- `POST /api/geofence` - Create geofence zone
- `GET /api/geofence` - Get all geofence zones
- `GET /api/geofence/:id` - Get specific geofence zone
- `PUT /api/geofence/:id` - Update geofence zone
- `DELETE /api/geofence/:id` - Delete geofence zone
- `POST /api/geofence/check-location` - Check location against zones
- `GET /api/geofence/dashboard/stats` - Get dashboard statistics

### Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get specific alert
- `PUT /api/alerts/:id/status` - Update alert status
- `PUT /api/alerts/:id/read` - Mark alert as read
- `PUT /api/alerts/read/all` - Mark all alerts as read
- `DELETE /api/alerts/:id` - Delete alert
- `POST /api/alerts/sos` - Create SOS alert
- `GET /api/alerts/sos` - Get SOS alerts

### System
- `GET /api/test` - Server health check

## 🛠️ Installation

### Prerequisites
- Node.js 16+ 
- npm 8+

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Copy environment configuration
cp config.env.example config.env

# Start the server
npm start
```

### Development
```bash
# Start with nodemon for development
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## 🔧 Configuration

Edit `config.env` to configure:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
WS_PORT=3001

# Database
DB_PATH=./data/kavach360.db

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
```

## 📱 Android Integration

The API is designed to work seamlessly with Android applications:

### Authentication Flow
```kotlin
// Login request
val loginRequest = LoginRequest(
    username = "user@example.com",
    password = "password123",
    platform = "android",
    appVersion = "1.0.0",
    deviceToken = "firebase_token"
)
```

### Location Updates
```kotlin
// Location update request
val locationRequest = LocationUpdateRequest(
    latitude = 28.6139,
    longitude = 77.2090,
    accuracy = 10.0,
    batteryLevel = 85.0,
    appState = "foreground"
)
```

### WebSocket Connection
```kotlin
// Connect to WebSocket for real-time updates
val socket = IO.socket("http://localhost:3000")
socket.connect()
socket.emit("join-user-room", userId)
```

## 🌐 Frontend Integration

The API works perfectly with the web frontend:

### Authentication
```javascript
// Login
const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
});
```

### Real-time Updates
```javascript
// WebSocket connection
const socket = io('http://localhost:3000');
socket.emit('join-user-room', userId);
socket.on('alert-notification', handleAlert);
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Input Sanitization** to prevent XSS
- **SQL Injection Prevention**
- **Helmet.js** security headers
- **Password Hashing** with bcrypt

## 📊 Database Schema

The database includes optimized tables for:
- Users and profiles
- Geofence zones
- Location logs
- Alerts and notifications
- User sessions
- System settings

## 🚀 Deployment

### Docker
```bash
# Build and run with Docker
docker build -t kavach360-backend .
docker run -p 3000:3000 -p 3001:3001 kavach360-backend
```

### Docker Compose
```bash
# Start all services
docker-compose up -d
```

### Production
```bash
# Set production environment
export NODE_ENV=production

# Start with PM2
pm2 start src/server.js --name kavach360-backend
```

## 🧪 Testing

Run the API test suite:
```bash
node test-api.js
```

This will test all endpoints and verify the system is working correctly.

## 📈 Monitoring

The server includes:
- Request logging with Morgan
- Error handling and reporting
- Health check endpoints
- Performance monitoring
- Database query optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Kavach360 Backend API** - Secure, Scalable, and Mobile-Ready! 🛡️
