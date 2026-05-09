const { body, param, validationResult } = require('express-validator');

const tagValidator = [
  body('tags')
    .isArray().withMessage('Tags must be an array'),
  body('tags.*')
    .trim()
    .notEmpty().withMessage('Tag name cannot be empty')
    .isLength({ max: 50 }).withMessage('Tag name is too long')
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
  tagValidator,
  validate,
};
