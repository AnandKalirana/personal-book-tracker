/**
 * Personal Book Tracker - Backend Server
 * Production-ready Express.js server with enterprise-level security
 * Version: 2.2.0
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// Security Middleware Setup
// ============================================

// Helmet Security Headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

// ============================================
// CORS Configuration
// ============================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without origin
    if (!origin) {
      return callback(null, true);
    }

    if (
      NODE_ENV === 'development' ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy blocked this request'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ============================================
// Body Parsers
// ============================================

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// Security Protections
// ============================================

// Prevent XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// ============================================
// Rate Limiting
// ============================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many requests from this IP. Please try again later.',
  },
});

app.use('/api', apiLimiter);

// Auth-specific limiter
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message:
      'Too many authentication attempts. Please try again later.',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============================================
// Logging
// ============================================

app.use(
  morgan(NODE_ENV === 'production' ? 'combined' : 'dev')
);

// ============================================
// Root & Health Routes
// ============================================

// Root route for Railway health checks
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Personal Book Tracker API is running',
    environment: NODE_ENV,
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// ============================================
// Database Connection
// ============================================

const db = require('./config/database');

// Test DB connection safely
db.getConnection((err, connection) => {
  if (err) {
    console.error(
      '❌ Database connection failed:',
      err.message
    );
  } else {
    console.log('✅ Database connected successfully');

    if (connection) {
      connection.release();
    }
  }
});

// ============================================
// Routes
// ============================================

const bookRoutes = require('./routes/bookRoutes');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const socialRoutes = require('./routes/socialRoutes');
const shelfRoutes = require('./routes/shelfRoutes');
const tagRoutes = require('./routes/tagRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const { authenticate } = require('./middleware/auth');

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/search', apiRoutes);
app.use('/api/social', socialRoutes);

// Protected routes
app.use('/api/books', authenticate, bookRoutes);
app.use('/api/shelves', authenticate, shelfRoutes);
app.use('/api/tags', authenticate, tagRoutes);
app.use('/api/upload', authenticate, uploadRoutes);

// ============================================
// 404 Handler
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ============================================
// Global Error Handler
// ============================================

const { errorHandler } = require('./middleware/errorHandler');

app.use(errorHandler);

// ============================================
// Start Server
// ============================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `🚀 Server running in ${NODE_ENV} mode on port ${PORT}`
  );
});

// ============================================
// Graceful Shutdown
// ============================================

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');

  server.close(() => {
    console.log('HTTP server closed.');

    if (db && typeof db.end === 'function') {
      db.end(() => {
        console.log('Database connections closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

module.exports = app;