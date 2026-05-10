/**
 * Personal Book Tracker - Backend Server
 * Railway Production Stable Version
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
 * 🚨 Railway REQUIREMENT:
 * MUST use process.env.PORT only
 */
const PORT = process.env.PORT;

// Safety check
if (!PORT) {
  console.error("❌ PORT not found. Railway deployment failed.");
  process.exit(1);
}

// ============================================
// SECURITY
// ============================================

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors({ origin: '*', credentials: true }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(xss());
app.use(hpp());

// ============================================
// RATE LIMIT
// ============================================

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// ============================================
// LOGGING
// ============================================

app.use(morgan('dev'));

// ============================================
// HEALTH CHECK (IMPORTANT FOR RAILWAY)
// ============================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Personal Book Tracker API is running',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// ============================================
// DATABASE (SAFE INIT - NON BLOCKING)
// ============================================

const db = require('./config/database');

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    return;
  }

  console.log('✅ MySQL connected successfully');
  connection.release();
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
// 404 HANDLER
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