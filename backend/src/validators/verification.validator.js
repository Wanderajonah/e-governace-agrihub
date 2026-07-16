const { body } = require('express-validator');

const createVerificationRules = [
  body('produce')
    .notEmpty()
    .withMessage('Produce is required')
    .isMongoId()
    .withMessage('Produce must be a valid ObjectId'),
  body('grade')
    .notEmpty()
    .withMessage('Grade is required')
    .isIn(['A', 'B', 'C'])
    .withMessage('Grade must be A, B, or C'),
  body('qualityStatus')
    .notEmpty()
    .withMessage('Quality status is required')
    .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Rejected'])
    .withMessage('Quality status must be Excellent, Good, Fair, Poor, or Rejected'),
  body('inspectorComments')
    .notEmpty()
    .withMessage('Inspector comments are required'),
];

const updateVerificationRules = [
  body('produce')
    .optional()
    .isMongoId()
    .withMessage('Produce must be a valid ObjectId'),
  body('grade')
    .optional()
    .isIn(['A', 'B', 'C'])
    .withMessage('Grade must be A, B, or C'),
  body('qualityStatus')
    .optional()
    .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Rejected'])
    .withMessage('Quality status must be Excellent, Good, Fair, Poor, or Rejected'),
  body('inspectorComments')
    .optional(),
];

module.exports = { createVerificationRules, updateVerificationRules };
