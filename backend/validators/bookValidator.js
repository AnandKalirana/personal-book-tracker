const { body, param, query, validationResult } = require('express-validator');

const createBookValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title is too long'),
  body('author')
    .trim()
    .notEmpty().withMessage('Author is required')
    .isLength({ max: 255 }).withMessage('Author name is too long'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  body('genre').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('rating').optional({ checkFalsy: true }).isInt({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('reading_status').optional().isIn(['Reading', 'Completed', 'Wishlist']).withMessage('Invalid reading status'),
  body('page_count').optional({ checkFalsy: true }).isInt({ min: 0 }),
];

const updateBookValidator = [
  param('id').isInt().withMessage('Invalid book ID'),
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('author').optional().trim().notEmpty().isLength({ max: 255 }),
  body('rating').optional({ checkFalsy: true }).isInt({ min: 0, max: 5 }),
  body('reading_status').optional().isIn(['Reading', 'Completed', 'Wishlist']),
];

const searchValidator = [
  query('query').optional().trim().isLength({ min: 1 }).withMessage('Search query cannot be empty'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: errors.array().map(err => ({ [err.path]: err.msg })),
  });
};

module.exports = {
  createBookValidator,
  updateBookValidator,
  searchValidator,
  validate,
};
