const { body } = require('express-validator');

const createFarmerRules = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string'),
  body('phone')
    .notEmpty()
    .withMessage('Phone is required'),
  body('district')
    .notEmpty()
    .withMessage('District is required'),
  body('produce')
    .notEmpty()
    .withMessage('Produce is required'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Pending'])
    .withMessage('Status must be Active, Inactive, or Pending'),
];

const updateFarmerRules = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string'),
  body('phone')
    .optional(),
  body('district')
    .optional(),
  body('produce')
    .optional(),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Pending'])
    .withMessage('Status must be Active, Inactive, or Pending'),
];

module.exports = { createFarmerRules, updateFarmerRules };
