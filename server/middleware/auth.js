/**
 * Authentication Middleware
 * JWT verification for protected routes
 */

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify JWT token and attach user to request
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  const token = authHeader.split(' ')[1];

  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not configured!');
    return next(new AppError('Server configuration error', 500));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please login again.', 401));
    }
    return next(new AppError('Invalid token.', 401));
  }
};

/**
 * Optional auth — doesn't reject if no token, just attaches user if present
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username
        };
      } catch (error) {
        // Token invalid, proceed without user
      }
    }
  }
  next();
};

module.exports = { authenticate, optionalAuth };

