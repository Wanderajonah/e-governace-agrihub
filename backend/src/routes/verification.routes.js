const { Router } = require('express');
const { createVerification, listVerifications, approveVerification, rejectVerification, getVerification } = require('../controllers/verification.controller');
const { createVerificationRules } = require('../validators/verification.validator');
const { protect, authorize } = require('../middleware/auth');

const router = Router();

router.post('/', protect, authorize('Produce Inspector', 'Administrator'), createVerificationRules, createVerification);
router.get('/', protect, listVerifications);
router.put('/:id/approve', protect, authorize('Produce Inspector', 'Administrator'), approveVerification);
router.put('/:id/reject', protect, authorize('Produce Inspector', 'Administrator'), rejectVerification);
router.get('/:id', protect, getVerification);

module.exports = router;
