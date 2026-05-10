const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = process.env.DATABASE_URL || process.env.MYSQL_URL 
  ? process.env.DATABASE_URL || process.env.MYSQL_URL
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
    };

const pool = mysql.createPool({
  ...(typeof dbConfig === 'string' ? { uri: dbConfig } : dbConfig),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // ✅ IMPORTANT for Railway
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;