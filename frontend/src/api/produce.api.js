import apiClient from './client';

export const listProduce = (params) => apiClient.get('/produce', { params });
export const getProduce = (id) => apiClient.get(`/produce/${id}`);
export const registerProduce = (data) => apiClient.post('/produce', data);
export const updateProduce = (id, data) => apiClient.put(`/produce/${id}`, data);
export const deleteProduce = (id) => apiClient.delete(`/produce/${id}`);
