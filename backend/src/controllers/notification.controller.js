import { successResponse, errorResponse } from '../utils/apiResponse.js';
import notificationService from '../services/notification.service.js';

export const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    return successResponse(res, notification, 'Notification created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(req.user._id, req.user.role);
    return successResponse(res, notifications);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    return successResponse(res, notification, 'Notification marked as read');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    return successResponse(res, result, 'All notifications marked as read');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id, req.user.role);
    return successResponse(res, count);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
