import apiClient from './client';

export const listTransactions = (params) => apiClient.get('/transactions', { params });
export const getTransaction = (id) => apiClient.get(`/transactions/${id}`);
export const createTransaction = (data) => apiClient.post('/transactions', data);
