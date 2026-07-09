import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import verificationService from '../services/verification.service.js';

export const createVerification = async (req, res, next) => {
  try {
    const verification = await verificationService.createVerification(req.body);
    return successResponse(res, verification, 'Verification created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const approveVerification = async (req, res, next) => {
  try {
    const verification = await verificationService.approveVerification(req.params.id, { ...req.body, inspectedBy: req.user._id });
    return successResponse(res, verification, 'Verification approved successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const rejectVerification = async (req, res, next) => {
  try {
    const verification = await verificationService.rejectVerification(req.params.id, { ...req.body, inspectedBy: req.user._id });
    return successResponse(res, verification, 'Verification rejected successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const getVerification = async (req, res, next) => {
  try {
    const verification = await verificationService.getVerification(req.params.id);
    return successResponse(res, verification);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

export const listVerifications = async (req, res, next) => {
  try {
    const { data, total, page, limit } = await verificationService.listVerifications(req.query);
    return paginatedResponse(res, data, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
