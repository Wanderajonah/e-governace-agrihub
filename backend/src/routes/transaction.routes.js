const { Router } = require('express');
const { createTransaction, listTransactions, getTransaction } = require('../controllers/transaction.controller');
const { createTransactionRules } = require('../validators/transaction.validator');
const { protect, authorize } = require('../middleware/auth');

const router = Router();

router.post('/', protect, authorize('Administrator', 'Market Officer'), createTransactionRules, createTransaction);
router.get('/', protect, listTransactions);
router.get('/:id', protect, getTransaction);

module.exports = router;
