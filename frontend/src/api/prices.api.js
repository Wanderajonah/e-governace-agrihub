import apiClient from './client';

export const listPrices = (params) => apiClient.get('/prices', { params });
export const getPrice = (id) => apiClient.get(`/prices/${id}`);
export const createPrice = (data) => apiClient.post('/prices', data);
export const updatePrice = (id, data) => apiClient.put(`/prices/${id}`, data);
export const deletePrice = (id) => apiClient.delete(`/prices/${id}`);
export const getPriceTrends = (params) => apiClient.get('/prices/trends', { params });
