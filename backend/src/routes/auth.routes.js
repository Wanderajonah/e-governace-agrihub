import { Router } from 'express';
import { register, login, getMe, changePassword } from '../controllers/auth.controller.js';
import { registerRules, loginRules, changePasswordRules } from '../validators/auth.validator.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePasswordRules, changePassword);

export default router;
