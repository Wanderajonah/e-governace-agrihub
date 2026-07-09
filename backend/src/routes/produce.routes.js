import { Router } from 'express';
import {
  registerProduce,
  listProduce,
  getProduce,
  updateProduce,
  deleteProduce,
  listMyProduce,
} from '../controllers/produce.controller.js';
import { createProduceRules } from '../validators/produce.validator.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('Administrator', 'Market Officer', 'Farmer'), createProduceRules, registerProduce);
router.get('/', protect, listProduce);
router.get('/my', protect, authorize('Farmer'), listMyProduce);
router.get('/:id', protect, getProduce);
router.put('/:id', protect, authorize('Administrator', 'Market Officer'), updateProduce);
router.delete('/:id', protect, authorize('Administrator'), deleteProduce);

export default router;
