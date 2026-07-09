import apiClient from './client';

export const getCommodityTrends = (params) => apiClient.get('/analytics/commodity-trends', { params });
export const getMonthlyTransactions = (params) => apiClient.get('/analytics/monthly-transactions', { params });
export const getRevenue = (params) => apiClient.get('/analytics/revenue', { params });
export const getMarketTurnover = (params) => apiClient.get('/analytics/market-turnover', { params });
export const getProduceVolume = () => apiClient.get('/analytics/produce-volume');
export const getPriceFluctuations = (params) => apiClient.get('/analytics/price-fluctuations', { params });
export const getTopCommodities = (params) => apiClient.get('/analytics/top-commodities', { params });
export const getTopDistricts = (params) => apiClient.get('/analytics/top-districts', { params });
export const getRecentRegistrations = (params) => apiClient.get('/analytics/recent-registrations', { params });
