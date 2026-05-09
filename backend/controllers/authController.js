/**
 * Authentication Controller
 * Handles user registration, login, and profile
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET || 'dev_secret',
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  // Check if email already exists
  const existingEmail = await User.findByEmail(email.toLowerCase());
  if (existingEmail) {
    return next(new AppError('An account with this email already exists', 409));
  }

  // Check if username already exists
  const existingUsername = await User.findByUsername(username.trim());
  if (existingUsername) {
    return next(new AppError('This username is already taken', 409));
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.createUser(
    username.trim(),
    email.toLowerCase(),
    passwordHash
  );

  // Generate token
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    }
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findByEmail(email.toLowerCase());
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Generate token
  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    }
  });
});

/**
 * Forgot Password
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  const user = await User.findByEmail(email.toLowerCase());
  if (!user) {
    // For security, don't reveal if user exists
    return res.json({ 
      success: true, 
      message: 'If an account exists with that email, a reset link has been sent.' 
    });
  }

  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  await User.setResetToken(user.id, hashedToken, expiry);

  // In production, send email here.
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  
  // LOGGING ONLY FOR DEV - REMOVE IN PROD
  if (process.env.NODE_ENV === 'development') {
    console.log(`Reset URL: ${resetUrl}`);
  }

  res.json({
    success: true,
    message: 'If an account exists with that email, a reset link has been sent.'
  });
});

/**
 * Reset Password
 * POST /api/auth/reset-password/:token
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Password is required', 400));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findByResetToken(hashedToken);

  if (!user || user.reset_token_expiry < new Date()) {
    return next(new AppError('Invalid or expired token', 400));
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Update password and clear token
  await User.updatePassword(user.id, passwordHash);
  await User.setResetToken(user.id, null, null);

  res.json({
    success: true,
    message: 'Password has been reset successfully. You can now login.'
  });
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    data: user
  });
});

