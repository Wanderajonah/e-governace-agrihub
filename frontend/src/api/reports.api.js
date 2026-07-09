import apiClient from './client';

export const generateReport = (data) => apiClient.post('/reports/generate', data);
export const listReports = (params) => apiClient.get('/reports', { params });
export const getReport = (id) => apiClient.get(`/reports/${id}`);
