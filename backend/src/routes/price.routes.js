import { Router } from 'express';
import {
  createPrice,
  listPrices,
  getPriceTrends,
  getPrice,
  updatePrice,
  deletePrice,
} from '../controllers/price.controller.js';
import { createPriceRules } from '../validators/price.validator.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('Administrator', 'Market Officer'), createPriceRules, createPrice);
router.get('/', listPrices);
router.get('/trends', getPriceTrends);
router.get('/:id', getPrice);
router.put('/:id', protect, authorize('Administrator', 'Market Officer'), updatePrice);
router.delete('/:id', protect, authorize('Administrator'), deletePrice);

export default router;
