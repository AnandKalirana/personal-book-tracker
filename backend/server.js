/**
 * Personal Book Tracker - Backend Server
 * Railway-safe production setup
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

const PORT = process.env.PORT;

// ❌ IMPORTANT: DO NOT FALLBACK TO 8080 ON RAILWAY
// Railway MUST control the port
if (!PORT) {
  console.error('❌ PORT is not defined by environment');
  process.exit(1);
}

const NODE_ENV = process.env.NODE_ENV || 'production';

// ============================
// SECURITY MIDDLEWARE
// ============================
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// ============================
// CORS
// ============================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS blocked this request'));
    },
    credentials: true,
  })
);

// ============================
// BODY PARSERS
// ============================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================
// SECURITY
// ============================
app.use(xss());
app.use(hpp());

// ============================
// RATE LIMITING
// ============================
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, try later',
  })
);

// ============================
// LOGGING
// ============================
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ============================
// ROUTES IMPORT
// ============================
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const bookRoutes = require('./routes/bookRoutes');
const shelfRoutes = require('./routes/shelfRoutes');
const tagRoutes = require('./routes/tagRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const socialRoutes = require('./routes/socialRoutes');

const { authenticate } = require('./middleware/auth');

// ============================
// HEALTH ROUTES
// ============================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Personal Book Tracker API Running',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    time: new Date().toISOString(),
  });
});

// ============================
// ROUTES
// ============================
app.use('/api/auth', authRoutes);
app.use('/api/search', apiRoutes);
app.use('/api/social', socialRoutes);

app.use('/api/books', authenticate, bookRoutes);
app.use('/api/shelves', authenticate, shelfRoutes);
app.use('/api/tags', authenticate, tagRoutes);
app.use('/api/upload', authenticate, uploadRoutes);

// ============================
// 404 HANDLER
// ============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ============================
// ERROR HANDLER
// ============================
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// ============================
// DATABASE (SAFE IMPORT ONLY)
// ============================
const db = require('./config/database');

// SAFE DB TEST (AFTER SERVER START)
const testDB = () => {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('❌ MySQL connection failed:', err.message);
    } else {
      console.log('✅ MySQL connected successfully');
    }
  });
};

// ============================
// START SERVER (RAILWAY SAFE)
// ============================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🌍 Railway deployment active');

  // DB check AFTER server is ready
  testDB();
});

// ============================
// GRACEFUL SHUTDOWN
// ============================
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down.');

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});