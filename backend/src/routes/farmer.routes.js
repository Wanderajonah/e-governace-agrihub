import { Router } from 'express';
import {
  createFarmer,
  listFarmers,
  getFarmer,
  updateFarmer,
  deleteFarmer,
} from '../controllers/farmer.controller.js';
import { createFarmerRules } from '../validators/farmer.validator.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('Administrator', 'Market Officer'), createFarmerRules, createFarmer);
router.get('/', protect, listFarmers);
router.get('/:id', protect, getFarmer);
router.put('/:id', protect, authorize('Administrator', 'Market Officer'), updateFarmer);
router.delete('/:id', protect, authorize('Administrator'), deleteFarmer);

export default router;
