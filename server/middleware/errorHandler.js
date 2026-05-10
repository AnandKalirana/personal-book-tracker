/**
 * Error Handling Middleware
 * Centralized error handling with proper logging and response formatting
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 * Must be the last middleware in the express app
 */
const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (isDevelopment) {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific database errors
    if (err.code === 'ER_DUP_ENTRY') error = handleDuplicateFieldsDB(err);
    if (err.code === 'ER_NO_REFERENCED_ROW_2') error = handleReferenceErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

    sendErrorProd(error, res);
  }
};

const handleDuplicateFieldsDB = (err) => {
  const message = 'Duplicate entry. This record already exists.';
  return new AppError(message, 400);
};

const handleReferenceErrorDB = (err) => {
  return new AppError('Invalid reference. Related record not found.', 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const handleValidationErrorDB = (err) => {
  const message = `Invalid input data. ${err.message}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler
};