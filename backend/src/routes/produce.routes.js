const { Router } = require('express');
const { registerProduce, listProduce, getProduce, updateProduce, deleteProduce, listMyProduce } = require('../controllers/produce.controller');
const { createProduceRules } = require('../validators/produce.validator');
const { protect, authorize } = require('../middleware/auth');

const router = Router();

router.post('/', protect, authorize('Administrator', 'Market Officer', 'Farmer'), createProduceRules, registerProduce);
router.get('/', protect, listProduce);
router.get('/my', protect, authorize('Farmer'), listMyProduce);
router.get('/:id', protect, getProduce);
router.put('/:id', protect, authorize('Administrator', 'Market Officer'), updateProduce);
router.delete('/:id', protect, authorize('Administrator'), deleteProduce);

module.exports = router;
