import Notification from '../models/Notification.js';

export const createNotification = async (data) => {
  const notification = await Notification.create(data);
  return notification;
};

export const getNotifications = async (userId, role) => {
  const filter = {
    $or: [
      { user: userId },
      { user: null },
      { user: { $exists: false } },
    ],
  };

  if (role) {
    filter.$or.push({ recipientRole: role });
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50);

  return notifications;
};

export const markAsRead = async (id) => {
  const notification = await Notification.findByIdAndUpdate(
    id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    {
      $or: [
        { user: userId },
        { user: null },
        { user: { $exists: false } },
      ],
      read: false,
    },
    { read: true }
  );

  return { modifiedCount: result.modifiedCount };
};

export const getUnreadCount = async (userId, role) => {
  const filter = {
    read: false,
    $or: [
      { user: userId },
      { user: null },
      { user: { $exists: false } },
    ],
  };

  if (role) {
    filter.$or.push({ recipientRole: role });
  }

  const count = await Notification.countDocuments(filter);

  return { count };
};
export default { createNotification, getNotifications, markAsRead, markAllAsRead, getUnreadCount };
