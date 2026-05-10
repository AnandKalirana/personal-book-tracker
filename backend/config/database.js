/**
 * Database Configuration (RAILWAY SAFE)
 */

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const DB_PORT = Number(process.env.DB_PORT) || 3306;

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('❌ Missing DB environment variables');
}

// Create pool ONLY (no connection test on import)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: DB_PORT,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000,
  enableKeepAlive: true,
});

// ❌ REMOVED: pool.getConnection() from import time
// Railway does NOT like startup-time DB validation

module.exports = pool;