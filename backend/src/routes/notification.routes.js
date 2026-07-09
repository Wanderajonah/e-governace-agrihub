import { Router } from 'express';
import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../controllers/notification.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, authorize('Administrator'), createNotification);
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

export default router;
