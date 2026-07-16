const { Router } = require('express');
const { createUser, listUsers, getUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { createUserRules } = require('../validators/user.validator');
const { protect, authorize } = require('../middleware/auth');

const router = Router();

router.post('/', protect, authorize('Administrator'), createUserRules, createUser);
router.get('/', protect, authorize('Administrator'), listUsers);
router.get('/:id', protect, authorize('Administrator'), getUser);
router.put('/:id', protect, authorize('Administrator'), updateUser);
router.delete('/:id', protect, authorize('Administrator'), deleteUser);

module.exports = router;
