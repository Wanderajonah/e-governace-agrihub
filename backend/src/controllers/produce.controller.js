import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import produceService from '../services/produce.service.js';

export const registerProduce = async (req, res, next) => {
  try {
    const data = req.user.role === 'Farmer'
      ? { ...req.body, farmer: req.user._id, farmerName: req.user.name }
      : req.body;
    const produce = await produceService.registerProduce(data);
    return successResponse(res, produce, 'Produce registered successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const listMyProduce = async (req, res, next) => {
  try {
    const { data, total, page, limit } = await produceService.listProduce({ ...req.query, farmerId: req.user._id });
    return paginatedResponse(res, data, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getProduce = async (req, res, next) => {
  try {
    const produce = await produceService.getProduce(req.params.id);
    return successResponse(res, produce);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateProduce = async (req, res, next) => {
  try {
    const produce = await produceService.updateProduce(req.params.id, req.body);
    return successResponse(res, produce, 'Produce updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteProduce = async (req, res, next) => {
  try {
    const result = await produceService.deleteProduce(req.params.id);
    return successResponse(res, result, 'Produce deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const listProduce = async (req, res, next) => {
  try {
    const { data, total, page, limit } = await produceService.listProduce(req.query);
    return paginatedResponse(res, data, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
