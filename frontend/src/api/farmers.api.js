import apiClient from './client';

export const listFarmers = (params) => apiClient.get('/farmers', { params });
export const getFarmer = (id) => apiClient.get(`/farmers/${id}`);
export const createFarmer = (data) => apiClient.post('/farmers', data);
export const updateFarmer = (id, data) => apiClient.put(`/farmers/${id}`, data);
export const deleteFarmer = (id) => apiClient.delete(`/farmers/${id}`);
