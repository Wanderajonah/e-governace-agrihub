import { body } from 'express-validator';

export const createTransactionRules = [
  body('buyer')
    .notEmpty()
    .withMessage('Buyer is required'),
  body('seller')
    .notEmpty()
    .withMessage('Seller is required'),
  body('commodity')
    .notEmpty()
    .withMessage('Commodity is required'),
  body('qtyNum')
    .notEmpty()
    .withMessage('Quantity is required')
    .isNumeric()
    .withMessage('Quantity must be a number'),
  body('unitPrice')
    .notEmpty()
    .withMessage('Unit price is required')
    .isNumeric()
    .withMessage('Unit price must be a number'),
  body('payment')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'])
    .withMessage('Payment must be Cash, Mobile Money, Bank Transfer, or Cheque'),
];

export const updateTransactionRules = [
  body('buyer')
    .optional(),
  body('seller')
    .optional(),
  body('commodity')
    .optional(),
  body('qtyNum')
    .optional()
    .isNumeric()
    .withMessage('Quantity must be a number'),
  body('unitPrice')
    .optional()
    .isNumeric()
    .withMessage('Unit price must be a number'),
  body('payment')
    .optional()
    .isIn(['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'])
    .withMessage('Payment must be Cash, Mobile Money, Bank Transfer, or Cheque'),
];
