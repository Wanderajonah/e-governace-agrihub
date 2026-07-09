import { body } from 'express-validator';

export const createProduceRules = [
  body('farmer')
    .notEmpty()
    .withMessage('Farmer is required')
    .isMongoId()
    .withMessage('Farmer must be a valid ObjectId'),
  body('commodity')
    .notEmpty()
    .withMessage('Commodity is required')
    .isString()
    .withMessage('Commodity must be a string'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isNumeric()
    .withMessage('Quantity must be a number'),
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(['kg', 'tonnes', 'bags', 'crates', 'boxes'])
    .withMessage('Unit must be kg, tonnes, bags, crates, or boxes'),
  body('sourceDistrict')
    .notEmpty()
    .withMessage('Source district is required'),
  body('arrivalDate')
    .notEmpty()
    .withMessage('Arrival date is required')
    .isDate()
    .withMessage('Arrival date must be a valid date'),
];

export const updateProduceRules = [
  body('farmer')
    .optional()
    .isMongoId()
    .withMessage('Farmer must be a valid ObjectId'),
  body('commodity')
    .optional()
    .isString()
    .withMessage('Commodity must be a string'),
  body('quantity')
    .optional()
    .isNumeric()
    .withMessage('Quantity must be a number'),
  body('unit')
    .optional()
    .isIn(['kg', 'tonnes', 'bags', 'crates', 'boxes'])
    .withMessage('Unit must be kg, tonnes, bags, crates, or boxes'),
  body('sourceDistrict')
    .optional(),
  body('arrivalDate')
    .optional()
    .isDate()
    .withMessage('Arrival date must be a valid date'),
];
