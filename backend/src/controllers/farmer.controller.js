import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import farmerService from '../services/farmer.service.js';

export const createFarmer = async (req, res, next) => {
  try {
    const farmer = await farmerService.createFarmer(req.body);
    return successResponse(res, farmer, 'Farmer created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getFarmer = async (req, res, next) => {
  try {
    const farmer = await farmerService.getFarmer(req.params.id);
    return successResponse(res, farmer);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const updateFarmer = async (req, res, next) => {
  try {
    const farmer = await farmerService.updateFarmer(req.params.id, req.body);
    return successResponse(res, farmer, 'Farmer updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const deleteFarmer = async (req, res, next) => {
  try {
    const result = await farmerService.deleteFarmer(req.params.id);
    return successResponse(res, result, 'Farmer deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const listFarmers = async (req, res, next) => {
  try {
    const { data, total, page, limit } = await farmerService.listFarmers(req.query);
    return paginatedResponse(res, data, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
