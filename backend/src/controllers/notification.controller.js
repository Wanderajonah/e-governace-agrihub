const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const { successResponse } = require('../utils/apiResponse');

const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.body);
  return successResponse(res, notification, 'Notification created successfully', 201);
});

const getNotifications = asyncHandler(async (req, res) => {
  const filter = {
    $or: [
      { user: req.user._id },
      { user: null },
      { user: { $exists: false } },
    ],
  };

  if (req.user.role) {
    filter.$or.push({ recipientRole: req.user.role });
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50);

  return successResponse(res, notifications);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }

  return successResponse(res, notification, 'Notification marked as read');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    {
      $or: [
        { user: req.user._id },
        { user: null },
        { user: { $exists: false } },
      ],
      read: false,
    },
    { read: true }
  );

  return successResponse(res, { modifiedCount: result.modifiedCount }, 'All notifications marked as read');
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const filter = {
    read: false,
    $or: [
      { user: req.user._id },
      { user: null },
      { user: { $exists: false } },
    ],
  };

  if (req.user.role) {
    filter.$or.push({ recipientRole: req.user.role });
  }

  const count = await Notification.countDocuments(filter);

  return successResponse(res, { count });
});

module.exports = { createNotification, getNotifications, markAsRead, markAllAsRead, getUnreadCount };
