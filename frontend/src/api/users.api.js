import apiClient from './client';

export const listUsers = (params) => apiClient.get('/users', { params });
export const getUser = (id) => apiClient.get(`/users/${id}`);
export const createUser = (data) => apiClient.post('/users', data);
export const updateUser = (id, data) => apiClient.put(`/users/${id}`, data);
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);
