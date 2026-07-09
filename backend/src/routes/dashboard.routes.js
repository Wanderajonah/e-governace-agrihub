import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/stats', protect, getStats);

export default router;
