# KAVACH 360 - Smart Tourist Safety System

A comprehensive safety solution leveraging AI, Blockchain, and Geo-Fencing to protect tourists in unfamiliar territories.

## 🚀 Features

- **Digital Tourist ID**: Secure blockchain-based digital IDs with KYC verification
- **Mobile Application**: Real-time safety monitoring with geo-fencing alerts
- **AI Anomaly Detection**: Detect location drop-offs and route deviations
- **Authority Dashboard**: Real-time visualizations and automated incident response
- **IoT Integration**: Smart bands for high-risk areas
- **Multilingual Support**: Available in 10+ Indian languages

## 🏗️ Architecture

- **Backend**: Node.js with Express.js, SQLite database
- **Frontend**: HTML5, CSS3, JavaScript with responsive design
- **Mobile App**: Android native app with Kotlin
- **Blockchain**: Ethereum smart contracts for digital ID verification
- **Infrastructure**: Docker containerization with Nginx reverse proxy

## 📋 Prerequisites

- Node.js 18+ and npm
- Android Studio (for mobile app development)
- Docker and Docker Compose
- Git

## 🛠️ Installation & Setup

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/kavach360.git
   cd kavach360
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp config.env.example config.env
   # Edit config.env with your production values
   ```

4. **Initialize database**
   ```bash
   npm run init-db
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Serve static files**
   ```bash
   # From project root
   python -m http.server 8080
   # Or use any static file server
   ```

### Android App Setup

1. **Open in Android Studio**
   ```bash
   # Open android/ directory in Android Studio
   ```

2. **Configure API endpoints**
   - Update `BuildConfig.API_BASE_URL` in `build.gradle`
   - For development: `http://10.0.2.2:3000/api/`
   - For production: `https://api.kavach360.gov.in/api/`

3. **Build and run**
   ```bash
   ./gradlew assembleDebug
   ```

### Production Deployment

1. **Using Docker Compose**
   ```bash
   # Set environment variables
   export JWT_SECRET="your-super-secret-jwt-key"
   export REDIS_PASSWORD="your-redis-password"
   export GRAFANA_PASSWORD="your-grafana-password"
   
   # Start all services
   docker-compose up -d
   ```

2. **Manual deployment**
   ```bash
   # Build backend image
   cd backend
   docker build -t kavach360-backend .
   
   # Run with environment variables
   docker run -d \
     --name kavach360-backend \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e JWT_SECRET="your-secret" \
     kavach360-backend
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | `kavach360-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `WEB3_PROVIDER` | Ethereum provider URL | `http://localhost:8545` |
| `CONTRACT_ADDRESS` | Smart contract address | `` |
| `REDIS_URL` | Redis connection URL | `` |

### Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `digital_ids` - Blockchain-based digital IDs
- `tourist_profiles` - Tourist information and KYC data
- `geofence_zones` - Safety zones and boundaries
- `location_logs` - GPS tracking data
- `alerts` - Safety alerts and incidents

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Sanitization**: XSS and SQL injection prevention
- **HTTPS Enforcement**: SSL/TLS encryption for all communications
- **Security Headers**: Comprehensive security headers
- **ProGuard Obfuscation**: Android app code obfuscation
- **Certificate Pinning**: SSL certificate pinning for mobile apps

## 📱 Mobile App Features

- **Location Tracking**: Real-time GPS tracking with battery optimization
- **QR Code Scanner**: Digital ID verification
- **Panic Button**: Emergency alert system
- **Offline Support**: Core functionality works offline
- **Biometric Authentication**: Fingerprint/Face ID support
- **Push Notifications**: Real-time safety alerts

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Android Testing
```bash
cd android
./gradlew test
./gradlew connectedAndroidTest
```

## 📊 Monitoring

The application includes comprehensive monitoring:

- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Health Checks**: Application health monitoring
- **Logging**: Structured logging with different levels

Access monitoring at:
- Grafana: `http://localhost:3001`
- Prometheus: `http://localhost:9090`

## 🚀 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Digital ID Endpoints
- `POST /api/digital-id` - Register digital ID
- `GET /api/digital-id/details` - Get digital ID details
- `POST /api/digital-id/verify` - Verify digital ID
- `GET /api/digital-id/qr-code` - Generate QR code

### Geofencing Endpoints
- `GET /api/geofence/zones` - Get all safety zones
- `GET /api/geofence/current-zone` - Get current zone
- `POST /api/geofence/location` - Log location
- `GET /api/geofence/location/history` - Get location history

### Alert Endpoints
- `GET /api/alerts` - Get safety alerts
- `POST /api/geofence/alert` - Create alert
- `GET /api/geofence/alerts` - Get user alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@kavach360.gov.in
- Documentation: [docs.kavach360.gov.in](https://docs.kavach360.gov.in)
- Issues: [GitHub Issues](https://github.com/your-org/kavach360/issues)

## 🙏 Acknowledgments

- Ministry of Tourism, Government of India
- Ministry of Home Affairs, Government of India
- Open source community contributors

---

**KAVACH 360** - Ensuring tourist safety with advanced technology 🛡️
