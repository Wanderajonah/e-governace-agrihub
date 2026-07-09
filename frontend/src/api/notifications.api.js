import apiClient from './client';

export const getNotifications = () => apiClient.get('/notifications');
export const getUnreadCount = () => apiClient.get('/notifications/unread-count');
export const markAsRead = (id) => apiClient.put(`/notifications/${id}/read`);
export const markAllAsRead = () => apiClient.put('/notifications/read-all');
export const createNotification = (data) => apiClient.post('/notifications', data);
