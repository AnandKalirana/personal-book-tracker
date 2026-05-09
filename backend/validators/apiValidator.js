const { query, param, validationResult } = require('express-validator');

const googleBooksSearchValidator = [
  query('query')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ max: 300 }).withMessage('Search query is too long'),
  query('maxResults')
    .optional()
    .isInt({ min: 1, max: 40 }).withMessage('maxResults must be between 1 and 40'),
];

const isbnValidator = [
  param('isbn')
    .trim()
    .notEmpty().withMessage('ISBN is required')
    .matches(/^[0-9xX-]+$/).withMessage('Invalid ISBN format'),
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
  googleBooksSearchValidator,
  isbnValidator,
  validate,
};
