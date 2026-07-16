const { Router } = require('express');
const { getStats } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');

const router = Router();

router.get('/stats', protect, getStats);

module.exports = router;
