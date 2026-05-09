/**
 * Database Configuration
 * MySQL connection pool setup with proper configuration
 */

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'book_tracker_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection refused. Is MySQL running?');
    }
    console.error('❌ MySQL connection error:', err.message);
  } else {
    if (connection) {
      connection.release();
      console.log('✅ MySQL Pool initialized successfully');
    }
  }
});

module.exports = pool;