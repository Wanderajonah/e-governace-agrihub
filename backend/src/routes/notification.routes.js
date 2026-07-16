const { Router } = require('express');
const { createNotification, getNotifications, markAsRead, markAllAsRead, getUnreadCount } = require('../controllers/notification.controller');
const { protect, authorize } = require('../middleware/auth');

const router = Router();

router.post('/', protect, authorize('Administrator'), createNotification);
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
