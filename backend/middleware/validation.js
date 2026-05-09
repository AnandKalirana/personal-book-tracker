/**
 * Validation Middleware
 * Request data validation using simple but effective validation logic
 */

const { AppError } = require('./errorHandler');

/**
 * Validate book creation/update request
 */
const validateBook = (req, res, next) => {
  const { title, author, description, cover_image_url, date_completed, rating, genre, reading_status } = req.body;

  const errors = {};

  // Title validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.title = 'Title is required and must be a non-empty string';
  } else if (title.length > 255) {
    errors.title = 'Title must not exceed 255 characters';
  }

  // Author validation
  if (!author || typeof author !== 'string' || author.trim().length === 0) {
    errors.author = 'Author is required and must be a non-empty string';
  } else if (author.length > 255) {
    errors.author = 'Author must not exceed 255 characters';
  }

  // Description validation (optional but if provided, validate)
  if (description && typeof description !== 'string') {
    errors.description = 'Description must be a string';
  }

  // Cover image URL validation (optional)
  if (cover_image_url && typeof cover_image_url !== 'string') {
    errors.cover_image_url = 'Cover image URL must be a string';
  }

  // Date validation (optional)
  if (date_completed) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_completed)) {
      errors.date_completed = 'Date must be in YYYY-MM-DD format';
    }
  }

  // Rating validation (optional)
  if (rating !== undefined && rating !== null) {
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      errors.rating = 'Rating must be a number between 0 and 5';
    }
  }

  // Genre validation (optional)
  if (genre && typeof genre !== 'string') {
    errors.genre = 'Genre must be a string';
  }

  // Reading status validation
  if (reading_status) {
    const validStatuses = ['Reading', 'Completed', 'Wishlist'];
    if (!validStatuses.includes(reading_status)) {
      errors.reading_status = 'Reading status must be one of: Reading, Completed, Wishlist';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validate search query
 */
const validateSearchQuery = (req, res, next) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required',
      error: 'Query parameter "q" must be a non-empty string'
    });
  }

  if (q.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Search query is too long',
      error: 'Query parameter "q" must not exceed 500 characters'
    });
  }

  next();
};

/**
 * Validate Google Books search request
 */
const validateGoogleBooksSearch = (req, res, next) => {
  const { query, maxResults = 10 } = req.query;

  const errors = {};

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    errors.query = 'Query parameter is required';
  } else if (query.length > 300) {
    errors.query = 'Query must not exceed 300 characters';
  }

  const maxResultsNum = parseInt(maxResults);
  if (isNaN(maxResultsNum) || maxResultsNum < 1 || maxResultsNum > 40) {
    errors.maxResults = 'maxResults must be a number between 1 and 40';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validate ID parameter
 */
const validateIdParam = (req, res, next) => {
  const { id } = req.params;

  const idNum = parseInt(id);
  if (isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID',
      error: 'ID must be a positive integer'
    });
  }

  next();
};

module.exports = {
  validateBook,
  validateSearchQuery,
  validateGoogleBooksSearch,
  validateIdParam
};