const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const DB_PORT = Number(process.env.DB_PORT) || 3306;

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
});

// ❌ REMOVE startup blocking connection test
// Instead expose a test function

const testConnection = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ MySQL connection failed:', err.message);
      return;
    }

    console.log('✅ MySQL connected successfully');
    connection.release();
  });
};

module.exports = {
  pool,
  testConnection,
};