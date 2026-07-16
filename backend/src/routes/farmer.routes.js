const { Router } = require('express');
const { createFarmer, listFarmers, getFarmer, updateFarmer, deleteFarmer } = require('../controllers/farmer.controller');
const { createFarmerRules } = require('../validators/farmer.validator');
const { protect, authorize } = require('../middleware/auth');

const router = Router();

router.post('/', protect, authorize('Administrator', 'Market Officer'), createFarmerRules, createFarmer);
router.get('/', protect, listFarmers);
router.get('/:id', protect, getFarmer);
router.put('/:id', protect, authorize('Administrator', 'Market Officer'), updateFarmer);
router.delete('/:id', protect, authorize('Administrator'), deleteFarmer);

module.exports = router;
