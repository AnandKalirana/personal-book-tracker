/**
 * Personal Book Tracker - Backend Server
 * Production-ready Express.js server with enterprise-level security
 * Version: 2.1.0
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// Security Middleware Setup
// ============================================

// 1. Set Security HTTP Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "http://books.google.com"],
      connectSrc: ["'self'", "https://www.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// 2. CORS Configuration - Restrict to allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://your-production-frontend.vercel.app' // Add your production URL here
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// 3. Body parsing middleware with limits
app.use(express.json({ limit: '10kb' })); // Limit body size to 10kb to prevent DOS
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// 4. Data Sanitization against XSS
app.use(xss());

// 5. Prevent HTTP Parameter Pollution
app.use(hpp());

// 6. Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use('/api', globalLimiter);

// 7. Auth Specific Rate Limiting (Brute force protection)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 login/register attempts per hour
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after an hour'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 8. HTTP request logging (Morgan)
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ============================================
// Database Connection
// ============================================

const db = require('./config/database');

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connection successful');
    if (connection) connection.release();
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

// Protected routes — require JWT
app.use('/api/books', authenticate, bookRoutes);
app.use('/api/shelves', authenticate, shelfRoutes);
app.use('/api/tags', authenticate, tagRoutes);
app.use('/api/upload', authenticate, uploadRoutes);

// Health check endpoint (Public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Personal Book Tracker API - Secure v2.1',
    status: 'Operational'
  });
});

// ============================================
// Error Handling
// ============================================

const { errorHandler } = require('./middleware/errorHandler');

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

const server = app.listen(PORT, () => {
  if (NODE_ENV !== 'test') {
    console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    db.end(() => {
      process.exit(0);
    });
  });
});

module.exports = app;