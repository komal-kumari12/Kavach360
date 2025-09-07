-- Kavach360 Database Schema
-- Enhanced for Frontend and Android App Integration

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'tourist',
  is_active BOOLEAN DEFAULT 1,
  email_verified BOOLEAN DEFAULT 0,
  phone_verified BOOLEAN DEFAULT 0,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tourist profiles table
CREATE TABLE IF NOT EXISTS tourist_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  nationality TEXT,
  passport_number TEXT,
  passport_expiry DATE,
  emergency_contact TEXT,
  emergency_phone TEXT,
  blood_group TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  trip_start_date DATETIME,
  trip_end_date DATETIME,
  current_location_lat REAL,
  current_location_lng REAL,
  current_location_updated DATETIME,
  device_token TEXT, -- For push notifications
  app_version TEXT,
  platform TEXT, -- 'android' or 'web'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Digital IDs table
CREATE TABLE IF NOT EXISTS digital_ids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  blockchain_address TEXT UNIQUE,
  id_hash TEXT UNIQUE NOT NULL,
  qr_code TEXT,
  passport_photo TEXT,
  facial_scan TEXT,
  kyc_verified BOOLEAN DEFAULT 0,
  verification_status TEXT DEFAULT 'pending',
  issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATETIME,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Geofence zones table
CREATE TABLE IF NOT EXISTS geofence_zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  radius REAL NOT NULL,
  type TEXT DEFAULT 'safe', -- 'safe', 'warning', 'restricted'
  is_active BOOLEAN DEFAULT 1,
  alert_type TEXT DEFAULT 'notification',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Location logs table
CREATE TABLE IF NOT EXISTS location_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  accuracy REAL,
  altitude REAL,
  speed REAL,
  heading REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  battery_level REAL,
  connection_status TEXT,
  app_state TEXT, -- 'foreground', 'background', 'killed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  geofence_zone_id INTEGER,
  alert_type TEXT NOT NULL, -- 'geofence_entry', 'geofence_exit', 'sos', 'check_in_missed', 'battery_low'
  latitude REAL,
  longitude REAL,
  description TEXT,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'pending', -- 'pending', 'acknowledged', 'resolved', 'dismissed'
  read_at DATETIME,
  resolved_at DATETIME,
  resolved_by INTEGER,
  metadata TEXT, -- JSON string for additional data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (geofence_zone_id) REFERENCES geofence_zones(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- SOS alerts table
CREATE TABLE IF NOT EXISTS sos_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  priority TEXT DEFAULT 'high', -- 'low', 'medium', 'high', 'critical'
  assigned_to INTEGER,
  response_time INTEGER, -- Response time in seconds
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Check-ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  location_name TEXT,
  check_in_type TEXT DEFAULT 'manual', -- 'manual', 'automatic', 'scheduled'
  status TEXT DEFAULT 'safe',
  message TEXT,
  photos TEXT, -- JSON array of photo paths
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  refresh_token TEXT,
  device_info TEXT, -- JSON string with device details
  ip_address TEXT,
  user_agent TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  category TEXT, -- 'alert', 'geofence', 'sos', 'system'
  is_read BOOLEAN DEFAULT 0,
  read_at DATETIME,
  action_url TEXT,
  metadata TEXT, -- JSON string for additional data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tourist_profiles_user_id ON tourist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_ids_user_id ON digital_ids(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_ids_hash ON digital_ids(id_hash);
CREATE INDEX IF NOT EXISTS idx_geofence_zones_user_id ON geofence_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_geofence_zones_location ON geofence_zones(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_location_logs_user_id ON location_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_location_logs_timestamp ON location_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_id ON sos_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON check_ins(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
  AFTER UPDATE ON users
  BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_tourist_profiles_timestamp 
  AFTER UPDATE ON tourist_profiles
  BEGIN
    UPDATE tourist_profiles SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_digital_ids_timestamp 
  AFTER UPDATE ON digital_ids
  BEGIN
    UPDATE digital_ids SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_geofence_zones_timestamp 
  AFTER UPDATE ON geofence_zones
  BEGIN
    UPDATE geofence_zones SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_system_settings_timestamp 
  AFTER UPDATE ON system_settings
  BEGIN
    UPDATE system_settings SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

-- Insert default system settings
INSERT OR IGNORE INTO system_settings (key, value, description, category, is_public) VALUES
('app_name', 'Kavach360', 'Application name', 'general', 1),
('app_version', '1.0.0', 'Application version', 'general', 1),
('maintenance_mode', 'false', 'Maintenance mode status', 'system', 0),
('max_geofence_zones', '10', 'Maximum geofence zones per user', 'limits', 0),
('location_update_interval', '30', 'Location update interval in seconds', 'geofencing', 0),
('sos_response_timeout', '300', 'SOS response timeout in seconds', 'alerts', 0),
('check_in_reminder_interval', '3600', 'Check-in reminder interval in seconds', 'alerts', 0);
