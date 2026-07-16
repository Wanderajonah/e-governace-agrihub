const { body } = require('express-validator');

const createPriceRules = [
  body('commodity')
    .notEmpty()
    .withMessage('Commodity is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  body('grade')
    .optional()
    .isIn(['A', 'B', 'C'])
    .withMessage('Grade must be A, B, or C'),
];

const updatePriceRules = [
  body('commodity')
    .optional(),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number'),
  body('grade')
    .optional()
    .isIn(['A', 'B', 'C'])
    .withMessage('Grade must be A, B, or C'),
];

module.exports = { createPriceRules, updatePriceRules };
