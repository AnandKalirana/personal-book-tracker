const { body, param, validationResult } = require('express-validator');

const createShelfValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Shelf name is required')
    .isLength({ max: 100 }).withMessage('Shelf name is too long')
    .escape(),
];

const updateShelfValidator = [
  param('id').isInt().withMessage('Invalid shelf ID'),
  body('name')
    .trim()
    .notEmpty().withMessage('Shelf name is required')
    .isLength({ max: 100 }).withMessage('Shelf name is too long')
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
  createShelfValidator,
  updateShelfValidator,
  validate,
};
