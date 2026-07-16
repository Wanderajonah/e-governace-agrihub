const { Router } = require('express');
const { register, login, getMe, changePassword } = require('../controllers/auth.controller');
const { registerRules, loginRules, changePasswordRules } = require('../validators/auth.validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

module.exports = router;
