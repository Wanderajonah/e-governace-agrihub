import { Router } from 'express';
import {
  createVerification,
  listVerifications,
  approveVerification,
  rejectVerification,
  getVerification,
} from '../controllers/verification.controller.js';
import { createVerificationRules } from '../validators/verification.validator.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('Produce Inspector', 'Administrator'), createVerificationRules, createVerification);
router.get('/', protect, listVerifications);
router.put('/:id/approve', protect, authorize('Produce Inspector', 'Administrator'), approveVerification);
router.put('/:id/reject', protect, authorize('Produce Inspector', 'Administrator'), rejectVerification);
router.get('/:id', protect, getVerification);

export default router;
