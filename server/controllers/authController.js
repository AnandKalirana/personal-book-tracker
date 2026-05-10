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

/**
 * ⚠️ SAFE MODE FOR RAILWAY:
 * Do NOT crash app if env is missing.
 */
if (!JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET is not set. Using fallback secret (NOT for production).');
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

  const existingEmail = await User.findByEmail(email.toLowerCase());
  if (existingEmail) {
    return next(new AppError('An account with this email already exists', 409));
  }

  const existingUsername = await User.findByUsername(username.trim());
  if (existingUsername) {
    return next(new AppError('This username is already taken', 409));
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.createUser(
    username.trim(),
    email.toLowerCase(),
    passwordHash
  );

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

  const user = await User.findByEmail(email.toLowerCase());
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

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
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  const user = await User.findByEmail(email.toLowerCase());

  // Always respond same way for security
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.'
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiry = new Date(Date.now() + 3600000);

  await User.setResetToken(user.id, hashedToken, expiry);

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

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

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  await User.updatePassword(user.id, passwordHash);
  await User.setResetToken(user.id, null, null);

  res.json({
    success: true,
    message: 'Password has been reset successfully. You can now login.'
  });
});

/**
 * Get profile
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