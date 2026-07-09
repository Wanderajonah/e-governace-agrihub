import { successResponse, errorResponse } from '../utils/apiResponse.js';
import dashboardService from '../services/dashboard.service.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    return successResponse(res, stats);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
