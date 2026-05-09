const { query, param, validationResult } = require('express-validator');

const userSearchValidator = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search query is required')
    .isLength({ min: 2, max: 50 }).withMessage('Search query must be between 2 and 50 characters')
    .escape(),
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
  userSearchValidator,
  validate,
};
