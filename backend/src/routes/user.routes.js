import { Router } from 'express';
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { createUserRules } from '../validators/user.validator.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('Administrator'), createUserRules, createUser);
router.get('/', protect, authorize('Administrator'), listUsers);
router.get('/:id', protect, authorize('Administrator'), getUser);
router.put('/:id', protect, authorize('Administrator'), updateUser);
router.delete('/:id', protect, authorize('Administrator'), deleteUser);

export default router;
