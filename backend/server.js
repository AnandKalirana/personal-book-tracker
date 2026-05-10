/**
 * Personal Book Tracker - Backend Server (Vercel Ready)
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

// ✅ Required for express-rate-limit on Vercel
app.set('trust proxy', 1);

const NODE_ENV = process.env.NODE_ENV || 'production';

// ================= SECURITY =================
app.use(helmet());
app.use(xss());
app.use(hpp());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ================= CORS =================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

// ================= RATE LIMIT =================
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// ================= LOGGING =================
app.use(morgan('combined'));

// ================= ROUTES =================
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const bookRoutes = require('./routes/bookRoutes');
const shelfRoutes = require('./routes/shelfRoutes');
const tagRoutes = require('./routes/tagRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const socialRoutes = require('./routes/socialRoutes');

const { authenticate } = require('./middleware/auth');

// Health check for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Backend is running on Vercel',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/search', apiRoutes);
app.use('/api/social', socialRoutes);

app.use('/api/books', authenticate, bookRoutes);
app.use('/api/shelves', authenticate, shelfRoutes);
app.use('/api/tags', authenticate, tagRoutes);
app.use('/api/upload', authenticate, uploadRoutes);

// ================= ERROR HANDLER =================
// 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`
  });
});

const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// ================= DATABASE =================
const db = require('./config/database');

// Non-blocking DB check
db.query('SELECT 1', (err) => {
  if (err) {
    console.error('❌ DB connection failed:', err.message);
  } else {
    console.log('✅ MySQL connected successfully');
  }
});

// ✅ IMPORTANT: Export app for Vercel (NO app.listen)
module.exports = app;