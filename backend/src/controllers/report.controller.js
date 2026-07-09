import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import reportService from '../services/report.service.js';

export const generateReport = async (req, res, next) => {
  try {
    const report = await reportService.generateReport(req.body.type, req.body.period, req.user._id);
    return successResponse(res, report, 'Report generated successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const report = await reportService.getReport(req.params.id);
    return successResponse(res, report);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const listReports = async (req, res, next) => {
  try {
    const { data, total, page, limit } = await reportService.listReports(req.query);
    return paginatedResponse(res, data, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
