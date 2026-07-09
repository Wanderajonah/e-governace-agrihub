import { Router } from 'express';
import { login, getMe, changePassword } from '../controllers/auth.controller.js';
import { loginRules, changePasswordRules } from '../validators/auth.validator.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/login', loginRules, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePasswordRules, changePassword);

export default router;
