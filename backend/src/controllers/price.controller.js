import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import priceService from '../services/price.service.js';

export const createPrice = async (req, res, next) => {
  try {
    const price = await priceService.createPrice(req.body);
    return successResponse(res, price, 'Price created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getPrice = async (req, res, next) => {
  try {
    const price = await priceService.getPrice(req.params.id);
    return successResponse(res, price);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updatePrice = async (req, res, next) => {
  try {
    const price = await priceService.updatePrice(req.params.id, req.body);
    return successResponse(res, price, 'Price updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deletePrice = async (req, res, next) => {
  try {
    const result = await priceService.deletePrice(req.params.id);
    return successResponse(res, result, 'Price deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const listPrices = async (req, res, next) => {
  try {
    const { data, total, page, limit } = await priceService.listPrices(req.query);
    return paginatedResponse(res, data, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getPriceTrends = async (req, res, next) => {
  try {
    const trends = await priceService.getPriceTrends(req.query.commodity, req.query.days);
    return successResponse(res, trends, 'Price trends retrieved successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
