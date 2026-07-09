import apiClient from './client';

export const listVerifications = (params) => apiClient.get('/verifications', { params });
export const getVerification = (id) => apiClient.get(`/verifications/${id}`);
export const createVerification = (data) => apiClient.post('/verifications', data);
export const approveVerification = (id, data) => apiClient.put(`/verifications/${id}/approve`, data);
export const rejectVerification = (id, data) => apiClient.put(`/verifications/${id}/reject`, data);
