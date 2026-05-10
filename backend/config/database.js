const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Safe parsing of port
const DB_PORT = Number(process.env.DB_PORT) || 3306;

// Validate env early (prevents silent crash)
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error('❌ Missing DB environment variables');
}

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

// DO NOT crash app on import (Railway fix)
// Just log connection status safely
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.code || err.message);
    return;
  }

  console.log('✅ MySQL connected successfully');

  connection.release();
});

module.exports = pool;