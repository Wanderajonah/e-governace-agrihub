import { Router } from 'express';
import { generateReport, listReports, getReport } from '../controllers/report.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/generate', protect, authorize('Administrator', 'Government Officer'), generateReport);
router.get('/', protect, listReports);
router.get('/:id', protect, getReport);

export default router;
