const { Router } = require('express');
const { generateReport, listReports, getReport } = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth');

const router = Router();

router.post('/generate', protect, authorize('Administrator', 'Government Officer'), generateReport);
router.get('/', protect, listReports);
router.get('/:id', protect, getReport);

module.exports = router;
