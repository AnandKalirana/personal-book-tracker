/**
 * Database Configuration
 * Railway Production Safe MySQL Pool
 */

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 10000,
  enableKeepAlive: true,
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);

    if (err.code) {
      console.error('❌ Error Code:', err.code);
    }

    return;
  }

  console.log('✅ MySQL connected successfully');

  if (connection) {
    connection.release();
  }
});

module.exports = pool;