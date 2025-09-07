const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

class Database {
    constructor() {
        this.db = null;
        this.dbPath = process.env.DB_PATH || './data/kavach360.db';
        this.init();
    }

    init() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Connect to database
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    throw err;
                }
                console.log('Connected to SQLite database');
            });

            // Enable foreign keys
            this.db.exec('PRAGMA foreign_keys = ON;');
            
            // Initialize schema
            this.initializeSchema();
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    async initializeSchema() {
        try {
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            await this.exec(schema);
            console.log('Database schema initialized successfully');
        } catch (error) {
            console.error('Error initializing database schema:', error);
            throw error;
        }
    }

    // Promise-based database methods
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    exec(sql) {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Transaction support
    async transaction(callback) {
        await this.run('BEGIN TRANSACTION');
        try {
            const result = await callback(this);
            await this.run('COMMIT');
            return result;
        } catch (error) {
            await this.run('ROLLBACK');
            throw error;
        }
    }

    // Backup database
    async backup(backupPath) {
        return new Promise((resolve, reject) => {
            const backup = new sqlite3.Database(backupPath);
            this.db.backup(backup, (err) => {
                if (err) reject(err);
                else {
                    backup.close();
                    resolve();
                }
            });
        });
    }

    // Close database connection
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Get database instance
    getDb() {
        return this.db;
    }
}

// Create singleton instance
const database = new Database();

module.exports = {
    getDb: () => database.getDb(),
    db: database,
    initDb: async () => {
        // Database is already initialized in constructor
        return Promise.resolve();
    }
};
