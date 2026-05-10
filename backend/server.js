/**
 * Personal Book Tracker - Backend Server
 * Railway Production Fix (FINAL STABLE VERSION)
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

/**
 * 🚨 IMPORTANT FIX:
 * Railway ALWAYS provides process.env.PORT
 * DO NOT fallback to 8080 or 3000
 */
const PORT = process.env.PORT;

// ============================================
// Security Middleware
// ============================================

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// ============================================
// CORS
// ============================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // allow all for now (Railway fix stability)
    },
    credentials: true,
  })
);

// ============================================
// Body Parsers
// ============================================

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// Security
// ============================================

app.use(xss());
app.use(hpp());

// ============================================
// Rate Limit
// ============================================

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// ============================================
// Logging
// ============================================

app.use(morgan('dev'));

// ============================================
// HEALTH ROUTE (CRITICAL FOR RAILWAY)
// ============================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Personal Book Tracker API is running',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
  });
});

// ============================================
// DATABASE (SAFE LOAD)
// ============================================

const db = require('./config/database');

// DO NOT block server startup
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DB Error:', err.message);
    return;
  }

  console.log('✅ Database connected successfully');
  if (connection) connection.release();
});

// ============================================
// ROUTES
// ============================================

const bookRoutes = require('./routes/bookRoutes');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const socialRoutes = require('./routes/socialRoutes');
const shelfRoutes = require('./routes/shelfRoutes');
const tagRoutes = require('./routes/tagRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const { authenticate } = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/search', apiRoutes);
app.use('/api/social', socialRoutes);

app.use('/api/books', authenticate, bookRoutes);
app.use('/api/shelves', authenticate, shelfRoutes);
app.use('/api/tags', authenticate, tagRoutes);
app.use('/api/upload', authenticate, uploadRoutes);

// ============================================
// 404
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ============================================
// ERROR HANDLER
// ============================================

const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// ============================================
// START SERVER (RAILWAY FIX)
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🌍 Railway deployment active');
});

module.exports = app;