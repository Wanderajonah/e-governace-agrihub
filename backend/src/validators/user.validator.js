import { body } from 'express-validator';

export const createUserRules = [
  body('name')
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['Administrator', 'Market Officer', 'Produce Inspector', 'Government Officer'])
    .withMessage('Role must be Administrator, Market Officer, Produce Inspector, or Government Officer'),
];

export const updateUserRules = [
  body('name')
    .optional(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['Administrator', 'Market Officer', 'Produce Inspector', 'Government Officer'])
    .withMessage('Role must be Administrator, Market Officer, Produce Inspector, or Government Officer'),
];
