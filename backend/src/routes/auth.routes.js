import { Router } from 'express';
import { register, login, getMe, changePassword } from '../controllers/auth.controller.js';
import { registerRules, loginRules, changePasswordRules } from '../validators/auth.validator.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

export default router;
