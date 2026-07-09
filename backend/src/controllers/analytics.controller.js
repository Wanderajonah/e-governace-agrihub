import { successResponse, errorResponse } from '../utils/apiResponse.js';
import analyticsService from '../services/analytics.service.js';

export const getCommodityTrends = async (req, res, next) => {
  try {
    const data = await analyticsService.getCommodityTrends(req.query.period);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getMonthlyTransactions = async (req, res, next) => {
  try {
    const data = await analyticsService.getMonthlyTransactions(req.query.year);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    const data = await analyticsService.getRevenue(req.query.period);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getMarketTurnover = async (req, res, next) => {
  try {
    const data = await analyticsService.getMarketTurnover(req.query.from, req.query.to);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getProduceVolume = async (req, res, next) => {
  try {
    const data = await analyticsService.getProduceVolume();
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getPriceFluctuations = async (req, res, next) => {
  try {
    const data = await analyticsService.getPriceFluctuations(req.query.days);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getTopCommodities = async (req, res, next) => {
  try {
    const data = await analyticsService.getTopCommodities(req.query.limit);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getTopDistricts = async (req, res, next) => {
  try {
    const data = await analyticsService.getTopDistricts(req.query.limit);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getRecentRegistrations = async (req, res, next) => {
  try {
    const data = await analyticsService.getRecentRegistrations(req.query.days);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
