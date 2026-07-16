const { Router } = require('express');
const { createPrice, listPrices, getPriceTrends, getPrice, updatePrice, deletePrice } = require('../controllers/price.controller');
const { createPriceRules } = require('../validators/price.validator');
const { protect, authorize } = require('../middleware/auth');

const router = Router();

router.post('/', protect, authorize('Administrator', 'Market Officer'), createPriceRules, createPrice);
router.get('/', listPrices);
router.get('/trends', getPriceTrends);
router.get('/:id', getPrice);
router.put('/:id', protect, authorize('Administrator', 'Market Officer'), updatePrice);
router.delete('/:id', protect, authorize('Administrator'), deletePrice);

module.exports = router;
