import { Router } from 'express';
import {
  createTransaction,
  listTransactions,
  getTransaction,
} from '../controllers/transaction.controller.js';
import { createTransactionRules } from '../validators/transaction.validator.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('Administrator', 'Market Officer'), createTransactionRules, createTransaction);
router.get('/', protect, listTransactions);
router.get('/:id', protect, getTransaction);

export default router;
